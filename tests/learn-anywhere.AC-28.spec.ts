/* AC-28: signing out in one tab signs out every tab of the device, and no
   tab is left showing the task as done. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

test("test_learn_anywhere_AC28_sign_out_clears_every_tab", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  const id = await lesson.answerTask(a.page);
  await a.expectSaved();

  // a second tab, same account, showing the same task as done
  const tab = await a.newTab(lesson.LESSON_WITH_INSTANT_TASK);
  await tab.expectAuth("signed-in");
  await lesson.expectTaskDone(tab.page, id);
  await expect(tab.signOutButton).toBeVisible();
  await a.expectAuth("signed-in");
  await lesson.expectTaskDone(a.page, id);

  // Sign out in the first tab
  await a.signOut();

  // both tabs end signed out, and neither shows the task as done
  await a.expectAuth("signed-out");
  await tab.expectAuth("signed-out");
  await expect(a.signInButton).toBeVisible();
  await expect(tab.signInButton).toBeVisible();
  await expect(a.signOutButton).toBeHidden();
  await expect(tab.signOutButton).toBeHidden();
  await lesson.expectTaskNotDone(a.page, id);
  await lesson.expectTaskNotDone(tab.page, id);
  await expect(a.page.getByText(her.email)).toHaveCount(0);
  await expect(tab.page.getByText(her.email)).toHaveCount(0);
});
