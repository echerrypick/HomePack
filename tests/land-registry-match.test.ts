import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isExactLandRegistryAddress, landRegistryUriLabel } from '../server/land-registry-match';

test('Land Registry matching requires the exact house identifier and street', () => {
  const record = { paon: '22', street: 'SUNNY GROVE' };
  assert.equal(isExactLandRegistryAddress(record, '22', 'Sunny Grove'), true);
  assert.equal(isExactLandRegistryAddress(record, '2', 'Sunny Grove'), false);
  assert.equal(isExactLandRegistryAddress(record, '22', 'Sunny Close'), false);
});

test('Land Registry matching supports flats and named properties without postcode fallback', () => {
  assert.equal(isExactLandRegistryAddress({ saon: 'FLAT 1', paon: '10', street: 'HIGH STREET' }, 'Flat 1, 10', 'High Street'), true);
  assert.equal(isExactLandRegistryAddress({ paon: 'THE COTTAGE', street: 'CHURCH LANE' }, 'The Cottage', 'Church Lane'), true);
});

test('Land Registry URI values become readable labels', () => {
  assert.equal(landRegistryUriLabel('http://landregistry.data.gov.uk/def/common/semi-detached'), 'Semi Detached');
  assert.equal(landRegistryUriLabel('http://landregistry.data.gov.uk/def/ppi/standardPricePaidTransaction'), 'Standard Price Paid Transaction');
});
