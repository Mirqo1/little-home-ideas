import test from 'node:test';
import assert from 'node:assert/strict';
import {planLayout,moveFurniture,rotateFurniture,overlaps} from '../public/assets/layout-plan.js';
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
test('potted plants can be added without furniture and fit around existing pieces',()=>{
 const b=boundaries();
 const p=planLayout({...base,plantCount:2,plantStyle:'thuja',plantWidth:1.5,plantHeight:4,boundaries:b});
 assert.equal(p.items.length,2);assert.equal(p.items[0].kind,'plant');assert.equal(p.items[0].height,4);
 assert.ok(!overlaps(p.items[0],p.items[1]));
 const leafy=planLayout({...base,furniture:'bistro',plantCount:2,plantStyle:'leafy',boundaries:b});
 assert.equal(leafy.items.filter(i=>i.kind==='plant').length,2);
 assert.ok(!leafy.items.some((a,i)=>leafy.items.some((b,j)=>j>i&&overlaps(a,b))));
 assert.match(planLayout({...base,hasRoof:true,roofHeight:3,plantCount:1,plantHeight:4,boundaries:boundaries({back:{screen:false}})}).error,/plant height/);
});
test('rotation swaps a rectangular seating footprint and preserves its pose on recalculation',()=>{
 const p=planLayout({...base,furniture:'bistro',seatWidth:1.5,seatDepth:2.5,boundaries:boundaries()});
 const turned=rotateFurniture(p.items,'item-0',10,8);
 assert.equal(turned.error,undefined);assert.equal(turned.items[0].rotation,90);assert.equal(turned.items[0].w,2.5);assert.equal(turned.items[0].d,1.5);
 const saved=planLayout({...base,furniture:'bistro',seatWidth:1.5,seatDepth:2.5,poses:turned.items,plantCount:2,boundaries:boundaries()});
 assert.equal(saved.error,undefined);assert.equal(saved.items[0].rotation,90);assert.equal(saved.items[0].x,turned.items[0].x);assert.equal(saved.items.filter(i=>i.kind==='plant').length,2);
});
test('an overlapping rotation is rejected without changing the pieces',()=>{
 const items=[{id:'seat',kind:'chair',x:0,y:0,w:1,d:3,baseW:1,baseD:3,rotation:0},{id:'table',kind:'table',x:1.5,y:1,w:1,d:1}];
 const result=rotateFurniture(items,'seat',6,6);
 assert.match(result.error,/overlap/);assert.equal(items[0].rotation,0);assert.equal(items[0].w,1);
 assert.match(rotateFurniture(items,'table',6,6).error,/chair or bench/);
});
test('a wall can occupy the remainder of a screened side without a railing',()=>{
 const p=planLayout({...base,wallHeight:7,boundaries:boundaries({back:{wall:true,rail:false,wallLength:4,wallAt:'end',screenWidth:null}})});
 assert.equal(p.error,undefined);assert.equal(p.screens[0].width,6);assert.equal(p.screens[0].start,0);assert.equal(p.wallSegments[0].start,6);assert.equal(p.railSegments.length,0);
});
test('one layout mixes plant types and transient dragging can pass through occupied footprints',()=>{
 const p=planLayout({...base,furniture:'bistro',plantCount:2,plantStyles:['thuja','leafy'],boundaries:boundaries()});
 assert.equal(p.items[3].plantStyle,'thuja');assert.equal(p.items[4].plantStyle,'leafy');
 const x=p.items[0].x,y=p.items[0].y;
 assert.ok(moveFurniture(p.items,'plant-0',x,y,10,8,true).items);
 assert.match(moveFurniture(p.items,'plant-0',x,y,10,8).error,/overlap/);
});
test('above-railing errors identify the actual side and its setting',()=>{
 const p=planLayout({...base,height:3,railHeight:5,boundaries:boundaries({back:{screen:false},left:{screen:true,rail:true,mode:'above'}})});
 assert.match(p.error,/D · left side/);assert.equal(p.field,'left-mode');assert.equal(p.action,'cover-rail');
});
test('partial walls work with an entirely open remainder',()=>{
 const p=planLayout({...base,wallHeight:7,boundaries:boundaries({back:{screen:false},left:{wall:true,wallLength:2,wallAt:'end'}})});
 assert.equal(p.error,undefined);assert.deepEqual(p.wallSegments,[{side:'left',start:6,end:8,height:7}]);assert.equal(p.railSegments.length,0);assert.equal(p.screens.length,0);
});
