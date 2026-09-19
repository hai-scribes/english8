# Prototype lane — issues from the first run, and how to tell if they are fixed

**Written 2026-08-17, after three runs of `/prototype-auto story-english`.**
Baselines are from those runs. Re-read this **after the next run** and work down
the checklists — each item names the observable signal, so "fixed or not" is a
measurement rather than a memory.

Two rules for using it:

- **Measure before you conclude.** Three separate reconstructions of what the
  first run cost returned the wrong number, and agreed with each other. §2 has
  the method that does not.
- **A green gate is not evidence of work.** The whole first run was green.
  §4-A is the check that would have caught it.

---

## 1. Baselines to compare against

### The runs

| Run | Wall | Exit | Milestones advanced | Cost |
| --- | --- | --- | --- | --- |
| `aa88bd5550ca` | 49 min | `stuck` | 0 | $21.65 |
| `a9c8558528bb` | 63 min | `blocked` | 0 | $25.99 |
| `11d1ce04f955` | 67 min | `blocked` | 4 | $29.46 |
| **total** | | | | **$77.10** |

- **26 worker sessions** (40 transcript files incl. 14 subagent sidechains),
  2,191 API calls, mean **~$2.97** per session.
- **Only milestone 1 ever spawned a worker.** Milestones 2–6 have no variant
  transcript directory at all — they cost $0.
- Milestone 1, round 1, final run: `v1` 4 cycles → `stuck`, benchmark `null`;
  `v2` 2 cycles → `gate_passed`, benchmark `400`; `v3` 5 cycles →
  `budget_exhausted` (it had 8 cycles; the shared 60-min round wall cut it off).
- Costliest variant directory across all runs: `m1-r1-v1` at **$28.33**, which
  never produced a benchmark value in any round.

### The harnesses, at graft `00a265e`

| Harness | Metrics |
| --- | --- |
| `coverage` | `sgk_targets_covered=400` `items_swept=400` `invariant_violations=0` `dangling_placements=0` `cross_unit_sessions=6` |
| `marking` | `false_negative_marks=0` `false_positive_marks=0` `key_variant_coverage=0.2077` `marking_rule_violations=0` `keys_probed=1127` `items_swept=87` |
| `support` | `gloss_reoffers=0` `items_swept=10` |
| `surfaces` | `band_tokens_emitted=0` `items_swept=2` — **2 pages scanned** |

**The thin slice, stated numerically.** Pages scanned fell 103 → **2**. Glosses
swept fell 68 → **10** (`support.mjs` prefers `content/`, which holds 10, over
`units/`, which holds 68). `key_variant_coverage` never moved off **0.2077**,
though raising it was milestone 2's stated purpose. Every gate was green
throughout.

---

## 2. How to price a run — the method, because the obvious one is wrong

Transcripts are at
`~/.claude/projects/-Users-liemnguyen-Per-English-8--worktrees-prototype-story-english-*/`.

**The trap.** Claude Code writes one JSONL line per *content block* — thinking,
text, each `tool_use` — and copies the identical `message.usage` onto every one.
Summing raw entries inflates by ~1.87×. On the first run that turned $77 into
$144, and three independent attempts made the same mistake and corroborated each
other.

**The rule.** Deduplicate by `message.id`, taking the **last** usage per id
(streaming updates `output_tokens`: the first block carries a partial count, the
last the final one). Proof from these transcripts — one response, two lines:

```
msg_011Ce6vVvkfJSmum1iy9TheB
  content blocks: ['thinking']   in=2 out=147 cache_w=24211 cache_r=24424
  content blocks: ['tool_use']   in=2 out=147 cache_w=24211 cache_r=24424
```

Identical `cache_creation_input_tokens` is the tell: the same cache is not
written twice.

**Pricing** (Sonnet 5 introductory, in effect through 2026-08-31): $2/MTok input,
$10/MTok output, cache write ×1.25, cache read ×0.1. Confirm the model from the
transcripts rather than assuming — the rate card is a hand-maintained input.

**Do it soon after a run.** Claude Code prunes transcripts on
`cleanupPeriodDays` (30 by default). Attribution is by worktree path and those
paths are **reused across runs**, so split by timestamp against the `started` /
`finished` fields in `reports/prototype-story-english-run-*.json`.

---

## 3. What changed between the runs — so a difference can be attributed

**In this repo** (branch `prototype-lane-review`, commit `18c9f40`; harness on
`prototype/story-english`, commit `6b93d1c`):

- Harnesses report their metric on a **failing** cycle instead of only when
  already at threshold.
- `run.n_variants` 3 → 1. Per-variant budget 8 cycles / 20 min → **24 / 60**.
- `run.worker.autocompact: 150k` and a preference-free `orientation_file`.
- Milestone 6's `coverage_min` prose corrected in both places (the stored `4` was
  always right).
- `checks.yaml` no longer swallows a failed `npm ci`.

