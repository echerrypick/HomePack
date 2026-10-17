export const ARTICLE_CATEGORIES = [
  'Buying a property',
  'Selling a property',
  'Property research',
  'Council tax',
  'Planning and development',
  'Energy and EPC',
  'Connectivity',
  'Industry news',
] as const;

export type ArticleStatus = 'draft' | 'published';

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  imageAlt: string;
  authorName: string;
  seoTitle: string;
  seoDescription: string;
  status: ArticleStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  readingMinutes?: number;
};

export type ArticleInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'readingMinutes'>;

export function articleSlug(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function articleReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function validHttpsUrl(value: string) {
  if (!value) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateArticleInput(value: unknown): { input?: ArticleInput; error?: string } {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const title = cleanText(source.title);
  const excerpt = cleanText(source.excerpt);
  const content = cleanText(source.content);
  const slug = articleSlug(cleanText(source.slug) || title);
  const category = cleanText(source.category);
  const imageUrl = cleanText(source.imageUrl);
  const imageAlt = cleanText(source.imageAlt);
  const authorName = cleanText(source.authorName) || 'UKHomePack Editorial Team';
  const seoTitle = cleanText(source.seoTitle) || title;
  const seoDescription = cleanText(source.seoDescription) || excerpt;
  const status: ArticleStatus = source.status === 'published' ? 'published' : 'draft';
  const tags = Array.isArray(source.tags)
    ? [...new Set(source.tags.map(cleanText).filter(Boolean))].slice(0, 10)
    : cleanText(source.tags).split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 10);

  if (title.length < 8 || title.length > 140) return { error: 'Use an article title between 8 and 140 characters.' };
  if (!slug || slug.length < 3) return { error: 'Enter a valid article URL slug.' };
  if (excerpt.length < 30 || excerpt.length > 320) return { error: 'Use an excerpt between 30 and 320 characters.' };
  if (content.length < 100 || content.length > 50000) return { error: 'Article content must be between 100 and 50,000 characters.' };
  if (!ARTICLE_CATEGORIES.includes(category as typeof ARTICLE_CATEGORIES[number])) return { error: 'Choose a valid article category.' };
  if (!validHttpsUrl(imageUrl) || imageUrl.length > 600) return { error: 'Use a valid HTTPS image URL.' };
  if (imageUrl && (imageAlt.length < 5 || imageAlt.length > 180)) return { error: 'Add concise alternative text for the article image.' };
  if (authorName.length < 2 || authorName.length > 80) return { error: 'Use an author name between 2 and 80 characters.' };
  if (seoTitle.length > 70) return { error: 'Keep the SEO title to 70 characters or fewer.' };
  if (seoDescription.length > 170) return { error: 'Keep the SEO description to 170 characters or fewer.' };
  if (tags.some(tag => tag.length > 40)) return { error: 'Keep each tag to 40 characters or fewer.' };

  return { input: {
    slug, title, excerpt, content, category, tags, imageUrl, imageAlt, authorName,
    seoTitle, seoDescription, status, featured: source.featured === true,
  } };
}
