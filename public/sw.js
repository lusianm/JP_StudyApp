const CACHE_NAME = 'jp-study-app-v1'
const urlsToCache = [
  '/JP_StudyApp/',
  '/JP_StudyApp/index.html',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  )
})