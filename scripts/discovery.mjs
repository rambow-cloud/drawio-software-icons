import { readFile } from 'node:fs/promises';
import { save } from './lib.mjs';
import { posix } from 'node:path';
import { drawioUrl } from '../src/catalog.mjs';

export const siteUrl = 'https://icons.rambow.cloud/';
const repository = 'https://github.com/rambow-cloud/drawio-software-icons';
const locales = ['en', 'zh-CN'];
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const absolute = path => new URL(path, siteUrl).href;
const localized = (item, locale, field = 'name') => locale === 'en' ? item[`${field}En`] || item[field] : item[field];
const categoryPath = (locale, category) => `discover/${locale}/${category.collection}/${category.id}/`;
const alibabaPath = locale => `discover/${locale}/alibaba-cloud/`;
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
    alibabaTitle: 'Alibaba Cloud Icons for draw.io', alibabaLink: 'Alibaba Cloud icons and downloads',
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
    alibabaTitle: '阿里云icon 图标库下载 | draw.io 架构图', alibabaLink: '阿里云icon 图标库与下载',
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
  return catalog.collections.map(collection => `<section><h2>${collection.id === 'alibaba-cloud' ? link(path, alibabaPath(locale), text[locale].alibabaLink) : escapeHtml(localized(collection, locale))}</h2><ul>${catalog.categories.filter(c => c.collection === collection.id).map(category => `<li>${link(path, categoryPath(locale, category), `${localized(category, locale)} (${category.count})`)} — ${escapeHtml(localized(category, locale, 'description'))}</li>`).join('')}</ul></section>`).join('');
}

function usageLinks(path, locale) {
  return `<section><h2>${text[locale].provenance}</h2><p>${text[locale].rights}</p><p>${link(path, 'ICON_USAGE.md', 'Icon usage / 图标使用声明')} · ${link(path, 'THIRD_PARTY_NOTICES.md', 'Third-party notices / 第三方资源说明')} · ${link(path, 'compat/alibaba-cloud/NOTICE.md', 'Alibaba Cloud artwork notice')}</p><a href="${repository}">GitHub</a></section>`;
}

export function homepageDiscovery(catalog) {
  return `<main class="boot"><h1>${text.en.title}</h1><p lang="zh-CN">${text['zh-CN'].title}。${summary(catalog, 'zh-CN')}</p><p>${text.en.description}</p><p>${link('', 'discover/en/', 'English catalog and guide')} · ${link('', 'discover/zh-CN/', '中文分类与使用指南')} · ${link('', alibabaPath('zh-CN'), text['zh-CN'].alibabaLink)} · ${link('', 'downloads/drawio-icons.zip', text.en.download)}</p>${categoryList(catalog, 'en', '')}<p role="status">正在加载交互图标库 · Loading interactive icons…</p></main>`;
}

