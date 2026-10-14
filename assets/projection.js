export function projectionPixelScale(svg){
 const box=svg.getBoundingClientRect(),view=svg.getAttribute('viewBox'),parts=typeof view==='string'?view.split(/\s+/).map(Number):[];
 const width=parts.length===4&&parts[2]>0?parts[2]:960,height=parts.length===4&&parts[3]>0?parts[3]:740;
 return Math.min(box.width/width,box.height/height);
}

export function viewRotation(svg){
 const value=svg.getAttribute('data-view-angle'),angle=(typeof value==='string'?Number(value):0)*Math.PI/180;
 return {cos:Math.cos(angle),sin:Math.sin(angle)};
}
