export const SITE_URL = 'https://ukhomepack.com';
export const SHARE_IMAGE_URL = `${SITE_URL}/images/terraced-houses.jpg`;

export type SeoPage = {
  title: string;
  description: string;
  path: string;
  index: boolean;
  imageUrl?: string;
  article?: {
    headline: string;
    authorName: string;
    publishedAt: string;
    updatedAt: string;
    tags: string[];
  };
};

const INDEXABLE_PAGES: Record<string, Omit<SeoPage, 'path' | 'index'>> = {
  '/': {
    title: 'UK Property Report Online for £9.99 | UKHomePack',
    description: 'Order a UK property report for £9.99. Check available sold prices, EPC, council tax, planning, flood risk, crime, schools and connectivity in one PDF.',
  },
  '/features': {
    title: 'UK Property Report Checks & Data | UKHomePack',
    description: 'See what is included in a UKHomePack property report: available Land Registry sales, EPC, council tax, planning, flood, crime, schools and connectivity data.',
  },
  '/pricing': {
    title: 'UK Property Report Pricing: £9.99 | UKHomePack',
    description: 'Compare UKHomePack prices: a one-off UK property report for £9.99, Business at £49 a month, or Business Plus with report branding at £79 a month.',
  },
  '/sample': {
    title: 'Sample UK Property Report | UKHomePack',
    description: 'View an illustrative UKHomePack property report and see how available sales, EPC, council tax, planning, flood, crime and local-area records are presented.',
  },
  '/articles': {
    title: 'UK Property Articles & Homebuyer Guides | UKHomePack',
    description: 'Read practical UK property articles about buying, selling, council tax, planning, EPCs, connectivity and property research.',
  },
  '/about': {
    title: 'About UKHomePack | Independent UK Property Research',
    description: 'Learn why UKHomePack was created, how its UK property reports support early-stage research and where professional advice is still needed.',
  },
  '/data-sources': {
    title: 'Property Data Sources & Methodology | UKHomePack',
    description: 'See the official and trusted property data sources used by UKHomePack, how addresses are matched and why coverage can vary between properties.',
  },
  '/buyer-guide': {
    title: 'Property Checks Before Buying a House | UKHomePack',
    description: 'A practical UK homebuyer guide covering property checks, surveys, conveyancing, TA6 information and research to complete before buying a house.',
  },
  '/seller-guide': {
    title: 'Preparing Property Information for Sale | UKHomePack',
    description: 'A practical UK home seller guide covering the TA6 form, EPC, documents, conveyancing and information to prepare before selling a property.',
  },
  '/council-tax': {
    title: 'Council Tax Band Checker by Address | UKHomePack',
    description: 'Check the official VOA council tax band for a UK property address and view available local authority charges without substituting an estimated band.',
  },
  '/broadband': {
    title: 'Broadband Availability Checker by Address | UKHomePack',
    description: 'Check available Ofcom broadband coverage and speed information for a UK property address before you move home.',
  },
  '/mobile': {
    title: 'Mobile Signal & 5G Coverage Checker | UKHomePack',
    description: 'Check available Ofcom mobile signal predictions, including voice, 4G and 5G coverage across major UK networks for a property address.',
  },
  '/contact': {
    title: 'Contact UKHomePack | Property Report Support',
    description: 'Contact UKHomePack for help with a UK property report, account, payment, subscription or data correction.',
  },
  '/terms': {
    title: 'Terms of Service | UKHomePack',
    description: 'Read the UKHomePack terms covering property reports, payments, subscriptions, data coverage and permitted use.',
  },
  '/privacy': {
    title: 'Privacy Policy | UKHomePack',
    description: 'Read how UKHomePack handles account, payment and property-report information.',
  },
};

const PRIVATE_PAGE_TITLES: Record<string, string> = {
  '/tool': 'Create a Property Report | UKHomePack',
  '/profile': 'Your Account | UKHomePack',
  '/history': 'Saved Property Reports | UKHomePack',
  '/admin': 'Administration | UKHomePack',
  '/payment': 'Secure Checkout | UKHomePack',
};

