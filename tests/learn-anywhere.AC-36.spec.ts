import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-36: work from her other device arrives while her hands are on the page
   (one answer picked and not committed, a pointer event moments ago). The
   page is left alone and the status says the work will show on the next page. */

const OTHER_TASK = "01-1-1.1-1"; // answered on device B
const HER_TASK = "01-1-1.2-1";   // half-answered on device A, not committed

test("test_learn_anywhere_AC36_incoming_work_does_not_redraw_under_her_hands", async ({ lab }) => {
  test.setTimeout(150_000);
  const her = lab.account();

  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);

  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);
  await lesson.answerTask(b.page, OTHER_TASK);
  await b.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(OTHER_TASK));

  // Her hands are on the page: one item picked and not committed, a pointer event just now.
  await lesson.fillTask(a.page, HER_TASK, { only: [0] });
  await lesson.expectTaskNotDone(a.page, HER_TASK);
  const pick = (await lesson.taskView(a.page, HER_TASK)).given[0];
  expect(pick).not.toBe("");

  // Before: B's work is not on A, and the status does not yet say it is waiting.
  await lesson.expectTaskNotDone(a.page, OTHER_TASK);
  await expect(a.status).not.toHaveText(TEXT.laterDraw);
  const drawn = a.draws();

  // A looks for work from her other devices.
  await a.returnToTab();

  await a.expectStatus(TEXT.laterDraw);
  // ... it is saved to this device ...
  await expect.poll(() => a.stored("en8:tasks:v1"), { timeout: 15_000 }).toContain(OTHER_TASK);
  // ... and the page is not drawn again.
  await a.page.waitForTimeout(2_000);
  expect(a.drawsSince(drawn)).toBe(0);
  await lesson.expectTaskNotDone(a.page, OTHER_TASK);
  expect((await lesson.taskView(a.page, HER_TASK)).given[0]).toBe(pick);
  await expect(a.status).toHaveText(TEXT.laterDraw);
});
