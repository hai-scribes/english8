import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-37: work from her other device is waiting; once nothing holds the page
   still any longer (the clock past thirty seconds since her last touch), the
   next check draws the page again with that work, keeps her own committed
   answers, and never draws more than three times in twenty seconds. */

const OTHER_TASK = "01-1-1.1-1"; // answered on device B
const OWN_TASK = "01-1-1.2-1";   // answered on device A (4 items)

test("test_learn_anywhere_AC37_incoming_work_is_drawn_once_she_pauses", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();

  const a = await lab.device({ at: new Date() });
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await lesson.answerTask(a.page, OWN_TASK);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(OWN_TASK));

  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);
  await lesson.expectTaskDone(b.page, OWN_TASK);
  await lesson.answerTask(b.page, OTHER_TASK);
  await b.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(OTHER_TASK) && v.includes(OWN_TASK));

  // A touched the page moments ago, so B's work arrives and waits.
  await a.returnToTab();
  await a.expectStatus(TEXT.laterDraw);
  await lesson.expectTaskNotDone(a.page, OTHER_TASK);

  // Thirty seconds pass on A's clock with no touch; the next check draws the page again.
  await a.advance(31_000);
  const n0 = a.draws();
  await a.returnToTab();
  await lesson.expectTaskDone(a.page, OTHER_TASK);
  expect(a.drawsSince(n0)).toBeGreaterThanOrEqual(1);
  const other = await lesson.taskView(a.page, OTHER_TASK);
  expect(other.scoreLine).toBe("5 / 5 All right");
  // Her own committed answers are still shown.
  await lesson.expectTaskDone(a.page, OWN_TASK);
  const own = await lesson.taskView(a.page, OWN_TASK);
  expect(own.scoreLine).toBe("4 / 4 All right");
  expect(own.given.every(g => g !== "")).toBe(true);

  // Four more changes arrive within twenty seconds: the page is drawn again at most three times in all.
  for (let i = 1; i <= 4; i++) {
    const value = JSON.stringify({ "01-3-j1-1": `note ${i}` });
    await b.setStored("en8:jot:v1", value);
    await lab.store.expectValue(her, "en8:jot:v1", v => v === value);
    await a.page.waitForLoadState("load");
    await a.returnToTab().catch(() => {});
    await a.page.waitForTimeout(500);
  }
  await a.page.waitForLoadState("load");
  expect(a.drawsSince(n0)).toBeLessThanOrEqual(3);
  await lesson.expectTaskDone(a.page, OWN_TASK);
});
