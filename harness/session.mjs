/* A real browser, real layout boxes, a real session at phone width.
 *
 * This exists from milestone one deliberately. The build being replaced
 * guarded 41% of its runtime with jsdom, which does no layout: it asserted its
 * stylesheet as a STRING and grepped its own source for `function ovoidPath`.
 * Renaming a function failed that gate with a pixel-identical picture, and a
 * balloon landing squarely on a character's face passed it. Nothing here is
 * asserted that was not measured from a box the browser actually laid out.
 *
 * Phone-first is a claim until it is measured, so it is measured — at 360 px,
 * under a CPU throttle, over a local server rather than file:// so module and
 * fetch semantics match what ships.
 */
import { createServer } from "node:http";
import { existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { REPO, resolveBuild, walk, metric, gate, finish } from "./lib.mjs";

const build = resolveBuild();
if (!build.path) { console.log("no build directory found (dist/, build/, docs/)"); process.exit(1); }

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".webp": "image/webp", ".png": "image/png",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp3": "audio/mpeg" };

const server = createServer(async (req, res) => {
  try {
    let p = join(build.path, decodeURIComponent(req.url.split("?")[0]));
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
    const body = await readFile(p);
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404).end("not found"); }
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const results = [];
let swept = 0;

/* ---- phone: 360 px, throttled ------------------------------------------- */
const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

let jsBytes = 0;
page.on("response", async r => {
  const t = (r.headers()["content-type"] || "");
  if (/javascript/.test(t)) { try { jsBytes += (await r.body()).length; } catch {} }
});

const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const t0 = Date.now();
await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 40,
  null, { timeout: 20000 }).catch(() => {});
const firstPaint = Date.now() - t0;
swept++;

/* ---- the page must not scroll sideways at 360 px ------------------------- */
const overflow = await page.evaluate(() =>
  Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));

/* ---- every tap target the thumb needs must be reachable ------------------ */
const smallTargets = await page.evaluate(() => {
  const bad = [];
  for (const el of document.querySelectorAll("a,button,[role=button],input,select")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;          // not rendered
    if (r.height < 24 || r.width < 24) bad.push(`${el.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  return bad.slice(0, 10);
});

/* ---- an interaction, driven, verified from the DOM it changed ------------ */
let interacted = false;
const clickable = page.locator("button:visible, a[href]:visible").first();
if (await clickable.count()) {
  const before = await page.evaluate(() => document.body.innerHTML.length);
  await clickable.click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.body.innerHTML.length);
  const url = page.url();
  interacted = after !== before || url !== `${base}/`;
  swept++;
}

/* ---- desktop: the same page has to survive growing --------------------- */
const wide = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const wpage = await wide.newPage();
await wpage.goto(`${base}/`, { waitUntil: "domcontentloaded" });
const wideOverflow = await wpage.evaluate(() =>
  Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
swept++;

await browser.close();
server.close();

console.log(`interaction: session in a real browser`);
console.log(`  build served from ${build.dir}/`);
console.log(`  360 px  first readable paint ${firstPaint} ms (CPU throttle 4x)`);
console.log(`  360 px  horizontal overflow ${overflow} px`);
console.log(`  1280 px horizontal overflow ${wideOverflow} px`);
console.log(`  javascript delivered ${jsBytes} bytes`);
if (smallTargets.length) console.log(`  tap targets under 24 px: ${smallTargets.join(", ")}`);

metric("first_paint_ms", firstPaint);
metric("js_bytes", jsBytes);
metric("h_overflow_px", overflow);
metric("items_swept", swept);

finish([
  gate("the page does not scroll sideways at 360 px", overflow === 0, `${overflow} px`),
  gate("the page does not scroll sideways at 1280 px", wideOverflow === 0, `${wideOverflow} px`),
  gate("an interaction changes the page", interacted),
  gate("every tap target is at least 24 px", smallTargets.length === 0,
       `${smallTargets.length} too small`),
]);
