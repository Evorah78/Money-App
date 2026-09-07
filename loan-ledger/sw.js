const CACHE='priority-loan-v4';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.png'];
const LAYOUT_FIX=`<style id="priority-loan-layout-fix">
html,body{min-height:100%;scroll-behavior:auto!important;overscroll-behavior:none}
body{padding:0!important}
.shell{padding-top:calc(18px + env(safe-area-inset-top))!important;padding-bottom:calc(92px + env(safe-area-inset-bottom))!important}
.overlay{padding-top:calc(22px + env(safe-area-inset-top))!important;padding-bottom:calc(22px + env(safe-area-inset-bottom))!important}
</style>`;
const JUMP_FIX=`<script id="priority-loan-jump-fix">(function(){
if('scrollRestoration' in history)history.scrollRestoration='manual';
function topNow(){try{document.activeElement&&document.activeElement.blur&&document.activeElement.blur()}catch(e){}window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0}
window.addEventListener('pageshow',()=>requestAnimationFrame(topNow));
window.addEventListener('load',()=>requestAnimationFrame(topNow));
const originalUnlock=window.unlock;
if(typeof originalUnlock==='function')window.unlock=function(){try{const p=document.getElementById('pin');if(p)p.blur()}catch(e){}originalUnlock();requestAnimationFrame(topNow);setTimeout(topNow,80);setTimeout(topNow,250)};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(topNow,0)});
setTimeout(topNow,0);
})();<\/script>`;
async function brandedHtml(request){let response;try{response=await fetch(request,{cache:'no-store'})}catch(e){response=await caches.match(request)||await caches.match('./index.html')}if(!response)return response;let text=await response.text();text=text.replaceAll('Loan Ledger','Priority Loan');if(!text.includes('priority-loan-layout-fix'))text=text.replace('</head>',LAYOUT_FIX+'</head>');if(!text.includes('priority-loan-jump-fix'))text=text.replace('</body>',JUMP_FIX+'</body>');return new Response(text,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(e.request.mode==='navigate'||url.pathname.endsWith('/loan-ledger/')||url.pathname.endsWith('/loan-ledger/index.html')){e.respondWith(brandedHtml(e.request));return}e.respondWith(fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}).catch(()=>caches.match(e.request)))});