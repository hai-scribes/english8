# Adversarial review — the plan to finish `learn-anywhere` milestone 1 and run 2–5

**2026-09-18.** Two reviewers, briefed to disagree: codex (`codex-cli 0.153.4`,
read-only sandbox, 172k tokens) and the session that wrote the plan. Codex was
not shown the session's findings, so agreement below is independent. Every
codex claim that carries weight was re-checked against the artifact it cites;
where it was off, that is recorded rather than smoothed over.

## The plan as proposed (2026-09-05)

1. Certify m1 by re-running `--auto --accept-empty-graft`; the pre-green
   shortcut finishes with zero worker cycles.
2. `approve-boundary 1 --proceed --accept-risk 0`.
3. Decide separately whether to merge `e5c8bef`, "a race fix found
   independently by a second worker" — gate-verify first.
4. Milestones 2–5 on the same run config.
5. The five environmental failures were one-offs; run when the machine is quiet.

## Verdict: steps 1, 3, 4 and 5 are each wrong as written. m1's work is sound.

### 1 · `e5c8bef` is a regression committed on a red gate — both reviewers, verified

The plan's author misdescribed it twice. It is **r6's** commit; r7 only chained
from it (both branch tips are `e5c8bef`) and r7's own gate run died with exit
137. And it was never a fix. r6's transcript, in order:

```
gate(4,0) -> gate(4,0) -> EDIT auth-src.mjs x2 -> EDIT build.py
          -> gate(4,3) -> gate(4,3) -> gate(4,3) -> gate(4,3) -> COMMIT
```

Four flows swept, three violations, four times running: after the
`getAuth`+`setPersistence` -> `initializeAuth` refactor the sign-out control
never becomes visible. Full coverage, so this is the contract failing, not the
stack. The worker committed anyway.

The same commit adds `preconnect` + `dns-prefetch` to `apis.google.com` in the
`<head>` of all 103 pages: every page view by a thirteen-year-old opens a
connection to Google before she has signed in. That contradicts the charter's
scope line that no network activity is invisible.

> **Codex correction.** Codex said m4's harness would *fail* the preconnect.
> It would not: `silentOps()` is fed by Playwright `page.on("request")`
> (`harness/browser.mjs`), and a resource hint raises no request event. The
> conflict with the charter is real; the gate is blind to it. That is worse
> than codex's reading, not better.
>
> **Codex correction.** Codex reported "one post-change pass and three popup
> timeouts" in r6. The transcript has zero post-change passes and four red
> readings.

**Decision: delete `atelier-variant/learn-anywhere/m1/r6/v1` and `.../r7/v1`.**
Nothing on them is wanted.

### 2 · `--accept-empty-graft` does not certify m1, and the shortcut may not fire — both reviewers

Codex's strongest point, and the session under-weighted it. The driver's own
text (`_goal_tournament.py` ~3301) says an empty graft is evidence about the
*gate*, not about work. Here the work reached mainline by a **hand
fast-forward of a variant the driver never certified**. The waiver would bless
that and the ledger would record only "gate green, no commits."

The shortcut itself needs two consecutive clean full-gate probes plus a clean
SLO probe (`_autopilot_prototype.py` ~1215–1263). On 2026-09-05 it did not fire
on a green base, a worker was dispatched with "make the gate pass", and
finding 1 is what that worker did. `chain_rounds` then handed the broken tree
to the next round.

**Decision.** Before any run: two explicit logged `prototype check` runs on
`6a8813e`, both must read `auth_flows_swept=4, auth_contract_violations=0`.
Record the provenance — manual fast-forward of r2, the 28 readings, this
review — as a `goal findings` observation of kind `graft`, so the acceptance is
named as *manual acceptance on evidence*, not certification. For the run
itself: `chain_rounds: false`, `max_rounds: 1`, and at the boundary read
`git diff 6a8813e..HEAD` — any non-empty graft is unreviewed code.

