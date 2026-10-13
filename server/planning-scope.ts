import { isWithinPlanningRadius } from './planning-radius';

export type PlanningScope = 'street' | 'radius';

function normalizeStreet(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/\broad\b/g, 'rd')
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\blane\b/g, 'ln')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\bclose\b/g, 'cl')
    .replace(/\bcrescent\b/g, 'cres')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isPlanningApplicationOnStreet(applicationAddress: unknown, street: string): boolean {
  const normalizedAddress = normalizeStreet(applicationAddress);
  const normalizedTarget = normalizeStreet(street);
  if (!normalizedAddress || !normalizedTarget) return false;
  return ` ${normalizedAddress} `.includes(` ${normalizedTarget} `);
}

export function filterPlanningApplicationsForScope<T extends { address?: string; distanceKm?: number }>(
  applications: T[],
  scope: PlanningScope,
  street: string
): T[] {
  return applications.filter(application => {
    if (!isWithinPlanningRadius(application.distanceKm)) return false;
    if (scope === 'radius') return true;
    return application.distanceKm === 0 || isPlanningApplicationOnStreet(application.address, street);
  });
}
