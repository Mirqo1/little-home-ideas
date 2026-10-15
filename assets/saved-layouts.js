// Local project files contain only planner answers, never account credentials.
export const layoutStorageKey='lhi-patio-projects-v1';
export const maxProjects=8;
const clone=v=>JSON.parse(JSON.stringify(v));
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const finite=n=>Number.isFinite(n)&&Math.abs(n)<=100000;
export function decodeProject(text){
 if(typeof text!=='string'||text.length>100000)throw Error('Choose a Little Home Ideas layout file smaller than 100 KB.');
 let p;try{p=JSON.parse(text);}catch{throw Error('This file is not valid JSON. Your current drawing has not changed.');}
 if(!plain(p)||p.format!=='lhi-patio-layout'||p.version!==1||!plain(p.input)||!plain(p.fields)||!plain(p.quantityIds))throw Error('This is not a supported Little Home Ideas patio layout file.');
 if(typeof p.name!=='string'||!p.name.trim()||p.name.length>60||typeof p.savedAt!=='string'||!Number.isFinite(Date.parse(p.savedAt))||![0,90,180,270].includes(p.view))throw Error('This layout has invalid project details.');
 if(Object.keys(p.fields).length>100||Object.entries(p.fields).some(([k,v])=>!/^[-a-z0-9]+$/.test(k)||!plain(v)||typeof v.value!=='string'||v.value.length>200||typeof v.checked!=='boolean'||typeof v.auto!=='boolean'))throw Error('This layout has invalid settings.');
 if(Object.keys(p.quantityIds).length>6||Object.entries(p.quantityIds).some(([k,v])=>!/^extra-(bench|lounger|side-table|storage)$|^plant-(thuja|leafy)-1$/.test(k)||!Array.isArray(v)||v.length>6||v.some(id=>typeof id!=='string'||!/^((extra-(bench|lounger|side-table|storage))|plant-(thuja|leafy))(-[1-9][0-9]{0,6})?$/.test(id))))throw Error('This layout has invalid object quantities.');
 const o=p.input;
 if(o.space!=='patio'||!['none','bistro'].includes(o.furniture)||![o.patioWidth,o.depth].every(finite)||o.patioWidth<1||o.patioWidth>100||o.depth<2||o.depth>100||!Array.isArray(o.boundaries)||o.boundaries.length!==4)throw Error('This layout has invalid floor or side settings.');
 for(const key of ['extraRequests','openings','poses','openingPoses','lockedIds','deletedItems','plantIds','plantStyles','plantLabels','plantSources'])if(o[key]!==undefined&&(!Array.isArray(o[key])||o[key].length>40))throw Error('This layout contains too many objects.');
 if(!Number.isInteger(o.plantCount)||o.plantCount<0||o.plantCount>12)throw Error('This layout has invalid plant quantities.');
 const idOk=id=>typeof id==='string'&&/^[a-z0-9-]{1,60}$/.test(id);
 for(const a of [...(o.poses??[]),...(o.openingPoses??[]),...(o.extraRequests??[]),...(o.openings??[])])if(!plain(a)||!idOk(a.id)||Object.values(a).some(v=>typeof v==='number'&&!finite(v))||a.label!==undefined&&(typeof a.label!=='string'||a.label.length>100))throw Error('This layout contains an invalid object.');
 for(const b of o.boundaries)if(!plain(b)||!['back','right','front','left'].includes(b.side)||!Array.isArray(b.gaps)||b.gaps.length>200||b.gaps.some(n=>!finite(n)||n<0))throw Error('This layout has invalid screen gaps.');
 return clone(p);
}
export function makeProject(name,input,fields,quantityIds,view,plan){
 const data=clone(input);data.poses=plan.items;data.openingPoses=plan.openings;data.lockedIds=[...plan.items,...plan.openings].filter(i=>i.locked).map(i=>i.id);data.deletedItems=['item-0','item-1','item-2'].filter(id=>!plan.items.some(i=>i.id===id));
 return decodeProject(JSON.stringify({format:'lhi-patio-layout',version:1,name:name.trim(),savedAt:new Date().toISOString(),input:data,fields,quantityIds,view}));
}
export function readProjects(storage){
 const text=storage.getItem(layoutStorageKey);if(!text)return [];
 let values;try{values=JSON.parse(text);}catch{throw Error('Saved layouts could not be read. Download your current layout as a backup.');}
 if(!Array.isArray(values)||values.length>maxProjects)throw Error('Saved layouts could not be read. No stored data was changed.');
 return values.map(v=>decodeProject(JSON.stringify(v)));
}
export function writeProjects(storage,projects){
 if(projects.length>maxProjects)throw Error('You can keep up to eight layouts in this browser. Download a backup before removing one.');
 const checked=projects.map(p=>decodeProject(JSON.stringify(p)));storage.setItem(layoutStorageKey,JSON.stringify(checked));return checked;
}
export function bindProjects({document,window,getProject,openProject,preview}){
 const root=document.getElementById('saved-projects');if(!root)return;
 const name=root.querySelector('#project-name'),list=root.querySelector('#project-list'),status=root.querySelector('#project-status'),compare=root.querySelector('#project-comparison');
 let projects=[],readable=true;
 const tell=text=>{status.textContent=text;};
 try{projects=readProjects(window.localStorage);}catch{readable=false;tell('Browser storage is unavailable or unreadable. You can still download and open layout files.');}
 const download=(text,filename,type)=>{const u=window.URL.createObjectURL(new window.Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();window.setTimeout(()=>window.URL.revokeObjectURL(u),1000);};
 const changed=()=>{compare.replaceChildren();draw();};
 const draw=()=>{
  list.replaceChildren();
  if(!projects.length){const empty=document.createElement('p');empty.className='small';empty.textContent='No layouts saved in this browser yet.';list.append(empty);return;}
  for(const [index,p]of projects.entries()){
   const row=document.createElement('div');row.className='project-row';const label=document.createElement('label'),pick=document.createElement('input');pick.type='checkbox';pick.dataset.compare=String(index);pick.setAttribute('aria-label','Compare '+p.name);label.append(pick,document.createTextNode(p.name));
   const date=document.createElement('span');date.className='small';date.textContent=new Date(p.savedAt).toLocaleDateString('en-US');
   const open=document.createElement('button');open.type='button';open.textContent='Open';open.setAttribute('aria-label','Open '+p.name);open.addEventListener('click',()=>{try{openProject(p);name.value=p.name;tell('Opened “'+p.name+'”. Changes are not saved automatically.');}catch(e){tell(e.message);}});
   const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove saved '+p.name);remove.addEventListener('click',()=>{try{const next=projects.filter((_,i)=>i!==index);writeProjects(window.localStorage,next);projects=next;changed();tell('Removed the saved copy. An already open drawing is unchanged.');}catch{tell('Could not update browser storage. No saved copy was removed.');}});
   row.append(label,date,open,remove);list.append(row);
  }
 };
 root.querySelector('#project-save').addEventListener('click',()=>{try{
  if(!readable)throw Error('Browser storage is unavailable or unreadable. Use Download layout file instead.');
  const p=getProject(name.value),existing=projects.findIndex(i=>i.name.toLowerCase()===p.name.toLowerCase());
  if(existing>=0)throw Error('That name already exists. Use a different name to keep both versions.');
  const next=[...projects,p];writeProjects(window.localStorage,next);projects=next;changed();tell('Saved “'+p.name+'” in this browser. Use Download layout file for a separate backup.');
 }catch(e){tell(['QuotaExceededError','SecurityError'].includes(e.name)?'Browser storage is full or blocked. Use Download layout file instead.':e.message||'Could not save. Use Download layout file instead.');}});
 root.querySelector('#project-download').addEventListener('click',()=>{try{const p=getProject(name.value);download(JSON.stringify(p,null,2),'little-home-ideas-patio-layout.json','application/json');tell('Layout file requested. Keep it to reopen the plan on another device.');}catch(e){tell(e.message);}});
 root.querySelector('#project-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>100000)throw Error('Choose a layout file smaller than 100 KB.');const p=decodeProject(await file.text());openProject(p);name.value=p.name;tell('Opened “'+p.name+'” from a file. Save it here to keep a browser copy.');}catch(error){tell(error.message);}finally{e.target.value='';}});
 root.querySelector('#project-compare').addEventListener('click',()=>{const chosen=[...list.querySelectorAll('[data-compare]:checked')].map(i=>projects[Number(i.dataset.compare)]);if(chosen.length!==2){tell('Select two saved layouts to compare.');return;}compare.replaceChildren();for(const p of chosen){const card=document.createElement('section'),heading=document.createElement('h3');heading.textContent=p.name;card.append(heading);try{card.append(preview(p));}catch{card.append(document.createTextNode('This saved layout could not be previewed.'));}compare.append(card);}tell('Comparing two saved copies. Your current drawing is unchanged.');});
 draw();
}
