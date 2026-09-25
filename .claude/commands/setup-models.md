---
disable-model-invocation: true
---

You are the `/setup-models` command. Pick LLM models for this **machine** and wire them into `~/.atelier/models/models.env` (override: `$ATELIER_MODELS_DIR`) so every codex/gemini-routing hook (promote, swarm-plan, scribe-author, classify-with-codex, multimodal-reconcile, audit-*, retro-*, …) in **every repo on this machine** reads the same operator-chosen model.

Scope is every gate, not only promote: `call-provider.sh` reads `CALL_PROVIDER_<FAMILY>_MODEL` wherever a provider is called.

**Machine-wide, not per-repo (2026-09-15).** Which CLIs are installed and authenticated, and which keys resolve, are facts about the machine — so the choice is made once, not in each repo. It runs from any directory, inside a repo or not. A repo wired before this change carries a legacy managed block in its `.envrc.atelier`; it is read only while no machine file exists, and `--apply` removes it from the repo it runs in.

The user's arguments (may be empty): $ARGUMENTS

Parse `$ARGUMENTS` for these flags:
- `--force` — accepted and ignored: nothing is rendered any more (see Notes). If the operator passed it to recover a broken dispatcher, run doctor instead — a `missing-binary` there is an exported `ATELIER_SPEC_*_BIN` override, not something `--apply` can repair.
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

- `installed` — map of supported provider keys that can dispatch on this machine (a CLI on PATH, or for a `transport: rest` provider its tools on PATH and its API key resolvable). Each entry carries `env_var` (the model env var read by call-provider.sh) and `models` (the candidate list with `id` + `note`).
- `all_supported` — every provider the framework can wire (today: `codex` / openai, `gemini` / google, `claude` / anthropic, `deepseek` / deepseek), each with `family`, `transport` + `models`. Use this to explain WHY a non-installed family isn't an option.
- `unavailable` — for each supported provider NOT in `installed`, the reason (binary missing, tools missing, or API key not resolvable). Surface it verbatim when the operator asks for a provider that isn't offered.
- `suggested_pair` — `{extract: <key>, elevate: <key>}` if a cross-family pair is available; `null` otherwise.
- `available_pairs` — EVERY valid cross-family `(extract, elevate)` pairing among installed CLIs, preference-ordered. Present these to the operator so they can pick directly — important when, e.g., an unauthenticated `gemini` is on PATH but the operator actually wants `codex`+`claude`. Don't blindly default to `suggested_pair` when `available_pairs` has more than one entry.
- `ready_to_apply` — boolean shortcut.
- `hint` — present when `ready_to_apply` is false; surfaces a remediation pointer.
- `configured` / `models_env_path` — whether this machine already has a choice, and where. When `configured: true`, tell the operator this re-pins the choice for every repo on the machine.
- `legacy_project_block` — path of the current repo's pre-machine-wide `.envrc.atelier` block, or `null`. Mention that `--apply` will remove it.

**Claude is a first-class provider.** On a machine that has only Claude + Codex, `codex` (openai) + `claude` (anthropic) is a genuine cross-family pair — no third CLI, no API key. `claude` dispatches via `claude -p` (claude.sh), reusing the operator's existing Claude Code auth, and its model is OPTIONAL (the `session-default` choice pins nothing and reuses the operator's `/model` selection).

**DeepSeek is a key-based provider.** `deepseek` has no CLI: it dispatches over DeepSeek's REST API (call-provider.sh → deepseek.sh, curl + jq) with `DEEPSEEK_API_KEY` resolved by `_secret-resolve.sh`. Gate dispatch runs without a TTY, so the keychain and 1Password are skipped there: a key that only lives in the keychain does not count. If `unavailable.deepseek` names the key, tell the operator to store it in `${ATELIER_SECRETS_DIR:-~/.atelier/secrets}/DEEPSEEK_API_KEY.env` (mode 0600, dir 0700) or export `DEEPSEEK_API_KEY` — never read, copy or print the key yourself. Its model is required (`CALL_PROVIDER_DEEPSEEK_MODEL`).

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

The `codex` provider's first option is `gpt-5.6-terra`. Surface the ChatGPT-account-auth note verbatim — a codex model the operator's account does not carry fails remotely, either `Bad Request` (older ids under ChatGPT Plus/Pro/Team auth) or `404 … does not exist or you do not have access to it` (what `gpt-5.5` began returning on 2026-09-07).

The `claude` provider's first option is `session-default` (Recommended): it pins NO model and reuses the operator's Claude Code `/model` selection — no separate API key, no model to remember. Only offer the explicit `claude-opus-4-8` / `claude-sonnet-4-6` / `claude-haiku-4-5` pins if the operator wants a fixed Claude model. When `session-default` is chosen, `--apply` writes NO `CALL_PROVIDER_CLAUDE_MODEL` export (by design — exporting it would force an invalid `--model session-default`).

## Step 4 — Apply the wiring

```bash
atelier setup-models --apply \
    --extract=<EXTRACT_KEY> --extract-model=<EXTRACT_MODEL> \
    --elevate=<ELEVATE_KEY> --elevate-model=<ELEVATE_MODEL>
```

Parse the JSON. Confirm:

