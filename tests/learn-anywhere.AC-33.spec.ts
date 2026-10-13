/* AC-33: a lesson un-marked after it was marked finished stays un-marked —
   the finished record and the day's path step are gone on this device and
   on the account's other devices once the save completes. */
import { test, expect, type Device } from "./support/harness";
import * as lesson from "./support/driver";

const STEP = "01:L1";

async function todaysSteps(d: Device): Promise<string[]> {
  const days = JSON.parse((await d.stored("en8:days:v1")) || "{}");
  const today = String(await lesson.browserTodayNum(d.page));
  return (days[today] && days[today].steps) || [];
}

test("test_learn_anywhere_AC33_unfinished_lesson_stays_unfinished", async ({ lab }) => {
  test.setTimeout(200_000);
  const her = lab.account();

  // device A: Lesson 1 marked finished and saved, its step in today's record
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await lesson.markLessonFinished(a.page);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:progress:v1", v => !!v && !!JSON.parse(v)["01"]?.lessons?.["1"]);
  await lab.store.expectValue(her, "en8:days:v1", v => !!v && v.includes(STEP));
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  expect(await lesson.lessonFinished(a.page)).toBe(true);
  expect(await todaysSteps(a)).toContain(STEP);

  // the other device has received both
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await b.signIn(her);
  await expect(async () => { expect(await lesson.lessonFinished(b.page)).toBe(true); }).toPass({ timeout: 30_000 });
  await expect(async () => { expect(await todaysSteps(b)).toContain(STEP); }).toPass({ timeout: 30_000 });

  // the lesson is un-marked on A and the save completes
  const mark = a.mark();
  await lesson.storedUnmarkLessonFinished(a.page);
  expect(await lesson.lessonFinished(a.page)).toBe(false);
  expect(await todaysSteps(a)).not.toContain(STEP);
  await expect.poll(() => a.writesSince(mark).some(r => r.code >= 200 && r.code < 300), { timeout: 20_000 }).toBe(true);
  await a.expectSaved();
  await lab.store.expectValue(her, "en8:progress:v1", v => !!v && !JSON.parse(v)["01"]?.lessons?.["1"]);
  await lab.store.expectValue(her, "en8:days:v1", v => !!v && !v.includes(STEP));

  // not marked finished, step absent, on this device after it syncs again
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(async () => { expect(await lesson.lessonFinished(a.page)).toBe(false); }).toPass({ timeout: 30_000 });
  expect(await todaysSteps(a)).not.toContain(STEP);

  // and on the account's other devices
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await expect(async () => { expect(await lesson.lessonFinished(b.page)).toBe(false); }).toPass({ timeout: 30_000 });
  await expect(async () => { expect(await todaysSteps(b)).not.toContain(STEP); }).toPass({ timeout: 30_000 });
  const c = await lab.device();
  await c.open(lesson.LESSON_WITH_INSTANT_TASK);
  await c.signIn(her);
  await c.expectAuth("signed-in");
  await expect(async () => { expect(await c.stored("en8:days:v1")).not.toBeNull(); }).toPass({ timeout: 30_000 });
  expect(await lesson.lessonFinished(c.page)).toBe(false);
  expect(await todaysSteps(c)).not.toContain(STEP);
});
