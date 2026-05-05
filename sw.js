(self => {
    const CACHE_NAME = 'cv-dimas-v1';
    const assetsToCache = [
      '/',
      '/index.html',
      // Tambahkan file CSS atau JS utama Anda di bawah ini
      // '/css/style.css',
      // '/js/script.js'
    ];
  
    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.addAll(assetsToCache))
      );
    });
  
    self.addEventListener('fetch', event => {
      event.respondWith(
        caches.match(event.request)
          .then(response => response || fetch(event.request))
      );
    });
  })(self);