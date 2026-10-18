import test from 'node:test';
import assert from 'node:assert/strict';
import { createSiteHandler } from '../worker/site.mjs';
import { iconDetailUrl, iconGuidePath, legacyStaticIconIds } from '../src/icon-guides.mjs';
import { legacyIconRedirects } from '../src/discovery-page.mjs';
import { discoveryFiles } from '../scripts/discovery.mjs';

const collections = [{ id: 'software', name: '通用软件', nameEn: 'General Software' }, { id: 'alibaba-cloud', name: '阿里云', nameEn: 'Alibaba Cloud' }];
const categories = collections.map(c => ({ id: c.id + '-category', collection: c.id, name: '测试分类', nameEn: 'Test category', keywords: [], libraries: { en: 'libraries/en/Test.xml', 'zh-CN': 'libraries/zh-CN/测试.xml' } }));
const icon = { id: 'okta', name: 'Okta', nameEn: 'Okta', collection: 'software', category: categories[0].id, aliases: ['身份认证'], tags: [], asset: 'icons/okta.svg', homepage: 'https://example.com/okta', width: 128, height: 128, sha256: 'original-sha', source: { id: 'source', publisher: 'Publisher', url: 'https://example.com/artwork', revision: 'original-revision', collectionLicense: 'Artwork terms', licenseUrl: 'ICON_USAGE.md' } };
const icons = [icon, { ...icon, id: 'keycloak', name: 'Keycloak', nameEn: 'Keycloak' }, { ...icon, id: 'alibaba:iconfont-123', collection: 'alibaba-cloud', category: categories[1].id, name: '云服务', nameEn: 'Cloud Service', asset: 'svg/iconfont-123.svg' }, { ...icon, id: 'escaped', name: '</script><script>alert(1)</script>', nameEn: 'Brand <tag>', asset: 'icons/brand.png', aliases: ['A & B'] }];
const catalog = { collections, categories, icons };
const assetEnv = { ASSETS: { fetch: request => new Response('static:' + new URL(request.url).pathname) } };
const handle = createSiteHandler(catalog, request => new Response('api:' + new URL(request.url).pathname));
const request = (path, options) => new Request('https://icons.rambow.cloud/' + path, options);
const schemas = html => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];

