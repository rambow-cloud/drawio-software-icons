// Shared HTML rendering for build-time catalogs and request-time icon pages. No Node APIs.
import { homepages } from './homepage.mjs';
import { iconGuides, iconGuidePath, iconDetailUrl, iconSiteUrl, legacyStaticIconIds } from './icon-guides.mjs';

export const siteUrl = iconSiteUrl;
const repository = 'https://github.com/rambow-cloud/drawio-software-icons';
const locales = ['en', 'zh-CN'];
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const absolute = path => new URL(path, siteUrl).href;
const localized = (item, locale, field = 'name') => locale === 'en' ? item[`${field}En`] || item[field] : item[field];
const categoryPath = (locale, category) => `discover/${locale}/${category.collection}/${category.id}/`;
const alibabaPath = locale => `discover/${locale}/alibaba-cloud/`;
export const alibabaHomeLink = (path, label) => `<a href="${relativeLink(path, '')}?collection=alibaba-cloud#library">${escapeHtml(label)}</a>`;
export const relativeLink = (from, to) => {
  const origin = from.split('/').filter(Boolean), destination = to.split('/').filter(Boolean);
  while (origin.length && destination.length && origin[0] === destination[0]) { origin.shift(); destination.shift(); }
  const value = '../'.repeat(origin.length) + destination.join('/');
  if (!value) return './';
  return (from ? '' : './') + value + ((!to || to.endsWith('/')) && !value.endsWith('/') ? '/' : '');
};
export const link = (from, to, label) => `<a href="${escapeHtml(relativeLink(from, to))}">${escapeHtml(label)}</a>`;
const jsonLd = value => `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`;
const website = { '@type': 'WebSite', '@id': `${siteUrl}#website`, name: 'Architecture Icons for draw.io', url: siteUrl, inLanguage: locales, sameAs: [repository] };
const robotsMeta = '<meta name="robots" content="index,follow,max-image-preview:large" />';

