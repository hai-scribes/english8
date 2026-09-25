---
description: "The prototype lane's measurable-goal layer — charter, milestones, frozen gates, boundary runs."
disable-model-invocation: true
---

You are the `/prototype-goal` command — the **opt-in measurable layer** on top of an existing prototype lane. `/prototype` creates the branch, the worktree and the harness; free-form hacking needs nothing more. This command adds what free-form hacking cannot give you: a benchmarkable **Product Charter** → ordered **milestones** (each with a frozen gate + SLO + committed benchmark) → operator-frozen plan → **attended** runs that stop at each milestone boundary for approval.

Run it when the operator wants a measurable, autonomously-drivable goal — it is also the prerequisite for `/prototype-auto` (same setup; the driver decides each boundary instead of stopping).

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 and `docs/atelier/ATELIER_AUTOPILOT.md`.

The user's input (slug, plus any goal statement): $ARGUMENTS

---

## Step 0 — Preconditions

The lane must already exist (`atelier prototype resume <slug> --agent --compact` exits 0) and its harness must be stood up — `.specs/prototype/<slug>.checks.yaml` with **≥1 `kind: interaction`** scenario. If either is missing, go do that under `/prototype` first: `approve-milestone` hash-binds checks.yaml into the gate, so a goal run will not bootstrap a harness mid-tournament, and the working-UI guard refuses *any* milestone run (exit 2) until the interaction scenario exists.

**Read the vocabulary from the substrate, not from memory:**

```bash
atelier prototype goal schema
```

This emits the live enums and field shapes (tiers, metric priorities, verification modes, evidence strengths, assumption provenances, decision types, gate-check kinds, SLO directions + accepted aliases, milestone/metric/charter field shapes, and the `checks.yaml` format) straight from the `_goal_lane` constants the validators use. It is the single source of truth; this prompt carries the **rules and rationale** that a schema dump cannot express, and deliberately does not restate the field lists.

## Step 1 — Goal discovery (the charter)

Pick the ambition **tier** from the ask (default low):

- `spike` — "is this possible/useful?" (cheap; 1–3 metrics, no full coverage) — the lightweight on-ramp.
- `prototype` — "a usable demo proving value" (default for most asks).
- `product` — only when the operator clearly wants an AAA / world-class build.

```bash
atelier prototype goal init <slug> --idea "<one-line goal>" --tier <tier> --agent --compact
```

Then EARN a high-quality goal — do the work a world-class designer / developer / owner would:

1. **Clarify only blocking unknowns** via `AskUserQuestion` — never interrogate a clear ask.
2. **Research** (web + codebase): prior art, "what good looks like", table-stakes vs delighters. Record findings: `atelier prototype goal discover <slug> --note "…"`.
3. **Draft the charter** machine core (status stays `proposed` until the operator freezes):

```bash
echo '<charter-json>' | atelier prototype goal charter <slug> --set-json - --agent --compact
```

Field shapes come from `goal schema` (`charter_fields`, `metric_fields`, `assumption_fields`). What the schema cannot tell you:

- **Non-goals are first-class.** `scope.out` is load-bearing, not decoration.
- **`assumptions[]` is the anti-smuggling ledger.** Every AI-inferred claim goes there with `provenance: ai_inferred`. The field is `text`, NOT `claim`. An assumption `id` must NOT collide with a `success_metrics[].id`, because `--with-risks <id>` addresses exactly one thing.
- **Defer honestly.** Any section you legitimately can't fill takes `deferred.<field>: "<reason>"` rather than a fabricated value.
- **Iterate before you present.** `charter --set-json` does NOT validate; `approve-charter` does. Run `charter <slug>` with no `--set-json` to see validation errors + the assumptions requiring approval, and fix them first — otherwise the operator's freeze is where you discover the shape was wrong.

## Step 2 — Operator freezes the charter (trust anchor)

Present the approval summary: critical metrics, non-goals, deferred gaps, AI-inferred assumptions. Then hand over the freeze command **exactly as `goal charter` prints it** — the `approve_command` field of `atelier prototype goal charter <slug> --agent --compact` — and stop:

```bash
atelier prototype goal approve-charter <slug> --with-risks <every required id>
```

