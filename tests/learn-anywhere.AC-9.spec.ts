import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-9: answering a task shows "Saving…" until the save lands, then "Saved". */
test("test_learn_anywhere_AC9_saving_and_saved_are_shown", async ({ lab }) => {
  const her = lab.account();
  const TASKS = "en8:tasks:v1";
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.expectSaved();

  // Hold every write open so "until the save lands" is observable.
  await a.holdSaves(true);
  await expect(a.status).not.toHaveText(TEXT.saving);

  const id = await lesson.answerTask(a.page);
  await a.expectStatus(TEXT.saving);
  // The save has not landed: the status stays "Saving…" and the backend has nothing yet.
  await a.page.waitForTimeout(1500);
  await expect(a.status).toHaveText(TEXT.saving);
  expect((await lab.store.value(her, TASKS)) ?? "").not.toContain(id);

  // Release the write: it lands and the status reads "Saved".
  await a.holdSaves(false);
  await a.expectSaved();
  await lab.store.expectValue(her, TASKS, v => typeof v === "string" && v.includes(id));
});
