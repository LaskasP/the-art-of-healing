import { expect, test } from '@playwright/test';

for (const language of [
  { prefix: '', label: 'Δείτε το προφίλ στο Instagram' },
  { prefix: '/en', label: 'View Instagram profile' },
]) {
  test(`${language.prefix || 'el'}: Instagram is available only in the footer without JavaScript`, async ({ browser, baseURL }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    for (const route of ['', '/bio', '/services', '/contact']) {
      await page.goto(`${baseURL}${language.prefix}${route}/`);
      const link = page.getByRole('link', { name: `${language.label} · @theartofhealing_psy`, exact: true });
      await expect(link).toHaveAttribute('href', 'https://www.instagram.com/theartofhealing_psy');
      await expect(page.locator('footer').getByRole('link')).toHaveCount(1);
      await expect(page.locator('header, main').getByRole('link', { name: /Instagram/ })).toHaveCount(0);
      await expect(page.locator('#instagram-prototype')).toHaveCount(0);
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      const link = page.locator('.footer-instagram');
      await link.scrollIntoViewIfNeeded();
      await link.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(link).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`footer-${width}.png`) });
    }
    await context.close();
  });
}
