/* AC-20: while a timed test runs, nothing of this feature is on the page —
   not the account controls, the sync status, "Your days" or the question —
   the page is not drawn again when work arrives or a save lands, saving goes
   on unseen, and everything returns with the current state when the test
   ends. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

const NOTE = "scribe AC-20: a note made during the test";
const rx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("test_learn_anywhere_AC20_timed_test_shows_only_the_test", async ({ lab }) => {
  test.setTimeout(180_000);
  const her = lab.account();

  // device A: signed in, with a save behind it so the status is known to show
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await lesson.answerTask(a.page);
  await a.expectSaved();

  // device B: the other device that will send work during the test
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);

  // before the test: the account controls and the status are on the page
  await a.open(lesson.LESSON_READING_WRITING);
  await expect(a.signOutButton).toBeVisible();
  await expect(a.page.getByText(her.email).first()).toBeVisible();
  await expect(a.status).toBeAttached();
  const question = a.page.getByText(TEXT.question);

  await lesson.startTimedReading(a.page);
  const drawsAtStart = a.draws();
  const mark = a.mark();

  // during the test: none of it is visible
  await expect(a.signOutButton).toBeHidden();
  await expect(a.signInButton).toBeHidden();
  await expect(a.page.getByText(her.email)).toBeHidden();
  await expect(a.status).toBeHidden();
  await expect(a.days).toBeHidden();
  await expect(a.addItButton).toBeHidden();
  await expect(a.keepSeparateButton).toBeHidden();
  await expect(question).toBeHidden();

  // a save succeeds during the test, and is never shown
  await lesson.addNote(a.page, NOTE);
  await lab.store.expectValue(her, "en8:notes:01-4-p1", v => v === NOTE);
  const writes = a.writesSince(mark);
  expect(writes.length).toBeGreaterThan(0);
  for (const w of writes) expect(w.status).toBe("");
  await expect(a.status).toBeHidden();
  expect(a.drawsSince(drawsAtStart)).toBe(0);
  expect(await lesson.timedTestRunning(a.page)).toBe(true);

  // work arrives from the other device
  await lesson.answerTask(b.page, "01-1-1.2-1");
  await b.expectSaved();
  await a.returnToTab();
  await a.page.waitForTimeout(2_000);
  expect(a.drawsSince(drawsAtStart)).toBe(0);
  expect(await lesson.timedTestRunning(a.page)).toBe(true);
  await expect(a.signOutButton).toBeHidden();
  await expect(a.status).toBeHidden();
  await expect(a.page.getByText(her.email)).toBeHidden();
  await expect(a.days).toBeHidden();
  await expect(question).toBeHidden();
  for (const w of a.writesSince(mark)) expect(w.status).toBe("");

  // the test ends: everything returns, showing the current state
  await lesson.finishTimedReading(a.page);
  await expect(a.signOutButton).toBeVisible();
  await expect(a.page.getByText(her.email).first()).toBeVisible();
  await expect(a.status).toBeVisible({ timeout: 20_000 });
  await expect(a.status).toHaveText(new RegExp(`^(${rx(TEXT.saved)}|${rx(TEXT.laterDraw)})$`), { timeout: 20_000 });
});
