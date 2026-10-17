import nodemailer from 'nodemailer';
import type Stripe from 'stripe';
import { PLANS, type PaidPlan } from '../src/lib/plans';

export type BillingNotification = {
  keySuffix: string;
  subject: string;
  lines: string[];
};

type Fulfilment = { paid: boolean; address?: Record<string, unknown>; plan?: string };

type SubscriptionChange = {
  eventType: 'customer.subscription.updated' | 'customer.subscription.deleted';
  id: string;
  uid: string;
  email?: string;
  previousPlan?: 'subscription' | 'agency';
  plan: 'subscription' | 'agency';
  previousCancellationScheduled: boolean;
  cancellationScheduled: boolean;
  expiresAt: number;
  status: string;
};

function money(amount: number | null | undefined, currency = 'gbp') {
  if (!Number.isFinite(amount)) return 'Amount unavailable';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase() }).format(Number(amount) / 100);
}

function planName(plan: string | undefined) {
  return plan && Object.hasOwn(PLANS, plan) ? PLANS[plan as PaidPlan].name : 'Unknown product';
}

function addressLabel(address: Record<string, unknown> | undefined) {
  if (!address) return '';
  return [address.houseNumber, address.street, address.town, address.postcode].map(value => String(value || '').trim()).filter(Boolean).join(', ');
}

function safe(value: string | null | undefined) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

export function checkoutPurchaseNotification(session: Stripe.Checkout.Session, fulfilment: Fulfilment): BillingNotification | null {
  if (!fulfilment.paid) return null;
  const plan = session.metadata?.plan || fulfilment.plan;
  const product = planName(plan);
  const email = session.customer_details?.email || session.customer_email || '';
  const address = addressLabel(fulfilment.address);
  return {
    keySuffix: `checkout_${session.id}`,
    subject: `New ${product} purchase — ${money(session.amount_total, session.currency || 'gbp')}`,
    lines: [
      `Product: ${product}`,
      `Amount paid: ${money(session.amount_total, session.currency || 'gbp')}`,
      email ? `Customer email: ${safe(email)}` : '',
      address ? `Property: ${safe(address)}` : '',
      `Stripe checkout: ${safe(session.id)}`,
      `Environment: ${session.livemode ? 'Live' : 'Test'}`,
    ].filter(Boolean),
  };
}

export function subscriptionChangeNotifications(change: SubscriptionChange): BillingNotification[] {
  const notifications: BillingNotification[] = [];
  const common = [
    change.email ? `Customer email: ${safe(change.email)}` : '',
    `Customer UID: ${safe(change.uid)}`,
    `Stripe subscription: ${safe(change.id)}`,
    `Current status: ${safe(change.status)}`,
  ].filter(Boolean);

  if (change.eventType === 'customer.subscription.deleted') {
    notifications.push({
      keySuffix: 'cancelled',
      subject: `${planName(change.plan)} membership cancelled`,
      lines: [`Plan: ${planName(change.plan)}`, ...common],
    });
    return notifications;
  }

  if (change.previousPlan && change.previousPlan !== change.plan) {
    const direction = PLANS[change.plan].amount > PLANS[change.previousPlan].amount ? 'upgraded' : 'downgraded';
    notifications.push({
      keySuffix: `plan_${direction}`,
      subject: `Membership ${direction}: ${planName(change.previousPlan)} to ${planName(change.plan)}`,
      lines: [
        `Previous plan: ${planName(change.previousPlan)}`,
        `New plan: ${planName(change.plan)}`,
        `New monthly price: ${money(PLANS[change.plan].amount)}`,
        ...common,
      ],
    });
  }

  if (!change.previousCancellationScheduled && change.cancellationScheduled) {
    notifications.push({
      keySuffix: 'cancellation_scheduled',
      subject: `${planName(change.plan)} cancellation scheduled`,
      lines: [
        `Plan: ${planName(change.plan)}`,
        `Access scheduled to end: ${new Date(change.expiresAt).toLocaleString('en-GB', { timeZone: 'Europe/London' })}`,
        ...common,
      ],
    });
  }

  return notifications;
}

function html(lines: string[]) {
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  return `<h1>UKHomePack billing notification</h1>${lines.map(line => `<p>${escape(line)}</p>`).join('')}`;
}

export async function sendBillingNotification(notification: BillingNotification) {
  const recipient = process.env.BILLING_NOTIFICATION_EMAIL?.trim() || process.env.CONTACT_TO_EMAIL?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (!recipient || !smtpUser || !smtpPass) throw new Error('BILLING_NOTIFICATION_EMAIL or CONTACT_TO_EMAIL, SMTP_USER and SMTP_PASS are required.');
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port: Number.isFinite(smtpPort) ? smtpPort : 465,
    secure: String(process.env.SMTP_SECURE ?? (smtpPort === 465)).toLowerCase() === 'true',
    auth: { user: smtpUser, pass: smtpPass },
  });
  await transporter.sendMail({
    from: process.env.CONTACT_FROM_EMAIL?.trim() || `UKHomePack billing <${smtpUser}>`,
    to: recipient,
    subject: `[UKHomePack billing] ${safe(notification.subject)}`,
    text: notification.lines.join('\n'),
    html: html(notification.lines),
  });
}
