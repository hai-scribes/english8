/* Edge case on AC-29: the question about signed-out work is a card in the
   page, not a modal. Work she does while it is still open (a key that did not
   exist when it appeared) is neither held back nor sent: it must reach the
   account once she answers "Add it". */
import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

const BEFORE_TASK = "01-1-1.1-1";
const DURING_KEY = "en8:notes:edge-during-question";

test("test_learn_anywhere_EC1_work_done_while_the_question_is_open_is_saved_with_add_it", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.answerTask(a.page, BEFORE_TASK);

  await a.signIn(her);                       // the question stays on the page
  await expect(a.addItButton).toBeVisible();

  // she carries on working while the card is still there
  await a.setStored(DURING_KEY, "written while the question was open");
  await a.addItButton.click();
  await a.expectSaved();

  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes(BEFORE_TASK));
  // the later work reaches the account too, not only what was there at sign-in
  expect(await lab.store.value(her, DURING_KEY)).toBe("written while the question was open");
});
