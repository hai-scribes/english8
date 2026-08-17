# Atelier prototype lane — nine findings from the story-english run

Found by running `/prototype-auto story-english` to completion and then auditing
why it produced a two-page slice with every gate green. Each finding below was
read out of the framework source and re-verified after the framework moved
during the audit (`ba91f2c` → `547014a`). **Anchors are symbol names, not just
line numbers** — the file was under active edit and the numbers will drift.

Nothing here is applied. A second session was developing the framework while
this was written, so editing it would have collided.

**The composition matters more than any single item.** Findings A15, A2 and A12
together mean: *nothing before, during, or between milestones ever asks whether
an SLO is already satisfied.* The metric is read exactly once per variant, after
the gate is already green, purely to rank and to certify. That is how four
milestones advanced on a fifth's work and reported success.

---

## A3 — nothing records a token or a dollar

**Where.** `_autopilot_prototype.py` → `make_claude_spawn` → `spawn()`:
`argv = [claude_bin, "-p", prompt, "--permission-mode", pm]`, then `--model` and
`_worker_context_argv()`. No `--output-format`. The whole cost model is
`_goal_tournament.py` → `_execute_variant`: `vr.cost = {"cycles": run_out.cycles}`.

**Why it costs.** Answering "what did this run cost" requires reconstructing it by
hand from `~/.claude/projects/**/*.jsonl`. That reconstruction has a trap: Claude
Code writes one JSONL line per *content block* (thinking, text, each tool_use) and
copies the identical `message.usage` onto every one. Summing them inflates by
~1.9×. Three independent attempts on this run returned ~$144; the correct figure
after deduplicating by `message.id` (taking the *last* usage per id, since
streaming updates `output_tokens`) is **$77.10**. The three agreed with each other
because they shared the flaw, not because they were right.

**Fix.** Spawn with `--output-format json`; read `total_cost_usd` and `usage` from
the envelope into `vr.cost`, which is already a dict, already surfaced by
`_report_model.py`, already a report column in `goal-report.py`. One key in a slot
named `cost`.

**Implement carefully:** the JSON envelope suppresses incremental stdout, which
`_run_with_watchdog`'s idle watchdog reads. `make_claude_spawn` defaults
`idle_timeout_s=0` so the current path is safe, but this shouldn't be left
undocumented. Also, the driver currently takes its per-cycle summary from the last
400 bytes of stdout — the envelope parse has to replace that too.

---

## A15 — the pre-green short-circuit never consults the SLO or the coverage floor

**Where.** `_autopilot_prototype.py` → `run_prototype`, the pre-loop gate probe:
on a double-confirmed clean reading it returns
`RunOutcome(ACTION_DONE, "pre-green — gate already passes before cycle 1 (no worker needed)", 0, ...)`
— before any benchmark, SLO, or coverage floor is consulted.

Compounding it: `checks.yaml` is slug-level with no per-milestone scenario
selection, and `bind_executable_gate` (`_goal_lane.py`) forces the declared set to
equal the whole executable set. So every milestone shares one gate.

**Why it costs.** Once one milestone's graft makes the shared gate pass, every
later milestone short-circuits. On this run, milestones 2–5 each spun up three
variant worktrees, found the gate green, tore them down in ~13 seconds, and were
recorded `"outcome": "advanced", "reason": "green boundary"`. Twelve variants,
zero cycles.

**Fix, in order of preference.** (1) Per-milestone scenario selection, so a
milestone's gate is the subset it owns. (2) Failing that, make the pre-green
short-circuit consult the milestone's SLO *and* its coverage floor before
declaring done.

**A caution against the obvious alternative.** A launch-time preflight that
compares each pending milestone's benchmark to its threshold sounds attractive and
is worse than it looks: it would have been silent on the two runs where nothing was
built yet, and would have fired on the third only after the money was spent. It also
inverts what makes `probe_gate_executable` cheap (a 20s timeout that counts as a
pass), and a minimize-to-zero metric emitting 0 because it swept nothing is
indistinguishable from success. If it ships at all, point it at the **coverage
floor** — which refused two of three runs — and make it a warning, never a block.

