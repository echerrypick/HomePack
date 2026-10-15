import test from 'node:test';
import assert from 'node:assert/strict';
import { discountedReportAmount, generatePromoCode, isValidPromoCode, normalizePromoCode, promoCodeId } from '../server/promo-code';

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

test('generated complimentary report codes are valid and unique', () => {
  const codes = Array.from({ length: 100 }, () => generatePromoCode());
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(codes.every(isValidPromoCode), true);
  assert.equal(isValidPromoCode('SHORT'), false);
  assert.equal(isValidPromoCode('INVALID CODE!'), false);
});
