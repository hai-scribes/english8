import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-40: a signed-out device holding 900 learner keys signs in; all 900 reach
   the backend, in writes of at most 500 documents each, and the page reads "Saved". */

const KEYS = 900;
const PREFIX = "en8:notes:ac40-";
const BATCH_MAX = 500;

test("test_learn_anywhere_AC40_large_first_upload_is_batched", async ({ lab }) => {
  test.setTimeout(300_000);
  const her = lab.account();

  const a = await lab.device();
  await a.open(lesson.HOME);
  for (let i = 0; i < KEYS; i++) await a.setStored(`${PREFIX}${i}`, `v${i}`);
  expect(Object.keys(await a.storage()).filter(k => k.startsWith(PREFIX)).length).toBe(KEYS);

  // Before: nothing of hers is in the backend and the page does not say "Saved".
  expect(await lab.store.docs(her)).toEqual([]);
  await expect(a.status).not.toHaveText(TEXT.saved);
  const m = a.mark();

  await a.signIn(her);
  // Work was done on this device while nobody was signed in: add it to the account if asked.
  await a.addItButton.click({ timeout: 10_000 }).catch(() => {});

  await expect.poll(async () => (await lab.store.docs(her)).filter(d => d.key.startsWith(PREFIX)).length,
    { timeout: 180_000 }).toBe(KEYS);
  await a.expectSaved();

  const docs = await lab.store.docs(her);
  for (let i = 0; i < KEYS; i++) {
    expect(docs.find(d => d.key === `${PREFIX}${i}`)?.v).toBe(`v${i}`);
  }

  const writes = a.writesSince(m);
  expect(writes.length).toBeGreaterThanOrEqual(2);
  for (const w of writes) expect(w.docsWritten).toBeLessThanOrEqual(BATCH_MAX);
  expect(writes.reduce((n, w) => n + w.docsWritten, 0)).toBeGreaterThanOrEqual(KEYS);
  await expect(a.status).toHaveText(TEXT.saved);
});
