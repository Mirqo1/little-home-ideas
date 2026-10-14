export function privacyScene(document,p,preview=false,{showRoof=true,showWalls=true,selectedItem=null}={}){
 const make=(tag,attrs={},text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text)e.textContent=text;return e;};
 const svg=make('svg',{viewBox:'0 0 960 740',role:p.items?.length?'group':'img','aria-labelledby':preview?'preview-title preview-desc':'plan-sketch-title plan-sketch-desc',class:preview?'plan-preview':'plan-sketch'});
 const screens=p.screens??[{side:p.screenSide??'back',start:0,width:p.width,coverage:p.coverage,base:p.screenBase??0,height:p.height,modules:p.modules}];
 const wallSegments=p.wallSegments??(p.walls??[]).map(side=>({side,start:0,end:['back','front'].includes(side)?p.patioWidth:p.depth,height:p.wallHeight}));
 const railSegments=p.railSegments??(p.railSides??[]).map(side=>({side,start:0,end:['back','front'].includes(side)?p.patioWidth:p.depth,height:p.railHeight}));
 const W=p.patioWidth,D=p.depth,top=Math.max(0,...screens.map(s=>s.height),p.roofHeight??0,p.wallHeight??0,p.railHeight??0,...(p.items??[]).map(i=>i.height??3),3),side=p.screenSide??'back',base=p.screenBase??0;
 const edge=(side,t,z=0)=>side==='back'?[t,0,z]:side==='front'?[t,D,z]:side==='left'?[0,t,z]:[W,t,z];
 const length=s=>['back','front'].includes(s)?W:D;
 const raw=([x,y,z=0])=>[.8*(x-y),.38*(x+y)-.85*z];
 const bounds=[[0,0],[W,0],[W,D],[0,D],[0,0,top],[W,0,top],[W,D,top],[0,D,top],...screens.map(s=>edge(s.side,s.start+s.coverage,s.height))].map(raw);
 const xs=bounds.map(q=>q[0]),ys=bounds.map(q=>q[1]),minX=Math.min(...xs),minY=Math.min(...ys),dx=Math.max(...xs)-minX,dy=Math.max(...ys)-minY,scale=Math.min(790/dx,475/dy);
 svg.setAttribute('data-projection-scale',scale);svg.setAttribute('data-projection-x',(960-dx*scale)/2-minX*scale);svg.setAttribute('data-projection-y',105-minY*scale);
 const point=q=>{const [x,y]=raw(q);return [(x-minX)*scale+(960-dx*scale)/2,(y-minY)*scale+105];};
 const poly=(coords,attrs)=>make('polygon',{points:coords.map(q=>point(q).join(',')).join(' '),...attrs});
 const line=(a,b,attrs)=>{const u=point(a),v=point(b);return make('line',{x1:u[0],y1:u[1],x2:v[0],y2:v[1],...attrs});};
 const label=(q,text,ox=0,oy=0)=>{const [x,y]=point(q);return make('text',{x:x+ox,y:y+oy,fill:'#294b3c','font-size':17,'font-family':'Arial,sans-serif','text-anchor':'middle','paint-order':'stroke',stroke:'#f7f5ef','stroke-width':5,'stroke-linejoin':'round'},text);};
 svg.append(make('title',{id:preview?'preview-title':'plan-sketch-title'},'Your outdoor space in a 3D view'),make('desc',{id:preview?'preview-desc':'plan-sketch-desc'},W+' by '+D+' feet. '+screens.map(s=>s.side+': target '+s.width+' ft. Starts '+s.base+' feet above the floor; top '+s.height+' ft; '+(p.estimatePanels===false?'':s.modules+' estimated panels.')).join(' ')+' Roof '+(p.roofHeight??'none')+'; railing '+(p.railHeight??'none')+'; walls '+(p.walls?.join(', ')||'none')+'. '+(p.items?.length??0)+' furniture pieces. Geometry only; no structural or access approval.'));
 svg.append(make('rect',{x:0,y:0,width:960,height:740,fill:'#f7f5ef',rx:8}),make('text',{x:30,y:40,fill:'#294b3c','font-size':23,'font-family':'Arial,sans-serif'},preview?'An example to help you get started':'Your space & privacy layout'),make('text',{x:30,y:70,fill:'#647067','font-size':15,'font-family':'Arial,sans-serif'},'A far · B right · C near · D left · all measurements in feet'));
 svg.append(poly([[0,0],[W,0],[W,D],[0,D]],{fill:'#e3e8dc',stroke:'#a1b09b','stroke-width':2}));
 for(let i=1;i<5;i++)svg.append(line([W*i/5,0],[W*i/5,D],{stroke:'#cad3c3'}),line([0,D*i/5],[W,D*i/5],{stroke:'#cad3c3'}));
 const surfaces=[];let drawingItem=null;
 const surface=(coords,attrs)=>surfaces.push({coords,attrs:drawingItem?{...attrs,'data-item-id':drawingItem,'class':'furniture-face'}:attrs,depth:coords.reduce((v,q)=>v+q[0]+q[1],0)/coords.length});
 if(showWalls)for(const wall of wallSegments)surface([edge(wall.side,wall.start),edge(wall.side,wall.end),edge(wall.side,wall.end,wall.height),edge(wall.side,wall.start,wall.height)],{fill:'#cbbfaf','fill-opacity':.48,stroke:'#ac9c88','stroke-width':2,'data-feature':'wall-'+wall.side,'pointer-events':'none'});
 const screenFill=p.restricted?'#aeb5af':'#6f9379';
 for(const screen of screens){
  const count=p.estimatePanels===false?1:screen.modules,step=p.estimatePanels===false?screen.width:p.panelWidth;
  for(let i=0;i<count;i++){
   const left=screen.start+i*step,right=screen.start+Math.min((i+1)*step,screen.width);if(right<=left)continue;
   surface([edge(screen.side,left,screen.base),edge(screen.side,right,screen.base),edge(screen.side,right,screen.height),edge(screen.side,left,screen.height)],{fill:screenFill,'fill-opacity':.65,stroke:'#ffffff','stroke-width':1.5,'data-feature':'screen','pointer-events':'none'});
  }
 }
 for(const item of p.items??[]){
  drawingItem=item.id??null;
  const focusAttrs=item.id?{tabindex:0,role:'button','aria-label':(item.label??item.kind)+' at '+item.x+', '+item.y+' ft'+(item.kind==='chair'||item.kind==='bench'?', facing '+(item.rotation??0)+' degrees. Arrows move; R rotates.':'. Arrow keys move.'),'aria-pressed':item.id===selectedItem,stroke:item.id===selectedItem?'#1d4337':'#806a50','stroke-width':item.id===selectedItem?3:1.5}:{};
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
  const x=0,y=0,w=item.baseW??item.w,d=item.baseD??item.d,kind=item.kind,z=kind==='table'?1.7:1.5,color=kind==='table'?'#ad835e':'#d3aa75',rotation=item.rotation??0;
  const transform=([u,v,z])=>rotation===90?[item.x+d-v,item.y+u,z]:rotation===180?[item.x+w-u,item.y+d-v,z]:rotation===270?[item.x+v,item.y+w-u,z]:[item.x+u,item.y+v,z];
  const add=(coords,attrs)=>surface(coords.map(transform),attrs);
  add([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],{fill:color,stroke:'#806a50','stroke-width':1.5,'data-feature':kind,...focusAttrs});
  add([[x,y+d,z-.18],[x+w,y+d,z-.18],[x+w,y+d,z],[x,y+d,z]],{fill:color,stroke:'#806a50'});
  add([[x+w,y,z-.18],[x+w,y+d,z-.18],[x+w,y+d,z],[x+w,y,z]],{fill:'#b58e63',stroke:'#806a50'});
  const leg=Math.min(.12,w/8,d/8);
  for(const [lx,ly]of [[x,y],[x+w-leg,y],[x,y+d-leg],[x+w-leg,y+d-leg]]){
   add([[lx,ly,0],[lx+leg,ly,0],[lx+leg,ly,z-.18],[lx,ly,z-.18]],{fill:'#806a50'});
   add([[lx+leg,ly,0],[lx+leg,ly+leg,0],[lx+leg,ly+leg,z-.18],[lx+leg,ly,z-.18]],{fill:'#6b5843'});
  }
  if(kind!=='table')add([[x,y,z],[x+w,y,z],[x+w,y,3],[x,y,3]],{fill:'#d9ba91',stroke:'#806a50'});
 }
 drawingItem=null;
 surfaces.sort((a,b)=>a.depth-b.depth);for(const s of surfaces)svg.append(poly(s.coords,s.attrs));
 for(const rail of railSegments){
  const n=rail.end-rail.start;svg.append(line(edge(rail.side,rail.start,rail.height),edge(rail.side,rail.end,rail.height),{stroke:'#505e5b','stroke-width':4,'data-feature':'rail-'+rail.side,'pointer-events':'none'}));
  const posts=Math.min(40,Math.max(2,Math.ceil(n/2)));for(let i=0;i<=posts;i++)svg.append(line(edge(rail.side,rail.start+n*i/posts),edge(rail.side,rail.start+n*i/posts,rail.height),{stroke:'#62726e','stroke-width':2,'stroke-opacity':.8,'pointer-events':'none'}));
 }
 for(const screen of screens)svg.append(line(edge(screen.side,screen.start,screen.height),edge(screen.side,screen.start+screen.width,screen.height),{stroke:'#294b3c','stroke-width':3,'stroke-dasharray':'7 5','pointer-events':'none'}));
 if(p.roofHeight!==null&&p.roofHeight!==undefined&&showRoof){
  svg.append(poly([[0,0,p.roofHeight],[W,0,p.roofHeight],[W,D,p.roofHeight],[0,D,p.roofHeight]],{fill:'#b9cee0','fill-opacity':.2,stroke:'#7993a5','stroke-width':2,'stroke-dasharray':'7 4','data-feature':'roof','pointer-events':'none'}));
  svg.append(label([W,D,p.roofHeight],'Roof '+p.roofHeight+' ft',45,-12));
 }
 svg.append(label([W/2,D],'C · width '+W+' ft',0,40),label([0,D/2],'D · depth '+D+' ft',-55,0),label([W/2,0],'A',0,22),label([W,D/2],'B',30,10));
 svg.append(make('text',{x:30,y:630,fill:'#294b3c','font-size':17,'font-family':'Arial,sans-serif'},screens.length+' screened side'+(screens.length===1?'':'s')+' · screen top '+p.height+' ft above floor'));
 svg.append(make('text',{x:30,y:658,fill:'#53634b','font-size':16,'font-family':'Arial,sans-serif'},p.estimatePanels===false?'Privacy coverage is drawn to your requested dimensions.':p.modules+' whole panels estimated; the drawing shows the requested screen area.'));
 svg.append(make('text',{x:30,y:688,fill:'#647067','font-size':13,'font-family':'Arial,sans-serif'},'Blue roof · sand walls · dark railing · wood furniture · potted plants · green screening'));
 svg.append(make('text',{x:30,y:715,fill:'#647067','font-size':14,'font-family':'Arial,sans-serif'},'Geometry example. No support, mounting, guard, wind, or walking-clearance assessment.'));
 return svg;
}
