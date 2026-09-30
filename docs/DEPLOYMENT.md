# Deployment

The authoritative source is `rambow-cloud/drawio-software-icons`.
Cloudflare Workers serves the production website and icon API. GitHub Pages
provides compatibility entrypoints and downloadable resources.

## Sites

| Site | Publisher | Artifact |
| --- | --- | --- |
| `https://icons.rambow.cloud/` | Cloudflare Workers Builds | `dist` and the Worker API |
| `https://rambow-cloud.github.io/drawio-software-icons/` | Main repository GitHub Actions | `dist-pages` |
| `https://jinxiao.github.io/alibaba-cloud-icons/` | Alibaba compatibility repository GitHub Actions | `dist-alibaba-pages` |

Both Pages homepages redirect to the production domain while preserving query
parameters and fragments. The Alibaba entrypoint defaults to the Alibaba Cloud
collection. XML, SVG, PNG, JSON and ZIP resource paths remain actual files.

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

Both repositories use **GitHub Actions** as the Pages source and set
`LEGACY_REDIRECTS=true`. Leave their Pages custom domain fields empty.

1. Main pushes run `.github/workflows/ci-pages.yml`, validate both collections,
   and publish the compatibility artifact to the organization Pages URL.
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

Open the production homepage and both Pages entrypoints listed above. Confirm
that Pages homepages reach the production domain and the Alibaba entrypoint
selects its collection. Check language switching, search, a library download,
and loading a category in draw.io.

Open `https://icons.rambow.cloud/api/health` and
`https://icons.rambow.cloud/api/icons/search?q=kubernetes&p=0&c=3` to confirm API
responses. Verify domain bindings and build/deployment status in Cloudflare;
local DNS probes are not required.
