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

A directive to commit, push, or share the snapshot → don't; say why (snapshots are local-only transient session state, Step 2) and continue with the save.

## Step 1 — Locate repo, collect current state

`REPO_ROOT` does **not** persist between Bash calls — re-assign it at the top of every block that uses it.

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
git -C "$REPO_ROOT" branch --show-current
git -C "$REPO_ROOT" log --oneline -10
git -C "$REPO_ROOT" rev-parse --short HEAD
git -C "$REPO_ROOT" status --short          # includes untracked
git -C "$REPO_ROOT" diff --stat HEAD
```

If the project has a plan / current-state doc, read its "Current state" (or equivalent) section for substrate state to forward. Discover it rather than assuming a fixed path: the path named in `CLAUDE.md`'s continuity/onboarding section, else common locations (`docs/**/PLAN.md`, `docs/**/*_PLAN.md`, `PLAN.md`, `ROADMAP.md`, `STATUS.md` at the repo root or under `docs/`). None → skip; do not invent one.

## Step 2 — Prepare the destination

**Keep snapshots local-only:** transient session state, MUST NOT be committed. Create the directory and ensure both ignore patterns exist — each `grep` needle must stay byte-identical to what it writes, or every run appends a duplicate:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
mkdir -p "$REPO_ROOT/saved-progress"
grep -qxF 'saved-progress/*.md' "$REPO_ROOT/.gitignore" 2>/dev/null \
  || printf '\n# Atelier /save-progress session snapshots (local-only)\nsaved-progress/*.md\n' >> "$REPO_ROOT/.gitignore"
grep -qxF 'saved-progress/archive/*.md' "$REPO_ROOT/.gitignore" 2>/dev/null \
  || printf '\nsaved-progress/archive/*.md\n' >> "$REPO_ROOT/.gitignore"
```

Both patterns are required: gitignore's `*` does not cross `/`, so `saved-progress/*.md` does **not** cover the `archive/` subdirectory `/resume-progress` moves consumed snapshots into. Both `printf`s start with `\n`: without it, a `.gitignore` lacking a trailing newline concatenates the pattern onto its last line, silently breaking both rules — and the `grep` guard then re-appends every run.

## Step 3 — Synthesize the snapshot

Write to `<REPO_ROOT>/saved-progress/<YYYYMMDD-HHMMSS>-<slug>.md`:

- `<YYYYMMDD-HHMMSS>` comes from `date +%Y%m%d-%H%M%S` via Bash — never from memory.
- `<slug>` derives from the Step 0 **Label**: lowercase; every character outside `[a-z0-9]` → `-`; collapse repeated `-`; strip leading/trailing `-`; truncate to 40 chars. No label-like text left → the git branch name under the same normalization. **The filename must never contain spaces, quotes, commas, or slashes.**

The file MUST contain every section below, populated with real content from this session — never empty or generic. Sections with an empty-value escape ("None.", "None stated.") take it when they genuinely have no content; never pad, never fabricate. Paths inside are **repo-relative** (so the file survives a clone elsewhere) except the `**Repo:**` header, which records the absolute root.

```markdown
# Session Progress — <slug>

**Saved:** <date-time>
**Branch:** <current branch>
**HEAD:** <short sha> — <HEAD commit subject>
**Working tree at save:** <clean | N modified, M untracked>
**Repo:** <absolute path from `git rev-parse --show-toplevel`>

---

## What we were doing

<2–4 sentences: the task/goal/investigation, concrete for a cold reader; quote the user's own framing of the goal.>

## What we accomplished

<Bullets: completed steps, decisions, files created/modified and outcomes, with paths/line numbers where relevant.>

**Commits made this session:** <short sha + subject for each, or "none">

## Key findings

<Bullets: non-obvious facts — gotchas, invariants, measurements, design decisions — and WHY each matters. The likeliest section to save re-discovery time.>

## Approaches tried and rejected

<Each abandoned approach + the specific reason it failed; options rejected unimplemented + rationale. Must not be re-attempted; none of it leaves a trace in git or tests, so unwritten is gone. If none, "None.">

## Current state

<Where things stand right now: mid-flight, at a pause, blocked? Last confirmed-good state?>

**Files modified this session:**
<list from git status/diff — paths only, repo-relative>

**Project / substrate state to forward:**
<what the resumed session needs from the plan doc's "Current state", or "n/a — no plan doc">

**Tests / validation state:**
<last known test run results, or "not run">

## Standing constraints from the user

<Every directive, prohibition, preference, or scope boundary stated this session that still binds — including things they told you NOT to do. Verbatim where short; paraphrase if long, marking reconstructions. If none, "None stated.">

## Blockers / open questions

<Anything needing resolution before proceeding. If none, "None.">

## Exact next step

<One concrete, unambiguous instruction for what to do first, actionable with no other context — name the file, function, command, or decision point.>

## Context the next session MUST load first

<Repo-relative paths to read before acting. ALWAYS include `CLAUDE.md` if one exists (continuity contract + commit discipline, unrestated here), the plan / current-state doc, in-flight files; name the sections that matter.>

## Commands to run on resume

<Optional: commands restoring environment state on resume (activate a virtualenv, check a running process, verify a server). Include any background process, worktree, or long-running job left in flight.>
```

## Step 4 — Write the file

Write the populated file with the Write tool to `<REPO_ROOT>/saved-progress/<timestamp>-<slug>.md`.

## Step 5 — Confirm

Tell the user: the file path written; a one-line summary of what was captured; **which of their directives you applied and the section each landed in** (or "no directives given"; flag any you could not place); whether you modified `.gitignore`; how to resume — "Start a new session and run `/resume-progress` to pick this up."
