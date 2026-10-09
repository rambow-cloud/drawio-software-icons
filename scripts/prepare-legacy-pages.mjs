import { cp, lstat, rm, readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { save, hash } from './lib.mjs';
import { redirectHtml } from './legacy-redirect.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
// Publish the full software site on GitHub Pages. Only the separate, legacy
// Alibaba entrypoint redirects; keep its resource URLs available for old clients.
for (const [source, folder, collection] of [['dist', 'dist-pages', 'software'], ['dist-alibaba', 'dist-alibaba-pages', 'alibaba-cloud']]) {
  const target = resolve(root, folder);
  if (resolve(process.cwd()) !== resolve(root) || relative(root, target) !== folder) throw Error('Invalid output directory');
  const stat = await lstat(target).catch(e => { if (e.code !== 'ENOENT') throw e; });
  if (stat?.isSymbolicLink()) throw Error('Output must not be a symlink');
  if (stat) await rm(target, { recursive: true });
  await cp(source, target, { recursive: true });
  if (collection === 'alibaba-cloud') {
    await save(`${target}/index.html`, redirectHtml(collection));
    const checksums = {};
    async function visit(dir, prefix = '') {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = prefix + entry.name;
        if (entry.isDirectory()) await visit(`${dir}/${entry.name}`, `${path}/`);
        else if (path !== 'SHA256SUMS.json') checksums[path] = hash(await readFile(`${dir}/${entry.name}`));
      }
    }
    await visit(target);
    await save(`${target}/SHA256SUMS.json`, JSON.stringify(checksums, null, 2) + '\n');
  }
}
console.log('Prepared the full GitHub Pages site and the legacy Alibaba redirect with preserved resources.');
