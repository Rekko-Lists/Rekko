import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('dark navigation keeps search, branding and controls legible', async () => {
  const search = await readFile(new URL('../src/components/ui/common/SearchBar.tsx', import.meta.url), 'utf8');
  const navbar = await readFile(new URL('../src/components/layout/Navbar.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(search, /dark:bg-surface/);
  assert.equal((navbar.match(/<BrandLogo\b/g) || []).length, 2);
  assert.match(css, /:where\(\.dark\) button\.bg-gradient-cta/);
  assert.equal((navbar.match(/dark:bg-border/g) || []).length, 3);
});
