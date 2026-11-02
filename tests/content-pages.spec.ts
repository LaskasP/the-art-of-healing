import { expect, test } from '@playwright/test';

for (const language of [
  { lang: 'el', prefix: '', biography: 'Βιογραφικό', services: 'Υπηρεσίες', home: 'Αρχική', unfinished: 'Υπηρεσίες υπό διαμόρφωση', placeholder: 'Θέση για εγκεκριμένο βιογραφικό', switchName: 'Read this page in English', alternate: '/en' },
  { lang: 'en', prefix: '/en', biography: 'Biography', services: 'Services', home: 'Home', unfinished: 'Services under construction', placeholder: 'Placeholder for approved biography', switchName: 'Διαβάστε αυτή τη σελίδα στα Ελληνικά', alternate: '' },
]) {
  for (const route of ['bio', 'services']) {
    test(`${language.lang}: ${route} opens directly with localized navigation and equivalent switching`, async ({ page, baseURL }) => {
      const response = await page.goto(`${baseURL}${language.prefix}/${route}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', language.lang);
      const name = route === 'bio' ? language.biography : language.services;
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
      await expect(page).toHaveTitle(new RegExp(`^${name} \\|`));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
      const navigation = page.getByRole('navigation');
      await expect(navigation.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'page');
      await navigation.getByRole('link', { name: language.home, exact: true }).click();
      await expect(page).toHaveURL(`${baseURL}${language.prefix}/`);
      await page.getByRole('navigation').getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(`${baseURL}${language.prefix}/${route}/`);
      await page.getByRole('link', { name: language.switchName }).click();
      await expect(page).toHaveURL(`${baseURL}${language.alternate}/${route}/`);
    });
  }

  test(`${language.lang}: Biography clearly marks unfinished professional content`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}${language.prefix}/bio/`);
    await expect(page.getByRole('heading', { name: language.placeholder })).toBeVisible();
  });

  test(`${language.lang}: Services graphic loads with an alternative and stable responsive layout`, async ({ page, baseURL }, testInfo) => {
    await page.goto(`${baseURL}${language.prefix}/services/`);
    await expect(page.getByRole('heading', { name: language.unfinished })).toBeVisible();
    const graphic = page.getByRole('img', { name: language.unfinished });
    await expect(graphic).toBeVisible();
    await expect(graphic).toHaveAttribute('width', '480');
    await expect(graphic).toHaveAttribute('height', '240');
    expect(await graphic.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath('services-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 320, height: 700 });
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    await expect(graphic).toBeVisible();
    await expect(page.getByRole('link', { name: language.switchName })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath('services-mobile.png'), fullPage: true });
  });
}
