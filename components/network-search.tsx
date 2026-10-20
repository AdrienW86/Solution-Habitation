'use client';
import { useMemo, useState } from 'react';
import { CommunePicker, type CommuneOption } from './commune-picker';
import { Arrow } from './ui';
type Props = {
  departments: { code: string; nom: string }[];
  communes: CommuneOption[];
  expertises: { id: string; name: string; services: { slug: string; name: string }[] }[];
  initial?: { expertise?: string; service?: string; department?: string; commune?: string };
};
export function NetworkSearch({ departments, communes, expertises, initial = {} }: Props) {
  const [expertise, setExpertise] = useState(initial.expertise ?? '');
  const [service, setService] = useState(initial.service ?? '');
  const [department, setDepartment] = useState(initial.department ?? '');
  const [commune, setCommune] = useState<CommuneOption | null>(
    communes.find((c) => c.code === initial.commune) ?? null,
  );
  const filteredCommunes = useMemo(
    () => communes.filter((c) => !department || c.codeDepartement === department),
    [communes, department],
  );
  return (
    <form
      action="/recherche"
      method="get"
      className="network-search"
      role="search"
      aria-label="Rechercher une entreprise"
    >
      <div className="search-fields">
        <div className="search-field">
          <label htmlFor="search-expertise">Votre expertise</label>
          <select
            id="search-expertise"
            name="expertise"
            value={expertise}
            required
            onChange={(e) => {
              setExpertise(e.target.value);
              setService('');
            }}
          >
            <option value="">Choisir un métier</option>
            {expertises.map((e) => (
              <option value={e.id} key={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label htmlFor="search-service">La prestation</label>
          <select
            id="search-service"
            name="prestation"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">Toutes les prestations</option>
            {expertises
              .find((e) => e.id === expertise)
              ?.services.map((s) => (
                <option value={s.slug} key={s.slug}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
        <div className="search-field">
          <label htmlFor="search-department">Département</label>
          <select
            id="search-department"
            name="departement"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setCommune(null);
            }}
          >
            <option value="">Tous les départements activés</option>
            {departments.map((d) => (
              <option value={d.code} key={d.code}>
                {d.nom} ({d.code})
              </option>
            ))}
          </select>
        </div>
        <CommunePicker
          key={department}
          communes={filteredCommunes}
          selected={commune}
          onSelect={(c) => setCommune(c)}
        />
      </div>
      <div className="search-bottom">
        <p>
          Des zones documentées. Plusieurs enseignes possibles. La disponibilité se confirme auprès
          de l’entreprise.
        </p>
        <button className="button" type="submit">
          Trouver une entreprise
          <Arrow />
        </button>
      </div>
    </form>
  );
}
