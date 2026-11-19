import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (path) => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8');

test('social link input can shrink in its row', async () => {
  assert.match(await source('pages/Settings.tsx'), /linkInput:.*min-w-0/);
});

test('anime results stay in the scrollable modal and support click activation', async () => {
  const modal = await source('components/ui/post/CreatePostModal.tsx');
  assert.doesNotMatch(modal, /createPortal/);
  assert.match(modal, /resultsRef\.current\?\.scrollIntoView/);
  assert.match(modal, /onClick=\{\(\) => addAnime\(anime\)\}/);
  assert.match(modal, /max-h-48 overflow-y-auto/);
});

test('selecting an anime restores focus without blocking touch activation', async () => {
  const modal = await source('components/ui/post/CreatePostModal.tsx');
  assert.match(modal, /ref=\{animeInputRef\}/);
  assert.match(modal, /animeInputRef\.current\?\.focus\(\)/);
  assert.match(modal, /cancelButtonRef\.current\?\.focus\(\)/);
  assert.match(modal, /ref=\{cancelButtonRef\}/);
  assert.doesNotMatch(modal, /on(?:Mouse|Pointer|Touch)Down=\{[^}]*preventDefault/);
});

test('post menus and reply controls have larger targets and focus clearance', async () => {
  const card = await source('components/ui/feed/PostCard.tsx');
  const article = await source('components/ui/post-detail/PostDetailArticle.tsx');
  const comments = await source('components/ui/post-detail/CommentsVirtualList.tsx');
  assert.match(card, /menu:.*min-w-11 min-h-11/);
  assert.match(article, /menuBtn:.*min-w-11 min-h-11/);
  assert.match(comments, /replyBtn:.*min-h-11 min-w-11 scroll-mt-20/);
  assert.match(comments, /replyInput:.*scroll-mt-20/);
});
