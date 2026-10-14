# The lesson driver — `tests/support/driver.ts`

Operates the site's own controls the way a learner does. Every function takes a
Playwright `Page` that is already on the page named in the "Needs" column.
Nothing writes localStorage except the three marked **STORED**.

```ts
import * as d from "./support/driver";
await page.goto(d.pagePaths.LESSON_WITH_INSTANT_TASK);
const id = await d.answerTask(page);                 // "01-1-1.1-1", all right
expect((await d.taskView(page, id)).scoreLine).toBe("5 / 5 All right");
```

The driver reads `<script id="page-data">` to know the right answer. All of it was
run against the built site in headless Chromium: every untimed task on all 72
lesson pages and 4 checkpoints (right, then wrong), every timed reading, the
practice bank of all 12 units, a word set of all 12 units, and every non-word
review item.

## Fixture pages and ids

`pagePaths.<NAME>` (the six the brief named are also exported bare: `HOME`,
`LESSON_WITH_INSTANT_TASK`, `LESSON_WORDS`, `LESSON_PRACTICE`,
`LESSON_READING_WRITING`, `LESSON_FLUENCY`).

| Constant | Path | What is on it |
| --- | --- | --- |
| `HOME` | `/index.html` | Today: review card `#reviewCard`, next step `#nextStep` |
| `UNIT` | `/unit-01/index.html` | Practice / Unit test buttons, engine host `#engine` |
| `LESSON_WITH_INSTANT_TASK` | `/unit-01/lesson-1/index.html` | instant tasks `01-1-1.1-1` (5 items), `01-1-1.2-1` (4), `01-1-1.3-1` (4); dialogue `01-1-d1` |
| `LESSON_WORDS` | `/unit-01/lesson-2/index.html` | Meet the words `01-2-v1`: 39 words, 5 sets (8,8,8,8,7); instant tasks `01-2-2.1-1` (12), `01-2-2.2-1` (4, odd-one-out) |
| `LESSON_PRACTICE` / `LESSON_WITH_JOT` | `/unit-01/lesson-3/index.html` | bank `01-3-b1` (10 drawn from 78); jot boxes `01-3-j1-1` … `01-3-j1-4`; no tasks |
| `LESSON_READING_WRITING` | `/unit-01/lesson-4/index.html` | clock `01-4-c1` (17 min); passage `01-4-p1`; timed tasks `01-4-4.1-1` (5, T/F/NG), `01-4-4.2-1` (5), `01-4-4.3-1` (4); writing `01-4-w1` (20 min, 80–100 words) |
| `LESSON_WITH_CONF_TASK` / `LESSON_FLUENCY` | `/unit-01/lesson-5/index.html` | conf tasks `01-5-5.1-1` (5), `01-5-5.2-1` (4); fluency `01-5-f1` (3 rounds, mode talk) |
| `LESSON_READ_AGAIN` | `/unit-02/lesson-4/index.html` | fluency `02-4-f1` (mode read; visible without starting the clock) |
| `LESSON_WITH_TAP_TASK` | `/unit-01/lesson-6/index.html` | instant `01-6-6.1-1` … `01-6-6.4-1`; tap-then-fix `01-6-6.5-1` (6) |
| `LESSON_WITH_TILES_TASK` | `/unit-03/lesson-6/index.html` | tiles `03-6-6.3-3` (4); tap `03-6-6.4-1` (6). Unit 01 has no tile task |
| `LESSON_WITH_THREAD` | `/unit-06/lesson-4/index.html` | strand check "articles" (`[data-th="got"]`, `[data-th="all"]`) |
| `CHECKPOINT` | `/review-1/index.html` | instant `r1-1-1.1-1` … `r1-1-1.5-1`; clock + timed `r1-2-2.1-1` … `r1-2-2.3-1`; conf `r1-2-2.4-1` |
| `STORY`, `WORDS` | `/story/index.html`, `/words/index.html` | not driven; see "Not covered" |

Task kinds found in this build: `instant`, `conf`, `tap`, `tiles`, `timed`.
**No task anywhere is kind `check`** (plain picks with a Check button and no
sure/not-sure) — the driver handles it, but there is no fixture for it.

