import { SITE_URL } from '../src/lib/seo';

export const INDEXNOW_KEY = '62bce57a28ce45e9aaa56c7a585c22d8';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

const site = new URL(SITE_URL);

export type IndexNowResult = {
  status: number;
  urlCount: number;
};

export function normaliseIndexNowUrls(urls: string[]) {
  const valid = new Set<string>();
  for (const value of urls) {
    const url = new URL(value);
    if (url.protocol !== site.protocol || url.hostname !== site.hostname || url.port) {
      throw new Error(`IndexNow URL must belong to ${site.origin}: ${value}`);
    }
    url.hash = '';
    valid.add(url.toString());
  }
  const result = [...valid];
  if (!result.length) throw new Error('IndexNow requires at least one URL.');
  if (result.length > 10_000) throw new Error('IndexNow accepts no more than 10,000 URLs per request.');
  return result;
}

export async function submitIndexNowUrls(
  urls: string[],
  request: typeof fetch = fetch,
): Promise<IndexNowResult> {
  const urlList = normaliseIndexNowUrls(urls);
  const response = await request(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: site.hostname,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (response.status !== 200 && response.status !== 202) {
    const detail = (await response.text()).trim();
    throw new Error(`IndexNow returned HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`);
  }
  return { status: response.status, urlCount: urlList.length };
}

export function notifyIndexNowUrls(urls: string[]) {
  void submitIndexNowUrls(urls)
    .then(result => console.info(`[IndexNow] Submitted ${result.urlCount} URL(s); HTTP ${result.status}.`))
    .catch(error => console.error('[IndexNow] Submission failed:', error instanceof Error ? error.message : error));
}
