#!/usr/bin/env node
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { main as artworkCommand } from '../scripts/icons.mjs';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
export const AGENTS = {
  codex: { name:'Codex', project:'.agents/skills', global:'.agents/skills' },
  'claude-code': { name:'Claude Code', project:'.claude/skills', global:'.claude/skills' },
  cursor: { name:'Cursor', project:'.agents/skills', global:'.cursor/skills' },
  'gemini-cli': { name:'Gemini CLI', project:'.agents/skills', global:'.gemini/skills' },
  'github-copilot': { name:'GitHub Copilot', project:'.agents/skills', global:'.copilot/skills' },
  opencode: { name:'OpenCode', project:'.agents/skills', global:'.config/opencode/skills' },
};
const skillFiles = ['SKILL.md','scripts/icons.mjs','LICENSE'];
const stat = async path => {
  try { return await lstat(path); } catch (error) { if(error.code==='ENOENT')return null;throw error; }
};

export function installationTargets(agents, { global=false, cwd=process.cwd(), home=homedir() }={}) {
  if (!agents.length) throw Error('Select at least one agent with --agent or --all');
  const base=resolve(global?home:cwd), grouped=new Map();
  for (const id of agents) {
    if (!Object.hasOwn(AGENTS,id)) throw Error(`Unknown agent: ${id}. Use list-agents.`);
    const path=resolve(base,AGENTS[id][global?'global':'project'],'rambow-icons');
    const entry=grouped.get(path)??{path,base,agents:[]};
    if(!entry.agents.includes(id))entry.agents.push(id);
    grouped.set(path,entry);
  }
  return [...grouped.values()];
}

async function inspectTarget(target, files) {
  for(const file of ['',...skillFiles]) {
    const path=resolve(target.path,file), rel=relative(target.base,path);
    if(rel.startsWith('..')||isAbsolute(rel))throw Error('Install path escapes the selected root');
    let current=target.base;
    const parts=rel.split(/[\\/]/);
    for(let index=0;index<parts.length;index++) {
      current=join(current,parts[index]);
      const info=await stat(current);
      if(!info)break;
      if(info.isSymbolicLink())throw Error(`Refusing symlink install path: ${current}`);
      const isFile=file&&index===parts.length-1;
      if(isFile?!info.isFile():!info.isDirectory())throw Error(`Unexpected install path type: ${current}`);
    }
  }
  return Promise.all(skillFiles.map(async file=>{
    const path=resolve(target.path,file), existing=await stat(path);
    return {file,path,changed:!!existing&&!(await readFile(path)).equals(files.get(file)),exists:!!existing};
  }));
}

export async function installSkill({ agents, global=false, cwd=process.cwd(), home=homedir(), dryRun=false, force=false, source=packageRoot }) {
  const targets=installationTargets(agents,{global,cwd,home});
  const files=new Map(await Promise.all(skillFiles.map(async file=>[file,await readFile(resolve(source,file))])));
  const plans=[];
  // Inspect all targets before any writes, so a conflict in one agent's folder
  // does not leave the other selected agents partly updated.
  for(const target of targets) {
    const entries=await inspectTarget(target,files);
    const conflict=entries.find(entry=>entry.changed);
    if(conflict&&!force)throw Error(`Existing file differs: ${conflict.path}. Use --force to update the bundled skill files; custom files are preserved.`);
    plans.push({target,entries});
  }
  if(!dryRun)for(const {entries} of plans)for(const entry of entries) {
    if(entry.exists&&!entry.changed)continue;
    await mkdir(dirname(entry.path),{recursive:true});
    await writeFile(entry.path,files.get(entry.file),{flag:entry.exists?'w':'wx'});
  }
  return { skill:'rambow-icons',scope:global?'global':'project',dryRun,
    targets:plans.map(({target,entries})=>({path:target.path,agents:target.agents,
      files:entries.map(entry=>({file:entry.file,action:entry.exists?(entry.changed?'update':'unchanged'):'create'}))})) };
}

export function parseInstallArgs(args) {
  const options={agents:[]}, selected=new Set();
  let all=false,scope;
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==='--agent'||arg==='-a') {
      const value=args[++i];
      if(!value||value.startsWith('-'))throw Error('--agent requires a name or comma-separated list');
      for(const id of value.split(','))selected.add(id.trim());
    } else if(arg==='--all')all=true;
    else if(['--global','-g','--project'].includes(arg)) {
      const next=arg==='--project'?'project':'global';
      if(scope&&scope!==next)throw Error('Choose either --project or --global');
      scope=next;options.global=next==='global';
    } else if(arg==='--dry-run')options.dryRun=true;
    else if(arg==='--force')options.force=true;
    else throw Error(`Unknown install option: ${arg}`);
  }
  if(all&&selected.size)throw Error('Choose --all or --agent, not both');
  options.agents=all?Object.keys(AGENTS):[...selected];
  return options;
}

const help=`@rambowcloud/icons-skill — install the skill and fetch artwork (Node.js 22+)

  npx @rambowcloud/icons-skill                         Interactive project installation
  npx @rambowcloud/icons-skill install -a codex,cursor  Install into the current project
  npx @rambowcloud/icons-skill install -a claude-code -g
  npx @rambowcloud/icons-skill install --all -g --dry-run
  npx @rambowcloud/icons-skill install -a codex -g --force
  npx @rambowcloud/icons-skill list-agents
  npx @rambowcloud/icons-skill search Kubernetes
  npx @rambowcloud/icons-skill fetch kubernetes --out ./kubernetes.svg

Options: --agent/-a (repeatable or comma-separated), --all, --global/-g,
         --project (default), --dry-run, --force, --help, --version

No npm install hooks modify agent folders. Existing differing files require
--force; only bundled skill files are updated and custom files are preserved.
Project installs may be shared by agents that read .agents/skills.
`;

export async function main(args) {
  const [command,...rest]=args;
  if(command==='--help'||command==='-h'||command==='help')return help;
  if(command==='--version'||command==='-v')return JSON.parse(await readFile(join(packageRoot,'package.json'),'utf8')).version;
  if(command==='list-agents')return AGENTS;
  if(command==='search'||command==='fetch')return artworkCommand(args);
  if(command&&command!=='install'&&!command.startsWith('-'))throw Error(`Unknown command: ${command}`);
  const options=parseInstallArgs(command==='install'?rest:args);
  if(!options.agents.length) {
    if(!process.stdin.isTTY||!process.stdout.isTTY)throw Error('Specify --agent or --all in non-interactive use. Run --help for examples.');
    const ids=Object.keys(AGENTS),scope=options.global?'globally':'in the current project';
    const prompt=createInterface({input:process.stdin,output:process.stdout});
    try {
      console.log(`Install rambow-icons ${scope}:\n`+ids.map((id,index)=>`  ${index+1}. ${AGENTS[id].name} (${id})`).join('\n'));
      const answer=await prompt.question('Select agents (numbers or IDs, comma-separated): ');
      options.agents=[...new Set(answer.split(',').map(value=>value.trim()).filter(Boolean).map(value=>/^\d+$/.test(value)?ids[Number(value)-1]:value))];
    } finally { prompt.close(); }
  }
  const result=await installSkill(options);
  return {...result,note:'Reload the agent or start a new session if the skill is not discovered automatically. diagram-design is installed separately.'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(result=>console.log(typeof result==='string'?result:JSON.stringify(result,null,2)))
    .catch(error=>{console.error(error.message);process.exitCode=1;});
}
