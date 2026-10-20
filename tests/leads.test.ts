import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leadSchema, leadText } from '../lib/lead-schema';
import { resolveRoute, deliveryReady } from '../lib/lead-config';
import { createLeadToken, verifyLeadToken, allowAttempt } from '../lib/lead-security';
import { deliverLead } from '../lib/delivery';
const valid = {
  expertise: 'toiture',
  service: 'zinguerie',
  brand: 'couverture-catalane',
  postalCode: '66000',
  city: 'Perpignan',
  name: 'Test Projet',
  email: 'test@example.org',
  phone: '0662125611',
  message: 'Une demande de réparation de gouttières.',
  privacy: true,
  requestId: '62c1d8cd-4622-4ed1-b583-85ae459d38e5',
};
test('valid commercial request and rejection of incomplete, spam and conflicting brand data', () => {
  assert.ok(leadSchema.safeParse(valid).success);
  for (const change of [
    { privacy: false },
    { email: 'oops' },
    { message: 'court' },
    { website: 'spam' },
    { postalCode: '660' },
    { brand: 'express-nuisibles' },
    { service: 'cafards-blattes' },
  ])
    assert.equal(leadSchema.safeParse({ ...valid, ...change }).success, false);
});
test('rental requires dates, quantity, surface and context and never implies booking', () => {
  const rental = {
    ...valid,
    expertise: 'climatisation-mobile',
    service: 'besoin-temporaire',
    brand: '',
  };
  assert.equal(leadSchema.safeParse(rental).success, false);
  const value = leadSchema.parse({
    ...rental,
    startDate: '2099-07-01',
    endDate: '2099-07-07',
    quantity: '2',
    area: '40',
    context: 'Un bureau occupé en journée',
  });
  assert.match(leadText(value), /7 jour\(s\)/);
  assert.match(leadText(value), /ne confirme ni réservation/);
  assert.equal(leadSchema.safeParse({ ...value, endDate: '2099-06-01' }).success, false);
  assert.equal(leadSchema.safeParse({ ...value, startDate: '2099-02-31' }).success, false);
});
test('routing is bounded by verified brand, expertise and department', () => {
  const routes = [
    {
      expertise: 'toiture',
      brand: 'couverture-catalane',
      departments: ['66'],
      recipient: 'test@example.org',
      verified: true as const,
    },
  ];
  assert.ok(resolveRoute(valid, routes));
  assert.equal(resolveRoute({ ...valid, postalCode: '11000' }, routes), undefined);
  assert.equal(resolveRoute({ ...valid, brand: '' }, routes), undefined);
  assert.equal(deliveryReady(), false);
});
test('signed token prevents tampering, rapid and expired submissions', () => {
  process.env.LEAD_TOKEN_SECRET = 'a'.repeat(64);
  const now = Date.now();
  const token = createLeadToken(now);
  assert.equal(verifyLeadToken(token, now + 4000), true);
  assert.equal(verifyLeadToken(token, now + 1000), false);
  assert.equal(verifyLeadToken(token, now + 7200001), false);
  assert.equal(verifyLeadToken(token + 'x', now + 4000), false);
});
test('instance rate limiter blocks abusive repeat attempts', () => {
  for (let i = 0; i < 5; i++) assert.equal(allowAttempt('test-ip', 1000), true);
  assert.equal(allowAttempt('test-ip', 1000), false);
  assert.equal(allowAttempt('test-ip', 601001), true);
});
test('Resend transport only accepts actual provider receipts, propagates errors, and uses idempotency', async () => {
  const originalFetch = global.fetch;
  process.env.LEAD_TRANSPORT = 'resend';
  let header = '';
  try {
    global.fetch = async (_url, options) => {
      header = (options?.headers as Record<string, string>)['Idempotency-Key'];
      return new Response(JSON.stringify({ id: 'receipt-test' }), { status: 200 });
    };
    assert.equal(await deliverLead(leadSchema.parse(valid), 'test@example.org'), 'receipt-test');
    assert.equal(header, valid.requestId);
    global.fetch = async () => new Response('{}', { status: 500 });
    await assert.rejects(() => deliverLead(leadSchema.parse(valid), 'test@example.org'));
    global.fetch = async () => new Response('{}', { status: 200 });
    await assert.rejects(() => deliverLead(leadSchema.parse(valid), 'test@example.org'));
  } finally {
    global.fetch = originalFetch;
    delete process.env.LEAD_TRANSPORT;
  }
});
