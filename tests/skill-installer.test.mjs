import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, readdir, rm, symlink, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { AGENTS, installationTargets, installSkill, parseInstallArgs } from '../skills/rambow-icons/bin/rambow-icons.mjs';

async function temp(t) {
  const root=resolve(tmpdir()),directory=await mkdtemp(join(root,'rambow-installer-'));
  const path=relative(root,directory);
  assert(!path.startsWith('..')&&!isAbsolute(path));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  return directory;
}
const exists = async path => !!await lstat(path).catch(error=>{if(error.code==='ENOENT')return null;throw error;});

test('agent destinations support six clients and deduplicate shared project skills', async t => {
  const root=await temp(t),agents=Object.keys(AGENTS);
  const project=installationTargets(agents,{cwd:root,home:join(root,'home')});
  assert.equal(project.length,2);
  assert.deepEqual(project[0].agents,['codex','cursor','gemini-cli','github-copilot','opencode']);
  assert.equal(project[0].path,join(root,'.agents','skills','rambow-icons'));
  assert.equal(project[1].path,join(root,'.claude','skills','rambow-icons'));
  const global=installationTargets(agents,{global:true,home:root});
  assert.equal(new Set(global.map(target=>target.path)).size,6);
  assert(global.some(target=>target.path===join(root,'.config','opencode','skills','rambow-icons')));
  assert.throws(()=>installationTargets(['unknown'],{cwd:root}),/Unknown agent/);
  assert.throws(()=>installationTargets([],{cwd:root}),/Select at least/);
});

test('installation copies standalone skill files and identical reruns leave custom files intact', async t => {
  const root=await temp(t),agents=['codex','claude-code','cursor'];
  const first=await installSkill({agents,cwd:root});
  for(const target of first.targets)for(const file of ['SKILL.md','scripts/icons.mjs','LICENSE']) {
    assert.deepEqual(await readFile(join(target.path,file)),await readFile(resolve('skills/rambow-icons',file)));
  }
  const target=first.targets[0].path;
  await writeFile(join(target,'custom.txt'),'keep this');
  const again=await installSkill({agents,cwd:root});
  assert(again.targets.every(target=>target.files.every(file=>file.action==='unchanged')));
  assert.equal(await readFile(join(target,'custom.txt'),'utf8'),'keep this');
  const help=execFileSync(process.execPath,[join(target,'scripts/icons.mjs'),'search','Kubernetes','--catalog',resolve('data/catalog.json')],{encoding:'utf8'});
  assert.equal(JSON.parse(help).results[0].id,'kubernetes');
});

test('conflicts fail before any target is written; explicit force updates bundled files only', async t => {
  const root=await temp(t),[codex,claude]=installationTargets(['codex','claude-code'],{global:true,home:root});
  await mkdir(claude.path,{recursive:true});
  await writeFile(join(claude.path,'SKILL.md'),'locally modified');
  await writeFile(join(claude.path,'notes.txt'),'custom notes');
  const options={agents:['codex','claude-code'],global:true,home:root};
  await assert.rejects(installSkill(options),/Existing file differs/);
  assert(!await exists(codex.path));
  assert.equal(await readFile(join(claude.path,'SKILL.md'),'utf8'),'locally modified');
  await installSkill({...options,force:true});
  assert.equal(await readFile(join(claude.path,'notes.txt'),'utf8'),'custom notes');
  assert((await readFile(join(claude.path,'SKILL.md'),'utf8')).startsWith('---\nname: rambow-icons'));
});

test('dry runs write nothing and symlink agent roots cannot redirect installation', async t => {
  const root=await temp(t);
  const result=await installSkill({agents:Object.keys(AGENTS),global:true,home:root,dryRun:true});
  assert(result.dryRun);
  assert.deepEqual(await readdir(root),[]);
  const outside=join(root,'outside');
  await mkdir(outside);
  await symlink(outside,join(root,'.agents'),process.platform==='win32'?'junction':'dir');
  await assert.rejects(installSkill({agents:['codex'],cwd:root}),/symlink install path/);
  assert.deepEqual(await readdir(outside),[]);
});

test('CLI supports multi-agent flags, rejects ambiguous options and is inert without a selection', async t => {
  assert.deepEqual(parseInstallArgs(['-a','codex,cursor','-a','claude-code','-g','--dry-run']).agents,['codex','cursor','claude-code']);
  assert.equal(parseInstallArgs(['--all']).agents.length,6);
  for(const args of [['--all','-a','codex'],['--global','--project'],['--agent'],['--unknown']])assert.throws(()=>parseInstallArgs(args));
  const root=await temp(t),bin=resolve('skills/rambow-icons/bin/rambow-icons.mjs');
  const noSelection=spawnSync(process.execPath,[bin],{cwd:root,encoding:'utf8'});
  assert.equal(noSelection.status,1);
  assert.match(noSelection.stderr,/Specify --agent/);
  assert.deepEqual(await readdir(root),[]);
  assert.equal(execFileSync(process.execPath,[bin,'--version'],{encoding:'utf8'}).trim(),'0.1.0');
  const manifest=JSON.parse(await readFile('skills/rambow-icons/package.json','utf8'));
  assert.equal(manifest.private,undefined);
  assert.equal(manifest.scripts?.postinstall,undefined);
  assert.equal(manifest.dependencies,undefined);
});
