import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* Edge case (AC-41, AC-52): while saves are failing, a further edit must not
   send its own request ahead of the backoff. changed() arms a 700 ms push for
   every edit, and round() treats a failed status as "send straight away", so
   each edit during a fault leaves a write at once and the 8/16/32 s wait is
   only a floor for idle devices. Over 30 s of failure the schedule allows at
   most the first try plus the 8 s and 24 s retries. */

test("test_learn_anywhere_EDGE_failing_save_backoff_not_bypassed_by_new_edits", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();
  const a = await lab.device({ at: new Date() });
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.expectSaved();

  await a.failSaves(true);
  const m = a.mark();
  await lesson.answerTask(a.page);
  await a.expectStatus(TEXT.failed);
  await expect.poll(() => a.writesSince(m).length, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);

  // She keeps working for thirty seconds of the device's clock, an edit every three.
  for (let i = 0; i < 10; i++) {
    await a.setStored("en8:notes:edge-backoff", "edit " + i);
    await a.advance(3_000);
  }
  await a.advance(1_000);

  const writes = a.writesSince(m).length;
  // first try + retries at ~8 s and ~24 s, with one spare for timer slack
  expect(writes, "saves sent during 30 s of failure").toBeLessThanOrEqual(4);
});
