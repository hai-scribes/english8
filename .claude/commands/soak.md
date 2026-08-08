---
disable-model-invocation: true
---

You are the `/soak` command — release-flow stability gate. Drive `soak-runner.sh` and surface its output. The runner prints pass/fail, slope, mean, failure reason — do NOT re-narrate.

This IS a release gate. Run on the RC branch BEFORE cutting the build, not during per-spec `/develop`.

## When to run

- Before tagging a release (version bump, CHANGELOG update).
- When diagnosing a suspected memory leak or CPU regression.
- NOT per spec — `stop-gate.sh` fires the SOAK gate only when `RELEASE_TOUCH_PATTERN` env var is **operator-set** (no shipped default) AND the working tree contains a file matching it. Recommended starter value for `.envrc.atelier`: `RELEASE_TOUCH_PATTERN='CHANGELOG|VERSION|package\.json'`. When the gate fires without a fresh `.specs/verify/release.soak` marker, session-close blocks with "Gate SOAK BLOCKED — re-run: bash \"$(atelier path --hook soak-runner.sh)\"".

## Required config (else: print missing var, stop)

- `REGRESSION_APP_START_CMD` set — runner-managed mode is required (framework-managed and per-scenario can't soak — no persistent pid to sample).
- `INTERACTION_TEST_CMD` set.
- `REGRESSION_APP_READY_CMD` recommended (else 2s sleep + assume up).
- ≥1 regression scenario, tagged `soak: true` or passed via `--scenario=<id>`.

## Run

```bash
bash "$(atelier path --hook soak-runner.sh)" \
     [--iterations=50] \
     [--duration=30m] \
     [--scenario=<id>] \
     [--sample-interval=15s] \
     [--slug=release]
```

Use `run_in_background: true` — soaks routinely run 30m+. After dispatch, print the report path (`.specs/soak/<run-id>.yaml`) and stop. The harness notifies on completion.

## Pass/fail

Runner enforces three thresholds (fixed defaults — no config.env knobs):
- All iterations rc=0
- RSS slope < 0.5 MB/sample
- CPU mean < 85%

Pass → runner signs `.specs/verify/<slug>.soak` (SK-4 marker bound to the report's sha256 — tamper with the report and verification fails). Fail → runner writes `.specs/soak/<run-id>.findings.yaml` with `failure_reason`. In either case, surface the runner's final line. No additional retelling.

## What NEVER happens here

- No spec YAML modified.
- No per-spec gate fires.
- Only `.soak` written — no audit, approval, or regression-t* markers touched.

## Offline / CI dry-run

```bash
bash "$(atelier path --hook soak-runner.sh)" \
     --iterations=3 \
     --mock-samples=/path/to/samples.csv \
     --mock-iteration-rcs=/path/to/rcs.txt
```

`mock-samples` CSV: `rss_kb,cpu_pct` per iteration. `mock-iteration-rcs`: exit code per iteration. Mock skips boot + `ps` sampling — useful for wiring tests, NOT real release gating.

## Platform support

Darwin + linux only. Windows: `ps` returns zeros, soak trivially passes — don't rely on it.
