import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-14: signed in, at 390 px wide, CPU throttled four times, five warm-ups
   discarded: over forty real attempts on an instant task, the 95th-percentile
   time from the committing tap to the next painted frame is at most 100 ms.

   The measurement, in the page: a one-shot capture-phase click listener on
   the document takes the tap's own event timeStamp as t0 (so input delay
   counts), and the frame after the handlers is marked by requestAnimationFrame
   followed by a setTimeout(0), which runs once that frame has been rendered. */
test("test_learn_anywhere_AC14_interaction_stays_instant_with_sync_on", async ({ lab }) => {
  test.setTimeout(600_000);
  const her = lab.account();
  const TASK = "01-1-1.2-1";
  const WARM = 5, N = 40;

  const a = await lab.device({ viewport: { width: 390, height: 844 } });
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.expectSaved();
  await a.expectAuth("signed-in");
  expect(a.page.viewportSize()).toEqual({ width: 390, height: 844 });

  // The task marks each item as it is answered: the last pick is the committing tap.
  const info = (await lesson.tasksOn(a.page)).find(t => t.id === TASK);
  expect(info?.kind).toBe("instant");
  const data = ((await lesson.pageData(a.page)).tasks || []).find(t => t.id === TASK);
  expect(data).toBeDefined();
  const items = data!.items;
  const last = items.length - 1;
  const keys = (items[last].opts || []).map(o => (typeof o === "string" ? o : o.k));
  const k = keys.indexOf(items[last].key);
  expect(k).toBeGreaterThanOrEqual(0);
  const root = a.page.locator(`[data-task="${TASK}"]`);
  const committingOption = root.locator(`li.i[data-i="${last}"] .i-opt`).nth(k);
  const earlier = Array.from({ length: last }, (_, j) => j);
  await lesson.expectTaskNotDone(a.page, TASK);

  const cdp = await a.context.newCDPSession(a.page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const samples: number[] = [];
  for (let i = 0; i < WARM + N; i++) {
    if ((await lesson.taskView(a.page, TASK)).done) await lesson.tryAgain(a.page, TASK);
    await lesson.fillTask(a.page, TASK, { only: earlier });
    await a.page.evaluate(() => {
      (window as any).__en8tap = new Promise<number>(resolve => {
        const onTap = (e: Event) => {
          document.removeEventListener("click", onTap, true);
          const t0 = e.timeStamp;
          requestAnimationFrame(() => { setTimeout(() => resolve(performance.now() - t0), 0); });
        };
        document.addEventListener("click", onTap, true);
      });
    });
    await committingOption.click();
    const ms = await a.page.evaluate(() => (window as any).__en8tap as Promise<number>);
    await lesson.expectTaskDone(a.page, TASK);
    if (i >= WARM) samples.push(ms);
  }
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });

  expect(samples).toHaveLength(N);
  const sorted = samples.slice().sort((x, y) => x - y);
  const p95 = sorted[Math.ceil(0.95 * N) - 1];
  expect(p95, `tap-to-paint samples in ms, sorted: ${sorted.map(v => v.toFixed(1)).join(" ")}`).toBeLessThanOrEqual(100);

  // Sync was on throughout: the attempts were saved to the account.
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => typeof v === "string" && v.includes(TASK));
});
