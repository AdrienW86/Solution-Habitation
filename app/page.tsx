import Image from 'next/image';
import Link from 'next/link';
import { expertises, homeFaqs } from '@/lib/content';
import { RegionalNetwork } from '@/components/regional-network';
import { articles } from '@/lib/articles';
import { metadata } from '@/lib/seo';
import {
  Arrow,
  ButtonLink,
  Callout,
  ExpertiseCard,
  Faqs,
  SectionHeading,
  TextLink,
} from '@/components/ui';
import { ArticleCard } from '@/components/article-card';
import { SearchPanel } from '@/components/search-panel';
import { FilmSection } from '@/components/film-section';
export const generateMetadata = () =>
  metadata(
    'Tous les savoir-faire pour votre habitat',
    'Rénover, protéger, entretenir et améliorer le confort de votre habitat. Six univers complémentaires, des enseignes identifiées et un parcours adapté à votre projet.',
    '/',
  );
export default function Home() {
  return (
    <>
      <section className="home-hero">
        <Image
          className="hero-photo"
          src="/images/habitat-editorial.jpg"
          alt="Architecture intérieure ouverte sur un jardin, photographie d’ambiance"
          fill
          sizes="100vw"
          fetchPriority="high"
          loading="eager"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">Rénovation · Protection · Entretien · Confort</p>
          <h1>
            Tous les savoir-faire
            <br />
            pour <em>votre habitat.</em>
          </h1>
          <p>
            Des expertises complémentaires, réunies autour d’une même attention : prendre soin de
            vos lieux de vie.
          </p>
          <div className="hero-actions">
            <ButtonLink href="/contact" light>
              Parlons de votre projet
            </ButtonLink>
            <Link className="text-link" href="#expertises">
              Découvrir nos expertises
              <Arrow />
            </Link>
          </div>
        </div>
        <span className="hero-index">SOLUTION HABITATION — L’ESPRIT DU LIEU</span>
        <div className="hero-bottom">
          <a href="#introduction" className="scroll-link">
            <Arrow />
            Un regard d’ensemble. Le soin du détail.
          </a>
          <span>
            Habitat & espaces professionnels
            <br />
            Photographie d’ambiance
          </span>
        </div>
      </section>
      <section className="container section home-network-search" id="rechercher">
        <SectionHeading
          eyebrow="Trouver le bon interlocuteur"
          title="Un savoir-faire près de chez vous."
        >
          <TextLink href="/territoires">Explorer les territoires</TextLink>
        </SectionHeading>
        <SearchPanel />
      </section>
      <section className="container section intro-grid" id="introduction">
        <p className="eyebrow">Une vision commune</p>
        <div>
          <h2>
            Votre habitat est un tout.
            <br />
            Nos savoir-faire <em>se répondent.</em>
          </h2>
          <div className="intro-copy">
            <p>
              Une toiture qui protège. Une façade qui retrouve son caractère. Des espaces sains,
              entretenus et confortables. Chaque besoin fait partie d’un même lieu.
            </p>
            <p>
              Solution Habitation réunit des univers métiers et des enseignes spécialisées pour vous
              aider à comprendre votre projet et à trouver le bon interlocuteur.
            </p>
            <TextLink href="/le-reseau">Découvrir l’esprit du réseau</TextLink>
          </div>
        </div>
      </section>
      <section className="container section expertises-section" id="expertises">
        <SectionHeading
          eyebrow="Les expertises"
          title={
            <>
              Six univers.
              <br />
              Une même attention.
            </>
          }
        >
          <p>
            De la protection du bâtiment au confort quotidien, explorez le savoir-faire qui
            correspond à votre besoin.
          </p>
        </SectionHeading>
        <div className="expertise-grid">
          {expertises.map((e) => (
            <ExpertiseCard key={e.id} item={e} />
          ))}
        </div>
      </section>
      <FilmSection />
      <section className="network-story">
        <figure className="network-image">
          <Image
            src="/images/interieur-editorial.jpg"
            alt="Matières naturelles et lumière dans une pièce de vie, ambiance éditoriale"
            fill
            sizes="(max-width:800px) 100vw, 50vw"
          />
          <figcaption>Photographie d’ambiance — illustration de l’habitat</figcaption>
        </figure>
        <div className="network-story-copy">
          <p className="eyebrow">L’esprit Solution Habitation</p>
          <h2>
            Des métiers distincts.
            <br />
            Un regard
            <br />
            d’ensemble.
          </h2>
          <p>
            Entretenir un bâtiment, c’est penser aux liens entre ses différentes composantes. Une
            infiltration se traite avant une peinture ; une remise en état se prépare après les
            travaux.
          </p>
          <p>
            Notre rôle : rendre ces expertises lisibles, identifier les enseignes et vous aider à
            avancer avec une demande bien définie.
          </p>
          <TextLink href="/le-reseau">Une approche qui fait sens</TextLink>
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          eyebrow="Les enseignes"
          title={
            <>
              Des noms.
              <br />
              Des savoir-faire.
            </>
          }
        >
          <TextLink href="/enseignes">Rencontrer les enseignes</TextLink>
        </SectionHeading>
        <RegionalNetwork compact />
      </section>
      <section className="method-section">
        <div className="container section">
          <SectionHeading
            eyebrow="Votre projet, simplement"
            title={
              <>
                Bien comprendre.
                <br />
                Mieux vous orienter.
              </>
            }
          >
            <p>
              Le bon point de départ : décrire votre besoin, identifier l’expertise et échanger avec
              l’enseigne concernée.
            </p>
          </SectionHeading>
          <div className="method-grid">
            {[
              {
                title: 'Parlez-nous du lieu.',
                text: 'Votre besoin, la localisation et les contraintes du bâtiment donnent une première lecture de votre projet.',
              },
              {
                title: 'Identifiez le bon savoir-faire.',
                text: 'Découvrez l’expertise adaptée et les enseignes qui annoncent intervenir dans votre secteur.',
              },
              {
                title: 'Définissez la suite.',
                text: 'Le professionnel précise le diagnostic, le périmètre du devis et ses conditions d’intervention.',
              },
            ].map((m, i) => (
              <div className="method-step" key={m.title}>
                <span>0{i + 1}</span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          eyebrow="Le journal de l’habitat"
          title={
            <>
              Les bonnes questions.
              <br />
              Des repères concrets.
            </>
          }
        >
          <TextLink href="/conseils">Explorer tous les conseils</TextLink>
        </SectionHeading>
        <div className="journal-grid">
          {[articles[0], articles[2], articles[4]].map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
      <section className="container section faq-section">
        <div>
          <p className="eyebrow">Pour y voir plus clair</p>
          <h2>
            Avant de
            <br />
            commencer.
          </h2>
        </div>
        <Faqs items={homeFaqs} />
      </section>
      <Callout />
    </>
  );
}
