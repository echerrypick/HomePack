import test from 'node:test';
import assert from 'node:assert/strict';
import { queryLandRegistry } from '../server/land-registry-client';

test('Land Registry query retries a transient response and returns bindings', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) return new Response('', { status: 503 });
    return Response.json({ results: { bindings: [{ pricePaid: { value: '250000' } }] } });
  };

  const result = await queryLandRegistry('https://example.test/query', 'SELECT * WHERE {}', {
    fetchImpl: fetchImpl as typeof fetch,
    retryDelayMs: 0,
  });

  assert.equal(result.status, 'available');
  assert.equal(result.attempts, 2);
  assert.equal(result.bindings.length, 1);
  assert.equal(calls, 2);
});

test('Land Registry query distinguishes an available empty result from an outage', async () => {
  const available = await queryLandRegistry('https://example.test/query', 'SELECT * WHERE {}', {
    fetchImpl: (async () => Response.json({ results: { bindings: [] } })) as typeof fetch,
    retryDelayMs: 0,
  });
  assert.deepEqual(available, { status: 'available', bindings: [], attempts: 1 });

  const unavailable = await queryLandRegistry('https://example.test/query', 'SELECT * WHERE {}', {
    attempts: 2,
    fetchImpl: (async () => new Response('', { status: 503 })) as typeof fetch,
    retryDelayMs: 0,
  });
  assert.equal(unavailable.status, 'unavailable');
  assert.equal(unavailable.attempts, 2);
});
