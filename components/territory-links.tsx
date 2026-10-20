import Link from 'next/link';
import {
  getCommune,
  publishedLocalPages,
  publishedLocalServicePages,
  localServicePath,
} from '@/lib/geography';
import { findCompanies, activeDepartments } from '@/lib/network';
import { visibleLocalDocuments, localDocumentPath, familyFor } from '@/lib/local-editorial';

export function TerritoryLinks({
  expertise,
  service,
  companyId,
}: {
  expertise: string;
  service?: string;
  companyId?: string;
}) {
  const pages = publishedLocalPages().filter((p) =>
    findCompanies({
      expertise,
      service,
      departmentCode: p.departmentCode,
      communeCode: p.communeCode,
    }).some((c) => !companyId || c.id === companyId),
  );
  if (!pages.length) return null;
  const documents = visibleLocalDocuments().filter(
    (p) =>
      familyFor(p.family)?.expertise === expertise &&
      (!service || familyFor(p.family)?.service === service || !familyFor(p.family)?.service) &&
      localProvidersForCompany(p.communeCode, p.departmentCode),
  );
  function localProvidersForCompany(communeCode: string, departmentCode: string) {
    return findCompanies({ expertise, service, communeCode, departmentCode }).some(
      (c) => !companyId || c.id === companyId,
    );
  }
  return (
    <nav className="territory-links" aria-label="Communes documentées pour ce savoir-faire">
      <p>Retrouver ce savoir-faire dans votre commune :</p>
      {!!documents.length && (
        <>
          <ul className="local-expertise-links">
            {documents.slice(0, 6).map((p) => (
              <li key={localDocumentPath(p)}>
                <Link href={localDocumentPath(p)}>
                  {familyFor(p.family)!.name} à {getCommune(p.communeCode)?.nom}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            <Link
              href={`/territoires/${documents[0].departmentCode}/dossiers?metier=${documents[0].family}`}
            >
              Tous les dossiers de ce métier, par commune
            </Link>
          </p>
        </>
      )}
      {activeDepartments()
        .filter((d) => pages.some((p) => p.departmentCode === d.code))
        .map((d) => (
          <div key={d.code}>
            <p>
              <Link href={`/territoires/${d.code}/expertises/${expertise}`}>
                {d.nom} — ce métier dans le département
              </Link>
            </p>
            <ul className="local-expertise-links">
              {pages
                .filter((p) => p.departmentCode === d.code)
                .map((p) => (
                  <li key={`${p.departmentCode}/${p.slug}`}>
                    <Link
                      href={(() => {
                        const local = publishedLocalServicePages().find(
                          (s) =>
                            s.communeCode === p.communeCode &&
                            s.expertise === expertise &&
                            s.service === service,
                        );
                        return local
                          ? localServicePath(local)
                          : `/territoires/${p.departmentCode}/${p.slug}#${expertise}`;
                      })()}
                    >
                      {getCommune(p.communeCode)?.nom}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
    </nav>
  );
}
