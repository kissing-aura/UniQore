const CACHE = 'uniqore-v10';
const STATIC = [
  './',
  './index.html',
  './css/reset.css',
  './css/variables.css',
  './css/typography.css',
  './css/layout.css',
  './css/components.css',
  './css/sections.css',
  './css/animations.css',
  './css/mobile.css',
  './js/main.js',
  './js/particles.js',
  './js/animations.js',
  './js/form.js',
  './js/premium.js',
  './js/effects3d.js',
  './assets/logo-full.jpg',
  './assets/logo-icon.jpg',
  './assets/keas1.jpg',
  './assets/keis2.jpg',
  './assets/keis3.jpg',
  './assets/keis4.jpg',
  './assets/keis5.jpg',
  './favicon.svg',
  './manifest.json',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip: video, Telegram API, external CDN
  if (
    url.pathname.match(/\.(mp4|webm|ogv)$/) ||
    url.hostname === 'api.telegram.org' ||
    url.hostname.includes('fonts.googleapis') ||
    url.hostname.includes('fonts.gstatic') ||
    url.hostname.includes('cdn.jsdelivr') ||
    url.origin !== location.origin
  ) return;

  // Network-first for HTML, cache-first for assets
  const isHtml = url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then(res => { caches.open(CACHE).then(c => c.put(event.request, res.clone())); return res; })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          caches.open(CACHE).then(c => c.put(event.request, res.clone()));
          return res;
        });
      })
    );
  }
});
