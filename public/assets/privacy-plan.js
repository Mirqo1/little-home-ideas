export function planPrivacy({space,width,panelWidth,budget,need,exposure,approved}) {
 if(!['patio','balcony'].includes(space)||!['low','medium','high'].includes(budget)||!['view','flex','green'].includes(need)||!['sheltered','exposed'].includes(exposure))return {error:'Select valid preferences.'};
 if(!Number.isFinite(width)||width<1||width>100||!Number.isFinite(panelWidth)||panelWidth<1||panelWidth>10)return {error:'Enter a screening width of 1–100 feet and an example module width of 1–10 feet.'};
 const modules=Math.ceil(width/panelWidth);const surplus=Number((modules*panelWidth-width).toFixed(2));
 const summary=`Paper-layout estimate: ${modules} modules at ${panelWidth} feet each cover ${modules*panelWidth} feet (${surplus} feet beyond your ${width}-foot target). This assumes straight, gap-free placement; hinges, overlaps, supports, and usable screen width may change the count. It is not a purchase or installation plan.`;
 const restricted=(space==='balcony'&&!approved)||exposure==='exposed';
 let ideas=[['Test the sightline from your chair','Try moving or turning seating within an existing permitted layout. Keep doors, exits, and circulation clear.']];
 if(!restricted){
  if(need==='green')ideas.push(['Research container plants','Match climate, light, mature size, maintenance, drainage, and permitted wet weight. Growth and screening vary.']);
  if(need==='flex')ideas.push(['Research a movable outdoor screen','Use the exact manufacturer’s outdoor, stabilization, and storage instructions. Removable does not mean safe in all weather.']);
  if(need==='view')ideas.push(['Research targeted screening','Focus on one viewing angle instead of enclosing the entire boundary. Check support footprints, product limits, and permissions.']);
  if(budget==='low')ideas.push(['Use a layout trial before shopping','Work with suitable items you already own. Do not improvise a wind-catching fabric or railing attachment.']);
  else ideas.push(['Compare purpose-built systems','Compare actual usable dimensions and all required supports, delivery, and storage costs. No product prices are assumed.']);
 }
 const warning=restricted?'Pause screen and planter selection: exposed sites need appropriate product and building guidance; balconies need confirmed loads, wind limits, drainage, and management permission. Never assume a railing can support an attachment.':'Check lease or HOA rules, drainage, loads, and product-specific wind limits. Keep exits clear. No railing attachments or structural capacity are assessed by this tool.';
 return {summary,ideas:ideas.slice(0,3),warning,modules,surplus,restricted};
}
