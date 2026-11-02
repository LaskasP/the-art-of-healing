import { cp, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporaryRoot = await mkdtemp(join(tmpdir(), 'healing-contact-'));
try {
  for (const source of ['src', 'public', 'astro.config.ts', 'tsconfig.json', 'package.json']) {
    await cp(join(root, source), join(temporaryRoot, source), { recursive: true });
  }
  await symlink(join(root, 'node_modules'), join(temporaryRoot, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  await cp(join(root, 'tests/fixtures/contact.ts'), join(temporaryRoot, 'src/config/contact.ts'));
  execFileSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', join(root, '.test-build/contact')], {
    cwd: temporaryRoot,
    stdio: 'inherit',
    env: { ...process.env, SITE_BASE: '/', SITE_ORIGIN: 'https://laskasp.github.io' },
  });
} finally {
  // Check the resolved deletion target stays inside the temporary directory.
  if (!resolve(temporaryRoot).startsWith(resolve(tmpdir()) + sep) || !basename(temporaryRoot).startsWith('healing-contact-')) {
    throw new Error('Refusing to remove an unexpected temporary directory.');
  }
  await rm(temporaryRoot, { recursive: true, force: true });
}
