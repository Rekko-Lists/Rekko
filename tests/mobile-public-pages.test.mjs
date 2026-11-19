import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (path) => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8');

test('mobile global search has its own row and allows result titles to wrap', async () => {
  const navbar = await source('components/layout/Navbar.tsx');
  const search = await source('components/ui/common/SearchBar.tsx');
  assert.match(navbar, /order-last w-full/);
  assert.match(search, /itemTitle: "[^"]*break-words/);
  assert.doesNotMatch(search.match(/itemTitle: "[^"]*"/)[0], /truncate/);
});

test('FAQ announces empty results and accordion state', async () => {
  const faq = await source('pages/Faq.tsx');
  const accordion = await source('components/ui/common/FAQAccordion.tsx');
  assert.match(faq, /filteredFaqs\.length === 0/);
  assert.match(faq, /No matching questions/);
  assert.match(faq, /setSearch\(""\)/);
  assert.match(accordion, /aria-expanded=\{isOpen\}/);
});

test('login fields have persistent associated labels', async () => {
  const login = await source('pages/Login.tsx');
  for (const name of ['email', 'password']) {
    assert.match(login, new RegExp(`htmlFor="${name}"`));
    assert.match(login, new RegExp(`id="${name}"`));
  }
});