The operator types that in their own terminal, or with a `! ` prefix in the Claude Code prompt — or, on macOS, clicks Approve on the dashboard (`atelier dashboard`), which renders the charter with every risk id and asks the OS for Touch ID or the login password before running this same verb (ADR-W8.6-1). Offer both. **Do not assemble it by hand and do not append `--agent --compact`** — those flags shape output for YOUR parser and are noise on a human's screen. **Check `validation_errors` is empty first**: the envelope emits `approve_command` unconditionally, so handing it over while the charter still fails validation gets it refused for reasons that have nothing to do with risk. `approve_command` carries the complete `--with-risks` set from `required_risk_ids` — the same set the refusal enumerates, so a re-run with the printed command accepts every id the freeze asks for. Three kinds of id are in it: every assumption flagged `requires_approval` or carrying `ai_inferred` provenance, every `critical` metric still at `evidence_strength: placeholder`, and every `critical` metric measured only by `proxy` (that last one is what `check_traceability` reads — an unaccepted proxy metric freezes a charter `goal propose` can never satisfy). **Why the operator, not you:** `block-operator-verbs.sh` (a PreToolUse hook) refuses `approve-charter` / `approve-milestone` / `approve-boundary` / `accept-result` from the AI's Bash tool, and `ATELIER_AUTO_MODE=1` makes the CLI itself refuse `approve-charter` and `approve-milestone` (the hook is the only gate on the other two — `--auto` legitimately advances boundaries). A charter the AI froze would vouch for the AI's own claims (trust-anchor violation A1, downstream triage 2026-06-17). **Why the command is long:** every id is an unvalidated claim the freeze vouches for, and the ledger records exactly which ones were consciously accepted; fewer `ai_inferred` assumptions means a shorter command — validate them, or give them a real provenance, rather than accepting them by reflex.

**The freeze REFUSES** when any required id is missing from `--with-risks` — ONE refusal naming both halves and the full recovery command. It still refuses a non-benchmarkable charter. Surface its errors verbatim. **You never freeze — the operator does.**

**STOP here until the freeze lands. Do not front-run it.** Drafting milestones, per-milestone gate sidecars, milestone harness code or honesty reviews before the charter is frozen makes the freeze a rubber stamp over sunk work (the slug-level `checks.yaml` from Step 0 is a precondition of this command, not front-running) — an operator who would have cut a metric no longer can without discarding thousands of lines — and anything authored against an unfrozen charter is authored against a moving target. A stick written before the thing it measures is right; a stick written before the charter that defines the measurement is not.

## Step 3 — Decompose into milestones (risk-first, SLO-traced)

Propose ordered milestones, **design-risk-first**. `goal schema` → `milestone_fields` gives every field and its shape; `atelier prototype goal show <slug> <id>` dumps ONE milestone in full (`--agent` = the complete object — `propose --agent` only echoes a summary). `goal propose` shape-checks the list at authoring and surfaces `milestone_errors` (bad id type, string benchmark, invalid gate-check kind) there rather than as a late refusal at `approve-milestone`, and **grandfathers** a shape rule added after an already-frozen/complete milestone was approved into a non-blocking `legacy_milestone_warnings`.

```bash
echo '<milestones-json-list>' | atelier prototype goal propose <slug> --set-json - --agent --compact
```

Beyond the shapes:

