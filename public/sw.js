// Service worker mínimo para que la app sea instalable como PWA.
// Sin manejo de fetch a propósito: la app siempre va a la red
// (los datos son en tiempo real, no queremos servir estados viejos).
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
