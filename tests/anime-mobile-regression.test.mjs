import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (name) => readFile(new URL(`../src/components/ui/${name}`, import.meta.url), 'utf8');

test('catalogue controls wrap without clipping on narrow screens', async () => {
  const nav = await source('filter/SubNav.tsx');
  const filter = await source('filter/QuickFilter.tsx');
  assert.match(nav, /tabs:.*flex-wrap/);
  assert.match(filter, /addLine:.*flex-wrap/);
  assert.match(filter, /applyBtn:.*min-h-\[44px\].*whitespace-nowrap/);
});

test('episode total cannot wrap or shrink inside its pill', async () => {
  const episode = await source('anime-detail/EpisodeRatingInputs.tsx');
  assert.match(episode, /pill:.*shrink-0.*whitespace-nowrap/);
  assert.match(episode, /pillTotal:.*whitespace-nowrap/);
});

test('recommendations render each post once and stop at the ends', async () => {
  const carousel = await source('anime-detail/PostsCarousel.tsx');
  assert.match(carousel, /posts\.map\(\(post/);
  assert.doesNotMatch(carousel, /carouselPosts/);
  assert.match(carousel, /disabled=\{visualIndex === 0\}/);
  assert.match(carousel, /disabled=\{visualIndex >= posts\.length - 1\}/);
});
