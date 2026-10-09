import test from 'node:test';
import assert from 'node:assert/strict';
import { issueNumberForBranch, validatePrPolicy } from '../scripts/pr-policy.mjs';

const pr = {
  state: 'open', body: '## Summary\nChange the workflow.\n\nCloses #3',
  head: { ref: 'feat/3-issue-driven-workflow' },
  base: { ref: 'main', repo: { full_name: 'rambow-cloud/drawio-software-icons' } },
};
const issue = { number: 3, state: 'open', created_at: '2026-10-10T01:00:00Z' };
const commits = [{ commit: { committer: { date: '2026-10-10T01:01:00Z' } } }];

test('accepts an issue-first branch with a real closing reference', () => {
  assert.equal(validatePrPolicy(pr, issue, commits), 3);
  for (const body of ['Fixes #3', 'Resolves rambow-cloud/drawio-software-icons#3', 'Closes https://github.com/rambow-cloud/drawio-software-icons/issues/3']) {
    assert.equal(validatePrPolicy({ ...pr, body }, issue, commits), 3);
  }
});
test('rejects missing or invalid issue branch names', () => {
  for (const branch of ['main', 'fix/3-bug', 'feat/03-bug', 'feat/3', 'feat/3-Bug']) {
    assert.throws(() => issueNumberForBranch(branch), /branch named/);
  }
});
test('rejects mismatched, closed and pull-request issue references', () => {
  for (const change of [{ number: 4 }, { state: 'closed' }, { pull_request: {} }]) {
    assert.throws(() => validatePrPolicy(pr, { ...issue, ...change }, commits), /open issue/);
  }
});
test('ignores example references and requires the matching issue', () => {
  for (const body of ['Closes #30', 'Related issue: #3', '<!-- Closes #3 -->', '```\nCloses #3\n```', 'Closes other/repo#3']) {
    assert.throws(() => validatePrPolicy({ ...pr, body }, issue, commits), /closing reference/);
  }
});
test('rejects work committed before the issue and unexpected PR targets', () => {
  assert.throws(() => validatePrPolicy(pr, { ...issue, created_at: '2026-10-10T02:00:00Z' }, commits), /before committing/);
  assert.throws(() => validatePrPolicy({ ...pr, state: 'closed' }, issue, commits), /open and target main/);
  assert.throws(() => validatePrPolicy({ ...pr, base: { ...pr.base, ref: 'other' } }, issue, commits), /open and target main/);
});
