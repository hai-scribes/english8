---
disable-model-invocation: true
---

You are the `/orchestra` command. Read and control the autonomous develop-lane scheduler — inspect what it's doing, override per-spec ordering, drive its lifecycle, and drain the supervised-autonomous inbox. This is a thin router over `atelier orchestra <subcommand>`; surface the CLI's structured output, do not re-narrate it into prose.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC15 (inspect scheduling) and § UC15.b (supervised-autonomous run + inbox drain). For the unattended overnight mode, use `/orchestra-auto` instead.

The user's request: $ARGUMENTS

---

## Routing

Parse `$ARGUMENTS`. Empty → **status**. Otherwise match the first token:

| Token | Action | CLI |
|---|---|---|
| (empty) / `status` | snapshot of every spec | `atelier orchestra status` |
| `explain <spec>` | dispatch + integration timeline for one spec | `atelier orchestra explain <spec>` |
| `inbox` | parked specs awaiting an operator answer (impact-ranked) | `atelier orchestra inbox` |
| `answer <slug> <value>` | answer a parked question | `atelier orchestra answer <slug> <value>` |
| `prioritize <spec>` | move ahead of FIFO | `atelier orchestra prioritize <spec>` |
| `defer <spec>` | hold until cleared | `atelier orchestra defer <spec>` |
| `block <spec> --reason R` | block dispatch entirely (reason required) | `atelier orchestra block <spec> --reason R` |
| `unblock <spec>` | clear ANY per-spec override | `atelier orchestra unblock <spec>` |
| `run-only <spec>` | hold all OTHER specs until this one completes | `atelier orchestra run-only <spec>` |
| `start` | launch the daemon on the approved backlog | `atelier orchestra start` |
| `pause` / `resume` | global dispatch pause / clear | `atelier orchestra pause` / `resume` |
| `stop` | SIGTERM the live daemon (graceful) | `atelier orchestra stop` |

Append `--agent --compact` to read-only calls (`status`, `explain`, `inbox`) so you get structured JSON to surface; the CLI auto-emits JSON on a pipe anyway.

## Read surface (status / explain / inbox)

These are **data, not advice** — Orchestra deliberately emits a structural decision tree, never narrative reasoning (UC15 step 2: NL-shaped advice is CLI-D-REJECTED). Surface the JSON / table verbatim. The `status` envelope carries one row per spec with `capacity_class ∈ {in_flight, done, merged, quarantined, blocked, ready, waiting, saturated, planned}` plus `deps_remaining`, `blocked_by[]`, `strike_count`. Don't editorialize the scheduler's choices; if the operator asks "why is X waiting", run `explain X` and show the tree.

If the operator just wants the live picture and a follow-up, run `status`, surface it, and offer the natural next actions (drain inbox, prioritize a spec, pause) without auto-running them.

## Inbox drain (inbox / answer) — UC15.b

When the daemon runs supervised (not auto-pilot), a worker that hits a human gate **parks** instead of blocking: it writes an inbox item and frees its slot. The operator drains:

1. `atelier orchestra inbox` — impact-ranked list (unblock-count, near-done, age). Each item shows `slug`, `seq`, `phase`, and the open `questions[]` with their `id` + `kind` + `prompt`.
2. `atelier orchestra answer <slug> <value>` — `value` is free-form, or `approve`/`reject` at approval gates. The orchestrator CAS-flips the spec `awaiting_operator → planned` on its next sweep and the worker **resumes from its sealed marker** (RED/GREEN are not redone).

Disambiguation the CLI enforces — pass through, don't guess:
- A spec with **multiple open parks** → `answer` exits 2 asking for `--seq`. Show the operator the seqs from `inbox` and re-ask.
- A park with **multiple open questions** → `answer` exits 2 asking for `--question-id`. Surface the question ids.
- **No pending park** for the slug → exit 7. The spec may have already been answered or resumed; re-run `inbox`.

Before writing an `answer`, briefly confirm the operator's intent against the actual `prompt` text from `inbox` — an answer flips real scheduler state and resumes a worker.

## Per-spec overrides (prioritize / defer / block / unblock / run-only)

These write structured override files under `<project>/.atelier/.orchestra-overrides/`. Faithful-to-CLI rules:

- **`prioritize` takes no `--reason`** — by design (UC15 step 3, CLI-C-REJECTED). Don't invent one.
- **`block` requires `--reason R`** (exit 2 without it). If the operator says "block X" with no reason, ask for one — it's the audit trail.
- **`unblock` clears ANY override** (defer / block / prioritize / run-only alike), not just blocks.
- Offer `--dry-run` if the operator wants to see the intent without writing.

## Lifecycle (start / pause / resume / stop)

- **`start`** launches the daemon on the approved backlog. **Lifecycle-only — there are NO scheduling/mode flags** (serial vs parallel stays emergent in `decide()`, R1.8 / NG24 — never offer a "run serially" flag; it doesn't exist). Optional: `--once` / `--max-sweeps N` run foreground (diagnostic); `--max-open-questions N` gates dispatch *rate* once N specs are parked. Default detaches a background daemon. **Double-start is safe** — the lock is atomic; a live daemon reports `already_running` and spawns nothing. For supervised runs the operator must have `ATELIER_WORKER_CMD` configured (their policy, e.g. a sourced `.envrc.atelier`); `start` inherits it and never sets it — if it's unset the daemon has no worker to spawn, so check before launching a real (non-`--dry-run`) run.
- **`pause` / `resume`** — global. `pause` stops NEW dispatches; in-flight workers finish naturally. `resume` clears the flag.
- **`stop`** — SIGTERM to the lock holder; the daemon exits gracefully after the current sweep, **in-flight workers continue independently** (they don't get the signal). Idempotent: reports `not_running` if nothing holds the lock.

For the **unattended overnight** flavor of `start` (the judge drains the inbox, daemon drives to terminal and exits by itself), do NOT add flags here — route the operator to `/orchestra-auto`, which front-loads the cross-family-verifier preflight.

---

## Notes for the AI running this command

- **Surface scheduler output as data.** UC15's whole point is the operator reads Orchestra's reasoning as structured facts. Don't translate `status`/`explain` JSON into a prose story about what the scheduler "decided" — show it.
- **Never offer scheduling-mode flags.** Serial/parallel is emergent (R1.8 / NG24). `start` is lifecycle-only. A `--serial` / `--parallel` / `--mode` flag does not exist and proposing one violates a core invariant.
- **`answer` mutates live state and resumes a worker** — confirm against the real `inbox` prompt first, and pass through the CLI's `--seq` / `--question-id` disambiguation rather than guessing.
- **This command is operator-initiated.** It controls a daemon that spawns supervised workers; a worker context must never drive the scheduler's lifecycle.
- **`prioritize` has no reason; `block` requires one.** This asymmetry is intentional audit-trail design — don't normalize it away.
