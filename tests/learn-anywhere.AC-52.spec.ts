import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-52: a failed save shows "Try again" beside the message; activating it
   retries at once, the message clears on success, and on another failure
   the message stays with the button still enabled. */

const AT_ONCE_MS = 3_000; // well inside the 8 s the automatic retry would take

test("test_learn_anywhere_AC52_sync_failure_manual_retry", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();

  const d = await lab.device();
  await d.open(lesson.LESSON_WITH_INSTANT_TASK);
  await d.signIn(her);
  await d.expectSaved();
  await expect(d.retryButton).toBeHidden();

  // A save fails.
  await d.failSaves(true);
  const first = await lesson.answerTask(d.page, "01-1-1.1-1");
  await d.expectStatus(TEXT.failed);
  await expect(d.retryButton).toBeVisible();
  await expect(d.retryButton).toBeEnabled();
  await expect(d.retryButton).toHaveAccessibleName("Try again");

  // The backend works again; "Try again" retries immediately and the message clears.
  await d.failSaves(false);
  const m = d.mark();
  const t0 = Date.now();
  await d.retryButton.click();
  await expect.poll(() => d.writesSince(m).length, { timeout: AT_ONCE_MS }).toBeGreaterThanOrEqual(1);
  const retry = d.writesSince(m)[0];
  expect(retry.at - t0).toBeLessThanOrEqual(AT_ONCE_MS);
  await expect.poll(() => d.writesSince(m).some(w => w.code === 200), { timeout: 10_000 }).toBe(true);
  await d.expectSaved();
  await expect(d.status).not.toHaveText(TEXT.failed);
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(first));

  // It fails again: the message stays and the button is still enabled.
  await d.failSaves(true);
  await lesson.answerTask(d.page, "01-1-1.2-1");
  await d.expectStatus(TEXT.failed);
  await expect(d.retryButton).toBeEnabled();
  const m2 = d.mark();
  const t1 = Date.now();
  await d.retryButton.click();
  await expect.poll(() => d.writesSince(m2).length, { timeout: AT_ONCE_MS }).toBeGreaterThanOrEqual(1);
  const again = d.writesSince(m2)[0];
  expect(again.at - t1).toBeLessThanOrEqual(AT_ONCE_MS);
  expect(again.code).toBe(503);
  await expect(d.status).toHaveText(TEXT.failed);
  await expect(d.retryButton).toBeVisible();
  await expect(d.retryButton).toBeEnabled();
  await d.failSaves(false);
});
