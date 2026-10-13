/* English 8 — the course with no signal.

   Published at the site root (build.py copies it there and stamps the build
   into it): a worker cannot reach above its own folder, and GitHub Pages
   cannot send the header that would let it.

   What is kept, and where:
     pages    one cache per build, "en8-pages-<build>". A page is one file
              however it is asked for, so …/ and …/index.html are one entry.
     files    one cache for everything else, "en8-files", by full address.
              Scripts and styles carry a hash in their address, so two builds'
              copies sit side by side and a page always gets its own.

   A page comes from the network when the network answers, and from the kept
   copy when it does not — or when it has said nothing for three seconds,
   which on a train is the same thing. Everything else comes from the kept
   copy first: an address with a hash in it never goes stale.

   The whole course is fetched once a page asks for it (it does not ask on a
   device that wants to save data). A new build is gathered beside the old one
   and takes over only when every file of it is here; until then the old build
   is what an offline page gets, whole. Only then are the old build's files
   dropped. An update cut off half way therefore costs nothing. */
const BUILD = "ce2e4c8c4db6";
const PAGES = "en8-pages-";
const FILES = "en8-files";
const PATIENCE = 3000;
const SCOPE = self.registration.scope;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

const pageKey = url => {
  const u = new URL(url);
  u.hash = ""; u.search = "";
  if (u.pathname.endsWith("/")) u.pathname += "index.html";
  return u.href;
};
/* A page however it is asked for: opened, or fetched by a script. */
const isPage = req => req.mode === "navigate" || req.destination === "document"
  || /(\/|\.html)$/.test(new URL(req.url).pathname);
const passes = u => u.origin !== self.location.origin || u.href.indexOf(SCOPE) !== 0
  || /\/assets\/firebase-config\.js$/.test(u.pathname) || /\/(precache\.json|sw\.js)$/.test(u.pathname)
  || u.pathname.indexOf("/__") >= 0;

/* The worker's own record — which build is in use, what has arrived — is
   kept in IndexedDB, so the caches hold nothing but the course itself. */
function notes(){
  return new Promise((done, fail) => {
    const open = indexedDB.open("en8-worker", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("notes");
    open.onsuccess = () => done(open.result);
    open.onerror = () => fail(open.error);
  });
}
async function note(name, value){
  const db = await notes();
  try {
    return await new Promise((done, fail) => {
      const tx = db.transaction("notes", value === undefined ? "readonly" : "readwrite");
      const st = tx.objectStore("notes");
      const rq = value === undefined ? st.get(name) : value === null ? st.delete(name) : st.put(value, name);
      tx.oncomplete = () => done(value === undefined ? (rq.result === undefined ? null : rq.result) : undefined);
      tx.onerror = tx.onabort = () => fail(tx.error);
    });
  } finally { db.close(); }
}
const buildOf = html => (/<html[^>]*\sdata-build="([^"]+)"/.exec(html) || [])[1] || "";

/* The kept copy of a page: the build in use first, then the newest build that
   has it (a device saving data keeps pages one at a time and has no build in
   use). */
async function keptPage(url){
  const key = pageKey(url), state = (await note("state")) || {};
  const names = (await caches.keys()).filter(n => n.indexOf(PAGES) === 0);
  const order = (state.seen || []).map(b => PAGES + b).filter(n => names.includes(n)).reverse();
  for (const n of names) if (!order.includes(n)) order.push(n);
  if (state.active && names.includes(PAGES + state.active)){
    order.splice(order.indexOf(PAGES + state.active), 1);
    order.unshift(PAGES + state.active);
  }
  for (const n of order){
    const r = await (await caches.open(n)).match(key);
    if (r) return r;
  }
  return null;
}
async function keepPage(url, res){
  if (!res || !res.ok || res.redirected) return;
  const html = await res.clone().text(), b = buildOf(html);
  if (!b) return;
  await (await caches.open(PAGES + b)).put(pageKey(url), res);
  const state = (await note("state")) || {};
  state.seen = (state.seen || []).filter(x => x !== b).concat([b]);
  await note("state", state);
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (passes(u)) return;

  if (isPage(req)){
    e.respondWith((async () => {
      /* Asked for afresh, past the browser's own copy: a device with signal
         gets the page that names the newest build. */
      const net = fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(async res => {
        if (res && res.ok && !res.redirected) await keepPage(req.url, res.clone());
        return res;
      });
      const kept = await keptPage(req.url);
      if (!kept) return net;
      e.waitUntil(net.catch(() => {}));
      try {
        const res = await Promise.race([net, new Promise(r => setTimeout(() => r(null), PATIENCE))]);
        return res && res.ok ? res : kept;
      } catch(err){ return kept; }
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(FILES);
    const hit = await c.match(req.url);
    if (hit) return hit;
    const res = await fetch(req);
    if (res && res.ok && !res.redirected) c.put(req.url, res.clone()).catch(() => {});
    return res;
  })());
});

