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
 *   [data-en8-rhythm]        the daily/weekly record, and inside it one
 *     [data-en8-day="YYYY-MM-DD"]  element per day with work on it, keyed by
 *                          the learner's LOCAL date, carrying visible text
 *
 * WHAT THE SYNC STATES MEAN — the gates hold the product to these, so they
 * are part of the contract rather than a reading of it:
 *   idle     signed out, or nothing to do yet
 *   syncing  a local change has not yet reached the backend, OR a request to
 *            the backend is in flight. A change shows `syncing` from the
 *            moment it is made — including while a debounce waits to flush
 *            it — not only while the request itself is open.
 *   synced   the last exchange with the backend completed and nothing local
 *            is pending. Never shown over an unsent change.
 *   offline  there is no network; local changes are kept and will be sent
 *   error    the last exchange failed, in words the learner can act on
 *
 * WHAT "IT SYNCED" MEANS: the other device SHOWS it. Every assertion about
 * progress is made on the page — a task shown done, with its answers, marks
 * and attempt history; a day shown in the record — never on how the build
 * stores anything. Work that arrives from the backend after the page has
 * painted has to be painted too, in place or by the page reloading itself;
 * the harness follows the page across a reload it makes of its own accord.
 *
 * The harness records every value the attribute takes (a MutationObserver
 * installed before the page's own scripts run), and "finished syncing" means
 * the page went through `syncing` and came back to `synced` AFTER the thing
 * being waited on — so a state that simply still reads `synced` from before a
 * write is not mistaken for the write having landed.
 *
 * The sync-state attribute is the load-bearing one. "No hidden behind-the-
 * scenes process" is measured, not asserted: every network request the page
 * makes — including any its service worker makes on its behalf — is
 * timestamped against this attribute's value, and a request to a backend that
 * happens while it reads `idle` or `synced` (or is absent) is a SILENT
 * operation and fails the gate. The one other state that surfaces a request is
 * `data-en8-auth-state="signing-in"`, because the learner has just asked for
 * it and the page is saying so. Requests from the sign-in popup window are not
 * counted: that window IS the visible surface.
 *
 * WHERE THE SITE LIVES: under /english8/, as it does on GitHub Pages, with no
 * custom response headers (Pages cannot send any).
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
  project: "demo-english8", site: "http://127.0.0.1:1", base: "/english8/", sitePort: 1,
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

/* Installed before any of the page's own scripts: reports every value
 * [data-en8-sync-state] and [data-en8-auth-state] take, in order, with the
 * browser's own timestamp, out to the harness through a binding — which is
 * where waitSynced and the request audit both read it, so the record
 * survives the page navigating. `performance`, not `Date`: rhythm.mjs moves
 * Date to another day, and this clock must not move with it. */
const STATE_LOG_INIT = `(() => {
  const last = {};
  const now = () => performance.timeOrigin + performance.now();
  const rec = () => {
    for (const kind of ["sync", "auth"]) {
      const el = document.querySelector("[data-en8-" + kind + "-state]");
      const v = el ? el.getAttribute("data-en8-" + kind + "-state") : null;
      if (v === last[kind] && kind in last) continue;
      last[kind] = v;
      try { window.__en8Report && window.__en8Report(kind, v, now()); } catch (e) {}
    }
  };
  const start = () => {
    rec();
    new MutationObserver(rec).observe(document.documentElement, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: ["data-en8-sync-state", "data-en8-auth-state"],
    });
  };
  if (document.documentElement) start();
  else document.addEventListener("readystatechange", start, { once: true });
})();`;

const TIMELINES = new WeakMap();

/** One "device": its own context, its own storage, its own network log.
 *  `timezoneId` defaults to the learner's own — Quy Nhơn is UTC+7, and a
 *  harness in UTC cannot tell a build that files an evening's work under the
 *  wrong day from one that does not. */
export async function device(browser, { offline = false, viewport, timezoneId = "Asia/Ho_Chi_Minh" } = {}) {
  const ctx = await browser.newContext({
    viewport: viewport || { width: 390, height: 844 },
    deviceScaleFactor: 2,
    serviceWorkers: "allow",
    timezoneId,
  });
  const page = await ctx.newPage();

  /* The state timeline: every value the two attributes took on THIS page,
   * across navigations, stamped by the browser. */
  const timeline = [];
  TIMELINES.set(page, timeline);
  await ctx.exposeBinding("__en8Report", (src, kind, value, t) => {
    /* The main frame only: the init script also runs inside iframes — the
     * sign-in SDK inserts one — where neither attribute exists, and a `null`
     * from there would read as the page having lost its indicator. */
    if (src.page === page && src.frame === page.mainFrame()) timeline.push({ kind, value, t });
  });
  await ctx.addInitScript(STATE_LOG_INIT);

  /* Substitute the config file. Matches any path ending in the config name so
   * it works whether the site is served at root or under /english8/. A
   * service worker must let this request through to the network rather than
   * answer it from a cache (see the orientation file): a cached copy would be
   * the production config, and the page would stop talking to the emulators. */
  await ctx.route("**/assets/firebase-config.js*", route =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: emulatorConfigJS() }));

  /* Every request the device makes — the CONTEXT's, not the page's, so a
   * request a service worker issues on the page's behalf is counted too.
   * Each is judged against the state the page was showing AT THE MOMENT IT
   * LEFT, by the browser's own clock (see silentOps), not by asking the page
   * afterwards: an asynchronous look lands late, after a state that flickered
   * back to `synced` — or in the next document, mid-navigation, where it reads
   * nothing at all. */
  const net = [];
  net.timeline = timeline;
  ctx.on("request", req => {
    const url = req.url();
    if (url.startsWith("data:") || url.startsWith("blob:")) return;
    let from = "page";
    if (req.serviceWorker()) from = "service-worker";
    else {
      try {
        if (req.frame().page() !== page) return;   // the sign-in popup: a visible window of its own
      } catch {
        /* No frame yet: Playwright's documented case of a navigation issued
         * before its frame exists, which is how a popup's first request
         * arrives. A window the learner can see is not a hidden process. */
        if (req.isNavigationRequest()) return;
        from = "unattributed";
      }
    }
    net.push({ url, method: req.method(), resourceType: req.resourceType(), from, req, seenAt: Date.now() });
  });

  if (offline) await ctx.setOffline(true);
  return { ctx, page, net };
}

