import { defineConfig, devices } from '@playwright/test';

// Each server builds its own static artifact. No development server is tested.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: { ...devices['Desktop Chrome'], trace: 'retain-on-failure' },
  projects: [
    { name: 'domain-root', use: { baseURL: 'http://127.0.0.1:4321' } },
    { name: 'repository-base', use: { baseURL: 'http://127.0.0.1:4322/the-art-of-healing' } },
  ],
  webServer: [
    {
      command: 'npm run build -- --outDir dist/root && npm run preview -- --outDir dist/root --ignore-lock --host 127.0.0.1 --port 4321',
      env: { SITE_BASE: '/', SITE_ORIGIN: 'https://laskasp.github.io' },
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: false,
    },
    {
      command: 'npm run build -- --outDir dist/repository && npm run preview -- --outDir dist/repository --ignore-lock --host 127.0.0.1 --port 4322',
      env: { SITE_BASE: '/the-art-of-healing/', SITE_ORIGIN: 'https://laskasp.github.io' },
      url: 'http://127.0.0.1:4322/the-art-of-healing/',
      reuseExistingServer: false,
    },
  ],
});
