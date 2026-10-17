import type { SeoPage } from './seo';
import { articleReadingMinutes, type Article } from './articles';

type ContentSection = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  links?: Array<{ href: string; label: string }>;
};

type PageContent = {
  eyebrow: string;
  heading: string;
  intro: string;
  sections: ContentSection[];
};

const PAGE_CONTENT: Record<string, PageContent> = {
  '/': {
    eyebrow: 'Online UK property reports for buyers, sellers and professionals',
    heading: 'Research a UK property before you commit',
    intro: 'Order an easy-to-read UK property report online for £9.99. UKHomePack brings together available official and trusted property records so you can identify useful questions before buying, selling or advising on a home.',
    sections: [
      {
        heading: 'What is included in a UK property report?',
        paragraphs: ['Depending on data availability for the address, a report can include sold-price history, Energy Performance Certificate details, council tax band and charges, nearby planning applications, flood-risk information, local crime, schools, broadband and mobile coverage.'],
        links: [{ href: '/features', label: 'See every property report check' }, { href: '/sample', label: 'View a sample property report' }],
      },
      {
        heading: 'One report, clear pricing',
        paragraphs: ['Buy a single report for one property with no subscription. Businesses can compare monthly plans for regular reports and branded report options.'],
        links: [{ href: '/pricing', label: 'Compare property report prices' }, { href: '/tool', label: 'Create a property report' }],
      },
      {
        heading: 'Make better-informed property decisions',
        paragraphs: ['UKHomePack is a research aid and does not replace a survey, conveyancing, legal searches or professional advice. Data coverage varies by property and source.'],
        links: [{ href: '/buyer-guide', label: 'Read the homebuyer guide' }, { href: '/seller-guide', label: 'Read the home seller guide' }],
      },
      {
        heading: 'Questions worth asking before you buy',
        items: ['Is nearby planning activity worth a closer look?', 'What does the EPC suggest about the home?', 'What context does recorded local crime provide?'],
        paragraphs: ['UKHomePack helps turn available records into practical questions for the seller, surveyor or conveyancer.'],
        links: [{ href: '/data-sources', label: 'Read about data sources and methodology' }],
      },
    ],
  },
  '/features': {
    eyebrow: 'UK property data in one place',
    heading: 'Property checks included in a UKHomePack report',
    intro: 'Understand what each UKHomePack property check shows, why it may matter and what still needs independent verification.',
    sections: [
      { heading: 'Property, energy and cost records', items: ['HM Land Registry sold-price history and recent street sales where available', 'EPC rating and energy information', 'Official VOA council tax band and published local authority charges where available'] },
      { heading: 'Planning and environmental checks', items: ['Planning applications at the property and on its street', 'Flood-risk information from relevant official datasets', 'Nearby schools and local crime statistics'] },
      { heading: 'Connectivity checks', items: ['Available Ofcom broadband coverage and speed information', 'Available Ofcom voice, 4G and 5G coverage predictions'], links: [{ href: '/broadband', label: 'Learn about broadband checks' }, { href: '/mobile', label: 'Learn about mobile coverage checks' }] },
      { heading: 'Understand geographical and source coverage', paragraphs: ['HM Land Registry Price Paid Data and the VOA council tax service used by UKHomePack cover England and Wales. Other datasets have their own coverage, publication cycles and limitations. “Not available” does not confirm that an issue or feature does not exist.'], links: [{ href: '/sample', label: 'View the sample report' }, { href: '/pricing', label: 'See report pricing' }] },
    ],
  },
  '/pricing': {
    eyebrow: 'Simple property report pricing',
    heading: 'UK property report prices for individuals and businesses',
    intro: 'Choose a one-off report for a single property or a monthly business membership for regular property research.',
    sections: [
      { heading: 'Pay-As-You-Go Report — £9.99', paragraphs: ['One report for one property. Payment is required before a report is generated for each new address. There is no subscription.'], links: [{ href: '/tool', label: 'Order a property report' }] },
      { heading: 'Business — £49 per month', paragraphs: ['Designed for professionals who need regular UK property reports and business account features.'] },
      { heading: 'Business Plus — £79 per month', paragraphs: ['Includes business report access plus report branding options for agencies and professional teams.'] },
      { heading: 'Compare before choosing', paragraphs: ['Plan availability, usage terms and included features are shown on the interactive pricing page.'], links: [{ href: '/features', label: 'Review report features' }, { href: '/contact', label: 'Ask a pricing question' }] },
    ],
  },
  '/sample': {
    eyebrow: 'Illustrative report',
    heading: 'View a sample UK property report',
    intro: 'See how UKHomePack presents available property records, local-area information, source details and important data limitations in an easy-to-read report.',
    sections: [
      { heading: 'See the report structure', paragraphs: ['The sample demonstrates sections for property details, sold prices, EPC, council tax, planning, flood risk, crime, schools and connectivity. It also shows source dates and limitations. Actual results depend on the records available for the chosen address.'] },
      { heading: 'Turn findings into useful questions', paragraphs: ['Check how recent each record is, follow important findings to the original source and raise material points with the seller, surveyor or conveyancer.'] },
      { heading: 'Ready to research an address?', links: [{ href: '/tool', label: 'Create your property report' }, { href: '/pricing', label: 'View pricing and business plans' }] },
    ],
  },
  '/articles': {
    eyebrow: 'UK property knowledge',
    heading: 'Property articles and practical home-moving guides',
    intro: 'Read UKHomePack articles about researching, buying and selling property, including council tax, planning, EPCs and connectivity.',
    sections: [
      { heading: 'Latest property articles', paragraphs: ['Published guides and explainers appear here. Each article is reviewed and dated so you can see when it was last updated.'] },
      { heading: 'Research a particular property', links: [{ href: '/features', label: 'See property report checks' }, { href: '/tool', label: 'Create a property report' }] },
    ],
  },
  '/about': {
    eyebrow: 'About UKHomePack',
    heading: 'Clearer property research before you commit',
    intro: 'UKHomePack is an independent UK property-information service created to make early-stage property research easier to understand.',
    sections: [
      { heading: 'Why UKHomePack exists', paragraphs: ['Important property information is spread across different public services. UKHomePack brings available records into one readable report so buyers, sellers and professionals can see what deserves closer investigation.'] },
      { heading: 'What the service does', paragraphs: ['The service checks available records for an exact address and its local area, presents source context and highlights useful questions to raise with an estate agent, surveyor or conveyancer.'] },
      { heading: 'What it does not do', paragraphs: ['A UKHomePack report is a research aid. It is not a valuation, survey, legal search, conveyancing service or guarantee that every relevant record is available.'], links: [{ href: '/data-sources', label: 'Read our data sources and methodology' }, { href: '/contact', label: 'Contact UKHomePack' }] },
    ],
  },
  '/data-sources': {
    eyebrow: 'Data sources and methodology',
    heading: 'How UKHomePack collects and presents property information',
    intro: 'Understand the principal sources used in a report, how addresses are matched and why coverage can differ between properties.',
    sections: [
      { heading: 'Address and location matching', paragraphs: ['Where a source supports address records, UKHomePack looks for the exact house, flat or named property rather than treating a postcode match as proof. Location-based sources use the best confirmed coordinates available for the selected property.'] },
      { heading: 'Principal property data sources', items: ['HM Land Registry Price Paid Data', 'GOV.UK Energy Performance Certificate data', 'Valuation Office Agency and local authorities', 'Planning Data and local planning records', 'Environment Agency flood data', 'Police.uk crime records', 'Department for Education and Ofsted school information', 'Ofcom broadband and mobile coverage data'] },
      { heading: 'No result is not a clean bill of health', paragraphs: ['A source may be unavailable, delayed, geographically limited or unable to match an address. “Not available” means that UKHomePack could not confirm the information from that source; it does not prove that no issue or record exists.'], links: [{ href: '/sample', label: 'View a sample report' }, { href: '/features', label: 'See report features' }] },
    ],
  },
  '/buyer-guide': {
    eyebrow: 'Practical guidance for homebuyers',
    heading: 'What to check before buying a house in the UK',
    intro: 'Use this UK homebuyer guide to understand the research, professional checks and questions that can help before you exchange contracts.',
    sections: [
      { heading: 'Research the property and local area', items: ['Review available sold-price, EPC and council tax records', 'Check planning applications, flood information and nearby development', 'Consider schools, crime, broadband and mobile coverage'] },
      { heading: 'Use qualified professionals', paragraphs: ['Arrange an appropriate survey and rely on your conveyancer for title, searches, enquiries and legal advice. An online property report supports research but does not replace those services.'] },
      { heading: 'Bring your research together', links: [{ href: '/features', label: 'See UKHomePack report checks' }, { href: '/tool', label: 'Research a property address' }] },
    ],
  },
  '/seller-guide': {
    eyebrow: 'Practical guidance for home sellers',
    heading: 'Preparing your house for sale: a practical UK checklist',
    intro: 'Organising accurate documents and property details early can help you answer enquiries and reduce avoidable delays during a UK property sale.',
    sections: [
      { heading: 'Documents and details to prepare', items: ['Current EPC and property information', 'Planning permissions, building regulations documents and guarantees', 'Details needed for the TA6 property information form and your conveyancer'] },
      { heading: 'Present accurate information', paragraphs: ['Answer enquiries honestly and use your conveyancer for legal guidance. A UKHomePack report can help identify publicly available records but is not a substitute for the formal sales process.'] },
      { heading: 'Useful next steps', links: [{ href: '/features', label: 'Explore property report contents' }, { href: '/contact', label: 'Contact UKHomePack' }] },
    ],
  },
  '/council-tax': {
    eyebrow: 'Council tax information by property',
    heading: 'Check a council tax band and published local charge',
    intro: 'For properties in England and Wales, UKHomePack uses the official VOA council tax band for an exact address and matches it to published local authority charges where the required source data is available.',
    sections: [
      { heading: 'No estimated council tax band', paragraphs: ['If an official band or an exact published charge cannot be confirmed, UKHomePack does not replace it with a guessed value. Discounts, exemptions, support, parish or local precepts and account adjustments can change the final bill.'] },
      { heading: 'Council tax in a property report', links: [{ href: '/features', label: 'See all property report checks' }, { href: '/tool', label: 'Check a property address' }] },
    ],
  },
  '/broadband': {
    eyebrow: 'Connectivity information for home movers',
    heading: 'Check broadband availability for a UK property',
    intro: 'Review available Ofcom broadband coverage and speed information for a property address before moving or changing how you work from home.',
    sections: [
      { heading: 'Understand likely connectivity', paragraphs: ['Coverage data is an indication rather than a guarantee of service at a particular property. Confirm packages, installation and current speeds directly with providers before relying on them.'] },
      { heading: 'Research more than broadband', links: [{ href: '/mobile', label: 'Check mobile coverage information' }, { href: '/tool', label: 'Create a full property report' }] },
    ],
  },
  '/mobile': {
    eyebrow: 'Mobile coverage information for home movers',
    heading: 'Check mobile signal and 5G coverage for a property',
    intro: 'Review available Ofcom voice, 4G and 5G coverage predictions across major UK mobile networks for a property address.',
    sections: [
      { heading: 'Coverage predictions, not guarantees', paragraphs: ['Actual indoor and outdoor reception can be affected by the building, terrain, network load and device. Confirm critical coverage with the network provider.'] },
      { heading: 'Complete your connectivity research', links: [{ href: '/broadband', label: 'Check broadband availability information' }, { href: '/tool', label: 'Create a full property report' }] },
    ],
  },
  '/contact': {
    eyebrow: 'UKHomePack support',
    heading: 'Contact UKHomePack',
    intro: 'Use the secure contact form for help with a property report, account, payment, subscription, business enquiry or data correction. We do not publish personal contact email addresses on the website.',
    sections: [
      { heading: 'Choose the right enquiry category', paragraphs: ['Include the relevant property address or report reference where appropriate, but do not send card details or passwords.'] },
      { heading: 'Helpful information', links: [{ href: '/features', label: 'Read about report coverage' }, { href: '/pricing', label: 'View pricing' }] },
    ],
  },
  '/terms': {
    eyebrow: 'Legal information',
    heading: 'UKHomePack terms of service',
    intro: 'Read the terms that apply to UKHomePack property reports, accounts, one-off payments, business memberships, data coverage and permitted use.',
    sections: [
      { heading: 'Important service limitations', paragraphs: ['UKHomePack brings together available third-party information and does not provide a survey, valuation, conveyancing search or legal advice. Read the complete terms on this page before buying or using a report.'] },
      { heading: 'Questions about the terms', links: [{ href: '/contact', label: 'Contact UKHomePack' }, { href: '/privacy', label: 'Read the privacy policy' }] },
    ],
  },
  '/privacy': {
    eyebrow: 'Privacy information',
    heading: 'UKHomePack privacy policy',
    intro: 'Read how UKHomePack handles account, payment, contact and property-report information, including the providers used to operate the service.',
    sections: [
      { heading: 'Your privacy choices', paragraphs: ['The complete policy on this page explains the information processed, why it is needed, how long it may be retained and the rights available to you.'] },
      { heading: 'Privacy enquiries', links: [{ href: '/contact', label: 'Use the UKHomePack contact form' }, { href: '/terms', label: 'Read the terms of service' }] },
    ],
  },
};

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function renderSection(section: ContentSection) {
  const paragraphs = section.paragraphs?.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('') || '';
  const items = section.items?.length
    ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';
  const links = section.links?.length
    ? `<p class="seo-static-links">${section.links.map(link => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join(' ')}</p>`
    : '';
  return `<section><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${items}${links}</section>`;
}

