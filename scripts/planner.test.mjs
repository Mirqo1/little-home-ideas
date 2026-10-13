import test from 'node:test';import assert from 'node:assert/strict';import {planPrivacy} from '../public/assets/privacy-plan.js';
const input={space:'patio',width:7,panelWidth:3,budget:'medium',need:'view',exposure:'sheltered',approved:false};
test('partial modules round up, with explicit surplus',()=>{const p=planPrivacy(input);assert.equal(p.modules,3);assert.equal(p.surplus,2);assert.match(p.summary,/not a purchase or installation plan/);});
test('exposure blocks unqualified product selection',()=>{const p=planPrivacy({...input,exposure:'exposed'});assert.equal(p.restricted,true);assert.equal(p.ideas.length,1);assert.match(p.warning,/Pause/);});
test('balcony requires confirmed restrictions even when sheltered',()=>{assert.equal(planPrivacy({...input,space:'balcony'}).restricted,true);assert.equal(planPrivacy({...input,space:'balcony',approved:true}).restricted,false);});
test('invalid dimensions and preferences do not produce plans',()=>{for(const width of [NaN,Infinity,0,101])assert.ok(planPrivacy({...input,width}).error);assert.ok(planPrivacy({...input,panelWidth:0}).error);assert.ok(planPrivacy({...input,space:'roof'}).error);});
test('fractional dimensions keep a readable remainder',()=>{assert.equal(planPrivacy({...input,width:6.5,panelWidth:2.5}).surplus,1);});
