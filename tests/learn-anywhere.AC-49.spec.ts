import { test, expect, TEXT, type Device } from "./support/harness";
import * as lesson from "./support/driver";

type Locator = Device["status"];

/* AC-49: the feature's controls work by keyboard and screen reader. The sync
   status is a polite live region (one of them, so a change is announced
   once); each named control is reached by Tab, shows a visible focus ring and
   carries its accessible name; the question about signed-out work takes focus
   when it appears and gives it back when answered; "Your days" is a labelled
   region with a heading and a list per week. */

type Ring = { outline: boolean; shadow: boolean };

function ring(target: Locator): Promise<Ring> {
  return target.evaluate(el => {
    const s = getComputedStyle(el);
    return {
      outline: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0,
      shadow: s.boxShadow !== "none" && s.boxShadow !== "",
    };
  });
}

async function isFocused(target: Locator): Promise<boolean> {
  return target.evaluate(el => el === document.activeElement).catch(() => false);
}

/** Press Tab until the control has focus. */
async function tabTo(d: Device, target: Locator, what: string, max = 80): Promise<void> {
  for (let i = 0; i < max; i++) {
    await d.page.keyboard.press("Tab");
    if (await isFocused(target)) return;
  }
  throw new Error(`"${what}" was not reached by Tab in ${max} presses`);
}

/** Tab to the control, then check it: focused, named, and showing a focus ring it did not show at rest. */
async function reachAndCheck(d: Device, target: Locator, name: string): Promise<void> {
  await expect(target).toBeVisible();
  await expect(target).toHaveAccessibleName(name);
  const rest = await ring(target);
  await tabTo(d, target, name);
  await expect(target).toBeFocused();
  const on = await ring(target);
  expect(on.outline || on.shadow, `"${name}" shows a focus ring`).toBe(true);
  expect(on, `"${name}" looks different focused than at rest`).not.toEqual(rest);
}

function activeName(d: Device): Promise<string> {
  return d.page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return "";
    return (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim();
  });
}

test("test_learn_anywhere_AC49_new_controls_are_usable_by_keyboard_and_screen_reader", async ({ lab }) => {
  test.setTimeout(180_000);
  const her = lab.account();

  const d = await lab.device();
  await d.open(lesson.LESSON_WITH_INSTANT_TASK);
  // Work done while nobody is signed in, so the question will appear at sign-in.
  await lesson.answerTask(d.page, "01-1-1.1-1");

  // The sync status: one polite live region.
  await expect(d.page.getByRole("status", { name: "Sync status" })).toHaveCount(1);
  const live = await d.status.getAttribute("aria-live");
  expect(live === null || live === "polite", 'the status is polite (role=status, or aria-live="polite")').toBe(true);
  expect(await d.status.getAttribute("role")).toBe("status");

  // "Sign in with Google" by Tab, with a ring and its name; Enter starts sign-in.
  await d.page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await reachAndCheck(d, d.signInButton, "Sign in with Google");
  const question = d.page.getByText(TEXT.question);
  await expect(question).toHaveCount(0);
  const [popup] = await Promise.all([d.page.waitForEvent("popup"), d.page.keyboard.press("Enter")]);
  await d.completeSignIn(popup, her);
  await d.expectAuth("signed-in");

  // The question appears in the page and takes focus.
  await expect(question).toBeVisible();
  const box = question.locator("xpath=ancestor-or-self::*[.//button[normalize-space()='Add it']][1]");
  await expect(box).toHaveCount(1);
  await expect.poll(() => box.evaluate(el => el === document.activeElement || el.contains(document.activeElement)),
    { timeout: 10_000 }).toBe(true);

  // Its two buttons by Tab, each with a ring and its name.
  await reachAndCheck(d, d.addItButton, "Add it");
  await reachAndCheck(d, d.keepSeparateButton, "Keep it separate");
  await d.page.keyboard.press("Shift+Tab");
  await expect(d.addItButton).toBeFocused();

  // Answered by keyboard: the question goes, focus returns to the account controls, and a save runs.
  await d.page.keyboard.press("Enter");
  await expect(question).toBeHidden();
  await expect(d.addItButton).toBeHidden();
  await expect.poll(() => activeName(d), { timeout: 10_000 }).toMatch(/^(Sign out|Sign in with Google)$/);
  await d.expectSaved();
  await lab.store.expectValue(her, "en8:tasks:v1", v => !!v && v.includes("01-1-1.1-1"));

  // "Sign out" by Tab.
  await d.page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await reachAndCheck(d, d.signOutButton, "Sign out");

  // A failing save shows "Try again": by Tab too.
  await d.failSaves(true);
  await lesson.answerTask(d.page, "01-1-1.2-1");
  await d.expectStatus(TEXT.failed);
  await d.page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await reachAndCheck(d, d.retryButton, "Try again");
  await d.failSaves(false);

  // "Your days": a labelled region with a heading and a list per week.
  await d.open(lesson.HOME);
  await expect(d.days).toHaveCount(1);
  await expect(d.days).toBeVisible();
  await expect(d.days.getByRole("heading", { name: "Your days" })).toHaveCount(1);
  await expect(d.days.getByRole("list").first()).toBeVisible();
  expect(await d.days.getByRole("list").count()).toBeGreaterThanOrEqual(1);
  await expect(d.days.getByRole("listitem").first()).toBeVisible();
});
