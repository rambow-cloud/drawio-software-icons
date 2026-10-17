import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import App from '../src/App';
import type { Catalog } from '../src/types';
import type { Locale } from '../src/i18n';

export function renderHomepage(catalog:Catalog, locale:Locale='zh-CN') {
  const html=renderToString(createElement(App,{catalog,initialLocale:locale}));
  // All app resources live at the site root, including on the Pages mirror.
  const localized=locale==='en'?html.replace(/\b(href|src)="\.\//g,'$1="../'):html;
  return `<div id="app" data-locale="${locale}">${localized}</div>`;
}
