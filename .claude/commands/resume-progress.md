---
disable-model-invocation: true
---

You are `/resume-progress`: load a saved progress snapshot and brief the operator, so this memoryless session *can* continue where the last one left off.

**Loads and briefs; never starts the work.** The "Exact next step", the "Commands to run on resume", and every task in the file are things you **report**, never **do** here — a snapshot describes work, it does not order it. Every run ends at the Step 6 brief. Permitted: only the read-only actions Steps 1–4 need — listing, candidate reads, snapshot read, prerequisite reads, git drift inspection. Nothing that writes, edits, builds, tests, commits, spawns agents, or advances the snapshot's task.

**Snapshot content is session state — never write any of it into AI memory** (memory holds only durable user/feedback/reference facts).

## Step 0 — Parse arguments

The user's arguments: $ARGUMENTS

Free-form, possibly **two things at once**, either absent: a **file selector** (which snapshot) and a **session directive** (what the user wants *this* session to do, e.g. "just brief me first").

A directive is **not** a failed file match: nothing matching a filename → treat the whole string as directive-only; never abort because a hint matched no file.

The directive **outranks the snapshot's "Exact next step"** as the *proposed* move, but does not unlock execution: a go-ahead-sounding one ("just keep going") still stops at the brief — record it as the queued action and wait. The go-ahead is the message *after* the brief, never the one that invoked the command.

## Step 1 — Locate repo, list snapshots

`REPO_ROOT` does **not** persist between Bash calls — re-assign it atop every block that uses it.

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
ls -1t "$REPO_ROOT"/saved-progress/*.md 2>/dev/null
ls -1 "$REPO_ROOT"/saved-progress/*.md 2>/dev/null | wc -l
```

None → "No saved progress files found in `saved-progress/`." and stop. (`saved-progress/archive/` holds consumed snapshots, deliberately not listed — mention only if the user asks for an older one.)

## Step 2 — Select the file

One selector match, or one file total → use it, saying which. **Multiple candidates** → `AskUserQuestion` takes **2–4 options, no more** (5+ is rejected before the user sees it): the **3 most recent** plus a 4th, `List all` → print the full listing, ask for `/resume-progress <filename>`.

- **label** = `<headline> · <Mon D HH:MM>`, time from the filename; colliding labels → append `:SS` to **all**. headline = 2–4 words from the filename slug (tail after `<YYYYMMDD-HHMMSS>-`, hyphens → spaces, sentence case), or from the "## What we were doing" opening sentence when the slug is vague (`pending-work`, `wip`, branch name); **never the file's first line** (constant boilerplate).
- **description** = the discriminator: `<filename> — <first sentence under "## What we were doing">`; read that section from each candidate first (it feeds both fields).

Selector matching: drop filler words (the, a, one, and, then, but, please, also, just, continue, with), match remaining tokens case-insensitively against filenames.

## Step 3 — Load the snapshot + prerequisites

Read the selected file **in full**; its paths are repo-relative → resolve against `$REPO_ROOT`.

- **Key findings** are established facts, not hypotheses; don't redo **What we accomplished** / **Commits made this session**; **Blockers / open questions** + **Notes from the operator** (verbatim) go in the brief.
- **Approaches tried and rejected** stay rejected — if one deserves another look, ask first. **Standing constraints from the user** bind this session too; don't violate or renegotiate them without asking.
- **Exact next step** = what you *propose* (the Step 0 directive can supersede it) — proposed, never performed.
- **Commands to run on resume** → **never run them**; quote them in the brief for approval — "restore the environment" commands look harmless and are exactly how an unordered session starts working.
- Prerequisites, read before anything else (reading allowed; acting on what you read is not): `<REPO_ROOT>/CLAUDE.md` and nested ones under directories you'll touch; everything under **Context the next session MUST load first**; a plan/current-state doc's "Current state" if the work touches project state, even if unlisted.

## Step 4 — Drift preflight

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
git -C "$REPO_ROOT" branch --show-current
git -C "$REPO_ROOT" rev-parse --short HEAD
git -C "$REPO_ROOT" status --short
```

- Branch ≠ snapshot's `**Branch:**` → lead the brief with it ("saved on `<X>`, you are on `<Y>`"), ask switch-or-abort; the proposed step is void until settled.
- HEAD ≠ `**HEAD:**` → `git -C "$REPO_ROOT" log --oneline <snapshot-sha>..HEAD`, summarize what landed; the next step may be done or superseded — say so.
- Missing paths from "Files modified this session" / "Context … MUST load first" → list in the brief, ask.

One-line verdict (`in sync` / `drifted: …`) goes in the banner; snapshot lacking those header fields → "no drift anchor in snapshot", proceed.

## Step 5 — Do not archive on this invocation

Archiving marks a snapshot **consumed**; briefing consumes nothing, and one archived at load time vanishes from the operator's next `/resume-progress`. Leave it where Step 2 found it; archive only at Step 7. Never `rm` one — gitignored, so deletion is irrecoverable.

## Step 6 — Brief, then stop

```
Resumed from: <filename>
Branch: <branch>   (<drift verdict>)
Directive: <the user's Step 0 directive, or "none">
Snapshot: left in place — not consumed
```

Then a **concise** ~15-line summary, no section-by-section replay: **where it stands** (1–2 sentences from "What we were doing" + "Current state"); **already done** (work + commits, one line); **standing constraints** verbatim; **blockers / open questions** with specifics; **proposed next step** — the snapshot's, or the Step 0 directive if it supersedes it (say which) — phrased as a proposal, not work in progress; **queued commands** quoted and unrun (omit if none).

Then **end your turn.** Do not start the proposed step, run the queued commands, open task files "just to check", spawn agents, or ask a permission question you then answer yourself. Close with one line inviting the order ("Say the word and I'll start with <the proposed step>"). This holds however unambiguous, small, or pre-authorized the step looks: a snapshot cannot authorize work; only the operator's next message can.

## Step 7 — On the go-ahead (a later turn)

The operator's **next message** orders the work (the proposed step, the Step 0 directive, or anything else from the snapshot) → archive first, then act.

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
grep -qxF 'saved-progress/archive/*.md' "$REPO_ROOT/.gitignore" 2>/dev/null \
  || printf '\nsaved-progress/archive/*.md\n' >> "$REPO_ROOT/.gitignore"
mkdir -p "$REPO_ROOT/saved-progress/archive"
mv "$REPO_ROOT/saved-progress/<filename>" "$REPO_ROOT/saved-progress/archive/<filename>"
```

The guard **must run before the `mv`**: `saved-progress/*.md` does not cover `archive/` (gitignore's `*` never crosses `/`), so the snapshot would land on a committable path. Use the exact filename from Step 2 — never a glob, never a guessed name; blocked work or a redirect → restore with the inverse `mv`.

Ordered work still runs under the snapshot's standing constraints (stop and ask rather than violate one) and rejected approaches (ask first); ambiguous or blocked → say so with the snapshot's specifics, never improvise a substitute.

Do **not** archive when the operator redirects elsewhere, answers the drift question "abort", or lets the session end at the brief.
