---
disable-model-invocation: true
---

> **Run this without the model:**
>
> ```
> ! atelier build
> ! al build
> ```
>
> The first spelling always works wherever `atelier` does. The second is the
> `al` shorthand, which needs `atelier/bin` on PATH — linking only the
> `atelier` binary does not carry it, so downstream projects may have the
> long form and not the short one.
>
> Every step below is deterministic — no synthesis, no judgment call. Running
> it as a slash command costs this file's tokens plus a full conversation
> replay per tool call, and buys nothing the shell cannot do. In Claude Code,
> `!` runs a local command and puts its output in the transcript with **zero
> model turns**; the AI reads the result on your next message.
>
> This file stays the reference for what the command is contracted to do, and
> the fallback when neither spelling is reachable. See
> `docs/atelier/ATELIER_SLASH_COMMANDS.md` § "Bash-native commands".

You are the compile command. Run the configured build commands directly. No subagent, no narration — the commands print their own output.

The user's request: $ARGUMENTS

---

## Execution

Read `$TYPECHECK_CMD`, `$BUILD_CMD`, `$PACKAGE_CMD` directly from the operator's exported env (set via `.envrc.atelier` / direnv / shell — Atelier does NOT source a config file). Run any that are set in order, stopping on first failure:

1. `$TYPECHECK_CMD` if set
2. `$BUILD_CMD` if set
3. `$PACKAGE_CMD` if set

None configured → *"No TYPECHECK_CMD, BUILD_CMD, or PACKAGE_CMD exported. Set them in `.envrc.atelier` / direnv / shell, then re-run `atelier doctor` to confirm."* and stop.

Each command runs foreground via Bash. Let stdout/stderr print. Do not summarize the output.

## Report

- All passed → one line: *"Build: PASS ({typecheck,build,package} that ran)."*
- Any failed → one line naming which step failed and the failing command's exit code. User sees the error output directly from the tool call — do not re-state it.

This command does NOT commit or push. Use `/atelier-ship` for that.