export function isKnownSeoPath(pathname: string) {
  const requestedPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  const path = normalizeSeoPath(requestedPath);
  return requestedPath === '/sample-report' || /^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) || Boolean(INDEXABLE_PAGES[path] || PRIVATE_PAGE_TITLES[path]);
}

export function normalizeSeoPath(pathname: string) {
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  return cleanPath === '/sample-report' ? '/sample' : cleanPath;
}

export function seoForPath(pathname: string): SeoPage {
  const path = normalizeSeoPath(pathname);
  const publicPage = INDEXABLE_PAGES[path];
  if (publicPage) return { ...publicPage, path, index: true };
  if (/^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)) return {
    title: 'UK Property Article | UKHomePack',
    description: 'Practical information for researching, buying and selling UK property.',
    path,
    index: true,
  };

  return {
    title: PRIVATE_PAGE_TITLES[path] || 'Page Not Found | UKHomePack',
    description: 'UKHomePack account and property report service.',
    path,
    index: false,
  };
}

export function canonicalUrl(page: SeoPage) {
  return `${SITE_URL}${page.path === '/' ? '' : page.path}`;
}

export function structuredDataForPage(page: SeoPage) {
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: 'UKHomePack',
    inLanguage: 'en-GB',
  };
  const organisation = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'UKHomePack',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon-512.png`,
  };
  const webPage = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl(page)}#webpage`,
    url: canonicalUrl(page),
    name: page.title,
    description: page.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    inLanguage: 'en-GB',
  };
  const graph: Record<string, unknown>[] = page.path === '/' ? [website, organisation, webPage, {
    '@type': 'Service',
    '@id': `${SITE_URL}/#property-report`,
    name: 'UK property report',
    description: page.description,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    offers: {
      '@type': 'Offer',
      price: '9.99',
      priceCurrency: 'GBP',
      url: `${SITE_URL}/pricing`,
    },
  }] : [webPage, {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'UKHomePack', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: page.title.split('|')[0].trim(), item: canonicalUrl(page) },
    ],
  }];

  if (page.article) graph.push({
    '@type': 'Article',
    '@id': `${canonicalUrl(page)}#article`,
    headline: page.article.headline,
    description: page.description,
    datePublished: page.article.publishedAt,
    dateModified: page.article.updatedAt,
    author: { '@type': 'Organization', name: page.article.authorName },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@id': `${canonicalUrl(page)}#webpage` },
    ...(page.imageUrl ? { image: page.imageUrl } : {}),
    ...(page.article.tags.length ? { keywords: page.article.tags.join(', ') } : {}),
  });

  return { '@context': 'https://schema.org', '@graph': graph };
}

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function buildSeoHead(page: SeoPage) {
  const title = escapeAttribute(page.title);
  const description = escapeAttribute(page.description);
  const canonical = escapeAttribute(canonicalUrl(page));
  const image = escapeAttribute(page.imageUrl || SHARE_IMAGE_URL);
  const robots = page.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow';
  const structuredData = page.index ? `\n    <script id="seo-structured-data" type="application/ld+json">${safeJson(structuredDataForPage(page))}</script>` : '';

  return `<!-- SEO_START -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="author" content="UKHomePack" />
    <meta name="application-name" content="UKHomePack" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="UKHomePack" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="UK residential properties" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />${structuredData}
    <!-- SEO_END -->`;
}

export function seoForArticle(article: {
  slug: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  imageUrl: string;
  authorName: string;
  publishedAt?: string;
  updatedAt: string;
  tags: string[];
}): SeoPage {
  return {
    title: `${article.seoTitle || article.title}${(article.seoTitle || article.title).includes('UKHomePack') ? '' : ' | UKHomePack'}`,
    description: article.seoDescription || article.excerpt,
    path: `/articles/${article.slug}`,
    index: Boolean(article.publishedAt),
    ...(article.imageUrl ? { imageUrl: article.imageUrl } : {}),
    article: {
      headline: article.title,
      authorName: article.authorName,
      publishedAt: article.publishedAt || '',
      updatedAt: article.updatedAt,
      tags: article.tags,
    },
  };
}

export function injectSeoHead(html: string, page: SeoPage) {
  return html.replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/, buildSeoHead(page));
}
