import { expect, test } from '@playwright/test';

test('visitors open either Home language directly without browser-language redirection', async ({ page, browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'en-US' });
  const englishBrowser = await context.newPage();
  await englishBrowser.goto(`${baseURL}/`);
  await expect(englishBrowser).toHaveURL(`${baseURL}/`);
  await expect(englishBrowser.locator('html')).toHaveAttribute('lang', 'el');
  await expect(englishBrowser.getByRole('heading', { level: 1 })).toHaveText('Ένας χώρος για εσάς');
  await context.close();

  await page.goto(`${baseURL}/en/`);
  await expect(page).toHaveURL(`${baseURL}/en/`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A space for you');
});

for (const language of [
  { route: '/', lang: 'el', home: 'Αρχική', navigation: 'Κύρια πλοήγηση', menu: 'Μενού', switchName: 'Read this page in English', alternate: '/en/', title: 'Αρχική | Η τέχνη της ίασης — Δομικό δείγμα' },
  { route: '/en/', lang: 'en', home: 'Home', navigation: 'Main navigation', menu: 'Menu', switchName: 'Διαβάστε αυτή τη σελίδα στα Ελληνικά', alternate: '/', title: 'Home | The art of healing — Structural demonstration' },
]) {
  test(`${language.lang}: desktop navigation and equivalent-page switching work`, async ({ page, baseURL }, testInfo) => {
    await page.goto(`${baseURL}${language.route}`);
    const navigation = page.getByRole('navigation', { name: language.navigation });
    await expect(navigation).toBeVisible();
    const home = navigation.getByRole('link', { name: language.home, exact: true });
    await expect(home).toHaveAttribute('aria-current', 'page');
    await home.click();
    await expect(page).toHaveURL(`${baseURL}${language.route}`);
    await expect(page.getByRole('button', { name: language.menu })).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath('desktop.png'), fullPage: true });
    await page.getByRole('link', { name: language.switchName }).click();
    await expect(page).toHaveURL(`${baseURL}${language.alternate}`);
    await expect(page.locator('html')).toHaveAttribute('lang', language.lang === 'el' ? 'en' : 'el');
  });

  test(`${language.lang}: mobile menu supports keyboard controls and leaves language switching visible`, async ({ page, baseURL }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${baseURL}${language.route}`);
    const menu = page.getByRole('button', { name: language.menu });
    const navigation = page.getByRole('navigation', { name: language.navigation, includeHidden: true });
    const switchLanguage = page.getByRole('link', { name: language.switchName });
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation).toBeHidden();
    await expect(switchLanguage).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /Skip to content|Μετάβαση στο περιεχόμενο/ })).toBeFocused();
    await page.keyboard.press('Tab'); // Brand
    await page.keyboard.press('Tab');
    await expect(menu).toBeFocused();
    await expect(menu).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(navigation).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(navigation.getByRole('link', { name: language.home, exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation).toBeHidden();
    await page.keyboard.press('Space');
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Tab');
    await expect(switchLanguage).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${baseURL}${language.alternate}`);
  });

  test(`${language.lang}: localized demonstration metadata stays crawlable and assets load`, async ({ page, request, baseURL }) => {
    const failures: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('requestfailed', request => failures.push(request.url()));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    await page.goto(`${baseURL}${language.route}`);
    await expect(page).toHaveTitle(language.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', language.lang === 'el'
      ? 'Δομικό δείγμα ιστοσελίδας ενός ψυχολόγου: γραφείο στην Αθήνα, εξυπηρέτηση Αθήνας και Κορίνθου και διαδικτυακές συνεδρίες.'
      : 'A structural demonstration for one psychologist: an Athens office, a service area covering Athens and Korinthos, and online sessions.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    const robots = await request.get(`${baseURL}/robots.txt`);
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toMatch(/Allow: \/\s*$/);
    expect(await robots.text()).not.toMatch(/Disallow:\s*\//);
    await expect(page.getByRole('main')).toBeVisible();
    expect(failures).toEqual([]);
  });

  test(`${language.lang}: narrow screens and enlarged text reflow without horizontal scrolling`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(`${baseURL}${language.route}`);
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: language.switchName })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  });
}

test('English stays selected with a Greek browser language', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'el-GR' });
  const page = await context.newPage();
  await page.goto(`${baseURL}/en/`);
  await expect(page).toHaveURL(`${baseURL}/en/`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await context.close();
});

test('navigation and language links remain usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.getByRole('link', { name: 'Read this page in English' }).click();
  await expect(page).toHaveURL(`${baseURL}/en/`);
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true })).toBeVisible();
  await context.close();
});
