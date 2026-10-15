import { createHash, randomBytes } from 'node:crypto';

const PROMO_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function normalizePromoCode(value: unknown): string {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function isValidPromoCode(value: string): boolean {
  return /^[A-Z0-9][A-Z0-9-]{6,30}[A-Z0-9]$/.test(value);
}

export function promoCodeId(code: string): string {
  return createHash('sha256').update(normalizePromoCode(code)).digest('hex');
}

export function generatePromoCode(): string {
  const bytes = randomBytes(10);
  const characters = Array.from(bytes, byte => PROMO_ALPHABET[byte % PROMO_ALPHABET.length]);
  return `UKHP-${characters.slice(0, 4).join('')}-${characters.slice(4, 8).join('')}-${characters.slice(8).join('')}`;
}

export function discountedReportAmount(fullAmount: number, discountPercent: number): number {
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 99) {
    throw new Error('Discount percentage must be between 1 and 99.');
  }
  return Math.max(1, Math.round(fullAmount * (100 - discountPercent) / 100));
}
