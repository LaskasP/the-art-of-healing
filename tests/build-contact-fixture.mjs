import { buildFixture } from './build-fixture.mjs';

await buildFixture({
  source: 'tests/fixtures/contact.json',
  target: 'src/content/contact-details.json',
  outDir: '.test-build/contact',
  env: { SITE_BASE: '/', SITE_ORIGIN: 'https://laskasp.github.io', SITE_PUBLICATION: 'demonstration' },
});
