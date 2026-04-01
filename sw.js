const CACHE_NAME = "pong-pwa-v1";

const FILES_TO_CACHE = [
  "/pong-pwa/",
  "/pong-pwa/index.html",
  "/pong-pwa/manifest.json",
  "/pong-pwa/favicon.png",
  "/pong-pwa/pong-pwa.tar.gz",
  "/pong-pwa/pong-pwa.apk"
];

// install → cache core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// activate → remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// fetch → cache-first strategy
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {

      if (cached) {
        return cached;
      }

      return fetch(event.request).then(networkResponse => {

        // clone response before caching
        const copy = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copy);
        });

        return networkResponse;

      }).catch(() => {
        // optional fallback
        return caches.match("/pong-pwa/index.html");
      });

    })
  );
});