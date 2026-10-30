import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { CATALOGS, loadCatalog, searchCatalog, fetchIcon } from '../skills/rambow-icons/scripts/icons.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><path fill="#123abc" d="M0 0h80v40H0z"/></svg>');
const item = { id:'brand', name:'Brand & <Cloud>', aliases:['品牌'], tags:['云服务'], asset:'brand.svg', width:80, height:40,
  sha256:hash(svg), softwareType:'commercial', usagePolicy:'technical-diagrams-and-docs', usagePolicyUrl:'ICON_USAGE.md',
  source:{url:'https://vendor.example/logo.svg',collectionLicense:'MIT',licenseUrl:'licenses/vendor.txt'} };
async function temp(t) {
  const root = resolve(tmpdir()), directory = await mkdtemp(join(root, 'rambow-skill-'));
  const path = relative(root, directory);
  assert(!path.startsWith('..') && !isAbsolute(path));
  t.after(() => rm(directory, {recursive:true,force:true}));
  return directory;
}

test('skill search ranks exact bilingual aliases and uses AND matching without dumping empty queries', () => {
  const catalog = {icons:[{...item,id:'metadata',name:'Other',aliases:[],tags:['品牌']}, item, {...item,id:'brand-tools',name:'Brand Tools'}]};
  assert.equal(searchCatalog(catalog,'品牌')[0].id,'brand');
  assert.equal(searchCatalog(catalog,'ＢＲＡＮＤ')[0].id,'brand');
  assert.equal(searchCatalog(catalog,'brand cloud')[0].id,'brand');
  assert.equal(searchCatalog(catalog,'品牌',1).length,1);
  assert.deepEqual(searchCatalog(catalog,'   '),[]);
  assert.deepEqual(searchCatalog(catalog,'unknown'),[]);
  assert.throws(()=>searchCatalog(catalog,'brand',101));
});

test('skill verifies bytes, preserves SVG colors/proportions and escapes embedded labels', async t => {
  const directory=await temp(t);
  await writeFile(join(directory,'brand.svg'),svg);
  const loaded={catalog:{icons:[item]},url:pathToFileURL(join(directory,'catalog.json'))};
  const out=join(directory,'output','brand.svg');
  const files=await fetchIcon(loaded,'brand',{out});
  assert.deepEqual(await readFile(files.asset),svg);
  const wrapper=await readFile(files.image,'utf8');
  assert(wrapper.includes('viewBox="0 0 48 24"'));
  assert(wrapper.includes('aria-label="Brand &amp; &lt;Cloud&gt;"'));
  assert.deepEqual(Buffer.from(wrapper.match(/base64,([^"\s]+)/)[1],'base64'),svg);
  const metadata=JSON.parse(await readFile(files.metadata,'utf8'));
  assert.equal(metadata.sha256,item.sha256);
  assert.equal(metadata.usagePolicy,'technical-diagrams-and-docs');
  assert.equal(metadata.source.collectionLicense,'MIT');
  await assert.rejects(fetchIcon(loaded,'brand',{out}),/Output exists/);
  await assert.rejects(fetchIcon(loaded,'brand',{out:join(directory,'wrong.png')}),/\.svg extension/);
  await assert.rejects(fetchIcon(loaded,'missing',{out}),/Unknown icon/);
  await writeFile(join(directory,'brand.svg'),'tampered');
  await assert.rejects(fetchIcon(loaded,'brand',{out:join(directory,'bad.svg')}),/SHA-256 mismatch/);
  assert(!(await readdir(directory)).includes('bad.svg'));
});

test('catalog fallback changes relative asset origin once and explicit failures stay explicit', async t => {
  const calls=[];
  const fetchImpl=async url=>{
    calls.push(String(url));
    return calls.length===1 ? new Response('unavailable',{status:503}) : new Response(JSON.stringify({icons:[item]}));
  };
  const loaded=await loadCatalog(undefined,fetchImpl);
  assert.deepEqual(calls,CATALOGS);
  assert.equal(loaded.url.href,CATALOGS[1]);
  const directory=await temp(t);
  let assetUrl;
  await fetchIcon(loaded,'brand',{out:join(directory,'brand.svg'),fetchImpl:async url=>{assetUrl=String(url);return new Response(svg);}});
  assert.equal(assetUrl,new URL(item.asset,CATALOGS[1]).href);
  let count=0;
  await assert.rejects(loadCatalog('https://custom.example/catalog.json',async()=>{count++;return new Response('no',{status:404});}),/HTTP 404/);
  assert.equal(count,1);
  await assert.rejects(loadCatalog('http://custom.example/catalog.json'),/HTTPS/);
});

test('standalone CLI handles committed SVG/PNG offline with the current project scope', async t => {
  const directory=await temp(t), script=resolve('skills/rambow-icons/scripts/icons.mjs');
  const run=args=>JSON.parse(execFileSync(process.execPath,[script,...args],{encoding:'utf8'}));
  const common=['--catalog',resolve('data/catalog.json')];
  assert.equal(run(['search','Ｋｕｂｅｒｎｅｔｅｓ',...common]).results[0].id,'kubernetes');
  for (const [id,extension] of [['kubernetes','svg'],['aider','png'],['chatgpt','svg']]) {
    const result=run(['fetch',id,...common,'--asset-root',resolve('assets'),'--out',join(directory,`${id}.${extension}`)]);
    assert.deepEqual(await readFile(result.asset),await readFile(`assets/icons/${id}.${extension}`));
    assert((await readFile(result.image,'utf8')).includes(`data:image/${extension==='svg'?'svg+xml':'png'};base64,`));
    const metadata=JSON.parse(await readFile(result.metadata,'utf8'));
    assert.equal(metadata.usagePolicyUrl,pathToFileURL(resolve('ICON_USAGE.md')).href);
    if(id==='chatgpt')assert.equal(metadata.usagePolicy,'technical-diagrams-and-docs');
  }
});

test('asset paths cannot escape the selected catalog root', async t => {
  const directory=await temp(t);
  for(const asset of ['../brand.svg','/brand.svg','https://other.example/icon.svg','icons\\brand.svg']) {
    const loaded={catalog:{icons:[{...item,asset}]},url:pathToFileURL(join(directory,'catalog.json'))};
    await assert.rejects(fetchIcon(loaded,'brand',{out:join(directory,'out.svg'),assetRoot:directory}),/Invalid relative asset path/);
  }
});
