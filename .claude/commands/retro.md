---
disable-model-invocation: true
---

## Atelier port note

**Implementation notes:**

- **Terminal-only digest** — W7.5 made `/retro` strictly terminal-output;
  no on-disk dated `*.md` digests, no "Resolved since last retro" diffing.
  The on-disk draft is ephemeral and deleted in step 6.
- **Destination redirect** — AI-saved project-type dev observations route
  to `<project>/.atelier/retro/{lessons,notes-for-operator}.md` instead
  of new `project_*.md` memory files. CLAUDE.md auto-memory section
  documents the rule.
- **Close-event hooks** — five hooks at
  `atelier/hooks/retro-after-{spec-close,cluster-merge,hotfix,promote,
  drop-prototype}.sh` emit timely "consider /retro" prompts to stderr;
  they are NOT gates and do not enforce — they surface close events.

Per ATELIER_PLAN.md § W7.5 + `feedback_retro_terminal_first.md`.

---

You are the retro command. Generate evidence via script, hand it to a Sonnet subagent that classifies findings, then have the main session bias-check + reconcile inline into a unified digest, then print to the terminal. The digest exists on disk only as an ephemeral draft (cleaned up in Step 6); terminal output is the only durable artifact.

The user's arguments: $ARGUMENTS

Run after every pipeline command (`/develop` cluster, `/hotfix`, `/regression`, soak, `/product`) to surface bugs in the project AND friction in the pipeline framework itself.

| Role | Tool | On failure |
|---|---|---|
| Window + paths | `retro_resolve.py` (via `atelier path --script`) | Report stderr, stop. |
| Evidence collection | `retro_evidence.py` (via `atelier path --script`) | Report stderr, stop. |
| Classification + draft | Sonnet subagent (`Agent` tool, `model: sonnet`) — brief at `atelier/prompts/retro-scan.md` | Dispatch error → report, stop. |
| Bias check + reconcile | Main session (this AI) — reads draft, applies bias lens, amends in place | n/a (no dispatch). |

> **Reference pointers:**
> - `atelier/prompts/retro-scan.md` — Sonnet brief (draft mode).
> - `retro_resolve.py`, `retro_evidence.py` (resolved via `atelier path --script`) — deterministic, no AI.
> - `atelier plan register-bug --help` + the bug-intake rules in `/bug` — govern out-of-scope-finding proposals.

---

## Step 1: Resolve the window

```bash
mkdir -p .specs/.orchestra/retros
python3 "$(atelier path --script retro_resolve.py)" "$ARGUMENTS"
```

The script prints the envelope JSON to stdout (Bash tool output captures it for parsing). Exit 2 with a stderr diagnostic on invalid `last=` / `since=` tokens — surface the error verbatim and stop.

Envelope fields:

| Field | Use |
|---|---|
| `window_start` / `window_end` | `--since` for evidence script (Step 3) |
| `target_spec` | `--target-spec` when non-null (Step 3) |
| `repo_context` | `project` or `framework` (Steps 4–5) |
| `force_codex` | `on` / `off` / `auto` — drives Step 5 |
| `codex_scope` | `pipeline-only` (default) / `full` — Step 5.2 inputs |
| `evidence_path` / `codex_evidence_path` / `digest_path` / `codex_inputs_path` / `codex_output_path` / `notes_tmp_path` | reuse — do not recompute |

Argument grammar (combinable, any order): `since-last` (default), `last=<N>m\|h\|d`, `since=<ISO>`, `<spec-id>`/`<slug>`, `+codex` / `-codex`, `+codex-full` (full-scope bias-check; implies `+codex`).

## Step 2: In-session friction notes

Artifact-side signals (BLOCKED, hook retries, scenario re-fails, phase regressions, durations, repeat commits) are in the evidence JSON — do NOT duplicate. Distill only what the main session uniquely saw.

| Dimension | What to surface |
|---|---|
| **stuck** | Where you got blocked + what unblocked you (external + self-blocks). |
| **looped** | Repeated work — re-read the same file ≥3×, ran a failing command ≥2×, redid work after context loss, dispatched a useless subagent. State the count. |
| **slow** | Steps unusually long for what they accomplished. |
| **wasteful** | Tokens for no payoff — oversized reads, repeat tool calls, narrative the user didn't need. |
| **rationalized skips** | Steps you considered skipping or relaxed. Quote the rationalization verbatim. |