## Marked tasks — any lesson or checkpoint page

| Function | Does |
| --- | --- |
| `tasksOn(page): Promise<{id, kind, items, done}[]>` | Every marked task, page order. `kind`: `instant` \| `check` \| `tiles` \| `tap` \| `conf` \| `timed`. `done` = `[data-done="1"]`. |
| `answerTask(page, id?, {wrong?: boolean \| number[], sure?: boolean}): Promise<string>` | One complete attempt, committed; waits for `[data-task=ID][data-done="1"]`. No id: first task that is not timed and not done (throws if none). Throws if the task is already done (`tryAgain` first) or has no visible Check (a timed task in or before its test). |
| `fillTask(page, id, {wrong?, sure?, only?: number[]})` | Answers items without pressing Check. Use inside a running timed test. (An instant task still commits itself on its last pick.) |
| `taskView(page, id): Promise<{done, given, marks, scoreLine, history}>` | From the DOM only. See below. |
| `tryAgain(page, id)` | Presses `.t-again`; waits until not done, no item marked, button hidden. |
| `expectTaskDone(page, id)` / `expectTaskNotDone(page, id)` | Auto-retrying. |

How each kind commits:

- **instant** — each pick marks that item at once and locks it; the last pick
  commits. No Check button (it is `hidden`).
- **conf** — pick, then press Sure or Not sure on every item (`sure:false` picks
  Not sure); Check is disabled until all are marked; then Check.
- **tap** — tap a word. Right word: the fix list opens, pick the fix. Then Check.
- **tiles** — tap tiles in order, then Check.
- **timed** — owned by the page's clock. Nothing is marked until *Finish test*.

What `wrong` does per shape: picks → the first option that is not the key;
tap → a word outside the mistake (the item locks, no fix is offered); tiles →
the right tiles in reverse order.

`taskView` fields:

- `given[i]` — picks: the checked option's value (`"Khoa"`, `"F"`); tiles: the
  built sentence (`"Log on before Friday; otherwise, you will …"`); tap:
  `"to → playing"` (tapped word, arrow, fix) or just `"Bống"` when the tap missed;
  `""` if unanswered.
- `marks[i]` — `true` / `false` / `null` (not marked).
- `scoreLine` — exactly `"5 / 5 All right"` or
  `"3 / 5 right — the red ones show the answer"`; `""` before marking.
- `history` — `[]` until there are two attempts, then one entry per attempt,
  oldest first: `["5/5", "3/5"]`. The page lists the last eight.

A reload repaints a committed task identically (`taskView` is equal before and
after).

## Lesson 2 — Meet the words (`LESSON_WORDS`)

| Function | Does |
| --- | --- |
| `wordSets(page): Promise<{set, done, runs}[]>` | One per stack. `done` = green (`.v-stack.ok`). `runs` e.g. `["12/12"]` (last four). Needs the stacks on screen. |
| `finishWordSet(page, {set?, wrong?})` | Opens the first stack not done (or `set`), presses Next through every card, presses Start, answers until the stack is green and the run is listed. Throws when all are done and no `set` is given. |

- A set's run is one question per word plus half as many again: 8 words → 12.
- A right answer moves on by itself after **0.9 s**; a wrong one shows Next. So a
  set takes about 11 s. `wrong` is `true` or `(n) => boolean` on the 0-based
  answer number. A miss brings the word back as a different question (up to
  twice), so the total grows: two misses gave `12/14`.
- "Mixed practice" appears once one set is done; not driven.

## Lesson 3 — the practice bank (`LESSON_PRACTICE`)

| Function | Does |
| --- | --- |
| `finishPracticeRun(page, {wrong?})` | Presses Start / New questions, answers one run to its end, waits for the cover. |
| `practiceRuns(page): Promise<string[]>` | The listed runs, e.g. `["10/10", "0/30"]` (last eight). Needs the cover on screen. |

A run is 10 questions (~10 s all right). All wrong is `0/30` (each miss comes
back twice as another question of the same genre).

