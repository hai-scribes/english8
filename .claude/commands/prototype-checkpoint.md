---
disable-model-invocation: true
---

You are the prototype-checkpoint command. Capture the current state of an active prototype so a future fresh session can resume without losing context. No gates, no spec changes — pure cross-session continuity.

The user's slug: $ARGUMENTS

---

## Step 1 — Resolve the slug

If `$ARGUMENTS` is empty, list active prototype branches and ask the user to pick:

```bash
git for-each-ref --format='  - %(refname:short)' 'refs/heads/prototype/*'
```

Then `AskUserQuestion` to select. If the user names a slug that doesn't exist, ask again.

## Step 2 — Gather auto-context

```bash
atelier prototype checkpoint <slug> --agent --compact
```

The CLI refuses if the prototype branch doesn't exist, the slug was already promoted (Gate E signed) or dropped, or the worktree is missing. On success it emits a JSON envelope: `{slug, branch, branch_sha, worktree_path, checkpoint_path, prior_checkpoint, uncommitted_files, recent_commits}`.

If exit code is non-zero (1 = state/branch/worktree issue; 2 = invalid slug), surface the CLI's stderr verbatim and stop — do NOT attempt to fix or work around the refusal.

## Step 3 — Read prior checkpoint (if any)

If the envelope reports `prior_checkpoint: true`, read `.specs/verify/<slug>.checkpoint.md` so the new checkpoint builds on (rather than discards) prior context. Do not blindly overwrite — preserve still-relevant items, update what changed, remove what's resolved.

## Step 4 — Author the checkpoint markdown

Write `.specs/verify/<slug>.checkpoint.md` with this schema. Fill every section from your session memory; the auto-context bits at the bottom come from the CLI envelope's `recent_commits` + `uncommitted_files` fields.

```markdown
# Prototype checkpoint: <slug>

**Last updated:** <current UTC timestamp>
**Branch:** prototype/<slug> @ <branch_sha from envelope>
**Worktree:** .worktrees/prototype-<slug>/
**Working tree:** <clean | dirty (N files)>

## Current focus

<one paragraph: what the prototype is exploring right now, framed so a fresh session understands the goal in 2 sentences>

## Last attempt

<what was just tried in this session, and the outcome — worked / didn't work / partial. Concrete: filenames, command names, observed behavior. Not "tried styling" — "added flex layout to LoginForm.tsx, vertical alignment broke on mobile (<480px)">

## Next steps

- [ ] <smallest next action — what would the resuming session do FIRST>
- [ ] <subsequent action>
- [ ] ...

## Open questions

- <decisions needing user input or experimentation — phrase as questions>
- <if none, write "(none)">

## References

- <design refs, URLs, screenshot paths used this session>
- <if none, write "(none)">

## Auto-context

### Recent commits

<one bullet per entry in envelope's `recent_commits`: `<sha>  <age_iso>  <subject>`>

### Uncommitted changes

<one line per entry in envelope's `uncommitted_files` (porcelain status preserved)>
```

The narrative sections (Current focus, Last attempt, Next steps, Open questions, References) are the load-bearing content. The Auto-context block is reproducible from git on resume — it's there as a snapshot, not the main payload. If you can't fill a narrative section honestly, write `(none yet — first checkpoint)` or `(unclear — surface to user on resume)` rather than fabricating.

## Step 5 — Optional: commit work-in-progress

If the working tree was clean, skip this step.

If `$ARGUMENTS` contains `--commit-wip`, commit automatically without asking (flag-capture path for unattended runs).
If `$ARGUMENTS` contains `--no-commit`, skip the commit without asking.

Otherwise, if the envelope's `uncommitted_files` list is non-empty, `AskUserQuestion`: "Commit work-in-progress now?"

In all commit cases:
```bash
git -C .worktrees/prototype-<slug> add -A
git -C .worktrees/prototype-<slug> commit -m "checkpoint: <one-line summary of current focus>"
```

If not committing, leave the working tree as-is. The checkpoint markdown still records what was uncommitted.

## Step 6 — Confirm + tell user how to resume

Print:

```
Checkpoint saved for <slug>.

  file:      .specs/verify/<slug>.checkpoint.md
  branch:    prototype/<slug> @ <short-sha>
  worktree:  .worktrees/prototype-<slug>/
  WIP:       <committed | left dirty | clean>

To resume in a future session:
  /prototype <slug>     - reads the checkpoint and restores context
                          (idempotent on existing slugs; no new branch is created)
```

---

## Notes for the AI running this command

- DO NOT invoke `approve-prototype.sh` here — that signs the prototype-validated HMAC marker (different semantics). Checkpoint is unsigned by design.
- DO NOT modify `.specs/features/<slug>.yaml` here. Specs are extracted via `/promote`, not checkpoints.
