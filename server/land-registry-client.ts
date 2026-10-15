export type LandRegistryQueryResult =
  | { status: 'available'; bindings: any[]; attempts: number }
  | { status: 'unavailable'; bindings: []; attempts: number; detail: string };

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export async function queryLandRegistry(
  endpoint: string,
  sparqlQuery: string,
  options: {
    attempts?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    fetchImpl?: typeof fetch;
    onLog?: (message: string) => void;
  } = {}
): Promise<LandRegistryQueryResult> {
  const maxAttempts = Math.max(1, options.attempts ?? 3);
  const timeoutMs = options.timeoutMs ?? 15_000;
  const retryDelayMs = options.retryDelayMs ?? 500;
  const fetchImpl = options.fetchImpl ?? fetch;

  let lastDetail = 'The HM Land Registry service did not return a usable response.';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/sparql-results+json',
        },
        body: `query=${encodeURIComponent(sparqlQuery)}`,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        lastDetail = `HM Land Registry returned HTTP ${response.status}.`;
        const canRetry = RETRYABLE_STATUSES.has(response.status) && attempt < maxAttempts;
        options.onLog?.(`${lastDetail}${canRetry ? ` Retrying (${attempt}/${maxAttempts}).` : ''}`);
        if (!canRetry) break;
      } else {
        const data = await response.json();
        const bindings = data?.results?.bindings;
        if (!Array.isArray(bindings)) {
          throw new Error('The response did not contain SPARQL result bindings.');
        }
        if (attempt > 1) options.onLog?.(`HM Land Registry responded on attempt ${attempt}/${maxAttempts}.`);
        return { status: 'available', bindings, attempts: attempt };
      }
    } catch (error: any) {
      const reason = error?.name === 'TimeoutError' || error?.name === 'AbortError'
        ? `timed out after ${Math.round(timeoutMs / 1000)} seconds`
        : error?.message || 'request failed';
      lastDetail = `HM Land Registry lookup ${reason}.`;
      const canRetry = attempt < maxAttempts;
      options.onLog?.(`${lastDetail}${canRetry ? ` Retrying (${attempt}/${maxAttempts}).` : ''}`);
      if (!canRetry) break;
    }

    await new Promise(resolve => setTimeout(resolve, retryDelayMs * attempt));
  }

  return { status: 'unavailable', bindings: [], attempts: maxAttempts, detail: lastDetail };
}
