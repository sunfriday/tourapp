const STATIC_CACHE = "tourapp-static-v5";
const IMAGE_CACHE = "tourapp-images-v1";
const WEATHER_CACHE = "tourapp-weather-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

const putInCache = async (cacheName, request, response) => {
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
};

const cacheFirst = async (request, cacheName) => {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    await putInCache(cacheName, request, response);
  }
  return response;
};

const networkFirst = async (request, cacheName) => {
  try {
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") {
      await putInCache(cacheName, request, response);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error("No cached response available");
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.all(
          STATIC_ASSETS.map((asset) =>
            fetch(asset)
              .then((response) => {
                if (response.ok) return cache.put(asset, response);
                return null;
              })
              .catch(() => null),
          ),
        ),
      ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const allowedCaches = new Set([STATIC_CACHE, IMAGE_CACHE, WEATHER_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !allowedCaches.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.hostname === "api.open-meteo.com") {
    event.respondWith(networkFirst(request, WEATHER_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
  }
});