≤ 12 bullets, ≤ 250 words. Tag each `[dim]`. No relevant moments → `IN_SESSION_NOTES: none`.

## Step 3: Generate the evidence bundle

```bash
python3 "$(atelier path --script retro_evidence.py)" \
  --since "<window_start>" \
  ${TARGET_SPEC:+--target-spec "<target_spec>"} \
  --out "<evidence_path>" \
  --lite-out "<codex_evidence_path>"
```

The lite view preserves every cited array verbatim and replaces backing-data array bodies with count placeholders. Sonnet sees the full view; Codex sees the lite view.

Script exits non-zero → print stderr verbatim and stop.

## Step 4: Dispatch the Sonnet subagent (draft)

### 4.1 Empty-window short-circuit

Before dispatching, inspect the evidence bundle. If ALL of:
- every `stats.*` counter is 0
- every detail array (`scenario_re_fails`, `marker_resigns`, `top_slow`) is empty
- `IN_SESSION_NOTES == "none"`

…then skip both Sonnet (this step) AND the bias-check (Step 5). Print one line: `Retro: no findings in window <window_start>..<window_end>.` Touch `.specs/.orchestra/retros/.last-retro` to advance the cursor and `rm -f` the temp files (`<evidence_path>` `<codex_evidence_path>` `<notes_tmp_path>`). End the turn.

This guard avoids dispatching a Sonnet subagent on a do-nothing window — wasted ~10s of subagent latency for an empty result. (Rationale parallels Step 5.1 below — same condition, hoisted up so an empty window short-circuits *both* LLM dispatches.)

### 4.2 Sonnet dispatch

Invoke via `Agent` tool, foreground: `subagent_type: general-purpose`, `model: sonnet`, `description: "Retro classify and digest"`, prompt:

```
Retro-scanner subagent. Follow `atelier/prompts/retro-scan.md` for the protocol. Inputs:

EVIDENCE_PATH: <evidence_path>
REPO_CONTEXT: <repo_context>
DIGEST_PATH: <digest_path>
IN_SESSION_NOTES:
<bullets from Step 2 or "none">

Read EVIDENCE_PATH first. Write the digest to DIGEST_PATH — this is an EPHEMERAL draft (the main session deletes it in Step 6 after printing). A reconcile pass may overwrite it. Do NOT touch `.last-retro` (the main session does that). Return the digest content as your final message; append `_codex_review_recommended: true` on a separate trailing line (NOT inside the digest body) if ≥5 findings or any classification is uncertain. Do not print or narrate.
```

Non-digest returns (all trigger **stop-branch cleanup** — see below):
- `HALT: suspected P0/P1 — <summary>` → print verbatim, stop, tell user to investigate via `/hotfix`.
- `ERROR: …` → print verbatim, stop.
- Dispatch itself fails (tool error) → print `Retro skipped: subagent dispatch failed (<reason>). Run /retro again.` and stop.

## Step 5: Main-session bias-check + reconcile

