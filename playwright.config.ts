import { defineConfig, devices } from '@playwright/test';

// Each server builds its own static artifact. No development server is tested.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: { ...devices['Desktop Chrome'], trace: 'retain-on-failure' },
  projects: [
    { name: 'domain-root', testIgnore: '**/contact-fixture.spec.ts', use: { baseURL: 'http://127.0.0.1:4321' } },
    { name: 'repository-base', testIgnore: '**/contact-fixture.spec.ts', use: { baseURL: 'http://127.0.0.1:4322/the-art-of-healing' } },
    { name: 'contact-fixture', testMatch: '**/contact-fixture.spec.ts', use: { baseURL: 'http://127.0.0.1:4323' } },
    { name: 'launch-root', testMatch: '**/seo.spec.ts', metadata: { publication: 'launch', publicOrigin: 'https://github.com' }, use: { baseURL: 'http://127.0.0.1:4324' } },
    { name: 'launch-repository', testMatch: '**/seo.spec.ts', metadata: { publication: 'launch' }, use: { baseURL: 'http://127.0.0.1:4325/the-art-of-healing' } },
    { name: 'demonstration-ready', testMatch: '**/seo.spec.ts', use: { baseURL: 'http://127.0.0.1:4326' } },
  ],
  webServer: [
    ...[
      { name: 'launch-root', base: '/', port: 4324, stage: 'launch' },
      { name: 'launch-repository', base: '/the-art-of-healing/', port: 4325, stage: 'launch' },
      { name: 'demonstration-ready', base: '/', port: 4326, stage: 'demonstration' },
    ].map(({ name, base, port, stage }) => ({
      command: `node tests/build-publication-fixture.mjs ${name} && npm run preview -- --outDir .test-build/${name} --ignore-lock --host 127.0.0.1 --port ${port}`,
      env: { SITE_BASE: base, SITE_ORIGIN: name === 'launch-root' ? 'https://github.com' : 'https://laskasp.github.io', SITE_PUBLICATION: stage },
      url: `http://127.0.0.1:${port}${base}`,
      reuseExistingServer: false,
    })),
    {
      command: 'node tests/build-contact-fixture.mjs && npm run preview -- --outDir .test-build/contact --ignore-lock --host 127.0.0.1 --port 4323',
      env: { SITE_BASE: '/', SITE_ORIGIN: 'https://laskasp.github.io', SITE_PUBLICATION: 'demonstration' },
      url: 'http://127.0.0.1:4323/contact/',
      reuseExistingServer: false,
    },
    {
      command: 'npm run build -- --outDir dist/root && npm run preview -- --outDir dist/root --ignore-lock --host 127.0.0.1 --port 4321',
      env: { SITE_BASE: '/', SITE_ORIGIN: 'https://laskasp.github.io', SITE_PUBLICATION: 'demonstration' },
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: false,
    },
    {
      command: 'npm run build -- --outDir dist/repository && npm run preview -- --outDir dist/repository --ignore-lock --host 127.0.0.1 --port 4322',
      env: { SITE_BASE: '/the-art-of-healing/', SITE_ORIGIN: 'https://laskasp.github.io', SITE_PUBLICATION: 'demonstration' },
      url: 'http://127.0.0.1:4322/the-art-of-healing/',
      reuseExistingServer: false,
    },
  ],
});
