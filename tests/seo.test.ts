import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalUrl, injectSeoHead, isKnownSeoPath, seoForPath, structuredDataForPage } from '../src/lib/seo.ts';
import { injectSeoContent } from '../src/lib/seo-content.ts';

test('public pages have distinct indexable metadata and canonical URLs', () => {
  const home = seoForPath('/');
  const pricing = seoForPath('/pricing');
  assert.equal(home.index, true);
  assert.equal(pricing.index, true);
  assert.equal(seoForPath('/about').index, true);
  assert.equal(seoForPath('/data-sources').index, true);
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

test('known routes can be distinguished from real 404s', () => {
  assert.equal(isKnownSeoPath('/features'), true);
  assert.equal(isKnownSeoPath('/articles'), true);
  assert.equal(isKnownSeoPath('/articles/checks-before-buying'), true);
  assert.equal(isKnownSeoPath('/sample-report'), true);
  assert.equal(isKnownSeoPath('/profile'), true);
  assert.equal(isKnownSeoPath('/does-not-exist'), false);
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

test('public pages contain meaningful crawlable content in initial HTML', () => {
  const source = '<body><!-- SEO_CONTENT_START --><!-- SEO_CONTENT_END --><div id="root"></div></body>';
  const rendered = injectSeoContent(source, seoForPath('/pricing'));
  assert.match(rendered, /<h1>UK property report prices for individuals and businesses<\/h1>/);
  assert.match(rendered, /Pay-As-You-Go Report — £9\.99/);
  assert.match(rendered, /Business — £49 per month/);
  assert.match(rendered, /Business Plus — £79 per month/);
  assert.match(rendered, /<a href="\/features">/);
});

test('homepage crawlable content includes buyer questions and methodology links', () => {
  const source = '<body><!-- SEO_CONTENT_START --><!-- SEO_CONTENT_END --><div id="root"></div></body>';
  const rendered = injectSeoContent(source, seoForPath('/'));
  assert.match(rendered, /Questions worth asking before you buy/);
  assert.match(rendered, /What does the EPC suggest/);
  assert.match(rendered, /href="\/data-sources"/);
});

test('private pages do not receive public static marketing content', () => {
  const source = '<body><!-- SEO_CONTENT_START --><h1>Old content</h1><!-- SEO_CONTENT_END --><div id="root"></div></body>';
  const rendered = injectSeoContent(source, seoForPath('/profile'));
  assert.doesNotMatch(rendered, /Old content/);
  assert.doesNotMatch(rendered, /seo-static-content/);
});
