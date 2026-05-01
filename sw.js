// sw.js — v3 (2026-05-01)
// Stratégie : Network First — toujours essayer de charger la dernière version,
// fallback vers cache uniquement si offline.

const CACHE_VERSION = 'mon-compte-v3-2026-05-01';
const CACHE_NAME = CACHE_VERSION;

self.addEventListener('install', function(event) {
  // Forcer activation immédiate de la nouvelle version
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Supprimer tous les anciens caches
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Network First : toujours essayer le réseau d'abord
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Mettre à jour le cache avec la nouvelle version
        if (response && response.status === 200 && event.request.method === 'GET') {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function() {
        // Si offline, retomber sur le cache
        return caches.match(event.request);
      })
  );
});