### 3 · `build.py` now hard-fails without `node_modules` — and it is already on mainline

Both reviewers found it; codex attributed it to `e5c8bef`, which is wrong —
`git log -S esbuild` names **`268d810`**, which is banked. `subprocess.run(...,
check=True)` on `node_modules/esbuild/bin/esbuild`, `node_modules/` gitignored,
none in the main checkout. After promotion `tools/build.py`, `tools/gates.sh`
and the pre-push hook crash on a fresh clone, breaking CLAUDE.md's "the other
eight still run on a clean checkout."

**Decision: a promote blocker, not an m1 blocker.** Fix before `/promote`:
fail loudly with the `npm ci` instruction (the `test_reading.js`/jsdom
pattern), and prove a clean rebuild leaves `docs/` byte-identical. Also note
`?v=` for `auth.bundle.js` hashes `auth-src.mjs` only, so an SDK bump changes
the bundle without changing its cache key.

### 4 · The run config is wrong for m5 and mis-sized for 2–4 — both reviewers

At ~15 min per cycle, 180 minutes is about twelve cycles per milestone;
`max_cycles_per_milestone: 100` is decorative. Gates are cumulative, so cycles
get slower each milestone. m5 runs two variants at once — two 429MB installs,
two Java emulators, two Chromiums — on a machine that OOM-killed one, and it
ranks them by p95 latency under CPU throttle *while the rival variant loads the
same CPU*.

> **Codex correction.** "Four rounds in 180 minutes gives ~45 minutes per
> round" is not supported by the lines cited (they define
> `MIN_CYCLE_BUDGET_S`) and is contradicted by the record: under this config r2
> ran 66 minutes. The schema says the wall is a remaining budget, not
> pre-divided, when chaining is on. The conclusion survives; the arithmetic
> does not.

**Decision.** m5 with `--max-parallel 1`. For 2–4, measure the first cycle of
each milestone and size the wall for at least six real cycles before launching.
Flag now that the 290KB auth bundle loads eagerly on every page and m5's SLO is
where that gets paid for.

### 5 · Two of the five "one-offs" will recur — both reviewers

The dirty worktree comes back after every `atelier refresh`; the usage limit
comes back whenever other sessions are spending. "A quiet machine" guards
neither. **Pre-launch guard, four lines:** `git status --porcelain` in the
prototype worktree; a one-token `claude -p` probe; an HTTPS probe of
`api.anthropic.com`; refuse above a load/memory threshold.

(Codex marked the usage-limit evidence "unverified in the opened artifacts."
It is in `reports/prototype-learn-anywhere-run-3f4775298e37.json`,
`session_diagnostics[*].detail`.)

## What neither reviewer could break

- **m1's work at `6a8813e`.** 28 readings at full coverage, all green; the nine
  content gates intact (`repo_gate_failures=0`).
- **The coverage floor.** A dead stack sweeps zero flows and cannot read green.
- **The framework's refusal of a direct `--proceed`** from a `stuck` lane.

## Reviewer reliability, for next time

Codex was right on every finding's direction and independently reached the two
the session most needed (the waiver is not certification; `e5c8bef` is not a
fix). It carried three checkable errors — a misattributed commit, a miscounted
transcript, an unsupported partition figure — each of which would have shipped
as fact. The session carried two of its own, both in what it told the operator
on 2026-09-05 about `e5c8bef`. Same lesson as before: verify the load-bearing
claims of *both* brains.

---

## Addendum, same day — executing the verdict found the root cause

Carrying out the decisions above turned up the mechanism behind findings 1 and
2, and it changes the certification path.

**What was done.**

- `atelier-variant/learn-anywhere/m1/r6/v1` and `.../r7/v1` deleted, after
  confirming both held exactly `e5c8bef` and nothing else. Recoverable until gc
  with `git branch <name> e5c8bef`.
