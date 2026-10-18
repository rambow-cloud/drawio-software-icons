import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { save } from './lib.mjs';
import { posix } from 'node:path';
import { homepages } from '../src/homepage.mjs';
import { iconGuides, iconGuidePath } from '../src/icon-guides.mjs';

export const siteUrl = 'https://icons.rambow.cloud/';
const repository = 'https://github.com/rambow-cloud/drawio-software-icons';
const locales = ['en', 'zh-CN'];
const detailStyles = readFileSync(new URL('../src/icon-detail.css', import.meta.url), 'utf8');
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const absolute = path => new URL(path, siteUrl).href;
const localized = (item, locale, field = 'name') => locale === 'en' ? item[`${field}En`] || item[field] : item[field];
const categoryPath = (locale, category) => `discover/${locale}/${category.collection}/${category.id}/`;
const alibabaPath = locale => `discover/${locale}/alibaba-cloud/`;
const alibabaHomeLink = (path, label) => `<a href="${relativeLink(path, '')}?collection=alibaba-cloud#library">${escapeHtml(label)}</a>`;
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

function summary(catalog, locale) {
  return locale === 'en'
    ? `${catalog.icons.length.toLocaleString('en')} entries in ${catalog.collections.length} collections and ${catalog.categories.length} categories. Bilingual browsing and XML libraries; SVG / PNG artwork keeps its source colors.`
    : `${catalog.collections.length} 个图标集、${catalog.categories.length} 个分类，共 ${catalog.icons.length.toLocaleString('en')} 个条目。支持中英文浏览与分类 XML 下载，SVG / PNG 素材保留来源颜色。`;
}

function categoryList(catalog, locale, path) {
  return catalog.collections.map(collection => `<section><h2>${collection.id === 'alibaba-cloud' ? alibabaHomeLink(path, text[locale].alibabaLink) : escapeHtml(localized(collection, locale))}</h2><ul>${catalog.categories.filter(c => c.collection === collection.id).map(category => `<li>${link(path, categoryPath(locale, category), `${localized(category, locale)} (${category.count})`)} — ${escapeHtml(localized(category, locale, 'description'))}</li>`).join('')}</ul></section>`).join('');
}

function usageLinks(path, locale) {
  return `<section><h2>${text[locale].provenance}</h2><p>${text[locale].rights}</p><p>${link(path, 'ICON_USAGE.md', 'Icon usage / 图标使用声明')} · ${link(path, 'THIRD_PARTY_NOTICES.md', 'Third-party notices / 第三方资源说明')} · ${link(path, 'compat/alibaba-cloud/NOTICE.md', 'Alibaba Cloud artwork notice')}</p><a href="${repository}">GitHub</a></section>`;
}

