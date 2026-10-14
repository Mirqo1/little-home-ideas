import {spaceFeatures,sideNames} from './space-features.js?v=plants-20261014';
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
export function rotateFurniture(items,id,W,D,turn=90){
 const index=items.findIndex(i=>i.id===id),item=items[index];
 if(!item||!['chair','bench'].includes(item.kind)||![W,D,turn].every(Number.isFinite)||turn%90!==0)return {error:'Select a chair or bench to rotate.'};
 const rotation=((item.rotation??0)+turn%360+360)%360,bw=item.baseW??item.w,bd=item.baseD??item.d,w=rotation%180?bd:bw,d=rotation%180?bw:bd;
 if(w>W||d>D)return {error:'The rotated seat does not fit this floor. Keep its current direction or change its dimensions.'};
 const next={...item,baseW:bw,baseD:bd,rotation,w,d,x:Math.min(Math.max(0,item.x+(item.w-w)/2),W-w),y:Math.min(Math.max(0,item.y+(item.d-d)/2),D-d)};
 if(items.some((other,i)=>i!==index&&overlaps(next,other)))return {error:'The rotated seat would overlap another piece. Move it to a clear area first.'};
 return {items:items.map((i,n)=>n===index?next:{...i})};
}
function freePosition(item,occupied,W,D){
 if(item.w>W||item.d>D)return null;
 const xs=[...Array(Math.floor((W-item.w)*2)+1)].map((_,n)=>n*.5),ys=[...Array(Math.floor((D-item.d)*2)+1)].map((_,n)=>n*.5);
 xs.push(W-item.w);ys.push(D-item.d);
 for(const y of ys)for(const x of xs){const placed={...item,x,y};if(!occupied.some(i=>overlaps(placed,i)))return placed;}
 return null;
}
export function planLayout(o){
 const {patioWidth:W,depth:D,height}=o,hasScreens=Array.isArray(o.boundaries)&&o.boundaries.some(b=>b.screen),estimatePanels=o.estimatePanels!==false,panelWidth=estimatePanels?o.panelWidth:3;
 const fail=(error,field,action)=>({error,field,action});
 if(!Number.isFinite(W)||W<1||W>100||!Number.isFinite(D)||D<2||D>100)return fail('Enter a floor width of 1–100 ft and depth of 2–100 ft.',!Number.isFinite(W)||W<1||W>100?'patio-width':'depth');
 if(!['patio','balcony'].includes(o.space))return {error:'Choose a valid space type.'};
 if(hasScreens&&(!Number.isFinite(height)||height<1||height>10))return fail('Enter a screen top height of 1–10 ft.','screen-height');
 if(estimatePanels&&(!Number.isFinite(panelWidth)||panelWidth<.1||panelWidth>100))return fail('Enter a usable panel width of 0.1–100 ft.','panel-width');
 if(o.hasRoof&&(!Number.isFinite(o.roofHeight)||o.roofHeight<2||o.roofHeight>30))return fail('Enter the floor-to-roof distance (2–30 ft).','roof-height');
 if(o.hasRoof&&hasScreens&&height>o.roofHeight)return fail('The screen top ('+height+' ft) is higher than the roof underside ('+o.roofHeight+' ft). Lower the screen top or correct the roof measurement.','screen-height');
 const room=spaceFeatures({...o,hasRoof:false,screenSide:'back',walls:[],hasRailing:false,screenMode:'full',height:hasScreens?height:1});
 if(room.error)return fail(room.error,'seat-width','remove-furniture');
 if(!Array.isArray(o.boundaries)||o.boundaries.length!==4||new Set(o.boundaries.map(b=>b.side)).size!==4||o.boundaries.some(b=>!Object.hasOwn(sideNames,b.side)))return {error:'Provide each of the four sides once.'};
 const wallSegments=[],railSegments=[],screens=[];
 for(const b of o.boundaries){
  const L=['back','front'].includes(b.side)?W:D;
  let wallLength=0;
  if(b.wall){
   if(!Number.isFinite(o.wallHeight)||o.wallHeight<1||o.wallHeight>30)return fail('Enter a wall height from the floor (1–30 ft).','wall-height');
   wallLength=b.rail?b.wallLength:L;
   if(!Number.isFinite(wallLength)||wallLength<=0||wallLength>=L&&b.rail)return fail(sideNames[b.side]+': enter a wall length greater than 0 and shorter than '+L+' ft, leaving room for the railing.',b.side+'-wall-length');
   if(!['start','end'].includes(b.wallAt??'start'))return {error:'Choose where the wall starts.'};
   const start=b.wallAt==='end'?L-wallLength:0;
   wallSegments.push({side:b.side,start,end:start+wallLength,height:o.wallHeight});
  }
  const start=b.wall&&b.wallAt!=='end'?wallLength:0,end=b.wall&&b.wallAt==='end'?L-wallLength:L,openLength=end-start;
  if(b.rail){
   if(!Number.isFinite(o.railHeight)||o.railHeight<.5||o.railHeight>10)return fail('Enter a railing height from the floor (0.5–10 ft).','rail-height');
   railSegments.push({side:b.side,start,end,height:o.railHeight});
  }
  if(b.screen){
   if(openLength<=0)return {error:sideNames[b.side]+': this side is entirely wall. Remove the screen or describe a wall-and-railing split.'};
   if(!['full','above'].includes(b.mode))return {error:'Choose a valid screen position.'};
   const base=b.rail&&b.mode==='above'?o.railHeight:0;
   if(height<=base)return fail(sideNames[b.side]+': the screen top ('+height+' ft) must be above the railing ('+base+' ft). Increase the top height or cover the railing too.','screen-height');
   const width=b.screenWidth===null?openLength:b.screenWidth;
   if(!Number.isFinite(width)||width<=0||width>openLength+.001)return fail(sideNames[b.side]+': the available section is '+round(openLength)+' ft, but the requested screen is '+width+' ft. Use a shorter length or cover the full available section.',b.side+'-screen-width','full-section');
   const modules=Math.ceil(width/panelWidth),coverage=round(modules*panelWidth),surplus=round(coverage-width);
   screens.push({side:b.side,start,width,base,height,span:round(height-base),modules,coverage,surplus,fits:!estimatePanels||coverage<=openLength+.001,available:round(openLength)});
  }
 }
 const reviewNotes=estimatePanels?screens.filter(s=>!s.fits).map(s=>sideNames[s.side]+': '+s.modules+' whole panels would cover '+s.coverage+' ft; the available section is '+s.available+' ft. The drawing shows your requested '+s.width+' ft, not an approved panel fit. Compare a different system; only shorten panels if its instructions allow it.'):[];
 let items=room.items.map((i,index)=>({...i,baseW:i.w,baseD:i.d,rotation:0,id:'item-'+index,label:i.kind==='table'?'Table':i.kind==='bench'?'Bench':'Chair '+(index===0?'1':'2')}));
 const plantCount=o.plantCount??0,plantStyle=o.plantStyle??'thuja',plantWidth=o.plantWidth??1.5,plantHeight=o.plantHeight??4;
 if(!Number.isInteger(plantCount)||plantCount<0||plantCount>6||!['thuja','leafy'].includes(plantStyle))return fail('Choose 0–6 potted plants and a valid illustration.','plant-count');
 if(plantCount&&(!Number.isFinite(plantWidth)||plantWidth<.5||plantWidth>5||!Number.isFinite(plantHeight)||plantHeight<1||plantHeight>8))return fail('Enter a plant footprint width of 0.5–5 ft and total height of 1–8 ft.','plant-width');
 if(plantCount&&o.hasRoof&&plantHeight>o.roofHeight)return fail('The plant height ('+plantHeight+' ft) exceeds the roof underside ('+o.roofHeight+' ft). Enter a shorter total plant height or correct the roof measurement.','plant-height');
 for(let n=0;n<plantCount;n++){
  const item={id:'plant-'+n,kind:'plant',plantStyle,label:(plantStyle==='thuja'?'Potted thuja ':'Potted leafy plant ')+(n+1),w:plantWidth,d:plantWidth,baseW:plantWidth,baseD:plantWidth,rotation:0,height:plantHeight};
  const placed=freePosition(item,items,W,D);
  if(!placed)return fail('There is not enough clear floor space for all these plant footprints. Use fewer or smaller plants, or change the furniture.','plant-count');
  items.push(placed);
 }
 const defaultItems=items.map(i=>({...i})),customItems=o.poses??o.items;
 if(customItems!==undefined){
  if(!Array.isArray(customItems)||(o.items!==undefined&&customItems.length!==items.length))return {error:'The furniture selection changed. Reset its layout.'};
  const supplied=new Map(customItems.map(i=>[i.id,i])),placedIds=new Set();
  for(let n=0;n<items.length;n++){
   const item=items[n],custom=supplied.get(item.id);if(!custom)continue;
   if(o.poses!==undefined&&((custom.baseW??custom.w)!==item.baseW||(custom.baseD??custom.d)!==item.baseD))continue;
   const rotation=custom.rotation??0;
   if(![0,90,180,270].includes(rotation)||(!['chair','bench'].includes(item.kind)&&rotation!==0))return fail('Choose a seating direction in 90-degree steps.','furniture','reset-furniture');
   const w=rotation%180?item.baseD:item.baseW,d=rotation%180?item.baseW:item.baseD;
   if(!Number.isFinite(custom.x)||!Number.isFinite(custom.y)||custom.x<0||custom.y<0||custom.x+w>W+.001||custom.y+d>D+.001)return fail('A moved piece no longer fits this floor. Reset its positions for the new floor or restore the old floor dimensions.','patio-width','reset-furniture');
   items[n]={...item,x:custom.x,y:custom.y,rotation,w,d};placedIds.add(item.id);
  }
  // New plants find a free spot around the user's existing arrangement.
  for(let n=0;n<items.length;n++)if(items[n].kind==='plant'&&!placedIds.has(items[n].id)){
   const others=items.filter((_,i)=>i!==n);if(others.some(i=>overlaps(items[n],i))){
    const placed=freePosition(items[n],others,W,D);if(!placed)return fail('There is no clear spot for the new plant. Use fewer plants or reset item positions.','plant-count','reset-furniture');items[n]=placed;
   }
  }
  if(items.some((a,i)=>items.some((b,j)=>j>i&&overlaps(a,b))))return fail('Item footprints overlap. Reset their positions or separate them.','furniture','reset-furniture');
 }
 const modules=screens.reduce((s,i)=>s+i.modules,0),coverage=round(screens.reduce((s,i)=>s+i.coverage,0)),width=round(screens.reduce((s,i)=>s+i.width,0)),surplus=round(coverage-width),fits=screens.every(s=>s.fits);
 const price=o.modulePrice??null,extras=o.extraCost??0;
 if(price!==null&&(!Number.isFinite(price)||price<0||price>100000)||!Number.isFinite(extras)||extras<0||extras>100000)return {error:'Enter valid nonnegative prices, or leave the module price blank.'};
 return {...room,estimatePanels,reviewNotes,roofHeight:o.hasRoof?o.roofHeight:null,space:o.space,patioWidth:W,depth:D,height,panelWidth,wallHeight:wallSegments.length?o.wallHeight:null,railHeight:railSegments.length?o.railHeight:null,walls:wallSegments.map(s=>s.side),railSides:railSegments.map(s=>s.side),wallSegments,railSegments,screens,items,defaultItems,plantCount,plantStyle,plantWidth,plantHeight,modules,coverage,width,surplus,fits,modulePrice:price,extraCost:extras,total:price===null?null:round(modules*price+extras),restricted:false,
 summary:modules+' example modules across '+screens.length+' sides. Counts are rounded up separately on each side; modules cannot be transferred around a corner. Supports and overlaps can change usable coverage.',
 warning:'A geometric layout only. Verify wind limits, product installation, permitted fixings, exits, and walking clearance.'+(o.space==='balcony'?' For a balcony, confirm building permission, guard requirements, drainage, and permitted loads. Screens are not replacement guards and railing attachments are not assessed.':'')};
}
