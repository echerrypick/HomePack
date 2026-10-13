import test from 'node:test';
import assert from 'node:assert/strict';
import { subscriptionPlan } from '../server/subscription-plan';
const pro = { lookup_key: 'ukhomepack_subscription_gbp_month_v1', unit_amount: 4900, currency: 'gbp', recurring: { interval: 'month', interval_count: 1 } };
test('portal downgrade overrides stale original agency metadata', () => {
  assert.equal(subscriptionPlan(pro, 'agency'), 'subscription');
});
test('portal upgrade overrides stale original pro metadata', () => {
  assert.equal(subscriptionPlan({ ...pro, lookup_key: 'ukhomepack_agency_gbp_month_v1', unit_amount: 7900 }, 'subscription'), 'agency');
});
test('legacy checkout prices resolve only with matching billing terms', () => {
  assert.equal(subscriptionPlan({ ...pro, lookup_key: null }, 'subscription'), 'subscription');
  for (const change of [{ currency: 'usd' }, { unit_amount: 1 }, { recurring: { interval: 'year', interval_count: 1 } }, { recurring: { interval: 'month', interval_count: 2 } }]) {
    assert.equal(subscriptionPlan({ ...pro, ...change }, 'subscription'), null);
  }
  assert.equal(subscriptionPlan({ ...pro, lookup_key: null }, 'free'), null);
});
