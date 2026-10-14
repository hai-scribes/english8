import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-15: work is filed under the browser's local day. At 06:30 in
   Asia/Ho_Chi_Minh (23:30 UTC the day before) on 8 and 10 September, "Your
   days" lists 10 September above 8 September under the week line, each with
   "1 task answered", and nothing under 7 or 9 September. */
test("test_learn_anywhere_AC15_day_record_files_work_under_the_local_day", async ({ lab }) => {
  const a = await lab.device({ timezone: "Asia/Ho_Chi_Minh", at: "2026-09-08T06:30:00+07:00" });

  // Before any work: nothing is listed.
  await a.open(lesson.HOME);
  await expect(a.days.getByRole("listitem")).toHaveCount(0);

  // One task on 8 September, one on 10 September (local).
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.answerTask(a.page, "01-1-1.1-1");
  await a.setTime("2026-09-10T06:30:00+07:00");
  await lesson.answerTask(a.page, "01-1-1.2-1");

  await a.open(lesson.HOME);
  await expect(a.days.getByRole("heading", { name: "Your days" })).toHaveText("Your days");
  await expect(a.days).toContainText("Week of Monday 7 September: you worked on 2 days.");

  const items = a.days.getByRole("listitem");
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText("10 September");
  await expect(items.nth(0)).toContainText("1 task answered");
  await expect(items.nth(1)).toContainText("8 September");
  await expect(items.nth(1)).not.toContainText("10 September");
  await expect(items.nth(1)).toContainText("1 task answered");
  await expect(items.filter({ hasText: "7 September" })).toHaveCount(0);
  await expect(items.filter({ hasText: "9 September" })).toHaveCount(0);

  // The week line is above the days; 10 September is above 8 September.
  const text = await a.days.innerText();
  const week = text.indexOf("Week of Monday 7 September: you worked on 2 days.");
  const tenth = text.indexOf("10 September");
  const eighth = text.indexOf("8 September");
  expect(week).toBeGreaterThanOrEqual(0);
  expect(tenth).toBeGreaterThan(week);
  expect(eighth).toBeGreaterThan(tenth);
});