---

## A1 — the worker is never told the number it is judged on

**Where.** `_goal_lane.py` → `compiled_context_pack()` returns
`{"slo": slo, "relevant_metrics": relevant, "acceptance": ..., "constraints": ...}`.
`_goal_tournament.py` → `variant_seed()` reads that pack and prints only
`approved_goal`, milestone `title`, `objective`, `non_goals`,
`forbidden_assumptions`. The SLO — metric id, threshold, direction — is computed
and dropped. `build_cycle_prompt` adds the verbatim gate commands and the failing
scenarios, and never names a metric or a threshold.

**Second half.** `run_milestone` passes no `record_checkpoint` callback, so the
driver's checkpoint is never written and **the seed is re-sent verbatim every
cycle**. The mechanism for handing a worker accumulated observable facts exists and
is unwired on the tournament path.

**Why it costs.** The worker optimizes gate pass/fail while the driver selects and
grafts on a benchmark value the worker has never seen. From round 2 the attempt
digest does print a bare prior metric value — a number with no id, unit, threshold
or direction.

**Fix.** Print `slo` and `relevant_metrics` in the seed; restate metric, direction
and threshold each cycle; wire `record_checkpoint`. Roughly four lines for the
first two.

---

## A2 — progress is scored on which checks fail, never on whether the number moved

**Where.** One benchmark call site, in `_goal_tournament.py` → `_execute_variant`,
behind `if run_out.action == "done"`. `_autopilot_prototype.py` → `decide_next`
takes `(check, state, *, budget_exhausted, gate_flaked)` — no metric parameter, and
`CheckResult` carries none. Progress is `check.fingerprint` and `check.pass_count`.

**Why it costs.** A variant that fails the gate is **never benchmarked at all**, so
a run that moves the metric substantially but never turns the gate green records
`null` and contributes nothing to selection. On this run `m1-r1-v1` emitted
`ATELIER_METRIC items_swept=400` on every cycle and still went down as
`benchmark_value: null`, at $28.33 — the most expensive variant in the run.

**Fix.** Parse `ATELIER_METRIC` from the gate's own stdout per cycle, keep a
trajectory, and add a `metric_stall_limit` distinct from `no_progress_limit` (they
measure different things: signature churn versus metric movement).

**Note for downstream projects.** This fix only pays if the project's harnesses
report their number on a failing cycle. A harness that gates itself and exits
non-zero has its stdout discarded by `default_bench_runner`, so it can only ever
return exactly the threshold or nothing. Worth stating in the guidance.

---

## A14 — the report renders an exclusive floor with an inclusive symbol

**Where.** `goal-report.py`, the SLO line: `f"≥ {_esc(slo.get('coverage_min'))} · winner coverage "`.

**Why it costs.** The gate is `if cov_val <= cov_min: return False` — strictly
greater is required. A stored `4` displays as "≥ 4" and enforces "> 4". This is very
plausibly the origin of a wrong `coverage_min` claim in our own milestone prose, and
the same off-by-one refused a run that had already passed 400/400.

**Fix.** Render `>`. One character, and it retires an error class that cost this
project two runs.

---

## A5 — a zero-cycle advance is indistinguishable from earned work

**Where.** `_goal_tournament.py` → `_graft_winner`. On a pre-green milestone
`head == base_sha`, so the `is_ancestor` guard passes, `paths_changed_between`
returns `[]`, and `ff_merge_into` succeeds as a no-op. **`grafted_sha` is recorded
equal to `pre_mainline_sha` and nothing compares the two.** Separately,
`vr.terminal_reason` is only set on the non-`done` branch, so the
`"pre-green — gate already passes before cycle 1"` string is generated and discarded.

**Fix.** Compare `grafted_sha` against `pre_mainline_sha` — a one-line detection
needing no new field — and stop `--auto` on a zero-cycle advance. Persist the
pre-green reason. The HTML report model does carry `cycles: 0`; the machine-readable
run record does not.

---

## A8 — a mixed artifacts list returns a real hash that silently omits an untracked subtree