## Today — the review (`HOME`)

| Function | Does |
| --- | --- |
| **STORED** `seedDueReview(page, count, {kind?, unit?})` | Writes `en8:review:v1` so at least `count` items are due, reloads, waits for `#reviewCard`. `kind`: `"word"` (default) \| `"colloc"` \| `"pron"` \| `"grammar"` \| `"any"`; `unit`: `"01"`. Keeps records already there; counts ones already due. Throws if it cannot reach `count`. |
| `reviewDueCount(page): Promise<number>` | From the card title `"Review 6 items"`; 0 when hidden or `"Review — done"`. |
| `answerReviewItems(page, n, {wrong?, sure?}): Promise<number>` | Starts the review if needed (`#startReview`), answers exactly `n` (answer, then Sure/Not sure), returns how many. Leaves the last verdict on screen; a later call carries on. |
| `finishReview(page, {wrong?, sure?})` | Answers to the end, presses Done, waits for `#reviewEngine` to hide. |

How items become due (worked out from `schedule` / `enrolReview` / `dueItems`):

- Record key: `unit:word-lowercased` for a word, `unit:type:id-lowercased`
  otherwise (`01:leisure`, `01:grammar:3.1-1-gap-fill-21`).
- An item is due when it has a record with `due <= today` and not `retired`.
- **Words** get a record only from the unit page's Practice or Unit test
  (`due = today + 7` if right, `today + 1` if wrong). In-lesson practice
  (Meet the words, the bank) never schedules.
- **Collocation / pronunciation / grammar** items get a record
  `{due: today+7, seen:0, kept:0, delayed:0}` when the **home page loads** and
  their lesson is *complete* (work attempted — not Finish pressed). So opening
  Today after completing Lesson 2 or 3 writes `en8:review:v1`.
- Nothing is ever due on the day it was learned, which is why the seed exists.
  A seeded record is `{due:today, seen:1, kept:0, delayed:0, last:today-7, retired:false}`.
- Answering right: `due = today+7`, `seen+1`, and because the gap was ≥ 7 days
  `delayed+1`, `kept+1`. Wrong: `due = today+1`, `delayed+1`, `kept` unchanged.
  `retired` turns true at `kept >= 3`.
- At most 20 a day: the card offers `min(due, 20 - reviewed today)`. The card is
  hidden while `en8:review:v1` is empty.
- Each item answered adds 1 to today's `reviewed` in `en8:days:v1` at the
  Sure/Not sure press — once per item. A missed item comes back at the end of
  the session (up to twice more); those showings re-schedule it (`seen` rises)
  but are not counted again. With right answers `answerReviewItems(n)` =
  `n` more `reviewed`. With `wrong:true` it also is, as long as `n` is no more
  than the items offered (repeats come last).
- 36 collocation items are **typed** into `#ans` (the only text box left on the
  site); the driver types the key.

## Lesson 4 — the timed reading (`LESSON_READING_WRITING`, `CHECKPOINT`)

| Function | Does |
| --- | --- |
| `startTimedReading(page)` | Presses `.c-start`; waits for `body.exam-on` and the *Finish test* button. |
| `finishTimedReading(page, {wrong?: boolean, answer?: "all" \| "first" \| "none"})` | Answers the clock's tasks (default every item, right), presses *Finish test*, waits until `exam-on` is gone and every one is done. Throws if the test is not running. |
| `timedTestRunning(page): Promise<boolean>` | `body.exam-on`. **True for the timed writing too.** |
| `timedTaskIds(page): Promise<string[]>` | The clock's tasks. |

- `en8:clock:<id>` = `true` is written at **Start**, not at Finish. The test
  runs once: there is no way back to the cover.
- Before Start the passage and the question sections are `hidden`. In the test
  everything else on the page is hidden by CSS, including the writing.
- Unanswered items are marked wrong at Finish (`answer:"first"` → `0 / 5` with
  `wrong:true`).
