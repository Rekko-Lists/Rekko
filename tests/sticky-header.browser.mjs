import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE_PATH || 'playwright-core');
const browser = await chromium.launch({ executablePath: process.env.BRAVE_PATH, headless: true });
try {
  for (const width of [320, 375, 768, 1024]) {
    const page = await browser.newPage({ viewport: { width, height: 700 } });
    await page.goto('http://127.0.0.1:5199/animes', { waitUntil: 'networkidle' });
    await page.locator('nav').first().waitFor();
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '2000px';
      document.querySelector('main .sticky').parentElement.append(spacer);
      window.scrollTo(0, 800);
    });
    const sizes = await page.evaluate(() => {
      const nav = document.querySelector('nav').getBoundingClientRect();
      const filter = document.querySelector('main .sticky').getBoundingClientRect();
      return { navBottom: nav.bottom, filterTop: filter.top, scrollPadding: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) };
    });
    console.log(width, sizes);
    assert.ok(sizes.filterTop >= sizes.navBottom - 0.5, 'sticky filters overlap navigation');
    assert.ok(sizes.scrollPadding >= sizes.navBottom, 'document focus scroll padding is insufficient');
    await page.evaluate(() => {
      const nav = document.querySelector('nav');
      nav.style.paddingBottom = '30px';
    });
    await page.waitForFunction(() => {
      const nav = document.querySelector('nav').getBoundingClientRect();
      return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) >= nav.height;
    });
    const resized = await page.evaluate(() => ({
      navBottom: document.querySelector('nav').getBoundingClientRect().bottom,
      filterTop: document.querySelector('main .sticky').getBoundingClientRect().top,
    }));
    assert.ok(resized.filterTop >= resized.navBottom - 0.5, 'sticky filters overlap after header resize');
    const focused = await page.evaluate(() => {
      const container = document.createElement('div');
      container.style.cssText = 'height:620px;overflow:auto;scroll-padding-top:80px';
      container.innerHTML = '<div style="height:300px"></div><textarea style="scroll-margin-top:80px"></textarea><div style="height:900px"></div>';
      document.querySelector('main .sticky').parentElement.append(container);
      const textarea = container.querySelector('textarea');
      container.scrollTop = 250;
      window.scrollTo(0, window.scrollY + textarea.getBoundingClientRect().top - 50);
      textarea.focus();
      return { top: textarea.getBoundingClientRect().top, navBottom: document.querySelector('nav').getBoundingClientRect().bottom };
    });
    assert.ok(focused.top >= focused.navBottom, 'focused reply is hidden behind navigation');
    await page.close();
  }
} finally {
  await browser.close();
}
