import { PLANS } from '../src/lib/plans';

// Portal changes update the price, not the original Checkout metadata.
export function subscriptionPlan(price: { lookup_key?: string | null; metadata?: Record<string, string>; unit_amount: number | null; currency: string; recurring?: { interval: string; interval_count: number } | null }, originalPlan?: string) {
  const plan = price.lookup_key === 'ukhomepack_agency_gbp_month_v1' ? 'agency'
    : price.lookup_key === 'ukhomepack_subscription_gbp_month_v1' ? 'subscription'
    : price.metadata?.homepackPlan || originalPlan;
  if ((plan !== 'agency' && plan !== 'subscription') || price.currency !== 'gbp' || price.unit_amount !== PLANS[plan].amount || price.recurring?.interval !== 'month' || price.recurring.interval_count !== 1) return null;
  return plan;
}
