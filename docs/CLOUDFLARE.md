# Cloudflare website and draw.io MCP icon service

The dual-site strategy serves the full collection at `https://icons.rambow.cloud/`
and `https://rambow-cloud.github.io/drawio-software-icons/`. Neither homepage
redirects to the other. `icons.rambow.cloud` is attached to the Cloudflare Worker,
and Workers Builds deploys `main` with `npm run deploy:cloudflare:production`.
GitHub Actions independently publishes the full `dist-pages` artifact. The
software repository's Pages custom domain remains empty. Only the separate
Alibaba compatibility repository retains its legacy homepage redirect.

The website is deployed with **Workers Static Assets**. Existing HTML, JS, SVG,
PNG, JSON, XML and ZIP paths are served directly by static asset hosting. Only
`/api` and `/api/*` use Worker-first routing. Missing static files return 404;
they must not return the homepage in place of an XML library or image.

No database, R2 bucket, KV namespace, Node server or runtime upstream fetch is
needed. GitHub Actions still runs Node and Python builders. A compact, normalized
search index is compiled into the same Worker version as its static assets.
Static resources explicitly allow cross-origin reads so the draw.io web editor
can continue loading XML libraries and images from this domain.

## MCP contract

After production cutover, configure the **MCP server process** with:

```json
{
  "env": {
    "DRAWIO_ICON_SERVICE_URL": "https://icons.rambow.cloud/api/icons"
  }
}
```

Merge this `env` entry into your existing draw.io MCP server configuration and
restart that process. This is an icon-service HTTP endpoint, not an MCP transport
endpoint. Do not append `/search` or a trailing slash to the configured URL.
Before production cutover, use `https://<worker>.<account>.workers.dev/api/icons`.

