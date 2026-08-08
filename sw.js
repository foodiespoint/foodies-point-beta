// ==========================================================================
// FOODIES POINT SERVICE WORKER (v51 - NATIVE WEB PUSH LISTENER)
// ==========================================================================
const CACHE_NAME = 'fp-cache-v51';

const ASSETS_TO_CACHE = [
  '/foodies-point-beta/',
  '/foodies-point-beta/index.html?v=51',
  '/foodies-point-beta/app.js?v=51',
  '/foodies-point-beta/manifest.json?v=51',
  '/foodies-point-beta/icon.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW v51] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW v51] Activating & wiping old caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// LISTEN FOR NATIVE PUSH MESSAGES FROM YOUR RENDER BACKEND
self.addEventListener('push', (event) => {
  console.log('[SW v51] Native Push Event Received:', event);

  let data = { title: "Foodies Point 🍛", body: "Today's live menu is updated!" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/foodies-point-beta/icon.png',
    badge: '/foodies-point-beta/icon.png',
    vibrate: [100, 50, 100],
    data: { url: '/foodies-point-beta/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle clicking on the notification banner
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/foodies-point-beta/')
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.js') || requestUrl.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
