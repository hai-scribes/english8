/* Edge case on AC-26 + AC-29: X's held work and work done signed-out share
   one key (en8:tasks:v1). Answering "Add it" must keep both; restoring the
   held copy over the key may not drop what she just agreed to add. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

const HELD_TASK = "01-1-1.1-1";
const ANON_TASK = "01-1-1.2-1";

test("test_learn_anywhere_EC2_held_work_does_not_overwrite_signed_out_work_she_adds", async ({ lab }) => {
  test.setTimeout(150_000);
  const x = lab.account("x");
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(x);
  await a.workerReady();

  await a.offline(true);
  await lesson.answerTask(a.page, HELD_TASK);
  await a.signOutButton.click();
  await a.expectAuth("signed-out");
  await a.expectStatus(TEXT.held);

  // nobody is signed in: someone answers another task on the device
  await lesson.answerTask(a.page, ANON_TASK);
  await a.offline(false);

  await a.signIn(x, { signedOutWork: "add" });
  await a.expectSaved();
  await lesson.expectTaskDone(a.page, HELD_TASK);
  await lesson.expectTaskDone(a.page, ANON_TASK);
  await lab.store.expectValue(x, "en8:tasks:v1", v => !!v && v.includes(HELD_TASK) && v.includes(ANON_TASK));
});
