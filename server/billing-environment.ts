export function stripeTestMode(env: Record<string, string | undefined> = process.env) {
  return /^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY || '');
}
export function billingCollections(env: Record<string, string | undefined> = process.env) {
  return stripeTestMode(env) ? { users: 'stripeTestUsers', orders: 'stripeTestOrders' } : { users: 'users', orders: 'checkoutOrders' };
}
export function mergeBillingProfile(base: any, sandbox: any, testMode: boolean) {
  if (!testMode) return base;
  return { ...base, role: 'free', accountType: 'consumer', purchasedPropertyKeys: [], purchasedReports: [], stripeCustomerId: null, stripeSubscriptionId: null, subscriptionStatus: null, subscriptionExpiresAt: 0, ...sandbox, ...(base?.role === 'admin' ? { role: 'admin' } : {}) };
}
