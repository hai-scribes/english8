---
disable-model-invocation: true
---

You are `/save-progress`: capture this session's progress into a standalone file that lets a brand-new Claude session (no memory, no CLAUDE.md, no history) resume exactly where this one left off.

**Routing rule (applies even without the slash command).** Any request to "save progress" / "save for a new session" means: write the local `saved-progress/` snapshot below — never route session progress into AI memory (memory has no size gate; it holds only durable user/feedback/reference facts).

## Step 0 — Parse arguments

The user's arguments: $ARGUMENTS

**Free-form, and usually more than a label** — operators normally type instructions alongside the command. Split them first:

1. **Label** — 2–5 words suitable for a filename; never the raw string.
2. **Directives** — everything else is *required content or scoping*, not decoration; each must change the snapshot:
   - a fact to forward → **Key findings** or **Blockers / open questions**;
   - a constraint or preference ("don't let the next session touch the hooks") → **Standing constraints from the user**;
   - a next-action override → **Exact next step**;
   - a scope instruction ("only the doc work") → obey it when choosing what to write;
   - fits no section → append a final `## Notes from the operator` section carrying it **verbatim**.
3. Empty arguments, or clearly just a label → skip the directive handling; do not invent directives.

**An instruction must never survive only as a filename.** If you cannot place a directive, that is what `## Notes from the operator` is for.

A directive to commit, push, or share the snapshot → don't; say why (snapshots are local-only transient session state, Step 1) and continue with the save.

## Step 1 — Preflight, in one Bash call

Everything mechanical goes in a **single** block: the pieces are independent of each other, and every extra Bash call replays the whole conversation. `REPO_ROOT` does **not** persist between Bash calls — re-derive it in any later block.

Snapshots are **local-only transient session state and MUST NOT be committed**. Both ignore patterns are required: gitignore's `*` does not cross `/`, so `saved-progress/*.md` does not cover the `archive/` subdirectory `/resume-progress` moves consumed snapshots into.

```bash
# Main repo root — correct from a subdirectory AND from a linked worktree.
# A snapshot written inside a worktree dies with `git worktree remove`:
# gitignored, no git object, irrecoverable. It always lands in the main root.
GD="$(cd "$(git rev-parse --git-dir)" && pwd)"
GCD="$(cd "$(git rev-parse --git-common-dir)" && pwd)"
if [ "$GD" = "$GCD" ]; then REPO_ROOT="$(git rev-parse --show-toplevel)"
else REPO_ROOT="$(cd "$GCD/.." && pwd)"; fi

BRANCH="$(git branch --show-current)"          # prints nothing on detached HEAD
[ -n "$BRANCH" ] || BRANCH="detached@$(git rev-parse --short HEAD)"

echo "REPO_ROOT=$REPO_ROOT"
echo "WORKTREE=$(git rev-parse --show-toplevel)"
echo "BRANCH=$BRANCH"
echo "STAMP=$(date +%Y%m%d-%H%M%S)"            # the filename stamp; never from memory
echo "HEAD=$(git rev-parse --short HEAD) $(git log -1 --pretty=%s)"
git status --short          # includes untracked
git diff --stat HEAD
git log --oneline -10

mkdir -p "$REPO_ROOT/saved-progress"
grep -qxF 'saved-progress/*.md' "$REPO_ROOT/.gitignore" 2>/dev/null \
  || printf '\n# Atelier /save-progress session snapshots (local-only)\nsaved-progress/*.md\n' >> "$REPO_ROOT/.gitignore"
grep -qxF 'saved-progress/archive/*.md' "$REPO_ROOT/.gitignore" 2>/dev/null \
  || printf '\nsaved-progress/archive/*.md\n' >> "$REPO_ROOT/.gitignore"
```

Each `grep` needle must stay byte-identical to what it writes, and both `printf`s must keep the leading `\n`: without it, a `.gitignore` lacking a trailing newline concatenates the pattern onto its last line, silently breaking both rules — and the guard then re-appends every run.

If the project has a plan / current-state doc, read **only the entries that matter**, never the whole section (a mature one runs to hundreds of KB). Discover the doc rather than assuming a path: the one named in `CLAUDE.md`'s continuity/onboarding section, else common locations (`docs/**/PLAN.md`, `docs/**/*_PLAN.md`, `PLAN.md`, `ROADMAP.md`, `STATUS.md` at the repo root or under `docs/`). None → skip; do not invent one.

## Step 2 — Synthesize the snapshot

