/* A real browser, pointed at the real build, talking to the real emulators.
 *
 * === THE CONTRACT THIS HARNESS GATES ===================================
 *
 * These gates drive the product through the same surfaces a learner touches,
 * so the product has to expose those surfaces by name. Everything below is a
 * requirement on the implementation, and changing it changes the gate — which
 * is why it is written here, in the file that is hashed into the frozen gate,
 * rather than left to be rediscovered each cycle.
 *
 * CONFIGURATION (no test-only code path)
 *   The build emits `assets/firebase-config.js`, which sets
 *   `window.__EN8_FIREBASE__ = { apiKey, projectId, …, emulators? }`.
 *   When `emulators` is present the app calls connectAuthEmulator /
 *   connectFirestoreEmulator. That is ordinary Firebase dev configuration, not
 *   a backdoor: this harness substitutes the FILE's bytes over the wire and
 *   the application code takes the same branch it takes on any developer's
 *   machine.
 *
 * MARKUP the gates look for — attributes, so they survive restyling:
 *   [data-en8-signin]        the control that begins Google sign-in
 *   [data-en8-signout]       the control that ends the session
 *   [data-en8-auth-state]    value: signed-out | signing-in | signed-in | error
 *   [data-en8-identity]      visible text naming who is signed in
 *   [data-en8-sync-state]    value: idle | syncing | synced | offline | error
 *   [data-en8-sync-detail]   visible human text (e.g. "saved a moment ago")
 *
 * The sync-state attribute is the load-bearing one. "No hidden behind-the-
 * scenes process" is measured, not asserted: every network request the page
 * makes is timestamped against this attribute's value, and a request that
 * happens while it reads `idle` or `synced` is a SILENT operation and fails
 * the gate. That is the only way the requirement can be checked mechanically.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { REPO, ports } from "./lib.mjs";

/* Resolved at import, but NOT thrown at import. A top-level throw here kills
 * the module before its harness can print anything, and a harness that dies
 * without emitting its measurement is indistinguishable from one that measured
 * zero — which is the whole reason lib.mjs reports numbers on failing runs.
 * The error is carried instead, and each harness raises it inside its own
 * try/catch, where it becomes a recorded problem next to a real metric line. */
let _ports = null;
export let portsError = null;
try { _ports = ports(); } catch (e) { portsError = e; }

export const P = _ports || {
  project: "demo-english8", site: "http://127.0.0.1:1", sitePort: 1,
  authHost: "127.0.0.1:1", authPort: 1, firestoreHost: "127.0.0.1", firestorePort: 1,
};

/** The config the app would load in production, rewritten to point at this
 *  run's emulators. Substituted over the wire — the app is unmodified. */
