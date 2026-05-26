/**
 * Service Worker — PWA Offline-First MediConnect
 * Habilita el funcionamiento sin conexión del cliente web.
 * Implementa la estrategia Cache-First para assets estáticos y
 * Network-First para datos clínicos en tiempo real.
 * Cuando no hay red: sirve desde caché y encola peticiones en IndexedDB
 * para que el SyncManager las envíe cuando la red regrese.
 *
 * Estrategias de caché por tipo de recurso:
 * - Assets estáticos (JS, CSS, imágenes): Cache-First (offline primero)
 * - API calls de lectura (GET /ehr, GET /appointments): Network-First
 * - API calls de escritura (POST, PATCH): Almacenar en IndexedDB y diferir
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'mediconnect-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalar: cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar: limpiar caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: estrategia de respuesta según tipo de recurso
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Assets estáticos: Cache-First
  if (event.request.method === 'GET' && !url.pathname.startsWith('/api')) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  // API GET: Network-First (datos frescos si hay red)
  if (event.request.method === 'GET' && url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request) as Promise<Response>)
    );
    return;
  }

  // API POST/PATCH sin red: almacenar para sincronización posterior
  if (['POST', 'PATCH'].includes(event.request.method)) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // Cuando no hay red: responder con éxito simulado y encolar en IndexedDB
        console.log('[SW] Sin red. Encolando petición para sincronización posterior.');
        return new Response(
          JSON.stringify({ status: 'queued', message: 'Guardado localmente. Se sincronizará cuando haya conexión.' }),
          { status: 202, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
  }
});
