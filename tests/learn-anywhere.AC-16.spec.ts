import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-16: a task on device A one day and on device B a later day: once each
   has saved and received the other's work, both list both days in "Your days". */
test("test_learn_anywhere_AC16_day_record_travels_between_devices", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();
  const TZ = "Asia/Ho_Chi_Minh";
  const DAYS = "en8:days:v1";
  const dayCount = (v: string | null | undefined) => {
    if (typeof v !== "string") return 0;
    try { return Object.keys(JSON.parse(v)).length; } catch { return 0; }
  };

  // A works on 8 September and saves.
  const a = await lab.device({ timezone: TZ, at: "2026-09-08T06:30:00+07:00" });
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await lesson.answerTask(a.page, "01-1-1.1-1");
  await a.expectSaved();
  await lab.store.expectValue(her, DAYS, v => dayCount(v) === 1);
  await a.open(lesson.HOME);
  await expect(a.days).toContainText("8 September");
  await expect(a.days.getByText("10 September")).toHaveCount(0);

  // B works on 10 September, having received A's work, and saves.
  const b = await lab.device({ timezone: TZ, at: "2026-09-10T06:30:00+07:00" });
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);
  await expect(b.page.locator('[data-task="01-1-1.1-1"]')).toHaveAttribute("data-done", "1", { timeout: 30_000 });
  await lesson.answerTask(b.page, "01-1-1.2-1");
  await b.expectSaved();
  await lab.store.expectValue(her, DAYS, v => dayCount(v) === 2);

  // B lists both days.
  await b.open(lesson.HOME);
  await expect(b.days).toContainText("10 September");
  await expect(b.days).toContainText("8 September");

  // A receives B's work on its next page load and lists both days too.
  await a.open(lesson.HOME);
  await expect(a.days).toContainText("10 September", { timeout: 30_000 });
  await expect(a.days).toContainText("8 September");
});
