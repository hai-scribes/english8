import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* Edge case (AC-21 / AC-23): a tab that dies in the middle of signing out
   leaves its "leaving" note behind. The note carries no age, so every later
   page of this device waits for a sign-out that is never going to finish:
   nothing syncs and "Sign out" does nothing. */

const TASK = "01-1-1.1-1";

test("test_learn_anywhere_EDGE_abandoned_sign_out_does_not_wedge_the_device", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();

  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.expectSaved();

  // The tab was closed half way through signing out: only its note is left.
  const owner = JSON.parse((await a.stored("en8-sync:owner")) as string);
  await a.page.evaluate(uid => window.localStorage.setItem("en8-sync:leaving", uid), owner.uid);
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);

  // Work done now still reaches the account.
  await lesson.answerTask(a.page, TASK);
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(TASK), 30_000);

  // And she can still sign out.
  await a.page.getByRole("button", { name: "Sign out" }).click();
  await expect(a.page.getByRole("button", { name: "Sign in with Google" })).toBeVisible({ timeout: 20_000 });
  expect(await a.stored("en8-sync:owner")).toBeNull();
});