**Where.** `_goal_lane.py` → `hash_gate_artifacts`. A directory entry is listed via
`git ls-files`; an untracked directory returns exit 0 with empty stdout, so the loop
body never runs and no error is appended.

- **All entries untracked** → `entries` empty → `return None, []`. A null hash with a
  clean error list. Approval later refuses, under a message telling the operator to
  run the command they just ran.
- **Mixed (the sharper hole)** → one tracked file plus one untracked directory means
  `entries` is non-empty, so the function returns a **valid sha with no error at
  all**, quietly leaving the untracked subtree outside the freeze.

Our own config is exactly that shape: `['harness/', 'package.json', 'package-lock.json']`.

**Fix.** If a `gate.artifacts` directory exists on disk but `git ls-files` returns
nothing for it, append an error naming the real cause — the directory is untracked,
commit it before freezing.

---

## A12 · A13 — nothing detects a shared instrument, and no guidance asks for independence

**Where.** `_goal_lane.py` → `milestone_advisories` iterates milestones
independently. `_metric_coverage_errors`, the one genuinely cross-milestone
validator, keys on `slo.metric_id` for charter traceability only — and two
milestones sharing a `metric_id` is **explicitly permitted**. Duplicate detection in
the codebase exists only for ids.

Guidance: `prototype-goal.md`'s milestone-authoring section covers seeding
candidates, the interaction tier, gate-name parity, the cut line, `perf_bakeoff`,
emitting `ATELIER_METRIC`, `coverage_metric_id` and plausibility bounds. It never
asks whether milestone N's SLO can be satisfied by milestone M's work. The only
"must differ" rule is `coverage_metric_id` vs `metric_id` *within* one SLO.

**Why it costs.** Our milestones 2, 3 and 4 all declared
`benchmark.command: "node harness/marking.mjs"`, a harness that emits all three of
their metrics from a single run and gates them at zero simultaneously. Milestone 2
could not pass its own gate without satisfying 3's and 4's SLOs.

**And the traceability rule pushed us there.** Coverage counts by `slo.metric_id`
and requires every `critical` metric to be some milestone's SLO. Three of our four
criticals were marking metrics, so the rule *demanded* three separate marking
milestones. It guarantees coverage and has no concept of independence.

**Fix.** Warn at freeze when N milestones share a `benchmark.command` — a heuristic,
so warn rather than block. And one paragraph of guidance: a milestone's SLO should be
a metric that cannot reach its threshold until that milestone's own work exists, and
two milestones measured by the same harness are a warning sign.

---

## A6 · A7 — blank directives, dropped candidates, and a guidance sentence that is false

**Where.** `_goal_tournament.py`, the seat loop in `run_milestone`.

- `if not candidates:` gives every seat `{"id": f"v{k}", "name": f"approach-{k}", "summary": ""}`
  — identical and blank, differing only by a cosmetic label. The divergence directive
  added for surplus seats covers only the non-empty case, and is itself incomplete:
  with 2 candidates and 4 seats, seats 3 and 4 receive byte-identical text.
- The loop is bounded by `n_variants`, so candidates at index ≥ `n_variants` are
  unreachable and **dropped with no warning**. Our milestone 1 seeded four approaches
  and ran three; the dropped one was never mentioned.
- `prototype-goal.md` states "Each becomes a tournament variant directive", which is
  false whenever candidates outnumber seats.

**Fix.** Apply the divergence directive to the empty-list branch (or refuse to fan
out past one variant with nothing seeded); warn when `len(candidates) > n_variants`,
naming the dropped approaches; correct the sentence.

---

## Already fixed upstream, recorded so they are not re-filed

`c8dc7f9` ("stop the lane paying full price for rounds that cannot win") landed
during this audit and fixed three items independently: the budget partition that
degraded to one cycle per variant (default raised 12 → 24, plus `check_budget_shape`
in preflight); the coverage-floor refusal message, which now states the floor is
exclusive and gives the `N-1` arithmetic; and `run.worker.{autocompact,orientation_file}`
reaching the worker at last. It also added attempt memory, a futility guard for
"harness emitted nothing", `gate_broken` for exit 126/127, and `correctness_call`
resolving to one variant.
