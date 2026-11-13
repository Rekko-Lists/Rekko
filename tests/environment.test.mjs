import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfigFromFile } from 'vite';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

test('frontend selects matching API and Discord values for NODE_ENV', async () => {
  const previous = { ...process.env };
  const cwd = process.cwd();
  const configPath = resolve(cwd, 'vite.config.ts');
  const dir = mkdtempSync(join(tmpdir(), 'rekko-env-test-'));
  try {
    Object.assign(process.env, {
      VITE_API_BASE_URL_DEV: 'http://localhost:5000',
      VITE_API_BASE_URL_PROD: 'https://api.example.test',
      VITE_DISCORD_CLIENT_ID_DEV: 'dev-client',
      VITE_DISCORD_CLIENT_ID_PROD: 'prod-client',
      VITE_DISCORD_REDIRECT_URI_DEV: 'http://localhost:5173/callback',
      VITE_DISCORD_REDIRECT_URI_PROD: 'https://app.example.test/callback',
    });
    for (const [environment, suffix] of [['development', 'DEV'], ['production', 'PROD']]) {
      process.env.NODE_ENV = environment;
      writeFileSync(join(dir, '.env'), `NODE_ENV=${environment}\n`);
      process.chdir(dir);
      const result = await loadConfigFromFile({ command: 'build', mode: environment }, configPath);
      for (const name of ['VITE_API_BASE_URL', 'VITE_DISCORD_CLIENT_ID', 'VITE_DISCORD_REDIRECT_URI']) {
        assert.equal(JSON.parse(result.config.define[`import.meta.env.${name}`]), process.env[`${name}_${suffix}`]);
      }
    }
  } finally {
    process.env = previous;
    process.chdir(cwd);
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* Windows may retain a temporary handle. */ }
  }
});
