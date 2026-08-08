---
disable-model-invocation: true
---

# `/_atelier-probe` — `disable-model-invocation` sentinel (fallback)

This is an Atelier framework **fallback sentinel probe**, not an operator workflow. The W9.7.d-ii ship (2026-05-19) flipped `disable-model-invocation: true` onto the 17 side-effectful slash commands AFTER an empirical-probe verdict confirmed the field behaves correctly on the maintainer's empirically-probed Claude Code version (2.1.144 as of 2026-05-19; the framework's `known_good` range extends as new operators report results — see § 3.1 in `docs/atelier/ATELIER_SLASH_COMMANDS.md`). This file remains shipped as the manual fallback for two scenarios:

1. **Operator on a `known_bad` Claude Code version.** `atelier doctor`'s `claude_code_version_compat` axis surfaces the bucket; running this probe verbatim is the manual fallback if `atelier doctor --probe-skill-invocation` (the automated path) is not available.
2. **Automated empirical probe unavailable.** `atelier doctor --probe-skill-invocation` (W9.7.e Phase 2) is the **primary path** — it sets up an isolated probe dir, runs three `claude -p` calls, parses output, and emits a `status` enum (`all_pass` / `ambiguous` / `fail`). The manual procedure below is what to do when the automated path can't run (e.g., `claude` not on PATH, scripting context, sceptical operator wanting eyes-on verification).

Per ADR-W9.7-6 (ATELIER_PLAN.md § W9.7), `disable-model-invocation: true` has historically had upstream defects. Open as of W9.7.e ship: `#50075` (skills/commands hidden from agent), `#51007` (subagent preload broken), `#59363` (Skill tool fails after slash command loads skill). Closed but informative: `#58265` (model auto-invokes commands/ same as skills/ — closed `not_planned` 2026-05-13), `#43875` (skill hidden from session entirely — closed as duplicate 2026-04-09), `#43809` (subagent can't reach skill even with explicit reference — closed `not_planned` 2026-05-15). A re-occurrence of any closed-issue failure mode on a new Claude Code version is a fresh regression worth filing against the open `#50075` thread.

> **Prefer the automated probe.** Run `atelier doctor --probe-skill-invocation` instead of this manual procedure unless you have reason to verify by hand. The automated path costs ~$0.05 (haiku × 3 calls) and returns a structured verdict that `atelier doctor` consumes.

## How to run

1. Make sure this file is at `<project>/.claude/commands/_atelier-probe.md`. `atelier init` installs it automatically; if you copied the framework manually, copy `atelier/prompts/slash-commands/_atelier-probe.md` to that path.
2. Open a fresh Claude Code session in this project.
3. Run `atelier doctor` first. The `claude_code_version_compat` axis should report your version's bucket. If it says `known_bad`, this probe is the deciding evidence for whether the bucket is wrong about YOUR specific version, OR right.
4. **First, type `/` and look at the completion menu.** `_atelier-probe` must appear in the listing. **If it doesn't, that absence IS a B3-style failure — STOP.** Do not flip the frontmatter; W9.7.d-ii ship is gated on a Claude Code version where the probe is at least addressable. You won't be able to invoke it to test B1/B2 anyway.
5. Type `/_atelier-probe` and submit. **Do not** prefix with anything; we are deliberately testing user-typed slash invocation.
6. Observe the three behaviors below and report results back to whoever is running W9.7.d-ii.

## What to observe

**B1 — Slash invocation works (user-typed).** When you type `/_atelier-probe` and submit, this command body must load and the model must respond. If you see `Unknown command` or the slash never resolves, behavior B1 has **failed**. This is the failure mode `#50075` (open) describes — *"Skills/commands with `disable-model-invocation: true` are hidden from agent, blocking user-initiated slash invocation."*

**B2 — Auto-load suppression works.** Open a fresh session, then ask the model (without typing `/`) "could you run the probe command?" The model should NOT autonomously invoke `/_atelier-probe` via its Skill tool. If it does — and reports back as if it had executed this body — behavior B2 has **failed**: `disable-model-invocation: true` is being ignored. This was the failure mode `#58265` described (closed `not_planned` 2026-05-13); a re-occurrence is a new regression worth filing.

**B3 — Skill remains visible.** This was already partially checked in step 4 — `_atelier-probe` must appear in the slash-completion menu. If it disappears after step 5 (e.g., menu showed it but invocation hides it from subsequent listings), behavior B3 has **failed**. This is the failure mode `#43875` described (closed as duplicate 2026-04-09); the still-open `#50075` covers the same hidden-from-agent surface — re-occurrence is worth filing against that thread.

(Note: there is no `claude --list-skills` CLI flag — confirmed against `claude --help` at W9.7.d-i ship. The slash-completion menu is the only operator-side listing surface. `--disable-slash-commands` exists as a CLI option but disables ALL skills, so it isn't useful for this probe.)

## Reporting

If all three behaviors pass on your Claude Code version, W9.7.d-ii can flip the 17-command frontmatter set on your behalf. Update the framework's `atelier/config/claude-code-compat.yaml` `known_good:` list with your exact `claude --version` output.

If any behavior fails, file the result against the open W9.7.d-ii decision: either (a) wait for upstream fix, (b) restrict frontmatter to fewer commands where the failure mode is acceptable, or (c) ship without the frontmatter and rely on operator self-discipline. Surface the finding via `atelier doctor` — the compat axis will help the next operator who shares your Claude Code version.

## Why this body is not empty

A non-empty body lets you visually confirm the file actually loaded when you invoke it (B1). Empty bodies leave ambiguity between "slash invocation worked but body was empty" and "slash invocation silently failed." This body is the positive signal.
