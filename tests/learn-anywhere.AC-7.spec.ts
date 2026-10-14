import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-7: work done offline on A and concurrently online on B both survive:
   a third, clean device shows both tasks and every earlier answer as done. */
test("test_learn_anywhere_AC7_offline_and_concurrent_work_merge", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();
  const TASKS = "en8:tasks:v1";
  const EARLIER = "01-1-1.1-1";
  const ON_A_OFFLINE = "01-1-1.2-1";
  const ON_B = "01-1-1.3-1";

  // An earlier answer, saved from A while online.
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await lesson.answerTask(a.page, EARLIER);
  await a.expectSaved();
  await lab.store.expectValue(her, TASKS, v => typeof v === "string" && v.includes(EARLIER));

  // B is signed in and online, and has received the earlier answer.
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);
  await expect(b.page.locator(`[data-task="${EARLIER}"]`)).toHaveAttribute("data-done", "1", { timeout: 30_000 });
  await lesson.expectTaskNotDone(b.page, ON_B);

  // A loses its network and answers one task there.
  await a.offline(true);
  await a.expectStatus(TEXT.offline, 10_000);
  await lesson.answerTask(a.page, ON_A_OFFLINE);
  await expect(a.status).toHaveText(TEXT.offline);

  // B answers a different task, and that save lands while A is still offline.
  await lesson.answerTask(b.page, ON_B);
  await lab.store.expectValue(her, TASKS, v => typeof v === "string" && v.includes(ON_B));
  expect((await lab.store.value(her, TASKS)) ?? "").not.toContain(ON_A_OFFLINE);

  // A regains its network and its save lands.
  await a.offline(false);
  await a.expectSaved();

  // A third, clean device: nothing before sign-in, all three after.
  const c = await lab.device();
  await c.open(lesson.LESSON_WITH_INSTANT_TASK);
  for (const id of [EARLIER, ON_A_OFFLINE, ON_B]) await lesson.expectTaskNotDone(c.page, id);
  await c.signIn(her);
  for (const id of [EARLIER, ON_A_OFFLINE, ON_B]) {
    await expect(c.page.locator(`[data-task="${id}"]`)).toHaveAttribute("data-done", "1", { timeout: 30_000 });
  }
});
