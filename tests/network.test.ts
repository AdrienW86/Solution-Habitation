import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { network, findCompanies, publicCompanies, toBrand } from '../lib/network';
import { networkSchema } from '../lib/network-schema';
import { activeCommunes, matchCommunes, publishedLocalPages } from '../lib/geography';
import { networkIndexPaths } from '../lib/network-index';
import type { Network } from '../lib/network-schema';
import snapshot from '../data/geographie/communes.json';
import importProof from '../data/geographie/import-verification.json';
const clone = (): Network => structuredClone(network);

test('local pages require editorial review and disappear when no eligible company remains', () => {
  const config = clone();
  config.localPages = [];
  config.localServicePages = [];
  const page = {
    communeCode: '66136',
    slug: 'perpignan-nuisibles',
    departmentCode: '66',
    expertise: 'nuisibles',
    title: 'Traitement des nuisibles à Perpignan',
    sections: [
      { heading: 'Contexte local', text: 'Un contenu éditorial local vérifié. '.repeat(5) },
      {
        heading: 'Préparer le diagnostic',
        text: 'Des observations distinctes utiles à la préparation du diagnostic. '.repeat(3),
      },
    ],
    sources: [config.companies[0].profileSource],
    indexable: true,
    reviewedAt: '2026-10-19',
    faqs: [],
    editorialReview: {
      approved: true as const,
      reviewer: 'Test éditorial',
      localValue:
        'Description des informations locales ayant motivé la publication et leur intérêt pour les habitants de cette commune. '.repeat(
          2,
        ),
    },
  };
  config.localPages.push(page);
  const checked = networkSchema.parse(config);
  assert.equal(publishedLocalPages(checked).length, 1);
  assert.ok(networkIndexPaths(checked).includes('/territoires/66/perpignan-nuisibles'));
  for (const company of checked.companies) company.active = false;
  assert.equal(publishedLocalPages(checked).length, 0);
  assert.ok(!networkIndexPaths(checked).includes('/territoires/66/perpignan-nuisibles'));
  const unchecked = structuredClone(page) as Record<string, unknown>;
  delete unchecked.editorialReview;
  assert.equal(networkSchema.safeParse({ ...config, localPages: [unchecked] }).success, false);
});
test('all official communes in 66, 11 and 34 are present and searchable by name and INSEE', () => {
  assert.equal(activeCommunes().length, 1000);
  assert.equal(new Set(activeCommunes().map((c) => c.code)).size, 1000);
  for (const [code, count] of Object.entries({ '66': 226, '11': 433, '34': 341 })) {
    const actual = activeCommunes().filter((c) => c.codeDepartement === code);
    const proof = importProof.departments.find((d) => d.code === code)!;
    assert.equal(actual.length, count);
    assert.equal(actual.length, proof.count);
    assert.equal(snapshot.officialCounts[code as keyof typeof snapshot.officialCounts], count);
    assert.deepEqual(actual.map((c) => c.code).sort(), proof.codes);
  }
  assert.equal(matchCommunes('perpignan')[0].code, '66136');
  assert.ok(matchCommunes('saint esteve').some((c) => c.nom === 'Saint-Estève'));
  assert.ok(matchCommunes('66000').some((c) => c.code === '66136'));
  for (const c of activeCommunes()) {
    assert.ok(matchCommunes(c.code).some((x) => x.code === c.code));
    assert.ok(
      matchCommunes(
        c.nom
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
      ).some((x) => x.code === c.code),
    );
  }
});

test('requested 66 towns and small communes remain searchable beyond the first 30 suggestions', () => {
  for (const name of [
    'Perpignan',
    'Canet-en-Roussillon',
    'Argelès-sur-Mer',
    'Saint-Cyprien',
    'Le Barcarès',
    'Céret',
    'Prades',
    'Thuir',
    'Rivesaltes',
    'Elne',
    'Font-Romeu-Odeillo-Via',
    'Caixas',
    'Glorianes',
    'Mantet',
    'Urbanya',
    'Vira',
  ])
    assert.ok(
      matchCommunes(name).some((c) => c.nom === name && c.codeDepartement === '66'),
      name,
    );
  const all = matchCommunes(
    '',
    activeCommunes().filter((c) => c.codeDepartement === '66'),
  );
  assert.equal(all.length, 226);
  assert.ok(all.findIndex((c) => c.nom === 'Perpignan') > 30);
});

