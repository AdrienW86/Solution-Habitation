import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from './zod';
import { activeCommunes, getCommune } from './geography';
import { activeDepartments, findCompanies, network } from './network';
import type { Network } from './network-schema';

export const localFamilies = [
  {
    id: 'couverture',
    name: 'Couverture et toiture',
    expertise: 'toiture',
    service: undefined,
    guideIds: ['preparer-diagnostic-toiture', 'comparer-devis-couverture'],
  },
  {
    id: 'deratisation',
    name: 'Dératisation',
    expertise: 'nuisibles',
    service: 'deratisation',
    guideIds: ['rongeurs-indices', 'rongeurs-acces-prevention'],
  },
  {
    id: 'nettoyage',
    name: 'Nettoyage',
    expertise: 'nettoyage',
    service: undefined,
    guideIds: ['nettoyage-bureaux-frequences', 'nettoyage-residentiel-perimetre'],
  },
] as const;
const source = z
  .object({
    url: z.url().refine((u) => new URL(u).protocol === 'https:'),
    label: z.string().min(5),
    checkedAt: z.iso.date(),
    supports: z.string().min(20),
  })
  .strict();
export const localDocumentSchema = z
  .object({
    communeCode: z.string().regex(/^\d{5}$/),
    departmentCode: z.string().regex(/^\d{2}$/),
    family: z.enum(['couverture', 'deratisation', 'nettoyage']),
    title: z.string().min(25).max(95),
    h1: z.string().min(20).max(120),
    description: z.string().max(180),
    intro: z.string(),
    intent: z.string().min(30),
    specificValue: z.string().min(80),
    sections: z
      .array(
        z.object({ heading: z.string().min(1), paragraphs: z.array(z.string().min(1)) }).strict(),
      )
      .min(0),
    faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) }).strict()),
    sources: z.array(source),
    guides: z.array(z.string()).max(4),
    image: z
      .object({
        src: z.string().startsWith('/images/'),
        alt: z.string().min(15),
        kind: z.enum(['authorized-photo', 'illustration']),
      })
      .strict()
      .nullable(),
    revisedAt: z.iso.date(),
    batch: z.string().min(3),
    status: z.enum(['draft', 'review', 'validated', 'published']),
    humanReview: z
      .object({
        reviewer: z.string().min(2),
        date: z.iso.date(),
        approved: z.literal(true),
        localFactsChecked: z.literal(true),
        utilityChecked: z.literal(true),
      })
      .strict()
      .nullable(),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.status !== 'draft') {
      for (const [valid, path, message] of [
        [p.description.length >= 100, 'description', 'Description à compléter.'],
        [p.intro.length >= 180, 'intro', 'Introduction à compléter.'],
        [
          p.sections.length >= 4 &&
            p.sections.every(
              (s) =>
                s.heading.length >= 8 &&
                s.paragraphs.length > 0 &&
                s.paragraphs.every((text) => text.length >= 100),
            ),
          'sections',
          'Quatre sections développées sont nécessaires.',
        ],
        [
          p.faqs.length >= 2 &&
            p.faqs.every((f) => f.question.length >= 15 && f.answer.length >= 100),
          'faqs',
          'Deux réponses développées sont nécessaires.',
        ],
        [p.sources.length > 0, 'sources', 'Références nécessaires.'],
        [p.guides.length > 0, 'guides', 'Guide connexe nécessaire.'],
      ] as const)
        if (!valid) ctx.addIssue({ code: 'custom', path: [path], message });
    }
    if ((p.status === 'validated' || p.status === 'published') && !p.humanReview)
      ctx.addIssue({
        code: 'custom',
        path: ['humanReview'],
        message: 'Validation humaine obligatoire.',
      });
  });
