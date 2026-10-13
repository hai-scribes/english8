# Notes for operator — framework / upstream observations

Pipeline / upstream / framework observations that surfaced while
working on this project. Routes here (not into AI memory) so the
operator sees them on `/retro` curation — the AI-memory split is
intentional per ADR-W7-6.

Typical entries:
* Upstream Claude Code / Codex / Gemini behavior worth flagging
* Atelier substrate gotchas that don't belong in code comments
* Cross-project patterns the framework should grow

NOT memory-indexed. Read by humans during `/retro`; written by AI
through the destination-redirect rule when an observation is more
about how the FRAMEWORK behaves than about THIS project's domain.

---

## 2026-10-11 — learn-anywhere m2: driver crash in cleanup strands a green round

- `prototype run --auto` crashed in `_goal_tournament.remove_variant_worktree`: `git worktree remove --force` on a variant worktree holding `node_modules` hit the 30 s `_git` timeout and raised `TimeoutExpired` out of `run_milestone`. The winner's commit was already fast-forwarded onto the lane branch; the round was journaled `grafting` with `graft: {}`.
- Crash reconcile on the next run took the "graft landed before the crash" branch, re-gated 3/3 and set the round `grafted`, but never filled `graft.ok`. `_boundary_ok` then refuses the boundary with "green boundary lacks a successful grafted round", so a round that really did graft and re-gate cannot be shown green.
- Worth fixing upstream: treat a cleanup timeout as non-fatal (the worktree is disposable), and have crash reconcile reconstruct the graft record when mainline HEAD equals the winner's head.

## 2026-10-12 — [selfcheck/redo_after_green] goal learn-anywhere: 2 milestone redo(s) came AFTER the gate passed — the operator re-ran work the framework had certified green; 1 of them then CHANGED the gate, i.e. the certified gate was weaker than the operator's bar (1853804324f55b39)

**Analyzer:** `redo_after_green` · **severity:** high · **fired on:** `promote` learn-anywhere

Evidence:
* `2026-10-10 m1 redone after green — then CHANGED the gate`
* `2026-10-12 m2 redone after green — same gate re-run`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/wasted_round] milestone 1 failed 1 round(s) (stuck) then reached pending_approval — the failed rounds were paid for and discarded (c3a57ab9321c62a4)

**Analyzer:** `wasted_round` · **severity:** high · **measured cost:** 49 min · **fired on:** `promote` learn-anywhere

Evidence:
* `2026-08-16T19:14:05.107Z stuck: no winner after 2 round(s): no variant passed the gate`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/wasted_round] milestone 1 failed 2 round(s) (stuck) then reached pending_approval — the failed rounds were paid for and discarded (ceaed33e291c323d)

**Analyzer:** `wasted_round` · **severity:** high · **measured cost:** 90 min · **fired on:** `promote` learn-anywhere

Evidence:
* `2026-09-04T22:42:46.013Z stuck: stopping after round 1 of 2 this attempt (round id 1): every one of the 1 attempts that ran was reaped by the WALL, and `run.chain_rounds` is off — so the next `
* `2026-09-05T09:35:57.890Z stuck: no winner after 4 round(s) this attempt: no variant passed the gate · BEST WORK KEPT: branch atelier-variant/learn-anywhere/m1/r1/v1 at 3027655f75fc passed 2/2 `

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/blocked_boundary] 9 milestone boundary/boundaries ended blocked — the advance was refused; those rounds were paid for and produced no advance (e2d3eb8c09bd7ac0)

**Analyzer:** `blocked_boundary` · **severity:** medium · **fired on:** `promote` learn-anywhere

Evidence:
* `2026-08-16T20:34:47.582Z m1 must_stop: lane not green (state='stopped'): coverage metric items_swept=400.0 is at or below coverage_min 400.0 — workload coverag`
* `2026-08-16T21:44:16.034Z m5 must_stop: lane not green (state='stopped'): coverage metric items_swept=10.0 is at or below coverage_min 10.0 — workload coverage `
* `2026-09-04T22:08:19.869Z m1 must_stop: lane not green (state='stopped') — must-stop`
* `2026-10-11T05:07:38.747Z m1 must_stop: graft moved nothing — the winning variant produced no commits, so this green is evidence about the GATE, not about new w`
* `2026-10-11T06:16:24.159Z m2 must_stop: green boundary lacks a successful grafted round (no valid tournament evidence) — must-stop`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/blocked_boundary] 3 milestone boundary/boundaries ended stuck — the milestone ended with no path forward; those rounds were paid for and produced no advance (305fcb730ee88510)

