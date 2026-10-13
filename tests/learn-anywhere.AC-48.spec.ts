import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-48: a signed-in learner opens a kept page with no network: the header
   shows her account and the offline status, and no "Sign in with Google"
   button that does nothing is offered. */

test("test_learn_anywhere_AC48_offline_page_shows_account_and_offline_state", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();

  const d = await lab.device();
  await d.open(lesson.LESSON_WITH_INSTANT_TASK);
  await d.workerReady();
  await d.signIn(her);
  await d.expectSaved();
  await expect.poll(async () => (await d.keptPaths()).some(p => /^\/unit-01\/lesson-1\/(index\.html)?(\?.*)?$/.test(p)),
    { timeout: 30_000 }).toBe(true);

  // Online, before: the account is shown, the status is not the offline one.
  await expect(d.page.getByText(her.email)).toBeVisible();
  await expect(d.signOutButton).toBeVisible();
  await expect(d.signInButton).toBeHidden();
  await expect(d.status).not.toHaveText(TEXT.offline);

  await d.offline(true);
  await d.open(lesson.LESSON_WITH_INSTANT_TASK);
  expect(new URL(d.page.url()).pathname).toBe(lesson.LESSON_WITH_INSTANT_TASK);

  await d.expectAuth("signed-in");
  await expect(d.page.getByText(her.email)).toBeVisible();
  await d.expectStatus(TEXT.offline, 15_000);
  await expect(d.signInButton).toBeHidden();
  await expect(d.signInButton).toHaveCount(0);
});