Upstream source reviewed at commit `1da785068fdeb455f8f8cfae0b7799f1ff183894`:
[shared/icon-search.js](https://github.com/jgraph/drawio-mcp/blob/1da785068fdeb455f8f8cfae0b7799f1ff183894/shared/icon-search.js).
Both MCP servers use the same image response contract. The MCP prefers built-in
shapes and consults this service only when it has room for supplementary icons.

`GET /api/icons/search?q=kubernetes&p=0&c=10`

- `q`: up to 256 characters; Unicode NFKC normalization and case-insensitive AND
  matching across names, aliases, tags and category names in both languages.
- `p`: zero-based page, default 0, range 0–1,000,000.
- `c`: page size, default 20, range 1–100.
- Exact names/aliases rank first, followed by prefixes, name matches, then metadata.
- Missing/blank queries and unmatched terms return `images: []`.
- Invalid parameters return JSON 400; unsupported methods 405; unknown APIs 404.
- GET, HEAD and OPTIONS are supported; public read-only CORS is enabled.

```json
{
  "images": [{
    "url": "https://icons.rambow.cloud/icons/kubernetes.svg",
    "title": "Kubernetes",
    "width": 48,
    "height": 48,
    "set": { "slug": "software", "name": "General Software" }
  }],
  "total": 1,
  "page": 0,
  "count": 10
}
```

Dimensions preserve the source aspect ratio with the larger side at 48 units.
HTTPS requests return images from that deployment's origin. Local HTTP development
uses production HTTPS image URLs because upstream MCP rejects HTTP image URLs.
`GET /api/health` exposes the icon count and content-derived index version.
The existing [icon usage policy](../ICON_USAGE.md) applies to API results too.

## Build and deployment

```sh
npm ci
npm test
npm run build:cloudflare
npm run check:cloudflare
npm run dev:cloudflare
```

`build:cloudflare` retains `dist` and `dist-alibaba`, creates the bundled index
under `.worker-build`, and produces a full `dist-pages` copy plus
`dist-alibaba-pages` with a legacy redirect homepage. It verifies search parity,
static-asset size/count limits, relative homepage assets, identical full-site
bytes and unchanged legacy resource bytes. `check:cloudflare` bundles the Worker
without deploying it.

`build` and `test` now synchronize icon JSON configuration before consuming the
catalog. Configuration-only commits therefore work with the existing build
command. See [Icon configuration](ICON_CONFIGURATION.md) for source and cache
settings. With `cache.directory: "auto"`, Workers Builds stores icon downloads in
the `drawio-software-icons` subdirectory of npm's cache; enable **Settings → Build →
Build cache** for cross-build reuse. GitHub Actions restores `.sync-stage/cache`
through `actions/cache`. A cache miss only increases build time; missing or
invalid artwork fails the build before deployment.

Authenticate with `npx wrangler login`, then `npm run deploy:cloudflare` publishes
the site and API on workers.dev, without claiming the production domain. Both
deployment commands require a fresh `build:cloudflare` output.

### Cloudflare Workers Builds (current deployment pipeline)

The Cloudflare GitHub App connects `rambow-cloud/drawio-software-icons` directly to
Workers Builds. Pushes to `main` build and deploy the Worker from root directory
`/`. The configured build command creates a temporary Python environment,
installs `uv`, runs `npm test`, then runs `npm run build:cloudflare`. Cloudflare
installs npm dependencies before executing this command.

Use `npm run deploy:cloudflare` as the deploy command before domain cutover.
Set `NODE_VERSION=22` and `PYTHON_VERSION=3.13.3` under **Build variables**,
not Worker runtime variables. Under **Settings → Builds**, keep the production
branch set to `main` and disable builds for non-production branches. If using
branch filters, the trigger's `branch_includes` must be `["main"]` rather than
`["*"]`. This is a Cloudflare account setting; removing PR events from GitHub
Actions does not disable Cloudflare's separate GitHub App trigger.

PRs use only the lightweight required **PR checks** workflow. Cloudflare build
checks are not merge requirements. Full production builds and deployment run
after a PR merges to `main`. To update branch filters through the
[Builds API](https://developers.cloudflare.com/api/resources/workers_builds/subresources/triggers/methods/update/),
use a token with **Workers Builds Configuration: Edit**. A Wrangler OAuth token
may work for Worker deployment while being rejected by the Builds API.

Workers Builds uses its Cloudflare-managed build token; no Cloudflare API token
is required in GitHub Actions secrets for this pipeline. Keep the GitHub
repository variable `CLOUDFLARE_ENABLED` unset to avoid deploying the same Worker
from two pipelines. GitHub Actions continues testing and publishing the GitHub
Pages website and legacy compatibility resources.

### Alternative: deployment from GitHub Actions

If switching away from Workers Builds, disable its deployment trigger first.
For GitHub Actions configure repository secrets `CLOUDFLARE_API_TOKEN` (account
Workers Scripts edit; Zone edit for custom-domain setup as required by Cloudflare)
and `CLOUDFLARE_ACCOUNT_ID`. Keep tokens in secrets, never in source. Set repository
variable `CLOUDFLARE_ENABLED=true` to enable the Cloudflare job. Initially leave
`CLOUDFLARE_PRODUCTION` unset. Pages publication depends only on its build and
continues independently of the optional Cloudflare deployment job.

## Independent websites and legacy URLs

Leave the main repository's Pages custom domain empty and remove its obsolete
`LEGACY_REDIRECTS` variable. Its workflow always publishes the full application,
even if an old copy of that variable is still present. Cloudflare continues
using its existing Worker custom domain and build trigger; enabling the Pages
site requires no DNS changes.

Relative URLs keep catalogs, images, XML libraries, ZIP downloads and draw.io
links on the current website, including the GitHub repository subpath. Browser
search uses the downloaded catalog on either site. GitHub Pages is a static
website; MCP setup continues to use the Cloudflare icon API. A Cloudflare outage
does not prevent browsing and downloads on Pages, but affects MCP icon search.

The independent `jinxiao/alibaba-cloud-icons` repository uses
`deployment/alibaba-pages.yml` as `.github/workflows/pages.yml`. Its
`LEGACY_REDIRECTS=true` switch still publishes an Alibaba redirect homepage,
retaining query parameters and fragments and adding `collection=alibaba-cloud`
only when absent. XML/SVG/PNG/JSON/ZIP URLs remain real files. The main repository
change does not alter this separate legacy policy.

The sitemap retains Cloudflare as the primary indexed domain; no API URLs are
added to it. For browser acceptance steps and the two publication pipelines,
see [Deployment](DEPLOYMENT.md). This project does not use local DNS probes or
command-line HTTP smoke tests for deployment acceptance.

For a Worker-only regression, retain previous Cloudflare versions and use
Wrangler/dashboard rollback. The GitHub Pages site can stay on its successful
deployment independently.

## 中文摘要

静态网页、图标和下载由 Cloudflare Static Assets 直接响应，仅 `/api/*` 执行
Worker。Cloudflare Workers Builds 通过 GitHub App 自动构建和部署，搜索索引与网站
同版发布；GitHub Actions 独立发布完整的 github.io 站点，两站首页不互相跳转。
主仓库移除 `LEGACY_REDIRECTS` 开关，Pages 的自定义域名留空；独立的阿里云兼容
仓库保留旧首页跳转和旧资源。两站的图片、下载及 draw.io 图标库使用当前站点的
相对路径，网页搜索不依赖 Cloudflare API。当前自动部署方案无需向 GitHub 添加
Cloudflare API Token，也不需要修改 DNS。
MCP 设置 `DRAWIO_ICON_SERVICE_URL` 后需要重启对应 MCP 进程。

References: [Static Assets](https://developers.cloudflare.com/workers/static-assets/),
[routing](https://developers.cloudflare.com/workers/static-assets/routing/advanced/),
[limits](https://developers.cloudflare.com/workers/platform/limits/).
