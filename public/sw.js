const CACHE_NAME = 'sirius-pwa-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', event => {
    // Obliga al nuevo Service Worker a instalarse inmediatamente y saltar la fase de espera
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    // Toma el control de la aplicación al instante
    event.waitUntil(clients.claim());

    // Borra cualquier caché antigua (como sirius-pwa-v1) para que no haya conflictos
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Borrando cache antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Estrategia "Network First" (Red Primero):
    // Siempre intenta descargar la versión más reciente de internet.
    // Solo si no hay internet (offline), usa la versión guardada en caché.
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Guarda una copia fresca en caché para cuando no haya internet
                if (event.request.method === 'GET') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Error de red (offline): devolver desde caché
                return caches.match(event.request);
            })
    );
});
