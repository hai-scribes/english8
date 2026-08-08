---
disable-model-invocation: true
---

You are the `/dashboard` command. Launch, snapshot, or stop the W8.5 operator dashboard. Surface the CLI output verbatim — no re-narration.

The user's request: $ARGUMENTS

---

## Routing

Parse `$ARGUMENTS`. Empty → **start**. Anything else → match the first token:

| Token | Action |
|---|---|
| (empty) | start |
| `start` | start |
| `once` / `snapshot` | one-shot JSON |
| `stop` / `kill` | kill running server |
| `status` | report whether a server is running |
| anything else | treat as passthrough flags to `start` (e.g. `--port 8080`, `--host 0.0.0.0`) |

## Start

```bash
atelier dashboard start $PASSTHROUGH_FLAGS &
```

Run with `run_in_background: true`. After spawn:

1. Capture the PID (`$!` from the bash result).
2. Report: `Dashboard up at http://<host>:<port>` — default `127.0.0.1:8042` unless the operator overrode `--host` / `--port`.
3. Remind: `/dashboard stop` to terminate, `/dashboard once` for a one-shot snapshot without a server.

Do NOT poll the server. The CLI prints its own bind line; trust it.

Collision behavior is handled by the CLI: same-project → no-op exit 0; stale dashboard (project_root deleted) → refuses unless `--reclaim` is passed; different live project → refuses, operator stops it or picks `--port`. Surface those messages verbatim; don't translate.

## Once

```bash
atelier dashboard start --once
```

Foreground. Surface the JSON verbatim. Do not summarize unless the operator asks — the panels (prototype lane / production specs / verify markers / auto-pilot ledger / recent events) are self-describing.

If the snapshot carries `degraded_isolation: true` on any row, call it out in one line — that's the `[CONTAINER-UNAVAILABLE]` badge contract from R2.6 and silent degradation is forbidden.

## Stop

```bash
atelier dashboard stop
```

Graceful shutdown via `POST /api/shutdown`. Refuses to stop a dashboard serving a different project unless `--force` is passed — re-run from the right project's directory, or accept the cross-project intent explicitly. Idempotent: exits 0 with `no dashboard running` if there's nothing to stop.

## Status

```bash
atelier dashboard status
```

Reports `running: yes/no`, the URL, `project_root`, `server_pid`, and whether the running dashboard matches the current cwd. Exit 0 if running, exit 1 if not (status convention). Surface the output verbatim.

## Anti-patterns

- Don't auto-stop a running server when starting a new one. Collision messages from the CLI are directed and reclaim is opt-in (`--reclaim` for stale, `stop --force` for cross-project). Let the operator decide.
- Don't `atelier dashboard` in the foreground from inside a slash command — it blocks the session. Always background `start`.
- Don't parse `/api/state` and summarize. The dashboard's whole point is the operator owns the read. `/dashboard once` exists for scripting, not for AI re-rendering.
- Don't read or write any project files via the dashboard. The server doesn't mutate project state; the only write endpoint (`/api/shutdown`) is loopback-only and controls the server process itself, not project data.
