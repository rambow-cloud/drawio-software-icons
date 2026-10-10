import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homepageDiscovery, homepageMetadata } from './scripts/discovery.mjs';

const discoveryPlugin = {
  name: 'static-homepage-discovery',
  transformIndexHtml(html) {
    const catalog = JSON.parse(readFileSync(new URL('./public/unified-catalog.json', import.meta.url), 'utf8'));
    return html.replace('<!-- discovery:metadata -->', homepageMetadata())
      .replace('<!-- discovery:content -->', homepageDiscovery(catalog));
  },
};

export default defineConfig(({ command, isPreview }) => {
  // Preview serves an already-built bundle; it does not need generated source files.
  const filename = command === 'serve' && isPreview ? 'unified-catalog.json' :
    `unified-catalog-${createHash('sha256').update(readFileSync(new URL('./public/unified-catalog.json', import.meta.url))).digest('hex')}.json`;
  return { plugins: [react(), tailwindcss(), discoveryPlugin], resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }, base: './', define: { __CATALOG_FILE__: JSON.stringify(filename) } };
});
