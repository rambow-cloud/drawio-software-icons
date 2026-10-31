# npm skill releases

Package: `@rambowcloud/icons-skill` (public, under the `rambowcloud` npm
organization). The CLI executable is `icons-skill`; the agent skill is still
named `rambow-icons`. The website repository's root package remains private.

## Change-only release behavior

`.github/workflows/publish-npm.yml` listens to pushes to `main` with the path
filter `skills/rambow-icons/**`. Catalog/artwork, website, root documentation,
tests, release-helper and workflow-only changes do not automatically start it.
This workflow is separate from website builds and publishing.

Before publishing, `scripts/prepare-skill-release.mjs` fingerprints the files
actually included by `npm pack`. It reads package metadata from the official
registry and skips a previously published source commit or content identical
to the latest stable package. These checks also apply to manual workflow runs,
so a retry or workflow repair does not produce duplicate versions.

New package content automatically gets the next stable patch version. A higher
explicit stable `package.json` version wins, allowing intentional minor/major
releases. Version metadata is changed only in the runner; no bot pushes commits
or tags to main. Releases are serialized. Registry failures other than a real
404 fail the run rather than guessing whether a package/version exists.

Example: source version `0.1.0`, npm latest `0.1.3`, changed skill instructions
→ Actions publishes `0.1.4`. An unrelated homepage edit → no npm workflow.
The same package content in a manual rerun → no publication.

## One-time setup

The logged-in npm account must have publication rights in `rambowcloud` and
account 2FA enabled for trusted publisher setup. The package must exist before
its trusted publisher can be created. From a reviewed, merged main checkout:

```sh
npm publish ./skills/rambow-icons --registry=https://registry.npmjs.org/ --access public
npm exec --registry=https://registry.npmjs.org/ --yes --package=npm@11.15.0 -- npm trust github @rambowcloud/icons-skill --repo rambow-cloud/drawio-software-icons --file publish-npm.yml --allow-publish --yes --registry=https://registry.npmjs.org/
gh workflow run publish-npm.yml --ref main
```

The initial `0.1.0` publish creates the package. The first Actions release then
advances to `0.1.1` and records the source commit and package-content digest.
If the workflow runs before bootstrap, it reports `bootstrap-required` and does
not try to publish. It is safe to run it manually after setup.

Alternatively configure trusted publishing on the npm package settings page:

- Provider: GitHub Actions.
- GitHub organization/user: `rambow-cloud` (different from npm org `rambowcloud`).
- Repository: `drawio-software-icons`.
- Workflow filename: `publish-npm.yml`.
- Environment: leave empty; the workflow does not use a named environment.
- Allow direct `npm publish`.

Only GitHub-hosted runners are used. The workflow grants `id-token: write` to
the publish job and uses npm 11.15.0 on Node 24. No npm write token is copied
into GitHub secrets. Do not add a token fallback to bypass a missing trusted
publisher configuration.

## Verify and install

Use the npm workflow result and registry metadata to verify the published
version. Open https://www.npmjs.com/package/@rambowcloud/icons-skill and inspect
the version/provenance; do not use website or DNS smoke tests for this release.

```sh
npx @rambowcloud/icons-skill
npx @rambowcloud/icons-skill install --agent codex,claude-code,cursor --global
```

Official references: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/),
[npm trust](https://docs.npmjs.com/cli/v12/commands/npm-trust/).
