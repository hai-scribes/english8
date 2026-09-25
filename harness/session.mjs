/* "No hidden behind-the-scenes process — surface UI indication of any forms."
 *
 * That is the one requirement here that a reasonable implementation can
 * satisfy invisibly and still fail, so it is measured rather than asserted.
 * Every request the device makes — the page's and its service worker's — is
 * timestamped against what [data-en8-sync-state] was showing AT THE MOMENT IT
 * LEFT, sampled in the request handler, because a state that flickers back to
 * "synced" before an assertion runs is precisely the hidden process being
 * looked for. A request to a backend while the UI reads idle/synced is a
 * silent operation, and one is a failure.
 *
 * Also gates offline — "learn everywhere" that needs a network is a weaker
 * promise than the one that was made — and the service worker's own named
 * risk: that it pins a device to the build it first saw. build.py content-
 * hashes app.js into its query string, so a worker that serves cached HTML
 * keeps naming the old hash forever. serve.mjs can simulate a deploy; after
 * one, the new app.js has to reach this device within a couple of ordinary
 * reloads.
 */
import { metric, gate, finish } from "./lib.mjs";
import {
  launch, device, url, aLessonPath, signIn, answerTask, waitSynced, mark, syncLog,
  silentOps, P, learner, portsError,
} from "./browser.mjs";

const LEARNER = learner("session");
const problems = [];
let steps = 0, silent = 0, surfaced = 0;
const LESSON = aLessonPath();
const browser = await launch();
const stateOf = page => page.$eval("[data-en8-sync-state]", el => el.getAttribute("data-en8-sync-state")).catch(() => null);

try {
  if (portsError) throw portsError;
  const { ctx, page, net } = await device(browser);
  await page.goto(url(LESSON), { waitUntil: "domcontentloaded" });

  /* 1 — the indicator exists and is legible before anything happens */
  steps++;
  const has = await page.locator("[data-en8-sync-state]").count();
  if (!has) problems.push("no [data-en8-sync-state] anywhere on the page");
  else surfaced++;

  /* 2 — signing in is narrated, not silent */
  steps++;
  try {
    const m = await mark(page);
    await signIn(page, LEARNER);
    await waitSynced(page, { since: m });
    const detail = await page.$eval("[data-en8-sync-detail]", el => el.textContent.trim()).catch(() => "");
    if (!detail) problems.push("[data-en8-sync-detail] carries no text — the state has a value but the learner cannot read it");
    else surfaced++;
  } catch (e) { problems.push(`sign-in: ${e.message}`); }

  /* 3 — doing work shows it saving, and settles. Read from the page's own
   *     record of every state it showed, not from a poll that a fast
   *     emulator can slip between. */
  steps++;
  try {
    const m = await mark(page);
    await answerTask(page, 0);
    await waitSynced(page, { since: m }).catch(() => {});
    const seen = await syncLog(page, m);
    if (!seen.includes("syncing")) {
      problems.push(`the page never showed "syncing" while saving an answer — states seen: ${seen.join(", ") || "none"}`);
    } else if ((await stateOf(page)) !== "synced") {
      problems.push(`the page showed "syncing" but never settled back to "synced" — states seen: ${seen.join(", ")}`);
    } else surfaced++;
  } catch (e) { problems.push(`answer + save: ${e.message}`); }

  /* 4 — offline, the lesson still loads and works, and says it is offline */
  steps++;
  try {
    await ctx.setOffline(true);
    const r = await page.goto(url(LESSON), { waitUntil: "domcontentloaded", timeout: 20_000 });
    /* Playwright quirk, measured 2026-09-25: a document loaded WHILE the
     * context is offline sees navigator.onLine === true — the emulation is
     * not re-applied to the new document. A phone would say false. Toggling
     * the emulation re-applies it and fires a real `offline` event (and no
     * `online` one), so the page is told what a device would tell it rather
     * than being failed for believing the harness. */
    await ctx.setOffline(false);
    await ctx.setOffline(true);
    const widgets = await page.locator(".task[data-task] .t-items input, .task[data-task] .t-items select").count();
    if (!r || !widgets) problems.push("the lesson page does not load offline — no service worker, or it does not cache the lesson and its scripts");
    /* A page cannot know it is offline before its scripts run; ten seconds is
     * the allowance for noticing, not for a spinner a learner would wait on. */
    await page.waitForFunction(
      () => document.querySelector("[data-en8-sync-state]")?.getAttribute("data-en8-sync-state") === "offline",
      null, { timeout: 10_000 }).catch(() => {});
    const s = await stateOf(page);
    if (s !== "offline") problems.push(`offline, the page still reports ${s ?? "absent"} after 10s rather than "offline"`);
    else surfaced++;
    await ctx.setOffline(false);
  } catch (e) {
    problems.push(`offline: the lesson page does not load with no network (${e.message.split("\n")[0]})`);
    await ctx.setOffline(false).catch(() => {});
  }

  /* 5 — a new build reaches a device that already has the old one */
  steps++;
  try {
    const r = await fetch(`${P.site}/__harness/deploy`, { method: "POST" });
    const { deploys } = await r.json();
    let got = null;
    for (let i = 0; i < 3 && got !== deploys; i++) {
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(500);
      got = await page.evaluate(() => window.__EN8_DEPLOY__ ?? null);
    }
    console.log(`  deploy ${deploys}: this device is running ${got == null ? "the original build" : "deploy " + got}`);
    if (got !== deploys) {
      problems.push(`after a new build was published, three ordinary reloads still ran the old app.js — the service worker pins this device to a stale build`);
    }
  } catch (e) { problems.push(`deploy: ${e.message}`); }

  /* 6 — the measurement the requirement is actually about */
  steps++;
  const quiet = silentOps(net);
  silent = quiet.length;
  for (const q of quiet.slice(0, 8)) {
    console.log(`  · silent: ${q.method} ${q.url.slice(0, 110)} (${q.from}) while sync-state=${q.state ?? "absent"}`);
  }

  await browser.close();
} catch (e) {
  problems.push(`harness could not drive the session: ${e.message}`);
  await browser.close().catch(() => {});
}

for (const p of problems) console.log(`  · ${p}`);
metric("session_steps_swept", steps);
metric("silent_network_ops", silent);
metric("sync_states_surfaced", surfaced);
metric("session_problems", problems.length);
/* silent_network_ops === 0 is the headline number of this whole lane, and a
 * page that never signed in reports it too — no sync was ever attempted, so
 * nothing could have been silent. The count is only evidence once the UI has
 * actually been driven through its states, so it is conditioned on that. */
const covered = steps >= 6 && surfaced >= 4;
finish([
  gate("steps swept", steps >= 6, `${steps} of 6`),
  gate("states surfaced", surfaced >= 4, `${surfaced} of 4`),
  gate("nothing happens silently", covered && silent === 0,
       covered ? `${silent} silent op(s)` : "NOT MEASURED — the page never reached a syncing state"),
  gate("session behaviour", covered && problems.length === 0, `${problems.length} problem(s)`),
]);
