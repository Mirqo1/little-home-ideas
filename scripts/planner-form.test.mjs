import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';
import {privacyScene} from '../public/assets/privacy-scene.js';
import {planPrivacy} from '../public/assets/privacy-plan.js';
const page=await readFile(new URL('../src/pages/tools/patio-privacy-planner.astro',import.meta.url),'utf8');
const source=(await readFile(new URL('../public/assets/planner.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
function setup(){
 const w=new Window();
 w.document.body.innerHTML=page.slice(page.indexOf('<header'),page.indexOf('<script'));
 vm.runInNewContext(source,{document:w.document,window:w,planPrivacy,privacyScene,Intl,URL,Blob,setTimeout,queueMicrotask});
 return w;
}
function submit(w){w.document.getElementById('privacy-form').requestSubmit();}
for(const value of ['2.16','2,16','3.45','3,45'])test(`form creates a plan for module width ${value}`,()=>{
 const w=setup();
 try{
  const input=w.document.getElementById('panel-width');input.value=value;
  submit(w);
  assert.equal(input.validationMessage,'');
  const modules=value.startsWith('2')?3:2;
  assert.equal(w.document.querySelector('.plan-metrics strong')?.textContent,String(modules));
  assert.ok(w.document.querySelector('.plan-sketch'));
 }finally{w.happyDOM.abort();}
});
test('all dimensions and optional prices accept either decimal separator',()=>{
 const w=setup();
 try{
  for(const [id,value] of Object.entries({'patio-width':'10,25',depth:'8.16',width:'6,45','screen-height':'6.12','panel-width':'2,16','module-price':'49,95','extra-cost':'25.50'}))w.document.getElementById(id).value=value;
  submit(w);
  assert.match(w.document.querySelector('.plan-cost')?.textContent,/\$175\.35/);
  assert.match(w.document.querySelector('.plan-metrics')?.textContent,/6\.48 ft/);
 }finally{w.happyDOM.abort();}
});
test('invalid, mixed-separator, empty, and out-of-range values cannot create a plan',()=>{
 for(const value of ['abc','2,16.5','2.16oops','','0','11','Infinity']){
  const w=setup();
  try{
   w.document.getElementById('panel-width').value=value;submit(w);
   assert.equal(w.document.querySelector('.plan-sketch'),null,value);
   assert.notEqual(w.document.getElementById('panel-width').validationMessage,'',value);
  }finally{w.happyDOM.abort();}
 }
});
test('correcting an invalid input and resetting clears validation',()=>{
 const w=setup();
 try{
  const input=w.document.getElementById('panel-width');input.value='bad';submit(w);
  input.value='2,16';input.dispatchEvent(new w.Event('input'));submit(w);
  assert.ok(w.document.querySelector('.plan-sketch'));
  input.value='bad';submit(w);w.document.getElementById('privacy-form').reset();
  assert.equal(input.validationMessage,'');
  assert.equal(w.document.querySelector('.plan-sketch'),null);
  submit(w);assert.ok(w.document.querySelector('.plan-sketch'));
 }finally{w.happyDOM.abort();}
});

test('example preview is labeled and does not pretend to be a calculated plan',()=>{
 const w=setup();
 try{
  assert.match(w.document.querySelector('.plan-preview desc').textContent,/10 by 8 feet/);
  assert.equal(w.document.querySelector('.plan-sketch'),null);
  submit(w);assert.equal(w.document.querySelector('.plan-preview'),null);
 }finally{w.happyDOM.abort();}
});
test('spatial screen geometry responds to height, while preferences preserve the measured module count',()=>{
 const w=setup();
 try{
  submit(w);
  const initial=[...w.document.querySelectorAll('.plan-sketch polygon')].map(n=>n.getAttribute('points'));
  w.document.getElementById('screen-height').value='3,5';
  w.document.getElementById('need').value='green';
  submit(w);
  const changed=[...w.document.querySelectorAll('.plan-sketch polygon')].map(n=>n.getAttribute('points'));
  assert.notDeepEqual(initial,changed);
  assert.equal(w.document.querySelector('.plan-metrics strong').textContent,'2');
  assert.match(w.document.querySelector('.plan-sketch desc').textContent,/3.5 feet high/);
  w.document.getElementById('exposure').value='sheltered';submit(w);
  assert.match(w.document.querySelector('#results h3').textContent,/container-plant/);
 }finally{w.happyDOM.abort();}
});

test('conditional structure inputs accept decimals and render the complete scene',()=>{
 const w=setup();
 try{
  for(const id of ['has-roof','has-railing']){
   const input=w.document.getElementById(id);input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));
  }
  const wall=w.document.querySelector('input[name="wall-side"][value="left"]');wall.checked=true;wall.dispatchEvent(new w.Event('change',{bubbles:true}));
  const furniture=w.document.getElementById('furniture');furniture.value='bistro';furniture.dispatchEvent(new w.Event('change',{bubbles:true}));
  w.document.getElementById('roof-height').value='8,25';w.document.getElementById('rail-height').value='3,45';w.document.getElementById('screen-mode').value='above';
  submit(w);
  assert.ok(w.document.querySelector('[data-feature="roof"]'));
  assert.ok(w.document.querySelector('[data-feature="wall-left"]'));
  assert.equal(w.document.querySelectorAll('[data-feature="chair"]').length,2);
  assert.match(w.document.querySelector('.plan-sketch').textContent,/3.45–6 ft/);
  const roofToggle=w.document.querySelector('.scene-controls input');roofToggle.checked=false;roofToggle.dispatchEvent(new w.Event('change'));
  assert.equal(w.document.querySelector('[data-feature="roof"]'),null);
  assert.ok(w.document.querySelector('[data-feature="wall-left"]'));
 }finally{w.happyDOM.abort();}
});
test('unused optional measurements do not block creation, enabled invalid ones do',()=>{
 const w=setup();
 try{
  const height=w.document.getElementById('roof-height');height.value='bad';submit(w);
  assert.ok(w.document.querySelector('.plan-sketch'));
  const roof=w.document.getElementById('has-roof');roof.checked=true;roof.dispatchEvent(new w.Event('change',{bubbles:true}));submit(w);
  assert.notEqual(height.validationMessage,'');
  roof.checked=false;roof.dispatchEvent(new w.Event('change',{bubbles:true}));submit(w);
  assert.equal(height.validationMessage,'');assert.ok(w.document.querySelector('.plan-sketch'));
 }finally{w.happyDOM.abort();}
});
