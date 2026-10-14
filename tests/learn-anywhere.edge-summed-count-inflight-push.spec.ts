/* Edge case (AC-35, AC-17): a count that two devices add to must stay exact
   when the learner changes it again while a save of it is on its way and the
   other device writes before the next save. The first save is already in the
   account, but the key stays unsent with the merge base from before it, so
   the next merge adds that save's increment a second time. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

const KEY = "en8:days:v1";
const rec = (day: number, reviewed: number) => JSON.stringify({ [String(day)]: { reviewed, steps: [] } });
const reviewedOf = (v: string | null | undefined, day: number) =>
  v ? (JSON.parse(v)[String(day)] || {}).reviewed : undefined;

test("test_learn_anywhere_EDGE_summed_count_not_doubled_by_change_during_push", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();

  const a = await lab.device();
  await a.home();
  await a.signIn(her);
  const day = await lesson.browserTodayNum(a.page);

  // baseline: one review, saved, and known to device B
  await a.setStored(KEY, rec(day, 1));
  await a.expectSaved();
  await lab.store.expectValue(her, KEY, v => reviewedOf(v, day) === 1);
  const b = await lab.device();
  await b.home();
  await b.signIn(her);
  await expect.poll(async () => reviewedOf(await b.stored(KEY), day), { timeout: 30_000 }).toBe(1);
  await b.home();                                   // its page now knows the baseline

  // A reviews one (+1): the save leaves and is held; A reviews another (+1) while it is in flight
  await a.holdSaves(true);
  await a.setStored(KEY, rec(day, 2));
  await a.page.waitForTimeout(2500);
  await a.setStored(KEY, rec(day, 3));
  // the held save lands, and the follow-up save fails
  await a.failSaves(true);
  await a.holdSaves(false);
  await a.expectStatus(TEXT.failed, 30_000);
  await lab.store.expectValue(her, KEY, v => reviewedOf(v, day) === 2);

  // B reviews two (+2) and saves
  await b.setStored(KEY, rec(day, 3));
  await b.expectSaved(40_000);
  await lab.store.expectValue(her, KEY, v => reviewedOf(v, day) === 4);

  // A's saves work again: 1 + 1 + 1 + 2 = 5 reviews in all
  await a.failSaves(false);
  await a.retryButton.click();
  await a.expectSaved(40_000);
  await expect.poll(async () => reviewedOf(await a.stored(KEY), day), { timeout: 20_000 }).toBe(5);
  await lab.store.expectValue(her, KEY, v => reviewedOf(v, day) === 5);
});

/* Two devices that each add the same number to a day's count end with equal
   records, and equal records are taken as agreement: the day counts the work
   of one device. AC-35 says none of it is dropped. */
test("test_learn_anywhere_EDGE_equal_increments_on_two_devices_both_count", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();
  const a = await lab.device();
  await a.home();
  await a.signIn(her);
  const day = await lesson.browserTodayNum(a.page);
  await a.setStored(KEY, rec(day, 1));
  await a.expectSaved();
  await lab.store.expectValue(her, KEY, v => reviewedOf(v, day) === 1);
  const b = await lab.device();
  await b.home();
  await b.signIn(her);
  await expect.poll(async () => reviewedOf(await b.stored(KEY), day), { timeout: 30_000 }).toBe(1);
  await b.home();

  // each reviews one more, with no connection
  await a.backendUnreachable(true);
  await b.backendUnreachable(true);
  await a.setStored(KEY, rec(day, 2));
  await b.setStored(KEY, rec(day, 2));
  await a.backendUnreachable(false);
  await a.returnToTab();
  await a.expectSaved(40_000);
  await lab.store.expectValue(her, KEY, v => reviewedOf(v, day) === 2);
  await b.backendUnreachable(false);
  await b.returnToTab();
  await b.expectSaved(40_000);

  // 1 + 1 + 1
  await lab.store.expectValue(her, KEY, v => reviewedOf(v, day) === 3);
  await expect.poll(async () => reviewedOf(await b.stored(KEY), day), { timeout: 20_000 }).toBe(3);
});