function renderShell(main: string) {
  return `<!-- SEO_CONTENT_START -->
    <div id="seo-static-content" class="seo-static-shell">
      <header class="seo-static-header">
        <a class="seo-static-brand" href="/">UKHomePack</a>
        <nav aria-label="Main navigation">
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/sample">Sample report</a>
          <a href="/articles">Articles</a>
          <a href="/buyer-guide">Buyer guide</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>
      ${main}
      <footer class="seo-static-footer">
        <nav aria-label="Footer navigation">
          <a href="/features">Property report features</a>
          <a href="/pricing">Pricing</a>
          <a href="/articles">Property articles</a>
          <a href="/about">About UKHomePack</a>
          <a href="/data-sources">Data sources and methodology</a>
          <a href="/council-tax">Council tax checker</a>
          <a href="/broadband">Broadband checker</a>
          <a href="/mobile">Mobile coverage checker</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </footer>
    </div>
    <!-- SEO_CONTENT_END -->`;
}

export function buildSeoContent(page: SeoPage) {
  if (!page.index) return '<!-- SEO_CONTENT_START --><!-- SEO_CONTENT_END -->';
  const content = PAGE_CONTENT[page.path];
  if (!content) return '<!-- SEO_CONTENT_START --><!-- SEO_CONTENT_END -->';

  return renderShell(`<main class="seo-static-main">
        <p class="seo-static-eyebrow">${escapeHtml(content.eyebrow)}</p>
        <h1>${escapeHtml(content.heading)}</h1>
        <p class="seo-static-intro">${escapeHtml(content.intro)}</p>
        ${content.sections.map(renderSection).join('')}
      </main>`);
}

