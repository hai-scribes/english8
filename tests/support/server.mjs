/* The site, as the tests see it: a static server over the built pages that a
   test can steer.

   Every test has its own "site", named by the `en8site` cookie its devices
   carry, so tests running side by side never see each other's steering. A site
   has:
     build   which build is published (b1 or b2)
     hang    a pattern; a matching request is held open and never answered
     cutAt   answer this many requests for the build's files, then drop the rest
     down    answer nothing at all (the site is unreachable)

   Steering is POST /__test/site with a JSON body; GET returns the state and
   the list of paths this site has been asked for.

   /assets/firebase-config.js is always answered from here, pointing sign-in
   and the store at the emulators — never from the build, whose copy names the
   real project. */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_PORT, HOST, AUTH, STORE_PORT, PROJECT } from "./ports.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BUILDS = process.env.EN8_TEST_BUILDS || join(ROOT, "node_modules", ".cache", "en8-builds");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon",
};

const sites = new Map();
const site = id => {
  if (!sites.has(id)) sites.set(id, { build: "b1", hang: null, cutAt: null, served: 0, down: false, asked: [] });
  return sites.get(id);
};
const cookieSite = req => {
  const m = /(?:^|;\s*)en8site=([\w-]+)/.exec(req.headers.cookie || "");
  return m ? m[1] : "default";
};

const CONFIG = `window.EN8_FIREBASE = ${JSON.stringify({
  apiKey: "demo-key",
  authDomain: `${PROJECT}.firebaseapp.com`,
  projectId: PROJECT,
  appId: "demo-app",
  emulators: { auth: AUTH, firestore: `${HOST}:${STORE_PORT}` },
})};\n`;

const body = req => new Promise(done => {
  let s = "";
  req.on("data", c => { s += c; });
  req.on("end", () => done(s));
});

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/__test/site") {
    const id = url.searchParams.get("id") || cookieSite(req);
    const st = site(id);
    if (req.method === "POST") {
      const patch = JSON.parse((await body(req)) || "{}");
      for (const k of ["build", "hang", "cutAt", "down"]) if (k in patch) st[k] = patch[k];
      if ("cutAt" in patch) st.served = 0;
      if (patch.forget) st.asked = [];
    }
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify(st));
    return;
  }

  if (url.pathname === "/__test/auth.html" || url.pathname === "/__test/auth.js") {
    const f = join(BUILDS, "testpage", url.pathname.slice(8));
    res.writeHead(200, { "content-type": TYPES[extname(f)], "cache-control": "no-store" });
    createReadStream(f).pipe(res);
    return;
  }

  const st = site(cookieSite(req));
  st.asked.push(url.pathname);
  if (st.down) { req.socket.destroy(); return; }
  if (st.hang && new RegExp(st.hang).test(url.pathname)) return;        // held open

  if (url.pathname === "/assets/firebase-config.js") {
    res.writeHead(200, { "content-type": TYPES[".js"], "cache-control": "no-store" });
    res.end(CONFIG);
    return;
  }

  let rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[\/\\])+/, "");
  if (rel.endsWith("/")) rel += "index.html";
  let file = join(BUILDS, st.build, rel);
  if (existsSync(file) && statSync(file).isDirectory()) {
    res.writeHead(301, { location: url.pathname + "/" });
    res.end();
    return;
  }
  if (!existsSync(file)) { res.writeHead(404, { "cache-control": "no-store" }); res.end("not found"); return; }

  if (st.cutAt != null) {
    st.served++;
    if (st.served > st.cutAt) { req.socket.destroy(); return; }
  }
  /* no-cache, as GitHub Pages serves with a short life and an ETag: the
     browser's own HTTP cache must never be what makes an offline test pass. */
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
  createReadStream(file).pipe(res);
}).listen(SITE_PORT, HOST, () => console.log(`en8 test site on http://${HOST}:${SITE_PORT} from ${BUILDS}`));
