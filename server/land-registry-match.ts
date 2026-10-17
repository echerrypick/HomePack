type LandRegistryAddress = {
  paon?: string;
  saon?: string;
  street?: string;
};

function normalizeAddressPart(value: unknown): string {
  return String(value || '')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const STREET_SUFFIXES: Record<string, string> = {
  AVE: 'AVENUE',
  CL: 'CLOSE',
  CRES: 'CRESCENT',
  CT: 'COURT',
  DR: 'DRIVE',
  GDNS: 'GARDENS',
  GR: 'GROVE',
  LN: 'LANE',
  PL: 'PLACE',
  RD: 'ROAD',
};

export function normalizeLandRegistryStreet(value: unknown): string {
  const normalized = normalizeAddressPart(value);
  if (!normalized) return '';
  const parts = normalized.split(' ');
  const suffix = parts.at(-1) || '';
  if (STREET_SUFFIXES[suffix]) parts[parts.length - 1] = STREET_SUFFIXES[suffix];
  return parts.join(' ');
}

export function isExactLandRegistryAddress(
  record: LandRegistryAddress,
  houseNumberOrName: string,
  street: string,
): boolean {
  const requestedIdentifier = normalizeAddressPart(houseNumberOrName);
  const requestedStreet = normalizeLandRegistryStreet(street);
  const paon = normalizeAddressPart(record.paon);
  const saon = normalizeAddressPart(record.saon);
  const combinedIdentifier = normalizeAddressPart([record.saon, record.paon].filter(Boolean).join(' '));
  const recordStreet = normalizeLandRegistryStreet(record.street);

  if (!requestedIdentifier || !requestedStreet || recordStreet !== requestedStreet) return false;
  return requestedIdentifier === paon
    || requestedIdentifier === saon
    || requestedIdentifier === combinedIdentifier;
}

export function landRegistryUriLabel(value: unknown): string {
  const slug = String(value || '').split(/[\/#]/).filter(Boolean).pop() || '';
  const spaced = slug.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim();
  if (!spaced) return '';
  return spaced.replace(/\b\w/g, character => character.toUpperCase());
}
