import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('artifacts', { recursive: true });
const base = 'http://127.0.0.1:3000';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
const queue = [
  '/contact',
  '/confidentialite',
  '/informations',
  '/accessibilite',
  ...Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g), (m) => new URL(m[1]).pathname),
];
const visited = new Set();
const links = new Set();
const pages = [];
const broken = [];
for (const path of queue) {
  if (visited.has(path)) continue;
  visited.add(path);
  const response = await page.goto(base + path, { waitUntil: 'networkidle' });
  const title = await page.title();
  const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  pages.push({
    path,
    status: response.status(),
    title,
    canonical,
    h1: await page.locator('h1').count(),
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  });
  for (const href of await page
    .locator('a[href]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href'))))
    if (href?.startsWith('/')) links.add(href);
}
for (const href of links) {
  const url = new URL(href, base);
  const response = await fetch(url);
  if (response.status >= 400) broken.push({ href, status: response.status });
}
const titles = pages.map((p) => p.title);
const duplicateTitles = titles.filter((v, i) => titles.indexOf(v) !== i);
const report = { pages, internalLinks: links.size, broken, duplicateTitles };
writeFileSync('artifacts/audit-site.json', JSON.stringify(report, null, 2));
await page.goto(base, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'artifacts/home-desktop-viewport.png' });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'artifacts/home-mobile-viewport.png' });
await browser.close();
console.log(
  JSON.stringify({
    pages: pages.length,
    links: links.size,
    broken,
    duplicateTitles,
    violations: pages
      .filter((p) => p.violations.length)
      .map((p) => ({ path: p.path, violations: p.violations })),
  }),
);
