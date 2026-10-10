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
| 阿里云icon 专题 | https://icons.rambow.cloud/discover/zh-CN/alibaba-cloud/ | 阿里云架构图标分类、SVG / XML 下载与导入说明 |
| Alibaba Cloud collection | https://icons.rambow.cloud/discover/en/alibaba-cloud/ | English collection overview, previews, downloads and imports |
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

## “阿里云icon”关键词与内容维护

阿里云专题页集中承接“阿里云icon”“阿里云图标下载”“draw.io 阿里云图标”等搜索意图。
标题和 H1 使用简短、明确的主题，正文提供分类预览、实际下载、导入步骤和来源说明。
首页、静态目录及阿里云分类页使用描述性链接指向同一个专题入口，站点地图与
`llms.txt` 随构建更新。页面明确这是社区架构图标库，避免混淆品牌 Logo 下载、
网站开发用 Iconfont 字体库或官方阿里云站点。

发布后，在已验证的 Google / Bing 站长平台对中文专题页请求索引，提交最新版
站点地图。Google Search Console 的效果报告可按网页筛选该入口，再检查查询
“阿里云icon”“阿里云图标”“阿里云图标下载”和“draw.io 阿里云图标”的展示、
点击及平均排名。Bing 使用自己的关键词和页面表现报告。先观察平台是否展示该
页面，再根据实际查询完善内容；精确关键词排名并不能通过提交链接保证。

后续内容可以围绕真实使用任务扩展，例如用 ECS、SLB、OSS 绘制一个架构图，
说明图标如何选取、导入与保存，并链接到相应分类及素材来源。在自己的 GitHub
项目、技术博客或社区教程中，提供对读者有用的操作说明并自然链接专题页。
对外发布仍需单独安排，本仓库不会自动在社区发帖。避免重复创建只替换关键词
的入口、堆叠搜索词或购买 / 群发链接。

这些做法对应 [Google 搜索要点](https://developers.google.com/search/docs/essentials?hl=zh-cn)
中的描述性标题和可抓取链接，以及[链接最佳实践](https://developers.google.com/search/docs/crawling-indexing/links-crawlable?hl=zh-cn)。
它们提高主题清晰度与内容可发现性，排名仍取决于搜索系统对相关性和内容质量的评估。
