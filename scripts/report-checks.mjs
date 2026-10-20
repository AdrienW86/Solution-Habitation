import { readFileSync, writeFileSync } from 'node:fs';
const perf = JSON.parse(readFileSync('artifacts/lighthouse-mobile.json', 'utf8'));
const audit = JSON.parse(readFileSync('artifacts/audit-site.json', 'utf8'));
const summary = {
  lighthouse: {
    categories: Object.fromEntries(
      Object.entries(perf.categories).map(([k, v]) => [k, v.score * 100]),
    ),
    metrics: Object.fromEntries(
      [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift',
        'speed-index',
      ].map((k) => [
        k,
        { value: perf.audits[k].numericValue, display: perf.audits[k].displayValue },
      ]),
    ),
    warnings: perf.runWarnings,
    failed: Object.values(perf.audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative')
      .map((a) => ({ id: a.id, title: a.title, display: a.displayValue })),
  },
  crawl: {
    pages: audit.pages.length,
    internalLinks: audit.internalLinks,
    broken: audit.broken,
    duplicateTitles: audit.duplicateTitles,
    accessibilityViolations: audit.pages.filter((p) => p.violations.length).length,
  },
};
writeFileSync('docs/validation-summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
