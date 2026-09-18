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
