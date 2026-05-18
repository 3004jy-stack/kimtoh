const CACHE = 'fixon-v39';
const CORE = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.anthropic.com')) { e.respondWith(fetch(e.request)); return; }
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(fresh => {
    if (fresh && fresh.status === 200) caches.open(CACHE).then(c => c.put(e.request, fresh.clone()));
    return fresh;
  }).catch(() => caches.match(e.request)));
});
