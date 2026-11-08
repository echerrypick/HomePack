import test from 'node:test';
import assert from 'node:assert/strict';
import { readSelectedCsvRecords } from '../server/ofsted-csv';

test('streaming CSV preserves quoted delimiters, newlines, escapes and split quotes while discarding unused columns', async () => {
  const csv = '\uFEFFURN,School name,Unused,Postcode\r\n1,"St ""Mary"", School",discard,WD25 7NE\r\n2,"Two\nLines",discard,DE72 3UA';
  async function* chunks() { for (const char of csv) yield char; }
  assert.deepEqual(await readSelectedCsvRecords(chunks(), ['URN', 'School name', 'Postcode']), [
    { URN: '1', 'School name': 'St "Mary", School', Postcode: 'WD25 7NE' },
    { URN: '2', 'School name': 'Two\nLines', Postcode: 'DE72 3UA' },
  ]);
});

test('large datasets retain only requested columns', async () => {
  async function* chunks() {
    yield 'URN,Postcode,Unused\n';
    for (let i = 0; i < 25000; i++) yield `${i},WD25 7NE,${'x'.repeat(1000)}\n`;
  }
  const records = await readSelectedCsvRecords(chunks(), ['URN', 'Postcode']);
  assert.equal(records.length, 25000);
  assert.deepEqual(records.at(-1), { URN: '24999', Postcode: 'WD25 7NE' });
});
