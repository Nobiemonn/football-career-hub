const CACHE='fch-blue-20261111-v2';
const ASSETS=['./','./index.html','./app.css','./blue.css','./app.js','./public-client.js','./firebase-config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==self.location.origin)return; e.respondWith(fetch(e.request).then(res=>{if(res.ok&&ASSETS.some(a=>url.pathname===new URL(a,self.registration.scope).pathname)){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.match(e.request).then(res=>res||caches.match('./index.html'))))});
