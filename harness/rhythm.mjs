/* "Save progress, daily, weekly works."
 *
 * Two halves, and the second is a constraint rather than a feature.
 *
 * WHAT IS BUILT: the work a learner does is recorded against the DAY it was
 * done, those days roll up into a week, and both travel with the account. The
 * clock is overridden in the browser (not in the product) so two different
 * days can be exercised inside one run — a harness that cannot move the date
 * can only ever check that today exists, which is the half that never breaks.
 *
 * WHAT MUST NOT BE BUILT: a streak, a score, or a comparison. That is not a
 * preference — `tools/assets/app.js` states it as a rule over the reading log
 * ("What it must never become: a score, a band, a reading rate, a
 * words-per-minute, a streak or a comparison with anyone"), and the repo-wide
 * rule in CLAUDE.md forbids band numbers and progress dials outright. A daily
 * record is the natural place for a streak counter to appear, so this gate
 * scans the rendered page for one. Recording what was done is the feature;
 * gamifying it is the defect.
 */
import { metric, gate, finish } from "./lib.mjs";
import { launch, device, url, aLessonPath, signIn, answerFirstTask, localState, waitSynced , portsError } from "./browser.mjs";

const problems = [];
let swept = 0, forbidden = 0;
const LESSON = aLessonPath();
const browser = await launch();

/* Fixed dates so the assertion is a string comparison, not arithmetic. Both
 * are weekdays in the same ISO week. */
const DAY_ONE = "2026-09-08T10:00:00";   // Tuesday
const DAY_TWO = "2026-09-10T10:00:00";   // Thursday, same week

async function atDate(iso) {
  const d = await device(browser);
  await d.page.addInitScript(`{
    const fixed = new Date(${JSON.stringify(iso)}).getTime();
    const Real = Date;
    const shift = fixed - Real.now();
    class FakeDate extends Real {
      constructor(...a) { super(...(a.length ? a : [Real.now() + shift])); }
      static now() { return Real.now() + shift; }
    }
    globalThis.Date = FakeDate;
  }`);
  return d;
}

/* Anything that looks like a streak or a score, in the page's visible text. */
const FORBIDDEN = [
  /\b\d+\s*[- ]?day\s+streak\b/i, /\bstreak\b/i, /\bday\s+\d+\s+in\s+a\s+row\b/i,
  /\b\d+\s*%\s*(complete|mastered|accuracy)\b/i, /\bband\s*[0-9](\.[05])?\b/i,
];

try {
  if (portsError) throw portsError;
  /* --- day one: do work, it lands under that date -------------------- */
  const A = await atDate(DAY_ONE);
  await A.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  await signIn(A.page, "learner@example.com");
  await answerFirstTask(A.page);
  await waitSynced(A.page);
  swept++;
  const one = JSON.stringify(await localState(A.page));
  if (!one.includes("2026-09-08")) {
    problems.push("work done on 2026-09-08 is not recorded against that date anywhere in local state");
  }

  /* --- day two, SAME account, SAME week: a second day, not an overwrite */
  const B = await atDate(DAY_TWO);
  await B.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  await signIn(B.page, "learner@example.com");
  await waitSynced(B.page);
  await answerFirstTask(B.page);
  await waitSynced(B.page);
  swept++;
  const two = JSON.stringify(await localState(B.page));
  if (!two.includes("2026-09-08")) problems.push("day one's record did not survive into day two — the log is being overwritten, not appended");
  if (!two.includes("2026-09-10")) problems.push("work done on 2026-09-10 is not recorded against that date");

  /* --- the week is a real rollup, visible on the page ----------------- */
  swept++;
  const rhythm = await B.page.locator("[data-en8-rhythm]").count();
  if (!rhythm) problems.push("no [data-en8-rhythm] region — the daily/weekly record is stored but never shown");
  else {
    const txt = await B.page.locator("[data-en8-rhythm]").first().innerText().catch(() => "");
    if (!/\b2\b/.test(txt)) problems.push(`the weekly view does not reflect two days of work — it reads ${JSON.stringify(txt.slice(0, 120))}`);
  }

  /* --- and it must not have become a scoreboard ----------------------- */
  swept++;
  const body = await B.page.locator("body").innerText().catch(() => "");
  for (const re of FORBIDDEN) {
    const m = body.match(re);
    if (m) { forbidden++; problems.push(`the page shows ${JSON.stringify(m[0])} — app.js forbids a streak, a score or a comparison over the work log`); }
  }
} catch (e) {
  problems.push(`harness could not exercise the daily/weekly record: ${e.message}`);
} finally {
  await browser.close();
}

for (const p of problems) console.log(`  · ${p}`);
const covered = swept >= 4;
metric("rhythm_days_swept", swept);
metric("rhythm_defects", problems.length);
metric("forbidden_surfaces", forbidden);
finish([
  gate("days swept", covered, `${swept} of 4`),
  gate("no streak, score or comparison", covered && forbidden === 0,
       covered ? `${forbidden} forbidden surface(s)` : "NOT MEASURED"),
  gate("daily and weekly record", covered && problems.length === 0, `${problems.length} problem(s)`),
]);
