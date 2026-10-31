import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { parse } from 'yaml';
import { PACKAGE_NAME, planRelease, packageDigest, readRegistry, parsePackManifest } from '../scripts/prepare-skill-release.mjs';

const source={commit:'a'.repeat(40),digest:'b'.repeat(64)};
const manifest={name:PACKAGE_NAME,version:'0.1.0'};
const registry=(versions)=>({name:PACKAGE_NAME,versions});

test('npm legacy arrays and npm 12 keyed reports select the same single package',()=>{
  const pack={name:PACKAGE_NAME,files:[{path:'SKILL.md',mode:420}]};
  assert.equal(parsePackManifest([pack]),pack);
  assert.equal(parsePackManifest({[PACKAGE_NAME]:pack}),pack);
  for(const report of [null,'invalid',[],{},[pack,pack],{[PACKAGE_NAME]:pack,other:{name:'other'}},
    {wrong:pack},[{...pack,name:'other'}],{other:{...pack,name:'other'}},[null],
    [{...pack,files:[]}],[{...pack,files:null}]])assert.throws(()=>parsePackManifest(report),/npm pack|one npm package/);
});

test('only skill package changes on main automatically trigger npm publication',async()=>{
  const workflow=parse(await readFile('.github/workflows/publish-npm.yml','utf8'));
  assert.deepEqual(workflow.on.push,{branches:['main'],paths:['skills/rambow-icons/**']});
  assert.deepEqual(Object.keys(workflow.on).sort(),['push','workflow_dispatch']);
  assert.equal(workflow.jobs.publish.if,"github.ref == 'refs/heads/main'");
  assert.equal(workflow.concurrency['cancel-in-progress'],false);
  assert.deepEqual(workflow.jobs.publish.permissions,{'contents':'read','id-token':'write'});
  assert(workflow.jobs.publish.steps.some(step=>step.if==="steps.release.outputs.publish == 'true'"&&step.run?.startsWith('npm publish ./skills/rambow-icons')));
  assert(!JSON.stringify(workflow).includes('NPM_TOKEN'));
});

test('initial packages request bootstrap; later releases advance patch versions or accept an explicit higher version',()=>{
  assert.deepEqual(planRelease(manifest,null,source),{publish:false,reason:'bootstrap-required',version:'0.1.0'});
  assert.equal(planRelease(manifest,registry({'0.1.0':{}}),source).version,'0.1.1');
  assert.equal(planRelease(manifest,registry({'0.1.2':{},'0.1.10':{}}),source).version,'0.1.11');
  assert.equal(planRelease({...manifest,version:'0.2.0'},registry({'0.1.10':{}}),source).version,'0.2.0');
  assert.throws(()=>planRelease({...manifest,name:'other'},registry({}),source),/Unexpected/);
  assert.throws(()=>planRelease({...manifest,version:'0.1.0-beta.1'},registry({}),source),/stable/);
});

test('rerunning a source commit and publishing unchanged package content are no-ops',()=>{
  const published=registry({'0.1.1':{rambowSkillRelease:source}});
  assert.equal(planRelease(manifest,published,source).reason,'commit-already-published');
  assert.equal(planRelease(manifest,published,{...source,commit:'c'.repeat(40)}).reason,'package-content-unchanged');
  assert.equal(planRelease(manifest,published,{commit:'c'.repeat(40),digest:'d'.repeat(64)}).version,'0.1.2');
});

test('registry errors cannot be mistaken for an absent package or trigger guessed versions',async()=>{
  assert.equal(await readRegistry(async url=>{
    assert.equal(url,'https://registry.npmjs.org/@rambowcloud%2ficons-skill');
    return new Response('missing',{status:404});
  }),null);
  for(const status of [401,403,429,500])await assert.rejects(readRegistry(async()=>new Response('failed',{status})),/refusing to guess/);
  await assert.rejects(readRegistry(async()=>new Response(JSON.stringify({name:'wrong',versions:{}}))),/Invalid npm/);
});

test('content digests follow packed files only and reject paths outside the package',async t=>{
  const root=resolve(tmpdir()),directory=await mkdtemp(join(root,'rambow-release-'));
  const path=relative(root,directory);
  assert(!isAbsolute(path)&&!path.startsWith('..'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  await writeFile(join(directory,'SKILL.md'),'first');
  await writeFile(join(directory,'unrelated.txt'),'not in the package');
  const pack={name:PACKAGE_NAME,files:[{path:'SKILL.md'}]};
  const first=await packageDigest(pack,directory);
  assert.equal(await packageDigest(parsePackManifest([pack]),directory),first);
  assert.equal(await packageDigest(parsePackManifest({[PACKAGE_NAME]:pack}),directory),first);
  assert.notEqual(await packageDigest({...pack,files:[{path:'SKILL.md',mode:493}]},directory),first);
  await writeFile(join(directory,'unrelated.txt'),'changed');
  assert.equal(await packageDigest(pack,directory),first);
  await writeFile(join(directory,'SKILL.md'),'second');
  assert.notEqual(await packageDigest(pack,directory),first);
  await assert.rejects(packageDigest({...pack,files:[{path:'../outside.md'}]},directory),/Invalid package/);
});