- `ok: true`
- `actions` — `{"models.env": created | updated | unchanged}`. Nothing else is written: no scripts are rendered.
- `extract.provider` + `elevate.provider` — recorded as `ATELIER_SPEC_EXTRACT_PROVIDER` / `ATELIER_SPEC_ELEVATE_PROVIDER`; `/promote` runs them through the framework's built-in `hooks/promote-dispatch.sh`.
- `extract.env_var` + `extract.model` (and the elevate pair) — the model env vars now exported machine-wide.
- `models_env_path` — the file that received the exports.
- `legacy_project_block` — `removed` (this repo's old per-repo block is gone; operator lines around it kept), `none`, or `no-project`. Surface `removed`, and `legacy_project_shims` if non-empty (unused now; offered as an optional `rm` in `next_steps`, never deleted for them — unless a shell still exports `ATELIER_SPEC_*_BIN` at them, which then overrides the recorded provider).

Exit-code ladder:
- `0` — wiring applied.
- `2` — invalid args (unknown provider/model, missing required flag).
- `4` — reserved; `--apply` does not emit it.
- `7` — required CLI not on PATH. Tell operator which one to install.

## Step 5 — Verify doctor

`models.env` now exports these vars in its managed block, for EVERY repo on this machine:
- `$ATELIER_SPEC_EXTRACT_PROVIDER` / `$ATELIER_SPEC_ELEVATE_PROVIDER` — promote-lane provider keys (data, not paths: the file never names a program to run)
- `$ATELIER_MODEL_FAMILY_STAMP` — `single-family` for a same-vendor pair, empty for a cross-family one
- `$CALL_PROVIDER_<EXTRACT_FAMILY>_MODEL` — machine-wide model for that family
- `$CALL_PROVIDER_<ELEVATE_FAMILY>_MODEL` — machine-wide model for that family (OMITTED when a model-optional provider like `claude` was wired at `session-default` — a self-documenting comment marks the absence)

**Nothing needs sourcing — no direnv wrapper, no shell-rc line.** `call-provider.sh`, `promote-runner.sh`, `atelier review` and `atelier doctor` load the file at dispatch (`_provider-env.sh` / `_provider_env.py`: file FILLS an unset var, an exported value WINS, divergence WARNS). Do not create or edit a `.envrc` for this.

Run doctor directly:

```bash
atelier doctor --agent
```

Read the JSON; find `promote_dispatchers` and `model_envs`. Confirm:

- `promote_dispatchers.extract.status` == `"resolved"` AND `elevate.status` == `"resolved"`; `concerns` is `[]`; `same_family_suspected: false`.
- `model_envs.concerns` is `[]`, and `model_envs.models_env_source` is the machine `models.env`. Note the opt-in semantics: a model env is only a *concern* for a family actually in use (the default `codex`, or one with a wired dispatcher / routing pin). A family that merely happens to be on PATH — e.g. an unauthenticated `gemini` — appears under `model_envs.informational`, NOT `concerns`, and does not block doctor. A `claude` elevator wired at `session-default` shows `status: session-default` (model optional) and is never a concern.

If a family shows `env-diverges-from-setup`, the invoking shell exports an older value (a previously sourced `.envrc.atelier`, or direnv loading a legacy block in some repo). Surface it; the fix is `unset <VAR>` and, if direnv re-exports it, deleting that repo's legacy managed block (re-running `--apply` inside that repo removes it).

## Step 6 — Hand off

Surface this envelope to the operator:

```
Models wired.

  extract: <extract.provider> (family=<extract.family>, model=<extract.model>)
  elevate: <elevate.provider> (family=<elevate.family>, model=<elevate.model>)
  scope:   machine-wide — every repo on this machine
  file:    <models_env_path>

Nothing to source: gates load it at dispatch.

Next:
  • All codex/gemini-routing hooks now have the model env vars they need.
  • Once a prototype is validated, run `/promote <slug>`.
```

---

## Notes for the AI running this command

- **Never invoke the LLM dispatchers directly during setup** — `--apply` only writes env vars. Actual LLM calls happen at dispatch time (gate firing, /promote, etc.).
- **Re-running is safe** — second invocation with the same (provider, model) pairs is a no-op (`actions` will all be `unchanged`).
- **Custom dispatchers**: there are no generated scripts to hand-edit. An operator who needs custom dispatch logic exports `ATELIER_SPEC_EXTRACT_BIN` / `ATELIER_SPEC_ELEVATE_BIN` (contract: `promote-runner.sh` header, envelope v2); an exported BIN wins over the recorded provider, and doctor shows which one is in effect (`promote_dispatchers.<role>.source`). A BIN is only ever an explicit export — `models.env` never names an executable.
- **Same-family is allowed, and it IS single-model mode.** `--extract claude --elevate claude` applies cleanly and is the supported way to run when no second vendor is usable. A cross-family pair is still the DEFAULT and the better guarantee — offer `available_pairs` first, and only offer `same_family_pairs` when none exists or the operator asks for single-model. When you do apply one, surface `report.warnings` verbatim: the run is same-vendor — fresh eyes, NOT a cross-vendor pass — and must never be recorded as one. Switching back is the same command with two different families.
- **Never fake cross-family (NG28)**: do not relabel two models of one vendor as different families to satisfy a check. It would pass every check, emit no stamp, and be indistinguishable from a genuine cross-vendor run forever. Declare single-model instead — that is what it is for.
- **Model env vars are machine-wide, NOT per-role or per-repo**: `CALL_PROVIDER_CODEX_MODEL` is read by every codex-routing hook (audit, scribe, swarm, multimodal, …) in every repo, not just promote extract. The contract is one model per family per machine. A one-off override is still an exported env var (it wins, with a divergence warning).
- **What it writes**: `<models dir>/models.env` only (models dir = `$ATELIER_MODELS_DIR`, else `~/.atelier/models`), plus removal of the managed block from the current repo's `.envrc.atelier` if one exists. Nothing else in the repo, the operator's shell rc, or framework substrate is touched — and no `.gitignore` edit is needed, because nothing lands in the repo.