export function injectSeoContent(html: string, page: SeoPage) {
  return html.replace(/<!-- SEO_CONTENT_START -->[\s\S]*?<!-- SEO_CONTENT_END -->/, buildSeoContent(page));
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderMarkdown(content: string) {
  return content.split(/\n\s*\n/).map(rawBlock => {
    const block = rawBlock.trim();
    if (!block) return '';
    const heading = block.match(/^(#{2,3})\s+(.+)$/s);
    if (heading) return `<h${heading[1].length}>${renderInlineMarkdown(heading[2].trim())}</h${heading[1].length}>`;
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.every(line => /^[-*+]\s+/.test(line))) {
      return `<ul>${lines.map(line => `<li>${renderInlineMarkdown(line.replace(/^[-*+]\s+/, ''))}</li>`).join('')}</ul>`;
    }
    if (lines.every(line => /^\d+\.\s+/.test(line))) {
      return `<ol>${lines.map(line => `<li>${renderInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
    }
    if (lines.every(line => /^>\s?/.test(line))) {
      return `<blockquote><p>${renderInlineMarkdown(lines.map(line => line.replace(/^>\s?/, '')).join(' '))}</p></blockquote>`;
    }
    return `<p>${renderInlineMarkdown(lines.join(' '))}</p>`;
  }).join('');
}

export function buildArticleIndexSeoContent(articles: Article[]) {
  const listing = articles.length
    ? `<section><h2>Published articles</h2><ul>${articles.map(article => `<li><a href="/articles/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a> — ${escapeHtml(article.excerpt)}</li>`).join('')}</ul></section>`
    : '<section><h2>Published articles</h2><p>New UK property articles will be published here.</p></section>';
  return renderShell(`<main class="seo-static-main"><p class="seo-static-eyebrow">UK property knowledge</p><h1>Property articles and practical home-moving guides</h1><p class="seo-static-intro">Read guides about researching, buying and selling UK property.</p>${listing}</main>`);
}

export function buildArticleSeoContent(article: Article, related: Article[] = []) {
  const published = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' }) : '';
  const updated = article.updatedAt ? new Date(article.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' }) : '';
  const revised = article.updatedAt.slice(0, 10) !== (article.publishedAt || '').slice(0, 10) ? ` · Updated ${escapeHtml(updated)}` : '';
  const relatedHtml = related.length ? `<aside><h2>Related property guides</h2><ul>${related.map(item => `<li><a href="/articles/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul></aside>` : '';
  return renderShell(`<main class="seo-static-main"><article><p class="seo-static-eyebrow">${escapeHtml(article.category)}</p><h1>${escapeHtml(article.title)}</h1><p class="seo-static-intro">${escapeHtml(article.excerpt)}</p><p>By ${escapeHtml(article.authorName)} · Published ${escapeHtml(published)}${revised} · ${articleReadingMinutes(article.content)} min read</p>${article.imageUrl ? `<img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.imageAlt)}" width="1200" height="675" />` : ''}<section>${renderMarkdown(article.content)}</section><p>Our guides explain general property research and are not legal, financial or surveying advice. <a href="/data-sources">Read about UKHomePack data sources and methodology</a>.</p>${relatedHtml}<p><a href="/articles">View all property articles</a></p></article></main>`);
}

export function replaceSeoContent(html: string, content: string) {
  return html.replace(/<!-- SEO_CONTENT_START -->[\s\S]*?<!-- SEO_CONTENT_END -->/, content);
}
