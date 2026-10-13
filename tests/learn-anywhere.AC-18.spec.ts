import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-18: a timed writing is filed as "1 piece of writing" when it is handed
   in, not while it is typed, however much is typed. */
test("test_learn_anywhere_AC18_writing_is_filed_once_when_handed_in", async ({ lab }) => {
  const a = await lab.device();
  await a.open(lesson.LESSON_READING_WRITING);
  await lesson.startTimedWriting(a.page);
  expect(await lesson.timedTestRunning(a.page)).toBe(true);

  // Type, and type again, and again: three saves of the draft.
  await lesson.typeWriting(a.page, "Hi Mai, I enjoy fishing with my dad at the weekend.");
  await lesson.typeWriting(a.page, "Hi Mai, I enjoy fishing with my dad at the weekend. We go to the lake early and come home late.");
  await lesson.typeWriting(a.page, "Hi Mai, I enjoy fishing with my dad at the weekend. We go to the lake early and come home late. It is my favourite hobby and I never get bored of it.");
  expect((await lesson.writingText(a.page)).length).toBeGreaterThan(100);

  // Today, in a second tab of the same device: no writing is filed yet.
  const home = await a.newTab(lesson.HOME);
  await expect(home.days.getByText(/piece of writing/)).toHaveCount(0);
  await expect(home.days.getByRole("listitem").filter({ hasText: "writing" })).toHaveCount(0);

  // Hand it in.
  await lesson.handInWriting(a.page);
  expect(await lesson.writingDrafts(a.page)).toHaveLength(1);

  // Now the day's line shows exactly one piece of writing.
  await home.page.reload({ waitUntil: "load" });
  const withWriting = home.days.getByRole("listitem").filter({ hasText: "piece of writing" });
  await expect(withWriting).toHaveCount(1);
  await expect(withWriting).toContainText("1 piece of writing");
  await expect(home.days).not.toContainText("2 piece");
  await expect(home.days).not.toContainText("3 piece");
  await expect(home.days).not.toContainText("pieces of writing");
});
