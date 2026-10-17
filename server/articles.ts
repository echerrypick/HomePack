import express from 'express';
import { randomUUID } from 'node:crypto';
import { authenticate, database, requireAdmin } from './billing';
import { ARTICLE_CATEGORIES, articleReadingMinutes, relatedArticles, type Article, validateArticleInput } from '../src/lib/articles';
import { SITE_URL } from '../src/lib/seo';

const COLLECTION = 'articles';
let publicCache: { expiresAt: number; articles: Article[] } | null = null;

function clearPublicCache() { publicCache = null; }

function toArticle(id: string, data: FirebaseFirestore.DocumentData): Article {
  return {
    id,
    slug: String(data.slug || ''),
    title: String(data.title || ''),
    excerpt: String(data.excerpt || ''),
    content: String(data.content || ''),
    category: String(data.category || ''),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    imageUrl: String(data.imageUrl || ''),
    imageAlt: String(data.imageAlt || ''),
    authorName: String(data.authorName || 'UKHomePack Editorial Team'),
    seoTitle: String(data.seoTitle || data.title || ''),
    seoDescription: String(data.seoDescription || data.excerpt || ''),
    status: data.status === 'published' ? 'published' : 'draft',
    featured: data.featured === true,
    createdAt: String(data.createdAt || ''),
    updatedAt: String(data.updatedAt || ''),
    ...(data.publishedAt ? { publishedAt: String(data.publishedAt) } : {}),
  };
}

function byPublicationDate(a: Article, b: Article) {
  return (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt);
}

export async function listPublishedArticles() {
  if (publicCache && publicCache.expiresAt > Date.now()) return publicCache.articles;
  const snapshot = await database().collection(COLLECTION).limit(250).get();
  const articles = snapshot.docs.map(document => toArticle(document.id, document.data()))
    .filter(article => article.status === 'published' && article.publishedAt)
    .sort(byPublicationDate);
  publicCache = { expiresAt: Date.now() + 60_000, articles };
  return articles;
}

export async function getPublishedArticle(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return (await listPublishedArticles()).find(article => article.slug === slug) || null;
}

function publicSummary(article: Article) {
  const { content: _content, ...summary } = article;
  return { ...summary, readingMinutes: articleReadingMinutes(article.content) };
}

