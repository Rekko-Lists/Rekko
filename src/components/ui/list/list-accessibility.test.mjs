import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => null, setItem: noopStorage, removeItem: noopStorage }, configurable: true });
function noopStorage() {}
after(() => server.close());
const load = async (path) => (await server.ssrLoadModule(path)).default;
const entry = {
  userWatchAnimeId: 1, malId: 1, name: 'Example', state: 'WATCHING',
  mediaType: 'tv', animeStatus: 'finished_airing', numEpisodesTotal: 12,
  numEpisodesWatched: 1, userRate: 4, imgMedium: '',
};
const noop = () => {};

test('list row exposes a visible named edit action', async () => {
  const Table = await load('/src/components/ui/list/ListTableView.tsx');
  const html = renderToStaticMarkup(React.createElement(Table, { entries: [entry], onEdit: noop }));
  assert.match(html, /aria-label="Edit Example"/);
  assert.doesNotMatch(html, /opacity-0/);
});

test('editor identifies dialog and every rating including clear', async () => {
  const Editor = await load('/src/components/ui/list/ListEditModal.tsx');
  const html = renderToStaticMarkup(React.createElement(Editor, {
    entry, onClose: noop, onDelete: noop, onUpdateRating: noop, onUpdateState: noop,
  }));
  assert.match(html, /<dialog[^>]*aria-label="Edit Example"/);
  for (let rating = 1; rating <= 10; rating++) {
    assert.match(html, new RegExp(`aria-label="Rate ${rating} out of 10"`));
  }
  assert.match(html, /aria-label="Clear rating"/);
});

test('add and import identify their dialogs', async () => {
  const Add = await load('/src/components/ui/list/AddAnimeModal.tsx');
  const Import = await load('/src/components/ui/import/ImportModal.tsx');
  assert.match(renderToStaticMarkup(React.createElement(Add, { onClose: noop, onAdd: noop, existingMalIds: new Set() })), /<dialog[^>]*aria-label="Add anime"/);
  assert.match(renderToStaticMarkup(React.createElement(Import, { onClose: noop })), /<dialog[^>]*aria-label="Import your list"/);
});

test('card and catalog entries provide keyboard-focusable edit actions', async () => {
  for (const path of ['/src/components/ui/list/ListCardView.tsx', '/src/components/ui/list/ListCatalogView.tsx']) {
    const View = await load(path);
    const html = renderToStaticMarkup(React.createElement(View, { entries: [entry], onEdit: noop }));
    assert.match(html, /role="button"[^>]*tabindex="0"[^>]*aria-label="Edit Example"/);
  }
});
