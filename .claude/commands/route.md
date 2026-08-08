---
disable-model-invocation: true
---

You are the `/route` command. Configure or inspect the per-gate LLM routing
for this project. Three operator modes; all backed by `atelier route` CLI
under the hood (R3.2 in-session surface).

The user's request: $ARGUMENTS

`$ARGUMENTS` may include:
- (empty) — invoke the interactive wizard for the standard unpinned + bakeoff
  steps. Best when the operator wants to set up routing for the first time
  or revisit pins after a framework upgrade.
- `show` — print the current routing state (per-gate pins, family
  resolution, dormant providers, invariant violations). Read-only.
- `pin <step>=<provider> [<step>=<provider> ...]` — direct atomic pin
  application. Use when the operator already knows what to change. The
  wizard's invariant 4/5/6 checks (cross-vendor agreement) still apply.
- `--allow-dormant` — permit selecting providers whose wrapper isn't yet
  shipped (gpt-* direct, etc.). Use when adopting a new wrapper out-of-band.

---

## Step 1: Resolve mode

Parse `$ARGUMENTS`:

- If `$ARGUMENTS` is empty or only contains `--allow-dormant`, run the
  interactive wizard:

  ```bash
  atelier route wizard ${ALLOW_DORMANT:+--allow-dormant}
  ```

  The CLI prompts step-by-step. Walk the operator through each pin and
  surface its flip-cost preview (free / re-gate-e / re-scribe /
  re-author-and-re-gate-e) per R3.5 before they confirm.

- If `$ARGUMENTS` starts with `show`, run the read-only snapshot:

  ```bash
  atelier route show --agent
  ```

  Parse the JSON and present a human-friendly summary:
  - any `invariant_violations` (HIGH priority — surface them with the
    step name + remediation)
  - any `t1_dormant: true` or `t2_dormant: true` gates (medium — these
    routes can't dispatch today)
  - the count of gates currently pinned vs unpinned
  - the `local_yaml_present` flag (was this project's local.yaml ever
    customized, or is it still defaults?)

- If `$ARGUMENTS` starts with `pin`, parse each `step=provider` pair and
  emit one CLI call:

  ```bash
  atelier route wizard --non-interactive \
    ${ALLOW_DORMANT:+--allow-dormant} \
    --pin step1=provider1 --pin step2=provider2 ...
  ```

  Single call ensures atomicity — all pins apply together or none do
  (two-phase commit: candidate written to tmp, lint validates, atomic
  rename on success).

## Step 2: Surface results

For the wizard / pin paths, parse the JSON output:

- `ok: true, written: true` — pins landed. Confirm to the operator with
  the pin list + the local.yaml path.
- `ok: true, written: false, reason: "no-op ..."` — operator re-pinned
  the same values. No-op; reassure that nothing changed.
- `backup: <path>` — operator had hand-edit comments in local.yaml that
  the wizard could not preserve (pyyaml safe_dump limitation). The
  comments are backed up at the named path; the operator should re-add
  them manually after reviewing the new pin set.
- `code: "INVARIANT_VIOLATION"` — proposed pin would put the verifier /
  reconciler / judge in the same vendor family as the spec author. Show
  the structured message and suggest a different-family alternative
  (Codex/OpenAI ↔ Gemini/Google ↔ Anthropic/Claude ↔ DeepSeek).
- `code: "DORMANT_PROVIDER"` — wrapper not shipped. Either pick a
  different provider OR re-invoke with `/route ... --allow-dormant` if
  the operator has an out-of-band wrapper.
- `code: "LINT_REJECTED_CANDIDATE"` — wizard's invariants passed but
  `atelier lint --rule routing` (invariants 1-3) rejected the candidate.
  Surface the lint message; local.yaml unchanged.

## Step 3: Suggested next steps (advisory)

After a successful pin write, scan the pinned providers' `auth` fields
(`atelier route show --agent` is cheap):

- Any provider with `auth: api_key` whose key name is NOT in the
  project's `.atelier/atelier.yml#secrets.keys` block — prompt the
  operator to add it and populate via keychain/1Password.
- Map of provider-id → expected key name:
  - `gemini-*` → `GEMINI_API_KEY`
  - `deepseek-*` → `DEEPSEEK_API_KEY`
  - `mistral*` / `codestral*` → `MISTRAL_API_KEY`
  - `codex*` / `claude-*` / `builder` → no key needed (OAuth or subagent)

Then suggest: `atelier doctor --validate-secrets` to confirm resolution
via cache → keychain → 1Password → file → env (R-Secret) without
exposing values.

## Honest caveats

- **Comment preservation**: the wizard rewrites `local.yaml` via
  `yaml.safe_dump`, which strips comments. If the operator hand-edits
  comments in the file, the wizard backs them up before rewrite (so
  they can be manually re-added). True comment-preserving round-trip is
  deferred until a `ruamel.yaml` migration.
- **Dormant providers**: every non-codex / non-Anthropic family ships a
  wrapper today (`gemini.sh`, `deepseek.sh`, `mistral.sh`, `local-llm.sh`)
  EXCEPT direct OpenAI API (`openai.sh` — `gpt-*` providers are dormant
  until W3.2.x). The wizard refuses to pin dormant providers unless
  `--allow-dormant` is set.
- **Cross-family invariants**: the wizard enforces invariants 4/5/6
  (verifier / reconciler / auto-pilot-judge T1 family must differ from
  spec-author T1 family). `atelier lint --rule routing` enforces
  invariants 1/2/3 (no Builder family at T1, T2 ≠ T1, requires_multimodal
  satisfied). Both must pass before the wizard commits.