export const text = {
  en: {
    title: 'Software and Alibaba Cloud icons for draw.io',
    description: 'Browse software, cloud and AI architecture icons for draw.io / diagrams.net. Download category XML libraries, use offline desktop configurations, or connect Draw.io MCP.',
    browse: 'Browse the interactive icon library', categories: 'Icon collections and categories', guide: 'How to use icons in draw.io',
    alibabaLink: 'Alibaba Cloud icons and downloads',
    rights: 'Commercial icons are provided solely for draw.io architecture diagrams. Upstream licenses and brand rights apply; this project grants no additional brand permissions. Code and documentation use MIT, which does not relicense the artwork.',
    variants: 'Alibaba Cloud entries include color variants and supplemental UI graphics; the entry count is not a count of distinct cloud services.',
    provenance: 'Artwork sources and usage', library: 'Download category XML', product: 'Product / project', source: 'Artwork source', aliases: 'Names and search terms',
    language: '中文', contents: 'Contents',
    steps: [
      ['Online diagrams', 'Open the interactive library and choose “Open all collections in draw.io” or select categories. The website loads their XML libraries into diagrams.net. Drag an icon onto the canvas and connect it to other nodes.'],
      ['Offline desktop', 'Download the category XML from an icon’s details. In draw.io Desktop, use File → Open Library → Device to import it. Images are embedded in the XML and work offline. Import one language only.'],
      ['Merge existing configurations', 'On the interactive website, open “Select categories / Desktop config”. Back up your complete JSON from Extras → Configuration, paste it into the optional input, select categories, and generate the merged JSON. Apply it in the desktop app and restart. Other libraries and settings are preserved; processing stays in your browser.'],
      ['AI drawing with Draw.io MCP', 'The interactive website’s “Connect MCP” dialog supplies setup for Codex, Claude Desktop, Cursor and VS Code with Node.js LTS. Set DRAWIO_ICON_SERVICE_URL to https://icons.rambow.cloud/api/icons for an existing Draw.io MCP installation. This endpoint is an icon search API, not a remote MCP server URL. No website account or API key is required.'],
    ],
  },
  'zh-CN': {
    title: 'draw.io 软件与阿里云架构图标库',
    description: '浏览 draw.io / diagrams.net 软件、云服务与 AI 架构图标，下载分类 XML 图标库，生成离线桌面配置，或通过 Draw.io MCP 搜索图标。',
    browse: '打开可搜索的图标库', categories: '图标集与分类', guide: '如何在 draw.io 中使用图标',
    alibabaLink: '阿里云icon 图标库与下载',
    rights: '商业图标仅供 draw.io 架构图绘制。上游许可和品牌权利仍然适用，本项目不额外授予品牌使用权。代码和文档采用 MIT 许可，不代表图形素材统一采用 MIT 许可。',
    variants: '阿里云条目包含颜色变体和 UI 补充图形，条目数量不代表独立云服务数量。',
    provenance: '素材来源与使用范围', library: '下载本分类 XML', product: '产品 / 项目', source: '图标来源', aliases: '名称与搜索词',
    language: 'English', contents: '目录',
    steps: [
      ['在线绘图', '打开交互图标库，点击“在 draw.io 加载全部合集”或选择所需分类，分类 XML 图标库将加载到 diagrams.net 左侧。将图标拖入画布，再添加连线和自己的说明。'],
      ['离线桌面使用', '在图标详情下载所需分类 XML。在 draw.io 桌面版，使用“文件 → 打开库 → 设备”导入。图片已内嵌，可离线使用。只导入一种语言。'],
      ['合并已有桌面配置', '在交互网站打开“选择分类加载 / 桌面配置”。先从桌面版“其他 → 配置”备份完整 JSON，再粘贴到可选输入框，勾选分类并生成合并配置。应用到桌面端并重启，其他图标库和设置会保留，配置仅在浏览器内处理。'],
      ['通过 Draw.io MCP 进行 AI 绘图', '交互网站“接入 MCP”提供 Codex、Claude Desktop、Cursor 和 VS Code 的配置，需要 Node.js LTS。已有 Draw.io MCP 时，将 DRAWIO_ICON_SERVICE_URL 设置为 https://icons.rambow.cloud/api/icons。此地址是图标搜索 API，不能当作远程 MCP Server URL；无需本站账号或 API Key。'],
    ],
  },
};

export function summary(catalog, locale) {
  return locale === 'en'
    ? `${catalog.icons.length.toLocaleString('en')} entries in ${catalog.collections.length} collections and ${catalog.categories.length} categories. Bilingual browsing and XML libraries; SVG / PNG artwork keeps its source colors.`
    : `${catalog.collections.length} 个图标集、${catalog.categories.length} 个分类，共 ${catalog.icons.length.toLocaleString('en')} 个条目。支持中英文浏览与分类 XML 下载，SVG / PNG 素材保留来源颜色。`;
}

export function categoryList(catalog, locale, path) {
  return catalog.collections.map(collection => `<section><h2>${collection.id === 'alibaba-cloud' ? alibabaHomeLink(path, text[locale].alibabaLink) : escapeHtml(localized(collection, locale))}</h2><ul>${catalog.categories.filter(c => c.collection === collection.id).map(category => `<li>${link(path, categoryPath(locale, category), `${localized(category, locale)} (${category.count})`)} — ${escapeHtml(localized(category, locale, 'description'))}</li>`).join('')}</ul></section>`).join('');
}

function usageLinks(path, locale) {
  return `<section><h2>${text[locale].provenance}</h2><p>${text[locale].rights}</p><p>${link(path, 'ICON_USAGE.md', 'Icon usage / 图标使用声明')} · ${link(path, 'THIRD_PARTY_NOTICES.md', 'Third-party notices / 第三方资源说明')} · ${link(path, 'compat/alibaba-cloud/NOTICE.md', 'Alibaba Cloud artwork notice')}</p><a href="${repository}">GitHub</a></section>`;
}

