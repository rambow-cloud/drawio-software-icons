import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname, extname, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CATALOGS = [
  'https://icons.rambow.cloud/unified-catalog.json',
  'https://rambow-cloud.github.io/drawio-software-icons/unified-catalog.json',
];
const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().trim();
const xml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));

async function download(url, fetchImpl) {
  if (url.protocol !== 'https:') throw Error('Remote resources must use HTTPS');
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw Error(`HTTP ${response.status}: ${url}`);
  if (response.url && new URL(response.url).protocol !== 'https:') throw Error('Redirect must use HTTPS');
  return Buffer.from(await response.arrayBuffer());
}

export async function loadCatalog(location, fetchImpl = fetch) {
  const failures = [];
  for (const source of location ? [location] : CATALOGS) {
    try {
      const remote = /^https?:/i.test(source);
      const url = remote ? new URL(source) : pathToFileURL(resolve(source));
      const bytes = remote ? await download(url, fetchImpl) : await readFile(fileURLToPath(url));
      const catalog = JSON.parse(bytes.toString('utf8'));
      if (!Array.isArray(catalog.icons)) throw Error('Catalog must contain an icons array');
      return { catalog, url };
    } catch (error) { failures.push(`${source}: ${error.message}`); }
  }
  throw Error(failures.join('\n'));
}

export function searchCatalog(catalog, query, limit = 5) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw Error('limit must be 1–100');
  const needle = normalize(query);
  if (!needle) return [];
  const terms = needle.split(/\s+/), buckets = [[], [], [], []];
  const categories = new Map((catalog.categories ?? []).map(item => [item.id, item]));
  for (const item of catalog.icons) {
    const names = [item.id, item.name, item.nameEn, ...(item.aliases ?? [])].filter(Boolean).map(normalize);
    const category = categories.get(item.category);
    const text = normalize([...names, ...(item.tags ?? []), category?.name, category?.nameEn].filter(Boolean).join(' '));
    if (!terms.every(term => text.includes(term))) continue;
    const rank = names.includes(needle) ? 0 : names.some(name => name.startsWith(needle)) ? 1 :
      terms.every(term => names.some(name => name.includes(term))) ? 2 : 3;
    buckets[rank].push(item);
  }
  return buckets.flat().slice(0, limit);
}

function assetUrl(asset, catalogUrl, assetRoot) {
  if (typeof asset !== 'string' || !asset || /[\\?#:]/.test(asset) || asset.startsWith('/') ||
      asset.split('/').some(part => !part || part === '.' || part === '..')) throw Error('Invalid relative asset path');
  if (assetRoot) {
    const root = resolve(assetRoot), target = resolve(root, asset), path = relative(root, target);
    if (path.startsWith('..') || isAbsolute(path)) throw Error('Asset must remain inside asset-root');
    return pathToFileURL(target);
  }
  return new URL(asset, catalogUrl);
}

export async function fetchIcon(loaded, id, { out, assetRoot, fetchImpl = fetch } = {}) {
  const item = loaded.catalog.icons.find(icon => icon.id === id);
  if (!item) throw Error(`Unknown icon ID: ${id}`);
  const extension = extname(item.asset).toLowerCase();
  if (!['.svg', '.png'].includes(extension)) throw Error('Only SVG and PNG artwork is supported');
  if (!out || extname(out).toLowerCase() !== extension) throw Error(`Use --out with the ${extension} extension`);
  if (!/^[a-f0-9]{64}$/.test(item.sha256 ?? '')) throw Error('Missing valid catalog SHA-256');
  const url = assetUrl(item.asset, loaded.url, assetRoot);
  const bytes = url.protocol === 'file:' ? await readFile(fileURLToPath(url)) : await download(url, fetchImpl);
  if (createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw Error(`SHA-256 mismatch: ${id}`);
  const ratio = Number.isFinite(item.width) && item.width > 0 && Number.isFinite(item.height) && item.height > 0
    ? item.width / item.height : 1;
  const width = Math.round((ratio >= 1 ? 48 : 48 * ratio) * 1000) / 1000;
  const height = Math.round((ratio >= 1 ? 48 / ratio : 48) * 1000) / 1000;
  const mime = extension === '.svg' ? 'image/svg+xml' : 'image/png';
  const snippet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${xml(item.name)}"><image width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" href="data:${mime};base64,${bytes.toString('base64')}"/></svg>\n`;
  const asset = resolve(out), image = `${asset}.image.svg`, metadata = `${asset}.metadata.json`;
  // Never replace an input resource or an existing output implicitly.
  const targets = [asset, image, metadata];
  if (url.protocol === 'file:' && targets.includes(resolve(fileURLToPath(url)))) throw Error('Output must differ from input asset');
  for (const target of targets) {
    try { await access(target); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    throw Error(`Output exists: ${target}`);
  }
  const resolveLink = async value => {
    if (!value) return null;
    const direct = new URL(value, loaded.url);
    if (direct.protocol !== 'file:' || !assetRoot) return direct.href;
    try { await access(fileURLToPath(direct)); return direct.href; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    // Repository data/catalog.json stores project-relative policy paths while
    // its images live under --asset-root ./assets.
    const projectReference = new URL(value, pathToFileURL(resolve(assetRoot, '..') + '/'));
    await access(fileURLToPath(projectReference));
    return projectReference.href;
  };
  const provenance = { ...item, catalogUrl: loaded.url.href, assetUrl: url.href,
    usagePolicyUrl: await resolveLink(item.usagePolicyUrl ?? 'ICON_USAGE.md'),
    source: { ...item.source, licenseUrl: await resolveLink(item.source?.licenseUrl) },
    embeddedMime: mime, displayWidth: width, displayHeight: height };
  await mkdir(dirname(asset), { recursive: true });
  await writeFile(asset, bytes, { flag: 'wx' });
  await writeFile(image, snippet, { flag: 'wx' });
  await writeFile(metadata, JSON.stringify(provenance, null, 2) + '\n', { flag: 'wx' });
  return { id, asset, image, metadata };
}

export async function main(args) {
  const [command, value, ...rest] = args, options = {};
  if (!['search', 'fetch'].includes(command) || !value) throw Error('Usage: icons.mjs search QUERY [--limit 5] [--catalog PATH_OR_HTTPS_URL] | fetch ID --out FILE [--catalog ...] [--asset-root DIR]');
  const allowed = command === 'search' ? ['--limit', '--catalog'] : ['--out', '--catalog', '--asset-root'];
  for (let i = 0; i < rest.length; i += 2) {
    if (!allowed.includes(rest[i]) || !rest[i + 1] || rest[i + 1].startsWith('--') || options[rest[i]]) throw Error(`Invalid option: ${rest[i]}`);
    options[rest[i]] = rest[i + 1];
  }
  if (command === 'fetch' && !options['--out']) throw Error('fetch requires --out FILE');
  const loaded = await loadCatalog(options['--catalog']);
  if (command === 'search') {
    const results = searchCatalog(loaded.catalog, value, Number(options['--limit'] ?? 5));
    return { catalogUrl: loaded.url.href, results: results.map(({ id, name, nameEn, collection, asset, softwareType, usagePolicy }) => ({ id, name, nameEn, collection, asset, softwareType, usagePolicy })) };
  }
  return fetchIcon(loaded, value, { out: options['--out'], assetRoot: options['--asset-root'] });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
