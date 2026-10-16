import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_CATEGORIES, validateContactSubmission } from '../server/contact.ts';

const validSubmission = {
  name: 'Test Customer',
  email: 'customer@example.test',
  category: 'Report support',
  title: 'Report did not finish',
  description: 'The report stopped while collecting planning information.',
  reference: 'HP-123',
  website: '',
};

test('contact form accepts the supported enquiry fields', () => {
  const result = validateContactSubmission(validSubmission);
  assert.equal(result.success, true);
  assert.ok(CONTACT_CATEGORIES.some(category => category === validSubmission.category));
});

test('contact form rejects invalid email, category and short descriptions', () => {
  assert.equal(validateContactSubmission({ ...validSubmission, email: 'not-an-email' }).success, false);
  assert.equal(validateContactSubmission({ ...validSubmission, category: 'Unexpected category' }).success, false);
  assert.equal(validateContactSubmission({ ...validSubmission, description: 'Too short' }).success, false);
});

test('contact honeypot input is accepted for silent spam handling', () => {
  const result = validateContactSubmission({ ...validSubmission, website: 'https://spam.example' });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.website, 'https://spam.example');
});