function alibabaPage(catalog, locale) {
  const t = text[locale], path = alibabaPath(locale), chinese = locale === 'zh-CN';
  const categories = catalog.categories.filter(c => c.collection === 'alibaba-cloud');
  const icons = catalog.icons.filter(i => i.collection === 'alibaba-cloud');
  const description = chinese
    ? `面向 draw.io / diagrams.net 的阿里云icon 图标库：${icons.length} 个条目、${categories.length} 个分类，提供 SVG 素材、XML 分类库、ZIP 下载与在线及离线导入说明。`
    : `Browse ${icons.length} Alibaba Cloud icon entries in ${categories.length} categories for draw.io / diagrams.net, with SVG artwork, XML libraries, ZIP downloads and import instructions.`;
  const intro = chinese
    ? '这里整理的是用于云架构图的阿里云服务图标，保留来源配色。你可以按分类预览图标，下载原色 SVG 和 XML 图标库，或把全部阿里云分类加载到 draw.io。'
    : 'This collection contains Alibaba Cloud service artwork for architecture diagrams, preserving source colors. Preview entries by category, download SVG artwork and XML libraries, or load every Alibaba Cloud category into draw.io.';
  const downloads = [
    ['alibaba-cloud-drawio.zip', chinese ? '下载阿里云图标 ZIP（含 SVG 与 XML）' : 'Download Alibaba Cloud ZIP (SVG and XML)'],
    ['drawio/all-icons.xml', chinese ? '下载阿里云全部图标 XML（单个面板）' : 'Download all Alibaba Cloud icons as one XML library'],
    ['downloads/drawio-icons.zip', chinese ? '下载软件与阿里云完整合集 ZIP' : 'Download the complete software and Alibaba Cloud ZIP'],
  ];
  const instructions = chinese ? [
    ['在线加载阿里云架构图标', '点击“在 draw.io 加载阿里云全部分类”，在左侧图库选择服务图标并拖到画布，添加连线和自己的说明。分类 XML 中已内嵌图像，无需逐个上传 SVG。'],
    ['桌面版与离线导入', '下载阿里云 ZIP 并解压，将 drawio/ 目录中所需分类 XML 拖到 draw.io 桌面版的空白画布，或使用“文件 → 打开库”。全量 XML 只显示一个面板；分类 XML 保留独立面板。'],
    ['选择分类与合并配置', '打开可搜索的图标库，选择阿里云，再打开“选择分类加载 / 桌面配置”。备份桌面端完整 JSON 后生成合并配置，可保留其他图库和设置；配置只在浏览器内处理。'],
  ] : [
    ['Load Alibaba Cloud architecture icons online', 'Choose “Load all Alibaba Cloud categories in draw.io”, then drag a service icon from a category panel onto the canvas. Add connections and your own labels. Images are embedded in the category XML.'],
    ['Desktop and offline imports', 'Download and unzip the Alibaba Cloud archive. Drag the desired category XML files from drawio/ onto a blank draw.io Desktop canvas, or use File → Open Library. The all-icons XML creates one panel; category XML files keep separate panels.'],
    ['Select categories and merge configurations', 'Open the interactive library, choose Alibaba Cloud and open “Choose categories / desktop setup”. Back up your existing complete JSON before generating a merged configuration. Other libraries and settings are preserved, and processing stays in your browser.'],
  ];
  const questions = chinese ? [
    ['这是阿里云官方图标下载站吗？', '这是社区整理的架构图标库，第三方图形来源记录在素材说明中，不代表阿里云官方站点或品牌背书。下载和使用仍须遵守上游许可及品牌权利。'],
    [`${icons.length} 个条目是否代表 ${icons.length} 个云产品？`, t.variants],
    ['这里和 Iconfont 字体图标库有什么区别？', '本页用于查找阿里云架构图标，提供 SVG 素材和 draw.io XML 库；不提供网站开发用的通用字体图标 CSS 或品牌 Logo 使用授权。'],
  ] : [
    ['Is this an official Alibaba Cloud download site?', 'This is a community architecture-icon collection with documented third-party artwork sources. It does not represent an official Alibaba Cloud site or brand endorsement. Upstream licenses and brand rights still apply.'],
    [`Do ${icons.length} entries mean ${icons.length} distinct cloud products?`, t.variants],
    ['How does this differ from an Iconfont font library?', 'This page provides Alibaba Cloud architecture artwork as SVG files and draw.io XML libraries. It does not provide general website icon-font CSS or additional brand-logo permissions.'],
  ];
  // Show a small catalog-derived preview, without duplicating all category cards.
  const examples = categories.filter(c => !/orange|supplemental/.test(c.id)).map(category =>
    icons.find(i => i.category === category.id)).filter(Boolean).slice(0, 6);
  const body = `<p>${intro}</p><p>${t.variants}</p>
<section><h2>${chinese ? '下载与在线使用' : 'Downloads and online use'}</h2><ul>${downloads.map(([target, label]) => `<li>${link(path, target, label)}</li>`).join('')}</ul>
${categories.length ? `<p><a href="${escapeHtml(drawioUrl(siteUrl, categories.map(c => c.libraries[locale])))}">${chinese ? '在 draw.io 加载阿里云全部分类' : 'Load all Alibaba Cloud categories in draw.io'}</a></p>` : ''}
<p><a href="${relativeLink(path, '')}?collection=alibaba-cloud#library">${chinese ? '打开图标库并搜索阿里云服务名称' : 'Search Alibaba Cloud services in the icon library'}</a></p></section>
<section><h2>${t.categories}</h2><ul>${categories.map(c => `<li>${link(path, categoryPath(locale, c), `${localized(c, locale)} (${c.count})`)} · ${link(path, c.libraries[locale], t.library)}</li>`).join('')}</ul></section>
<section><h2>${chinese ? '图标预览与素材来源' : 'Icon previews and artwork sources'}</h2><div class="icons">${examples.map(icon => `<article><img src="${escapeHtml(relativeLink(path, icon.asset))}" alt="${escapeHtml(localized(icon, locale))}" loading="lazy" width="64" height="64" /><h3>${escapeHtml(localized(icon, locale))}</h3><p>${link(path, categoryPath(locale, categories.find(c => c.id === icon.category)), chinese ? '查看分类与更多图标' : 'View category and more icons')} · ${link(path, icon.asset, 'SVG')}</p><a href="${escapeHtml(icon.source.url)}">${t.source}</a></article>`).join('')}</div></section>
<section><h2>${chinese ? '如何导入 draw.io' : 'How to import into draw.io'}</h2>${instructions.map(([title, detail]) => `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p>`).join('')}<p>${link(path, `discover/${locale}/guide/`, t.guide)}</p></section>
<section><h2>${chinese ? '常见问题' : 'Common questions'}</h2>${questions.map(([question, answer]) => `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).join('')}</section>`;
  return page({ locale, suffix: 'alibaba-cloud/', title: t.alibabaTitle, description, body,
    items: categories.map(c => ({ name: localized(c, locale), url: absolute(categoryPath(locale, c)) })),
  });
}

export function homepageMetadata() {
  return `${robotsMeta}\n${jsonLd({ '@context': 'https://schema.org', '@graph': [website, { '@type': 'CollectionPage', '@id': siteUrl, url: siteUrl, name: text.en.title, description: text.en.description, inLanguage: locales, isPartOf: { '@id': website['@id'] } }] })}`;
}

function page({ locale, suffix, title, documentTitle = title, description, body, items }) {
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
<title>${escapeHtml(documentTitle)}</title><meta name="description" content="${escapeHtml(description)}" />${robotsMeta}
<link rel="canonical" href="${absolute(path)}" />
${locales.map(lang => `<link rel="alternate" hreflang="${lang}" href="${absolute(`discover/${lang}/${suffix}`)}" />`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${absolute(`discover/en/${suffix}`)}" />
<meta property="og:type" content="website" /><meta property="og:url" content="${absolute(path)}" /><meta property="og:title" content="${escapeHtml(documentTitle)}" /><meta property="og:description" content="${escapeHtml(description)}" />
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
    if (catalog.collections.some(c => c.id === 'alibaba-cloud')) pages.push(alibabaPage(catalog, locale));
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
      const body = `<p>${link(path, category.libraries[locale], t.library)}</p>${category.collection === 'alibaba-cloud' ? `<p>${link(path, alibabaPath(locale), t.alibabaLink)}</p><p>${t.variants}</p>` : ''}
