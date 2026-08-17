---
description: "Convert a validated prototype into a production-ready spec and start a fresh production cycle."
disable-model-invocation: true
---

You are the `/promote` command. Convert a validated prototype into a production-ready spec, then start a fresh production build via standard `/develop`.

**Promote is NOT a merge.** It distills a *new* spec from the prototype's observed behavior; `/develop` then rebuilds production code fresh. The `prototype/<slug>` branch is deliberately gate-free and never becomes mainline — do NOT `git merge prototype/<slug>` into the default branch. To continue an in-progress lane on another machine, use `atelier push` / `atelier pull` (UC22), never a merge.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 (primary flow); `docs/atelier/ATELIER_PLAN.md` § W8.2.

The user's slug: $ARGUMENTS

---

## Step 1 — Resolve the slug + refusal checks

If `$ARGUMENTS` is empty, list active prototypes via:

```bash
atelier prototype list --agent --compact
```

Then `AskUserQuestion` to pick one. If the user names a slug that isn't `state: open` in the envelope, refuse and stop.

The runner mechanically refuses (exit 1) if:
- No prototype state file at `.specs/prototype/<slug>.yaml` (slug never started, or already dropped/promoted).
- State is `promoted` or `dropped` (one-way transitions; can't re-promote).
- `.specs/verify/<slug>.approved` already exists (Gate E was signed via standard flow; promotion would stomp).
- Production branch `<slug>` or worktree `.worktrees/<slug>/` already exists.

## Step 2 — Confirm user-validated the prototype out-of-band

`AskUserQuestion`: "Have you demoed this prototype to users (or done out-of-band acceptance review)? Promote captures the prototype's current behavior into a spec — un-validated UX will be inherited."

If the user hasn't validated yet, redirect: "Continue iterating in `.worktrees/prototype-<slug>/`, run the demo, then `/promote` once you're confident."

NOTE: Atelier W8.2 does NOT enforce a `.prototype-validated` HMAC marker (an earlier pipeline did via `approve-prototype.sh`). The validation step is operator-attested by running `/promote`. The W8.4 wave or follow-up can add the HMAC marker if forensic value justifies it.

## Step 3 — Dry-run the pre-flight checks

```bash
atelier prototype promote <slug> --dry-run
```

This validates state file + prompts + dispatcher availability + branch/worktree collisions WITHOUT actually invoking LLMs. Surface the output to the user.

If the operator hasn't wired `$ATELIER_SPEC_EXTRACT_BIN` and `$ATELIER_SPEC_ELEVATE_BIN`, the dry-run shows them as `<unwired>` and exits 3 (INFRA). **Do NOT push the slash command `/setup-models` onto the operator as a manual step.** You (the AI driving this command) can run the underlying `atelier setup-models` CLI inline — this is the same workflow `/setup-models` encodes, just invoked from this `/promote` context. Per R6.4.b discipline, internalize it.

`AskUserQuestion` the operator:

> Dispatchers aren't wired — `/promote` will fail until they are. Options:
> - **Wire now (Recommended)** — I'll auto-detect installed LLM CLIs (codex / gemini / etc.), confirm the pair with you, render the shim scripts under `.atelier/bin/`, write env exports to `.envrc.atelier`, and source them in this session. ~30 seconds.
> - **Skip / wire later** — exit `/promote` now; you'll need to wire manually before the next attempt.
> - **Cancel `/promote`** — stop here without changes.

If the operator picks **Wire now**, execute this inline workflow:

1. `atelier setup-models --detect` (parse JSON for `installed`, `suggested_pair`, `ready_to_apply`).
2. If `ready_to_apply: false`: surface `hint` to the operator, suggest they install the missing CLI, then re-prompt; do NOT proceed to `--apply`.
3. If `ready_to_apply: true`: `AskUserQuestion` to confirm the `suggested_pair` (or swap roles per `/setup-models` Step 2's option set). Default to the suggested pair if the operator just confirms. Then `AskUserQuestion` for the MODEL of each chosen provider, using `installed[provider].models[]` from the detect JSON (first entry = Recommended; for `codex` that is currently `gpt-5.5`, the default on codex 0.135 that works on ChatGPT-account auth).
4. `atelier setup-models --apply --extract=<EXTRACT_KEY> --extract-model=<EXTRACT_MODEL> --elevate=<ELEVATE_KEY> --elevate-model=<ELEVATE_MODEL>` — parse JSON, confirm `ok: true`. Surface the `orphaned_shims[]` list and the `actions` map.
5. **Source the env vars in your own Bash session** so subsequent calls in this `/promote` flow see them: prefix subsequent Bash calls with `source .envrc.atelier && <cmd>`, OR `export` the four env vars directly (the two `ATELIER_SPEC_*_BIN` shim paths AND the two `CALL_PROVIDER_<FAMILY>_MODEL` model exports). The model env vars are required — `call-provider.sh` refuses to dispatch without them. (Direnv setup advice from `/setup-models` Step 5 applies if the operator wants persistence across sessions — handle that as a side-task; don't gate `/promote` on it.)
6. Re-run `atelier prototype promote <slug> --dry-run` — confirm `READY: YES`. If still NO, surface the error and stop.
7. Continue to Step 4 (full promotion) with the dispatchers now wired.

If the operator picks **Skip / wire later** or **Cancel**: stop here. Tell them the dispatcher contract lives in `docs/atelier/ATELIER_PLAN.md § W8.2` and the prompt files at `atelier/prompts/prototype-spec-{extract,elevate}.md` are the manual-wiring fallback inputs.

## Step 4 — Run the full promotion

```bash
atelier prototype promote <slug>
```

The runner narrates `[1/4]…[4/4]` progress to stderr:

```
[1/4] Extracting candidate spec via $ATELIER_SPEC_EXTRACT_BIN ...
      → family=openai; candidate at .specs/verify/<slug>.spec-candidate.yaml
[2/4] Elevating candidate via $ATELIER_SPEC_ELEVATE_BIN ...
      → family=google; elevated spec at <tmp>
[3/4] Final spec written to .specs/features/<slug>.yaml
[4/4] Fresh production worktree created at .worktrees/<slug> (branch=<slug>, base=main)
```

Exit ladder:
- `0` — promotion complete. Surface the runner's terminal output verbatim.
- `1` — operational failure (state-not-open / branch collision / worktree collision / already-approved).
- `2` — invalid args (bad slug shape).
- `3` — INFRA (extract or elevate dispatcher timeout / unavailable / malformed output).
- `4` — cross-family violation (extract + elevate same family — Invariant 5 violation).

On exit 3, retry once if the dispatcher might be transient (rate limit, API hiccup). If persistent, **do NOT push `/setup-models --force` onto the operator** — `AskUserQuestion`:

> The dispatcher keeps failing. Likely a shim corruption or path-resolution drift. Options:
> - **Re-render shims (Recommended)** — I'll run `atelier setup-models --apply --force` to overwrite both shims with canonical content + re-run doctor to verify, then retry `/promote`. ~10s.
> - **Inspect first** — I'll run `atelier doctor` and surface the dispatcher panel for triage; you decide next.
> - **Stop** — exit `/promote` here.

If "Re-render shims": run `atelier setup-models --apply --extract=<X> --extract-model=<MX> --elevate=<Y> --elevate-model=<MY> --force` inline (use the current pair from `.envrc.atelier` or doctor's `promote_dispatchers` block), source `.envrc.atelier` in your Bash session, re-run `atelier prototype promote <slug>`.

On exit 4 (same-family Invariant 5 violation), `AskUserQuestion`:

> Extract + elevate dispatchers resolved to the same model family — Invariant 5 violation. Options:
> - **Re-pick cross-family pair (Recommended)** — I'll run setup-models inline with a different pair (canonical T1: extract=Codex/openai, elevate=Gemini/google). The CLI enforces Invariant 5 at apply-time so a same-family pair won't render.
> - **Stop** — exit `/promote`; you reconfigure manually.

If "Re-pick": run the inline setup-models workflow from Step 3 with the swapped pair (or whichever the operator picks via the detect/apply confirm), then retry `/promote`.

## Step 5 — Validate the elevated spec (HARD GATE)

```bash
atelier spec validate <slug>
```

This runs the framework's spec-completeness gate: existing-context resolution, ui_contract reconciliation against design PNG (if any), scope classifier, hub-coverage validation. If validation fails:
- Exit 1 (FAIL) — fix the elevated spec via standard editing, OR re-run promote (the slug is already promoted; you'd need to `/drop-prototype <slug>` first and re-prototype — heavy).
- Exit 2 (INFRA) — retry once Codex recovers.

## Step 5.5 — Goals & non-goals review pane (W8.4.13a — MANDATORY)

Per `ATELIER_PLAN.md § W8.4.13` + ADR-W8.4.13-1, this step is the **mandatory drift-defense** point before Gate E. The Elevator (Step 4) was explicitly forbidden from authoring `non_goals[]`; operator authors them here. Per-AC `user_story:` is also confirmed/edited here.

**Inputs to surface to the operator:**

1. **Intake intent** (if captured at /prototype — load via `atelier prototype show-intent <slug>` if added, OR read directly from `.specs/prototype/<slug>.intent.yaml`):
   - `intent.goal` (verbatim)
   - `intent.non_goals` (verbatim list)

2. **Elevated spec proposal** (read `.specs/features/<slug>.yaml`):
   - `goal:` (paragraph from Extractor, may have been informed by intake intent)
   - `acceptance_criteria[]` with `id`, `given`/`when`/`then`, and existing `user_story:` (if Elevator populated — should be present once W8.4.13 is fully wired)
   - `non_goals:` (should be empty `[]` post-Elevator)
   - `prototype_gaps:` (from Extractor — observed omissions; useful when intake skipped)

**Present to operator via `AskUserQuestion`:**

If `intent_captured: true` in `.specs/prototype/<slug>.yaml`:

> Review intake intent → elevated spec.
>
> **goal:**
>   intake:  "<intake.goal>"
>   elevated: "<spec.goal>"
>   Choose: KEEP elevated / REPLACE with intake / EDIT
>
> **non_goals** (operator-authored; elevator left empty):
>   intake had: [<list>]
>   For each intake non_goal: KEEP / EDIT / DROP. Add new items? (free-text)
>
> **per-AC user_story** (one row per AC):
>   AC-1: "<proposed user_story>"  → KEEP / EDIT
>   AC-2: ...

If `intent_captured: false`:

> No intake intent was captured at /prototype start. Author `non_goals[]` from scratch (or leave empty) — these are anti-goals / out-of-scope items the production build should NOT add. The `prototype_gaps:` list below is your guide for omissions the prototype glossed over, but those are not the same as anti-goals.
>
> **Suggested non_goals** (drawn from prototype_gaps; not authoritative):
>   ...
>
> Author `non_goals[]` items now (one per line; or leave empty). Then confirm per-AC `user_story:` per the Elevator's draft.

**Apply operator choices** by editing `.specs/features/<slug>.yaml` directly:
- Set `goal:` per operator's KEEP/REPLACE/EDIT decision
- Set `non_goals: [...]` to the operator-authored list
- For each AC, set `user_story:` per operator confirmation/edit

**Re-validate after edits:**

```bash
atelier spec validate <slug>
```

If validation fails (e.g., bidirectional AC↔story coverage rule once W8.4.13b lands), fix and re-run. **Do NOT proceed to Step 6 carrying validate-spec FAILs.**

This step is the only path from intake intent → sealed `non_goals[]`. The operator's hand on each item is the firewall against the rejected LLM round-trip ([GL-1] rejection + Codex constraint 2).

## Step 6 — User review via AskUserQuestion

Read `.specs/features/<slug>.yaml` (now with operator-authored `non_goals[]` + confirmed `user_story:` per AC from Step 5.5) and present a summary to the user. Ask: "Approve / Revise / Reject."

- Approve → run `bash "$(atelier path --hook approve-spec.sh)" <slug>` to sign Gate E (the HMAC anchor; subsequent flow is UC2).
- Revise → user dictates edits; apply directly to `.specs/features/<slug>.yaml`; loop back to Step 5 (and Step 5.5 if goals/non_goals/user_story change).
- Reject → suggest `/drop-prototype <slug>` to clean up.

## Step 6.5 — Post-Gate-E intake cleanup

After `approve-spec.sh` signs Gate E successfully, delete the intake-intent sidecar:

```bash
atelier prototype clear-intent <slug>
```

Per ADR-W8.4.13-1 invariant 4, the intake sidecar's lifetime ends at Gate E — operator-authored `non_goals[]` are now sealed in the spec; intake residue served its purpose. The command is idempotent (no-op if the sidecar was never created, e.g., operator skipped intake). If skipping this step accidentally, the sidecar is harmless (drift-detector whitelisted, never sealed) but counts against the prototype-lane's "leave no residue" hygiene.

## Step 7 — Hand off to /develop

After Gate E approval + intake cleanup, surface this envelope to the operator as a reference for what was promoted:

```
Promotion complete + Gate E signed.

  spec:        .specs/features/<slug>.yaml
  prod branch: <slug>
  prod worktree: .worktrees/<slug>/

Next:
  cd .worktrees/<slug>/
  /develop <slug>
```

**Per R6.4.b, do NOT push the `cd .worktrees/<slug>/` onto the operator as a "do this yourself" step.** If the operator wants you to continue into `/develop <slug>` in this same session, target the production worktree via absolute paths or `cd .worktrees/<slug> && <cmd>` prefix in your own Bash calls. The envelope above is the operator's resume reference if they choose to detach (e.g., review the spec offline, defer `/develop` to a fresh session).

---

## Notes for the AI running this command

- **DO NOT cherry-pick code from the archived prototype into the production worktree.** The fresh `.worktrees/<slug>/` is the architectural firewall — production code rebuilds from the elevated spec via standard RED→GREEN→VERIFY. Inheriting prototype code would defeat the whole lane.
- **The prototype branch lives on** at `prototype/<slug>` post-promote — reference material only. W8.3's `block-prototype-read.sh` PreToolUse hook prevents Builder/Scribe from reading it (defense in depth).
- **`.atelier/retro/notes-for-operator.md` will get a system reminder** prompting the operator to /retro after promote (W7.5 hook). Surface that nudge if it fires.
- **If extract + elevate are wired but exit 4 fires repeatedly**, the operator may have both bins resolving to the same family (e.g. both Codex). Inspect dispatcher envelopes at `.specs/verify/<slug>.spec-{candidate,elevated}.family` for forensic value.
