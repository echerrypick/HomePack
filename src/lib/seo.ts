export const SITE_URL = 'https://ukhomepack.com';
export const SHARE_IMAGE_URL = `${SITE_URL}/images/terraced-houses.jpg`;

export type SeoPage = {
  title: string;
  description: string;
  path: string;
  index: boolean;
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

export function normalizeSeoPath(pathname: string) {
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  return cleanPath === '/sample-report' ? '/sample' : cleanPath;
}

export function seoForPath(pathname: string): SeoPage {
  const path = normalizeSeoPath(pathname);
  const publicPage = INDEXABLE_PAGES[path];
  if (publicPage) return { ...publicPage, path, index: true };

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
    <meta property="og:image" content="${SHARE_IMAGE_URL}" />
    <meta property="og:image:alt" content="UK residential properties" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${SHARE_IMAGE_URL}" />${structuredData}
    <!-- SEO_END -->`;
}

export function injectSeoHead(html: string, page: SeoPage) {
  return html.replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/, buildSeoHead(page));
}
