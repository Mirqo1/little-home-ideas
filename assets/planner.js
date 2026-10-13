import {planPrivacy} from './privacy-plan.js';
const form=document.getElementById('privacy-form');
form.addEventListener('submit',e=>{
 e.preventDefault();const out=document.getElementById('results');
 const plan=planPrivacy({space:document.getElementById('space').value,width:Number(document.getElementById('width').value),panelWidth:Number(document.getElementById('panel-width').value),budget:document.getElementById('budget').value,need:document.getElementById('need').value,exposure:document.getElementById('exposure').value,approved:document.getElementById('approved').checked});
 out.replaceChildren();
 const append=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;out.append(el);return el;};
 if(plan.error){append('p',plan.error);return;}
 append('p',plan.summary);
 for(const [title,detail] of plan.ideas){const card=document.createElement('div');card.className='result';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=detail;card.append(h,p);out.append(card);}
 append('p',plan.warning).className='small';
 append('p','Budget bands organize ideas only; they are not current prices or a promise that products will fit your budget.');
});
