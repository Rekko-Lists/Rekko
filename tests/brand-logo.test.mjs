import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

test('theme-aware brand logos use both original and dark artwork without a halo', async () => {
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
  const component = await readFile(new URL('../src/components/ui/common/BrandLogo.tsx', import.meta.url), 'utf8');
  assert.match(component, /rekko_logo\.png/);
  assert.match(component, /rekko_logo_dark\.png/);
  assert.match(component, /dark:hidden/);
  assert.match(component, /dark:block/);
  assert.doesNotMatch(css, /rekko-brand-logo[\s\S]*?drop-shadow/);
  await access(new URL('../src/assets/rekko_logo_dark.png', import.meta.url));
  for (const path of ['../src/components/layout/Navbar.tsx', '../src/components/ui/anime-detail/PersonalRecommendation.tsx', '../src/pages/AdminPanel.tsx']) {
    assert.match(await readFile(new URL(path, import.meta.url), 'utf8'), /<BrandLogo\b/);
  }
});
