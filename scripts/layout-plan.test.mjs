import test from 'node:test';
import assert from 'node:assert/strict';
import {planLayout,moveFurniture,overlaps} from '../public/assets/layout-plan.js';
import {floorDelta} from '../public/assets/furniture-controls.js';
const sides=['back','right','front','left'];
const base={space:'patio',patioWidth:10,depth:8,height:6,panelWidth:3,furniture:'none'};
const boundaries=(changes={})=>sides.map(side=>({side,wall:false,rail:false,screen:side==='back',mode:'full',screenWidth:side==='back'?6:null,...changes[side]}));
test('module rounding is per side and mixed sides leave exactly the remaining railing section',()=>{
 const p=planLayout({...base,wallHeight:8,railHeight:3.5,boundaries:boundaries({back:{rail:true},left:{wall:true,rail:true,screen:true,wallLength:2,wallAt:'end',mode:'above',screenWidth:4.5}})});
 assert.equal(p.modules,4);assert.equal(p.coverage,12);assert.equal(p.screens[1].span,2.5);
 assert.deepEqual(p.wallSegments[0],{side:'left',start:6,end:8,height:8});assert.equal(p.railSegments[1].end,6);
 assert.equal(p.screens[1].start,0);assert.equal(p.screens[1].available,6);
});
test('mixed sections validate length, screen location and roof without changing geometry by space type',()=>{
 for(const length of [0,10,NaN])assert.match(planLayout({...base,wallHeight:8,railHeight:3.5,boundaries:boundaries({back:{wall:true,rail:true,wallLength:length}})}).error,/wall length/);
 assert.equal(planLayout({...base,boundaries:boundaries({back:{mode:'above'}})}).screens[0].base,0);
 assert.match(planLayout({...base,hasRoof:true,roofHeight:5,boundaries:boundaries()}).error,/roof/);
 const p=planLayout({...base,boundaries:boundaries()}),b=planLayout({...base,space:'balcony',boundaries:boundaries()});
 assert.deepEqual(p.screens,b.screens);assert.match(b.warning,/permitted loads/);
});
test('movement clamps to floor, rejects overlap, and retains full-size footprints',()=>{
 const p=planLayout({...base,furniture:'bistro',boundaries:boundaries()});
 const edge=moveFurniture(p.items,'item-0',-10,-10,10,8);
 assert.equal(edge.items[0].x,0);assert.equal(edge.items[0].y,0);assert.equal(edge.items[0].w,2);
 const collide=moveFurniture(p.items,'item-0',p.items[1].x,p.items[1].y,10,8);assert.match(collide.error,/overlap/);
 assert.ok(!p.items.some((a,i)=>p.items.some((b,j)=>j>i&&overlaps(a,b))));
 const changed=planLayout({...base,patioWidth:7,furniture:'bistro',items:p.items,boundaries:boundaries()});assert.match(changed.error,/no longer fits/);
});
test('screen drag deltas invert the isometric projection across display sizes',()=>{
 const svg={getBoundingClientRect:()=>({width:480,height:370}),getAttribute:()=>20};
 const d=floorDelta(svg,8,3.8);assert.ok(Math.abs(d.x-1)<1e-9);assert.ok(Math.abs(d.y)<1e-9);
});
test('panel count overflow is a review note while the requested layout remains valid',()=>{
 const p=planLayout({...base,boundaries:boundaries({left:{screen:true,screenWidth:null}})});
 assert.equal(p.error,undefined);assert.match(p.reviewNotes[0],/D.*3 whole panels.*9 ft.*8 ft/);
 assert.equal(p.screens[1].width,8);
 const layout=planLayout({...base,estimatePanels:false,panelWidth:NaN,boundaries:boundaries({left:{screen:true,screenWidth:null}})});
 assert.equal(layout.error,undefined);assert.equal(layout.reviewNotes.length,0);assert.equal(layout.fits,true);
});
test('a roof without any screen can be drawn below the old screen-height setting',()=>{
 const p=planLayout({...base,hasRoof:true,roofHeight:5,boundaries:boundaries({back:{screen:false}})});
 assert.equal(p.error,undefined);assert.equal(p.screens.length,0);assert.equal(p.roofHeight,5);
});
