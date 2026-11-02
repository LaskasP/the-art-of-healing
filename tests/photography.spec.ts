import { expect, test } from '@playwright/test';

for (const language of ['el', 'en']) {
  test(`${language}: photographs load and pages fit mobile, tablet and desktop`, async ({ page, baseURL }) => {
    const prefix = language === 'en' ? '/en' : '';
    for (const route of ['', '/bio', '/services', '/contact']) {
      await page.goto(`${baseURL}${prefix}${route}/`);
      const images = page.locator('main img');
      expect(await images.count()).toBeGreaterThan(0);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveAttribute('alt', /\p{L}{3,}/u);
        await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
        const source = await image.evaluate((element: HTMLImageElement) => element.currentSrc);
        expect(source.startsWith(`${baseURL}/`)).toBe(true);
        expect((await page.request.get(source)).ok()).toBe(true);
      }
      for (const width of [375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route || '/'} at ${width}px`).toBe(true);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      }
    }
  });
}
