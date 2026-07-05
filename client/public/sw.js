/*
 * Self-unregistering Service Worker.
 *
 * Background: previous builds registered /sw.js at client/src/utils/caching.ts.
 * Some browsers still hold an active Service Worker for http://localhost:5173/
 * from those builds. The stale SW intercepts fetch events, tries to load
 * /manifest.json from a port where no server is reachable, and returns
 * text/html where the browser expects a JS module — producing the
 * "Expected a JavaScript-or-Wasm module script" MIME-type errors.
 *
 * This stub is intentionally minimal:
 *   1. On install: skipWaiting() so we activate immediately.
 *   2. On activate: drop every cache, then unregister this and any
 *      previously-installed SW. After this single activation pass
 *      the page leaves no Service Worker active, so future fetches
 *      go straight to the dev server / static assets without any
 *      stale interception.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (_) {
        /* caches API unavailable — nothing to clear */
      }
      try {
        await self.registration.unregister();
      } catch (_) {
        /* already gone */
      }
    })(),
  );
});
