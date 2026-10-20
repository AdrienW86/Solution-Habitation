import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { filmMedia, filmSchema, filmTranscript } from '../lib/film';
import { publishedLocalPages, getCommune } from '../lib/geography';
import { findCompanies } from '../lib/network';
import { networkIndexPaths } from '../lib/network-index';

test('20 distinct 66 town dossiers use official codes, sourced editorial text and exact company matching', () => {
  const pages = publishedLocalPages().filter((p) => p.departmentCode === '66');
  assert.deepEqual(
    pages.map((p) => p.slug).sort(),
    [
      'perpignan',
      'canet-en-roussillon',
      'argeles-sur-mer',
      'saint-cyprien',
      'rivesaltes',
      'saint-esteve',
      'cabestany',
      'elne',
      'thuir',
      'le-barcares',
      'ceret',
      'prades',
      'pia',
      'pollestres',
      'bompas',
      'saleilles',
      'le-soler',
      'villeneuve-de-la-raho',
      'toulouges',
      'saint-laurent-de-la-salanque',
    ].sort(),
  );
  const normalized = new Set<string>();
  for (const p of pages) {
    const town = getCommune(p.communeCode)!;
    assert.equal(town.codeDepartement, p.departmentCode);
    assert.ok(p.sources.length && p.faqs.length);
    assert.ok(networkIndexPaths().includes(`/territoires/66/${p.slug}`));
    const results = findCompanies({ departmentCode: '66', communeCode: p.communeCode });
    assert.ok(results.length);
    assert.ok(
      ['elite-couverture', 'toiture66', 'nettoyage-perpignan'].every((id) =>
        results.some((c) => c.id === id),
      ),
    );
    if (p.slug !== 'perpignan') assert.ok(!results.some((c) => c.id === 'peinture-occitane'));
    for (const s of p.sections) {
      const text = s.text.replaceAll(town.nom, '[ville]');
      assert.ok(!normalized.has(text), `${p.slug}: repeated section`);
      normalized.add(text);
    }
  }
  for (const slug of ['ceret', 'prades']) {
    const p = pages.find((p) => p.slug === slug)!;
    assert.deepEqual(
      findCompanies({ departmentCode: '66', communeCode: p.communeCode }).map((c) => c.id),
      [
        'couverture-catalane',
        'elite-couverture',
        'express-nuisibles',
        'nettoyage-perpignan',
        'protection-nuisibles',
        'toiture66',
      ],
    );
  }
});

test('film uses actual assets, faststart, restrained file sizes, sourced subtitles and no invented date', () => {
  const media = filmMedia()!;
  assert.ok(media);
  for (const file of [media.src, media.mobileSrc!]) {
    const data = readFileSync(`public${file}`);
    assert.ok(data.indexOf(Buffer.from('moov')) < data.indexOf(Buffer.from('mdat')));
    assert.ok(data.byteLength < 30e6);
  }
  assert.ok(statSync(`public${media.poster}`).size < 150e3);
  assert.match(readFileSync(`public${media.captions}`, 'utf8'), /^WEBVTT/);
  assert.match(filmTranscript()!, /Rénover votre toiture/);
  const date = process.env.FILM_UPLOAD_DATE;
  try {
    delete process.env.FILM_UPLOAD_DATE;
    assert.equal(filmSchema(media), undefined);
    process.env.FILM_UPLOAD_DATE = 'not-a-date';
    assert.equal(filmSchema(media), undefined);
  } finally {
    if (date === undefined) delete process.env.FILM_UPLOAD_DATE;
    else process.env.FILM_UPLOAD_DATE = date;
  }
});
