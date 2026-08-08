---
disable-model-invocation: true
---

You are the `/prototype` command — the single entry to Atelier's prototype lane: a fast, gate-free exploration lane for greenfield UI / interaction work where a prose-YAML spec is the wrong starting artifact. A validated prototype becomes the source of a spec; production code is rebuilt fresh from that spec via `/develop`.

`/prototype` does two things: **resume** an existing prototype, or **create a new one**. A new prototype runs the goal-discovery flow — a benchmarkable **Product Charter** → ordered **milestones** (each with a gate + SLO + committed benchmark) → operator-frozen plan — then runs **attended**, stopping at each milestone boundary for your approval. For the same setup run **unattended** (auto-approve each green boundary, one consolidated report), use `/prototype-auto`.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 and `docs/atelier/ATELIER_AUTOPILOT.md`.

The user's input (slug and/or idea, possibly empty): $ARGUMENTS

---

## Step 1 — Resolve resume-vs-create

List existing prototypes and decide whether this is a resume or a fresh start:

```bash
atelier prototype list --include-idle --agent
```

- **If `$ARGUMENTS` names a slug with a live prototype** → this is a **resume**. Run `atelier prototype resume <slug> --agent`; on exit 0 surface a loud resume banner (branch, worktree path, base commit, last-commit age) and continue work in that worktree. For subsequent **in-worktree build** Bash calls (editing prototype code, running the app), prefix with `cd "<worktree_abspath>" && source .envrc.atelier && <cmd>` — use the **absolute** `worktree_abspath` from the resume envelope, NOT a repo-root-relative `.worktrees/…` path (the relative form breaks when your cwd isn't the repo root; the resolved repo root may not be where you are). Internalize the cd+source per R6.4.b — do not push it onto the operator. NOTE: the `atelier prototype goal …` lifecycle commands and `atelier prototype run` operate on **canonical main-tree state** and resolve it regardless of cwd (they detect the main worktree from git), so you may run them from anywhere — do not assume a `cd` into the worktree redirects where they read/write. Skip the rest of this command.
- **If `$ARGUMENTS` is empty** → `AskUserQuestion`: present each live prototype as a **Resume `<slug>`** option (show idle ones as idle), plus a **Create a new prototype** option. If they pick resume, follow the resume path above. If create-new (or there are no prototypes), continue to Step 2.
- **If `$ARGUMENTS` looks like a new idea/slug with no live prototype** → propose a slug (`^[a-z][a-z0-9-]{1,63}$`), confirm via `AskUserQuestion`, and continue to Step 2 (create-new).

**Idle nudge.** If any *other* prototype is idle (started ≥ 8h ago with no commits beyond `main`; threshold `ATELIER_PROTOTYPE_IDLE_THRESHOLD_HOURS`), offer to resume or drop it before creating a new one — an empty idle lane is almost always an abandoned start. Advisory, never blocking.

## Step 2 — Confirm fit (create-new only)

**Default is to PROCEED.** Redirect only if a hard criterion clearly applies:

- **Bug fix / refactor / infra-only change** → `/hotfix` or `/bug`.
- **A canonical Atelier spec already exists** — `test -f .specs/features/<slug>.yaml` AND it has populated `then:` clauses (i.e. `/promote` already ran) → `/develop` to build it, or `/product` to amend.
- **Operator wants to ship the prototype directly as production** (skip `/promote`) → `/product`. The prototype lane is explicitly NOT a shipping path.

**Rough planning is the lane's INPUT, not a disqualifier.** PRDs, design refs, intent markdowns, operator-authored `spec.md`/`*.yaml` outside `.specs/features/` are *input*, not "a spec already exists". Do NOT refuse `/prototype` because the operator brought docs.

## Step 3 — Start the lane (create-new)

```bash
atelier prototype start <slug>
```

This atomically creates branch `prototype/<slug>` and worktree `.worktrees/prototype-<slug>/` **forked from the project default branch (`main` — the develop main lane's code)**, writes lane state, and captures the `PROTOTYPE_MODE=1` env contract that short-circuits every gate (Scribe / Auditor / RED / GREEN / HMAC) inside the worktree. (Refuses on an unborn HEAD → run `atelier init` first; on the parallel cap, default 5; on residue from an aborted attempt.)

**Free-form hacking is now available with no further ceremony.** Inside this worktree you can just ask the AI to build/edit UI ("add a login screen", "make the header sticky") and it commits straight onto `prototype/<slug>` — no charter, no gates, no command. The goal flow below is the *scaffolding that unlocks autonomy + measurable boundaries*; it is NOT required to iterate. If the operator only wants to hack, stop here and build.

## Step 4 — Goal discovery (create-new; the charter)

When the operator wants a measurable, drivable goal (required for attended boundary runs and `/prototype-auto`), run the discovery flow. Pick the ambition **tier** from the ask (default low):

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

The charter core (sized to tier): `problem`, `target_users`, `desired_outcome`, `scope.{in,out}` (non-goals first-class), `success_metrics[]` (each `id` / `priority` north_star|critical|guardrail|diagnostic / `measurable_form` / `benchmark_candidate` / `threshold` / `verification_mode` / `evidence_strength` / `required_by`), `constraints`, `assumptions[]` (each `id` + `text` + `provenance` ∈ `operator_stated`|`source_backed`|`codebase_observed`|`ai_inferred`; optional `validation`/`requires_approval` — every AI-inferred claim goes here, the anti-smuggling ledger; the field is `text`, NOT `claim`; an assumption `id` must NOT collide with a `success_metrics[].id`, so `--with-risks <id>` accepts exactly one), `kill_criteria`, `user_access_plan`, `readiness.{designer,developer,owner}`, `sources[]`. Defer any section you legitimately can't fill with `deferred.<field>: "<reason>"`. Iterate `charter --set-json` until validation is clean (`charter <slug>` with no `--set-json` shows validation errors + the **assumptions requiring approval**).

## Step 5 — Operator freezes the charter (trust anchor)

Present the approval summary: critical metrics, non-goals, deferred gaps, AI-inferred assumptions. The operator runs (you surface; they decide):

```bash
atelier prototype goal approve-charter <slug> [--with-risks <ids>] --agent --compact
```

`--with-risks` consciously accepts a flagged `placeholder` critical metric or an unvalidated assumption. **The freeze now REFUSES** when any assumption that requires conscious approval — flagged `requires_approval` OR carrying `ai_inferred` provenance (the exact set `goal charter`/`goal show` surfaces under *assumptions requiring approval*) — is not listed in `--with-risks` (the anti-smuggling ledger is enforced at the freeze verb, not decorative; enforcement == what is surfaced) — and still refuses a non-benchmarkable charter. The refusal names the unaccepted ids; re-run `approve-charter --with-risks <ids>` to accept them (or validate them / set a non-`ai_inferred` provenance first). Surface its errors verbatim. **You never freeze — the operator does.**

## Step 6 — Decompose into milestones (risk-first, SLO-traced)

Propose ordered milestones, **design-risk-first**. Each carries: a non-empty **`title`** (REQUIRED — the validator and `goal schema` key; authoring a milestone without it fails), optional `objective`/`risk`, `active` (bool), an **integer** `id` (unique — `approve-milestone` addresses by it), a per-part research-scan (`approach_candidates` seeded from credited prior art — these become tournament variants), a `gate` (`checks[]` with a `kind` ∈ `build`|`smoke`|`interaction` — the SAME vocab as the executable `checks.yaml`, NOT `metric`/`command`/`visual`; the FINAL milestone MUST have ≥1 `kind: interaction`), an `slo` (`metric_id` tracing to a charter metric + `threshold` + `direction` ∈ `minimize`|`maximize`; the qualitative aliases `higher_is_better`/`lower_is_better` are **accepted and normalized** to those), an OPTIONAL `benchmark` **object** `{harness, command, fixed_workload}` (never a bare string — its fields are hash-frozen), and a `tasks[]` ledger. Run `atelier prototype goal schema` for the full enum vocab + field shapes, and **`atelier prototype goal show <slug> <id>`** to dump ONE milestone in full (`--agent` = the complete object — `propose --agent` only echoes a summary). `goal propose` now shape-checks the list and surfaces `milestone_errors` (bad id type, string benchmark, invalid gate-check kind) at authoring rather than as a late refusal at `approve-milestone` — and **grandfathers** a shape rule added after an already-frozen/complete milestone was approved into a non-blocking `legacy_milestone_warnings` (so re-proposing isn't blocked by a milestone you aren't editing; a newly-authored or changed one still blocks).

**Performance milestones — measure honestly (see `docs/atelier/ATELIER_PERF_MEASUREMENT.md`).** A perf SLO must record a **bounded number, never a bare PASS**:
- The `slo.threshold` must be **numeric** (`60` or `">=60"`) — a unit-tagged string like `"60 fps"` is REFUSED at authoring; put the unit in `slo.metric_id` (e.g. `metric_id: "fps"`).
- **Type the milestone `decision_type: perf_bakeoff`** so the ≥2-benchmarked-variant comparison bar + honesty review apply. (Untyped perf work is still protected — a metric-intended milestone that produces zero measured values now fails selection rather than grafting an unmeasured winner — but typing makes the bar explicit.)
- The `benchmark.command` harness must emit `ATELIER_METRIC <metric_id>=<number>` on stdout (a bare number, no unit). Headless throughput lies three ways; use a harness that flushes per frame, calibrates the readback cost, and guards implausible results — see the reference harness at `docs/atelier/examples/perf-harness-reference.mjs`. A benchmark that runs (exit 0) but emits no parseable `ATELIER_METRIC <metric_id>=<n>` is now reported as **unparsed** (its `benchmark_value` is null, named in the selection-failure reason) instead of a silent null — add the metric line to a dispatcher-style gate (`check.mjs --only …`) that only prints prose.
- **Assert the workload actually RAN — `slo.coverage_metric_id`.** A soak/perf gate can pass while testing nothing (a loop that never executed still emits "0% growth"). Declare a SECOND metric the harness emits to prove the workload ran (e.g. `coverage_metric_id: "frames_swept"`, optional `coverage_min` default 0) — a winner whose coverage is missing or ≤ `coverage_min` is **not green** (stops for review). It must be a metric_id DISTINCT from the primary. `goal propose` advises (non-blocking) when a perf gate declares no coverage metric.
- Optionally declare plausibility bounds — `slo.plausible_min` / `slo.plausible_max` / `slo.implausibility_factor` (numeric) — so a 166×-too-good measurement artifact STOPS the boundary for operator review instead of certifying a fantasy green.

**Editing the plan after approval.** `goal propose` REPLACES the whole milestones array and now **refuses** if that would drop or downgrade a milestone with earned/frozen state (use `--force` to override). To edit ONE milestone surgically without touching the others, use **`atelier prototype goal amend-milestone <slug> <id> --set-json -`** (changing a hashed field re-opens that milestone for re-approval; other milestones' frozen state is preserved). To re-run the CURRENT milestone after a bad/dishonest result, use **`approve-boundary <slug> <id> --redo`** (resets it to approved, keeps the frozen gate, archives the prior rounds; any already-grafted winner stays on mainline — git-reset first to discard it). Record findings with `goal findings`; a STRING `proposed_next`/`recommendation` is rejected (use `[{action, text}]` objects), and `--replace` clears the prior block instead of accumulating. **Merge semantics differ deliberately:** `goal findings` MERGES and now **dedups** on append (a re-submitted auto-seed observation no longer duplicates — keyed by observation `kind+text`, theory_change `assumption_id`, proposed_next `action+text`), whereas `goal honesty` **REPLACES** the whole review each submit.

```bash
echo '<milestones-json-list>' | atelier prototype goal propose <slug> --set-json - --agent --compact
```

Confirm the **cut line** with the operator (active vs deferred). Before freezing, author the **executable gate** — `.specs/prototype/<slug>.checks.yaml` — whose scenario set matches the milestone's `gate.checks` names (one slug-level checks.yaml gates the goal; `prototype check` runs ALL its scenarios — there is no per-milestone selection in v1). **The shared `checks.yaml` must carry ≥1 `kind: interaction` scenario before ANY milestone can run** — the working-UI guard checks the one shared file, so even a non-final milestone run is refused (exit 2) until the interaction scenario exists. Author it up front; it is what certifies the final milestone's working UI but is *present* from the first run. Then they freeze each active milestone's gate (every benchmark must trace to a charter metric — CLI-enforced):

```bash
atelier prototype goal approve-milestone <slug> <id> --agent --compact
```

`approve-milestone` **binds the executable gate** into the freeze (a SHA-256 of the checks.yaml command bodies) and **snapshots the approved checks.yaml body** so the freeze is recoverable. It **refuses** if checks.yaml is missing or if its scenario set ≠ the milestone's declared `gate.checks` (it would otherwise silently judge the milestone against scenarios it never declared). A post-approval edit to checks.yaml is then caught at run/boundary preflight — which now prints the expected vs actual hash AND a unified approved-vs-current diff, not just "it changed". Inspect or recover a frozen gate with `atelier prototype goal gate <slug> <id>` (shows the bound hash, whether the body was snapshotted, the live match status, and the diff on drift); `… gate <slug> <id> --restore` rewrites checks.yaml back to the approved body.

**Canonical location (read this — top operator cost).** `checks.yaml` and `goal.json` are **canonical at `<main-worktree-root>/.specs/prototype/<slug>.*`**, where the main-worktree root is resolved *from git* (`git worktree list`), independent of your cwd. Two consequences: (1) if your HOME (or any ancestor) is itself a git repo, a goal launched from inside it resolves the main root to **that** repo — so the specs can land in `~/.specs/prototype/` rather than the project you think you're in; and (2) a `.specs/prototype/<slug>.checks.yaml` you hand-create *inside a linked worktree* is **ignored** — the CLI always reads the canonical main-tree copy. Every gate/checks error now **prints the absolute resolved path** it read, and `approve-milestone` **warns** when a divergent worktree-local copy exists, naming both paths. When confused about which file is live, run `atelier prototype goal gate <slug> <id>` (or read the `checks_path` in any `--agent` envelope).

A checks.yaml scenario may carry an optional **`setup`** field (e.g. `setup: "[ -d node_modules ] || npm ci"`) that runs in the worktree BEFORE `command`. `setup` runs arbitrary shell before the gate, so it **is bound into the frozen gate hash** (a post-approval bootstrap edit IS a hash break, like a `command` edit) — keep it **idempotent** so a fresh tournament-variant worktree with no `node_modules` still bootstraps. Hashing the setup *string* does not protect the *files* it reads (`package.json`/lockfiles); declare those in **`gate.artifacts`** (below) if the bake-off depends on them.

**Protecting the measuring stick — `gate.artifacts` (perf bake-offs).** The frozen gate hashes the command *strings*, but a command like `node harness/capacity.mjs` *executes a file* in the variant's worktree. Without protection a variant could ff-graft an edited `harness/capacity.mjs` (weaken the artifact guard, fake a faster number) and the re-gate would run the **tampered** harness while the gate hash — which never saw the file — stayed green. Declare the immutable **gate machinery** in the milestone gate:

```yaml
gate:
  checks: [...]
  required_tier: interaction
  artifacts: ["harness/"]   # files/dirs the gate+benchmark EXECUTE — the measuring stick
```

`approve-milestone` content-hashes these files (from the prototype worktree) into the freeze (`gate.artifacts_sha256`). Two guards then enforce immutability: the **run/boundary preflight** re-hashes the live files (an operator/main-tree edit to the harness is refused), and the **graft guard** diffs each winning variant against its base over the declared paths — **a variant that edits the measuring stick it is judged by is disqualified and the graft is refused** (fail-closed to operator review). Declaring `gate.artifacts` is **REQUIRED for a `perf_bakeoff`** (an undeclared stick is the original hole) and optional elsewhere. Declare the **whole measurement subtree** (the harness dir, fixtures, helper modules, and any dependency manifest `setup` reads) — a single-file declaration misses a helper the harness imports.

**The gate-hash family (one model, three facets).** A frozen gate carries three SHA-256s — read them as a family, not three unrelated fields. `goal gate <slug> <id>` prints all three with this legend:

| Hash | Covers | Breaks when you change… |
|---|---|---|
| `gate.content_sha256` | the **declaration** — the `{checks, slo, benchmark, artifacts, …}` shape the operator approved | any approved field (incl. which `artifacts`/`checks` are declared) |
| `gate.checks_yaml_sha256` | the **executable** — the `checks.yaml` command *bodies* (incl. `setup`) | a command body or a `setup` body |
| `gate.artifacts_sha256` | the **machinery** — the contents of the declared `gate.artifacts` files | the harness/fixtures the gate executes |

`content_sha256` is the SAME convention every frozen object uses — `charter.content_sha256` and `benchmark.content_sha256` likewise hash *that* object's declaration; the gate just additionally carries the two executable-integrity hashes (`checks_yaml_sha256`, `artifacts_sha256`) because, unlike a charter, a gate *runs files*. The run/boundary preflight verifies **all three**. A **comment-only edit to checks.yaml does NOT change any of them** (the parser strips comments), so you can annotate the gate file freely without re-approval; only a change to an actual command body, a `setup` body, a declared artifact file, or the approved declaration breaks the freeze.

A scenario's `command` (and `setup`) may be a **YAML literal block scalar** — the natural form for a multi-line `node -e '…'` or several-line shell gate, e.g.:

```yaml
  - name: interaction
    kind: interaction
    command: |
      node -e 'const h=require("fs").readFileSync("index.html","utf8");
      if(!/addEventListener/.test(h) || !/classList\.toggle/.test(h)) process.exit(1)'
```

The block body is preserved verbatim and run via `/bin/sh -c`. (Single-line single-quoted commands still work; you are no longer forced onto them.)

**EVERY milestone carries a honesty review** ("where can this fabricate or claim something it didn't measure?") that is a HARD boundary gate — you MUST answer it before the boundary advances: `echo '<surfaces-json-list>' | atelier prototype goal honesty <slug> <id> --set-json -` (an empty `[]` asserts no fabrication surface; otherwise a list of `{surface, mitigation, resolved}`). A **typed** milestone (`perf_bakeoff` / `provider_probe` / `correctness_call`) gets the type-specialised prompt; an **untyped** milestone gets the generic one (an untyped UI can also show invented data or a stubbed affordance — I1). The `--auto`/`--preflight` launch gate **refuses (exit 9) ANY milestone whose honesty review is unanswered** — otherwise the run executes the entire tournament and only then blocks at the boundary. (A `decision_type` additionally imposes its type-specific evidence bar — ≥2 metered passers for a bake-off, a recorded `probe_observation` for a probe.)

**Boundary-only surfaces — `deferred_to_boundary`.** Some honesty surfaces can only be CONFIRMED at the boundary, not pre-run (e.g. "a headless FPS reading ≠ the FPS a user sees presented"). Marking such a surface `resolved: true` pre-run to start the run would be a lie. Instead mark it `deferred_to_boundary: true` (it MUST carry a `mitigation` or `confirmation_needed` stating what boundary evidence would confirm it). A deferred surface does **not** block the run launch, but at the boundary an attended **`approve-boundary <slug> <id> --proceed --accept-risk <index|substr>`** must consciously accept it (recorded with reviewer + timestamp; see the indices in `goal honesty`). **`--auto` NEVER accepts a deferred surface** — it stops for a human every time (an acceptance is valid for one boundary and is cleared on the next run/redo).

## Step 7 — Run the milestone (attended)

```bash
atelier prototype run <slug> --agent --compact
```

Run it **backgrounded** (`run_in_background: true`) — the default budget exceeds the 10-minute Bash ceiling. The driver spawns N variant worktrees from the milestone base, runs each through the empirical loop, benchmarks the gate-passers, selects a winner (deterministic by SLO; cross-family adversarial judge on a near-tie), fast-forward-grafts the winner, re-gates on mainline, and stops at `pending_approval` — **green vs SLO, no vibe-greens** — re-rendering the **single stacked report** `reports/prototype-<slug>.html` (one file, every milestone stacked; open it once).

## Step 8 — Boundary: findings → narrate → report → operator approval

Read the result envelope + report + `discovery.jsonl`. The driver auto-seeded objective findings; **ENRICH them** with what changed prior theories (structured, validated, persisted — the *authoritative* content the report renders):

```bash
echo '<findings-json>' | atelier prototype goal findings <slug> <id> --set-json - --agent --compact
```

**Then author the AI narrative** — the readable, human-facing part of the report. The report is **two-layer**: a deterministic SPINE (verdict / SLO / open items / honesty — computed from `goal.json`, the authority, which you must NOT contradict) plus your **non-authoritative commentary** woven into each section. Get the facts, then narrate:

```bash
atelier prototype goal report <slug> --emit-model --agent   # deterministic facts + each section's section_hash
# Author readable prose that EXPLAINS this milestone's facts/findings for the operator, then:
echo '<prose-markdown>' | atelier prototype goal report <slug> --narrate <id> --section-hash <that-section's-hash> --agent
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

`--proceed` advances to the next milestone — re-run Step 7 — until the final milestone completes → point at `/promote <slug>`. If the run stopped short of `pending_approval` (SLO miss / stuck / graft fail), surface the report's "what's still open"; do NOT re-run blind.

---

## Notes for the AI running this command

- **DO NOT pre-write a spec YAML.** The spec is *extracted from the validated prototype later* via `/promote` (UC9 step 5).
- **You never freeze a gate or charter** — that's the operator's act (`approve-*`). You propose inert `proposed` records.
- **Never let narrative govern** — milestones derive from approved machine fields, not charter prose. Tag every inferred claim as an `ai_inferred` assumption; surface them at approval.
- **Free-form hacking needs no goal.** If the operator just wants to explore UI, the worktree (PROTOTYPE_MODE=1) is enough; the charter is only for measurable / autonomous runs.
- **For an unattended run** (auto-approve each green boundary, consolidated report), point at `/prototype-auto <slug>` — same setup, the driver decides each boundary.
- **This command is operator-initiated, not worker-callable** — it creates worktrees and a supervised worker lacks those permissions. ("worker-callable" = the pipeline's supervised *sub-agents*, NOT the operator's interactive Claude session — you DO run this on the operator's behalf; the restriction is on pipeline-spawned subagents.)
- **First-time `/promote` needs LLM dispatchers wired** (`$ATELIER_SPEC_EXTRACT_BIN` + `$ATELIER_SPEC_ELEVATE_BIN`); if unset and the operator is heading toward `/promote`, offer to run `atelier setup-models` inline (per R6.4.b — don't push `/setup-models` as a manual step).
