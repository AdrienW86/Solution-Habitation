'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

export type FilmMedia = {
  src: string;
  mobileSrc?: string;
  poster: string;
  captions?: string;
};

export function FilmPlayer({
  media,
  discoverable = false,
}: {
  media: FilmMedia;
  discoverable?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);

  function play() {
    const player = video.current;
    if (!player) return;
    setError(false);
    if (!started) {
      player.src =
        media.mobileSrc && window.matchMedia('(max-width: 767px)').matches
          ? media.mobileSrc
          : media.src;
      setStarted(true);
    }
    player.focus();
    void player.play().catch(() => setError(true));
  }

  return (
    <div className="film-player">
      <video
        ref={video}
        tabIndex={started ? 0 : -1}
        src={discoverable ? media.src : undefined}
        controls={started}
        preload="none"
        playsInline
        poster={started || discoverable ? media.poster : undefined}
        aria-label="Le film Solution Habitation"
        onError={() => setError(true)}
      >
        {media.captions && (
          <track kind="captions" src={media.captions} srcLang="fr" label="Français" default />
        )}
        Votre navigateur ne permet pas de lire cette vidéo.
      </video>
      {!started && (
        <button
          type="button"
          className="film-play"
          onClick={play}
          aria-label="Lire le film Solution Habitation"
        >
          <Image
            src={media.poster}
            alt=""
            fill
            sizes="(max-width: 767px) 90vw, 85vw"
            unoptimized={media.poster.startsWith('https://')}
          />
          <span className="film-play-disc" aria-hidden="true">
            ▶
          </span>
          <span className="film-play-label">Découvrir le film</span>
        </button>
      )}
      {error && (
        <div className="film-error" role="alert">
          <p>La lecture a été interrompue. Vous pouvez réessayer ou ouvrir le film directement.</p>
          <button type="button" onClick={play}>
            Réessayer
          </button>{' '}
          <a href={media.src}>Ouvrir la vidéo</a>
        </div>
      )}
      <noscript>
        <style>{'.film-play { display: none; }'}</style>
        <a className="film-noscript" href={media.src}>
          Voir le film Solution Habitation
        </a>
      </noscript>
    </div>
  );
}
