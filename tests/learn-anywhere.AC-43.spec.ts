import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-43: with navigator.connection.saveData true, only the pages she opens
   are kept: the opened lesson loads offline, a lesson never opened does not. */

const OPENED = lesson.LESSON_WITH_INSTANT_TASK;          // /unit-01/lesson-1/index.html
const NEVER_OPENED = lesson.pagePaths.LESSON_WITH_TAP_TASK; // /unit-01/lesson-6/index.html

test("test_learn_anywhere_AC43_save_data_keeps_only_opened_pages", async ({ lab }) => {
  test.setTimeout(150_000);

  const d = await lab.device({ saveData: true });
  await d.open(OPENED);
  await d.workerReady();
  await d.page.waitForTimeout(5_000); // time in which a course download would have started

  const kept = await d.keptPaths();
  expect(kept.some(p => /^\/unit-01\/lesson-1\/(index\.html)?(\?.*)?$/.test(p))).toBe(true);
  expect(kept.some(p => p.startsWith("/unit-01/lesson-6/"))).toBe(false);
  // Nothing of the never-opened lesson was even asked for.
  expect((await lab.site.asked()).some(p => p.startsWith("/unit-01/lesson-6/"))).toBe(false);

  await d.offline(true);

  // The opened lesson loads offline and works.
  await d.open(OPENED);
  expect(new URL(d.page.url()).pathname).toBe(OPENED);
  const id = await lesson.answerTask(d.page);
  await lesson.expectTaskDone(d.page, id);

  // The lesson never opened does not load.
  const loaded = await d.open(NEVER_OPENED).then(() => true, () => false);
  if (loaded) {
    await expect(d.page.locator("[data-task]")).toHaveCount(0);
    await expect(d.page.locator('[data-task="01-6-6.5-1"]')).toHaveCount(0);
  }
  expect(kept.some(p => p.startsWith("/unit-01/lesson-6/"))).toBe(false);
});
