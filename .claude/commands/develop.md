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

   **No-scenario CLOSE (unit-scope regression — live-run 2026-06-14):**
   `regression-runner` resolves scope from interaction **scenarios** in
   `.specs/regression-scenarios.yaml`. A spec that registers none — of any
   kind: backend-unit, contract, or UI with Playwright AC tests — makes
   the runner **auto-detect unit scope**: it resolves the spec's OWN AC
   test files (from each AC's `test:` name, falling back to
   `entities_touched` stems; a matched doc, data file or asset under
   `tests/` is dropped and named in the log), runs them as the T1
   set through the same dispatch as scenarios (`$REGRESSION_BATCH_CMD`,
   else `$INTERACTION_TEST_CMD`), and binds `.regression-t1` +
   `.regression-t2` to `sha256(spec + test files [+ manifest])`. The
   fallback replaces only the own-feature scope: at tier 2 related
   features' registered scenarios still run as the T2 delta. A spec WITH
   registered scenarios stays on the scenario path.
   `--tier=2 --spec=<slug>` just works — the tests actually run (not a
   vacuous pass) and CLOSE is unblocked. If neither a scenario nor an AC
   test file resolves, the runner REFUSES (exit 2, "NOTHING TO REGRESS",
   no marker) — it never prints PASSED over zero tests; name your test in
   the AC `test:` field so it resolves.

