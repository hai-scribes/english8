---
disable-model-invocation: true
---

You are the `/orchestra-auto` command. Launch the **develop-lane auto-pilot** — the overnight, fire-and-forget mode of the Orchestra daemon. Instead of parking questions to the operator's inbox and waiting (the supervised mode behind `/orchestra`), an automated **responder drains the inbox via the cross-family judge every sweep**, and the daemon **drives the whole approved backlog to an all-terminal state and exits by itself**. Call it, walk away, come back to a finished run plus `reports/autopilot-<run-id>.md`.

This wraps `atelier orchestra start --autopilot`. It drives the **develop lane** (the full SPEC→RED→GREEN→VERIFY→CLOSE pipeline over the backlog) — NOT one slug, and NOT the prototype lane (that's `/prototype-auto`).

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC17 (run autonomously overnight) and `docs/atelier/ATELIER_AUTOPILOT.md` § "Develop lane". Honest bound (H8): "completes everything" means *drives every spec to a terminal state and exits* — correctness confidence is bounded by the semantic-gate quality, and low-confidence + semantic-suspect specs are flagged in the report. Objective gates are never model-judged.

The user's request (optional flags): $ARGUMENTS

---

## Step 1 — Preflight (refuse an unverifiable or unworkable run before detaching)

An overnight run that no one is watching must be safe to leave alone. Check, in order — surface any failure and stop:

1. **Cross-family verifier wired.** The CLI refuses (`exit 2`) to start `--autopilot` if `ATELIER_AUTOPILOT_JUDGE_BIN` is unset — an unattended run that can't be verified by an independent model family must not begin (the INVARIANT_6 contract). Probe it:

   ```bash
   printenv ATELIER_AUTOPILOT_JUDGE_BIN
   ```

   If empty, tell the operator the judge dispatcher must be wired first (it's the cross-vendor LLM that stands in for them at the subjective gates). Point at the route/setup surface and stop — do NOT try to launch and let the CLI bounce it; surface the requirement cleanly.

2. **Worker command configured.** The daemon spawns a supervised worker per dispatchable spec from `ATELIER_WORKER_CMD` (the operator's policy, e.g. a sourced `.envrc.atelier` from `atelier/config/worker-develop.envrc.example`). `start` inherits it and never sets it — if unset, the daemon has nothing to spawn:

   ```bash
   printenv ATELIER_WORKER_CMD
   ```

   If empty, surface that the worker command isn't configured and stop.

3. **There is an approved backlog to drive.** Auto-pilot over an empty backlog is a no-op:

   ```bash
   atelier orchestra status --agent --compact
   ```

   If no spec is in a runnable/`planned`/`ready` state, say so — the operator likely needs to approve specs (`/develop` → approval gate) first.

4. **No daemon already running.** `status` (or a `--dry-run` start) reveals a live lock holder. A double-start is safe (reports `already_running`), but tell the operator rather than silently exiting.

## Step 2 — Confirm policy + budget

`--autopilot` does NOT change scheduling (decide() ordering is identical to supervised). It changes WHO drains the inbox (the judge) and that the daemon self-terminates. Confirm the knobs before a long unattended run; default to the CLI defaults unless the operator overrides:

- **`--on-escalate {decide|block|park}`** (default `decide`) — disposition for a spec still below the confidence floor after effort-escalation. `decide`: the judge's best call stands, flagged in the report. `block`: terminal-block it. `park`: leave it for the operator (re-introduces a human gate — the run won't be fully hands-off).
- **`--max-attempts N`** (default 3) — per-spec re-dispatch budget.
- **`--max-revisions K`** (default 2) — reject→revise rounds before a terminal block.
- **`--max-cycles N`** — whole-run sweep cap (hitting it is a logged stop).
- **`--max-wall-clock-sec S`** — whole-run wall-clock cap.
- **`--token-ceiling N`** — per-run token governor.
- **`--report PATH`** — override the default `reports/autopilot-<run-id>.md`.

State the effective settings in one line, then launch. Do a `--dry-run` first if the operator wants to see the exact launch before committing:

```bash
atelier orchestra start --autopilot [flags] --dry-run --agent --compact
```

## Step 3 — Launch

```bash
atelier orchestra start --autopilot \
    [--on-escalate decide|block|park] \
    [--max-attempts N] [--max-revisions K] \
    [--max-cycles N] [--max-wall-clock-sec S] [--token-ceiling N] \
    [--report PATH] \
    --agent --compact
```

The daemon **detaches into the background by itself** (the CLI returns immediately with `{launched: true, pid: …}`) — do NOT run this with `run_in_background` or append `&`; the start command already forks a detached, session-leading daemon that outlives this turn. Surface the `pid` and the report path the run will write.

## Step 4 — Hand off (and optionally check in)

Tell the operator the run is live and self-terminating, and how to observe it without interfering:

- **Progress:** `/orchestra status` (or `atelier orchestra status`) — the live snapshot per spec.
- **Report:** `reports/autopilot-<run-id>.md` (or their `--report` path) — written as the run progresses and at exit; flags low-confidence + semantic-suspect specs.
- **Stop early:** `/orchestra stop` — graceful SIGTERM; in-flight workers continue, the daemon exits after the current sweep.

The run ends on its own when the backlog reaches an all-terminal state. If the operator wants you to watch it during this session, offer to poll `orchestra status` on an interval rather than blocking — but for a genuine overnight run, handing off the report path is the right close.

---

## Notes for the AI running this command

- **Do the verifier preflight — don't outsource it to a failed launch.** `ATELIER_AUTOPILOT_JUDGE_BIN` unset is a hard refusal (exit 2); catch it in Step 1 with a clear "wire the cross-family judge first" instead of letting the daemon bounce.
- **Don't background the launch.** `atelier orchestra start` already detaches a session-leading daemon and returns fast. Wrapping it in `run_in_background` or `&` is redundant and muddies the pid you report.
- **Don't promise correctness you can't bound.** Per H8, "completes everything" = drives to terminal + exits. Confidence is bounded by the semantic gate; surface that the report flags low-confidence specs rather than implying everything shipped is correct.
- **`--on-escalate park` re-introduces a human gate** — if the operator picks it, the run is no longer fully unattended; they'll need to drain the inbox via `/orchestra answer`. Say so when they choose it.
- **No scheduling flags exist.** `--autopilot` changes inbox-draining and self-termination, never serial/parallel ordering (R1.8 / NG24). Don't offer a mode flag.
- **Operator-initiated only.** This drives the whole backlog through worktree-mutating workers; a worker context must never start an auto-pilot run.
- **One daemon per project** (atomic `orchestra.lock`). A second start reports `already_running` and spawns nothing — surface that, don't work around it.
