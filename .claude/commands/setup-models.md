---
disable-model-invocation: true
---

You are the `/setup-models` command. Pick LLM models for this project and wire them into `.envrc.atelier` so every codex/gemini-routing hook (promote, swarm-plan, scribe-author, classify-with-codex, multimodal-reconcile, audit-*, retro-*, …) reads the same operator-chosen model.

This command replaces the older `/promote-setup`. Scope is no longer promote-only — model choice is project-wide because `call-provider.sh` reads `CALL_PROVIDER_<FAMILY>_MODEL` from the environment for every gate, not just promote extract/elevate.

The user's arguments (may be empty): $ARGUMENTS

Parse `$ARGUMENTS` for these flags:
- `--force` — pass through to `atelier setup-models --apply --force` so operator-edited shims get re-rendered to canonical. Use when downstream is recovering from a corrupted dispatcher (e.g. doctor reports `missing-binary` on a shim that exists but lost +x; or `/promote` exited 3 with a "shim out of sync" hint).
- `--extract=<provider>` / `--elevate=<provider>` — pin a specific provider pair without going through Step 2's AskUserQuestion.
- `--extract-model=<model>` / `--elevate-model=<model>` — pin a specific model without going through Step 3's AskUserQuestion.

Other unrecognized arguments: surface to the operator and ask whether to continue with detect-first flow.

Reference: `atelier/hooks/call-provider.sh` (model env-var contract); `atelier/hooks/promote-runner.sh:30-40` (dispatcher contract, envelope v2); `atelier/scripts/promote-setup-cli.py` (CLI that does the work); `docs/atelier/ATELIER_PLAN.md` § W8.2 (promote-lane design) + § codex-model-cleanup wave.

---

## Step 1 — Detect installed LLM CLIs

```bash
atelier setup-models --detect
```

Parse the JSON. Key fields:

- `installed` — map of supported provider keys → resolved binary path. Each entry carries `env_var` (the model env var read by call-provider.sh) and `models` (the candidate list with `id` + `note`).
- `all_supported` — every provider the framework can wire (today: `codex` / openai, `gemini` / google, `claude` / anthropic), each with `family` + `models`. Use this to explain WHY a non-installed family isn't an option.
- `suggested_pair` — `{extract: <key>, elevate: <key>}` if a cross-family pair is available; `null` otherwise.
- `available_pairs` — EVERY valid cross-family `(extract, elevate)` pairing among installed CLIs, preference-ordered. Present these to the operator so they can pick directly — important when, e.g., an unauthenticated `gemini` is on PATH but the operator actually wants `codex`+`claude`. Don't blindly default to `suggested_pair` when `available_pairs` has more than one entry.
- `ready_to_apply` — boolean shortcut.
- `hint` — present when `ready_to_apply` is false; surfaces a remediation pointer.

**Claude is a first-class provider.** On a machine that has only Claude + Codex, `codex` (openai) + `claude` (anthropic) is a genuine cross-family pair — no third CLI, no API key. `claude` dispatches via `claude -p` (claude.sh), reusing the operator's existing Claude Code auth, and its model is OPTIONAL (the `session-default` choice pins nothing and reuses the operator's `/model` selection).

## Step 2 — Confirm or override the provider pair

### Case A: `ready_to_apply: false` (no cross-family pair available)

Surface the `hint` field verbatim to the operator. Common shapes:

- **No supported CLIs at all** → tell the operator they need at least two LLM CLIs from different families. The cheapest path on a Claude box: they already have Claude Code (`claude`, anthropic) — they just need `codex` (openai). Valid pairs: `codex`+`gemini`, `codex`+`claude`, `claude`+`gemini`. Stop. Do NOT run `--apply`.
- **Installed CLIs exist but no cross-family pair** → list what's installed and note that `claude` (Claude Code) counts as the anthropic family if it's available. Suggest the missing counterpart.

In both cases, refuse to proceed and stop here.

### Case B: `ready_to_apply: true` (cross-family pair available)

