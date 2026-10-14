import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-44: a kept lesson whose network request is held open unanswered is
   shown from the device within 8 seconds, with its tasks working. */

const LESSON = lesson.LESSON_WITH_INSTANT_TASK; // /unit-01/lesson-1/index.html
const WITHIN_MS = 8_000;

test("test_learn_anywhere_AC44_hanging_connection_falls_back_to_saved_lesson", async ({ lab }) => {
  test.setTimeout(120_000);

  const d = await lab.device();
  await d.open(LESSON);
  await d.workerReady();
  await expect.poll(async () => (await d.keptPaths()).some(p => /^\/unit-01\/lesson-1\/(index\.html)?(\?.*)?$/.test(p)),
    { timeout: 30_000 }).toBe(true);
  await d.open(lesson.HOME);

  // The lesson's request to the network is held open without an answer.
  await lab.site.hang("^/unit-01/lesson-1/");

  const t0 = Date.now();
  await d.page.goto(LESSON, { waitUntil: "commit", timeout: 30_000 });
  await expect(d.page.locator("[data-task]").first()).toBeAttached({ timeout: 30_000 });
  const took = Date.now() - t0;
  expect(took).toBeLessThanOrEqual(WITHIN_MS);
  expect(new URL(d.page.url()).pathname).toBe(LESSON);

  // Its tasks work.
  const id = await lesson.answerTask(d.page);
  await lesson.expectTaskDone(d.page, id);
  expect((await lesson.taskView(d.page, id)).scoreLine).toMatch(/^\d+ \/ \d+ All right$/);

  await lab.site.hang(null);
});
