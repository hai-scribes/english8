const MODE = "__MODE__";
const CACHE = "ref-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("message", e => {
  if (e.data?.precache) e.waitUntil(caches.open(CACHE).then(c => Promise.all(e.data.precache.map(async u => {
    /* cache-first pins: cache once, never refresh. network-first refreshes on every fetch anyway. */
    if (MODE === "cache-first" && await c.match(u, { ignoreSearch: true })) return;
    return c.add(u).catch(() => {});
  }))));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || u.pathname.endsWith("firebase-config.js")) return;
  if (MODE === "cache-first") {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; })));
    return;
  }
  e.respondWith(fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || Response.error())));
});
