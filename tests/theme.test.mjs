import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

async function initializeTheme(value) {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  const classes = new Set();
  const root = { classList: { add: name => classes.add(name) }, dataset: { theme: 'rekko' } };
  runInNewContext(script, {
    localStorage: { getItem: () => value },
    document: { documentElement: root },
  });
  return { classes, theme: root.dataset.theme };
}

test('defaults to light', async () => {
  const result = await initializeTheme(null);
  assert.equal(result.classes.has('dark'), false);
  assert.equal(result.theme, 'rekko');
});

test('restores dark theme', async () => {
  const result = await initializeTheme('dark');
  assert.equal(result.classes.has('dark'), true);
  assert.equal(result.theme, 'rekkoDark');
});
