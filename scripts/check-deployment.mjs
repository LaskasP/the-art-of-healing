import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

const root = new URL('../dist/', import.meta.url);
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    assert(!entry.isSymbolicLink(), `Unexpected symlink: ${entry.name}`);
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }))).flat();
}
const { fileURLToPath } = await import('node:url');
const directory = fileURLToPath(root);
const paths = await files(directory);
const relativePaths = paths.map(path => relative(directory, path).replaceAll('\\', '/'));
const expected = ['index.html', 'en/index.html', 'bio/index.html', 'en/bio/index.html', 'services/index.html', 'en/services/index.html', 'contact/index.html', 'en/contact/index.html'];
assert.deepEqual(relativePaths.filter(path => path.endsWith('.html')).sort(), expected.sort(), 'Deploy only the eight final routes, without fixture builds.');
assert(!relativePaths.some(path => /(^|\/)(content|tests|\.test-build)(\/|$)|\.pdf$/i.test(path)), 'Reference or test material must not ship.');
assert(relativePaths.some(path => path.endsWith('.woff2')), 'Self-hosted fonts are missing.');
for (const licence of ['notosans-OFL.txt', 'notoserif-OFL.txt']) {
  assert(relativePaths.includes(`font-licenses/${licence}`), `Missing font licence: ${licence}`);
}
for (const route of expected) {
  const html = await readFile(join(directory, route), 'utf8');
  assert(!/contact-fixture@example\.invalid|\+302100000000|Example Street|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html), `Unexpected fixture/external-font content: ${route}`);
  if ((process.env.SITE_PUBLICATION ?? 'demonstration') === 'demonstration') {
    assert(/<meta\s+name="robots"\s+content="noindex, follow"/.test(html), `Demonstration must be noindex: ${route}`);
  }
}
console.log(`Deployment artifact verified: ${expected.length} routes, local fonts and licences; no reference/test files.`);
