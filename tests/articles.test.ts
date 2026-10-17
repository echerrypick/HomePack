import test from 'node:test';
import assert from 'node:assert/strict';
import { articleReadingMinutes, articleSlug, relatedArticles, validateArticleInput, type Article } from '../src/lib/articles.ts';
import { buildArticleIndexSeoContent, buildArticleSeoContent } from '../src/lib/seo-content.ts';
import { seoForArticle, structuredDataForPage } from '../src/lib/seo.ts';

const article: Article = {
  id: '123',
  slug: 'checks-before-buying-a-house',
  title: 'Ten checks to make before buying a house',
  excerpt: 'A practical guide to researching a property before you exchange contracts in the UK.',
  content: '## Start with the address\n\nCheck the available property records and local area information. '.repeat(8),
  category: 'Buying a property',
  tags: ['homebuyer', 'property checks'],
  imageUrl: 'https://example.com/house.jpg',
  imageAlt: 'A row of residential houses in the UK',
  authorName: 'UKHomePack Editorial Team',
  seoTitle: 'Checks Before Buying a House',
  seoDescription: 'Ten practical checks to make before buying a house in the UK.',
  status: 'published',
  featured: true,
  createdAt: '2026-10-17T09:00:00.000Z',
  updatedAt: '2026-10-17T09:30:00.000Z',
  publishedAt: '2026-10-17T09:30:00.000Z',
};

test('article slugs are stable and search friendly', () => {
  assert.equal(articleSlug('Council Tax: What Buyers Need to Know'), 'council-tax-what-buyers-need-to-know');
});

test('article input validates publishing fields and HTTPS images', () => {
  const valid = validateArticleInput(article);
  assert.ok(valid.input);
  assert.equal(valid.input?.status, 'published');
  assert.equal(valid.input?.tags.length, 2);
  assert.match(validateArticleInput({ ...article, imageUrl: 'http://example.com/a.jpg' }).error || '', /HTTPS/);
  assert.match(validateArticleInput({ ...article, content: 'Too short' }).error || '', /100/);
});

test('reading time has a minimum of one minute', () => {
  assert.equal(articleReadingMinutes('A short article.'), 1);
  assert.equal(articleReadingMinutes(Array(441).fill('word').join(' ')), 3);
});

test('published article HTML is crawlable and links from the index', () => {
  const index = buildArticleIndexSeoContent([article]);
  const related = { ...article, id: '456', slug: 'related-property-guide', title: 'A related property guide' };
  const detail = buildArticleSeoContent(article, [related]);
  assert.match(index, /href="\/articles\/checks-before-buying-a-house"/);
  assert.match(detail, /<h1>Ten checks to make before buying a house<\/h1>/);
  assert.match(detail, /<h2>Start with the address<\/h2>/);
  assert.match(detail, /href="\/articles\/related-property-guide"/);
  assert.match(detail, /href="\/data-sources"/);
});

test('related articles prioritise a matching category and tags', () => {
  const different = { ...article, id: '2', slug: 'different', category: 'Connectivity', tags: ['broadband'] };
  const close = { ...article, id: '3', slug: 'close', tags: ['property checks'] };
  assert.equal(relatedArticles(article, [different, close], 1)[0]?.slug, 'close');
});

test('article SEO contains canonical Article structured data', () => {
  const page = seoForArticle(article);
  assert.equal(page.path, '/articles/checks-before-buying-a-house');
  assert.equal(page.index, true);
  const data = structuredDataForPage(page) as { '@graph': Array<Record<string, unknown>> };
  assert.ok(data['@graph'].some(item => item['@type'] === 'Article'));
});
