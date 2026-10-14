import test from 'node:test';
import assert from 'node:assert/strict';
import {wallOpenings,moveOpening,openingDelta} from '../public/assets/wall-openings.js';
import {planLayout} from '../public/assets/layout-plan.js';
import {privacyScene} from '../public/assets/privacy-scene.js';
import {Window} from 'happy-dom';
const walls=[{side:'back',start:2,end:12,height:8}];
const requests=[{id:'door-1',kind:'door',side:'back'},{id:'window-1',kind:'window',side:'back'}];
test('door and window fit a partial wall without overlapping and preserve moved positions',()=>{
 const p=wallOpenings(requests,walls);assert.equal(p.error,undefined);assert.equal(p.openings[0].start,2);assert.equal(p.openings[1].start,5);
 const moved=moveOpening(p.openings,'window-1',8,4,walls);assert.equal(moved.openings[1].start,8);assert.equal(moved.openings[1].bottom,4);
 const restored=wallOpenings(requests,walls,moved.openings);assert.deepEqual(restored.openings,moved.openings);
 const invalid=wallOpenings(requests,[{...walls[0],end:7}],moved.openings);assert.equal(invalid.action,'reset-openings');
});
test('openings clamp to wall bounds, doors stay at floor level, overlaps work without mutation',()=>{
 const p=wallOpenings(requests,walls),before=JSON.stringify(p.openings);
 const door=moveOpening(p.openings,'door-1',-20,4,walls);assert.equal(door.openings[0].start,2);assert.equal(door.openings[0].bottom,0);
 assert.equal(moveOpening(p.openings,'window-1',2,0,walls).openings[1].start,2);assert.equal(JSON.stringify(p.openings),before);
 assert.ok(moveOpening(p.openings,'window-1',2,0,walls,true).openings);
 assert.match(wallOpenings([{id:'door-1',kind:'door',side:'left'}],walls).error,/existing wall/);
});
test('a narrow tall wall can place a window above the door; malformed saved poses are rejected',()=>{
 const tall=[{side:'back',start:0,end:3,height:12}],p=wallOpenings(requests,tall);
 assert.equal(p.error,undefined);assert.equal(p.openings[1].bottom,6.5);
 assert.ok(wallOpenings(requests,walls,[{...wallOpenings(requests,walls).openings[0],start:NaN}]).error);
});
test('wall pointer delta resolves movement on all four projected wall planes',()=>{
 const svg={getBoundingClientRect:()=>({width:480,height:370}),getAttribute:()=>20};
 for(const side of ['back','front','right','left']){const dx=(side==='back'||side==='front'?1:-1)*.8*20*.5,dy=(.38-.85*.5)*20*.5;
  const d=openingDelta(svg,side,dx,dy);assert.ok(Math.abs(d.start-1)<1e-9);assert.ok(Math.abs(d.bottom-.5)<1e-9);
 }
});
test('door and window markers are keyboard accessible and hidden with walls',()=>{
 const w=new Window();try{
  const plan={patioWidth:12,depth:8,height:6,estimatePanels:false,roofHeight:null,walls:['back'],wallHeight:8,wallSegments:walls,screens:[],items:[],openings:wallOpenings(requests,walls).openings};
  const svg=privacyScene(w.document,plan);assert.equal(svg.querySelectorAll('[data-opening-id][tabindex]').length,2);assert.ok(svg.querySelector('[data-feature="door"]'));assert.ok(svg.querySelector('[data-feature="window"]'));
  assert.equal(privacyScene(w.document,plan,false,{showWalls:false}).querySelectorAll('[data-opening-id]').length,0);
 }finally{w.happyDOM.abort();}
});
test('1.2 ft panels round separately for 3 ft and 7 ft and never pool offcuts',()=>{
 const base={space:'patio',patioWidth:10,depth:8,height:6,estimatePanels:true,panelWidth:1.2,furniture:'none',boundaries:['back','right','front','left'].map(side=>({side,wall:false,rail:false,screen:['back','left'].includes(side),mode:'full',screenWidth:side==='back'?3:7}))};
 const p=planLayout(base);assert.equal(p.modules,9);assert.deepEqual(p.screens.map(s=>s.modules),[3,6]);assert.deepEqual(p.screens.map(s=>s.surplus),[.6,.2]);assert.deepEqual(p.screens.map(s=>s.lastPanel),[.6,1]);
 const poolingTrap=planLayout({...base,boundaries:base.boundaries.map(b=>({...b,screenWidth:1.3}))});assert.equal(poolingTrap.modules,4);
 const exact=planLayout({...base,boundaries:base.boundaries.map(b=>({...b,screenWidth:3.6}))});assert.deepEqual(exact.screens.map(s=>s.modules),[3,3]);
});

test('all camera views resolve wall dragging and the chest has all four vertical faces',()=>{
 for(const angle of [0,90,180,270])for(const side of ['back','right','front','left']){
  const cos=Math.cos(angle*Math.PI/180),sin=Math.sin(angle*Math.PI/180),horizontal=['back','front'].includes(side),u=horizontal?cos:-sin,v=horizontal?sin:cos;
  const svg={getBoundingClientRect:()=>({width:960,height:640}),getAttribute:k=>({'viewBox':'0 0 960 640','data-projection-scale':'30','data-view-angle':String(angle)})[k]};
  const delta=openingDelta(svg,side,.8*(u-v)*30,(.38*(u+v)-.85*.5)*30);assert.ok(Math.abs(delta.start-1)<1e-8);assert.ok(Math.abs(delta.bottom-.5)<1e-8);
 }
 const w=new Window();try{
  const p=planLayout({space:'patio',patioWidth:10,depth:8,height:6,panelWidth:3,furniture:'none',extras:['storage'],boundaries:['back','right','front','left'].map(side=>({side,screen:false}))});
  const svg=privacyScene(w.document,p,false,{viewAngle:180});assert.equal(svg.querySelectorAll('[data-item-id="extra-storage"]').length,6);assert.ok(svg.querySelector('[data-feature="storage-back"]'));assert.ok(svg.querySelector('[data-feature="storage-left"]'));
 }finally{w.happyDOM.abort();}
});
