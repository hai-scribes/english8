---
description: Commit, merge and push ALL the work in this repo — every worktree, branch and stash — under lane policy. Use for any "commit / merge / push (all)" request.
---

You are the ship command. It replaces `/commit` and every hand-rolled "commit, merge and push all". It covers the WHOLE repository — every worktree, every local branch, every stash — not just what this session touched.

The user's request: $ARGUMENTS

**The split.** `atelier ship` decides what MAY happen to each ref (lane policy — deterministic). You and one cheap sub-agent decide only what a script cannot: how dirty files group into commits, their messages, and a recommendation on each judgement item. `atelier ship apply` then refuses any step the policy forbids, so a wrong plan fails closed instead of merging a prototype.

## Step 1 — Read git, and say what you read

```bash
atelier ship inventory --agent --compact
```

Immediately tell the operator what it found, before any reasoning — one short block:

```
Read git: <N> worktrees (<d> dirty) · <B> branches (<u> unmerged) · <s> stashes · remote <yes|none>
  dirty:     <path> (<branch>) — <n> files — commit:<policy>
  mergeable: <branch> (+<k>)            ← merge:allow, conflicts named if any
  judgement: <branch|path> — <reason>   ← needs_judgement[]
  held back: <branch> — <reason>        ← merge:forbid AND unmerged (prototype lanes, variants, orchestra, unclosed develop specs)
  carried:   prototype/<slug> — travels via `atelier push`, never merged
  stashes:   <ref> — <subject> (never applied)
```

Omit empty rows. `held back` is the row that answers "what about the prototype?" — always show it when non-empty, with the policy's reason verbatim.

If nothing is dirty, nothing is `allow`/`carry`/`ask`: say "nothing to ship" and stop.

## Step 2 — Reasoning pass (cheap model)

Pick the model from the inventory — never the session model:

- **`haiku`** — ≤ 1 dirty worktree, ≤ 15 dirty files, and `needs_judgement` is empty.
- **`sonnet`** — anything larger, or any judgement item, or any predicted conflict.

Dispatch ONE `Agent` (`subagent_type: general-purpose`, `model: <haiku|sonnet>`, `description: "Ship plan"`). Its prompt carries the full inventory JSON and this brief:

> For each worktree with `policy.commit` of `allow` or `ask`: run `git -C <path> status` and `git -C <path> diff` (and `--staged`), read untracked files only as far as needed. Group the dirty files into coherent commits (one logical change each — usually one). Write conventional messages: `feat:`/`fix:`/`refactor:`/`test:`/`chore:`/`docs:` subject ≤ 70 chars, optional 1–3 line body on the *why*. Leave out files that look accidental, generated, or secret-shaped, and say why. For each `needs_judgement` item, read `git log --oneline <default>..<branch>` and recommend yes/no in one line (finished work vs. abandoned/WIP). Do NOT run any git command that writes. Return ONLY JSON: `{"commits":[{"worktree","files":[],"message"}],"excluded":[{"worktree","file","why"}],"recommendations":[{"item","on","recommend":"yes|no","why"}]}`.

Append to every commit `message` the commit trailer lines your harness requires.

## Step 3 — Operator choices (judgement items only)

`allow` items proceed without asking (R6.4.b). `forbid` items are never offered. Only `needs_judgement` items are questions: one `AskUserQuestion` (multiSelect), each option labelled with the item and the sub-agent's recommendation + why. Skip this step when `needs_judgement` is empty. An `ask` item the operator did not pick is simply left out of the plan.

## Step 4 — Build and apply the plan

Write the plan to your scratchpad as JSON:

```json
{
  "inventory_digest": "<from Step 1>",
  "commits": [{"worktree": "<abs path>", "files": ["..."], "message": "..."}],
  "merges": ["<branch>", "..."],
  "pushes": ["<branch>", "..."],
  "carry_lanes": true,
  "operator_approved": ["merge:<branch>", "push:<branch>", "commit:<path>"]
}
```

- `files`: exact paths from the inventory's `dirty[]` (untracked files are listed one by one; a directory is never a valid entry). For a rename, naming the new path is enough.
- `merges`: every branch with `merge: allow`, plus the `ask` ones chosen — merged into the default branch with `--no-ff`, in the order listed (put branches with no predicted conflicts first).
- `pushes`: every branch with `push: allow`; the chosen `ask` ones; and the default branch whenever `merges` is non-empty.
- `carry_lanes`: `true` when any branch has `push: carry`. The carry commits lane state onto, and pushes, the MAIN worktree's branch — so that branch must be pushable in this plan (the default branch, or an `allow`/approved `ask` push).
- `operator_approved`: exactly the `ask` items the operator chose in Step 3 — never an item they were not asked about.

Then:

```bash
atelier ship apply <plan.json> --agent
```

Exit 2 = the plan file is unreadable JSON. Exit 3 = **refused, nothing ran.** Fix the named plan entries and re-apply. A digest mismatch means the tree moved — re-run Step 1 and rebuild the plan (don't re-ask choices the operator already made unless the item changed). Never work around a refusal with raw `git merge` / `git push`: the refusal IS the lane policy.

Exit 1 = stopped at the first failed step; earlier steps landed. A merge conflict was already aborted — report the conflicting files and stop; resolving it is the operator's call. A failing commit hook: report its output, don't `--no-verify`.

## Step 5 — Report

```
Committed: <sha> <subject> (<worktree>) …
Merged:    <branch> → <default> …
Carried:   <slugs> (lane state + prototype branches + snapshots)
Pushed:    <branch> …
Held back: <branch> — <reason> …
Left:      <excluded files / unchosen items / stashes>
```

## Rules

- NEVER `git merge` a `prototype/<slug>` branch or a tournament variant into anything. A finished prototype leaves via `/promote`; an abandoned one via `/drop-prototype`.
- NEVER run write-side git yourself in this command — every commit, merge and push goes through `atelier ship apply`.
- Never force-push, pull, rebase, delete a branch, or apply a stash here. Name them under `Left:` if they look relevant.
