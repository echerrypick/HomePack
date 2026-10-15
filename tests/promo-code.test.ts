import test from 'node:test';
import assert from 'node:assert/strict';
import { discountedReportAmount, generatePromoCode, isDeletablePromoStatus, isRedeemablePromoStatus, isValidPromoCode, normalizePromoCode, normalizePromoProducts, promoAppliesTo, promoCodeId } from '../server/promo-code';

test('complimentary report codes normalize consistently and hash to one identifier', () => {
  assert.equal(normalizePromoCode(' ukhp-ab12-cd34 '), 'UKHP-AB12-CD34');
  assert.equal(promoCodeId('ukhp-ab12-cd34'), promoCodeId(' UKHP-AB12-CD34 '));
});

test('percentage codes calculate the payable report price in pence', () => {
  assert.equal(discountedReportAmount(999, 10), 899);
  assert.equal(discountedReportAmount(999, 20), 799);
  assert.equal(discountedReportAmount(999, 50), 500);
  assert.throws(() => discountedReportAmount(999, 0));
  assert.throws(() => discountedReportAmount(999, 100));
});

test('offer codes can target one or more products while free codes stay retail-only', () => {
  assert.deepEqual(normalizePromoProducts(['subscription', 'agency', 'invalid'], 'discount'), ['subscription', 'agency']);
  assert.deepEqual(normalizePromoProducts(['agency'], 'free'), ['report']);
  assert.equal(promoAppliesTo(['subscription'], 'subscription'), true);
  assert.equal(promoAppliesTo(['subscription'], 'agency'), false);
  assert.equal(promoAppliesTo(undefined, 'report'), true);
  assert.equal(promoAppliesTo(undefined, 'subscription'), false);
});

test('generated complimentary report codes are valid and unique', () => {
  const codes = Array.from({ length: 100 }, () => generatePromoCode());
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(codes.every(isValidPromoCode), true);
  assert.equal(isValidPromoCode('SHORT'), false);
  assert.equal(isValidPromoCode('INVALID CODE!'), false);
});

test('available and issued codes can be redeemed, but pending and claimed codes cannot', () => {
  assert.equal(isRedeemablePromoStatus('available'), true);
  assert.equal(isRedeemablePromoStatus('issued'), true);
  assert.equal(isRedeemablePromoStatus('reserved'), false);
  assert.equal(isRedeemablePromoStatus('claimed'), false);
});

test('only an offer code that has not been issued can be deleted', () => {
  assert.equal(isDeletablePromoStatus('available'), true);
  assert.equal(isDeletablePromoStatus('issued'), false);
  assert.equal(isDeletablePromoStatus('reserved'), false);
  assert.equal(isDeletablePromoStatus('claimed'), false);
});
