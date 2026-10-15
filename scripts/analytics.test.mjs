import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
const source=readFileSync(new URL('../public/assets/analytics.js',import.meta.url),'utf8');
const key='lhi-analytics-choice-v1',id='G-TEST12345';
function setup({choice,blocked=false,measurementId=id}={}){
 const w=new Window({url:'https://littlehomeideas.com/tools/patio-privacy-planner/?private=value#input'});
 w.document.body.innerHTML=`<button data-analytics-settings>Choices</button><section id="analytics-consent" data-measurement-id="${measurementId}" hidden><button data-analytics-choice="granted">Allow</button><button data-analytics-choice="denied">Reject</button><button data-analytics-close hidden>Close</button></section><p id="analytics-consent-status"></p>`;
 if(choice)w.localStorage.setItem(key,JSON.stringify({choice,expires:Date.now()+100000}));
 if(blocked){w.localStorage.getItem=()=>{throw Error('blocked');};w.localStorage.setItem=()=>{throw Error('blocked');};}
 let reloads=0;w.location.reload=()=>{reloads++;};
 vm.runInNewContext(source,{window:w,document:w.document,location:w.location,localStorage:w.localStorage,URL,Date,Set});
 return {w,reloads:()=>reloads,allow:()=>w.document.querySelector('[data-analytics-choice="granted"]').click(),reject:()=>w.document.querySelector('[data-analytics-choice="denied"]').click()};
}
const calls=w=>(w.dataLayer??[]).map(a=>Array.from(a));
test('no Google tag or measurement event before consent, including rejected and blocked storage',()=>{
 for(const options of [{},{choice:'denied'},{blocked:true}]){
  const s=setup(options);try{s.w.document.dispatchEvent(new s.w.CustomEvent('lhi:analytics',{detail:{name:'planner_complete'}}));s.reject();assert.equal(s.w.document.querySelector('[data-analytics-tag]'),null);assert.equal(calls(s.w).filter(a=>a[0]==='event').length,0);assert.equal(s.w['ga-disable-'+id],true);}finally{s.w.happyDOM.abort();}
 }
});
test('opt-in loads one tag, records one sanitized page view, and keeps advertising denied',()=>{
 const s=setup();try{
  s.allow();s.allow();assert.equal(s.w.document.querySelectorAll('[data-analytics-tag]').length,1);
  const data=calls(s.w),views=data.filter(a=>a[0]==='event'&&a[1]==='page_view');assert.equal(views.length,1);assert.equal(views[0][2].page_location,'https://littlehomeideas.com/tools/patio-privacy-planner/');
  assert.ok(data.filter(a=>a[0]==='consent').every(a=>a[2].ad_storage==='denied'&&a[2].ad_user_data==='denied'&&a[2].ad_personalization==='denied'));
  assert.equal(JSON.parse(s.w.localStorage.getItem(key)).choice,'granted');
 }finally{s.w.happyDOM.abort();}
});
test('only permitted planner events are forwarded and arbitrary supplied data is discarded',()=>{
 const s=setup({choice:'granted'});try{
  for(const name of ['planner_start','planner_complete','planner_save','planner_print','secret_event'])s.w.document.dispatchEvent(new s.w.CustomEvent('lhi:analytics',{detail:{name,params:{email:'private@example.test',width:12}}}));
  const events=calls(s.w).filter(a=>a[0]==='event');assert.equal(events.length,5);assert.ok(!JSON.stringify(events).includes('private@example'));assert.ok(!JSON.stringify(events).includes('"width"'));assert.ok(!events.some(a=>a[1]==='secret_event'));
 }finally{s.w.happyDOM.abort();}
});
test('withdrawing consent disables collection, clears GA cookies, stores denial, and reloads',()=>{
 const s=setup({choice:'granted'});try{
  s.w.document.cookie='_ga=old; path=/';s.w.document.cookie='_ga_TEST12345=old; path=/';s.w.document.querySelector('[data-analytics-settings]').click();assert.equal(s.w.document.getElementById('analytics-consent').hidden,false);
  s.reject();assert.equal(s.w['ga-disable-'+id],true);assert.equal(s.reloads(),1);assert.equal(JSON.parse(s.w.localStorage.getItem(key)).choice,'denied');assert.doesNotMatch(s.w.document.cookie,/_ga/);
 }finally{s.w.happyDOM.abort();}
});
test('missing or malformed measurement IDs cannot initialize analytics',()=>{
 for(const measurementId of ['','GTM-TEST','https://example.test']){const s=setup({measurementId,choice:'granted'});try{assert.equal(s.w.document.querySelector('[data-analytics-tag]'),null);assert.equal(s.w.dataLayer,undefined);}finally{s.w.happyDOM.abort();}}
});
