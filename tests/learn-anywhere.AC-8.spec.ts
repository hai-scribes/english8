import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-8: the same note changed on two offline devices converges when both
   reconnect: the later change wins whole on both devices and on a clean
   third; a record that is a log of attempts keeps both devices' entries. */
test("test_learn_anywhere_AC8_concurrent_edits_to_one_note_converge", async ({ lab }) => {
  test.setTimeout(300_000);
  const her = lab.account();
  const NOTE = "en8:notes:01-4-p1";
  const TASK = "01-1-1.1-1";
  const FIRST = "Fish keep three days in a bucket";
  const ON_A = "Changed on A";
  const ON_B = "Changed on B, a moment later";

  // A: sign in, take the reading (which opens the passage), write the note, save it.
  const a = await lab.device();
  await a.open(lesson.LESSON_READING_WRITING);
  await a.signIn(her);
  await lesson.startTimedReading(a.page);
  await lesson.finishTimedReading(a.page);
  await lesson.addNote(a.page, FIRST);
  await lab.store.expectValue(her, NOTE, v => v === FIRST);

  // B: sign in and receive the same note.
  const b = await lab.device();
  await b.open(lesson.HOME);
  await b.signIn(her);
  await expect.poll(() => b.stored(NOTE).catch(() => null), { timeout: 30_000 }).toBe(FIRST);
  await b.open(lesson.LESSON_READING_WRITING);
  await expect.poll(() => lesson.noteText(b.page).catch(() => null), { timeout: 30_000 }).toBe(FIRST);

  // A second tab on each device, on a page with an attempt log to write to.
  const a2 = await a.newTab(lesson.LESSON_WITH_INSTANT_TASK);
  const b2 = await b.newTab(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskNotDone(a2.page, TASK);
  await lesson.expectTaskNotDone(b2.page, TASK);

  // Both offline; each changes the note (B's change is the later one) and
  // each commits one attempt on the same task.
  await a.offline(true);
  await b.offline(true);
  await lesson.editNote(a.page, ON_A);
  await lesson.answerTask(a2.page, TASK, { wrong: [0, 2] });
  await a.page.waitForTimeout(500);
  await lesson.editNote(b.page, ON_B);
  await lesson.answerTask(b2.page, TASK);
  await a.expectStatus(TEXT.offline);
  await b.expectStatus(TEXT.offline);
  expect(await lab.store.value(her, NOTE)).toBe(FIRST);

  // Both reconnect and their saves complete.
  await a.offline(false);
  await a.expectSaved();
  await b.offline(false);
  await b.expectSaved();
  await lab.store.expectValue(her, NOTE, v => v === ON_B, 30_000);

  // Both devices hold the later text whole.
  await a.page.reload({ waitUntil: "load" });
  await expect.poll(() => lesson.noteText(a.page).catch(() => null), { timeout: 60_000 }).toBe(ON_B);
  await b.page.reload({ waitUntil: "load" });
  await expect.poll(() => lesson.noteText(b.page).catch(() => null), { timeout: 60_000 }).toBe(ON_B);

  // A clean third device holds the same text, and the task keeps both attempts.
  const c = await lab.device();
  await c.open(lesson.HOME);
  expect(await c.stored(NOTE)).toBeNull();
  await c.signIn(her);
  await expect.poll(() => c.stored(NOTE).catch(() => null), { timeout: 30_000 }).toBe(ON_B);
  await c.open(lesson.LESSON_READING_WRITING);
  await expect.poll(() => lesson.noteText(c.page).catch(() => null), { timeout: 30_000 }).toBe(ON_B);
  await c.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(c.page.locator(`[data-task="${TASK}"]`)).toHaveAttribute("data-done", "1", { timeout: 30_000 });
  await expect.poll(async () => {
    try { return (await lesson.taskView(c.page, TASK)).history.slice().sort(); } catch { return null; }
  }, { timeout: 30_000 }).toEqual(["3/5", "5/5"]);
});
