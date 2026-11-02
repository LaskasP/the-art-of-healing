import { expect, test } from '@playwright/test';

for (const width of [375, 1440]) {
  test(`${width}px: navigation is styled and stable from its first paint`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 900 });
    // Make late, JavaScript-injected styles visible even on a fast local server.
    await page.route('**/*', async route => {
      if (route.request().resourceType() === 'script') {
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      await route.continue();
    });
    await page.addInitScript(() => {
      const samples: { time: number; headerHeight: number; headingWidth: number; font: string }[] = [];
      Object.assign(window, { navigationPaintSamples: samples });
      const sample = () => {
        const header = document.querySelector('.site-header');
        const heading = document.querySelector('h1');
        if (header && heading) samples.push({
          time: performance.now(),
          headerHeight: header.getBoundingClientRect().height,
          headingWidth: heading.getBoundingClientRect().width,
          font: getComputedStyle(heading).fontFamily,
        });
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    for (const route of ['/', '/en/']) {
      if (route === '/') await page.goto(`${baseURL}/`);
      else {
        await page.getByRole('link', { name: 'Read this page in English' }).click();
        await expect(page).toHaveURL(`${baseURL}/en/`);
        await page.waitForLoadState('load');
      }
      // Allow rendering to settle after load before comparing with first paint.
      await page.waitForTimeout(300);
      const samples = await page.evaluate(() => {
        const paint = performance.getEntriesByName('first-contentful-paint')[0];
        const frames = (window as unknown as { navigationPaintSamples: { time: number; headerHeight: number; headingWidth: number; font: string }[] }).navigationPaintSamples;
        return paint ? frames.filter(frame => frame.time >= paint.startTime) : [];
      });
      expect(samples.length).toBeGreaterThan(1);
      const final = samples.at(-1)!;
      for (const frame of samples) {
        expect(frame.font).toBe(final.font);
        expect(Math.abs(frame.headingWidth - final.headingWidth)).toBeLessThan(1);
        expect(Math.abs(frame.headerHeight - final.headerHeight)).toBeLessThan(1);
      }
    }
  });
}