/* ---- the page a worker did not serve, and what it loaded ----------------- */
async function keepLoaded(urls){
  const files = await caches.open(FILES);
  for (const raw of urls || []){
    let u;
    try { u = new URL(raw); } catch(e){ continue; }
    if (passes(u)) continue;
    try {
      if (/\/$|\.html$/.test(u.pathname)){
        if (!(await keptPage(u.href))) await keepPage(u.href, await fetch(u.href, { credentials: "same-origin" }));
      } else if (!(await files.match(u.href))){
        const r = await fetch(u.href, { credentials: "same-origin" });
        if (r.ok && !r.redirected) await files.put(u.href, r);
      }
    } catch(e){}
  }
}

/* ---- the whole course ---------------------------------------------------- */
let gathering = null;
async function gather(){
  const res = await fetch(new URL("precache.json", SCOPE).href, { cache: "no-store", credentials: "same-origin" });
  if (!res.ok) return;
  const list = await res.json();
  const state = (await note("state")) || {};
  if (state.active === list.v) return;
  const had = (await note("hashes")) || {};
  const got = (await note("got-" + list.v)) || {};
  const pages = await caches.open(PAGES + list.v), files = await caches.open(FILES);
  const abs = p => new URL(p, SCOPE).href;
  const paged = p => /\.html$/.test(p.split("?")[0]);

  const todo = [];
  for (const p of Object.keys(list.files)){
    if (got[p] === list.files[p]) continue;
    if (paged(p)){ todo.push(p); continue; }
    /* A file the device already holds, unchanged, is not fetched again. */
    if (had[p] === list.files[p] && (await files.match(abs(p)))){ got[p] = list.files[p]; continue; }
    todo.push(p);
  }
  let i = 0, since = 0;
  const one = async () => {
    while (i < todo.length){
      const p = todo[i++];
      try {
        const r = await fetch(abs(p), { cache: "no-store", credentials: "same-origin" });
        if (!r.ok || r.redirected) continue;
        if (paged(p)) await pages.put(pageKey(abs(p)), r); else await files.put(abs(p), r);
        got[p] = list.files[p];
        /* Written down as it goes, so a worker stopped half way carries on
           from where it was. */
        if (++since % 25 === 0) await note("got-" + list.v, got);
      } catch(e){}
    }
  };
  /* A few at a time: the lesson she is on is never starved of the network. */
  await Promise.all([one(), one(), one(), one()]);
  await note("got-" + list.v, got);
  if (Object.keys(list.files).some(p => got[p] !== list.files[p])) return;      // not whole yet

  /* The new build is all here. It takes over, and what only older builds
     used is dropped. */
  const now = (await note("state")) || {};
  now.active = list.v;
  now.seen = (now.seen || []).filter(x => x !== list.v).concat([list.v]);
  await note("state", now);
  await note("hashes", list.files);
  for (const n of await caches.keys()){
    if (n.indexOf(PAGES) === 0 && n !== PAGES + list.v) await caches.delete(n);
  }
  const keep = new Set(Object.keys(list.files).filter(p => !paged(p)).map(abs));
  for (const r of await files.keys()) if (!keep.has(r.url)) await files.delete(r);
  if (state.active && state.active !== list.v) await note("got-" + state.active, null);
  for (const b of now.seen) if (b !== list.v) await note("got-" + b, null);
  now.seen = [list.v];
  await note("state", now);
}

self.addEventListener("message", e => {
  const d = e.data || {};
  if (d.type === "en8:keep-page") e.waitUntil(keepLoaded(d.urls));
  if (d.type === "en8:keep-course"){
    if (!gathering) gathering = gather().catch(() => {}).then(() => { gathering = null; });
    e.waitUntil(gathering);
  }
});
