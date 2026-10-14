import type { Address } from '../types';

export const PLANS = {
  report: { name: 'Retail property report', amount: 999, price: '£9.99' },
  subscription: { name: 'Business', amount: 4900, price: '£49' },
  agency: { name: 'Business Plus', amount: 7900, price: '£79' },
} as const;
export type PaidPlan = keyof typeof PLANS;

// Preserve flat/house identifiers; never grant access on a postcode match.
export function propertyKey(address: Address): string {
  return [address.houseNumber, address.street, address.town, address.postcode]
    .map((part, index) => {
      const value = String(part || '').normalize('NFKC').trim().toUpperCase().replace(/\s+/g, ' ');
      return index === 3 ? value.replace(/\s/g, '') : value;
    }).map(encodeURIComponent).join('|');
}

export function validAddress(address: any): address is Address {
  return address && ['houseNumber', 'street', 'town', 'postcode'].every(key =>
    typeof address[key] === 'string' && address[key].trim().length > 0 && address[key].length <= 150
  ) && /^[A-Z]{1,2}\d[\dA-Z]?\s?\d[A-Z]{2}$/i.test(address.postcode.trim());
}

export function ownsProperty(profile: { purchasedPropertyKeys?: string[] } | null, address: Address) {
  return profile?.purchasedPropertyKeys?.includes(propertyKey(address)) === true;
}

export function ownsDevelopmentProperty(profile: { developmentPurchasedPropertyKeys?: string[] } | null, address: Address) {
  return profile?.developmentPurchasedPropertyKeys?.includes(propertyKey(address)) === true;
}

export function hasBusinessAccess(profile: any, now = Date.now()): boolean {
  return profile?.role === 'admin' || Boolean(['subscription', 'agency'].includes(profile?.role) && profile?.subscriptionStatus === 'active' && profile?.subscriptionExpiresAt > now);
}

export function hasDevelopmentBusinessAccess(profile: any, now = Date.now()): boolean {
  return Boolean(['subscription', 'agency'].includes(profile?.developmentSubscriptionPlan) && profile?.developmentSubscriptionExpiresAt > now);
}

export function hasPropertyAccess(profile: any, address: Address, now = Date.now(), includeDevelopment = false): boolean {
  return hasBusinessAccess(profile, now) || ownsProperty(profile, address) || Boolean(includeDevelopment && (
    ownsDevelopmentProperty(profile, address) || hasDevelopmentBusinessAccess(profile, now)
  ));
}

// Account classification follows verified entitlements, never a user-editable preference.
export function membershipAccountType(profile: any, now = Date.now(), includeDevelopment = false): 'consumer' | 'business' {
  return hasBusinessAccess(profile, now) || (includeDevelopment && hasDevelopmentBusinessAccess(profile, now)) ? 'business' : 'consumer';
}