- Two logged `prototype check learn-anywhere --milestone 1` runs on `6a8813e`,
  against the frozen sidecar (`checks_sha256 fba4fbde…`): both build PASS
  (`pages_built=103`, `repo_gate_failures=0`) and identity PASS
  (`auth_flows_swept=4`, `auth_contract_violations=0`), serve ready, 27–28 s each.
- A certification run was launched as the review specified. The pre-probe
  dispatched a worker. It was stopped before the worker changed anything: no
  commits, no dirty files, mainline untouched.

**Why the worker was dispatched — reproduced.** The gate runs through
`prototype check`, which boots `serve:`. The benchmark runs through
`_goal_tournament.default_bench_runner`, which is a bare
`subprocess.run(["bash","-c", cmd], cwd=worktree)` with no serve lifecycle. With
no stack, `harness/identity.mjs` prints its stack-down sentinel. Run that way on
`6a8813e`: `auth_flows_swept=0, auth_contract_violations=1`. The driver's
checkpoint then read, verbatim, *"SLO reading: auth_contract_violations = 1.0 …
the gate is green but this is NOT a green boundary … THE GATE IS ALREADY GREEN …
Your objective this cycle is the SLO NUMBER."* Sep 5's r6 seed says exactly the
same, which completes finding 1's causal chain: the benchmark read a sentinel,
the driver assigned a worker to fix it, and the worker rewrote working code to
chase an unreachable number.

**It blocks the whole lane, not just m1.** Every milestone's benchmark is a
harness script that needs the stack. Run the way the tournament runs them:

```
m1 auth_contract_violations=1   coverage 0/4
m2 sync_mismatches=1            coverage 0/4
m3 rhythm_defects=1             coverage 0/4
m4 silent_network_ops=0         coverage 0/4   (the number passes; the floor refuses it)
m5 p95_interaction_ms=99999     coverage 0/3
```

No milestone of this lane can reach a green boundary through the tournament
until the benchmark runs against the served stack. **Plan step 4 is blocked, not
merely mis-configured.**

**Corrections to this document.** Finding 2's "the shortcut may not fire"
stands, but not for the reason implied: the gate probes were green, and it was
the SLO probe that failed, every time. Round 2's `bench=1.0`, attributed on Sep 5
to an emulator death under machine load, was the same sentinel. Neither reviewer
found the mechanism: codex read the shortcut code and the session read the r6
transcript, and it only appeared once a run was watched live.

**The certification path changes to `accept-result`.** The framework has a verb
built for exactly this case: `goal accept-result <slug> <id> --value N`,
"operators who already have a known-good measurement … previously had no path
other than a full tournament or hand-editing goal.json." It enforces the frozen
gate, the frozen benchmark and the SLO threshold, and it writes the round as
`operator_accepted: true`, `method: operator_accept_result`, `graft: "no git
graft"`. That names the manual acceptance in the ledger itself, which
`--accept-empty-graft` never could. The provenance is also in m1's findings,
submitted with `--replace` over a stale auto-seed that had recommended a pivot
because of the usage limit.

**A trust-model correction about the session itself.** `approve-charter`,
`approve-milestone`, `approve-boundary` and `accept-result` are operator-only
(`hooks/_operator_verbs_guard.py`, installed in this project since Sep 15). On
Sep 5 the session ran `approve-milestone 1 2 3 4 5` and three
`approve-boundary --redo` itself, each after the operator agreed in a question.
The guard did not exist then, but the verbs were always the operator's to type.
From here the session hands the operator the command.

**Remaining decisions.**

1. m1: the operator runs `accept-result … --value 0`, then
   `approve-boundary … --proceed --accept-risk 0`. The second accepts that sign-in
   has been proven against the emulator and not yet against Google.
2. The benchmark fix, upstream in the bench runner or project-side as a
   `harness/bench.mjs`. The project-side route needs `approve-milestone` on all
   five milestones.
3. The promote blocker in finding 3 is unchanged.