export type LocalDocument = z.infer<typeof localDocumentSchema>;
export const familyFor = (id: string) => localFamilies.find((f) => f.id === id);
export const localDocumentPath = (
  p: Pick<LocalDocument, 'communeCode' | 'departmentCode' | 'family'>,
) => `/territoires/${p.departmentCode}/${getCommune(p.communeCode)?.slug}/${p.family}`;
const root = join(process.cwd(), 'content', 'local');
let productionDocuments: LocalDocument[] | undefined;
export function readLocalDocuments(): LocalDocument[] {
  if (process.env.NODE_ENV === 'production' && productionDocuments) return productionDocuments;
  const documents = readdirSync(root, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => localDocumentSchema.parse(JSON.parse(readFileSync(join(root, f), 'utf8'))));
  if (process.env.NODE_ENV === 'production') productionDocuments = documents;
  return documents;
}
export function localProviders(
  p: Pick<LocalDocument, 'communeCode' | 'departmentCode' | 'family'>,
  config: Network = network,
) {
  const f = familyFor(p.family)!;
  return findCompanies(
    {
      departmentCode: p.departmentCode,
      communeCode: p.communeCode,
      expertise: f.expertise,
      service: f.service,
    },
    config,
  );
}
export function localIndexEligibility(p: LocalDocument, config: Network = network) {
  const reasons: string[] = [];
  if (!localDocumentSchema.safeParse(p).success) reasons.push('document_invalide');
  const town = getCommune(p.communeCode);
  if (!town || town.codeDepartement !== p.departmentCode) reasons.push('commune_incoherente');
  if (!activeDepartments(config).some((d) => d.code === p.departmentCode))
    reasons.push('departement_inactif');
  if (!localProviders(p, config).length) reasons.push('prestation_non_couverte');
  if (p.status !== 'published') reasons.push('non_publie');
  if (!p.humanReview) reasons.push('validation_humaine_attendue');
  const count = [
    p.intro,
    ...p.sections.flatMap((s) => s.paragraphs),
    ...p.faqs.map((f) => f.answer),
  ]
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (count < 350) reasons.push('contenu_a_developper');
  return { eligible: reasons.length === 0, reasons, words: count };
}
export function visibleLocalDocuments(config: Network = network) {
  return readLocalDocuments().filter(
    (p) =>
      p.status !== 'draft' &&
      localProviders(p, config).length > 0 &&
      activeDepartments(config).some((d) => d.code === p.departmentCode),
  );
}
export function eligibleLocalCombinations(config: Network = network) {
  return activeCommunes()
    .filter((c) => activeDepartments(config).some((d) => d.code === c.codeDepartement))
    .flatMap((c) =>
      localFamilies.flatMap((f) => {
        const p = { communeCode: c.code, departmentCode: c.codeDepartement, family: f.id };
        return localProviders(p, config).length ? [p] : [];
      }),
    );
}
export function localDocumentLinks(p: LocalDocument) {
  const f = familyFor(p.family)!;
  const town = getCommune(p.communeCode)!;
  return [
    {
      href: `/territoires/${p.departmentCode}/${town.slug}`,
      label: `Les autres savoir-faire à ${town.nom}`,
    },
    { href: `/territoires/${p.departmentCode}`, label: 'Explorer le département' },
    {
      href: `/territoires/${p.departmentCode}/expertises/${f.expertise}`,
      label: `${f.name} dans le département`,
    },
    {
      href: f.service ? `/expertises/${f.expertise}/${f.service}` : `/expertises/${f.expertise}`,
      label: `Comprendre le métier : ${f.name.toLowerCase()}`,
    },
    ...p.guides.map((id) => ({ href: `/conseils/${id}`, label: id })),
    ...localProviders(p).map((c) => ({ href: `/enseignes/${c.id}`, label: c.name })),
    ...visibleLocalDocuments()
      .filter((other) => other.communeCode === p.communeCode && other.family !== p.family)
      .map((other) => ({ href: localDocumentPath(other), label: familyFor(other.family)!.name })),
  ];
}
