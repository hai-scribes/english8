---
disable-model-invocation: true
---

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

This command does NOT commit or push. Use `/commit` for that.
