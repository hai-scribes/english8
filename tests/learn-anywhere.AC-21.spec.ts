/* AC-21: signing out while online with a change made moments ago saves the
   change first — the page shows "Saving…", the save completes, and only then
   is the user signed out; a clean device then shows the change. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

test("test_learn_anywhere_AC21_sign_out_saves_first", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await lesson.answerTask(a.page, "01-1-1.1-1");
  await a.expectSaved();

  // the change: a second task answered, its save still in flight
  await a.holdSaves(true);
  const id = await lesson.answerTask(a.page, "01-1-1.2-1");
  const given = (await lesson.taskView(a.page, id)).given;
  await a.expectStatus(TEXT.saving);
  await a.expectAuth("signed-in");

  // Sign out: still saving, still signed in, until the save completes
  await a.signOutButton.click();
  await expect(a.status).toHaveText(TEXT.saving);
  await expect(a.html).toHaveAttribute("data-auth", "signed-in");
  await a.holdSaves(false);
  await a.expectAuth("signed-out");
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(id));

  // a clean device signing in as the same account shows the change
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskNotDone(b.page, id);
  await b.signIn(her);
  await lesson.expectTaskDone(b.page, id);
  expect((await lesson.taskView(b.page, id)).given).toEqual(given);
});