- **Seed `approach_candidates` from credited prior art.** Seats are filled **in order**, so only the first `n_variants` candidates ever run — anything beyond that is dropped (recorded on the round, never queued for a later one). Seed at most `n_variants`, or raise it. Omit them entirely and every seat falls back to a generic diverge-from-the-other-seats directive with no prior art to work from.
- **Keep milestones measurably independent.** Two milestones that share a `benchmark.command` are one measurement reported twice: their SLOs move together, and a regression in that harness fails both at once — so the plan looks decomposed while the evidence is coupled. `goal propose` now advises (non-blocking) when it sees this. It is sometimes the right call — one harness, genuinely different `fixed_workload`s — but then give each a distinct `slo.metric_id` so a milestone can fail on its own. **This pulls against the traceability rule**, which requires every SLO to trace to a charter metric: with few charter metrics the path of least resistance is one metric, one benchmark, N coupled milestones. If you find yourself there, the fix is usually another charter metric, not another milestone on the same one.
- **The FINAL milestone MUST have ≥1 `kind: interaction` gate check** — it is what certifies a working UI.
- **`gate.checks` names MUST equal the scenario set already in `.specs/prototype/<slug>.checks.yaml`.** Rename on ONE side, not both, and re-run `atelier prototype check <slug>` after any edit. A milestone's gate resolves to `.specs/prototype/<slug>.m<id>.checks.yaml` when that sidecar exists, else the slug-level `<slug>.checks.yaml`; `approve-milestone` hash-binds whichever it resolved, and `atelier prototype check <slug> --milestone <id>` executes that same file. Without `--milestone`, `check` runs the slug-level file — which can grade a milestone against a gate it never declared.
- **Confirm the cut line with the operator** (in vs out) before freezing anything. Three different things, do not conflate them: `active: false` **CUTS** a milestone — its metric stops counting toward charter coverage, which usually breaks the plan's arithmetic. `atelier prototype goal defer <slug> <id> --reason '<why not yet>'` means **planned, not ready to run**: coverage still counts it, no run or preflight asks for its freeze, and the goal cannot report `complete` while it stands (`--undo` reverses it). Deferring is what to reach for instead of freezing a gate for work nobody is ready to attempt — a freeze granted over an unattempted milestone is a rubber stamp, and it costs a reopen cycle when the harness turns out to need a fix. Only a `proposed` milestone with no frozen gate can be deferred, and the LAST milestone never can.
- **If the acceptance is a human LOOK, say so: `human_checkpoint: true`** (or a string naming what to look at, e.g. `"the toolbar beside Safari, full-screen"`). Use it for any aesthetic / feel / "looks and moves like X" objective. It runs ONE variant and stops `--auto` at the boundary however green the gate goes. Both halves matter: a green means only that *the numbers you chose* matched, and on this kind of objective those numbers are the part most likely to encode the wrong idea — so fanning out spends the whole budget before the one judge who can say "no" has seen anything. Ranking N variants by a number cannot help when the criterion is not that number.
- **If the objective is "like X", make X a run target: `gate.reference`.** A gate authored from a belief about X, then validated by a throwaway built to satisfy that same belief, proves only self-consistency — it cannot discover that the belief is wrong. Declare `gate: {reference: {id: "safari", env: {ATELIER_GATE_TARGET: "safari"}}}`; the `env` is how your harness is pointed at the reference — the same seam a variant gate already uses, so it is a few lines in the harness, not a new mechanism. Then **measure the reference before the operator freezes anything**: `atelier prototype run <slug> --reference-probe --milestone <id>`. `approve-milestone` REFUSES the freeze until the reference PASSES, and the reading is bound to both instrument hashes, so editing the harness means re-measuring. Measuring the real thing first is also the cheaper order: a probe costs one gate pass, a wrong gate costs a tournament.
- **If the gate drives the real keyboard, mouse or screen, declare `gate.needs: ["exclusive-input"]`.** It makes the milestone a singleton — variants are serialized whatever `--max-parallel` says, because a cursor cannot be namespaced the way a port or a TMPDIR can, and two variants driving it produce two corrupted readings rather than two readings. Mind the budget consequence: serial variants SPLIT the round's wall grant N ways. For a GUI milestone judged by eye, pair it with `human_checkpoint` (one variant).
- **Size the wall budget to the gates you just declared.** `goal["run"].max_wall_minutes` is a MILESTONE total; 80% of it is the variant share, and `round_wall_minutes` grants each round what REMAINS of that share rather than a static slice. Under the default parallel execution every variant in a round shares that grant — `n_variants` divides it only on the serial path. (`max_cycles_per_milestone` *is* the total that `partition_budget` splits by `n_variants × max_rounds`; the two axes do not work the same way.) The defaults were sized for a handful of scenarios. Gates that accumulate every prior scenario (a regression-safe habit) grow the per-cycle gate time with every milestone, and a budget that stops on time rather than on evidence looks exactly like model failure. Change it with `atelier prototype goal run-config <slug> --set-json -` (`max_cycles_per_milestone` / `max_wall_minutes` / `no_progress_limit` / `chain_rounds`; `goal schema` → `run_fields` lists the keys) — `init` seeds the block from `RUN_DEFAULTS` and `run-config` is the only verb that changes it; `goal propose` takes a LIST of milestones and cannot touch it.

### Performance milestones — measure honestly

See `docs/atelier/ATELIER_PERF_MEASUREMENT.md`. A perf SLO must record a **bounded number, never a bare PASS**:

