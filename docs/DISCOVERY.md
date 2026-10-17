# Search engine and AI discovery / 搜索与 AI 收录

The canonical site is **https://icons.rambow.cloud/**. GitHub Pages continues to
serve the full site as a mirror; canonical links and sitemaps consolidate signals
on the primary domain. A localStorage language toggle is not a separate language
URL, so the crawlable English and Chinese content has its own stable URLs.

## Published reading entrypoints

| Resource | URL | Purpose |
| --- | --- | --- |
| English catalog | https://icons.rambow.cloud/discover/en/ | Collection descriptions and category links |
| 中文目录 | https://icons.rambow.cloud/discover/zh-CN/ | 图标集介绍、分类链接及使用说明 |
| 阿里云icon / Alibaba Cloud icons | https://icons.rambow.cloud/?collection=alibaba-cloud#library | Existing homepage collection browser |
| English guide | https://icons.rambow.cloud/discover/en/guide/ | Online, offline and Draw.io MCP setup |
| 中文指南 | https://icons.rambow.cloud/discover/zh-CN/guide/ | 在线绘图、离线使用、桌面配置与 MCP 接入 |
| Sitemap | https://icons.rambow.cloud/sitemap.xml | Canonical homepage and every published discovery page |
| Submission list | https://icons.rambow.cloud/urls.txt | The same URLs, one per line, for manual submission |
| AI reading index | https://icons.rambow.cloud/llms.txt | Optional reading guidance with provenance and usage policy |
| Catalog data | https://icons.rambow.cloud/unified-catalog.json | Names, aliases, sources and category membership |

`scripts/discovery.mjs` derives descriptions, counts and category contents from
the unified catalog during the normal build. Pages include real image previews,
XML downloads, product links and artwork provenance. They work without JavaScript.
Each language version has its own canonical URL and reciprocal `hreflang` links.
JSON-LD describes the website, collection contents and breadcrumbs; it makes no
claims about reviews, endorsements or rich-result eligibility. The homepage
contains a build-generated reading fallback; React replaces it when running.
The original homepage layout and bilingual hero copy are retained. Search metadata
lives in the head: title, description, canonical, robots, Open Graph and JSON-LD.
The metadata names the actual collections available through the existing browser.
The descriptive bilingual document title remains consistent after React loads.
The rendered website footer links to the catalog in the selected language.

No modification date is fabricated for sitemaps. Counts describe icon entries;
Alibaba color variants and supplemental graphics are not distinct cloud services.

## Platform coverage and submissions

