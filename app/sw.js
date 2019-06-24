//import DBHelper from './js/dbhelper';

let staticCacheId = "restaurants-static-v2";
let imgCache = "restaurants-imgs";

let allCaches = [
  staticCacheId,
  imgCache
];

let urlsToCache = [
  "./",
  "js/register.js",
  "index.html",  
  "restaurant.html",
  "css/styles.css",
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
  "img/nocon.png",
  "icons/icon-72x72.png",
  'bundle_js/index.min.js',
  'bundle_js/maps/index.min.js.map',
  'bundle_js/maps/restaurants.min.js.map',
  'bundle_js/restaurants.min.js',
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

self.addEventListener('fetch', function(event){
  var requestUrl = new URL(event.request.url);
  console.log('the url port is:' + requestUrl.port);

  if (requestUrl.pathname.startsWith('/restaurants/')) {
    console.log('entro al api de restaurants');
    return;
  }

  if(requestUrl.pathname.startsWith('/img/')){
    // console.log('sw entro al img');
    event.respondWith(loadPhoto(event.request));
    return;
  }

  event.respondWith(
    caches.open(staticCacheId).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          // filter out browser-sync resources
          if (!fetchResponse.url.includes('browser-sync')) {
            console.log('response no browsersync');
            cache.put(event.request, response.clone());
          }
          return response;
        });
      }).catch(function () { return caches.match("/img/nocon.png");
        });
    })
  );
});

self.addEventListener('activate', function(event) {

  event.waitUntil(
    // Get all the cache keys 
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurants-') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  ); 
});

function loadPhoto(request){
  return caches.open(imgCache).then(function(cache) {
    return cache.match(request).then(function(response) {
      if (response) return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

