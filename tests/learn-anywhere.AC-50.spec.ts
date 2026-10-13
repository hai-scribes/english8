import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-50: the sign-in popup is closed before it completes: the auth state
   returns to signed-out, a visible message says so beside the button, the
   button is enabled again and local work is unchanged. */

test("test_learn_anywhere_AC50_sign_in_failure_shows_message", async ({ lab }) => {
  test.setTimeout(120_000);

  const d = await lab.device();
  await d.open(lesson.LESSON_WITH_INSTANT_TASK);
  const id = await lesson.answerTask(d.page);
  const viewBefore = await lesson.taskView(d.page, id);
  const storedBefore = await d.stored("en8:tasks:v1");
  expect(storedBefore).toContain(id);

  const message = d.page.getByText(TEXT.signInFailed);
  await expect(message).toHaveCount(0);
  await d.expectAuth("signed-out");

  const popup = await d.startSignIn();
  await d.expectAuth("signing-in");
  await popup.close();

  await d.expectAuth("signed-out");
  await expect(message).toBeVisible();
  await expect(message).toHaveText(TEXT.signInFailed);
  await expect(d.signInButton).toBeVisible();
  await expect(d.signInButton).toBeEnabled();
  await expect(d.signOutButton).toBeHidden();

  // Local work is unchanged.
  await lesson.expectTaskDone(d.page, id);
  expect(await lesson.taskView(d.page, id)).toEqual(viewBefore);
  expect(await d.stored("en8:tasks:v1")).toBe(storedBefore);
});
