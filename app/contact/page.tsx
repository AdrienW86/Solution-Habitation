import Link from 'next/link';
import { brands, getExpertise, getBrand, phoneLabel } from '@/lib/content';
import { leadRoutes, deliveryReady, turnstileSiteKey } from '@/lib/lead-config';
import { createLeadToken } from '@/lib/lead-security';
import { metadata } from '@/lib/seo';
import { Breadcrumbs, PageIntro } from '@/components/ui';
import { LeadForm } from '@/components/lead-form';
import { getCommune } from '@/lib/geography';
export const dynamic = 'force-dynamic';
export const generateMetadata = () =>
  metadata(
    'Votre projet — contact et préparation de devis',
    'Décrivez votre besoin, préparez votre dossier et retrouvez les coordonnées directes des enseignes.',
    '/contact',
    true,
  );
type Props = {
  searchParams: Promise<{
    expertise?: string;
    enseigne?: string;
    commune?: string;
    prestation?: string;
    departement?: string;
  }>;
};
export default async function Page({ searchParams }: Props) {
  const query = await searchParams;
  const expertise = getExpertise(query.expertise ?? '');
  const brand = getBrand(query.enseigne ?? '');
  const commune = getCommune(query.commune ?? '');
  const enabled = deliveryReady();
  return (
    <div className="container">
      <Breadcrumbs items={[{ name: 'Votre projet', href: '/contact' }]} />
      <PageIntro
        eyebrow="Passons à votre projet"
        title={'Commençons par\nvotre besoin.'}
        description={
          enabled
            ? 'Une demande bien définie pour le bon interlocuteur. Décrivez les lieux, vos attentes et les contraintes de votre projet.'
            : 'Préparez un dossier clair, conservez-le sur votre appareil et échangez directement avec l’enseigne de votre choix.'
        }
      />
      <div className="contact-layout">
        <LeadForm
          initialExpertise={expertise?.id ?? ''}
          initialDepartment={
            ['66', '11', '34'].includes(query.departement ?? '') ? query.departement : undefined
          }
          initialLocation={
            commune
              ? { code: commune.code, nom: commune.nom, postalCode: commune.codesPostaux[0] }
              : undefined
          }
          initialService={
            expertise?.services.some((s) => s.slug === query.prestation)
              ? query.prestation
              : undefined
          }
          initialBrand={
            brand?.expertises.some((id) => id === expertise?.id) ? (brand?.slug ?? '') : ''
          }
          enabled={enabled}
          siteKey={turnstileSiteKey()}
          token={enabled ? createLeadToken() : ''}
          recipientRules={
            enabled
              ? leadRoutes().map(({ expertise, brand, departments, recipient }) => ({
                  expertise,
                  brand,
                  departments,
                  recipient,
                }))
              : []
          }
          source={`/contact?${new URLSearchParams({
            ...(expertise ? { expertise: expertise.id } : {}),
            ...(brand ? { enseigne: brand.slug } : {}),
            ...(commune ? { commune: commune.code, departement: commune.codeDepartement } : {}),
            ...(expertise?.services.some((s) => s.slug === query.prestation)
              ? { prestation: query.prestation! }
              : {}),
          }).toString()}`}
        />
        <aside className="contact-aside">
          <h2>Un échange direct.</h2>
          <p>
            Pour vérifier une zone d’intervention ou parler de votre projet, retrouvez les enseignes
            et leurs contacts.
          </p>
          {brands
            .filter((b) => b.phone)
            .map((b) => (
              <section className="direct-contact" key={b.slug}>
                <p className="eyebrow">{getExpertise(b.expertise)?.short}</p>
                <h3>
                  <Link href={`/enseignes/${b.slug}`}>{b.name}</Link>
                </h3>
                <a
                  href={`tel:+33${b.phone.slice(1)}`}
                  data-conversion="phone_click"
                  data-brand={b.slug}
                >
                  {phoneLabel(b.phone)}
                </a>
                <p>{b.areas.join(' · ')}</p>
              </section>
            ))}
        </aside>
      </div>
    </div>
  );
}
