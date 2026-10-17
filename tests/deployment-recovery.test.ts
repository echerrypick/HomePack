import test from 'node:test';
import assert from 'node:assert/strict';
import { staleDeploymentFailureKey } from '../src/lib/deployment-recovery';

test('recognises missing Vite chunks and identifies the failed build asset', () => {
  assert.equal(
    staleDeploymentFailureKey(new Error('Failed to fetch dynamically imported module: https://ukhomepack.com/assets/ToolPage-DQIssx86.js')),
    'https://ukhomepack.com/assets/ToolPage-DQIssx86.js',
  );
});

test('recognises browser-specific chunk loading messages', () => {
  assert.ok(staleDeploymentFailureKey(new Error('Importing a module script failed.')));
  assert.ok(staleDeploymentFailureKey(new Error('ChunkLoadError: Loading chunk 42 failed')));
});

test('does not reload for ordinary application errors', () => {
  assert.equal(staleDeploymentFailureKey(new Error('Unable to generate report')), null);
});
