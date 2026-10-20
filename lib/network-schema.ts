import { z } from './zod';
import departments from '@/data/geographie/departements.json';
import { expertises } from './expertises';
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const secureUrl = z
  .url()
  .refine((value) => new URL(value).protocol === 'https:', 'Une URL HTTPS est requise.');
const departmentCode = z
  .string()
  .refine((value) => departments.some((d) => d.code === value), 'Département officiel inconnu.');
const proof = z.object({ url: secureUrl, verifiedAt: z.iso.date() }).strict();
const coverage = z
  .object({
    departmentCode,
    mode: z.enum(['department', 'communes', 'department-only']),
    communeCodes: z.array(z.string().regex(/^[0-9A-Z]{5}$/)),
    proof,
    ownerConfirmation: z
      .object({
        confirmedAt: z.iso.date(),
        reference: z.string().min(10),
        scope: z.string().min(30),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (c.mode === 'communes' && !c.communeCodes.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Une couverture communale doit citer des codes INSEE.',
      });
    if (c.mode !== 'communes' && c.communeCodes.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Les codes communaux sont réservés au mode communes.',
      });
    if (new Set(c.communeCodes).size !== c.communeCodes.length)
      ctx.addIssue({ code: 'custom', message: 'Codes INSEE dupliqués.' });
    if (c.communeCodes.some((code) => !code.startsWith(c.departmentCode)))
      ctx.addIssue({ code: 'custom', message: 'Commune et département incohérents.' });
  });
export const companySchema = z
  .object({
    id: slug,
    name: z.string().min(2),
    description: z.string().min(20),
    active: z.boolean(),
    logo: z
      .object({
        src: z.string().regex(/^\/images\/enseignes\/[a-z0-9-]+\.(png|svg|webp|avif|jpg)$/),
        alt: z.string().min(3),
        source: proof,
      })
      .strict()
      .nullable(),
    website: z.object({ url: secureUrl, verifiedAt: z.iso.date() }).strict().nullable(),
    contact: z
      .object({
        phone: z
          .string()
          .regex(/^0[1-9]\d{8}$/)
          .nullable(),
        email: z.email().nullable(),
        proof,
      })
      .strict(),
    offerings: z
      .array(z.object({ expertise: z.string(), services: z.array(slug).min(1) }).strict())
      .min(1),
    coverage: z.array(coverage),
    legal: z
      .object({ name: z.string().min(2), siren: z.string().regex(/^\d{9}$/), source: proof })
      .strict()
      .nullable(),
    profileSource: proof,
  })
  .strict()
  .superRefine((company, ctx) => {
    const seen = new Set();
    for (const [i, offering] of company.offerings.entries()) {
      const expertise = expertises.find((e) => e.id === offering.expertise);
      if (!expertise)
        ctx.addIssue({
          code: 'custom',
          path: ['offerings', i, 'expertise'],
          message: 'Expertise inconnue.',
        });
      if (seen.has(offering.expertise))
        ctx.addIssue({ code: 'custom', path: ['offerings', i], message: 'Expertise dupliquée.' });
      seen.add(offering.expertise);
      if (
        new Set(offering.services).size !== offering.services.length ||
        offering.services.some((s) => !expertise?.services.some((service) => service.slug === s))
      )
        ctx.addIssue({
          code: 'custom',
          path: ['offerings', i, 'services'],
          message: 'Prestation inconnue ou dupliquée.',
        });
    }
    if (new Set(company.coverage.map((c) => c.departmentCode)).size !== company.coverage.length)
      ctx.addIssue({
        code: 'custom',
        path: ['coverage'],
        message: 'Regroupez les zones d’un même département.',
      });
  });
export const networkSchema = z
  .object({
    version: z.literal(1),
    departmentSlots: z
      .array(z.object({ id: slug, code: departmentCode.nullable(), active: z.boolean() }).strict())
      .length(3),
    companies: z.array(companySchema),
    localServicePages: z
      .array(
        z
          .object({
            communeCode: z.string().regex(/^[0-9A-Z]{5}$/),
            departmentCode,
            expertise: slug,
            service: slug,
            title: z.string().min(20),
            sections: z
              .array(z.object({ heading: z.string().min(5), text: z.string().min(100) }).strict())
              .min(2),
            faqs: z
              .array(
                z.object({ question: z.string().min(10), answer: z.string().min(40) }).strict(),
              )
              .min(1),
            guides: z.array(slug).min(1).max(4),
            humanReview: z
              .object({
                reviewer: z.string().min(2),
                date: z.iso.date(),
                approved: z.literal(true),
              })
              .strict()
              .nullable()
              .default(null),
            sources: z.array(proof).min(1),
            reviewedAt: z.iso.date(),
            indexable: z.boolean(),
          })
          .strict(),
      )
      .default([]),
    localPages: z.array(
      z
        .object({
          communeCode: z.string().regex(/^[0-9A-Z]{5}$/),
          slug,
          departmentCode,
          expertise: z.string(),
          title: z.string().min(15),
          sections: z
            .array(z.object({ heading: z.string().min(5), text: z.string().min(100) }).strict())
            .min(2),
          sources: z.array(proof).min(1),
          indexable: z.boolean(),
          reviewedAt: z.iso.date(),
          faqs: z
            .array(z.object({ question: z.string().min(10), answer: z.string().min(40) }).strict())
            .default([]),
          editorialReview: z
            .object({
              approved: z.literal(true),
              reviewer: z.string().min(2),
              localValue: z.string().min(100),
            })
            .strict(),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((network, ctx) => {
    for (const [key, values] of [
      ['companies', network.companies.map((c) => c.id)],
      ['departmentSlots', network.departmentSlots.map((s) => s.id)],
      ['localPages', network.localPages.map((p) => `${p.communeCode}/${p.expertise}`)],
      ['localServicePages', network.localServicePages.map((p) => `${p.communeCode}/${p.service}`)],
    ] as const) {
      if (new Set(values).size !== values.length)
        ctx.addIssue({ code: 'custom', path: [key], message: 'Identifiants dupliqués.' });
    }
    const codes = network.departmentSlots.flatMap((s) => (s.code ? [s.code] : []));
    if (new Set(codes).size !== codes.length)
      ctx.addIssue({
        code: 'custom',
        path: ['departmentSlots'],
        message: 'Départements dupliqués.',
      });
    if (network.departmentSlots.some((s) => s.active && !s.code))
      ctx.addIssue({
        code: 'custom',
        path: ['departmentSlots'],
        message: 'Un territoire actif exige un département confirmé.',
      });
    for (const [i, p] of network.localPages.entries())
      if (!expertises.some((e) => e.id === p.expertise))
        ctx.addIssue({
          code: 'custom',
          path: ['localPages', i],
          message: 'Expertise locale inconnue.',
        });
    for (const [i, p] of network.localServicePages.entries()) {
      if (
        !expertises.some(
          (e) => e.id === p.expertise && e.services.some((s) => s.slug === p.service),
        )
      )
        ctx.addIssue({
          code: 'custom',
          path: ['localServicePages', i],
          message: 'Expertise ou prestation locale inconnue.',
        });
      if (
        !network.localPages.some(
          (city) => city.communeCode === p.communeCode && city.departmentCode === p.departmentCode,
        )
      )
        ctx.addIssue({
          code: 'custom',
          path: ['localServicePages', i],
          message: 'Une prestation locale exige un dossier communal documenté.',
        });
    }
  });
export type Network = z.infer<typeof networkSchema>;
export type NetworkCompany = z.infer<typeof companySchema>;
