import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANNING_RADIUS_KM, PLANNING_RADIUS_MILES, isWithinPlanningRadius } from '../server/planning-radius';

test('planning search radius is exactly 0.3 miles in kilometres', () => {
  assert.equal(PLANNING_RADIUS_MILES, 0.3);
  assert.ok(Math.abs(PLANNING_RADIUS_KM - 0.4828032) < 0.000001);
});

test('planning results outside 0.3 miles or without coordinates are excluded', () => {
  assert.equal(isWithinPlanningRadius(0), true);
  assert.equal(isWithinPlanningRadius(PLANNING_RADIUS_KM), true);
  assert.equal(isWithinPlanningRadius(PLANNING_RADIUS_KM + 0.00001), false);
  assert.equal(isWithinPlanningRadius(undefined), false);
});
