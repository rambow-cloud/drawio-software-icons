import { execFileSync } from 'node:child_process';
import { appendFile, readFile } from 'node:fs/promises';
import { githubApi } from './github-api.mjs';

const paths = ['data/catalog.json', 'data/sources.lock.json', 'data/icon-inputs.lock.json', 'data/official-icons.json', 'data/changelog.json', 'assets/icons', 'licenses'];
const changed = execFileSync('git', ['status', '--porcelain', '--', ...paths], { encoding: 'utf8' }).trim();
if (!changed) {
  console.log('No selected upstream artwork or license changes.');
} else {
  const repository = process.env.GITHUB_REPOSITORY;
  const title = '[Maintenance] Refresh selected upstream icon artwork';
  let issue;
  for (let page = 1; !issue; page++) {
    const issues = await githubApi(`repos/${repository}/issues?state=open&per_page=100&page=${page}`);
    issue = issues.find(item => !item.pull_request && item.title === title && item.user.login === 'github-actions[bot]');
    if (issues.length < 100) break;
  }
  if (!issue) {
    const summary = await readFile('.update-summary.md', 'utf8');
    issue = await githubApi(`repos/${repository}/issues`, {
      method: 'POST', body: {
        title,
        body: `## Scope\nReview pinned upstream artwork and license changes for the configured icon selection.\n\n## Acceptance criteria\n- Preserve source attribution, original artwork and compatibility.\n- Record icon changes in the bilingual changelog.\n- Deliver changes through an issue-linked feature branch and PR with passing lightweight checks.\n\n${summary}`,
      },
    });
  }
  const branch = `feat/${issue.number}-refresh-icons`;
  await appendFile('.update-summary.md', `\nCloses #${issue.number}\n`);
  await appendFile(process.env.GITHUB_OUTPUT, `issue_number=${issue.number}\nbranch=${branch}\n`);
  console.log(`Created/reused issue #${issue.number} before committing on ${branch}.`);
}