export function emulatorConfigJS() {
  return `window.__EN8_FIREBASE__ = ${JSON.stringify({
    apiKey: "demo-key",
    authDomain: `${P.project}.firebaseapp.com`,
    projectId: P.project,
    appId: "1:0:web:0",
    emulators: {
      auth: `http://${P.authHost}`,
      firestoreHost: P.firestoreHost,
      firestorePort: P.firestorePort,
    },
  })};\n`;
}

export async function launch() {
  return chromium.launch({ args: ["--disable-dev-shm-usage"] });
}

/** One "device": its own context, its own storage, its own network log. */
export async function device(browser, { offline = false, viewport } = {}) {
  const ctx = await browser.newContext({
    viewport: viewport || { width: 390, height: 844 },
    deviceScaleFactor: 2,
    serviceWorkers: "allow",
  });
  const page = await ctx.newPage();

  /* Substitute the config file. Matches any path ending in the config name so
   * it works whether the site is served at root or under /english8/. */
  await ctx.route("**/assets/firebase-config.js*", route =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: emulatorConfigJS() }));

  /* Every request the page makes, with the sync-state the UI was showing at
   * the moment it left. Sampled in the handler rather than afterwards,
   * because a state that flickers back to `synced` before the assertion runs
   * is exactly the hidden process this is looking for. */
  const net = [];
  page.on("request", async req => {
    const url = req.url();
    if (url.startsWith("data:") || url.startsWith("blob:")) return;
    let state = null, visible = false;
    try {
      const r = await page.evaluate(() => {
        const el = document.querySelector("[data-en8-sync-state]");
        if (!el) return { state: null, visible: false };
        const cs = getComputedStyle(el);
        return {
          state: el.getAttribute("data-en8-sync-state"),
          visible: cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0",
        };
      });
      state = r.state; visible = r.visible;
    } catch { /* page navigating or closed — recorded as unknown */ }
    net.push({ url, method: req.method(), resourceType: req.resourceType(), state, visible });
  });

  if (offline) await ctx.setOffline(true);
  return { ctx, page, net };
}

/** Requests that crossed the network to a backend while the UI claimed to be
 *  doing nothing. Same-origin static asset loads are not sync operations and
 *  are excluded by origin, not by guesswork. */
export function silentOps(net) {
  const site = P.site;
  return net.filter(r =>
    !r.url.startsWith(site) &&
    !/^https?:\/\/(127\.0\.0\.1|localhost):\d+\/(assets|units|review)/.test(r.url) &&
    r.state !== "syncing" && r.state !== "error" && r.state !== "offline");
}

/** A page URL on the served build. */
export const url = (p = "/") => `${P.site}${p}`;

/** The first lesson page the build produced — resolved, never hard-coded, so
 *  a renamed route fails as a missing page rather than as a mystery. */
export function aLessonPath() {
  const docs = join(REPO, "docs");
  for (const p of ["unit-01/lesson-1/index.html", "unit-01/index.html", "index.html"]) {
    if (existsSync(join(docs, p))) return "/" + p.replace(/index\.html$/, "");
  }
  throw new Error("no lesson page in docs/ — did tools/build.py run?");
}

export const readDocs = p => readFileSync(join(REPO, "docs", p), "utf8");

/* --- driving the product ------------------------------------------------- */

/** Complete the Auth emulator's account-chooser popup. The emulator serves its
 *  own consent screen in place of Google's; driving it is the only way to
 *  exercise signInWithPopup end to end. */
export async function completePopup(popup, email) {
  await popup.waitForLoadState("domcontentloaded");
  const add = popup.locator("text=Add new account").first();
  if (await add.count()) {
    await add.click();
    await popup.locator("#email-input, input[type=email]").first().fill(email);
    const name = popup.locator("#display-name-input").first();
    if (await name.count()) await name.fill(email.split("@")[0]);
    await popup.locator("#sign-in, button:has-text('Sign in')").first().click();
  } else {
    await popup.locator(`text=${email}`).first().click();
  }
  await popup.waitForEvent("close", { timeout: 20_000 }).catch(() => {});
}

export async function signIn(page, email) {
  const btn = page.locator("[data-en8-signin]").first();
  if (!await btn.count()) throw new Error("no [data-en8-signin] control on the page");
  const [popup] = await Promise.all([
    page.waitForEvent("popup", { timeout: 20_000 }),
    btn.click(),
  ]);
  await completePopup(popup, email);
  await page.waitForFunction(
    () => document.querySelector("[data-en8-auth-state]")?.getAttribute("data-en8-auth-state") === "signed-in",
    null, { timeout: 20_000 });
}

/** Answer the first marked task on the page for real — fill whatever widgets
 *  the build rendered, then commit. Being RIGHT is not the point; an attempt
 *  is the progress this lane has to carry between devices. */
export async function answerFirstTask(page) {
  await page.waitForSelector(".task[data-task] .t-items input, .task[data-task] .t-items select",
    { timeout: 20_000 });
  return page.evaluate(() => {
    const task = document.querySelector(".task[data-task]");
    if (!task) throw new Error("no .task[data-task] on the page");
    const seen = new Set();
    for (const el of task.querySelectorAll(".t-items input, .t-items select")) {
      if (el.type === "radio") {
        if (seen.has(el.name)) continue;
        seen.add(el.name); el.checked = true;
      } else if (el.tagName === "SELECT") {
        el.selectedIndex = Math.min(1, el.options.length - 1);
      } else {
        el.value = "hang out";
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    task.querySelector(".t-check")?.click();
    return task.getAttribute("data-task");
  });
}

/** Everything the app has persisted locally, by its own key prefix. */
export const localState = page => page.evaluate(() => {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith("en8:")) out[k] = localStorage.getItem(k);
  }
  return out;
});

/** Wait for the page to declare it has finished syncing. */
export const waitSynced = (page, ms = 25_000) => page.waitForFunction(
  () => ["synced", "idle"].includes(
    document.querySelector("[data-en8-sync-state]")?.getAttribute("data-en8-sync-state")),
  null, { timeout: ms });
