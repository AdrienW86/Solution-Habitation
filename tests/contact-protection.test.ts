import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { POST } from '../app/api/contact/route';
import { createLeadToken, verifyCaptcha } from '../lib/lead-security';
import { leadSchema } from '../lib/lead-schema';
import { leadEmail } from '../lib/lead-email';
import { abuseReason, clientAddress } from '../lib/contact-abuse';
import { contactQuota, storeRead, storeWrite, releaseClaim } from '../lib/contact-store';
import { deliveryReady, leadRoutes } from '../lib/lead-config';

const base = {
  expertise: 'toiture',
  service: 'zinguerie',
  brand: 'couverture-catalane',
  postalCode: '66000',
  department: '66',
  communeCode: '66136',
  city: 'Perpignan',
  name: 'Test Protection',
  email: 'protection@example.org',
  phone: '0662125611',
  message: 'La gouttière de ma maison déborde après la pluie.',
  privacy: true,
  source: '/territoires/66/perpignan/zinguerie',
  navigation: ['/expertises/toiture', '/territoires/66/perpignan'],
  captcha: 'token-mocked-only-in-test',
  requestId: randomUUID(),
};
const restore = (before: NodeJS.ProcessEnv) => {
  for (const key of Object.keys(process.env)) if (!(key in before)) delete process.env[key];
  Object.assign(process.env, before);
};

test('suspicious messages, invisible identities and forged context are rejected', () => {
  const lead = leadSchema.parse(base);
  assert.equal(abuseReason(lead), undefined);
  for (const message of [
    '\u200B'.repeat(30),
    'a'.repeat(30),
    'rat '.repeat(20),
    'Une ligne identique\n'.repeat(4),
    '<script>alerte dangereuse</script>',
    'https://a.fr '.repeat(4),
  ]) {
    assert.ok(abuseReason({ ...lead, message }), message);
  }
  assert.equal(abuseReason({ ...lead, name: '\u200B\u200B' }), 'empty_identity');
  for (const patch of [
    { website: 'robot.example' },
    { department: '11' },
    { source: '//externe.test' },
    { navigation: ['https://externe.test'] },
    { captcha: 'x'.repeat(2049) },
  ])
    assert.equal(leadSchema.safeParse({ ...base, ...patch }).success, false);
});

test('HTML and text emails carry commercial context, safe escaped values and a stable timestamp', () => {
  const lead = leadSchema.parse({
    ...base,
    name: '<img src=x>',
    message: 'Mon besoin : <strong>gouttière</strong> et une visite de contrôle.',
  });
  const email = leadEmail(lead, '2026-10-20T12:00:00.000Z');
  for (const value of [
    lead.name,
    lead.message,
    lead.source,
    lead.communeCode,
    '2026-10-20T12:00:00.000Z',
  ])
    assert.ok(email.text.includes(value));
  assert.ok(email.html.includes('&lt;img src=x&gt;'));
  assert.ok(!email.html.includes('<img src=x>'));
  assert.ok(email.html.includes('Europe/Paris'));
  assert.ok(!email.text.includes(lead.captcha));
});

test('production shared store is fail-closed, atomic, bounded by TTL and owner-aware', async () => {
  const before = { ...process.env },
    originalFetch = global.fetch;
  const commands: unknown[][] = [];
  const db = new Map<string, string>();
  Object.assign(process.env, {
    NODE_ENV: 'production',
    ANTISPAM_REDIS_REST_URL: 'https://redis.test',
    ANTISPAM_REDIS_REST_TOKEN: 'test-only',
  });
  global.fetch = async (_input, init) => {
    const command = JSON.parse(String(init?.body));
    commands.push(command);
    assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer test-only');
    let result: unknown = null;
    if (command[0] === 'SET') {
      if (!command.includes('NX') || !db.has(command[1])) {
        db.set(command[1], command[2]);
        result = 'OK';
      }
    } else if (command[0] === 'GET') result = db.get(command[1]) ?? null;
    else if (String(command[1]).includes('INCR')) {
      const count = Number(db.get(command[3]) ?? 0) + 1;
      db.set(command[3], String(count));
      result = [count, 600];
    } else {
      result = db.get(command[3]) === command[4] ? Number(db.delete(command[3])) : 0;
    }
    return Response.json({ result });
  };
  try {
    assert.equal(await storeWrite('lock-test', 'owner', 120, true), true);
    assert.equal(await storeWrite('lock-test', 'another', 120, true), false);
    await releaseClaim('lock-test', 'another');
    assert.equal(await storeRead('lock-test'), 'owner');
    await releaseClaim('lock-test', 'owner');
    assert.equal(await storeRead('lock-test'), null);
    for (let n = 0; n < 5; n++)
      assert.equal((await contactQuota('test-quota', 5, 600)).allowed, true);
    assert.equal((await contactQuota('test-quota', 5, 600)).allowed, false);
    assert.ok(
      commands.some(
        (c) => c[0] === 'SET' && c.includes('EX') && c.includes(120) && c.includes('NX'),
      ),
    );
    global.fetch = async () => Response.json({ result: 'invalid-counter' });
    await assert.rejects(contactQuota('broken', 5, 600), /invalid/);
    global.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(storeRead('outage'), /unavailable/);
    delete process.env.ANTISPAM_REDIS_REST_TOKEN;
    assert.equal(deliveryReady(), false);
    await assert.rejects(storeRead('missing-config'), /distributed_antispam_required/);
  } finally {
    restore(before);
    global.fetch = originalFetch;
  }
});

