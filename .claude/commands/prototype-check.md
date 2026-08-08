---
disable-model-invocation: true
---

You are the `/prototype-check` command. Run the operator-authored behavioral smokes for a prototype slug — repeatable "does it run" checks declared in `.specs/prototype/<slug>.checks.yaml`. Surface results; never gate `/promote`.

Reference: `docs/atelier/ATELIER_USE_CASES.md` § UC9 (W8.5 addition) and ADR-W8.5-1 sibling discussion in `docs/atelier/ATELIER_PLAN.md` § W8.5.

The user's slug: $ARGUMENTS

---

## Step 1 — Resolve the slug

If `$ARGUMENTS` is empty, ask the operator which prototype slug to check. Use `atelier prototype list --agent --compact` to enumerate live prototypes and propose the choices via `AskUserQuestion`. If the operator names a slug that doesn't exist, surface the live list and ask again.

If `$ARGUMENTS` matches a live slug, proceed.

## Step 2 — Run the check

```bash
atelier prototype check <slug> --agent --compact
```

Surface the JSON envelope to the operator. Three outcomes:

- **First-run / lazy skeleton** (`skeleton_written: true`): the CLI writes `.specs/prototype/<slug>.checks.yaml` with a commented example. Show the operator the path and the `hint`. They edit the file, then re-run `/prototype-check <slug>`. Do **not** auto-fill the file — operator authorship is the contract; an AI-prefilled checks.yaml would carry assumptions about the prototype the operator hasn't validated.

- **Empty file** (file exists but no uncommented scenarios — `total: 0` with `skeleton_written: false`): surface the hint, suggest the operator uncomment the examples or author their own.

- **Scenarios ran** (`total > 0`): surface the per-scenario pass/fail summary plus the aggregate `pass_count`/`fail_count`. Even if every scenario fails, the CLI exits 0 — `/prototype-check` is informational, not a gate. Do not treat the result as blocking anything.

The CLI refuses (exits non-zero on stderr but the slash command surfaces this verbatim):

- **`checks-malformed`** (exit 2) → the operator's YAML has a parse error or schema violation. Surface the diagnostic; they fix and re-run.
- **`worktree-missing`** (exit 1) → the prototype's worktree was removed (manual `rm -rf`, OS cleanup, etc.). Suggest `atelier prototype start <slug>` if they meant to resume.

## Step 3 — Set expectations

After surfacing results, remind the operator:

- **This does not gate `/promote`.** Pass or fail, the prototype lane stays loose. Behavioral smokes are an iteration tool, not a quality bar.
- **Scenarios run from the worktree's cwd** (`.worktrees/prototype-<slug>/`), not from main. Commands like `npm run build` resolve against the worktree's package.json, not main's.
- **30-second default timeout per scenario.** Override per-scenario via `timeout_seconds:` in checks.yaml.
- **Lifecycle is bounded.** `.checks.yaml` is purged on `/drop-prototype` AND on `/promote` post-state-flip. If the operator wants to preserve the file across abandonment, they copy it out manually before dropping.

---

## Notes for the AI running this command

- **DO NOT author `checks.yaml`** for the operator. The whole point of the surface is that the operator declares what "running" means for their prototype. AI-authored smokes would carry assumptions the operator hasn't validated and would erode the lane's "operator agency" principle.
- **DO NOT treat failures as blocking.** `/promote` does not consume `checks.yaml`. The Extractor reads observed behavior + screenshots; the smokes are a separate axis.
- **DO NOT add scenarios mid-run.** If the operator wants different smokes, they edit `checks.yaml` and re-invoke `/prototype-check`. The slash command does not stream scenarios from the conversation into the file.
- **For your own subsequent file edits within the worktree**, prefix with `cd .worktrees/prototype-<slug> && source .envrc.atelier && <cmd>` (per R6.4.b), same as the rest of the prototype lane.
