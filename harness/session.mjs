/* "No hidden behind-the-scenes process — surface UI indication of any forms."
 *
 * That is the one requirement here that a reasonable implementation can
 * satisfy invisibly and still fail, so it is measured rather than asserted.
 * Every request the page makes is timestamped against what
 * [data-en8-sync-state] was showing AT THE MOMENT IT LEFT — sampled in the
 * request handler, because a state that flickers back to "synced" before an
 * assertion runs is precisely the hidden process being looked for. A request
 * to a backend while the UI reads idle/synced is a silent operation, and one
 * is a failure.
 *
 * Also gates offline. "Learn everywhere" that needs a network is a weaker
 * promise than the one that was made.
 */
import { metric, gate, finish } from "./lib.mjs";
import { launch, device, url, aLessonPath, signIn, answerFirstTask, waitSynced, silentOps, P } from "./browser.mjs";

const problems = [];
let steps = 0, silent = 0, surfaced = 0;
const LESSON = aLessonPath();
const browser = await launch();

try {
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
    await signIn(page, "learner@example.com");
    const detail = await page.$eval("[data-en8-sync-detail]", el => el.textContent.trim()).catch(() => "");
    if (!detail) problems.push("[data-en8-sync-detail] carries no text — the state has a value but the learner cannot read it");
    else surfaced++;
  } catch (e) { problems.push(`sign-in: ${e.message}`); }

  /* 3 — doing work shows it saving, and settles */
  steps++;
  try {
    const seen = new Set();
    const watch = setInterval(async () => {
      const s = await page.$eval("[data-en8-sync-state]", el => el.getAttribute("data-en8-sync-state")).catch(() => null);
      if (s) seen.add(s);
    }, 40);
    await answerFirstTask(page);
    await waitSynced(page);
    clearInterval(watch);
    if (!seen.has("syncing")) {
      problems.push(`the page never showed "syncing" while saving an answer — states seen: ${[...seen].join(", ") || "none"}`);
    } else surfaced++;
  } catch (e) { problems.push(`answer + save: ${e.message}`); }

  /* 4 — offline, the lesson still works */
  steps++;
  try {
    await ctx.setOffline(true);
    const r = await page.goto(url(LESSON), { waitUntil: "domcontentloaded", timeout: 20_000 });
    const tasks = await page.locator(".task[data-task]").count();
    if (!r || !tasks) problems.push("the lesson page does not load offline — no service worker, or it does not cache the lesson");
    const s = await page.$eval("[data-en8-sync-state]", el => el.getAttribute("data-en8-sync-state")).catch(() => null);
    if (s !== "offline") problems.push(`offline, the page reports ${s ?? "absent"} rather than "offline"`);
    else surfaced++;
    await ctx.setOffline(false);
  } catch (e) { problems.push(`offline: ${e.message}`); }

  /* 5 — the measurement the requirement is actually about */
  steps++;
  const quiet = silentOps(net);
  silent = quiet.length;
  for (const q of quiet.slice(0, 8)) {
    console.log(`  · silent: ${q.method} ${q.url.slice(0, 110)} while sync-state=${q.state ?? "absent"}`);
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
const covered = steps >= 5 && surfaced >= 4;
finish([
  gate("steps swept", steps >= 5, `${steps} of 5`),
  gate("states surfaced", surfaced >= 4, `${surfaced} of 4`),
  gate("nothing happens silently", covered && silent === 0,
       covered ? `${silent} silent op(s)` : "NOT MEASURED — the page never reached a syncing state"),
  gate("session behaviour", covered && problems.length === 0, `${problems.length} problem(s)`),
]);
