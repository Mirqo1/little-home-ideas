import {privacyScene} from './privacy-scene.js?v=room-20261014';
import {planPrivacy} from './privacy-plan.js?v=room-20261014';
const form=document.getElementById('privacy-form'),out=document.getElementById('results');
let empty;
const dollars=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
const decimalInputs=[...form.querySelectorAll('input[inputmode="decimal"]')];
const num=id=>{
 const value=document.getElementById(id).value.trim();
 return /^(?:[0-9]+(?:[.,][0-9]+)?|[.,][0-9]+)$/.test(value)?Number(value.replace(',','.')):NaN;
};
function validateDecimals(){
 for(const input of decimalInputs){
  input.setCustomValidity('');
  if(input.disabled)continue;
  if(input.value.trim()===''){
   if(input.required)input.setCustomValidity('Enter a measurement.');
   continue;
  }
  const value=num(input.id),min=Number(input.dataset.min),max=Number(input.dataset.max);
  if(!Number.isFinite(value))input.setCustomValidity('Enter a number using a decimal point or comma, for example 2.16 or 2,16.');
  else if(value<min||value>max)input.setCustomValidity(`Enter a value from ${min} to ${max}.`);
 }
}
for(const input of decimalInputs)input.addEventListener('input',()=>input.setCustomValidity(''));

const selected=name=>[...form.querySelectorAll('input[name="'+name+'"]:checked')].map(x=>x.value);
function syncFields(){
 for(const [id,active] of [['roof-fields',document.getElementById('has-roof').checked],['rail-fields',document.getElementById('has-railing').checked],['wall-fields',selected('wall-side').length>0],['furniture-fields',document.getElementById('furniture').value!=='none']]){
  const group=document.getElementById(id);group.hidden=!active;
  for(const input of group.querySelectorAll('input,select')){input.disabled=!active;if(!active&&input.setCustomValidity)input.setCustomValidity('');}
 }
}
form.addEventListener('change',syncFields);syncFields();

