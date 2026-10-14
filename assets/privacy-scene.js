export function privacyScene(document,p,preview=false,{showRoof=true,showWalls=true,selectedItem=null,viewAngle=0}={}){
 const make=(tag,attrs={},text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text)e.textContent=text;return e;};
 const svg=make('svg',{viewBox:'0 0 960 640',role:(p.items?.length||p.openings?.length)?'group':'img','aria-labelledby':preview?'preview-title preview-desc':'plan-sketch-title plan-sketch-desc',class:preview?'plan-preview':'plan-sketch'});
 const screens=p.screens??[{side:p.screenSide??'back',start:0,width:p.width,coverage:p.coverage,base:p.screenBase??0,height:p.height,modules:p.modules}];
 const wallSegments=p.wallSegments??(p.walls??[]).map(side=>({side,start:0,end:['back','front'].includes(side)?p.patioWidth:p.depth,height:p.wallHeight}));
 const railSegments=p.railSegments??(p.railSides??[]).map(side=>({side,start:0,end:['back','front'].includes(side)?p.patioWidth:p.depth,height:p.railHeight}));
 const W=p.patioWidth,D=p.depth,top=Math.max(0,...screens.map(s=>s.height),p.roofHeight??0,p.wallHeight??0,p.railHeight??0,...(p.items??[]).map(i=>i.height??3.7),3.7),side=p.screenSide??'back',base=p.screenBase??0;
 const edge=(side,t,z=0)=>side==='back'?[t,0,z]:side==='front'?[t,D,z]:side==='left'?[0,t,z]:[W,t,z];
 const length=s=>['back','front'].includes(s)?W:D;
 const angle=viewAngle*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle),ground=([x,y])=>[cos*x-sin*y,sin*x+cos*y];
 const raw=([x,y,z=0])=>{const [u,v]=ground([x,y]);return [.8*(u-v),.38*(u+v)-.85*z];};
 svg.setAttribute('data-view-angle',viewAngle);
 const movableTop=Math.max(0,...(p.items??[]).map(i=>i.height??3.7));
 const geometry=[[0,0],[W,0],[W,D],[0,D],...screens.flatMap(s=>[edge(s.side,s.start,s.height),edge(s.side,s.start+s.width,s.height)]),...wallSegments.flatMap(s=>[edge(s.side,s.start,s.height),edge(s.side,s.end,s.height)]),...railSegments.flatMap(s=>[edge(s.side,s.start,s.height),edge(s.side,s.end,s.height)])];
 if(movableTop)geometry.push([0,0,movableTop],[W,0,movableTop],[W,D,movableTop],[0,D,movableTop]);
 if(p.roofHeight!=null)geometry.push([0,0,p.roofHeight],[W,0,p.roofHeight],[W,D,p.roofHeight],[0,D,p.roofHeight]);
 const bounds=geometry.map(raw),xs=bounds.map(q=>q[0]),ys=bounds.map(q=>q[1]),minX=Math.min(...xs),minY=Math.min(...ys),dx=Math.max(...xs)-minX,dy=Math.max(...ys)-minY,scale=912/dx,canvasHeight=Math.max(300,dy*scale+70);
 svg.setAttribute('viewBox','0 0 960 '+canvasHeight);
 svg.setAttribute('data-projection-scale',scale);svg.setAttribute('data-projection-x',(960-dx*scale)/2-minX*scale);svg.setAttribute('data-projection-y',25-minY*scale);
 const point=q=>{const [x,y]=raw(q);return [(x-minX)*scale+(960-dx*scale)/2,(y-minY)*scale+25];};
 const poly=(coords,attrs)=>make('polygon',{points:coords.map(q=>point(q).join(',')).join(' '),...attrs});
 const line=(a,b,attrs)=>{const u=point(a),v=point(b);return make('line',{x1:u[0],y1:u[1],x2:v[0],y2:v[1],...attrs});};
 const label=(q,text,ox=0,oy=0)=>{const [x,y]=point(q);return make('text',{x:x+ox,y:y+oy,fill:'#294b3c','font-size':17,'font-family':'Arial,sans-serif','text-anchor':'middle','paint-order':'stroke',stroke:'#f7f5ef','stroke-width':5,'stroke-linejoin':'round'},text);};
 svg.append(make('title',{id:preview?'preview-title':'plan-sketch-title'},'Your outdoor space in a 3D view'),make('desc',{id:preview?'preview-desc':'plan-sketch-desc'},W+' by '+D+' feet. '+screens.map(s=>s.side+': target '+s.width+' ft. Starts '+s.base+' feet above the floor; top '+s.height+' ft; '+(p.estimatePanels===false?'':s.modules+' estimated panels.')).join(' ')+' Roof '+(p.roofHeight??'none')+'; railing '+(p.railHeight??'none')+'; walls '+(p.walls?.join(', ')||'none')+'. '+(p.items?.length??0)+' furniture pieces. Geometry only; no structural or access approval.'));
 svg.append(make('rect',{x:0,y:0,width:960,height:canvasHeight,fill:'#f7f5ef',rx:8}));
 svg.append(poly([[0,0],[W,0],[W,D],[0,D]],{fill:'#e3e8dc',stroke:'#a1b09b','stroke-width':2}));
 for(let i=1;i<5;i++)svg.append(line([W*i/5,0],[W*i/5,D],{stroke:'#cad3c3'}),line([0,D*i/5],[W,D*i/5],{stroke:'#cad3c3'}));
 const surfaces=[];let drawingItem=null;
 const surface=(coords,attrs)=>{const locked=drawingItem&&(p.items??[]).find(i=>i.id===drawingItem)?.locked;surfaces.push({coords,attrs:drawingItem?{...attrs,'data-item-id':drawingItem,'class':'furniture-face'+(locked?' is-locked':''),...(locked?{'pointer-events':'none'}:{})}:attrs,depth:coords.reduce((v,q)=>v+ground(q)[0]+ground(q)[1],0)/coords.length});};
 if(showWalls)for(const wall of wallSegments){
  const holes=(p.openings??[]).filter(o=>o.side===wall.side),cuts=[wall.start,wall.end,...holes.flatMap(o=>[o.start,o.start+o.width])].sort((a,b)=>a-b),levels=[0,wall.height,...holes.flatMap(o=>[o.bottom,o.bottom+o.height])].sort((a,b)=>a-b);
  for(let i=0;i<cuts.length-1;i++)for(let j=0;j<levels.length-1;j++){
   const a=cuts[i],b=cuts[i+1],lo=levels[j],hi=levels[j+1];if(b-a<.001||hi-lo<.001||holes.some(o=>(a+b)/2>o.start&&(a+b)/2<o.start+o.width&&(lo+hi)/2>o.bottom&&(lo+hi)/2<o.bottom+o.height))continue;
   surface([edge(wall.side,a,lo),edge(wall.side,b,lo),edge(wall.side,b,hi),edge(wall.side,a,hi)],{fill:'#cbbfaf','fill-opacity':.48,stroke:'#cbbfaf','stroke-width':.5,'data-feature':'wall-'+wall.side,'pointer-events':'none'});
  }
 }

 if(showWalls)for(const opening of p.openings??[]){
  const wall=wallSegments.find(w=>w.side===opening.side),lo=opening.start,hi=lo+opening.width,z=opening.bottom,top=z+opening.height,active=opening.id===selectedItem;
  const before=surfaces.length,attrs={'data-opening-id':opening.id,class:'opening-face'+(opening.locked?' is-locked':''),...(opening.locked?{'pointer-events':'none'}:{})};
  surface([edge(opening.side,lo,z),edge(opening.side,hi,z),edge(opening.side,hi,top),edge(opening.side,lo,top)],{...attrs,fill:opening.kind==='door'?'#b98759':'#b7d7e1','fill-opacity':0,stroke:active?'#163f34':'#5a6f6b','stroke-opacity':active?.55:.16,'stroke-width':active?2.5:1.3,tabindex:opening.locked?-1:0,'aria-disabled':!!opening.locked,role:'button','aria-pressed':active,'data-feature':opening.kind,'aria-label':opening.label+' on '+opening.side+' wall, '+opening.start+' ft along side, bottom '+opening.bottom+' ft. Left/right arrows move along the wall; up/down move a window.'});
  const bar=Math.min(.06,opening.width/10);
  if(opening.kind==='window'){
   const mid=(lo+hi)/2,mz=(z+top)/2;
   surface([edge(opening.side,mid-bar,z),edge(opening.side,mid+bar,z),edge(opening.side,mid+bar,top),edge(opening.side,mid-bar,top)],{...attrs,fill:'#5a7780','fill-opacity':.07});
   surface([edge(opening.side,lo,mz-bar),edge(opening.side,hi,mz-bar),edge(opening.side,hi,mz+bar),edge(opening.side,lo,mz+bar)],{...attrs,fill:'#5a7780','fill-opacity':.07});
  }else{
   const handle=hi-Math.min(.35,opening.width*.15),hz=opening.height*.48;
   surface([edge(opening.side,handle-.09,hz-.09),edge(opening.side,handle+.09,hz-.09),edge(opening.side,handle+.09,hz+.09),edge(opening.side,handle-.09,hz+.09)],{...attrs,fill:'#40534b','fill-opacity':.1});
  }
  for(let n=before;n<surfaces.length;n++)surfaces[n].depth=['back','front'].includes(wall.side)?(lo+hi)/2+(wall.side==='front'?D:0)+.01:(lo+hi)/2+(wall.side==='right'?W:0)+.01;
 }
 const screenFill=p.restricted?'#aeb5af':'#6f9379';
 for(const screen of screens){
  const segments=(screen.separate||p.estimatePanels!==false)&&screen.segments?screen.segments:[{start:0,width:screen.width}];
  for(const segment of segments){
   const left=screen.start+segment.start,right=left+segment.width;
   surface([edge(screen.side,left,screen.base),edge(screen.side,right,screen.base),edge(screen.side,right,screen.height),edge(screen.side,left,screen.height)],{fill:screenFill,'fill-opacity':.65,stroke:'#ffffff','stroke-width':1.5,'data-feature':'screen','data-screen-side':screen.side,'data-piece-start':segment.start,'data-piece-width':segment.width,'pointer-events':'none'});
  }
 }
 for(const item of p.items??[]){
  drawingItem=item.id??null;
  const focusAttrs=item.id?{tabindex:item.locked?-1:0,'aria-disabled':!!item.locked,role:'button','aria-label':(item.label??item.kind)+' at '+item.x+', '+item.y+' ft'+(['chair','bench','lounger','storage','side-table'].includes(item.kind)?', facing '+(item.rotation??0)+' degrees. Arrows move; R rotates.':'. Arrow keys move.'),'aria-pressed':item.id===selectedItem,stroke:item.id===selectedItem?'#1d4337':'#806a50','stroke-width':item.id===selectedItem?3:1.5}:{};
  if(item.kind==='plant'){
   const cx=item.x+item.w/2,cy=item.y+item.d/2,h=item.height,pot=Math.min(1,h*.3),ring=(z,r=1)=>Array.from({length:8},(_,n)=>{const a=n*Math.PI/4;return [cx+Math.cos(a)*item.w/2*r,cy+Math.sin(a)*item.d/2*r,z];});
   const bottom=ring(0,.65),rim=ring(pot,.9);
   for(let n=0;n<8;n++)surface([bottom[n],bottom[(n+1)%8],rim[(n+1)%8],rim[n]],{fill:n%2?'#b87953':'#cf946b',stroke:'#9d684a','stroke-width':.6});
   surface(rim,{fill:'#695646',...focusAttrs,'data-feature':'plant'});
   surface([[cx-.05,cy,pot],[cx+.05,cy,pot],[cx+.05,cy,pot+.4],[cx-.05,cy,pot+.4]],{fill:'#806344'});
   if(item.plantStyle==='thuja'){
    for(const [z,r,tip]of [[pot+.1,1,h*.74],[pot+(h-pot)*.3,.8,h*.91],[pot+(h-pot)*.58,.56,h]]){
     const skirt=ring(z,r);for(let n=0;n<8;n++)surface([skirt[n],skirt[(n+1)%8],[cx,cy,tip]],{fill:n%2?'#3e7651':'#5d8f60',stroke:'#477951','stroke-width':.4});
    }
   }else{
    for(let n=0;n<10;n++){
     const angle=n*Math.PI/5,r=n%2?.9:.62,z=pot+(h-pot)*(.28+(n%4)*.15),dx=Math.cos(angle)*item.w/2*r,dy=Math.sin(angle)*item.d/2*r;
     surface([[cx,cy,z-.22],[cx+dx,cy+dy,z],[cx+dx*.75,cy+dy*.75,n===3?h:Math.min(h,z+.6)],[cx,cy,z+.1]],{fill:n%2?'#5d985a':'#3b7549',stroke:'#3d7149','stroke-width':.6});
    }
   }
   continue;
  }
  // Draw in the original local footprint, then rotate around its bounding box.
  const bw=item.baseW??item.w,bd=item.baseD??item.d,kind=item.kind,isTable=['table','side-table'].includes(kind),x=isTable?0:bw*.08,y=isTable?0:bd*.12,w=isTable?bw:bw*.84,d=isTable?bd:bd*.68,z=isTable?(kind==='side-table'?1.8:2.3):1.45,color=isTable?'#ad835e':'#d3aa75',rotation=item.rotation??0;
  const transform=([u,v,z])=>rotation===90?[item.x+bd-v,item.y+u,z]:rotation===180?[item.x+bw-u,item.y+bd-v,z]:rotation===270?[item.x+v,item.y+bw-u,z]:[item.x+u,item.y+v,z];
  const add=(coords,attrs)=>surface(coords.map(transform),attrs);
  if(kind==='storage'){
   const h=item.height??2;
   add([[0,0,0],[bw,0,0],[bw,0,h],[0,0,h]],{fill:'#8fa389',stroke:'#60735f','data-feature':'storage-back'});
   add([[0,0,0],[0,bd,0],[0,bd,h],[0,0,h]],{fill:'#718b70',stroke:'#60735f','data-feature':'storage-left'});
   add([[0,0,h],[bw,0,h],[bw,bd,h],[0,bd,h]],{fill:'#a6b6a4',stroke:'#60735f','data-feature':'storage',...focusAttrs});
   add([[0,bd,0],[bw,bd,0],[bw,bd,h],[0,bd,h]],{fill:'#81977d',stroke:'#60735f'});add([[bw,0,0],[bw,bd,0],[bw,bd,h],[bw,0,h]],{fill:'#718b70',stroke:'#60735f'});
   add([[bw*.42,bd,h*.62],[bw*.58,bd,h*.62],[bw*.58,bd,h*.73],[bw*.42,bd,h*.73]],{fill:'#4e624e'});continue;
  }
  if(kind==='lounger'){
   const h=.7;add([[0,0,h],[bw,0,h],[bw,bd,h],[0,bd,h]],{fill:'#b49875',stroke:'#806a50','data-feature':'lounger',...focusAttrs});
   add([[.1,1.2,h+.08],[bw-.1,1.2,h+.08],[bw-.1,bd-.1,h+.08],[.1,bd-.1,h+.08]],{fill:'#e5d9c5',stroke:'#ad9b80'});
   add([[.1,.15,2.3],[bw-.1,.15,2.3],[bw-.1,1.3,h+.08],[.1,1.3,h+.08]],{fill:'#e5d9c5',stroke:'#ad9b80'});
   for(const [a,b]of [[.1,.1],[bw-.2,.1],[.1,bd-.2],[bw-.2,bd-.2]])add([[a,b,0],[a+.1,b,0],[a+.1,b,h],[a,b,h]],{fill:'#806a50'});continue;
  }
  add([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],{fill:color,stroke:'#806a50','stroke-width':1.5,'data-feature':kind,...focusAttrs});
  add([[x,y+d,z-.18],[x+w,y+d,z-.18],[x+w,y+d,z],[x,y+d,z]],{fill:color,stroke:'#806a50'});
  add([[x+w,y,z-.18],[x+w,y+d,z-.18],[x+w,y+d,z],[x+w,y,z]],{fill:'#b58e63',stroke:'#806a50'});
  const leg=Math.min(.12,w/8,d/8);
  for(const [lx,ly]of [[x,y],[x+w-leg,y],[x,y+d-leg],[x+w-leg,y+d-leg]]){
   add([[lx,ly,0],[lx+leg,ly,0],[lx+leg,ly,z-.18],[lx,ly,z-.18]],{fill:'#806a50'});
   add([[lx+leg,ly,0],[lx+leg,ly+leg,0],[lx+leg,ly+leg,z-.18],[lx+leg,ly,z-.18]],{fill:'#6b5843'});
  }
  if(!isTable){
   for(let n=0;n<4;n++){const a=x+w*n*.28,b=a+w*.16;add([[a,y,z],[b,y,z],[b,y,3.6],[a,y,3.6]],{fill:'#d9ba91',stroke:'#806a50','stroke-width':.8,'data-feature':'chair-back'});}
   add([[x,y,3.5],[x+w,y,3.5],[x+w,y,3.7],[x,y,3.7]],{fill:'#d3aa75',stroke:'#806a50','data-feature':'chair-back'});
  }
 }
 drawingItem=null;
 surfaces.sort((a,b)=>a.depth-b.depth);for(const s of surfaces)svg.append(poly(s.coords,s.attrs));
 for(const rail of railSegments){
  const n=rail.end-rail.start;svg.append(line(edge(rail.side,rail.start,rail.height),edge(rail.side,rail.end,rail.height),{stroke:'#505e5b','stroke-width':4,'data-feature':'rail-'+rail.side,'pointer-events':'none'}));
  const posts=Math.min(40,Math.max(2,Math.ceil(n/2)));for(let i=0;i<=posts;i++)svg.append(line(edge(rail.side,rail.start+n*i/posts),edge(rail.side,rail.start+n*i/posts,rail.height),{stroke:'#62726e','stroke-width':2,'stroke-opacity':.8,'pointer-events':'none'}));
 }
 for(const screen of screens)for(const segment of screen.separate?screen.segments:[{start:0,width:screen.width}])svg.append(line(edge(screen.side,screen.start+segment.start,screen.height),edge(screen.side,screen.start+segment.start+segment.width,screen.height),{stroke:'#294b3c','stroke-width':3,'stroke-dasharray':'7 5','pointer-events':'none'}));
 if(p.roofHeight!==null&&p.roofHeight!==undefined&&showRoof){
  svg.append(poly([[0,0,p.roofHeight],[W,0,p.roofHeight],[W,D,p.roofHeight],[0,D,p.roofHeight]],{fill:'#b9cee0','fill-opacity':.2,stroke:'#7993a5','stroke-width':2,'stroke-dasharray':'7 4','data-feature':'roof','pointer-events':'none'}));
  svg.append(label([W,D,p.roofHeight],'Roof '+p.roofHeight+' ft',45,-12));
 }
 svg.append(label([W/2,D],'C · width '+W+' ft',0,32),label([0,D/2],'D · depth '+D+' ft',-55,0),label([W/2,0],'A',0,22),label([W,D/2],'B',30,10));
 return svg;
}
