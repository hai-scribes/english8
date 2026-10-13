/* AC-34: read-again rounds run on two devices are not merged by position —
   rounds 1 and 2 on A plus round 1 on B make two rounds finished, not
   three, on both devices. */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

const FLUENCY = "02-4-f1";
const KEY = `en8:fluency:${FLUENCY}`;

test("test_learn_anywhere_AC34_read_again_rounds_are_not_merged_by_position", async ({ lab }) => {
  test.setTimeout(200_000);
  const her = lab.account();

  const a = await lab.device();
  await a.open(lesson.pagePaths.LESSON_READ_AGAIN);
  await a.signIn(her);
  await a.workerReady();
  const b = await lab.device();
  await b.open(lesson.pagePaths.LESSON_READ_AGAIN);
  await b.signIn(her);
  await b.workerReady();
  expect(await lesson.readAgainRounds(a.page, FLUENCY)).toBe(0);
  expect(await lesson.readAgainRounds(b.page, FLUENCY)).toBe(0);

  // each device runs its rounds without seeing the other's
  await a.offline(true);
  await b.offline(true);
  await lesson.finishReadAgainRound(a.page, FLUENCY);
  await lesson.finishReadAgainRound(a.page, FLUENCY);
  expect(await lesson.readAgainRounds(a.page, FLUENCY)).toBe(2);
  await lesson.finishReadAgainRound(b.page, FLUENCY);
  expect(await lesson.readAgainRounds(b.page, FLUENCY)).toBe(1);

  // both saves complete
  await a.offline(false);
  await a.expectSaved(40_000);
  await b.offline(false);
  await b.expectSaved(40_000);
  await lab.store.expectValue(her, KEY, v => !!v && JSON.parse(v).length === 2);

  // both devices show two rounds finished, not three
  await a.open(lesson.pagePaths.LESSON_READ_AGAIN);
  await expect(async () => { expect(await lesson.readAgainRounds(a.page, FLUENCY)).toBe(2); }).toPass({ timeout: 30_000 });
  await b.open(lesson.pagePaths.LESSON_READ_AGAIN);
  await expect(async () => { expect(await lesson.readAgainRounds(b.page, FLUENCY)).toBe(2); }).toPass({ timeout: 30_000 });
  expect(JSON.parse((await a.stored(KEY)) || "[]")).toHaveLength(2);
  expect(JSON.parse((await b.stored(KEY)) || "[]")).toHaveLength(2);
});
