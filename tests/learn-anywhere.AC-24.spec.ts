/* AC-24: a note removed while offline, followed by a sign-out and a later
   sign-in, stays removed — on this device, on the account's other devices,
   and on a clean device that syncs afterwards. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

const NOTE = "scribe AC-24: this note will be removed offline";
const KEY = "en8:notes:01-4-p1";

test("test_learn_anywhere_AC24_deletions_survive_offline_sign_out", async ({ lab }) => {
  test.setTimeout(200_000);
  const her = lab.account();

  // device A: a note, saved
  const a = await lab.device();
  await a.open(lesson.LESSON_READING_WRITING);
  await a.signIn(her);
  await lesson.startTimedReading(a.page);
  await lesson.addNote(a.page, NOTE);
  await lesson.finishTimedReading(a.page);
  await a.expectSaved();
  await lab.store.expectValue(her, KEY, v => v === NOTE);

  // device B: another device of the account, holding the note
  const b = await lab.device();
  await b.open(lesson.LESSON_READING_WRITING);
  await b.signIn(her);
  await expect(async () => { expect(await lesson.noteText(b.page)).toBe(NOTE); }).toPass({ timeout: 30_000 });

  // A removes the note offline and signs out
  await a.offline(true);
  expect(await lesson.noteText(a.page)).toBe(NOTE);
  await lesson.removeNote(a.page);
  expect(await lesson.noteText(a.page)).toBeNull();
  await a.signOutButton.click();
  await a.expectAuth("signed-out");

  // later, with a connection, A signs in again: the note is absent here
  await a.offline(false);
  await a.signIn(her);
  await a.expectSaved();
  await expect(async () => { expect(await lesson.noteText(a.page)).toBeNull(); }).toPass({ timeout: 30_000 });
  await a.open(lesson.LESSON_READING_WRITING);
  await expect(async () => { expect(await lesson.noteText(a.page)).toBeNull(); }).toPass({ timeout: 30_000 });
  await lab.store.expectValue(her, KEY, v => v === "" || v === null);

  // on the other device
  await b.open(lesson.LESSON_READING_WRITING);
  await expect(async () => { expect(await lesson.noteText(b.page)).toBeNull(); }).toPass({ timeout: 30_000 });

  // and on a clean device that syncs afterwards
  const c = await lab.device();
  await c.open(lesson.LESSON_READING_WRITING);
  await c.signIn(her);
  const timedId = (await lesson.timedTaskIds(c.page))[0];
  await lesson.expectTaskDone(c.page, timedId);
  await expect(async () => { expect(await lesson.noteText(c.page)).toBeNull(); }).toPass({ timeout: 30_000 });
});
