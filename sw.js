/* mbmealprep.online service worker (MB Suite v3 template).
   Network-first for the app's own files, cache as the offline fallback.
   It never touches user data (that lives in localStorage/IndexedDB, which this code never reads)
   and ignores every non-GET and cross-origin request. Only deletes its own "mbmealprep-" caches.
   BUMP VERSION ON EVERY RELEASE so old cached files are dropped. */
const VERSION = 'mbmealprep-1.4.0-20261014-topbar-search';
const SHELL = ['./', 'index.html', 'manifest.json', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'mb-suite-topbar.css'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('mbmealprep-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => { if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
