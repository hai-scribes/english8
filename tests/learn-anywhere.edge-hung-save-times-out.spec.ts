import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

/* Edge case (AC-11, AC-41): a save the backend never answers is a failed
   save. call() in sync.js has no deadline, so one request held open leaves
   running !== null for the life of the page: the status reads "Saving…"
   forever, no retry is ever scheduled, and every later change only sets
   `again` behind a promise that does not settle. */

test("test_learn_anywhere_EDGE_unanswered_save_is_reported_as_failed", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();
  const a = await lab.device({ at: new Date() });
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.expectSaved();

  await a.holdSaves(true);               // writes are held open, never answered
  const id = await lesson.answerTask(a.page);
  await a.expectStatus(TEXT.saving);

  await a.advance(120_000);              // two minutes of the device's clock
  await a.expectStatus(TEXT.failed);     // it must stop claiming to be saving

  // and the work still gets there once the backend answers again
  await a.holdSaves(false);
  await a.advance(10_000);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(id));
});
