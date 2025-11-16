const CACHE_NAME = 'buku-log-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.css',
  '/vite.svg',
  '/manifest.json',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => {
      if (key !== CACHE_NAME) return caches.delete(key);
    })))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then((res) => {
      // Save a copy of the response in the cache
      const responseClone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
      return res;
    }).catch(async () => {
      // Network request failed, try the cache
      const cached = await caches.match(event.request);
      if (cached) return cached;
      // If no cached, return offline page for navigations
      if (event.request.mode === 'navigate') return caches.match('/offline.html');
      return Promise.reject('no-match');
    })
  );
});
