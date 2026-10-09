export function issueNumberForBranch(branch) {
  const match = /^feat\/([1-9]\d*)-[a-z0-9]+(?:-[a-z0-9]+)*$/.exec(branch);
  if (!match) throw Error('Use a branch named feat/<issue-number>-<description>, for example feat/123-add-an-icon');
  return Number(match[1]);
}

export function validatePrPolicy(pr, issue, commits) {
  const number = issueNumberForBranch(pr.head.ref);
  if (pr.state !== 'open' || pr.base.ref !== 'main') throw Error('The PR must be open and target main');
  if (issue.number !== number || issue.pull_request || issue.state !== 'open') {
    throw Error(`Branch issue #${number} must be an open issue in this repository`);
  }
  const repository = pr.base.repo.full_name;
  const escapedRepo = repository.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = (pr.body ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/```[\s\S]*?```/g, '');
  const closingLine = new RegExp(`^\\s*(?:close[sd]?|fix(?:es|ed)?|resolve[sd]?)\\s+(?:#${number}|${escapedRepo}#${number}|https://github\\.com/${escapedRepo}/issues/${number})(?=\\s|[.,;]|$)`, 'im');
  if (!closingLine.test(body)) throw Error(`Add a standalone closing reference to the PR body: Closes #${number}`);
  const created = Date.parse(issue.created_at);
  if (!Number.isFinite(created) || !commits.length) throw Error('Issue creation time and PR commits are required');
  for (const commit of commits) {
    const committed = Date.parse(commit.commit.committer.date);
    if (!Number.isFinite(committed) || committed < created) {
      throw Error(`Create issue #${number} before committing changes to its feature branch`);
    }
  }
  return number;
}
