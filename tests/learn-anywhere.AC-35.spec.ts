/* AC-35: review items answered on two devices in one day, each without a
   connection to the backend, add up once both reconnect — the day's record
   counts five reviewed items on both. */
import { test, expect, type Device } from "./support/harness";
import * as lesson from "./support/driver";

async function reviewedToday(d: Device): Promise<number> {
  const days = JSON.parse((await d.stored("en8:days:v1")) || "{}");
  const today = String(await lesson.browserTodayNum(d.page));
  return (days[today] && days[today].reviewed) || 0;
}

test("test_learn_anywhere_AC35_reviewed_count_includes_both_devices", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();

  const a = await lab.device();
  await a.home();
  await a.signIn(her);
  const b = await lab.device();
  await b.home();
  await b.signIn(her);
  expect(await reviewedToday(a)).toBe(0);
  expect(await reviewedToday(b)).toBe(0);

  // both lose the backend; each reviews different items on the same day
  await a.backendUnreachable(true);
  await b.backendUnreachable(true);
  await lesson.seedDueReview(a.page, 3, { unit: "01" });
  expect(await lesson.answerReviewItems(a.page, 3)).toBe(3);
  expect(await reviewedToday(a)).toBe(3);
  await lesson.seedDueReview(b.page, 2, { unit: "02" });
  expect(await lesson.answerReviewItems(b.page, 2)).toBe(2);
  expect(await reviewedToday(b)).toBe(2);

  // both reconnect and their saves complete
  await a.backendUnreachable(false);
  await a.returnToTab();
  await a.expectSaved(60_000);
  await b.backendUnreachable(false);
  await b.returnToTab();
  await b.expectSaved(60_000);
  await lab.store.expectValue(her, "en8:days:v1", v => {
    if (!v) return false;
    const days = JSON.parse(v);
    return Object.values(days).some((d: any) => d && d.reviewed === 5);
  });

  // that day's record counts five reviewed items on both devices
  await a.home();
  await expect(async () => { expect(await reviewedToday(a)).toBe(5); }).toPass({ timeout: 40_000 });
  await b.home();
  await expect(async () => { expect(await reviewedToday(b)).toBe(5); }).toPass({ timeout: 40_000 });
  await expect(a.days).toContainText(/\b5 reviews?\b/);
  await expect(b.days).toContainText(/\b5 reviews?\b/);
});
