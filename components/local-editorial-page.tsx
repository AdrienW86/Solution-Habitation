import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs, PageIntro, Faqs, JsonLdScript, ButtonLink } from './ui';
import { CompanyResult } from './company-result';
import { getCommune } from '@/lib/geography';
import {
  familyFor,
  localDocumentPath,
  localProviders,
  localDocumentLinks,
  type LocalDocument,
} from '@/lib/local-editorial';
import { getArticle } from '@/lib/articles';
import { absolute } from '@/lib/seo';

export function LocalEditorialPage({ document: p }: { document: LocalDocument }) {
  const town = getCommune(p.communeCode)!;
  const family = familyFor(p.family)!;
  const path = localDocumentPath(p);
  const contact = `/contact?${new URLSearchParams({ expertise: family.expertise, ...(family.service ? { prestation: family.service } : {}), departement: p.departmentCode, commune: p.communeCode })}`;
  return (
    <article className="container">
      <Breadcrumbs
        items={[
          { name: 'Les territoires', href: '/territoires' },
          { name: p.departmentCode, href: `/territoires/${p.departmentCode}` },
          { name: town.nom, href: `/territoires/${p.departmentCode}/${town.slug}` },
          { name: family.name, href: path },
        ]}
      />
      <PageIntro eyebrow={`${family.name} · ${town.nom}`} title={p.h1} description={p.intro} />
      <p className="article-meta">
        Révisé le{' '}
        <time dateTime={p.revisedAt}>
          {new Date(`${p.revisedAt}T12:00:00Z`).toLocaleDateString('fr-FR', {
            timeZone: 'Europe/Paris',
          })}
        </time>
      </p>
      {p.image && (
        <figure className="wide-photo">
          <Image src={p.image.src} alt={p.image.alt} width={1200} height={760} />
          <figcaption>
            {p.image.kind === 'illustration' ? 'Illustration' : 'Photographie autorisée'}
          </figcaption>
        </figure>
      )}
      <div className="prose">
        {p.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
        ))}
      </div>
      <section className="related-section">
        <h2>Les entreprises du réseau pour ce besoin à {town.nom}.</h2>
        <p className="territory-context">
          Les enseignes ci-dessous déclarent desservir la commune. Cela n’implique pas l’existence
          d’une agence sur place. Le diagnostic, les conditions du devis et les disponibilités
          restent à confirmer avec chacune.
        </p>
        {localProviders(p).map((c) => (
          <CompanyResult
            key={c.id}
            company={c}
            expertise={family.expertise}
            service={family.service}
            communeCode={town.code}
          />
        ))}
      </section>
      <section className="related-section">
        <h2>Vos questions sur cette demande.</h2>
        <Faqs items={p.faqs} />
      </section>
      <section className="related-section">
        <h2>Préparer votre projet avec les bons repères.</h2>
        <ul>
          {localDocumentLinks(p).map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                {link.href.startsWith('/conseils/')
                  ? getArticle(link.href.split('/').at(-1)!)?.title
                  : link.label}
              </Link>
            </li>
          ))}
        </ul>
        <ButtonLink href={contact}>Préparer une demande à {town.nom}</ButtonLink>
      </section>
      <aside className="prose article-sources">
        <h2>Sources et portée des informations.</h2>
        <p>
          Les conseils pratiques décrivent des situations possibles, sans affirmer qu’elles
          caractérisent toute la commune. La couverture commerciale du 66 a été confirmée par le
          propriétaire du réseau le 20 octobre 2026.
        </p>
        <ul>
          {p.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url}>{s.label}</a> — {s.supports} Vérifié le {s.checkedAt}.
            </li>
          ))}
        </ul>
      </aside>
      <JsonLdScript
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `${family.name} à ${town.nom}`,
          url: absolute(path),
          areaServed: { '@type': 'City', name: town.nom, identifier: town.code },
          provider: localProviders(p).map((c) => ({
            '@type': 'Organization',
            name: c.name,
            url: absolute(`/enseignes/${c.id}`),
          })),
        }}
      />
    </article>
  );
}