**Upstream**, landed before the next run but after the first: `c8dc7f9` raised
the default cycle budget 12 → 24, added the `budget_shape` preflight check, made
the coverage-floor refusal explain its exclusive semantics, shipped
`run.worker.*`, added attempt memory and a futility guard, and made
`correctness_call` resolve to one variant.

---

## 4. Checklist — did the framework improve?

**Update, same day.** The framework picked these up almost immediately —
`40350be` and `42fe996`, now at `a4c032c`. It re-verified each against its own
code first ("recorded lists rot"), rated 9 of 10 valid and 1 mis-rated, then ran
an independent verification pass that found **1 regression and 6 defects in its
own fixes**. So most of §4 is already answered:

| | Status at `a4c032c` |
| --- | --- |
| A1 SLO in the seed · A5 empty graft · A6 blank directives · A7 dropped candidates · A8 untracked artifacts · A12 shared command · A13 independence guidance · A14 `≥` → `>` | **FIXED** |
| A2 benchmark only after the gate goes green | **parked** — needs real plumbing, evidence recorded |
| A3 cost telemetry | **dropped by decision** — matches ours. `vr.cost` stays `{cycles: N}`; `doctor`'s opt-in probe now reports `tokens_total` instead of USD, because tokens are the portable unit |
| A15 pre-green ignores the SLO | **mis-rated by me** — see below |

**A15 was overstated and I should record that.** The pre-green short-circuit does
return `done` before any SLO is consulted, but the benchmark and coverage floor
are applied one layer up, at selection. So it is not the SLO bypass I described.
It is real only as part of the A15+A5 chain: a pre-green milestone returns `done`
with zero cycles and no commits, and its no-op graft then reported success. A5's
fix is what closes it. The adversarial reviewer said this before the framework
did, and I demoted the item but did not correct the description.

So the questions below are now mostly **regression checks** — did the fixes hold
in a real run? — rather than open findings. Two remain genuinely open: §4-B's
successor (A2) and the A5 escalation, which was deliberately left as *detect and
surface* rather than *refuse*, because changing when `--auto` hands back to a
human is an operator policy call.

Full write-up with symbol anchors, as filed:
`research/prototype/atelier-upstream-findings.md`.

### A · The composition — check this one first

Nothing before, during, or between milestones asks whether an SLO is *already
satisfied*. That is how four milestones advanced on a fifth's work.

- [ ] **Did any milestone advance with zero cycles?** *(A5 fixed — now detected
      and surfaced in `goal status` as `empty_grafts`; escalation to a hard stop
      is parked as an operator policy call, with `--accept-empty-graft` as the
      escape hatch. So expect it to be **named**, not necessarily refused.)*
      `jq '.milestones[] | {id: .milestone_id, outcome, reason}' reports/prototype-story-english-run-*.json`
      then cross-check `cost.cycles` per variant in `goal.json`
      (`.milestones[].rounds[].variants[].cost`). **Baseline: milestones 2–5 all
      advanced at `cycles: 0`.** Fixed if a zero-cycle advance is refused, or at
      minimum named in the run record.
- [ ] **Does the run record distinguish earned from inherited?** *(A5 fixed — a
      no-op ff-merge recorded `ok: True, complete` with `grafted_sha ==
      pre_mainline_sha` and nothing compared them; now compared, and carried to
      `goal status` rather than the HTML report only.)* Baseline: it
      records `"outcome": "advanced", "reason": "green boundary"` for both.
      Cheap tell to look for: `grafted_sha` equal to the pre-graft mainline sha.

### B · Cost and telemetry

- [ ] **Does anything record a token or a dollar?** *(A3 dropped, deliberately
      and on both sides. So §2's manual method stays the only source — price the
      run by hand and keep the dedup rule.)* Original finding: Baseline: `vr.cost` is
      `{"cycles": N}` and nothing else; workers spawn without
      `--output-format json`. Fixed if a cost figure appears in the run record or
      the report — then §2's manual method becomes a cross-check rather than the
      only source.

### C · Does the worker know what it is chasing?

- [ ] **Is the SLO in the worker's prompt?** *(A1 fixed — the seed now carries
      the SLO and the gate scenarios, and prints the canonical direction rather
      than a `higher_is_better` alias.)* Regression check: Baseline: `compiled_context_pack`
      computes `slo` and `relevant_metrics`; `variant_seed` prints neither.
      Check a variant transcript's first user message for the metric id,
      threshold and direction.
- [ ] **Is the checkpoint updated between cycles?** *(A1 fixed — `run_prototype`
      had coupled the checkpoint REBUILD to the persistence callback, so the
      tournament re-sent an identical prompt every cycle.)* Regression check: Baseline: no
      `record_checkpoint` callback on the tournament path, so the seed is
      re-sent verbatim every cycle. Check whether cycle 2's prompt differs from
      cycle 1's beyond the failing-scenario tail.
