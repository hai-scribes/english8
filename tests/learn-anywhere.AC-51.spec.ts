import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-51: a second click on "Sign in with Google" during an attempt is
   ignored: one popup, and only one, until the attempt resolves. */

test("test_learn_anywhere_AC51_sign_in_double_click_ignored", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();

  const d = await lab.device();
  await d.open(lesson.LESSON_WITH_INSTANT_TASK);
  let popups = 0;
  d.page.on("popup", () => { popups++; });
  expect(popups).toBe(0);
  expect(d.context.pages().length).toBe(1);

  const popup = await d.startSignIn();
  await d.expectAuth("signing-in");
  expect(popups).toBe(1);
  expect(d.context.pages().length).toBe(2);

  // The second click, within the same attempt.
  await d.signInButton.dispatchEvent("click", undefined, { timeout: 5_000 }).catch(() => {});
  await d.signInButton.click({ force: true, timeout: 5_000, noWaitAfter: true }).catch(() => {});
  await d.page.waitForTimeout(2_000);

  expect(popups).toBe(1);
  expect(d.context.pages().length).toBe(2);
  await d.expectAuth("signing-in");
  expect(popup.isClosed()).toBe(false);

  // The one attempt resolves.
  await d.completeSignIn(popup, her);
  await d.expectAuth("signed-in");
  await expect.poll(() => popup.isClosed(), { timeout: 15_000 }).toBe(true);
  expect(popups).toBe(1);
  expect(d.context.pages().length).toBe(1);
});
