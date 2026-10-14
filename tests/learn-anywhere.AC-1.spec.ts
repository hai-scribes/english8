import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-1: clicking "Sign in with Google" opens one popup; the auth state reads
   "signing-in" until the popup is answered, then "signed-in". */
test("test_learn_anywhere_AC1_sign_in_starts", async ({ lab }) => {
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.HOME);

  // Before the click: signed out, the button on offer, no popup has opened.
  await a.expectAuth("signed-out");
  await expect(a.signInButton).toBeEnabled();
  let popups = 0;
  a.context.on("page", () => { popups++; });
  expect(popups).toBe(0);

  // The click: exactly one popup, and the state moves to "signing-in".
  const popup = await a.startSignIn();
  await a.expectAuth("signing-in");
  expect(popups).toBe(1);

  // While the popup is open and unanswered the state stays "signing-in".
  await popup.waitForLoadState("load");
  await expect(a.html).toHaveAttribute("data-auth", "signing-in");
  expect(popups).toBe(1);

  // Completing the popup resolves it to "signed-in"; still only one popup.
  await a.completeSignIn(popup, her);
  await a.expectAuth("signed-in");
  expect(popups).toBe(1);
});