- [ ] **Is a variant cut for failing to move its metric?** *(A2 — **STILL OPEN**,
      parked upstream as needing real plumbing. Expect no change; this is the
      one to re-raise.)* Baseline: progress is
      scored on gate pass/fail only, and the benchmark runs *once*, after the
      gate goes green — so `m1-r1-v1` burned 4 cycles and $28.33 with
      `benchmark_value: null`. Fixed if a terminal reason ever cites the metric
      rather than the failing-check signature.

### D · Smaller, each independently checkable

- [ ] **Report renders `>` not `≥` for `coverage_min`.** *(A14 fixed.)* Baseline: `goal-report.py`
      prints `≥` for a strictly-greater check. One character; it caused two
      refused runs here.
- [ ] **An untracked `gate.artifacts` directory errors.** *(A8 fixed — now
      refused. `git ls-files` kept deliberately: the fix is to commit the
      harness, not to hash untracked bytes. Note the refusal message initially
      conflated untracked with ignored — check it names the right problem.)* Baseline: with a mixed
      list — one tracked file, one untracked directory — `hash_gate_artifacts`
      returns a **real sha with no error**, silently leaving that subtree outside
      the freeze. Ours is exactly that shape.
- [ ] **A warning when milestones share a `benchmark.command`.** *(A12 fixed.)* Baseline: none.
      Ours had three milestones on `node harness/marking.mjs`.
- [ ] **Guidance asks for SLO independence.** *(A13 fixed — including that the
      traceability rule structurally pushes toward the coupled plan.)* Baseline: `prototype-goal.md` never
      asks whether milestone N's SLO can be satisfied by milestone M's work.
- [ ] **Empty `approach_candidates` no longer yields identical blank directives**
      *(A6/A7 fixed — four distinct design lenses rather than an ordinal; dropped
      candidates now marked NOT RUN with a reason, not merely recorded),*
      and surplus candidates are no longer dropped in silence. Baseline: both.

---

## 5. Checklist — did our own changes hold?

- [ ] **A failing cycle reports its number.** Baseline: impossible — every
      harness exited non-zero on a failed gate and `default_bench_runner`
      discards stdout on non-zero exit, so a variant at 380/400 recorded `null`.
      Check for a non-null `benchmark.value` on a variant that did **not** pass
      its gate. This is the prerequisite for §4-C's last item to mean anything
      here.
- [ ] **Did the corpus grow?** Compare against §1: pages scanned (was 2), glosses
      swept (was 10), `key_variant_coverage` (was 0.2077). A run that leaves all
      three unchanged bought nothing, however green.
- [ ] **Did one variant with 24 cycles beat three with 8?** Baseline for
      comparison: 3 variants, 8 cycles each, one `stuck` at 4 and one
      `budget_exhausted` at 5. Watch whether the single variant now exhausts
      *cycles* rather than wall.
- [ ] **Did `autocompact` and the orientation file change anything?** Not
      answerable without §4-B or §2 — price the run and compare mean cost per
      session against **~$2.97**. Note the orientation file is not covered by any
      freeze hash, so record its sha alongside the run if you want the result to
      be attributable.
- [ ] **Is the orientation file still preference-free?** It steers every variant
      in every round and nothing gates it. On a bake-off milestone, one leading
      sentence decides the contest before it runs.

---

## 6. Decisions still open

- [ ] **Milestone 5's gate.** As configured it can never pass: `items_swept=10`
      against an exclusive `coverage_min: 10`, where the metric counts glosses
      and nothing in the plan asks a worker to author an eleventh. Three options,
      and they certify different things — (a) `coverage_min: 9`, which unblocks
      today and makes m5 green on milestone 1's work; (b) re-point coverage at
      review-queue enrolments, which m5's own `fixed_workload` promises and
      `support.mjs` does not measure; (c) leave it and accept the two-page slice.
- [ ] **Re-gating milestones 2–5.** They are `complete` and immutable, so this
      means superseding them. Milestone 1's `markAnswer(given, keys, skill)`
      satisfied all four at once.
- [ ] **`approve-milestone story-english 5` and `6`** — outstanding since the
      gate machinery changed deliberately. Preflight names exactly those two.
- [ ] **Do the workers bill an API key or a subscription?** Decides whether
      $77.10 is money or a list-price equivalent.

---

## 7. Before the next run

- [ ] Re-freeze m5 and m6, then `atelier prototype run story-english --preflight`
      should read `ok:true`.
- [ ] Milestone 6 cannot go green without
      `.specs/prototype/story-english.observations.json` in the **main** worktree,
      holding at least 5 distinct weekday dates. Saturday is refused by
      construction. No engineering shortens a calendar week — start the log
      before the run, not after.
- [ ] Milestone 6 races 3 variants on a metric no variant can move by design.
      Consider `n_variants: 1` on it, or splitting it.
- [ ] Check `harness/session.mjs` asserts observable output rather than merely
      exiting 0, and binds any port from `${ATELIER_VARIANT_PORT:-…}`.
