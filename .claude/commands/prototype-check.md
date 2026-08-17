---
description: "Run the behavioral smokes for a prototype slug (AI-authored harness, operator-frozen)."
disable-model-invocation: true
---

You are the `/prototype-check` command. Run the behavioral smokes for a prototype slug — repeatable "does it run" checks declared in `.specs/prototype/<slug>.checks.yaml`. Surface results; never gate `/promote`.

**W9.11 — you author the harness; the operator freezes it.** This file used to be operator-authored and you were forbidden from filling it in. That made the lane's strongest guarantee (auto-pilot will not certify without a `kind: interaction` scenario) depend on a file you were not allowed to write, so every unattended run stalled on "ask the operator to author checks.yaml" — the one instruction an overnight run cannot follow. Authoring is now yours. The operator's hand stays on the **freeze** (`approve-milestone` hash-binds the gate, `gate.artifacts` protects the machinery), which is where it was always load-bearing.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 (W8.5 addition) and ADR-W8.5-1 sibling discussion in `docs/atelier/ATELIER_PLAN.md` § W8.5.

The user's slug: $ARGUMENTS

---

## Step 1 — Resolve the slug

If `$ARGUMENTS` is empty, ask the operator which prototype slug to check. Use `atelier prototype list --agent --compact` to enumerate live prototypes and propose the choices via `AskUserQuestion`. If the operator names a slug that doesn't exist, surface the live list and ask again.

If `$ARGUMENTS` matches a live slug, proceed.

## Step 2 — Run the check

```bash
atelier prototype check <slug> --agent --compact
```

Surface the JSON envelope to the operator. Three outcomes:

- **First-run / lazy skeleton** (`skeleton_written: true`, `harness_ready: false`): the CLI writes `.specs/prototype/<slug>.checks.yaml` and returns `harness_brief` — the product-agnostic instruction for standing the harness up. **Do the bootstrap now** (Step 2.5); do not hand the brief to the operator as a task.

- **Empty file** (file exists but no uncommented scenarios — `total: 0`, `harness_ready: false`): same — the harness is still a skeleton. Bootstrap it.

- **Scenarios ran** (`total > 0`): surface the per-scenario pass/fail summary plus the aggregate `pass_count`/`fail_count`. Even if every scenario fails, the CLI exits 0 — `/prototype-check` is informational, not a gate. Do not treat the result as blocking anything.

The CLI refuses (exits non-zero on stderr but the slash command surfaces this verbatim):

- **`checks-malformed`** (exit 2) → the YAML has a parse error or schema violation. The diagnostic names the line and field. If you authored the file, fix it yourself and re-run; if the operator hand-edited it, surface the diagnostic before changing their text.
- **`worktree-missing`** (exit 1) → the prototype's worktree was removed (manual `rm -rf`, OS cleanup, etc.). Suggest `atelier prototype start <slug>` if they meant to resume.

## Step 2.5 — Stand the harness up when it isn't there

`harness_ready: false` in any envelope means this lane cannot yet verify itself — every "does it actually work?" question would have to go back to the operator, and an unattended `/prototype-auto` run has nothing to certify against. Build it:

1. Read `harness_brief` from the envelope (or `atelier prototype harness status <slug> --agent`). It states the contract, deliberately naming no tooling.
2. **Pick the harness that fits THIS product.** A Next.js app, a Rust CLI, an HTTP API and a Flutter target need four different things. This is the same latitude `/develop` gives via `INTERACTION_TEST_CMD` — the framework owns the contract, you own the choice.
3. Author `.specs/prototype/<slug>.checks.yaml`:
   - `kind: build` for the compile/typecheck signal.
   - a top-level `serve:` block **if the product serves** — `command`, `ready_command` (any shell command polled until exit 0: an HTTP probe, `nc -z`, a log-line grep, a device probe), optional `ready_timeout_seconds` / `stop_timeout_seconds`. The framework boots it once, waits for readiness, runs every scenario against it, then reaps the whole process group. **Bind the port from `${ATELIER_VARIANT_PORT:-<default>}`, never a literal** — concurrent tournament variants would otherwise collide on one socket. Do **not** hand-roll boot/teardown inside a scenario `command`, and never ask the operator to start a dev server in another terminal.
   - at least one `kind: interaction` scenario that drives the product and **asserts observable output**. A command that merely exits 0 is a smoke check mislabelled, and it defeats the guarantee the tier exists for.
   - install whatever the driver needs, and record the install in that scenario's **idempotent** `setup:` (e.g. `[ -d node_modules ] || npm ci`) so a fresh tournament variant worktree bootstraps itself.
4. Re-run `atelier prototype check <slug>` and iterate until the harness **executes** cleanly. Scenarios may legitimately still FAIL their assertions — the feature isn't built yet. What must not survive: a scenario that can't execute (exit 126/127), a `serve:` that never reaches readiness, or an interaction check that asserts nothing.

**Never weaken the gate to make it green.** `command: "true"`, an assertion-free interaction check, or a deleted scenario buys a green that certifies nothing — strictly worse than no harness, because the run will then report a working product that isn't.

## Step 3 — Set expectations

After surfacing results, remind the operator:

- **This does not gate `/promote`.** Pass or fail, the prototype lane stays loose. Behavioral smokes are an iteration tool, not a quality bar.
- **Scenarios run from the worktree's cwd** (`.worktrees/prototype-<slug>/`), not from main. Commands like `npm run build` resolve against the worktree's package.json, not main's.
- **30-second default timeout per scenario.** Override per-scenario via `timeout_seconds:` in checks.yaml.
- **Lifecycle is bounded.** `.checks.yaml` is purged on `/drop-prototype` AND on `/promote` post-state-flip. If the operator wants to preserve the file across abandonment, they copy it out manually before dropping.

---

## Notes for the AI running this command

- **DO author `checks.yaml`** (W9.11 — this reverses the pre-W9.11 rule). Standing the harness up is your job, not a question for the operator. What you must NOT do is invent acceptance criteria: assert what the prototype is *supposed* to do per the goal/charter/intent already on record, and surface any assumption you had to make rather than burying it in a scenario.
- **Read the logs instead of asking.** Every run writes `.atelier/harness/` inside the worktree — `serve.log` plus `<scenario>.out.log` / `<scenario>.err.log`. The envelope carries `log_dir` and per-scenario `log_paths`. "I need you to check the browser console" is almost always a log you can open yourself.
- **DO NOT treat failures as blocking.** `/promote` does not consume `checks.yaml`. The Extractor reads observed behavior + screenshots; the smokes are a separate axis.
- **Changing an already-FROZEN gate is different.** Once `approve-milestone` has hash-bound a milestone's checks.yaml, editing it breaks the freeze — re-freeze deliberately with the operator rather than silently rewriting the measuring stick you are judged by.
- **For your own subsequent file edits within the worktree**, prefix with `cd .worktrees/prototype-<slug> && source .envrc.atelier && <cmd>` (per R6.4.b), same as the rest of the prototype lane.
