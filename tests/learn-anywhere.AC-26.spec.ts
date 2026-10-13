/* AC-26: learner X's work, held on the device when she signed out offline,
   is still there for her after learner Y has signed in, worked and signed
   out in between — shown as done and saved to X's account. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

const X_TASK = "01-1-1.1-1";
const Y_TASK = "01-1-1.2-1";

test("test_learn_anywhere_AC26_held_work_survives_another_account", async ({ lab }) => {
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
  const xGiven = (await lesson.taskView(a.page, X_TASK)).given;
  await a.signOutButton.click();
  await a.expectAuth("signed-out");
  await a.expectStatus(TEXT.held);
  await lesson.expectTaskNotDone(a.page, X_TASK);
  await a.offline(false);

  // Y signs in, works and signs out
  await a.signIn(y);
  await lesson.expectTaskNotDone(a.page, X_TASK);
  await lesson.answerTask(a.page, Y_TASK);
  await a.expectSaved();
  await a.signOut();
  await lesson.expectTaskNotDone(a.page, Y_TASK);

  // before X returns: nothing of hers is in her account yet
  await lesson.expectTaskNotDone(a.page, X_TASK);
  expect((await lab.store.value(x, "en8:tasks:v1")) ?? "").not.toContain(X_TASK);

  // X signs in again: her held work is shown as done and saved to her account
  await a.signIn(x);
  await lesson.expectTaskDone(a.page, X_TASK);
  expect((await lesson.taskView(a.page, X_TASK)).given).toEqual(xGiven);
  await lesson.expectTaskNotDone(a.page, Y_TASK);
  await a.expectSaved();
  await lab.store.expectValue(x, "en8:tasks:v1", v => !!v && v.includes(X_TASK));
  expect(await lab.store.value(x, "en8:tasks:v1")).not.toContain(Y_TASK);

  // and it reaches X's other device
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskNotDone(b.page, X_TASK);
  await b.signIn(x);
  await lesson.expectTaskDone(b.page, X_TASK);
  expect((await lesson.taskView(b.page, X_TASK)).given).toEqual(xGiven);
});
