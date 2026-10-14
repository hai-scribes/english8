import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-10: losing the network shows the offline sentence within ten seconds;
   when it returns the unsaved work is saved and the status reads "Saved". */
test("test_learn_anywhere_AC10_offline_is_shown", async ({ lab }) => {
  const her = lab.account();
  const TASKS = "en8:tasks:v1";
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.expectSaved();
  await expect(a.status).not.toHaveText(TEXT.offline);

  // The network is lost: within ten seconds the status says so.
  await a.offline(true);
  await a.expectStatus(TEXT.offline, 10_000);

  // Work done offline is unsaved: the status still reads offline, the backend has nothing.
  const id = await lesson.answerTask(a.page);
  await expect(a.status).toHaveText(TEXT.offline);
  expect((await lab.store.value(her, TASKS)) ?? "").not.toContain(id);

  // The network returns: the work is saved and the status reads "Saved".
  await a.offline(false);
  await a.expectSaved();
  await lab.store.expectValue(her, TASKS, v => typeof v === "string" && v.includes(id));
});
