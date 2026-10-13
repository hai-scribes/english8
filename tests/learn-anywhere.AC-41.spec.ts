import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-41: while saves fail, the retries come after 8, 16, 32 ... seconds,
   doubling up to five minutes; the next success returns the wait to 8 s.
   Retry times are read off the device's own clock at the moment each write
   left (storeRequests[].at); the clock is advanced past each expected wait. */

const GAPS_S = [8, 16, 32, 64, 128, 256, 300, 300];
const SLACK = 2_500;

test("test_learn_anywhere_AC41_failing_save_backs_off", async ({ lab }) => {
  test.setTimeout(300_000);
  const her = lab.account();

  const a = await lab.device({ at: new Date() });
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.expectSaved();

  // Saves are made to fail.
  await a.failSaves(true);
  const m = a.mark();
  const id = await lesson.answerTask(a.page);
  await a.expectStatus(TEXT.failed);
  await expect.poll(() => a.writesSince(m).length, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  let seen = a.writesSince(m).length;
  let last = a.writesSince(m)[seen - 1];
  expect(last.code).toBe(503);

  for (const g of GAPS_S) {
    await a.advance(g * 1000 + 2_000);
    await expect.poll(() => a.writesSince(m).length, { timeout: 15_000 }).toBeGreaterThan(seen);
    const fresh = a.writesSince(m).slice(seen);
    const gap = fresh[0].at - last.at;
    expect(gap, `retry after ${g} s`).toBeGreaterThanOrEqual(g * 1000 - SLACK);
    expect(gap, `retry after ${g} s`).toBeLessThanOrEqual(g * 1000 + SLACK);
    expect(fresh[0].code).toBe(503);
    seen = a.writesSince(m).length;
    last = a.writesSince(m)[seen - 1];
  }
  await expect(a.status).toHaveText(TEXT.failed);

  // The backend works again: the next retry (five minutes on) succeeds.
  await a.failSaves(false);
  await a.advance(300_000 + 2_000);
  await expect.poll(() => a.writesSince(m).some(w => w.code === 200), { timeout: 15_000 }).toBe(true);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(id));

  // After a success the wait is 8 s again.
  await a.failSaves(true);
  const m2 = a.mark();
  await a.setStored("en8:notes:ac41", "after the success");
  await a.expectStatus(TEXT.failed);
  await expect.poll(() => a.writesSince(m2).length, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  const seen2 = a.writesSince(m2).length;
  const first2 = a.writesSince(m2)[seen2 - 1];
  expect(first2.code).toBe(503);
  await a.advance(8_000 + 2_000);
  await expect.poll(() => a.writesSince(m2).length, { timeout: 15_000 }).toBeGreaterThan(seen2);
  const retry = a.writesSince(m2)[seen2];
  const gap2 = retry.at - first2.at;
  expect(gap2).toBeGreaterThanOrEqual(8_000 - SLACK);
  expect(gap2).toBeLessThanOrEqual(8_000 + SLACK);
});
