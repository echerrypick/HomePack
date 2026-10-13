import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBillingMode } from '../server/billing-mode';

test('billing is enabled by default and requires Stripe configuration to be available', () => {
  assert.deepEqual(getBillingMode({ APP_URL: 'http://localhost:3000' }), {
    enabled: true,
    developmentSimulation: false,
    paymentsAvailable: false,
  });
});

test('disabled billing simulates checkout on loopback URLs without bypassing access checks', () => {
  assert.equal(getBillingMode({ BILLING_ENABLED: 'false', APP_URL: 'http://localhost:3000' }).developmentSimulation, true);
  assert.equal(getBillingMode({ BILLING_ENABLED: 'off', APP_URL: 'http://127.0.0.1:3000' }).developmentSimulation, true);
  assert.equal(getBillingMode({ BILLING_ENABLED: '0', APP_URL: 'http://[::1]:3000' }).developmentSimulation, true);
});

test('disabled billing fails closed for hosted or invalid URLs', () => {
  assert.equal(getBillingMode({ BILLING_ENABLED: 'false', APP_URL: 'https://ukhomepack.com' }).developmentSimulation, false);
  assert.equal(getBillingMode({ BILLING_ENABLED: 'false' }).developmentSimulation, false);
  assert.equal(getBillingMode({ BILLING_ENABLED: 'false', APP_URL: 'not-a-url' }).developmentSimulation, false);
});

test('payments are available only when billing and all Stripe settings are enabled', () => {
  const configured = {
    BILLING_ENABLED: 'true',
    APP_URL: 'https://ukhomepack.com',
    STRIPE_SECRET_KEY: 'test-secret',
    STRIPE_WEBHOOK_SECRET: 'test-webhook-secret',
  };
  assert.equal(getBillingMode(configured).paymentsAvailable, true);
  assert.equal(getBillingMode({ ...configured, BILLING_ENABLED: 'false' }).paymentsAvailable, false);
});
