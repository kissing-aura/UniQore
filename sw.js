// Self-destruct SW. Любой старый service worker, обновившись до этого файла,
// чистит все кэши, снимает себя с регистрации и перезагружает страницы.
// Сайт после этого обслуживается напрямую сетью — без кэш-залипаний.
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    } catch (e) {}
    try { await self.registration.unregister(); } catch (e) {}
    try {
      var clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(function (c) { c.navigate(c.url); });
    } catch (e) {}
  })());
});

// Ничего не кэшируем — всё из сети.
self.addEventListener('fetch', function () {});
