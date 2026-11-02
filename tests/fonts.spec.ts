import { expect, test } from '@playwright/test';

for (const route of ['/', '/en/']) {
  test(`${route}: Greek and English fonts load from the site without third-party requests`, async ({ page, baseURL }) => {
    const external: string[] = [];
    const fonts: string[] = [];
    await page.route('**/*', async request => {
      const url = new URL(request.request().url());
      if (url.origin !== new URL(baseURL!).origin) {
        external.push(url.href);
        await request.abort();
      } else await request.continue();
    });
    page.on('response', response => {
      if (response.url().endsWith('.woff2') && response.ok()) fonts.push(response.url());
    });
    await page.goto(`${baseURL}${route}`);
    const loaded = await page.evaluate(async () => {
      const sample = 'Ελληνικά Αθήνα English';
      const sans = await document.fonts.load('400 16px "Noto Sans"', sample);
      const bold = await document.fonts.load('600 16px "Noto Sans"', sample);
      const serif = await document.fonts.load('400 32px "Noto Serif"', sample);
      return [sans.length, bold.length, serif.length];
    });
    expect(loaded.every(count => count >= 2)).toBeTruthy();
    expect(fonts.length).toBeGreaterThanOrEqual(4);
    expect(fonts.every(url => url.startsWith(`${baseURL}/`))).toBeTruthy();
    expect(external).toEqual([]);
    await expect(page.locator('h1')).toHaveCSS('font-family', /Noto Serif/);
    await expect(page.locator('body')).toHaveCSS('font-family', /Noto Sans/);
  });
}
