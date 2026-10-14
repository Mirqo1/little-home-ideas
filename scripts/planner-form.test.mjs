import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';
import {planPrivacy} from '../public/assets/privacy-plan.js';
const page=await readFile(new URL('../src/pages/tools/patio-privacy-planner.astro',import.meta.url),'utf8');
const source=(await readFile(new URL('../public/assets/planner.js',import.meta.url),'utf8')).replace(/^import .*;\n/,'');
function setup(){
 const w=new Window();
 w.document.body.innerHTML=page.slice(page.indexOf('<header'),page.indexOf('<script'));
 vm.runInNewContext(source,{document:w.document,window:w,planPrivacy,Intl,URL,Blob,setTimeout});
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
