'use client';
import { useId, useMemo, useState, useRef, useEffect } from 'react';
import { buildCommuneIndex, searchCommuneIndex, type CommuneOption } from '@/lib/commune-search';
export type { CommuneOption } from '@/lib/commune-search';
const PAGE_SIZE = 30;
export function CommunePicker({
  communes,
  selected,
  onSelect,
}: {
  communes: CommuneOption[];
  selected: CommuneOption | null;
  onSelect: (value: CommuneOption | null) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState(selected?.nom ?? '');
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(-1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const index = useMemo(() => buildCommuneIndex(communes), [communes]);
  const matches = useMemo(() => searchCommuneIndex(query, index), [query, index]);
  const options = matches.slice(0, visibleCount);
  useEffect(() => {
    if (open && position >= 0)
      list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, position]);
  function move(next: number) {
    const target = Math.max(-1, Math.min(next, matches.length - 1));
    setOpen(true);
    setPosition(target);
    if (target >= visibleCount) setVisibleCount(Math.ceil((target + 1) / PAGE_SIZE) * PAGE_SIZE);
  }
  function choose(c: CommuneOption) {
    input.current?.setCustomValidity('');
    setQuery(c.nom);
    onSelect(c);
    setOpen(false);
    setPosition(-1);
    input.current?.focus();
  }
  return (
    <div
      className="commune-picker"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={id}>Commune ou code postal</label>
      <input
        ref={input}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-options`}
        aria-describedby={`${id}-hint`}
        aria-activedescendant={
          open && position >= 0 ? `${id}-option-${matches[position]?.code}` : undefined
        }
        autoComplete="off"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          e.currentTarget.setCustomValidity(
            e.target.value ? 'Sélectionnez une commune dans les suggestions.' : '',
          );
          setQuery(e.target.value);
          onSelect(null);
          setOpen(true);
          setPosition(-1);
          setVisibleCount(PAGE_SIZE);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            setPosition(-1);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            move(position + 1);
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            move(position < 0 ? matches.length - 1 : position - 1);
          }
          if (open && (e.key === 'Home' || e.key === 'End')) {
            e.preventDefault();
            move(e.key === 'Home' ? 0 : matches.length - 1);
          }
          if (e.key === 'Enter' && open) {
            e.preventDefault();
            if (position >= 0 && matches[position]) choose(matches[position]);
            else if (matches.length === 1) choose(matches[0]);
          }
        }}
        placeholder="Nom de commune ou code postal"
      />
      <input type="hidden" name="commune" value={selected?.code ?? ''} />
      <div className="commune-suggestions" hidden={!open}>
        <ul ref={list} id={`${id}-options`} role="listbox" aria-label="Communes">
          {options.map((c, i) => (
            <li
              role="option"
              aria-selected={position === i}
              aria-setsize={matches.length}
              aria-posinset={i + 1}
              id={`${id}-option-${c.code}`}
              key={c.code}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(c)}
              className={position === i ? 'is-highlighted' : ''}
            >
              <span>{c.nom}</span>
              <small>
                {c.codeDepartement} · {c.codesPostaux.join(', ')} · INSEE {c.code}
              </small>
            </li>
          ))}
          {!options.length && (
            <li role="presentation" className="no-commune">
              Aucune commune correspondante dans les départements sélectionnés.
            </li>
          )}
        </ul>
        {options.length < matches.length && (
          <button
            type="button"
            className="commune-more"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setVisibleCount((count) => count + PAGE_SIZE);
              setOpen(true);
            }}
          >
            Afficher les communes suivantes ({options.length}/{matches.length})
          </button>
        )}
      </div>
      <span id={`${id}-hint`} className="picker-hint" role="status">
        {open
          ? `${matches.length} commune${matches.length > 1 ? 's' : ''} correspondante${matches.length > 1 ? 's' : ''}. ${options.length} affichée${options.length > 1 ? 's' : ''}.`
          : 'Toutes les communes sont recherchables, même sans entreprise référencée.'}
      </span>
    </div>
  );
}
