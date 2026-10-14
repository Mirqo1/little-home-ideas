export const sideNames={back:'A · far side',right:'B · right side',front:'C · near side',left:'D · left side'};
export function spaceFeatures(o){
 const {patioWidth:w,depth:d,height}=o;
 const side=o.screenSide??'back',walls=o.walls??[],railSides=o.hasRailing?(o.railSides??['back']):[];
 if(!Object.hasOwn(sideNames,side)||!Array.isArray(walls)||!Array.isArray(railSides)||[...walls,...railSides].some(s=>!Object.hasOwn(sideNames,s)))return {error:'Choose valid boundary sides.'};
 if(walls.includes(side))return {error:'The screening side already has a wall. Choose an open side.'};
 if(railSides.some(s=>walls.includes(s)))return {error:'A side cannot be both a solid wall and a railing in this layout.'};
 const valid=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
 const roofHeight=o.hasRoof?o.roofHeight:null,railHeight=o.hasRailing?o.railHeight:null,wallHeight=walls.length?(o.wallHeight??8):null;
 if(o.hasRoof&&!valid(roofHeight,2,30))return {error:'Enter a roof underside height of 2–30 feet.'};
 if(o.hasRailing&&(!valid(railHeight,.5,10)||!railSides.length))return {error:'Enter a railing height of 0.5–10 feet and select at least one railing side.'};
 if(walls.length&&!valid(wallHeight,1,30))return {error:'Enter an existing wall height of 1–30 feet.'};
 const mode=o.screenMode??'full';if(!['full','above'].includes(mode))return {error:'Choose a valid screening position.'};
 if(mode==='above'&&!railSides.includes(side))return {error:'Screening above a railing requires a railing on the chosen screening side.'};
 const screenBase=mode==='above'?railHeight:0;
 if(height<=screenBase)return {error:'The top of the screen must be above the railing height.'};
 if(roofHeight!==null&&height>roofHeight)return {error:'The top of the screen exceeds the roof underside. Lower the target height or correct the roof measurement.'};
 const boundaryLength=['left','right'].includes(side)?d:w;
 const furniture=o.furniture??'none',position=o.furniturePosition??'center';
 if(!['none','bistro','bench'].includes(furniture)||!['left','center','right'].includes(position))return {error:'Choose a valid furniture layout.'};
 let items=[],furnitureWidth=0,furnitureDepth=0;
 if(furniture!=='none'){
  const sw=o.seatWidth??(furniture==='bench'?4:2),sd=o.seatDepth??2,tw=o.tableWidth??2,td=o.tableDepth??2;
  if(![sw,sd,tw,td].every(v=>valid(v,.5,20)))return {error:'Enter furniture widths and depths from 0.5–20 feet.'};
  furnitureWidth=furniture==='bistro'?2*sw+tw+1:Math.max(sw,tw);
  furnitureDepth=furniture==='bistro'?Math.max(sd,td):sd+td+.5;
  if(furnitureWidth>w||furnitureDepth>d)return {error:'This furniture arrangement needs '+furnitureWidth+' × '+furnitureDepth+' feet before walking clearance. Use smaller dimensions or remove the furniture.'};
  const x=position==='left'?0:position==='right'?w-furnitureWidth:(w-furnitureWidth)/2,y=d-furnitureDepth;
  if(furniture==='bistro')items=[{kind:'chair',x,y,w:sw,d:sd},{kind:'table',x:x+sw+.5,y,w:tw,d:td},{kind:'chair',x:x+sw+tw+1,y,w:sw,d:sd}];
  else items=[{kind:'bench',x:x+(furnitureWidth-sw)/2,y,w:sw,d:sd},{kind:'table',x:x+(furnitureWidth-tw)/2,y:y+sd+.5,w:tw,d:td}];
 }
 return {screenSide:side,boundaryLength,walls:[...new Set(walls)],railSides:[...new Set(railSides)],roofHeight,railHeight,wallHeight,screenMode:mode,screenBase,screenSpan:Number((height-screenBase).toFixed(2)),furniture,furniturePosition:position,items,furnitureWidth,furnitureDepth};
}
