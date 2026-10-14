/* AC-22: signing out on a shared device leaves nothing of hers on screen or
   readable in the browser's storage — tasks, writing, note, highlight,
   progress, days and the account email all go, and signing in again brings
   every one of them back. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

const NOTE = "scribe AC-22 note: the fish stayed three days";
const WRITING = "Hi Mai, I enjoy fishing with my grandfather at the weekend. We get up early and walk to the "
  + "river near our house. He teaches me how to hold the rod and wait quietly. Sometimes we do not catch "
  + "anything, but I do not mind because we talk a lot. After that we cook lunch together and my mother "
  + "says the fish tastes better when I help. I would like you to come with us one day because I think "
  + "you will love it too. Write back soon, Lan.";
const WRITING_PHRASE = "tastes better when I help";

test("test_learn_anywhere_AC22_sign_out_clears_everything_of_hers", async ({ lab }) => {
  test.setTimeout(240_000);
  const her = lab.account();
  const a = await lab.device();

  // tasks and progress: a task answered, the lesson marked finished
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  const taskId = await lesson.answerTask(a.page);
  const given = (await lesson.taskView(a.page, taskId)).given;
  await a.expectSaved();
  await lesson.markLessonFinished(a.page);

  // a note, a highlight, the timed reading taken, and a piece of writing
  await a.open(lesson.LESSON_READING_WRITING);
  await lesson.startTimedReading(a.page);
  await lesson.addNote(a.page, NOTE);
  await lesson.addHighlight(a.page, 0);
  await lesson.finishTimedReading(a.page);
  const timedId = (await lesson.timedTaskIds(a.page))[0];
  await lesson.startTimedWriting(a.page);
  await lesson.typeWriting(a.page, WRITING);
  await lesson.handInWriting(a.page);
  await a.expectSaved();

  // all of it saved
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(taskId));
  await lab.store.expectValue(her, "en8:write:v1", v => !!v && v.includes(WRITING_PHRASE));
  await lab.store.expectValue(her, "en8:notes:01-4-p1", v => v === NOTE);
  await lab.store.expectValue(her, "en8:marks:01-4-p1", v => !!v && JSON.parse(v).length === 1);
  await lab.store.expectValue(her, "en8:progress:v1", v => !!v && !!JSON.parse(v)["01"]?.lessons?.["1"]);
  await lab.store.expectValue(her, "en8:days:v1", v => !!v && v.includes("01:L1"));

  // before sign-out: everything is on the page and in the day record
  await a.home();
  await expect(a.days).toContainText("task answered");
  await expect(a.days).toContainText("piece of writing");
  await a.open(lesson.LESSON_READING_WRITING);
  await lesson.expectTaskDone(a.page, timedId);
  expect(await lesson.highlightCount(a.page)).toBe(1);
  expect(await lesson.noteText(a.page)).toBe(NOTE);
  expect(await lesson.writingDrafts(a.page)).toContain(WRITING);
  await expect(a.page.getByText(her.email).first()).toBeVisible();

  // sign out: the page is drawn again with nothing of hers
  const draws = a.draws();
  await a.signOut();
  await expect.poll(() => a.drawsSince(draws)).toBeGreaterThan(0);
  await lesson.expectTaskNotDone(a.page, timedId);
  await expect.poll(() => lesson.highlightCount(a.page)).toBe(0);
  expect(await lesson.noteText(a.page)).toBeNull();
  expect(await lesson.writingText(a.page)).toBe("");
  expect(await lesson.writingDrafts(a.page)).toEqual([]);
  await expect(a.page.getByText(her.email)).toHaveCount(0);
  await expect(a.signOutButton).toBeHidden();

  // none of those values can be read from the browser's storage
  const text = await a.storageText();
  expect(text).not.toContain(NOTE);
  expect(text).not.toContain(WRITING_PHRASE);
  expect(text).not.toContain(taskId);
  expect(text).not.toContain("01:L1");
  expect(text).not.toContain('"lessons"');
  expect(await a.stored("en8:marks:01-4-p1")).toBeNull();
  expect(await a.stored("en8:notes:01-4-p1")).toBeNull();

  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskNotDone(a.page, taskId);
  expect(await lesson.lessonFinished(a.page)).toBe(false);
  await expect(a.page.getByText(her.email)).toHaveCount(0);
  await a.home();
  await expect(a.days).not.toContainText("task answered");
  await expect(a.days).not.toContainText("piece of writing");
  await expect(a.days).not.toContainText("you worked on");

  // signing in again brings all of them back
  await a.open(lesson.LESSON_READING_WRITING);
  await a.signIn(her);
  await lesson.expectTaskDone(a.page, timedId);
  await expect.poll(() => lesson.highlightCount(a.page)).toBe(1);
  await expect.poll(() => lesson.noteText(a.page)).toBe(NOTE);
  await expect.poll(() => lesson.writingDrafts(a.page)).toContain(WRITING);
  await expect(a.page.getByText(her.email).first()).toBeVisible();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskDone(a.page, taskId);
  expect((await lesson.taskView(a.page, taskId)).given).toEqual(given);
  await expect(async () => { expect(await lesson.lessonFinished(a.page)).toBe(true); }).toPass({ timeout: 20_000 });
  await a.home();
  await expect(a.days).toContainText("task answered");
  await expect(a.days).toContainText("piece of writing");
});