function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
const sketch=(p,preview=false,options)=>privacyScene(document,p,preview,options);
const preview=document.getElementById('planner-preview');
if(preview)preview.append(sketch({patioWidth:10,depth:8,width:6,height:6,panelWidth:3,modules:2,coverage:6,fits:true,restricted:false},true));
empty=out.innerHTML;
function makeText(p){return ['LITTLE HOME IDEAS — PATIO PRIVACY WORKSHEET',`Space: ${p.space}; outdoor area: ${p.patioWidth} × ${p.depth} ft`,`Target screening: ${p.width} ft wide × ${p.height} ft high`,'','Screen side: '+p.screenSide+'; base: '+p.screenBase+' ft; screen span: '+p.screenSpan+' ft','Roof underside: '+(p.roofHeight??'none')+'; rail height: '+(p.railHeight??'none')+'; rail sides: '+(p.railSides.join(', ')||'none'),'Walls: '+(p.walls.join(', ')||'none')+'; wall height: '+(p.wallHeight??'none'),'Furniture: '+p.furniture+'; position: '+p.furniturePosition,...p.items.map(i=>i.kind+': '+i.w+' × '+i.d+' ft; x='+i.x+', y='+i.y+' ft'),'',p.title,p.detail,'',p.summary,`Fits within outdoor width: ${p.fits?'Yes, geometrically; support footprints still need checking.':'No.'}`,p.total===null?'No cost estimate entered.':`Your entered module price: ${dollars(p.modulePrice)}; extras: ${dollars(p.extraCost)}; arithmetic total: ${dollars(p.total)} (not a live quote).`,'','ALTERNATIVES',...p.alternatives.map(x=>'- '+x),'','BEFORE YOU BUY',...p.checklist.map(x=>'- '+x),'',p.warning,'','Guide: https://littlehomeideas.com/articles/patio-privacy-ideas-for-renters/'].join('\n');}
function download(p){const url=URL.createObjectURL(new Blob([makeText(p)],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='patio-privacy-worksheet.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
form.addEventListener('submit',e=>{
 e.preventDefault();validateDecimals();if(!form.reportValidity())return;
 const rawPrice=document.getElementById('module-price').value.trim();
 const p=planPrivacy({space:document.getElementById('space').value,width:num('width'),patioWidth:num('patio-width'),depth:num('depth'),height:num('screen-height'),panelWidth:num('panel-width'),budget:'medium',need:document.getElementById('need').value,exposure:document.getElementById('exposure').value,approved:document.getElementById('approved').checked,modulePrice:rawPrice===''?null:num('module-price'),extraCost:num('extra-cost'),screenSide:document.getElementById('screen-side').value,hasRoof:document.getElementById('has-roof').checked,roofHeight:num('roof-height'),walls:selected('wall-side'),wallHeight:num('wall-height'),hasRailing:document.getElementById('has-railing').checked,railSides:selected('rail-side'),railHeight:num('rail-height'),screenMode:document.getElementById('has-railing').checked?document.getElementById('screen-mode').value:'full',furniture:document.getElementById('furniture').value,furniturePosition:document.getElementById('furniture-position').value,seatWidth:num('seat-width'),seatDepth:num('seat-depth'),tableWidth:num('table-width'),tableDepth:num('table-depth')});
 out.replaceChildren();
 if(p.error){out.append(el('p',p.error,'form-error'));out.focus();return;}
 out.append(el('p',p.restricted?'Check restrictions before selecting products':'Your recommended starting approach','eyebrow'),el('h3',p.title),el('p',p.detail));
 const scene=el('div',undefined,'scene-container'),controls=el('div',undefined,'scene-controls');
 const options={showRoof:true,showWalls:true};
 for(const [key,label,active] of [['showRoof','Show roof',p.roofHeight!==null],['showWalls','Show walls',p.walls.length>0]]){
  if(!active)continue;
  const l=el('label'),c=el('input');c.type='checkbox';c.checked=true;l.append(c,document.createTextNode(label));controls.append(l);
  c.addEventListener('change',()=>{options[key]=c.checked;scene.replaceChildren(sketch(p,false,options));});
 }
 scene.append(sketch(p));out.append(controls,scene);
 out.append(el('p','Screening side: '+p.screenSide.toUpperCase()+' · screen starts '+p.screenBase+' ft above floor and is '+p.screenSpan+' ft tall. Roof: '+(p.roofHeight??'none')+'. Railing: '+(p.railHeight??'none')+'.','small'));
 if(p.items.length)out.append(el('p','Furniture arrangement: '+p.furnitureWidth+' × '+p.furnitureDepth+' ft. Walking clearance and door swings still need checking.','small'));
 const metrics=el('div',undefined,'plan-metrics');for(const [value,label] of [[p.modules,'Example modules'],[p.coverage+' ft','Example coverage'],[p.surplus+' ft','Beyond target']]){const m=el('div');m.append(el('strong',String(value)),el('span',label));metrics.append(m);}out.append(metrics,el('p',p.summary,'small'));
 if(!p.fits)out.append(el('p','This example count extends beyond the outdoor boundary. Change module width or target before shopping.','form-error'));
 out.append(el('h3','Your next steps'));const checklist=el('ol');p.checklist.forEach(t=>checklist.append(el('li',t)));out.append(checklist);
 out.append(el('h3','Other approaches to compare'));const alternatives=el('ul');p.alternatives.forEach(t=>alternatives.append(el('li',t)));out.append(alternatives);
 if(p.total!==null){out.append(el('h3','Estimate using your own prices'),el('p',`${p.modules} × ${dollars(p.modulePrice)} + ${dollars(p.extraCost)} = ${dollars(p.total)}`,'plan-cost'),el('p','Arithmetic only, based on the values you entered. Add any omitted supports, delivery, or taxes. For plants or layout-only changes, the module estimate may not apply.','small'));}
 out.append(el('p',p.warning,'notice'));
 const actions=el('div',undefined,'plan-actions');const save=el('button','Save worksheet','button');save.type='button';save.addEventListener('click',()=>download(p));const print=el('button','Print plan','button secondary');print.type='button';print.addEventListener('click',()=>window.print());actions.append(save,print);out.append(actions,el('p','Saved worksheets are downloaded to your device. No answers are sent to us.','small'));
 out.focus();
});
form.addEventListener('reset',()=>{for(const input of decimalInputs)input.setCustomValidity('');out.innerHTML=empty;queueMicrotask(syncFields);});
