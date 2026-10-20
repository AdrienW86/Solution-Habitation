import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../app/api/contact/route';
import { createLeadToken } from '../lib/lead-security';
import { randomUUID } from 'node:crypto';
const data = {
  expertise: 'toiture',
  service: 'zinguerie',
  brand: 'couverture-catalane',
  postalCode: '66000',
  city: 'Perpignan',
  name: 'Test Backend',
  email: 'test@example.org',
  phone: '0662125611',
  message: 'Une demande de réparation de gouttières.',
  privacy: true,
  captcha: 'test-only-token',
};
test('full API pipeline validates origin, routing, captcha, transport receipt and retained request reference', async () => {
  const oldEnv = { ...process.env };
  const oldFetch = global.fetch;
  Object.assign(process.env, {
    LEAD_DELIVERY_VERIFIED: 'true',
    LEAD_TRANSPORT: 'resend',
    LEAD_FROM: 'test@example.org',
    LEAD_TOKEN_SECRET: 's'.repeat(64),
    TURNSTILE_SECRET_KEY: 'test',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test',
    PRIVACY_CONTROLLER_NAME: 'Test',
    PRIVACY_CONTACT_EMAIL: 'privacy@example.org',
    PRIVACY_RETENTION_MONTHS: '12',
    RESEND_API_KEY: 'test',
    LEAD_ROUTES: JSON.stringify([
      {
        expertise: 'toiture',
        brand: 'couverture-catalane',
        departments: ['66'],
        recipient: 'test@example.org',
        verified: true,
      },
    ]),
  });
  const token = createLeadToken(Date.now() - 5000);
  let mode = 'success';
  global.fetch = async (input) =>
    String(input).includes('turnstile')
      ? new Response(
          JSON.stringify({
            success: mode !== 'captcha-fail',
            hostname: 'solution-habitation.fr',
            action: 'lead',
          }),
          { status: 200 },
        )
      : new Response(mode === 'success' ? JSON.stringify({ id: 'provider-receipt' }) : '{}', {
          status: mode === 'success' ? 200 : 500,
        });
  let attempt = 0;
  const send = (patch: Record<string, unknown> = {}) =>
    POST(
      new Request('https://solution-habitation.fr/api/contact', {
        method: 'POST',
        headers: {
          origin: 'https://solution-habitation.fr',
          'content-type': 'application/json',
          'x-real-ip': `198.51.100.${++attempt}`,
        },
        body: JSON.stringify({ ...data, token, requestId: randomUUID(), ...patch }),
      }),
    );
  try {
    const success = await send();
    assert.equal(success.status, 200);
    const receipt = await success.json();
    assert.equal(receipt.success, true);
    assert.ok(receipt.reference);
    assert.equal((await send({ postalCode: '11000' })).status, 422);
    mode = 'captcha-fail';
    assert.equal((await send()).status, 403);
    mode = 'delivery-fail';
    const failure = await send({
      message: 'Une autre demande concernant une gouttière différente.',
    });
    assert.equal(failure.status, 502);
    assert.equal((await failure.json()).success, undefined);
  } finally {
    global.fetch = oldFetch;
    for (const key of Object.keys(process.env)) if (!(key in oldEnv)) delete process.env[key];
    Object.assign(process.env, oldEnv);
  }
});
