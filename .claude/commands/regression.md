---
disable-model-invocation: true
---

You are the regression command. Dispatch the runner at the requested tier. Do NOT narrate script output — the runner prints its own progress and results.

The user's request: $ARGUMENTS

---

## Step 1: Tier

| arg | tier | scope |
|-----|------|-------|
| `quick` | T1 | current feature's tests + covering scenarios |
| `related` | T2 | T1 + tests for features sharing entities |
| *(default)* | T3 | full — all tests + typecheck + build + optional quality checks |
| `integration` | — | full Integration Check (T3 + cross-feature review + scenario design + rule curation) |

## Step 2: Config

Verify `$TYPECHECK_CMD`, `$BUILD_CMD`, `$INTERACTION_TEST_CMD` (and any tier-specific commands you'll exercise) are exported in the current shell. Unset → *"Pipeline env not configured. Export the required CMD vars via `.envrc.atelier` / direnv / shell, then re-run `atelier doctor` to confirm."*

## Step 3: Execute

### T1 / T2 — direct invocation (foreground)

No subagent. Run the commands directly; stream output to the user.

- T1: `bash "$(atelier path --hook regression-runner.sh)" --tier=1 --feature=<FEATURE_ID> --skip-recent`
- T2: `bash "$(atelier path --hook regression-runner.sh)" --tier=2 --feature=<FEATURE_ID>`

Feature id: read the target spec id from `$ARGUMENTS`, else the most recently touched spec in `.specs/features/`. No covering scenarios → runner reports it. `$INTERACTION_TEST_CMD` unset → runner reports "NOT CONFIGURED".

T2 fallback: `.specs/registry.yaml` missing → fall back to T1 only. Runner prints the reason.

### T3 — full suite (default, backgrounded)

Run in the background — a full T3 can cover 100+ scenarios and block the session otherwise. Use `run_in_background: true` on each long step.

**Core (always):**
1. `$TYPECHECK_CMD`
2. `$TEST_CMD`
3. `$BUILD_CMD`
4. `bash "$(atelier path --hook regression-runner.sh)" --tier=3`

**If configured (else the command is a no-op):**
5. `$SMOKE_TEST_CMD`
6. `$A11Y_TEST_CMD`
7. `$SECURITY_AUDIT_CMD` — release-time supply-chain check. **Surface non-zero exit as a T3 failure in Step 4** (not advisory). High/critical CVEs block release like typecheck/build failures. Not a stop-gate marker by design — the stop-gate enforces TWIN/FUZZ/SOAK markers only (see `atelier/hooks/stop-gate.sh`). Empty slot + manifest detected → run `bash "$(atelier path --hook deps-advisory.sh)"` once for the suggested `.envrc.atelier` line, then stop (no auto-edit).
8. `$PERF_TEST_CMD`
9. `$DEPLOY_PREVIEW_CMD` + `$DEPLOY_SMOKE_CMD`

After dispatching, print the progress YAML path (`.specs/.orchestra/regression/<run-id>.yaml`) and the tail commands the user can follow. Do not watch the runs yourself — the harness notifies on completion.

**Codex coverage-gap analysis** (T3, after core finishes). Not yet wired — the dispatcher prompt `atelier/prompts/coverage-gaps.md` is parked pending a future wave. If a coverage report was generated, note its path in the report and skip the gap-analysis pass.

## Step 4: Report

Do NOT re-narrate what the runner printed. Only add:

- One line per failure category the user has to act on (file path + failing test name). Not a reformat of the runner's output.
- If T3 was backgrounded: the run-id and progress YAML path so the user can follow.
- If anything was SKIP/NOT CONFIGURED, name the env var and where the operator sets it (`.envrc.atelier`). One line.

No "All quality checks passed" sign-offs. No closing summary. If the runner exited 0, that's the report.
