import { filmMedia, filmSchema, filmTranscript } from '@/lib/film';
import { FilmPlayer } from './film-player';
import { JsonLdScript } from './ui';
import Link from 'next/link';

export function FilmSection({ editorial = false }: { editorial?: boolean }) {
  const media = filmMedia();
  if (!media) return null;
  const schema = filmSchema(media);
  const transcript = filmTranscript();
  return (
    <section
      className={`film-section ${editorial ? 'film-editorial' : ''}`}
      aria-labelledby={editorial ? 'film-network-title' : 'film-title'}
    >
      <div className="container section">
        <div className="film-intro">
          <div>
            <p className="eyebrow">Solution Habitation · Le film</p>
            <h2 id={editorial ? 'film-network-title' : 'film-title'}>
              {editorial
                ? 'Les liens font la différence.'
                : 'Une maison. Six savoir-faire. Une seule vision.'}
            </h2>
          </div>
          <p>
            {editorial
              ? 'Le bâtiment se pense dans son ensemble. Notre film met en perspective les liens entre protection, rénovation, entretien et confort, au-delà des identités de chaque enseigne.'
              : 'Découvrez comment nos expertises se complètent pour rénover, protéger, entretenir et améliorer le confort de votre habitat.'}
          </p>
        </div>
        <FilmPlayer media={media} />
        <p className="film-watch-link">
          <Link href="/le-film">Le film et ses textes sur une page dédiée ↗</Link>
        </p>
        {transcript && (
          <details className="film-transcript">
            <summary>Lire les textes du film</summary>
            <p>
              Film sans voix off, accompagné de musique et d’effets sonores. Transcription des
              textes à l’écran, issue des sources du film.
            </p>
            {transcript.split(/\r?\n\s*\r?\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </details>
        )}
      </div>
      {schema && <JsonLdScript data={schema} />}
    </section>
  );
}
