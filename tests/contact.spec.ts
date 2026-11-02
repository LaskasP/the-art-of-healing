import { expect, test } from '@playwright/test';

for (const language of [
  { lang: 'el', route: '/contact/', alternate: '/en/contact/', name: 'Επικοινωνία', home: 'Αρχική', switchName: 'Read this page in English', missing: 'Δεν έχει δοθεί ακόμη', labels: ['Τηλέφωνο', 'Email', 'Γραφείο στην Αθήνα', 'Ώρες λειτουργίας', 'Οδηγίες μετάβασης'], geography: 'Η Αθήνα είναι η μοναδική τοποθεσία φυσικού γραφείου. Η περιοχή εξυπηρέτησης περιλαμβάνει την Αθήνα και την Κόρινθο. Υπάρχει επίσης δυνατότητα διαδικτυακών συνεδριών.' },
  { lang: 'en', route: '/en/contact/', alternate: '/contact/', name: 'Contact', home: 'Home', switchName: 'Διαβάστε αυτή τη σελίδα στα Ελληνικά', missing: 'Not yet supplied', labels: ['Telephone', 'Email', 'Athens office', 'Working hours', 'Directions'], geography: 'Athens is the sole physical office location. The service area includes Athens and Korinthos. Online sessions are also available.' },
]) {
  test(`${language.lang}: Contact opens directly, marks missing details and switches to its equivalent`, async ({ page, baseURL }, testInfo) => {
    const response = await page.goto(`${baseURL}${language.route}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', language.lang);
    await expect(page).toHaveTitle(new RegExp(`^${language.name} \\|`));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(language.name);
    for (const label of language.labels) await expect(page.getByRole('term').filter({ hasText: label })).toBeVisible();
    await expect(page.getByRole('definition')).toHaveText(Array(5).fill(language.missing));
    await expect(page.getByText(language.geography)).toBeVisible();
    await expect(page.locator('a[href^="tel:"], a[href^="mailto:"], main a[href*="google.com/maps"], iframe, form')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('contact-desktop.png'), fullPage: true });
    const navigation = page.getByRole('navigation');
    await expect(navigation.getByRole('link', { name: language.name, exact: true })).toHaveAttribute('aria-current', 'page');
    await navigation.getByRole('link', { name: language.home, exact: true }).click();
    await page.getByRole('navigation').getByRole('link', { name: language.name, exact: true }).click();
    await expect(page).toHaveURL(`${baseURL}${language.route}`);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole('link', { name: language.switchName })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('contact-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 320, height: 700 });
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole('link', { name: language.switchName }).click();
    await expect(page).toHaveURL(`${baseURL}${language.alternate}`);
  });
}
