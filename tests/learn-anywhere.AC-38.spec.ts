import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-38: with 300 keys saved and the device already synced, one change
   reads fewer than ten documents back, not the 300. */

const KEYS = 300;
const PREFIX = "en8:notes:ac38-";

test("test_learn_anywhere_AC38_a_save_reads_only_what_changed", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();

  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);

  // The account holds 300 saved keys, put there by this device (so it has synced before).
  for (let i = 0; i < KEYS; i++) await a.setStored(`${PREFIX}${i}`, `note ${i}`);
  await expect.poll(async () => (await lab.store.docs(her)).filter(d => d.key.startsWith(PREFIX)).length,
    { timeout: 120_000 }).toBe(KEYS);
  await a.expectSaved();
  expect((await lab.store.docs(her)).length).toBeGreaterThanOrEqual(KEYS);
  await a.page.waitForTimeout(1_500); // let the save's own follow-up reads land before the mark

  // One change, saved.
  const m = a.mark();
  const id = await lesson.answerTask(a.page);
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(id));
  await a.expectSaved();
  await a.page.waitForTimeout(1_500); // and its follow-up reads, which count against it

  expect(a.writesSince(m).length).toBeGreaterThanOrEqual(1);
  expect(a.docsReadSince(m)).toBeLessThan(10);
  expect(a.docsReadSince(m)).toBeLessThan(KEYS);
});
