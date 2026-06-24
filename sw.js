// ==========================================================================
// FOODIES POINT - SERVICE WORKER WITH FCM BACKGROUND PUSH (V50)
// ==========================================================================

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

firebase.initializeApp(firebaseConfig);

try {
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
        console.log('[sw.js] Received background message ', payload);
        const notificationTitle = payload.notification.title || 'Foodies Point';
        const notificationOptions = {
            body: payload.notification.body || 'Order status update.',
            icon: 'icon.png',
            badge: 'icon.png',
            vibrate: [200, 100, 200],
            data: payload.data
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (e) {
    console.warn("FCM background initialization skipped/failed in SW.", e);
}

const CACHE_NAME = 'foodies-cache-v80';
const ASSETS = ['', 'index.html', 'app.js', 'manifest.json', 'icon.png'];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin)) return; 
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            })
            .catch(() => caches.match(event.request))
    );
});
