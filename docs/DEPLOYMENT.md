# Deployment

The authoritative source is `rambow-cloud/drawio-software-icons`.
Cloudflare Workers and GitHub Pages independently serve the full website.
Cloudflare also serves the icon API used by MCP on either site.

## Sites

| Site | Publisher | Artifact |
| --- | --- | --- |
| `https://icons.rambow.cloud/` | Cloudflare Workers Builds | `dist` and the Worker API |
| `https://rambow-cloud.github.io/drawio-software-icons/` | Main repository GitHub Actions | `dist-pages` |
| `https://jinxiao.github.io/alibaba-cloud-icons/` | Alibaba compatibility repository GitHub Actions | `dist-alibaba-pages` |

The Cloudflare and organization Pages homepages both render the application;
neither redirects to the other. The Pages artifact is an identical copy of
`dist`, including its homepage. Relative asset URLs support Cloudflare's `/`
and Pages' `/drawio-software-icons/` path. Images, catalogs, downloads and draw.io
library links resolve against the site being visited. Search runs in the browser
and does not depend on the Cloudflare API.

GitHub Pages hosts static files, so it has no `/api/*` endpoints. The MCP setup
on both sites uses `https://icons.rambow.cloud/api/icons`. If Cloudflare is
unavailable, browsing and downloads on Pages remain usable; MCP icon search
still requires Cloudflare.

Only the separate legacy Alibaba homepage redirects to Cloudflare, defaulting
to the Alibaba Cloud collection and preserving query parameters and fragments.
Its XML, SVG, PNG, JSON and ZIP paths remain actual files.

## Production domain and builds

`icons.rambow.cloud` is a custom domain of the existing
`drawio-software-icons` Worker. Keep that domain attached to the Worker; do not
configure it as a GitHub Pages custom domain or point it at a github.io host.
The repository transfer does not require replacing its DNS records.

In the Worker's **Settings > Builds**, connect
`rambow-cloud/drawio-software-icons`, select `main` and root directory `/`,
and use `npm run deploy:cloudflare:production` as the deploy command.
Retain the build command and environment described in [CLOUDFLARE.md](CLOUDFLARE.md).
Keep the GitHub Actions variable `CLOUDFLARE_ENABLED` unset so that only Workers
Builds deploys the production Worker.

## GitHub Pages publishing

Pull requests use `.github/workflows/pr-checks.yml`, with one required
**PR checks** job. It enforces the issue-first `feat/<issue-number>-<description>`
branch and a matching closing issue reference, then checks whitespace, syntax,
changed artwork safety, icon configuration and TypeScript. It performs no
artwork downloads, distribution builds, Python setup, artifact uploads or
deployment. Editing the PR body reruns the check. Token-created automation PRs
explicitly dispatch this workflow from their feature branch so the resulting
check belongs to the PR head commit. Manual check dispatch must likewise select
the current PR feature branch and provide its PR number.

The active **Issue-driven main** ruleset requires PRs and successful **PR checks**
from GitHub Actions, and prevents default-branch deletion and force pushes.
There are no bypass actors or required deployments. Its reproducible definition
is `.github/main-ruleset.json`. A second reviewer is not required; the issue,
PR and passing check provide the contribution record. See [Contributing](../CONTRIBUTING.md).

Both repositories use **GitHub Actions** as the Pages source. Leave their Pages
custom domain fields empty. The main repository no longer uses
`LEGACY_REDIRECTS`: it always publishes the full `dist-pages` website. Remove
that obsolete variable from the main repository. The Alibaba compatibility
repository retains `LEGACY_REDIRECTS=true` for its legacy homepage.

1. Merges to `main` run `.github/workflows/ci-pages.yml`, validate both collections,
   and publish the full site to the organization Pages URL. Pages deployment
   depends only on the successful build, so an optional Cloudflare deployment
   failure does not block it. Workers Builds independently deploys the same
   source commit to Cloudflare.
2. `deployment/alibaba-pages.yml` is installed as `.github/workflows/pages.yml`
   in `jinxiao/alibaba-cloud-icons`. It resolves the latest successful main push
   of the source workflow, checks out that exact commit and publishes the
   Alibaba compatibility artifact.
3. The compatibility publisher checks hourly. A successful-publication cache
   skips unchanged source commits; failed deployments remain retryable.
4. For immediate synchronization, dispatch the Alibaba workflow manually. Its
   optional full source commit SHA supports deliberate rollback.

Keep the template and installed workflow synchronized. All artwork and UI
changes belong in the main source repository. Preserve the original Alibaba
source and license references under `collections/alibaba-cloud`.

## Organization transfer

The source repository moved from `jinxiao` to `rambow-cloud` on 2026-09-30.
GitHub redirects old repository links, but does not redirect the old Pages
address `https://jinxiao.github.io/drawio-software-icons/`.
Update external bookmarks and draw.io configurations using that address to
`https://icons.rambow.cloud/`, preserving each resource path. The separate
Alibaba repository and its Pages address have not moved.

Do not recreate the old software repository name merely to host a redirect:
doing so removes GitHub's repository redirect. Existing user configurations
outside this repository cannot be updated automatically.

## Browser verification

Open `https://icons.rambow.cloud/` and
`https://rambow-cloud.github.io/drawio-software-icons/`. Confirm each stays on its
own domain and displays the full collection. On each site, check language
switching, search, a library download, and loading a category in draw.io. Pages
resource and draw.io library URLs must retain `/drawio-software-icons/`.

Open `https://rambow-cloud.github.io/drawio-software-icons/?collection=all&q=kubernetes#library`
and confirm the filter and fragment survive a refresh. Open the separate
Alibaba entrypoint and confirm it still reaches Cloudflare with its collection.

Open `https://icons.rambow.cloud/api/health` and
`https://icons.rambow.cloud/api/icons/search?q=kubernetes&p=0&c=3` to confirm API
responses. Verify domain bindings and build/deployment status in Cloudflare;
local DNS probes are not required.

References: [GitHub Pages site types](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[Actions job dependencies](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idneeds).
