import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { parseDocument } from 'yaml';
import { loadIconConfiguration } from './icon-config.mjs';
import { inspectPng, inspectSvg } from './lib.mjs';

const git = args => execFileSync('git', args, { encoding: 'utf8' });
const base = process.env.PR_BASE_SHA || git(['merge-base', 'HEAD', 'origin/main']).trim();
git(['diff', '--check', base]);
const files = new Set([
  ...git(['diff', '--name-only', '--diff-filter=ACMR', '-z', base]).split('\0'),
  ...git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
].filter(Boolean));
for (const path of files) {
  if (/\.(?:json|ya?ml|[cm]?js|tsx?|css|html|md|toml|txt)$/.test(path)) {
    const text = await readFile(path, 'utf8');
    if (/^(?:<{7} |>{7} )/m.test(text)) throw Error(`${path}: unresolved merge conflict`);
    if (/\.json$/.test(path)) JSON.parse(text);
    if (/\.ya?ml$/.test(path)) {
      const document = parseDocument(text, { uniqueKeys: true });
      if (document.errors.length) throw Error(`${path}: ${document.errors.map(error => error.message).join('\n')}`);
    }
    if (/\.[cm]?js$/.test(path)) execFileSync(process.execPath, ['--check', path], { stdio: 'inherit' });
  }
  if (/^assets\/icons\/.+\.svg$/.test(path)) inspectSvg(await readFile(path, 'utf8'));
  if (/^assets\/icons\/.+\.png$/.test(path)) inspectPng(await readFile(path));
}
const configuration = await loadIconConfiguration();
console.log(`Checked ${files.size} changed files and ${configuration.icons.length} icon configurations without downloads or build artifacts.`);
