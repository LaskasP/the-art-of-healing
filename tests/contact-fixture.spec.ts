import { expect, test } from '@playwright/test';

for (const language of [
  { route: '/contact/', address: 'ΔΟΚΙΜΗ — Οδός Παραδείγματος 1, Αθήνα', hours: 'ΔΟΚΙΜΗ — Δευτέρα 09:00–10:00', directions: 'Οδηγίες για το γραφείο στην Αθήνα στο Google Maps (εξωτερικός σύνδεσμος)' },
  { route: '/en/contact/', address: 'TEST FIXTURE — 1 Example Street, Athens', hours: 'TEST FIXTURE — Monday 09:00–10:00', directions: 'Directions to the Athens office on Google Maps (external link)' },
]) {
  test(`${language.route}: supplied details produce usable links and localized office information`, async ({ page, baseURL }, testInfo) => {
    await page.goto(`${baseURL}${language.route}`);
    const telephone = page.getByRole('link', { name: '+302100000000', exact: true });
    await expect(telephone).toHaveAttribute('href', 'tel:+302100000000');
    await expect(page.getByRole('link', { name: 'contact-fixture@example.invalid', exact: true })).toHaveAttribute('href', 'mailto:contact-fixture@example.invalid');
    await expect(page.getByRole('definition').filter({ hasText: language.address })).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: language.hours })).toBeVisible();
    await expect(page.getByRole('link', { name: language.directions })).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=Athens%2C%20Greece');
    await expect(page.locator('iframe, form')).toHaveCount(0);
    await telephone.focus();
    await expect(telephone).toHaveCSS('outline-style', 'solid');
    await page.screenshot({ path: testInfo.outputPath('contact-supplied-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 320, height: 700 });
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath('contact-supplied-mobile.png'), fullPage: true });
  });
}

test('fixture details are absent from both normal demonstration builds', async ({ request }) => {
  for (const base of ['http://127.0.0.1:4321', 'http://127.0.0.1:4322/the-art-of-healing']) {
    for (const route of ['/contact/', '/en/contact/']) {
      const response = await request.get(`${base}${route}`);
      expect(response.ok()).toBeTruthy();
      const html = await response.text();
      expect(html).not.toContain('+302100000000');
      expect(html).not.toContain('contact-fixture@example.invalid');
      expect(html).not.toContain('Example Street');
      expect(html).not.toContain('Οδός Παραδείγματος');
    }
  }
});
