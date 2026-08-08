---
disable-model-invocation: true
---

You are the commit command. Review changes, create a conventional commit, and push. Run this directly — no Codex, no subagent for typical commits (only a Haiku-subagent fallback for large diffs).

The user's request: $ARGUMENTS

---

## Step 1: Review Changes

Run `git status` and `git diff --staged` (also `git diff` for unstaged if relevant). Identify modified, new, and untracked files.

## Step 2: Filter & Stage

- NEVER commit secrets (`.env`, `.env.*`, credentials, keys, tokens).
- NEVER use `git add -A` or `git add .` — add files by name.
- Stage all modified and new files that are part of the working change (source, tests, specs, configs).
- For untracked files: include if clearly part of the change; exclude if ambiguous or potentially sensitive.

## Step 3: Draft the message

Conventional types: `feat:` / `fix:` / `refactor:` / `test:` / `chore:` / `docs:`.

**Default — main session drafts directly.** The staged diff is already in your context from Step 1. Write the message inline: 1-line subject (≤70 chars) prefixed with the conventional type, optionally a 1–3 line body explaining the *why*. No external LLM dispatch. This is the path for the overwhelming majority of commits.

**Large-diff threshold — Haiku subagent.** If the staged diff exceeds **~50 files OR ~500 added lines** (read the totals from `git diff --staged --stat | tail -1`), dispatch a Haiku subagent (`Agent` tool, `model: haiku`, `description: "Commit message draft"`) with the staged diff and the conventional types list as its prompt. Use the returned message verbatim. Past this volume, the diff is too large to fit cleanly in main-session context; Haiku is the cheapest viable model that handles the input.

If `git diff --staged` shows no staged changes after Step 2, report "no staged changes" and stop.

## Step 4: Commit

Append the Co-Authored-By trailer and commit via HEREDOC:

```
git commit -m "$(cat <<'EOF'
<message from Step 3>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Step 5: Push

Push to the current branch's upstream. If no upstream, push with `-u origin <branch>`.

## Step 6: Report

```
Staged: <files>
Excluded: <files + why>
Draft: main | haiku (large-diff threshold)
Commit: <hash> — <subject line>
Push: <pushed to origin/branch | failed: reason>
```

**Note:** This command does NOT build or launch the app. Use `/build` for that.