- **Type the milestone `decision_type: perf_bakeoff`** so the ≥2-benchmarked-variant comparison bar applies and its honesty review gets the perf-specialised prompt. (The honesty review itself gates EVERY milestone, typed or not — see Step 5.) (Untyped perf work is still protected — a metric-intended milestone that produces zero measured values fails selection rather than grafting an unmeasured winner — but typing makes the bar explicit.)
- **If the WORKER must run commands, say so: `worker: {exec: true}` on the milestone.** Without it the worker's Bash is limited to `git` and `atelier`: it can edit, commit and run the gate (`atelier prototype check`), but `node`, `python3`, `npm`, a dev server or any direct test run is refused, and in an unattended run each refusal costs a turn. Declare exec when the work needs those commands outside the gate. A `perf_bakeoff` implies it (its variants must build and run a real harness to be comparable), and an explicit value wins in both directions, so `exec: false` declines it on a bakeoff. A `benchmark.command` does NOT imply it: the driver runs the benchmark after a gate pass, so it says nothing about the worker. An unrecognized key under `worker` is an authoring error. The run prints which route granted exec.
- The `benchmark.command` harness must emit `ATELIER_METRIC <metric_id>=<number>` on stdout (a bare number, no unit). **Headless throughput lies three ways**; use a harness that flushes per frame, calibrates the readback cost, and guards implausible results — see the reference harness at `docs/atelier/examples/perf-harness-reference.mjs`. A benchmark that runs (exit 0) but emits no parseable `ATELIER_METRIC` is reported as **unparsed** (`benchmark_value` null, named in the selection-failure reason) — add the metric line to a dispatcher-style gate (`check.mjs --only …`) that only prints prose.
- **Assert the workload actually RAN — `slo.coverage_metric_id`.** A soak/perf gate can pass while testing nothing (a loop that never executed still emits "0% growth"). Declare a SECOND, DISTINCT metric the harness emits to prove the workload ran (e.g. `frames_swept`, with optional `coverage_min`, default 0); `coverage_min` is an **inclusive** floor — a reading equal to it passes — and a winner whose coverage is missing, zero, or below `coverage_min` is **not green** and stops for review. A zero reading is refused whatever the floor says: "the workload ran at all" is a separate guard from "coverage cleared your bar". `goal propose` advises (non-blocking) when a perf gate declares no coverage metric.
- Optionally declare `slo.plausible_min` / `slo.plausible_max` / `slo.implausibility_factor` so a 166×-too-good measurement artifact STOPS the boundary for review instead of certifying a fantasy green. On a **minimize** SLO this is not optional in practice: with no floor, a placeholder `0` or a workload that never ran is the best possible reading and certifies — `goal propose` advises when a minimize SLO declares neither `plausible_min` nor `implausibility_factor`.
- **`slo.cv_threshold` is a PERCENT, and it obliges you to measure alone.** The harness emits `ATELIER_CV <metric_id>=<float>` as `100 * stddev / mean` — a threshold of `0.4` means 0.4%, and a harness emitting the raw ratio compares 1.02 against 0.4 and refuses a measurement that was perfectly stable. More important: declaring it says this number's STABILITY decides the boundary, and the framework will otherwise destabilise it for you. A `perf_bakeoff` mandates ≥2 variants, they build and drive the workload CONCURRENTLY on one machine by default, the winner's reading is taken inside that parallel task, and nothing re-measures it alone afterwards — so a latency or throughput number is certified under contention. Measured: p95 35.6ms with CV ~1.0 under 3-way load versus p95 ~25ms and worst per-class CV ~0.08 serial, on the same gate. **If the metric is contention-sensitive, set `run.max_parallel: 1`** (`run-config`, or `--max-parallel 1` at launch); the bake-off still gets its ≥2 variants, in sequence. Preflight now warns when a `cv_threshold` milestone is about to fan out. Contention-insensitive metrics (bundle size, token count, accuracy) need none of this.

### Protecting the measuring stick — `gate.artifacts`

The frozen gate hashes command *strings*, but a command like `node harness/capacity.mjs` *executes a file* in the variant's worktree. Without protection a variant could ff-graft an edited `harness/capacity.mjs` (weaken the artifact guard, fake a faster number) and the re-gate would run the **tampered** harness while the gate hash — which never saw the file — stayed green.

```yaml
gate:
  checks: [...]
  required_tier: interaction
  artifacts: ["harness/"]   # files/dirs the gate+benchmark EXECUTE — the measuring stick
```

`approve-milestone` content-hashes these (from the prototype worktree) into `gate.artifacts_sha256`. The run/boundary preflight re-hashes the live files (an operator/main-tree edit is refused), and the graft guard diffs each winning variant against its base over the declared paths — **a variant that edits the measuring stick it is judged by is disqualified and the graft is refused** (fail-closed to operator review). **REQUIRED for a `perf_bakeoff`** (an undeclared stick is the original hole) **and for any milestone whose checks.yaml declares a top-level `serve:` block** — `approve-milestone` refuses with `gate-artifacts-required-for-serve` (exit 2), because hashing `serve.command` binds the boot STRING, not the boot TARGET. Since the harness brief tells you to author `serve:` for anything that serves, that covers the ordinary web/API case. Optional only otherwise. Declare the **whole measurement subtree** — the harness dir, fixtures, helper modules, and any dependency manifest `setup` reads — a single-file declaration misses a helper the harness imports.

**The product side has a mirror now, and it is weaker on purpose.** `gate.artifacts` stops a variant editing the thing that measures it; the other way to pass dishonestly is to delete the thing being measured — the application validation the gate keeps tripping over. At the graft the winner's diff is scanned OUTSIDE `gate.artifacts` for guard constructs (`throw`, `raise`, `assert`, `panic`, `invariant`, `require(cond)`) that left and did not come back, counted **net** per file so a rename or a re-throw scores zero. A net removal does not disqualify anyone — it is a heuristic over a diff, not a hash comparison — it raises a boundary review item naming the files and quoting a removed line, and an attended `--accept-weakened-product` clears it. You do not declare anything to get this; it applies to every milestone.

### A benchmark that measures the served app — `benchmark.lifecycle`

