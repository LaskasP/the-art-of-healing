import { buildFixture } from './build-fixture.mjs';

await buildFixture({
  source: 'tests/fixtures/contact.ts',
  target: 'src/config/contact.ts',
  outDir: '.test-build/contact',
  env: { SITE_BASE: '/', SITE_ORIGIN: 'https://laskasp.github.io', SITE_PUBLICATION: 'demonstration' },
});
