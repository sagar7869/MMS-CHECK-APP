const CACHE_NAME = 'rafter-portal-v3'; // Jab bhi major update karo, version number badha sakte hain ya chhod sakte hain
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Requests - Network First Strategy (GitHub updates turant reflect honge)
self.addEventListener('fetch', (event) => {
  // Supabase requests ya external API calls ko cache mat karo, unhe direct fetch hone do
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Agar network se naya data mil gaya, toh cache ko update kar do
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Agar offline hain, tab cache se serve karo
        return caches.match(event.request);
      })
  );
});