Write to `<REPO_ROOT>/saved-progress/<STAMP>-<slug>.md`, using the `STAMP` and `REPO_ROOT` echoed by Step 1.

`<slug>` derives from the Step 0 **Label**: lowercase; every character outside `[a-z0-9]` → `-`; collapse repeated `-`; strip leading/trailing `-`; truncate to 40 chars. No label-like text left → the branch name under the same normalization. **The filename must never contain spaces, quotes, commas, or slashes.**

The file MUST contain every section below, populated with real content from this session — never empty or generic. Sections with an empty-value escape ("None.", "None stated.") take it when they genuinely have no content; never pad, never fabricate. Paths inside are **repo-relative** (so the file survives a clone elsewhere) except the `**Repo:**` header, which records the absolute root.

**Budget the two halves differently — cap what git can regenerate, never cap what only this session holds:**

- **Cap.** *What we accomplished*, *Commits made this session*, *Files modified*: paths, shas and one-line outcomes only. Never paste diffs, log excerpts or file contents — git has them, and the next session can run `git show`.
- **Never cap.** *Key findings*, *Approaches tried and rejected*, *Standing constraints from the user*. None of it leaves a trace in git or tests; unwritten is gone, and losing it is the failure this command exists to prevent.

```markdown
# Session Progress — <slug>

**Saved:** <date-time>
**Branch:** <BRANCH from Step 1>
**HEAD:** <short sha> — <HEAD commit subject>
**Working tree at save:** <clean | N modified, M untracked>
**Repo:** <REPO_ROOT — absolute>
**Worktree:** <absolute worktree path — include this line ONLY if WORKTREE differs from REPO_ROOT>

---

## What we were doing

<2–4 sentences: the task/goal/investigation, concrete for a cold reader; quote the user's own framing of the goal.>

## What we accomplished

<Bullets: completed steps, decisions, files created/modified and outcomes, with paths/line numbers where relevant. Capped — outcomes, not transcripts.>

**Commits made this session:** <short sha + subject for each, or "none">

## Key findings

<Bullets: non-obvious facts — gotchas, invariants, measurements, design decisions — and WHY each matters. The likeliest section to save re-discovery time. Uncapped.>

## Approaches tried and rejected

<Each abandoned approach + the specific reason it failed; options rejected unimplemented + rationale. Must not be re-attempted; none of it leaves a trace in git or tests, so unwritten is gone. Uncapped. If none, "None.">

## Current state

<Where things stand right now: mid-flight, at a pause, blocked? Last confirmed-good state?>

**Files modified this session:**
<paths only, repo-relative, from git status/diff>

**Project / substrate state to forward:**
<what the resumed session needs from the plan doc's "Current state", or "n/a — no plan doc">

**Tests / validation state:**
<last known test run results, or "not run">

## Standing constraints from the user

<Every directive, prohibition, preference, or scope boundary stated this session that still binds — including things they told you NOT to do. Verbatim where short; paraphrase if long, marking reconstructions. Uncapped. If none, "None stated.">

## Blockers / open questions

<Anything needing resolution before proceeding. If none, "None.">

## Exact next step

<One concrete, unambiguous instruction for what to do first, actionable with no other context — name the file, function, command, or decision point.>

## Context the next session MUST load first

<Repo-relative paths to read before acting, each with a **line range** wherever the file is large — `docs/atelier/ATELIER_PLAN.md:11-30`, never "the Current state section". An anchored range costs the next session only that range; an unanchored pointer to a big file costs it the whole file — on a mature plan doc that is the difference between a few thousand tokens and tens of thousands. ALWAYS include `CLAUDE.md` if one exists (continuity contract + commit discipline, unrestated here), the plan / current-state doc's relevant entries, and the in-flight files; name the sections that matter.>

## Commands to run on resume

<Optional: commands restoring environment state on resume (activate a virtualenv, check a running process, verify a server). Include any background process, worktree, or long-running job left in flight.>
```

## Step 3 — Write the file

Write the populated file with the Write tool to `<REPO_ROOT>/saved-progress/<STAMP>-<slug>.md`.

## Step 4 — Confirm

Tell the user: the file path written; a one-line summary of what was captured; **which of their directives you applied and the section each landed in** (or "no directives given"; flag any you could not place); whether you modified `.gitignore`; if Step 1 showed a worktree, that the snapshot was written to the main repo root rather than the worktree, and why; how to resume — "Start a new session and run `/resume-progress` to pick this up."
