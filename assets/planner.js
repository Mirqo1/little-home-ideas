import {planPrivacy} from './privacy-plan.js?v=decimals-20261014';
const form=document.getElementById('privacy-form'),out=document.getElementById('results'),empty=out.innerHTML;
const dollars=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
const decimalInputs=[...form.querySelectorAll('input[inputmode="decimal"]')];
const num=id=>{
 const value=document.getElementById(id).value.trim();
 return /^(?:[0-9]+(?:[.,][0-9]+)?|[.,][0-9]+)$/.test(value)?Number(value.replace(',','.')):NaN;
};
function validateDecimals(){
 for(const input of decimalInputs){
  input.setCustomValidity('');
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
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function svgElement(tag,attrs,text){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text)e.textContent=text;return e;}
function sketch(p){
 const svg=svgElement('svg',{viewBox:'0 0 960 620',role:'img','aria-labelledby':'plan-sketch-title plan-sketch-desc',class:'plan-sketch'});
 svg.append(svgElement('title',{id:'plan-sketch-title'},'Your outdoor boundary and example screening width'),svgElement('desc',{id:'plan-sketch-desc'},`${p.patioWidth} by ${p.depth} feet. Target: ${p.width} feet. Example modules cover ${p.coverage} feet. ${p.fits?'The example width fits within the boundary.':'The example width extends beyond the boundary.'} No support footprints or structural capacity are assessed.`));
 const scale=Math.min(700/Math.max(p.patioWidth,p.coverage),300/p.depth),x=120,y=185,w=p.patioWidth*scale,h=p.depth*scale;
 svg.append(svgElement('rect',{x:0,y:0,width:960,height:620,fill:'#f8f5ee',rx:14}));
 svg.append(svgElement('text',{x:120,y:65,fill:'#284634','font-size':26,'font-family':'sans-serif'},'Your paper layout'));
 svg.append(svgElement('rect',{x,y,width:w,height:h,fill:'#e7ece0',stroke:'#83967b','stroke-width':2}));
 for(let i=0;i<p.modules;i++){const mx=x+i*p.panelWidth*scale;svg.append(svgElement('rect',{x:mx,y:y-20,width:Math.max(1,p.panelWidth*scale-2),height:20,fill:p.restricted?'#b9bcb2':p.fits?'#56764d':'#a47748'}));}
 svg.append(svgElement('line',{x1:x,y1:y-51,x2:x+p.width*scale,y2:y-51,stroke:'#284634','stroke-width':2}));
 svg.append(svgElement('text',{x,y:y-74,fill:'#284634','font-size':20,'font-family':'sans-serif'},`Screening target: ${p.width} ft · height to research: ${p.height} ft`));
 svg.append(svgElement('text',{x,y:y+h+36,fill:'#53634b','font-size':20,'font-family':'sans-serif'},`Outdoor area: ${p.patioWidth} × ${p.depth} ft`));
 svg.append(svgElement('text',{x:120,y:553,fill:'#53634b','font-size':16,'font-family':'sans-serif'},p.restricted?'Gray modules are a geometry example only; product selection is paused.':`${p.modules} example modules · ${p.coverage} ft coverage · supports not included`));
 svg.append(svgElement('text',{x:120,y:584,fill:'#53634b','font-size':15,'font-family':'sans-serif'},'Plan view at a consistent scale. Not an engineered installation drawing.'));
 return svg;
}
function makeText(p){return ['LITTLE HOME IDEAS — PATIO PRIVACY WORKSHEET',`Space: ${p.space}; outdoor area: ${p.patioWidth} × ${p.depth} ft`,`Target screening: ${p.width} ft wide × ${p.height} ft high`,'',p.title,p.detail,'',p.summary,`Fits within outdoor width: ${p.fits?'Yes, geometrically; support footprints still need checking.':'No.'}`,p.total===null?'No cost estimate entered.':`Your entered module price: ${dollars(p.modulePrice)}; extras: ${dollars(p.extraCost)}; arithmetic total: ${dollars(p.total)} (not a live quote).`,'','ALTERNATIVES',...p.alternatives.map(x=>'- '+x),'','BEFORE YOU BUY',...p.checklist.map(x=>'- '+x),'',p.warning,'','Guide: https://littlehomeideas.com/articles/patio-privacy-ideas-for-renters/'].join('\n');}
function download(p){const url=URL.createObjectURL(new Blob([makeText(p)],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='patio-privacy-worksheet.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
form.addEventListener('submit',e=>{
 e.preventDefault();validateDecimals();if(!form.reportValidity())return;
 const rawPrice=document.getElementById('module-price').value.trim();
 const p=planPrivacy({space:document.getElementById('space').value,width:num('width'),patioWidth:num('patio-width'),depth:num('depth'),height:num('screen-height'),panelWidth:num('panel-width'),budget:document.getElementById('budget').value,need:document.getElementById('need').value,exposure:document.getElementById('exposure').value,approved:document.getElementById('approved').checked,modulePrice:rawPrice===''?null:num('module-price'),extraCost:num('extra-cost')});
 out.replaceChildren();
 if(p.error){out.append(el('p',p.error,'form-error'));out.focus();return;}
 out.append(el('p',p.restricted?'Check restrictions before selecting products':'Your recommended starting approach','eyebrow'),el('h3',p.title),el('p',p.detail));
 out.append(sketch(p));
 const metrics=el('div',undefined,'plan-metrics');for(const [value,label] of [[p.modules,'Example modules'],[p.coverage+' ft','Example coverage'],[p.surplus+' ft','Beyond target']]){const m=el('div');m.append(el('strong',String(value)),el('span',label));metrics.append(m);}out.append(metrics,el('p',p.summary,'small'));
 if(!p.fits)out.append(el('p','This example count extends beyond the outdoor boundary. Change module width or target before shopping.','form-error'));
 out.append(el('h3','Your next steps'));const checklist=el('ol');p.checklist.forEach(t=>checklist.append(el('li',t)));out.append(checklist);
 out.append(el('h3','Other approaches to compare'));const alternatives=el('ul');p.alternatives.forEach(t=>alternatives.append(el('li',t)));out.append(alternatives);
 if(p.total!==null){out.append(el('h3','Estimate using your own prices'),el('p',`${p.modules} × ${dollars(p.modulePrice)} + ${dollars(p.extraCost)} = ${dollars(p.total)}`,'plan-cost'),el('p','Arithmetic only, based on the values you entered. Add any omitted supports, delivery, or taxes. For plants or layout-only changes, the module estimate may not apply.','small'));}
 out.append(el('p',p.warning,'notice'));
 const actions=el('div',undefined,'plan-actions');const save=el('button','Save worksheet','button');save.type='button';save.addEventListener('click',()=>download(p));const print=el('button','Print plan','button secondary');print.type='button';print.addEventListener('click',()=>window.print());actions.append(save,print);out.append(actions,el('p','Saved worksheets are downloaded to your device. No answers are sent to us.','small'));
 out.focus();
});
form.addEventListener('reset',()=>{for(const input of decimalInputs)input.setCustomValidity('');out.innerHTML=empty;});
