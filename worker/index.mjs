import index from '../.worker-build/search-index.json';
import catalog from '../dist/unified-catalog.json';
import { createHandler } from './search.mjs';
import { createSiteHandler } from './site.mjs';

const handle = createSiteHandler(catalog, createHandler(index));
export default {
  fetch(request, env) {
    return handle(request, env);
  },
};