test('API prevents concurrent delivery, conflicting references, repeat content and false success', async () => {
  const before = { ...process.env },
    originalFetch = global.fetch;
  Object.assign(process.env, {
    NODE_ENV: 'test',
    LEAD_DELIVERY_VERIFIED: 'true',
    LEAD_TRANSPORT: 'resend',
    CONTACT_FROM_EMAIL: 'contact@example.org',
    CONTACT_TO_EMAIL: 'reception@example.org',
    LEAD_ROUTES: '[]',
    LEAD_TOKEN_SECRET: 'a-test-only-secret-'.repeat(4),
    TURNSTILE_SITE_KEY: 'test',
    TURNSTILE_SECRET_KEY: 'test',
    RESEND_API_KEY: 'test',
    PRIVACY_CONTROLLER_NAME: 'Test',
    PRIVACY_CONTACT_EMAIL: 'privacy@example.org',
    PRIVACY_RETENTION_MONTHS: '12',
    FORM_ALLOWED_ORIGINS: 'https://solution-habitation.fr',
    FORM_TRUSTED_IP_HEADER: 'x-real-ip',
  });
  delete process.env.ANTISPAM_REDIS_REST_URL;
  delete process.env.ANTISPAM_REDIS_REST_TOKEN;
  const token = createLeadToken(Date.now() - 5000);
  let requests = 0,
    mode = 'success',
    counter = 0;
  let release: (() => void) | undefined;
  const providerBodies: string[] = [];
  global.fetch = async (input, init) => {
    if (String(input).includes('turnstile'))
      return Response.json({ success: true, action: 'lead', hostname: 'solution-habitation.fr' });
    requests++;
    providerBodies.push(String(init?.body));
    if (mode === 'pending')
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    if (mode === 'fail') return new Response('{}', { status: 500 });
    if (mode === 'no-receipt') return Response.json({});
    return Response.json({ id: 'real-mocked-provider-receipt' });
  };
  const send = (patch: Record<string, unknown> = {}, ip?: string) =>
    POST(
      new Request('https://solution-habitation.fr/api/contact', {
        method: 'POST',
        headers: {
          origin: 'https://solution-habitation.fr',
          'content-type': 'application/json',
          'x-real-ip': ip ?? `203.0.113.${++counter}`,
        },
        body: JSON.stringify({ ...base, token, ...patch }),
      }),
    );
  try {
    assert.ok(deliveryReady());
    assert.ok(
      leadRoutes().some(
        (r) => r.recipient === 'reception@example.org' && r.brand === 'couverture-catalane',
      ),
    );
    mode = 'pending';
    const first = send();
    for (let n = 0; n < 100 && !release; n++)
      await new Promise((resolve) => setTimeout(resolve, 1));
    assert.ok(release);
    assert.equal((await send()).status, 409);
    release();
    assert.equal((await first).status, 200);
    assert.equal((await send()).status, 200);
    assert.equal(requests, 1, 'successful retry must not send again');
    assert.equal(
      (await send({ message: 'Un dossier différent avec la même référence de demande.' })).status,
      409,
    );
    assert.equal(
      (await send({ requestId: randomUUID() })).status,
      409,
      'repeat content under a new reference',
    );
    assert.equal((await send({ requestId: randomUUID(), communeCode: '11262' })).status, 422);
    assert.equal(
      (await send({ requestId: randomUUID(), brand: 'toiture66' })).status,
      422,
      'an offering not declared for this company remains rejected despite full territorial coverage',
    );
    assert.equal(
      (await send({ requestId: randomUUID(), communeCode: '', brand: 'toiture66' })).status,
      422,
      'manual city entry cannot bypass exact coverage',
    );
    const retryId = randomUUID();
    const retry = {
      requestId: retryId,
      email: 'retry@example.org',
      message: 'Une deuxième gouttière nécessite une vérification distincte.',
    };
    mode = 'fail';
    assert.equal((await send(retry)).status, 502);
    mode = 'success';
    assert.equal((await send(retry)).status, 200);
    assert.equal(
      providerBodies.at(-1),
      providerBodies.at(-2),
      'provider idempotency requires byte-identical retry payload',
    );
    mode = 'no-receipt';
    const failed = await send({
      requestId: randomUUID(),
      email: 'emptyreceipt@example.org',
      message: 'La descente de gouttière est détachée de la façade.',
    });
    assert.equal(failed.status, 502);
    assert.equal((await failed.json()).success, undefined);
    process.env.LEAD_TRANSPORT = 'smtp';
    Object.assign(process.env, {
      SMTP_HOST: 'smtp.test',
      SMTP_USER: 'test',
      SMTP_PASSWORD: 'test',
    });
    let smtpAttempts = 0;
    const { default: smtpModule } = await import('nodemailer');
    const smtp = mock.method(smtpModule, 'createTransport', () => ({
      sendMail: async () => {
        smtpAttempts++;
        throw new Error('ambiguous network failure');
      },
      close() {},
    }));
    const smtpLead = {
      requestId: randomUUID(),
      email: 'smtp@example.org',
      message: 'Une visite de contrôle des raccords de gouttière est demandée.',
    };
    try {
      assert.equal((await send(smtpLead)).status, 502);
      assert.equal((await send(smtpLead)).status, 409);
      assert.equal(smtpAttempts, 1, 'ambiguous SMTP acceptance must not be blindly retried');
    } finally {
      smtp.mock.restore();
    }
    for (let n = 0; n < 5; n++) await send({ name: '' }, '192.0.2.99');
    const limited = await send({}, '192.0.2.99');
    assert.equal(limited.status, 429);
    assert.ok(limited.headers.get('retry-after'));
    process.env.LEAD_DELIVERY_VERIFIED = 'false';
    const disabled = await send({ requestId: randomUUID() });
    assert.equal(disabled.status, 503);
    assert.equal((await disabled.json()).success, undefined);
    process.env.LEAD_ROUTES = JSON.stringify([
      { expertise: 'unknown', departments: ['66'], recipient: 'other@example.org', verified: true },
    ]);
    assert.deepEqual(
      leadRoutes(),
      [],
      'invalid explicit routing must never silently use the central inbox',
    );
  } finally {
    release?.();
    restore(before);
    global.fetch = originalFetch;
  }
});

test('Turnstile validates hostname/action and the trusted address header is explicit', async () => {
  const before = { ...process.env },
    originalFetch = global.fetch;
  try {
    process.env.FORM_TRUSTED_IP_HEADER = 'cf-connecting-ip';
    assert.equal(
      clientAddress(
        new Headers({ 'x-real-ip': '198.51.100.2', 'cf-connecting-ip': '2001:db8::1' }),
      ),
      '2001:db8::1',
    );
    assert.equal(clientAddress(new Headers({ 'cf-connecting-ip': 'forged-value' })), 'unknown');
    for (const result of [
      { success: true, hostname: 'other.test', action: 'lead' },
      { success: true, hostname: 'solution-habitation.fr', action: 'other' },
      { success: false, hostname: 'solution-habitation.fr', action: 'lead' },
    ]) {
      global.fetch = async () => Response.json(result);
      assert.equal(await verifyCaptcha('token', 'solution-habitation.fr'), false);
    }
    global.fetch = async () => {
      throw new Error('timeout');
    };
    assert.equal(await verifyCaptcha('token', 'solution-habitation.fr'), false);
  } finally {
    restore(before);
    global.fetch = originalFetch;
  }
});
