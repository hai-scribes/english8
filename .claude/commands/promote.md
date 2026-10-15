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
- The prototype branch has no commits beyond its base, or has commits and **no net change** (an empty delta — the commits cancel out, or all of the lane's work is already in its base). The dry-run refuses this too: there is nothing to extract.

## Step 2 — Confirm user-validated the prototype out-of-band

`AskUserQuestion`: "Have you demoed this prototype to users (or done out-of-band acceptance review)? Promote captures the prototype's current behavior into a spec — un-validated UX will be inherited."

If the user hasn't validated yet, redirect: "Continue iterating in `.worktrees/prototype-<slug>/`, run the demo, then `/promote` once you're confident."

NOTE: Atelier W8.2 does NOT enforce a `.prototype-validated` HMAC marker (an earlier pipeline did via `approve-prototype.sh`). The validation step is operator-attested by running `/promote`. The W8.4 wave or follow-up can add the HMAC marker if forensic value justifies it.

## Step 3 — Dry-run the pre-flight checks

```bash
atelier prototype promote <slug> --dry-run
```

This validates state file + prompts + dispatcher availability + branch/worktree collisions WITHOUT actually invoking LLMs. Surface the output to the user.

The dry-run also ends `READY: NO` with **exit 1** when the lane's delta cannot be located — the condition the real run refuses as `could not build the extraction payload`. The line says which kind it is: `a git call failed while locating the lane's delta` (re-run once; a one-off failure clears) or the lane's delta `has no starting point` (permanent — the lane and its base share no history, or the base / default branch names no commit in this repository; re-running will not clear it, so surface the message, which names what to check).

If no dispatcher is wired for a role (no `/setup-models` provider and no exported `$ATELIER_SPEC_*_BIN` override), the dry-run shows it as `<unwired>` and exits 3 (INFRA). **Do NOT push the slash command `/setup-models` onto the operator as a manual step.** You (the AI driving this command) can run the underlying `atelier setup-models` CLI inline — this is the same workflow `/setup-models` encodes, just invoked from this `/promote` context. Per R6.4.b discipline, internalize it.

`AskUserQuestion` the operator:

> Dispatchers aren't wired — `/promote` will fail until they are. Options:
> - **Wire now (Recommended)** — I'll auto-detect installed LLM CLIs (codex / gemini / etc.), confirm the pair with you, and record the providers + models machine-wide (`~/.atelier/models/`, used by every repo on this machine). ~30 seconds.
> - **Skip / wire later** — exit `/promote` now; you'll need to wire manually before the next attempt.
> - **Cancel `/promote`** — stop here without changes.

If the operator picks **Wire now**, execute this inline workflow:

1. `atelier setup-models --detect` (parse JSON for `installed`, `suggested_pair`, `ready_to_apply`).
2. If `ready_to_apply: false`: surface `hint` to the operator, suggest they install the missing CLI, then re-prompt; do NOT proceed to `--apply`.
3. If `ready_to_apply: true`: `AskUserQuestion` to confirm the `suggested_pair` (or swap roles per `/setup-models` Step 2's option set). Default to the suggested pair if the operator just confirms. Then `AskUserQuestion` for the MODEL of each chosen provider, using `installed[provider].models[]` from the detect JSON (first entry = Recommended; for `codex` that is currently `gpt-5.6-terra`, confirmed on ChatGPT-account auth 2026-09-07 / codex-cli 0.153.4).
4. `atelier setup-models --apply --extract=<EXTRACT_KEY> --extract-model=<EXTRACT_MODEL> --elevate=<ELEVATE_KEY> --elevate-model=<ELEVATE_MODEL>` — parse JSON, confirm `ok: true`. Surface the `actions` map and any `warnings`.
5. **Nothing to source.** `promote-runner.sh` and `call-provider.sh` load the machine-wide file at dispatch. If `--apply` reported `stale_env: true`, this session exports an older value that would win — `unset` the named var(s) in the Bash calls that follow.
6. Re-run `atelier prototype promote <slug> --dry-run` — confirm `READY: YES`. If still NO, surface the error and stop.
7. Continue to Step 4 (full promotion) with the dispatchers now wired.

If the operator picks **Skip / wire later** or **Cancel**: stop here. Tell them the dispatcher contract lives in `docs/atelier/ATELIER_PLAN.md § W8.2` and the prompt files at `atelier/prompts/prototype-spec-{extract,elevate}.md` are the manual-wiring fallback inputs.

## Step 4 — Run the full promotion

```bash
atelier prototype promote <slug>
```

The runner narrates `[1/4]…[4/4]` progress to stderr:

```
[1/4] Extracting candidate spec via provider=codex (built-in dispatcher) ...
      → family=openai; model=<model>; candidate at .specs/verify/<slug>.spec-candidate.yaml
      lane-scope: 6 in delta, 1 outside, 0 unresolvable, 1 uncited of 8 criteria
        outside       AC-3  tools/app.js:2
        uncited       AC-8  (no source:)
[2/4] Elevating candidate via provider=gemini (built-in dispatcher) ...
      → family=google; model=<model>; elevated spec at <tmp>
[3/4] Fresh production worktree created at .worktrees/<slug> (branch=<slug>, base=main)
[4/4] Spec seeded into worktree at .worktrees/<slug>/.specs/features/<slug>.yaml (committed on <slug>)
```

**The `lane-scope:` line is always printed** (and repeated as `lane scope:` in the final summary). Between extract and elevate the runner checks every criterion's `source:` against the lines the prototype lane actually added — mechanically, no model call:

- `in delta` — the cite lands on a line the lane added or changed.
- `outside` — the cite lands on a line or file that pre-dates the lane. The criterion describes the application the lane was built on, not what the lane added; `/develop` would rebuild it from scratch.
- `unresolvable` — the criterion has a `source:` that cannot be checked: not `<path>:<line>`, a path or line the prototype head does not have, or a revision other than the prototype head.
- `uncited` — the criterion has no `source:` at all.

Each outside, unresolvable and uncited criterion is named under the line, and outside / unresolvable ones draw a `LANE-SCOPE WARNING`. The verdict per criterion is written to `.specs/verify/<slug>.spec-candidate.scope.json` **in the main checkout** (not the production worktree) — Step 5.5 reads it. If the line reads `NOT CHECKED — the scope check failed (exit N)`, nothing was verified and there is no report. By default the check only warns; `ATELIER_PROMOTE_SCOPE_STRICT=1` makes it refuse before the elevate call (below).

Exit ladder:
- `0` — promotion complete. Surface the runner's terminal output verbatim, including the `lane scope:` line.
- `1` — operational failure or refusal. Nothing was promoted and the prototype state stays `open` in every case. Read which one it is from the runner's message:
  - state-not-open / branch collision / worktree collision / already-approved (Step 1).
  - **Empty delta** — the message says the prototype branch `has N commit(s) but no` … `changes relative to '<base>'` (the commits cancel out, or all of the lane's work is already in its base), or that it `has no commits` beyond its base. No model was called. Confirm with the `git diff <fork> prototype/<slug> --stat` line the runner prints; the operator either commits real work in `.worktrees/prototype-<slug>/` and re-runs, or `/drop-prototype <slug>`.
  - **Payload not built** — `could not build the extraction payload` with the reason above it (a git call failed, or the base / head does not resolve). No model was called. Retry once; if it repeats, surface the reason — do not work around it.
  - **Could not read / could not count** — the recorded base or the lane tip `could not be read`, the runner `could not check that` the lane descends from its base, or it `could not count the commits` on the lane. A git call failed or a commit is missing from this repository (shallow clone, pruned base). This is NOT a lane that left its base (`no longer descends`) and NOT an empty lane: surface the message and the fixes it lists, and never suggest `/drop-prototype` for it.
  - **The extractor declined** — `the Spec Extractor declined to write a spec for '<slug>' (candidate is \`ok: false\`)`, followed by its `blocked_reason:` and `suggestion:`. The prototype is too thin to specify. Nothing was elevated. Surface both lines verbatim; the fix is in the prototype worktree (`.worktrees/prototype-<slug>/`): act on the suggestion, commit, re-run `atelier prototype promote <slug>`. Do NOT retry unchanged, and do NOT hand-write a spec from the kept candidate (`.specs/verify/<slug>.spec-candidate.yaml`).
  - **Strict lane-scope refusal** — `lane-scope: REFUSED (strict) — <why>` then `ATELIER_PROMOTE_SCOPE_STRICT is on — refusing before elevate`. Fires only when the operator's environment sets `ATELIER_PROMOTE_SCOPE_STRICT` (1/true/yes/on; any other non-empty value warns and is treated as on) and: a criterion is outside or unresolvable, or no criterion is in the delta, or the check could not run. Nothing was elevated; the candidate and `<slug>.spec-candidate.scope.json` are kept. Read the report, list the outside and unresolvable criteria to the operator, then `AskUserQuestion`: **Re-run** (`atelier prototype promote <slug>` — the extractor is a model and a second pass may cite the lane's own lines) / **Proceed without strict** (re-run with `ATELIER_PROMOTE_SCOPE_STRICT=0` in that one Bash call, and prune the named criteria at Step 5.5) / **Stop**. Never unset strict on your own initiative — the operator turned it on.
- `2` — invalid args (bad slug shape).
- `3` — INFRA (extract or elevate dispatcher timeout / unavailable / malformed output, or a built-in provider whose required model env is unset — caught at pre-flight, before any LLM call).
- `4` — same family for extract + elevate on a project that has not declared single-model. With both roles on `/setup-models` providers this fires at pre-flight (dry-run included), before any LLM call.
  A project that HAS declared it (`ATELIER_MODEL_FAMILY_STAMP=single-family`) is accepted and
  the spec is stamped, so exit 4 means the pairing was unintended.

**Every run leaves a run record** (not the Step 3 dry-run): one record in the project's `.specs/.orchestra/events/promote-<slug>.jsonl`, opened when the runner finds the lane's state file and closed on every exit above with what happened (the one exception is a runner killed outright with SIGKILL, which cannot close anything: its record reads `active`, then `abandoned` after 24 h or at the slug's next promote) — `promoted` (awaiting Gate E), `refused`, `errored`, `timed_out` or `interrupted`, and the reason (`empty-delta`, `candidate-not-ok`, `lane-scope-refused`, `extract-timeout`, `commit-count-failed`, …). Every refusal carries a name of its own; a run that broke at no stop the runner names — an extract or elevate envelope it could not use, an unplanned death — reads `exit <N> during <stage>` (`exit 3 during elevate`), which says where, not why: the why is the runner's message. `atelier runs list --project . --lane promote` lists them; `atelier runs show --project . <run_id>` shows one. Nothing here needs it for the flow — the exit code and the runner's message decide the next step — but it is what `atelier monitor` and `atelier retro` see of this promote (as a run record: no analyzer yet judges a promote's outcome, so a refused or errored promote raises no finding), and where an earlier attempt's refusal can be read back. If the runner prints `WARNING — RUN RECORD NOT WRITTEN`, the promote itself is unaffected: surface the line and carry on; do not retry the promote for it. A promote stopped with Ctrl-C, SIGTERM or SIGHUP stops at once — the model pass in flight is ended with it, not left running — and closes its record as `interrupted`; so does one whose output reader goes away (`… | head`), which exits 141. The exception is a signal that arrives after the promotion has landed, when only the final report and the close hook remain: the record stays `promoted` and the exit is `0` — treat it as the exit-0 case.

On exit 3, retry once if the dispatcher might be transient (rate limit, API hiccup). If persistent, **do NOT push a manual fix onto the operator** — `AskUserQuestion`:

> The dispatcher keeps failing — usually auth expired, a model the account can't use, or a stale `ATELIER_SPEC_*_BIN` export overriding the recorded provider. Options:
> - **Diagnose + re-pick (Recommended)** — I'll run `atelier doctor`, fix what it names (e.g. `unset` a stale BIN export), re-run `atelier setup-models --apply` with a working model if needed, then retry `/promote`. ~10s.
> - **Inspect first** — I'll run `atelier doctor` and surface the dispatcher panel for triage; you decide next.
> - **Stop** — exit `/promote` here.

If "Diagnose + re-pick": run `atelier doctor --agent`, read `promote_dispatchers` (`source: bin` means an exported override is in effect) and `model_envs`, apply the named fix — re-running `atelier setup-models --apply --extract=<X> --extract-model=<MX> --elevate=<Y> --elevate-model=<MY>` inline when the model is the problem (current pair from `~/.atelier/models/models.env` or doctor) — then re-run `atelier prototype promote <slug>`.

On exit 4 (same family, single-model NOT declared), `AskUserQuestion`:

> Extract + elevate resolved to the same model family, and this project has not declared single-model. Options:
> - **Re-pick cross-family pair (Recommended)** — I'll run setup-models inline with a different pair (canonical T1: extract=Codex/openai, elevate=Gemini/google). This gives a genuine cross-vendor pass.
> - **Declare single-model** — I'll apply the same-family pair deliberately (e.g. `--extract claude --elevate claude`). `/promote` then accepts it and stamps the spec `single-family`. Use this when no second vendor is usable. The spec gets fresh eyes, NOT a cross-vendor pass, and is recorded as such.
> - **Stop** — exit `/promote`; you reconfigure manually.

If "Re-pick": run the inline setup-models workflow from Step 3 with the swapped pair (or whichever the operator picks via the detect/apply confirm), then retry `/promote`.

## Step 5 — Validate the elevated spec (HARD GATE)

```bash
atelier spec validate <slug>
```

**From here on, work in the production worktree.** The runner seeded and committed the elevated spec at `.worktrees/<slug>/.specs/features/<slug>.yaml` — the main checkout has no copy. Every `.specs/features/<slug>.yaml` path and every `atelier spec validate <slug>` in Steps 5–6 means that worktree: prefix your own Bash calls with `cd .worktrees/<slug> &&` (or use absolute paths), and read/edit the spec there.

This runs the framework's spec-completeness gate: existing-context resolution, ui_contract reconciliation against design PNG (if any), scope classifier, hub-coverage validation. If validation fails:
- Exit 1 (FAIL) — fix the elevated spec via standard editing, OR re-run promote (the slug is already promoted; you'd need to `/drop-prototype <slug>` first and re-prototype — heavy).
- Exit 2 (INFRA) — retry once Codex recovers.

## Step 5.5 — Goals & non-goals review pane (W8.4.13a — MANDATORY)

Per `ATELIER_PLAN.md § W8.4.13` + ADR-W8.4.13-1, this step is the **mandatory drift-defense** point before Gate E. The Elevator (Step 4) was explicitly forbidden from authoring `non_goals[]`; operator authors them here. Per-AC `user_story:` is also confirmed/edited here.

**Inputs to surface to the operator:**

1. **Intake intent** (if captured at /prototype — load via `atelier prototype show-intent <slug>` if added, OR read directly from `.specs/prototype/<slug>.intent.yaml`):
   - `intent.goal` (verbatim)
   - `intent.non_goals` (verbatim list)

2. **Elevated spec proposal** (read `.worktrees/<slug>/.specs/features/<slug>.yaml` — the production worktree's copy, the only one):
   - `goal:` (paragraph from Extractor, may have been informed by intake intent)
   - `acceptance_criteria[]` with `id`, `given`/`when`/`then`, and existing `user_story:` (if Elevator populated — should be present once W8.4.13 is fully wired)
   - `non_goals:` (should be empty `[]` post-Elevator)
   - `prototype_gaps:` (from Extractor — observed omissions; useful when intake skipped)

3. **Lane-scope report** — read `.specs/verify/<slug>.spec-candidate.scope.json` from the **main checkout** (the runner's summary prints the path beside `lane scope:`; it is NOT in the production worktree). It carries the counts (`criteria`, `in_delta`, `outside_delta`, `unresolvable`, `uncited`) and one `rows[]` entry per criterion: `id`, `source`, `verdict`, and the `path` / `line` the cite resolved to.

**Lane-scope review comes first, and BEFORE Gate E.** If the report has any row whose `verdict` is `outside_delta` or `unresolvable`:

- List every such criterion to the operator: its `id`, its `then`, its `source`, and which of the two it is. Say what each means — `outside_delta`: it cites code that pre-dates the lane, so it specifies the application the lane was built on and `/develop` would rebuild that from scratch; `unresolvable`: its cite cannot be checked, so nothing says whether the lane added it.
- `AskUserQuestion` **for each one**: **DELETE** (the lane did not add this — the usual answer for `outside_delta`) / **KEEP** (the operator vouches for it; for `unresolvable`, fix `source:` to a `<path>:<line>` the lane added) / **EDIT**.
- Apply the answers to `.worktrees/<slug>/.specs/features/<slug>.yaml`. The report is about the extractor's CANDIDATE; the elevator may have reworded a criterion, so match by `id`, and by `source:` when ids moved.
- Also tell the operator how many criteria are `uncited` and name them — no decision is required for these, but nothing was checked about them.
- **Then read the elevated spec's `scope_flags:`** (production worktree copy). The Elevator is handed the lane's delta and this same report, and is told to *flag, not elaborate*: every candidate criterion it would not build on is listed there with `id`, `verdict` (`outside_delta` / `unresolvable` / `uncited`, or `elevator_judgement` when the report said `in_delta` but the diff shows the behaviour pre-dates the lane — typically a cite into a page the lane's build re-stamped), `source` and a one-sentence `reason`. Any `elevator_judgement` or `uncited` entry the report did not already put in front of the operator gets the same DELETE / KEEP / EDIT question. Every ADDED criterion carries `extends:` (the candidate criterion it hardens) and `source:` (the lane-added line it attaches to): when the operator DELETEs a criterion, delete the added criteria that `extends:` it too; and an added criterion whose `extends:` names a flagged criterion, or that has no `extends:`, is itself off-scope — list it and ask. If the runner printed `the elevator runs WITHOUT lane context`, the added criteria have no `source:`: check each against the prototype's diff with the operator.
- **A deletion is three edits, not one.** Nothing validates these ids against each other, so when the operator DELETEs a criterion: (1) delete the criterion; (2) remove its `scope_flags` entry (an entry naming a criterion that no longer exists is a dangling id in the sealed spec); (3) delete every added criterion whose `extends:` names it — or, if the operator wants to keep one, re-point its `extends:` at a surviving criterion and say so. When an added criterion is deleted on its own, also drop it from `addressed_gaps` if that list quotes it. After the edits, check that no `scope_flags[].id` and no `extends:` is dangling before going on.

If the summary said `lane scope:   NOT CHECKED`, there is no report: say so, and check each criterion's `source:` against the prototype's diff by hand with the operator before going on. If every row is `in_delta`, say that in one line and move on. **Do NOT proceed to Step 6 with an `outside_delta` or `unresolvable` criterion the operator has not ruled on.**

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

**Apply operator choices** by editing `.worktrees/<slug>/.specs/features/<slug>.yaml` directly:
- Set `goal:` per operator's KEEP/REPLACE/EDIT decision
- Set `non_goals: [...]` to the operator-authored list
- For each AC, set `user_story:` per operator confirmation/edit

**Re-validate after edits** (in the production worktree, as in Step 5):

```bash
atelier spec validate <slug>
```

If validation fails (e.g., bidirectional AC↔story coverage rule once W8.4.13b lands), fix and re-run. **Do NOT proceed to Step 6 carrying validate-spec FAILs.**

This step is the only path from intake intent → sealed `non_goals[]`. The operator's hand on each item is the firewall against the rejected LLM round-trip ([GL-1] rejection + Codex constraint 2).

## Step 6 — User review via AskUserQuestion

Read `.worktrees/<slug>/.specs/features/<slug>.yaml` (the production worktree's copy — now with operator-authored `non_goals[]` + confirmed `user_story:` per AC from Step 5.5) and present a summary to the user. Ask: "Approve / Revise / Reject."

- Approve → sign Gate E **from the production worktree**, where the spec lives: `cd .worktrees/<slug> && bash "$(atelier path --hook approve-spec.sh)" <slug>` (the HMAC anchor; subsequent flow is UC2). The promote-record stays in the main checkout's `.specs/verify/`; approve-spec looks there too — do NOT copy it into the worktree, and do NOT set `PROTOTYPE_LANE_LOCK_HELD`. A refusal names both places it looked.
- Revise → user dictates edits; apply directly to `.worktrees/<slug>/.specs/features/<slug>.yaml`; loop back to Step 5 (and Step 5.5 if goals/non_goals/user_story change).
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

  spec:        .worktrees/<slug>/.specs/features/<slug>.yaml
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
- **If extract + elevate are wired but exit 4 fires repeatedly**, the operator may have both bins resolving to the same family (e.g. both Codex). Inspect dispatcher envelopes at `.specs/verify/<slug>.spec-{candidate,elevated}.family` for forensic value (present only for a custom `ATELIER_SPEC_*_BIN` path; built-in providers are refused at pre-flight, before any envelope is written).
