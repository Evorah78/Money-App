const CACHE='priority-loan-v5';
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
const SETTINGS_PATCH=`<script id="priority-loan-settings-backup">(function(){
const originalSettings=window.settingsSheet;
if(typeof originalSettings!=='function')return;
window.settingsSheet=function(){
  const theme=localStorage.getItem(K.theme)||'dark';
  openSheet('<div class="sheethead"><h3>Settings</h3><button class="close" onclick="closeSheet()">×</button></div><div class="settings-grid"><div class="setting"><div><b>Theme</b><div class="row-sub">Light or dark</div></div><div class="toggle"><button class="'+(theme==='light'?'active':'')+'" onclick="applyTheme(\'light\');settingsSheet()">Light</button><button class="'+(theme==='dark'?'active':'')+'" onclick="applyTheme(\'dark\');settingsSheet()">Dark</button></div></div><button class="secondary" onclick="exportBackup()">Export data</button><button class="secondary" onclick="importBackup()">Restore data</button><button class="secondary" onclick="changePin()">Change 4-digit PIN</button><button class="secondary" onclick="lockNow()">Lock now</button></div>');
};
const btn=document.getElementById('settingsBtn');if(btn)btn.onclick=window.settingsSheet;
})();<\/script>`;
async function brandedHtml(request){let response;try{response=await fetch(request,{cache:'no-store'})}catch(e){response=await caches.match(request)||await caches.match('./index.html')}if(!response)return response;let text=await response.text();text=text.replaceAll('Loan Ledger','Priority Loan');if(!text.includes('priority-loan-layout-fix'))text=text.replace('</head>',LAYOUT_FIX+'</head>');if(!text.includes('priority-loan-jump-fix'))text=text.replace('</body>',JUMP_FIX+'</body>');if(!text.includes('priority-loan-settings-backup'))text=text.replace('</body>',SETTINGS_PATCH+'</body>');return new Response(text,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients){try{await client.navigate(client.url)}catch(e){}}})())});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(e.request.mode==='navigate'||url.pathname.endsWith('/loan-ledger/')||url.pathname.endsWith('/loan-ledger/index.html')){e.respondWith(brandedHtml(e.request));return}e.respondWith(fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}).catch(()=>caches.match(e.request)))});