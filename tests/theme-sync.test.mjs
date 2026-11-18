import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

async function loadTheme() {
  const source = await readFile(new URL('../src/lib/theme.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const classes = new Set();
  const values = new Map();
  const root = { dataset: {}, classList: {
    contains: name => classes.has(name),
    toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
  } };
  const exports = {};
  vm.runInNewContext(code, {
    exports, document: { documentElement: root },
    localStorage: { setItem: (key, value) => values.set(key, value) }
  });
  return { ...exports, root, values, classes };
}

test('account theme updates the page and local cache', async () => {
  const theme = await loadTheme();
  theme.applyTheme(true);
  assert.equal(theme.classes.has('dark'), true);
  assert.equal(theme.root.dataset.theme, 'rekkoDark');
  assert.equal(theme.values.get('rekko-theme'), 'dark');
});

test('failed remote update restores previous theme', async () => {
  const theme = await loadTheme();
  theme.applyTheme(false);
  await assert.rejects(theme.saveTheme(true, async () => { throw new Error('network'); }));
  assert.equal(theme.classes.has('dark'), false);
  assert.equal(theme.values.get('rekko-theme'), 'light');
});

test('successful remote update keeps the selected theme', async () => {
  const theme = await loadTheme();
  let saved;
  await theme.saveTheme(true, async value => { saved = value; });
  assert.equal(saved, true);
  assert.equal(theme.classes.has('dark'), true);
});