test('Aude has only documented roof coverage; Herault has no invented providers', () => {
  assert.deepEqual(
    findCompanies({
      expertise: 'toiture',
      service: 'renovation-couverture',
      departmentCode: '11',
      communeCode: '11262',
    }).map((c) => c.id),
    ['narbonne-toiture'],
  );
  assert.deepEqual(
    findCompanies({ expertise: 'nuisibles', departmentCode: '11', communeCode: '11262' }),
    [],
  );
  assert.deepEqual(
    findCompanies({ expertise: 'toiture', departmentCode: '34', communeCode: '34172' }),
    [],
  );
  assert.deepEqual(
    findCompanies({ expertise: 'nuisibles', departmentCode: '66', communeCode: '66999' }),
    [],
  );
});
test('one commune can offer multiple companies with no preferred result', () => {
  const matches = findCompanies({
    expertise: 'nuisibles',
    departmentCode: '66',
    communeCode: '66136',
  });
  assert.deepEqual(
    matches.map((c) => c.id),
    ['express-nuisibles', 'protection-nuisibles'],
  );
  assert.ok(matches.every((c) => c.logo && existsSync('public' + c.logo.src)));
});
test('department-only advertising never expands into blanket commune coverage', () => {
  const config = clone();
  const area = config.companies
    .find((c) => c.id === 'toiture66')!
    .coverage.find((c) => c.departmentCode === '66')!;
  area.mode = 'department-only';
  assert.ok(
    findCompanies({ expertise: 'toiture', departmentCode: '66' }, config).some(
      (c) => c.id === 'toiture66',
    ),
  );
  assert.ok(
    !findCompanies(
      { expertise: 'toiture', departmentCode: '66', communeCode: '66136' },
      config,
    ).some((c) => c.id === 'toiture66'),
  );
  assert.deepEqual(
    findCompanies({ expertise: 'ramonage', departmentCode: '66', communeCode: '66136' }),
    [],
  );
  assert.deepEqual(
    findCompanies({ expertise: 'nuisibles', departmentCode: '66', communeCode: '11069' }),
    [],
  );
});
test('adding a company through JSON updates discovery and index paths; deactivation removes both', () => {
  const json = clone();
  const added = structuredClone(
    json.companies.find((c: { id: string }) => c.id === 'protection-nuisibles')!,
  );
  added.id = 'test-ajout-json';
  json.companies.push(added);
  const addedConfig = networkSchema.parse(json);
  assert.ok(
    findCompanies(
      { expertise: 'nuisibles', departmentCode: '66', communeCode: '66136' },
      addedConfig,
    ).some((c) => c.id === added.id),
  );
  assert.ok(networkIndexPaths(addedConfig).includes(`/enseignes/${added.id}`));
  added.active = false;
  const disabled = networkSchema.parse(json);
  assert.ok(!publicCompanies(disabled).some((c) => c.id === added.id));
  assert.ok(!networkIndexPaths(disabled).includes(`/enseignes/${added.id}`));
});
test('multiple departments and professions work without component changes', () => {
  const config = clone();
  config.departmentSlots[1] = { id: 'territoire-2', code: '11', active: true };
  const company = config.companies.find((c) => c.id === 'protection-nuisibles')!;
  company.coverage.push({
    departmentCode: '11',
    mode: 'department',
    communeCodes: [],
    proof: company.profileSource,
  });
  company.offerings.push({ expertise: 'nettoyage', services: ['locaux-professionnels'] });
  const checked = networkSchema.parse(config);
  assert.ok(
    findCompanies(
      { expertise: 'nettoyage', departmentCode: '11', communeCode: '11262' },
      checked,
    ).some((c) => c.id === company.id),
  );
  assert.ok(toBrand(company).expertises.includes('nettoyage'));
});
test('duplicate IDs, unknown services, departments and invalid website links are rejected', () => {
  const duplicate = clone();
  duplicate.companies.push(structuredClone(duplicate.companies[0]));
  assert.equal(networkSchema.safeParse(duplicate).success, false);
  for (const change of [
    (c: Network) => {
      c.companies[0].offerings[0].services = ['inconnue'];
    },
    (c: Network) => {
      c.companies[0].coverage[0].departmentCode = 'ZZ';
    },
    (c: Network) => {
      c.companies[0].website = { url: 'javascript:alert(1)', verifiedAt: '2026-10-19' };
    },
  ]) {
    const c = clone();
    change(c);
    assert.equal(networkSchema.safeParse(c).success, false);
  }
});
test('all configured original logos exist and only reviewed covered local pages are indexed', () => {
  for (const c of network.companies) if (c.logo) assert.ok(existsSync('public' + c.logo.src));
  assert.equal(publishedLocalPages().length, 32);
  assert.equal(
    networkIndexPaths().filter((p) => /^\/territoires\/\d+\/[^/]+$/.test(p)).length,
    publishedLocalPages().filter((p) => p.indexable).length,
  );
  assert.ok(!networkIndexPaths().some((p) => p.startsWith('/recherche')));
});
test('a commune name shared by two departments remains distinct by INSEE', () => {
  const matches = matchCommunes('saint martin', [
    { code: '66001', nom: 'Saint-Martin', codesPostaux: ['66000'], codeDepartement: '66' },
    { code: '11001', nom: 'Saint-Martin', codesPostaux: ['11000'], codeDepartement: '11' },
  ]);
  assert.equal(matches.length, 2);
  assert.notEqual(matches[0].code, matches[1].code);
});
