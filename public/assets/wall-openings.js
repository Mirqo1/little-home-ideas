import {sideNames} from './space-features.js?v=gaps-span-20261014';
const round=n=>Number(n.toFixed(2));
export const openingOverlap=(a,b)=>a.side===b.side&&a.start<b.start+b.width-.001&&a.start+a.width>b.start+.001&&a.bottom<b.bottom+b.height-.001&&a.bottom+a.height>b.bottom+.001;
export function moveOpening(openings,id,start,bottom,walls,preview=false){
 const item=openings.find(i=>i.id===id),wall=walls.find(w=>w.side===item?.side);
 if(!item||!wall||![start,bottom].every(Number.isFinite))return {error:'Select an opening on an existing wall.'};
 const next={...item,start:round(Math.max(wall.start,Math.min(start,wall.end-item.width))),bottom:item.kind==='door'?0:round(Math.max(0,Math.min(bottom,wall.height-item.height)))};
 if(!preview&&openings.some(i=>i.id!==id&&openingOverlap(next,i)))return {error:'Door and window symbols overlap. Release on a clear part of this wall.'};
 return {openings:openings.map(i=>i.id===id?next:{...i})};
}
export function wallOpenings(requests=[],walls=[],poses=[]){
 if(!Array.isArray(requests)||requests.length>3)return {error:'Choose up to one door and two windows.'};
 const openings=[],saved=new Map(poses.map(i=>[i.id,i]));
 for(const request of requests){
  const wall=walls.find(w=>w.side===request.side),field=request.id+'-side';
  if(!wall||!['door','window'].includes(request.kind)||openings.some(i=>i.id===request.id))return {error:'Choose an existing wall for this door or window.',field};
  const span=wall.end-wall.start,width=Math.min(3,span),height=Math.min(request.kind==='door'?6.5:3,wall.height),bottom=request.kind==='door'?0:Math.min(3,wall.height-height);
  const item={...request,label:request.kind==='door'?'Door':request.id==='window-1'?'Window 1':'Window 2',width,height,bottom,start:wall.start};
  const pose=saved.get(item.id);
  if(pose&&pose.side===item.side&&pose.width===width&&pose.height===height){
   if(![pose.start,pose.bottom].every(Number.isFinite)||pose.start<wall.start-.001||pose.start+width>wall.end+.001||pose.bottom<0||pose.bottom+height>wall.height+.001)return {error:item.label+' no longer fits '+sideNames[item.side]+'. Reset opening positions or restore the wall dimensions.',field,action:'reset-openings'};
   item.start=pose.start;item.bottom=pose.bottom;
  }else{
   let placed=false;
   const elevations=[bottom];if(item.kind==='window')for(let z=0;z<=wall.height-height+.001;z+=.25)elevations.push(z);
   for(const z of elevations){item.bottom=round(z);for(let t=wall.start;t<=wall.end-width+.001;t+=.25){item.start=round(t);if(!openings.some(i=>openingOverlap(item,i))){placed=true;break;}}if(placed)break;}
   if(!placed)return {error:sideNames[item.side]+': there is not enough clear wall for '+item.label+'. Choose another wall or remove an opening.',field};
  }
  if(openings.some(i=>openingOverlap(item,i)))return {error:'Door and window symbols overlap. Reset opening positions.',field,action:'reset-openings'};
  openings.push(item);
 }
 return {openings};
}
export function openingDelta(svg,side,dx,dy){
 const box=svg.getBoundingClientRect(),pixelScale=Math.min(box.width/960,box.height/740),scale=Number(svg.getAttribute('data-projection-scale'));
 if(!pixelScale||!scale)return null;
 const along=dx/pixelScale/scale/(side==='back'||side==='front'?.8:-.8);
 return {start:along,bottom:(.38*along-dy/pixelScale/scale)/.85};
}
export function bindOpenings(scene,plan,render,notice,moved,selected=()=>{}){
 let drag=null;
 const select=id=>{scene.dataset.selectedItem=id;const item=plan.openings.find(i=>i.id===id);selected(item);return item;};
 const commit=(id,start,bottom,preview=false)=>{const result=moveOpening(plan.openings,id,start,bottom,plan.wallSegments,preview);if(result.error){notice(result.error);return false;}plan.openings=result.openings;render(id);return true;};
 scene.addEventListener('pointerdown',e=>{
  const face=e.target.closest?.('[data-opening-id]');if(!face||e.button!==0)return;
  const item=select(face.getAttribute('data-opening-id'));e.preventDefault();drag={id:item.id,side:item.side,start:item.start,bottom:item.bottom,x:e.clientX,y:e.clientY,original:plan.openings.map(i=>({...i}))};scene.setPointerCapture?.(e.pointerId);scene.classList.add('is-dragging');render(item.id);
 });
 scene.addEventListener('pointermove',e=>{if(!drag)return;const d=openingDelta(scene.querySelector('svg'),drag.side,e.clientX-drag.x,e.clientY-drag.y);if(d)commit(drag.id,drag.start+d.start,drag.bottom+d.bottom,true);});
 const finish=e=>{if(!drag)return;const item=plan.openings.find(i=>i.id===drag.id),result=moveOpening(plan.openings,item.id,item.start,item.bottom,plan.wallSegments);
  if(e.type==='pointercancel'||result.error){plan.openings=drag.original;render(item.id);notice(e.type==='pointercancel'?'':result.error+' The opening returned to its starting position.');}
  const id=drag.id;drag=null;scene.classList.remove('is-dragging');if(scene.hasPointerCapture?.(e.pointerId))scene.releasePointerCapture(e.pointerId);moved(plan.openings.find(i=>i.id===id));};
 scene.addEventListener('pointerup',finish);scene.addEventListener('pointercancel',finish);
 scene.addEventListener('focusin',e=>{const face=e.target.closest?.('[data-opening-id]');if(face)select(face.getAttribute('data-opening-id'));});
 scene.addEventListener('keydown',e=>{
  const face=e.target.closest?.('[data-opening-id]');if(!face||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();const item=select(face.getAttribute('data-opening-id')),step=e.shiftKey?1:.25;
  if(commit(item.id,item.start+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),item.bottom+(e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0))){notice('');scene.querySelector('[data-opening-id="'+item.id+'"][tabindex]')?.focus();moved(plan.openings.find(i=>i.id===item.id));}
 });
}
