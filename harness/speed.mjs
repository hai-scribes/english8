/* "Make sure everything is instant."
 *
 * Instant is a number or it is an opinion. Three of them:
 *
 *   p95_interaction_ms      click → the page visibly answers. Measured at the
 *                           95th percentile, not the mean: the mean hides
 *                           exactly the occasional stall a learner notices.
 *   render_path_cloud_reads how many backend requests the page waits on before
 *                           it is usable. The target is ZERO and that is an
 *                           architectural claim, not a tuning one — a
 *                           local-first app reads its own storage to paint and
 *                           reconciles afterwards, so no round trip can ever be
 *                           in front of the learner.
 *   long_tasks_ms           main-thread blocking. A page can hit both numbers
 *                           above and still feel like glue if it janks.
 *
 * Measured on a throttled CPU at phone width, because the learner's device is
 * not this laptop. Un-throttled numbers here would certify nothing.
 */
import { metric, gate, finish } from "./lib.mjs";
import { launch, device, url, aLessonPath, signIn, waitSynced, P , portsError } from "./browser.mjs";

const problems = [];
let probes = 0;
const LESSON = aLessonPath();
const browser = await launch();
const pct = (xs, p) => xs.length ? xs.slice().sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(xs.length * p))] : NaN;

let p95 = NaN, cloudReads = 0, blocking = 0;

try {
  if (portsError) throw portsError;
  const { ctx, page, net } = await device(browser);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  /* --- is the cloud in front of the learner? --------------------------- */
  await page.addInitScript(() => {
    window.__long = 0;
    try {
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__long += e.duration; })
        .observe({ type: "longtask", buffered: true });
    } catch {}
  });
  await page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  await signIn(page, "learner@example.com");
  await waitSynced(page);

  probes++;
  /* A second, cold load with every backend origin unreachable. If the page
   * still paints its lesson and answers a click, nothing in the render path
   * was waiting on the network. */
  const cold = await device(browser);
  await cold.ctx.route(u => !u.href.startsWith(P.site), r => r.abort());
  const t0 = Date.now();
  await cold.page.goto(url(LESSON), { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => {});
  const usable = await cold.page.locator(".task[data-task]").count().catch(() => 0);
  const coldMs = Date.now() - t0;
  if (!usable) {
    cloudReads++;
    problems.push(`with every backend origin blocked the lesson did not render (${coldMs}ms) — the cloud is in the render path`);
  }
  console.log(`  cold load, backend unreachable: ${coldMs}ms, ${usable} task(s) rendered`);

  /* --- click → visible answer ------------------------------------------ */
  probes++;
  const samples = [];
  for (let i = 0; i < 12; i++) {
    const ms = await page.evaluate(async () => {
      const task = document.querySelector(".task[data-task]");
      if (!task) return -1;
      const btn = task.querySelector(".t-check, .t-again");
      if (!btn) return -1;
      const t = performance.now();
      btn.click();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      return performance.now() - t;
    });
    if (ms >= 0) samples.push(ms);
    await page.waitForTimeout(60);
  }
  if (samples.length < 8) problems.push(`only ${samples.length} interaction samples — could not measure latency`);
  p95 = pct(samples, 0.95);

  /* --- jank ------------------------------------------------------------ */
  probes++;
  blocking = await page.evaluate(() => window.__long || 0);

  await browser.close();
} catch (e) {
  problems.push(`speed harness: ${e.message}`);
  await browser.close().catch(() => {});
}

for (const p of problems) console.log(`  · ${p}`);
metric("speed_probes_swept", probes);
metric("p95_interaction_ms", Number.isFinite(p95) ? p95 : 99999);
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
