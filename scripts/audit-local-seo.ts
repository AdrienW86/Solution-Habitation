import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  readLocalDocuments,
  eligibleLocalCombinations,
  localDocumentPath,
  localProviders,
  localIndexEligibility,
  localDocumentLinks,
} from '../lib/local-editorial';
import {
  getCommune,
  publishedLocalPages,
  publishedLocalServicePages,
  localServicePath,
} from '../lib/geography';
import { normalizedText, prose, shingles, similarity } from '../lib/local-quality';
import { networkIndexPaths } from '../lib/network-index';
import { getArticle } from '../lib/articles';
import { expertises } from '../lib/expertises';
import { publicCompanies, activeDepartments } from '../lib/network';
import { mediaFingerprint, imageDistance } from '../lib/media-fingerprint';
import mediaInventory from '../data/media-inventory.json';

async function main() {
  const docs = readLocalDocuments();
  const evidence = Array.from(new Set(docs.flatMap((p) => p.sources.map((s) => s.url)))).map(
    (url) => ({
      url,
      assertions: Array.from(
        new Set(docs.flatMap((p) => p.sources.filter((s) => s.url === url).map((s) => s.supports))),
      ),
      documents: docs.filter((p) => p.sources.some((s) => s.url === url)).map(localDocumentPath),
    }),
  );
  writeFileSync(
    'docs/local-evidence.json',
    JSON.stringify(
      {
        geographicReference: 'data/geographie/communes.json',
        commercialReference: 'data/reseau.json',
        ownerConfirmation: 'mission-proprietaire-2026-10-20-couverture-66',
        sources: evidence,
        note: 'Une source locale situe une commune ; elle ne prouve ni une infestation ni un type dominant de bâtiment. Les hypothèses conditionnelles des guides ne sont pas des statistiques communales.',
      },
      null,
      2,
    ) + '\n',
  );
  const paths = docs.map(localDocumentPath);
  const anomalies: { level: 'error' | 'review'; code: string; paths: string[]; detail: string }[] =
    [];
  const add = (level: 'error' | 'review', code: string, paths: string[], detail: string) =>
    anomalies.push({ level, code, paths, detail });
  const names = [...new Set(docs.map((p) => getCommune(p.communeCode)?.nom ?? ''))].filter(Boolean);
  for (const [label, values] of Object.entries({
    path: paths,
    title: docs.map((p) => p.title),
    h1: docs.map((p) => p.h1),
    description: docs.map((p) => p.description),
    intro: docs.map((p) => normalizedText(p.intro, names)),
  })) {
    const seen = new Map<string, number>();
    values.forEach((value, i) => {
      const previous = seen.get(value);
      if (previous !== undefined)
        add(
          'error',
          `duplicate_${label}`,
          [paths[previous], paths[i]],
          'Valeur identique après neutralisation des noms de communes pour les introductions.',
        );
      else seen.set(value, i);
    });
  }
  const bodies = docs.map((p) => shingles(normalizedText(prose(p), names)));
  const similarities: { a: string; b: string; score: number }[] = [];
  for (let a = 0; a < docs.length; a++)
    for (let b = a + 1; b < docs.length; b++) {
      const score = similarity(bodies[a], bodies[b]);
      similarities.push({ a: paths[a], b: paths[b], score: Math.round(score * 1000) / 1000 });
      if (score >= 0.28)
        add(
          'review',
          'similarity',
          [paths[a], paths[b]],
          `Similarité lexicale ${Math.round(score * 100)} %. Relire les intentions et l’utilité ; le score ne valide pas le contenu.`,
        );
    }
  const known = new Set([
    '/',
    '/territoires',
    '/contact',
    '/recherche',
    ...paths,
    ...publishedLocalPages().map((p) => `/territoires/${p.departmentCode}/${p.slug}`),
    ...publishedLocalServicePages().map((p) => localServicePath(p)),
    ...activeDepartments().flatMap((d) => [
      `/territoires/${d.code}`,
      `/territoires/${d.code}/dossiers`,
      ...expertises.map((e) => `/territoires/${d.code}/expertises/${e.id}`),
    ]),
    ...expertises.flatMap((e) => [
      `/expertises/${e.id}`,
      ...e.services.map((s) => `/expertises/${e.id}/${s.slug}`),
    ]),
    ...publicCompanies().map((c) => `/enseignes/${c.id}`),
    ...networkIndexPaths(),
  ]);
  const index = new Set(networkIndexPaths());
  const imageOwners = new Map<string, string>();
  const questions = new Map<string, string>();
  const pageReports = docs.map((p, i) => {
    const location = getCommune(p.communeCode);
    const readiness = localIndexEligibility(p);
    if (!location || location.codeDepartement !== p.departmentCode)
      add('error', 'unknown_commune', [paths[i]], 'Commune et département incohérents.');
    if (!localProviders(p).length)
      add('error', 'uncovered_service', [paths[i]], 'Aucune entreprise réellement éligible.');
    for (const reason of readiness.reasons.filter(
      (r) => !['non_publie', 'validation_humaine_attendue'].includes(r),
    ))
      add('review', reason, [paths[i]], 'Vérifier ce point avant publication.');
    if (index.has(paths[i]) !== readiness.eligible)
      add('error', 'sitemap_status', [paths[i]], 'Désaccord entre éligibilité et sitemap.');
    for (const guide of p.guides)
      if (!getArticle(guide)) add('error', 'unknown_guide', [paths[i]], guide);
    for (const faq of p.faqs) {
      const value = normalizedText(faq.question, names);
      const previous = questions.get(value);
      if (previous && previous !== paths[i])
        add('review', 'repeated_question', [previous, paths[i]], faq.question);
      else questions.set(value, paths[i]);
    }
    if (p.image) {
      if (!existsSync(`public${p.image.src}`))
        add('error', 'missing_image', [paths[i]], p.image.src);
      else {
        const hash = createHash('sha256')
          .update(readFileSync(`public${p.image.src}`))
          .digest('hex');
        const previous = imageOwners.get(hash);
        if (previous)
          add(
            'review',
            'identical_image',
            [previous, paths[i]],
            'Fichiers identiques, même sous des noms différents.',
          );
        else imageOwners.set(hash, paths[i]);
      }
    }
    const links = localDocumentLinks(p);
    for (const link of links)
      if (!known.has(link.href) && !link.href.startsWith('/conseils/'))
        add('error', 'unknown_internal_link', [paths[i]], link.href);
    // Every visible document is linked by its town and the paginated departmental directory.
    const townIncoming = publishedLocalPages().some((t) => t.communeCode === p.communeCode);
    if (p.status !== 'draft' && !townIncoming)
      add(
        'error',
        'missing_town_incoming',
        [paths[i]],
        'Ajouter une présentation communale et son lien vers le dossier.',
      );
    return {
      path: paths[i],
      communeCode: p.communeCode,
      family: p.family,
      batch: p.batch,
      status: p.status,
      words: readiness.words,
      providers: localProviders(p).map((c) => c.id),
      eligible: readiness.eligible,
      reasons: readiness.reasons,
      outgoingLinks: links.length,
      expectedIncoming: townIncoming
        ? [
            `/territoires/${p.departmentCode}/${location?.slug}`,
            `/territoires/${p.departmentCode}/dossiers`,
          ]
        : [],
    };
  });
  const combinations = eligibleLocalCombinations();
  const legacyDetails = publishedLocalServicePages()
    .filter((p) => !paths.includes(localServicePath(p)))
    .map((p) => ({
      path: localServicePath(p),
      words: [...p.sections.map((s) => s.text), ...p.faqs.map((f) => f.answer)]
        .join(' ')
        .split(/\s+/).length,
      humanReview: !!p.humanReview,
    }));
  if (process.argv.includes('--images')) {
    const media = await Promise.all(
      [
        ...new Set([
          ...mediaInventory.assets.map((a) => a.path),
          ...docs.flatMap((p) => (p.image ? [p.image.src] : [])),
        ]),
      ].map(async (path) => ({ path, ...(await mediaFingerprint(readFileSync(`public${path}`))) })),
    );
    const pairs = [];
    for (let a = 0; a < media.length; a++)
      for (let b = a + 1; b < media.length; b++) {
        const distance = imageDistance(media[a].differenceHash, media[b].differenceHash);
        if (
          media[a].byteHash === media[b].byteHash ||
          media[a].pixelHash === media[b].pixelHash ||
          distance <= 2
        )
          pairs.push({
            a: media[a].path,
            b: media[b].path,
            exactBytes: media[a].byteHash === media[b].byteHash,
            exactPixels: media[a].pixelHash === media[b].pixelHash,
            differenceBits: distance,
            review:
              'Ressemblance globale à examiner visuellement ; le score ne prouve pas un doublon.',
          });
      }
    writeFileSync(
      'docs/local-media-audit.json',
      JSON.stringify(
        {
          checked: media.length,
          localPagesWithImage: docs.filter((p) => !!p.image).length,
          exactDuplicates: pairs.filter((p) => p.exactBytes || p.exactPixels).length,
          pairs,
        },
        null,
        2,
      ) + '\n',
    );
  }
  const overview = {
    auditedAt: new Date().toISOString(),
    httpAudit: !!process.env.LOCAL_SEO_AUDIT_URL,
    imageAudit: process.argv.includes('--images'),
    eligibleCombinations66: combinations.filter((p) => p.departmentCode === '66').length,
    eligibleCombinationsByDepartment: Object.fromEntries(
      activeDepartments().map((d) => [
        d.code,
        combinations.filter((p) => p.departmentCode === d.code).length,
      ]),
    ),
    written: docs.length,
    drafts: docs.filter((p) => p.status === 'draft').length,
    awaitingHumanReview: docs.filter((p) => p.status === 'review').length,
    humanApproved: docs.filter((p) => !!p.humanReview).length,
    indexReady: pageReports.filter((p) => p.eligible).length,
    withoutManuscript66: combinations.filter(
      (p) => p.departmentCode === '66' && !paths.includes(localDocumentPath(p)),
    ).length,
    needsDevelopment: pageReports.filter((p) => p.reasons.includes('contenu_a_developper')).length,
    legacyDetailedPagesAwaitingReview: legacyDetails.filter((p) => !p.humanReview).length,
    legacyDetailedPagesUnder350: legacyDetails.filter((p) => p.words < 350).length,
    words: pageReports.reduce((n, p) => n + p.words, 0),
    authoredInternalLinks: pageReports.reduce((n, p) => n + p.outgoingLinks, 0),
    errors: anomalies.filter((a) => a.level === 'error').length,
    reviewFlags: anomalies.filter((a) => a.level === 'review').length,
    note: 'Un contrôle automatique ne vaut pas validation éditoriale humaine. Aucune route sans manuscrit n’est créée.',
  };
  const base = process.env.LOCAL_SEO_AUDIT_URL;
  if (base) {
    const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
    const fetchedLinks = new Map<string, boolean>();
    for (const p of docs.filter((p) => p.status !== 'draft')) {
      const path = localDocumentPath(p),
        response = await fetch(`${base}${path}`),
        html = await response.text();
      if (!response.ok) add('error', 'http_status', [path], String(response.status));
      if (!html.includes(`href="https://solution-habitation.fr${path}"`))
        add('error', 'canonical', [path], 'Canonical absent ou incohérent.');
      if ((html.match(/<h1\b/g) ?? []).length !== 1)
        add('error', 'h1_count', [path], 'H1 unique attendu.');
      if (
        !localIndexEligibility(p).eligible &&
        !html.includes('noindex') &&
        !response.headers.get('x-robots-tag')?.includes('noindex')
      )
        add('error', 'robots', [path], 'Dossier non approuvé indexable.');
      if (
        sitemap.includes(`https://solution-habitation.fr${path}</loc>`) !==
        localIndexEligibility(p).eligible
      )
        add('error', 'http_sitemap', [path], 'Désaccord avec sitemap servi.');
      for (const schema of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) {
        try {
          const value = JSON.parse(schema[1]);
          if (
            value['@type'] === 'Service' &&
            (value.url !== `https://solution-habitation.fr${path}` ||
              value.provider.length !== localProviders(p).length ||
              value.areaServed.identifier !== p.communeCode)
          )
            add(
              'error',
              'service_schema',
              [path],
              'Fournisseurs ou commune du JSON-LD incohérents.',
            );
        } catch {
          add('error', 'jsonld_parse', [path], 'JSON-LD invalide.');
        }
      }
      for (const link of localDocumentLinks(p)) {
        if (!fetchedLinks.has(link.href))
          fetchedLinks.set(link.href, (await fetch(`${base}${link.href}`)).ok);
        if (!fetchedLinks.get(link.href)) add('error', 'http_link', [path], link.href);
      }
      const parent = `/territoires/${p.departmentCode}/${getCommune(p.communeCode)!.slug}`;
      const incoming = await (await fetch(`${base}${parent}`)).text();
      if (!incoming.includes(`href="${path}"`))
        add('error', 'http_orphan', [path], `Lien absent depuis ${parent}`);
    }
    overview.errors = anomalies.filter((a) => a.level === 'error').length;
    overview.reviewFlags = anomalies.filter((a) => a.level === 'review').length;
  }
  mkdirSync('docs', { recursive: true });
  writeFileSync(
    'docs/local-seo-audit.json',
    JSON.stringify(
      {
        overview,
        pages: pageReports,
        anomalies,
        mostSimilar: similarities.sort((a, b) => b.score - a.score).slice(0, 20),
        legacyDetails,
        combinations: combinations.map((p) => ({
          ...p,
          path: localDocumentPath(p),
          editorial: paths.includes(localDocumentPath(p)) ? 'written' : 'not-started',
        })),
      },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(
    'docs/SUIVI-LOTS-SEO.md',
    `# Suivi des lots SEO locaux\n\nRapport généré par \`npm run audit:local-seo\`. Ne confond pas couverture, rédaction et validation.\n\n\`\`\`json\n${JSON.stringify(overview, null, 2)}\n\`\`\`\n\n| Commune | Famille | Mots | Statut | Validation humaine |\n| --- | --- | ---: | --- | --- |\n${pageReports.map((p) => `| ${getCommune(p.communeCode)?.nom} | ${p.family} | ${p.words} | ${p.status} | ${p.eligible ? 'publiée et approuvée' : 'attendue'} |`).join('\n')}\n\n## Anomalies et relectures\n\n${anomalies.length ? anomalies.map((a) => `- ${a.level} / ${a.code} : ${a.paths.join(', ')} — ${a.detail}`).join('\n') : 'Aucune anomalie automatique. Tous les manuscrits non approuvés restent à relire humainement.'}\n\nLe détail des combinaisons sans manuscrit figure dans local-seo-audit.json. Reprendre les couples not-started uniquement ; ne jamais écraser un document existant pour augmenter un compteur.\n`,
  );
  console.log(JSON.stringify(overview));
  if (overview.errors) process.exitCode = 1;
}
main().catch((error) => {
  mkdirSync('docs', { recursive: true });
  writeFileSync(
    'docs/local-seo-audit-error.json',
    JSON.stringify(
      {
        error: String(error.message),
        status: 'audit-incomplet',
        instruction:
          'Corriger le document invalide avant de considérer les anciens rapports comme à jour.',
      },
      null,
      2,
    ) + '\n',
  );
  console.error('Audit local interrompu :', error.message);
  process.exitCode = 1;
});
