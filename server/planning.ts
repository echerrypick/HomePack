import { getEpcField } from './epc';
import { PLANNING_RADIUS_KM, PLANNING_RADIUS_MILES, isWithinPlanningRadius } from './planning-radius';
import { filterPlanningApplicationsForScope, type PlanningScope } from './planning-scope';
// Planning applications and constraints from the official Planning Data API and PlanIt.
// These sources are complementary: Planning Data is authoritative for constraints, while
// PlanIt provides broader application coverage across local authority portals.
const PLANNING_CONSTRAINT_DATASETS = [
  'conservation-area',
  'listed-building',
  'green-belt',
  'flood-risk-zone',
  'article-4-direction-area',
  'tree-preservation-zone'
];

function planningDateYearsAgo(years: number): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - years);
  return date.toISOString().slice(0, 10);
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLng = radians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizedPlanningKey(item: any): string {
  const reference = String(item.reference || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (reference && reference !== 'na' && reference !== 'recorded') return `ref:${reference}`;
  return `fallback:${[item.application, item.address, item.date]
    .map(value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''))
    .join(':')}`;
}

function mergePlanningApplications(groups: any[][]): any[] {
  const merged = new Map<string, any>();
  for (const item of groups.flat()) {
    const key = normalizedPlanningKey(item);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, item);
      continue;
    }
    const preferred = Object.values(item).filter(Boolean).length > Object.values(existing).filter(Boolean).length ? item : existing;
    merged.set(key, {
      ...existing,
      ...preferred,
      source: Array.from(new Set([existing.source, item.source].filter(Boolean))).join(' + ')
    });
  }
  return Array.from(merged.values()).sort((a, b) => {
    const activeDifference = Number(Boolean(b.isActive)) - Number(Boolean(a.isActive));
    if (activeDifference) return activeDifference;
    const scale = (value: string) => value === 'Large' ? 2 : value === 'Medium' ? 1 : 0;
    const scaleDifference = scale(b.applicationSize) - scale(a.applicationSize);
    if (scaleDifference) return scaleDifference;
    return String(b.rawDate || '').localeCompare(String(a.rawDate || ''));
  });
}

async function fetchPlanningDataApplications(
  uprn: string,
  coords: { latitude: number; longitude: number } | null,
  logs: string[],
  limited?: () => void
): Promise<any[]> {
  if (!uprn && !coords) return [];
  const params = new URLSearchParams({ dataset: 'planning-application', limit: '50' });
  if (uprn) params.set('q', uprn);
  else if (coords) {
    params.set('latitude', String(coords.latitude));
    params.set('longitude', String(coords.longitude));
  }
  params.append('exclude_field', 'geometry');

  try {
    const res = await fetch(`https://www.planning.data.gov.uk/entity.json?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawData: any = await res.json();
    if (!Array.isArray(rawData.entities)) throw new Error('Invalid entity response');
    if (rawData.links?.next) limited?.();
    return rawData.entities.map((entity: any) => {
      const rawDate = String(getEpcField(entity, 'decision-date', 'start-date') || '');
      const reference = String(getEpcField(entity, 'reference') || 'N/A');
      const decision = String(getEpcField(entity, 'planning-application-status', 'status') || 'Unknown');
      return {
        application: String(getEpcField(entity, 'description', 'name') || 'No description available'),
        address: String(getEpcField(entity, 'site-address', 'address', 'location') || '').trim() || undefined,
        decision,
        date: rawDate || 'Unknown',
        rawDate,
        reference,
        url: `https://www.planning.data.gov.uk/entity/${getEpcField(entity, 'entity') || ''}`,
        source: 'Planning Data',
        distanceKm: 0,
        propertyLinked: Boolean(uprn),
        isActive: /pending|undecided|consultation|submitted/i.test(decision)
      };
    });
  } catch (err: any) {
    logs.push(`[PLANNING:Planning Data] Applications unavailable (${err?.message || err})`);
    throw err;
  }
}

