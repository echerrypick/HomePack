import { subscriptionTiming } from './subscription-timing';
import express, { type Request, type Response, type NextFunction } from 'express';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { createHash, randomUUID } from 'node:crypto';
import config from '../firebase-applet-config.json';
import { PLANS, propertyKey, validAddress, hasPropertyAccess, hasBusinessAccess, hasDevelopmentBusinessAccess, type PaidPlan } from '../src/lib/plans';
import { getBillingMode } from './billing-mode';
import { subscriptionPlan } from './subscription-plan';
import { stripeTestMode, billingCollections, mergeBillingProfile } from './billing-environment';

export function database() {
  const app = getApps()[0] || initializeApp({
    projectId: config.projectId,
    credential: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) : applicationDefault(),
  });
  return getFirestore(app, config.firestoreDatabaseId || '(default)');
}
function billingUser(uid: string) { return database().collection(billingCollections().users).doc(uid); }
function billingOrder(id: string) { return database().collection(billingCollections().orders).doc(id); }
async function billingProfile(uid: string) {
  const base = (await database().doc(`users/${uid}`).get()).data();
  if (!stripeTestMode()) return base;
  return mergeBillingProfile(base, (await billingUser(uid).get()).data(), true);
}
function stripe() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.APP_URL) {
    throw new Error('Payments are not available yet. Please try again later.');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
// Stable catalog prices let the portal switch tiers and webhooks identify the actual tier.
export async function membershipPrices(client: Stripe) {
  const entries = await Promise.all((['subscription', 'agency'] as const).map(async plan => {
    const lookup = `ukhomepack_${plan}_gbp_month_v1`;
    const found = await client.prices.list({ lookup_keys: [lookup], active: true, limit: 1 });
    const price = found.data[0] || await client.prices.create({
      currency: 'gbp', unit_amount: PLANS[plan].amount, recurring: { interval: 'month' },
      lookup_key: lookup, metadata: { homepackPlan: plan },
      product_data: { name: PLANS[plan].name, metadata: { homepackPlan: plan } },
    }, { idempotencyKey: lookup });
    if (price.currency !== 'gbp' || price.unit_amount !== PLANS[plan].amount || price.recurring?.interval !== 'month') throw new Error('Invalid membership price.');
    return [plan, price] as const;
  }));
  return Object.fromEntries(entries) as Record<'subscription' | 'agency', Stripe.Price>;
}

export async function portalSession(client: Stripe, customer: string, subscription?: Stripe.Subscription, plan?: 'subscription' | 'agency') {
  const prices = await membershipPrices(client);
  const configuration = await client.billingPortal.configurations.create({
    business_profile: { headline: 'Manage your UKHomePack membership' },
    features: {
      invoice_history: { enabled: true }, payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: 'at_period_end', proration_behavior: 'none' },
      subscription_update: {
        enabled: true, default_allowed_updates: ['price'], proration_behavior: 'always_invoice',
        schedule_at_period_end: { conditions: [{ type: 'decreasing_item_amount' }] },
        products: Object.values(prices).map(price => ({ product: typeof price.product === 'string' ? price.product : price.product.id, prices: [price.id] })),
      },
    },
  }, { idempotencyKey: `homepack_portal_v1_${prices.subscription.id}_${prices.agency.id}` });
  return client.billingPortal.sessions.create({
    customer, configuration: configuration.id, return_url: `${process.env.APP_URL}/profile`,
    ...(subscription && plan ? { flow_data: {
      type: 'subscription_update_confirm' as const,
      subscription_update_confirm: { subscription: subscription.id, items: [{ id: subscription.items.data[0].id, price: prices[plan].id, quantity: 1 }] },
      after_completion: { type: 'redirect' as const, redirect: { return_url: `${process.env.APP_URL}/profile` } },
    } } : {}),
  });
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const billingMode = getBillingMode();
  if (!billingMode.enabled && !billingMode.developmentSimulation) {
    return res.status(503).json({ error: 'Billing is disabled, but local payment simulation is not available for this site URL.' });
  }
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
  try {
    database();
    res.locals.uid = (await getAuth().verifyIdToken(token)).uid;
    next();
  } catch {
    res.status(401).json({ error: 'Your session could not be verified. Please sign in again.' });
  }
}
export async function requireProperty(req: Request, res: Response, next: NextFunction) {
  if (!validAddress(req.body)) return res.status(400).json({ error: 'Enter a complete, valid property address.' });
  try {
    const profile = await billingProfile(res.locals.uid);
    const allowed = hasPropertyAccess(profile, req.body, Date.now(), getBillingMode().developmentSimulation);
    if (!allowed) return res.status(402).json({ error: 'Payment of £9.99 is required for this property.', paymentRequired: true });
    res.locals.profile = profile;
    res.locals.hasBusinessAccess = hasBusinessAccess(profile) || (
      getBillingMode().developmentSimulation && hasDevelopmentBusinessAccess(profile)
    );
    next();
  } catch {
    res.status(503).json({ error: 'Unable to verify property access. Please try again.' });
  }
}

