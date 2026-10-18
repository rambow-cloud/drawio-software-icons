import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {json,hash,parser,readLibrary} from './lib.mjs';
import {changelogMarkdown} from './changelog.mjs';
const catalog=await json('dist/catalog.json');
const history=await json('data/changelog.json');
for(const [locale,path] of [['en','CHANGELOG.md'],['zh-CN','CHANGELOG.zh-CN.md']]) {
  const expected=changelogMarkdown(history,locale);
  assert.equal(await readFile(`dist/${path}`,'utf8'),expected,path);
}
const docs=['README.md','README.en.md','README.zh-CN.md','ICON_USAGE.md','THIRD_PARTY_NOTICES.md','LICENSE','data/official-icons.json',...(await readdir('licenses')).map(name=>`licenses/${name}`)];
for(const path of docs) {
  const source=await readFile(path,'utf8');
  assert.equal(await readFile(`dist/${path}`,'utf8'),source,path);
}
for(const category of catalog.categories) {
  for(const [locale,path] of Object.entries(category.libraries)) {
    const xml=await readFile(`dist/${path}`,'utf8');
    assert.equal(xml.substring(0,10),'<mxlibrary',`${path}: desktop drop detection`);
    assert.equal(parser.parse(xml).mxlibrary['@_title'],locale==='en'?`General Software · ${category.nameEn}`:`通用软件 · ${category.name}`);
    assert.equal(hash(xml),category.libraryRevisions[locale]);
    assert.match(xml,/ICON_USAGE\.md/);
    assert.equal(readLibrary(xml).length,category.count);
  }
}
for(const legacy of await json('data/legacy-categories.json')) {
  const current=catalog.categories.find(c=>c.id===legacy.category);
  for(const [locale,path] of Object.entries(legacy.libraries)) assert.equal(await readFile(`dist/${path}`,'utf8'),await readFile(`dist/${current.libraries[locale]}`,'utf8'));
}
const library=readLibrary(await readFile('dist/libraries/all.xml','utf8'));
assert.equal(library.length,catalog.icons.length);
assert.deepEqual(await json('dist/changelog.json'),history);
for(const [id,official] of Object.entries(await json('data/official-icons.json'))) {
  const icon=catalog.icons.find(i=>i.id===id);
  const format=official.format==='svg'?'svg':'png';
  assert.equal(hash(await readFile(`dist/icons/${id}.${format}`)),official.sha256,`${id}: original ${format.toUpperCase()} in distribution`);
  assert.equal(hash(await readFile(`dist/${icon.asset}`)),icon.sha256,`${id}: packaged icon in distribution`);
  const entry=library.find(e=>e.title===icon.name);
  assert.ok(entry.data.startsWith(`data:image/${format==='svg' || official.presentation?'svg+xml':'png'};base64,`),id);
  const embedded=Buffer.from(entry.data.split(',')[1],'base64');
  assert.equal(hash(embedded),icon.sha256,`${id}: embedded asset`);
  if(official.presentation) {
    const original=parser.parse(embedded.toString()).svg.image['@_xlink:href'];
    assert.equal(hash(Buffer.from(original.split(',')[1],'base64')),official.sha256,`${id}: original PNG inside rounded SVG`);
  }
}
const serviceNow=catalog.icons.find(i=>i.id==='servicenow');
assert.equal(hash(await readFile(`dist/${serviceNow.asset}`)),serviceNow.source.sha256,'Distribute complete original ServiceNow SVG source');
console.log('Verified bilingual guides, icon-use notices, licenses, localized XML, legacy URLs and original GPL SVG source in the distribution.');
