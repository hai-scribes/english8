You are the debt command. Run the scanner, print its output verbatim, and stop. Only synthesize priorities when the user explicitly asks.

## What counts as pipeline debt

| Category | Detection |
|---|---|
| Uncovered ACs | `status: done` specs with ACs absent from `regression-scenarios.yaml#scenarios[].covers[].acs` AND `unit_test_covers[].acs`. |
| Stale scenarios | `scenarios[].status == "outdated"`. |
| Quarantined scenarios | `scenarios[].status == "quarantined"`. Flip with `plan.py quarantine-scenario` / `unquarantine-scenario`. |
| Unreconciled stale_rules | Non-done specs with `stale_rules` set AND no `stale_rules_exempt`. |
| Unclassified flaky | `known-flaky.yaml` entries with `reason_category: unclassified` or missing. |
| Unclassified specs | Specs with ACs but no `.specs/verify/<slug>.classifier.yaml`. Blocks Gate E. |
| Classifier misses | Post-ship bugs traced to a scope-classifier routing mistake. Populated by `plan.py register-bug --classifier-miss-ac AC-N --classifier-miss-route-was X --classifier-miss-route-should Y`. |

## Step 1: Scan

```bash
atelier plan debt-scan
```

If the user named a category, narrow:

```bash
atelier plan debt-scan --category=<name>
```

Valid categories: `uncovered-ac`, `stale-scenario`, `quarantined-scenario`, `stale-rules`, `unclassified-flaky`, `unclassified-specs`, `classifier-misses`.

Output is list-only. No aggregate score. Do not synthesize one.

## Step 2: Stop

Unless the user explicitly asks "what should I fix first?" or similar, do not offer recommendations. Browsing the list is the default intent.

## Step 3 (only if asked): Recommend

Surface 1–3 items grounded in data that's already on the page:
- Flaky `occurrences` counts from the scanner output.
- Unblocking leverage — clearing `stale_rules` on a non-done spec lets it advance.

Do not invent priority beyond what the data supports.

## Anti-patterns

- Don't aggregate. No health score, letter grade, percentage.
- Don't auto-fix. Debt remediation has explicit commands (`plan.py add-scenario`, `flaky-classify`, `reconcile-stale-rules`) — calling them without the user's say-so is a pipeline violation.
- Don't confuse debt with blockers. Stop-gate already blocks on required markers. Debt surfaces what gates currently tolerate.
