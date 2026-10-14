/* AC-30: "Try it again" on a saved task stays a fresh attempt after the save:
   the stored record has no answers and keeps the first attempt's history,
   and the account's other devices show the task as not done. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

const TASK = "01-1-1.1-1";

test("test_learn_anywhere_AC30_retake_is_not_undone_by_sync", async ({ lab }) => {
  test.setTimeout(150_000);
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await lesson.answerTask(a.page, TASK);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(TASK));

  // the other device holds the answered task
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);
  await lesson.expectTaskDone(b.page, TASK);

  // Try it again, and let the save complete
  const mark = a.mark();
  await lesson.tryAgain(a.page, TASK);
  await lesson.expectTaskNotDone(a.page, TASK);
  await expect.poll(() => a.writesSince(mark).some(r => r.code >= 200 && r.code < 300), { timeout: 20_000 }).toBe(true);
  await a.expectSaved();

  // the stored record: no answers, the first attempt's history kept
  await lab.store.expectValue(her, "en8:tasks:v1", v => {
    if (!v) return false;
    const rec = JSON.parse(v)[TASK];
    return !!rec && rec.given === undefined && rec.score === undefined
      && Array.isArray(rec.log) && rec.log.length === 1;
  });
  const rec = JSON.parse((await lab.store.value(her, "en8:tasks:v1")) || "{}")[TASK];
  expect(rec.given).toBeUndefined();
  expect(rec.score).toBeUndefined();
  expect(rec.log).toHaveLength(1);

  // this device still shows the fresh attempt after the sync that followed the save
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(async () => { await lesson.expectTaskNotDone(a.page, TASK); }).toPass({ timeout: 30_000 });
  expect((await lesson.taskView(a.page, TASK)).given.every(g => g === "")).toBe(true);

  // the other device shows the task as not done
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(async () => { await lesson.expectTaskNotDone(b.page, TASK); }).toPass({ timeout: 30_000 });
  expect((await lesson.taskView(b.page, TASK)).given.every(g => g === "")).toBe(true);
});