`AskUserQuestion` to pick the pair. When `available_pairs` has more than one entry, present each as a distinct option (not just suggested + swap) so the operator chooses explicitly:

> Detected LLM CLIs: <list installed keys + families>
>
> Which cross-family pair should drive promote (extract → elevate)?
>
> Options: (one per `available_pairs` entry, in order; first = Recommended)
> - **`<pair.extract>` → `<pair.elevate>`** (`<extract_family>` → `<elevate_family>`) — <mark the first as Recommended>
> - ... one per available pair ...
> - **Cancel** — exit without changes.

Notes:
- On a Claude+Codex box, `codex → claude` will appear here — pick it to wire Claude as the elevator (anthropic), Codex as the extractor (openai).
- If an unauthenticated `gemini` happens to be on PATH, `codex → gemini` may sort first; steer the operator to `codex → claude` if Gemini isn't actually set up.

If `$ARGUMENTS` already pinned `--extract` and `--elevate`, skip the AskUserQuestion and use the pinned values (validating them against the `installed` map first; refuse if either is absent).

## Step 3 — Pick the model for each provider

For EACH of the (extract, elevate) providers picked in Step 2, `AskUserQuestion`:

> Pick the model for `<provider-key>` (`<installed[provider].label>`):
>
> Options: (one per entry in `installed[provider].models`, in list order)
> - **<models[0].id>** (Recommended) — <models[0].note>
> - **<models[1].id>** — <models[1].note>
> - ... etc.

If `$ARGUMENTS` already pinned `--extract-model` / `--elevate-model`, skip the corresponding question. Validate pinned models against the `models` list and refuse if absent.

The `codex` provider's first option is `gpt-5.5`. Surface the ChatGPT-account-auth note verbatim — operators on a ChatGPT Plus/Pro/Team subscription will see `Bad Request` from any other codex model.

The `claude` provider's first option is `session-default` (Recommended): it pins NO model and reuses the operator's Claude Code `/model` selection — no separate API key, no model to remember. Only offer the explicit `claude-opus-4-8` / `claude-sonnet-4-6` / `claude-haiku-4-5` pins if the operator wants a fixed Claude model. When `session-default` is chosen, `--apply` writes NO `CALL_PROVIDER_CLAUDE_MODEL` export (by design — exporting it would force an invalid `--model session-default`).

## Step 4 — Apply the wiring

```bash
atelier setup-models --apply \
    --extract=<EXTRACT_KEY> --extract-model=<EXTRACT_MODEL> \
    --elevate=<ELEVATE_KEY> --elevate-model=<ELEVATE_MODEL>
```

If `$ARGUMENTS` contained `--force` (Step 0 parse), append `--force` to this invocation. The CLI overwrites operator-edited shims with the canonical re-rendered version.

Parse the JSON. Confirm:

- `ok: true`
- `actions` — surface to operator (each of `.envrc.atelier`, `extract-via-<X>.sh`, `elevate-via-<Y>.sh` will be `created` / `unchanged` / `overwritten`).
- `extract.shim_path_rel` + `elevate.shim_path_rel` — where the shims were written.
- `extract.env_var` + `extract.model` (and the elevate pair) — the model env vars now exported in `.envrc.atelier`.
- `envrc_path` — the .envrc.atelier path that received the exports.

Exit-code ladder:
- `0` — wiring applied.
- `2` — invalid args (unknown provider/model, missing required flag) / non-`--force` overwrite refused. Re-run with `--force` if you need to overwrite operator-edited shims.
- `4` — same-family pair (Invariant 5). Re-pick.
- `7` — required CLI not on PATH. Tell operator which one to install.

## Step 5 — Load the env vars + verify doctor

The `.envrc.atelier` file now exports these vars in its managed block:
- `$ATELIER_SPEC_EXTRACT_BIN` — promote-lane extractor shim path
- `$ATELIER_SPEC_ELEVATE_BIN` — promote-lane elevator shim path
- `$CALL_PROVIDER_<EXTRACT_FAMILY>_MODEL` — project-wide model for that family
- `$CALL_PROVIDER_<ELEVATE_FAMILY>_MODEL` — project-wide model for that family (OMITTED when a model-optional provider like `claude` was wired at `session-default` — a self-documenting comment marks the absence)

