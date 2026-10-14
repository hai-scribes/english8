import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-3: with no account ever signed in, a task answered stays done across a
   reload and across a reload with no network, and nothing is ever asked of
   Firestore. */
test("test_learn_anywhere_AC3_signed_out_use_is_whole_and_local", async ({ lab }) => {
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.expectAuth("signed-out");
  await expect(a.signInButton).toBeVisible();

  const id = "01-1-1.1-1";
  await lesson.expectTaskNotDone(a.page, id);
  expect((await lesson.taskView(a.page, id)).scoreLine).toBe("");

  // The answer: one item wrong so the marks and the score line are distinctive.
  await lesson.answerTask(a.page, id, { wrong: [1] });
  await lesson.expectTaskDone(a.page, id);
  const view = await lesson.taskView(a.page, id);
  expect(view.scoreLine).toBe("4 / 5 right — the red ones show the answer");
  expect(view.marks).toEqual([true, false, true, true, true]);

  // Reload online: still done, identically.
  await a.page.reload({ waitUntil: "load" });
  await lesson.expectTaskDone(a.page, id);
  expect(await lesson.taskView(a.page, id)).toEqual(view);

  // Reload with no network at all: still done, identically.
  await a.workerReady();
  await a.offline(true);
  await a.page.reload({ waitUntil: "load" });
  await lesson.expectTaskDone(a.page, id);
  expect(await lesson.taskView(a.page, id)).toEqual(view);
  await a.expectAuth("signed-out");

  // At no point did the device talk to Firestore.
  expect(a.storeRequests).toEqual([]);
});
