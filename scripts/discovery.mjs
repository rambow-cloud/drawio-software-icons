import { readFile } from 'node:fs/promises';
import { save } from './lib.mjs';
import { posix } from 'node:path';

export const siteUrl = 'https://icons.rambow.cloud/';
const repository = 'https://github.com/rambow-cloud/drawio-software-icons';
const locales = ['en', 'zh-CN'];
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const absolute = path => new URL(path, siteUrl).href;
const localized = (item, locale, field = 'name') => locale === 'en' ? item[`${field}En`] || item[field] : item[field];
const categoryPath = (locale, category) => `discover/${locale}/${category.collection}/${category.id}/`;
const relativeLink = (from, to) => {
  const path = posix.relative(from, to);
  return path ? (from ? '' : './') + path + (!to || to.endsWith('/') ? '/' : '') : './';
};
const link = (from, to, label) => `<a href="${escapeHtml(relativeLink(from, to))}">${escapeHtml(label)}</a>`;
const jsonLd = value => `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`;
const website = { '@type': 'WebSite', '@id': `${siteUrl}#website`, name: 'Architecture Icons for draw.io', url: siteUrl, inLanguage: locales, sameAs: [repository] };
const robotsMeta = '<meta name="robots" content="index,follow,max-image-preview:large" />';

const text = {
  en: {
    title: 'Software and Alibaba Cloud icons for draw.io',
    description: 'Browse software, cloud and AI architecture icons for draw.io / diagrams.net. Download category XML libraries, use offline desktop configurations, or connect Draw.io MCP.',
    browse: 'Browse the interactive icon library', categories: 'Icon collections and categories', guide: 'How to use icons in draw.io',
    rights: 'Commercial icons are provided solely for draw.io architecture diagrams. Upstream licenses and brand rights apply; this project grants no additional brand permissions. Code and documentation use MIT, which does not relicense the artwork.',
    variants: 'Alibaba Cloud entries include color variants and supplemental UI graphics; the entry count is not a count of distinct cloud services.',
    provenance: 'Artwork sources and usage', download: 'Download all icons (ZIP)', library: 'Download category XML', product: 'Product / project', source: 'Artwork source', aliases: 'Names and search terms',
    language: '中文', contents: 'Contents',
    steps: [
      ['Online diagrams', 'Open the interactive library and choose “Open all collections in draw.io” or select categories. The website loads their XML libraries into diagrams.net. Drag an icon onto the canvas and connect it to other nodes.'],
      ['Offline desktop', 'Download and unzip the complete icon archive. In draw.io Desktop, drag the desired XML files from libraries/en/ onto the blank canvas, or use File → Open Library. Images are embedded in the XML and work offline. Import one language only.'],
      ['Merge existing configurations', 'On the interactive website, open “Select categories / Desktop config”. Back up your complete JSON from Extras → Configuration, paste it into the optional input, select categories, and generate the merged JSON. Apply it in the desktop app and restart. Other libraries and settings are preserved; processing stays in your browser.'],
      ['AI drawing with Draw.io MCP', 'The interactive website’s “Connect MCP” dialog supplies setup for Codex, Claude Desktop, Cursor and VS Code with Node.js LTS. Set DRAWIO_ICON_SERVICE_URL to https://icons.rambow.cloud/api/icons for an existing Draw.io MCP installation. This endpoint is an icon search API, not a remote MCP server URL. No website account or API key is required.'],
    ],
  },
  'zh-CN': {
    title: 'draw.io 软件与阿里云架构图标库',
    description: '浏览 draw.io / diagrams.net 软件、云服务与 AI 架构图标，下载分类 XML 图标库，生成离线桌面配置，或通过 Draw.io MCP 搜索图标。',
    browse: '打开可搜索的图标库', categories: '图标集与分类', guide: '如何在 draw.io 中使用图标',
    rights: '商业图标仅供 draw.io 架构图绘制。上游许可和品牌权利仍然适用，本项目不额外授予品牌使用权。代码和文档采用 MIT 许可，不代表图形素材统一采用 MIT 许可。',
    variants: '阿里云条目包含颜色变体和 UI 补充图形，条目数量不代表独立云服务数量。',
    provenance: '素材来源与使用范围', download: '下载完整图标库（ZIP）', library: '下载本分类 XML', product: '产品 / 项目', source: '图标来源', aliases: '名称与搜索词',
    language: 'English', contents: '目录',
    steps: [
      ['在线绘图', '打开交互图标库，点击“在 draw.io 加载全部合集”或选择所需分类，分类 XML 图标库将加载到 diagrams.net 左侧。将图标拖入画布，再添加连线和自己的说明。'],
      ['离线桌面使用', '下载并解压完整图标 ZIP。在 draw.io 桌面版，将 libraries/zh-CN/ 中所需 XML 文件拖到空白画布，或使用“文件 → 打开库”。图片已内嵌，可离线使用。只导入一种语言。'],
      ['合并已有桌面配置', '在交互网站打开“选择分类加载 / 桌面配置”。先从桌面版“其他 → 配置”备份完整 JSON，再粘贴到可选输入框，勾选分类并生成合并配置。应用到桌面端并重启，其他图标库和设置会保留，配置仅在浏览器内处理。'],
      ['通过 Draw.io MCP 进行 AI 绘图', '交互网站“接入 MCP”提供 Codex、Claude Desktop、Cursor 和 VS Code 的配置，需要 Node.js LTS。已有 Draw.io MCP 时，将 DRAWIO_ICON_SERVICE_URL 设置为 https://icons.rambow.cloud/api/icons。此地址是图标搜索 API，不能当作远程 MCP Server URL；无需本站账号或 API Key。'],
    ],
  },
};

