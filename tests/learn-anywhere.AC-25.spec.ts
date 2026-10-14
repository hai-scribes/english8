/* AC-25: work held on the device for learner X (signed out offline with an
   unsaved task) is never shown to learner Y, who signs in next, and none of
   it reaches Y's account. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

const X_TASK = "01-1-1.1-1";
const Y_TASK = "01-1-1.2-1";

test("test_learn_anywhere_AC25_held_work_is_not_shown_to_another_account", async ({ lab }) => {
  test.setTimeout(150_000);
  const x = lab.account("x");
  const y = lab.account("y");
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(x);
  await a.workerReady();

  // X: an unsaved task, then a sign-out with no network — the work is held
  await a.offline(true);
  await lesson.answerTask(a.page, X_TASK);
  await lesson.expectTaskDone(a.page, X_TASK);
  await a.signOutButton.click();
  await a.expectAuth("signed-out");
  await a.expectStatus(TEXT.held);
  await lesson.expectTaskNotDone(a.page, X_TASK);
  await a.offline(false);

  // Y signs in on that device and uses it
  await a.signIn(y);
  await lesson.expectTaskNotDone(a.page, X_TASK);
  await expect(a.page.getByText(TEXT.question)).toHaveCount(0);
  await lesson.answerTask(a.page, Y_TASK);
  await a.expectSaved();
  await lab.store.expectValue(y, "en8:tasks:v1", v => !!v && v.includes(Y_TASK));
  await lesson.expectTaskNotDone(a.page, X_TASK);
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskNotDone(a.page, X_TASK);
  await lesson.expectTaskDone(a.page, Y_TASK);

  // none of X's work reached Y's account
  const yDocs = await lab.store.docs(y);
  expect(yDocs.length).toBeGreaterThan(0);
  expect(JSON.stringify(yDocs)).not.toContain(X_TASK);
  expect(await lab.store.value(y, "en8:tasks:v1")).not.toContain(X_TASK);

  // and Y's other device shows nothing of X either
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(y);
  await lesson.expectTaskDone(b.page, Y_TASK);
  await lesson.expectTaskNotDone(b.page, X_TASK);
});
