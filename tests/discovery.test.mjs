import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { discoveryFiles, homepageDiscovery, homepageMetadata, siteUrl } from '../scripts/discovery.mjs';

const categories = [
  { id: 'software-category', collection: 'software', name: '软件分类', nameEn: 'Software category', description: '软件图标', descriptionEn: 'Software icons', count: 1, libraries: { en: 'libraries/en/Software Category.xml', 'zh-CN': 'libraries/zh-CN/软件分类.xml' } },
  { id: 'cloud-category', collection: 'alibaba-cloud', name: '云分类', nameEn: 'Cloud category', description: '云图标', descriptionEn: 'Cloud icons', count: 1, libraries: { en: 'libraries/en/Cloud.xml', 'zh-CN': 'libraries/zh-CN/云.xml' } },
];
const icon = { id: 'test-icon', name: '品牌 </script><script>alert(1)</script>', nameEn: 'Brand </script><script>alert(1)</script>', category: categories[0].id, categories: categories.map(c => c.id), collection: 'software', aliases: ['别名'], tags: ['AI'], asset: 'icons/test.svg', homepage: 'https://example.com/?a=1&b=2', source: { url: 'https://example.com/icon.svg', collectionLicense: 'MIT' } };
const catalog = { collections: [{ id: 'software', name: '通用软件', nameEn: 'General Software' }, { id: 'alibaba-cloud', name: '阿里云', nameEn: 'Alibaba Cloud' }], categories, icons: [icon] };
const files = discoveryFiles(catalog);
const htmlPages = [...files].filter(([path]) => path.endsWith('.html'));
const schemas = html => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));

test('current bilingual discovery titles are concise, unique and retain category context', async () => {
  const [software, english, alibaba] = await Promise.all([
    'data/categories.json', 'data/categories.en.json', 'collections/alibaba-cloud/data/catalog.json',
  ].map(path => readFile(new URL(`../${path}`, import.meta.url), 'utf8').then(JSON.parse)));
  const currentCategories = [
    ...software.map(c => ({ ...c, collection: 'software', nameEn: english[c.id][0], descriptionEn: english[c.id][1] })),
    ...alibaba.categories.map(c => ({ ...c, id: `alibaba-${c.id}`, collection: 'alibaba-cloud', nameEn: c.name_en })),
  ].map(c => ({ ...c, libraries: { en: 'library.xml', 'zh-CN': 'library.xml' } }));
  const currentFiles = discoveryFiles({ ...catalog, categories: currentCategories, icons: [] });
  const titles = new Set();
  for (const [path, html] of currentFiles) {
    if (!path.endsWith('.html')) continue;
    const title = html.match(/<title>(.*?)<\/title>/)[1].replaceAll('&amp;', '&');
    assert(title.length <= 60, `${path}: ${title.length} characters: ${title}`);
    assert(!titles.has(title), `${path}: duplicate title`);
    titles.add(title);
    assert(!/icons icons/i.test(title), `${path}: repeated icon keyword`);
    const encodedTitle = html.match(/<title>(.*?)<\/title>/)[1];
    assert(html.includes(`property="og:title" content="${encodedTitle}"`));
    const category = currentCategories.find(c => path === `discover/en/${c.collection}/${c.id}/index.html`);
    if (!category) continue;
    assert(title.includes(category.nameEn), `${path}: retain full category name`);
    assert(title.includes('draw.io'), `${path}: retain drawing-tool context`);
    if (category.collection === 'alibaba-cloud') assert(title.includes('Alibaba Cloud'));
    const heading = html.match(/<h1>(.*?)<\/h1>/)[1].replaceAll('&amp;', '&');
    assert(heading.includes(catalog.collections.find(c => c.id === category.collection).nameEn));
    assert.equal(schemas(html)[0]['@graph'][1].name, heading);
  }
  assert.equal(titles.size, 2 * (currentCategories.length + 2));
});

