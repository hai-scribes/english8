/* AC-29: work done on the device while nobody was signed in joins an account
   only when agreed. The page asks once, in the page and not in a browser
   dialog, with "Add it" and "Keep it separate"; "Keep it separate" leaves the
   work out of every device of the account and puts it back on the page after
   sign-out; "Add it" saves it to the account. */
import { test, expect, TEXT, type Device } from "./support/harness";
import * as lesson from "./support/driver";

const SIGNED_OUT_TASK = "01-1-1.1-1";
const OWN_TASK = "01-1-1.2-1";

/* Counts browser dialogs (alert / confirm / prompt) the page opens. */
function countDialogs(d: Device): { n: number } {
  const c = { n: 0 };
  d.page.on("dialog", async dialog => { c.n++; await dialog.dismiss(); });
  return c;
}

test("test_learn_anywhere_AC29_signed_out_work_joins_an_account_only_when_agreed", async ({ lab }) => {
  test.setTimeout(200_000);
  const her = lab.account();

  /* ---- "Keep it separate" -------------------------------------------------- */
  const a = await lab.device();
  const dialogsA = countDialogs(a);
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.answerTask(a.page, SIGNED_OUT_TASK);
  const question = a.page.getByText(TEXT.question);
  await expect(question).toHaveCount(0);

  await a.signIn(her);
  await expect(question).toHaveCount(1);
  await expect(question).toBeVisible();
  await expect(a.addItButton).toBeVisible();
  await expect(a.keepSeparateButton).toBeVisible();
  expect(dialogsA.n).toBe(0);

  await a.keepSeparateButton.click();
  await expect(question).toBeHidden();
  await expect(a.addItButton).toBeHidden();
  await expect(a.keepSeparateButton).toBeHidden();
  await lesson.expectTaskNotDone(a.page, SIGNED_OUT_TASK);
  // asked once: opening the page again does not ask again
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(question).toHaveCount(0);
  await lesson.expectTaskNotDone(a.page, SIGNED_OUT_TASK);

  // left out of every device of the account
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);
  await lesson.answerTask(b.page, OWN_TASK);
  await b.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(OWN_TASK));
  expect(await lab.store.value(her, "en8:tasks:v1")).not.toContain(SIGNED_OUT_TASK);
  await lesson.expectTaskNotDone(b.page, SIGNED_OUT_TASK);

  // and put back on the page after sign-out
  await a.signOut();
  await lesson.expectTaskDone(a.page, SIGNED_OUT_TASK);
  expect(dialogsA.n).toBe(0);

  /* ---- "Add it" ----------------------------------------------------------- */
  const c = await lab.device();
  const dialogsC = countDialogs(c);
  await c.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.answerTask(c.page, SIGNED_OUT_TASK);
  const given = (await lesson.taskView(c.page, SIGNED_OUT_TASK)).given;
  const questionC = c.page.getByText(TEXT.question);
  await expect(questionC).toHaveCount(0);

  await c.signIn(her);
  await expect(questionC).toHaveCount(1);
  await expect(questionC).toBeVisible();
  expect(dialogsC.n).toBe(0);
  await c.addItButton.click();
  await expect(questionC).toBeHidden();
  await lesson.expectTaskDone(c.page, SIGNED_OUT_TASK);
  await c.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(SIGNED_OUT_TASK));
  expect(dialogsC.n).toBe(0);

  // saved to the account: the other device now shows it
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(async () => { await lesson.expectTaskDone(b.page, SIGNED_OUT_TASK); }).toPass({ timeout: 30_000 });
  expect((await lesson.taskView(b.page, SIGNED_OUT_TASK)).given).toEqual(given);
});