- After Finish the tasks are done and **have no "Try it again"**.
- **A reload during the test ends it**: not running, cover gone
  ("Done. This test runs once."), tasks unmarked, each with its own Check
  visible — `answerTask(page, id)` then works on them, still with no retake.
- The running clock is not stored; nothing records time taken.

## Lesson 4 — the timed writing (`LESSON_READING_WRITING`)

| Function | Does |
| --- | --- |
| `startTimedWriting(page)` | Presses `.w-start`; waits for `body.exam-on` and the box. The cover is on the page from the start (no need to do the reading first). |
| `typeWriting(page, text)` | Fills the answer box (replaces). |
| `typeWritingNotes(page, text)` | Fills "Your notes (not counted)". |
| `handInWriting(page)` | "I've finished": the clock bar's button when timed, the button under the box when not. Waits for the drafts and checklist. |
| `writeDraftAgain(page)` | "Write draft 2": untimed, starts from the last draft. Gone after three drafts. |
| `writingText(page): Promise<string>` | The box while a draft is open; otherwise the latest draft; `""` before Start. |
| `writingDrafts(page): Promise<string[]>` | Every handed-in draft, oldest first. |

- Typing saves at once to `en8:write:v1` (`text`, and `deadline` from Start).
- **A reload during a timed draft resumes it** (same deadline, same text,
  `exam-on` again) — the opposite of the reading.
- Handing in pushes the text onto `drafts`, sets `deadline:null`,
  `committed:true`.

## The passage: notes and highlights (`LESSON_READING_WRITING`)

A note is **one notes box per passage**, not a note per highlight. The passage
is hidden until its timed reading has been started, so these work **during the
test and after it** (including after a reload) and throw before Start.

| Function | Does |
| --- | --- |
| `addNote(page, text)` | Opens Notes (`[data-pg="note"]`) if shut, fills the box. Throws if it already has text. |
| `editNote(page, text)` | Replaces the box's text. |
| `removeNote(page)` | Empties the box. The key stays, holding `""`. |
| `noteText(page): Promise<string \| null>` | The box's text; `null` when empty. Works while hidden. |
| `addHighlight(page, nth = 0)` | Drags over the first two words of **paragraph `nth`** (0-based). One highlight per call; the same paragraph twice merges into the one. |
| `removeHighlight(page, nth = 0)` | Clicks the **`nth` highlight** on the page (document order). |
| `clearHighlights(page)` | "Clear marks". |
| `highlightCount(page)` / `highlightTexts(page)` | `mark` elements in the passage (`["Nobody is", "I fed"]`). Work while hidden. |

Stored as `en8:notes:<passage>` (the raw text, not JSON) and
`en8:marks:<passage>` (`[{"p":0,"s":0,"e":9}]` — paragraph, start, end offsets).

## Finishing a lesson — any lesson or checkpoint page

| Function | Does |
| --- | --- |
| `markLessonFinished(page): Promise<string>` | Clicks `#markDone`. **It is a link and it navigates**: Lesson N → Lesson N+1; Lesson 6 → `/unit-NN/index.html#gate`; a checkpoint → `/index.html`. Returns after the new page loads, with the path it left. |
| `lessonFinished(page): Promise<boolean>` | This page's button reads `"✓ Finished — …"`. After `markLessonFinished` you are on the next page, so go back to ask. |
| `lessonComplete(page, n?): Promise<boolean>` | The lesson strip's green tick for lesson `n` (default this page's). |
| `unmarkLessonFinished(page)` | **Always throws.** The site has no undo. |
| **STORED** `storedUnmarkLessonFinished(page)` | Removes the record from `en8:progress:v1` and the step from today's `en8:days:v1`, then reloads. |

- Button text: `"Skip to Lesson 2 →"` while the work is not complete,
  `"Finish lesson ✓"` once it is, `"✓ Finished — Lesson 2 →"` after;
  checkpoint: `"Finish checkpoint ✓"` / `"✓ Finished — back to Today"`.
  All of them record and navigate; clicking a finished one only navigates.
- Writes `progress["01"].lessons["1"] = ms` and appends `"01:L1"` to today's
  `steps` (`"R1"` for checkpoint 1; `"01:T"` when the unit test ends).