test('sitemap contains every generated HTML page and only canonical main-site URLs', () => {
  const urls = [...files.get('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(htmlPages.length, 2 * (categories.length + 2));
  assert.deepEqual(urls, [siteUrl, ...htmlPages.map(([path]) => new URL(path.replace(/index\.html$/, ''), siteUrl).href)]);
  assert.equal(new Set(urls).size, urls.length);
  assert.deepEqual(files.get('urls.txt').trim().split('\n'), urls);
  assert(!files.get('sitemap.xml').includes('lastmod'), 'Do not invent content modification dates');
});

test('translations have reciprocal hreflang and distinct canonical URLs with valid JSON-LD', () => {
  for (const [path, html] of htmlPages) {
    const locale = path.split('/')[1];
    const canonical = new URL(path.replace(/index\.html$/, ''), siteUrl).href;
    assert(html.includes(`<html lang="${locale}">`));
    assert(html.includes(`<link rel="canonical" href="${canonical}"`));
    for (const lang of ['en', 'zh-CN']) {
      const url = new URL(path.replace(`/${locale}/`, `/${lang}/`).replace(/index\.html$/, ''), siteUrl).href;
      assert(html.includes(`hreflang="${lang}" href="${url}"`));
    }
    const graph = schemas(html)[0]['@graph'];
    assert.equal(graph[1].url, canonical);
    assert.equal(graph[1].inLanguage, locale);
    assert.equal(graph[2]['@type'], 'BreadcrumbList');
  }
});

test('HTML works without JavaScript and escapes text and structured data from the catalog', () => {
  for (const locale of ['en', 'zh-CN']) {
    const html = files.get(`discover/${locale}/software/software-category/index.html`);
    assert(html.includes('&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert(!html.includes('<script>alert(1)</script>'));
    assert(html.includes('别名, AI'));
    assert(html.includes('https://example.com/?a=1&amp;b=2'));
    assert.equal((html.match(/<article /g) || []).length, 1);
    const list = schemas(html)[0]['@graph'][1].mainEntity;
    assert.equal(list.numberOfItems, 1);
    assert(list.itemListElement[0].name.includes('</script>'));
    assert(html.includes('id="test-icon"'));
  }
  assert.equal((files.get('discover/en/alibaba-cloud/cloud-category/index.html').match(/<article /g) || []).length, 1, 'Secondary category memberships are discoverable');
});

test('relative links preserve GitHub Pages repository prefixes and stay within deployed files', () => {
  const origin = 'https://rambow-cloud.github.io/drawio-software-icons/';
  const assets = new Set([...files.keys(), 'discover/favicon.svg', 'icons/test.svg', 'ICON_USAGE.md', 'THIRD_PARTY_NOTICES.md', 'compat/alibaba-cloud/NOTICE.md', 'downloads/drawio-icons.zip', ...categories.flatMap(c => Object.values(c.libraries))]);
  for (const [path, html] of htmlPages) {
    const base = new URL(path.replace(/index\.html$/, ''), origin);
    for (const [, href] of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
      if (/^https?:/.test(href)) continue;
      const url = new URL(href, base);
      assert(url.href.startsWith(origin), href);
      const target = decodeURIComponent(url.pathname.slice(new URL(origin).pathname.length));
      assert(!target || assets.has(target) || assets.has(target + 'index.html'), `${path}: ${href}`);
    }
  }
  for (const [, href] of homepageDiscovery(catalog).matchAll(/href="([^"<>]+)"/g)) assert(href.startsWith('./'), href);
});

test('AI reading guidance uses generated category URLs and keeps usage and MCP contracts explicit', () => {
  const robots = files.get('robots.txt');
  assert(robots.includes('User-agent: *\nAllow: /'));
  assert(robots.includes(`Sitemap: ${siteUrl}sitemap.xml`));
  assert(!robots.includes('Disallow:'));
  const llms = files.get('llms.txt');
  for (const category of categories) for (const locale of ['en', 'zh-CN']) assert(llms.includes(`${siteUrl}discover/${locale}/${category.collection}/${category.id}/`));
  assert(llms.includes('not a remote MCP server URL'));
  assert(llms.includes('grants no additional brand permissions'));
  assert.equal(schemas(homepageMetadata())[0]['@graph'][0]['@type'], 'WebSite');
});
