import type { LocalDocument } from './local-editorial';
export const prose = (p: LocalDocument) =>
  [
    p.intro,
    ...p.sections.flatMap((s) => s.paragraphs),
    ...p.faqs.flatMap((f) => [f.question, f.answer]),
  ].join(' ');
export function normalizedText(text: string, names: string[] = []) {
  let value = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  for (const name of names)
    value = value
      .split(
        name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase(),
      )
      .join(' commune ');
  return value.replace(/[^a-z0-9]+/g, ' ').trim();
}
export function shingles(text: string, size = 5) {
  const tokens = normalizedText(text).split(' ');
  return new Set(
    tokens
      .slice(0, Math.max(0, tokens.length - size + 1))
      .map((_, i) => tokens.slice(i, i + size).join(' ')),
  );
}
export function similarity(a: Set<string>, b: Set<string>) {
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection++;
  const union = a.size + b.size - intersection;
  return union ? intersection / union : 0;
}