function summary(catalog, locale) {
  return locale === 'en'
    ? `${catalog.icons.length.toLocaleString('en')} entries in ${catalog.collections.length} collections and ${catalog.categories.length} categories. Bilingual browsing and XML libraries; SVG / PNG artwork keeps its source colors.`
    : `${catalog.collections.length} 个图标集、${catalog.categories.length} 个分类，共 ${catalog.icons.length.toLocaleString('en')} 个条目。支持中英文浏览与分类 XML 下载，SVG / PNG 素材保留来源颜色。`;
}

function categoryList(catalog, locale, path) {
  return catalog.collections.map(collection => `<section><h2>${escapeHtml(localized(collection, locale))}</h2><ul>${catalog.categories.filter(c => c.collection === collection.id).map(category => `<li>${link(path, categoryPath(locale, category), `${localized(category, locale)} (${category.count})`)} — ${escapeHtml(localized(category, locale, 'description'))}</li>`).join('')}</ul></section>`).join('');
}

function usageLinks(path, locale) {
  return `<section><h2>${text[locale].provenance}</h2><p>${text[locale].rights}</p><p>${link(path, 'ICON_USAGE.md', 'Icon usage / 图标使用声明')} · ${link(path, 'THIRD_PARTY_NOTICES.md', 'Third-party notices / 第三方资源说明')} · ${link(path, 'compat/alibaba-cloud/NOTICE.md', 'Alibaba Cloud artwork notice')}</p><a href="${repository}">GitHub</a></section>`;
}

export function homepageDiscovery(catalog) {
  return `<main class="boot"><h1>${text.en.title}</h1><p lang="zh-CN">${text['zh-CN'].title}。${summary(catalog, 'zh-CN')}</p><p>${text.en.description}</p><p>${link('', 'discover/en/', 'English catalog and guide')} · ${link('', 'discover/zh-CN/', '中文分类与使用指南')} · ${link('', 'downloads/drawio-icons.zip', text.en.download)}</p>${categoryList(catalog, 'en', '')}<p role="status">正在加载交互图标库 · Loading interactive icons…</p></main>`;
}

export function homepageMetadata() {
  return `${robotsMeta}\n${jsonLd({ '@context': 'https://schema.org', '@graph': [website, { '@type': 'CollectionPage', '@id': siteUrl, url: siteUrl, name: text.en.title, description: text.en.description, inLanguage: locales, isPartOf: { '@id': website['@id'] } }] })}`;
}

function page({ locale, suffix, title, description, body, items }) {
  const path = `discover/${locale}/${suffix}`;
  const otherLocale = locale === 'en' ? 'zh-CN' : 'en';
  const translated = `discover/${otherLocale}/${suffix}`;
  const schema = { '@context': 'https://schema.org', '@graph': [website, {
    '@type': items ? 'CollectionPage' : 'WebPage', '@id': absolute(path), url: absolute(path), name: title, description,
    inLanguage: locale, isPartOf: { '@id': website['@id'] },
    ...(items ? { mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) } } : {}),
  }, { '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Architecture Icons', item: siteUrl },
    ...(suffix ? [{ '@type': 'ListItem', position: 2, name: text[locale].contents, item: absolute(`discover/${locale}/`) }] : []),
    { '@type': 'ListItem', position: suffix ? 3 : 2, name: title, item: absolute(path) },
  ] }] };
  const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} | Architecture Icons</title><meta name="description" content="${escapeHtml(description)}" />${robotsMeta}
