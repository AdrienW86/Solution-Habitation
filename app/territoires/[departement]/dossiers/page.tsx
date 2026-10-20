import Link from 'next/link';
import { notFound } from 'next/navigation';
import { activeDepartments } from '@/lib/network';
import { getCommune } from '@/lib/geography';
import { localFamilies, visibleLocalDocuments, localDocumentPath } from '@/lib/local-editorial';
import { Breadcrumbs, PageIntro } from '@/components/ui';
import { metadata } from '@/lib/seo';
export const generateStaticParams = () => activeDepartments().map((d) => ({ departement: d.code }));
type Props = {
  params: Promise<{ departement: string }>;
  searchParams: Promise<{ metier?: string; page?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const { departement } = await params;
  return metadata(
    `Dossiers locaux — département ${departement}`,
    'Des dossiers par commune et savoir-faire pour comprendre le besoin, trouver les entreprises du réseau et préparer une demande contextualisée.',
    `/territoires/${departement}/dossiers`,
    true,
  );
}
export default async function Page({ params, searchParams }: Props) {
  const { departement } = await params,
    query = await searchParams;
  const department = activeDepartments().find((d) => d.code === departement);
  if (!department) notFound();
  const all = visibleLocalDocuments()
    .filter((p) => p.departmentCode === departement)
    .sort(
      (a, b) =>
        getCommune(a.communeCode)!.nom.localeCompare(getCommune(b.communeCode)!.nom, 'fr') ||
        a.family.localeCompare(b.family),
    );
  const family = localFamilies.find((f) => f.id === query.metier);
  const filtered = all.filter((p) => !family || p.family === family.id);
  const max = Math.max(1, Math.ceil(filtered.length / 15));
  const page = Math.min(max, Math.max(1, Math.floor(Number(query.page) || 1)));
  const href = (n: number) =>
    `?${new URLSearchParams({ ...(family ? { metier: family.id } : {}), page: String(n) })}`;
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { name: department.nom, href: `/territoires/${departement}` },
          { name: 'Les dossiers', href: `/territoires/${departement}/dossiers` },
        ]}
      />
      <PageIntro
        eyebrow={department.nom}
        title="Un besoin précis. Un dossier local."
        description="Explorez les situations, les questions à poser et les entreprises correspondant à votre commune. La disponibilité et les conditions du devis restent à confirmer avec l’intervenant."
      />
      <nav className="local-expertise-links" aria-label="Filtrer les dossiers par métier">
        <Link href={`/territoires/${departement}/dossiers`}>Tous les dossiers</Link>
        {localFamilies.map((f) => (
          <Link key={f.id} href={`?metier=${f.id}`}>
            {f.name}
          </Link>
        ))}
      </nav>
      {!filtered.length && (
        <p className="territory-context">
          Aucun dossier n’est encore disponible ici. Les communes restent accessibles depuis la
          recherche du réseau.
        </p>
      )}
      <div className="service-list">
        {filtered.slice((page - 1) * 15, page * 15).map((p) => (
          <article className="service-item" key={localDocumentPath(p)}>
            <div>
              <p className="eyebrow">
                {getCommune(p.communeCode)!.nom} ·{' '}
                {localFamilies.find((f) => f.id === p.family)!.name}
              </p>
              <h2>
                <Link href={localDocumentPath(p)}>{p.h1}</Link>
              </h2>
              <p>{p.description}</p>
            </div>
          </article>
        ))}
      </div>
      {max > 1 && (
        <nav className="local-expertise-links" aria-label="Pagination des dossiers">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={href(n)} aria-current={page === n ? 'page' : undefined}>
              Page {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
