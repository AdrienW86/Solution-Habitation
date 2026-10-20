import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function headersFor(mode?: string) {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `if (process.argv[1] === 'unset') delete process.env.NODE_ENV;
       else process.env.NODE_ENV = process.argv[1];
       const { default: config } = await import('./next.config.mjs');
       console.log(JSON.stringify(await config.headers()));`,
      mode ?? 'unset',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as {
    source: string;
    headers: { key: string; value: string }[];
  }[];
}

test('unsafe-eval is exclusive to development and all other security headers remain identical', () => {
  const development = headersFor('development');
  const csp = development[0].headers.find((h) => h.key === 'Content-Security-Policy')!;
  assert.match(csp.value, /script-src [^;]*'unsafe-eval'/);
  const strict = structuredClone(development);
  strict[0].headers.find((h) => h.key === 'Content-Security-Policy')!.value = csp.value.replace(
    " 'unsafe-eval'",
    '',
  );
  for (const mode of ['production', 'test', undefined]) {
    const headers = headersFor(mode);
    assert.deepEqual(headers, strict, `Unexpected policy or security header change in ${mode}`);
    assert.ok(!JSON.stringify(headers).includes('unsafe-eval'));
  }
});
