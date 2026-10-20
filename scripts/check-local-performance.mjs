import { chromium, devices } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const browser = await chromium.launch();
const samples = [];
for (const path of [
  '/territoires/66/dossiers',
  '/territoires/66/bompas/couverture',
  '/territoires/66/bompas/deratisation',
  '/territoires/66/bompas/nettoyage',
]) {
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    defaultBrowserType: 'chromium',
  });
  const page = await context.newPage(),
    session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 40,
    downloadThroughput: 4e6 / 8,
    uploadThroughput: 1e6 / 8,
  });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.localMetrics = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.localMetrics.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.localMetrics.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  samples.push({
    path,
    ...(await page.evaluate(() => ({
      ...window.localMetrics,
      ttfb: performance.getEntriesByType('navigation')[0].responseStart,
      transferredBytes: performance
        .getEntriesByType('resource')
        .reduce((n, r) => n + r.transferSize, 0),
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    }))),
  });
  await context.close();
}
await browser.close();
const report = {
  environment:
    'Production locale, Chromium iPhone 13, réseau 4 Mbps/40 ms, CPU x4. Mesures de laboratoire ponctuelles, sans garantie de terrain.',
  samples,
};
writeFileSync('docs/local-performance.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