async function fetchPlanningConstraints(
  coords: { latitude: number; longitude: number } | null,
  logs: string[],
  limited?: () => void
): Promise<any[]> {
  if (!coords) return [];
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    limit: '100'
  });
  PLANNING_CONSTRAINT_DATASETS.forEach(dataset => params.append('dataset', dataset));
  ['entity', 'dataset', 'name', 'reference', 'quality', 'flood-risk-level', 'listed-building-grade']
    .forEach(field => params.append('field', field));

  try {
    const res = await fetch(`https://www.planning.data.gov.uk/entity.json?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawData: any = await res.json();
    if (!Array.isArray(rawData.entities)) throw new Error('Invalid entity response');
    if (rawData.links?.next) limited?.();
    return rawData.entities.map((entity: any) => ({
      dataset: String(entity.dataset || 'planning-constraint'),
      name: String(entity.name || entity.reference || 'Recorded constraint'),
      reference: String(entity.reference || 'N/A'),
      quality: String(entity.quality || 'not stated'),
      detail: entity['listed-building-grade']
        ? `Grade ${entity['listed-building-grade']}`
        : entity['flood-risk-level']
          ? `Flood Risk Zone ${entity['flood-risk-level']}`
          : undefined,
      url: `https://www.planning.data.gov.uk/entity/${entity.entity || ''}`
    }));
  } catch (err: any) {
    logs.push(`[PLANNING:Planning Data] Constraints unavailable (${err?.message || err})`);
    throw err;
  }
}

