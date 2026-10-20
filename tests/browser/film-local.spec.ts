import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { publishedLocalPages, getCommune } from '../../lib/geography';
import { findCompanies } from '../../lib/network';

test('normal-motion film entrance preserves accessible text contrast', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const path of ['/', '/le-reseau', '/le-film']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations, path).toEqual([]);
  }
});

test('dedicated film page exposes its media without preloading video bytes', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) requests.push(r.url());
  });
  await page.goto('/le-film');
  await expect(page.locator('video')).toHaveAttribute(
    'src',
    '/media/solution-habitation-motion-design.mp4',
  );
  await expect(page.locator('video')).toHaveAttribute('preload', 'none');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
    'href',
    'https://solution-habitation.fr/le-film',
  );
  expect(requests).toHaveLength(0);
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schemas.some((s) => s.includes('VideoObject'))).toBe(false);
});

test('film is demand-loaded, keyboard operable and retains its frame on play and pause', async ({
  page,
}, info) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) requests.push(r.url());
  });
  await page.goto('/');
  const section = page.locator('.film-section');
  const video = section.locator('video');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('img')).toBeVisible();
  await expect
    .poll(() =>
      section
        .locator('img')
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  await expect(video).not.toHaveAttribute('src');
  await expect(video).toHaveAttribute('preload', 'none');
  expect(requests).toHaveLength(0);
  const box = await section.locator('.film-player').boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
  const play = page.getByRole('button', { name: 'Lire le film Solution Habitation' });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0))
    .toBe(true);
  expect(requests.some((url) => url.includes('-720p.mp4'))).toBe(info.project.name === 'mobile');
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).toBeFocused();
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await video.evaluate((v: HTMLVideoElement) => {
    v.muted = true;
  });
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  await video.evaluate((v: HTMLVideoElement) => v.requestFullscreen());
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.evaluate(() => document.exitFullscreen());
  const after = await section.locator('.film-player').boundingBox();
  expect(after!.height).toBeCloseTo(box!.height, 0);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.textTracks.length)).toBe(1);
  await page.getByText('Lire les textes du film', { exact: true }).click();
  await expect(page.locator('.film-transcript')).toContainText('sans voix off');
  await expect(page.locator('.film-transcript')).toContainText('Rénover votre toiture.');
});

test('all town pages expose exact JSON providers, unique canonicals and functioning internal links', async ({
  page,
  request,
}) => {
  test.setTimeout(240_000);
  const visited = new Set<string>();
  const titles = new Set<string>();
  for (const p of publishedLocalPages()) {
    const path = `/territoires/${p.departmentCode}/${p.slug}`;
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    titles.add(await page.title());
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `https://solution-habitation.fr${path}`,
    );
    await expect(page.locator('.company-result h2')).toHaveText(
      findCompanies({ departmentCode: p.departmentCode, communeCode: p.communeCode }).map(
        (c) => c.name,
      ),
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const schema of await page.locator('script[type="application/ld+json"]').allTextContents())
      expect(() => JSON.parse(schema)).not.toThrow();
    const links = await page
      .locator('main a[href^="/"]')
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')!));
    for (const href of links) {
      const url = new URL(href, 'http://127.0.0.1:3000');
      const key = url.pathname + url.search;
      if (visited.has(key)) continue;
      visited.add(key);
      expect((await request.get(key)).ok(), key).toBe(true);
    }
  }
  expect(titles.size).toBe(publishedLocalPages().length);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const p of publishedLocalPages())
    expect(sitemap).toContain(
      `https://solution-habitation.fr/territoires/${p.departmentCode}/${p.slug}</loc>`,
    );
  expect((await request.get('/territoires/66/caixas')).status()).toBe(404);
});

test('local service search and contact preserve town, expertise, service and company', async ({
  page,
}) => {
  await page.goto('/territoires/66/perpignan');
  await page
    .locator('#toiture')
    .getByRole('link', { name: /Les enseignes pour cette prestation/ })
    .first()
    .click();
  await expect(page).toHaveURL('/territoires/66/perpignan/reparation-infiltrations');
  await page
    .locator('.company-result')
    .first()
    .getByRole('link', { name: 'Préparer ma demande' })
    .click();
  await expect(page.getByLabel('Expertise *', { exact: true })).toHaveValue('toiture');
  await expect(page.getByLabel('Prestation *')).toHaveValue('reparation-infiltrations');
  await expect(page.getByLabel('Commune *')).toHaveValue(getCommune('66136')!.nom);
  await expect(page.getByLabel('Enseigne souhaitée')).toHaveValue('couverture-catalane');
  await expect(page.getByRole('button', { name: 'Télécharger mon dossier' })).toBeVisible();
});

test('film and local content meet automated accessibility checks with reduced motion', async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of [
    '/',
    '/le-reseau',
    '/le-film',
    ...publishedLocalPages().map((p) => `/territoires/${p.departmentCode}/${p.slug}`),
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, path).toEqual([]);
  }
  await page.goto('/');
  await expect(page.locator('.film-intro')).toHaveCSS('animation-name', 'none');
  await page.locator('.film-section').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator('.film-section img')
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  await page.locator('.film-section').screenshot({
    path: `artifacts/film-${test.info().project.name}.png`,
  });
  await page.goto('/territoires/66/perpignan');
  await page.screenshot({
    path: `artifacts/local-${test.info().project.name}.png`,
    fullPage: true,
  });
});
