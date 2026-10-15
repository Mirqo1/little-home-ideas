import {parseGaps} from './screen-pieces.js?v=print-final-20261014';
import {bindOpenings} from './wall-openings.js?v=print-final-20261014';
import {privacyScene} from './privacy-scene.js?v=print-final-20261014';
import {planLayout,sideNames,rotateFurniture} from './layout-plan.js?v=print-final-20261014';
import {bindFurniture} from './furniture-controls.js?v=print-final-20261014';
const form=document.getElementById('privacy-form'),out=document.getElementById('results'),message=document.getElementById('planner-message'),stateNote=document.getElementById('planner-state-note');
const plannerEvent=name=>document.dispatchEvent(new window.CustomEvent('lhi:analytics',{detail:{name}}));
let plannerStarted=false;const markPlannerStarted=()=>{if(!plannerStarted){plannerStarted=true;plannerEvent('planner_start');}};
form.addEventListener('input',markPlannerStarted);form.addEventListener('change',markPlannerStarted);
const decimalInputs=[...form.querySelectorAll('input[inputmode="decimal"]')],rows=[...form.querySelectorAll('.boundary-row')];
const dollars=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v);
const value=id=>document.getElementById(id).value;
const checked=id=>document.getElementById(id).checked;
const num=id=>{const s=value(id).trim();return /^(?:[0-9]+(?:[.,][0-9]+)?|[.,][0-9]+)$/.test(s)?Number(s.replace(',','.')):NaN;};
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
let lastPlan=null,lastSignature=null,sceneView=0;
const quantities=new Map(),nextIds=new Map(),deletedBase=new Set(),lockedIds=new Set();
function requests(input){
 const kind=input.dataset.extra??input.dataset.plant,key=input.id,count=Number(input.value),ids=quantities.get(key)??[];
 while(ids.length>count)ids.pop();
 while(ids.length<count){const n=(nextIds.get(key)??0)+1;nextIds.set(key,n);ids.push(input.dataset.extra?(n===1?key:key+'-'+n):'plant-'+kind+'-'+n);}
 quantities.set(key,ids);const name=form.querySelector('label[for="'+key+'"]').textContent;
 return ids.map((id,n)=>({id,kind,sourceKey:key,label:(kind==='thuja'?'Potted thuja':kind==='leafy'?'Leafy potted plant':name)+' '+(n+1)}));
}
const extraRequests=()=>[...form.querySelectorAll('[data-extra]')].flatMap(requests);
const plantRequests=()=>[...form.querySelectorAll('[data-plant]')].flatMap(requests);
function removeObject(p,id){
 const item=[...p.items,...p.openings].find(i=>i.id===id);if(!item||item.locked)return;
 if(item.sourceKey){const ids=quantities.get(item.sourceKey)??[];quantities.set(item.sourceKey,ids.filter(v=>v!==id));document.getElementById(item.sourceKey).value=String(ids.filter(v=>v!==id).length);}
 else if(item.side){document.getElementById(item.id).checked=false;syncFields();}
 else{deletedBase.add(id);const furniture=document.getElementById('furniture');furniture.indeterminate=deletedBase.size>0&&deletedBase.size<3;if(deletedBase.size===3)furniture.checked=false;}
 lockedIds.delete(id);p.items=p.items.filter(i=>i.id!==id);p.openings=p.openings.filter(i=>i.id!==id);p.defaultItems=p.defaultItems.filter(i=>i.id!==id);p.defaultOpenings=p.defaultOpenings.filter(i=>i.id!==id);render(p);
}

