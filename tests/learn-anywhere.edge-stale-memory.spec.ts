import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* Edge case (AC-36 / AC-4): work from her other device is merged into this
   device's storage while the page is deliberately not drawn again. The lesson
   code holds its task record in memory and writes it back whole, so her next
   answer on this page must not throw that merged work away — here or on the
   account. */

const OTHER_TASK = "01-1-1.1-1"; // answered on device B
const HER_TASK = "01-1-1.2-1";   // answered on device A after B's work arrived

test("test_learn_anywhere_EDGE_work_merged_under_a_live_page_survives_her_next_answer", async ({ lab }) => {
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

  // Her hands are on the page, so B's work is merged but the page is not drawn again.
  await lesson.fillTask(a.page, HER_TASK, { only: [0] });
  const drawn = a.draws();
  await a.returnToTab();
  await a.expectStatus(TEXT.laterDraw);
  await expect.poll(() => a.stored("en8:tasks:v1"), { timeout: 15_000 }).toContain(OTHER_TASK);
  expect(a.drawsSince(drawn)).toBe(0);

  // She carries on and commits her own task on the same, undrawn page.
  const info = (await lesson.tasksOn(a.page)).find(t => t.id === HER_TASK)!;
  await lesson.fillTask(a.page, HER_TASK, { only: Array.from({ length: info.items - 1 }, (_, i) => i + 1) });
  await lesson.expectTaskDone(a.page, HER_TASK);
  await a.expectSaved();

  // Both attempts are on the account and on this device.
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(HER_TASK));
  await expect.poll(() => a.stored("en8:tasks:v1"), { timeout: 15_000 }).toContain(HER_TASK);
  expect(await a.stored("en8:tasks:v1")).toContain(OTHER_TASK);
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(OTHER_TASK));
});
