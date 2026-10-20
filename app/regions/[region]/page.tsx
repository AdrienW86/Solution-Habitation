import { notFound } from 'next/navigation';
import { regionalNetworks } from '@/lib/regions';
import { metadata } from '@/lib/seo';
import { RegionalNetwork } from '@/components/regional-network';
import { Breadcrumbs, PageIntro } from '@/components/ui';
export const dynamicParams = false;
export const generateStaticParams = () => regionalNetworks().map((r) => ({ region: r.slug }));
type Props = { params: Promise<{ region: string }> };
export async function generateMetadata({ params }: Props) {
  const { region } = await params;
  const r = regionalNetworks().find((r) => r.slug === region);
  return r
    ? metadata(
        `Le réseau de l’habitat en ${r.nom}`,
        `Comparez les enseignes documentées en ${r.nom}, département par département, puis vérifiez les prestations et communes réellement couvertes.`,
        `/regions/${r.slug}`,
      )
    : {};
}
export default async function Page({ params }: Props) {
  const { region } = await params;
  const r = regionalNetworks().find((r) => r.slug === region);
  if (!r) notFound();
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { name: 'Les territoires', href: '/territoires' },
          { name: r.nom, href: `/regions/${r.slug}` },
        ]}
      />
      <PageIntro
        eyebrow="Une région, des périmètres distincts"
        title={`Le réseau en ${r.nom}.`}
        description="Une présence régionale ne signifie pas que chaque enseigne couvre toute la région. Les implantations sont présentées par département ; une recherche communale affine ensuite les métiers et prestations réellement documentés."
      />
      <div className="prose">
        <h2>Comprendre les recouvrements.</h2>
        <p>
          Une même entreprise peut couvrir plusieurs départements ou plusieurs communes. Elle
          apparaît dans chacun de ses périmètres documentés. Le réseau ne déduit jamais une zone
          d’intervention de la seule proximité d’une autre enseigne.
        </p>
        <p>
          Une zone annoncée sans commune précise permet de présenter l’enseigne au niveau
          départemental. Elle n’autorise pas à la faire apparaître dans les résultats d’une ville.
          Les disponibilités et conditions du devis sont à confirmer directement.
        </p>
      </div>
      <RegionalNetwork regionSlug={r.slug} />
    </div>
  );
}