Two ways the operator picks them up:

- **direnv users**: direnv only auto-loads a file named literally `.envrc` — NOT `.envrc.atelier`. The operator needs a `.envrc` wrapper. Check whether `<project-root>/.envrc` exists; if not, create one containing exactly: `source_env .envrc.atelier` (single line). Then have them run `direnv allow`. If `.envrc` already exists, check it contains `source_env .envrc.atelier`; if not, ask the operator before appending — their existing `.envrc` may be load-bearing.
- **non-direnv users**: tell them to `source .envrc.atelier` in their shell (and add it to their shell profile if they want it persistent across sessions). The path-derivation logic in the managed block (`_ATELIER_ENVRC_DIR`) means sourcing from any subdir of the project root works correctly.

For the immediate doctor verification, source the file in this session and run doctor:

```bash
source .envrc.atelier && atelier doctor --agent
```

Read the JSON; find `promote_dispatchers` and `model_envs`. Confirm:

- `promote_dispatchers.extract.status` == `"resolved"` AND `elevate.status` == `"resolved"`; `concerns` is `[]`; `same_family_suspected: false`.
- `model_envs.concerns` is `[]`. Note the opt-in semantics: a model env is only a *concern* for a family the project actually uses (the default `codex`, or one with a wired dispatcher / routing pin). A family that merely happens to be on PATH — e.g. an unauthenticated `gemini` — appears under `model_envs.informational`, NOT `concerns`, and does not block doctor. A `claude` elevator wired at `session-default` shows `status: session-default` (model optional) and is never a concern.

If any fail, surface the discrepancy to the operator — likely cause: shell session doesn't have the env vars (the in-session check above; downstream invocations need either direnv or a sourced `.envrc.atelier`).

## Step 6 — Hand off

Surface this envelope to the operator:

```
Models wired.

  extract: $ATELIER_SPEC_EXTRACT_BIN → <extract.shim_path_rel> (family=<extract.family>, model=<extract.model>)
  elevate: $ATELIER_SPEC_ELEVATE_BIN → <elevate.shim_path_rel> (family=<elevate.family>, model=<elevate.model>)
  envrc:   <envrc_path>

Make the env vars persistent:
  • direnv users: `direnv allow` in project root
  • others: `source .envrc.atelier` (or add to your shell rc)

Next:
  • All codex/gemini-routing hooks now have the model env vars they need.
  • Once a prototype is validated, run `/promote <slug>`.
```

---

## Notes for the AI running this command

- **Never invoke the LLM dispatchers directly during setup** — `--apply` only renders the shims and writes env vars. Actual LLM calls happen at dispatch time (gate firing, /promote, etc.).
- **Re-running is safe** — second invocation with the same (provider, model) pairs is a no-op (`actions` will all be `unchanged`).
- **Operator-edited shims**: if the operator hand-edits a shim file in `.atelier/bin/`, re-running `--apply` will refuse with exit 2 unless `--force` is passed. This protects custom dispatcher logic from being clobbered. Surface the refusal verbatim; let the operator decide whether to `--force` or keep their edits.
- **Cross-family invariant**: the CLI refuses same-family pairs at exit 4 — Invariant 5 (prototype-lane) requires extract + elevate to differ. Don't try to force this; refuse and re-prompt the operator for a different pair.
- **Model env vars are project-wide, NOT per-role**: `CALL_PROVIDER_CODEX_MODEL` is read by every codex-routing hook (audit, scribe, swarm, multimodal, …), not just promote extract. Operators who want fine-grained per-gate control would need a future enhancement; for now the contract is one model per family per project.
- **No global state mutation**: this command only writes under `<project>/.atelier/bin/` and `<project>/.envrc.atelier`. Both are project-local. Operator's shell rc, `~/.atelier/`, and framework substrate are untouched.
