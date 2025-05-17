const CACHE_NAME = 'tictactoe-v1';
const urlsToCache = [
  './',
  './index.html',
  './sw.js',
  './manifest.json'
];

// Install event - cache our static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      console.log('Service Worker: Caching files');
      return cache.addAll(urlsToCache);
    })
    .then(() => {
      console.log('Service Worker: All files cached');
      return self.skipWaiting();  // Force activation
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();  // Take control of all clients
    })
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      // Cache hit - return the response from the cached version
      if (response) {
        console.log('Service Worker: Found in cache:', event.request.url);
        return response;
      }
      
      // Not in cache - fetch from network
      return fetch(event.request).then(networkResponse => {
        // Don't cache non-successful responses
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Clone the response since it can only be consumed once
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
            console.log('Service Worker: Caching new resource:', event.request.url);
          });
          
        return networkResponse;
      });
    }).catch(error => {
      console.error('Service Worker: Fetch failed:', error);
      // You could return a custom offline page here
    })
  );
});
