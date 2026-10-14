import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-13: a lesson with a saved attempt opens with every backend origin
   unreachable: its tasks render and the attempt is shown as done. */
test("test_learn_anywhere_AC13_render_path_makes_no_backend_reads", async ({ lab }) => {
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  const id = await lesson.answerTask(a.page, undefined, { wrong: [1] });
  await a.expectSaved();
  const before = await lesson.taskView(a.page, id);
  expect(before.done).toBe(true);
  expect(before.scoreLine).toBe("4 / 5 right — the red ones show the answer");
  const tasks = await lesson.tasksOn(a.page);
  expect(tasks).toHaveLength(3);

  // Every backend origin is unreachable; the lesson is opened again.
  await a.backendUnreachable(true);
  const m = a.mark();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);

  // The tasks render ...
  await expect(a.page.locator("[data-task]")).toHaveCount(tasks.length);
  for (const t of tasks) await expect(a.page.locator(`[data-task="${t.id}"]`)).toBeAttached();
  expect((await lesson.tasksOn(a.page)).map(t => t.id)).toEqual(tasks.map(t => t.id));
  // ... and the saved attempt is shown as done, as it was.
  await lesson.expectTaskDone(a.page, id);
  expect(await lesson.taskView(a.page, id)).toEqual(before);

  // The backend really was unreachable: nothing that left got an answer.
  expect(a.requestsSince(m).filter(r => r.code !== 0)).toEqual([]);
});
