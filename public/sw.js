const STATIC_CACHE_NAME = "princess-q-ledger-static-v2";
const CACHEABLE_PATH_PREFIXES = [
  "/_next/static/",
  "/manifest.webmanifest",
  "/icon",
  "/apple-icon",
];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isCacheableStaticRequest(request) {
  const url = new URL(request.url);

  if (!isSameOrigin(url)) {
    return false;
  }

  if (request.destination === "document") {
    return false;
  }

  return CACHEABLE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

async function cacheStaticResponse(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone()).catch(() => undefined);
  }

  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE_NAME)
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (isNavigationRequest(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (!isCacheableStaticRequest(event.request)) {
    return;
  }

  event.respondWith(cacheStaticResponse(event.request));
});
