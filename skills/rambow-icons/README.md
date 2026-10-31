# @rambowcloud/icons-skill

Install the Rambow Icons agent skill with npm/npx. It supplies original-color
software and Alibaba Cloud artwork from https://icons.rambow.cloud/ and generic
icons directly from Tabler for websites, application interfaces, documentation,
presentations and diagrams. Use it independently with your existing framework
or authoring tool, or pair it with diagram-design. Node.js 22.12+ is required.

## Install

Install the public organization-scoped package:

```sh
npx @rambowcloud/icons-skill
npx @rambowcloud/icons-skill install --agent codex,cursor --global
npx @rambowcloud/icons-skill install --agent claude-code --project
npx @rambowcloud/icons-skill install --all --global --dry-run
```

The first command opens agent selection in an interactive terminal. Project
installation is the default; `--global` installs for the current user. Agent
names can be repeated with `--agent` or separated with commas. Use `--force` to
update an existing differing copy; it replaces only the three bundled skill
files and preserves custom files. `--dry-run` reports destinations without writes.
Plain `npm install @rambowcloud/icons-skill` installs the npm package, not agent skills:
agent folders are changed only when you explicitly run the installer.

| Agent | `--agent` | Project directory | User directory |
| --- | --- | --- | --- |
| Codex | `codex` | `.agents/skills/` | `~/.agents/skills/` |
| Claude Code | `claude-code` | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | `cursor` | `.agents/skills/` | `~/.cursor/skills/` |
| Gemini CLI | `gemini-cli` | `.agents/skills/` | `~/.gemini/skills/` |
| GitHub Copilot | `github-copilot` | `.agents/skills/` | `~/.copilot/skills/` |
| OpenCode | `opencode` | `.agents/skills/` | `~/.config/opencode/skills/` |

The skill is installed as `rambow-icons/` under those directories. Shared
project destinations are copied once. These are local filesystem installations;
remote/cloud agent sessions need a project skill checked into their repository
or the client's own supported sync mechanism. Reload the agent or start a new
session if needed. The installer does not install coding agents or diagram-design.

Directory references: [Codex](https://learn.chatgpt.com/docs/build-skills),
[Claude Code](https://code.claude.com/docs/en/skills),
[Cursor](https://cursor.com/docs/skills),
[multi-agent directory map](https://github.com/vercel-labs/skills/blob/main/docs/agents.md).

You can also install directly from GitHub with the existing skills CLI:

```sh
npx skills add rambow-cloud/drawio-software-icons --skill rambow-icons
```

## Use

Ask your agent:

> 使用 rambow-icons 给后台导航和操作按钮添加 Tabler 图标，沿用项目现有组件、主题和无障碍标签。

> 使用 rambow-icons 为技术栈文档加入 Kubernetes、PostgreSQL 和 Redis 原色产品图标，保留来源与许可说明。

> 使用 diagram-design 和 rambow-icons 绘制 Kubernetes、PostgreSQL、Redis 架构图，产品图标保留原色，通用图标直接使用 Tabler。

The skill distinguishes original product identities from generic UI/concept
icons, and explains how to embed local assets in frontend code, Markdown,
documents, slides and self-contained HTML/SVG. Product artwork retains its
catalog usage policy; generic Tabler icons use MIT. A broader skill workflow
does not grant additional brand-artwork permissions.

The npm command also exposes the artwork helper:

```sh
npx @rambowcloud/icons-skill search Kubernetes
npx @rambowcloud/icons-skill fetch kubernetes --out ./diagram-assets/kubernetes.svg
```

Downloads keep original bytes and verify SHA-256 against the catalog. The
helper writes the asset, an SVG with an embedded image, and a provenance sidecar.
Read [SKILL.md](SKILL.md) for offline catalogs, Tabler and artwork terms.
The package contains no artwork collection and has no runtime npm dependencies.

## Maintainers

The repository root remains a private website package. The public npm package
is **@rambowcloud/icons-skill**; the installed agent skill keeps the name
`rambow-icons`.

Ongoing npm releases run through `publish-npm.yml` on `main` only when files
under `skills/rambow-icons/**` change. Website files, artwork/catalog updates,
root documentation, tests and workflow-only changes do not automatically
trigger an npm release. Manual runs still skip unchanged package content and
previously published source commits.

Actions derives the next patch version from npm, or uses a higher explicit
stable version from package.json. It changes version metadata only in the
runner and never pushes to main. The workflow uses npm trusted publishing
(OIDC) and needs no long-lived NPM_TOKEN.

One-time bootstrap requires the organization owner's npm login and 2FA. The
npm 12 bootstrap CLI needs Node.js 22.22.2+ on the 22 line, 24.15.0+ on the
24 line, or Node.js 26+; the skill installer itself needs Node.js 22.12+.

```sh
npm publish ./skills/rambow-icons --registry=https://registry.npmjs.org/ --access public
npm exec --registry=https://registry.npmjs.org/ --yes --package=npm@12.2.1 -- npm trust github @rambowcloud/icons-skill --repo rambow-cloud/drawio-software-icons --file publish-npm.yml --allow-publish --yes --registry=https://registry.npmjs.org/
gh workflow run publish-npm.yml --ref main
```

The package must exist before its trusted publisher can be configured. This
initial publish is the one-time bootstrap; subsequent versions come from
Actions. See [release setup and behavior](https://github.com/rambow-cloud/drawio-software-icons/blob/main/docs/NPM_RELEASE.md).

The MIT license covers code and instructions; downloaded artwork retains its
upstream licenses and trademark rights.
