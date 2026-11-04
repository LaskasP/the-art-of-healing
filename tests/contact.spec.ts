import { expect, test } from '@playwright/test';
import copy from '../src/content/contact.json' with { type: 'json' };

for (const language of [
  { lang: 'el', route: '/contact/', alternate: '/en/contact/', name: 'Επικοινωνία', home: 'Αρχική', switchName: 'Read this page in English', address: 'Σκυλίτση 8, Πειραιάς 18532, 2ος όροφος', hours: 'Δευτέρα–Παρασκευή, 09:00–17:00', sessions: 'Ελληνικά και Αγγλικά.' },
  { lang: 'en', route: '/en/contact/', alternate: '/contact/', name: 'Contact', home: 'Home', switchName: 'Διαβάστε αυτή τη σελίδα στα Ελληνικά', address: '8 Skylitsi Street, Piraeus 18532, 2nd floor', hours: 'Monday–Friday, 09:00–17:00', sessions: 'Greek and English.' },
] as const) {
  test(`${language.lang}: Contact supplies verified details and switches to its equivalent`, async ({ page, baseURL }, testInfo) => {
    const response = await page.goto(`${baseURL}${language.route}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', language.lang);
    await expect(page).toHaveTitle(copy[language.lang].title);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(copy[language.lang].heading);
    await expect(page.getByRole('definition')).toHaveCount(5);
    await expect(page.locator('main address')).toHaveText(language.address);
    await expect(page.getByRole('definition').filter({ hasText: language.hours })).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: language.sessions })).toBeVisible();
    await expect(page.locator('a[href^="tel:"]')).toHaveAttribute('href', 'tel:+306980337500');
    await expect(page.locator('a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:xenpett@gmail.com');
    const officeDetails = page.getByRole('definition').filter({ hasText: language.address });
    const directions = officeDetails.getByRole('link', { name: copy[language.lang].directionsLink });
    await expect(directions).toHaveAttribute('href', 'https://maps.app.goo.gl/V2SGa18JEkdT6bgG8');
    await directions.focus();
    await expect(directions).toBeFocused();
    await expect(directions).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('main')).not.toContainText(/Athens office|γραφείο στην Αθήνα|Not yet supplied|Δεν έχει δοθεί ακόμη/);
    await expect(page.locator('iframe, form')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('contact-desktop.png'), fullPage: true });
    const navigation = page.getByRole('navigation');
    await expect(navigation.getByRole('link', { name: language.name, exact: true })).toHaveAttribute('aria-current', 'page');
    await navigation.getByRole('link', { name: language.home, exact: true }).click();
    await page.getByRole('navigation').getByRole('link', { name: language.name, exact: true }).click();
    await expect(page).toHaveURL(`${baseURL}${language.route}`);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: testInfo.outputPath('contact-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 320, height: 700 });
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole('link', { name: language.switchName }).click();
    await expect(page).toHaveURL(`${baseURL}${language.alternate}`);
  });
}
