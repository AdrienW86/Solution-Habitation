import { z } from './zod';
import { brands, expertises } from './content';
import { distributedProtectionReady } from './contact-store';
export const turnstileSiteKey = () =>
  process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
export const contactFrom = () => process.env.CONTACT_FROM_EMAIL || process.env.LEAD_FROM || '';
export function configuredOrigins() {
  return (process.env.FORM_ALLOWED_ORIGINS ?? 'https://solution-habitation.fr')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
const routeSchema = z.object({
  expertise: z.string(),
  brand: z.string().optional(),
  departments: z.array(z.string().regex(/^\d{2,3}$/)).min(1),
  recipient: z.email(),
  verified: z.literal(true),
});
export type LeadRoute = z.infer<typeof routeSchema>;
export function leadRoutes(): LeadRoute[] {
  try {
    const configured = z
      .array(routeSchema)
      .parse(JSON.parse(process.env.LEAD_ROUTES ?? '[]'))
      .filter(
        (r) =>
          expertises.some((e) => e.id === r.expertise) &&
          (!r.brand ||
            brands.some(
              (b) => b.slug === r.brand && b.expertises.some((id) => id === r.expertise),
            )),
      );
    // Explicit routes must never silently fall back to the central inbox after filtering.
    if (
      (process.env.LEAD_ROUTES && process.env.LEAD_ROUTES.trim() !== '[]') ||
      !process.env.CONTACT_TO_EMAIL
    )
      return configured;
    const recipient = z.email().safeParse(process.env.CONTACT_TO_EMAIL);
    if (!recipient.success) return [];
    // A central inbox receives the context; it is never advertised as an intervening company.
    return expertises.flatMap((e) => [
      {
        expertise: e.id,
        departments: ['66', '11', '34'],
        recipient: recipient.data,
        verified: true as const,
      },
      ...brands
        .filter((b) => b.expertises.includes(e.id))
        .map((b) => ({
          expertise: e.id,
          brand: b.slug,
          departments: ['66', '11', '34'],
          recipient: recipient.data,
          verified: true as const,
        })),
    ]);
  } catch {
    return [];
  }
}
export function resolveRoute(
  lead: { expertise: string; brand: string; postalCode: string },
  routes = leadRoutes(),
) {
  const department = lead.postalCode.startsWith('97')
    ? lead.postalCode.slice(0, 3)
    : lead.postalCode.slice(0, 2);
  const matches = routes.filter(
    (r) => r.expertise === lead.expertise && r.departments.includes(department),
  );
  return lead.brand ? matches.find((r) => r.brand === lead.brand) : matches.find((r) => !r.brand);
}
export function deliveryReady() {
  return (
    process.env.LEAD_DELIVERY_VERIFIED === 'true' &&
    z.email().safeParse(contactFrom()).success &&
    (!process.env.CONTACT_REPLY_TO_EMAIL ||
      z.email().safeParse(process.env.CONTACT_REPLY_TO_EMAIL).success) &&
    !!process.env.LEAD_TOKEN_SECRET &&
    process.env.LEAD_TOKEN_SECRET.length >= 32 &&
    !!process.env.TURNSTILE_SECRET_KEY &&
    !!turnstileSiteKey() &&
    (process.env.NODE_ENV !== 'production' || distributedProtectionReady()) &&
    !!process.env.PRIVACY_CONTROLLER_NAME &&
    z.email().safeParse(process.env.PRIVACY_CONTACT_EMAIL).success &&
    /^\d+$/.test(process.env.PRIVACY_RETENTION_MONTHS ?? '') &&
    Number(process.env.PRIVACY_RETENTION_MONTHS) > 0 &&
    leadRoutes().length > 0 &&
    ((process.env.LEAD_TRANSPORT === 'resend' && !!process.env.RESEND_API_KEY) ||
      (process.env.LEAD_TRANSPORT === 'smtp' &&
        !!process.env.SMTP_HOST &&
        !!process.env.SMTP_USER &&
        !!process.env.SMTP_PASSWORD))
  );
}
