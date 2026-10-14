import {bindOpenings} from '../public/assets/wall-openings.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';
import {privacyScene} from '../public/assets/privacy-scene.js';
import {planLayout,sideNames,rotateFurniture} from '../public/assets/layout-plan.js';
import {bindFurniture} from '../public/assets/furniture-controls.js';
const page=await readFile(new URL('../src/pages/tools/patio-privacy-planner.astro',import.meta.url),'utf8');
const source=(await readFile(new URL('../public/assets/planner.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
function setup(){
 const w=new Window();
 w.SVGElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:960,height:740});
 w.document.body.innerHTML=page.slice(page.indexOf('<header'),page.indexOf('<script'));
 vm.runInNewContext(source,{document:w.document,window:w,planLayout,sideNames,rotateFurniture,privacyScene,bindFurniture,bindOpenings,Intl,URL,Blob,setTimeout,queueMicrotask});
 return w;
}
function submit(w){w.document.getElementById('privacy-form').requestSubmit();}
function check(w,id){const i=w.document.getElementById(id);i.checked=true;i.dispatchEvent(new w.Event('change',{bubbles:true}));}
function panels(w){const d=w.document.getElementById('product-details');d.open=true;d.dispatchEvent(new w.Event('toggle'));}
function cover(w,side,v){check(w,side+'-custom-width');w.document.getElementById(side+'-screen-width').value=v;}
function furniture(w){check(w,'furniture');}
for(const value of ['2.16','2,16','3.45','3,45'])test('module width '+value+' generates a spatial plan',()=>{
 const w=setup();try{panels(w);cover(w,'back','6');w.document.getElementById('panel-width').value=value;submit(w);assert.equal(w.document.querySelector('.plan-metrics strong')?.textContent,value.startsWith('2')?'3':'2');assert.ok(w.document.querySelector('.plan-sketch'));}finally{w.happyDOM.abort();}
});
test('dimensions and prices accept commas and points together',()=>{
 const w=setup();try{
  panels(w);check(w,'back-custom-width');
  for(const [id,v]of Object.entries({'patio-width':'10,25',depth:'8.16','back-screen-width':'6,45','screen-height':'6.12','panel-width':'2,16','module-price':'49,95','extra-cost':'25.50'}))w.document.getElementById(id).value=v;
  submit(w);assert.match(w.document.querySelector('.plan-cost').textContent,/\$175\.35/);assert.match(w.document.querySelector('.plan-metrics').textContent,/6.48 ft/);
 }finally{w.happyDOM.abort();}
});
test('invalid inputs preserve the example; a geometry error preserves the last result',()=>{
 const w=setup();try{
  panels(w);const preview=w.document.querySelector('.plan-preview').outerHTML;
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
  [...w.document.querySelectorAll('button')].find(b=>b.textContent==='Reset item positions & directions').click();
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
test('full-side screening works by default; optional panel mismatch is advisory',()=>{
 const w=setup();try{
  check(w,'left-screen');submit(w);
  assert.equal(w.document.getElementById('planner-message').hidden,true);
  assert.equal(w.document.querySelectorAll('.screen-summary tbody tr').length,2);
  assert.equal(w.document.querySelector('.plan-metrics'),null);
  panels(w);submit(w);
  assert.equal(w.document.getElementById('planner-message').hidden,true);
  assert.match(w.document.querySelector('.layout-review').textContent,/available section/);
  assert.ok(w.document.querySelector('.plan-sketch'));
 }finally{w.happyDOM.abort();}
});
test('screen starts is only available with a railing and resets when railing is removed',()=>{
 const w=setup();try{
  const group=w.document.querySelector('[data-side="back"] .screen-placement');
  assert.equal(group.hidden,true);assert.equal(w.document.getElementById('back-mode').disabled,true);
  check(w,'back-rail');w.document.getElementById('back-mode').value='above';
  assert.equal(group.hidden,false);
  const rail=w.document.getElementById('back-rail');rail.checked=false;rail.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(group.hidden,true);assert.equal(w.document.getElementById('back-mode').value,'full');
  submit(w);assert.equal(w.document.getElementById('planner-message').hidden,true);
 }finally{w.happyDOM.abort();}
});
test('floor resizing, mixed-side defaults and removing all screens do not trap the user',()=>{
 const w=setup();try{
  const floor=w.document.getElementById('patio-width');floor.value='4';floor.dispatchEvent(new w.Event('input',{bubbles:true}));
  submit(w);assert.equal(w.document.getElementById('planner-message').hidden,true);assert.match(w.document.querySelector('.screen-summary').textContent,/4 ft/);
  check(w,'back-wall');assert.equal(w.document.getElementById('back-screen').disabled,false);
  submit(w);assert.equal(w.document.getElementById('planner-message').hidden,true);assert.ok(w.document.querySelector('[data-feature="wall-back"]'));
  check(w,'back-rail');check(w,'back-screen');assert.equal(w.document.getElementById('back-wall-length').value,'2');
  submit(w);assert.equal(w.document.getElementById('planner-message').hidden,true);
 }finally{w.happyDOM.abort();}
});
test('a too-long custom screen can be corrected with one click without losing the plan',()=>{
 const w=setup();try{
  submit(w);cover(w,'back','11');submit(w);
  assert.equal(w.document.getElementById('back-screen-width').getAttribute('aria-invalid'),'true');
  [...w.document.querySelectorAll('#planner-message button')].find(b=>b.textContent==='Use full available section').click();
  assert.equal(w.document.getElementById('planner-message').hidden,true);
  assert.match(w.document.querySelector('.screen-summary').textContent,/10 ft/);
 }finally{w.happyDOM.abort();}
});
test('a resized floor offers an explicit furniture recovery instead of forcing start over',()=>{
 const w=setup();try{
  furniture(w);submit(w);w.document.getElementById('patio-width').value='7';submit(w);
  assert.match(w.document.getElementById('planner-message').textContent,/Reset furniture positions/);
  [...w.document.querySelectorAll('#planner-message button')].find(b=>b.textContent==='Reset furniture positions & update').click();
  assert.equal(w.document.getElementById('planner-message').hidden,true);
  assert.ok(w.document.querySelector('[data-item-id="item-0"]'));
 }finally{w.happyDOM.abort();}
});
test('start over closes optional product settings and clears pending feedback',async()=>{
 const w=setup();try{
  panels(w);submit(w);w.document.getElementById('privacy-form').reset();
  w.document.getElementById('product-details').dispatchEvent(new w.Event('toggle'));await Promise.resolve();
  assert.equal(w.document.getElementById('product-details').open,false);
  assert.equal(w.document.getElementById('panel-width').disabled,true);
  assert.equal(w.document.getElementById('planner-state-note').hidden,true);
 }finally{w.happyDOM.abort();}
});
test('plants render as selectable pieces and seating rotation persists through an update',()=>{
 const w=setup();try{
  furniture(w);check(w,'plant-thuja-1');check(w,'plant-thuja-2');submit(w);
  assert.equal(w.document.querySelectorAll('[data-feature="plant"]').length,2);
  assert.match(w.document.querySelector('#layout-piece').textContent,/Potted thuja 1/);
  [...w.document.querySelectorAll('.item-toolbar button')].find(b=>b.textContent==='Rotate right ↷').click();
  assert.match(w.document.querySelector('[data-item-id="item-0"][tabindex]').getAttribute('aria-label'),/facing 90 degrees/);
  submit(w);assert.match(w.document.querySelector('[data-item-id="item-0"][tabindex]').getAttribute('aria-label'),/facing 90 degrees/);
  w.document.getElementById('layout-piece').value='plant-thuja-1';w.document.getElementById('layout-piece').dispatchEvent(new w.Event('change'));
  assert.ok([...w.document.querySelectorAll('.item-toolbar button')].every(b=>b.disabled));
 }finally{w.happyDOM.abort();}
});
test('R rotates focused seating and a plant moves with the same keyboard controls',()=>{
 const w=setup();try{
  furniture(w);check(w,'plant-thuja-1');submit(w);
  const chair=w.document.querySelector('[data-item-id="item-0"][tabindex]');chair.dispatchEvent(new w.KeyboardEvent('keydown',{key:'r',bubbles:true}));
  assert.match(w.document.querySelector('[data-item-id="item-0"][tabindex]').getAttribute('aria-label'),/facing 90 degrees/);
  const plant=w.document.querySelector('[data-item-id="plant-thuja-1"][tabindex]');plant.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
  assert.match(w.document.querySelector('[data-item-id="plant-thuja-1"][tabindex]').getAttribute('aria-label'),/0, 0.25 ft/);
 }finally{w.happyDOM.abort();}
});
test('plant checkboxes add a mixed selection without count or type menus',()=>{
 const w=setup();try{
  check(w,'plant-thuja-1');check(w,'plant-thuja-2');
  w.document.getElementById('plant-thuja-2').checked=false;check(w,'plant-leafy-1');submit(w);
  assert.ok(w.document.querySelector('[aria-label^="Potted thuja 1"]'));assert.ok(w.document.querySelector('[aria-label^="Potted leafy plant 2"]'));assert.equal(w.document.getElementById('plant-count'),null);assert.equal(w.document.getElementById('seat-width'),null);
 }finally{w.happyDOM.abort();}
});
test('dragging across another piece does not flash errors and invalid release restores position',()=>{
 const w=setup();try{
  furniture(w);submit(w);const scene=w.document.querySelector('.scene-container'),face=scene.querySelector('[data-item-id="item-0"]');
  const scale=Number(scene.querySelector('svg').getAttribute('data-projection-scale'));
  face.dispatchEvent(new w.PointerEvent('pointerdown',{bubbles:true,button:0,clientX:100,clientY:100,pointerId:1}));
  scene.dispatchEvent(new w.PointerEvent('pointermove',{bubbles:true,clientX:100+2.5*.8*scale,clientY:100+2.5*.38*scale,pointerId:1}));
  assert.equal(w.document.getElementById('planner-message').hidden,true);
  assert.match(scene.querySelector('[data-item-id="item-0"][tabindex]').getAttribute('aria-label'),/at 4, 6 ft/);
  scene.dispatchEvent(new w.PointerEvent('pointerup',{bubbles:true,pointerId:1}));
  assert.match(scene.querySelector('[data-item-id="item-0"][tabindex]').getAttribute('aria-label'),/at 1.5, 6 ft/);
  assert.match(w.document.getElementById('planner-message').textContent,/spot is occupied/);
 }finally{w.happyDOM.abort();}
});
test('partial wall length is available without rail or screen and plant bulk setting is absent',()=>{
 const w=setup();try{
  check(w,'left-wall');assert.equal(w.document.getElementById('left-wall-length').disabled,false);
  const length=w.document.getElementById('left-wall-length');length.value='2';length.dispatchEvent(new w.Event('input',{bubbles:true}));submit(w);
  assert.equal(w.document.getElementById('planner-message').hidden,true);assert.ok(w.document.querySelector('[data-feature="wall-left"]'));
  assert.equal(w.document.getElementById('plant-style'),null);
 }finally{w.happyDOM.abort();}
});
test('side A feedback stays on A even when D uses a different screen mode',()=>{
 const w=setup();try{
  check(w,'back-rail');check(w,'left-rail');check(w,'left-screen');
  w.document.getElementById('back-mode').value='above';w.document.getElementById('left-mode').value='full';w.document.getElementById('rail-height').value='5';w.document.getElementById('screen-height').value='3';submit(w);
  assert.equal(w.document.getElementById('back-mode').getAttribute('aria-invalid'),'true');assert.equal(w.document.getElementById('screen-height').getAttribute('aria-invalid'),null);
  assert.match(w.document.getElementById('back-mode-error').textContent,/A · far side/);
  [...w.document.querySelectorAll('#planner-message button')].find(b=>b.textContent==='Cover this railing and the space above').click();
  assert.equal(w.document.getElementById('planner-message').hidden,true);assert.equal(w.document.getElementById('left-mode').value,'full');
 }finally{w.happyDOM.abort();}
});
test('wall choices enable openings; windows move vertically and doors move along the wall, surviving update',()=>{
 const w=setup();try{
  assert.equal(w.document.getElementById('door-1').disabled,true);
  w.document.getElementById('back-screen').checked=false;check(w,'back-wall');check(w,'door-1');check(w,'window-1');submit(w);
  assert.equal(w.document.getElementById('planner-message').hidden,true);
  const window=w.document.querySelector('[data-opening-id="window-1"][tabindex]');window.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));
  assert.match(w.document.querySelector('[data-opening-id="window-1"][tabindex]').getAttribute('aria-label'),/bottom 3.25 ft/);
  const door=w.document.querySelector('[data-opening-id="door-1"][tabindex]');door.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
  submit(w);assert.match(w.document.querySelector('[data-opening-id="window-1"][tabindex]').getAttribute('aria-label'),/bottom 3.25 ft/);
  const reset=[...w.document.querySelectorAll('button')].find(b=>b.textContent==='Reset item positions & directions');reset.click();assert.match(w.document.querySelector('[data-opening-id="window-1"][tabindex]').getAttribute('aria-label'),/bottom 3 ft/);
 }finally{w.happyDOM.abort();}
});
test('pointer movement carries a window along the chosen wall and up its plane',()=>{
 const w=setup();try{
  w.document.getElementById('back-screen').checked=false;check(w,'back-wall');check(w,'window-1');submit(w);
  const scene=w.document.querySelector('.scene-container'),face=scene.querySelector('[data-opening-id="window-1"][tabindex]'),scale=Number(scene.querySelector('svg').getAttribute('data-projection-scale'));
  face.dispatchEvent(new w.PointerEvent('pointerdown',{button:0,clientX:100,clientY:100,pointerId:1,bubbles:true}));
  scene.dispatchEvent(new w.PointerEvent('pointermove',{clientX:100+.8*scale,clientY:100+(.38-.85*.5)*scale,pointerId:1,bubbles:true}));scene.dispatchEvent(new w.PointerEvent('pointerup',{pointerId:1,bubbles:true}));
  assert.match(scene.querySelector('[data-opening-id="window-1"][tabindex]').getAttribute('aria-label'),/1 ft along side, bottom 3.5 ft/);
 }finally{w.happyDOM.abort();}
});
