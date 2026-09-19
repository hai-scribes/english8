---
description: "Single entry to the prototype lane — resume an existing prototype, or create a new one."
disable-model-invocation: true
---

You are the `/prototype` command — the single entry to Atelier's prototype lane: a fast, gate-free exploration lane for greenfield UI / interaction work where a prose-YAML spec is the wrong starting artifact. A validated prototype becomes the source of a spec; production code is rebuilt fresh from that spec via `/develop`.

`/prototype` does two things: **resume** an existing prototype, or **create a new one** (branch + worktree + harness). Free-form hacking needs nothing beyond that. The measurable-goal machinery — Product Charter → ordered milestones → operator-frozen plan → attended boundary runs — is a **separate, opt-in layer** that lives in `/prototype-goal`; you do not read it, and do not pay for it, unless the operator asks for a measurable goal. For the same setup run **unattended**, use `/prototype-auto`.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 and `docs/atelier/ATELIER_AUTOPILOT.md`.

The user's input (slug and/or idea, possibly empty): $ARGUMENTS

---

## Step 1 — Resolve resume-vs-create

**If `$ARGUMENTS` names a slug, try the resume directly — one call, not two:**

```bash
atelier prototype resume <slug> --agent --compact
```

Exit 7 (`no prototype state`) means no such lane → treat it as a new idea and go to Step 2. On exit 0 this is a **resume**, and the envelope is the whole answer — it carries `branch`, `worktree_abspath`, `base_ref` / `base_commit`, `last_commit` (`{sha, subject, age_hours}`), `checkpoint_path` (repo-relative) + `checkpoint_abspath` + `prior_checkpoint`, and — for a goal-mode prototype — a `goal` block (`current_milestone`, `current_milestone_status`, `at_boundary`, `blocking[]`) plus a `next_command`. Do not re-derive any of it from git or a second CLI call.

Then, in order:

