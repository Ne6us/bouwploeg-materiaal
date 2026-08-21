/* Bouwploeg materiaal - service worker
   Zorgt dat de app installeerbaar is op Android en dat de schil
   (het uiterlijk) snel laadt. De materiaallijst zelf komt live uit
   Firebase en heeft dus wel internet nodig. */

const CACHE = 'bouwploeg-v1';
const SCHIL = [
  '/bouwploeg-materiaal/',
  '/bouwploeg-materiaal/index.html',
  '/bouwploeg-materiaal/manifest.webmanifest',
  '/bouwploeg-materiaal/icon-192.png',
  '/bouwploeg-materiaal/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SCHIL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Alleen GET-verzoeken binnen onze eigen site cachen.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Verzoeken naar Firebase/Google (de live data) nooit cachen.
  if (url.origin !== self.location.origin) return;

  // Voor navigatie (de pagina zelf): eerst netwerk, val terug op cache.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/bouwploeg-materiaal/index.html'))
    );
    return;
  }

  // Overige eigen bestanden: eerst cache, anders netwerk.
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req))
  );
});
