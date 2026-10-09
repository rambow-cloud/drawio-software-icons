import { readFile } from 'node:fs/promises';
import { githubApi } from './github-api.mjs';
import { issueNumberForBranch, validatePrPolicy } from './pr-policy.mjs';

const pr = JSON.parse(await readFile(process.argv[2], 'utf8'));
const repository = process.env.GITHUB_REPOSITORY;
if (pr.base.repo.full_name !== repository) throw Error('Unexpected target repository');
const issueNumber = issueNumberForBranch(pr.head.ref);
const issue = await githubApi(`repos/${repository}/issues/${issueNumber}`);
const commits = [];
for (let page = 1; commits.length < pr.commits; page++) {
  const batch = await githubApi(`repos/${repository}/pulls/${pr.number}/commits?per_page=100&page=${page}`);
  if (!batch.length) throw Error('Unable to read every PR commit');
  commits.push(...batch);
}
validatePrPolicy(pr, issue, commits);
console.log(`Issue #${issueNumber} → ${pr.head.ref} → PR #${pr.number}: policy passed.`);