The gate boots the checks file's `serve:` app around its scenarios. The benchmark does **not**, by default: it runs as a bare command, on the assumption that it starts whatever it measures (`lifecycle: self_boot`). A harness that instead talks to the gate's served app finds nothing listening, prints its stack-down value on every reading, and the milestone can never reach a green boundary — while the gate stays green on the same tree. Declare which one you wrote:

```yaml
benchmark:
  command: "node harness/sweep.mjs"
  lifecycle: needs_serve   # boot `serve:` exactly as the gate does, then run this against it
```

`needs_serve` runs the benchmark through `atelier prototype bench-serve` (same `setup`, readiness poll, `$ATELIER_VARIANT_PORT` and teardown as the gate — run it by hand to reproduce a reading). It is frozen with the benchmark, so adding it to an approved milestone means a re-freeze. Do **not** declare it for a harness that boots its own stack: two servers would collide on the variant port. `--preflight` refuses `needs_serve` without a `serve:` block, and advises when a bare benchmark next to a `serve:` sweeps nothing. Declare a `slo.coverage_metric_id` either way: a reading whose coverage is zero or missing is treated as **not measured** — never handed to a worker as a number to chase, and refused at the boundary.

## Step 4 — Operator freezes each active milestone's gate

Every benchmark must trace to a charter metric (CLI-enforced):

```bash
atelier prototype goal approve-milestone <slug> <id>
```

Same rule as Step 2: this is an operator verb, so hand it over without `--agent --compact` and let them run it. The dashboard lists every milestone still needing a freeze — objective, SLO, benchmark, gate commands — and approves one, a selection, or all of them behind one presence prompt, each still a separate single-id run of this verb.

**Probe the gate BEFORE you hand the freeze over — that part is yours.** `atelier prototype run <slug> --preflight --milestone <id> --agent --compact` runs THIS milestone's gate once in a throwaway worktree, with its `serve:` booted, even while an earlier milestone is still parked ahead of it. Read two rows before the operator freezes anything: `gate_prework_failure` (a failure inside a fixture self-check, or any assertion the fixtures themselves violate, is a broken gate, not missing work) and `gate_discriminates` (a gate that already passes on the pre-work tree certifies nothing, and `--auto` will stop that milestone at an empty graft). **And if the milestone declares a `gate.reference`, run `--reference-probe` too** — the freeze refuses until the reference passes, so finding it here costs a probe rather than an operator round trip. Fix the gate first; after the freeze the same fix costs a tournament plus `amend-milestone --reopen` and a second operator freeze.

**Only freeze what you are about to run.** `--preflight --max-milestones N` scopes the `goal_frozen` row to the N milestones the run will actually execute, so a later milestone's gate does not have to be frozen before anyone has attempted it. `defer` the ones further out (above). Two preflight rows are worth reading before every launch, both advisory: `budget_realism` divides a MEASURED gate pass into the wall to say how many attempts the budget really buys (it says so plainly when no pass has been measured yet, rather than guessing), and `round_chaining` warns when `max_rounds > 1` with `run.chain_rounds` off — round 2 then restarts from the same base, so a round reaped by the wall makes the next one provably identical and the run stops instead. Rounds buy a different APPROACH, not more time for this one.

**A harness fix after the freeze costs ONE command.** `approve-milestone <slug> <id> --adopt-edited-gate` re-freezes an edited gate on a milestone parked at a boundary OR approved-but-never-run, archiving any rounds exactly as `--redo` does. It re-decides the honesty review, because that review vouched for a measuring stick that just moved: it is marked stale by default, and `--reaffirm-honesty` keeps it answered while recording the operator's re-affirmation against the new gate hash. Do not reach for `amend-milestone --reopen` for a pure machinery fix.

This **binds the executable gate** into the freeze (a SHA-256 of the checks.yaml command bodies) and **snapshots the approved checks.yaml body** so the freeze is recoverable. It **refuses** if checks.yaml is missing or if its scenario set ≠ the milestone's declared `gate.checks` (it would otherwise silently judge the milestone against scenarios it never declared). A post-approval edit is caught at run/boundary preflight, which prints expected vs actual hash AND a unified approved-vs-current diff. It also **refuses a `complete` or `running` milestone** — re-freezing one would rewind completed history (use `approve-boundary <id> --redo` to re-open a finished milestone).

**Several ids in one invocation, for re-freeze only.** Editing anything under `gate.artifacts` invalidates every frozen milestone that declared it — correct, and the guarantee working, but an intended harness fix then costs one reviewed command per milestone (measured downstream: 4 milestones on one goal, 10 on another). So `approve-milestone <slug> <id> [<id> …]` accepts a list **only when every id is already frozen and differs solely in `artifacts_sha256`** — i.e. the machinery moved and nothing else. Anything else (an unreviewed milestone, a changed declaration) still takes one id at a time, so a batch can never rubber-stamp a milestone no one read. All-or-nothing: one bad id writes nothing. This is deliberately not a re-hash escape hatch — each id re-runs the full validate → bind → hash → freeze, which is why it does not become the bulk-resign tool R7.3 forbids.

