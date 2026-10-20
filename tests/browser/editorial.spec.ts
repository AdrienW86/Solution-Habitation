import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { articles } from '../../lib/articles';
import { expertises } from '../../lib/expertises';
import { publishedLocalServicePages, localServicePath } from '../../lib/geography';
import { activeDepartments, findCompanies } from '../../lib/network';
import { networkIndexPaths } from '../../lib/network-index';

test('all editorial and territorial routes expose unique SEO metadata and valid internal links', async ({
  request,
}) => {
  test.setTimeout(120_000);
  const paths = [
    '/regions/occitanie',
    ...articles.map((a) => `/conseils/${a.slug}`),
    ...expertises.flatMap((e) => e.services.map((s) => `/expertises/${e.id}/${s.slug}`)),
    ...publishedLocalServicePages().map((p) => localServicePath(p)),
    ...activeDepartments().flatMap((d) =>
      expertises
        .filter((e) => findCompanies({ departmentCode: d.code, expertise: e.id }).length)
        .map((e) => `/territoires/${d.code}/expertises/${e.id}`),
    ),
  ];
  const titles = new Set<string>(),
    descriptions = new Set<string>(),
    visited = new Set(paths);
  for (const path of paths) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    expect(response.headers()['x-robots-tag']).toContain('noindex');
    const html = await response.text();
    expect((html.match(/<h1\b/g) ?? []).length, path).toBe(1);
    expect(html, path).toContain(`href="https://solution-habitation.fr${path}"`);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    expect(title, path).toBeTruthy();
    expect(description, path).toBeTruthy();
    expect(titles.has(title!), path).toBe(false);
    expect(descriptions.has(description!), path).toBe(false);
    titles.add(title!);
    descriptions.add(description!);
    for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))
      expect(() => JSON.parse(match[1]), path).not.toThrow();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
    for (const match of main.matchAll(/href="(\/(?!\/)[^"#]*)/g)) {
      const href = match[1].replaceAll('&amp;', '&');
      if (visited.has(href)) continue;
      visited.add(href);
      expect((await request.get(href)).ok(), `${path} → ${href}`).toBe(true);
    }
  }
});

test('regional presentation separates actual coverage and keeps Herault honest', async ({
  page,
}) => {
  await page.goto('/regions/occitanie');
  const departments = page.locator('.regional-group > div > section');
  await expect(departments).toHaveCount(3);
  await expect(departments.filter({ hasText: 'Aude' }).locator('.brand-card')).toHaveCount(1);
  await expect(departments.filter({ hasText: 'Hérault' })).toContainText('Aucune enseigne');
  await expect(departments.filter({ hasText: 'Hérault' }).locator('.brand-card')).toHaveCount(0);
  await page.goto('/territoires/11/narbonne/zinguerie');
  await expect(page.locator('.company-result h2')).toHaveText(['Narbonne Toiture']);
  await page.goto('/territoires/34/montpellier/zinguerie');
  await expect(page.locator('h1')).toContainText('introuvable');
});

test('guides and prestations use distinct, loaded topic illustrations', async ({
  page,
  request,
}) => {
  const imagePaths = new Set<string>();
  for (const article of articles) {
    expect(imagePaths.has(article.image), article.slug).toBe(false);
    imagePaths.add(article.image);
    const asset = await request.get(article.image);
    expect(asset.ok(), article.image).toBe(true);
    expect(asset.headers()['content-type']).toContain('image/svg+xml');
  }
  for (const path of [
    '/conseils/rongeurs-indices',
    '/expertises/toiture/zinguerie',
    '/expertises/climatisation-mobile/besoin-temporaire',
  ]) {
    await page.goto(path);
    const images = page.locator('main img[src*="/images/editorial/"]');
    expect(await images.count()).toBeGreaterThan(0);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
        .toBe(true);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      path,
    ).toBe(true);
  }
});

test('unsupported services are useful advisory pages excluded from the sitemap', async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const unsupported = expertises
    .flatMap((e) => e.services.map((s) => `/expertises/${e.id}/${s.slug}`))
    .filter((path) => !networkIndexPaths().includes(path));
  expect(unsupported).toHaveLength(7);
  for (const path of unsupported) {
    await page.goto(path);
    await expect(
      page.getByText('Aucune entreprise n’est actuellement référencée pour cette prestation.', {
        exact: false,
      }),
    ).toBeVisible();
    expect(sitemap).not.toContain(`https://solution-habitation.fr${path}</loc>`);
  }
});

test('new regional, service and guide pages satisfy accessibility and responsive layout', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const path of [
    '/regions/occitanie',
    '/territoires/11/expertises/toiture',
    '/territoires/66/perpignan/deratisation',
    '/conseils/ramonage-preparer-acces',
    '/expertises/toiture/zinguerie',
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, path).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      path,
    ).toBe(true);
  }
  await page.screenshot({
    path: `artifacts/editorial-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test('local download retains source, navigation, town and service without sending any message', async ({
  page,
}) => {
  const posted: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().includes('/api/contact')) posted.push(r.url());
  });
  await page.goto('/territoires/66/perpignan/zinguerie');
  await page
    .locator('.company-result')
    .first()
    .getByRole('link', { name: 'Préparer ma demande' })
    .click();
  await page.getByLabel('Nom et prénom *').fill('Test Dossier');
  await page.getByLabel('E-mail *', { exact: true }).fill('dossier@example.org');
  await page.getByLabel('Téléphone *').fill('0662125611');
  await page
    .getByLabel('Votre besoin, les lieux et les contraintes *')
    .fill('La gouttière déborde, accès possible depuis la cour.');
  await page.getByRole('checkbox').check();
  const promise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger mon dossier' }).click();
  const download = await promise;
  const file = `artifacts/context-${test.info().project.name}.txt`;
  await download.saveAs(file);
  const text = await readFile(file, 'utf8');
  for (const value of [
    'Zinguerie',
    'Perpignan',
    '66136',
    'Département : 66',
    'Couverture Catalane',
    'Provenance : /territoires/66/perpignan/zinguerie',
    'Parcours :',
  ])
    expect(text).toContain(value);
  expect(posted).toHaveLength(0);
  await expect(page.getByRole('status')).toContainText('Il n’a pas été envoyé');
});
