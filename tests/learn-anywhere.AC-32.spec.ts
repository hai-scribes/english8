/* AC-32: a removed highlight stays removed — after its own save and after a
   later save of something else — on this device and on the account's other
   devices. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

const MARKS = "en8:marks:01-4-p1";
const NOTE = "scribe AC-32: something else saved after the removal";

test("test_learn_anywhere_AC32_removed_highlight_stays_removed", async ({ lab }) => {
  test.setTimeout(200_000);
  const her = lab.account();

  // device A: two highlights on the passage, saved
  const a = await lab.device();
  await a.open(lesson.LESSON_READING_WRITING);
  await a.signIn(her);
  await lesson.startTimedReading(a.page);
  await lesson.addHighlight(a.page, 0);
  await lesson.addHighlight(a.page, 1);
  await lesson.finishTimedReading(a.page);
  expect(await lesson.highlightCount(a.page)).toBe(2);
  await a.expectSaved();
  await lab.store.expectValue(her, MARKS, v => !!v && JSON.parse(v).length === 2);

  // the other device holds both
  const b = await lab.device();
  await b.open(lesson.LESSON_READING_WRITING);
  await b.signIn(her);
  await expect(async () => { expect(await lesson.highlightCount(b.page)).toBe(2); }).toPass({ timeout: 30_000 });

  // A removes one; the save completes
  let mark = a.mark();
  await lesson.removeHighlight(a.page, 0);
  expect(await lesson.highlightCount(a.page)).toBe(1);
  await expect.poll(() => a.writesSince(mark).some(r => r.code >= 200 && r.code < 300), { timeout: 20_000 }).toBe(true);
  await a.expectSaved();

  // a later save of anything else completes
  mark = a.mark();
  await lesson.addNote(a.page, NOTE);
  await expect.poll(() => a.writesSince(mark).some(r => r.code >= 200 && r.code < 300), { timeout: 20_000 }).toBe(true);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:notes:01-4-p1", v => v === NOTE);

  // one highlight remains on this device
  await expect(async () => { expect(await lesson.highlightCount(a.page)).toBe(1); }).toPass({ timeout: 30_000 });
  await a.open(lesson.LESSON_READING_WRITING);
  await expect(async () => { expect(await lesson.highlightCount(a.page)).toBe(1); }).toPass({ timeout: 30_000 });
  await lab.store.expectValue(her, MARKS, v => !!v && JSON.parse(v).length === 1);

  // and on the account's other devices
  await b.open(lesson.LESSON_READING_WRITING);
  await expect(async () => { expect(await lesson.highlightCount(b.page)).toBe(1); }).toPass({ timeout: 30_000 });
  const c = await lab.device();
  await c.open(lesson.LESSON_READING_WRITING);
  await c.signIn(her);
  const timedId = (await lesson.timedTaskIds(c.page))[0];
  await lesson.expectTaskDone(c.page, timedId);
  await expect(async () => { expect(await lesson.highlightCount(c.page)).toBe(1); }).toPass({ timeout: 30_000 });
});
