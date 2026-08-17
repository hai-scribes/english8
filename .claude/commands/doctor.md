## Step 1: Framework health (`atelier doctor`)

Run the canonical machine-readable health check. This covers what the legacy
`verify-setup.sh` covered plus the W5.10 / W6 / W7.3 additions:

```bash
atelier doctor
```

Output is JSON with these panels:

- `claude_code_version_compat` — `known_good` / `known_bad` / `unknown`. Bad →
  surface the version + the matched range note; suggest upgrade or pin.
- `command_staleness` — `OK` / `MISSING_SIDECAR` / `DRIFTED`. MISSING_SIDECAR
  fixed by `atelier upgrade --refresh-commands --apply`. DRIFTED requires
  per-command triage (`atelier upgrade --refresh-commands` with no `--apply`
  shows the plan).
- `decisions_ledger` — row counts + malformed counts. Malformed → exit-7
  concern; surface the path and the count.
- `lock_holder` — orchestra lock state. `alive: true` with a foreign PID
  means another orchestra invocation is in flight; do not run `/develop`.
- `verify_isolation` — probe outcome. `UNKNOWN` (post-init default) →
  re-run the probe; `FAIL` → operator action required.

For each entry in the top-level `concerns[]` array: propose root cause + fix,
apply on approval, re-run. Don't repeat what the JSON already showed.

**Special-case: promote-dispatchers / model_envs concerns.** If `concerns[]`
contains any string referencing `promote dispatchers` (unset / non-executable
paths / same-family Invariant 5) OR `CALL_PROVIDER_*_MODEL unset`, AND the
concern text references `/setup-models` as the remediation, do NOT ask the
operator to type `/setup-models` — the AI can run the underlying
`atelier setup-models` CLI directly. Per R6.4.b, `AskUserQuestion`:

> Doctor flagged the model wiring — codex/gemini-routing hooks will fail
> until fixed. Options:
> - **Fix now (Recommended)** — I'll run setup-models inline: auto-detect
>   CLIs, confirm pair + models, render shims, write `.envrc.atelier`,
>   re-run doctor to verify clean. ~30s.
> - **Skip for now** — leave the concern open; surface in this `/doctor` report.

If "Fix now": invoke the inline workflow — `atelier setup-models --detect`,
confirm pair + per-provider model via `AskUserQuestion` (use the
`installed[provider].models[]` list from the detect JSON; first entry is
Recommended), `atelier setup-models --apply --extract=X --extract-model=MX
--elevate=Y --elevate-model=MY`, source the env vars in your Bash session
(`source .envrc.atelier && <next cmd>`), then re-run `atelier doctor` to
verify the concern flipped. Surface the resolved state in Step 4's report.

On a machine with only Claude + Codex, the cross-family pair is `codex`
(extract, openai) + `claude` (elevate, anthropic) — `claude` dispatches via
`claude -p`, reusing the operator's Claude Code auth, so its model is optional
(pick `session-default`). No third CLI or API key is needed.

**Informational vs concern (model_envs opt-in).** `model_envs.informational[]`
is NOT in `concerns[]` and does NOT flip exit 7. A family CLI that is merely
on PATH but not opted into (no wired dispatcher, no routing pin) — e.g. an
unauthenticated `gemini` — lands there, and a `claude` wired at
`session-default` lands there too (`status: session-default`). Do NOT propose
`/setup-models` for an informational line; only `concerns[]` entries warrant a
fix. This is the fix for the downstream "doctor exits 7 because gemini is on
PATH" report — presence is not opt-in.

### Optional deeper checks

```bash
atelier doctor --check-containers           # W4.4-B runtime health probe
atelier doctor --check-cascade-events       # W3.6.f observability cross-check
atelier doctor --validate-secrets           # W2.3.b — declared keys probe
atelier doctor --probe-skill-invocation     # W9.7.e Phase 2 — costs ~$0.05
```

Only run these when relevant signal exists (`atelier.yml` has secrets, the
project uses containers, etc.). The base `atelier doctor` call covers the
common path; deeper flags surface specific failure modes.

## Step 2: Atelier version sanity

```bash
atelier --version
echo "ATELIER_VERSION=${ATELIER_VERSION:-unset}"
```

`ATELIER_VERSION` unset → WARN one line: *"Atelier version not pinned in shell
env; operator may run `export ATELIER_VERSION=<tag>` to enable container-probe
+ dispatcher version handshake."* Skip if `atelier --version` reports
`0.1.0-dev` (no tag cut yet — pin is meaningless until v0.1.0-dev lands).

## Step 3: AI-only checks (judgment, not scripted)

These require reading code, not running a script. Do them in order:

1. **`atelier.yml` accuracy** — read `.atelier/atelier.yml`. Compare declared
   keys against the project's actual stack (`package.json` / `Cargo.toml` /
   `pyproject.toml`). Flag mismatches. **Propose** the diff; do NOT auto-edit.
   `/doctor` is diagnostic, not a config-mutator.
2. **Stack docs filled** — `CLAUDE.md` (if present) Language/Framework/Database
   sections, `.atelier/rules/patterns.md` code patterns. If blank, **propose**
   filled content from a source scan; do NOT write without user approval.
3. **`.atelier/rules/` coverage** — both `design-foundations.md` and
   `patterns.md` present (init scaffolds them). If either is empty or
   placeholder-only, surface that and offer to draft starter content.
4. **`reports/decisions.jsonl` health** — if `decisions_ledger.exists: false`
   in Step 1 output AND the project has run any `/develop` or `/commit` cycles,
   that's a logging-gap concern; surface.

## Step 4: Report

One line per top-level concern that was fixed. One line per concern still
open. One line per WARN the user asked about. Everything else `atelier doctor`
already printed — do not repeat.
