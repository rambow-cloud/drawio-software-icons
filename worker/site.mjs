import { iconDetailPage } from '../src/discovery-page.mjs';
import { iconGuidePath, iconSiteUrl } from '../src/icon-guides.mjs';

const htmlHeaders = { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=0, must-revalidate' };
const missingPage = locale => {
  const en = locale === 'en';
  const title = en ? 'Icon not found' : '未找到图标';
  return `<!doctype html><html lang="${en ? 'en' : 'zh-CN'}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title}</title><link rel="stylesheet" href="/discover/detail.css" /></head><body><main class="detail-main"><nav class="breadcrumbs"><a href="${iconSiteUrl}">architecture icons</a></nav><h1>${title}</h1><p>${en ? 'This icon is not in the current catalog.' : '当前目录中没有这个图标。'}</p><p><a href="${iconSiteUrl}${en ? 'en/' : ''}">${en ? 'Browse the icon library' : '浏览图标库'} →</a></p></main></body></html>`;
};

// Catalog and lookup are deployment-scoped, read-only data; no request I/O is shared.
export function createSiteHandler(catalog, apiHandler) {
  const icons = new Map(catalog.icons.map(icon => [icon.id, icon]));
  return async function handle(request, env) {
    const url = new URL(request.url), path = url.pathname;
    if (path === '/api' || path.startsWith('/api/')) return apiHandler(request);
    if (!/^\/discover\/[^/]+\/icons(?:\/|$)/.test(path)) return env.ASSETS.fetch(request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    const match = path.match(/^\/discover\/(en|zh-CN)\/icons\/([^/]+)(?:\/|\/index\.html)?$/);
    let icon;
    try { if (match) icon = icons.get(decodeURIComponent(match[2])); } catch { /* Invalid URL encoding is a missing resource. */ }
    if (!icon) return new Response(request.method === 'HEAD' ? null : missingPage(match?.[1]), { status: 404, headers: htmlHeaders });
    const locale = match[1], canonical = '/' + iconGuidePath(locale, icon.id);
    if (path !== canonical) {
      const destination = new URL(canonical, url.origin);
      destination.search = url.search;
      return new Response(null, { status: 301, headers: { Location: destination.href } });
    }
    const [, html] = iconDetailPage(catalog, icon, locale);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(html));
    const etag = '"' + [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('') + '"';
    const headers = { ...htmlHeaders, ETag: etag };
    const validators = request.headers.get('If-None-Match')?.split(',').map(value => value.trim().replace(/^W\//, '')) || [];
    if (validators.includes(etag) || validators.includes('*')) return new Response(null, { status: 304, headers });
    return new Response(request.method === 'HEAD' ? null : html, { headers });
  };
}
