import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-5: one valid value under every kind of learner key on device A reaches
   a clean device B on sign-in; the theme, the sync layer's bookkeeping and
   any held work are never uploaded. */

/** A stored value as something to compare: parsed JSON where it is JSON, else the raw string. */
const norm = (v: string | null | undefined): unknown => {
  if (v === null || v === undefined) return v;
  try { return JSON.parse(v); } catch { return v; }
};

test("test_learn_anywhere_AC5_every_kind_of_learner_data_syncs", async ({ lab }) => {
  test.setTimeout(300_000);
  const her = lab.account();
  const samples = Object.values(lesson.LEARNER_KEY_SAMPLES);
  expect(samples.length).toBeGreaterThanOrEqual(19);

  // Device A: signed in, then one value of every kind, written as lesson code writes.
  const a = await lab.device();
  await a.open(lesson.HOME);
  await a.signIn(her);
  await a.expectSaved();
  for (const s of samples) await a.setStored(s.key, s.value);
  await a.setStored("en8:theme", "dark");
  await a.setStored("en8-sync:parked:probe", "held work that must stay on this device");

  // The saves complete: every learner key is in the backend with its value.
  for (const s of samples) {
    await lab.store.expectValue(her, s.key, v => v === s.value, 60_000);
  }

  // The sync layer keeps its own bookkeeping on A (so the exclusion below is tested on something real) ...
  const aKeys = Object.keys(await a.storage());
  expect(aKeys.filter(k => k.startsWith("en8-sync:") && !k.startsWith("en8-sync:parked:")).length).toBeGreaterThan(0);
  // ... and none of it, nor the theme, nor the held work, was uploaded.
  const uploaded = (await lab.store.docs(her)).map(d => d.key);
  expect(uploaded).not.toContain("en8:theme");
  expect(uploaded.filter(k => k.startsWith("en8-sync:"))).toEqual([]);
  expect(uploaded).not.toContain("en8-sync:parked:probe");

  // Device B: clean. Before sign-in it holds none of these keys.
  const b = await lab.device();
  await b.open(lesson.HOME);
  for (const s of samples) expect(await b.stored(s.key)).toBeNull();
  expect(await b.stored("en8:theme")).toBeNull();

  await b.signIn(her);
  for (const s of samples) {
    await expect.poll(async () => {
      try { return norm(await b.stored(s.key)); } catch { return undefined; }
    }, { timeout: 60_000, message: `B should hold ${s.key}` }).toEqual(norm(s.value));
  }
  // What was never uploaded never arrives.
  expect(await b.stored("en8:theme")).toBeNull();
  expect(await b.stored("en8-sync:parked:probe")).toBeNull();
});
