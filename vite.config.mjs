import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homepageMetadata } from './scripts/discovery.mjs';
import { tsImport } from 'tsx/esm/api';
import { homepageLocale } from './src/static-homepage.mjs';

const homepagePlugin = filename => ({
  name: 'static-homepage',
  async transformIndexHtml(html) {
    const { renderHomepage } = await tsImport('./scripts/render-homepage.tsx', import.meta.url);
    const catalog = JSON.parse(readFileSync(new URL('./public/unified-catalog.json', import.meta.url), 'utf8'));
    return html.replace('<!-- homepage:locale -->', () => `<script>document.documentElement.lang=(${homepageLocale.toString()})();</script><style>html[lang="zh-CN"] #app[data-pending-locale][data-locale="en"]{visibility:hidden}</style>`)
      .replace('<!-- discovery:metadata -->', () => `${homepageMetadata(catalog)}\n<link rel="preload" href="./${filename}" as="fetch" crossorigin="anonymous" />`)
      .replace('<!-- homepage:content -->', () => renderHomepage(catalog));
  },
});

export default defineConfig(({ command, isPreview }) => {
  // Preview serves an already-built bundle; it does not need generated source files.
  const filename = command === 'serve' && isPreview ? 'unified-catalog.json' :
    `unified-catalog-${createHash('sha256').update(readFileSync(new URL('./public/unified-catalog.json', import.meta.url))).digest('hex')}.json`;
  return { plugins: [react(), tailwindcss(), homepagePlugin(filename)], resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }, base: './', define: { __CATALOG_FILE__: JSON.stringify(filename) } };
});
