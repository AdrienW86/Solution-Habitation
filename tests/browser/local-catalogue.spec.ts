import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  visibleLocalDocuments,
  localDocumentPath,
  localProviders,
} from '../../lib/local-editorial';
import { getCommune } from '../../lib/geography';

test('department directory provides incoming links to all manuscripts without publishing missing combinations', async ({
  page,
  request,
}) => {
  const paths = new Set(visibleLocalDocuments().map(localDocumentPath)),
    linked = new Set<string>();
  for (let n = 1; n <= Math.ceil(paths.size / 15); n++) {
    await page.goto(`/territoires/66/dossiers?page=${n}`);
    for (const href of await page
      .locator('main a[href]')
      .evaluateAll((nodes) => nodes.map((a) => a.getAttribute('href')!)))
      if (paths.has(href)) linked.add(href);
  }
  expect([...linked].sort()).toEqual([...paths].sort());
  expect((await request.get('/territoires/66/caixas/couverture')).status()).toBe(404);
  expect((await request.get('/territoires/34/montpellier/nettoyage')).status()).toBe(404);
});

test('manuscripts are complete server-rendered HTML with dynamic providers and noindex before human approval', async ({
  browser,
  request,
}) => {
  test.setTimeout(120_000);
  const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch, baseURL } =
    test.info().project.use;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport,
    userAgent,
    deviceScaleFactor,
    isMobile,
    hasTouch,
    baseURL,
  });
  const page = await context.newPage();
  expect(page.viewportSize()).toEqual(viewport);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  try {
    for (const p of visibleLocalDocuments()) {
      const path = localDocumentPath(p);
      await page.goto(path);
      await expect(page.locator('h1')).toHaveText(p.h1);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
        'href',
        `https://solution-habitation.fr${path}`,
      );
      expect(await page.locator('meta[name=robots]').getAttribute('content')).toContain('noindex');
      await expect(page.locator('.company-result h2')).toHaveText(
        localProviders(p).map((c) => c.name),
      );
      for (const section of p.sections) {
        await expect(page.getByRole('heading', { name: section.heading, exact: true })).toHaveCount(
          1,
        );
        for (const paragraph of section.paragraphs)
          await expect(page.locator('.prose').first()).toContainText(paragraph);
      }
      await page.getByText(p.faqs[0].question, { exact: true }).click();
      await expect(page.getByText(p.faqs[0].answer, { exact: true })).toBeVisible();
      const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
      const service = schemas.map((s) => JSON.parse(s)).find((s) => s['@type'] === 'Service');
      expect(service.areaServed.identifier).toBe(p.communeCode);
      expect(service.provider).toHaveLength(localProviders(p).length);
      expect(sitemap).not.toContain(`https://solution-habitation.fr${path}</loc>`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  } finally {
    await context.close();
  }
});

test('a local manuscript leads to the correct commercial form and remains accessible', async ({
  page,
}) => {
  for (const path of [
    '/territoires/66/dossiers',
    '/territoires/66/bompas/couverture',
    '/territoires/66/canet-en-roussillon/nettoyage',
    '/territoires/66/prades/deratisation',
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, path).toEqual([]);
  }
  await page.goto('/territoires/66/bompas/deratisation');
  await page
    .locator('.company-result')
    .first()
    .getByRole('link', { name: 'Préparer ma demande' })
    .click();
  await expect(page.getByLabel('Expertise *', { exact: true })).toHaveValue('nuisibles');
  await expect(page.getByLabel('Prestation *')).toHaveValue('deratisation');
  await expect(page.getByLabel('Commune *')).toHaveValue('Bompas');
  await expect(page.getByLabel('Enseigne souhaitée')).toHaveValue('express-nuisibles');
  expect(getCommune('66021')?.nom).toBe('Bompas');
});
