# learn-anywhere — amendments for the v2 harness (DRAFT, 2026-09-25)

Proposed changes to the sealed lane in `.specs/prototype/learn-anywhere.goal.json`
(branch `prototype-lane-review`). **Nothing here is applied.** The goal file is
hash-sealed and every change below needs the operator's `approve-*`, which an
agent cannot run by design. This file is the text to adopt, with the reason
for each change and the command that freezes it.

Evidence for every harness claim is the proof matrix in
`HANDOFF-learn-anywhere-harness-v2.md` (§ Proof), run against the throwaway
reference in `harness-proof/`.

---

## 1. Charter — "no backwards compatibility"

Operator decision received 2026-09-25:

> "This is fresh app, no backwards compats, no history, everything is fresh,
> so we can remove cleanly all old codes, logics and service and db without
> any issues."

Four parts of the approved charter assume legacy data and are now false.

### 1a. `problem` — replace the second and third sentences

Now: *"Everything she has done lives in eleven localStorage keys on one browser
on one device: 319 marked tasks, twelve writing tasks, her highlights, her
notes, her attempt history. That storage is invisible, unbacked and
untransferable. Clearing site data erases a year of work…"*

Proposed:

> Everything she does lives in `localStorage` on one browser on one device:
> her marked task attempts, her writing, her highlights, her notes, her
> attempt history. That storage is invisible, unbacked and untransferable.
> Clearing site data erases all of it with no warning and no recovery; a new
> phone starts her at zero; and a tablet in another room is a different
> learner as far as the app is concerned.

(The rest of the problem statement stands.)

### 1b. `scope.in[1]` — replace

Now: *"Every existing en8: local key carried to a per-account record and back:
progress, task attempts, writing, highlights, notes, review queue, story
reading, single-play flags"*

Proposed:

> Every kind of learner state the app keeps — progress, task attempts and
> their history, writing, highlights, notes, review queue, story reading,
> single-play flags — held per account and shown the same on every device she
> signs in on. There is no existing data to carry: the sync layer may own
> storage outright and `app.js`'s save/load pairs may change or go.

### 1c. Assumption `a-eleven-keys-portable` — retire

It asserts the sync layer can sit *underneath* the existing app without
changing how anything serialises. With no data to preserve, whether it can is
no longer a question anyone needs answered, and keeping it steers variants
toward a layering the operator has just released them from.

### 1d. Kill criterion #4 — replace

Now: *"Carrying the eleven existing en8: keys turns out to require changing how
the marking engine or the review queue stores anything, i.e. the layer cannot
go underneath the existing app and has to reach into it."*

Proposed:

> Making her state follow her requires changing what the marking engine marks,
> what the review queue schedules, or what any lesson teaches — i.e. the sync
> cannot be built without altering the curriculum behaviour the nine content
> gates protect.

(Changing *how* state is stored is now expected, not a kill signal. Changing
*what the app does with it* still is.)

### 1e. `success_metrics` — measurable forms that changed with the harness

- **`sync_mismatches`**: "…work done on device A appears on device B after
  signing in as the same learner…" → append: *"Appears means SHOWN on B's
  page — the task done, with the same answers, marks, score line and attempt
  history as on A — not present in storage. Work done offline on an open page
  and a concurrent edit on another device must both reach a fresh device."*
- **`cross_account_leaks`**: append: *"Counted two ways: a second learner's
  page showing any work as done before it has done any, and every document in
  the emulator probed for read AND write with the second learner's
  credential. The probe first proves that credential can read its own
  documents, or isolation is NOT MEASURED."*
- **`p95_interaction_ms`**: "…over at least 12 samples…" → *"over 40 samples,
  each a real committed attempt (the task reset with Try it again and filled
  first, untimed), so the 95th percentile is not simply the maximum and no
  sample times a disabled button."*
- **`render_path_cloud_reads`**: append: *"Probed signed in, with an attempt
  already saved: the saved attempt must be shown done with every backend
  origin blocked, not merely the static markup."*
- **`silent_network_ops`**: append: *"Requests are attributed by the page's
  own reported state at the moment each left, across navigations; requests a
  service worker makes on the page's behalf are counted."*

Command (operator): `atelier prototype goal approve-charter learn-anywhere
--with-risks a-100ms-is-instant,a-daily-not-streak,a-emulator-fidelity,a-google-account,a-local-first-required,a-no-storage-needed,a-spark-sufficient --agent --compact`
(the risk list is unchanged; `a-eleven-keys-portable` was never an approved
risk, only an assumption).

---

## 2. Milestones

### m1 — adopt the edited gate

m1's code is unchanged, but the gate artifacts it hashes (`harness/*`) change
for everyone, so its seal breaks too. m1's gate is `build` + `identity`, and
`identity.mjs` is byte-identical; only shared plumbing moved.

`atelier prototype goal approve-milestone learn-anywhere 1 --adopt-edited-gate --agent --compact`

### m2 — objective, last sentence

Now: *"The eleven existing en8: localStorage keys are carried to a per-account
record and back without changing how the marking engine, the review queue or
the writing panel serialise anything."*

Proposed:

