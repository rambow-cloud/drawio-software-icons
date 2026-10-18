import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { json, hash } from './lib.mjs';
import { search } from '../worker/search.mjs';
import { searchSpotlight } from '../src/spotlight.mjs';
import { homepages } from '../src/homepage.mjs';

const index = await json('.worker-build/search-index.json');
const catalog = await json('dist/unified-catalog.json');
assert.equal(index.icons.length, catalog.icons.length);
assert.equal(new Set(index.icons.map(i => i.id)).size, catalog.icons.length);
for (const q of ['git', 'k8s', 'karpenter', '节点自动扩缩容', 'cert-manager', 'argo rollouts', 'ecs', '阿里云', 'cloud', '容器', 'database', '云服务器']) {
  assert.deepEqual(search(index, q, 0, 100).images.map(i => i.url),
    searchSpotlight(catalog.icons, catalog.categories, q).slice(0, 100).map(i => `/${i.asset}`));
}
for (const icon of index.icons) {
  assert.ok(icon.image.width > 0 && icon.image.height > 0);
  assert.ok(icon.image.set.name);
  assert.doesNotMatch(icon.image.url, /[;&"'<>\s]/);
}
async function files(dir, prefix = '') {
  const result = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const path = prefix + e.name;
    if (e.isDirectory()) result.push(...await files(`${dir}/${e.name}`, `${path}/`));
    else result.push(path);
  }
  return result;
}
const assets = await files('dist');
for (const dir of ['dist', 'dist-alibaba']) assert.ok(!(await files(dir)).some(path => path.endsWith('.zip')), `${dir}: bulk archives must not be published`);
assert.ok(!assets.some(path => path.startsWith('guides/')), 'Retired raw guide copies must not be published');
assert.ok(assets.length <= 20000);
assert.ok(!assets.includes('CNAME'), 'The GitHub Pages site must keep its github.io domain');
const homepage = await readFile('dist/index.html', 'utf8');
assert.doesNotMatch(homepage, /location\.replace/, 'Both primary homepages must render the application');
for (const [, path] of homepage.matchAll(/(?:src|href)="([^"\s]+)"/g)) {
  if (path.startsWith('#') || /^https?:/.test(path)) continue;
  assert.ok(path.startsWith('./'), `Homepage asset must work under the GitHub Pages repository path: ${path}`);
}
// Check the real Vite MPA outputs after merge, including mirror-relative paths.
for (const [locale, config] of Object.entries(homepages)) {
  const html = await readFile(`dist/${config.path}index.html`, 'utf8');
  assert.ok(html.includes(`<html lang="${locale}"`));
  assert.ok(html.includes(`data-locale="${locale}"`));
  assert.ok(html.includes(`<title>${config.title.replaceAll('&', '&amp;')}</title>`));
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(html.includes(`rel="canonical" href="https://icons.rambow.cloud/${config.path}"`));
  assert.ok(!html.includes('homepage-zh-CN') && !html.includes('icons-locale'));
  for (const root of ['https://icons.rambow.cloud/', 'https://rambow-cloud.github.io/drawio-software-icons/']) {
    for (const [, raw] of html.matchAll(/(?:src|href)="([^"<>]+)"/g)) {
      if (raw.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(raw)) continue;
      const url = new URL(raw.replaceAll('&amp;', '&'), root + config.path);
      assert.ok(url.href.startsWith(root), `${locale}: escaped site root: ${raw}`);
      const target = decodeURIComponent(url.pathname.slice(new URL(root).pathname.length));
      assert.ok(assets.includes(target) || assets.includes(target+'index.html'), `${locale}: missing ${target}`);
    }
  }
}
for (const path of assets) assert.ok((await readFile(`dist/${path}`)).length <= 25 * 1024 * 1024, `Asset too large: ${path}`);
for (const [source, target] of [['dist', 'dist-pages'], ['dist-alibaba', 'dist-alibaba-pages']]) {
  const legacy = target === 'dist-alibaba-pages';
  if (legacy) assert.match(await readFile(`${target}/index.html`, 'utf8'), /location.replace/);
  assert.deepEqual((await files(target)).sort(), (await files(source)).sort(), `Publishing file set: ${target}`);
  for (const path of await files(source)) {
    if (legacy && ['index.html', 'SHA256SUMS.json'].includes(path)) continue;
    assert.equal(hash(await readFile(`${target}/${path}`)), hash(await readFile(`${source}/${path}`)), `Published resource: ${target}/${path}`);
  }
}
const checksums = await json('dist-alibaba-pages/SHA256SUMS.json');
for (const [path, sha] of Object.entries(checksums)) assert.equal(hash(await readFile(`dist-alibaba-pages/${path}`)), sha);
console.log(`Verified ${index.icons.length} searchable icons, ${assets.length} Cloudflare assets, the identical full GitHub Pages site and legacy Alibaba resources.`);
