import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-2: a signed-in session survives a reload and a move to another page of
   the site: the header shows the email and "Sign out", "Sign in with Google"
   is hidden, the state reads "signed-in", and no new popup opens. */
test("test_learn_anywhere_AC2_session_persists_across_pages", async ({ lab }) => {
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.HOME);
  const email = a.page.getByText(her.email);

  // Before: signed out, no email anywhere, no "Sign out", "Sign in with Google" shown.
  await a.expectAuth("signed-out");
  await expect(email).toHaveCount(0);
  await expect(a.signOutButton).toBeHidden();
  await expect(a.signInButton).toBeVisible();

  await a.signIn(her);
  await expect(email.first()).toBeVisible();
  await expect(a.signOutButton).toBeVisible();
  await expect(a.signInButton).toBeHidden();

  // From here on, no popup may open.
  let popups = 0;
  a.context.on("page", () => { popups++; });

  // Reload the same page.
  await a.page.reload({ waitUntil: "load" });
  await a.expectAuth("signed-in");
  await expect(email.first()).toBeVisible();
  await expect(a.signOutButton).toBeVisible();
  await expect(a.signInButton).toBeHidden();
  expect(popups).toBe(0);

  // Open another page of the site.
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.expectAuth("signed-in");
  await expect(email.first()).toBeVisible();
  await expect(a.signOutButton).toBeVisible();
  await expect(a.signInButton).toBeHidden();
  expect(popups).toBe(0);
});
