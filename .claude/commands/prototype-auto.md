---
description: "Unattended prototype lane — same setup as /prototype create-new, auto-advancing each green boundary."
disable-model-invocation: true
---

You are the `/prototype-auto` command. It is **identical to `/prototype` create-new in setup** — the operator still defines the goal/requirements and freezes the final plan of milestones + benchmark metrics up front (all attended, all hash-sealed). The **only** difference is the run: once the build starts, at each per-milestone boundary, instead of waiting for the operator, the driver **decides each green boundary itself**, records the decision, and advances — until the final goal is reached or a blocker stops it — then emits **one consolidated final report**.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 and `docs/atelier/ATELIER_AUTOPILOT.md` § "Auto mode".

The user's input (slug and/or idea, possibly empty): $ARGUMENTS

---

## Step 1 — Setup is `/prototype` (attended, up-front)

Do the **entire lane + goal setup first**: `/prototype` (resolve resume-vs-create, confirm fit, start the lane, stand up the harness), then `/prototype-goal` (read `goal schema`, goal discovery → charter (operator **freezes**), milestone decompose → gates + SLOs + benchmarks (operator **freezes** each)). The goal flow does NOT live in `/prototype`. The trust contract is unchanged: **the operator owns and freezes the plan; you only propose.** Auto mode does NOT skip or auto-approve any of this — the up-front freeze is exactly what makes unattended running safe.

If the operator already set the goal up via `/prototype-goal` and just wants to finish it autonomously, resume that slug instead of re-running discovery.

**The harness is part of that setup and it is YOURS to build (W9.11).** `/prototype` § "Stand up the harness" — author `checks.yaml` with a `kind: interaction` scenario, plus a top-level `serve:` block if the product serves — must be done before the milestone freeze, because `approve-milestone` hash-binds the gate and a variant that edits its own measuring stick is disqualified. A goal run therefore will **not** bootstrap a harness mid-tournament; it refuses with **exit 2** at the run guard (and shows `interaction_gate` red under preflight) instead. Never carry this back to the operator as "please add a check" — check `atelier prototype harness status <slug> --agent` and build what it asks for. Before any milestone is handed over for its freeze, probe its gate yourself: `atelier prototype run <slug> --preflight --milestone <id> --agent --compact` boots `serve:` and runs that milestone's gate on the pre-work tree, so a gate that fails on its own fixtures (`gate_prework_failure`) or already passes (`gate_discriminates`) is caught before a tournament is paid for.

Confirm the operator understands the run will be **unattended**: it will advance every green milestone boundary by itself and stop only at the goal, a real blocker, or a budget cap. One confirmation, then go.

**`--yes` in `$ARGUMENTS` is that confirmation, given up front** (R6.4.b: a choice the operator can state on the command line must not cost a second touch). Strip `--yes` from `$ARGUMENTS` FIRST, before anything above reads the rest as a slug or an idea — it is never part of either. Then, once the setup above is complete (frozen charter and milestones, harness up — `--yes` skips none of it), do not wait for a reply: still print the cost shape and the waiver disclosure below — the two "say it before they confirm" sections; with `--yes` the confirmation already happened, so say them before you launch — then go straight to Step 2. `--yes` is not forwarded to `prototype run`, and it pre-authorizes neither waiver — `--accept-deferred` / `--accept-empty-graft` reach the launch line only when the operator typed them.

### What this costs — say it before they confirm

An unattended run spends real money, and the two knobs that decide how much are
not obvious from their names. Before the confirmation, state the shape:

- **`n_variants` is a cost multiplier, not just a latency knob.** The docs
  advertise parallel variants as a 2.2–2.5× wall-clock speedup; the same fan-out
  is an ~N× *token* multiplier, because every variant is a full worker session
  and all but the winner are discarded. A 3-wide run was **downstream-reported**
  at **$119.96 / 342.3M tokens / 3,710 worker turns to land two milestones**.
  Treat that as one operator's report, not as a framework measurement: there is
  **no in-tree evidence artifact** behind it, and since the change "drop money tracking" this
  framework records **cycles, not money** (`vr.cost` stays `{cycles: N}`; the
  worker spawn reads no usage block). The shape of the cost is the point — an
  N-way fan-out is an ~N× token multiplier — not the specific dollar figure.
