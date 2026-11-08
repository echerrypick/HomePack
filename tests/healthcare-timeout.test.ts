import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCqcRatingForOds } from '../src/services/healthcareService';

test('a stalled CQC lookup aborts and returns unavailable so report generation can continue', async () => {
  const originalFetch = globalThis.fetch;
  const originalTimeout = AbortSignal.timeout;
  let deadline: number | undefined;
  // Shorten the real deadline for the test while exercising an abort-aware fetch.
  AbortSignal.timeout = ms => {
    deadline = ms;
    return originalTimeout(5);
  };
  globalThis.fetch = async (_url, options) => new Promise<Response>((_resolve, reject) => {
    const signal = options?.signal;
    assert.ok(signal, 'CQC requests must have an abort signal');
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    assert.deepEqual(await fetchCqcRatingForOds('TEST'), { rating: 'CQC match unavailable' });
    assert.equal(deadline, 5000);
  } finally {
    clearTimeout(keepAlive);
    globalThis.fetch = originalFetch;
    AbortSignal.timeout = originalTimeout;
  }
});
