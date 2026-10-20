import { ButtonLink, TextLink } from '@/components/ui';
export default function NotFound() {
  return (
    <div className="error-page">
      <p className="eyebrow">Erreur 404</p>
      <h1>
        Reprenons
        <br />
        le bon chemin.
      </h1>
      <p>
        Cette page n’existe pas ou n’est plus disponible. Retrouvez les expertises pour poursuivre
        votre recherche.
      </p>
      <ButtonLink href="/expertises">Explorer les expertises</ButtonLink>
      <div style={{ marginTop: 20 }}>
        <TextLink href="/">Revenir à l’accueil</TextLink>
      </div>
    </div>
  );
}
