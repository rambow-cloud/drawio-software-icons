import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import App from '../src/App';
import type { Catalog } from '../src/types';
import { prepareHomepage } from '../src/static-homepage.mjs';

export function renderHomepage(catalog:Catalog) {
  const english=renderToString(createElement(App,{catalog,initialLocale:'en'}));
  const chinese=renderToString(createElement(App,{catalog,initialLocale:'zh-CN'}));
  return `<div id="app" data-locale="en" data-pending-locale>${english}</div><template id="homepage-zh-CN">${chinese}</template><script>(${prepareHomepage.toString()})();</script>`;
}
