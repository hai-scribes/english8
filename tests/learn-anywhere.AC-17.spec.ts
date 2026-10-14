import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-17: a task, a word set, a practice run and a review on one day give that
   day's line "1 task answered · 1 word set · 1 practice run · 1 review", drawn
   from the one record under en8:days:v1, which Today still reads as before
   (the review card offers at most 20 less what was reviewed today). */
test("test_learn_anywhere_AC17_day_record_counts_every_kind_of_work_in_one_record", async ({ lab }) => {
  test.setTimeout(300_000);
  const a = await lab.device();
  const line = () => a.days.getByRole("listitem");

  // Before any work: nothing listed.
  await a.open(lesson.HOME);
  await expect(line()).toHaveCount(0);

  // A marked task.
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.answerTask(a.page);
  await a.open(lesson.HOME);
  await expect(line()).toHaveCount(1);
  await expect(line().first()).toContainText("1 task answered");
  await expect(line().first()).not.toContainText("word set");
  await expect(line().first()).not.toContainText("practice run");
  await expect(line().first()).not.toContainText("review");

  // A Meet-the-words set.
  await a.open(lesson.LESSON_WORDS);
  await lesson.finishWordSet(a.page);

  // A practice-bank run.
  await a.open(lesson.LESSON_PRACTICE);
  await lesson.finishPracticeRun(a.page);

  // A review session of one item.
  await a.open(lesson.HOME);
  await lesson.seedDueReview(a.page, 1);
  expect(await lesson.reviewDueCount(a.page)).toBe(1);
  await lesson.finishReview(a.page);

  // Today still reads the record as before: with 21 more due, the card offers
  // 20 less the 1 reviewed today.
  await lesson.seedDueReview(a.page, 21);
  expect(await lesson.reviewDueCount(a.page)).toBe(19);

  // The day's line names each kind with its count.
  await expect(line()).toHaveCount(1);
  await expect(line().first()).toContainText("1 task answered · 1 word set · 1 practice run · 1 review");

  // One per-day record, under today's key, holding the review count beside the rest.
  const raw = await a.stored("en8:days:v1");
  expect(raw).not.toBeNull();
  const days = JSON.parse(raw!) as Record<string, { reviewed?: number; steps?: string[] }>;
  const today = String(await lesson.browserTodayNum(a.page));
  expect(Object.keys(days)).toEqual([today]);
  expect(days[today].reviewed).toBe(1);
});
