import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { network } from '../lib/network';
test('build validation rejects missing logo files and nonexistent INSEE codes', () => {
  mkdirSync('artifacts', { recursive: true });
  const fixture = `artifacts/network-check-${randomUUID()}.json`;
  try {
    for (const kind of ['logo', 'commune']) {
      const config = structuredClone(network);
      if (kind === 'logo') config.companies[0].logo!.src = '/images/enseignes/fichier-absent.png';
      else
        config.companies[0].coverage = [
          {
            departmentCode: '66',
            mode: 'communes',
            communeCodes: ['66999'],
            proof: config.companies[0].profileSource,
          },
        ];
      writeFileSync(fixture, JSON.stringify(config));
      const result = spawnSync(
        process.execPath,
        ['--import', 'tsx', 'scripts/validate-network.ts', fixture],
        { encoding: 'utf8' },
      );
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, kind === 'logo' ? /Logo absent/ : /Code INSEE inconnu/);
    }
  } finally {
    unlinkSync(fixture);
  }
});
