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
