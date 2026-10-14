/* Edge case (AC-21/AC-29): while the page is asking about signed-out work the
   header already shows the account and a "Sign out" button. Pressing it must
   sign the account out; today it returns silently because the device has no
   owner yet, leaving a visible control that does nothing — and, on a shared
   device, no way out of the account without first answering for work that is
   not hers. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

test("test_learn_anywhere_EDGE_sign_out_works_while_question_about_signed_out_work_is_open", async ({ lab }) => {
  test.setTimeout(90_000);
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.answerTask(a.page, "01-1-1.1-1");      // done while nobody was signed in

  await a.signIn(her);                                 // the question is left on the page
  await expect(a.page.getByText(TEXT.question)).toBeVisible();
  await expect(a.signOutButton).toBeVisible();

  await a.signOutButton.click();
  await a.expectAuth("signed-out");
  await expect(a.signInButton).toBeVisible();
  await expect.poll(() => a.credential(), { timeout: 10_000 }).toBeNull();
});