2. **Working-tree hygiene (WARN, don't block).** Run `git status
   --porcelain` once. Two buckets, both emit WARN lines:
   - **Pipeline paths** (`.claude/`, `.specs/spec-format-reference.yaml`,
     `.specs/architecture.yaml`): uncommitted pipeline files may differ
     from checked-in docs; commit or stash via `/atelier-ship` before relying
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
applies only when Scribe is in scope: UI specs (a `design` /
`ui_contract` key, or a non-empty `design_refs`) AND backend specs
declaring `contracts.api` / `contracts.database`. **Specs with neither
skip all three steps**: Builder writes the unit/contract test directly,
runs it to confirm it fails, then proceeds to GREEN.

#### RED with Scribe (UI or contracts.* backend)

Ordering: **SPEC → SCRIBE (locked tests) → RED verify → UNLOCK → GREEN
→ VERIFY**.

1. **Tier 1 — Codex.** `bash "$(atelier path --hook scribe-author.sh)" post-red <slug>`.
   - Exit 0, `.scribe-authored.cross-vendor` marker present → step 4.
   - Exit 0, stderr says `NOT CROSS-VENDOR`, and the marker is
     `.scribe-authored.cross-model` (no cross-vendor one) → the configured
     scribe is the session's own family (single-model mode, e.g.
     `gate_routing.scribe: claude`): the tests are finalized as same-vendor
     fresh eyes, not a cross-vendor pass → step 4, skipping step 2 (the
     marker step 2 would produce already exists).
   - Exit 0, stdout starts with `SKIP:` and no marker → Scribe does not
     apply (no UI surface, no `contracts.*`); skip steps 2–5.
   - Exit 2 `SCRIBE-FALLBACK-NEEDED` → step 2.
   - Exit 2 `SCRIBE-WRITE-FENCE-BLOCKED` → the dispatch changed a spec, a
     marker, an unlock target dir or `.git/` (or the fence returned no
     verdict afterwards); its result was discarded and nothing was
     restored. Inspect the tree as the message says, then step 2.
   - Exit 2 `SCRIBE-WRITE-FENCE-UNAVAILABLE` → the write fence could not
     take its snapshot, so Tier 1 was never dispatched: nothing changed and
     there is nothing to inspect. Repair the framework install and re-run,
     or step 2.
   - Exit 1 → BLOCKED before or after the dispatch; the message says which.
     Not a Tier-2 case. Before: spec not found, the spec kind cannot be
     determined (unparseable YAML / no PyYAML), already authored, empty
     `ui_contract.elements`, re-author threshold, an invalid
     `SCRIBE_UI_FRAMEWORK`, a context pack (`SCRIBE_CONTEXT_PACK_CMD`) that
     failed or was BLOCKed by sanitisation, or a required framework helper
     missing or broken — including the signer (below). After: the router
     exited with something other than 0 or 2, or a pre-sign check failed.
   - **No signer, no marker.** `scribe-author.sh` and `audit-sign.sh` load
     `marker-sign.sh` before doing anything else. If it is missing, empty
     or broken they exit 1 with `BLOCKED: … required helper … is missing or
     broken`, dispatch nothing and write NO marker — there is no unsigned
     placeholder. Repair the install; do not route to Tier 2 (Tier 2 signs
     with the same helper).

2. **Tier 2 — Different-model Claude subagent.** Dispatch `Agent` with
   a model DIFFERENT from this session (Opus→Sonnet/Haiku;
   Sonnet→Opus/Haiku). Brief:
   - Prompt: the file the `SCRIBE-FALLBACK-NEEDED` line names
     (`scribe-red.md` for a UI spec, `scribe-contract.md` for `contracts.*`).
   - Spec YAML + `ui_contract` + every `design_refs` PNG.
   - Write dir: `.specs/verify/<slug>/scribe-tests/` (NOT project test
     dir — locked pre-unlock).
   - Framework: `$SCRIBE_UI_FRAMEWORK` if set (a known name, else an
     error); else a framework named in `$INTERACTION_TEST_CMD` as a
     whole word (`npx playwright test`, `run-cypress.sh`); else what
     the project is set up for (`playwright.config.*`,
     `cypress.config.*`, package.json devDependencies). A wrapper's
     name that names none (`bash tests/run.sh`) is not a framework.
   - Hard rule: do NOT read any implementation file. Emit strict JSON
     manifest only.

   After subagent reports written: `bash "$(atelier path --hook scribe-author.sh)" --subagent-authored <slug>` → signs `.scribe-authored.cross-model`.

3. **Double-failure.** If Tier 2 dispatch itself also fails, the gate
   blocks — fix Codex or the subagent path. There is no same-model
   fallback.

4. **Red-phase false-pass guard.** `bash "$(atelier path --hook red-phase-check.sh)" <slug>` — copies the staged tests to the dir unlock will move them to, runs them from there against `$INTERACTION_TEST_CMD` (`$TEST_CMD` for contract specs), and removes the copies again. It signs only on POSITIVE EVIDENCE that a test executed and failed; a non-zero exit alone is not a red proof.
   - Exit 0 → `.red-verified` signed → step 5. Evidence is one of: the
     runner's own summary counts a failed test; the test imports an
     implementation module that does not exist yet (a QUALIFIED red — the
     hook prints `unresolved import: <module>` and the marker records
     `red_by_unresolved_import`; check each module is implementation, not
     a test helper); a project `RED_FAILURE_PATTERNS` entry (recorded as
     `red_by_project_pattern`); or a script-style test (`bash x.sh`,
     `node x.js` run directly), whose own exit status is the verdict.
   - Exit 1 → BLOCKED, no marker. Either a test passed pre-implementation
     (re-enter RED with stronger Scribe; do NOT hand-edit scribe-authored
     files), or nothing was run: an AC test name matches no declaration, no
     AC test file is on disk, a staged test cannot be placed (its
     destination holds a different file, or its target dir is outside the
     project, inside the staging dir, or under `.git/` or `.specs/`),
     another red-phase run or an unlock holds the slug, the placement
     ledger (`.specs/verify/<slug>/.red-placed`) is a symlink or has a line
     that does not check out (nothing is removed; the line is shown), or
     the framework install is broken in one of these ways (the message
     names the file): a sourced helper is missing or does not load
     (`_safe-source.sh`, `_target-admit.sh`, `_project-root.sh`,
     `marker-sign.sh` — checked before anything is placed), `plan-cli.py`
     is missing, or `plan-cli.py` printed nothing.
   - Exit 2 → inconclusive, NO marker; the reason is printed (with the
     output tail when a test was run). Nothing to run it with: no
     `$TEST_CMD` / `$INTERACTION_TEST_CMD` for the route, or no AC has a
     `test:` entry. A run that proves nothing: runner missing / killed /
     misused, no tests collected, a syntax error, a file that never loaded,
     the test's own helper missing, an import that is mistyped / leaves the
     project / names an undeclared package, or a file with no live test
     (none, or only skipped / todo / inside a skipped suite — a declaration
     or method merely NAMED `test` / `it` is not one). A
     `RED_FAILURE_PATTERNS` entry never rescues any of those. Or a python
     helper that FAILED: the spec resolver or spec-kind loader (unparseable
     YAML, no PyYAML), the classifier YAML, the result classifier or its JS
     lexer, or `plan-cli.py` exiting non-zero. Fix it and re-run; do not
     continue to unlock (unlock requires `.red-verified`).
   - Knobs: `ATELIER_RED_STRICT_IMPORTS=1` (every unresolved import is
     exit 2), `ATELIER_RED_RUN_IN_PLACE=1` (the runner really runs staged
     files where they are; recorded as `run_in_place` in the marker),
     `RED_INCONCLUSIVE_PATTERNS` / `RED_FAILURE_PATTERNS` (a runner whose
     wording the check does not know).
   - The two pattern lists can also live in the project, one regex per line: `.atelier/config/red-inconclusive-patterns` and `.atelier/config/red-failure-patterns`.

5. **Unlock:** `bash "$(atelier path --hook unlock-scribe-tests.sh)" <slug>` — re-verifies the manifest hash, moves the files to the project test dir, writes `.scribe-unlocked`.
   - Exit 1 → BLOCKED, nothing moved: a marker is missing or does not
     verify (`.scribe-authored.*`, `.red-verified` — run step 4), the staged
     files no longer match the manifest, a destination is a symlink or holds
     a different file, a `red-phase-check.sh` for the slug is still running
     (wait for it), or a framework helper is missing or broken (named;
     `plan-cli.py` printing nothing counts).
   - Exit 2 → the target dir was refused, nothing moved or created: it is
     outside the project, the staging dir itself, under `.git/` or
     `.specs/`, or holds a control character. Fix `ac.test` in the spec,
     then re-run.
   - If a red-phase run was killed mid-way, its copies of the tests are
     still at their destination. Unlock adopts them (it says so for each)
     and consumes the red-phase ledger; nothing needs cleaning by hand.

6. Enter GREEN. Builder may read (not modify) the unlocked tests.

**Assertion lock.** GREEN/VERIFY may update selectors + setup; **do NOT
change assertion values** (expected text, URLs, counts). If an
assertion must change, the AC is wrong — update spec, re-enter RED.
**Not mechanically enforced today** — this rule is yours to hold. No
checker is shipped: there is no `verify-test-assertions.sh`, so do NOT
invoke one. (`.scribe-unlocked` records `manifest-sha256` +
`target-inventory-sha256`, which is what such a checker would compare
against.)

#### Scribe correction loop

If Scribe-authored tests are wrong: **do NOT hand-edit** (the assertion
lock above) and **do NOT author as Builder** (destroys the role
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
suggest `bash "${ATELIER_CODEX_QA_BIN:-$(atelier path --script codex-qa-review.sh)}" edge-cases <slug>`,
OR ask user. (Slot unset → the SHIPPED `atelier/scripts/codex-qa-review.sh`
runs; it prints `SKIP:` and exits 0 when Codex is unavailable. An
operator may override the slot with their own per-role dispatcher. Any
non-zero exit means nothing ran — treat it as unavailable, never as a
clean scan.)

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
3. **Auditor (Gate G) — always, blocking.** Tier 1:
   `bash "$(atelier path --hook audit-sign.sh)" post-verify <slug>`.
   - Exit 0 → signed: `.audited-cross-vendor`, or `.audited-cross-model`
     when stderr says `NOT CROSS-VENDOR` (the auditor was the session's own
     family, or fell back to it). Both pass the gate. Commit the marker, its
     `…-findings.receipt` and `…-signed-findings.{md,yaml}` (the bytes the
     marker's `findings-sha256` binds) together.
   - **Covering tests run before any sign** (every route). Each test a
     `covered` finding names is run from the project root, outside the
     auditor's sandbox, with `$INTERACTION_TEST_CMD` (UI spec, or a `.sh`
     test) or `$TEST_CMD` (red-phase-check's routing), and must PASS: the
     auditor writes it failing, so the audit signs only once the defect is
     fixed. A test that fails, cannot be found, cannot be run or outlives
     its per-file bound (`ATELIER_AUDIT_COVERING_TEST_TIMEOUT_S`, default
     600s; its process tree is killed) → exit 1
     `BLOCKED: … covering test(s) did not pass`, naming each finding. Fix
     the defect, then re-run the SAME command without `--redispatch` (the
     findings are reused and the tests run again). Red-on-old-code is not
     checked. `ATELIER_AUDIT_COVERING_TESTS=unrun` signs without running
     them and records `covering-tests: unrun-by-operator` in the signed
     marker — the operator's call, never yours.
   - Exit 2 `AUDIT-FALLBACK-NEEDED` → Tier 2. Every such message lists
     the same four things; follow it literally: the auditor role prompts
     (edge-cases, security; ux-review for a UI spec), the two files the
     subagent writes — `.specs/verify/<slug>.audited-cross-model-findings.md`
     and `.yaml`, prose tagged `[subagent:<model>]` — and the command to
     run next,
     `bash "$(atelier path --hook audit-sign.sh)" --subagent-reviewed <slug>`.
     (Not the `…audited-cross-vendor-findings.*` files Tier 1 left: those
     are reference only.)
   - Exit 1 `BLOCKED: … required helper … is missing or broken` → the
     install is broken (see "No signer, no marker" in RED): nothing was
     dispatched, nothing signed. Repair it; this is not a Tier-2 case.
   - Exit 1, "the findings did not validate" → nothing signed; the message
     names the findings files it kept. A re-run REUSES them (re-validates,
     does not re-run the auditor): fix the YAML and re-run, or append
     `--redispatch` (post-verify only) to discard them and audit again.
     Never `rm` findings by hand and never edit them to launder a finding:
     a HIGH/MEDIUM finding signs only as `covered` by a real test (written
     failing, passing once the defect is fixed — see above).
   - Exit 1, "the VALIDATOR is broken" → the findings were not judged; do
     not edit or re-dispatch. Repair the framework install, re-run.
   - Exit 3 / 4 → the auditor asked to reopen: RED+GREEN (3) or GREEN (4)
     markers were rewound, nothing signed; re-enter that phase. Exit 5 →
     the rewind was partial; follow the message.

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
     It refuses without a VALID `.audited-cross-vendor`/`-model` marker,
     without a VALID `.regression-t2`, and when a regression marker's
     `code_tree` ≠ the current app code (the refusal lists the paths; re-run
     regression). Opt-outs, loud: `ATELIER_REQUIRE_AUDITED=0`,
     `ATELIER_REQUIRE_REGRESSION=0` (t2 presence),
     `ATELIER_REQUIRE_REGRESSION_CODE_MATCH=0` (tree match only).
     **Static-site / content projects:** `code_tree` ignores `*.md` and media
     by default. When those ARE the product, re-admit them in
     `.atelier/atelier.yml` — `code_tree: {include: ["**/*.md"]}` — and use
     `exclude: [...]` for generated paths that are not app code.

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
- `docs/atelier/ATELIER_USE_CASES.md` — UC1–UC29 operator flows
