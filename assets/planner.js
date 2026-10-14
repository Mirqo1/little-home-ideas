import {privacyScene} from './privacy-scene.js?v=editor2-20261014';
import {planLayout,sideNames} from './layout-plan.js?v=editor2-20261014';
import {bindFurniture} from './furniture-controls.js?v=editor2-20261014';
const form=document.getElementById('privacy-form'),out=document.getElementById('results'),message=document.getElementById('planner-message');
const decimalInputs=[...form.querySelectorAll('input[inputmode="decimal"]')],rows=[...form.querySelectorAll('.boundary-row')];
const dollars=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v);
const value=id=>document.getElementById(id).value;
const checked=id=>document.getElementById(id).checked;
const num=id=>{const s=value(id).trim();return /^(?:[0-9]+(?:[.,][0-9]+)?|[.,][0-9]+)$/.test(s)?Number(s.replace(',','.')):NaN;};
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
let lastPlan=null,lastSignature=null;
function notice(text,focus=false){
 message.hidden=!text;message.textContent=text?(text+' '+(lastPlan?'The drawing still shows your last valid plan.':'The example drawing is unchanged.')):'';
 if(text&&focus)message.focus();
}
function toggle(group,active){group.hidden=!active;for(const input of group.querySelectorAll('input,select')){input.disabled=!active;input.setCustomValidity?.('');}}
function syncFields(){
 toggle(document.getElementById('roof-fields'),checked('has-roof'));
 toggle(document.getElementById('furniture-fields'),value('furniture')!=='none');
 toggle(document.getElementById('wall-fields'),rows.some(r=>checked(r.dataset.side+'-wall')));
 toggle(document.getElementById('rail-fields'),rows.some(r=>checked(r.dataset.side+'-rail')));
 for(const row of rows){const side=row.dataset.side;toggle(row.querySelector('.boundary-mixed'),checked(side+'-wall')&&checked(side+'-rail'));toggle(row.querySelector('.boundary-screen'),checked(side+'-screen'));}
}
form.addEventListener('change',syncFields);syncFields();
for(const input of decimalInputs)input.addEventListener('input',()=>input.setCustomValidity(''));
function validate(){
 for(const input of decimalInputs){
  input.setCustomValidity('');if(input.disabled)continue;
  if(!input.value.trim()){if(input.required)input.setCustomValidity('Enter a measurement.');continue;}
  const n=num(input.id);
  if(!Number.isFinite(n))input.setCustomValidity('Use a decimal point or comma, for example 2.16 or 2,16.');
  else if(n<Number(input.dataset.min)||n>Number(input.dataset.max))input.setCustomValidity('Enter a value from '+input.dataset.min+' to '+input.dataset.max+'.');
 }
 const invalid=decimalInputs.find(i=>!i.disabled&&!i.checkValidity());
 if(invalid){const label=form.querySelector('label[for="'+invalid.id+'"]');notice((label?.textContent??'Measurement')+': '+invalid.validationMessage);form.reportValidity();return false;}
 return true;
}
function read(){
 return {space:value('space'),patioWidth:num('patio-width'),depth:num('depth'),height:num('screen-height'),panelWidth:num('panel-width'),hasRoof:checked('has-roof'),roofHeight:num('roof-height'),wallHeight:num('wall-height'),railHeight:num('rail-height'),furniture:value('furniture'),seatWidth:num('seat-width'),seatDepth:num('seat-depth'),tableWidth:num('table-width'),tableDepth:num('table-depth'),modulePrice:value('module-price').trim()?num('module-price'):null,extraCost:num('extra-cost'),
 boundaries:rows.map(row=>{const side=row.dataset.side;return {side,wall:checked(side+'-wall'),rail:checked(side+'-rail'),screen:checked(side+'-screen'),wallLength:num(side+'-wall-length'),wallAt:value(side+'-wall-at'),mode:value(side+'-mode'),screenWidth:value(side+'-screen-width').trim()?num(side+'-screen-width'):null};})};
}
const signature=o=>[o.furniture,o.seatWidth,o.seatDepth,o.tableWidth,o.tableDepth].join('|');
const defaultPlan=planLayout({space:'patio',patioWidth:10,depth:8,height:6,panelWidth:3,furniture:'none',boundaries:['back','right','front','left'].map(side=>({side,wall:false,rail:false,screen:side==='back',mode:'full',screenWidth:side==='back'?6:null}))});
document.getElementById('planner-preview').append(privacyScene(document,defaultPlan,true));
const empty=out.innerHTML;
function makeText(p){
 return ['LITTLE HOME IDEAS — PATIO LAYOUT','Space: '+p.space,'Floor: '+p.patioWidth+' × '+p.depth+' ft','Roof underside: '+(p.roofHeight??'none'),
 '','SCREENS',...p.screens.map(s=>sideNames[s.side]+': start '+s.start+' ft along side; target '+s.width+' ft; elevation '+s.base+'–'+s.height+' ft; '+s.modules+' modules, '+s.coverage+' ft coverage'),
 '','WALLS',...p.wallSegments.map(s=>sideNames[s.side]+': '+s.start+'–'+s.end+' ft, height '+s.height+' ft'),'','RAILINGS',...p.railSegments.map(s=>sideNames[s.side]+': '+s.start+'–'+s.end+' ft, height '+s.height+' ft'),
 '','FURNITURE',...p.items.map(i=>i.label+': '+i.w+' × '+i.d+' ft; x='+i.x+', y='+i.y+' ft (from A/D floor corner)'),'',
 p.total===null?'No cost entered.':'Entered cost arithmetic: '+dollars(p.total),p.summary,p.warning,'Guide: https://littlehomeideas.com/articles/patio-privacy-ideas-for-renters/'].join('\n');
}
function download(p){const url=URL.createObjectURL(new Blob([makeText(p)],{type:'text/plain;charset=utf-8'})),a=el('a');a.href=url;a.download='patio-privacy-worksheet.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function render(p){
 out.replaceChildren();
 const controls=el('div',undefined,'scene-controls'),scene=el('div',undefined,'scene-container'),options={showRoof:true,showWalls:true},status=el('p','Drag a piece to move it. Tab to a piece and use arrow keys (0.25 ft; Shift = 1 ft).','small furniture-status');
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 scene.setAttribute('aria-live','off');
 const redraw=id=>{options.selectedItem=id??null;scene.replaceChildren(privacyScene(document,p,false,options));};
 for(const [key,label,active] of [['showRoof','Show roof',p.roofHeight!==null],['showWalls','Show walls',p.wallSegments.length>0]]){
  if(!active)continue;const l=el('label'),c=el('input');c.type='checkbox';c.checked=true;l.append(c,document.createTextNode(label));controls.append(l);
  c.addEventListener('change',()=>{options[key]=c.checked;redraw(scene.dataset.selectedItem);});
 }
 redraw();out.append(controls,scene);
 if(p.items.length){
  out.append(status);const reset=el('button','Reset furniture positions','reset-button');reset.type='button';
  reset.addEventListener('click',()=>{p.items=p.defaultItems.map(i=>({...i}));notice('');redraw();status.textContent='Furniture restored to the starting arrangement.';});out.append(reset);
  bindFurniture(scene,p,redraw,text=>notice(text),item=>{if(item)status.textContent=item.label+': '+item.x+' ft from side D, '+item.y+' ft from side A. This is its footprint corner.';});
 }
 const table=el('table',undefined,'screen-summary'),caption=el('caption','Screening on each side'),head=el('thead'),hr=el('tr');
 for(const text of ['Side','Length','Screen elevation','Modules']){const th=el('th',text);th.scope='col';hr.append(th);}head.append(hr);table.append(caption,head);
 const body=el('tbody');
 for(const s of p.screens){const tr=el('tr');for(const t of [sideNames[s.side],s.width+' ft',s.base+'–'+s.height+' ft',String(s.modules)])tr.append(el('td',t));body.append(tr);}table.append(body);out.append(table);
 const metrics=el('div',undefined,'plan-metrics');for(const [v,label]of [[p.modules,'Total modules'],[p.coverage+' ft','Total coverage'],[p.surplus+' ft','Beyond target']]){const m=el('div');m.append(el('strong',String(v)),el('span',label));metrics.append(m);}out.append(metrics,el('p',p.summary,'small'));
 if(!p.fits)out.append(el('p','A rounded module count extends beyond a usable side section. Compare different widths before buying. Orange screening marks this mismatch.','form-error'));
 if(p.total!==null)out.append(el('h3','Your entered cost estimate'),el('p',p.modules+' × '+dollars(p.modulePrice)+' + '+dollars(p.extraCost)+' = '+dollars(p.total),'plan-cost'),el('p','Arithmetic only. No live prices or installation costs are retrieved.','small'));
 out.append(el('p',p.warning,'notice'));
 const actions=el('div',undefined,'plan-actions'),save=el('button','Save worksheet','button'),print=el('button','Print plan','button secondary');
 save.type=print.type='button';save.addEventListener('click',()=>download(p));print.addEventListener('click',()=>window.print());actions.append(save,print);out.append(actions);
}
form.addEventListener('submit',e=>{
 e.preventDefault();if(!validate())return;const raw=read(),key=signature(raw);if(lastPlan&&key===lastSignature)raw.items=lastPlan.items;
 const p=planLayout(raw);
 if(p.error){notice(p.error,true);return;}
 lastPlan=p;lastSignature=key;notice('');render(p);out.focus();
});
form.addEventListener('reset',()=>{lastPlan=null;lastSignature=null;notice('');out.innerHTML=empty;for(const i of decimalInputs)i.setCustomValidity('');queueMicrotask(syncFields);});
