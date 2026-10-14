import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* Edge case (AC-15, persisted-state boundary): a malformed or future day
   record must not break Today. The app owns en8:days:v1 across releases, so
   a bad `steps` shape should be ignored instead of throwing while painting
   "Your days". */
test("test_learn_anywhere_EDGE_malformed_day_steps_do_not_break_today", async ({ lab }) => {
  const a = await lab.device();
  const pageErrors: string[] = [];
  a.page.on("pageerror", err => pageErrors.push(err.message));

  await a.page.addInitScript(() => {
    const day = String(Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000));
    localStorage.setItem("en8:days:v1", JSON.stringify({
      [day]: { reviewed: 1, tasks: 1, steps: "not an array" },
    }));
  });

  await a.open(lesson.HOME);

  await expect(a.days).toBeVisible();
  await expect(a.days.getByRole("listitem").first()).toContainText("1 task answered · 1 review");
  expect(pageErrors.filter(m => /steps\.filter|filter is not a function/.test(m))).toEqual([]);
});
