import { expertises } from './expertises';
import { network, publicCompanies, activeDepartments, findCompanies } from './network';
import {
  publishedLocalPages,
  publishedLocalServicePages,
  localServicePath,
  legacyServiceIndexEligible,
} from './geography';
import type { Network } from './network-schema';
import { readLocalDocuments, localDocumentPath, localIndexEligibility } from './local-editorial';
export function networkIndexPaths(config: Network = network) {
  const companies = publicCompanies(config);
  const documents = readLocalDocuments();
  const ownedPaths = new Set(documents.map(localDocumentPath));
  return [
    ...companies.map((c) => `/enseignes/${c.id}`),
    '/territoires',
    ...activeDepartments(config).map((d) => `/territoires/${d.code}`),
    ...activeDepartments(config).flatMap((d) =>
      expertises
        .filter((e) => findCompanies({ departmentCode: d.code, expertise: e.id }, config).length)
        .map((e) => `/territoires/${d.code}/expertises/${e.id}`),
    ),
    ...expertises.flatMap((e) =>
      e.services
        .filter((s) =>
          companies.some((c) =>
            c.offerings.some((o) => o.expertise === e.id && o.services.includes(s.slug)),
          ),
        )
        .map((s) => `/expertises/${e.id}/${s.slug}`),
    ),
    ...publishedLocalPages(config)
      .filter((p) => p.indexable)
      .map((p) => `/territoires/${p.departmentCode}/${p.slug}`),
    ...publishedLocalServicePages(config)
      .filter((p) => legacyServiceIndexEligible(p, config))
      .map((p) => localServicePath(p, config))
      .filter((path) => !ownedPaths.has(path)),
    ...documents.filter((p) => localIndexEligibility(p, config).eligible).map(localDocumentPath),
  ];
}
