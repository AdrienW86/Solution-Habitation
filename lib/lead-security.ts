import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export function createLeadToken(now = Date.now()) {
  const secret = process.env.LEAD_TOKEN_SECRET;
  if (!secret) return '';
  const payload = `${now}.${randomBytes(16).toString('hex')}`;
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('hex')}`;
}
export function verifyLeadToken(token: string, now = Date.now()) {
  const secret = process.env.LEAD_TOKEN_SECRET;
  if (!secret) return false;
  const [ts, nonce, signature, ...rest] = token.split('.');
  if (
    rest.length ||
    !/^\d{13}$/.test(ts ?? '') ||
    !/^\w{32}$/.test(nonce ?? '') ||
    !/^[a-f0-9]{64}$/.test(signature ?? '')
  )
    return false;
  const age = now - Number(ts);
  if (age < 3000 || age > 7200000) return false;
  const expected = createHmac('sha256', secret).update(`${ts}.${nonce}`).digest();
  return timingSafeEqual(Buffer.from(signature, 'hex'), expected);
}
const attempts = new Map<string, { count: number; until: number }>();
export function allowAttempt(ip: string, now = Date.now()) {
  for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  const key = createHmac('sha256', process.env.LEAD_TOKEN_SECRET ?? 'local')
    .update(ip)
    .digest('hex');
  const record = attempts.get(key);
  if (record && record.until >= now) {
    record.count++;
    return record.count <= 5;
  }
  if (attempts.size >= 10000) return false;
  attempts.set(key, { count: 1, until: now + 600000 });
  return true;
}
export async function verifyCaptcha(
  token: string,
  hostname: string,
  requestId?: string,
  ip?: string,
) {
  if (!token || token.length > 2048) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY ?? '',
        response: token,
        ...(requestId ? { idempotency_key: requestId } : {}),
        ...(ip && ip !== 'unknown' ? { remoteip: ip } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    const result = await response.json();
    return (
      response.ok &&
      result.success === true &&
      result.hostname === hostname &&
      result.action === 'lead'
    );
  } catch {
    return false;
  }
}
