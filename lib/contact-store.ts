import { createHmac } from 'node:crypto';

// Stores only opaque fingerprints, short-lived counters and provider receipts.
// No names, messages, addresses or raw IPs are persisted here.
const memory = new Map<string, { value: string; until: number }>();
export const distributedProtectionReady = () =>
  !!process.env.ANTISPAM_REDIS_REST_URL && !!process.env.ANTISPAM_REDIS_REST_TOKEN;

export function fingerprint(value: string) {
  return createHmac('sha256', process.env.LEAD_TOKEN_SECRET ?? 'offline-only')
    .update(value)
    .digest('hex');
}

async function redis(command: (string | number)[]) {
  const url = process.env.ANTISPAM_REDIS_REST_URL!;
  if (new URL(url).protocol !== 'https:') throw new Error('antispam_https_required');
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${process.env.ANTISPAM_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('antispam_store_unavailable');
  const result = await response.json();
  if (result.error || !Object.hasOwn(result, 'result')) throw new Error('antispam_store_invalid');
  return result.result as unknown;
}

function local(key: string) {
  for (const [k, v] of memory) if (v.until <= Date.now()) memory.delete(k);
  return memory.get(key)?.value ?? null;
}
function redisEnabled() {
  if (distributedProtectionReady()) return true;
  if (process.env.NODE_ENV === 'production') throw new Error('distributed_antispam_required');
  return false;
}
export async function storeRead(key: string) {
  const value = redisEnabled() ? await redis(['GET', `sh:contact:${key}`]) : local(key);
  if (value !== null && typeof value !== 'string') throw new Error('antispam_store_invalid');
  return value as string | null;
}
export async function storeWrite(key: string, value: string, ttl: number, onlyIfAbsent = false) {
  if (redisEnabled()) {
    const result = await redis([
      'SET',
      `sh:contact:${key}`,
      value,
      'EX',
      ttl,
      ...(onlyIfAbsent ? ['NX'] : []),
    ]);
    if (result !== null && result !== 'OK') throw new Error('antispam_store_invalid');
    return result === 'OK';
  }
  if (onlyIfAbsent && local(key) !== null) return false;
  if (memory.size >= 10000 && !memory.has(key)) throw new Error('antispam_capacity');
  memory.set(key, { value, until: Date.now() + ttl * 1000 });
  return true;
}
export async function releaseClaim(key: string, owner: string) {
  if (redisEnabled()) {
    await redis([
      'EVAL',
      "if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end",
      1,
      `sh:contact:${key}`,
      owner,
    ]);
  } else if (local(key) === owner) memory.delete(key);
}
export async function contactQuota(identity: string, limit: number, seconds: number) {
  const key = `quota:${fingerprint(identity)}`;
  if (redisEnabled()) {
    const result = await redis([
      'EVAL',
      "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return {n,redis.call('TTL',KEYS[1])}",
      1,
      `sh:contact:${key}`,
      seconds,
    ]);
    if (!Array.isArray(result) || result.length !== 2 || !result.every(Number.isFinite))
      throw new Error('antispam_store_invalid');
    return { allowed: Number(result[0]) <= limit, retryAfter: Math.max(1, Number(result[1])) };
  }
  const count = Number(local(key) ?? '0') + 1;
  const until = memory.get(key)?.until ?? Date.now() + seconds * 1000;
  if (memory.size >= 10000 && !memory.has(key)) throw new Error('antispam_capacity');
  memory.set(key, { value: String(count), until });
  return {
    allowed: count <= limit,
    retryAfter: Math.max(1, Math.ceil((until - Date.now()) / 1000)),
  };
}
