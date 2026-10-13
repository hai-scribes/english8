/* AC-27: when another account is signed in behind the page while X's unsaved
   work is on the device and the storage has no room to hold it, the newcomer
   is signed out, the status says the device is holding work for another
   account, and X's work is untouched. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

const X_TASK = "01-1-1.1-1";

test("test_learn_anywhere_AC27_unsaved_work_is_not_destroyed_by_an_account_switch", async ({ lab }) => {
  test.setTimeout(120_000);
  const x = lab.account("x");
  const y = lab.account("y");
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(x);
  await a.expectAuth("signed-in");

  // X's work, unsaved: every write to the store is held open
  await a.holdSaves(true);
  await lesson.answerTask(a.page, X_TASK);
  await a.expectStatus(TEXT.saving);
  const xRecord = await a.stored("en8:tasks:v1");
  expect(xRecord).toContain(X_TASK);

  // no room on the device to hold X's work, and another account arrives behind the page
  await a.storageFull(true);
  await expect(a.status).not.toHaveText(TEXT.otherAccount);
  await a.signInBehindThePage(y);
  await a.returnToTab();

  // the newcomer is signed out, the page says why, and X's work is untouched
  await a.expectAuth("signed-out");
  await a.expectStatus(TEXT.otherAccount);
  await expect(a.page.getByText(y.email)).toHaveCount(0);
  expect(await a.stored("en8:tasks:v1")).toBe(xRecord);
  await lesson.expectTaskDone(a.page, X_TASK);
  expect((await lab.store.value(y, "en8:tasks:v1")) ?? "").not.toContain(X_TASK);
  await a.holdSaves(false);
});
