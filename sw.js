// ==========================================================================
// 1. CACHE CONFIGURATION (VERSION v01)
// ==========================================================================
const CACHE_NAME = 'foodies-point-cache-v01';

// All internal links synced to v01 exactly as called in index.html
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js?v=01',
  './manifest.json',
  './icon.png'
];

// ==========================================================================
// 2. INSTALL EVENT - Pre-cache App Shell & Force Instant Activation
// ==========================================================================
self.addEventListener('install', (event) => {
  console.log('[SW v01] Installing new Service Worker...');
  
  // Force the new Service Worker to activate immediately without waiting
  // for open browser tabs to close (prevents the "waiting worker" deadlock)
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW v01] Pre-caching App Shell assets:', ASSETS_TO_CACHE);
      // Use allSettled/resilient fetching so a single missing icon doesn't block install
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`[SW v01] Non-fatal cache skip for ${url}:`, err);
          });
        })
      );
    })
  );
});

// ==========================================================================
// 3. ACTIVATE EVENT - Clean Up Old Caches & Take Immediate Control
// ==========================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW v01] Activating Service Worker & purging old caches...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache bucket that doesn't match 'foodies-point-cache-v01'
          if (cacheName !== CACHE_NAME) {
            console.log('[SW v01] Deleting obsolete cache bucket:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Immediately take control of all open pages/clients
      console.log('[SW v01] Claiming clients for instant control...');
      return self.clients.claim();
    })
  );
});

// ==========================================================================
// 4. FETCH EVENT - Network-First Strategy with Offline Cache Fallback
// ==========================================================================
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // -- EXCLUSION RULE 1: Ignore non-GET requests (POST, PUT, DELETE, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // -- EXCLUSION RULE 2: Ignore Firebase, OneSignal, and external live APIs
  // Real-time database calls and notifications MUST always hit the network directly.
  if (
    requestUrl.hostname.includes('firebasedatabase.app') ||
    requestUrl.hostname.includes('firebaseio.com') ||
    requestUrl.hostname.includes('onesignal.com') ||
    requestUrl.hostname.includes('googleapis.com') ||
    requestUrl.hostname.includes('gstatic.com') ||
    requestUrl.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // -- MAIN STRATEGY: Network-First, fallback to Cache
  // Why? Guarantees users get live HTML/JS updates when online, but keeps the app
  // fully working offline if they lose internet connection.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If we get a valid HTTP response, clone it and refresh the cache bucket
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // If network fails (offline), fall back to the local Cache Storage
        console.log('[SW v01] Network unreachable. Serving from offline cache:', event.request.url);
        const cachedResponse = await caches.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigation request fails and isn't cached, fall back to index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }

        return new Response('Offline content unavailable.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});

// ==========================================================================
// 5. MESSAGE EVENT - Listen for Manual Skip Waiting Triggers
// ==========================================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW v01] Received SKIP_WAITING signal.');
    self.skipWaiting();
  }
});
