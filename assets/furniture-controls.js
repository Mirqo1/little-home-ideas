import {moveFurniture} from './layout-plan.js?v=friendly2-20261014';
export function floorDelta(svg,dx,dy){
 const box=svg.getBoundingClientRect(),pixelScale=Math.min(box.width/960,box.height/740),scale=Number(svg.getAttribute('data-projection-scale'));
 if(!Number.isFinite(pixelScale)||pixelScale<=0||!Number.isFinite(scale)||scale<=0)return null;
 const difference=dx/pixelScale/scale/.8,sum=dy/pixelScale/scale/.38;
 return {x:(sum+difference)/2,y:(sum-difference)/2};
}
export function bindFurniture(scene,plan,render,notice,moved){
 let drag=null;
 const select=id=>{scene.dataset.selectedItem=id;return plan.items.find(i=>i.id===id);};
 const commit=(id,x,y)=>{const next=moveFurniture(plan.items,id,x,y,plan.patioWidth,plan.depth);if(next.error){notice(next.error);return false;}plan.items=next.items;notice('');render(id);return true;};
 scene.addEventListener('pointerdown',e=>{
  const face=e.target.closest?.('[data-item-id]');if(!face||e.button!==0)return;
  const id=face.getAttribute('data-item-id'),item=select(id),svg=scene.querySelector('svg');if(!item)return;
  e.preventDefault();drag={id,x:item.x,y:item.y,clientX:e.clientX,clientY:e.clientY,svg};scene.setPointerCapture?.(e.pointerId);scene.classList.add('is-dragging');render(id);
 });
 scene.addEventListener('pointermove',e=>{
  if(!drag)return;const delta=floorDelta(scene.querySelector('svg'),e.clientX-drag.clientX,e.clientY-drag.clientY);
  if(delta)commit(drag.id,drag.x+delta.x,drag.y+delta.y);
 });
 const finish=e=>{if(!drag)return;const id=drag.id;drag=null;scene.classList.remove('is-dragging');if(scene.hasPointerCapture?.(e.pointerId))scene.releasePointerCapture(e.pointerId);moved(plan.items.find(i=>i.id===id));};
 scene.addEventListener('pointerup',finish);scene.addEventListener('pointercancel',finish);
 scene.addEventListener('keydown',e=>{
  const face=e.target.closest?.('[data-item-id]');if(!face||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();const id=face.getAttribute('data-item-id'),item=select(id),step=e.shiftKey?1:.25;
  if(commit(id,item.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),item.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0))){
   scene.querySelector('[data-item-id="'+id+'"][tabindex]')?.focus();moved(plan.items.find(i=>i.id===id));
  }
 });
}