Main session reads the Sonnet draft and applies a bias lens directly — no second LLM dispatch. The main session has unique context (it ran the work being retro'd), which is *more* qualified than a fresh Codex/subagent reading evidence_path with no session memory. Synchronous. Nothing prints until Step 6.

### 5.1 Disposition

First match wins:

| Decision | Condition |
|---|---|
| **skip (force off)** | `force_codex == "off"` (legacy flag name; controls bias-check broadly) |
| **skip (no trigger)** | None of: `force_codex == "on"`, Sonnet appended `_codex_review_recommended: true`, `repo_context == "framework"` AND ≥3 Pipeline findings |
| **run** | trigger matched |

(The empty-window case is handled at Step 4.1 above — by the time control reaches Step 5, the window is non-empty.)

Skip → append `Bias check: skipped (<reason>)` footer to `digest_path` (omit footer for "no trigger" — silent default). Go to Step 6.

### 5.2 Apply the bias lens

Read `<digest_path>` and `<evidence_path>`. Cross-reference against your in-session memory and the Step 2 notes. Apply these checks:

- **Severity calibration.** Is any P0/P1 hidden as P2 (outage-class wrapped as "friction")? Is any P3 promoted to P1 unnecessarily? `register-bug` mechanically refuses P0/P1; if you see one, the digest must call out `/hotfix` instead.
- **Classification accuracy.** Project bug vs pipeline friction vs out-of-scope. Did Sonnet route a project bug into "Pipeline issues" or vice versa? When `repo_context == "framework"`, the boundary is the OPPOSITE of the project case — pipeline issues are the primary axis, not the secondary.
- **In-session blind spots.** Are there findings the IN_SESSION_NOTES captured but the artifact-side classifier missed (e.g., a "[wasteful]" note about narration the user saw but stats can't measure)? The main session uniquely knows these.
- **`register-bug` proposals.** Any false positives to drop (Sonnet hallucinated a bug not actually observed)? Any legitimate findings missing a register-bug proposal that should have one?
- **Severity flag re-bind.** If you flip a finding's classification (project↔pipeline) or severity, ensure any `register-bug` proposal in that section is consistent.

### 5.3 Apply amendments

| Outcome | Action |
|---|---|
| Draft is accurate (no amendments needed) | Append `_bias_check: concur` footer to `<digest_path>`. Go to Step 6. |
| Amendments needed | Edit `<digest_path>` in place to apply the changes inline (severity flip, classification move, add/drop register-bug, add a missed finding). Append `_bias_check: amended` footer. Go to Step 6. |
| Fundamental flaw (Sonnet hallucinated a finding not in evidence; window is wrong; classifier inverted project/framework axis) | **STOP** (stop-branch cleanup applies). Tell user: `Retro draft has fundamental issues: <summary>. Read draft at <digest_path>. Re-run /retro after addressing.` Skip Step 6. |

The amendment is an in-place edit of the draft markdown — same shape as how Step 5.4 used to work, just done by the main session in this turn rather than by a second subagent dispatch.

### Stop-branch cleanup

Every stop branch above ends without reaching Step 6's cleanup. Run `rm -f` against the temps that won't be referenced in the user-facing message — preserve only what the user is told to read:

| Stop point | rm | preserve |
|---|---|---|
| Step 4 HALT / ERROR / dispatch-fail | `<evidence_path>` `<codex_evidence_path>` `<notes_tmp_path>` | (nothing — no draft yet) |
| Step 5.3 fundamental-flaw | `<evidence_path>` `<codex_evidence_path>` `<notes_tmp_path>` | `<digest_path>` |

`rm -f` doesn't error on missing files, so it's safe to run unconditionally on each branch.

## Step 6: Print the digest, then delete it

**The terminal print is the only durable output of /retro.** A path-only summary ("digest written to …") is the documented failure mode (`MEMORY.md` § "/retro output is terminal-only"). Run this exact block — `cat → touch` chained with `&&` so a print failure does NOT advance `.last-retro` past an unprinted window; `rm -f` runs unconditionally so temp files don't leak when `cat` fails:

```bash
cat "<digest_path>" \
  && touch .specs/.orchestra/retros/.last-retro
rm -f "<digest_path>" "<evidence_path>" "<codex_evidence_path>" "<notes_tmp_path>"
```

The `cat` output IS the digest the user reads. After the block runs, **end the turn** — no follow-up summary, paraphrase, or re-narration. The digest is already on screen; an extra message doubles the print and dilutes signal. The only legitimate trailing message is any `register-bug` invocation the digest itself contains.

Skipping the `cat` (ending the turn after Step 5 returns) is the failure mode this section exists to catch — the digest never reaches the user. Run the block.

## Step 7 (only if asked): wire it up

If the user asks for /retro to run automatically, propose a Stop hook via the `update-config` skill that invokes `/retro since-last`. Do not write `settings.json` from /retro.

## Anti-patterns

- **No AI scanning of raw artifacts.** The script reads `.specs/.orchestra/agents/*.yaml`, regression runs, verify markers, git log. The subagent only reads `EVIDENCE_PATH`.
- **No persistent digest.** The draft at `digest_path` is ephemeral and is deleted in Step 6. Terminal print is the only durable output. Do not propose changes that re-introduce a dated `.md` digest.
- **One ephemeral draft, one final print.** No preliminary print, no sidecar Codex section, no two-state digest. Reconcile failure stops the run, never appends.
- **No auto-retry.** Failures report once and stop. Retries inside /retro mask flakiness the next /retro should surface.
- **No editing rules / hooks / scripts / command files / `settings.json`.** Findings are proposals; the user lands changes via `/product`, manual edit, or `update-config`.
