---
disable-model-invocation: true
---

You are the `/atelier-update` command. Run the two-layer framework upgrade flow
without the operator having to exit Claude Code: first pull the latest
framework code (machine-level), then refresh the current project's slash
commands (project-level). Both gestures are idempotent.

The user's request: $ARGUMENTS

`$ARGUMENTS` may include:
- `--check` — dry-run; show what would change, write nothing.
- `--force` — pass `--strategy=*=replace` to `--refresh-commands` (clobber
  any OPERATOR-EDITED files in `.claude/commands/`). Use sparingly; the
  default refresh preserves operator edits per the W9.7.e A+ design.
- `--skip-pull` — skip the framework `git pull` (use the framework as-is).
  Useful when the operator already pulled, or wants to test a local
  framework branch without re-fetching.
- `--yes` — flag-capture for packaged-install upgrade: instead of stopping
  with prose instructions, emit the upgrade command and execute it via
  `Bash` without an `AskUserQuestion` stop. AAOHI R6.4.b flag-capture
  surface — lets unattended `/atelier-update --yes` advance past the
  packaged-install branch without human confirmation.

If none of those flags are passed, run the safe default: fast-forward
`git pull`, then `atelier upgrade --refresh-commands --apply` (operator
edits preserved).

---

## Step 1: Resolve the framework install location

```bash
atelier path --agent
```

Parse the JSON. Two cases:

- **`binary_mode: "development"`** — `binary_path` is a symlink into a
  framework clone. Resolve the clone root: `dirname $(dirname $(dirname
  $(readlink <binary_path>)))` (binary lives at
  `<clone>/atelier/bin/atelier`, so three `dirname`s give the clone root).
  Verify the resolved dir is a git repo before proceeding.
- **`binary_mode: "packaged"`** — packaged install (e.g. `uv tool`).
  The framework was installed from a tag; there's no clone to `git pull`.

  If `$ARGUMENTS` contains `--yes` (flag-capture path — unattended mode):
  run `uv tool upgrade atelier-cli` via `Bash` immediately, then continue
  to Step 3 (skip Steps 2a-2b; the package manager handles the pull).

  Otherwise surface this to the operator and stop:
  > "Packaged install detected. Run `uv tool upgrade atelier-cli` (or your
  > package manager's equivalent) in a fresh shell, then re-invoke
  > `/atelier-update --skip-pull` to refresh this project's slash commands."

## Step 2: Pull framework updates (dev mode, default)

Unless `$ARGUMENTS` contains `--skip-pull`:

```bash
git -C <clone-root> fetch --quiet
LOCAL=$(git -C <clone-root> rev-parse HEAD)
REMOTE=$(git -C <clone-root> rev-parse '@{u}')
if [ "$LOCAL" = "$REMOTE" ]; then
  echo "framework: already up-to-date at $LOCAL"
else
  git -C <clone-root> pull --ff-only
fi
```

If `--ff-only` fails (divergent branch, local commits, conflicts):
- Surface the git error verbatim.
- Do NOT force, rebase, or stash. Operator has uncommitted work or a
  custom branch — that's their call to resolve.
- Stop.

If `$ARGUMENTS` contains `--check`: print "would-pull" diff
(`git -C <clone-root> log HEAD..@{u} --oneline`) and skip the actual pull.

## Step 3: Refresh project slash commands

In the operator's CURRENT working dir (NOT the framework clone — this is
the consumer project being upgraded):

```bash
# Default — preserves operator edits
atelier upgrade --refresh-commands --apply
```

Or, if `$ARGUMENTS` contains `--force`:

```bash
# Wildcard replace — clobbers any OPERATOR-EDITED files
atelier upgrade --refresh-commands --apply --strategy '*=replace'
```

Or, if `$ARGUMENTS` contains `--check`:

```bash
# Dry-run — show classification + planned actions, write nothing
atelier upgrade --refresh-commands
```

Parse the JSON output. Surface the one-line summary verbatim:

> refresh-commands: N applied · M kept · K opted-out · sidecar=.atelier/command-version.yaml

Post-W9.8, the classifier consults the sidecar baseline
(`commands_at_refresh`) for a three-way diff. Files the operator has
NOT edited but where the framework body advanced now classify as
`FRAMEWORK-CHANGED` and apply silently under the default `replace`
action — no triage required for the common case.

