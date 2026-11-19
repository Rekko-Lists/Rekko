import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Rules identifies overflowing tables as keyboard-scrollable regions", async () => {
  const rules = await readFile(new URL("../src/pages/Rules.tsx", import.meta.url), "utf8");
  assert.match(rules, /scrollWidth\s*>\s*.*clientWidth/);
  assert.match(rules, /ResizeObserver/);
  assert.match(rules, /setAttribute\("tabindex", "0"\)/);
  assert.match(rules, /setAttribute\("role", "region"\)/);
  assert.match(rules, /setAttribute\("aria-label", "Rules summary table"\)/);
  assert.match(rules, /Scroll horizontally/);
  assert.match(rules, /focus-visible:/);
  assert.match(rules, /removeAttribute\("tabindex"\)/);
});