> What she sees on one device is what she sees on the other: a task shown done
> on one is shown done on the other, with the same answers, marks and attempt
> history, without her doing anything but sign in. How that state is stored is
> the implementation's choice; there is no older format to preserve.

m2 `fixed_workload` — replace with:

> Four round trips across separate browser contexts treated as separate
> devices, against the real Firestore emulator running the shipped
> firestore.rules: device A answers a marked task and retakes it; device B
> signs in as the same learner and must SHOW that task as A shows it (done,
> answers, marks, score line, two-attempt history); device C, a different
> learner, must show nothing done before it has answered anything, and the
> rules engine is then asked directly — every document read and written with
> C's credential; device A, page open, goes offline and answers a second task
> while B answers a third, A reconnects, and a fresh device D must show all
> three.

### m3, m4, m5 — `fixed_workload` refreshes

- **m3**: "(Tue 2026-09-08 and Thu 2026-09-10)" → "(Tue 2026-09-08 and Thu
  2026-09-10, both at 06:30 in Asia/Ho_Chi_Minh — the previous day in UTC)";
  "day one's record survives into day two" → "…on a second device"; and the
  scan list gains "time spent, 'in a row', and the Vietnamese streak words".
- **m4**: "driven through five steps" → "six steps"; add *"a simulated
  deploy after which the new app.js must reach this device within three
  ordinary reloads"*, and "the lesson loaded and usable with the context set
  offline" → "…offline, showing `offline` within 10 s".
- **m5**: "at least twelve click-to-next-painted-frame samples" → "forty
  committed-attempt samples"; "the lesson must still render" → "the lesson
  must render with the attempt saved earlier shown done".

### All milestones — benchmark command, and the new artifact

The tournament's benchmark runner does not boot `serve:` (m1 findings,
"WHY THE TOURNAMENT COULD NEVER CERTIFY THIS"). The new
`harness/stack.mjs` reuses a live stack or boots one, so:

| milestone | `benchmark.command` now | proposed |
| --- | --- | --- |
| 1 | `node harness/identity.mjs` | `node harness/stack.mjs identity` |
| 2 | `node harness/sync.mjs` | `node harness/stack.mjs sync` |
| 3 | `node harness/rhythm.mjs` | `node harness/stack.mjs rhythm` |
| 4 | `node harness/session.mjs` | `node harness/stack.mjs session` |
| 5 | `node harness/speed.mjs` | `node harness/stack.mjs speed` |

`gate.artifacts` gains **`harness/stack.mjs`** on every milestone. The
`checks:` entries keep calling the scenario directly, because `prototype
check` already boots `serve:`.

Commands (operator; one id at a time, because declarations change):

```sh
atelier prototype goal approve-milestone learn-anywhere 2 --agent --compact
atelier prototype goal approve-milestone learn-anywhere 3 --agent --compact
atelier prototype goal approve-milestone learn-anywhere 4 --agent --compact
atelier prototype goal approve-milestone learn-anywhere 5 --agent --compact
```

---

## 3. Run configuration

Now: `max_wall_minutes: 60`, `max_parallel` unset, `n_variants: 2`.

Proposed:

```json
"run": {
  "max_wall_minutes": 150,
  "max_parallel": 1,
  "n_variants": 2,
  "max_rounds": 1,
  "max_cycles_per_milestone": 100,
  "no_progress_limit": 3,
  "chain_rounds": false,
  "worker": { "autocompact": "150k", "orientation_file": ".specs/prototype/learn-anywhere.orientation.md" }
}
```

- **150 minutes**: m1 measured ~15 min per cycle under load; 60 minutes is
  about three cycles, which is not enough to build sync.
- **`max_parallel: 1`**: every variant boots its own Java emulator and
  Chromium; two at once OOM-killed one on the operator's machine, and m5's
  p95 under a 4x CPU throttle measures the rival variant's load as much as its
  own. Serial is slower and is the only way the number means anything.

Checks-file `timeout_seconds`: unchanged at 600/900. Measured on the correct
reference with a warm stack (80 runs): sync 9–11 s, rhythm 3–4 s, session
2–3 s, speed 9–10 s; a failing build is slower because waits run to their
timeouts (worst seen: sync 50 s). Booting the stack cold adds ~15–20 s. The
cycle cost is the worker's build time, not the gate.

---

## 4. Orientation

Replace `.specs/prototype/learn-anywhere.orientation.md` with
`orientation.md` beside this file. The load-bearing changes:

- "no bundler, no network calls" is false since m1 (esbuild bundles the auth
  layer; the page talks to Firebase).
- The eleven-key table is replaced by the no-backwards-compat fact, and by the
  fact that `app.js` paints once at boot — pulled work has to be painted.
- `syncing` before ANY backend request, including SDK start-up traffic.
- The service worker must never cache `firebase-config.js`.
- Firestore lite issues one-shot requests; the full SDK re-issues on its own
  schedule, and the audit judges each request by the state when it left.
- `signInWithPopup` needs `apis.google.com` even against the emulator.

The orientation is not a gate artifact and needs no approval to change, but it
steers every worker, so land it with the re-freeze rather than before.
