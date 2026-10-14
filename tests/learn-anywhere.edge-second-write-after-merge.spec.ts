import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* Edge case (AC-36 / AC-4): work from her other device is merged into this
   device's storage while the page is held still. The lesson code keeps its
   task record in memory and never re-reads it, so the merged work is in
   storage but not in memory. The first write after the merge is reconciled
   (and keeps it); sync.js then records the merged value as what the page
   "knows", so the SECOND write — a plain whole-record write from memory —
   is taken as the page's own and silently erases the other device's work,
   here and on the account. */

const OTHER_TASK = "01-1-1.1-1"; // answered on device B
const FIRST_TASK = "01-1-1.2-1"; // answered on device A after B's work arrived
const SECOND_TASK = "01-1-1.3-1"; // answered on device A, still on the undrawn page

test("test_learn_anywhere_EDGE_second_answer_on_an_undrawn_page_keeps_work_merged_in", async ({ lab }) => {
  test.setTimeout(180_000);
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
  await lesson.fillTask(a.page, FIRST_TASK, { only: [0] });
  const drawn = a.draws();
  await a.returnToTab();
  await a.expectStatus(TEXT.laterDraw);
  await expect.poll(() => a.stored("en8:tasks:v1"), { timeout: 15_000 }).toContain(OTHER_TASK);
  expect(a.drawsSince(drawn)).toBe(0);

  // Her first commit on the undrawn page keeps B's work …
  const info = (await lesson.tasksOn(a.page)).find(t => t.id === FIRST_TASK)!;
  await lesson.fillTask(a.page, FIRST_TASK, { only: Array.from({ length: info.items - 1 }, (_, i) => i + 1) });
  await lesson.expectTaskDone(a.page, FIRST_TASK);
  await a.expectSaved();
  expect(await a.stored("en8:tasks:v1")).toContain(OTHER_TASK);

  // … and so must her second, on the same page, with no redraw in between.
  await lesson.answerTask(a.page, SECOND_TASK);
  await lesson.expectTaskDone(a.page, SECOND_TASK);
  await a.expectSaved();
  expect(a.drawsSince(drawn)).toBe(0);

  const onDevice = (await a.stored("en8:tasks:v1")) || "";
  expect(onDevice).toContain(SECOND_TASK);
  expect(onDevice).toContain(OTHER_TASK);
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(SECOND_TASK) && v.includes(OTHER_TASK));
});