```bash
atelier prototype goal gate <slug> <id>            # the three frozen hashes + a legend naming
                                                   # what each covers and what breaks it,
                                                   # plus live match status and the drift diff
atelier prototype goal gate <slug> <id> --restore  # rewrite checks.yaml back to the approved body
```

A **comment-only edit to checks.yaml breaks none of the three hashes** (the parser strips comments), so the gate file can be annotated freely without re-approval. A scenario's optional **`setup`** field runs arbitrary shell before `command` and IS bound into the frozen hash — keep it **idempotent** — and **concurrency-safe**, since variants run in parallel on one machine: the `harness_brief` returned by `prototype start` carries the authoritative rules (per-variant `TMPDIR`, variant-scoped caches and derived-data paths, binary-safe assertions), and it is the copy to read. Hashing the setup *string* does not protect the *files* it reads (`package.json`/lockfiles); declare those in `gate.artifacts`.

A scenario's `command` (and `setup`) may be a **YAML literal block scalar** — the natural form for a multi-line `node -e '…'` or several-line shell gate:

```yaml
  - name: interaction
    kind: interaction
    command: |
      node -e 'const h=require("fs").readFileSync("index.html","utf8");
      if(!/addEventListener/.test(h) || !/classList\.toggle/.test(h)) process.exit(1)'
```

The block body is preserved verbatim and run via `/bin/sh -c`.

**Canonical location (read this — top operator cost).** `checks.yaml` and `goal.json` are **canonical at `<main-worktree-root>/.specs/prototype/<slug>.*`**, where the main-worktree root is resolved *from git* (`git worktree list`), independent of your cwd. Two consequences: (1) if your HOME (or any ancestor) is itself a git repo, a goal launched from inside it resolves the main root to **that** repo — so the specs can land in `~/.specs/prototype/` rather than the project you think you're in; and (2) a `.specs/prototype/<slug>.checks.yaml` you hand-create *inside a linked worktree* is **ignored**. Every gate/checks error prints the absolute resolved path it read, and `approve-milestone` warns when a divergent worktree-local copy exists, naming both paths. When confused about which file is live, run `goal gate <slug> <id>` (or read `checks_path` in any `--agent` envelope) — it resolves the same file the freeze bound: the per-milestone `<slug>.m<id>.checks.yaml` sidecar when one exists, else the slug-level file.

## Step 5 — The honesty review (a HARD boundary gate)

**EVERY milestone carries one** — "where can this fabricate or claim something it didn't measure?" — and you MUST answer it before the boundary advances:

```bash
echo '<surfaces-json-list>' | atelier prototype goal honesty <slug> <id> --set-json -
```

An empty `[]` asserts no fabrication surface; otherwise a list of `{surface, mitigation, resolved}`. A **typed** milestone (`perf_bakeoff` / `provider_probe` / `correctness_call`) gets the type-specialised prompt; an **untyped** milestone gets the generic one (an untyped UI can also show invented data or a stubbed affordance). The `--auto`/`--preflight` launch gate **refuses (exit 9) ANY milestone whose honesty review is unanswered** — unless `--force` is passed, which waives the whole preflight (unlike the working-UI interaction guard, which sits above the `--force` branch and is never waived) — otherwise the run executes the entire tournament and only then blocks. A `decision_type` additionally imposes its type-specific evidence bar (≥2 metered passers for a bake-off, a recorded `probe_observation` for a probe).

**Boundary-only surfaces — `deferred_to_boundary`.** Some surfaces can only be CONFIRMED at the boundary, not pre-run (e.g. "a headless FPS reading ≠ the FPS a user sees presented"). Marking such a surface `resolved: true` pre-run to start the run would be a lie. Mark it `deferred_to_boundary: true` instead (it MUST carry a `mitigation` or `confirmation_needed` stating what boundary evidence would confirm it). A deferred surface does not block the launch, but at the boundary an attended `approve-boundary <slug> <id> --proceed --accept-risk <index|substr>` must consciously accept it (recorded with reviewer + timestamp; see the indices in `goal honesty`). **`--auto` stops for a human on a deferred surface** — unless the operator deliberately launched with `atelier prototype run <slug> --auto --accept-deferred`, which pre-stamps every open `deferred_to_boundary` surface for that run (attended `--accept-risk` is then not required). An acceptance is valid for one boundary and is cleared on the next run/redo.