async function fetchPlanItApplications(
  coords: { latitude: number; longitude: number } | null,
  logs: string[],
  radiusKm: number,
  years: number,
  significantOnly = false,
  limited?: () => void
): Promise<any[]> {
  if (!coords) return [];
  const params = new URLSearchParams({
    lat: String(coords.latitude),
    lng: String(coords.longitude),
    krad: String(radiusKm),
    start_date: planningDateYearsAgo(years),
    end_date: new Date().toISOString().slice(0, 10),
    pg_sz: '50',
    sort: '-start_date',
    select: 'name,uid,description,address,postcode,url,app_size,app_state,app_type,start_date,decided_date,other_fields,link,location',
    compress: 'on'
  });
  if (significantOnly) params.set('app_size', 'Large,Medium');

  try {
    const res = await fetch(`https://www.planit.org.uk/api/applics/json?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'UKHomePack.com/1.0 property-report lookup' },
      signal: AbortSignal.timeout(7000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rawData: any = await res.json();
    if (rawData.error) throw new Error(String(rawData.error));
    if (!Array.isArray(rawData.records)) throw new Error('Invalid application response');
    if (Number(rawData.total) > rawData.records.length || (rawData.total === undefined && rawData.records.length >= 50)) limited?.();
    const records = rawData.records.map((record: any) => {
      const decision = String(record.other_fields?.decision || record.app_state || record.other_fields?.status || 'Unknown');
      const rawDate = String(record.decided_date || record.start_date || '');
      const point = record.location?.coordinates;
      const calculatedDistance = Array.isArray(point) && point.length >= 2
        ? distanceKm(coords.latitude, coords.longitude, Number(point[1]), Number(point[0]))
        : undefined;
      const addressCandidates = [
        record.address,
        record.other_fields?.site_address,
        record.other_fields?.siteAddress,
        record.other_fields?.address,
        record.other_fields?.location_address
      ];
      const applicationAddress = addressCandidates
        .map(value => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '')
        .find(Boolean);
      return {
        application: String(record.description || 'No description available'),
        decision,
        date: rawDate || 'Unknown',
        rawDate,
        reference: String(record.uid || record.reference || record.name || 'N/A'),
        url: String(record.url || record.link || ''),
        address: applicationAddress || undefined,
        distanceKm: calculatedDistance,
        applicationType: record.app_type ? String(record.app_type) : undefined,
        applicationSize: record.app_size ? String(record.app_size) : undefined,
        source: 'PlanIt',
        isActive: /pending|undecided|consultation|submitted/i.test(String(record.app_state || record.other_fields?.status || ''))
      };
    });
    const withinRadius = records.filter((record: any) => isWithinPlanningRadius(record.distanceKm));
    if (withinRadius.length !== records.length) {
      logs.push(`[PLANNING:PlanIt] Excluded ${records.length - withinRadius.length} records outside the verified ${PLANNING_RADIUS_MILES}-mile radius or without coordinates`);
    }
    return withinRadius;
  } catch (err: any) {
    logs.push(`[PLANNING:PlanIt] ${radiusKm}km search unavailable (${err?.message || err})`);
    throw err;
  }
}

export async function fetchPlanningHistory(
  uprn: string,
  coords: { latitude: number; longitude: number } | null,
  street: string,
  scope: PlanningScope,
  logs: string[]
) {
  const sources: { name: string; kind: 'applications' | 'constraints'; status: 'available' | 'unavailable' | 'not_checked' | 'partial'; count: number }[] = [];
  const runSource = async (name: string, kind: 'applications' | 'constraints', ready: boolean, lookup: (limited: () => void) => Promise<any[]>) => {
    const source = { name, kind, status: (ready ? 'available' : 'not_checked') as 'available' | 'unavailable' | 'not_checked' | 'partial', count: 0 };
    sources.push(source);
    if (!ready) return [];
    try {
      const records = await lookup(() => { source.status = 'partial'; });
      source.count = records.length;
      return records;
    } catch (error: any) {
      source.status = 'unavailable';
      logs.push(`[PLANNING] ${name}: lookup incomplete (${error?.message || error})`);
      return [];
    }
  };
  const [officialApplications, constraints, recentApplications, significantApplications] = await Promise.all([
    runSource('Planning Data applications', 'applications', Boolean(uprn || coords), limited => fetchPlanningDataApplications(uprn, coords, logs, limited)),
    runSource('Planning Data constraints', 'constraints', Boolean(coords), limited => fetchPlanningConstraints(coords, logs, limited)),
    runSource('PlanIt recent applications', 'applications', Boolean(coords), limited => fetchPlanItApplications(coords, logs, PLANNING_RADIUS_KM, 2, false, limited)),
    runSource('PlanIt significant applications', 'applications', Boolean(coords), limited => fetchPlanItApplications(coords, logs, PLANNING_RADIUS_KM, 5, true, limited))
  ]);
  const allApplications = mergePlanningApplications([officialApplications, recentApplications, significantApplications]);
  const applications = filterPlanningApplicationsForScope(allApplications, scope, street);
  const scopeDescription = scope === 'radius'
    ? `within ${PLANNING_RADIUS_MILES} miles`
    : `linked to the property or recorded on ${street || 'the same street'}`;
  logs.push(`[PLANNING] ${applications.length} unique applications ${scopeDescription}; ${constraints.length} point constraints found`);
  return {
    applications,
    constraints,
    coverage: {
      checkedAt: new Date().toISOString(),
      nearbyApplicationsCount: allApplications.length,
      excludedByScope: allApplications.length - applications.length,
      sources,
      scope,
      radiusMiles: scope === 'radius' ? PLANNING_RADIUS_MILES : undefined,
      applications: scope === 'radius'
        ? `property-linked Planning Data records plus all verified PlanIt applications within ${PLANNING_RADIUS_MILES} miles; recent applications cover 2 years and significant schemes cover 5 years`
        : `property-linked Planning Data records plus verified PlanIt applications recorded on ${street || 'the property street'}; recent applications cover 2 years and significant schemes cover 5 years`,
      constraints: 'selected Planning Data point-intersection datasets; local coverage varies and no result does not establish absence of a constraint'
    }
  };
}
