# Project lessons — durable dev observations

Domain-specific lessons learned while building this project. The AI
auto-redirects dev-observation memories here per `[[retro_destination_redirect]]`
instead of burning MEMORY.md lines + creating one project_*.md per save.

Format: append-only sections, terminal-friendly. Each entry should
cover what was non-obvious, why it mattered, and what you'd do next
time. Prefer one short paragraph per lesson.

Curate by running `/retro` periodically — that's the heavyweight
review pass; this file is the durable lightweight tracker.

- 2026-09-26 · test_reading.js injects app.js into every page itself, so a page
  that cannot load its own stylesheet or script passes every behavioural test.
  story/ and words/ shipped at depth=0 and were broken live (no chapter could
  open) until a UI walk-through with real Chrome caught it. The asset-path
  check in test_reading.js now guards it; when adding a page, pass the depth
  that matches its folder.

**A `node_modules` symlink in a worktree is not ignored (2026-09-27).** To run
`test_reading.js` (needs jsdom) in a throwaway `git worktree`, the easy move is
to symlink the main checkout's `node_modules` in. `.gitignore` says
`node_modules/`, and the trailing slash matches directories only, so the symlink
is untracked-but-not-ignored and `git add -A` commits it. Remove it before
staging (or `git rm --cached node_modules` and amend), and check `git show
--stat` before any push to `main`.

**What promoting `learn-anywhere` onto current `main` will meet (2026-10-12).**
The prototype was built and gated on an app 64 commits behind `main`. A trial
merge (local branch `learn-anywhere-on-main`, reference only — a lane is never
merged, the route is `/promote`) found these, none of which the lane's gates see:

- `main` already keeps `en8:days:v1` (review items and path steps, read by
  Today). The lane's "Your days" used the same key with a different shape; it
  needs its own key (the trial used `en8:worked:v1`) or to be folded into main's.
- `main` marks an item the moment it is answered, so most tasks have no Check
  button. The lane's harness driver (`answerTask` in `harness/browser.mjs`)
  presses Check and stops with "Check is not clickable": sync, rhythm, session
  and speed cannot be measured on `main` until the gate is rewritten for it.
- File a day's work from `main`'s own completion points — a task's `commit()`,
  a word set's `onDone`, a bank run, writing at hand-in (not per keystroke).
- A timed test shows only the test: hide the day record under `body.exam-on`,
  and never redraw the page for incoming work while it is on.
- Sync merges stored lists by union. That is right for logs that only grow and
  wrong for lists she edits — a removed highlight (`en8:marks:*`) came back at
  the next save until that key was made last-change-wins. Check every new
  stored list against this before syncing it. Still open on `main`'s shapes:
  `DAYS[day].steps` (un-finishing a lesson is undone by the union) and
  `DAYS[day].reviewed` (a counter: the later device's number wins, not the sum).
- `tools/test_anywhere.mjs` on the lane branch (at `f9d55a68`) asks fourteen
  things the gates do not, and is the behaviour list the promote spec should be
  written from: sign-out offline, held work unreadable in storage, deletions
  held, a retake surviving a save, a fast clock not overruling a later change,
  a second tab cleared, signed-out work not slipping into an account, removed
  highlights, the day record, whole-course offline, a hanging connection, a new
  build. Its own task driver handles both kinds of task and is the one to carry.
- Two outside reviews (Fable 5.1, codex; 2026-10-12) found about twenty defects
  the lane's green gates had passed. The ones that will recur in any rebuild:
  a cleared record needs a time or the merge puts the old one back; order
  changes with a stamp that is never earlier than any stamp seen, never a bare
  device clock; read what changed since a server-time cursor, never the whole
  account per save (the free read quota goes in one writing session); keep a
  page under one cache spelling; anything held on a shared device after
  sign-out is encrypted. The trial branch `learn-anywhere-on-main` predates all
  of this and has none of it.

## What building `learn-anywhere` for real taught (2026-10-13)

Built new on `main`'s app in `.worktrees/learn-anywhere` from the 52-criteria
spec; 52 criterion tests plus 12 edge tests the audits added.

- **The lesson code writes whole records from memory, so a sync layer under
  it must merge at write time.** `TASKS`, `DAYS`, `PROG`… are read once and
  written back whole. Anything merged into storage under a live page is
  overwritten by her next answer — and then saved over the account. `sync.js`
  keeps what the *page* last wrote per key and three-way merges every write
  whose stored value has moved on. Remember the page's own value, not the
  merged one, or only the first write after a merge is protected.
- **A count two devices add to is not safe behind an equality shortcut.**
  "Same value on both sides" is agreement for text and disagreement for a
  counter: each device adding one arrives at the same number. Sum the deltas
  from the shared start; with no shared start (a day both began apart) add.
  A device's own write coming back (same stamp) is the one true agreement.
- **After a save of a key that changed in flight, the merge base is what was
  sent**, not what it was before the save.
- **Nothing that changes whose data is on the device may wait on the
  network.** Account-change handling queued behind an in-flight save was
  blocked by one hung request. Requests carry a deadline, and an answer that
  returns after the device changed hands is dropped.
- **Every "I am in the middle of X" note in storage needs a time.** A tab
  closed mid-sign-out left the device wedged for good.
- **Signing out must end the browser's session even when the sign-in client
  never loaded** — leave a note and end it when the client next appears.
- **A status that reads "Saved" forever in a sticky header changes the
  header's height on a phone.** One or two words sit in the bar; only a
  sentence takes a line.
- **`disabled` drops keyboard focus to the top of the page**; use
  `aria-disabled` and ignore the press, and hand focus on before hiding a
  focused control.
- **The auditor found a real defect on every one of seven passes**, two of
  them in my own previous fix. One pass is not an audit of sync code.
- A timed reading counts as one "timed reading" in the day record, not as
  its tasks: it is one sitting marked together.
- The app has no control that un-marks a finished lesson ("There is no
  undo"); AC-33 is exercised at the storage level.
