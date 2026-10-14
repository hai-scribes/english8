/* AC-31: a device whose clock is two days fast cannot overrule a later change
   made on a device with a correct clock — the later text wins on that device
   and reaches a third. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

const KEY = "en8:notes:01-4-p1";
const EARLY = "scribe AC-31: written first, on the fast clock";
const LATER = "scribe AC-31: changed later, on the correct clock";

test("test_learn_anywhere_AC31_fast_clock_does_not_overrule_later_change", async ({ lab }) => {
  test.setTimeout(200_000);
  const her = lab.account();

  // device A: clock two days ahead; writes and saves the note
  const a = await lab.device({ at: new Date(Date.now() + 2 * 86_400_000) });
  await a.open(lesson.LESSON_READING_WRITING);
  await a.signIn(her);
  await lesson.startTimedReading(a.page);
  await lesson.addNote(a.page, EARLY);
  await lesson.finishTimedReading(a.page);
  await a.expectSaved();
  await lab.store.expectValue(her, KEY, v => v === EARLY);

  // device B: correct clock; has received it
  const b = await lab.device();
  await b.open(lesson.LESSON_READING_WRITING);
  await b.signIn(her);
  await expect(async () => { expect(await lesson.noteText(b.page)).toBe(EARLY); }).toPass({ timeout: 30_000 });

  // the user changes the note on B and the save completes
  const mark = b.mark();
  await lesson.editNote(b.page, LATER);
  await expect.poll(() => b.writesSince(mark).some(r => r.code >= 200 && r.code < 300), { timeout: 20_000 }).toBe(true);
  await b.expectSaved();

  // B keeps the later text, through the sync that follows its save and a fresh load
  await expect(async () => { expect(await lesson.noteText(b.page)).toBe(LATER); }).toPass({ timeout: 30_000 });
  await b.open(lesson.LESSON_READING_WRITING);
  await expect(async () => { expect(await lesson.noteText(b.page)).toBe(LATER); }).toPass({ timeout: 30_000 });
  await lab.store.expectValue(her, KEY, v => v === LATER);

  // a third device receives the later text
  const c = await lab.device();
  await c.open(lesson.LESSON_READING_WRITING);
  await c.signIn(her);
  const timedId = (await lesson.timedTaskIds(c.page))[0];
  await lesson.expectTaskDone(c.page, timedId);
  await expect(async () => { expect(await lesson.noteText(c.page)).toBe(LATER); }).toPass({ timeout: 30_000 });
});
