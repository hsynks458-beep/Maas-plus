// sw.js - v64.84 - Install Fix + Stale-While-Revalidate
const APP_VERSION = '64.5.54';
const APP_CACHE_NAME = 'maas-hesap-v' + APP_VERSION;

var urlsToCache = [
  './',
  './index.html?v=' + APP_VERSION,
  './style.css?v=' + APP_VERSION,
  './tema.css?v=' + APP_VERSION,
  './layout.css?v=' + APP_VERSION,
  './card.css?v=' + APP_VERSION,
  './takvim.css?v=' + APP_VERSION,
  './modal.css?v=' + APP_VERSION,
  './analiz.css?v=' + APP_VERSION,
  './hesap.js?v=' + APP_VERSION,
  './bordro.js?v=' + APP_VERSION,
  './takvim.js?v=' + APP_VERSION,
  './kumulatif.js?v=' + APP_VERSION,
  './analiz.js?v=' + APP_VERSION,
  './main.js?v=' + APP_VERSION,
  './version.js?v=' + APP_VERSION,
  './manifest.json?v=' + APP_VERSION,
  './icon-32.png',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

// DÜZELTME 1: message event tek sefer
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// DÜZELTME 2: install event eklendi
self.addEventListener('install', function(event) {
  console.log(APP_CACHE_NAME + ' install başlıyor');
  event.waitUntil(
    caches.open(APP_CACHE_NAME).then(function(cache) {
      console.log(APP_CACHE_NAME + ' cache açılıyor');
      var cachePromises = urlsToCache.map(function(url) {
        return cache.add(url).catch(function(err) {
          console.warn('Cache eklenemedi:', url, err);
        });
      });
      return Promise.all(cachePromises);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== APP_CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log(APP_CACHE_NAME + ' aktif');
      return self.clients.claim();
    })
  );
});

// DÜZELTME 3: vergi.json için stale-while-revalidate
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
  
  var url = new URL(event.request.url);
  
  // vergi.json için özel strateji: stale-while-revalidate
  if (url.pathname.endsWith('vergi.json')) {
    event.respondWith(
      caches.open(APP_CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(cachedResponse) {
          var fetchPromise = fetch(event.request).then(function(networkResponse) {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(function() {
            return cachedResponse; // Network yoksa cache'den ver
          });
          return cachedResponse || fetchPromise; // Cache varsa hemen göster, arka planda güncelle
        });
      })
    );
    return;
  }
  
  // Diğer dosyalar: cache-first
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      
      return fetch(event.request).then(function(fetchResponse) {
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }
        
        if (event.request.url.startsWith(self.location.origin)) {
          var responseToCache = fetchResponse.clone();
          caches.open(APP_CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      }).catch(function() {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html?v=' + APP_VERSION);
        }
        return new Response('', { status: 404, statusText: 'Offline - Dosya yok' });
      });
    })
  );
});