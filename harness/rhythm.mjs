/* "Save progress, daily, weekly works."
 *
 * Two halves, and the second is a constraint rather than a feature.
 *
 * WHAT IS BUILT: the work a learner does is recorded against the DAY she did
 * it — her local day, in Quy Nhơn — those days roll up into a week, and both
 * travel with the account. The clock is overridden in the browser (not in the
 * product) so two different days can be exercised inside one run — a harness
 * that cannot move the date can only ever check that today exists, which is
 * the half that never breaks.
 *
 * The times are 06:30 in UTC+7 on purpose: that is 23:30 the PREVIOUS day in
 * UTC, so a build that files work by UTC date puts both sessions under the
 * wrong day and fails here, instead of passing at a comfortable 10:00 and
 * mis-filing every early-morning session she ever does.
 *
 * What is asserted is the page, not the storage format: each day with work on
 * it is an element [data-en8-day="YYYY-MM-DD"] inside [data-en8-rhythm] with
 * visible text. How the record is kept is the variant's business.
 *
 * WHAT MUST NOT BE BUILT: a streak, a score, a comparison — or elapsed time.
 * `tools/assets/app.js` states the first three as a rule over the reading log
 * ("What it must never become: a score, a band, a reading rate, a
 * words-per-minute, a streak or a comparison with anyone"), CLAUDE.md forbids
 * band numbers and progress dials, and the pedagogy base's P1 is that elapsed
 * time is never shown as progress: a slow learner spending longer is the
 * signature of difficulty, not of effort. A daily record is the natural place
 * for all of these to appear, so this gate scans for them — over the whole
 * page for the unambiguous ones, and over the record itself for the words a
 * lesson might legitimately use elsewhere ("minutes", "points").
 */
import { metric, gate, finish } from "./lib.mjs";
import {
  launch, device, url, aLessonPath, signIn, answerTask, waitSynced, mark, portsError,
} from "./browser.mjs";

const LEARNER = "rhythm-learner@example.com";
const problems = [];
let swept = 0, forbidden = 0;
const LESSON = aLessonPath();
const browser = await launch();

/* Local wall-clock times in Asia/Ho_Chi_Minh (the device's timezone). Both are
 * weekdays in the same ISO week. */
const DAY_ONE = "2026-09-08T06:30:00";   // Tuesday  (UTC: Mon 07 23:30)
const DAY_TWO = "2026-09-10T06:30:00";   // Thursday (UTC: Wed 09 23:30)

async function atDate(localIso) {
  const d = await device(browser);
  await d.page.addInitScript(`{
    const fixed = new Date(${JSON.stringify(localIso)}).getTime();
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

/* Anywhere on the page: nothing a lesson would say for another reason. */
const FORBIDDEN_PAGE = [
  /\b\d+\s*[- ]?day\s+streak\b/i, /\bstreaks?\b/i, /\bin\s+a\s+row\b/i,
  /\bdays?\s+running\b/i, /\bkeep\s+(it|the\s+\w+)\s+(up|going|alive)\b/i,
  /\b\d+\s*%\s*(complete|done|mastered|accuracy)\b/i, /\bband\s*[0-9](\.[05])?\b/i,
  /\bchuỗi\b/i, /\bliên\s+tiếp\b/i,
];
/* Inside the record only: words a lesson may use, which the record may not. */
const FORBIDDEN_RECORD = [
  /\b\d+\s*(min|mins|minutes?|hrs?|hours?|seconds?|secs?)\b/i, /\btime\s+(spent|studied)\b/i,
  /\b\d+\s*(of|\/|out\s+of)\s*7\b/i, /\bpoints?\b/i, /\bbadges?\b/i, /\blevel\s+\d+\b/i,
  /\bbest\b/i, /\brecord\s+(high|week)\b/i, /\bphút\b/i, /\bgiờ\b/i, /\bđiểm\b/i,
];

const dayEl = (page, day) => page.locator(`[data-en8-rhythm] [data-en8-day="${day}"]`).first();
async function shows(page, day) {
  const el = dayEl(page, day);
  if (!await el.count()) return false;
  return (await el.innerText().catch(() => "")).trim().length > 0;
}

let step = "starting";
try {
  if (portsError) throw portsError;
  /* --- day one: do work, it lands under that LOCAL date ---------------- */
  const A = await atDate(DAY_ONE);
  await A.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  step = "signing in on day one";
  await signIn(A.page, LEARNER);
  let m = await mark(A.page);
  step = "answering on day one";
  await answerTask(A.page, 0);
  await waitSynced(A.page, { since: m });
  swept++;
  if (!await shows(A.page, "2026-09-08")) {
    problems.push("work done at 06:30 on 2026-09-08 (local) is not shown under that day in [data-en8-rhythm]");
  }
  if (await A.page.locator('[data-en8-rhythm] [data-en8-day="2026-09-07"]').count()) {
    problems.push("06:30 local on 2026-09-08 was filed under 2026-09-07 — the record is keyed by UTC, not by her day");
  }

  /* --- day two, SAME account, ANOTHER device: a second day, appended --- */
  const B = await atDate(DAY_TWO);
  await B.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  m = await mark(B.page);
  step = "signing in on day two";
  await signIn(B.page, LEARNER);
  await waitSynced(B.page, { since: m });
  m = await mark(B.page);
  step = "answering on day two";
  await answerTask(B.page, 1);
  await waitSynced(B.page, { since: m });
  swept++;
  if (!await shows(B.page, "2026-09-08")) problems.push("day one's record is not on the second device on day two — it was overwritten, or it never travelled");
  if (!await shows(B.page, "2026-09-10")) problems.push("work done on 2026-09-10 is not shown under that day");

  /* --- the week is a real rollup, visible on the page ----------------- */
  swept++;
  if (!await B.page.locator("[data-en8-rhythm]").count()) {
    problems.push("no [data-en8-rhythm] region — the daily/weekly record is stored but never shown");
  } else {
    const days = await B.page.locator("[data-en8-rhythm] [data-en8-day]").evaluateAll(
      els => els.map(e => e.getAttribute("data-en8-day")));
    const stray = days.filter(d => !["2026-09-08", "2026-09-10"].includes(d));
    if (stray.length) problems.push(`the record shows work on day(s) nobody worked: ${stray.join(", ")}`);
  }

  /* --- and it must not have become a scoreboard or a stopwatch -------- */
  swept++;
  const body = await B.page.locator("body").innerText().catch(() => "");
  const record = await B.page.locator("[data-en8-rhythm]").first().innerText().catch(() => "");
  for (const [text, list, where] of [[body, FORBIDDEN_PAGE, "the page"], [record, FORBIDDEN_RECORD, "the record"]]) {
    for (const re of list) {
      const hit = text.match(re);
      if (hit) {
        forbidden++;
        problems.push(`${where} shows ${JSON.stringify(hit[0])} — a streak, a score, a comparison or time spent, which the record must never become`);
      }
    }
  }
} catch (e) {
  problems.push(`harness could not exercise the daily/weekly record: while ${step}: ${e.message.split("\n")[0]}`);
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
  gate("no streak, score, comparison or time spent", covered && forbidden === 0,
       covered ? `${forbidden} forbidden surface(s)` : "NOT MEASURED"),
  gate("daily and weekly record", covered && problems.length === 0, `${problems.length} problem(s)`),
]);