export function alibabaRedirect(locale) {
  return [alibabaPath(locale) + 'index.html', `<!doctype html>
<html lang="${locale}"><head><meta charset="UTF-8" /><meta http-equiv="refresh" content="0; url=${siteUrl}" />
<link rel="canonical" href="${siteUrl}" /><title>${locale === 'en' ? 'Alibaba Cloud icons have moved' : '阿里云图标已移至首页'}</title></head>
<body><p><a href="${siteUrl}">${locale === 'en' ? 'Open the homepage icon library' : '打开首页图标库'}</a></p></body></html>\n`];
}

export function homepageMetadata(catalog, locale = 'zh-CN') {
  const { title, description, path } = homepages[locale];
  const url = absolute(path);
  const collectionList = { '@type': 'ItemList', numberOfItems: catalog.collections.length,
    itemListElement: catalog.collections.map((collection, index) => ({ '@type': 'ListItem', position: index + 1,
      name: localized(collection, locale), url: `${url}?collection=${encodeURIComponent(collection.id)}#library` })) };
  return `<title>${escapeHtml(title)}</title>\n<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${url}" />
${locales.map(lang => `<link rel="alternate" hreflang="${lang}" href="${absolute(homepages[lang].path)}" />`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${siteUrl}" />
<meta property="og:type" content="website" /><meta property="og:url" content="${url}" />
<meta property="og:title" content="${escapeHtml(title)}" /><meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'zh_CN'}" /><meta name="twitter:card" content="summary" />
${robotsMeta}\n${jsonLd({ '@context': 'https://schema.org', '@graph': [website, { '@type': 'CollectionPage', '@id': url, url, name: title, description, inLanguage: locale, isPartOf: { '@id': website['@id'] }, mainEntity: collectionList }] })}`;
}

