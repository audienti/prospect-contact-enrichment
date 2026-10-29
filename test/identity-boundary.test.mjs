import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileFields, activityFields } from '../skills/prospect-contact-enrichment/scripts/profile.mjs';

const now = '2026-10-28T12:00:00Z';
const person = { name: 'Jordan Lane', linkedin: 'https://www.linkedin.com/in/jordan-lane' };
const company = { name: 'Example Analytics' };
const profile = {
  firstName: 'Jordan', lastName: 'Lane', linkedinUrl: person.linkedin,
  currentPosition: [{ companyName: company.name, position: 'Revenue operations lead' }],
};

test('same path on another host cannot verify a LinkedIn person or overwrite a title', () => {
  for (const url of ['https://unrelated.example/in/jordan-lane', 'https://linkedin.com.unrelated.example/in/jordan-lane']) {
    const result = profileFields(person, company, { ...profile, linkedinUrl: url }, now);
    assert.equal(result.fields.linkedinProfileVerification.status, 'needs_review');
    assert.equal(result.title, undefined);
  }
});

test('missing names and missing employer cannot count as identity matches', () => {
  const result = profileFields({ name: '', linkedin: person.linkedin }, { name: '' }, {
    linkedinUrl: person.linkedin, currentPosition: [{ position: 'CEO' }],
  }, now);
  assert.equal(result.fields.linkedinProfileVerification.status, 'needs_review');
  assert.equal(result.title, undefined);
});

test('activity from an unrelated host with the same profile path is not attributed to the prospect', () => {
  const result = activityFields(person, [{
    author: { linkedinUrl: 'https://unrelated.example/in/jordan-lane' },
    linkedinUrl: 'https://www.linkedin.com/posts/unrelated-activity',
    content: 'We need a new vendor.', postedAt: { date: '2026-10-27T12:00:00Z' },
  }], now);
  assert.deepEqual(result.recentProfileActivity.items, []);
});

test('ordinary LinkedIn URL variants still resolve to the same supported identity', () => {
  for (const url of ['linkedin.com/in/jordan-lane/', 'https://uk.linkedin.com/in/jordan-lane?trk=public_profile', person.linkedin]) {
    assert.equal(profileFields(person, company, { ...profile, linkedinUrl: url }, now).title, 'Revenue operations lead');
  }
});