1. **If `prior_checkpoint` is true, READ `checkpoint_abspath` before doing anything else.** That file is the narrative half of the resume — current focus, what was last tried and how it went, the next intended step, open questions. The envelope restores the machine state; the checkpoint restores the intent. Skipping it is how a resumed session silently redoes work or reopens a settled question.
2. Surface a loud resume banner: branch, worktree path, base commit, last-commit age, and (if present) the goal's current milestone + whether it is `at_boundary`.
3. Continue work in that worktree. For subsequent **in-worktree build** Bash calls (editing prototype code, running the app), prefix with `cd "<worktree_abspath>" && source .envrc.atelier && <cmd>` — use the **absolute** `worktree_abspath` from the envelope, NOT a repo-root-relative `.worktrees/…` path (the relative form breaks when your cwd isn't the repo root; the resolved repo root may not be where you are). Internalize the cd+source per R6.4.b — do not push it onto the operator. NOTE: the `atelier prototype goal …` lifecycle commands and `atelier prototype run` operate on **canonical main-tree state** and resolve it regardless of cwd (they detect the main worktree from git), so you may run them from anywhere — do not assume a `cd` into the worktree redirects where they read/write.
4. If the envelope carries `next_command`, that is the single verb that advances this lane from where it now sits — derived from the same persisted status the rest of the envelope reports. It names the step; the operator still owns every `approve-*`.

Skip the rest of this command.

**If `$ARGUMENTS` is empty**, you need the inventory:

```bash
atelier prototype list --include-idle --agent
```

`AskUserQuestion`: present each live prototype as a **Resume `<slug>`** option (show idle ones as idle), plus a **Create a new prototype** option. Resume → follow the path above. Create-new (or no prototypes) → Step 2.

**If `$ARGUMENTS` looks like a new idea/slug**, propose a slug (`^[a-z][a-z0-9-]{1,63}$`, and no `--` double hyphen — `start` refuses it separately from the regex), confirm via `AskUserQuestion`, and continue to Step 2.

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

**Free-form hacking is now available with no further ceremony.** Inside this worktree you can just ask the AI to build/edit UI ("add a login screen", "make the header sticky") and it commits straight onto `prototype/<slug>` — no charter, no gates, no command.

## Step 4 — Stand up the harness (do this FIRST)

`prototype start` returns `harness_brief` (also at `harness.brief`), and it **is your instruction** — it states what to produce (a way to RUN the thing, a `serve:` block if it serves with the port bound from `${ATELIER_VARIANT_PORT:-…}`, ≥1 `kind: interaction` scenario that asserts observable output, cheap `build`/`smoke` signals, an idempotent `setup:`), and where the logs land. Read it from the envelope; it is not reproduced here, so it cannot drift from what the substrate enforces.

While `harness.ready` is false this lane cannot run, drive or observe its own build — every "does it actually work?" question gets handed back to the operator, and `/prototype-auto` has nothing to certify against. **Build the harness before you build features.** This is your job, not the operator's: the framework owns the contract, you own the tooling choice, and a Next.js app, a Rust CLI, an HTTP API and a Flutter target need four different harnesses. Do not prescribe from habit.

Author `.specs/prototype/<slug>.checks.yaml`, then run `atelier prototype check <slug> --agent` and iterate until the harness **executes** cleanly. Scenarios may still FAIL their assertions — the feature isn't built. What must not survive: a scenario that cannot execute (exit 126/127), a `serve:` that never reaches readiness, an interaction check that asserts nothing. `atelier prototype harness status <slug> --agent` answers "is it ready?" at any point and always carries the brief.

Three things the brief does not cover, because they bind the harness to the *goal* layer:

- **The scenario `name`s you pick here become a milestone's `gate.checks` names.** `approve-milestone` refuses unless the two sets match exactly — so choose names you are willing to reuse verbatim, or the freeze later fails for a reason that looks unrelated to anything you did here.
- **The harness must exist before any gate freeze.** `approve-milestone` hash-binds checks.yaml into the milestone gate, and a variant that edits its own measuring stick is disqualified — so a goal run will *not* bootstrap a harness mid-tournament. Build it here.
- **Never weaken the gate to make it green.** `command: "true"`, an assertion-free interaction check, or a quietly deleted scenario buys a green that certifies nothing.

## Step 5 — Stop here, or add a measurable goal

If the operator only wants to explore, **stop**. The worktree plus a working harness is the whole lane; iterate and commit freely.

Add the goal layer only when the operator wants a **measurable, benchmarkable, autonomously-drivable** goal — required for attended boundary runs and for `/prototype-auto`. It is a substantial flow (charter → operator freeze → risk-first milestones → frozen gates → tournament runs → boundary approvals), so it ships separately: **read `<repo-root>/.claude/commands/prototype-goal.md`** (the `/prototype-goal` command body — resolve the repo root from git, do not assume cwd) and follow it from its **Step 0**, which carries both the preconditions and the mandatory `goal schema` read that everything after it depends on. Do not summarise it from memory — the field shapes and refusal rules are exact.

When the final milestone completes → point at `/promote <slug>`.

---

## Notes for the AI running this command

- **DO NOT pre-write a spec YAML.** The spec is *extracted from the validated prototype later* via `/promote` (UC9 primary flow).
- **You never freeze a gate or charter** — that's the operator's act (`approve-*`). You propose inert `proposed` records.
- **Free-form hacking needs no goal.** If the operator just wants to explore UI, the worktree (PROTOTYPE_MODE=1) is enough.
- **For an unattended run** (auto-approve each green boundary, consolidated report), point at `/prototype-auto <slug>` — same setup, the driver decides each boundary.
- **This command is operator-initiated, not worker-callable** — it creates worktrees and a supervised worker lacks those permissions. ("worker-callable" = the pipeline's supervised *sub-agents*, NOT the operator's interactive Claude session — you DO run this on the operator's behalf; the restriction is on pipeline-spawned subagents.)
- **First-time `/promote` needs LLM dispatchers wired** (the machine-wide `/setup-models` providers, or an exported `$ATELIER_SPEC_*_BIN` override); if unset and the operator is heading toward `/promote`, offer to run `atelier setup-models` inline (per R6.4.b — don't push `/setup-models` as a manual step).
