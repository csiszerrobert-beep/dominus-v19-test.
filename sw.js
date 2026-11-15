/* Dominus V19.1 — actualizare sigură a fișierelor, fără ștergerea datelor locale */
const CACHE = 'dominus-v19-1-pdf-share-20261115-2';
const ASSETS = [
  './', './index.html', './verificari.html', './constatare.html',
  './reclamatie.html', './pompe_pif.html', './certificat_garantie.html', './certificat_garantie_pompe.html',
  './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './logo-dominus.png', './certificat-pagina-1.jpg', './certificat-pagina-2.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(async cache => {
      await Promise.all(ASSETS.map(async path => {
        try {
          const request = new Request(path, { cache: 'reload' });
          const response = await fetch(request);
          if (response.ok) await cache.put(path, response);
        } catch (error) {
          // Un fișier indisponibil nu blochează instalarea actualizării.
        }
      }));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('dominus-') && key !== CACHE)
          .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigarea către formulare: online = cea mai nouă versiune;
  // offline = versiunea salvată local.
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(new Request(req, { cache: 'no-store' }))
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE).then(cache => cache.put(req, copy)));
          }
          return response;
        })
        .catch(async () => (await caches.match(req, {ignoreSearch: true})) ||
          Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(req, {ignoreSearch: true}).then(cached =>
      cached || fetch(req).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(req, copy)));
        }
        return response;
      })
    )
  );
});
