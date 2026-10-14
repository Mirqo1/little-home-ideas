const round=n=>Number(n.toFixed(2));
export function parseGaps(text,unit='in'){
 if(!['in','cm'].includes(unit))return {error:'Choose inches or centimeters for the gaps.'};
 const parts=String(text).trim().split(';').map(s=>s.trim());
 if(parts.length>100||parts.some(s=>!/^\d+(?:[.,]\d+)?$/.test(s)))return {error:'Enter one gap, or gaps separated by semicolons, for example 15; 10; 20. Decimals may use a point or comma.'};
 const gaps=parts.map(s=>Number(s.replace(',','.'))/(unit==='cm'?30.48:12));
 if(gaps.some(g=>g<0||g>100))return {error:'Enter nonnegative gaps no longer than 100 ft.'};
 return {gaps};
}
export function screenPieces(width,pieceWidth,gaps=[0]){
 if(!Number.isFinite(width)||width<=0||!Number.isFinite(pieceWidth)||pieceWidth<.1||pieceWidth>100||!Array.isArray(gaps)||!gaps.length||gaps.some(g=>!Number.isFinite(g)||g<0||g>100))return {error:'Enter a piece width of 0.1–100 ft and valid gaps.'};
 const segments=[];let pos=0,gapWidth=0,materialWidth=0;
 while(pos<width-1e-9){
  const used=Math.min(pieceWidth,width-pos);segments.push({start:pos,width:used});materialWidth+=used;pos+=used;
  if(pos>=width-1e-9)break;
  const gap=Math.min(gaps[Math.min(segments.length-1,gaps.length-1)],width-pos);gapWidth+=gap;pos+=gap;
 }
 return {segments,modules:segments.length,materialWidth:round(materialWidth),gapWidth:round(gapWidth),coverage:round(segments.length*pieceWidth),surplus:round(segments.length*pieceWidth-materialWidth),lastPanel:round(segments.at(-1).width)};
}
