type BillingEnvironment = Record<string, string | undefined>;

function isDisabled(value: string | undefined): boolean {
  return ['0', 'false', 'off', 'no'].includes(String(value || '').trim().toLowerCase());
}

function isLoopbackUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';
  } catch {
    return false;
  }
}

export function getBillingMode(env: BillingEnvironment = process.env) {
  const enabled = !isDisabled(env.BILLING_ENABLED);
  const developmentSimulation = !enabled && isLoopbackUrl(env.APP_URL);

  return {
    enabled,
    developmentSimulation,
    paymentsAvailable: enabled && Boolean(
      env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && env.APP_URL
    ),
  };
}
