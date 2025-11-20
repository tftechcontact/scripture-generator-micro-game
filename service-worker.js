/* service-worker.js
   Purpose: minimal service worker to enable offline caching for PWA.
   NOTE: This example caches the app shell and serves cached files; edit per your needs
         before publishing to Google Play via PWABuilder.
*/
const CACHE_NAME = 'scripture-gen-v1';
const URLS_TO_CACHE = [
  '/', '/index.html', '/style.css', '/app.js', '/levels.js', '/manifest.json'
];

// Install event: cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Fetch event: try cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});

// Activate event: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});
