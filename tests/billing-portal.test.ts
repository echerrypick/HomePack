import test from 'node:test';
import assert from 'node:assert/strict';
import type Stripe from 'stripe';
import { membershipPrices, portalSession } from '../server/billing';

function fixture() {
  const calls: Record<string, any> = {};
  const client = {
    prices: { list: async ({ lookup_keys }: any) => ({ data: [{ id: lookup_keys[0], product: `product_${lookup_keys[0]}`, currency: 'gbp', unit_amount: lookup_keys[0].includes('agency') ? 7900 : 4900, recurring: { interval: 'month' } }] }) },
    billingPortal: {
      configurations: { create: async (params: any) => { calls.configuration = params; return { id: 'portal_config' }; } },
      sessions: { create: async (params: any) => { calls.session = params; return { url: 'https://billing.stripe.com/test' }; } },
    },
  } as unknown as Stripe;
  return { client, calls };
}
test('all billing customers can cancel at period end, access invoices and change payment method', async () => {
  const {client, calls} = fixture();
  await portalSession(client, 'customer_retail');
  assert.equal(calls.session.customer, 'customer_retail');
  assert.equal(calls.session.configuration, 'portal_config');
  assert.equal(calls.session.flow_data, undefined);
  assert.deepEqual(calls.configuration.features.subscription_cancel, { enabled: true, mode: 'at_period_end', proration_behavior: 'none' });
  assert.equal(calls.configuration.features.invoice_history.enabled, true);
  assert.equal(calls.configuration.features.payment_method_update.enabled, true);
});
test('plan changes require hosted confirmation and allow only the two server prices', async () => {
  const {client, calls} = fixture();
  await portalSession(client, 'customer_business', { id: 'sub_1', items: {data: [{id: 'item_1'}]} } as Stripe.Subscription, 'agency');
  const update = calls.configuration.features.subscription_update;
  assert.equal(update.proration_behavior, 'always_invoice');
  assert.deepEqual(update.schedule_at_period_end.conditions, [{type: 'decreasing_item_amount'}]);
  assert.equal(update.products.length, 2);
  assert.equal(calls.session.flow_data.type, 'subscription_update_confirm');
  assert.deepEqual(calls.session.flow_data.subscription_update_confirm, {subscription: 'sub_1', items: [{id: 'item_1', price: 'ukhomepack_agency_gbp_month_v1', quantity: 1}]});
});
test('catalog rejects a misconfigured Stripe price before checkout', async () => {
  const {client} = fixture();
  client.prices.list = (async () => ({data: [{ currency: 'usd', unit_amount: 1 }]})) as any;
  await assert.rejects(membershipPrices(client), /Invalid membership price/);
});