**Optional, before launch — probe the gate.** `atelier prototype goal gate-probe <slug> <id>` runs one worker (~$0.12) told to get the FROZEN gate green doing only what its checks observe. `WEAK` prints the diff the gate accepted — the part of the objective no check reads; strengthen the gate before spending a tournament on it. `HELD` means a hurried worker could not fake it. Advisory; it changes no goal state. Operators redid milestones after a green gate that measured a proxy (a fixture-fed path, a model of the surface) — this is the cheap way to find that first.

## Step 6 — Run the milestone (attended)

```bash
atelier prototype run <slug> --preflight --agent --compact   # first — a dry check, no run
atelier prototype run <slug> --agent --compact
```

**Preflight first, every time, and treat a red as a refusal.** Only `--preflight` (and `--auto`'s launch gate) checks the lane BRANCH out into a fresh worktree and runs every gate command there. An attended run hashes the gate against your LIVE tree but forks its variants from the branch, so a harness you have not committed behaves differently in the two: an UNCOMMITTED one stops the round at start (`has uncommitted changes — cannot start a round`, naming the files), while a GITIGNORED one passes that check and every variant exits 127 on the milestone's own benchmark — which reads like model failure. Check with `git status --short --untracked-files=all --ignored` in the prototype worktree, or run `--preflight`, the only thing that executes the gate in a fresh checkout.

Run it **backgrounded** (`run_in_background: true`) — the default budget exceeds the 10-minute Bash ceiling. The driver spawns N variant worktrees from the milestone base, runs each through the empirical loop (each variant's seed carries the SLO it will be judged by, and the FIRST cycle its gate reads green the driver measures the SLO once and feeds the number back through the checkpoint — so a variant that passes the gate but misses its number can still act on that while cycles remain), benchmarks the gate-passers, selects a winner (deterministic by SLO; cross-family adversarial judge on a near-tie), fast-forward-grafts the winner, re-gates on mainline, and stops at `pending_approval` — **green vs SLO, no vibe-greens** — re-rendering the **single stacked report** `reports/prototype-<slug>.html` (one file, every milestone stacked; open it once).

## Step 7 — Boundary: findings → narrate → report → operator approval

Read the result envelope + report + `discovery.jsonl`. The driver auto-seeded objective findings; **ENRICH them** with what changed prior theories:

```bash
echo '<findings-json>' | atelier prototype goal findings <slug> <id> --set-json - --agent --compact
```

**This is also where you get the narration handle.** Because findings are part of the hashed spine, submitting them changes the section hash — so the reply carries a `narration` block with the now-current `section_hash`, this milestone's report-model `section` (the facts your prose explains), and the exact `narrate_with` command. Use it. Do **not** read a hash from an earlier `goal report --emit-model`: it is stale by construction, and narrating against a stale hash is refused (it would otherwise store prose the report can never show). `goal report --emit-model` remains the fallback if `narration.ok` is false.

**Then author the AI narrative** — the readable, human-facing part of the report. The report is **two-layer**: a deterministic SPINE (verdict / SLO / open items / honesty — computed from `goal.json`, the authority, which you must NOT contradict) plus your **non-authoritative commentary** woven into each section.

```bash
echo '<prose-markdown>' | atelier prototype goal report <slug> --narrate <id> --section-hash <hash from narration> --agent
```

Narration rules (load-bearing — the spine is the authority):

- **Explain, don't decide.** The narrative clarifies *what happened and what it means*; it NEVER states a verdict, green/blocked status, or next command — those are the spine's, deterministically. A genuinely new recommendation or theory-change goes through `goal findings` FIRST (then rendered as a fact), never invented in prose (NG25 — no NL advice surface).
- **Markdown only, no HTML.** `**bold**`, `*italic*`, `` `code` ``, paragraphs, `-` bullets. Raw HTML is escaped, not rendered.
- **Freshness is automatic.** The narrative is keyed to the spine's `section_hash`; if the milestone is later re-run / amended / pivoted, the stale prose is hidden and you re-narrate against the new hash.

Surface the regenerated stacked report `reports/prototype-<slug>.html` (the one artifact that lands with the operator — also live in the dashboard's *Goal runs* panel), state your recommendation (proceed / iterate / pivot / edit-goal, with why), and let the operator advance:

```bash
atelier prototype goal approve-boundary <slug> <id> --proceed [--tryout-note "…"]
# or --edit (re-open downstream un-run milestones)  /  --pivot (new direction)
```

`approve-boundary` refuses until findings are recorded; `--skip-findings "<reason>"` consciously waives that (the reason is logged in the discovery ledger). `--proceed` advances to the next milestone — re-run Step 6 — until the final milestone completes → point at `/promote <slug>`. If the run stopped short of a green boundary (SLO miss / stuck / graft fail), surface the report's "what's still open"; do NOT re-run blind. **Most such stops ALSO leave the milestone at `pending_approval`** — the lane state (`stopped`/`stuck`) is what says it is not green. There `--proceed` is refused by construction, and `--edit`/`--pivot` re-plan the milestones after it but leave this one parked; the way off the boundary is `--redo`.

**Before you propose relaxing ANY guard that is blocking a boundary — a `cv_threshold`, a `coverage_min`, a plausibility bound, a guard-removal finding — read what it was blocking.** The answer is never available from the guard's own message. Start with the variant diffs: every retained variant branch is still there, and the report now lists what each variant changed and quotes what each worker said. `git diff <round-base>..<variant-branch>` on each of them, and ask what they had to do to try to pass. A threshold is the LAST thing to change, not the first — and when N variants independently made the same product edit, that is close to proof the gate is forcing it. A real run reached the point of proposing "raise `cv_threshold`" while three variants had each deleted the same application validation to get past a broken fixture; the guard everybody wanted to relax was the only thing stopping the regression from shipping.

**A boundary that reports a guard-removal finding is that case, already detected.** `the grafted winner net-removed N guard construct(s) from PRODUCT code` means the winner's diff deleted a `throw`/`assert`/`invariant` that the round base had and did not put an equivalent back. Read `git show <grafted_sha>` for the named files before anything else. If the removals are genuinely legitimate (a real refactor, a rule that actually changed), the operator accepts them with `approve-boundary --proceed --accept-weakened-product`; there is deliberately NO unattended equivalent, so an `--auto` run that trips this stops for a human.

## Two verbs that replace a whole tournament

- **`atelier prototype goal accept-result <slug> <id> --value N [--note "…"] [--by …]`** — record a known-good benchmark value WITHOUT running a full tournament. It applies the same SLO gate and sets `pending_approval`, so the boundary proceeds normally. Use it when the number is already measured and re-deriving it would burn variant seats for nothing; do NOT use it to enter a number you did not measure — that is exactly the fabrication the honesty review exists to catch.
- **`atelier prototype goal probe <slug> <id> [--set-json -]`** — record a `provider_probe` fact. A milestone typed `decision_type: provider_probe` will not pass its evidence bar without one.

Also available: **`atelier prototype goal supersede <slug> <id> --reason "…" [--by <id>] [--discovered-at <id>]`** — retract a COMPLETE milestone whose conclusion a later milestone refuted. It stays complete but stops counting as green, and the retraction is rendered in the report. This is the honest alternative to quietly re-running history.

## Editing the plan after approval

- `goal propose` REPLACES the whole milestones array and **refuses** if that would drop or downgrade a milestone with earned/frozen state (`--force` overrides).
- To edit ONE milestone surgically, use `atelier prototype goal amend-milestone <slug> <id> --set-json -`. Changing a hashed field re-opens that milestone for re-approval; other milestones' frozen state is preserved.
- To re-run the CURRENT milestone after a bad/dishonest result, use `approve-boundary <slug> <id> --redo` (resets it to approved, keeps the frozen gate, archives the prior rounds). Its output says whether the archived round actually grafted; only a real graft stays on mainline — git-reset first to discard it. **To adopt an EDITED gate on a milestone parked at a boundary** (you repaired its harness or checks.yaml after a stopped round): `approve-milestone <slug> <id> --adopt-edited-gate` — one operator verb that prints the gate diff, archives the rounds exactly as `--redo` does, and re-freezes (a plain `approve-milestone` refuses a `pending_approval` milestone). Add `--recheck` to re-verify the kept graft under the adopted gate on the next run instead of a full re-tournament; it is refused where it cannot stand in (no graft, a `perf_bakeoff`, product changes past the graft).
- **Merge semantics differ deliberately:** `goal findings` MERGES and **dedups** on append (keyed by observation `kind+text`, theory_change `assumption_id`, proposed_next `action+text`); `--replace` clears the prior block instead of accumulating. `goal honesty` **REPLACES** the whole review on each submit. A STRING `proposed_next`/`recommendation` is rejected — use `[{action, text}]` objects.

---

## Notes for the AI running this command

- **Read `goal schema` before authoring anything.** The enums and field shapes live there, sourced from the live validator constants; this prompt intentionally does not duplicate them, so anything you "remember" about a field shape should be checked against the dump rather than trusted.
- **You never freeze a gate or charter** — that's the operator's act (`approve-*`). You propose inert `proposed` records.
- **Never let narrative govern** — milestones derive from approved machine fields, not charter prose. Tag every inferred claim as an `ai_inferred` assumption; surface them at approval.
- **DO NOT pre-write a spec YAML.** The spec is *extracted from the validated prototype later* via `/promote`.
- **For an unattended run** (auto-approve each green boundary, consolidated report), point at `/prototype-auto <slug>` — same setup, the driver decides each boundary.
- **This command is operator-initiated, not worker-callable** — the lane it drives creates worktrees, which a supervised worker lacks permission to do.
