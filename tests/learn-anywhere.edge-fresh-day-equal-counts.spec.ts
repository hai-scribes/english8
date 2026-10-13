/* Edge case on AC-35: two devices each answer the SAME number of review items
   on a day neither had a record for. Both stored records are identical, and
   the merge treats identical copies as agreement (sync.js merge3, the
   `same(m, t)` shortcut with no base) instead of adding the two counts.
   The day must count four, not two. */
import { test, expect, type Device } from "./support/harness";
import * as lesson from "./support/driver";

async function reviewedToday(d: Device): Promise<number> {
  const days = JSON.parse((await d.stored("en8:days:v1")) || "{}");
  const today = String(await lesson.browserTodayNum(d.page));
  return (days[today] && days[today].reviewed) || 0;
}

test("test_learn_anywhere_edge_fresh_day_equal_review_counts_are_added", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();

  const a = await lab.device();
  await a.home();
  await a.signIn(her);
  const b = await lab.device();
  await b.home();
  await b.signIn(her);

  await a.backendUnreachable(true);
  await b.backendUnreachable(true);
  await lesson.seedDueReview(a.page, 2, { unit: "01" });
  expect(await lesson.answerReviewItems(a.page, 2)).toBe(2);
  await lesson.seedDueReview(b.page, 2, { unit: "02" });
  expect(await lesson.answerReviewItems(b.page, 2)).toBe(2);
  expect(await reviewedToday(a)).toBe(2);
  expect(await reviewedToday(b)).toBe(2);

  await a.backendUnreachable(false);
  await a.returnToTab();
  await a.expectSaved(60_000);
  await b.backendUnreachable(false);
  await b.returnToTab();
  await b.expectSaved(60_000);

  // four items were reviewed in all; neither device may report two
  await a.home();
  await expect(async () => { expect(await reviewedToday(a)).toBe(4); }).toPass({ timeout: 40_000 });
  await b.home();
  await expect(async () => { expect(await reviewedToday(b)).toBe(4); }).toPass({ timeout: 40_000 });
  await lab.store.expectValue(her, "en8:days:v1", v => {
    if (!v) return false;
    return Object.values(JSON.parse(v)).some((d: any) => d && d.reviewed === 4);
  });
});
