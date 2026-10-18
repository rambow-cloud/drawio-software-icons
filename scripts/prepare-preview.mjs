import { appendFile, cp, mkdtemp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { addHomepagePreview } from './preview-site.mjs';

// Only the explicitly dispatched, same-repository preview branch can publish.
const repo = process.env.GITHUB_REPOSITORY;
if (repo !== 'rambow-cloud/drawio-software-icons' || process.env.GITHUB_REF !== 'refs/heads/preview/homepage' || process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch') {
  throw Error('Homepage preview publication requires the trusted preview branch and workflow_dispatch.');
}
const api = path => JSON.parse(execFileSync('gh', ['api', `repos/${repo}/${path}`], { encoding: 'utf8' }));
const mainSha = api('git/ref/heads/main').object.sha;
const runs = api(`actions/workflows/ci-pages.yml/runs?branch=main&head_sha=${mainSha}&status=success&per_page=10`).workflow_runs;
const run = runs.find(item => item.head_sha === mainSha && item.head_branch === 'main' && item.head_repository.full_name === repo && ['push', 'workflow_dispatch'].includes(item.event));
if (!run) throw Error('Current main must have a successful build and deployment before publishing a preview.');
// Rebuild the pinned, previously successful main commit in isolation. Published
// artifacts are deliberately deleted after deployment; previews cannot rely on them.
const output = resolve('.preview-pages');
const workspace = join(await mkdtemp(join(tmpdir(), 'homepage-production-')), 'source');
execFileSync('git', ['fetch', 'origin', mainSha], { stdio: 'inherit' });
execFileSync('git', ['worktree', 'add', '--detach', workspace, mainSha], { stdio: 'inherit' });
try {
  for (const args of [['ci'], ['run', 'build:cloudflare']]) execFileSync('npm', args, { cwd: workspace, stdio: 'inherit' });
  await cp(join(workspace, 'dist-pages'), output, { recursive: true, errorOnExist: true, force: false });
} finally {
  execFileSync('git', ['worktree', 'remove', '--force', workspace], { stdio: 'inherit' });
}
const preserved = await addHomepagePreview(output, resolve('dist'), { productionSha: mainSha, productionRun: run.id, previewSha: process.env.GITHUB_SHA });
if (api('git/ref/heads/main').object.sha !== mainSha) throw Error('Main changed during preview preparation. Retry with the new production commit.');
await appendFile(process.env.GITHUB_OUTPUT, `path=.preview-pages\nproduction_sha=${mainSha}\n`);
console.log(`Preserved ${preserved} production files from ${mainSha}; preview added at /preview/homepage/.`);