| Platform | Site-side support | Account-side action |
| --- | --- | --- |
| Google Search and its AI search features | Text HTML, crawlable links, sitemap and canonical URLs | Verify the primary domain in [Search Console](https://search.google.com/search-console/), submit `sitemap.xml`, inspect and request indexing of the homepage and Chinese / English entrypoints |
| Bing and Microsoft search experiences | The same crawlable HTML and sitemap | Verify the primary site in [Bing Webmaster Tools](https://www.bing.com/webmasters/), submit the sitemap and inspect URLs |
| 百度 | 中文静态正文、分类链接和逐行 URL 清单 | 在[百度搜索资源平台普通收录](https://ziyuan.baidu.com/linksubmit/index)验证主站，按账号实际提供的渠道提交 `urls.txt` 中的链接；如有 Sitemap 权限，提交 `sitemap.xml` |
| 360 搜索 | 通用爬虫访问与中文静态内容 | 在 [360 站长平台](https://zhanzhang.so.com/)添加主站，使用账号可用的网站提交入口 |
| 搜狗搜索 | 通用爬虫访问与中文静态内容 | 在[搜狗资源平台](https://zhanzhang.sogou.com/)添加主站，使用账号可用的验证与链接提交入口 |
| ChatGPT search | Wildcard robots permission covers `OAI-SearchBot`; HTML pages are directly readable | Check CDN / firewall permissions against [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots); there is no submission in this repository |
| Claude search and user retrieval | Wildcard permission covers `Claude-SearchBot` and `Claude-User` | Check CDN rules against [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| Perplexity | Wildcard permission covers `PerplexityBot` and user retrieval | Check CDN rules against [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) |
| 豆包、DeepSeek、通义 / 千问、Kimi、腾讯元宝等联网 AI 产品 | 提供中文可抓取内容、来源链接和通用 robots 许可，适配其直接访问或上游搜索获取 | 没有假设这些产品共享提交接口、固定爬虫名称或搜索供应商；实际能否引用取决于各产品当前的联网能力和数据来源 |

IndexNow is an optional follow-up for participating engines, not a replacement
for Google or Baidu submissions. It needs a site-hosted verification key and
notifications after deployment; no key or submission is fabricated here. See
[Bing's IndexNow setup](https://www.bing.com/indexnow/getstarted).

## Hosting and crawler access

`robots.txt` retains `User-agent: *` with `Allow: /`, so domestic and international
crawlers inherit access without unverified user-agent lists. This also preserves
the existing policy toward training crawlers. Search retrieval and model training
are different activities; changing training permissions is a separate decision.

Robots permission does not override Cloudflare WAF, AI Crawl Control, bot
challenges or HTTP access failures. After publishing, inspect the primary zone's
Security Events and AI Crawl Control settings. Ensure intended search and AI
retrieval crawlers can read the site. Use provider verification / verified-bot
signals when available; a user-agent name alone is not an authentication method.
Avoid a blanket firewall bypass. Check access to the main HTML, discovery pages,
images, `robots.txt`, `sitemap.xml` and `llms.txt`.

The GitHub Pages repository path cannot control the root `github.io/robots.txt`;
the authoritative crawler policy and submitted sitemap belong to the primary
custom domain. Internal content links and assets remain relative for the mirror.

## Verification and measurement / 发布后确认

### HTTP and canonical URLs

Cloudflare uses a Single Redirect scoped to `icons.rambow.cloud` and HTTP only:
301 to the same HTTPS path with the query string preserved. The reproducible
zone ruleset payload is [deployment/icons-https-redirect.json](../deployment/icons-https-redirect.json).
It belongs to the `rambow.cloud` zone's `http_request_dynamic_redirect` phase;
it is separate from Worker deployment. When updating an existing phase ruleset,
merge this rule by its `ref` and preserve any unrelated rules. Do not replace
the entire ruleset or enable zone-wide redirects just for this subdomain.

HTML canonical links and the sitemap already point to HTTPS. The generated
Cloudflare `_headers` adds `Link: <https://icons.rambow.cloud/:splat.md>; rel="canonical"`
for `/*.md`, including nested paths. Each Markdown document keeps its own path
and language; it is not canonicalized to the homepage or a different guide.
There is no `noindex` directive. GitHub Pages does not interpret `_headers`, so
this non-HTML header applies to Cloudflare hosting only. Existing HTML canonical
links still apply on the mirror. Google documents
[canonical HTTP headers for non-HTML documents](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls#rel-canonical-http-header).

After deployment, open browser Developer Tools > Network, enable Preserve log
and Disable cache, then visit each explicit HTTP URL:

- `http://icons.rambow.cloud/`
- `http://icons.rambow.cloud/ICON_USAGE.md`
- `http://icons.rambow.cloud/discover/zh-CN/guide/`
- `http://icons.rambow.cloud/CHANGELOG.md`
- `http://icons.rambow.cloud/ICON_USAGE.md?source=verification`

Check for a server 301 with the same path/query on HTTPS, then a successful
document response. Browser HTTPS-first or cached HSTS upgrades may happen before
the request reaches Cloudflare; an internal browser redirect is not a server
301. On each HTTPS Markdown response, inspect the `Link` response header for the
same document's absolute HTTPS URL without the query string. Inspect homepage
source for its single canonical `https://icons.rambow.cloud/`.

In Search Console, inspect both old HTTP and final HTTPS URLs. After recrawling,
HTTP URLs may correctly become "Page with redirect". Check the final HTTPS URL's
user-declared and Google-selected canonical and crawl date. Historical September
crawls do not describe the current deployment. Correct redirects and canonical
signals do not guarantee indexing or keyword ranking; do not add `noindex` to
make an indexing validation report disappear.

### Retired raw guide copies

The homepage footer no longer links to raw English/Chinese Markdown READMEs.
Its existing localized "Catalog and guides" link leads to HTML content.
The build no longer creates `public/guides/`; repository documentation and
offline ZIP instructions remain available.

On Cloudflare, exact `_redirects` rules permanently redirect
`/guides/README.md` to `/discover/en/guide/` and
`/guides/README.zh-CN.md` to `/discover/zh-CN/guide/`. Five other known copies
under `/guides/` redirect to their original document paths without that prefix.
Unknown paths are not redirected to the homepage. GitHub Pages does not process
`_redirects`; retired mirror URLs return 404, and the mirror footer uses the
existing local HTML catalog link. No `noindex` directive is added.

After publishing, refresh the homepage and check that the two raw Markdown
links are absent from the footer. Open the two old HTTPS README URLs on
`icons.rambow.cloud` and confirm they arrive at the corresponding HTML guides.
In Search Console, these retired URLs may correctly become "Page with redirect";
inspect the final HTML URLs for indexing status instead.

PR checks run fixture-based discovery tests without downloading artwork or
building distributions. The normal post-merge build generates the pages for
both publishing targets and runs the existing distribution checks.

部署成功后，请在浏览器中打开：

1. `https://icons.rambow.cloud/discover/zh-CN/`：分类和数量与首页一致，语言链接能打开英文版本。
2. `https://icons.rambow.cloud/discover/zh-CN/software/data/`：能看到 AI 图标名称、图片、素材来源，XML 下载可用。
3. `https://icons.rambow.cloud/discover/zh-CN/guide/`：能读取在线、离线和 MCP 使用说明。
4. `https://icons.rambow.cloud/sitemap.xml`、`robots.txt` 和 `llms.txt`：展示相应文件，不返回首页或挑战页面。
5. 浏览器禁用 JavaScript 后刷新中文目录：仍能浏览分类、图片和指南。主首页也应有文字说明和分类链接。
6. `https://rambow-cloud.github.io/drawio-software-icons/discover/en/`：镜像分类、样式、图片与下载保持在仓库路径内。

收录监测使用 Google / Bing / 百度各自的站长报告：抓取错误、已收录页数、
查询词、展示量和点击量。AI 引用可定期用实际问题观察，例如“哪里能下载 draw.io
阿里云图标”和“draw.io MCP 怎么搜索 DeepSeek 图标”；单次回答不能证明整体覆盖率。

Crawling, indexing, ranking and AI citation remain platform decisions. Google
states that [ordinary SEO practices apply to AI search features](https://developers.google.com/search/docs/appearance/ai-features)
and no special AI text file is required. `llms.txt` is an auxiliary reading index,
not evidence of indexing or a guarantee of inclusion. Baidu likewise states that
submission does not guarantee indexing. Allow time for discovery and monitor
the platform reports rather than claiming that deployment means indexing.

## “阿里云icon”首页元数据与迁移

首页 https://icons.rambow.cloud/ 是主要搜索入口。保留原有页面布局、主标题文案、
图标浏览器和操作按钮；不增加阿里云概览、预览卡片或 SEO 正文区块。
`<head>` 中的 title、description、Open Graph 和 JSON-LD 准确描述软件、AI
与阿里云图标用途。JSON-LD 的 ItemList 列出当前界面真实提供的图标集及浏览
链接。初始 HTML 与 React 使用同一个 document title；保留百度验证标签。

不使用隐藏关键词正文、白色文字、屏幕外 SEO 文本或按爬虫身份替换内容。
Google 不使用 meta keywords 进行索引或排名。结构化数据描述可见功能，
不虚构评分、官方背书或用户界面没有的内容。

旧的 `/discover/zh-CN/alibaba-cloud/` 与 `/discover/en/alibaba-cloud/` 概览地址
继续通过 `_redirects` 在 Cloudflare 上以 HTTP 301 跳转到首页，包括无尾斜杠
和显式 `index.html` 形式。GitHub Pages 使用即时 meta refresh 并将 canonical
指向主站首页。阿里云分类页、目录及指南保留；迁移规则只匹配概览地址。
已有集合链接指向首页 `?collection=alibaba-cloud#library`，不依赖新增区块。
旧概览地址从 sitemap 和 `urls.txt` 移除，AI 阅读指引改为现有首页浏览入口。

浏览器验证：打开首页确认恢复原布局和主标题，没有新增阿里云概览；切换语言，
浏览器标签标题仍含阿里云主题。查看网页源代码的 `<head>`，确认验证标签、
描述、canonical、robots 和 JSON-LD。点击已有的阿里云链接，应在现有浏览器中
选择阿里云图标集；打开两个旧概览网址，应直接到首页。

发布后，在 Google Search Console 检查首页并请求重新抓取；查看首页查询的
展示、点击和平均排名。已收录与关键词排名是不同阶段；元数据有助于描述页面，
不保证 Google 收录、富媒体展示或即时排名提升。

参考：[Google 支持的 meta 标签](https://developers.google.com/search/docs/crawling-indexing/special-tags)、
[结构化数据要求](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)、
[隐藏文本政策](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-link-abuse)。