export function page({ locale, suffix, title, documentTitle = title, description, body, items, image, detail = false }) {
  const path = `discover/${locale}/${suffix}`;
  const otherLocale = locale === 'en' ? 'zh-CN' : 'en';
  const translated = `discover/${otherLocale}/${suffix}`;
  const schema = { '@context': 'https://schema.org', '@graph': [website, {
    '@type': items ? 'CollectionPage' : 'WebPage', '@id': absolute(path), url: absolute(path), name: title, description,
    inLanguage: locale, isPartOf: { '@id': website['@id'] },
    ...(items ? { mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) } } : {}),
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', contentUrl: absolute(image.asset), caption: image.name } } : {}),
  }, { '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Architecture Icons', item: absolute(homepages[locale].path) },
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
<link rel="icon" type="image/svg+xml" href="${relativeLink(path, 'discover/favicon.svg')}" /><link rel="stylesheet" href="${relativeLink(path, detail ? 'discover/detail.css' : 'discover/style.css')}" />
${jsonLd(schema)}</head>${detail ? `<body><a class="skip-link" href="#content">${locale === 'en' ? 'Skip to content' : '跳至内容'}</a>
<header class="topbar"><a class="brand" href="${relativeLink(path, homepages[locale].path)}" aria-label="Architecture Icons"><img src="${relativeLink(path, 'discover/favicon.svg')}" width="39" height="39" alt="" /><span>architecture<span class="brand-light">icons</span><small>for draw.io</small></span></a><nav aria-label="${locale === 'en' ? 'Main navigation' : '主导航'}">${link(path, homepages[locale].path, locale === 'en' ? 'Icon library' : '图标库')}${link(path, `discover/${locale}/`, locale === 'en' ? 'Categories' : '图标分类')}${link(path, `discover/${locale}/guide/`, locale === 'en' ? 'Usage guide' : '使用指南')}</nav><a class="language" href="${relativeLink(path, translated)}" hreflang="${otherLocale}">${text[locale].language}</a></header>
<main id="content" class="detail-main"><nav class="breadcrumbs" aria-label="${locale === 'en' ? 'Breadcrumb' : '面包屑导航'}">${link(path, homepages[locale].path, locale === 'en' ? 'Home' : '首页')}<span aria-hidden="true">/</span>${link(path, `discover/${locale}/`, text[locale].contents)}<span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(image.name)}</span></nav>${body}</main>
<footer class="detail-footer"><span>architecture<span class="brand-light">icons</span> <small>for draw.io</small></span><div>${link(path, 'ICON_USAGE.md', locale === 'en' ? 'Icon usage' : '图标使用声明')}${link(path, 'THIRD_PARTY_NOTICES.md', locale === 'en' ? 'Third-party notices' : '第三方资源说明')}<a href="${repository}">GitHub ↗</a></div></footer></body>` : `<body><header><a href="${relativeLink(path, homepages[locale].path)}">Architecture Icons <small>for draw.io</small></a><nav>${link(path, `discover/${locale}/`, text[locale].contents)} · ${link(path, translated, text[locale].language)}</nav></header>
<main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p>${link(path, homepages[locale].path, text[locale].browse)}</p>${body}${usageLinks(path, locale)}</main>
<footer>${link(path, `discover/${locale}/guide/`, text[locale].guide)}</footer></body>`}</html>\n`;
  return [path + 'index.html', html];
}

export function iconDetailPage(catalog, icon, locale) {
  const en = locale === 'en';
  const guide = iconGuides[icon.id];
  const name = localized(icon, locale), path = iconGuidePath(locale, icon.id);
  const category = catalog.categories.find(c => c.id === icon.category);
  if (!category) throw Error(`Missing guide category for ${icon.id}`);
  const format = icon.asset.endsWith('.png') ? 'PNG' : 'SVG';
  const collection = catalog.collections.find(c => c.id === icon.collection);
  const summary = guide?.[locale]?.summary || (en
    ? `${name} ${format} icon in the ${localized(collection, locale)} / ${localized(category, locale)} collection. Download the image, import category XML, or load it in draw.io.`
    : `${name} ${format} 图标，收录于${localized(collection, locale)}的${localized(category, locale)}分类。支持单图下载、分类 XML 与 draw.io 在线加载。`);
  const title = en ? `${name} ${format} Icon for draw.io` : `${name} ${format} 图标下载 | draw.io`;
  const library = category.libraries[locale];
  const candidates = [...(guide?.related || []), ...catalog.icons.filter(i => i.category === icon.category || i.categories?.includes(icon.category)).map(i => i.id)];
  const knownIds = new Set(catalog.icons.map(i => i.id));
  const related = [...new Set(candidates)].filter(id => id !== icon.id && knownIds.has(id)).slice(0, 4);
  const download = (asset, label, primary = false) => `<a class="action${primary ? ' action-primary' : ''}" href="${escapeHtml(relativeLink(path, asset))}" download><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/></svg>${escapeHtml(label)}</a>`;
  const external = (url, label) => `<a href="${escapeHtml(/^https?:\/\//i.test(url || '') ? url : '#')}">${escapeHtml(label)}</a>`;
  const license = icon.source.licenseUrl || 'ICON_USAGE.md';
  const licenseLink = /^https?:/.test(license) ? external(license, icon.source.collectionLicense) : link(path, license, icon.source.collectionLicense);
  const drawio = `https://app.diagrams.net/?clibs=U${encodeURIComponent(absolute(library))}`;
  const body = `<section class="icon-hero" aria-labelledby="icon-title"><figure class="preview"><div class="preview-top"><span>${en ? 'ARTWORK PREVIEW' : '图标预览'}</span><span class="format-tag">${format}</span></div><div class="preview-tile"><img src="${escapeHtml(relativeLink(path, icon.asset))}" alt="${escapeHtml(`${name} ${format} ${en ? 'icon' : '图标'}`)}" width="160" height="160" /></div><figcaption>${en ? 'Original colors · Ready for your canvas' : '保留原色 · 放入画布即可使用'}</figcaption></figure>
<div class="icon-intro"><p class="eyebrow">${link(path, categoryPath(locale, category), localized(category, locale))}<span aria-hidden="true"> / </span>DRAW.IO</p><h1 id="icon-title">${escapeHtml(name)}<span>${en ? 'Architecture icon' : '架构图标'}</span></h1><p class="intro">${escapeHtml(summary)}</p><div class="actions">${download(icon.asset, en ? `Download ${format}` : `下载 ${format}`, true)}<a class="action" href="${escapeHtml(drawio)}">${en ? 'Open in draw.io' : '在 draw.io 中使用'} <span aria-hidden="true">↗</span></a></div><div class="secondary-action">${download(library, en ? 'Category XML' : '下载分类 XML')}<span>${en ? 'Embedded artwork for offline use' : '内嵌素材，支持离线使用'}</span></div>
<aside class="provenance" aria-labelledby="provenance-title"><p class="eyebrow">CLEAR ORIGINS</p><h2 id="provenance-title">${en ? 'About this artwork' : '素材信息'}</h2><dl>
<dt>${en ? 'Format' : '格式'}</dt><dd>${format}${icon.width && icon.height ? ` · ${icon.width} × ${icon.height}` : ''}</dd>
<dt>${en ? 'Collection' : '图标集'}</dt><dd>${escapeHtml(localized(collection, locale))}</dd>
<dt>${en ? 'Names and aliases' : '名称与别名'}</dt><dd>${escapeHtml([...new Set([icon.name, icon.nameEn, ...(icon.aliases || [])].filter(Boolean))].join(', '))}</dd>
<dt>${en ? 'Artwork source' : '素材来源'}</dt><dd>${external(icon.source.url, icon.source.publisher || icon.source.id)}</dd>
<dt>${en ? 'Collection license / artwork terms' : '图标集许可／素材条款'}</dt><dd>${licenseLink}</dd>
</dl><p class="rights-note">${en ? 'Software licensing and artwork rights are separate. Collection licenses do not grant additional trademark rights. Check the linked terms before reuse; this community collection is not an endorsement by the product owner.' : '软件许可与图形素材权利分别适用，图标集许可不额外授予商标权。使用前请查阅所链接的条款；本社区合集不代表产品所有者的背书。'}</p>
<details><summary>${en ? 'Version & file verification' : '版本与文件校验'}</summary><dl><dt>${en ? 'Pinned revision' : '固定来源版本'}</dt><dd><code>${escapeHtml(icon.source.revision)}</code></dd><dt>SHA-256</dt><dd><code>${escapeHtml(icon.sha256)}</code></dd></dl></details></aside></div></section>
${related.length ? `<section class="related"><div class="section-heading"><div><p class="eyebrow">BUILD THE BIGGER PICTURE</p><h2>${en ? 'Keep building' : '继续完善你的架构图'}</h2></div>${link(path, `discover/${locale}/`, en ? 'All categories →' : '浏览全部分类 →')}</div><div class="related-grid">${related.map(id => { const item = catalog.icons.find(i => i.id === id); return `<a class="related-card" href="${relativeLink(path, iconGuidePath(locale, id))}"><span class="related-art"><img src="${escapeHtml(relativeLink(path, item.asset))}" width="44" height="44" alt="" loading="lazy" /></span><span><strong>${escapeHtml(localized(item, locale))}</strong><small>${en ? 'Icon details' : '图标详情'}</small></span><span class="related-arrow" aria-hidden="true">↗</span></a>`; }).join('')}</div></section>` : ''}`;
  return page({ locale, suffix: `icons/${encodeURIComponent(icon.id)}/`, title, description: summary, body, image: { asset: icon.asset, name }, detail: true });
}

export function legacyIconRedirects() {
  return new Map(legacyStaticIconIds.flatMap(id => locales.map(locale => {
    const destination = iconDetailUrl(locale, id);
    return [iconGuidePath(locale, id) + 'index.html', `<!doctype html>
<html lang="${locale}"><head><meta charset="UTF-8" /><meta http-equiv="refresh" content="0; url=${destination}" /><link rel="canonical" href="${destination}" /><title>${locale === 'en' ? 'Open icon details' : '打开图标详情'}</title></head><body><p><a href="${destination}">${locale === 'en' ? 'Open icon details' : '打开图标详情'}</a></p></body></html>
`];
  })));
}
