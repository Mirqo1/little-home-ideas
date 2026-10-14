import {moveFurniture,rotateFurniture} from './layout-plan.js?v=sides-20261014';
export function floorDelta(svg,dx,dy){
 const box=svg.getBoundingClientRect(),pixelScale=Math.min(box.width/960,box.height/740),scale=Number(svg.getAttribute('data-projection-scale'));
 if(!Number.isFinite(pixelScale)||pixelScale<=0||!Number.isFinite(scale)||scale<=0)return null;
 const difference=dx/pixelScale/scale/.8,sum=dy/pixelScale/scale/.38;
 return {x:(sum+difference)/2,y:(sum-difference)/2};
}
export function bindFurniture(scene,plan,render,notice,moved,selected=()=>{}){
 let drag=null;
 const select=id=>{scene.dataset.selectedItem=id;const item=plan.items.find(i=>i.id===id);selected(item);return item;};
 const commit=(id,x,y,preview=false)=>{const next=moveFurniture(plan.items,id,x,y,plan.patioWidth,plan.depth,preview);if(next.error){notice(next.error);return false;}plan.items=next.items;notice('');render(id);return true;};
 scene.addEventListener('pointerdown',e=>{
  const face=e.target.closest?.('[data-item-id]');if(!face||e.button!==0)return;
  const id=face.getAttribute('data-item-id'),item=select(id),svg=scene.querySelector('svg');if(!item)return;
  e.preventDefault();drag={id,x:item.x,y:item.y,clientX:e.clientX,clientY:e.clientY,svg,original:plan.items.map(i=>({...i}))};scene.setPointerCapture?.(e.pointerId);scene.classList.add('is-dragging');render(id);
 });
 scene.addEventListener('pointermove',e=>{
  if(!drag)return;const delta=floorDelta(scene.querySelector('svg'),e.clientX-drag.clientX,e.clientY-drag.clientY);
  if(delta)commit(drag.id,drag.x+delta.x,drag.y+delta.y,true);
 });
 const finish=e=>{if(!drag)return;const id=drag.id,item=plan.items.find(i=>i.id===id),next=moveFurniture(plan.items,id,item.x,item.y,plan.patioWidth,plan.depth);
  if(e.type==='pointercancel'||next.error){plan.items=drag.original;render(id);notice(e.type==='pointercancel'?'':"That spot is occupied. The piece returned to its starting position. Drag across other pieces and release on a clear spot.");}
  drag=null;scene.classList.remove('is-dragging');if(scene.hasPointerCapture?.(e.pointerId))scene.releasePointerCapture(e.pointerId);moved(plan.items.find(i=>i.id===id));};
 scene.addEventListener('pointerup',finish);scene.addEventListener('pointercancel',finish);
 scene.addEventListener('focusin',e=>{const face=e.target.closest?.('[data-item-id]');if(face)select(face.getAttribute('data-item-id'));});
 scene.addEventListener('keydown',e=>{
  const face=e.target.closest?.('[data-item-id]');if(!face||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','r','R'].includes(e.key))return;
  e.preventDefault();const id=face.getAttribute('data-item-id'),item=select(id),step=e.shiftKey?1:.25;
  if(e.key.toLowerCase()==='r'){
   if(!['chair','bench'].includes(item.kind))return;
   const next=rotateFurniture(plan.items,id,plan.patioWidth,plan.depth,e.shiftKey?-90:90);
   if(next.error){notice(next.error);return;}plan.items=next.items;notice('');render(id);scene.querySelector('[data-item-id="'+id+'"][tabindex]')?.focus();moved(plan.items.find(i=>i.id===id));return;
  }
  if(commit(id,item.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),item.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0))){
   scene.querySelector('[data-item-id="'+id+'"][tabindex]')?.focus();moved(plan.items.find(i=>i.id===id));
  }
 });
}