function xml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export function registerArticleRoutes(app: express.Express) {
  app.get('/api/articles', async (_req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.json({ articles: (await listPublishedArticles()).map(publicSummary), categories: ARTICLE_CATEGORIES });
    } catch {
      res.status(503).json({ error: 'Articles are temporarily unavailable.' });
    }
  });

  app.get('/api/articles/:slug', async (req, res) => {
    try {
      const articles = await listPublishedArticles();
      const article = articles.find(item => item.slug === String(req.params.slug || '')) || null;
      if (!article) return res.status(404).json({ error: 'Article not found.' });
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.json({ article, related: relatedArticles(article, articles).map(publicSummary) });
    } catch {
      res.status(503).json({ error: 'This article is temporarily unavailable.' });
    }
  });

  app.get('/api/admin/articles', authenticate, requireAdmin, async (_req, res) => {
    try {
      const snapshot = await database().collection(COLLECTION).limit(500).get();
      const articles = snapshot.docs.map(document => toArticle(document.id, document.data()))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      res.set('Cache-Control', 'no-store').json({ articles, categories: ARTICLE_CATEGORIES });
    } catch {
      res.status(503).json({ error: 'Unable to load articles.' });
    }
  });

  app.post('/api/admin/articles', authenticate, requireAdmin, async (req, res) => {
    const validated = validateArticleInput(req.body);
    if (!validated.input) return res.status(400).json({ error: validated.error });
    try {
      const duplicate = await database().collection(COLLECTION).where('slug', '==', validated.input.slug).limit(1).get();
      if (!duplicate.empty) return res.status(409).json({ error: 'That article URL slug is already in use.' });
      const now = new Date().toISOString();
      const id = randomUUID();
      const article = {
        ...validated.input,
        createdAt: now,
        updatedAt: now,
        createdBy: res.locals.uid,
        ...(validated.input.status === 'published' ? { publishedAt: now, publishedBy: res.locals.uid } : {}),
      };
      await database().collection(COLLECTION).doc(id).create(article);
      clearPublicCache();
      res.status(201).json({ article: toArticle(id, article) });
    } catch {
      res.status(503).json({ error: 'Unable to create the article.' });
    }
  });

  app.patch('/api/admin/articles/:id', authenticate, requireAdmin, async (req, res) => {
    const id = String(req.params.id || '');
    if (!/^[a-f0-9-]{36}$/.test(id)) return res.status(400).json({ error: 'Select a valid article.' });
    const validated = validateArticleInput(req.body);
    if (!validated.input) return res.status(400).json({ error: validated.error });
    try {
      const ref = database().collection(COLLECTION).doc(id);
      const currentSnapshot = await ref.get();
      if (!currentSnapshot.exists) return res.status(404).json({ error: 'Article not found.' });
      const currentData = currentSnapshot.data()!;
      const current = toArticle(id, currentData);
      if (current.publishedAt && validated.input.slug !== current.slug) {
        return res.status(409).json({ error: 'A published article URL cannot be changed.' });
      }
      if (validated.input.slug !== current.slug) {
        const duplicate = await database().collection(COLLECTION).where('slug', '==', validated.input.slug).limit(2).get();
        if (duplicate.docs.some(document => document.id !== id)) return res.status(409).json({ error: 'That article URL slug is already in use.' });
      }
      const now = new Date().toISOString();
      const article = {
        ...validated.input,
        createdAt: current.createdAt,
        createdBy: currentData.createdBy || res.locals.uid,
        updatedAt: now,
        updatedBy: res.locals.uid,
        ...(validated.input.status === 'published'
          ? { publishedAt: current.publishedAt || now, publishedBy: res.locals.uid }
          : current.publishedAt ? { publishedAt: current.publishedAt, publishedBy: currentData.publishedBy || res.locals.uid } : {}),
      };
      await ref.set(article);
      clearPublicCache();
      res.json({ article: toArticle(id, article) });
    } catch {
      res.status(503).json({ error: 'Unable to update the article.' });
    }
  });

  app.delete('/api/admin/articles/:id', authenticate, requireAdmin, async (req, res) => {
    const id = String(req.params.id || '');
    if (!/^[a-f0-9-]{36}$/.test(id)) return res.status(400).json({ error: 'Select a valid article.' });
    try {
      const ref = database().collection(COLLECTION).doc(id);
      const snapshot = await ref.get();
      if (!snapshot.exists) return res.status(404).json({ error: 'Article not found.' });
      if (snapshot.data()?.status === 'published') return res.status(409).json({ error: 'Unpublish this article before deleting it.' });
      await ref.delete();
      clearPublicCache();
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(error?.statusCode || 503).json({ error: 'Unable to delete the article.' });
    }
  });

  app.get('/sitemap.xml', async (_req, res) => {
    const staticPaths = ['/', '/features', '/pricing', '/sample', '/articles', '/about', '/data-sources', '/buyer-guide', '/seller-guide', '/council-tax', '/broadband', '/mobile', '/contact', '/terms', '/privacy'];
    let articles: Article[] = [];
    try { articles = await listPublishedArticles(); }
    catch (error) { console.error('Article sitemap entries unavailable:', error); }
    const urls = [
      ...staticPaths.map(path => ({ url: `${SITE_URL}${path === '/' ? '/' : path}`, modified: '2026-10-17' })),
      ...articles.map(article => ({ url: `${SITE_URL}/articles/${article.slug}`, modified: (article.updatedAt || article.publishedAt || '').slice(0, 10) })),
    ];
    const body = urls.map(item => `<url><loc>${xml(item.url)}</loc><lastmod>${xml(item.modified)}</lastmod></url>`).join('');
    res.type('application/xml').set('Cache-Control', 'public, max-age=300').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
  });
}
