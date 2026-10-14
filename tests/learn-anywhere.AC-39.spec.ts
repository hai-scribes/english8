import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-39: a device reads the whole account on its first sync and again once a
   day; a save in between reads only what changed. */

const SEEDED = 40;
const SEED_PREFIX = "en8:notes:ac39-seed-";
const DAY = 24 * 3600 * 1000;

test("test_learn_anywhere_AC39_whole_account_is_read_on_first_sync_and_daily", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();

  // An account with saved keys, put there by another device.
  const seeder = await lab.device();
  await seeder.open(lesson.HOME);
  await seeder.signIn(her);
  for (let i = 0; i < SEEDED; i++) await seeder.setStored(`${SEED_PREFIX}${i}`, `seed ${i}`);
  await expect.poll(async () => (await lab.store.docs(her)).filter(d => d.key.startsWith(SEED_PREFIX)).length,
    { timeout: 60_000 }).toBe(SEEDED);
  await seeder.expectSaved();

  // A device with a clock the test controls signs in for the first time and saves.
  const a = await lab.device({ at: new Date() });
  await a.open(lesson.HOME);
  const m0 = a.mark();
  expect(a.docsReadSince(m0)).toBe(0);
  await a.signIn(her);
  await a.setStored("en8:notes:ac39-first", "first");
  await lab.store.expectValue(her, "en8:notes:ac39-first", v => v === "first");
  await a.expectSaved();
  await a.page.waitForTimeout(1_500);
  expect(a.docsReadSince(m0)).toBeGreaterThanOrEqual(SEEDED); // the whole account

  // A save within the same day does not read the whole account.
  const m1 = a.mark();
  await a.setStored("en8:notes:ac39-same-day", "same day");
  await lab.store.expectValue(her, "en8:notes:ac39-same-day", v => v === "same day");
  await a.expectSaved();
  await a.page.waitForTimeout(1_500);
  expect(a.docsReadSince(m1)).toBeLessThan(SEEDED);

  // The clock passes 24 hours; the next save reads the whole account again.
  await a.setTime(new Date(Date.now() + DAY + 3600_000));
  const m2 = a.mark();
  await a.setStored("en8:notes:ac39-next-day", "next day");
  await lab.store.expectValue(her, "en8:notes:ac39-next-day", v => v === "next day");
  await a.expectSaved();
  await a.page.waitForTimeout(1_500);
  expect(a.docsReadSince(m2)).toBeGreaterThanOrEqual(SEEDED);
});