- **Finished ≠ complete.** `complete["1"]` is set by the page itself when every
  task has an attempt, every word set is answered, the bank has a run, the
  writing has a draft and the clock was started — and is re-derived on every
  lesson-page load (it can be removed again).

## Fluency and jot

| Function | Needs | Does |
| --- | --- | --- |
| `finishReadAgainRound(page, id?)` | a page with `:::fluency` | "Start round N", then "I finished" at once; waits for the round's line. If all rounds are done, first presses "Run it again from round 1" (which clears the log), then runs round 1. |
| `readAgainRounds(page, id?): Promise<number>` | same | Lines in the log (0–3). |
| `jot(page, text, id?)` | `LESSON_WITH_JOT` | Fills the first `.j-box`, or `[data-jot=id]`. |
| `jotText(page, id?): Promise<string>` | same | What the box holds. |

A round stores `{secs: allowed - left, left}`; finished at once that is
`{"secs":0,"left":240}`.

## Lower level, and storage readers

| Function | Does |
| --- | --- |
| `driveEngine(page, hostSelector, {wrong?, sure?, limit?}): Promise<{answered, ended, unknown}>` | Answers whatever the question engine shows in that host. For the unit page: click `#startPractice` / `#startTest`, then `driveEngine(page, "#engine")`. `unknown` = questions it could not match to page data (0 in every run made). |
| `pageData(page)` | The page's data blob. |
| `tileSequence(key, tiles): number[]` | Tile indices for a key. |
| `stored(page, key)` / `storedAll(page)` | Read localStorage (`en8:` keys). Read-only. |
| `browserTodayNum(page): Promise<number>` | The app's "today". |
| **STORED** `storeSamples(page, kinds?)` | Writes `LEARNER_KEY_SAMPLES` (all, or the named kinds). Reload to see them. |

Unit page gates: Practice opens when Lesson 2 is finished, the Unit test when
all six are (finished, not complete). The test is 39 questions, no feedback,
and writes `progress["01"].test = {best, at}` and a review record per word.

## `LEARNER_KEY_SAMPLES`

One valid stored value per key family, exactly as the app writes it, with
unit-01 ids. Loaded together they paint, and visiting every page they touch
leaves them byte-for-byte unchanged.

| Name | Key | Value shape |
| --- | --- | --- |
| `progress` | `en8:progress:v1` | `{"01":{"lessons":{"1":ms},"test":null,"complete":{"1":ms,"3":ms}}}` (also `checkpoints:{"1":ms}` at top level) |
| `tasks` | `en8:tasks:v1` | `{"01-1-1.1-1":{"score","of","at","given":[…],"conf":[null…],"log":[{"score","of","at"}]}}` — all three Lesson 1 tasks. After "Try it again" a task is `{"log":[…]}` only. |
| `review` | `en8:review:v1` | `{"01:leisure":{"due","seen","kept","delayed","last","retired"}}` |
| `story` | `en8:story:v1` | `{"01":ms}` |
| `days` | `en8:days:v1` | `{"20739":{"reviewed":2,"steps":["01:L1"]}}` |
| `write` | `en8:write:v1` | `{"01-4-w1":{"text","ticks":{},"drafts":[…],"deadline":null,"plan","committed":true}}` |
| `jot` | `en8:jot:v1` | `{"01-3-j1-1":"…"}` |
| `notes` | `en8:notes:01-4-p1` | raw text |
| `marks` | `en8:marks:01-4-p1` | `[{"p":0,"s":0,"e":9}]` |
| `flags` | `en8:flags:01-4-c1` | `{"0":true}` (question index → flagged) |
| `clock` | `en8:clock:01-4-c1` | `true` |
| `fluency` | `en8:fluency:01-5-f1` | `[{"secs":1,"left":239}]` |
| `intake` | `en8:intake:01-2-v1` | `[{"set":0,"right":12,"total":12,"at":ms}]` (`set:-1` = mixed) |
| `bank` | `en8:bank:01-3-b1` | `[{"right":10,"total":10,"at":ms}]` |
| `comic` | `en8:comic:01-1-d1` | `"1"` comic, `"0"` text (the sample is `"0"`) |
| `seen` | `en8:seen:v1` | `{"01-3-b1":{"_t":1,"<item id>":1}}` |
| `thread` | `en8:thread:articles:06:4` | `{"got":3,"all":5}` — unit 06; unit 01 has no strand check |
| `calib` | `en8:calib:v1` | `{"01":{"0":{"n","ok"},"1":{"n","ok"}}}` (0 = not sure, 1 = sure) |

