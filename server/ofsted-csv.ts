// Parse one CSV row at a time; the national download must never be buffered
// alongside a second array containing every cell in the source file.
export async function readSelectedCsvRecords(
  chunks: AsyncIterable<string>, fields: readonly string[],
): Promise<Record<string, string>[]> {
  const records: Record<string, string>[] = [];
  let headers: string[] | null = null;
  let selected: { name: string; index: number }[] = [];
  let row: string[] = [], value = '', quoted = false, pendingQuote = false;
  const finishRow = () => {
    row.push(value); value = '';
    if (row.some(cell => cell.length)) {
      if (!headers) {
        headers = row.map(cell => cell.replace(/^\uFEFF/, ''));
        selected = headers.flatMap((name, index) => fields.includes(name) ? [{ name, index }] : []);
      } else {
        records.push(Object.fromEntries(selected.map(({ name, index }) => [name, row[index] || ''])));
      }
    }
    row = [];
  };
  for await (const chunk of chunks) {
    for (const char of chunk) {
      if (pendingQuote) {
        pendingQuote = false;
        if (char === '"') { value += '"'; continue; }
        quoted = false;
      }
      if (char === '"') {
        if (quoted) pendingQuote = true;
        else quoted = true;
      } else if (char === ',' && !quoted) {
        row.push(value); value = '';
      } else if ((char === '\n' || char === '\r') && !quoted) finishRow();
      else value += char;
    }
  }
  if (value || row.length) finishRow();
  return records;
}

export const OFSTED_FIELDS = [
  'URN', 'Postcode', 'School name', 'Ofsted phase', 'Latest OEIF overall effectiveness',
  'Inspection start date of latest OEIF graded inspection', 'Inspection start date',
  'Safeguarding standards', 'Inclusion', 'Curriculum and teaching', 'Achievement',
  'Attendance and behaviour', 'Personal development and wellbeing', 'Leadership and governance',
] as const;
