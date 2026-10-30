# rambow-icons

Install the Rambow Icons agent skill with npm/npx. It supplies original-color
software and Alibaba Cloud artwork from https://icons.rambow.cloud/ and generic
architecture icons directly from Tabler. Pair it with diagram-design or your
preferred diagram/document workflow. Node.js 22.12+ is required.

## Install

After the package is published to npm:

```sh
npx rambow-icons
npx rambow-icons install --agent codex,cursor --global
npx rambow-icons install --agent claude-code --project
npx rambow-icons install --all --global --dry-run
```

The first command opens agent selection in an interactive terminal. Project
installation is the default; `--global` installs for the current user. Agent
names can be repeated with `--agent` or separated with commas. Use `--force` to
update an existing differing copy; it replaces only the three bundled skill
files and preserves custom files. `--dry-run` reports destinations without writes.
Plain `npm install rambow-icons` installs the npm package, not agent skills:
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

Before npm publication, install directly from GitHub with the existing skills CLI:

```sh
npx skills add rambow-cloud/drawio-software-icons --skill rambow-icons
```

## Use

Ask your agent:

> 使用 diagram-design 和 rambow-icons 绘制 Kubernetes、PostgreSQL、Redis 架构图，产品图标保留原色，通用图标直接使用 Tabler。

The npm command also exposes the artwork helper:

```sh
npx rambow-icons search Kubernetes
npx rambow-icons fetch kubernetes --out ./diagram-assets/kubernetes.svg
```

Downloads keep original bytes and verify SHA-256 against the catalog. The
helper writes the asset, an SVG with an embedded image, and a provenance sidecar.
Read [SKILL.md](SKILL.md) for offline catalogs, Tabler and artwork terms.
The package contains no artwork collection and has no runtime npm dependencies.

## Maintainers

The repository root remains a private website package; publish this directory
only. With npm authentication and any required 2FA completed:

```sh
cd skills/rambow-icons
npm pack --dry-run
npm publish --registry=https://registry.npmjs.org/ --access public
```

The package's `publishConfig` selects the official registry without changing
global npm settings. Package names/versions become public when published;
publish each version only once. The MIT license covers code and instructions;
downloaded artwork retains upstream licenses and trademark rights.