/* A request and the state change that announces it are stamped by two clocks
 * inside one browser (the network stack's and the page's); this is the slack
 * allowed between them. It is far below anything a learner could see, so it
 * cannot hide a real silent operation. */
const CLOCK_SLACK_MS = 25;

function stateAt(timeline, kind, t) {
  let v = undefined;
  for (const e of timeline) { if (e.kind !== kind) continue; if (e.t <= t) v = e.value; else break; }
  return v;
}

/** Requests that crossed the network to a backend while the UI claimed to be
 *  doing nothing. Same-origin static asset loads are not sync operations and
 *  are excluded by origin, not by guesswork. Each gets `state` and `auth` —
 *  what the page showed when it left — for reporting. */
export function silentOps(net) {
  const site = P.site;
  const tl = (net.timeline || []).slice().sort((a, b) => a.t - b.t);
  const SURFACED = new Set(["syncing", "error", "offline"]);
  return net.filter(r => !r.url.startsWith(site)).map(r => {
    const started = r.req?.timing?.().startTime;
    const t = started > 0 ? started : r.seenAt;
    r.state = stateAt(tl, "sync", t) ?? null;
    r.auth = stateAt(tl, "auth", t) ?? null;
    const later = stateAt(tl, "sync", t + CLOCK_SLACK_MS);
    const laterAuth = stateAt(tl, "auth", t + CLOCK_SLACK_MS);
    r.surfaced = SURFACED.has(r.state) || SURFACED.has(later) ||
                 r.auth === "signing-in" || laterAuth === "signing-in";
    return r;
  }).filter(r => !r.surfaced);
}

/** A learner email unique to THIS run. The emulators outlive a scenario —
 *  the gate and a benchmark can share one stack, and a scenario may be run
 *  again on it — so a fixed address would sign in to the work an earlier run
 *  left behind, and "a second learner who has done nothing" would not be one. */
const RUN = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const learner = role => `${role}-${RUN}@example.com`;

/** A page URL on the served build, under the path the site is published at.
 *  `p` is relative to the site root ("unit-01/lesson-1/"). */
export const url = (p = "") => `${P.site}${P.base || "/english8/"}${String(p).replace(/^\/+/, "")}`;

/** The first lesson page the build produced — resolved, never hard-coded, so
 *  a renamed route fails as a missing page rather than as a mystery. */
