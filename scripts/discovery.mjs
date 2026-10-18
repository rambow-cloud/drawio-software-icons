import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { save } from './lib.mjs';
import { homepages } from '../src/homepage.mjs';
import { iconGuidePath, iconDetailUrl } from '../src/icon-guides.mjs';
import { siteUrl, escapeHtml, page, summary, categoryList, alibabaRedirect, text, link, relativeLink, alibabaHomeLink } from '../src/discovery-page.mjs';
export { siteUrl, escapeHtml, homepageMetadata } from '../src/discovery-page.mjs';
const locales = ['en', 'zh-CN'];
const brandStyles = readFileSync(new URL('../src/brand.css', import.meta.url), 'utf8');
const detailStyles = [brandStyles, ...['icon-detail.css', 'icon-preview.css'].map(file => readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8'))].join('\n');
const absolute = path => new URL(path, siteUrl).href;
const localized = (item, locale, field = 'name') => locale === 'en' ? item[`${field}En`] || item[field] : item[field];
const categoryPath = (locale, category) => `discover/${locale}/${category.collection}/${category.id}/`;
const alibabaPath = locale => `discover/${locale}/alibaba-cloud/`;

export function discoveryFiles(catalog) {
  const pages = [];
  for (const locale of locales) {
    const t = text[locale];
    pages.push(page({ locale, suffix: '', title: t.title, description: t.description,
      body: `<p>${summary(catalog, locale)}</p><p>${t.variants}</p><p>${link(`discover/${locale}/`, `discover/${locale}/guide/`, t.guide)}</p>${categoryList(catalog, locale, `discover/${locale}/`)}`,
      items: catalog.categories.map(c => ({ name: localized(c, locale), url: absolute(categoryPath(locale, c)) })),
    }));
    pages.push(page({ locale, suffix: 'guide/', title: t.guide, description: t.description,
      body: t.steps.map(([title, detail]) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(detail)}</p></section>`).join(''),
    }));
    for (const category of catalog.categories) {
      const path = categoryPath(locale, category);
      const icons = catalog.icons.filter(i => i.category === category.id || i.categories?.includes(category.id));
      const collection = catalog.collections.find(c => c.id === category.collection);
      const title = `${localized(collection, locale)} · ${localized(category, locale)} ${locale === 'en' ? 'icons for draw.io' : 'draw.io 图标'}`;
      // Keep the full collection heading in the page, but avoid repeating the
      // site brand and generic software label in search-result titles.
      const name = localized(category, locale);
      const documentTitle = locale === 'en'
        ? `${category.collection === 'alibaba-cloud' ? 'Alibaba Cloud ' : ''}${name}${/\bicons$/i.test(name) ? '' : ' Icons'} for draw.io`
        : title;
      const description = `${localized(category, locale, 'description')} ${locale === 'en' ? `${icons.length} entries with XML downloads and artwork sources.` : `${icons.length} 个条目，提供 XML 下载及素材来源。`}`;
      const body = `<p>${link(path, category.libraries[locale], t.library)}</p>${category.collection === 'alibaba-cloud' ? `<p>${alibabaHomeLink(path, t.alibabaLink)}</p><p>${t.variants}</p>` : ''}
<div class="icons">${icons.map(icon => `<article id="${escapeHtml(icon.id)}"><img src="${escapeHtml(relativeLink(path, icon.asset))}" alt="${escapeHtml(localized(icon, locale))}" loading="lazy" width="64" height="64" /><h2><a href="${iconDetailUrl(locale, icon.id)}">${escapeHtml(localized(icon, locale))}</a></h2><p>${t.aliases}: ${escapeHtml([...new Set([icon.name, icon.nameEn, ...icon.aliases, ...icon.tags].filter(Boolean))].join(', '))}</p><p><a href="${escapeHtml(icon.homepage)}">${t.product}</a> · <a href="${escapeHtml(icon.source.url)}">${t.source}</a></p><p>${escapeHtml(icon.source.collectionLicense || '')} · ${link(path, icon.usagePolicyUrl || 'ICON_USAGE.md', t.provenance)}</p></article>`).join('')}</div>`;
      pages.push(page({ locale, suffix: `${category.collection}/${category.id}/`, title, documentTitle, description, body,
        items: icons.map(icon => ({ name: localized(icon, locale), url: iconDetailUrl(locale, icon.id) })),
      }));
    }
  }
  const files = new Map(pages);
  files.set('discover/detail.css', detailStyles);
  // Cloudflare static headers: keep draw.io CORS and give non-HTML documents
  // their own HTTPS canonical. The splat includes nested directories.
  files.set('_headers', `/*\n  Access-Control-Allow-Origin: *\n  X-Content-Type-Options: nosniff\n\n/*.md\n  Link: <${siteUrl}:splat.md>; rel="canonical"\n`);
  const urls = [siteUrl, absolute(homepages.en.path), ...pages.map(([path]) => absolute(path.replace(/index\.html$/, ''))), ...catalog.icons.flatMap(icon => locales.map(locale => iconDetailUrl(locale, icon.id)))];
  files.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
  files.set('urls.txt', urls.join('\n') + '\n');
  // Wildcard access also covers domestic crawlers without guessing their identities.
  for (const locale of locales) {
    const [path, html] = alibabaRedirect(locale);
    files.set(path, html);
  }
  const redirects = locales.flatMap(locale => {
    const path = '/' + alibabaPath(locale);
    return [path, path.slice(0, -1), path + 'index.html'].map(source => `${source} / 301`);
  });
  // Retire duplicate raw guides; usage links now lead to existing HTML guides.
  redirects.push('/guides/README.md /discover/en/guide/ 301', '/guides/README.zh-CN.md /discover/zh-CN/guide/ 301');
  for (const path of ['ICON_USAGE.md', 'THIRD_PARTY_NOTICES.md', 'docs/DEPLOYMENT.md', 'docs/CLOUDFLARE.md', 'docs/ICON_CONFIGURATION.md']) {
    redirects.push(`/guides/${path} /${path} 301`);
  }
  files.set('_redirects', redirects.join('\n') + '\n');
  files.set('robots.txt', `# Public content is available to search and AI retrieval crawlers.\nUser-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml')}\n`);
  files.set('llms.txt', `# Architecture Icons for draw.io\n\n> ${text.en.description}\n> ${text['zh-CN'].description}\n\n${summary(catalog, 'en')}\n${text.en.variants}\n\n## Catalog and usage\n\n- [English catalog](${absolute('discover/en/')})\n- [中文目录](${absolute('discover/zh-CN/')})\n- [Alibaba Cloud icons and downloads](${siteUrl}?collection=alibaba-cloud#library)\n- [阿里云icon 图标库与下载](${siteUrl}?collection=alibaba-cloud#library)\n- [English usage guide](${absolute('discover/en/guide/')})\n- [中文使用指南](${absolute('discover/zh-CN/guide/')})\n- [Machine-readable catalog](${absolute('unified-catalog.json')})\n- [Icon use policy](${absolute('ICON_USAGE.md')})\n- [Artwork provenance and licenses](${absolute('THIRD_PARTY_NOTICES.md')})\n\n## Categories\n\n${catalog.categories.map(c => `- [${c.nameEn} / ${c.name}](${absolute(categoryPath('en', c))}): ${c.count} entries; [中文](${absolute(categoryPath('zh-CN', c))})`).join('\n')}\n\n## AI drawing integration\n\nUse Draw.io MCP with DRAWIO_ICON_SERVICE_URL=${absolute('api/icons')}. This is an icon search API, not a remote MCP server URL. No account or API key is required.\n\n## Rights\n\n${text.en.rights}\n${text['zh-CN'].rights}\n`);
  files.set('discover/style.css', brandStyles + '\n' + 'body{margin:0;background:var(--brand-paper);color:var(--brand-ink);font:16px/1.7 system-ui,sans-serif}header,main,footer{max-width:1080px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;border-bottom:1px solid var(--brand-line)}h1{font-size:clamp(28px,4vw,44px);line-height:1.2}h2{font-size:21px}a{color:var(--brand-blue);text-underline-offset:3px;overflow-wrap:anywhere}li{margin:12px 0}section{margin:32px 0}footer{border-top:1px solid var(--brand-line)}.icons{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:20px}.icons article{padding:20px;border:1px solid var(--brand-line);border-radius:12px;background:#fff;overflow-wrap:anywhere}.icons img{object-fit:contain}.icons p{font-size:14px}\n');
  files.set('llms.txt', files.get('llms.txt') + `\n## Icon details and import guides\n\n${catalog.icons.flatMap(icon => locales.map(locale => `- [${icon.name} (${locale})](${absolute(iconGuidePath(locale, icon.id))})`)).join('\n')}\n`);
  return files;
}

export async function generateDiscovery(catalog) {
  for (const [path, content] of discoveryFiles(catalog)) await save(`public/${path}`, content);
  await save('public/discover/favicon.svg', await readFile('src/favicon.svg'));
}
