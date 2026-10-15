// Basic consent mode: this local controller makes no Google request before opt-in.
(()=>{
 const panel=document.getElementById('analytics-consent');
 const id=panel?.dataset.measurementId;
 if(!/^G-[A-Z0-9]{6,}$/.test(id??''))return;
 const storageKey='lhi-analytics-choice-v1',lifetime=180*24*60*60*1000;
 const state=()=>{try{const s=JSON.parse(localStorage.getItem(storageKey));return s&&['granted','denied'].includes(s.choice)&&Number.isFinite(s.expires)&&s.expires>Date.now()?s.choice:null;}catch{return null;}};
 let choice=state(),loaded=false,viewSent=false,lastFocus=null;
 const consent={analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
 window['ga-disable-'+id]=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
 window.gtag('consent','default',consent);
 const cleanUrl=value=>{if(!value)return '';try{const u=new URL(value,location.origin);return /^https?:$/.test(u.protocol)?u.origin+u.pathname:'';}catch{return '';}};
 const send=(name,params={})=>{if(choice==='granted'&&loaded)window.gtag('event',name,{...params,page_location:location.origin+location.pathname,send_to:id});};
 function start(){
  window['ga-disable-'+id]=false;
  window.gtag('consent','update',{...consent,analytics_storage:'granted'});
  if(!loaded){
   loaded=true;window.gtag('js',new Date());
   window.gtag('config',id,{send_page_view:false,page_location:location.origin+location.pathname,page_referrer:cleanUrl(document.referrer),allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,cookie_update:false});
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);script.dataset.analyticsTag='true';document.head.append(script);
  }
  if(!viewSent){viewSent=true;send('page_view',{page_title:document.title});}
 }
 function clearAnalyticsCookies(){
  for(const pair of document.cookie.split(';')){
   const name=pair.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;
   for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=name+'=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'+(domain?'; domain='+domain:'')+'; SameSite=Lax';
  }
 }
 function apply(next,persist=false){
  const wasLoaded=loaded;choice=next;
  if(persist){try{localStorage.setItem(storageKey,JSON.stringify({choice:next,expires:Date.now()+lifetime}));}catch{}}
  panel.hidden=true;panel.querySelector('[data-analytics-close]').hidden=false;
  document.getElementById('analytics-consent-status').textContent=next==='granted'?'Analytics allowed. You can change this in the footer.':'Analytics rejected.';
  if(next==='granted')start();
  else{
   window['ga-disable-'+id]=true;clearAnalyticsCookies();
   // A fresh denied page unloads all previously granted Google code and its timers.
   if(wasLoaded){window.location.reload();return;}
  }
  lastFocus?.focus();
 }
 for(const button of panel.querySelectorAll('[data-analytics-choice]'))button.addEventListener('click',()=>apply(button.dataset.analyticsChoice,true));
 const close=panel.querySelector('[data-analytics-close]');close.addEventListener('click',()=>{panel.hidden=true;lastFocus?.focus();});
 for(const button of document.querySelectorAll('[data-analytics-settings]'))button.addEventListener('click',()=>{lastFocus=button;panel.hidden=false;close.hidden=choice===null;panel.querySelector('[data-analytics-choice]').focus();});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'&&choice!==null){panel.hidden=true;lastFocus?.focus();}});
 window.addEventListener('storage',e=>{if(e.key!==storageKey)return;const next=state();if(next)apply(next);else{if(loaded){window['ga-disable-'+id]=true;window.location.reload();}else{choice=null;panel.hidden=false;close.hidden=true;}}});
 if(choice)apply(choice);else panel.hidden=false;
 const plannerEvents=new Set(['planner_start','planner_complete','planner_save','planner_print']);
 document.addEventListener('lhi:analytics',e=>{if(plannerEvents.has(e.detail?.name))send(e.detail.name,{tool_name:'patio_balcony_layout'});});
 document.addEventListener('click',e=>{
  const saved=e.target.closest?.('[data-save]');
  if(saved&&saved.getAttribute('aria-pressed')==='true'&&/^[a-z0-9-]+$/.test(saved.dataset.save))send('save_article',{article_slug:saved.dataset.save});
  const link=e.target.closest?.('a[href]');if(!link)return;
  try{const url=new URL(link.href);if(url.origin===location.origin&&/^\/articles\/[a-z0-9-]+\/$/.test(url.pathname))send('select_content',{content_type:'article',item_id:url.pathname});}catch{}
 });
 const article=document.querySelector('article.prose'),milestones=new Set();
 if(article)window.addEventListener('scroll',()=>{
  if(choice!=='granted')return;const box=article.getBoundingClientRect(),percent=(window.innerHeight-box.top)/box.height*100;
  for(const threshold of [50,90])if(percent>=threshold&&!milestones.has(threshold)){milestones.add(threshold);send('article_scroll',{percent_scrolled:threshold});}
 },{passive:true});
})();