Day numbers: the app's "today" is the **browser's local calendar day**,
`floor((Date.now() - getTimezoneOffset()*60000) / 86400000)`, used as the string
key in `en8:days:v1` and as `due` / `last` in review records. The samples use
`SAMPLE_DAY` (20739 = 2026-10-13) and `SAMPLE_AT`. For "today" build them with
`daysSample(await browserTodayNum(page))` and `reviewSample(day)`.

Also written by the app, not in the samples: `en8:theme` (the colour toggle) and
the one-time migration flags `en8:shape:6` and `en8:shape:6b` (both `"1"`, set on
the first load of any page).

## What each action writes

| Action | Keys |
| --- | --- |
| Load any page | `en8:shape:6`, `en8:shape:6b` |
| Load a Lesson 1 page | `en8:comic:<dialogue>` = `"1"` (no click needed) |
| Load Today with a completed lesson | `en8:review:v1` (enrols that lesson's non-word items) |
| Commit a task / Try it again | `en8:tasks:v1`; conf tasks also `en8:calib:v1`; maybe `progress.complete` |
| Finish a word set | `en8:intake:<id>`, `en8:seen:v1` |
| Finish a practice run | `en8:bank:<id>`, `en8:seen:v1` |
| Answer a review item | `en8:review:v1`, `en8:days:v1` (`reviewed`) |
| Start the timed reading | `en8:clock:<id>` |
| Finish the timed reading | `en8:tasks:v1` (all its tasks, same instant) |
| Flag a question (`.i-flag`) | `en8:flags:<clock>` |
| Note / highlight | `en8:notes:<passage>` / `en8:marks:<passage>` |
| Type or hand in writing | `en8:write:v1` |
| Finish a lesson / checkpoint | `en8:progress:v1`, `en8:days:v1` (`steps`) |
| Finish a fluency round | `en8:fluency:<id>` (removed by "Run it again") |
| Jot | `en8:jot:v1` |
| Unit page Practice / Test | `en8:review:v1`; the test also `en8:progress:v1`, `en8:days:v1` |
| Story: "I have read this chapter" | `en8:story:v1` |
| Strand check inputs | `en8:thread:<name>:<unit>:<lesson>` |

## Gaps and limits

- **No un-finish in the UI.** `unmarkLessonFinished` throws;
  `storedUnmarkLessonFinished` edits storage.
- **Notes are per passage**, one box; there is no per-highlight note.
- **Notes and highlights are unreachable before the timed reading is started.**
- **No `check`-kind task exists** to use as a fixture.
- Not driven (no function): the comic controls, the Words sheet, the story page,
  the strand-check inputs, the question flag, the writing checklist's
  tick-boxes, Mixed practice, the theme toggle. The selectors above are enough
  to click them directly.
- Timing: engine runs wait out the app's own 0.9 s after each right answer
  (word set ≈ 11 s, bank run ≈ 10 s). The review and the unit test have no such
  wait.
- `addHighlight` drags with the mouse over the first two words of the
  paragraph, after scrolling it to the middle of the screen. Run at 1280×800
  and at 390×844 (`isMobile`, `hasTouch`); the whole driver passed at both.
- Typecheck: the command in the brief needs `--ignoreConfig` now that the repo
  has a `tsconfig.json` (`npx tsc --ignoreConfig --noEmit --target es2022
  --module nodenext --moduleResolution nodenext --strict --skipLibCheck
  tests/support/driver.ts`); `npx tsc -p tsconfig.json` also passes for this file.