function clearErrors(){
 message.hidden=true;message.replaceChildren();
 for(const n of form.querySelectorAll('.field-error'))n.remove();
 for(const i of form.querySelectorAll('[aria-invalid]')){i.removeAttribute('aria-invalid');i.removeAttribute('aria-describedby');}
}
function pending(){
 clearErrors();stateNote.hidden=false;stateNote.textContent='Settings changed. Click “Show my layout” to apply them. The drawing is unchanged.';
}
function notice(text,focus=false,field=null,action=null){
 clearErrors();stateNote.hidden=true;
 if(!text)return;
 message.hidden=false;message.append(document.createTextNode(text+' '+(lastPlan?'Your last valid drawing is still available.':'The example drawing is still available.')));
 const input=field?document.getElementById(field):null;
 if(input&&!input.disabled){
  input.setAttribute('aria-invalid','true');
  const hint=el('p',text,'field-error');hint.id=field+'-error';input.setAttribute('aria-describedby',hint.id);input.after(hint);
  const edit=el('button','Go to this setting','reset-button');edit.type='button';edit.addEventListener('click',()=>{document.getElementById('product-details').open ||= field==='panel-width';input.focus();});message.append(edit);
 }
 if(action){
  const fix=el('button',action==='reset-openings'?'Reset opening positions & update':action==='cover-rail'?'Cover this railing and the space above':action==='full-section'?'Use full available section':action==='reset-furniture'?'Reset furniture positions & update':'Remove furniture & update','button secondary');fix.type='button';
  fix.addEventListener('click',()=>{
   if(action==='cover-rail'){document.getElementById(field).value='full';syncFields();}
   if(action==='full-section'){document.getElementById(field.replace('-screen-width','-custom-width')).checked=false;syncFields();}
   if(action==='remove-furniture'){document.getElementById('furniture').checked=false;syncFields();}
   if(action==='reset-furniture')ignoreSavedPositions=true;
   if(action==='reset-openings')ignoreOpeningPositions=true;
   form.requestSubmit();
  });message.append(fix);
 }
}
function toggle(group,active){group.hidden=!active;for(const input of group.querySelectorAll('input,select')){input.disabled=!active;input.setCustomValidity?.('');}}
let ignoreSavedPositions=false,ignoreProductToggle=false,ignoreOpeningPositions=false;
function syncFields(){
 toggle(document.getElementById('roof-fields'),checked('has-roof'));
 toggle(document.getElementById('wall-fields'),rows.some(r=>checked(r.dataset.side+'-wall')));
 toggle(document.getElementById('rail-fields'),rows.some(r=>checked(r.dataset.side+'-rail')));
 toggle(document.getElementById('screen-common'),rows.some(r=>checked(r.dataset.side+'-screen')));
 for(const row of rows){
  const side=row.dataset.side,wall=checked(side+'-wall'),rail=checked(side+'-rail'),screenInput=document.getElementById(side+'-screen');
  screenInput.disabled=false;row.querySelector('.boundary-hint').hidden=true;
  const screen=screenInput.checked,L=['back','front'].includes(side)?num('patio-width'):num('depth'),wallInput=document.getElementById(side+'-wall-length');
  if(wall&&wallInput.dataset.auto==='true'&&Number.isFinite(L)){const custom=checked(side+'-custom-width')?num(side+'-screen-width'):NaN;const initial=screen&&Number.isFinite(custom)&&custom>0&&custom<L?L-custom:(rail||screen)?L/2:L;wallInput.value=String(Number(initial.toFixed(2)));}
  toggle(row.querySelector('.boundary-mixed'),wall);
  toggle(row.querySelector('.boundary-screen'),screen);
  toggle(row.querySelector('.screen-placement'),screen&&rail);
  if(!rail)document.getElementById(side+'-mode').value='full';
  toggle(row.querySelector('.screen-length'),screen&&checked(side+'-custom-width'));
  toggle(row.querySelector('.screen-piece-fields'),screen&&(checked(side+'-separate')||document.getElementById('product-details').open));
  const gap=document.getElementById(side+'-gaps');gap.disabled=!(screen&&checked(side+'-separate'));gap.hidden=!checked(side+'-separate');row.querySelector('label[for="'+side+'-gaps"]').hidden=!checked(side+'-separate');
  const open=wall?L-num(side+'-wall-length'):L,coverage=row.querySelector('.side-coverage');
  coverage.textContent=Number.isFinite(open)&&open>0?'Available screen section: '+Number(open.toFixed(2))+' ft. '+(checked(side+'-separate')?'This span includes the pieces and their open gaps.':'It is covered in full by default.'):'Enter floor and wall lengths to determine the available section.';
  const custom=document.getElementById(side+'-screen-width');
  if(screen&&checked(side+'-custom-width')&&!custom.value.trim()&&Number.isFinite(open)&&open>0)custom.value=String(Number(open.toFixed(2)));
 }
 // Screen checks may have changed after selecting a full wall.
 toggle(document.getElementById('screen-common'),rows.some(r=>checked(r.dataset.side+'-screen')));
 const walls=rows.filter(row=>checked(row.dataset.side+'-wall')).map(row=>row.dataset.side);
 document.getElementById('openings-hint').hidden=walls.length>0;
 for(const input of document.querySelectorAll('[data-opening]')){
  input.disabled=!walls.length;if(input.disabled)input.checked=false;
  const select=document.getElementById(input.id+'-side'),prior=select.value;select.replaceChildren();
  for(const side of walls){const option=el('option',sideNames[side]);option.value=side;select.append(option);}
  if(walls.includes(prior))select.value=prior;
  toggle(document.getElementById(input.id+'-fields'),input.checked&&walls.length>0);
 }
 const product=document.getElementById('product-details');
 for(const input of product.querySelectorAll('input')){input.disabled=!product.open;input.setCustomValidity('');}
}
form.addEventListener('change',e=>{if(e.target.id==='furniture'){deletedBase.clear();e.target.indeterminate=false;}syncFields();pending();});
for(const i of form.querySelectorAll('input[type=number]'))i.addEventListener('input',pending);
document.getElementById('product-details').addEventListener('toggle',()=>{syncFields();if(ignoreProductToggle||(!document.getElementById('product-details').open&&!lastPlan)){ignoreProductToggle=false;stateNote.hidden=true;return;}pending();});
syncFields();
for(const input of decimalInputs)input.addEventListener('input',()=>{
 input.setCustomValidity('');if(input.dataset.auto==='true')input.dataset.auto='false';pending();
 if(input.id==='patio-width'||input.id==='depth'||input.id.endsWith('-wall-length'))syncFields();
});
for(const input of form.querySelectorAll('[id$="-gaps"]'))input.addEventListener('input',pending);
function validate(){
 for(const input of form.querySelectorAll('input[type=number]')){if(!Number.isInteger(Number(input.value))||!input.value.trim()||Number(input.value)<0||Number(input.value)>6){notice('Enter a whole-number quantity from 0 to 6.',false,input.id);return false;}}

 for(const input of decimalInputs){
  input.setCustomValidity('');if(input.disabled)continue;
  if(!input.value.trim()){if(input.required)input.setCustomValidity('Enter a measurement.');continue;}
  const n=num(input.id);
  if(!Number.isFinite(n))input.setCustomValidity('Use a decimal point or comma, for example 2.16 or 2,16.');
  else if(n<Number(input.dataset.min)||n>Number(input.dataset.max))input.setCustomValidity('Enter a value from '+input.dataset.min+' to '+input.dataset.max+'.');
 }
 for(const row of rows){const side=row.dataset.side;if(checked(side+'-screen')&&checked(side+'-separate')){const parsed=parseGaps(value(side+'-gaps'),'in');if(parsed.error){notice(parsed.error,false,side+'-gaps');return false;}}}
 const invalid=decimalInputs.find(i=>!i.disabled&&!i.checkValidity());
 if(invalid){const label=form.querySelector('label[for="'+invalid.id+'"]');notice((label?.textContent??'Measurement')+': '+invalid.validationMessage,false,invalid.id);return false;}
 return true;
}
function read(){
 return {space:'patio',patioWidth:num('patio-width'),depth:num('depth'),height:num('screen-height'),estimatePanels:document.getElementById('product-details').open,panelWidth:3,hasRoof:checked('has-roof'),roofHeight:num('roof-height'),wallHeight:num('wall-height'),railHeight:num('rail-height'),furniture:checked('furniture')?'bistro':'none',extraRequests:extraRequests(),plantCount:plantRequests().length,plantStyles:plantRequests().map(i=>i.kind),plantIds:plantRequests().map(i=>i.id),plantLabels:plantRequests().map(i=>i.label),plantSources:plantRequests().map(i=>i.sourceKey),deletedItems:[...deletedBase],lockedIds:[...lockedIds],plantWidth:1.5,plantHeight:4,seatWidth:2,seatDepth:2,tableWidth:2,tableDepth:2,openings:[...document.querySelectorAll('[data-opening]:checked')].map(i=>({id:i.id,kind:i.dataset.opening,side:value(i.id+'-side')})),modulePrice:document.getElementById('product-details').open&&value('module-price').trim()?num('module-price'):null,extraCost:document.getElementById('product-details').open?num('extra-cost'):0,
 boundaries:rows.map(row=>{const side=row.dataset.side;return {side,wall:checked(side+'-wall'),rail:checked(side+'-rail'),screen:checked(side+'-screen'),wallLength:num(side+'-wall-length'),wallAt:value(side+'-wall-at'),mode:checked(side+'-rail')?value(side+'-mode'):'full',screenWidth:checked(side+'-custom-width')?num(side+'-screen-width'):null,separate:checked(side+'-separate'),pieceWidth:(checked(side+'-separate')||document.getElementById('product-details').open)?num(side+'-piece-width'):null,gaps:checked(side+'-separate')?parseGaps(value(side+'-gaps'),'in').gaps:[0]};})};
}
const signature=o=>[o.furniture,o.seatWidth,o.seatDepth,o.tableWidth,o.tableDepth].join('|');
const defaultPlan=planLayout({space:'patio',patioWidth:10,depth:8,height:6,panelWidth:3,estimatePanels:false,furniture:'none',boundaries:['back','right','front','left'].map(side=>({side,wall:false,rail:false,screen:side==='back',mode:'full',screenWidth:null}))});
document.getElementById('planner-preview').append(privacyScene(document,defaultPlan,true));
const empty=out.innerHTML;
function makeText(p){
 return ['LITTLE HOME IDEAS — PATIO LAYOUT','Floor: '+p.patioWidth+' × '+p.depth+' ft','Roof underside: '+(p.roofHeight??'none'),
 '','SCREENS',...p.screens.map(s=>sideNames[s.side]+': start '+s.start+' ft along side; span '+s.width+' ft; pieces '+s.modules+' × '+s.pieceWidth+' ft; gap pattern '+s.gaps.join('; ')+' ft; open gaps '+s.gapWidth+' ft; material '+s.materialWidth+' ft; elevation '+s.base+'–'+s.height+' ft; '+(p.estimatePanels?s.modules+' estimated panels, '+s.coverage+' ft whole-panel coverage':'product count not requested')),
 '','WALLS',...p.wallSegments.map(s=>sideNames[s.side]+': '+s.start+'–'+s.end+' ft, height '+s.height+' ft'),'','RAILINGS',...p.railSegments.map(s=>sideNames[s.side]+': '+s.start+'–'+s.end+' ft, height '+s.height+' ft'),
 '','DOORS & WINDOWS',...p.openings.map(i=>i.label+' on '+sideNames[i.side]+': '+i.width+' × '+i.height+' ft; start '+i.start+' ft; bottom '+i.bottom+' ft'),
 '','FURNITURE',...p.items.map(i=>i.label+': footprint '+i.w+' × '+i.d+' ft; x='+i.x+', y='+i.y+' ft; rotation '+(i.rotation??0)+' degrees'+(i.height?'; total height '+i.height+' ft':'')+' (from A/D floor corner)'),'',
 p.total===null?'No cost entered.':'Entered cost arithmetic: '+dollars(p.total),p.summary,p.warning,'Guide: https://littlehomeideas.com/articles/patio-privacy-ideas-for-renters/'].join('\n');
}
function download(p){const url=URL.createObjectURL(new Blob([makeText(p)],{type:'text/plain;charset=utf-8'})),a=el('a');a.href=url;a.download='patio-privacy-worksheet.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function render(p){
 out.replaceChildren();
 const controls=el('div',undefined,'scene-controls'),scene=el('div',undefined,'scene-container'),options={showRoof:true,showWalls:true,viewAngle:sceneView},status=el('p','Drag a piece to move it. Tab to a piece and use arrow keys (0.25 ft; Shift = 1 ft).','small furniture-status');
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 scene.setAttribute('aria-live','off');
 const redraw=id=>{options.selectedItem=id??null;scene.replaceChildren(privacyScene(document,p,false,options));};
 for(const [key,label,active] of [['showRoof','Show roof',p.roofHeight!==null],['showWalls','Show walls',p.wallSegments.length>0]]){
  if(!active)continue;const l=el('label'),c=el('input');c.type='checkbox';c.checked=true;l.append(c,document.createTextNode(label));controls.append(l);
  c.addEventListener('change',()=>{options[key]=c.checked;redraw(scene.dataset.selectedItem);});
 }
 const viewLabel=el('span','View: '+(sceneView/90+1)+' of 4','view-label');
 for(const [label,turn]of [['↶ Rotate view',-90],['Rotate view ↷',90],['Reset view',0]]){
  const button=el('button',label,'planner-control-button');button.type='button';button.setAttribute('aria-label',label.includes('↶')?'Rotate view left':label.includes('↷')?'Rotate view right':'Reset view');button.addEventListener('click',()=>{sceneView=turn?((sceneView+turn+360)%360):0;options.viewAngle=sceneView;viewLabel.textContent='View: '+(sceneView/90+1)+' of 4';redraw(scene.dataset.selectedItem);});controls.append(button);
 }
 controls.append(viewLabel);
 const summary=el('div',undefined,'planner-print-summary');
 for(const [label,text]of [['Floor',p.patioWidth+' × '+p.depth+' ft'],['Roof',p.roofHeight===null?'No roof':p.roofHeight+' ft above floor'],['Screened sides',p.screens.length? p.screens.map(s=>s.side==='back'?'A':s.side==='right'?'B':s.side==='front'?'C':'D').join(', '):'None'],['Objects',String(p.items.length)+' furniture / plants']]){const item=el('div');item.append(el('strong',label),el('span',text));summary.append(item);}
 redraw();out.append(summary,controls,scene,el('p','A–D keep their original side names when the view rotates · all measurements in feet'+(p.screens.some(s=>s.gapWidth>0)?' · Open gaps reduce privacy.':''),'small scene-caption'));
 const allPieces=()=>[...p.items,...p.openings],rotatable=i=>['chair','bench','lounger','storage','side-table'].includes(i.kind)&&!i.locked;
 if(allPieces().length){
  const tools=el('div',undefined,'item-toolbar'),selectLabel=el('label','Rotate furniture'),picker=el('select'),left=el('button','↶ Rotate left','planner-control-button'),right=el('button','Rotate right ↷','planner-control-button'),trash=el('button','🗑','planner-control-button delete-object'),activeLabel=el('p',undefined,'selected-object');
  picker.id='layout-piece';selectLabel.htmlFor=picker.id;trash.type=left.type=right.type='button';trash.setAttribute('aria-label','Remove selected object');trash.title='Remove selected object';
  const fillPicker=()=>{picker.replaceChildren();const placeholder=el('option','Choose furniture to rotate');placeholder.value='';picker.append(placeholder);for(const item of allPieces().filter(rotatable)){const option=el('option',item.label);option.value=item.id;picker.append(option);}};
  let activeId=null;
  const selected=item=>{if(!item)return;activeId=item.id;picker.value=rotatable(item)?item.id:'';left.disabled=right.disabled=!rotatable(item);trash.disabled=!!item.locked;activeLabel.textContent='Selected: '+item.label+(item.locked?' · Locked':'');};
  const describe=item=>{if(item?.side){status.textContent=item.label+' on '+sideNames[item.side]+': '+item.start+' ft along side; bottom '+item.bottom+' ft.';return;}if(item)status.textContent=item.label+': '+item.x+' ft from D, '+item.y+' ft from A'+(rotatable(item)?'; facing '+(item.rotation??0)+'°.':'.');};
  const selectPiece=id=>{const item=allPieces().find(i=>i.id===id);if(!item)return;scene.dataset.selectedItem=id;selected(item);redraw(id);};
  const rotate=turn=>{const next=rotateFurniture(p.items,activeId,p.patioWidth,p.depth,turn);if(next.error){notice(next.error);return;}p.items=next.items;notice('');redraw(activeId);describe(allPieces().find(i=>i.id===activeId));};
  picker.addEventListener('change',()=>selectPiece(picker.value));left.addEventListener('click',()=>rotate(-90));right.addEventListener('click',()=>rotate(90));trash.addEventListener('click',()=>removeObject(p,activeId));
  fillPicker();tools.append(selectLabel,picker,left,right,trash);out.append(activeLabel,tools,status);
  status.textContent='Drag unlocked objects. Arrow keys move; R rotates furniture. Lock overlapping objects below to reach the ones behind them.';
  const manager=el('details',undefined,'object-manager'),summary=el('summary','Objects & locks ('+allPieces().length+')'),list=el('div',undefined,'object-list');manager.append(summary,list);
  for(const item of allPieces()){
   const row=el('div',undefined,'object-row'),choose=el('button',item.label,'object-select'),label=el('label'),lock=el('input');choose.type='button';choose.dataset.selectId=item.id;choose.setAttribute('aria-label','Select '+item.label);choose.addEventListener('click',()=>selectPiece(item.id));lock.type='checkbox';lock.checked=!!item.locked;lock.dataset.lockId=item.id;lock.setAttribute('aria-label','Lock '+item.label);label.append(lock,document.createTextNode('Lock'));
   lock.addEventListener('change',()=>{const current=allPieces().find(i=>i.id===item.id);current.locked=lock.checked;if(lock.checked)lockedIds.add(item.id);else lockedIds.delete(item.id);fillPicker();selected(allPieces().find(i=>i.id===activeId));redraw(activeId);status.textContent=current.label+(lock.checked?' locked. Clicks pass through it to objects behind.':' unlocked.');});row.append(choose,label);list.append(row);
  }
  out.append(manager);
  const reset=el('button','Reset item positions & directions','reset-button');reset.type='button';reset.addEventListener('click',()=>{p.items=p.defaultItems.map(i=>({...i,locked:lockedIds.has(i.id)}));p.openings=p.defaultOpenings.map(i=>({...i,locked:lockedIds.has(i.id)}));render(p);});out.append(reset);
  const first=allPieces().find(rotatable)??allPieces()[0];selected(first);scene.dataset.selectedItem=first.id;redraw(first.id);bindFurniture(scene,p,redraw,text=>notice(text),describe,selected);bindOpenings(scene,p,redraw,text=>notice(text),describe,selected);
 }
 const table=el('table',undefined,'screen-summary'),caption=el('caption','Screening on each side'),head=el('thead'),hr=el('tr');
 for(const text of ['Side','Screen span','Height above floor',...(p.estimatePanels||p.screens.some(s=>s.separate)?['Pieces','Open gaps','Last piece used / excess']:[])]){const th=el('th',text);th.scope='col';hr.append(th);}head.append(hr);table.append(caption,head);
 const body=el('tbody');
 for(const s of p.screens){const tr=el('tr');for(const t of [sideNames[s.side],s.width+' ft',s.base+'–'+s.height+' ft',...(p.estimatePanels||p.screens.some(s=>s.separate)?[String(s.modules),s.gapWidth+' ft',s.lastPanel+' / '+s.surplus+' ft']:[])])tr.append(el('td',t));body.append(tr);}table.append(body);if(p.screens.length)out.append(table);
 if(!p.screens.length)out.append(el('p','No privacy screens selected. Your floor, structure, and furniture are still shown.','small'));
 if(p.estimatePanels){
  const metrics=el('div',undefined,'plan-metrics');for(const [v,label]of [[p.modules,'Estimated panels'],[p.coverage+' ft','Whole-panel coverage'],[p.surplus+' ft','Unused piece width']]){const m=el('div');m.append(el('strong',String(v)),el('span',label));metrics.append(m);}out.append(metrics,el('p',p.summary,'small'));
  for(const note of p.reviewNotes)out.append(el('p',note,'layout-review'));
 }
 if(p.total!==null)out.append(el('h3','Your entered cost estimate'),el('p',p.modules+' × '+dollars(p.modulePrice)+' + '+dollars(p.extraCost)+' = '+dollars(p.total),'plan-cost'),el('p','Arithmetic only. No live prices or installation costs are retrieved.','small'));
 const reminder=p.warning+' For elevated spaces, confirm building permission, guard requirements, drainage, and permitted loads. Screens do not replace guards.';
 out.append(el('p',reminder,'notice'));
 const report=el('section',undefined,'planner-print-details');report.append(el('h3','Layout details'),el('p','Reference: A is the original far side; D is the original left side. Positions are measured from the A/D corner.','small'));
 const reportTable=(title,headings,records)=>{if(!records.length)return;const t=el('table'),header=el('thead'),row=el('tr'),body=el('tbody');t.append(el('caption',title));for(const heading of headings){const th=el('th',heading);th.scope='col';row.append(th);}header.append(row);t.append(header,body);for(const record of records){const row=el('tr');for(const value of record)row.append(el('td',String(value)));body.append(row);}report.append(t);};
 reportTable('Privacy screens',['Side','Span','Elevation','Pieces / gaps'],p.screens.map(s=>[sideNames[s.side],s.width+' ft',s.base+'–'+s.height+' ft',s.modules+' pieces; last '+s.lastPanel+' ft / '+s.gapWidth+' ft open']));
 reportTable('Walls & railings',['Side','Structure','Position along side','Height'],[...p.wallSegments.map(s=>[sideNames[s.side],'Wall',s.start+'–'+s.end+' ft',s.height+' ft']),...p.railSegments.map(s=>[sideNames[s.side],'Railing',s.start+'–'+s.end+' ft',s.height+' ft'])]);
 reportTable('Furniture & plants',['Object','Footprint','Position (x, y)','Direction'],p.items.map(i=>[i.label,i.w+' × '+i.d+' ft',i.x+', '+i.y+' ft',i.kind==='plant'?'—':(i.rotation??0)+'°']));
 reportTable('Doors & windows',['Opening / side','Size','Position along wall','Bottom above floor'],p.openings.map(i=>[i.label+' / '+sideNames[i.side],i.width+' × '+i.height+' ft',i.start+' ft',i.bottom+' ft']));
 if(p.estimatePanels)report.append(el('p',p.summary,'small'));if(p.total!==null)report.append(el('p','Entered cost estimate: '+dollars(p.total)+' ('+p.modules+' panels × '+dollars(p.modulePrice)+' + '+dollars(p.extraCost)+').','small'));report.append(el('p',reminder,'small'));out.append(report);
 const actions=el('div',undefined,'plan-actions'),save=el('button','Save worksheet','button'),print=el('button','Print plan','button secondary');
 save.type=print.type='button';save.addEventListener('click',()=>{plannerEvent('planner_save');download(p);});print.addEventListener('click',()=>{plannerEvent('planner_print');window.print();});actions.append(save,print);out.append(actions);
}
form.addEventListener('submit',e=>{
 e.preventDefault();if(!validate()){message.scrollIntoView?.({behavior:'smooth',block:'center'});return;}const raw=read(),key=signature(raw);if(lastPlan&&!ignoreSavedPositions)raw.poses=lastPlan.items;
 ignoreSavedPositions=false;
 if(lastPlan&&!ignoreOpeningPositions)raw.openingPoses=lastPlan.openings;ignoreOpeningPositions=false;
 const p=planLayout(raw);
 if(p.error){notice(p.error,false,p.field,p.action);message.scrollIntoView?.({behavior:'smooth',block:'center'});return;}
 lastPlan=p;lastSignature=key;notice('');render(p);plannerEvent('planner_complete');stateNote.hidden=false;stateNote.textContent='Layout updated. The drawing matches your current settings.';document.getElementById('layout-result').scrollIntoView?.({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
});
form.addEventListener('reset',()=>{quantities.clear();nextIds.clear();deletedBase.clear();lockedIds.clear();sceneView=0;document.getElementById('furniture').indeterminate=false;lastPlan=null;lastSignature=null;ignoreSavedPositions=false;ignoreOpeningPositions=false;notice('');stateNote.hidden=true;const products=document.getElementById('product-details');if(products.open){ignoreProductToggle=true;products.open=false;}out.innerHTML=empty;for(const i of decimalInputs){i.setCustomValidity('');if(i.id.endsWith('-wall-length'))i.dataset.auto='true';}queueMicrotask(syncFields);});