export function aLessonPath() {
  const docs = join(REPO, "docs");
  for (const p of ["unit-01/lesson-1/index.html", "unit-01/index.html", "index.html"]) {
    if (existsSync(join(docs, p))) return p.replace(/index\.html$/, "");
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

/** Answer the `index`-th marked task on the page for real, as a learner
 *  would: if it already carries an attempt, take "Try it again" first (a
 *  retake is a new attempt, and Check stays disabled until then); mark any
 *  confidence toggles; fill whatever widgets the build rendered; press Check;
 *  and wait until the page itself says the attempt is committed. Being RIGHT
 *  is not the point — an attempt is the progress this lane has to carry
 *  between devices. Returns the task id. */
export async function answerTask(page, index = 0) {
  await page.waitForFunction(i => {
    const t = document.querySelectorAll(".task[data-task]")[i];
    return !!t && !!t.querySelector(".t-items input, .t-items select");
  }, index, { timeout: 20_000 });
  const id = await page.evaluate(i => {
    const task = document.querySelectorAll(".task[data-task]")[i];
    const again = task.querySelector(".t-again");
    if (task.dataset.done === "1" && again && !again.hidden) again.click();
    for (const b of task.querySelectorAll(".i-conf button")) if (!b.disabled) b.click();
    const seen = new Set();
    for (const el of task.querySelectorAll(".t-items input, .t-items select")) {
      if (el.disabled) continue;
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
    const check = task.querySelector(".t-check");
    if (!check || check.disabled) throw new Error(`task ${task.dataset.task}: Check is not clickable`);
    check.click();
    return task.getAttribute("data-task");
  }, index);
  await page.waitForFunction(i =>
    document.querySelectorAll(".task[data-task]")[i]?.dataset.done === "1", index, { timeout: 10_000 })
    .catch(() => { throw new Error(`task ${id}: the attempt was never committed (data-done never set)`); });
  return id;
}

/** Kept for the scenarios that only ever need one task. */
export const answerFirstTask = page => answerTask(page, 0);

/* The sync-state record the harness reads is the one the page REPORTED OUT
 * (the timeline device() keeps, fed through the binding), not the array the
 * init script keeps inside the page. The in-page array dies with its
 * document, so a build that reloads itself after pulling — a legitimate way to
 * show work that arrived from another device — would reset it mid-wait, and a
 * `since` index taken in the old document would point into the wrong array. */
const syncEntries = page => (TIMELINES.get(page) || []).filter(e => e.kind === "sync");

/** Where the sync-state record stands now — the index of the CURRENT state,
 *  so a page that is already `syncing` when the mark is taken (an initial
 *  pull still running) and stays `syncing` through the change being waited
 *  on is credited with it. Marking after the current entry instead would wait
 *  forever on a page that coalesced the change into the exchange already in
 *  flight, which is correct behaviour. Pass it to waitSynced as `since`. */
export const mark = async page => Math.max(0, syncEntries(page).length - 1);

/** The sync-state values the page has shown, in order, across navigations. */
export const syncLog = async (page, since = 0) => syncEntries(page).slice(since).map(e => e.value);

/** Wait for the page to declare it has finished syncing.
 *
 *  With `since` (a `mark()` taken BEFORE the action being waited on), it
 *  waits for the page to pass through `syncing` after that mark and come back
 *  to `synced` — the action's exchange with the backend completed. Without
 *  it, it waits for the state to read `synced`. `idle` never counts: it means
 *  nothing has happened, which is not the same as something having finished. */
export async function waitSynced(page, { since, ms = 25_000 } = {}) {
  const deadline = Date.now() + ms;
  for (;;) {
    const log = syncEntries(page);
    const now = log.length ? log[log.length - 1].value : null;
    if (now === "synced" && (since == null || log.slice(since).some(e => e.value === "syncing"))) return;
    if (Date.now() > deadline) break;
    await new Promise(r => setTimeout(r, 40));
  }
  /* Say what the page was showing, so a timeout reads as "stuck in error"
   * or "never left synced" rather than as an anonymous wait. */
  const seen = await syncLog(page, since ?? 0);
  const detail = await page.$eval("[data-en8-sync-detail]", el => el.textContent.trim()).catch(() => null);
  throw new Error(`the page never finished syncing within ${ms}ms — states shown: ` +
    `${seen.map(s => s ?? "absent").join(" → ") || "none"}` +
    (detail ? `; detail text: ${JSON.stringify(detail)}` : ""));
}

/** What the learner sees of one marked task: whether it is done, the answer
 *  given and the mark on each item, the score line and the attempt history.
 *  Two devices showing the same learner the same task must agree on all of it
 *  — a sync that carries "task done" but loses the answers, or carries the
 *  latest attempt but not the history, shows a different page. */
export async function taskView(page, id) {
  return page.locator(`.task[data-task="${id}"]`).first().evaluate(t => ({
    done: t.dataset.done === "1",
    items: [...t.querySelectorAll(".t-items .i")].map(li => ({
      ok: li.dataset.ok ?? null,
      given: [...li.querySelectorAll("input, select")].map(el =>
        el.type === "radio" || el.type === "checkbox" ? (el.checked ? el.value : null) : el.value)
        .filter(v => v !== null),
    })),
    score: (t.querySelector(".t-score")?.textContent || "").trim(),
    history: (t.querySelector(".t-log")?.innerText || "").trim(),
  }), null, { timeout: 10_000 });
}

/** Wait until the page SHOWS the task as done — the learner-visible fact —
 *  surviving any reload the page does of its own accord. False on timeout. */
export const showsDone = (page, id, ms = 10_000) =>
  page.locator(`.task[data-task="${id}"][data-done="1"] .t-items .i`).first()
    .waitFor({ state: "attached", timeout: ms }).then(() => true, () => false);
