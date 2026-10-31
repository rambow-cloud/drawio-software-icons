import { createHash } from 'node:crypto';
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PACKAGE_NAME = '@rambowcloud/icons-skill';
export const PACKAGE_DIRECTORY = 'skills/rambow-icons';
const registryUrl = `https://registry.npmjs.org/${PACKAGE_NAME.replace('/', '%2f')}`;
const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
function parts(version) {
  if (!stableVersion.test(version)) throw Error(`Expected a stable x.y.z version: ${version}`);
  const numbers=version.split('.').map(Number);
  if(!numbers.every(Number.isSafeInteger))throw Error('Version components exceed safe integer limits');
  return numbers;
}
const compare = (a,b) => {
  const first=parts(a),second=parts(b);
  for(let i=0;i<3;i++)if(first[i]!==second[i])return first[i]>second[i]?1:-1;
  return 0;
};

export function planRelease(manifest, registry, { commit, digest }) {
  if(manifest.name!==PACKAGE_NAME||manifest.private)throw Error('Unexpected or private skill package');
  parts(manifest.version);
  if(!/^[a-f0-9]{40}$/.test(commit)||!/^[a-f0-9]{64}$/.test(digest))throw Error('Invalid release source identity');
  if(!registry)return {publish:false,reason:'bootstrap-required',version:manifest.version};
  const versions=Object.entries(registry.versions??{});
  if(versions.some(([,value])=>value.rambowSkillRelease?.commit===commit))return {publish:false,reason:'commit-already-published'};
  const stable=versions.map(([version])=>version).filter(version=>stableVersion.test(version)).sort(compare);
  const latest=stable.at(-1);
  if(latest&&registry.versions[latest].rambowSkillRelease?.digest===digest)return {publish:false,reason:'package-content-unchanged',version:latest};
  let version=manifest.version;
  if(latest&&compare(version,latest)<=0) {
    const [major,minor,patch]=parts(latest);
    if(!Number.isSafeInteger(patch+1))throw Error('Patch version exceeds safe integer limits');
    version=`${major}.${minor}.${patch+1}`;
  }
  if(registry.versions?.[version])throw Error(`Version already exists: ${version}`);
  return {publish:true,reason:'package-content-changed',version};
}

export async function readRegistry(fetchImpl=fetch) {
  const response=await fetchImpl(registryUrl,{signal:AbortSignal.timeout(20000)});
  if(response.status===404)return null;
  if(!response.ok)throw Error(`npm registry returned HTTP ${response.status}; refusing to guess a version`);
  const registry=await response.json();
  if(registry.name!==PACKAGE_NAME||!registry.versions||typeof registry.versions!=='object'||Array.isArray(registry.versions))throw Error('Invalid npm package metadata');
  return registry;
}

export async function packageDigest(pack, directory=resolve(PACKAGE_DIRECTORY)) {
  if(pack.name!==PACKAGE_NAME||!Array.isArray(pack.files)||!pack.files.length)throw Error('Unexpected npm pack manifest');
  const hash=createHash('sha256');
  const paths=pack.files.map(file=>file.path).sort();
  const modes=new Map(pack.files.map(file=>[file.path,file.mode??0]));
  if(new Set(paths).size!==paths.length)throw Error('Duplicate package file path');
  for(const path of paths) {
    if(typeof path!=='string'||/[\\:]/.test(path)||path.split('/').some(part=>!part||part==='.'||part==='..'))throw Error('Invalid package file path');
    const absolute=resolve(directory,path),rel=relative(directory,absolute);
    if(isAbsolute(rel)||rel.startsWith('..'))throw Error('Package file escapes the skill directory');
    const bytes=await readFile(absolute);
    hash.update(path).update('\0').update(String(modes.get(path))).update('\0').update(String(bytes.length)).update('\0').update(bytes).update('\0');
  }
  return hash.digest('hex');
}

export async function main(packFile) {
  const [pack,...extra]=JSON.parse(await readFile(packFile,'utf8'));
  if(extra.length)throw Error('Expected exactly one npm package');
  const file=resolve(PACKAGE_DIRECTORY,'package.json'),manifest=JSON.parse(await readFile(file,'utf8'));
  const digest=await packageDigest(pack),commit=process.env.GITHUB_SHA;
  const plan=planRelease(manifest,await readRegistry(),{commit,digest});
  if(plan.publish) {
    manifest.version=plan.version;
    manifest.rambowSkillRelease={commit,digest};
    await writeFile(file,JSON.stringify(manifest,null,2)+'\n');
  }
  if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,`publish=${plan.publish}\nversion=${plan.version??''}\n`);
  if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,
    `## npm skill release\n\n${PACKAGE_NAME}: ${plan.reason}${plan.version?` (${plan.version})`:''}.\n`+
    (plan.reason==='bootstrap-required'?'\nOne-time setup is required: publish the initial package, configure its trusted publisher for publish-npm.yml, then run this workflow manually.\n':''));
  console.log(JSON.stringify(plan));
  return plan;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv[2]).catch(error=>{console.error(error.message);process.exitCode=1;});
}