- **`max_cycles_per_milestone` is a milestone TOTAL that gets divided**, not a
  per-worker allowance: per-variant = `floor(0.8 × total / (n_variants ×
  max_rounds))`. Get this wrong and each variant gets a single attempt with no
  iteration — preflight's `budget_shape` check now flags that shape explicitly.
- **`max_wall_minutes` and `max_cycles_per_milestone` are SEPARATE governors —
  check which one actually ran out.** The run envelope's
  `variant_terminal_causes` names it: `budget_cycles` means the cycle cap (raise
  `max_cycles_per_milestone`, or lower `n_variants`); `budget_wall` means the wall
  (raise `max_wall_minutes` — raising cycles there changes nothing);
  `barren_session` means the worker ran and changed nothing, so neither cap is the
  fix — read the variant's `session_diagnostics` in the report. `noop_worker` is the
  same shape from a worker that exited CLEANLY, and it covers TWO cases the run
  cannot always tell apart — the reason string says which one the evidence
  favours. When a permission/auth/quota refusal was detected in the worker's
  output, the reason quotes the matched phrase and the fix is the worker's
  permissions. When none was, the likelier reading is a worker that ran,
  diagnosed something, and deliberately committed nothing — a correctly-
  identified broken gate looks exactly like this. Read the worker's own closing
  words (quoted in the reason, and in full in `session_diagnostics`) and the
  gate's output BEFORE you touch a cap or a permission; either way the gate
  reading it left is not evidence about the problem. `no_progress` / `oscillation` are the two STUCK verdicts: the work
  was attempted and did not converge, which is the only one of these that is
  really about the problem. `slo_unmet` is the third: the gate went green and
  the NUMBER did not. Its reason names which of two things ended it, and they
  take OPPOSITE fixes — "no improvement for N green cycles" is a stall (the
  approach cannot reach the number; re-plan, and do NOT just raise the cap,
  which buys more cycles of something that stopped improving), while "budget
  exhausted … while the number was still improving" means it was cut off
  mid-descent (raise `run.max_cycles_per_milestone`, or `run.max_wall_minutes`
  when the reason names the wall). The stall is checked FIRST, so a flat number
  can never be reported as a budget problem. **`--auto` runs carry this too
  now** — the run
  envelope's `variant_terminal_causes` and each milestone's `terminal_causes` +
  `session_diagnostics`; before, an unattended run's only artifact named no cause
  at all and every death read as an anonymous "no progress". Guessing costs a whole run: a measured
  60→150 minute change once produced byte-identical elapsed time because cycles,
  not the wall, were the binding cap. Each cycle's watchdog is clamped to the
  wall its variant/round has left, so a single cycle can never eat the budget.

Milestones typed `correctness_call` or `provider_probe` resolve to **1 variant**
automatically (one right answer is observed, not raced); only `perf_bakeoff`
needs ≥2. Set `run.worker.autocompact` to a token threshold (`150k` unless
there is a reason not to) and `run.worker.orientation_file` — an uncapped worker
context and a worker that rediscovers the repo every cycle were together the
largest share of that measured spend.

### What a run may waive — say it before they confirm

One confirmation has to cover the stops the run will NOT make. Two launch flags
each pre-authorize a class of decision the driver would otherwise hand back:

- **`--accept-deferred`** waives the boundary stop for *every* open honesty
  surface marked `deferred_to_boundary` — the boundary-only evidence the attended
  path accepts one surface at a time via `approve-boundary --accept-risk`.
- **`--accept-empty-graft`** waives the stop for a milestone whose gate went green
  while the winning variant produced **no commits** — mainline did not move, so
  the green is evidence about the gate, not about new work.

