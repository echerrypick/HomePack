export const PLANNING_RADIUS_MILES = 0.3;
export const PLANNING_RADIUS_KM = PLANNING_RADIUS_MILES / 0.621371;

export function isWithinPlanningRadius(distanceKm: number | undefined): boolean {
  return Number.isFinite(distanceKm) && Number(distanceKm) <= PLANNING_RADIUS_KM;
}
