import Link from 'next/link';
import { buildCommuneIndex, type CommuneOption } from '@/lib/commune-search';
const PAGE_SIZE = 60;
export function CommuneDirectory({
  communes,
  departmentCode,
  page: requestedPage,
}: {
  communes: CommuneOption[];
  departmentCode: string;
  page?: string;
}) {
  const sorted = buildCommuneIndex(communes).map((row) => row.commune);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(
    pages,
    Math.max(1, Number.isSafeInteger(Number(requestedPage)) ? Number(requestedPage) : 1),
  );
  const start = (page - 1) * PAGE_SIZE;
  const href = (p: number) =>
    `/territoires/${departmentCode}${p > 1 ? `?communes=${p}` : ''}#annuaire-communes`;
  return (
    <div id="annuaire-communes" className="commune-directory">
      <h3>Toutes les communes, de A à Z.</h3>
      <p className="directory-summary" role="status">
        {sorted.length} communes · {start + 1}–{Math.min(start + PAGE_SIZE, sorted.length)} · Page{' '}
        {page} sur {pages}
      </p>
      <ul className="commune-directory-list">
        {sorted.slice(start, start + PAGE_SIZE).map((c) => (
          <li key={c.code}>
            <Link
              href={`/recherche?departement=${departmentCode}&commune=${c.code}`}
              prefetch={false}
            >
              <span>{c.nom}</span>
              <small>
                {c.codesPostaux.join(', ')} · INSEE {c.code}
              </small>
            </Link>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav className="directory-pagination" aria-label="Pages des communes">
          {page > 1 && (
            <Link href={href(page - 1)} prefetch={false} rel="prev">
              ← Précédentes
            </Link>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={href(p)}
              prefetch={false}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p} des communes`}
            >
              {p}
            </Link>
          ))}
          {page < pages && (
            <Link href={href(page + 1)} prefetch={false} rel="next">
              Suivantes →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
