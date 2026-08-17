---
disable-model-invocation: true
---

You are `/resume-progress`: load a saved progress snapshot and brief the operator, so this memoryless session *can* continue where the last one left off.

**Loads and briefs; never starts the work.** The "Exact next step", the "Commands to run on resume", and every task in the file are things you **report**, never **do** here — a snapshot describes work, it does not order it. Every run ends at the Step 6 brief. Permitted: only the read-only actions Steps 1–4 need — listing, candidate reads, snapshot read, anchored-pointer reads, git drift inspection. Nothing that writes, edits, builds, tests, commits, spawns agents, or advances the snapshot's task.

**Snapshot content is session state — never write any of it into AI memory** (memory holds only durable user/feedback/reference facts).

## Step 0 — Parse arguments

The user's arguments: $ARGUMENTS

Free-form, possibly **two things at once**, either absent: a **file selector** (which snapshot) and a **session directive** (what the user wants *this* session to do, e.g. "just brief me first").

A directive is **not** a failed file match: nothing matching a filename → treat the whole string as directive-only; never abort because a hint matched no file.

The directive **outranks the snapshot's "Exact next step"** as the *proposed* move, but does not unlock execution: a go-ahead-sounding one ("just keep going") still stops at the brief — record it as the queued action and wait. The go-ahead is the message *after* the brief, never the one that invoked the command.

## Step 1 — Locate repo, list snapshots, collect repo state — one Bash call

One block: the listing and the repo state are independent of each other and of the snapshot, and every extra Bash call replays the whole conversation. `REPO_ROOT` does **not** persist between Bash calls — re-derive it in any later block.

```bash
# Main repo root — correct from a subdirectory AND from a linked worktree.
# Snapshots always live in the main root, never inside a worktree.
GD="$(cd "$(git rev-parse --git-dir)" && pwd)"
GCD="$(cd "$(git rev-parse --git-common-dir)" && pwd)"
if [ "$GD" = "$GCD" ]; then REPO_ROOT="$(git rev-parse --show-toplevel)"
else REPO_ROOT="$(cd "$GCD/.." && pwd)"; fi

BRANCH="$(git branch --show-current)"          # prints nothing on detached HEAD
[ -n "$BRANCH" ] || BRANCH="detached@$(git rev-parse --short HEAD)"

echo "REPO_ROOT=$REPO_ROOT"
echo "BRANCH=$BRANCH"
echo "HEAD=$(git rev-parse --short HEAD)"
git status --short
ls -1t "$REPO_ROOT"/saved-progress/*.md 2>/dev/null
ls -1 "$REPO_ROOT"/saved-progress/*.md 2>/dev/null | wc -l
ls -1 "$REPO_ROOT"/saved-progress/archive/*.md 2>/dev/null | wc -l
```

No snapshots → "No saved progress files found in `saved-progress/`." and stop. (`saved-progress/archive/` holds consumed snapshots and is deliberately not listed — its count is collected only for the Step 7 hygiene note; name an archived file only if the user asks for an older one.)

## Step 2 — Select the file

One selector match, or one file total → use it, saying which. **Multiple candidates** → `AskUserQuestion` takes **2–4 options, no more** (5+ is rejected before the user sees it): the **3 most recent** plus a 4th, `List all` → print the full listing, ask for `/resume-progress <filename>`.

- **label** = `<headline> · <Mon D HH:MM>`, time from the filename; colliding labels → append `:SS` to **all**. headline = 2–4 words from the filename slug (tail after `<YYYYMMDD-HHMMSS>-`, hyphens → spaces, sentence case), or from the "## What we were doing" opening sentence when the slug is vague (`pending-work`, `wip`, branch name); **never the file's first line** (constant boilerplate).
- **description** = the discriminator: `<filename> — <first sentence under "## What we were doing">`; read that section from each candidate first (it feeds both fields).

Selector matching: drop filler words (the, a, one, and, then, but, please, also, just, continue, with), match remaining tokens case-insensitively against filenames.

## Step 3 — Load the snapshot, and *only* the snapshot

Read the selected file **in full**; its paths are repo-relative → resolve against `$REPO_ROOT`.

