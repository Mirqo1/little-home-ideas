import test from 'node:test';
import assert from 'node:assert/strict';
import {planPrivacy} from '../public/assets/privacy-plan.js';
import {privacyScene} from '../public/assets/privacy-scene.js';
import {Window} from 'happy-dom';
const defaults={space:'balcony',width:6,patioWidth:10,depth:8,height:6,panelWidth:3,budget:'medium',need:'view',exposure:'sheltered',approved:true};
test('roof changes geometry without declaring wind shelter',()=>{
 const p=planPrivacy({...defaults,hasRoof:true,roofHeight:8,exposure:'exposed'});
 assert.equal(p.roofHeight,8);assert.equal(p.restricted,true);
 assert.match(planPrivacy({...defaults,hasRoof:true,roofHeight:5}).error,/roof/);
});
test('above-railing coverage uses floor-based top height and rejects missing or taller railing',()=>{
 const p=planPrivacy({...defaults,hasRailing:true,railHeight:3.5,railSides:['back'],screenMode:'above'});
 assert.equal(p.screenBase,3.5);assert.equal(p.screenSpan,2.5);assert.equal(p.modules,2);
 assert.match(planPrivacy({...defaults,screenMode:'above'}).error,/requires a railing/);
 assert.match(planPrivacy({...defaults,hasRailing:true,railHeight:7,screenMode:'above'}).error,/above the railing/);
 const full=planPrivacy({...defaults,hasRailing:true,railHeight:3.5,screenMode:'full'});
 assert.equal(full.screenBase,0);assert.equal(full.screenSpan,6);
});
test('chosen side sets boundary length and rejects conflicts with walls',()=>{
 assert.match(planPrivacy({...defaults,depth:4,screenSide:'left'}).error,/boundary/);
 const p=planPrivacy({...defaults,depth:4,width:3,screenSide:'right'});
 assert.equal(p.boundaryLength,4);assert.equal(p.fits,true);
 assert.match(planPrivacy({...defaults,walls:['back']}).error,/already has a wall/);
 assert.match(planPrivacy({...defaults,walls:['left'],hasRailing:true,railHeight:3.5,railSides:['left']}).error,/both/);
});
test('furniture preserves real footprints, placement and fit checks',()=>{
 const p=planPrivacy({...defaults,furniture:'bistro',furniturePosition:'right',seatWidth:2,seatDepth:2,tableWidth:2,tableDepth:2});
 assert.equal(p.items.length,3);assert.equal(p.furnitureWidth,7);assert.equal(p.items[0].x,3);
 for(const i of p.items){assert.ok(i.x>=0&&i.y>=0&&i.x+i.w<=p.patioWidth&&i.y+i.d<=p.depth);}
 assert.match(planPrivacy({...defaults,patioWidth:6,furniture:'bistro'}).error,/needs 7/);
 assert.match(planPrivacy({...defaults,depth:3,furniture:'bench'}).error,/needs/);
});
test('roof, walls, railing and furniture appear in the SVG and can be peeled away',()=>{
 const p=planPrivacy({...defaults,hasRoof:true,roofHeight:8,walls:['left'],wallHeight:8,hasRailing:true,railHeight:3.5,railSides:['back','right'],screenMode:'above',furniture:'bistro'});
 const w=new Window();
 try{
  const svg=privacyScene(w.document,p);
  assert.equal(svg.querySelectorAll('[data-feature="roof"]').length,1);
  assert.equal(svg.querySelectorAll('[data-feature^="wall-"]').length,1);
  assert.equal(svg.querySelectorAll('[data-feature^="rail-"]').length,2);
  assert.equal(svg.querySelectorAll('[data-feature="chair"]').length,2);
  assert.equal(svg.querySelectorAll('[data-feature="table"]').length,1);
  assert.match(svg.textContent,/Starts 3.5 feet/);
  const hidden=privacyScene(w.document,p,false,{showRoof:false,showWalls:false});
  assert.equal(hidden.querySelectorAll('[data-feature="roof"],[data-feature^="wall-"]').length,0);
  assert.equal(hidden.querySelectorAll('[data-feature="chair"]').length,2);
  assert.doesNotMatch(svg.outerHTML,/NaN|Infinity|undefined/);
 }finally{w.happyDOM.abort();}
});
