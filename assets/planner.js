import {planPrivacy} from './privacy-plan.js?v=spatial-20261014';
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
function sketch(p,preview=false){
 const svg=svgElement('svg',{viewBox:'0 0 960 650',role:'img','aria-labelledby':preview?'preview-title preview-desc':'plan-sketch-title plan-sketch-desc',class:preview?'plan-preview':'plan-sketch'});
 const titleId=preview?'preview-title':'plan-sketch-title',descId=preview?'preview-desc':'plan-sketch-desc';
 svg.append(svgElement('title',{id:titleId},preview?'Example patio in a 3D view':'Your patio and screening in a 3D view'),svgElement('desc',{id:descId},`${p.patioWidth} by ${p.depth} feet. Target: ${p.width} feet, ${p.height} feet high. ${p.modules} example modules cover ${p.coverage} feet. ${p.fits?'Example modules fit within the outdoor width.':'Example modules extend beyond the outdoor width.'} A projected geometry illustration; supports and structural capacity are not assessed.`));
 const raw=(x,y,z=0)=>[.8*(x-y),.38*(x+y)-.85*z];
 const corners=[[0,0,0],[p.patioWidth,0,0],[p.patioWidth,p.depth,0],[0,p.depth,0],[0,0,p.height],[p.coverage,0,p.height],[p.coverage,0,0]].map(q=>raw(...q));
 const xs=corners.map(q=>q[0]),ys=corners.map(q=>q[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const scale=Math.min(690/(maxX-minX),385/(maxY-minY));
 const offsetX=(960-(maxX-minX)*scale)/2-minX*scale,offsetY=120-minY*scale;
 const point=(x,y,z=0)=>{const q=raw(x,y,z);return [q[0]*scale+offsetX,q[1]*scale+offsetY];};
 const polygon=(coords,attrs)=>svgElement('polygon',{points:coords.map(q=>point(...q).join(',')).join(' '),...attrs});
 const line=(a,b,attrs)=>{const u=point(...a),v=point(...b);return svgElement('line',{x1:u[0],y1:u[1],x2:v[0],y2:v[1],...attrs});};
 const label=(q,text,dx=0,dy=0)=>{const [x,y]=point(...q);svg.append(svgElement('text',{x:x+dx,y:y+dy,fill:'#294b3c','font-size':18,'font-family':'Arial,sans-serif','text-anchor':'middle'},text));};
 svg.append(svgElement('rect',{x:0,y:0,width:960,height:650,fill:'#f7f5ef',rx:8}));
 svg.append(svgElement('text',{x:35,y:43,fill:'#294b3c','font-size':23,'font-family':'Arial,sans-serif'},preview?'An example to help you get started':'Your spatial layout'));
 svg.append(svgElement('text',{x:35,y:72,fill:'#647067','font-size':15,'font-family':'Arial,sans-serif'},'3D view · one straight boundary · measurements in feet'));
 // Draw the floor first, then the vertical screen at the back boundary.
 svg.append(polygon([[0,0],[p.patioWidth,0],[p.patioWidth,p.depth],[0,p.depth]],{fill:'#e3e8dc',stroke:'#a1b09b','stroke-width':2}));
 for(let i=1;i<5;i++){
  svg.append(line([p.patioWidth*i/5,0],[p.patioWidth*i/5,p.depth],{stroke:'#cad3c3','stroke-width':1}),line([0,p.depth*i/5],[p.patioWidth,p.depth*i/5],{stroke:'#cad3c3','stroke-width':1}));
 }
 const fill=p.restricted?'#aeb5af':p.fits?'#6f9379':'#bf9360';
 for(let i=0;i<p.modules;i++){
  const left=i*p.panelWidth,right=(i+1)*p.panelWidth;
  svg.append(polygon([[left,0],[right,0],[right,0,p.height],[left,0,p.height]],{fill,'fill-opacity':.88,stroke:'#ffffff','stroke-width':1.5}));
  // Decorative seams are only visual cues, never specified product components.
  for(let j=1;j<4;j++)svg.append(line([left,0,p.height*j/4],[right,0,p.height*j/4],{stroke:'#ffffff','stroke-opacity':.28,'stroke-width':1}));
 }
 svg.append(line([0,0,p.height],[p.width,0,p.height],{stroke:'#294b3c','stroke-width':3,'stroke-dasharray':'7 5'}));
 label([p.width/2,0,p.height],`Target ${p.width} ft` ,0,-45);
 label([p.patioWidth/2,p.depth],`Outdoor width ${p.patioWidth} ft`,0,50);
 label([0,p.depth/2],`Depth ${p.depth} ft`,-65,-10);
 label([p.coverage,0,p.height/2],`${p.height} ft high`,65,0);
 svg.append(svgElement('text',{x:35,y:585,fill:'#53634b','font-size':17,'font-family':'Arial,sans-serif'},`${p.modules} × ${p.panelWidth} ft modules = ${p.coverage} ft coverage`));
 svg.append(svgElement('text',{x:35,y:617,fill:'#647067','font-size':15,'font-family':'Arial,sans-serif'},p.restricted?'Gray = geometry only. Resolve site restrictions before selecting screens.':'Illustrative modules. Supports, gaps, and installation requirements are not modeled.'));
 return svg;
}
const preview=document.getElementById('planner-preview');
if(preview)preview.append(sketch({patioWidth:10,depth:8,width:6,height:6,panelWidth:3,modules:2,coverage:6,fits:true,restricted:false},true));
empty=out.innerHTML;
function makeText(p){return ['LITTLE HOME IDEAS — PATIO PRIVACY WORKSHEET',`Space: ${p.space}; outdoor area: ${p.patioWidth} × ${p.depth} ft`,`Target screening: ${p.width} ft wide × ${p.height} ft high`,'',p.title,p.detail,'',p.summary,`Fits within outdoor width: ${p.fits?'Yes, geometrically; support footprints still need checking.':'No.'}`,p.total===null?'No cost estimate entered.':`Your entered module price: ${dollars(p.modulePrice)}; extras: ${dollars(p.extraCost)}; arithmetic total: ${dollars(p.total)} (not a live quote).`,'','ALTERNATIVES',...p.alternatives.map(x=>'- '+x),'','BEFORE YOU BUY',...p.checklist.map(x=>'- '+x),'',p.warning,'','Guide: https://littlehomeideas.com/articles/patio-privacy-ideas-for-renters/'].join('\n');}
function download(p){const url=URL.createObjectURL(new Blob([makeText(p)],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='patio-privacy-worksheet.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
form.addEventListener('submit',e=>{
 e.preventDefault();validateDecimals();if(!form.reportValidity())return;
 const rawPrice=document.getElementById('module-price').value.trim();
 const p=planPrivacy({space:document.getElementById('space').value,width:num('width'),patioWidth:num('patio-width'),depth:num('depth'),height:num('screen-height'),panelWidth:num('panel-width'),budget:'medium',need:document.getElementById('need').value,exposure:document.getElementById('exposure').value,approved:document.getElementById('approved').checked,modulePrice:rawPrice===''?null:num('module-price'),extraCost:num('extra-cost')});
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