- **Key findings** are established facts, not hypotheses; don't redo **What we accomplished** / **Commits made this session**; **Blockers / open questions** + **Notes from the operator** (verbatim) go in the brief.
- **Approaches tried and rejected** stay rejected — if one deserves another look, ask first. **Standing constraints from the user** bind this session too; don't violate or renegotiate them without asking.
- **Exact next step** = what you *propose* (the Step 0 directive can supersede it) — proposed, never performed.
- **Commands to run on resume** → **never run them**; quote them in the brief for approval — "restore the environment" commands look harmless and are exactly how an unordered session starts working.

**Read nothing else yet.** The brief needs the snapshot plus the Step 1 repo state and nothing more. This run ends at Step 6 without starting work, so prerequisites loaded now are usually paid for and thrown away — a mature plan doc's "Current state" alone can run to ~63k tokens. They load at **Step 7**, on the go-ahead, when they are about to be used.

Two exceptions, both cheap, both allowed now:

- Any **line-anchored** pointer under "Context the next session MUST load first" (`path:11-30`) — read those ranges; the drift narrative may need them to tell the operator their next step was already superseded. An *unanchored* pointer to a whole file waits for Step 7.
- `CLAUDE.md` **only if it is not already in your context** — the harness injects it automatically when one exists at the repo root, and re-reading it duplicates it verbatim for nothing. Absent from context (a downstream project may have none) → read it now.

## Step 4 — Drift preflight

Compare the Step 1 state against the snapshot's headers. No new Bash call unless HEAD moved.

- `**Repo:**` ≠ `$REPO_ROOT` → you are in a **different clone or worktree** than the one saved. Lead with it and ask before anything else; branch and HEAD comparisons mean nothing across roots.
- Branch ≠ `**Branch:**` → lead the brief with it ("saved on `<X>`, you are on `<Y>`"), ask switch-or-abort; the proposed step is void until settled.
- HEAD ≠ `**HEAD:**` → `git -C "$REPO_ROOT" log --oneline <snapshot-sha>..HEAD`, summarize what landed; the next step may be done or superseded — say so.
- Missing paths from "Files modified this session" / "Context … MUST load first" → list in the brief, ask.

One-line verdict (`in sync` / `drifted: …`) goes in the banner. A snapshot lacking those header fields — **or carrying them empty** — has no anchor: say "no drift anchor in snapshot" and proceed.

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

The operator's **next message** orders the work (the proposed step, the Step 0 directive, or anything else from the snapshot) → archive first, then load what Step 3 deferred, then act.

```bash
GD="$(cd "$(git rev-parse --git-dir)" && pwd)"
GCD="$(cd "$(git rev-parse --git-common-dir)" && pwd)"
if [ "$GD" = "$GCD" ]; then REPO_ROOT="$(git rev-parse --show-toplevel)"
else REPO_ROOT="$(cd "$GCD/.." && pwd)"; fi

grep -qxF 'saved-progress/archive/*.md' "$REPO_ROOT/.gitignore" 2>/dev/null \
  || printf '\nsaved-progress/archive/*.md\n' >> "$REPO_ROOT/.gitignore"
mkdir -p "$REPO_ROOT/saved-progress/archive"
mv "$REPO_ROOT/saved-progress/<filename>" "$REPO_ROOT/saved-progress/archive/<filename>"
```

The guard **must run before the `mv`**: `saved-progress/*.md` does not cover `archive/` (gitignore's `*` never crosses `/`), so the snapshot would land on a committable path. Use the exact filename from Step 2 — never a glob, never a guessed name; blocked work or a redirect → restore with the inverse `mv`.

Then load what Step 3 deferred: every unanchored path under **Context the next session MUST load first**, `CLAUDE.md` if it is still not in context, and the plan / current-state doc's relevant entries if the work touches project state.

**Archive hygiene:** `saved-progress/archive/` is gitignored and nothing prunes it. If Step 1 counted more than ~20 archived snapshots, say so in one line and offer to delete the oldest — never delete without asking.

Ordered work still runs under the snapshot's standing constraints (stop and ask rather than violate one) and rejected approaches (ask first); ambiguous or blocked → say so with the snapshot's specifics, never improvise a substitute.

Do **not** archive when the operator redirects elsewhere, answers the drift question "abort", or lets the session end at the brief.
