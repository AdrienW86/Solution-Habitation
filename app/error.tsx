'use client';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-page">
      <p className="eyebrow">Une difficulté technique</p>
      <h1>
        Réessayons
        <br />
        dans un instant.
      </h1>
      <p>La page n’a pas pu être affichée correctement. Vous pouvez relancer son chargement.</p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
    </div>
  );
}
