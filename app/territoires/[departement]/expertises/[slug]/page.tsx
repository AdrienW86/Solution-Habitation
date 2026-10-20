import Link from 'next/link';
import { notFound } from 'next/navigation';
import { activeDepartments, findCompanies } from '@/lib/network';
import {
  publishedLocalPages,
  publishedLocalServicePages,
  getCommune,
  localServicePath,
} from '@/lib/geography';
import { expertises, getExpertise } from '@/lib/expertises';
import { relatedArticles } from '@/lib/articles';
import { metadata } from '@/lib/seo';
import { Breadcrumbs, PageIntro, TextLink } from '@/components/ui';
import { SearchPanel } from '@/components/search-panel';
import { CompanyResult } from '@/components/company-result';
import { ArticleCard } from '@/components/article-card';
const intros: Record<string, string> = {
  '66/toiture':
    'La desserte de l’ensemble des Pyrénées-Orientales par les trois enseignes de couverture a été confirmée par le propriétaire du réseau. Les prestations restent propres à chaque entreprise : comparez les ouvrages proposés, puis décrivez l’adresse et les accès pour préparer une demande de réparation, de rénovation ou de zinguerie.',
  '66/nuisibles':
    'Le catalogue distingue la couverture départementale explicitement annoncée par Protection Nuisibles et les communes nommées d’Express Nuisibles. Ces périmètres peuvent se recouvrir. La sélection d’une prestation et d’une commune permet d’afficher toutes les correspondances sans classement commercial.',
  '66/peinture-facades':
    'La correspondance communale de Peinture Occitane est actuellement documentée à Perpignan. Sa présence dans les Pyrénées-Orientales ne permet pas d’annoncer un ravalement ou une peinture dans chacune des autres communes. Préparez les supports, les surfaces et les accès avant de vérifier le périmètre du projet.',
  '66/nettoyage':
    'Nettoyage Perpignan est documentée à Perpignan pour l’entretien de locaux professionnels et l’habitat résidentiel. Le réseau ne lui attribue pas automatiquement du nettoyage après travaux ou une couverture de tout le département. Le canal de contact direct de cette enseigne reste à documenter ; le dossier de projet demeure une préparation.',
  '11/toiture':
    'Narbonne Toiture annonce une couverture de l’Aude pour la réparation, la rénovation, la zinguerie et l’entretien de toiture. Les dossiers communaux aident à préparer des demandes distinctes selon le bâtiment et ses accès. Une couverture départementale confirme une correspondance géographique, sans promettre un créneau ni un type d’ouvrage particulier.',
};
type Props = { params: Promise<{ departement: string; slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () =>
  activeDepartments().flatMap((d) =>
    expertises
      .filter((e) => findCompanies({ departmentCode: d.code, expertise: e.id }).length)
      .map((e) => ({ departement: d.code, slug: e.id })),
  );
export async function generateMetadata({ params }: Props) {
  const { departement, slug } = await params;
  const d = activeDepartments().find((d) => d.code === departement),
    e = getExpertise(slug);
  return d && e
    ? metadata(
        `${e.name} — réseau dans ${d.nom} (${d.code})`,
        intros[`${d.code}/${e.id}`]?.slice(0, 155) ??
          `Retrouvez les périmètres documentés pour ${e.name.toLowerCase()} dans ${d.nom}, puis vérifiez les correspondances dans votre commune.`,
        `/territoires/${d.code}/expertises/${e.id}`,
      )
    : {};
}
export default async function Page({ params }: Props) {
  const { departement, slug } = await params;
  const d = activeDepartments().find((d) => d.code === departement),
    e = getExpertise(slug);
  if (!d || !e) notFound();
  const companies = findCompanies({ departmentCode: d.code, expertise: e.id });
  if (!companies.length) notFound();
  const local = publishedLocalPages().filter(
    (p) =>
      p.departmentCode === d.code &&
      findCompanies({ departmentCode: d.code, communeCode: p.communeCode, expertise: e.id }).length,
  );
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { name: 'Les territoires', href: '/territoires' },
          { name: d.nom, href: `/territoires/${d.code}` },
          { name: e.name, href: `/territoires/${d.code}/expertises/${e.id}` },
        ]}
      />
      <PageIntro
        eyebrow={`${d.nom} · Les périmètres du réseau`}
        title={`${e.name}\n${d.nom}.`}
        description={
          intros[`${d.code}/${e.id}`] ??
          `Découvrez les enseignes de ${e.name.toLowerCase()} documentées dans ce département. La recherche communale précise leurs correspondances et les prestations disponibles.`
        }
      />
      <SearchPanel initial={{ expertise: e.id, department: d.code }} />
      <section className="related-section">
        <h2>Les prestations référencées.</h2>
        <ul className="local-expertise-links">
          {e.services
            .filter((s) =>
              companies.some((c) =>
                c.offerings.some((o) => o.expertise === e.id && o.services.includes(s.slug)),
              ),
            )
            .map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/recherche?expertise=${e.id}&prestation=${s.slug}&departement=${d.code}`}
                >
                  {s.name} — vérifier ma commune
                </Link>
              </li>
            ))}
        </ul>
      </section>
      <section className="related-section">
        <h2>Les enseignes et leurs zones.</h2>
        {companies.map((company) => (
          <CompanyResult
            key={company.id}
            company={company}
            expertise={e.id}
            departmentCode={d.code}
          />
        ))}
      </section>
      <section className="related-section">
        <h2>Les dossiers communaux disponibles.</h2>
        <ul className="local-expertise-links">
          {local.map((p) => (
            <li key={p.slug}>
              <Link href={`/territoires/${d.code}/${p.slug}#${e.id}`}>
                {getCommune(p.communeCode)?.nom}
              </Link>
            </li>
          ))}
        </ul>
        <ul>
          {publishedLocalServicePages()
            .filter((p) => p.departmentCode === d.code && p.expertise === e.id)
            .map((p) => (
              <li key={localServicePath(p)}>
                <Link href={localServicePath(p)}>{p.title}</Link>
              </li>
            ))}
        </ul>
      </section>
      <section className="related-section">
        <h2>Comprendre les besoins avant de demander un devis.</h2>
        <div className="journal-grid">
          {relatedArticles(e.id).map((a) => (
            <ArticleCard key={a.slug} article={a} compact />
          ))}
        </div>
        <TextLink href={`/expertises/${e.id}`}>L’expertise et ses guides</TextLink>
      </section>
    </div>
  );
}
