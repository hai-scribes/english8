---
disable-model-invocation: true
---

You are the `/prototype-auto` command. It is **identical to `/prototype` create-new in setup** — the operator still defines the goal/requirements and freezes the final plan of milestones + benchmark metrics up front (all attended, all hash-sealed). The **only** difference is the run: once the build starts, at each per-milestone boundary, instead of waiting for the operator, the driver **decides each green boundary itself**, records the decision, and advances — until the final goal is reached or a blocker stops it — then emits **one consolidated final report**.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 and `docs/atelier/ATELIER_AUTOPILOT.md` § "Auto mode".

The user's input (slug and/or idea, possibly empty): $ARGUMENTS

---

## Step 1 — Setup is `/prototype` (attended, up-front)

Do the **entire `/prototype` create-new (or resume) flow first** — Steps 1–6 of `/prototype`: resolve resume-vs-create, start the lane, goal discovery → charter (operator **freezes**), milestone decompose → gates + SLOs + benchmarks (operator **freezes** each). The trust contract is unchanged: **the operator owns and freezes the plan; you only propose.** Auto mode does NOT skip or auto-approve any of this — the up-front freeze is exactly what makes unattended running safe.

If the operator already set the goal up via `/prototype` and just wants to finish it autonomously, resume that slug instead of re-running discovery.

Confirm the operator understands the run will be **unattended**: it will advance every green milestone boundary by itself and stop only at the goal, a real blocker, or a budget cap. One confirmation, then go.

## Step 2 — Run unattended

```bash
atelier prototype run <slug> --auto --agent --compact
```

Run it **backgrounded** (`run_in_background: true`) — an auto run spans multiple milestones and far exceeds the 10-minute Bash ceiling. The driver loops all remaining milestones as an **out-of-process state machine** (it re-reads `goal.json` fresh each milestone — no resident session accumulates context across milestones; each verify-cycle still spawns a fresh worker). At each milestone:

1. Run the milestone tournament to a terminal (same engine as the attended run).
2. **Boundary, script-gated (fail-closed):** the driver calls `is_boundary_auto_decidable` — green vs SLO **and** lane state green **and** a live re-hash of the frozen charter/gate/benchmark all match. Only a boundary that clears every objective predicate is auto-advanced; the model never fakes a green.
3. **Green → mechanically advance**, writing an `auto-pilot-boundary` row to the decisions ledger (carrying the tournament ranker's provenance if a near-tie was broken), then continue to the next milestone.
4. **Not green (SLO miss / stuck / hash tamper / unrunnable) → STOP HONESTLY**: record the blocker + the auto-seeded inert proposed-next, and end the run. Auto mode **never** auto-edits or auto-pivots the frozen plan — re-shaping intent is operator-only.

A **whole-run governor** guarantees termination: `--max-wall-clock-sec` (default 8h) backstops a silently-hung worker, and `--max-milestones` caps how many one run may advance. On a cap, remaining milestones are tallied `stopped_by_cap` and the report is finalized crash-safe.

## Step 3 — Narrate + report the outcome

When the backgrounded run exits, read the result envelope. The driver re-rendered the **single stacked report** `reports/prototype-<slug>.html` (every milestone stacked + a run-summary section). Its SPINE — verdict, SLO, every auto-boundary decision, the blocked tally — is **deterministic** (the unattended driver never calls an LLM, so the report stays byte-deterministic and crash-safe). You, the attended session that launched the run, now add the **readable AI narrative** on top:

```bash
atelier prototype goal report <slug> --emit-model        # deterministic facts + per-section section_hash (incl. the 'run' summary)
# Author prose EXPLAINING the run for the operator (what advanced, what blocked, why), then narrate the run summary (and any milestone you want to clarify):
echo '<prose-markdown>' | atelier prototype goal report <slug> --narrate run --section-hash <run-section-hash>
```

The narrative is **non-authoritative**: explain the persisted facts, never restate/override the verdict/SLO/decisions, and never invent a recommendation (that goes through `goal findings` first — NG25). It is escaped safe-markdown (no raw HTML) and auto-hidden if the spine later changes.

Then surface the stacked report (also live in the dashboard's *Goal runs* panel) and report the terminal `action`:

- **`complete`** (exit 0) → every active milestone advanced; the goal is done. Point at `/promote <slug>`.
- **`blocked` / `stuck`** (exit 7) → a milestone could not reach a green SLO boundary. Surface the report's blocked-milestone section (the SLO line + the inert proposed-next). Do NOT re-run blind — the operator iterates or `--edit`/`--pivot`s the plan.
- **`stopped_by_cap`** (exit 7) → the whole-run governor stopped the run (wall-clock / milestone cap). Show what advanced and what was tallied `stopped_by_cap`; offer to re-run (the slug-keyed goal state resumes from where it stopped).

Always name the stacked report path `reports/prototype-<slug>.html` (and the run-record JSON `run_record_path` from the envelope) so the operator can audit every auto-boundary decision (each is also in the ledger with provenance `auto-pilot-boundary`).

---

## Notes for the AI running this command

- **Setup is never automated.** The charter / milestone gates / benchmarks are operator-frozen up front — that freeze is the trust anchor that makes unattended running safe. You propose; the operator `approve-*`s.
- **Auto mode only auto-decides GREEN boundaries.** A non-green terminal, a hash mismatch, or an unrunnable milestone is a hard must-stop — recorded, never fake-advanced. It never auto-edits/pivots the frozen plan.
- **DO NOT treat `blocked` / `stuck` / `stopped_by_cap` as "almost done" and silently re-launch.** They are terminal stop reasons with causes in the report.
- **The final milestone's interaction-tier is non-negotiable** — "verified by build" still requires a passing `kind: interaction` scenario.
- **Run backgrounded**, not foreground; for a run that must outlive your session, hand the operator the `! atelier prototype run <slug> --auto --max-wall-clock-sec 0` form.
- **Operator-initiated, not worker-callable** — it spawns worktree-mutating sessions; a supervised worker must never trigger an autonomous run. ("worker-callable" = the supervised *sub-agents* the pipeline spawns — NOT the operator's interactive Claude session. You, the AI driving the operator's session, DO run this on the operator's behalf; the restriction is on pipeline-spawned subagents, not on you.)
- **One auto run per slug** — the per-slug lock refuses a second concurrent run (exit 8). Distinct slugs run concurrently.
