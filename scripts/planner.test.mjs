import test from 'node:test';import assert from 'node:assert/strict';import {planPrivacy} from '../public/assets/privacy-plan.js';
const input={space:'patio',width:7,panelWidth:3,budget:'medium',need:'view',exposure:'sheltered',approved:false};
test('partial modules round up, with explicit surplus',()=>{const p=planPrivacy(input);assert.equal(p.modules,3);assert.equal(p.surplus,2);assert.match(p.summary,/not a purchase or installation plan/);});
test('exposure blocks unqualified product selection',()=>{const p=planPrivacy({...input,exposure:'exposed'});assert.equal(p.restricted,true);assert.match(p.title,/seating layout/);assert.match(p.warning,/selection is paused/);assert.ok(p.alternatives.every(x=>!x.includes('Compare a suitable manufactured screen')));});
test('balcony requires confirmed restrictions even when sheltered',()=>{assert.equal(planPrivacy({...input,space:'balcony'}).restricted,true);assert.equal(planPrivacy({...input,space:'balcony',approved:true}).restricted,false);});
test('invalid dimensions and preferences do not produce plans',()=>{for(const width of [NaN,Infinity,0,101])assert.ok(planPrivacy({...input,width}).error);assert.ok(planPrivacy({...input,panelWidth:0}).error);assert.ok(planPrivacy({...input,space:'roof'}).error);});
test('fractional dimensions keep a readable remainder',()=>{assert.equal(planPrivacy({...input,width:6.5,panelWidth:2.5}).surplus,1);});

test('screening target cannot exceed the measured boundary',()=>{assert.match(planPrivacy({...input,patioWidth:5}).error,/cannot be wider/);});
test('module surplus beyond the space gets an explicit fit warning',()=>{const p=planPrivacy({...input,patioWidth:8});assert.equal(p.fits,false);assert.match(p.checklist[0],/exceed the outdoor width/);});
test('optional costs use only entered values and include extras',()=>{const p=planPrivacy({...input,patioWidth:10,modulePrice:49.95,extraCost:25});assert.equal(p.total,174.85);assert.equal(planPrivacy({...input,modulePrice:null}).total,null);assert.ok(planPrivacy({...input,modulePrice:-1}).error);});
test('a low budget starts with existing items, not invented product prices',()=>{assert.match(planPrivacy({...input,budget:'low'}).title,/no-purchase/);});
test('greenery and flexible screening produce distinct starting approaches',()=>{assert.match(planPrivacy({...input,need:'green'}).title,/container-plant/);assert.match(planPrivacy({...input,need:'flex'}).title,/removable/);});
