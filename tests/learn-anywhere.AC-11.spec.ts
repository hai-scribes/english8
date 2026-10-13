import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-11: a save the backend fails is announced, and the work stays on the device. */
test("test_learn_anywhere_AC11_failed_save_is_shown", async ({ lab }) => {
  const her = lab.account();
  const TASKS = "en8:tasks:v1";
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.expectSaved();
  await expect(a.status).not.toHaveText(TEXT.failed);

  // The backend fails every write from here on.
  await a.failSaves(true);
  const id = await lesson.answerTask(a.page);
  await a.expectStatus(TEXT.failed);

  // The work is on the device and not in the backend.
  await lesson.expectTaskDone(a.page, id);
  expect((await a.stored(TASKS)) ?? "").toContain(id);
  expect((await lab.store.value(her, TASKS)) ?? "").not.toContain(id);

  // It stays on the device: a reload still shows the task done.
  await a.page.reload({ waitUntil: "load" });
  await lesson.expectTaskDone(a.page, id);
  expect((await a.stored(TASKS)) ?? "").toContain(id);
});