<div class="icons">${icons.map(icon => `<article id="${escapeHtml(icon.id)}"><img src="${escapeHtml(relativeLink(path, icon.asset))}" alt="${escapeHtml(localized(icon, locale))}" loading="lazy" width="64" height="64" /><h2>${escapeHtml(localized(icon, locale))}</h2><p>${t.aliases}: ${escapeHtml([...new Set([icon.name, icon.nameEn, ...icon.aliases, ...icon.tags].filter(Boolean))].join(', '))}</p><p><a href="${escapeHtml(icon.homepage)}">${t.product}</a> · <a href="${escapeHtml(icon.source.url)}">${t.source}</a></p><p>${escapeHtml(icon.source.collectionLicense || '')} · ${link(path, icon.usagePolicyUrl || 'ICON_USAGE.md', t.provenance)}</p></article>`).join('')}</div>`;
      pages.push(page({ locale, suffix: `${category.collection}/${category.id}/`, title, documentTitle, description, body,
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
  files.set('llms.txt', `# Architecture Icons for draw.io\n\n> ${text.en.description}\n> ${text['zh-CN'].description}\n\n${summary(catalog, 'en')}\n${text.en.variants}\n\n## Catalog and usage\n\n- [English catalog](${absolute('discover/en/')})\n- [中文目录](${absolute('discover/zh-CN/')})\n- [Alibaba Cloud icons and downloads](${absolute(alibabaPath('en'))})\n- [阿里云icon 图标库与下载](${absolute(alibabaPath('zh-CN'))})\n- [English usage guide](${absolute('discover/en/guide/')})\n- [中文使用指南](${absolute('discover/zh-CN/guide/')})\n- [Machine-readable catalog](${absolute('unified-catalog.json')})\n- [Icon use policy](${absolute('ICON_USAGE.md')})\n- [Artwork provenance and licenses](${absolute('THIRD_PARTY_NOTICES.md')})\n\n## Categories\n\n${catalog.categories.map(c => `- [${c.nameEn} / ${c.name}](${absolute(categoryPath('en', c))}): ${c.count} entries; [中文](${absolute(categoryPath('zh-CN', c))})`).join('\n')}\n\n## AI drawing integration\n\nUse Draw.io MCP with DRAWIO_ICON_SERVICE_URL=${absolute('api/icons')}. This is an icon search API, not a remote MCP server URL. No account or API key is required.\n\n## Rights\n\n${text.en.rights}\n${text['zh-CN'].rights}\n`);
  files.set('discover/style.css', 'body{margin:0;background:#f8f7f4;color:#292720;font:16px/1.7 system-ui,sans-serif}header,main,footer{max-width:1080px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;border-bottom:1px solid #d8d5cc}h1{font-size:clamp(28px,4vw,44px);line-height:1.2}h2{font-size:21px}a{color:#81501e;text-underline-offset:3px;overflow-wrap:anywhere}li{margin:12px 0}section{margin:32px 0}footer{border-top:1px solid #d8d5cc}.icons{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:20px}.icons article{padding:20px;border:1px solid #d8d5cc;border-radius:12px;background:#fff;overflow-wrap:anywhere}.icons img{object-fit:contain}.icons p{font-size:14px}\n');
  return files;
}

export async function generateDiscovery(catalog) {
  for (const [path, content] of discoveryFiles(catalog)) await save(`public/${path}`, content);
  await save('public/discover/favicon.svg', await readFile('src/favicon.svg'));
}
