(self => {
  // 1. Ganti nama versi cache ke v2 agar browser tahu ada perubahan besar
  const CACHE_NAME = 'cv-dimas-v2';
  const assetsToCache = [
    '/',
    '/index.html'
  ];

  // Proses Install
  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(assetsToCache))
        .then(() => self.skipWaiting()) // Memaksa SW baru langsung aktif tanpa menunggu tab ditutup
    );
  });

  // Proses Aktivasi: Membersihkan sampah cache v1 lama secara otomatis
  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
              console.log('PWA: Menghapus cache lama...', cache);
              return caches.delete(cache);
            }
          })
        );
      }).then(() => self.clients.claim()) // Langsung ambil alih kontrol halaman seketika
    );
  });

  // STRATEGI BARU: Ambil file terbaru dari server dulu, jika gagal/offline baru pakai Cache
  self.addEventListener('fetch', event => {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Jika berhasil dapat file baru dari server, simpan atau langsung kembalikan
          return networkResponse;
        })
        .catch(() => {
          // Jika offline / server gagal diakses, baru ambil dari cadangan cache
          return caches.match(event.request);
        })
    );
  });
})(self);