<link rel="canonical" href="${absolute(path)}" />
${locales.map(lang => `<link rel="alternate" hreflang="${lang}" href="${absolute(`discover/${lang}/${suffix}`)}" />`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${absolute(`discover/en/${suffix}`)}" />
<meta property="og:type" content="website" /><meta property="og:url" content="${absolute(path)}" /><meta property="og:title" content="${escapeHtml(title)}" /><meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'zh_CN'}" /><meta name="twitter:card" content="summary" />
<link rel="icon" type="image/svg+xml" href="${relativeLink(path, 'discover/favicon.svg')}" /><link rel="stylesheet" href="${relativeLink(path, 'discover/style.css')}" />
${jsonLd(schema)}</head><body><header><a href="${relativeLink(path, '')}">Architecture Icons <small>for draw.io</small></a><nav>${link(path, `discover/${locale}/`, text[locale].contents)} · ${link(path, translated, text[locale].language)}</nav></header>
<main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p>${link(path, '', text[locale].browse)}</p>${body}${usageLinks(path, locale)}</main>
<footer>${link(path, `discover/${locale}/guide/`, text[locale].guide)} · ${link(path, 'downloads/drawio-icons.zip', text[locale].download)}</footer></body></html>\n`;
  return [path + 'index.html', html];
}

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
      const description = `${localized(category, locale, 'description')} ${locale === 'en' ? `${icons.length} entries with XML downloads and artwork sources.` : `${icons.length} 个条目，提供 XML 下载及素材来源。`}`;
      const body = `<p>${link(path, category.libraries[locale], t.library)}</p>${category.collection === 'alibaba-cloud' ? `<p>${t.variants}</p>` : ''}
<div class="icons">${icons.map(icon => `<article id="${escapeHtml(icon.id)}"><img src="${escapeHtml(relativeLink(path, icon.asset))}" alt="${escapeHtml(localized(icon, locale))}" loading="lazy" width="64" height="64" /><h2>${escapeHtml(localized(icon, locale))}</h2><p>${t.aliases}: ${escapeHtml([...new Set([icon.name, icon.nameEn, ...icon.aliases, ...icon.tags].filter(Boolean))].join(', '))}</p><p><a href="${escapeHtml(icon.homepage)}">${t.product}</a> · <a href="${escapeHtml(icon.source.url)}">${t.source}</a></p><p>${escapeHtml(icon.source.collectionLicense || '')} · ${link(path, icon.usagePolicyUrl || 'ICON_USAGE.md', t.provenance)}</p></article>`).join('')}</div>`;
      pages.push(page({ locale, suffix: `${category.collection}/${category.id}/`, title, description, body,
        items: icons.map(icon => ({ name: localized(icon, locale), url: `${absolute(path)}#${encodeURIComponent(icon.id)}` })),
      }));
    }
  }
  const files = new Map(pages);
  const urls = [siteUrl, ...pages.map(([path]) => absolute(path.replace(/index\.html$/, '')))];
  files.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
  files.set('urls.txt', urls.join('\n') + '\n');
  // Wildcard access also covers domestic crawlers without guessing their identities.
  files.set('robots.txt', `# Public content is available to search and AI retrieval crawlers.\nUser-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml')}\n`);
  files.set('llms.txt', `# Architecture Icons for draw.io\n\n> ${text.en.description}\n> ${text['zh-CN'].description}\n\n${summary(catalog, 'en')}\n${text.en.variants}\n\n## Catalog and usage\n\n- [English catalog](${absolute('discover/en/')})\n- [中文目录](${absolute('discover/zh-CN/')})\n- [English usage guide](${absolute('discover/en/guide/')})\n- [中文使用指南](${absolute('discover/zh-CN/guide/')})\n- [Machine-readable catalog](${absolute('unified-catalog.json')})\n- [Icon use policy](${absolute('ICON_USAGE.md')})\n- [Artwork provenance and licenses](${absolute('THIRD_PARTY_NOTICES.md')})\n\n## Categories\n\n${catalog.categories.map(c => `- [${c.nameEn} / ${c.name}](${absolute(categoryPath('en', c))}): ${c.count} entries; [中文](${absolute(categoryPath('zh-CN', c))})`).join('\n')}\n\n## AI drawing integration\n\nUse Draw.io MCP with DRAWIO_ICON_SERVICE_URL=${absolute('api/icons')}. This is an icon search API, not a remote MCP server URL. No account or API key is required.\n\n## Rights\n\n${text.en.rights}\n${text['zh-CN'].rights}\n`);
  files.set('discover/style.css', 'body{margin:0;background:#f8f7f4;color:#292720;font:16px/1.7 system-ui,sans-serif}header,main,footer{max-width:1080px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;border-bottom:1px solid #d8d5cc}h1{font-size:clamp(28px,4vw,44px);line-height:1.2}h2{font-size:21px}a{color:#81501e;text-underline-offset:3px;overflow-wrap:anywhere}li{margin:12px 0}section{margin:32px 0}footer{border-top:1px solid #d8d5cc}.icons{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:20px}.icons article{padding:20px;border:1px solid #d8d5cc;border-radius:12px;background:#fff;overflow-wrap:anywhere}.icons img{object-fit:contain}.icons p{font-size:14px}\n');
  return files;
}

export async function generateDiscovery(catalog) {
  for (const [path, content] of discoveryFiles(catalog)) await save(`public/${path}`, content);
  await save('public/discover/favicon.svg', await readFile('src/favicon.svg'));
}
