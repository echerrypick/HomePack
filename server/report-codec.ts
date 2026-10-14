import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { propertyKey } from '../src/lib/plans';

export const REPORT_CHUNK_BYTES = 700_000;
export const MAX_REPORT_BYTES = 24_000_000;
export function reportIdFor(address: any, scope: string) {
  return createHash('sha256').update(`${propertyKey(address)}|${scope}`).digest('hex');
}
export function encodeReport(result: any) {
  // Diagnostic logs are not part of the delivered report. Keep one canonical JSON body.
  const raw = Buffer.from(JSON.stringify({ propertyData: result.propertyData, summary: result.summary }));
  if (raw.length > MAX_REPORT_BYTES) throw new Error('Report exceeds the supported storage size.');
  const body = gzipSync(raw);
  if (body.length > REPORT_CHUNK_BYTES * 10) throw new Error('Compressed report is too large.');
  const chunks: Buffer[] = [];
  for (let offset = 0; offset < body.length; offset += REPORT_CHUNK_BYTES) chunks.push(body.subarray(offset, offset + REPORT_CHUNK_BYTES));
  return { chunks, hash: createHash('sha256').update(body).digest('hex'), rawBytes: raw.length, storedBytes: body.length };
}
export function decodeReport(chunks: Buffer[], hash: string) {
  const body = Buffer.concat(chunks);
  if (createHash('sha256').update(body).digest('hex') !== hash) throw new Error('Stored report integrity check failed.');
  return { ...JSON.parse(gunzipSync(body, { maxOutputLength: MAX_REPORT_BYTES }).toString()), logs: [] };
}
