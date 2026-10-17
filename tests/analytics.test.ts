import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Google Analytics is configured once and starts only after stored consent', () => {
  assert.equal((html.match(/googletagmanager\.com\/gtag\/js\?id=G-93ZN70T1CX/g) || []).length, 1);
  assert.match(html, /analytics_storage: 'denied'/);
  assert.match(html, /ukhomepack_analytics_consent/);
  assert.match(html, /ukHomePackEnableAnalytics/);
});
