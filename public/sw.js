/* AniSync service worker — uygulama kabuğu + anime kapak önbelleği.
 * API ve Firebase çağrıları bilinçli olarak önbelleğe alınmaz.
 * Sürüm değişince CACHE adını artırın. */
const CACHE_NAME = 'anisync-shell-v3';
const IMAGE_CACHE_NAME = 'anisync-images-v1';
const IMAGE_CACHE_MAX = 300;
const PRECACHE_URLS = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

/* Kapak görselleri: AniList/MAL CDN'leri agresif önbelleklenir (uzun TTL,
 * haftada bir değişmezler); 300 girdilik yaklaşık FIFO sınırı uygulanır. */
const IMAGE_HOSTS = new Set([
  'cdn.myanimelist.net',
  's4.anilist.co',
  'i.ytimg.com',
  'images.unsplash.com',
]);

async function trimImageCache() {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const keys = await cache.keys();
    if (keys.length <= IMAGE_CACHE_MAX) return;
    // Yaklaşık FIFO: fazlasını ilk kayıtlı anahtarlardan sil.
    const excess = keys.length - IMAGE_CACHE_MAX;
    await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
  } catch {
    /* önbellek kota/dolum hatası uygulamayı etkilemesin */
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([CACHE_NAME, IMAGE_CACHE_NAME]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Anime kapağı görselleri (çapraz-origin): önce önbellek, sonra ağ.
  if (url.origin !== self.location.origin) {
    if (!IMAGE_HOSTS.has(url.hostname)) return;
    if (request.destination !== 'image' && !/\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url.pathname)) return;
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(request, response.clone()).then(trimImageCache).catch(() => undefined);
            return response;
          }
          return response;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  if (url.pathname.startsWith('/api/')) return;

  // Sayfa navigasyonları: önce ağ, çevrimdışıysa kabuk.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Statik varlıklar: önce önbellek, sonra ağ (cache-first).
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
