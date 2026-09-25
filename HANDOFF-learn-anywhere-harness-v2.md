# Handoff — learn-anywhere harness v2 (2026-09-25)

For a fresh session with no history. Branch `learn-anywhere-harness-v2`, cut
from `prototype/learn-anywhere` at `6a8813e` (m1 sign-in, built). Everything
here is **work in progress on the measuring stick**, not on the product.

## The goal

> Sign in with Google and carry every learner's progress, daily and weekly work
> across devices — instantly, offline-capable, with every sync visible on the
> page.

Five milestones, frozen (hash-sealed) in the main checkout's
`.specs/prototype/learn-anywhere.goal.json` on branch `prototype-lane-review`:

| # | Milestone | State |
|---|---|---|
| m1 | Sign in with Google, stay signed in | **built**, gate green (4/4, 0 violations), awaiting operator `approve-boundary`. Never exercised against real Google (placeholder Firebase project in `docs/assets/firebase-config.js`) |
| m2 | Her work follows her, and only hers (sync + Firestore rules) | not started |
| m3 | An account of her own week (daily/weekly record, no streaks) | not started |
| m4 | Nothing happens she cannot see; lessons work offline (service worker) | not started |
| m5 | Still instant (p95 ≤ 100 ms at 4× CPU throttle), all of it on | not started |

## Why this branch exists

A two-reviewer adversarial review (Fable 5.1 + Opus; Codex was spend-capped)
found the frozen m2–m5 gates would certify the wrong things. All verified in
code before anything was changed:

1. m2's offline step reloaded the page offline — unpassable until m4's service
   worker exists — and its "offline" task was the one already synced.
2. m2's cross-account check only looked at device C's own localStorage, so
   `allow read, write: if request.auth != null` scored 0 leaks.
3. m5 clicked "Check answers", which the app disables after one attempt —
   latency of a dead button; 12 samples made "p95" the maximum; the cold probe
   counted static markup, so it could never fail.
4. `run.max_parallel` unset → m5's two variants race each other's emulator.
5. 60-min wall ≈ 3 cycles at the measured ~15 min/cycle.

## What changed in `harness/` (uncommitted-then-committed here)

- `lib.mjs` — `resolveBuild()` serves `docs/` only.
- `serve.mjs` — site under `/english8/` (as on GitHub Pages), no
  `Service-Worker-Allowed` header, and `POST /__harness/deploy` simulating a
  new build (rewrites `app.js?v=` in HTML, appends `window.__EN8_DEPLOY__` to
  app.js).
- `browser.mjs` — contract rewritten (sync-state semantics spelled out;
  `[data-en8-day]` inside `[data-en8-rhythm]`); timezone `Asia/Ho_Chi_Minh`;
  state timeline pushed from the page's main frame via `exposeBinding`, stamped
  with `performance.timeOrigin+now()`, and each request judged by its own
  `timing().startTime` (the old async `page.evaluate` sampling misread states
  mid-navigation and inside the auth iframe); context-level request log so
  service-worker traffic counts; `answerTask(page, i)` takes "Try it again"
  and waits for `data-done`; `mark()` = index of the CURRENT state (fixes a
  race that hung on correct coalescing builds); `waitSynced` never accepts
  `idle` and reports the states it saw on timeout.
- `sync.mjs` — isolation asked of the rules engine directly (admin-list every
  doc, then read AND write each as C with an unsigned emulator token; C must
  be able to read its own, else NOT MEASURED); offline work on an open page
  merged with a concurrent edit from B; B must hold all of A's `en8:` state.
  Unique learner email per scenario.
- `rhythm.mjs` — 06:30 local (= previous day in UTC), per-day DOM elements
  instead of storage format; forbidden list extended (time spent, "in a row",
  Vietnamese `chuỗi`/`liên tiếp`, points/badges in the record).
- `session.mjs` — MutationObserver log instead of a 40 ms poll; offline load
  waits ≤10 s for "offline" and re-applies Playwright's offline emulation
  (measured quirk: a document loaded while offline sees `navigator.onLine ===
  true`); new step: after a simulated deploy the new app.js must arrive within
  3 reloads.
- `speed.mjs` — 40 real attempts (reset via Try again, commit verified), cold
  load signed in with backends blocked must show the saved attempt; no 99999
  sentinel.

## Proof so far — `harness-proof/`

A THROWAWAY reference implementation (`ref-src.mjs`, never to ship) with
defect switches, built into a scratch copy of the repo by `make-ref.sh <defect>`
and driven by `run-ref.sh "<defect>" <scenario>…` (set `LANE` to the checkout
whose `harness/` you are testing; `REPS=n` repeats).

| Gate | Correct reference | Defects caught (right reason) |
|---|---|---|
| sync | green ×3 | `open-rules` (READ+WRITE leak, HTTP 200), `blob-lww`, `no-rules` |
| rhythm | green ×2 | `utc-day`, `streak`, `minutes` |
| session | green ×3 | `silent-push`, `no-sw`, `stale-sw` (a truly pinning cache-first SW; a stale-while-revalidate SW legitimately passes) |
| speed | **not yet run** | planned: `cloud-render` (saved attempt hidden until the cloud answers), `slow-save` (150 ms busy-wait on save) |

## Operator decision received 2026-09-25 — changes the plan

> "This is fresh app, no backwards compats, no history, everything is fresh,
> so we can remove cleanly all old codes, logics and service and db without
> any issues."

Consequences to carry out:

- The charter's problem statement (319 tasks, "a year of work"), m2's
  "carry the eleven en8: keys without changing how app.js serialises
  anything", and **kill criterion #4** assume legacy data. They are obsolete:
  the sync can own storage outright (one store app.js writes through), no
  migration, no layer underneath.
- **`sync.mjs` must stop asserting on `en8:` localStorage keys** (it still
  does: `progress()`, `taskIdsIn()` read `en8:tasks:v1`). Assert on what the
  learner sees — the answered task shows `data-done="1"` / its attempt on the
  other device. rhythm and speed already assert on the page.

## Exact next steps

1. Rewrite `sync.mjs` to page-level assertions (above).
2. Run `speed` against the reference (add the two defects to `ref-src.mjs`).
3. Re-run every scenario on the correct reference ~20× for flake.
4. Draft charter + m2 amendments for "no backwards compat"; run-config
   `max_wall_minutes: 150`, `max_parallel: 1`; refresh
   `.specs/prototype/learn-anywhere.orientation.md` (it still says "no
   bundler, no network calls"; add: show `syncing` before any SDK call incl.
   auth init, SW must not cache `firebase-config.js`, Firestore **lite** gives
   one-shot requests).
5. Land the harness on `prototype/learn-anywhere`; hand the operator the
   re-freeze commands (`approve-charter`; `approve-milestone learn-anywhere 1
   --adopt-edited-gate`; `approve-milestone` for 2–5 — declarations change, so
   one id at a time). The AI cannot run `approve-*` (hook-blocked by design).

## Standing constraints

- `harness/` is a hash-frozen gate artifact: editing it needs explicit
  operator authorisation, and the lane cannot run until re-frozen.
- The operator keeps polishing the CURRENT version on `main` meanwhile; this
  branch must not touch `main`, `docs/` or unit content.
- Repo rules in `CLAUDE.md` apply (no band numbers, nothing on the page
  explains the design, `docs/` is generated, pushes as `hai-scribes`).