export async function requireBusiness(_req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await billingProfile(res.locals.uid);
    if (hasBusinessAccess(profile) || (getBillingMode().developmentSimulation && hasDevelopmentBusinessAccess(profile))) return next();
    res.status(403).json({ error: 'An active business subscription is required.' });
  } catch { res.status(503).json({ error: 'Unable to verify your subscription.' }); }
}

async function syncSubscription(id: string) {
  const subscription = await stripe().subscriptions.retrieve(id);
  const { uid } = subscription.metadata;
  if (!uid) return;
  const price = subscription.items.data[0]?.price;
  const plan = price && subscriptionPlan(price, subscription.metadata.plan);
  if (!uid || !plan || subscription.items.data.length !== 1) throw new Error('Unrecognised subscription price.');
  const ref = billingUser(uid);
  await database().runTransaction(async tx => {
    const profile = (await tx.get(ref)).data();
    if (profile?.stripeSubscriptionId && profile.stripeSubscriptionId !== id && (profile.subscriptionCreatedAt || 0) >= subscription.created) return;
    const active = subscription.status === 'active';
    const timing = subscriptionTiming(subscription);
    tx.set(ref, {
      ...(profile?.role === 'admin' ? {} : { role: active ? plan : 'free' }),
      accountType: profile?.role === 'admin' || active ? 'business' : 'consumer', stripeSubscriptionId: id,
      subscriptionCreatedAt: subscription.created,
      stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      subscriptionStatus: subscription.status,
      subscriptionCancelAtPeriodEnd: timing.cancellationScheduled,
      subscriptionPlan: plan,
      subscriptionExpiresAt: timing.expiresAt,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  });
}

async function fulfil(sessionId: string, expectedUid?: string) {
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  const { uid, plan, orderId } = session.metadata || {};
  if (!uid || (expectedUid && uid !== expectedUid)) throw new Error('Checkout does not belong to this account.');
  if (session.status !== 'complete' || session.payment_status !== 'paid') return { paid: false };
  if (plan === 'report') {
    const orderRef = billingOrder(orderId);
    let address: any;
    await database().runTransaction(async tx => {
      const order = (await tx.get(orderRef)).data();
      if (!order || order.uid !== uid || order.sessionId !== session.id || session.amount_total !== PLANS.report.amount || session.currency !== 'gbp') throw new Error('Unable to verify this order.');
      address = order.address;
      if (order.paid) return;
      tx.set(billingUser(uid), {
        purchasedPropertyKeys: FieldValue.arrayUnion(propertyKey(address)),
        purchasedReports: FieldValue.arrayUnion(`${address.houseNumber} ${address.street}, ${address.town}, ${address.postcode}`),
        ...(session.customer ? { stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer.id } : {}),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      tx.update(orderRef, { paid: true });
    });
    return { paid: true, address };
  }
  if (!['subscription', 'agency'].includes(plan || '')) throw new Error('Invalid plan.');
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!subscriptionId) throw new Error('Subscription was not found.');
  await syncSubscription(subscriptionId);
  if (orderId) await billingOrder(orderId).set({ paid: true }, { merge: true });
  return { paid: true, plan };
}

// Must be registered before express.json(), which would alter the signed body.
export function registerPaymentWebhook(app: express.Express) {
  app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!getBillingMode().enabled) return res.status(503).json({ error: 'Billing is disabled.' });
    let event: Stripe.Event;
    try {
      event = stripe().webhooks.constructEvent(req.body, req.headers['stripe-signature'] as string, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch { return res.status(400).json({ error: 'Invalid payment signature.' }); }
    if (event.livemode !== !stripeTestMode()) return res.status(400).json({ error: 'Payment environment mismatch.' });
    try {
      if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) await fulfil((event.data.object as Stripe.Checkout.Session).id);
      if (['customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) await syncSubscription((event.data.object as Stripe.Subscription).id);
      res.json({ received: true });
    } catch { res.status(500).json({ error: 'Payment update could not be saved. Retry required.' }); }
  });
}

export function registerBillingRoutes(app: express.Express) {
  app.get('/api/billing/status', (_req, res) => {
    const mode = getBillingMode();
    res.json({
      enabled: mode.enabled,
      available: mode.paymentsAvailable,
      developmentSimulation: mode.developmentSimulation,
      testMode: stripeTestMode(),
    });
  });
  app.get('/api/billing/profile', authenticate, async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!stripeTestMode()) return res.json({ testMode: false, profile: null });
    try {
      const profile = await billingProfile(res.locals.uid);
      const fields = ['role', 'accountType', 'purchasedPropertyKeys', 'purchasedReports', 'stripeCustomerId', 'stripeSubscriptionId', 'subscriptionStatus', 'subscriptionExpiresAt', 'subscriptionCancelAtPeriodEnd', 'subscriptionPlan'];
      res.json({ testMode: true, profile: Object.fromEntries(fields.filter(field => profile?.[field] !== undefined).map(field => [field, profile[field]])) });
    } catch { res.status(503).json({ error: 'Unable to load test membership status.' }); }
  });
  app.post('/api/billing/access', authenticate, requireProperty, (_req, res) => res.json({ allowed: true }));
  app.post('/api/profile/report-settings', authenticate, async (req, res) => {
    try {
      const uid = res.locals.uid as string;
      const profile = await billingProfile(uid);
      const businessAllowed = hasBusinessAccess(profile) || (
        getBillingMode().developmentSimulation && hasDevelopmentBusinessAccess(profile)
      );
      if (!businessAllowed) return res.status(403).json({ error: 'An active business subscription is required for extended planning searches.' });
      const includeNearbyPlanning = req.body?.includeNearbyPlanning === true;
      await database().doc(`users/${uid}`).set({
        reportSettings: { includeNearbyPlanning },
        updatedAt: new Date().toISOString()
      }, { merge: true });
      res.json({ reportSettings: { includeNearbyPlanning } });
    } catch {
      res.status(503).json({ error: 'Unable to save report settings. Please try again.' });
    }
  });
  app.post('/api/billing/checkout', authenticate, async (req, res) => {
    try {
      const mode = getBillingMode();
      const plan = req.body.plan as PaidPlan;
      if (!Object.hasOwn(PLANS, plan) || (plan === 'report' && !validAddress(req.body.address))) return res.status(400).json({ error: 'Select a valid plan and property.' });
      const uid = res.locals.uid as string;
      const profile = await billingProfile(uid);

      if (mode.developmentSimulation) {
        const simulatedSessionId = `dev_${randomUUID()}`;
        if (plan === 'report') {
          const address = req.body.address;
          if (hasPropertyAccess(profile, address, Date.now(), true)) {
            return res.json({ alreadyPurchased: true, simulated: true, completed: true, address });
          }
          const orderId = createHash('sha256').update(`${uid}:${plan}:${propertyKey(address)}`).digest('hex');
          await database().runTransaction(async tx => {
            tx.set(database().doc(`users/${uid}`), {
              developmentPurchasedPropertyKeys: FieldValue.arrayUnion(propertyKey(address)),
              developmentPurchasedReports: FieldValue.arrayUnion(`${address.houseNumber} ${address.street}, ${address.town}, ${address.postcode}`),
              updatedAt: new Date().toISOString(),
            }, { merge: true });
            tx.set(database().doc(`checkoutOrders/${orderId}`), {
              uid, plan, address, sessionId: simulatedSessionId, paid: true,
              simulated: true, completedAt: new Date().toISOString(),
            }, { merge: true });
          });
          return res.json({ simulated: true, completed: true, paid: true, sessionId: simulatedSessionId, address });
        }

        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        await database().doc(`users/${uid}`).set({
          developmentSubscriptionPlan: plan,
          developmentSubscriptionExpiresAt: expiresAt,
          developmentSubscriptionId: simulatedSessionId,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        return res.json({ simulated: true, completed: true, paid: true, sessionId: simulatedSessionId, plan });
      }

      if (!mode.enabled) return res.status(503).json({ error: 'Payments are disabled.' });
      const client = stripe();
      if (plan !== 'report' && profile?.stripeSubscriptionId) {
        const existing = await client.subscriptions.retrieve(profile.stripeSubscriptionId);
        if (!['canceled', 'incomplete_expired'].includes(existing.status)) {
          const customer = typeof existing.customer === 'string' ? existing.customer : existing.customer.id;
          if (existing.metadata.uid !== uid || existing.items.data.length !== 1) return res.status(409).json({ error: 'Please contact support to manage this subscription.' });
          const session = await portalSession(client, customer, existing, plan);
          return res.json({ url: session.url });
        }
      }
      if (plan === 'report' && profile?.purchasedPropertyKeys?.includes(propertyKey(req.body.address))) return res.json({ alreadyPurchased: true });
      const orderId = createHash('sha256').update(`${uid}:${plan === 'report' ? 'report' : 'membership'}:${plan === 'report' ? propertyKey(req.body.address) : 'membership'}`).digest('hex');
      const ref = billingOrder(orderId);
      const previous = (await ref.get()).data();
      if (previous?.sessionId && !previous.paid) {
        const pending = await client.checkout.sessions.retrieve(previous.sessionId);
        if (pending.status === 'open') {
          if (pending.metadata?.plan === plan) return res.json({ url: pending.url });
          // An abandoned checkout for another membership must not charge the old price.
          await client.checkout.sessions.expire(pending.id);
        }
        if (pending.status === 'complete') return res.json({ url: `${process.env.APP_URL}/payment?session_id=${pending.id}` });
      }
      const attempt = await database().runTransaction(async tx => {
        const existing = (await tx.get(ref)).data();
        const attempt = existing?.attempt || randomUUID();
        tx.set(ref, { uid, plan, ...(plan === 'report' ? { address: req.body.address } : {}), paid: false, attempt }, { merge: true });
        return attempt;
      });
      const metadata = { uid, plan, orderId };
      const prices = plan === 'report' ? null : await membershipPrices(client);
      const session = await client.checkout.sessions.create({
        mode: plan === 'report' ? 'payment' : 'subscription',
        payment_method_types: ['card'],
        line_items: plan !== 'report' ? [{ quantity: 1, price: prices![plan].id }] : [{ quantity: 1, price_data: { currency: 'gbp', unit_amount: PLANS[plan].amount, product_data: { name: PLANS[plan].name },  } }],
        metadata, ...(plan === 'report' ? {} : { subscription_data: { metadata } }),
        ...(profile?.stripeCustomerId ? { customer: profile.stripeCustomerId } : { customer_email: profile?.email, ...(plan === 'report' ? { customer_creation: 'always' as const } : {}) }),
        success_url: `${process.env.APP_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/payment?plan=${plan}&cancelled=1`,
      }, { idempotencyKey: `${orderId}:${previous?.sessionId ? previous.sessionId : attempt}` });
      await ref.update({ sessionId: session.id });
      res.json({ url: session.url });
    } catch (error: any) { res.status(503).json({ error: 'Checkout is currently unavailable. Please try again later.' }); }
  });
  app.post('/api/billing/verify', authenticate, async (req, res) => {
    if (!getBillingMode().enabled) return res.status(503).json({ error: 'There is no Stripe payment to verify in local simulation mode.' });
    try { res.json(await fulfil(String(req.body.sessionId), res.locals.uid)); }
    catch { res.status(400).json({ error: 'Payment could not be verified. Please retry or contact support.' }); }
  });
  app.post('/api/billing/portal', authenticate, async (_req, res) => {
    if (!getBillingMode().enabled) return res.status(503).json({ error: 'Payments are disabled for local development.' });
    try {
      const profile = await billingProfile(res.locals.uid);
      if (!profile?.stripeCustomerId) return res.status(400).json({ error: 'No billing account is available yet.' });
      const session = await portalSession(stripe(), profile.stripeCustomerId);
      res.json({ url: session.url });
    } catch { res.status(503).json({ error: 'Billing management is currently unavailable.' }); }
  });
}