test('every catalog entry gets bilingual server-rendered details without per-icon output files', async () => {
  const generated = discoveryFiles(catalog);
  assert.equal([...generated.keys()].filter(path => /\/icons\//.test(path)).length, 0);
  const expanded = discoveryFiles({ ...catalog, icons: [...icons, { ...icon, id: 'frontegg' }] });
  assert.equal(expanded.size, generated.size);
  for (const item of icons) for (const locale of ['en', 'zh-CN']) {
    const path = iconGuidePath(locale, item.id), response = await handle(request(path), assetEnv);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert(html.includes(`<html lang="${locale}"`));
    assert(html.includes(`rel="canonical" href="${iconDetailUrl(locale, item.id)}"`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert(html.includes('original-revision'));
    assert(html.includes('original-sha'));
    assert(!html.includes('IN YOUR ARCHITECTURE'));
    assert(!html.includes('FROM LIBRARY TO CANVAS'));
    assert(!html.includes('class="import-steps"'));
    assert(html.indexOf('class="provenance"') < html.indexOf('</section>'));
    assert(html.includes(' download>'));
    assert(html.includes('clibs=U'));
    assert(!html.includes('noindex'));
    assert(!html.includes('.zip'));
    assert(!html.includes('<script>alert(1)</script>'));
    for (const lang of ['en', 'zh-CN']) assert(html.includes(`hreflang="${lang}" href="${iconDetailUrl(lang, item.id)}"`));
    const graph = schemas(html);
    assert.equal(graph[1].primaryImageOfPage.contentUrl, 'https://icons.rambow.cloud/' + item.asset);
    assert.equal(graph[2]['@type'], 'BreadcrumbList');
    assert(generated.get('sitemap.xml').includes(iconDetailUrl(locale, item.id)));
    assert(generated.get('llms.txt').includes(iconDetailUrl(locale, item.id)));
    assert(generated.get(`discover/${locale}/${item.collection}/${item.category}/index.html`).includes(iconDetailUrl(locale, item.id)));
  }
  const ordinary = await (await handle(request(iconGuidePath('en', 'okta')), assetEnv)).text();
  assert(ordinary.includes('Okta SVG icon in the General Software / Test category'));
  const curated = await (await handle(request(iconGuidePath('en', 'keycloak')), assetEnv)).text();
  assert(curated.includes('OpenID Connect and SAML'));
  const png = await (await handle(request(iconGuidePath('zh-CN', 'escaped')), assetEnv)).text();
  assert(png.includes('PNG 图标'));
  assert(png.includes('A &amp; B'));
  assert(png.includes('&lt;/script&gt;'));
});

test('valid URL aliases redirect once; unknown, malformed and extra-segment URLs return 404', async () => {
  for (const path of ['discover/en/icons/okta', 'discover/en/icons/okta/index.html', 'discover/en/icons/%6fkta/', 'discover/en/icons/alibaba:iconfont-123/']) {
    const response = await handle(request(path + '?utm_source=test'), assetEnv);
    assert.equal(response.status, 301, path);
    const destination = response.headers.get('Location');
    assert(destination.endsWith('/?utm_source=test'));
    assert.equal((await handle(new Request(destination), assetEnv)).status, 200);
  }
  for (const path of ['discover/en/icons/missing', 'discover/en/icons/missing/', 'discover/en/icons/okta/extra/', 'discover/fr/icons/okta/', 'discover/en/icons/%E0%A4%A/', 'discover/en/icons/%2F/', 'discover/en/icons/']) {
    assert.equal((await handle(request(path), assetEnv)).status, 404, path);
  }
  const missingHead = await handle(request('discover/en/icons/missing/', { method: 'HEAD' }), assetEnv);
  assert.equal(missingHead.status, 404);
  assert.equal(await missingHead.text(), '');
});

test('GET, HEAD, conditional requests and method handling preserve HTTP semantics', async () => {
  const path = iconGuidePath('en', 'okta');
  const get = await handle(request(path), assetEnv), head = await handle(request(path, { method: 'HEAD' }), assetEnv);
  assert.match(get.headers.get('Content-Type'), /text\/html/);
  assert.equal(get.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(head.headers.get('ETag'), get.headers.get('ETag'));
  const cached = await handle(request(path, { headers: { 'If-None-Match': 'W/' + get.headers.get('ETag') } }), assetEnv);
  assert.equal(cached.status, 304);
  assert.equal(await cached.text(), '');
  const post = await handle(request(path, { method: 'POST' }), assetEnv);
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('Allow'), 'GET, HEAD');
});

test('API and non-detail assets retain their original handlers', async () => {
  assert.equal(await (await handle(request('api/icons/search?q=okta'), assetEnv)).text(), 'api:/api/icons/search');
  for (const path of ['', 'en/', 'discover/zh-CN/', 'discover/detail.css', 'icons/okta.svg']) {
    assert.equal(await (await handle(request(path), assetEnv)).text(), 'static:/' + path);
  }
});

test('only the eight old static mirror detail addresses keep small primary-site redirects', () => {
  const redirects = legacyIconRedirects();
  assert.equal(redirects.size, 8);
  for (const id of legacyStaticIconIds) for (const locale of ['en', 'zh-CN']) {
    const html = redirects.get(iconGuidePath(locale, id) + 'index.html');
    assert(html.includes(`http-equiv="refresh" content="0; url=${iconDetailUrl(locale, id)}"`));
    assert(html.includes(`rel="canonical" href="${iconDetailUrl(locale, id)}"`));
    assert(html.length < 800);
    assert(!html.includes('noindex'));
  }
});
