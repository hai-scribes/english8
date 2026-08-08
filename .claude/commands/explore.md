---
disable-model-invocation: true
---

You are the `/explore` command — async crash-monkey. Run the app, navigate randomly, capture errors, triage via `$ATELIER_EXPLORE_NAV_BIN`, and file P2/P3 bugs into the planned backlog. Never blocks a session; never signs a marker; never appears in stop-gate.

## When the user runs `/explore`

Three operational modes:

1. **Run mode** (default): drive the app via Playwright and capture events.
2. **Mock mode** (`--mock-events=<path>`): skip Playwright, treat the supplied JSON as the captured events. Tests + diagnosis.
3. **File-bugs mode** (`--file-bugs`): triage a prior run's report via the operator-wired LLM and file each surviving item via `atelier plan register-bug`. **W8.4.7: now LIVE.**

## Run mode

Required config:
- `INTERACTION_TEST_CMD` set (the runner uses Playwright under this command)
- The app reachable at `--start-url` (default `/`) when the runner launches

Execute:
```bash
bash "$(atelier path --hook explore-runner.sh)" --steps=<N> --start-url=<URL>
```
Defaults: `--steps=20`, `--start-url=/`. Reasonable production ranges:
`--steps=50..200` for nightly; `--steps=20..30` for ad-hoc during dev.

On completion the runner prints:
- Path to the report YAML at `.specs/explore/<run-id>.yaml`
- Number of events captured
- A suggested `--file-bugs --run-id=<id>` invocation when events > 0

Report structure:
```yaml
run_id: explore-<epoch>-<pid>-<rand>
started_at: 2026-04-20T17:00:00+07:00
start_url: /
steps_requested: 20
events:
  - kind: console-error | navigation-error | page-crash | unhandled-exception | stuck-spinner
    where: <url>
    message: <≤500 chars>
    stack: <≤800 chars>
    screenshot_path: .specs/explore/<run-id>.event-N.png
    actions_before: ["clicked button", "typed 'a0' into input", ...]
filed_at: null       # set after --file-bugs
filed_count: 0
```

## File-bugs mode (live as of W8.4.7)

```bash
bash "$(atelier path --hook explore-runner.sh)" --file-bugs [--run-id=<id>]
```

Required config:
- `$ATELIER_EXPLORE_NAV_BIN` — operator-wired LLM dispatcher. Atelier ships the prompt brief at `atelier/prompts/explore-nav.md` but does NOT bundle a default provider. Wire a script implementing this contract:

  ```
  $ATELIER_EXPLORE_NAV_BIN <prompt_path> <input_json_path> <out_json_path>

    Input JSON: {"events": [...], "features": [{"id":N, "slug":"...", "name":"..."}]}
    Output JSON: {"bugs": [...], "skipped": [...]}
  ```

  Bug entries carry `title`, `severity` (P2|P3), `feature_id_hint` (or null), `reproduction`, `expected`, `actual`, `screenshot_path`, `event_index`. The runner passes each through `atelier plan register-bug --origin explore` (with feature_id_hint surfaced as `--feature` when set).

On run:
1. Read the report; if `filed_at` is already stamped → SKIP exit 0 (idempotent).
2. If events list is empty → mark filed with 0 bugs + exit 0 (does NOT require NAV_BIN — operators with empty reports don't need to wire the dispatcher).
3. Build input JSON (events from report + features from `.specs/features/` scan, projecting `{id, slug, name}`).
4. Dispatch `$ATELIER_EXPLORE_NAV_BIN <prompt> <input> <out>`. NAV_BIN exits non-zero → exit 2 (transient external — retry once the operator's LLM is back).
5. Validate `<out>` is `{bugs: [...], skipped: [...]}` JSON.
6. For each bug → `atelier plan register-bug --title ... --severity ... --origin explore ...`. Per-bug `register-bug` rc != 0 increments `filed_errors` but the loop continues (a pipeline-scope refusal on one bug doesn't sink the rest).
7. Update report with `filed_at`, `filed_count`, `filed_errors`. Exit 0.

Exit codes:
- `0` — success (bugs filed, or 0 events to file, or already-filed SKIP)
- `1` — bad arg / report missing / malformed report YAML
- `2` — NAV_BIN unset, not executable, exited non-zero, empty output, or invalid triage JSON

## What NEVER happens in /explore

- No HMAC marker is signed. /explore is not a stop-gate input.
- No existing spec is modified. Only the bug backlog grows.
- No P0/P1 bugs are filed. `register-bug` mechanically refuses (exit 2 + diagnostic) — Codex MUST emit P2/P3 per the prompt brief.
- No BATCH-worker invocation. `register-bug` refuses inside worktrees (exit 3) — run `/explore` from the main checkout only.

## Scheduling

For nightly runs, set up a wrapper that calls `/explore` from an allowlisted cron (outside this repo — the pipeline doesn't own your scheduler). Typical cadence: 200 steps/night across 3–5 entry URLs, `--file-bugs` runs immediately after each capture.

## Offline / dry-run

```bash
bash "$(atelier path --hook explore-runner.sh)" --mock-events=<path-to-events.json>
```
Skip Playwright entirely; treat the supplied JSON as the captured events list. Used by the test harness; also useful when diagnosing a report from a previous session.

For `--file-bugs` dry-run: wire a no-op `$ATELIER_EXPLORE_NAV_BIN` that writes `{"bugs":[], "skipped":[...]}` — runner marks the report filed with 0 bugs without invoking real bug registration.

## Output to the user

After running, tell the user:
- Report path
- Event count
- Filed count + filed_errors (post `--file-bugs`)
- Next action: nothing required if events==0; otherwise `/explore --file-bugs --run-id=<id>` to triage.
