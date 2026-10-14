import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-4: a task answered twice on device A, saved, appears on a clean device B
   on sign-in alone: same answers, same marks, same score line, both attempts
   in the history in the order they were made. */
test("test_learn_anywhere_AC4_work_follows_account_to_second_device", async ({ lab }) => {
  test.setTimeout(180_000);
  const her = lab.account();
  const id = "01-1-1.1-1";

  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  // Two attempts: 3/5 then 4/5, so marks, score line and history are all distinctive.
  await lesson.answerTask(a.page, id, { wrong: [0, 2] });
  await lesson.tryAgain(a.page, id);
  await lesson.answerTask(a.page, id, { wrong: [1] });
  await a.expectSaved();
  const viewA = await lesson.taskView(a.page, id);
  expect(viewA.done).toBe(true);
  expect(viewA.marks).toEqual([true, false, true, true, true]);
  expect(viewA.scoreLine).toBe("4 / 5 right — the red ones show the answer");
  expect(viewA.history).toEqual(["3/5", "4/5"]);
  expect(viewA.given.every(g => g !== "")).toBe(true);
  await lab.store.expectValue(her, "en8:tasks:v1", v => typeof v === "string" && v.includes(id));

  // Device B holds nothing: the task is not done and has no history.
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskNotDone(b.page, id);
  const viewBBefore = await lesson.taskView(b.page, id);
  expect(viewBBefore.done).toBe(false);
  expect(viewBBefore.history).toEqual([]);
  expect(viewBBefore.scoreLine).toBe("");

  // The only action on B is the sign-in.
  await b.signIn(her);
  await expect(b.page.locator(`[data-task="${id}"]`)).toHaveAttribute("data-done", "1", { timeout: 30_000 });
  await expect.poll(async () => {
    try { return await lesson.taskView(b.page, id); } catch { return null; }
  }, { timeout: 30_000 }).toEqual(viewA);
});
