// ===== Service Worker (LevPay) =====
const CACHE_NAME = "levpay-beta-v5.3"; // bump versi biar cache baru kepakai
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css?",
  "./css/animations.css",
  "./js/vendor/qrcode.min.js",
  "./js/config.js",
  "./js/utils.js",
  "./js/script.js",
];

// === Tambahan: origin Orkut & whitelist CDN QR (bukan Xendit) ===
const ORKUT_ORIGIN = "https://orkut.ftvpn.me";
const CDN_WHITELIST = new Set([
  "https://api.qrserver.com",
  "https://chart.googleapis.com",
  ORKUT_ORIGIN
]);

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => Promise.resolve())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // --- tetap: hanya handle GET + same-origin nav/static
  if (req.method !== "GET") return;

  // --- BYPASS: semua /api/ same-origin (FE nggak pakai Xendit; Orkut cross-origin)
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return;

  // --- Tambahan: handle beberapa request cross-origin yg perlu (QR CDN & Orkut)
  // Agar gambar QR & polling Orkut bisa di-cache SW (stale-while-revalidate ringan).
  if (url.origin !== self.location.origin && CDN_WHITELIST.has(url.origin)) {
    event.respondWith((async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        const network = fetch(req).then(res => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      } catch {
        return fetch(req);
      }
    })());
    return;
  }

  // --- Navigasi halaman: online-first + fallback index.html saat offline
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match("./index.html") || new Response("Offline", { status: 503 });
      }
    })());
    return;
  }

  // --- Static same-origin: cache-first + update di belakang
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const fetchAndCache = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || fetchAndCache;
    })());
  }
});