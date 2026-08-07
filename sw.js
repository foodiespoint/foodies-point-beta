// ==========================================================================
// FOODIES POINT SERVICE WORKER (v33 - AUTO-UPDATING & CACHE PURGING)
// ==========================================================================
const CACHE_NAME = 'fp-cache-v33';

const ASSETS_TO_CACHE = [
  '/foodies-point-beta/',
  '/foodies-point-beta/index.html?v=33',
  '/foodies-point-beta/app.js?v=33',
  '/foodies-point-beta/manifest.json?v=33',
  '/foodies-point-beta/icon.png'
];

// 1. INSTALL EVENT: Force the new Service Worker to activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW v33] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Force this SW to bypass the "waiting" state instantly!
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVATE EVENT: Wipe every old cache version & claim all open PWA windows
self.addEventListener('activate', (event) => {
  console.log('[SW v33] Activating & wiping old caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache bucket does not match current version, delete it permanently
          if (cacheName !== CACHE_NAME) {
            console.log('[SW v33] Purging stale cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take immediate control of all open pages/tabs without waiting for a reload
      return self.clients.claim();
    })
  );
});

// 3. FETCH EVENT: Network-First for HTML & JS (Always get live updates when online)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Use Network-First for HTML and JS files so updates are never trapped by cache
  if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.js') || requestUrl.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Save the fresh copy to cache for offline use
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // If offline, fall back to cached copy
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-First fallback for static images/icons
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

// 4. LISTEN FOR SKIP_WAITING MESSAGE FROM APP
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
