import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { FilmMedia } from '@/components/film-player';
import { absolute, type JsonLd } from './seo';

const local = '/media/solution-habitation-motion-design';
const available = (file: string) => existsSync(path.join(process.cwd(), 'public', file));
export function filmMedia(): FilmMedia | undefined {
  const src = process.env.FILM_VIDEO_URL || (available(`${local}.mp4`) ? `${local}.mp4` : '');
  const poster = process.env.FILM_POSTER_URL || (available(`${local}.webp`) ? `${local}.webp` : '');
  if (!src || !poster) return undefined;
  return {
    src,
    poster,
    mobileSrc:
      process.env.FILM_MOBILE_URL ||
      (!process.env.FILM_VIDEO_URL && available(`${local}-720p.mp4`)
        ? `${local}-720p.mp4`
        : undefined),
    captions: available(`${local}.fr.vtt`) ? `${local}.fr.vtt` : undefined,
  };
}

export function filmTranscript() {
  const file = path.join(process.cwd(), 'data', 'film-transcript.txt');
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : undefined;
}

export function filmSchema(media: FilmMedia): JsonLd | undefined {
  // A first publication date must be supplied by the owner, never inferred from file metadata.
  const uploadDate = process.env.FILM_UPLOAD_DATE;
  if (
    !uploadDate ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(uploadDate) ||
    Number.isNaN(Date.parse(uploadDate))
  )
    return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Une maison. Six savoir-faire. Une seule vision.',
    description:
      'Le film de présentation des expertises complémentaires de Solution Habitation pour rénover, protéger, entretenir et améliorer le confort de l’habitat.',
    thumbnailUrl: absolute(media.poster),
    contentUrl: absolute(media.src),
    uploadDate,
    inLanguage: 'fr-FR',
    transcript: filmTranscript(),
  };
}
