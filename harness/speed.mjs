/* "Make sure everything is instant."
 *
 * Instant is a number or it is an opinion. Three of them:
 *
 *   p95_interaction_ms      pressing Check on an answered task → the next
 *                           painted frame. Every sample is a REAL attempt: the
 *                           task is reset with "Try it again" and filled
 *                           first (untimed), so the timed click runs the
 *                           marking, the local save and whatever the sync
 *                           layer hangs off it — and a sample only counts if
 *                           the page then says the attempt was committed. A
 *                           click on a disabled button measures two animation
 *                           frames and nothing else, which is what an earlier
 *                           version of this probe did. Forty samples, so the
 *                           95th percentile is not simply the maximum.
 *   render_path_cloud_reads whether the page needs the backend to become
 *                           usable. The target is ZERO and that is an
 *                           architectural claim, not a tuning one — a
 *                           local-first app reads its own storage to paint and
 *                           reconciles afterwards. Probed signed in, with
 *                           saved work, and every backend origin blocked: the
 *                           task widgets (which app.js renders — the static
 *                           HTML carries none) must appear, AND the attempt
 *                           made earlier must be shown as done.
 *   long_tasks_ms           main-thread blocking. A page can hit both numbers
 *                           above and still feel like glue if it janks.
 *
 * Measured on a throttled CPU at phone width, because the learner's device is
 * not this laptop. Un-throttled numbers here would certify nothing. And
 * measured with the machine otherwise quiet: run this milestone's variants one
 * at a time (`run.max_parallel: 1`), or a rival variant's emulator and browser
 * become part of the number.
 */
import { metric, gate, finish } from "./lib.mjs";
import {
  launch, device, url, aLessonPath, signIn, answerTask, waitSynced, mark, P, portsError,
} from "./browser.mjs";

const LEARNER = "speed-learner@example.com";
const SAMPLES = 40;
const problems = [];
let probes = 0;
const LESSON = aLessonPath();
const browser = await launch();
const pct = (xs, p) => xs.length ? xs.slice().sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(xs.length * p))] : NaN;

let p95 = NaN, cloudReads = 0, blocking = 0;

let step = "starting";
try {
  if (portsError) throw portsError;
  const { ctx, page } = await device(browser);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.addInitScript(() => {
    window.__long = 0;
    try {
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__long += e.duration; })
        .observe({ type: "longtask", buffered: true });
    } catch {}
  });
  await page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  let m = await mark(page);
  step = "signing in";
  await signIn(page, LEARNER);
  await waitSynced(page, { since: m });
  m = await mark(page);
  step = "saving a first attempt";
  const saved = await answerTask(page, 0);
  await waitSynced(page, { since: m });

  /* --- is the cloud in front of the learner? --------------------------- */
  step = "the cold load";
  probes++;
  const blockBackend = r => r.abort();
  const isBackend = u => !u.href.startsWith(P.site);
  await ctx.route(isBackend, blockBackend);
  try {
    const cold = await ctx.newPage();
    const t0 = Date.now();
    await cold.goto(url(LESSON), { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => {});
    const painted = await cold.waitForFunction(id => {
      const t = document.querySelector(`.task[data-task="${id}"]`);
      return !!t && !!t.querySelector(".t-items input, .t-items select") && t.dataset.done === "1";
    }, saved, { timeout: 8_000 }).then(() => true, () => false);
    const coldMs = Date.now() - t0;
    if (!painted) {
      cloudReads++;
      problems.push(`signed in, with every backend origin blocked, the lesson did not render its saved attempt within 8s (${coldMs}ms) — the cloud is in the render path`);
    }
    console.log(`  cold load, backend unreachable: ${coldMs}ms, saved attempt ${painted ? "shown" : "NOT shown"}`);
    await cold.close();
  } finally {
    await ctx.unroute(isBackend, blockBackend);
  }

  /* --- press Check → next painted frame, on real attempts -------------- */
  step = "sampling interactions";
  probes++;
  const samples = [];
  const nTasks = await page.locator(".task[data-task]").count();
  for (let i = 0; i < SAMPLES; i++) {
    const idx = i % Math.max(1, nTasks);
    const ready = await page.evaluate(i => {
      const task = document.querySelectorAll(".task[data-task]")[i];
      if (!task) return false;
      const again = task.querySelector(".t-again");
      if (task.dataset.done === "1") { if (!again || again.hidden) return false; again.click(); }
      for (const b of task.querySelectorAll(".i-conf button")) if (!b.disabled) b.click();
      const seen = new Set();
      for (const el of task.querySelectorAll(".t-items input, .t-items select")) {
        if (el.type === "radio") { if (seen.has(el.name)) continue; seen.add(el.name); el.checked = true; }
        else if (el.tagName === "SELECT") el.selectedIndex = Math.min(1, el.options.length - 1);
        else el.value = "hang out";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const check = task.querySelector(".t-check");
      return !!check && !check.disabled;
    }, idx);
    if (!ready) continue;
    await page.waitForTimeout(80);             // let the reset settle; not part of the sample
    const ms = await page.evaluate(async i => {
      const task = document.querySelectorAll(".task[data-task]")[i];
      const t = performance.now();
      task.querySelector(".t-check").click();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const took = performance.now() - t;
      return task.dataset.done === "1" ? took : -1;   // it must actually have committed
    }, idx);
    if (ms >= 0) samples.push(ms);
    await page.waitForTimeout(60);
  }
  console.log(`  ${samples.length} of ${SAMPLES} samples were committed attempts`);
  if (samples.length < SAMPLES - 4) {
    problems.push(`only ${samples.length} of ${SAMPLES} clicks produced a committed attempt — could not measure latency`);
  } else {
    p95 = pct(samples, 0.95);
  }

  /* --- jank ------------------------------------------------------------ */
  probes++;
  blocking = await page.evaluate(() => window.__long || 0);

  await browser.close();
} catch (e) {
  problems.push(`speed harness: while ${step}: ${e.message.split("\n")[0]}`);
  await browser.close().catch(() => {});
}

for (const p of problems) console.log(`  · ${p}`);
metric("speed_probes_swept", probes);
/* No placeholder: when latency could not be measured there is no number, and
 * the run records NOT MEASURED rather than a sentinel a ranker might read. */
if (Number.isFinite(p95)) metric("p95_interaction_ms", p95);
metric("render_path_cloud_reads", cloudReads);
metric("long_tasks_ms", blocking);
/* Zero cloud reads and zero long tasks are also what a harness reports when it
 * never loaded the page. Neither number means anything until the probes ran. */
const covered = probes >= 3;
finish([
  gate("probes swept", covered, `${probes} of 3`),
  gate("nothing cloud-bound in the render path", covered && cloudReads === 0,
       covered ? `${cloudReads}` : "NOT MEASURED"),
  gate("p95 interaction under 100ms", covered && Number.isFinite(p95) && p95 <= 100,
       covered && Number.isFinite(p95) ? `${p95.toFixed(1)}ms at 4x CPU throttle` : "NOT MEASURED"),
  gate("main thread not blocked", covered && blocking <= 500,
       covered ? `${blocking.toFixed(0)}ms of long tasks` : "NOT MEASURED"),
]);
