// Rick AI — Service Worker
const CACHE = "rickai-v1";
const ASSETS = ["./index.html","./app.js","./lang.js","./kb.js","./manifest.json","./config.js","./github-sync.js"];

self.addEventListener("install", e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()))
);
self.addEventListener("activate", e =>
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  )
);
self.addEventListener("fetch", e => {
  // Only cache same-origin GET requests — skip API calls and PUT/POST
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res && res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
