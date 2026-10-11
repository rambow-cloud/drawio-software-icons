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
| 阿里云icon / Alibaba Cloud icons | https://icons.rambow.cloud/#alibaba-cloud | Homepage previews, SVG / XML downloads and online / offline imports |
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
Both versions retain visible Chinese and English Alibaba collection descriptions,
actual catalog previews and download links. The homepage uses the same descriptive
bilingual title before and after React loads.
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

## “阿里云icon”首页搜索入口与迁移

首页 https://icons.rambow.cloud/ 承接“阿里云icon”“阿里云图标下载”及软件架构图标搜索。
中英文图标说明、真实预览、SVG / XML / ZIP 下载与导入步骤在首页直接可读，
浏览器切换语言后仍保留双语概要。初始 HTML、Open Graph、JSON-LD 和 React
使用一致的首页主题；React 不再将标题改成缺少阿里云主题的泛化名称。

旧的 `/discover/zh-CN/alibaba-cloud/` 与 `/discover/en/alibaba-cloud/` 概览地址
通过构建生成的 `_redirects` 在 Cloudflare 上以 HTTP 301 跳转到首页。
无尾斜杠及显式 `index.html` 地址同样迁移。GitHub Pages 不支持 `_redirects`，
因此保留即时 meta refresh HTML 和指向主站首页的 canonical。阿里云分类页、
中英文目录及指南仍提供独立内容；跳转规则只匹配概览地址。
站内概览链接改为首页 `#alibaba-cloud`，迁移地址从 sitemap 和 `urls.txt` 移除。

发布后，在 Google Search Console 检查 https://icons.rambow.cloud/ 并请求重新索引，
提交更新后的 sitemap。检查旧概览网址会看到重定向，这是预期行为。
效果报告按首页 URL 筛选，再查看“阿里云icon”“阿里云图标下载”等查询的
展示、点击和平均排名。已收录与关键词排名是不同阶段；验证通过或部署成功
不等于排名提升。Google 需要重新抓取和处理更新，没有即时排名保证。

浏览器验证：打开首页，确认阿里云预览、ZIP / XML 下载及导入说明；切换语言
后双语概要仍可见。打开上述两个旧概览网址，应直接到首页；打开具体阿里云
分类地址，仍能查看分类内容。在 GitHub Pages 镜像测试同一迁移路径，应进入
主站首页，其余分类和下载继续保留仓库路径。

后续应根据真实查询补充使用经验，例如说明自己如何选择 ECS、SLB、OSS 图标
并在 draw.io 导入、连接和保存。在自己的项目 README 或技术博客提供有帮助
的说明并自然链接首页；本仓库不会自动在社区发帖或批量购买、生成外链。

这些做法对应 [Google 搜索要点](https://developers.google.com/search/docs/essentials?hl=zh-cn)、
[标题最佳实践](https://developers.google.com/search/docs/appearance/title-link)及
[永久重定向说明](https://developers.google.com/search/docs/crawling-indexing/301-redirects)。
