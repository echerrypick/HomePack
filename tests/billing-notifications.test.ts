import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutPurchaseNotification, subscriptionChangeNotifications } from '../server/billing-notifications';

test('paid report checkout creates an owner notification with property and amount', () => {
  const notification = checkoutPurchaseNotification({
    id: 'cs_live_report', amount_total: 999, currency: 'gbp', livemode: true,
    metadata: { plan: 'report' }, customer_details: { email: 'buyer@example.test' },
  } as any, { paid: true, plan: 'report', address: { houseNumber: '41', street: 'Bingley Avenue', town: 'Tamworth', postcode: 'B78 3BU' } });
  assert.match(notification?.subject || '', /Retail property report.*£9\.99/);
  assert.ok(notification?.lines.some(line => line.includes('41, Bingley Avenue')));
  assert.ok(notification?.lines.some(line => line.includes('buyer@example.test')));
});

test('unpaid checkout does not create a purchase notification', () => {
  assert.equal(checkoutPurchaseNotification({ id: 'cs_unpaid' } as any, { paid: false }), null);
});

test('plan price changes are classified as upgrades and downgrades', () => {
  const base = { eventType: 'customer.subscription.updated' as const, id: 'sub_1', uid: 'user_1', previousCancellationScheduled: false, cancellationScheduled: false, expiresAt: Date.now(), status: 'active' };
  assert.match(subscriptionChangeNotifications({ ...base, previousPlan: 'subscription', plan: 'agency' })[0].subject, /upgraded/);
  assert.match(subscriptionChangeNotifications({ ...base, previousPlan: 'agency', plan: 'subscription' })[0].subject, /downgraded/);
});

test('scheduled and completed cancellations create distinct notifications', () => {
  const base = { id: 'sub_1', uid: 'user_1', previousPlan: 'subscription' as const, plan: 'subscription' as const, previousCancellationScheduled: false, cancellationScheduled: true, expiresAt: Date.now(), status: 'active' };
  assert.match(subscriptionChangeNotifications({ ...base, eventType: 'customer.subscription.updated' })[0].subject, /cancellation scheduled/);
  assert.match(subscriptionChangeNotifications({ ...base, eventType: 'customer.subscription.deleted', status: 'canceled' })[0].subject, /cancelled/);
});
