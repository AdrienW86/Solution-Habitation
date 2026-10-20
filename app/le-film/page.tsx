import { notFound } from 'next/navigation';
import { filmMedia, filmSchema, filmTranscript } from '@/lib/film';
import { metadata } from '@/lib/seo';
import { FilmPlayer } from '@/components/film-player';
import { Breadcrumbs, JsonLdScript, TextLink } from '@/components/ui';

export const generateMetadata = () =>
  metadata(
    'Le film — Une maison, six savoir-faire',
    'Découvrez le film de présentation de Solution Habitation : six expertises complémentaires pour prendre soin de votre habitat, avec les textes du film accessibles en HTML.',
    '/le-film',
  );

export default function Page() {
  const media = filmMedia();
  if (!media) notFound();
  const schema = filmSchema(media);
  const transcript = filmTranscript();
  return (
    <div className="container film-watch">
      <Breadcrumbs items={[{ name: 'Le film', href: '/le-film' }]} />
      <header className="film-watch-intro">
        <p className="eyebrow">Le film Solution Habitation</p>
        <h1>Une maison. Six savoir-faire. Une seule vision.</h1>
        <p>
          Découvrez comment nos expertises se complètent pour rénover, protéger, entretenir et
          améliorer le confort de votre habitat.
        </p>
      </header>
      <FilmPlayer media={media} discoverable />
      <section className="prose related-section">
        <h2>Les textes du film.</h2>
        <p>
          Le film est accompagné de musique et d’effets sonores, sans voix off. Les textes suivants
          reprennent les sous-titres et la signature présents dans les sources originales.
        </p>
        {transcript?.split(/\r?\n\s*\r?\n/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          Solution Habitation réunit les univers de la couverture, de la peinture et des façades,
          des nuisibles, du nettoyage, de la location de climatiseurs mobiles et du ramonage. Les
          prestations effectivement disponibles se vérifient par territoire.
        </p>
        <TextLink href="/le-reseau">Comprendre l’esprit du réseau</TextLink>
        <br />
        <TextLink href="/expertises">Explorer les six expertises</TextLink>
        <br />
        <TextLink href="/territoires/66">
          Trouver une enseigne dans les Pyrénées-Orientales
        </TextLink>
      </section>
      {schema && <JsonLdScript data={schema} />}
    </div>
  );
}
