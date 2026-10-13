/* AC-19: the "Your days" record is an account of what was done and nothing
   else — no streak, score, percentage, points, badges, level, best,
   comparison, or time spent — and the per-task score lines on the lesson
   pages are untouched by it. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* Every word the criterion forbids in the record, plus the shapes a time or a
   duration takes ("12:30", "5 min", "2 h"). The legitimate copy — "Week of
   Monday 7 September: you worked on 2 days.", "1 task answered" — matches
   none of these. */
const SCOREBOARD = new RegExp(
  [
    "streak", "in a row", "days running", "score", "%", "percent", "points?\\b", "badge",
    "level", "\\bbest\\b", "better", "worse", "compar", "\\bthan\\b",
    "minute", "\\bmins?\\b", "hour", "\\bhrs?\\b", "time spent", "\\btime\\b", "\\d+\\s*:\\s*\\d{2}",
  ].join("|"),
  "i",
);

test("test_learn_anywhere_AC19_day_record_shows_no_streak_score_or_time", async ({ lab }) => {
  test.setTimeout(120_000);
  const a = await lab.device({ timezone: "Asia/Ho_Chi_Minh", at: "2026-09-08T06:30:00+07:00" });

  // before any work: the record lists no days
  await a.home();
  await expect(a.days).not.toContainText("you worked on 2 days");

  // work on two days: 8 September, then 10 September
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  const first = await lesson.answerTask(a.page);
  await a.setTime("2026-09-10T06:30:00+07:00");
  const second = await lesson.answerTask(a.page);
  const scoreBefore = {
    first: (await lesson.taskView(a.page, first)).scoreLine,
    second: (await lesson.taskView(a.page, second)).scoreLine,
  };
  expect(scoreBefore.first).toMatch(/All right$/);
  expect(scoreBefore.second).toMatch(/All right$/);

  // the record is shown, with both days, and nothing of a scoreboard
  await a.home();
  await expect(a.days).toBeVisible();
  await expect(a.days.getByRole("heading", { name: "Your days" })).toBeVisible();
  await expect(a.days).toContainText("you worked on 2 days.");
  await expect(a.days).toContainText("task answered");
  await expect(a.days).not.toContainText(SCOREBOARD);
  const shown = await a.days.innerText();
  expect(shown).not.toMatch(SCOREBOARD);

  // the per-task score lines elsewhere are unaffected
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  expect((await lesson.taskView(a.page, first)).scoreLine).toBe(scoreBefore.first);
  expect((await lesson.taskView(a.page, second)).scoreLine).toBe(scoreBefore.second);
});
