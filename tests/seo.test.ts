import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalUrl, injectSeoHead, seoForPath, structuredDataForPage } from '../src/lib/seo.ts';

test('public pages have distinct indexable metadata and canonical URLs', () => {
  const home = seoForPath('/');
  const pricing = seoForPath('/pricing');
  assert.equal(home.index, true);
  assert.equal(pricing.index, true);
  assert.notEqual(home.title, pricing.title);
  assert.equal(canonicalUrl(pricing), 'https://ukhomepack.com/pricing');
});

test('legacy sample route resolves to one canonical page', () => {
  const page = seoForPath('/sample-report');
  assert.equal(page.path, '/sample');
  assert.equal(canonicalUrl(page), 'https://ukhomepack.com/sample');
});

test('private and unknown routes are marked noindex', () => {
  assert.equal(seoForPath('/tool').index, false);
  assert.equal(seoForPath('/admin').index, false);
  assert.equal(seoForPath('/does-not-exist').index, false);
});

test('server HTML injection includes conventional metadata and JSON-LD', () => {
  const source = '<head><!-- SEO_START --><title>Old</title><!-- SEO_END --></head>';
  const rendered = injectSeoHead(source, seoForPath('/features'));
  assert.match(rendered, /<title>UK Property Report Checks &amp; Data \| UKHomePack<\/title>/);
  assert.match(rendered, /<link rel="canonical" href="https:\/\/ukhomepack.com\/features"/);
  assert.match(rendered, /<meta property="og:image"/);
  assert.match(rendered, /<meta name="twitter:card" content="summary_large_image"/);
  assert.match(rendered, /application\/ld\+json/);
});

test('structured data describes the page and its navigation', () => {
  const data = structuredDataForPage(seoForPath('/buyer-guide')) as { '@graph': Array<Record<string, unknown>> };
  assert.ok(data['@graph'].some(item => item['@type'] === 'WebPage'));
  assert.ok(data['@graph'].some(item => item['@type'] === 'BreadcrumbList'));
});
