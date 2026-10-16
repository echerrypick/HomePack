import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonicalUrl, seoForPath, SHARE_IMAGE_URL, structuredDataForPage } from '@/lib/seo';

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element!.setAttribute(name, value));
}

export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = seoForPath(pathname);
    const canonical = canonicalUrl(page);
    document.title = page.title;
    document.documentElement.lang = 'en-GB';

    upsertMeta('meta[name="description"]', { name: 'description', content: page.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: page.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: page.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: SHARE_IMAGE_URL });
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: 'UK residential properties' });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: page.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: SHARE_IMAGE_URL });

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    document.getElementById('seo-structured-data')?.remove();
    if (page.index) {
      const script = document.createElement('script');
      script.id = 'seo-structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredDataForPage(page));
      document.head.appendChild(script);
    }
  }, [pathname]);

  return null;
}
