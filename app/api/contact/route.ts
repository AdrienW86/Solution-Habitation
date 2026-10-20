import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { leadSchema } from '@/lib/lead-schema';
import { deliveryReady, resolveRoute, configuredOrigins } from '@/lib/lead-config';
import { verifyCaptcha, verifyLeadToken } from '@/lib/lead-security';
import {
  contactQuota,
  storeRead,
  storeWrite,
  releaseClaim,
  fingerprint,
} from '@/lib/contact-store';
import { abuseReason, clientAddress, logContactRejection } from '@/lib/contact-abuse';
import { getCommune, activeCommunes, normalizePlace } from '@/lib/geography';
import { findCompanies } from '@/lib/network';
import { deliverLead } from '@/lib/delivery';
import { readBoundedBody } from '@/lib/read-body';
export const runtime = 'nodejs';
const json = (data: unknown, status: number, retryAfter?: number) =>
  NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      ...(retryAfter ? { 'Retry-After': String(retryAfter) } : {}),
    },
  });
function reject(reason: string, error: string, status: number, retryAfter?: number) {
  logContactRejection(reason, status);
  return json({ error }, status, retryAfter);
}
type Receipt = {
  payloadHash: string;
  receivedAt: string;
  providerId?: string;
  smtpAttemptedAt?: string;
};

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || !configuredOrigins().includes(origin))
    return reject('origin', 'Origine de la demande refusée.', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return reject('content_type', 'Format de demande non accepté.', 415);
  if (Number(request.headers.get('content-length') ?? 0) > 20000)
    return reject('body_limit', 'Demande trop volumineuse.', 413);
  const ip = clientAddress(request.headers);
  try {
    const quota = await contactQuota(`ip:${ip}`, 5, 600);
    if (!quota.allowed)
      return reject(
        'ip_quota',
        'Trop de tentatives. Réessayez dans quelques minutes.',
        429,
        quota.retryAfter,
      );
  } catch {
    return reject(
      'protection_unavailable',
      'La transmission est temporairement indisponible. Conservez votre dossier et contactez directement une enseigne.',
      503,
    );
  }
  let raw: unknown;
  try {
    raw = JSON.parse(await readBoundedBody(request));
  } catch (error) {
    return error instanceof Error && error.message === 'too_large'
      ? reject('body_limit', 'Demande trop volumineuse.', 413)
      : reject('invalid_json', 'La demande n’a pas pu être lue.', 400);
  }
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    logContactRejection('validation', 422);
    return json(
      { error: 'Vérifiez les champs du formulaire.', fields: parsed.error.flatten().fieldErrors },
      422,
    );
  }
  const lead = parsed.data;
  const suspicious = abuseReason(lead);
  if (suspicious)
    return reject(
      suspicious,
      'Le contenu de la demande n’a pas pu être validé. Décrivez votre projet avec vos propres mots.',
      422,
    );
  if (lead.communeCode || ['66', '11', '34'].includes(lead.postalCode.slice(0, 2))) {
    const commune = lead.communeCode
      ? getCommune(lead.communeCode)
      : activeCommunes().find(
          (c) =>
            c.codesPostaux.includes(lead.postalCode) &&
            normalizePlace(c.nom) === normalizePlace(lead.city),
        );
    if (
      !commune ||
      !commune.codesPostaux.includes(lead.postalCode) ||
      normalizePlace(commune.nom) !== normalizePlace(lead.city) ||
      (lead.department && commune.codeDepartement !== lead.department)
    )
      return reject(
        'location_mismatch',
        'Sélectionnez à nouveau la commune et son code postal.',
        422,
      );
    lead.communeCode = commune.code;
    lead.department = commune.codeDepartement;
    if (
      lead.brand &&
      !findCompanies({
        expertise: lead.expertise,
        service: lead.service === 'autre' ? undefined : lead.service,
        departmentCode: commune.codeDepartement,
        communeCode: commune.code,
      }).some((c) => c.id === lead.brand)
    )
      return reject(
        'coverage_mismatch',
        'La couverture de cette entreprise n’est pas confirmée pour cette commune et cette prestation. Modifiez le choix de l’enseigne.',
        422,
      );
  }
  if (!deliveryReady())
    return reject(
      'delivery_unconfigured',
      'La transmission n’est pas disponible. Conservez votre dossier et contactez directement une enseigne.',
      503,
    );
  if (!verifyLeadToken(lead.token))
    return reject(
      'session',
      'Votre session a expiré ou la demande est trop rapide. Rechargez la page avant de réessayer.',
      403,
    );
  const route = resolveRoute(lead);
  if (!route)
    return reject(
      'recipient_missing',
      'Aucun destinataire vérifié pour cette combinaison. Contactez directement une enseigne ; votre demande n’a pas été transmise.',
      422,
    );
  const payloadHash = fingerprint(JSON.stringify({ ...lead, token: '', captcha: '', website: '' }));
  const receiptKey = `request:${lead.requestId}`;
  const lockKey = `pending:${lead.requestId}`;
  const contentKey = `content:${fingerprint(`${lead.email.toLowerCase()}|${normalizePlace(lead.city)}|${lead.message.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim()}`)}`;
  const owner = randomUUID();
  let locked = false;
  try {
    // Retain the original timestamp so provider retries have identical payloads.
    await storeWrite(
      receiptKey,
      JSON.stringify({ payloadHash, receivedAt: new Date().toISOString() } satisfies Receipt),
      86400,
      true,
    );
    const receipt = JSON.parse((await storeRead(receiptKey))!) as Receipt;
    if (receipt.payloadHash !== payloadHash)
      return reject(
        'reference_conflict',
        'Cette référence correspond à un autre dossier. Rechargez le formulaire pour créer une nouvelle demande.',
        409,
      );
    if (receipt.providerId) return json({ success: true, reference: lead.requestId }, 200);
    if (receipt.smtpAttemptedAt)
      return reject(
        'smtp_verification_required',
        'Un envoi SMTP a déjà été tenté pour cette référence. Contactez le destinataire avec votre référence avant toute nouvelle demande.',
        409,
      );
    locked = await storeWrite(lockKey, owner, 120, true);
    if (!locked)
      return reject(
        'pending',
        'Cette demande est déjà en cours de traitement. Patientez avant de réessayer.',
        409,
        10,
      );
    if (!(await verifyCaptcha(lead.captcha, new URL(origin).hostname, lead.requestId, ip)))
      return reject('captcha', 'La vérification anti-spam a échoué. Veuillez la relancer.', 403);
    const identityQuota = await contactQuota(`email:${lead.email.toLowerCase()}`, 3, 3600);
    if (!identityQuota.allowed)
      return reject(
        'identity_quota',
        'Plusieurs demandes ont déjà été présentées avec ces coordonnées. Contactez directement l’enseigne pour compléter votre projet.',
        429,
        identityQuota.retryAfter,
      );
    const contentClaimed = await storeWrite(contentKey, lead.requestId, 600, true);
    if (!contentClaimed && (await storeRead(contentKey)) !== lead.requestId)
      return reject(
        'duplicate_content',
        'Un dossier identique a déjà été présenté récemment. Vérifiez sa référence avant de renouveler votre demande.',
        409,
      );
    // SMTP cannot promise provider-side idempotency after an ambiguous network failure.
    // Retain the attempt and require human verification rather than blindly resending.
    if (process.env.LEAD_TRANSPORT === 'smtp') {
      receipt.smtpAttemptedAt = new Date().toISOString();
      await storeWrite(receiptKey, JSON.stringify(receipt), 86400);
    }
    const providerId = await deliverLead(lead, route.recipient, receipt.receivedAt);
    await storeWrite(receiptKey, JSON.stringify({ ...receipt, providerId }), 86400);
    console.info(
      JSON.stringify({
        event: 'lead_accepted',
        providerId,
        id: lead.requestId,
        expertise: lead.expertise,
        brand: lead.brand || null,
      }),
    );
    return json({ success: true, reference: lead.requestId }, 200);
  } catch {
    logContactRejection('delivery_or_store_failed', 502, lead.requestId);
    return json(
      {
        error:
          'La transmission n’a pas pu être confirmée. Votre saisie est conservée : téléchargez votre dossier et contactez l’enseigne avant de renouveler l’envoi.',
      },
      502,
    );
  } finally {
    if (locked) {
      try {
        await releaseClaim(lockKey, owner);
      } catch {
        logContactRejection('lock_release_failed', 503, lead.requestId);
      }
    }
  }
}
