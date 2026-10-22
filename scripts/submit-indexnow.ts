import { load } from 'cheerio';
import { submitIndexNowUrls } from '../server/indexnow';
import { SITE_URL } from '../src/lib/seo';

export function extractSitemapUrls(xml: string) {
  const document = load(xml, { xmlMode: true });
  return document('url > loc').map((_index, element) => document(element).text().trim()).get().filter(Boolean);
}

async function main() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Unable to read ${sitemapUrl}: HTTP ${response.status}`);
  const urls = extractSitemapUrls(await response.text());
  const result = await submitIndexNowUrls(urls);
  console.log(`IndexNow accepted ${result.urlCount} sitemap URL(s) with HTTP ${result.status}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
