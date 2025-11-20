/* File: service-worker.js
   Purpose: Minimal service worker to cache app shell for offline usage.
   Notes:
   - Edit the cached files list to include any additional assets you add later.
   - This implementation uses a simple 'cache-first' strategy for the listed resources.
*/
const CACHE_NAME = 'scripture-gen-v1';
const URLs_TO_CACHE = [
  '/', '/index.html', '/style.css', '/app.js', '/levels.js', '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLs_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
});

