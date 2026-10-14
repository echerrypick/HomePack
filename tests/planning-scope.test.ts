import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterPlanningApplicationsForScope, isPlanningApplicationOnStreet } from '../server/planning-scope';

test('street matching tolerates common road suffix abbreviations', () => {
  assert.equal(isPlanningApplicationOnStreet('12 Bingley Rd, Tamworth', 'Bingley Road'), true);
  assert.equal(isPlanningApplicationOnStreet('8 Sunny Grove, Derby', 'Bingley Road'), false);
});

test('standard scope keeps property-linked and same-street applications only', () => {
  const applications = [
    { reference: 'property', distanceKm: 0, propertyLinked: true },
    { reference: 'street', address: '14 Bingley Avenue', distanceKm: 0.2 },
    { reference: 'nearby', address: '1 Nearby Close', distanceKm: 0.2 },
    { reference: 'same-point-neighbour', address: '2 Other Street', distanceKm: 0 },
    { reference: 'outside', address: '20 Bingley Avenue', distanceKm: 0.6 }
  ];
  assert.deepEqual(
    filterPlanningApplicationsForScope(applications, 'street', 'Bingley Avenue').map(item => item.reference),
    ['property', 'street']
  );
});

test('business radius scope keeps all applications within 0.3 miles', () => {
  const applications = [
    { reference: 'street', address: '14 Bingley Avenue', distanceKm: 0.2 },
    { reference: 'nearby', address: '1 Nearby Close', distanceKm: 0.3 },
    { reference: 'outside', address: '2 Far Road', distanceKm: 0.6 }
  ];
  assert.deepEqual(
    filterPlanningApplicationsForScope(applications, 'radius', 'Bingley Avenue').map(item => item.reference),
    ['street', 'nearby']
  );
});
