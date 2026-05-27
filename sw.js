// EMR Elite Navigator — Service Worker (offline-first cache)
// Bump CACHE_VERSION whenever you publish a new build of index.html.
const CACHE_VERSION = 'emr-nav-v2.4-1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico'
];

// On install: pre-cache everything so the app works fully offline after first load
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// On activate: clean up any old caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// On fetch: try network first (so the user gets fresh content when online),
// fall back to cache when offline. For images / icons, prefer cache for speed.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isAsset = ASSETS.some((a) => url.pathname.endsWith(a.replace('./', '')));

  if (isAsset || /\.(png|svg|ico)$/i.test(url.pathname)) {
    // Cache-first for static assets
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return res;
        }).catch(() => cached)
      )
    );
  } else {
    // Network-first for everything else (including index.html), fall back to cache
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
  }
});
