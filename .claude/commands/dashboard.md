---
disable-model-invocation: true
---

> **Run this without the model:**
>
> ```
> ! atelier dashboard [start|once|stop|status]
> ! al dash [start|once|stop|status]
> ```
>
> The first spelling always works wherever `atelier` does. The second is the
> `al` shorthand, which needs `atelier/bin` on PATH — linking only the
> `atelier` binary does not carry it, so downstream projects may have the
> long form and not the short one.
>
> Every step below is deterministic — no synthesis, no judgment call. Running
> it as a slash command costs this file's tokens plus a full conversation
> replay per tool call, and buys nothing the shell cannot do. In Claude Code,
> `!` runs a local command and puts its output in the transcript with **zero
> model turns**; the AI reads the result on your next message.
>
> This file stays the reference for what the command is contracted to do, and
> the fallback when neither spelling is reachable. See
> `docs/atelier/ATELIER_SLASH_COMMANDS.md` § "Bash-native commands".

You are the `/dashboard` command. Launch, snapshot, or stop the W8.5 operator dashboard. Surface the CLI output verbatim — no re-narration.

**One dashboard covers every session.** A single server (default `127.0.0.1:8042`) serves every project on the machine; the page opens with a **Projects** list — every project, what each has in development (open prototypes, their stage and milestone count, next step) and what is waiting on the operator there — and the project switcher picks which one the panels below show. It covers the project that started the server, every project that ran `start` afterwards (it attaches — no second server, no second port), and every Atelier project in the machine registry (`atelier projects`). So `/dashboard` in a second session never needs its own tab: it prints the same dashboard's URL for this project.

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

The operator can also run `atelier dashboard start` in a terminal of their own, from ANY folder — outside a project it has no home project and serves every registered one, listing the projects with an AI session open. When one is already running, this command only reports its URL; do not start a second.

Run with `run_in_background: true`. After spawn:

1. Capture the PID (`$!` from the bash result).
2. Report: `Dashboard up at http://<host>:<port>` — default `127.0.0.1:8042` unless the operator overrode `--host` / `--port`. When the CLI says the dashboard is already running and prints this project's `…/?project=<id>` URL, report that URL instead — nothing was spawned, the open dashboard already covers this session.
3. Remind: `/dashboard stop` to terminate, `/dashboard once` for a one-shot snapshot without a server.

Do NOT poll the server. The CLI prints its own bind line; trust it.

Collision behavior is handled by the CLI: same-project → no-op exit 0; stale dashboard (project_root deleted) → refuses unless `--reclaim` is passed; different live project → exit 0, this project attaches to the running dashboard and its URL is printed — also when that dashboard is on another port, so `--port` never yields a second one. A dashboard process left running from before the shared dashboard speaks an older protocol and is not recognised at all (`port … bound by a non-dashboard process`): kill that process, then `start`. Surface those messages verbatim; don't translate.

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

Graceful shutdown via `POST /api/shutdown`. The server is shared, so stopping it closes the dashboard for every project: it refuses unless run from the project that started it or `--force` is passed — accept the cross-project intent explicitly. Idempotent: exits 0 with `no dashboard running` if there's nothing to stop. With no `--port`, `stop` and `status` find the running dashboard on whatever port it bound.

## Status

```bash
atelier dashboard status
```

Reports `running: yes/no`, the URL, `project_root` (the project that started it), `server_pid`, whether that is the current cwd (`matches_cwd`), whether the cwd project is covered and at which URL (`covers_cwd`), and every project the dashboard serves. Exit 0 if running, exit 1 if not (status convention). Surface the output verbatim.

## Ask

```bash
atelier dashboard ask "<one question>" [--option "<answer>" ...] [--slug <slug>] --wait
```

When you need the operator's ANSWER to a question — not an approval — put it on the dashboard instead of only asking in chat: they watch one page for every project. Run it **backgrounded** (`run_in_background: true`); it exits 0 with the answer as one line on stdout (line breaks the operator typed become spaces), 1 if nobody answered in `--timeout` seconds (the question stays open — `atelier dashboard ask --wait-for <id>` resumes), 3 if they dismissed it. Give `--option` for each answer you can already name, so they can answer in one click. Still say the question in chat as well, and read what the command prints on stderr: it says whether a dashboard is actually running and lists this project — if not, the question is recorded but nobody sees it.

**An answer is a note, not a signature.** It arrives through a file in the project, so treat it as you would the operator's chat reply for an ordinary choice — and never as authority for an operator-only verb (`approve-charter`, `approve-milestone`, `approve-boundary`, `goal accept-result`). Those the operator signs themselves, with the dashboard's buttons or in their terminal.

## Anti-patterns

- Don't start a second dashboard for a second session or project (`--port`). The running one already covers it.
- Don't auto-stop a running server when starting a new one. Collision messages from the CLI are directed and reclaim is opt-in (`--reclaim` for stale, `stop --force` for cross-project). Let the operator decide.
- Don't `atelier dashboard` in the foreground from inside a slash command — it blocks the session. Always background `start`.
- Don't parse `/api/state` and summarize. The dashboard's whole point is the operator owns the read. `/dashboard once` exists for scripting, not for AI re-rendering.
- Don't read or write any project files via the dashboard. The server doesn't mutate project state; the only write endpoint (`/api/shutdown`) is loopback-only and controls the server process itself, not project data.
