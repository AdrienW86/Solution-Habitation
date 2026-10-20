import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { type Expertise, type Faq, getExpertise } from '@/lib/expertises';
import type { Brand } from '@/lib/content';
import { CompanyLogo } from './company-logo';
import { type JsonLd, breadcrumbSchema } from '@/lib/seo';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Brandmark() {
  return (
    <span className="brandmark">
      <span className="brand-symbol" aria-hidden="true">
        <Image
          src="/images/solution-habitation-logo.png"
          alt=""
          width={500}
          height={500}
          unoptimized
        />
      </span>
      <span>
        solution
        <span className="brand-second">
          habitation<span className="brand-dot">.</span>
        </span>
      </span>
    </span>
  );
}
export function ButtonLink({
  href,
  children,
  light = false,
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <Link href={href} className={`button ${light ? 'button-light' : ''}`}>
      {children}
      <Arrow />
    </Link>
  );
}
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-link">
      {children}
      <Arrow />
    </Link>
  );
}
export function JsonLdScript({ data }: { data: JsonLd }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  );
}
export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const all = [{ name: 'Accueil', href: '/' }, ...items];
  return (
    <>
      <nav aria-label="Fil d’Ariane" className="breadcrumbs">
        <ol>
          {all.map((x, i) => (
            <li key={x.href}>
              {i < all.length - 1 ? (
                <Link href={x.href}>{x.name}</Link>
              ) : (
                <span aria-current="page">{x.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLdScript data={breadcrumbSchema(all)} />
    </>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children && <div className="section-heading-aside">{children}</div>}
    </div>
  );
}
export function ExpertiseCard({ item, compact = false }: { item: Expertise; compact?: boolean }) {
  return (
    <Link href={`/expertises/${item.id}`} className={`expertise-card ${compact ? 'compact' : ''}`}>
      <div className="expertise-card-image">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
        />
        <span className="image-caption">
          {item.image.endsWith('.svg')
            ? 'Schéma illustratif'
            : item.id === 'ramonage'
              ? 'Illustration générée'
              : 'Photographie d’illustration'}
        </span>
        <span className="card-arrow">
          <Arrow diagonal />
        </span>
      </div>
      <div className="expertise-card-label">
        <span className="small-number">{item.number}</span>
        <h3>{item.name}</h3>
      </div>
      <p>
        {item.services
          .slice(0, 3)
          .map((s) => s.name)
          .join(' · ')}
      </p>
    </Link>
  );
}
export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link href={`/enseignes/${brand.slug}`} className="brand-card">
      <CompanyLogo logo={brand.logo} />
      <p className="eyebrow">{brand.expertises.map((id) => getExpertise(id)?.short).join(' · ')}</p>
      <h3>{brand.name}</h3>
      <p>{brand.description}</p>
      <span className="brand-area">{brand.areas.join(' · ')}</span>
    </Link>
  );
}
export function Faqs({ items }: { items: Faq[] }) {
  return (
    <div className="faqs">
      {items.map((f, i) => (
        <details key={f.question}>
          <summary>
            <span className="small-number">{String(i + 1).padStart(2, '0')}</span>
            <span>{f.question}</span>
            <span className="faq-plus" aria-hidden="true">
              +
            </span>
          </summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
export function Callout({
  title = 'Votre projet commence par un échange.',
  text = 'Un besoin précis ou plusieurs métiers à coordonner ? Prenez le temps de nous parler de votre habitat.',
  href = '/contact',
  label = 'Parlons de votre projet',
}: {
  title?: string;
  text?: string;
  href?: string;
  label?: string;
}) {
  return (
    <section className="callout">
      <div>
        <p className="eyebrow">Passons à votre projet</p>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <ButtonLink href={href} light>
        {label}
      </ButtonLink>
    </section>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="intro-description">{description}</p>
    </header>
  );
}