`OPERATOR-EDITED` now means "project bytes differ from BOTH the
current framework body AND the recorded baseline" — i.e. a real
operator hand-edit on top of last-known-good. This is the only case
that needs operator triage. For any file with `state: "OPERATOR-EDITED"`
and `applied: false`: list the names. **Do NOT push `/upgrade --force`
onto the operator as a manual command** — per R6.4.b you can run the
underlying CLI inline. `AskUserQuestion`:

> N operator-edited file(s) diverge from the new framework body:
>   <list of names>
> The default refresh preserved your edits. Options:
> - **Force-replace ALL with framework body** — I'll run `atelier upgrade
>   --refresh-commands --apply --force` (overwrites every listed file
>   with the new framework content; operator edits are lost).
> - **Force-replace SELECTED files only** — pick which to replace; the
>   rest stay preserved (per-file `--strategy=NAME=replace`).
> - **Keep all edits** — leave as-is; doctor will surface
>   FRAMEWORK-BODY-AHEAD on these going forward.
> - **Hand-merge** — I'll surface the framework body for each file so
>   you can diff against your version and copy-paste relevant parts;
>   no automatic mutation.

If "Force-replace ALL": run `atelier upgrade --refresh-commands --apply
--force`. Surface the new one-line summary.

If "Force-replace SELECTED files only": build `--strategy=NAME=replace`
args for each picked file (`atelier upgrade --refresh-commands --apply
--strategy=foo=replace --strategy=bar=replace`). Run and surface.

If "Keep all edits": no-op; state the FRAMEWORK-BODY-AHEAD label is
fine and continue.

If "Hand-merge": for each operator-edited file, run `atelier upgrade
--refresh-commands --strategy=NAME=replace` (no `--apply`) and surface
the framework body via the dry-run plan output, then stop and let the
operator decide per-file.

## Step 4: Re-check project health

```bash
atelier doctor
```

If `concerns[]` is non-empty: list each entry as one line. Do NOT
auto-fix; operator decides.

If `command_staleness.state` is now `CURRENT`: report
"command_staleness: CURRENT" as a one-liner.

## Step 5: Restart-required reminder

If Step 3 reports `N applied > 0`, end with:

> Slash commands updated. Restart Claude Code (`/exit` then re-launch) so
> the new prompt bodies load — the running session cached the old ones at
> session start.

If `N applied == 0` (nothing changed): no restart reminder needed.

## Failure modes to surface honestly

- **`atelier path` exits non-zero** — the binary's install layout is
  inconsistent. Surface stderr verbatim. Suggest re-running `atelier
  install` or checking `~/.local/bin/atelier` symlink target.
- **Framework clone not a git repo** — dev install layout broken; the
  symlink target isn't versioned. Surface and stop; operator must
  re-clone or re-symlink.
- **`atelier upgrade --refresh-commands` exits with `refresh-commands
  lock contended`** — another `/atelier-update` invocation (or `atelier upgrade
  --refresh-commands`) is in flight in the same project. Wait, then
  retry; do NOT bypass the flock.
- **Sidecar absent before refresh** — post-W9.8, `atelier init`
  bootstraps `.atelier/command-version.yaml` with `commands_at_refresh`
  populated from post-install SHAs, so the FIRST `--refresh-commands`
  after a framework body change correctly classifies unedited files as
  `FRAMEWORK-CHANGED` and applies silently. **Legacy projects with no
  sidecar** (initialized before W9.8 landed) fall back to the pre-W9.8
  two-way classifier — every framework-changed file looks
  `OPERATOR-EDITED`. One `--apply --force` (or one operator triage
  cycle through the `AskUserQuestion` above) bootstraps the baseline;
  subsequent refreshes classify correctly. Surface this as
  informational, not a concern.

## Why this lives as a slash command, not a single CLI subcommand

Each step is a distinct, observable operation. Wrapping them as `atelier
upgrade --everything` would hide failures behind one exit code. The
slash-command shape lets the operator see each step's output, apply
judgment to OPERATOR-EDITED conflicts, and abort cleanly if Step 2 fails
without polluting the project's `.claude/commands/`. This is consistent
with `/develop`'s shape — each gate visible, each transition explicit.
