import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { encodeReport, decodeReport, reportIdFor, REPORT_CHUNK_BYTES } from '../server/report-codec';
const address = { houseNumber: '12', street: 'Example Street', town: 'Derby', postcode: 'DE1 2AB' };
test('report IDs deduplicate address case and spacing but keep planning scopes and flats separate', () => {
  assert.equal(reportIdFor(address, 'street'), reportIdFor({ ...address, street: ' EXAMPLE   STREET ' }, 'street'));
  assert.notEqual(reportIdFor(address, 'street'), reportIdFor(address, 'radius'));
  assert.notEqual(reportIdFor(address, 'street'), reportIdFor({ ...address, houseNumber: '12A' }, 'street'));
});
test('report compression preserves delivered data and omits diagnostic logs', () => {
  const report = { propertyData: { address: '12 Example Street', data: 'Official property information '.repeat(1000) }, summary: 'Summary', logs: ['diagnostic log'] };
  const encoded = encodeReport(report);
  assert.ok(encoded.storedBytes < encoded.rawBytes / 10);
  assert.deepEqual(decodeReport(encoded.chunks, encoded.hash), { ...report, logs: [] });
  assert.equal(encodeReport({ ...report, logs: ['other diagnostic'] }).hash, encoded.hash);
});
test('large reports split into bounded documents and detect corrupt payloads', () => {
  const report = { propertyData: { data: randomBytes(1_500_000).toString('base64') }, summary: 'Summary' };
  const encoded = encodeReport(report);
  assert.ok(encoded.chunks.length > 1);
  assert.ok(encoded.chunks.every(chunk => chunk.length <= REPORT_CHUNK_BYTES));
  assert.deepEqual(decodeReport(encoded.chunks, encoded.hash).propertyData, report.propertyData);
  assert.throws(() => decodeReport([Buffer.from('corrupt')], encoded.hash), /integrity/);
});