**Neither is a default and neither is recommended.** What separates them from the
cost knobs above is that **their scope is not knowable at confirmation time**:
they forward-accept surfaces and milestones that do not exist yet when the
operator confirms — including honesty surfaces authored later in the run. Say
that, name what each waives, and leave it there; if the operator wants one, they
type it onto the launch line themselves. It is a per-run pre-authorization
re-typed at each launch, not a stored bulk accept — the charter freeze still
enumerates every risk id it accepts.

**The one exception is the empty-graft post-mortem in Step 3, and the difference
is scope.** After a run has blocked, the scope IS known — one identified
milestone, one identified empty graft the operator can look at — so recommending
`--accept-empty-graft` there is a judgement about a fact in hand. Here, before
the run, it is not: the same flag would forward-accept every empty graft the run
has not produced yet. Recommend nothing at confirmation time; recommend on the
evidence in the post-mortem.

## Step 2 — Run unattended

```bash
atelier prototype run <slug> --auto --agent --compact
```

Run it **backgrounded** (`run_in_background: true`) — an auto run spans multiple milestones and far exceeds the 10-minute Bash ceiling. The driver loops all remaining milestones as an **out-of-process state machine** (it re-reads `goal.json` fresh each milestone — no resident session accumulates context across milestones; each verify-cycle still spawns a fresh worker). At each milestone:

