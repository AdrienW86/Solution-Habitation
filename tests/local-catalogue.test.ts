import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import {
  readLocalDocuments,
  eligibleLocalCombinations,
  localIndexEligibility,
  localDocumentSchema,
  localProviders,
  localDocumentPath,
} from '../lib/local-editorial';
import { activeCommunes, legacyServiceIndexEligible } from '../lib/geography';
import { network, findCompanies } from '../lib/network';
import { normalizedText, shingles, similarity, prose } from '../lib/local-quality';
import { mediaFingerprint, imageDistance } from '../lib/media-fingerprint';

test('owner confirmation supplies the six real companies in all 226 communes without extending unrelated professions', () => {
  const combinations = eligibleLocalCombinations();
  assert.equal(combinations.filter((p) => p.departmentCode === '66').length, 678);
  assert.equal(combinations.filter((p) => p.departmentCode === '11').length, 433);
  assert.equal(combinations.filter((p) => p.departmentCode === '34').length, 0);
  for (const c of activeCommunes().filter((c) => c.codeDepartement === '66')) {
    assert.equal(
      findCompanies({ expertise: 'toiture', departmentCode: '66', communeCode: c.code }).length,
      3,
    );
    assert.equal(
      findCompanies({
        expertise: 'nuisibles',
        service: 'deratisation',
        departmentCode: '66',
        communeCode: c.code,
      }).length,
      2,
    );
    assert.equal(
      findCompanies({ expertise: 'nettoyage', departmentCode: '66', communeCode: c.code }).length,
      1,
    );
    if (c.code !== '66136')
      assert.equal(
        findCompanies({ expertise: 'peinture-facades', departmentCode: '66', communeCode: c.code })
          .length,
        0,
      );
  }
});
test('commercial JSON is independent from manuscripts and all written pages are complete but awaiting human review', () => {
  const commercial = JSON.parse(readFileSync('data/reseau.json', 'utf8'));
  assert.equal(commercial.localPages, undefined);
  assert.equal(commercial.localServicePages, undefined);
  const docs = readLocalDocuments();
  assert.equal(docs.length, 48);
  assert.equal(new Set(docs.map((p) => p.communeCode)).size, 16);
  assert.equal(new Set(docs.map(localDocumentPath)).size, 48);
  for (const p of docs) {
    assert.equal(p.status, 'review');
    assert.equal(p.humanReview, null);
    assert.equal(localIndexEligibility(p).eligible, false);
    assert.ok(localIndexEligibility(p).words >= 350);
    assert.equal(p.sections.length, 4);
    assert.equal(p.faqs.length, 2);
    assert.ok(p.sources.every((s) => s.checkedAt === p.revisedAt));
    assert.ok(!prose(p).includes('[VILLE]'));
    assert.ok(
      !network.companies.some((c) => prose(p).includes(c.name)),
      'provider names must remain dynamic',
    );
  }
});
test('publication requires explicit human review and a current matching provider', () => {
  const p = structuredClone(readLocalDocuments()[0]);
  assert.equal(localDocumentSchema.safeParse({ ...p, status: 'published' }).success, false);
  assert.ok(
    localDocumentSchema.safeParse({
      ...p,
      status: 'draft',
      intro: '',
      description: '',
      sections: [],
      faqs: [],
      sources: [],
      guides: [],
    }).success,
    'incomplete drafts may be stored without becoming visible',
  );
  p.humanReview = {
    reviewer: 'Responsable de publication — test seulement',
    date: '2026-10-20',
    approved: true,
    localFactsChecked: true,
    utilityChecked: true,
  };
  p.status = 'published';
  assert.ok(localDocumentSchema.safeParse(p).success);
  assert.ok(localIndexEligibility(p).eligible);
  const config = structuredClone(network);
  for (const company of config.companies) company.active = false;
  assert.equal(localProviders(p, config).length, 0);
  assert.ok(localIndexEligibility(p, config).reasons.includes('prestation_non_couverte'));
  assert.equal(localIndexEligibility({ ...p, communeCode: '66999' }).eligible, false);
});
test('similarity audit catches city substitution and treats unrelated plans differently', () => {
  const original =
    'Préparer une réparation de couverture dans un bâtiment avec une extension à Bompas exige de vérifier les accès avant le rendez-vous.';
  const substituted = original.replace('Bompas', 'Prades');
  const names = ['Bompas', 'Prades'];
  assert.equal(normalizedText(original, names), normalizedText(substituted, names));
  assert.equal(
    similarity(
      shingles(normalizedText(original, names)),
      shingles(normalizedText(substituted, names)),
    ),
    1,
  );
  assert.ok(
    similarity(
      shingles(original),
      shingles(
        'Un bureau contient des documents et des surfaces fragiles pour organiser son nettoyage.',
      ),
    ) < 0.1,
  );
});
test('short legacy service dossiers cannot bypass the human publication gate', () => {
  for (const p of network.localServicePages) assert.equal(legacyServiceIndexEligible(p), false);
  const p = structuredClone(network.localServicePages[0]);
  p.humanReview = { reviewer: 'Relecteur de test', date: '2026-10-20', approved: true };
  assert.equal(
    legacyServiceIndexEligible(p),
    false,
    'approval alone does not complete a short dossier',
  );
});
test('image audit detects an identical visual under changed encoding or filename', async () => {
  const first = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#0071af"/><circle cx="24" cy="20" r="12" fill="white"/></svg>',
  );
  const second = await sharp(first).png().toBuffer();
  const a = await mediaFingerprint(first),
    b = await mediaFingerprint(second);
  assert.notEqual(a.byteHash, b.byteHash);
  assert.equal(a.pixelHash, b.pixelHash);
  assert.equal(imageDistance(a.differenceHash, b.differenceHash), 0);
});
