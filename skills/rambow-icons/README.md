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

After installation, reload your agent or start a new session so it can discover
the skill. With automatic skill selection enabled in a compatible agent, ask
naturally; you do not need to mention `rambow-icons`:

> 画一个 Kubernetes、PostgreSQL 和 Redis 的架构图。

> 画一张阿里云 ECS、SLB 和 RDS 的部署图。

> 给后台导航和操作按钮添加图标，沿用项目现有组件、主题和无障碍标签。

For matching technical diagrams, the skill instructs the agent to identify the
products in the nodes, fetch their original-color artwork and use generic Tabler
icons where helpful. It works alongside the selected diagram tool, including
diagram-design. Explicit no-icon requests and output-format limits take priority.

Automatic selection is controlled by your agent; installing the skill cannot
force every client or session to invoke it. If it is not selected, explicitly
request `rambow-icons` for that task. To update an older installation, run:

```sh
npx @rambowcloud/icons-skill@latest install --agent codex --global --force
```

Replace `codex` and `--global` with your agent and the scope of the existing
installation. Reload the agent after updating.

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

## License

The MIT license covers code and instructions; downloaded artwork retains its
upstream licenses and trademark rights.
