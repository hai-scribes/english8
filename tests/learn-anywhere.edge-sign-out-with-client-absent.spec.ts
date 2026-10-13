/* Edge case (AC-21/AC-22): "Sign out" must end the session. When the sign-in
   client has not loaded yet (a slow or cut-off bundle; the header already shows
   the account and "Sign out" from the stored owner), pressing it drops the
   device's owner note and reloads, but never signs the account out of the
   browser — so the next page load restores the session and brings her work back
   onto a device she left. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

const FLAG = "en8-test:no-client";

test("test_learn_anywhere_EDGE_sign_out_ends_session_when_client_not_loaded", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await lesson.answerTask(a.page);
  await a.expectSaved();
  expect(await a.credential()).not.toBeNull();

  // The sign-in client never registers on this page, as when its script is still on the way.
  await a.page.addInitScript(flag => {
    if (sessionStorage.getItem(flag)) {
      Object.defineProperty(window, "EN8Auth", { configurable: true, get: () => undefined, set: () => {} });
    }
  }, FLAG);
  await a.page.evaluate(f => sessionStorage.setItem(f, "1"), FLAG);
  await a.page.reload();
  await expect(a.signOutButton).toBeVisible();

  const draws = a.draws();
  await a.signOutButton.click();
  await expect.poll(() => a.drawsSince(draws), { timeout: 15_000 }).toBeGreaterThan(0);

  // Signed out means signed out of the browser too, whatever had loaded.
  await a.page.evaluate(f => sessionStorage.removeItem(f), FLAG);
  await a.page.reload();
  await a.expectAuth("signed-out");
  await expect.poll(() => a.credential(), { timeout: 10_000 }).toBeNull();
  await expect(a.page.getByText(her.email)).toHaveCount(0);
});
