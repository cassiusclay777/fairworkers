/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'fairworkers-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Cache-first strategy for static assets
const staticCacheStrategy = async (request: Request): Promise<Response> => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/offline.html');
      return offlineResponse || Response.error();
    }
    throw error;
  }
};

// Network-first strategy for API calls
const apiCacheStrategy = async (request: Request): Promise<Response> => {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

self.addEventListener('install', (event) => {
  (event as ExtendableEvent).waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  (event as ExtendableEvent).waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  const { request } = fetchEvent;
  const url = new URL(request.url);

  // API routes - network first
  if (url.pathname.startsWith('/api/')) {
    fetchEvent.respondWith(apiCacheStrategy(request));
  }
  // Static assets - cache first
  else if (request.destination === 'image' ||
           request.destination === 'style' ||
           request.destination === 'script' ||
           request.destination === 'font') {
    fetchEvent.respondWith(staticCacheStrategy(request));
  }
  // Navigation requests - network first with offline fallback
  else if (request.mode === 'navigate') {
    fetchEvent.respondWith(apiCacheStrategy(request));
  }
});

self.addEventListener('push', (event) => {
  const pushEvent = event as PushEvent;
  if (!pushEvent.data) return;

  const data = pushEvent.data.json();
  const options = {
    body: data.body || 'Nová pracovní příležitost',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'Zobrazit'
      },
      {
        action: 'close',
        title: 'Zavřít'
      }
    ]
  } as NotificationOptions & { vibrate?: number[] };

  (event as ExtendableEvent).waitUntil(
    self.registration.showNotification(data.title || 'Fairworkers', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const notificationEvent = event as NotificationEvent;
  notificationEvent.notification.close();

  if (notificationEvent.action === 'view') {
    (event as ExtendableEvent).waitUntil(
      (self as unknown as ServiceWorkerGlobalScope).clients.openWindow('/jobs')
    );
  }
});