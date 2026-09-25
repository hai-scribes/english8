# Handoff — learn-anywhere harness v2 (2026-09-25)

For a fresh session with no history. Branch `learn-anywhere-harness-v2`, cut
from `prototype/learn-anywhere` at `6a8813e` (m1 sign-in, built). Everything
here is **work on the measuring stick**, not on the product.

**State: the harness is rewritten and proven. What is left is the operator's**
— landing it on the lane branch and re-freezing the lane (§ What is left).

## The goal

> Sign in with Google and carry every learner's progress, daily and weekly work
> across devices — instantly, offline-capable, with every sync visible on the
> page.

Five milestones, frozen (hash-sealed) in `.specs/prototype/learn-anywhere.goal.json`
on branch `prototype-lane-review`:

| # | Milestone | State |
|---|---|---|
| m1 | Sign in with Google, stay signed in | **built**, gate green (4/4, 0 violations), awaiting operator `approve-boundary`. Never exercised against real Google (placeholder Firebase project in `docs/assets/firebase-config.js`) |
| m2 | Her work follows her, and only hers (sync + Firestore rules) | not started |
| m3 | An account of her own week (daily/weekly record, no streaks) | not started |
| m4 | Nothing happens she cannot see; lessons work offline (service worker) | not started |
| m5 | Still instant (p95 ≤ 100 ms at 4× CPU throttle), all of it on | not started |

## Why this branch exists

A two-reviewer adversarial review found the frozen m2–m5 gates would certify
the wrong things. All verified in code before anything was changed:

1. m2's offline step reloaded the page offline — unpassable until m4's service
   worker exists — and its "offline" task was the one already synced.
2. m2's cross-account check only looked at device C's own localStorage, so
   `allow read, write: if request.auth != null` scored 0 leaks.
3. m5 clicked "Check answers", which the app disables after one attempt —
   latency of a dead button; 12 samples made "p95" the maximum; the cold probe
   counted static markup, so it could never fail.
4. `run.max_parallel` unset → m5's two variants race each other's emulator.
5. 60-min wall ≈ 3 cycles at the measured ~15 min/cycle.

Plus one the m1 findings had already recorded and nobody had fixed: the
tournament's benchmark runner runs a scenario **without** the `serve:`
lifecycle, so every benchmark read the stack-down numbers and the tournament
could never certify work its own gate passed.

And the operator's decision of 2026-09-25 — *"This is fresh app, no
backwards compats, no history, everything is fresh"* — which made every
assertion on `en8:` storage keys obsolete.

## What changed in `harness/`

- `lib.mjs` — `resolveBuild()` serves `docs/` only.
- `serve.mjs` — site under `/english8/` (as on GitHub Pages), no
  `Service-Worker-Allowed` header, and `POST /__harness/deploy` simulating a
  new build.
- `browser.mjs` — the contract: sync-state semantics spelled out; **"it
  synced" means the other device SHOWS it** (never storage); the page may
  repaint in place or reload itself. The state timeline is reported out of the
  page through a binding and `mark`/`syncLog`/`waitSynced` read THAT, so they
  survive a page reloading itself (the in-page array died with its document).
  Requests are attributed with Playwright's `serviceWorker()` and a popup's
  frameless first navigation is recognised as the popup, not as a service
  worker. `taskView()` (done, answers, marks, score line, attempt history)
  and `showsDone()` are the page-level probes. `learner(role)` gives each run
  its own accounts, so a rerun on a shared stack cannot sign in to an earlier
  run's work. Timezone `Asia/Ho_Chi_Minh`.
