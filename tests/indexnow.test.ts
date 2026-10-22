import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
  normaliseIndexNowUrls,
  submitIndexNowUrls,
} from '../server/indexnow.ts';
import { extractSitemapUrls } from '../scripts/submit-indexnow.ts';

test('the public IndexNow key file contains only the configured key', () => {
  assert.equal(readFileSync(new URL(`../public/${INDEXNOW_KEY}.txt`, import.meta.url), 'utf8').trim(), INDEXNOW_KEY);
});

test('IndexNow URLs are canonicalised, deduplicated and restricted to this host', () => {
  assert.deepEqual(normaliseIndexNowUrls([
    'https://ukhomepack.com/articles/example#section',
    'https://ukhomepack.com/articles/example',
  ]), ['https://ukhomepack.com/articles/example']);
  assert.throws(() => normaliseIndexNowUrls(['https://example.com/page']), /must belong/);
});

test('bulk submission sends the required IndexNow ownership payload', async () => {
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;
  const request = async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response('', { status: 202 });
  };
  const result = await submitIndexNowUrls(['https://ukhomepack.com/', 'https://ukhomepack.com/pricing'], request as typeof fetch);
  assert.deepEqual(result, { status: 202, urlCount: 2 });
  assert.equal(capturedUrl, INDEXNOW_ENDPOINT);
  assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
    host: 'ukhomepack.com',
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: ['https://ukhomepack.com/', 'https://ukhomepack.com/pricing'],
  });
});

test('sitemap URLs can be extracted for bulk submission', () => {
  assert.deepEqual(extractSitemapUrls('<?xml version="1.0"?><urlset><url><loc>https://ukhomepack.com/</loc></url><url><loc>https://ukhomepack.com/features</loc></url></urlset>'), [
    'https://ukhomepack.com/',
    'https://ukhomepack.com/features',
  ]);
});
