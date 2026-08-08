---
disable-model-invocation: true
---

## Atelier port note

**Implementation notes:**

- **Drift-driven, not manual** — `atelier plan reconcile-needed` is the
  fast drift-check primitive; operator-commit `pre-commit` hook
  invokes reconcile-runner.sh on drift; `/reconcile` is the manual
  override path when the operator wants to force an evaluation.
- **Auditor reopen** — `/hotfix` and `/promote` paths trigger reconcile
  automatically; manual /reconcile is no longer the only entry point.
- **Cross-family LLM** — reconcile-runner.sh requires INVARIANT_5
  cross-family routing (Reconciler family ≠ spec-author family).
- **Tool paths** — `atelier plan reconcile-needed` /
  `bash "$(atelier path --hook reconcile-runner.sh)" ...` replace the prior surfaces.

Per ATELIER_PLAN.md § W6.

---

You are the reconcile command. You detect drift between specs and code, then update specs to match reality.

The user's arguments: $ARGUMENTS

---

## Step 1: Scope

- Argument is a spec/feature ID (`3`, `#3`, `003`) → that spec only.
- Argument is `all` or empty → every spec with `status: done`.

No done specs → report "No done specs found. Nothing to reconcile." and stop.

## Step 2: Codex Drift Pre-Filter

Run `bash "${ATELIER_CODEX_QA_BIN:-/dev/null}" reconcile-drift "<scope>"` where `<scope>` is the spec id/slug or `all`. Codex reads specs + source, checks `git log` since spec mtime, and emits strict JSON drift candidates. (Slot unset / fallback to `/dev/null` → invocation fails with exit ≠ 0 → falls through to the SKIP row below per the table.)

| Outcome | Action |
|---|---|
| Exit 0 with JSON | Parse as the drift seed. Proceed to Step 3. |
| Exit 0 with `SKIP:` (codex disabled / CLI missing) | Fall back to full manual scan (old behavior — see "Manual fallback" below). Note "Codex unavailable" in the Step 6 report. |
| Exit 2 (rate-limited) | Same as SKIP. |
| JSON parse fails | Treat as SKIP; note in report. |

Codex output shape:

```json
{"specs": [{"id": "003", "slug": "003-foo", "in_sync": false, "commits_since_spec_mtime": 4,
 "ac_status": [{"id": "AC-1", "title": "...", "status": "DRIFT", "change": "..."}],
 "new_behavior": [...], "entity_changes": [...], "contract_changes": [...]}]}
```

Codex is tuned to prefer false DRIFT over false MATCH. You will drop false positives in Step 3.

## Step 3: Verify + Drift Report

For each spec in the Codex output:

1. If `in_sync: true` → mark IN SYNC, move on without reading source.
2. Otherwise spot-check: read the spec YAML and a sample of the flagged source files (prioritize DRIFT / GONE findings with non-trivial `change` text). Confirm or reject each finding:
   - **Confirmed** — include in the report below.
   - **False positive** — drop silently.
   - **Ambiguous** — include in the report but flag `?` next to status.
3. Use judgment on findings Codex is weak at:
   - Intent vs. spec (does a DRIFT change the AC's intent, or just a surface detail?).
   - NEW behavior — is this really uncovered, or is it internal refactor?
   - Entity renames vs genuine replacements.

Present the drift report before making any edits:

```
## Spec #NNN: <name>
Source files: <list>
Commits since spec mtime: <count>

ACs:
- AC-1: <title> → MATCH
- AC-2: <title> → DRIFT — <what changed>
- AC-3: <title> → GONE — <why>

New behavior:
- <description>

Entities:
- <entity> → renamed to <new-name> / removed / added

Contracts:
- POST /api/foo → changed to PUT /api/foo
```

All MATCH + no new/entity/contract changes → "Spec #NNN is in sync." and move on.

## Step 4: Reconcile (interactive or flag-captured)

Any drift detected → check whether `$ARGUMENTS` contains `--apply`. If it does, skip the confirmation question and apply all confirmed drift; note "auto-applied via --apply flag" in the Step 6 report.

Otherwise present the full report and ask:

```
Reconcile these specs? (y/n, or specify spec IDs to update)
```

On approval, for each approved spec:

1. DRIFT ACs → update `given` / `when` / `then` to match current code.
2. GONE ACs → remove from spec. Add `notes` entry: "AC-N removed during reconciliation — behavior no longer present".
3. NEW behavior → add new ACs with sequential IDs; mark `test: pending`.
4. Entities → update `entities.creates` / `entities.requires`.
5. Contracts → update `contracts.api`.
6. `file_structure` → update for added / removed / renamed files.
7. Keep `status: done`. Do NOT touch `progress`.

## Step 5: Registry Sync

Any entity changed in Step 4:

```bash
atelier plan registry-sync
```

`plan.py` fails → read and update `.specs/registry.yaml` directly.

## Step 6: Report

```
Reconciliation complete. (Codex pre-filter: used | unavailable)

| Spec | ACs Updated | ACs Removed | ACs Added | Entities Changed | Status |
|------|-------------|-------------|-----------|------------------|--------|
| #NNN | 2           | 1           | 1         | yes              | SYNCED |
| #NNN | 0           | 0           | 0         | no               | IN SYNC |

Registry: synced / no changes
```

---

## Manual fallback (Codex unavailable)

For each spec in scope, do it the old way:

1. Read the spec YAML; extract ACs.
2. Locate source files from `file_structure` or `entities.creates`.
3. Read the source.
4. `git log --oneline --since="$(stat -f %Sm -t %Y-%m-%d <spec-file>)" -- <source-files>` (Linux: `stat -c %y`). No commits → IN SYNC.
5. Classify each AC MATCH / DRIFT / GONE. Detect NEW behavior. Check entities + contracts.

Then resume at Step 3.