- `sync.mjs` — **page-level throughout.** A answers a task and retakes it; B
  must show that task exactly as A does (two-attempt history included); C, a
  different learner, must show nothing done before it has answered anything,
  then the rules engine is asked directly (every document read AND written with
  C's credential, after proving C can read its own); A offline on an open page
  + a concurrent edit on B, and a fresh D must show all three.
- `rhythm.mjs` — 06:30 local (= previous day in UTC), per-day DOM elements,
  extended forbidden list (time spent, "in a row", Vietnamese `chuỗi`/`liên
  tiếp`, points/badges in the record).
- `session.mjs` — offline load re-applies Playwright's offline emulation
  (measured quirk: a document loaded while offline sees `navigator.onLine ===
  true`); after a simulated deploy the new app.js must arrive within 3 reloads.
- `speed.mjs` — 40 real attempts (reset via Try again, commit verified), cold
  load signed in with backends blocked must show the saved attempt; no 99999
  sentinel.
- **new `stack.mjs`** — `node harness/stack.mjs <scenario>` reuses a live
  stack (ports.json whose servers answer) or boots one, runs the scenario,
  tears down. The benchmarks should call this; the gate's checks keep calling
  the scenarios directly because `prototype check` already boots `serve:`.
  Tested cold, warm (reused, no second serve) and with a stale ports.json.

`identity.mjs`, `build.mjs`, `package.json` and `package-lock.json` are
byte-identical to the frozen m1 gate.

## Proof — `harness-proof/`

A THROWAWAY reference implementation (`ref-src.mjs`, never to ship) with
defect switches, built into a scratch copy of the repo by `make-ref.sh
<defect[+defect…]>` and driven by `run-ref.sh "<defect>" <scenario>…`, or all
at once by **`matrix.sh`** (every defect must fail on the gate line that
names it, not merely fail). Set `LANE` to the checkout whose `harness/` you
are testing; `REPS=n` repeats.

Setting up the scratch copy: a directory holding a copy of `docs/`, a
`node_modules` (symlink is fine) and the files of `harness-proof/`; `run-ref.sh`
copies `$LANE/harness/` in on every run.

**Result, 2026-09-25** — `matrix.sh`: 17 of 17 as expected. Flake: the correct
reference, all four scenarios × 20 on one shared stack — 280 of 280 gate lines
PASS, 0 FAIL.

| Gate | Correct reference | Defects caught, on the named gate line |
|---|---|---|
| sync | green ×21 | `no-repaint` (pulled into storage, never painted — the old key-level gate PASSED this), `blob-lww`, `no-rules` → *progress travels*; `open-rules`, `shared-doc+open-rules` (caught by the page check AND the rules probe) → *cross-account isolation* |
| rhythm | green ×21 | `utc-day` → *daily and weekly record*; `streak`, `minutes` → *no streak, score, comparison or time spent* |
| session | green ×21 | `silent-push` → *nothing happens silently*; `no-sw`, `stale-sw` → *session behaviour* |
| speed | green ×21 | `cloud-render` → *nothing cloud-bound in the render path*; `slow-save` → *p95 interaction under 100ms* |

Measured on the correct reference, warm stack: p95 20–33 ms; long tasks
289–451 ms against the 500 ms budget (the budget covers the whole session,
sign-in SDK included — the tightest margin in the lane); sync 9–11 s, rhythm
3–4 s, session 2–3 s, speed 9–10 s per run.

Three things the proof turned up and fixed, worth knowing:

- The reference itself had a real race (an early click's `signing-in`
  overwritten by the first `signed-out` callback) and session caught it as 6
  silent requests. The gate was right; the reference was fixed.
- The first `cloud-render` defect was a no-op — module scripts run at
  `readyState === "interactive"`, before `app.js` paints tasks at
  `DOMContentLoaded` — and speed passed it. A defect that does nothing proves
  nothing, which is why `matrix.sh` checks the gate line, not the exit code.
- Fixed learner emails made a rerun on the same stack see the previous run's
  work (C "has answered nothing" and shows work done). Hence `learner()`.

### Running the proof where `apis.google.com` is blocked

`signInWithPopup` loads `https://apis.google.com/js/api.js` even against the
Auth emulator. The cloud sandbox this was proven in denies that host, so
`GAPI_SHIM=1 ./run-ref.sh …` (and `matrix.sh`) serve a local stand-in,
`gapi-shim.js`, via a `--import` preload (`gapi-offline.mjs`) that wraps
`chromium.launch`. The harness under test is not touched. On a machine that
can reach Google, leave `GAPI_SHIM` unset. The **gate** has no such switch:
the lane's machine needs `apis.google.com`.

Also sandbox-specific and not in the repo: Playwright 1.62 wants Chromium
build 1234 and the sandbox ships 1194, mapped with a `PLAYWRIGHT_BROWSERS_PATH`
directory of symlinks; and `JAVA_HOME` set to the system JDK (not on
`javaBin()`'s macOS-oriented list).

## What is left — the operator's

1. **Land this on the lane branch.** `prototype/learn-anywhere` is still at
   `6a8813e`, this branch's base, so it is a fast-forward:
   `git checkout prototype/learn-anywhere && git merge --ff-only learn-anywhere-harness-v2`.
   (This session was scoped to push only `learn-anywhere-harness-v2`.) If
   `drafts/` and this file should not live on the lane branch, bring over
   `harness/` and `harness-proof/` alone.
2. **Adopt the amendments** in `drafts/learn-anywhere-v2/AMENDMENTS.md` —
   charter (no backwards compatibility: problem statement, scope, retire
   `a-eleven-keys-portable`, replace kill criterion #4, refreshed measurable
   forms), m2's objective and every milestone's `fixed_workload`, benchmark
   commands → `node harness/stack.mjs <scenario>`, `harness/stack.mjs` added
   to every gate's artifacts, run config `max_wall_minutes: 150` and
   `max_parallel: 1`.
3. **Replace the orientation** with `drafts/learn-anywhere-v2/orientation.md`.
4. **Re-freeze** (the AI cannot run `approve-*` — hook-blocked by design):
   `approve-charter`; `approve-milestone learn-anywhere 1 --adopt-edited-gate`;
   then `approve-milestone` for 2, 3, 4, 5 one id at a time (declarations
   change). Exact commands are in AMENDMENTS.md.
5. Only then launch m2.

## Standing constraints

- `harness/` is a hash-frozen gate artifact: editing it needs explicit
  operator authorisation, and the lane cannot run until re-frozen.
- The operator keeps polishing the CURRENT version on `main` meanwhile; this
  branch must not touch `main`, `docs/` or unit content (it does not).
- Repo rules in `CLAUDE.md` apply (no band numbers, nothing on the page
  explains the design, `docs/` is generated, pushes as `hai-scribes`).