function alibabaRedirect(locale) {
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

function page({ locale, suffix, title, documentTitle = title, description, body, items, image, detail = false }) {
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

function iconDetailPage(catalog, icon, locale) {
  const en = locale === 'en';
  const guide = iconGuides[icon.id], copy = guide[locale];
  const name = localized(icon, locale), path = iconGuidePath(locale, icon.id);
  const category = catalog.categories.find(c => c.id === icon.category);
  if (!category) throw Error(`Missing guide category for ${icon.id}`);
  const format = icon.asset.endsWith('.png') ? 'PNG' : 'SVG';
  const title = en ? `${name} ${format} Icon for draw.io` : `${name} ${format} 图标与 draw.io 导入说明`;
  const library = category.libraries[locale];
  const related = guide.related.filter(id => catalog.icons.some(i => i.id === id));
  const download = (asset, label, primary = false) => `<a class="action${primary ? ' action-primary' : ''}" href="${escapeHtml(relativeLink(path, asset))}" download><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/></svg>${escapeHtml(label)}</a>`;
  const external = (url, label) => `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;
  const license = icon.source.licenseUrl || 'ICON_USAGE.md';
  const licenseLink = /^https?:/.test(license) ? external(license, icon.source.collectionLicense) : link(path, license, icon.source.collectionLicense);
  const drawio = `https://app.diagrams.net/?clibs=U${encodeURIComponent(absolute(library))}`;
  const body = `<section class="icon-hero" aria-labelledby="icon-title"><figure class="preview"><div class="preview-top"><span>${en ? 'ARTWORK PREVIEW' : '图标预览'}</span><span class="format-tag">${format}</span></div><div class="preview-tile"><img src="${escapeHtml(relativeLink(path, icon.asset))}" alt="${escapeHtml(`${name} ${format} ${en ? 'icon' : '图标'}`)}" width="160" height="160" /></div><figcaption>${en ? 'Original colors · Ready for your canvas' : '保留原色 · 放入画布即可使用'}</figcaption></figure>
<div class="icon-intro"><p class="eyebrow">${link(path, categoryPath(locale, category), localized(category, locale))}<span aria-hidden="true"> / </span>DRAW.IO</p><h1 id="icon-title">${escapeHtml(name)}<span>${en ? 'Architecture icon' : '架构图标'}</span></h1><p class="intro">${escapeHtml(copy.summary)}</p><div class="actions">${download(icon.asset, en ? `Download ${format}` : `下载 ${format}`, true)}<a class="action" href="${escapeHtml(drawio)}">${en ? 'Open in draw.io' : '在 draw.io 中使用'} <span aria-hidden="true">↗</span></a></div><div class="secondary-action">${download(library, en ? 'Category XML' : '下载分类 XML')}<span>${en ? 'Embedded artwork for offline use' : '内嵌素材，支持离线使用'}</span></div></div></section>
<div class="detail-columns"><div class="reading-column"><section class="editorial"><p class="eyebrow">IN YOUR ARCHITECTURE</p><h2>${en ? 'A place in your diagram' : '在架构图中，放对位置'}</h2><p>${escapeHtml(copy.diagram)}</p><p class="tip">${escapeHtml(copy.tip)}</p><p class="text-link">${external(guide.reference, en ? 'Product documentation ↗' : '查看产品文档 ↗')}</p></section>
<section class="import-guide"><p class="eyebrow">FROM LIBRARY TO CANVAS</p><h2>${en ? 'From icon to diagram' : '从图标到架构图'}</h2><ol class="import-steps">
<li><div><h3>${en ? 'Choose your format' : '选择导入方式'}</h3><p>${en ? 'For one icon, download the artwork and drag it onto the canvas. Resize it while keeping its aspect ratio.' : '只需要一个图标时，下载素材并拖到画布上，缩放时保持宽高比例。'}</p></div></li>
<li><div><h3>${en ? 'Load the category' : '加载所需分类'}</h3><p>${en ? 'Use “Open in draw.io” online, or download the category XML and import it with File → Open Library in draw.io Desktop. Artwork is embedded for offline use.' : '在线点击“在 draw.io 中使用”；或下载分类 XML，在桌面版通过“文件 → 打开库”导入，内嵌素材支持离线使用。'}</p></div></li>
<li><div><h3>${en ? 'Make it your architecture' : '画出你的架构'}</h3><p>${escapeHtml(en ? `Find ${name} in the library, drag it onto the canvas, then add labels and connectors for your deployment.` : `在图标库中找到 ${name}，拖入画布，再按实际部署添加标签和连线。`)}</p></div></li></ol><p class="text-link">${link(path, `discover/${locale}/guide/`, en ? 'More on XML, desktop JSON and MCP →' : '更多 XML、桌面 JSON 与 MCP 用法 →')}</p></section></div>
<aside class="provenance" aria-labelledby="provenance-title"><p class="eyebrow">CLEAR ORIGINS</p><h2 id="provenance-title">${en ? 'About this artwork' : '素材信息'}</h2><dl>
<dt>${en ? 'Format' : '格式'}</dt><dd>${format}${icon.width && icon.height ? ` · ${icon.width} × ${icon.height}` : ''}</dd>
<dt>${en ? 'Artwork source' : '素材来源'}</dt><dd>${external(icon.source.url, icon.source.publisher || icon.source.id)}</dd>
<dt>${en ? 'Collection license / artwork terms' : '图标集许可／素材条款'}</dt><dd>${licenseLink}</dd>
</dl><p class="rights-note">${en ? 'Software licensing and artwork rights are separate. Collection licenses do not grant additional trademark rights. Check the linked terms before reuse; this community collection is not an endorsement by the product owner.' : '软件许可与图形素材权利分别适用，图标集许可不额外授予商标权。使用前请查阅所链接的条款；本社区合集不代表产品所有者的背书。'}</p>
<details><summary>${en ? 'Version & file verification' : '版本与文件校验'}</summary><dl><dt>${en ? 'Pinned revision' : '固定来源版本'}</dt><dd><code>${escapeHtml(icon.source.revision)}</code></dd><dt>SHA-256</dt><dd><code>${escapeHtml(icon.sha256)}</code></dd></dl></details></aside></div>
${related.length ? `<section class="related"><div class="section-heading"><div><p class="eyebrow">BUILD THE BIGGER PICTURE</p><h2>${en ? 'Keep building' : '继续完善你的架构图'}</h2></div>${link(path, `discover/${locale}/`, en ? 'All categories →' : '浏览全部分类 →')}</div><div class="related-grid">${related.map(id => { const item = catalog.icons.find(i => i.id === id); return `<a class="related-card" href="${relativeLink(path, iconGuidePath(locale, id))}"><span class="related-art"><img src="${escapeHtml(relativeLink(path, item.asset))}" width="44" height="44" alt="" loading="lazy" /></span><span><strong>${escapeHtml(localized(item, locale))}</strong><small>${en ? 'Icon & import guide' : '图标与导入说明'}</small></span><span class="related-arrow" aria-hidden="true">↗</span></a>`; }).join('')}</div></section>` : ''}`;
  return page({ locale, suffix: `icons/${icon.id}/`, title, description: copy.summary, body, image: { asset: icon.asset, name }, detail: true });
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
    for (const icon of catalog.icons.filter(icon => Object.hasOwn(iconGuides, icon.id))) {
      pages.push(iconDetailPage(catalog, icon, locale));
    }
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
<div class="icons">${icons.map(icon => `<article id="${escapeHtml(icon.id)}"><img src="${escapeHtml(relativeLink(path, icon.asset))}" alt="${escapeHtml(localized(icon, locale))}" loading="lazy" width="64" height="64" /><h2>${Object.hasOwn(iconGuides, icon.id) ? link(path, iconGuidePath(locale, icon.id), localized(icon, locale)) : escapeHtml(localized(icon, locale))}</h2><p>${t.aliases}: ${escapeHtml([...new Set([icon.name, icon.nameEn, ...icon.aliases, ...icon.tags].filter(Boolean))].join(', '))}</p><p><a href="${escapeHtml(icon.homepage)}">${t.product}</a> · <a href="${escapeHtml(icon.source.url)}">${t.source}</a></p><p>${escapeHtml(icon.source.collectionLicense || '')} · ${link(path, icon.usagePolicyUrl || 'ICON_USAGE.md', t.provenance)}</p></article>`).join('')}</div>`;
      pages.push(page({ locale, suffix: `${category.collection}/${category.id}/`, title, documentTitle, description, body,
        items: icons.map(icon => ({ name: localized(icon, locale), url: `${absolute(path)}#${encodeURIComponent(icon.id)}` })),
      }));
    }
  }
  const files = new Map(pages);
  files.set('discover/detail.css', detailStyles);
  // Cloudflare static headers: keep draw.io CORS and give non-HTML documents
  // their own HTTPS canonical. The splat includes nested directories.
  files.set('_headers', `/*\n  Access-Control-Allow-Origin: *\n  X-Content-Type-Options: nosniff\n\n/*.md\n  Link: <${siteUrl}:splat.md>; rel="canonical"\n`);
  const urls = [siteUrl, absolute(homepages.en.path), ...pages.map(([path]) => absolute(path.replace(/index\.html$/, '')))];
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
  files.set('discover/style.css', 'body{margin:0;background:#f8f7f4;color:#292720;font:16px/1.7 system-ui,sans-serif}header,main,footer{max-width:1080px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;border-bottom:1px solid #d8d5cc}h1{font-size:clamp(28px,4vw,44px);line-height:1.2}h2{font-size:21px}a{color:#81501e;text-underline-offset:3px;overflow-wrap:anywhere}li{margin:12px 0}section{margin:32px 0}footer{border-top:1px solid #d8d5cc}.icons{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:20px}.icons article{padding:20px;border:1px solid #d8d5cc;border-radius:12px;background:#fff;overflow-wrap:anywhere}.icons img{object-fit:contain}.icons p{font-size:14px}\n');
  const curated = catalog.icons.filter(icon => Object.hasOwn(iconGuides, icon.id));
  files.set('llms.txt', files.get('llms.txt') + `\n## Curated icon and import guides\n\n${curated.flatMap(icon => locales.map(locale => `- [${icon.name} (${locale})](${absolute(iconGuidePath(locale, icon.id))})`)).join('\n')}\n`);
  return files;
}

export async function generateDiscovery(catalog) {
  for (const [path, content] of discoveryFiles(catalog)) await save(`public/${path}`, content);
  await save('public/discover/favicon.svg', await readFile('src/favicon.svg'));
}
