---
disable-model-invocation: true
---


## Step 0: Persist attachments

Same shape as `/bug` Step 0 — `bash "$(atelier path --hook save-bug-attachment.sh)" <source-path> <bug-slug>` for every screenshot/image/log. Slug: lowercase, non-alphanumeric → `-`, max 48 chars. Saved to `.specs/bugs/<slug>/attachment-N.<ext>` for the historical record.

---

## Step 0.5: Defect Gate

Classify:
- **Defect** ("X is broken", "used to work", "crash", "wrong value", "regression") → proceed.
- **Enhancement** ("add X", "change X to Y", "tweak", "improve") → STOP: *"This is a change, not a bug fix. Run `/product` then `/develop`."*
- **Ambiguous** → ask: *"Fixing broken behavior, or changing how it should work?"*

**Severity:** cosmetic / edge case / has workaround → suggest `/bug`; proceed only on user confirmation.

---

## Step 1: Reproduce

Verify `$INTERACTION_TEST_CMD` is exported in the current shell (set via `.envrc.atelier` / direnv / shell). Unset → operator note: *"Pipeline env not configured. Export INTERACTION_TEST_CMD via `.envrc.atelier`, then re-run `atelier doctor` to confirm."* — but the reproduction step proceeds with whatever test runner the operator has at hand; live verification isn't gated by a marker in modern Atelier.

Write failing test demonstrating the bug. Run. Confirm it fails for the right reason (matches reported behavior, would pass if fixed).

## Step 2: Confirm

Error message matches report. No other tests newly broken.

## Step 3: Fix

Minimum change. No refactor, no edge-improvements.

**Codex circuit breaker tripped** → suggest `bash "${ATELIER_CODEX_QA_BIN:?codex-qa not configured}" bug-adjacent <changed-files>` OR ask user. (Slot unset → operator wires `$ATELIER_CODEX_QA_BIN` per the dispatcher contract; until then this branch is operator-decision-only.)

## Step 4: Verify

1. New test passes.
2. Full suite passes.
3. Stop-gate enforces typecheck + build.

## Step 4.5: Regression scenarios (mandatory — no risk-based skip)

Read `.specs/regression-scenarios.yaml`. Find scenarios covering affected feature(s):
```bash
bash "$(atelier path --hook regression-runner.sh)" --tier=1 --feature=<ID>
```

| result | action |
|--------|--------|
| Pass | continue |
| Fail — expected from fix | update scenario |
| Fail — real regression from this fix | fix code before continuing |
| Fail — pre-existing unrelated | `atelier plan register-bug` (out-of-scope finding — do NOT absorb into hotfix commit; see `/bug` for mechanical refuse rules) |
| No manifest | flag; continue |
| Not configured | fallback chain (read `$INTERACTION_TEST_CMD` source if set, else skip) |

**Hotfix verification [UI features]:** Write verification test with explicit GIVEN/WHEN/THEN targeting the bug (not "page loads"). Run it via the operator's `$INTERACTION_TEST_CMD` directly:
```bash
$INTERACTION_TEST_CMD <test-files>
```
Confirm the verification test passes against the fix. No HMAC marker is signed for in-loop verification — the regular regression-runner gates above (Step 4.5 tier-1) carry the audit trail; the verification test stays in the test suite and is exercised by every subsequent regression run.

Update `test_verification_files` on the affected spec if new verification test added.

## Step 5: Codex bug-adjacent (mandatory — no skip)

`bug-adjacent "<changed files>"`. Codex unavailable → re-read git diff + changed files, write sibling regression tests with adversarial framing (probe related code paths, boundary conditions, error paths a copy-pasted fix would leave broken). Failures → sibling bug found: same root cause → include in this commit; distinct defect → `atelier plan register-bug`. All pass → fix isolated.

## Step 5.5: Regression scenario review (mandatory — no skip)

Does any scenario exercise the bug's code path?

| Outcome | Action |
|---------|--------|
| A — covered | Note *"Bug covered by RS-X."* |
| B — partially covered | **Extend** RS-X: add GIVEN/WHEN/THEN for failure mode. Update `covers` + `description`. Re-run. |
| C — not covered | **Create** now. `plan.py add-scenario --name "..." --covers "<feature-id>:AC-N" [--test-file path]`. Fill GIVEN/WHEN/THEN; confirm passes. |
| D — no manifest | Flag *"No regression manifest — deferred to next Integration Check."* Do NOT create the manifest from `/hotfix`. **Not allowed when this `/hotfix` will close a `kind=bug` spec via `atelier spec set-status <slug> done`** — the closing spec needs coverage (Gate C). Force Outcome C (create the scenario or use `unit_test_covers` for a logic-only AC). |

"DEFERRED" valid only for D, and only when no bug spec is being closed (Step 5.75).

**Dedup marker (A/B/C only):**
```bash
mkdir -p .specs/verify
echo "<RS-ids comma-separated>" > .specs/verify/<feature-id>.bugfix-scenarios
```
Lets a subsequent `/regression --skip-recent` skip these within 1h.

## Step 5.75: Spec impact

Fix touches a feature with a `done` spec → add to Step 6 report:
```
Spec impact: Fix touches feature #N (<name>) — run /reconcile N if behavior changed.
```

Fix resolves an open bug ticket (`kind: bug` spec) → close now. **Precondition (Gate C):** the bug spec's AC(s) — `register-bug` seeds `AC-1` from your reproduction text — must already appear in `regression-scenarios.yaml` (under `covers[].acs` for the bug's `feature_id`, or under `unit_test_covers` for a logic-only AC). Step 5.5 should have created or extended this entry; if you're in Outcome D ("no manifest"), you cannot close the bug spec from `/hotfix` — promote to Outcome C first.

```bash
atelier spec set-status <bug-spec-slug> done
```
Mention the spec slug in the commit body so the link survives in git log.

## Step 6: Commit

Present for approval:
```
Proposed commit: fix: <concise description>
Files: <fix file(s)>, <test file(s)>
Approve?
```
On approval → stage, commit, push.

## Report

```
Hotfix complete.
- Bug: <description>
- Test: <file:name>
- Fix: <files + summary>
- Live verify: PASS / FAIL / SKIP
- Codex QA: <N sibling bugs fixed | skipped | none>
- Regression scenarios: COVERED by RS-X | EXTENDED RS-X | NEW RS-N | DEFERRED
- Closed bug ticket: Spec #<id> | none
- Commit: <hash>
```
