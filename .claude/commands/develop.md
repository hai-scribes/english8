---
disable-model-invocation: true
---

## How this command works

`/develop` is an **operator-driven phase walk**: you pick the spec,
ask `atelier develop phase <slug>` what phase it's in + the next hook
to run, and invoke the wired hooks directly (`approve-spec.sh`,
`scribe-author.sh`, `red-phase-check.sh`, `unlock-scribe-tests.sh`,
`implement-ac.sh`, `audit-sign.sh`, `regression-runner.sh`). The
Atelier substrate — HMAC marker chain, container isolation, supervised
dispatch — is intact behind those hooks; the autonomous **planner**
that would batch-dispatch specs is parked (see PLAN § "Open questions
→ planner CLI"), which is why this walk is hand-driven, not why it's
slow.

- **Status primitive.** `atelier spec set-status <slug> <status>` is
  the only validated way to flip `status:` (do not hand-edit that line).
- **Semantic gates are autopilot-only.** G-INTENT / G-CONFORM (the
  cross-family `semantic-gate.sh` checks that seal `.intent-validated`
  / `.semantic-verified`) run under `/orchestra-auto`, NOT interactive
  `/develop`. `develop phase` reports their marker state if present.
- **No config file.** Atelier does NOT source a config env file; read
  each pipeline CMD var by name (Entry flow step 1).

---

You are the execution command. `/develop` walks one production spec
through SPEC → RED → GREEN → VERIFY → CLOSE.

The user's request: $ARGUMENTS

---

## Entry flow

1. **Verify env.** Read each pipeline CMD var by name; STOP with an
   enumerated diagnostic if any of the required ones are unset:

   - `TYPECHECK_CMD` — required.
   - `BUILD_CMD` — required.
   - `INTERACTION_TEST_CMD` — required for UI specs (any with `design_refs`);
     also the per-scenario driver for CLOSE-time regression of UI specs.
   - `TEST_CMD` — required for backend specs with `contracts.*`.
   - `REGRESSION_BATCH_CMD` — CLOSE-time regression for **backend** specs
     (and any spec without interaction scenarios). `regression-runner.sh`
     reads `REGRESSION_BATCH_CMD` / `INTERACTION_TEST_CMD` only — NOT
     `TEST_CMD` and NOT `PACKAGE_CMD`. Set it to the suite runner (e.g.
     `python3 -m pytest -q`, `npm test`); the runner appends the in-scope
     files. Without it (and without `INTERACTION_TEST_CMD`),
     `regression-runner --tier=2` exits 2 ("INTERACTION_TEST_CMD NOT
     CONFIGURED") and CLOSE is blocked.

   STOP message form: `"Pipeline env not configured. Missing: TYPECHECK_CMD, INTERACTION_TEST_CMD. Export them via .envrc.atelier / direnv / shell, then re-run atelier doctor to confirm."` Always list **which** vars are missing.

   **Backend-unit CLOSE (unit-scope regression — live-run 2026-06-14):**
   `regression-runner` resolves scope from interaction **scenarios** in
   `.specs/regression-scenarios.yaml`. A pure backend-unit spec (no
   `contracts.*`, no `design_refs`) registers none, so the runner now
   **auto-detects unit scope**: it resolves the spec's OWN unit-test files
   (from each AC's `test:` name, falling back to `entities_touched` stems),
   runs them via `$REGRESSION_BATCH_CMD` as the T1 set, and binds
   `.regression-t1` + `.regression-t2` to `sha256(spec + test files)` (no
   scenario manifest needed). `--tier=2 --spec=<slug>` just works — the
   tests actually run (not a vacuous pass) and CLOSE is unblocked.
   Requires `$REGRESSION_BATCH_CMD` set (e.g. `python3 -m pytest -q`). If
   the runner can't resolve any unit-test file it stays on the scenario
   path (the old zero-scope behavior); name your test in the AC `test:`
   field so it resolves.

2. **Working-tree hygiene (WARN, don't block).** Run `git status
   --porcelain` once. Two buckets, both emit WARN lines:
   - **Pipeline paths** (`.claude/`, `.specs/spec-format-reference.yaml`,
     `.specs/architecture.yaml`): uncommitted pipeline files may differ
     from checked-in docs; commit or stash via `/commit` before relying
     on automation.
   - **Any other dirty file** outside `.specs/.orchestra/` and
     `.specs/verify/`: working tree has uncommitted files outside this
     spec's scope. `implement-ac.sh`'s GREEN-commit check will flag them
     mid-phase — surface now so the operator can `git stash` once.

3. **Resolve the spec.** Parse `$ARGUMENTS`:
   - `/develop <slug>` (bare token, matches `.specs/features/<slug>.yaml`)
     → force SINGLE on that spec; jump to **Lifecycle**.
   - `/develop feature <name>` → restrict to one feature_id. Read
     `product.yaml`, list specs with matching `feature_id` AND
     `status: planned`, run them sequentially via the SERIAL section.
   - No args → read `product.yaml`, present every `status: planned` spec
     via `AskUserQuestion`. NOOP if the list is empty (print
     `No planned specs. Author one via /product first.`). The operator
     picks one (SINGLE) or all-of-feature (SERIAL).

4. **Bootstrap awareness (W9.9).** If the worktree is bare (only
   `.atelier/`, `.claude/`, `.gitignore` — typical post-`/promote`
   state), surface the bare-state notice:
   > Production worktree is fresh from the architectural firewall (no
   > prototype cherry-pick). If the project had no code before, bootstrap
   > your toolchain (package.json, tsconfig, vite/next config, etc.) as
   > your FIRST commit before entering RED. No bypass is needed:
   > enforcement is lane-scoped (ADR-ADOPT-1), so scaffold files — claimed
   > by no spec — pass the gate silently.

5. **Header line** so operator sees the shape:
   `Mode: SINGLE — spec=things3-todo` or
   `Mode: SERIAL — feature=auth, specs=[auth-google, auth-email]`.

---

## Concurrency

The orchestrator daemon (`$(atelier path --script orchestra-orchestrate.py)`)
owns `.specs/.orchestra/orchestra.lock` for the duration of a sweep.
The slash-command session does NOT acquire the lock directly. Inspect
holder state via:

```bash
atelier orchestra status
```

Force-release (operator-invoked only, when a stale lock from a crashed
daemon blocks new sweeps):

```bash
atelier orchestra stop
```

`/product`, `/hotfix`, `/bug`, `/regression`, `/prototype` do NOT request
this lock.

---

## Dispatch: SINGLE / SERIAL

For each spec in listed order:

1. Run **Lifecycle** below (SPEC → RED → GREEN → VERIFY → CLOSE).
2. SERIAL: if a spec ends BLOCKED, stop the chain; report what blocked;
   leave remaining queued. User re-runs after fixing.

---

## Lifecycle (SINGLE/SERIAL body)

Per-spec SPEC → RED → GREEN → VERIFY → CLOSE, in-process.

### Phase routing — ask the router

Do NOT inspect markers by hand. Run:

```bash
atelier develop phase <slug>
```

It loads the on-disk marker state and returns the canonical phase
(`SPEC` / `UNAPPROVED` / `RED` / `GREEN` / `VERIFY` / `AUDIT` / `DONE`)
plus `next_action` — the exact next hook to run — from the SAME
`_phase_for()` the orchestrator uses, so the walk can't drift from the
scheduler. Resume at the phase it reports; do that step; re-run the
verb to confirm the marker advanced. Phase → operator-facing section
below:

| Router phase | This command's phase |
|---|---|
| `SPEC` (no spec file) / `UNAPPROVED` | **SPEC** (author + approve) |
| `RED` | **RED** (Scribe / failing test → unlock) |
| `GREEN` | **GREEN** (implement ACs) |
| `VERIFY` | **VERIFY** (Auditor) |
| `AUDIT` | **CLOSE** (regression → set-status done) |
| `DONE` | **CLOSED** |

### Phase 0: Read spec + resume

1. `product.yaml` missing → STOP. `"No plan found. Run /product first."`
2. `atelier develop phase <slug>` → resume at the reported phase.

### Phase: SPEC

1. Open `.specs/features/<slug>.yaml`. If absent, author it from the
   product.yaml row plus operator clarification.
2. Explore the codebase — read code, check git history, run scripts.
   For "where is X / who calls Y / which file handles Z" questions, use
   `grep -rn`, `find`, or ripgrep directly. For each `entities.requires`
   listed in the spec, manually grep for the entity name to load
   owner-spec context.
3. **Pre-spec clarification.** One targeted question at a time on edge
   cases / error handling / boundaries. For non-trivial scope present
   2-3 alternatives with trade-offs. Skip only for truly trivial scope.
4. `TaskCreate` per AC.
5. Write `.specs/features/<slug>.yaml`. Use the exact slug from
   `product.yaml`. Field definitions: `.specs/spec-format-reference.yaml`.
   Include `feature_id`.
6. Each AC lives in its own spec — cross-cutting specs cover
   infrastructure only.
7. **No risk tier:** every spec gets the strict bar — `.regression-t2`
   marker required at close, Scribe and Auditor must reach Tier 2 or
   block.

**[IF UI feature] Design phase:**

- Read `.specs/design-foundations.yaml` + `.specs/design-system.yaml`.
- design-system missing → extract from existing UI (if any) else
  scaffold from foundations. Present for approval.
- Design material provided → save the file directly at
  `.specs/design/<slug>/<descriptive-name>.png` (mechanical file write).
- Map every UI element to a design-system component (existing → reuse;
  new → add to catalog with `status: planned`).
- Fill `design.wireframe`, `design.components`, `design.interaction_notes`.
  AI-filled states (loading/error/empty) marked `ai_added: true`.
- **Anti-pattern:** describe-and-diverge. Compare implementation against
  the saved image, not your memory of it.

### Gate: stale_rules (operator-driven, no substrate)

The auto-stale-rules-check (`atelier plan stale-rules-check`) is
parked. Manual fallback: if the spec's `feature_id` matches a directory
under `.atelier/rules/feature/<feature_id>/`, diff the rule files
against the spec's claims; document any divergence in the spec's
`existing_context_unverified:` block (which IS substrate-checked at
spec-validate). Skip if no per-feature rules directory exists.

### Gate: Spec completeness

**Pre-flight skim (before the first `validate` call).** First-pass
fails are heavily concentrated in a few buckets — skim the spec for
each before invoking the gate to convert correction cycles into
pre-flight catches:

1. **AC `when` clause** — non-empty, ≥3 words, contains an action verb
   (click/tap/submit/navigate/call/POST/save/…). UI specs especially:
   "creates a task" fails the trigger lint; "user clicks the Save
   button" passes.
2. **AC `then` clause** — non-empty, ≥3 words, AND contains either a
   quoted/numeric value OR an outcome verb (display/render/return/
   persist/throw/…). "works correctly" fails; "responds with 201 and
   the new id" passes.
3. **`existing_context` references** — every path with a known extension
   must exist on disk; every backticked single-token symbol (length ≥4)
   must be `git grep`-findable. List in-flight renames under
   `existing_context_unverified: [...]` to opt out specific entries.
4. **`unclear` block** — clear of active business items. Anything left
   here is a `[BLOCK]` and the gate stops.

`atelier spec validate <slug>`. Fix FAILs.

**Run foreground.** `validate` MUST run as a foreground Bash call — its
FAIL list must be read in the same turn to act on. `run_in_background:
true` block-buffers the redirected stdout and the tail of the output
can read empty for minutes.

### Gate: Spec approval (HMAC marker)

`AskUserQuestion`: Approve / Request changes / Defer. On Approve →
immediately run `bash "$(atelier path --hook approve-spec.sh)" <slug>`.
Do not re-ask. `approve-spec.sh` records the `.approved` marker; `develop
phase` then reports `RED` — RED will not proceed without it. (This
is the phase machine, NOT stop-gate, which gates only TWIN/FUZZ/SOAK.)

### Phase: RED (TDD)

**Honor the scope-classifier route (Fowler: replicate as unit first).**
When a spec has `.specs/verify/<slug>.classifier.yaml`, each AC carries
a route: `unit` → write a unit test, `contract` → Scribe contract test,
`interaction` → regression scenario via `$INTERACTION_TEST_CMD`. Specs
with no classifier.yaml (legacy / retroactive) default to interaction
for UI features and unit for backend-only ACs.

**Role boundary:** Builder does NOT author tests. Scribe writes them —
UI specs use `scribe-red.md` + `$INTERACTION_TEST_CMD`; backend specs
with `contracts.*` use `scribe-contract.md` + `$TEST_CMD`. Authoritative
role-prompt contracts: `atelier/prompts/scribe-{red,contract}.md`.

**Before writing interaction tests:** read the script
`$INTERACTION_TEST_CMD` points to and its sourced helpers. Don't assume
signatures.

**Scribe vs non-Scribe RED.** The `RED with Scribe` flow below —
`scribe-author.sh`, `red-phase-check.sh`, `unlock-scribe-tests.sh` —
applies only when Scribe is in scope: UI specs (any `design_refs`) AND
backend specs declaring `contracts.*`. **Backend specs with neither
skip all three steps**: Builder writes the unit/contract test directly,
runs it to confirm it fails, then proceeds to GREEN.

#### RED with Scribe (UI or contracts.* backend)

Ordering: **SPEC → SCRIBE (locked tests) → RED verify → UNLOCK → GREEN
→ VERIFY**.

1. **Tier 1 — Codex.** `bash "$(atelier path --hook scribe-author.sh)" post-red <slug>`.
   - Exit 0, `.scribe-authored.cross-vendor` marker present → step 4.
   - Exit 0, stdout starts with `SKIP:` and no marker → all-unit-routed
     spec (every AC went to `unit_test_covers`); skip steps 4–5.
   - Exit 2 `SCRIBE-FALLBACK-NEEDED` → step 2.
   - Exit 1 → config error.

2. **Tier 2 — Different-model Claude subagent.** Dispatch `Agent` with
   a model DIFFERENT from this session (Opus→Sonnet/Haiku;
   Sonnet→Opus/Haiku). Brief:
   - Prompt: `atelier/prompts/scribe-red.md`.
   - Spec YAML + `ui_contract` + every `design_refs` PNG.
   - Write dir: `.specs/verify/<slug>/scribe-tests/` (NOT project test
     dir — locked pre-unlock).
   - Framework detected from `$INTERACTION_TEST_CMD`.
   - Hard rule: do NOT read any implementation file. Emit strict JSON
     manifest only.

   After subagent reports written: `bash "$(atelier path --hook scribe-author.sh)" --subagent-authored <slug>` → signs `.scribe-authored.cross-model`.

3. **Double-failure.** If Tier 2 dispatch itself also fails, the gate
   blocks — fix Codex or the subagent path. There is no same-model
   fallback.

4. **Red-phase false-pass guard.** `bash "$(atelier path --hook red-phase-check.sh)" <slug>` — runs tests in place against `$INTERACTION_TEST_CMD`.
   - Exit 0 → `.red-verified` signed → step 5.
   - Exit 1 → one or more tests passed pre-implementation. Re-enter RED
     with stronger Scribe; do NOT hand-edit scribe-authored files
     (hash-lock).
   - Exit 2 → inconclusive; continue with documented note.

5. **Unlock:** `bash "$(atelier path --hook unlock-scribe-tests.sh)" <slug>` — moves files to project test dir, writes `.scribe-unlocked`, re-verifies hash.

6. Enter GREEN. Builder may read (not modify) the unlocked tests.

**Assertion lock.** GREEN/VERIFY may update selectors + setup; **do NOT
change assertion values** (expected text, URLs, counts). If an
assertion must change, the AC is wrong — update spec, re-enter RED.
Enforced by `verify-test-assertions.sh` with a whole-file hash-lock
against the Scribe manifest.

#### Scribe correction loop

If Scribe-authored tests are wrong: **do NOT hand-edit** (hash-lock
blocks GREEN) and **do NOT author as Builder** (destroys the role
boundary). Fix the input that caused Scribe to fail, then re-invoke:
`bash "$(atelier path --hook scribe-author.sh)" post-red <slug>` — auto-clears any prior
`.scribe-unlocked`.

### Phase: GREEN

For each AC, re-read its spec definition from disk, write the minimum
code to pass.

**[IF UI feature] Component resolution BEFORE any AC:**
- Exists in `design-system.yaml` (`existing`/`extend`) → MUST reuse;
  import from its `source`. Extending = modify existing file, update
  catalog. Never fork.
- New → if design was provided, ask user before creating. Implement as
  standalone reusable file; register in `design-system.yaml` with
  `source` + `status: implemented`; then use.
- Apply design tokens. No hardcoded values where tokens exist.

**Per-AC loop:**
1. Implement AC.
2. Run tests + `$BUILD_CMD`. Fix build errors before moving on.
3. Commit working state (rollback point) with **`PIPELINE_WORKER=1 git
   commit ...`**. This is mandatory for in-phase GREEN commits, not
   optional: the spec OWNS its `entities_touched` files but has no AUDIT
   marker yet (audit runs at VERIFY), so the drift-guard's
   `reconcile-needed` classifies the new code path as drift (`NEW`) and
   the pre-commit hook dispatches the Reconciler-LLM — which BLOCKS the
   commit (and, if the reconcile prompt isn't configured, hard-fails
   exit 2). `PIPELINE_WORKER=1` is the worker short-circuit: in-phase
   commits prove spec match via the phase-gate HMAC chain (the spec is
   `.approved`; the phase machine is driving), so re-running the
   Reconciler on every rollback commit is both wrong and wasteful. Test
   files written this phase are also unowned (`entities_touched` lists
   implementation paths) — the same `PIPELINE_WORKER=1` covers them.
   (The CLOSE commit does NOT use this — by then the audit marker exists
   and the drift-guard SHOULD validate staged code against it.)
4. `bash "$(atelier path --hook implement-ac.sh)" <slug> AC-N passing` —
   atomic update of `progress` + `ac_progress[]`, auto-advances to
   VERIFY when all ACs pass. Do NOT hand-edit `progress:` YAML. The
   final AC (the one that flips to VERIFY) runs a working-tree
   cleanliness check; commit the SPEC-phase `.approved` /
   `.approved.snapshot.yaml` markers (under `.specs/verify/`, also via
   `PIPELINE_WORKER=1`) before it, or that advance refuses.
5. `TaskUpdate` AC completed.

Never modify a test to make it pass — fix implementation. Typecheck
runs post-edit; fix errors immediately.

**Circuit breaker trip** (3 consecutive failures on same test/error) →
suggest `bash "${ATELIER_CODEX_QA_BIN:?codex-qa not configured}" edge-cases <slug>`,
OR ask user. (Slot unset → operator wires `$ATELIER_CODEX_QA_BIN`
to a script implementing the per-role dispatch contract.)

### Phase: VERIFY

**What runs today, in order:**

1. **Tests clean.** Run `$INTERACTION_TEST_CMD` (UI specs) or
   `$TEST_CMD` (backend `contracts.*` specs) and confirm a clean pass.
   There is no auto PostToolUse typecheck/build — you also run
   `$TYPECHECK_CMD` and `$BUILD_CMD` yourself (during GREEN).
2. **UX / conditional review (AI-judgment).** For UI specs, sanity-check
   UX quality against the design. For changes spanning 3+ files / new
   deps / arch / perf, do a conditional deeper read. No hook, no marker
   — your judgment.
3. **Auditor (Gate G) — always, blocking.** Tier 1 first:
   `bash "$(atelier path --hook audit-sign.sh)" post-verify <slug>`; on
   `CODEX-FALLBACK-NEEDED` (exit 2) cascade to a different-model subagent
   reviewing per the role prompts in `atelier/prompts/auditor/`
   (edge-cases / security / ux-review). Seals `.audited-*` (2-tier
   cascade; mechanics in `atelier/hooks/audit-sign.sh`).

**Not yet wired (do NOT invoke a missing hook):** the dedicated V2
gate hooks — `run-interaction.sh`, `ui-contract-check.sh` (UI-CONTRACT),
`axe-check.sh` (A11Y), `visual-diff.sh` (VISUAL-DIFF) — and their
`.interaction`/`.ui-contract`/`.a11y`/`.visual-diff` markers are a
future wave; today step 1 covers their intent by running the test
command directly. Stop-gate (`stop-gate.sh`) enforces ONLY the
TWIN/FUZZ/SOAK markers and ONLY when wired as a Stop hook — `atelier
init` does NOT wire it, so it does not fire automatically; treat
TWIN/FUZZ as checks YOU run. (The legacy V5 change-scope gate is
retired — `audit-sign.sh` depends on no `.change-scope-ok`; don't
revive it.)

### Phase: CLOSE

**Ordering:** regression markers must land before spec-status flip.
You MUST land `.regression-t2` before close (run the regression-runner below) —
an AI-driven discipline, NOT auto-enforced by stop-gate (which gates only
TWIN/FUZZ/SOAK). Regression runs FIRST.

1. **T1+T2 regression (mandatory before close-out).**

   Foreground in SINGLE/SERIAL.

   **SINGLE / SERIAL:**
   ```bash
   bash "$(atelier path --hook regression-runner.sh)" --tier=2 --spec=<slug>
   # or batch (≥2 specs sharing one feature_id in this session):
   bash "$(atelier path --hook regression-runner.sh)" --tier=2 --specs=<slug-a>,<slug-b>,...
   ```

   `--spec`/`--specs` take the spec **slug** — the `.specs/features/<slug>.yaml`
   filename stem (`--spec=<slug>`, `--specs=<slug-a>,<slug-b>`). Per the bare-slug
   rip the runner has NO numeric-id lookup; a numeric/wrong value probes
   `.specs/features/<value>.yaml`, isn't found, and exits 1.

   Runner signs one HMAC marker per listed spec. Rejects mixed-feature
   batches. Guarantees: per-file retry + flaky tracking, T1/T2 split
   (T1 blocks immediately; T2-delta failure preserves T1 marker but
   withholds `.regression-t2` — so close is not clean until it lands),
   tier-aware marker dedup.

   **Sticky-failed escape:** the runner caches failed scenario paths
   and re-runs only those on the next invocation with the same
   spec+manifest+scope. Set `REGRESSION_FRESH=1` to bypass the cache
   and force a full-scope run.

   **Triage table** (every failure → one row):

   | Failure location | Blocks this spec? | Action |
   |---|---|---|
   | Code THIS feature changed | Yes — it's the test | Update scenario |
   | Untouched code, own-feature T1 this spec depends on | Yes | Pause, fix, resume — keep fix in this spec's scope |
   | Untouched code, unrelated | No | `atelier plan register-bug` — DO NOT absorb into this commit. |
   | References removed feature (stale scenario) | No | Clean manifest; re-run. Not skippable as "pre-existing". When the stale scenario belongs to a DIFFERENT feature than the current spec, the manifest cleanup goes in a separate `chore(test):` commit — do NOT absorb it into the spec's implementation commit. |
   | T2-delta failure | Yes at session close — `.regression-t2` is required before close even though the T1 marker still signs | `register-bug --confirm-on-head <test-path>` for the related-feature defect, then quarantine or fix; re-run T2 to clear |

2. **Coverage-diff gate (opt-in — W2 "green but blind", GAP-1).** When the
   project opts in (`ATELIER_COVERAGE_DIFF_GATE=1`, or `coverage_gate:` `{enabled:
   true}` in `.specs/architecture.yaml`), every changed executable **Python**
   line must be executed by a routed test. A passing suite that never RUNS a new
   line — an untested branch, a dead helper, an unexercised fallback — is the
   exact W2 escape this gate catches (SufP alone is blind to it). Run AFTER
   regression, BEFORE the status flip:
   ```bash
   bash "$(atelier path --hook coverage-diff-gate.sh)" --spec=<slug>
   ```
   Clean → signs `.specs/verify/<slug>.coverage-diff` (SK-4 HMAC). An uncovered
   changed line → **exit 2, the marker is WITHHELD**, and the block reason lists
   the `file:lines` — add a routed test that executes each line (or justify then
   cover it) and re-run. Inert (exit 0, no marker) when not opted in, so a project
   that hasn't declared it is unaffected. Python-only + diff-scoped +
   docstring/continuation-safe ⇒ false-block-rate 0 by construction (planted-defect
   benchmark: recall 1.0 / false-block 0.0, `bench_coverage_gate.py`). The exit-2
   above is the primary enforcement; the GAP-6 stop-gate marker-presence backstop
   (step 2c) is the fail-CLOSED session-close backstop.

2b. **Architecture-conformance gate (opt-in — W1 drift, GAP-6).** When the
   project opts in (`ATELIER_ARCH_CLOSE_GATE=1`, or `arch_gate:` `{enabled: true}`
   in `.specs/architecture.yaml`) **and** declares a `boundaries:` block, the
   spec's diff must introduce no forbidden cross-layer edge. Run alongside
   coverage, BEFORE the status flip:
   ```bash
   bash "$(atelier path --hook arch-close-gate.sh)" --spec=<slug>
   ```
   Clean → signs `.specs/verify/<slug>.arch-verified` (SK-4 HMAC). A NEW forbidden
   edge → **exit 2, the marker is WITHHELD**, and the block names the `src→dst @
   file:line` — remove the cross-layer import (or add a scoped `# arch-allow`) and
   re-run. Inert (exit 0, no marker) when not opted in or no boundaries declared.
   Diff-scoped ⇒ pre-existing debt never false-blocks (`bench_arch_gate.py`:
   recall 1.0 / false-block 0.0).

2b2. **RTS affected-test gate (opt-in — W2 silent manifest-escape, GAP-3).** When
   the project opts in (`ATELIER_RTS_GATE=1`, or `rts_gate:` `{enabled: true}` in
   `.specs/architecture.yaml`), a code-DEPENDENT test (one whose trace executes a
   changed line) that sits OUTSIDE the declared regression scope must not REGRESS —
   closing the escape where a dependent with no registered scenario contributes
   zero test files silently. Run alongside coverage/arch, BEFORE the status flip:
   ```bash
   bash "$(atelier path --hook rts-affected-gate.sh)" --spec=<slug>
   ```
   The gate RUNS each code-affected test and checks green@base→green@patch. Clean →
   signs `.specs/verify/<slug>.rts-affected` (SK-4 HMAC). A code-affected test that
   regresses green@base→red@patch → **exit 2, marker WITHHELD**, naming the escaping
   test(s) — fix the regression or add them to the routed scope, then re-run. Inert
   (exit 0) when not opted in. **Runner: pytest-when-available** (drives fixture/
   parametrize/class suites — the recall cliff is escaped for CALL-phase coverage;
   `ATELIER_RTS_RUNNER` overrides); **stdlib fallback** (module-level zero-arg `test_*`
   only) when pytest is absent. Value confirmed vs the declared-scope baseline
   (`bench_rts_oracle.py`: recall 1.0 / false-select 0.0; escaped_regression
   declared=1→oracle=0 at cost < run-everything) + the pytest recall-cliff arm
   (`bench_rts_pytest.py`: recall stdlib 0→pytest 1.0 on pytest-shaped covering tests).

2c. **Session-close backstop (opt-in — GAP-6, retrofit-safe).** The four
   close-markers above (`.coverage-diff`, `.arch-verified`, `.regression-t2`,
   `.rts-affected`) are each enforced at their own CLOSE step; the Stop-hook
   `stop-gate.sh` is the
   fail-CLOSED backstop that refuses session-close when a `done` spec is MISSING a
   required marker (the gate ran — but did the worker actually run it?). It is
   **default-OFF**; arm it once per project with:
   ```bash
   atelier stop-gate enable   # grandfathers every already-done spec — never mass-blocks
   ```
   A marker is required ONLY when its producing gate is enabled, and specs that
   were already `done` when the backstop was armed are exempt. A missing / forged
   / rotated required marker blocks DONE — do NOT hand-edit markers or the
   grandfather list; re-run the named gate. (`bench_stop_gate_backstop.py`: recall
   1.0 / false-block 0.0.)

3. **Spec close-out (manual, until planner ships).** Verify all
   regression markers landed. Then edit `.specs/features/<slug>.yaml`
   directly:
   - Set `progress: done` (hand-edit — no CLI flips `progress:`).
   - Set `status: done` via **`atelier spec set-status <slug> done`** (validated,
     idempotent, comment-preserving — do not hand-edit the `status:` line).

   Then edit `product.yaml`: flip the spec's row to `status: done` and
   update the feature's `description` if any of the spec's outcomes
   diverged from the original product-level framing.

   **Commit discipline:** the close commit subject must say `close
   <slug>` AFTER all markers are present and the spec/product flips
   landed. Do NOT write a `chore(<slug>): close ...` commit before the
   markers are signed — a follow-up "real close" commit then accretes
   noise.

4. **Bug-intake ordering.** If any `atelier plan register-bug` calls
   were made during step 1's triage, commit their `product.yaml` delta
   *before* the spec close commit. Both mutate `product.yaml`; a single
   combined commit interleaves the bug-intake and spec-close deltas and
   forces a manual split-commit recovery.

5. **Retrospective:** reflect on what would have prevented manual
   correction / missed patterns / test gaps. Surface notable findings
   in chat. Append framework-level lessons to
   `.atelier/retro/notes-for-operator.md` (manual; the operator-read
   channel).

6. `/compact`.

### End-of-session summary

One line per non-empty section: `Built: <done>` / `Remaining: <planned>` /
`Issues: <integration>` / `Next: /develop or /product`.

---

## Reference

The section bodies above are canonical for this command. For deeper
invariants and hook mechanics, read source directly:

- `atelier/hooks/` — every wired gate hook (audit-sign.sh, regression-runner.sh, scribe-author.sh, red-phase-check.sh, …)
- `atelier/prompts/scribe-{red,contract}.md` — Scribe role contracts
- `docs/atelier/ATELIER_PLAN.md` — wave-level history + parked decisions + close-time gates
- `docs/atelier/ATELIER_REQUIREMENTS.md` — R-IDs + non-goals
- `docs/atelier/ATELIER_USE_CASES.md` — UC1–UC20 operator flows
