const CACHE_NAME = 'tictactoe-v3';
const urlsToCache = [
  './',
  './index.html',
  './sw.js',
  './manifest.json'
];

// The service worker will register but stay dormant until installation
self.addEventListener('install', event => {
  // Don't automatically activate or precache anything
  // Skip the "waiting" state
  self.skipWaiting();
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'CACHE_ASSETS') {
    // User chose to install, now cache the assets
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Caching failed:', error);
      });
  }
});

// Handle fetch events (only return cached responses if they exist)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached response if available
        if (response) {
          return response;
        }
        // Otherwise pass the request to the network
        return fetch(event.request);
      })
  );
});

// In your service worker, handle updates
self.addEventListener('activate', event => {
  // Clear old caches when a new service worker activates
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
