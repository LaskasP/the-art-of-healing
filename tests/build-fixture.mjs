import { cp, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

export async function buildFixture({ source, target, outDir, env }) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'healing-fixture-'));
  try {
    for (const sourcePath of ['src', 'public', 'astro.config.ts', 'tsconfig.json', 'package.json']) {
      await cp(join(root, sourcePath), join(temporaryRoot, sourcePath), { recursive: true });
    }
    await symlink(join(root, 'node_modules'), join(temporaryRoot, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
    await cp(join(root, source), join(temporaryRoot, target));
    execFileSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', join(root, outDir)], {
      cwd: temporaryRoot,
      stdio: 'inherit',
      env: { ...process.env, ...env },
    });
  } finally {
    if (!resolve(temporaryRoot).startsWith(resolve(tmpdir()) + sep) || !basename(temporaryRoot).startsWith('healing-fixture-')) {
      throw new Error('Refusing to remove an unexpected temporary directory.');
    }
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}
