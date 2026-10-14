/* AC-23: a sign-out that cannot save — offline, or a save that does not
   finish within six seconds — holds the unsaved work on the device: the user
   is signed out within six seconds, no task shows as done, the status says
   the work is kept, the held work is not readable as plain text, and signing
   in again shows it and sends it to the account's other devices.
   Both variants are run in turn: offline first, then a save held open. */
import { test, expect, TEXT, type Device } from "./support/harness";
import * as lesson from "./support/driver";

/* Clicks Sign out and returns how long the page took to sign out. */
async function signOutTimed(a: Device): Promise<number> {
  const t0 = Date.now();
  await a.signOutButton.click();
  await expect(a.html).toHaveAttribute("data-auth", "signed-out", { timeout: 7_000 });
  return Date.now() - t0;
}

test("test_learn_anywhere_AC23_sign_out_that_cannot_save_holds_the_work", async ({ lab }) => {
  test.setTimeout(200_000);
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.workerReady();

  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);

  /* ---- offline ---------------------------------------------------------- */
  await a.offline(true);
  const first = await lesson.answerTask(a.page, "01-1-1.1-1");
  await lesson.expectTaskDone(a.page, first);
  const firstGiven = (await lesson.taskView(a.page, first)).given;

  const tookOffline = await signOutTimed(a);
  expect(tookOffline).toBeLessThanOrEqual(6_500);
  await lesson.expectTaskNotDone(a.page, first);
  await a.expectStatus(TEXT.held);
  const heldText = await a.storageText();
  expect(heldText).not.toContain(first);
  expect(heldText).not.toContain('"given"');
  for (const g of firstGiven) expect(heldText).not.toContain(JSON.stringify(g));

  // signed in again, with a connection: the task is shown and reaches the other device
  await a.offline(false);
  await lesson.expectTaskNotDone(a.page, first);
  await a.signIn(her);
  await lesson.expectTaskDone(a.page, first);
  expect((await lesson.taskView(a.page, first)).given).toEqual(firstGiven);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(first));
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(async () => { await lesson.expectTaskDone(b.page, first); }).toPass({ timeout: 30_000 });

  /* ---- the save does not finish within six seconds ----------------------- */
  await a.holdSaves(true);
  const second = await lesson.answerTask(a.page, "01-1-1.2-1");
  const secondGiven = (await lesson.taskView(a.page, second)).given;
  await a.expectStatus(TEXT.saving);

  const tookHeld = await signOutTimed(a);
  expect(tookHeld).toBeLessThanOrEqual(6_500);
  await lesson.expectTaskNotDone(a.page, second);
  await a.expectStatus(TEXT.held);
  const heldText2 = await a.storageText();
  expect(heldText2).not.toContain(second);
  expect(heldText2).not.toContain('"given"');

  await a.holdSaves(false);
  await a.signIn(her);
  await lesson.expectTaskDone(a.page, second);
  expect((await lesson.taskView(a.page, second)).given).toEqual(secondGiven);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(second));
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(async () => { await lesson.expectTaskDone(b.page, second); }).toPass({ timeout: 30_000 });
});
