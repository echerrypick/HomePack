import { test } from 'node:test';
import assert from 'node:assert/strict';
import { propertyKey, ownsProperty, validAddress, hasPropertyAccess, PLANS } from '../src/lib/plans';

const address = { houseNumber: 'Flat 1, 10', street: 'High Street', town: 'London', postcode: 'SW1A 2AA' };
test('a purchase covers exactly one property, never a postcode or another flat', () => {
  const profile = { purchasedPropertyKeys: [propertyKey(address)] };
  assert.equal(ownsProperty(profile, address), true);
  assert.equal(ownsProperty(profile, { ...address, houseNumber: 'Flat 2, 10' }), false);
  assert.equal(ownsProperty(profile, { ...address, houseNumber: '12' }), false);
  assert.equal(ownsProperty(null, address), false);
});
test('case and whitespace do not create a second charge for the same entered address', () => {
  assert.equal(propertyKey(address), propertyKey({ houseNumber: ' flat 1, 10 ', street: 'high  street', town: 'LONDON', postcode: 'sw1a2aa' }));
});
test('only complete addresses can be purchased', () => {
  assert.equal(validAddress(address), true);
  assert.equal(validAddress({ ...address, houseNumber: '' }), false);
  assert.equal(validAddress({ ...address, postcode: 'not a postcode' }), false);
  assert.equal(validAddress({ postcode: 'SW1A 2AA' }), false);
});
test('checkout prices match the agreed amounts in pence', () => {
  assert.deepEqual([PLANS.report.amount, PLANS.subscription.amount, PLANS.agency.amount], [999, 4900, 7900]);
});
test('PAYG never uses free search counters or legacy unverified purchase strings', () => {
  assert.equal(hasPropertyAccess({ role: 'free', searchCount: 0, purchasedReports: ['SW1A 2AA'] }, address), false);
  assert.equal(hasPropertyAccess({ role: 'free', searchCount: 100, purchasedPropertyKeys: [propertyKey(address)] }, address), true);
});
test('simulated purchases work locally but never become production entitlements', () => {
  const profile = { role: 'free', developmentPurchasedPropertyKeys: [propertyKey(address)] };
  assert.equal(hasPropertyAccess(profile, address), false);
  assert.equal(hasPropertyAccess(profile, address, Date.now(), true), true);
});
test('active paid business plans are unlimited; expired, unpaid and cancelled plans are denied', () => {
  const now = 1000;
  for (const role of ['subscription', 'agency']) {
    assert.equal(hasPropertyAccess({ role, searchCount: 100, subscriptionStatus: 'active', subscriptionExpiresAt: 2000 }, address, now), true);
    assert.equal(hasPropertyAccess({ role, subscriptionStatus: 'active', subscriptionExpiresAt: 999 }, address, now), false);
    assert.equal(hasPropertyAccess({ role, subscriptionStatus: 'past_due', subscriptionExpiresAt: 2000 }, address, now), false);
    assert.equal(hasPropertyAccess({ role }, address, now), false);
  }
  assert.equal(hasPropertyAccess({ role: 'admin' }, address, now), true);
});