**Analyzer:** `blocked_boundary` · **severity:** medium · **fired on:** `promote` learn-anywhere

Evidence:
* `2026-08-16T19:14:05.171Z m1 must_stop: lane not green (state='stuck') — must-stop`
* `2026-09-04T22:42:46.080Z m1 must_stop: lane not green (state='stuck'): stopping after round 1 of 2 this attempt (round id 1): every one of the 1 attempts that `
* `2026-09-05T09:35:57.987Z m1 must_stop: lane not green (state='stuck'): no winner after 4 round(s) this attempt: no variant passed the gate — must-stop`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/dead_variant] 5 variant(s) ended infra_dead — the worker session died; the spend bought nothing and taught nothing about the work (9d726b62e931a7e4)

**Analyzer:** `dead_variant` · **severity:** medium · **fired on:** `promote` learn-anywhere

Evidence:
* `2026-09-05T08:55:08.404Z m1-r2-v1 (barren_session)`
* `2026-09-05T09:11:20.244Z m1-r3-v1 (barren_session)`
* `2026-09-05T09:23:15.187Z m1-r4-v1 (barren_session)`
* `2026-09-05T09:35:50.313Z m1-r5-v1 (barren_session)`
* `2026-09-05T13:42:05.663Z m1-r6-v1 (barren_session)`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/leaked_state] 13 run(s) opened by clearing state a prior run left behind — that many runs ended without cleaning up (c78a3ec438f054c2)

**Analyzer:** `leaked_state` · **severity:** medium · **fired on:** `promote` learn-anywhere

Evidence:
* `2026-08-16T19:31:18.063Z cleared 6 stale variant status heartbeat(s) from a prior run (no phantom dashboard rows)`
* `2026-08-16T20:37:01.899Z cleared 3 stale variant status heartbeat(s) from a prior run (no phantom dashboard rows)`
* `2026-09-05T05:04:29.084Z cleared 1 stale variant status heartbeat(s) from a prior run (no phantom dashboard rows)`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/run_never_finished] a run started while a previous run had not recorded run.finished — the earlier run's end is unaccounted for (d8c932817bbd31dd)

**Analyzer:** `run_never_finished` · **severity:** medium · **fired on:** `promote` learn-anywhere

Evidence:
* `started 2026-09-05T05:04:29.003Z, superseded 2026-09-05T08:36:01.422Z`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/run_never_finished] a run started while a previous run had not recorded run.finished — the earlier run's end is unaccounted for (a2be56a388dd938b)

**Analyzer:** `run_never_finished` · **severity:** medium · **fired on:** `promote` learn-anywhere

Evidence:
* `started 2026-09-05T09:57:10.940Z, superseded 2026-09-18T13:05:33.428Z`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._
## 2026-10-12 — [selfcheck/run_never_finished] a run started while a previous run had not recorded run.finished — the earlier run's end is unaccounted for (6c6f300117be150f)

**Analyzer:** `run_never_finished` · **severity:** medium · **fired on:** `promote` learn-anywhere

Evidence:
* `started 2026-09-18T13:05:33.428Z, superseded 2026-10-11T05:05:24.017Z`

_Appended by `atelier selfcheck close` — a deterministic analyzer, no model in this loop (NG16). Triage the MECHANISM from the code, never from the note._

## 2026-10-12 — /promote learn-anywhere: two seams

- **The extractor specified the whole site, not the feature.** On a prototype
  whose branch is far behind main (64 commits), the extract pass described
  every page it could see on the old app (home text, theme button, word
  search, "Check answers", "Mark lesson complete") — seven criteria, one of
  them about the feature — and the elevator added error states for those. The
  result validated clean and would have rebuilt behaviour main had since
  reversed. It was rewritten by hand at review. The payload has no notion of
  "what this lane added relative to its base".
- **approve-spec could not find the promote record.** The runner wrote
  `.specs/verify/<slug>.promote.yaml` in the main checkout and the spec in
  `.worktrees/<slug>/`; `approve-spec.sh` resolves its root to wherever it is
  run and needs both under one root, so run in the worktree it refused with
  "/promote was not run". The genuine record was copied beside the spec and
  the gate then signed. `PROTOTYPE_LANE_LOCK_HELD=1` was not used.

## 2026-10-13 — resolved upstream

Per the framework session: the 2026-10-11 entry (variant-teardown timeout
crash; green round stranded with no graft record) is fixed upstream (6ef4e68b,
e5234130), and both 2026-10-12 "/promote seams" entries (extractor scope;
approve-spec not finding the promote record from the worktree) are fixed on
the framework's local main (d808f6f5).
