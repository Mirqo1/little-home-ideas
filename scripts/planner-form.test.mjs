import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';
import {privacyScene} from '../public/assets/privacy-scene.js';
import {planLayout,sideNames} from '../public/assets/layout-plan.js';
import {bindFurniture} from '../public/assets/furniture-controls.js';
const page=await readFile(new URL('../src/pages/tools/patio-privacy-planner.astro',import.meta.url),'utf8');
const source=(await readFile(new URL('../public/assets/planner.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
function setup(){
 const w=new Window();
 w.SVGElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:960,height:740});
 w.document.body.innerHTML=page.slice(page.indexOf('<header'),page.indexOf('<script'));
 vm.runInNewContext(source,{document:w.document,window:w,planLayout,sideNames,privacyScene,bindFurniture,Intl,URL,Blob,setTimeout,queueMicrotask});
 return w;
}
function submit(w){w.document.getElementById('privacy-form').requestSubmit();}
function check(w,id){const i=w.document.getElementById(id);i.checked=true;i.dispatchEvent(new w.Event('change',{bubbles:true}));}
function furniture(w){const i=w.document.getElementById('furniture');i.value='bistro';i.dispatchEvent(new w.Event('change',{bubbles:true}));}
for(const value of ['2.16','2,16','3.45','3,45'])test('module width '+value+' generates a spatial plan',()=>{
 const w=setup();try{w.document.getElementById('panel-width').value=value;submit(w);assert.equal(w.document.querySelector('.plan-metrics strong')?.textContent,value.startsWith('2')?'3':'2');assert.ok(w.document.querySelector('.plan-sketch'));}finally{w.happyDOM.abort();}
});
test('dimensions and prices accept commas and points together',()=>{
 const w=setup();try{
  for(const [id,v]of Object.entries({'patio-width':'10,25',depth:'8.16','back-screen-width':'6,45','screen-height':'6.12','panel-width':'2,16','module-price':'49,95','extra-cost':'25.50'}))w.document.getElementById(id).value=v;
  submit(w);assert.match(w.document.querySelector('.plan-cost').textContent,/\$175\.35/);assert.match(w.document.querySelector('.plan-metrics').textContent,/6.48 ft/);
 }finally{w.happyDOM.abort();}
});
test('invalid inputs preserve the example; a geometry error preserves the last result',()=>{
 const w=setup();try{
  const preview=w.document.querySelector('.plan-preview').outerHTML;
  w.document.getElementById('panel-width').value='bad';submit(w);
  assert.equal(w.document.querySelector('.plan-preview').outerHTML,preview);assert.equal(w.document.getElementById('planner-message').hidden,false);
  w.document.getElementById('panel-width').value='3';submit(w);
  const valid=w.document.querySelector('.plan-sketch').outerHTML;
  check(w,'has-roof');w.document.getElementById('roof-height').value='5';submit(w);
  assert.equal(w.document.querySelector('.plan-sketch').outerHTML,valid);assert.match(w.document.getElementById('planner-message').textContent,/roof.*last valid/);
  w.document.getElementById('roof-height').value='8';submit(w);assert.equal(w.document.getElementById('planner-message').hidden,true);assert.ok(w.document.querySelector('[data-feature="roof"]'));
 }finally{w.happyDOM.abort();}
});
test('two screened sides and a split wall/railing render independently',()=>{
 const w=setup();try{
  for(const id of ['back-rail','left-wall','left-rail','left-screen'])check(w,id);
  w.document.getElementById('left-wall-length').value='2,0';w.document.getElementById('left-mode').value='above';
  submit(w);
  assert.equal(w.document.querySelectorAll('.screen-summary tbody tr').length,2);
  assert.ok(w.document.querySelector('[data-feature="wall-left"]'));assert.ok(w.document.querySelector('[data-feature="rail-left"]'));
  assert.match(w.document.querySelector('.screen-summary').textContent,/3.5–6/);
 }finally{w.happyDOM.abort();}
});
test('keyboard placement survives an update and reset positions restores it',()=>{
 const w=setup();try{
  furniture(w);submit(w);
  let chair=w.document.querySelector('[data-item-id="item-0"][tabindex]');
  assert.match(chair.getAttribute('aria-label'),/1.5, 6 ft/);
  chair.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));
  chair=w.document.querySelector('[data-item-id="item-0"][tabindex]');assert.match(chair.getAttribute('aria-label'),/1.5, 5.75 ft/);
  submit(w);assert.match(w.document.querySelector('[data-item-id="item-0"][tabindex]').getAttribute('aria-label'),/1.5, 5.75 ft/);
  [...w.document.querySelectorAll('button')].find(b=>b.textContent==='Reset furniture positions').click();
  assert.match(w.document.querySelector('[data-item-id="item-0"][tabindex]').getAttribute('aria-label'),/1.5, 6 ft/);
 }finally{w.happyDOM.abort();}
});
test('pointer dragging uses the projected floor, not screen coordinates',()=>{
 const w=setup();try{
  furniture(w);submit(w);
  const scene=w.document.querySelector('.scene-container'),face=scene.querySelector('[data-item-id="item-0"]'),scale=Number(scene.querySelector('svg').getAttribute('data-projection-scale'));
  face.dispatchEvent(new w.PointerEvent('pointerdown',{button:0,clientX:400,clientY:400,pointerId:1,bubbles:true}));
  // Moving -1 ft in floor y yields +0.8*scale in screen x and -0.38*scale in screen y.
  scene.dispatchEvent(new w.PointerEvent('pointermove',{clientX:400+.8*scale,clientY:400-.38*scale,pointerId:1,bubbles:true}));
  scene.dispatchEvent(new w.PointerEvent('pointerup',{pointerId:1,bubbles:true}));
  assert.match(scene.querySelector('[data-item-id="item-0"][tabindex]').getAttribute('aria-label'),/1.5, 5 ft/);
 }finally{w.happyDOM.abort();}
});
test('hidden invalid optional values are ignored and start over restores the example',async()=>{
 const w=setup();try{
  w.document.getElementById('roof-height').value='bad';submit(w);assert.ok(w.document.querySelector('.plan-sketch'));
  check(w,'has-roof');submit(w);assert.match(w.document.getElementById('planner-message').textContent,/decimal/);
  w.document.getElementById('privacy-form').reset();await Promise.resolve();assert.ok(w.document.querySelector('.plan-preview'));assert.equal(w.document.getElementById('roof-height').disabled,true);assert.equal(w.document.getElementById('planner-message').hidden,true);
 }finally{w.happyDOM.abort();}
});
test('rounded module overflow keeps the last plan and shows the failing side',()=>{
 const w=setup();try{
  submit(w);const drawing=w.document.querySelector('.plan-sketch').outerHTML;
  check(w,'left-screen');submit(w);
  assert.equal(w.document.querySelector('.plan-sketch').outerHTML,drawing);
  assert.match(w.document.getElementById('planner-message').textContent,/D.*9 ft.*last valid/);
 }finally{w.happyDOM.abort();}
});
