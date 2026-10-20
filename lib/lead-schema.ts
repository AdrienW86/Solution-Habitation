import { z } from './zod';
import { expertises, brands } from './content';
const clean = z.string().trim();
const ids = expertises.map((e) => e.id);
export const leadSchema = z
  .object({
    expertise: clean.refine((v) => ids.some((id) => id === v), 'Choisissez une expertise.'),
    service: clean.min(1, 'Précisez la prestation.').max(100),
    brand: clean.max(100).default(''),
    postalCode: clean.regex(/^\d{5}$/, 'Indiquez un code postal français de cinq chiffres.'),
    city: clean.min(2, 'Indiquez la commune.').max(100),
    name: clean.min(2, 'Indiquez votre nom.').max(120),
    email: z.email('Indiquez une adresse e-mail valide.').max(254),
    phone: clean.regex(
      /^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/,
      'Indiquez un numéro français valide.',
    ),
    message: clean
      .min(20, 'Décrivez votre besoin en au moins 20 caractères.')
      .max(5000, 'Limitez la description à 5 000 caractères.'),
    startDate: clean.default(''),
    endDate: clean.default(''),
    quantity: clean.default(''),
    area: clean.default(''),
    context: clean.max(500).default(''),
    privacy: z.literal(true, {
      error: 'Veuillez lire et accepter les informations sur le traitement de votre demande.',
    }),
    website: clean.max(0, 'Demande invalide.').default(''),
    source: clean.max(500).default('/contact'),
    department: clean.regex(/^(66|11|34)?$/).default(''),
    communeCode: clean.regex(/^(\d{5})?$/).default(''),
    requestType: z.enum(['devis', 'location', 'renseignement']).default('devis'),
    navigation: z
      .array(clean.max(500).refine((v) => /^\/(?!\/)/.test(v), 'Chemin de navigation invalide.'))
      .max(4)
      .default([]),
    requestId: z.uuid(),
    token: clean.max(500).default(''),
    captcha: clean.max(2048).default(''),
  })
  .superRefine((v, ctx) => {
    if (!/^\/(?!\/)/.test(v.source))
      ctx.addIssue({
        code: 'custom',
        path: ['source'],
        message: 'La page source doit appartenir au site.',
      });
    if (v.department && !v.postalCode.startsWith(v.department))
      ctx.addIssue({
        code: 'custom',
        path: ['department'],
        message: 'Le département et le code postal ne correspondent pas.',
      });
    const e = expertises.find((e) => e.id === v.expertise);
    if (e && !e.services.some((s) => s.slug === v.service) && v.service !== 'autre')
      ctx.addIssue({
        code: 'custom',
        path: ['service'],
        message: 'Choisissez une prestation de cette expertise.',
      });
    if (
      v.brand &&
      !brands.some((b) => b.slug === v.brand && b.expertises.some((id) => id === v.expertise))
    )
      ctx.addIssue({
        code: 'custom',
        path: ['brand'],
        message: 'Cette enseigne ne correspond pas à l’expertise.',
      });
    if (v.expertise === 'climatisation-mobile') {
      const validDate = (d: string) =>
        /^\d{4}-\d{2}-\d{2}$/.test(d) &&
        !Number.isNaN(Date.parse(d)) &&
        new Date(d).toISOString().slice(0, 10) === d;
      if (!validDate(v.startDate))
        ctx.addIssue({
          code: 'custom',
          path: ['startDate'],
          message: 'Indiquez la date de début.',
        });
      if (!validDate(v.endDate) || v.endDate < v.startDate)
        ctx.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: 'La date de fin doit suivre ou correspondre au début.',
        });
      if (
        validDate(v.startDate) &&
        v.startDate <
          new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date())
      )
        ctx.addIssue({
          code: 'custom',
          path: ['startDate'],
          message: 'Choisissez une date à venir.',
        });
      if (!/^\d+$/.test(v.quantity) || Number(v.quantity) < 1 || Number(v.quantity) > 100)
        ctx.addIssue({
          code: 'custom',
          path: ['quantity'],
          message: 'Indiquez une quantité entre 1 et 100.',
        });
      if (!/^\d+(\.\d+)?$/.test(v.area) || Number(v.area) <= 0 || Number(v.area) > 100000)
        ctx.addIssue({
          code: 'custom',
          path: ['area'],
          message: 'Indiquez une surface positive en m².',
        });
      if (v.context.length < 5)
        ctx.addIssue({
          code: 'custom',
          path: ['context'],
          message: 'Décrivez le contexte d’utilisation.',
        });
    }
  });
export type Lead = z.infer<typeof leadSchema>;
export function leadText(lead: Lead, receivedAt?: string) {
  const e = expertises.find((e) => e.id === lead.expertise)!;
  return [
    'SOLUTION HABITATION — DOSSIER PROJET',
    `Référence : ${lead.requestId}`,
    ...(receivedAt
      ? [
          `Reçue le : ${new Date(receivedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} (Europe/Paris)`,
          `Horodatage UTC : ${receivedAt}`,
        ]
      : []),
    `Type de demande : ${lead.requestType}`,
    `Expertise : ${e.name}`,
    `Prestation : ${e.services.find((s) => s.slug === lead.service)?.name ?? 'Autre besoin'}`,
    `Enseigne souhaitée : ${brands.find((b) => b.slug === lead.brand)?.name ?? 'Orientation selon le besoin'}`,
    `Lieu : ${lead.postalCode} ${lead.city}`,
    `Département : ${lead.department || lead.postalCode.slice(0, 2)}`,
    ...(lead.communeCode ? [`Code INSEE : ${lead.communeCode}`] : []),
    ...(lead.expertise === 'climatisation-mobile'
      ? [
          `Dates : ${lead.startDate} → ${lead.endDate}`,
          `Durée : ${Math.round((Date.parse(lead.endDate) - Date.parse(lead.startDate)) / 86400000) + 1} jour(s) calendaires`,
          `Quantité souhaitée : ${lead.quantity}`,
          `Surface : ${lead.area} m²`,
          `Contexte : ${lead.context}`,
        ]
      : []),
    '',
    lead.message,
    '',
    `Nom : ${lead.name}`,
    `E-mail : ${lead.email}`,
    `Téléphone : ${lead.phone}`,
    `Provenance : ${lead.source}`,
    ...(lead.navigation.length ? [`Parcours : ${lead.navigation.join(' → ')}`] : []),
    '',
    'Ce dossier ne confirme ni réservation, ni disponibilité, ni devis.',
  ].join('\n');
}
