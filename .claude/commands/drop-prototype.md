---
disable-model-invocation: true
---

You are the `/drop-prototype` command. Cleanly remove an abandoned prototype branch + worktree + record the drop reason. No code, no spec changes — pure lifecycle hygiene.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 (abandonment branch); `docs/atelier/ATELIER_PLAN.md` § W8.2.

The user's slug: $ARGUMENTS

---

## Step 1 — Resolve the slug

If `$ARGUMENTS` is empty, list active prototypes:

```bash
atelier prototype list --agent --compact
```

Then `AskUserQuestion` to pick one. If the user names a slug that doesn't exist, the CLI returns `ok: true, reason: nothing-to-drop` — idempotent. Surface that to the user (no harm done).

## Step 2 — Refusal checks (mechanical)

The CLI mechanically refuses (exit 1) if `state: promoted` in `.specs/prototype/<slug>.yaml` — the production branch is live and abandonment goes through `/bug` or a manual cleanup, not the drop path.

If the user insists, redirect: "The prototype was promoted (state=promoted). The production branch `<slug>` is live; dropping the prototype branch won't undo the promotion. To abandon the production work, register a bug or revert manually."

## Step 3 — Capture reason

If `$ARGUMENTS` contains `--reason "<text>"`, extract the reason from the flag and skip to Step 4. This is the flag-capture path for unattended or scripted runs.

Otherwise `AskUserQuestion` for a one-line reason. Suggested choices:

- "tried but didn't validate with users"
- "merged into another prototype"
- "out of scope after discussion"
- "blocked on dependency"
- "other (free-form)"

If "other", capture the free-form text.

The reason lands in the drop envelope (returned by the CLI) and the W7.5 `retro-after-drop-prototype.sh` hook emits a "high-value lesson candidate — WHY did this not promote?" prompt to stderr.

## Step 4 — Drop

```bash
atelier prototype drop <slug> --reason "<reason>"
```

The CLI:
- Removes the worktree at `.worktrees/prototype-<slug>/` via `git worktree remove --force`.
- Deletes the branch `prototype/<slug>` via `git branch -D`.
- Flips the state file `.specs/prototype/<slug>.yaml` to `state: dropped` (file persists for forensic value; not deleted).
- Returns an envelope with `branch_removed`, `worktree_removed`, `state: dropped`, `reason`.

Idempotent — re-running on a missing slug returns `nothing-to-drop` and exit 0.

## Step 5 — Confirm + propose

Surface the envelope contents to the user. If there are other active prototypes (check via `atelier prototype list`), offer to drop or promote those next. Otherwise suggest `/product` (when available) if they want to start something new, or `/prototype <new-slug>` for another lateral exploration.

If the W7.5 retro hook fired its "WHY did this not promote?" nudge, surface it. The lesson goes into `.atelier/retro/lessons.md` per the destination-redirect rule (CLAUDE.md auto-memory section).

---

## Notes

- **Idempotent** — slug with no branch / no state file → CLI reports `nothing-to-drop` and exits 0.
- **Production branches are off-limits** — drop only removes `prototype/<slug>`; never touches `main` or a promoted `<slug>` production branch.
- **State file persists at `state: dropped`** by design. Operator-visible forensic record of WHY this lane was abandoned. `atelier prototype list` filters to `state: open` only, so dropped prototypes don't clutter the live view.