1. Run the milestone tournament to a terminal (same engine as the attended run).
2. **Boundary, script-gated (fail-closed):** the driver calls `is_boundary_auto_decidable` — green vs SLO **and** lane state green **and** a live re-hash of the frozen charter/gate/benchmark all match. Only a boundary that clears every objective predicate is auto-advanced; the model never fakes a green.
3. **Green → mechanically advance**, writing an `auto-pilot-boundary` row to the decisions ledger (carrying the tournament ranker's provenance if a near-tie was broken), then continue to the next milestone.
4. **Not green (stuck / hash tamper / unrunnable) → STOP HONESTLY**: record the blocker + the auto-seeded inert proposed-next, and end the run. Auto mode **never** auto-edits or auto-pivots the frozen plan — re-shaping intent is operator-only.

   **An SLO miss with budget left is NOT a stop — it is the worker's next cycle.** "Done" for a variant means the gate is green AND the benchmark meets the SLO (`decide_slo`); a gate-green variant that misses its number keeps iterating with that number in front of it, and only ends `slo_unmet` when the reading stops improving (stuck — the strike counter reaches `run.no_progress_limit`, which an improving reading resets to 1, so the stall fires after `limit - 1` non-improving readings) or the cycle/wall budget runs out (stop). **This costs a benchmark per green cycle**, not one per run: once the gate is green, every further cycle runs the frozen benchmark (bounded by `ATELIER_BENCH_TIMEOUT_SEC`, default 600 s) out of that variant's wall slice. A gate that goes green early and misses its number is the expensive shape — budget the wall for it. Before 2026-09-05 the gate alone decided "done", so a gate that did not itself assert the SLO ended the run on its first green cycle — the downstream shape was 4/4 green at 204.82 ms against a 50 ms bar after ONE cycle of 24, then a round 2 that found the gate green at cycle 0 and committed nothing.

A **whole-run governor** guarantees termination: `--max-wall-clock-sec` (default 8h) backstops a silently-hung worker, and `--max-milestones` caps how many one run may advance. On a cap, remaining milestones are tallied `stopped_by_cap` and the report is finalized crash-safe.

## Step 3 — Narrate + report the outcome

When the backgrounded run exits, read the result envelope. The driver re-rendered the **single stacked report** `reports/prototype-<slug>.html` (every milestone stacked + a run-summary section). Its SPINE — verdict, SLO, every auto-boundary decision, the blocked tally — is **deterministic** (the unattended driver never calls an LLM, so the report stays byte-deterministic and crash-safe). You, the attended session that launched the run, now add the **readable AI narrative** on top:

```bash
atelier prototype goal report <slug> --emit-model        # deterministic facts + per-section section_hash (incl. the 'run' summary)
# Author prose EXPLAINING the run for the operator (what advanced, what blocked, why), then narrate the run summary (and any milestone you want to clarify):
echo '<prose-markdown>' | atelier prototype goal report <slug> --narrate run --section-hash <run-section-hash>
```

The narrative is **non-authoritative**: explain the persisted facts, never restate/override the verdict/SLO/decisions, and never invent a recommendation (that goes through `goal findings` first — NG25). It is escaped safe-markdown (no raw HTML) and auto-hidden if the spine later changes.

**Order matters.** Findings are part of the hashed spine, so if you submit `goal findings`, narrate against the hash that submit hands back (its reply carries a `narration` block with the current `section_hash` and that milestone's section), not the one you read earlier from `--emit-model`. A stale `--section-hash` is refused at write, naming the live hash.

Then surface the stacked report (also live in the dashboard's *Goal runs* panel) and report the terminal `action`:

- **`complete`** (exit 0) → every active milestone advanced; the goal is done. Point at `/promote <slug>`.
- **`blocked` on an EMPTY graft** (exit 7) → the milestone's gate went green but the winning variant produced **no commits**, so mainline did not move. The green is evidence about the GATE, not about new work — usually the gate does not discriminate this milestone from the previous one (give it its own `<slug>.m<id>.checks.yaml`). If the milestone was genuinely already satisfied, re-run with `--accept-empty-graft`, which pre-authorizes it exactly as `--accept-deferred` pre-authorizes boundary-only honesty surfaces. Recommending it *here* does not contradict "neither is recommended" before Step 2: at this point the scope is known — this milestone, this empty graft, already produced and inspectable — whereas at confirmation time the flag would forward-accept grafts that do not exist yet.
- **`blocked` / `stuck`** (exit 7) → a milestone could not reach a green SLO boundary. Surface the report's blocked-milestone section (the SLO line + the inert proposed-next). Do NOT re-run blind — the operator iterates or `--edit`/`--pivot`s the plan.
- **`stopped_by_cap`** (exit 7) → the whole-run governor stopped the run (wall-clock / milestone cap). Show what advanced and what was tallied `stopped_by_cap`; offer to re-run (the slug-keyed goal state resumes from where it stopped).

Always name the stacked report path `reports/prototype-<slug>.html` (and the run-record JSON `run_record_path` from the envelope) so the operator can audit every auto-boundary decision (each is also in the ledger with provenance `auto-pilot-boundary`).

---

## Notes for the AI running this command

- **Setup is never automated.** The charter / milestone gates / benchmarks are operator-frozen up front — that freeze is the trust anchor that makes unattended running safe. You propose; the operator `approve-*`s.
- **Auto mode only auto-decides GREEN boundaries.** A non-green terminal, a hash mismatch, or an unrunnable milestone is a hard must-stop — recorded, never fake-advanced. It never auto-edits/pivots the frozen plan.
- **DO NOT treat `blocked` / `stuck` / `stopped_by_cap` as "almost done" and silently re-launch.** They are terminal stop reasons with causes in the report.
- **The final milestone's interaction-tier is non-negotiable** — "verified by build" still requires a passing `kind: interaction` scenario. W9.11 changed WHO builds it (you, at `/prototype` § "Stand up the harness"), never whether it is required.
- **Never ask the operator to verify a build by hand.** The lane runs, drives and observes the product itself: `serve:` owns boot/readiness/teardown, and every run writes `.atelier/harness/` in the worktree (`serve.log` + per-scenario `.out.log`/`.err.log`), fed back into the next cycle automatically. "Can you open it and click through?" means the harness is incomplete — fix the harness.
- **Run backgrounded**, not foreground; for a run that must outlive your session, hand the operator the `! atelier prototype run <slug> --auto --max-wall-clock-sec 0` form.
- **Operator-initiated, not worker-callable** — it spawns worktree-mutating sessions; a supervised worker must never trigger an autonomous run. ("worker-callable" = the supervised *sub-agents* the pipeline spawns — NOT the operator's interactive Claude session. You, the AI driving the operator's session, DO run this on the operator's behalf; the restriction is on pipeline-spawned subagents, not on you.)
- **One auto run per slug** — the per-slug lock refuses a second concurrent run (exit 8). Distinct slugs run concurrently.
