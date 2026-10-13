const key='little-home-ideas-saved-v1';
let saved=new Set();try { const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))saved=new Set(value.filter(v=>typeof v==='string')); }catch{}
const buttons=[...document.querySelectorAll('[data-save]')];
const announcement=document.getElementById('save-announcement');
function updateSaved(){buttons.forEach(b=>{const active=saved.has(b.dataset.save);b.hidden=false;b.setAttribute('aria-pressed',String(active));b.classList.toggle('is-saved',active);const label=b.getAttribute('aria-label')||'';b.setAttribute('aria-label',label.replace(/^(Save|Unsave) /,active?'Unsave ':'Save '));});document.querySelectorAll('[data-saved-count]').forEach(e=>e.textContent=String(saved.size));}
buttons.forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.save;if(saved.has(id))saved.delete(id);else saved.add(id);let persisted=true;try{localStorage.setItem(key,JSON.stringify([...saved]));}catch{persisted=false;}updateSaved();filterArchive();if(announcement)announcement.textContent=(saved.has(id)?'Idea saved.':'Idea removed from saved list.')+(persisted?'':' Your browser did not allow persistent storage; this choice lasts for this page only.');}));
const search=document.getElementById('article-search'),toggle=document.getElementById('saved-view'),cards=[...document.querySelectorAll('[data-archive] [data-article-card]')],status=document.getElementById('archive-status');let onlySaved=location.hash==='#saved-view';
function filterArchive(){if(!cards.length)return;const q=(search?.value||'').toLowerCase().trim();let visible=0;cards.forEach(c=>{const show=(!q||c.dataset.search.includes(q))&&(!onlySaved||saved.has(c.dataset.articleId));c.hidden=!show;if(show)visible++;});if(status)status.textContent=`${visible} ${visible===1?'guide':'guides'}${onlySaved?' in your saved list':''}`;const empty=document.getElementById('empty-search');if(empty)empty.hidden=visible!==0;if(toggle){toggle.setAttribute('aria-pressed',String(onlySaved));toggle.classList.toggle('active',onlySaved);}}
if(toggle){toggle.hidden=false;toggle.addEventListener('click',()=>{onlySaved=!onlySaved;filterArchive();});}
search?.addEventListener('input',filterArchive);
window.addEventListener('hashchange',()=>{if(location.hash==='#saved-view'){onlySaved=true;filterArchive();}});
updateSaved();filterArchive();
const goal=document.getElementById('idea-goal'),links=[...document.querySelectorAll('[data-finder-category]')];
function findIdeas(){if(!goal)return;let count=0;links.forEach(a=>{const relevant=goal.value==='all'||goal.value===a.dataset.finderCategory;a.hidden=!relevant||count>=3;if(!a.hidden)count++;});}
goal?.addEventListener('change',findIdeas);findIdeas();
