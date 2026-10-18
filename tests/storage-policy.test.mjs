import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { parse } from 'yaml';

test('Actions retains only a temporary Pages transfer and always cleans up after deployment', async () => {
  for (const name of await readdir('.github/workflows')) {
    const workflow = parse(await readFile(`.github/workflows/${name}`, 'utf8'));
    for (const job of Object.values(workflow.jobs)) for (const step of job.steps || []) {
      assert(!/^actions\/(upload-artifact|download-artifact|cache)(@|\/)/.test(step.uses || ''), name);
      assert.notEqual(step.with?.cache, 'npm', name);
      if (step.uses?.startsWith('actions/upload-pages-artifact@')) assert.equal(step.with['retention-days'], 1);
    }
  }
  const workflow = parse(await readFile('.github/workflows/ci-pages.yml', 'utf8'));
  assert.equal(workflow.jobs.cleanup.if, 'always()');
  assert.deepEqual(workflow.jobs.cleanup.needs, ['build', 'deploy']);
  assert.equal(workflow.jobs.cleanup.permissions.actions, 'write');
  const cleanup = workflow.jobs.cleanup.steps[0].run;
  assert(cleanup.includes('actions/runs/$GITHUB_RUN_ID/artifacts'));
  assert(cleanup.includes('--method DELETE'));
});
