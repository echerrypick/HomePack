import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialArticles } from '../content/editorial-articles';
import { validateArticleInput } from '../src/lib/articles';

test('editorial article pack contains twelve valid, unique drafts', () => {
  assert.equal(editorialArticles.length, 12);
  assert.equal(new Set(editorialArticles.map(article => article.slug)).size, 12);
  for (const article of editorialArticles) {
    assert.equal(article.status, 'draft');
    assert.ok(validateArticleInput(article).input, `${article.slug} should validate`);
  }
});

test('each editorial article follows the agreed search and editorial structure', () => {
  for (const article of editorialArticles) {
    assert.ok(article.excerpt.length >= 80, `${article.slug} needs a useful excerpt`);
    assert.ok(article.seoTitle.length <= 70, `${article.slug} SEO title is too long`);
    assert.ok(article.seoDescription.length >= 100 && article.seoDescription.length <= 170, `${article.slug} needs a useful SEO description`);
    assert.ok((article.content.match(/^##\s+/gm) || []).length >= 5, `${article.slug} needs descriptive H2s`);
    assert.match(article.content, /^## Frequently asked questions$/m, `${article.slug} needs FAQs`);
    assert.match(article.content, /\[[^\]]+\]\(https:\/\//, `${article.slug} needs an authoritative source link`);
    assert.match(article.content, /\[[^\]]+\]\(\//, `${article.slug} needs an internal link`);
    assert.match(article.imageUrl, /^https:\/\/ukhomepack\.com\/images\/articles\/.+\.jpg$/);
    assert.ok(article.imageAlt.length >= 20);
  }
});
