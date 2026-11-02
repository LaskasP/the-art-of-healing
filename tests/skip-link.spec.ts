import { expect, test } from '@playwright/test';

for (const javaScriptEnabled of [true, false]) {
  test(`Biography skip link bypasses navigation without main tabindex (JavaScript ${javaScriptEnabled})`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled });
    try {
      const page = await context.newPage();
      for (const route of ['/bio/', '/en/bio/']) {
        await page.goto(`${baseURL}${route}`);
        const main = page.getByRole('main');
        await expect(main).not.toHaveAttribute('tabindex');
        await page.keyboard.press('Tab');
        const skip = page.locator('.skip-link');
        await expect(skip).toBeFocused();
        await expect(skip).toBeVisible();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(`${baseURL}${route}#main`);
        await page.keyboard.press('Tab');
        await expect(main.getByRole('link').first()).toBeFocused();
        await expect(main.getByRole('link').first()).toBeInViewport();
      }
    } finally {
      await context.close();
    }
  });
}
