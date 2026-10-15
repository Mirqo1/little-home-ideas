// All dimensions are in inches. Four decimal places and bounded geometry keep
// the drawing and stock count consistent without an area-only approximation.
const EPS=1e-7;
export const maxTilePositions=2500;
export function parseMeasurement(value){
 const s=String(value??'').trim();if(!/^(?:\d+(?:[.,]\d{1,4})?|[.,]\d{1,4})$/.test(s))return NaN;return Number(s.replace(',','.'));
}
const tidy=n=>Math.round(n*10000)/10000;
function axis(span,tile,gap,offset){
 const pitch=tile+gap,first=Math.floor(-offset/pitch)-1,last=Math.ceil((span-offset)/pitch)+1,out=[];
 if(last-first>maxTilePositions+4)throw Error('This grid has too many pieces. Try larger tiles or a smaller floor.');
 for(let k=first;k<=last;k++){const start=offset+k*pitch,a=Math.max(0,start),b=Math.min(span,start+tile);if(b-a>EPS)out.push({start:tidy(a),length:tidy(b-a),cut:b-a<tile-EPS});}
 return out;
}
function axisLayout(span,tile,gap,centered){
 if(!centered)return {pieces:axis(span,tile,gap,0),alignment:'corner'};
 const candidates=[{offset:(span-tile)/2,alignment:'tile centered'},{offset:(span-gap)/2-tile,alignment:'joint centered'}].map(c=>{
  const pieces=axis(span,tile,gap,c.offset),first=pieces[0],last=pieces.at(-1);
  const edges=first&&last&&first.start<EPS&&Math.abs(last.start+last.length-span)<EPS?Math.min(first.length,last.length):0;
  return {...c,pieces,edges};
 });
 candidates.sort((a,b)=>b.edges-a.edges||a.pieces.length-b.pieces.length);return candidates[0];
}
export function planTiles(o){
 const fail=(error,field)=>({error,field});
 for(const [key,label,min,max]of [['width','Floor width',1,1200],['depth','Floor depth',1,1200],['tileWidth','Tile width',.25,120],['tileDepth','Tile length',.25,120],['joint','Joint width',0,2],['perimeter','Perimeter gap',0,12],['extraPercent','Extra pieces',0,50]])if(!Number.isFinite(o[key])||o[key]<min||o[key]>max)return fail(label+': enter '+min+'–'+max+(key==='extraPercent'?' percent.':' inches.'),key);
 if(!['corner','centered'].includes(o.layout)||![0,90].includes(o.rotation))return fail('Choose a corner or centered layout and a 0° or 90° tile direction.','layout');
 if(o.perBox!==null&&(!Number.isInteger(o.perBox)||o.perBox<1||o.perBox>1000))return fail('Pieces per box: enter a whole number from 1 to 1,000, or leave it blank.','perBox');
 if(o.boxPrice!==null&&(!Number.isFinite(o.boxPrice)||o.boxPrice<0||o.boxPrice>100000))return fail('Box price: enter $0–$100,000, or leave it blank.','boxPrice');
 const W=tidy(o.width-2*o.perimeter),D=tidy(o.depth-2*o.perimeter);if(W<=0||D<=0)return fail('The perimeter gap leaves no tiled floor. Reduce the gap or correct the floor dimensions.','perimeter');
 const a=o.rotation?o.tileDepth:o.tileWidth,b=o.rotation?o.tileWidth:o.tileDepth;
 let x,y;try{x=axisLayout(W,a,o.joint,o.layout==='centered');y=axisLayout(D,b,o.joint,o.layout==='centered');}catch(e){return fail(e.message,'tileWidth');}
 if(!x.pieces.length||!y.pieces.length||x.pieces.length*y.pieces.length>maxTilePositions)return fail('Keep this visual plan to 2,500 tile positions. Try larger tiles or a smaller floor.','tileWidth');
 const pieces=[];let area=0,full=0;const cuts=new Map();
 for(const [r,yp]of y.pieces.entries())for(const [c,xp]of x.pieces.entries()){
  const cut=xp.cut||yp.cut,p={id:pieces.length+1,row:r,col:c,x:tidy(xp.start+o.perimeter),y:tidy(yp.start+o.perimeter),w:xp.length,d:yp.length,cut};pieces.push(p);area+=p.w*p.d;
  if(!cut)full++;else{const key=p.w+' × '+p.d;const record=cuts.get(key)??{w:p.w,d:p.d,count:0};record.count++;cuts.set(key,record);}
 }
 const base=pieces.length,extra=Math.ceil(base*o.extraPercent/100-EPS),required=base+extra,boxes=o.perBox===null?null:Math.ceil(required/o.perBox),purchased=boxes===null?required:boxes*o.perBox;
 const edgeGaps={right:tidy(W-(x.pieces.at(-1).start+x.pieces.at(-1).length)),bottom:tidy(D-(y.pieces.at(-1).start+y.pieces.at(-1).length))};
 return {...o,usableWidth:W,usableDepth:D,orientedWidth:a,orientedDepth:b,columns:x.pieces.length,rows:y.pieces.length,pieces,full,cut:base-full,base,extra,required,boxes,purchased,boxSurplus:purchased-required,cost:boxes===null||o.boxPrice===null?null:tidy(boxes*o.boxPrice),floorArea:tidy(o.width*o.depth/144),tileArea:tidy(area/144),cuts:[...cuts.values()],alignment:'Width: '+x.alignment+'; depth: '+y.alignment,edgeGaps};
}
export function tileSvg(document,p,{interactive=false,selected=1}={}){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');const node=(tag,attrs={},text)=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;};
 const scale=640/Math.max(p.width,p.depth),w=p.width*scale,d=p.depth*scale,left=62,top=48;
 svg.setAttribute('viewBox',`0 0 ${w+124} ${d+110}`);svg.setAttribute('class','tile-drawing');svg.setAttribute('role',interactive?'group':'img');svg.setAttribute('aria-label',`Tile plan: ${p.width} by ${p.depth} inches, ${p.full} full tiles and ${p.cut} cut positions.`);svg.setAttribute('xmlns',ns);
 const defs=node('defs'),pattern=node('pattern',{id:'cut-hatch',width:8,height:8,patternUnits:'userSpaceOnUse'});pattern.append(node('rect',{width:8,height:8,fill:'#e7d9be'}),node('path',{d:'M-2 2L2-2M0 8L8 0M6 10L10 6',stroke:'#b89965','stroke-width':.7}));defs.append(pattern);svg.append(defs);
 svg.append(node('rect',{x:left,y:top,width:w,height:d,fill:'#e9e5dc',stroke:'#294b3c','stroke-width':1.5}));
 const fmt=n=>Number(n.toFixed(4));
 for(const tile of p.pieces){const rect=node('rect',{x:left+tile.x*scale,y:top+tile.y*scale,width:tile.w*scale,height:tile.d*scale,fill:tile.cut?'url(#cut-hatch)':'#a7bdad',stroke:interactive&&tile.id===selected?'#1a392b':'#53705d','stroke-width':interactive&&tile.id===selected?3:.55,'data-tile':tile.id});rect.append(node('title',{},`Piece ${tile.id}: ${fmt(tile.w)} × ${fmt(tile.d)} in${tile.cut?' — cut position; one source tile allowed':' — full tile'}`));
  if(interactive){rect.setAttribute('role','button');rect.setAttribute('tabindex',tile.id===selected?'0':'-1');rect.setAttribute('aria-label',`Piece ${tile.id}: ${fmt(tile.w)} by ${fmt(tile.d)} inches${tile.cut?', cut position':', full tile'}`);rect.setAttribute('aria-pressed',tile.id===selected?'true':'false');}
  svg.append(rect);
 }
 svg.append(node('text',{x:left+w/2,y:25,'text-anchor':'middle',fill:'#294b3c','font-family':'Arial,sans-serif','font-size':15},fmt(p.width)+' in floor width'),node('text',{x:12,y:top+d/2,transform:`rotate(-90 12 ${top+d/2})`,'text-anchor':'middle',fill:'#294b3c','font-family':'Arial,sans-serif','font-size':15},fmt(p.depth)+' in floor depth'));
 return svg;
}
