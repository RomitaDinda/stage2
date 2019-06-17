let staticCacheId = "restaurants-static-v2";
let urlsToCache = [
  "./",
  "./register.js",
  "index.html",  
  "restaurant.html",
  "css/styles.css",
  "data/restaurants.json",
  "js/dbhelper.js",
  "js/main.js",
  "js/restaurant_info.js",
  "img/1.jpg",
  "img/2.jpg",
  "img/3.jpg",
  "img/4.jpg",
  "img/5.jpg",
  "img/6.jpg",
  "img/7.jpg",
  "img/8.jpg",
  "img/9.jpg",
  "img/10.jpg",
  "img/nocon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(staticCacheId)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(self.skipWaiting())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          console.log('fetch at first');
          return response;
        }
        console.log('get fetch from fetch');
        return fetch(event.request);
      }).catch(function () { return caches.match("/img/nocon.png");})//catch(function () { return new Response("Oh oh it failed");})
    );
  }
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(cacheNames.map(cache => {
      if (cache !== staticCacheId) {
        console.log("[ServiceWorker] removing cached files from ", cache);
        return caches.delete(cache);
      }
    })))
  )
})


