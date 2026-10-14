import {spaceFeatures,sideNames} from './space-features.js?v=editor2-20261014';
export {sideNames};
const round=n=>Number(n.toFixed(2));
export function overlaps(a,b){return a.x<b.x+b.w-.001&&a.x+a.w>b.x+.001&&a.y<b.y+b.d-.001&&a.y+a.d>b.y+.001;}
export function moveFurniture(items,id,x,y,W,D){
 const index=items.findIndex(i=>i.id===id);if(index<0||![x,y,W,D].every(Number.isFinite))return {error:'Select a valid furniture position.'};
 const item=items[index];if(item.w>W||item.d>D)return {error:'This furniture piece does not fit the floor.'};
 const next={...item,x:Math.min(round(Math.max(0,x)),W-item.w),y:Math.min(round(Math.max(0,y)),D-item.d)};
 if(items.some((other,i)=>i!==index&&overlaps(next,other)))return {error:'Furniture pieces overlap. Move this piece to a clear part of the floor.'};
 return {items:items.map((i,n)=>n===index?next:{...i})};
}
export function planLayout(o){
 const {patioWidth:W,depth:D,height,panelWidth}=o;
 if(!Number.isFinite(W)||W<1||W>100||!Number.isFinite(D)||D<2||D>100)return {error:'Enter a floor width of 1–100 ft and depth of 2–100 ft.'};
 if(!['patio','balcony'].includes(o.space))return {error:'Choose a valid space type.'};
 if(!Number.isFinite(height)||height<1||height>10||!Number.isFinite(panelWidth)||panelWidth<1||panelWidth>10)return {error:'Enter a screen top height of 1–10 ft and module width of 1–10 ft.'};
 const room=spaceFeatures({...o,screenSide:'back',walls:[],hasRailing:false,screenMode:'full',height});
 if(room.error)return room;
 if(!Array.isArray(o.boundaries)||o.boundaries.length!==4||new Set(o.boundaries.map(b=>b.side)).size!==4||o.boundaries.some(b=>!Object.hasOwn(sideNames,b.side)))return {error:'Provide each of the four sides once.'};
 const wallSegments=[],railSegments=[],screens=[];
 for(const b of o.boundaries){
  const L=['back','front'].includes(b.side)?W:D;
  let wallLength=0;
  if(b.wall){
   if(!Number.isFinite(o.wallHeight)||o.wallHeight<1||o.wallHeight>30)return {error:'Enter an existing wall height of 1–30 ft.'};
   wallLength=b.rail?b.wallLength:L;
   if(!Number.isFinite(wallLength)||wallLength<=0||wallLength>=L&&b.rail)return {error:sideNames[b.side]+': wall length must be greater than zero and shorter than this side when there is also a railing.'};
   if(!['start','end'].includes(b.wallAt??'start'))return {error:'Choose where the wall starts.'};
   const start=b.wallAt==='end'?L-wallLength:0;
   wallSegments.push({side:b.side,start,end:start+wallLength,height:o.wallHeight});
  }
  const start=b.wall&&b.wallAt!=='end'?wallLength:0,end=b.wall&&b.wallAt==='end'?L-wallLength:L,openLength=end-start;
  if(b.rail){
   if(!Number.isFinite(o.railHeight)||o.railHeight<.5||o.railHeight>10)return {error:'Enter a railing height of 0.5–10 ft.'};
   railSegments.push({side:b.side,start,end,height:o.railHeight});
  }
  if(b.screen){
   if(openLength<=0)return {error:sideNames[b.side]+': this side is entirely wall. Remove the screen or describe a wall-and-railing split.'};
   if(!['full','above'].includes(b.mode))return {error:'Choose a valid screen position.'};
   if(b.mode==='above'&&!b.rail)return {error:sideNames[b.side]+': above-railing screening needs a railing on this side.'};
   const base=b.mode==='above'?o.railHeight:0;
   if(height<=base)return {error:sideNames[b.side]+': the top of the screen must be above the railing.'};
   const width=b.screenWidth===null?openLength:b.screenWidth;
   if(!Number.isFinite(width)||width<=0||width>openLength+.001)return {error:sideNames[b.side]+': length to cover must fit the open/railing portion ('+round(openLength)+' ft).'};
   const modules=Math.ceil(width/panelWidth),coverage=round(modules*panelWidth),surplus=round(coverage-width);
   screens.push({side:b.side,start,width,base,height,span:round(height-base),modules,coverage,surplus,fits:coverage<=openLength+.001,available:round(openLength)});
  }
 }
 const overflow=screens.find(s=>!s.fits);
 if(overflow)return {error:sideNames[overflow.side]+': '+overflow.modules+' whole modules cover '+overflow.coverage+' ft, but only '+overflow.available+' ft is available. Reduce the length to cover or use a different module width.'};
 if(!screens.length)return {error:'Select a screen on at least one side.'};
 let items=room.items.map((i,index)=>({...i,id:'item-'+index,label:i.kind==='table'?'Table':i.kind==='bench'?'Bench':'Chair '+(index===0?'1':'2')}));
 const defaultItems=items.map(i=>({...i}));
 if(o.items!==undefined){
  if(!Array.isArray(o.items)||o.items.length!==items.length)return {error:'The furniture selection changed. Reset its layout.'};
  for(let n=0;n<items.length;n++){
   const custom=o.items[n],item=items[n];
   if(custom.id!==item.id||!Number.isFinite(custom.x)||!Number.isFinite(custom.y)||custom.x<0||custom.y<0||custom.x+item.w>W+.001||custom.y+item.d>D+.001)return {error:'A moved furniture piece no longer fits this floor. Restore the floor dimensions or reset furniture placement.'};
   items[n]={...item,x:custom.x,y:custom.y};
  }
  if(items.some((a,i)=>items.some((b,j)=>j>i&&overlaps(a,b))))return {error:'Furniture pieces overlap. Reset the furniture layout or separate them.'};
 }
 const modules=screens.reduce((s,i)=>s+i.modules,0),coverage=round(screens.reduce((s,i)=>s+i.coverage,0)),width=round(screens.reduce((s,i)=>s+i.width,0)),surplus=round(coverage-width),fits=screens.every(s=>s.fits);
 const price=o.modulePrice??null,extras=o.extraCost??0;
 if(price!==null&&(!Number.isFinite(price)||price<0||price>100000)||!Number.isFinite(extras)||extras<0||extras>100000)return {error:'Enter valid nonnegative prices, or leave the module price blank.'};
 return {...room,space:o.space,patioWidth:W,depth:D,height,panelWidth,wallHeight:wallSegments.length?o.wallHeight:null,railHeight:railSegments.length?o.railHeight:null,walls:wallSegments.map(s=>s.side),railSides:railSegments.map(s=>s.side),wallSegments,railSegments,screens,items,defaultItems,modules,coverage,width,surplus,fits,modulePrice:price,extraCost:extras,total:price===null?null:round(modules*price+extras),restricted:false,
 summary:modules+' example modules across '+screens.length+' sides. Counts are rounded up separately on each side; modules cannot be transferred around a corner. Supports and overlaps can change usable coverage.',
 warning:'A geometric layout only. Verify wind limits, product installation, permitted fixings, exits, and walking clearance.'+(o.space==='balcony'?' For a balcony, confirm building permission, guard requirements, drainage, and permitted loads. Screens are not replacement guards and railing attachments are not assessed.':'')};
}
