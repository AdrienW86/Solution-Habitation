import { isIP } from 'node:net';
import type { Lead } from './lead-schema';

export function clientAddress(headers: Headers) {
  const header = process.env.FORM_TRUSTED_IP_HEADER ?? 'x-real-ip';
  if (!['x-real-ip', 'cf-connecting-ip', 'x-forwarded-for'].includes(header)) return 'unknown';
  const value = headers.get(header)?.split(',')[0].trim() ?? '';
  return isIP(value) ? value : 'unknown';
}

export function abuseReason(lead: Lead) {
  const message = lead.message
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  if (message.length < 20 || !/[\p{L}]/u.test(message)) return 'empty_message';
  if (/(.)\1{19,}/u.test(message)) return 'repeated_characters';
  if ((message.match(/https?:\/\//gi) ?? []).length > 3) return 'link_flood';
  if (/<\s*(script|iframe|object|embed)\b/i.test(message)) return 'active_markup';
  const words = message.toLocaleLowerCase('fr').match(/[\p{L}\p{N}]+/gu) ?? [];
  if (words.length > 12 && new Set(words).size < 3) return 'repeated_words';
  const lines = message
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length >= 4 && new Set(lines).size === 1) return 'repeated_lines';
  if (/^[\s\p{Cf}\p{Z}]*$/u.test(lead.name)) return 'empty_identity';
  return undefined;
}

export function logContactRejection(reason: string, status: number, reference?: string) {
  console.warn(
    JSON.stringify({ event: 'lead_rejected', reason, status, ...(reference ? { reference } : {}) }),
  );
}
