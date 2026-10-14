import test from 'node:test';import assert from 'node:assert/strict';import {Window} from 'happy-dom';
import {parseGaps,screenPieces} from '../public/assets/screen-pieces.js';import {planLayout,rotateFurniture,moveFurniture} from '../public/assets/layout-plan.js';import {privacyScene} from '../public/assets/privacy-scene.js';
const options={space:'patio',patioWidth:16,depth:10,height:6,estimatePanels:false,furniture:'none',boundaries:['back','right','front','left'].map(side=>({side,wall:false,rail:false,screen:side==='back',mode:'full',screenWidth:null,pieceWidth:side==='back'?3:null,gaps:side==='back'?[.5,.25]:[0]}))};
test('gap parsing accepts cm inches and decimal commas, rejecting malformed lists',()=>{
 assert.ok(Math.abs(parseGaps('15','cm').gaps[0]-15/30.48)<1e-9);assert.deepEqual(parseGaps('6; 3,5; 0','in').gaps,[.5,3.5/12,0]);
 for(const text of ['-1','6;','1;bad','100000'])assert.ok(parseGaps(text).error);
});
test('regular and uneven gaps affect material count without treating open space as coverage',()=>{
 const p=screenPieces(12,3,[.5,.25]);assert.deepEqual(p.segments.map(s=>s.start),[0,3.5,6.75,10]);assert.equal(p.modules,4);assert.equal(p.gapWidth,1);assert.equal(p.materialWidth,11);assert.equal(p.surplus,1);assert.equal(p.lastPanel,2);
 const exact=screenPieces(10,3,[.5,.25]);assert.equal(exact.modules,3);assert.equal(exact.materialWidth,9);assert.equal(exact.gapWidth,1);assert.equal(exact.surplus,0);
 const endGap=screenPieces(3.2,3,[.5]);assert.equal(endGap.modules,1);assert.equal(endGap.gapWidth,.2);
});
test('gaps draw separate polygons even without product estimating and never connect the gaps',()=>{
 const p=planLayout(options);assert.equal(p.error,undefined);assert.ok(p.screens[0].gapWidth>0);
 const w=new Window();try{const svg=privacyScene(w.document,p),pieces=[...svg.querySelectorAll('[data-feature="screen"]')];assert.equal(pieces.length,p.screens[0].modules);assert.ok(Number(pieces[1].getAttribute('data-piece-start'))>Number(pieces[0].getAttribute('data-piece-width')));assert.match(svg.textContent,/privacy is partial/);}finally{w.happyDOM.abort();}
});
test('extra furniture pieces fit, move and rotate with stable IDs and retain their poses',()=>{
 const p=planLayout({...options,extras:['bench','lounger','side-table','storage']});assert.equal(p.error,undefined);assert.equal(p.items.length,4);
 const isolated=planLayout({...options,extras:['lounger']});const r=rotateFurniture(isolated.items,'extra-lounger',16,10);assert.equal(r.items[0].w,5);assert.equal(r.items[0].d,2);
 const m=moveFurniture(r.items,'extra-lounger',6,5,16,10);const restored=planLayout({...options,extras:['lounger'],poses:m.items});assert.equal(restored.items[0].rotation,90);assert.equal(restored.items[0].x,6);
});
test('opening fill is highly transparent while keeping an interactive outline',()=>{
 const p=planLayout({...options,wallHeight:8,boundaries:options.boundaries.map(b=>({...b,wall:b.side==='back',wallLength:16,screen:false})),openings:[{id:'door-1',kind:'door',side:'back'},{id:'window-1',kind:'window',side:'back'}]});
 const w=new Window();try{const svg=privacyScene(w.document,p);for(const feature of ['door','window']){const face=svg.querySelector('[data-feature="'+feature+'"]');assert.ok(Number(face.getAttribute('fill-opacity'))<.1);assert.equal(face.getAttribute('tabindex'),'0');}}finally{w.happyDOM.abort();}
});
