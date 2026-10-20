import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expertises, brands, projects } from '../lib/content';
import { articles } from '../lib/articles';
import { migration, legacyRoutes } from '../lib/migration';
test('six distinct expertise universes and internally consistent brand associations', () => {
  assert.equal(expertises.length, 6);
  assert.equal(new Set(expertises.map((e) => e.id)).size, 6);
  for (const b of brands) {
    assert.ok(expertises.some((e) => e.id === b.expertise));
    if (b.website) assert.ok(b.website.startsWith('https://'));
    if (b.phone) assert.match(b.phone, /^0\d{9}$/);
  }
});
test('editorial titles are distinct, relationships are valid and regulatory guidance is sourced', () => {
  assert.equal(new Set(articles.map((a) => a.title)).size, articles.length);
  assert.equal(new Set(articles.map((a) => a.slug)).size, articles.length);
  for (const a of articles) {
    assert.ok(expertises.some((e) => e.id === a.expertise));
    assert.ok(!a.author);
    if (a.expertise === 'ramonage')
      assert.ok(a.sources.some((s) => new URL(s.url).hostname === 'www.service-public.gouv.fr'));
  }
});
test('no fictitious projects can be published', () => {
  for (const p of projects.filter((p) => p.publish)) {
    assert.ok(p.images.length);
    assert.ok(p.evidence.length);
    assert.ok(brands.some((b) => b.slug === p.brandSlug));
  }
});
test('every legacy URL has an explicit migration decision and redirect destinations exist without chains', () => {
  for (const r of legacyRoutes) {
    if (r.path === '/' || r.path === '/contact') continue;
    const rule = migration(r.path);
    assert.ok(rule, `Missing ${r.path}`);
    if (rule.status === 301) {
      const [destination, fragment] = rule.destination.split('#');
      const e = expertises.find((e) => `/expertises/${e.id}` === destination);
      assert.ok(e, rule.destination);
      if (fragment) assert.ok(e.services.some((s) => s.slug === fragment));
      assert.equal(migration(destination), undefined);
    }
  }
});
test('retired and unknown activities do not redirect to the homepage', () => {
  assert.deepEqual(migration('/exterieur'), { status: 410 });
  assert.equal(migration('/couverture/invente/ville'), undefined);
  assert.equal(migration('/couverture/reparation/perpignan')?.status, 301);
});
