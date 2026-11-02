import { buildFixture } from './build-fixture.mjs';

const configuration = process.argv[2];
if (!['launch-root', 'launch-repository', 'demonstration-ready'].includes(configuration)) {
  throw new Error('Expected launch-root, launch-repository or demonstration-ready.');
}
await buildFixture({
  source: 'tests/fixtures/readiness.ts',
  target: 'src/config/readiness.ts',
  outDir: `.test-build/${configuration}`,
  env: {
    // Exercise an alternate real origin in an isolated build, not a deployment.
    SITE_ORIGIN: configuration === 'launch-root' ? 'https://github.com' : 'https://laskasp.github.io',
    SITE_BASE: configuration === 'launch-repository' ? '/the-art-of-healing/' : '/',
    SITE_PUBLICATION: configuration === 'demonstration-ready' ? 'demonstration' : 'launch',
  },
});
