import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root=new URL('../',import.meta.url);

test('site branding preserves the approved self-contained warm SVG',async()=>{
  const svg=await readFile(new URL('src/favicon.svg',root),'utf8');
  // Lock the approved drawing and colors; intentional redesigns update this hash.
  assert.equal(createHash('sha256').update(svg).digest('hex'),'5368b6b3aa2501bd80b4e2d2dee5cd23a7485c5c964cf9060fd2bc3648efe632');
  assert.match(svg,/viewBox="0 0 512 512"/);
  for(const [id,color] of [['tile-square','#FF665C'],['tile-circle','#FFD166'],['tile-round','#FFA34D'],['tile-diamond','#FFE59A']]){
    assert.match(svg,new RegExp(`<[^>]*id="${id}"[^>]*fill="${color}"`));
  }
  assert(!/<(?:image|script|foreignObject)\b|\bon\w+\s*=|\b(?:href|xlink:href)\s*=/.test(svg),'brand artwork remains self-contained vector shapes');
});

test('page favicon references the shared brand asset',async()=>{
  const html=await readFile(new URL('index.html',root),'utf8');
  assert.match(html,/<link\b(?=[^>]*rel="icon")(?=[^>]*type="image\/svg\+xml")(?=[^>]*href="\/src\/favicon\.svg")[^>]*>/);
});
