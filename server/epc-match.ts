const normalize = (text: unknown) => String(text || '').toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();
/** Require the full requested premises line; never borrow a neighbour's EPC. */
export function selectBestEpcCertificate(items: any[], requested: string): any | null {
  const target = normalize(requested);
  if (!target) return null;
  const fields = ['address', 'address1', 'address2', 'address3', 'address_1', 'address_2', 'address_3', 'address-1', 'address-2', 'address-3', 'addressLine1', 'addressLine2', 'addressLine3', 'address_line_1', 'address_line_2', 'address_line_3', 'line1'];
  const matches = items.filter(item => {
    const lines = fields.map(key => normalize(item[key])).filter(Boolean);
    // Sub-premises qualifiers must also match: a flat/office is not the whole building.
    const qualifiers = lines.filter(line => /\b(flat|apartment|unit|suite|floor|office|offices)\b/.test(line) && line !== target);
    return qualifiers.every(line => target.includes(line)) && (lines.includes(target) || normalize(lines.join(' ')) === target);
  });
  return matches.sort((a, b) => {
    const date = (item: any) => Date.parse(item.dateRegistered || item.registrationDate || item.lodgementDate || item['lodgement-date'] || item.lodgement_date || item.inspectionDate || '') || 0;
    return date(b) - date(a);
  })[0] || null;
}
