/* mbmealprep.online service worker.
   Network-first for the app's own files, cache as the offline fallback.
   It never touches user data (that lives in localStorage/IndexedDB, which a service worker cannot see
   through this code) and ignores every non-GET and cross-origin request.
   BUMP VERSION ON EVERY RELEASE so old cached files are dropped. */
const VERSION = 'mbmealprep-5.1.0';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png',
  'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon.svg', 'favicon.ico'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
