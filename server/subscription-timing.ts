type SubscriptionTiming = {
  status: string;
  cancel_at_period_end: boolean;
  cancel_at?: number | null;
  items: { data: { current_period_end: number }[] };
};

export function subscriptionTiming(subscription: SubscriptionTiming) {
  const periodEnd = Math.max(0, ...subscription.items.data.map(item => item.current_period_end));
  const cancellationDate = subscription.cancel_at && subscription.cancel_at > 0 ? subscription.cancel_at : null;
  return {
    cancellationScheduled: subscription.status === 'active' && Boolean(subscription.cancel_at_period_end || cancellationDate),
    expiresAt: Math.min(periodEnd, cancellationDate ?? periodEnd) * 1000,
  };
}
