#!/usr/bin/env python3
"""drive.py — run-until-done enforcement for the /drive skill.

One drive = one task + 2–24 deterministic done-conditions (shell commands, exit 0
= met) + caps. State lives under <workspace>/.drive/<id>/. The Stop hook
(`drive.py gate`) re-runs the conditions every time the model tries to end its
turn and BLOCKS the stop while any condition is unmet — so "done" is observed,
never declared. Four exits only: met (the gate, or `close`), abort (with mechanism
+ evidence), cap, operator release. An operator `pause` is not an exit: it keeps the drive and
lets every stop through until `resume`.

Sub-commands
  install-hook [--project] [--timeout S]            opt-in: ALSO wire the gate into .claude/settings*.json
  uninstall-hook --from project|local|user          remove a settings-file copy of the gate (backup first)
  hook-status                                       SKILL.md frontmatter + settings copies of the Stop hook
  start   --task T --cond ID=CMD [--cond ...] [--checker ID=PATH ...] [--red-proof ID=DIR ...]
          [--protect-tests GLOBS] [--map KEY=IDS|unmapped ...] [--known-incomplete ID=TEXT ...]
          [--max-blocks N] [--max-minutes M] [--allow-green ID,..] [--timeout S]
          [--hook-timeout S] [--unhooked R] [--session ID] [--transcript P]
          [--auto-pause-empty N] [--allow-crash-red ID,..]
          [--force --why-force R]                   seal a drive for this session
  amend   --reason R [--add-cond ID=CMD ...] [--checker ID=PATH ...] [--red-proof ID=DIR ...]
          [--known-incomplete ID=TEXT ...] [--map KEY=IDS|unmapped ...] [--raise-blocks N]
          [--raise-minutes M] [--allow-green ID,..] [--timeout S (lower only)]
                                                    ADDITIVE-only change to the live contract
  check                                             run conditions in-turn, print unmet (exit 1 if any)
  close                                             all green → terminal `met` (the unhooked close-out)
  gate                                              Stop hook (payload on stdin)
  brief   --agent NAME --files GLOBS [--cond ids] [--context TEXT]
                                                    write+reserve an agent brief
  collect NAME                                      validate and print an agent's RETURN.md, then check
  cancel  NAME                                      free the slot of an agent you stopped or never dispatched
  codex-verify [--agent verify-codex] [--minutes M] run a cross-vendor verifier via `codex exec`
  verified [--cdir DIR]                             exit 0 iff the newest verify-* verdict is CONVERGED
  report-check --cdir DIR                           the `report` condition: 9 substantive requirements
  tests-guard  --cdir DIR                           the `tests-not-weakened` condition
  abort   --blocked X --mechanism Y --evidence Z --attempts "a;b"   audited abort → terminal
  note    TEXT                                      append to the progress log
  status                                            print state
  pause   [--reason R]                              operator's order only: allow every stop until resume
  resume  [--session ID]                            rebind the drive to THIS session; re-arms a pause
  release                                           operator-only: end the drive

Close-out and first-green freeze (S1):
  * The FIRST all-green, untampered evaluation — by `check`, `collect`'s check, `close` or the
    gate — stamps `state.first_green_at` (audit `first_green`). From then on the contract is
    FROZEN: `amend` and `start --force` are refused. A later regression still blocks.
  * `close` is the UNHOOKED path: on an `enforcement: hook` drive it is REFUSED (audit
    `close_refused`) — the gate, running in the harness's environment, closes those. Otherwise it
    evaluates every condition under the drive lock, with no session check and no block bump. All
    green → terminal `met` (audit `closed`); otherwise it prints the unmet lines and changes
    nothing. An unhooked drive can reach `met` ONLY through `close`; `check` observes.
  * The freeze and the terminal outcome are attested by audit.jsonl, not just state.json: a state
    `outcome` with no matching audit `terminal` event is STATE TAMPERED (the drive stays live and
    enforced), and an audit `first_green` refuses amend/--force even if state lost the field.
    Honest limit: rewriting audit.jsonl AND state.json together still defeats both.
  * Conditions: 2–24 user conditions — one per enumerated ask member; whole-tree invariants sit
    alongside, never instead. The gate-budget refusal stays the real limiter.

Additive-only amend (S3): adds conditions/checkers/red-proofs/known-incomplete notes/map rows,
  raises caps, allows named added conditions to be green. Nothing is dropped, redefined or
  lowered — there is no flag for it. Refused after first green, on a terminal drive, and on a
  broken seal (an amend never blesses a hand edit). Blocks, started_at, history and session carry
  forward; contract.json gains an `amendments[]` entry and the seal hash moves with it.

Anti-gaming (S4):
  * `--protect-tests GLOBS` (start only) snapshots per-file assertion counts and lines (after
    stripping comments by the file type's syntax) into <cdir>/tests-baseline.json (its sha sealed in contract.json) and
    auto-adds `tests-not-weakened`: red when a baselined file is missing, loses assertions, or gains
    a vacuous one (`assert True[, msg]`, `assert(True)`, `… or True`, `assert x == x`, ...). Blind,
    without an AST: `if False:`, a body in a string, early return, renamed test, skip markers,
    `==`→`!=`, a broadened pytest.raises, a weakened expected value.
  * `--checker ID=PATH` copies PATH to <cdir>/checkers/<ID><ext>; path and sha live in contract.json.
    The condition runs the SEALED copy (`.py` by the interpreter resolved at start, `.sh` by
    /bin/bash), hashed again right before it runs. A copy that no longer matches is
    `CHECKER TAMPERED: <ID>` — exactly as a tampered contract: met impossible, caps still release.
  * `--red-proof ID=DIR` runs the sealed checker against a deliberately broken fixture at seal; a
    checker that passes there is refused, and so is a DIR that is the workspace, an ancestor of it
    or inside .drive/. Unproven checkers are named in the announce line.
  * Every sweep (gate, check, collect, close, start's seal sweep, amend, red-proof) runs a condition
    as `/bin/bash -o pipefail -c CMD` in its own process group, with a SCRUBBED env: the PATH, HOME,
    USER, LANG, LC_ALL, TMPDIR, TERM snapshot taken at `start` plus `--pass-env` names, sealed in
    contract.json (`env`; amend cannot change it), plus PYTHONNOUSERSITE=1 and PYTHONDONTWRITEBYTECODE=1.
    BASH_ENV, ENV, BASH_FUNC_*, SHELLOPTS & co. never pass; no PYTHON* name passes except PYTHONPATH/
    PYTHONUSERBASE under `start --allow-user-site "<reason>"`. A
    timeout kills the whole group; the post-kill drain is bounded by the gate deadline.
  * Python startup (Y1/Y2/Z1): the auto conditions run `<sealed python> -I -S <drive.py> ...` (drive.py
    imports only the stdlib), immune to every site startup file; `.py` checkers run `<sealed python> -s -c
    <runner> <copy>` with the workspace at sys.path[0]. The interpreter's realpath and sha256 are sealed,
    and so is its startup set: at `start` the interpreter lists its site dirs under -S and contract.json
    `startup` records every `*.pth`, sitecustomize, usercustomize and pyvenv.cfg there (the user site only
    under --allow-user-site). Each is re-scanned before and after every sweep and before each condition:
    `INTERPRETER TAMPERED: <path>` / `INTERPRETER TAMPERED: startup file <path>`. An interpreter inside the
    workspace is REFUSED unless --allow-workspace-python "<reason>": its installed packages are NOT hashed.
    Other workspace PATH entries are announced (`WARNING: WORKSPACE ON PATH`); binaries there are not hashed.
    `--pass-env` refuses every PYTHON* name (PYTHONPATH/PYTHONUSERBASE only with --allow-user-site).
  * The seal is verified BEFORE and AFTER every sweep in gate, check, collect and close: the
    contract bytes are hashed, parsed and run as read; contract, baseline and checker copies are
    re-hashed afterwards. A break at either end is tamper (never met, never a first-green stamp).

Report (S5): the auto `report` condition is `drive.py report-check --cdir <cdir>` — sections,
  headings outside fences, a 400-char / 40-distinct-word prose floor outside fences, every
  condition id, every collected agent, the `planned P, dispatched D` line, every --known-incomplete
  text under ## Unverified, every --map key under ## Outcome (unmapped ones under ## Unverified
  too), the collected CONVERGED verdict when verify is required, and no outstanding agent (every
  briefed agent collected or cancelled). Map and known-incomplete never appear in block reasons.

Cancel (Y3): `cancel` writes agents/<name>/.cancelled (nothing is moved or deleted); it refuses a
  collected agent and a returned verify-* (collect it). A cancelled agent is never outstanding, never a
  verdict, and must be named in REPORT.md. Z2: a `.cancelled` marker or `.collected` stamp counts only with its
  audit.jsonl event (cancelled / clean collected, not undone by uncancelled / a redispatching brief); a
  hand-written one is ignored and `check`/`status` print `NOT ATTESTED: <agent> <marker>`.

Returns: a worker/relay RETURN.md's first line is RETURN_FIRST_LINE_FORM (`unmet=[<ids>]` or
  `INCOMPLETE: ...`), a verifier's `VERDICT: ...`; the brief prints the form and `collect` refuses
  (rc 1, no stamp) any other.

Contracts this file keeps:
  * FAIL-OPEN: any crash in `gate` exits 0 → the stop is allowed. A Stop hook that
    exits non-zero would make the session unstoppable. A block is recorded in state.json
    BEFORE its reason is rendered. `gate` prints NOTHING on a
    plain allow (a paused drive's allow carries one systemMessage line) and exactly ONE stderr line when it fails open, naming what was
    missing or corrupt.
  * Blocks are signalled ONLY by {"decision":"block"} on stdout with exit 0.
  * A sibling session in the same repo is never blocked (session binding).
  * Caps always win on a LIVE drive: blocks >= max_blocks or wall >= max_minutes → terminal
    `capped`, stop allowed (a paused drive allows the stop before any cap is read). No path here can trap the operator — not a tampered
    contract, not an exhausted gate budget.
  * Conditions are evaluated BEFORE the caps are applied, so a drive that goes
    all-green on the cap boundary records `met`, not `capped`.
  * The gate keeps its whole condition sweep inside `gate_budget` (0.8 × the Stop
    hook's own timeout). A condition it cannot run reports `NOT RUN — gate budget
    exhausted` and counts UNMET; a killed hook would otherwise allow the stop with
    conditions still red and nothing audited.
  * Tamper-EVIDENCE: contract.json (and tests-baseline.json, and every sealed checker
    copy) is hashed at seal and at every amend. The gate, `check` and `close` re-hash
    them; a mismatch is audited, said out loud, and makes `met` impossible until the
    seal is restored. The caps still release.
  * Only an audited `abort` settles a drive. A hand-written ABORT.md ends nothing.
  * A contract that is already green at seal is refused ("nothing to drive")
    unless every green id is named in --allow-green and ≥1 condition is red.
  * `start` refuses before it creates anything: a refused seal leaves no directory.
  * ENFORCEMENT PRECONDITION: the block only exists if a Stop hook running `drive.py gate`
    is registered in the session. SKILL.md's frontmatter declares it (`hooks: Stop:`), and
    Claude Code registers it when /drive is invoked and keeps it for the rest of that session
    process — NOT across `claude --resume`, which needs /drive typed again (the SessionStart
    hook `session-resume-gates.sh` says so). `start` refuses a seal when `hook-status` finds
    neither that declaration nor a settings-file copy, unless `--unhooked "<reason>"` is given
    — a text that promises the stop is blocked while nothing blocks it is worse than no text at
    all. `--unhooked` is honoured over a frontmatter-only declaration (drive.py cannot see
    whether this process invoked the skill) and ignored when a settings copy exists.
  * No settings hook is wired by default: it ran after every response of every session. The
    settings copy (`install-hook`) is an explicit opt-in, and Claude Code watches settings files
    — measured 2026-09-15 (claude 2.1.272): a Stop hook written between two turns fired on the
    next turn, so it gates the running session too.
  * PAUSE (P1–P4): `pause` is honoured only when the operator's latest entry in the BOUND session's
    transcript (derived from the session id — never a flag or a Stop payload; a typed prompt or a
    prompt queued mid-turn; after the seal and the last resume) is a short, un-negated pause/hold/stop
    order (a clause that leads with the verb — HOLD_CLAUSE_RE — or `! drive.py pause`). It is audited; a state.json `paused_at` with no matching audit
    event is ignored (enforced, said out loud). While paused the gate allows every stop with no sweep,
    no block, no cap, printing one `systemMessage` line; wall time excludes paused spans. `resume`
    re-arms: the stall ladder restarts. Honest limit: a process that writes the harness transcript,
    or points HOME / the session id at a file it wrote, still forges the order — no cheaper than the
    existing `resume --session <other>` escape.
    A block whose latest operator entry reads as a hold adds "if they asked to pause, run pause" —
    a THIRD legal move; the stall ladder stays on, because a regex misread must not switch it off.
  * EMPTY BLOCKS (P4): a stop is `empty` when, since the last block, the bound session's own
    transcript gained the harness's record of that block, no tool call, no assistant text, and
    ≤ EMPTY_GROWTH_BYTES otherwise. `--auto-pause-empty N` (OPT-IN; default 0 = never) consecutive
    empty ones pause the drive (audited `paused by gate-empty`), never while an agent is out. Off by
    default because a model can end turns silently on purpose to trigger it. A text-only
    turn is never empty: "all done" repeated is a model declaring done, which the gate refuses.
  * A CRASH IS NOT A RED (P10): at seal and amend, a red condition that exits 126/127, dies in the
    interpreter (an import/syntax error line after a traceback frame, `python: No module named`) or
    in its own bash syntax is REFUSED unless `--allow-crash-red` names it.
  * REPEATS ARE SHORT (P5): a block whose unmet ids, last output lines, stall tier, agents and
    warnings match the previous block's prints a short form that still carries every warning.
  * TRANSCRIPT MEASURES (P7): growth excludes the harness's own records of the gate's blocks; the
    first block after any resume, or on another transcript file, is a baseline.
  * ONE STOP, ONE COUNT: hooks are not deduplicated by Claude Code, so a settings copy next to
    the frontmatter hook fires the gate twice per stop. `gate` identifies the stop event
    (session, prompt id, transcript path and byte count at firing start) and a second firing of
    the same event replays the first decision without bumping `blocks` or auditing again.
"""
import argparse
import collections
import contextlib
import fcntl
import fnmatch
import hashlib
import json
import os
import re
import shlex
import shutil
import signal
import subprocess
import sys
import time
import uuid
from datetime import datetime, timezone

DRIVE_DIRNAME = ".drive"
REPORT_SECTIONS = ("## Outcome", "## Evidence", "## Agents", "## Unverified")
DEFAULT_MAX_BLOCKS = 40
DEFAULT_MAX_MINUTES = 240
DEFAULT_TIMEOUT = 60  # per condition, seconds — conditions run SERIALLY inside one hook firing
DEFAULT_HOOK_TIMEOUT = 600  # MUST mirror the Stop-hook `timeout` wired in settings.json
GATE_BUDGET_FRAC = 0.8  # of that: the gate must PRINT its decision before the harness kills it
STALL_K = 2  # identical unmet set for this many consecutive blocks → dispatch hint
STALL_HARD = 4  # → abort-or-dispatch demand
DEFAULT_RELAY_MB = 1.5  # transcript growth per block that flags "work done in main context"
DEFAULT_MAX_AGENTS = 4  # concurrent outstanding agents; `brief` refuses past it
SPINE_EVERY = 3  # the 4-bullet discipline spine rides on block 1 and every 3rd block
RETURN_MAX_LINES = 60  # a worker's RETURN.md is a summary; the parent never reads more
CANCELLED_DIRNAME = "_cancelled"  # legacy only: drives cancelled before the marker still read correctly
CANCELLED_MARKER = ".cancelled"  # written by `cancel`; nothing is moved or deleted
COLLECTED_STAMP = ".collected"  # written by `collect`; `verified` refuses a verdict without it
CODEX_LOG_TAIL = 40
MIN_CONDS, MAX_CONDS = 2, 24  # user conditions (--cond + --checker); auto ones are extra
DECOMPOSE_RULE = ("one condition per enumerated ask member; whole-tree invariants sit alongside, "
                  "never instead")
TESTS_COND = "tests-not-weakened"
RESERVED_IDS = ("report", TESTS_COND)
TESTS_BASELINE = "tests-baseline.json"
CHECKERS_DIRNAME = "checkers"
REPORT_PROSE_FLOOR = 400  # chars of non-heading text outside ``` / ~~~ fences
MAP_KEY_MAX = 40
ASSERT_RES = [re.compile(p) for p in (
    r"^\s*assert\b", r"\bself\.assert\w*\(", r"\bpytest\.raises\(", r"\bexpect\(",
    r"\bassert\.\w+\(", r"\brequire\.\w+\(", r"\bt\.(Error|Fatal)f?\(")]
# Matched on comment-stripped, whitespace-normalised lines.
# Matched ONLY on assertion lines, after comment stripping and string masking (so `tokens("x or True")`
# is not red, while the masked `hash(k) == hash(k)` still is).
VACUOUS_RES = [re.compile(p) for p in (
    r"assert\s*\(?\s*(True|1|not\s+False)\s*\)?\s*(,.*)?$", r"assertTrue\(\s*(True|1)\s*[,)]",
    r"expect\(\s*true\s*\)", r"assert\s*\(?\s*(\S+)\s*==\s*\1\s*\)?\s*(,.*)?$", r"\bor\s+True\b",
    r"assert\s+True\s+or\b", r"assert\s+(['\"])[^'\"]*\1\s*$", r"assert\s+not\s+not\s+True",
    r"assert\s+(\w+)\s+is\s+\1\b", r"self\.assert(Equal|Is)\(\s*(\S+?)\s*,\s*\2\s*[,)]",
    r"expect\(\s*(\S+?)\s*\)\.to(Be|Equal)\(\s*\1\s*\)", r"assert\.ok\(\s*true\s*\)")]
HASH_COMMENT_EXTS = (".py", ".rb", ".sh", ".pl", ".r", ".yaml")
SLASH_COMMENT_EXTS = (".js", ".jsx", ".ts", ".tsx", ".go", ".java", ".kt", ".swift", ".c", ".cc", ".cpp", ".h",
                      ".rs", ".cs", ".scala", ".dart", ".php")
REPORT_MIN_WORDS = 40  # distinct words (≥ 3 letters, case-folded) outside fences
# Conditions never see the caller's environment: only these names, snapshotted at `start` and sealed in
# contract.json (`env`), plus `start --pass-env` names. BASH_ENV & co. can never be passed.
ENV_KEYS = ("PATH", "HOME", "USER", "LANG", "LC_ALL", "TMPDIR", "TERM")
UNPASSABLE_ENV = ("BASH_ENV", "ENV", "SHELLOPTS", "BASHOPTS", "PS4", "CDPATH", "GLOBIGNORE")
# Python reads startup files (usercustomize/sitecustomize/.pth) and these variables before any condition code:
# refused as --pass-env names unless `start --allow-user-site`, which then admits only USER_SITE_PASSABLE.
PYTHON_STARTUP_ENV = ("PYTHONPATH", "PYTHONHOME", "PYTHONSTARTUP", "PYTHONUSERBASE", "PYTHONNOUSERSITE",
                      "PYTHONINSPECT", "PYTHONSAFEPATH")
USER_SITE_PASSABLE = ("PYTHONPATH", "PYTHONUSERBASE")
INTERPRETER_BREAK = "interpreter:"  # prefix of a seal-break entry naming the sealed interpreter
STARTUP_BREAK = "startup file "  # INTERPRETER_BREAK + this + path: a sealed startup file changed (Z1b)
STARTUP_RUN_TAMPER = "INTERPRETER TAMPERED at run time"
# Startup files Python runs before any condition code: `*.pth` in a site dir, and sitecustomize /
# usercustomize (module, bytecode, extension or package) anywhere on the startup sys.path.
STARTUP_CUSTOMIZE_RE = re.compile(r"^(sitecustomize|usercustomize)(\..*)?$")
# Run by the sealed interpreter under -S (no site import, so no startup file runs): its site dirs, computed
# as site.py would (venv prefix from pyvenv.cfg first), the user site, and the no-site sys.path.
STARTUP_PROBE = (
    "import json,os,site,sys\n"
    "e=os.path.dirname(os.path.abspath(sys.executable))\n"
    "cfg=[os.path.join(e,'pyvenv.cfg'),os.path.join(os.path.dirname(e),'pyvenv.cfg')]\n"
    "pre=[os.path.dirname(e)] if any(os.path.isfile(c) for c in cfg) else []\n"
    "for p in (sys.prefix,sys.exec_prefix,sys.base_prefix,sys.base_exec_prefix):\n"
    "    p not in pre and pre.append(p)\n"
    "print(json.dumps({'site':site.getsitepackages(pre),'user':site.getusersitepackages(),"
    "'path':[p for p in sys.path if p and os.path.isabs(p)],'cfg':cfg}))\n")
# `.py` checker runner: the WORKSPACE (the condition's cwd) at sys.path[0], the sealed copy run as __main__.
CHECKER_RUNNER = ("import os,runpy,sys; p=sys.argv[1]; sys.argv=sys.argv[1:]; sys.path[0]=os.getcwd(); "
                  "runpy.run_path(p, run_name='__main__')")
BASH = "/bin/bash"
CHECKER_RUN_TAMPER = "CHECKER TAMPERED at run time"
# The ONE prescribed first line of a worker/relay RETURN.md: the brief prints FORM, `collect` enforces RE.
RETURN_FIRST_LINE_FORM = "`unmet=[<ids>]` (as `check` prints it; `unmet=[]` when yours are green) or `INCOMPLETE: <what is missing>`"
RETURN_FIRST_LINE_RE = re.compile(r"^(unmet=\[[^\]]*\](\s.*)?|INCOMPLETE:\s*\S.*)$")
VERDICTS = ("VERDICT: CONVERGED", "VERDICT: NOT-CONVERGED")
VERDICT_FORM = "`VERDICT: CONVERGED` or `VERDICT: NOT-CONVERGED`"
TRACEBACK = "Traceback (most recent call last)"
# A red at seal that is a CRASH, not a detection (P10): bash's "not executable" / "command not found", or a
# Python interpreter dying on its imports or its syntax (the LAST output line — unittest/pytest failure output
# that merely quotes a traceback ends on its own summary line, not on these).
CRASH_RCS = (126, 127)
CRASH_LAST_LINE_RE = re.compile(r"^(ModuleNotFoundError|ImportError|SyntaxError|IndentationError)(:|$)")
CRASH_FRAME_RE = re.compile(r'^\s*File ".*", line \d+')
CRASH_LAUNCH_RE = re.compile(r"python[\d.]*: (No module named |can't open file )")  # `python -m x` / `python x.py`
CRASH_BASH_SYNTAX_RE = re.compile(r"^(/bin/)?bash: (-c: )?line \d+: syntax error")
# Pause (P1–P4). The gate lets every stop through while a drive is paused; only `resume` ends a pause.
# `pause` is honoured only when the operator's LATEST typed prompt (after the seal) asks for it: the model can
# never author that entry, so it cannot pause its way past a red gate. Tamper-evidence, not proof — a process
# that rewrites the transcript file itself still beats it.
# A hold is a CLAUSE that leads with the verb and says nothing else but where/when/what to hold: "No, stop.",
# "ok, pause the drive", "stop here for now please", "hold on — I'll resume tomorrow". "stop using mocks",
# "hold the lock longer", "don't stop", "the Stop hook fires twice" are instructions, not holds.
HOLD_CLAUSE_SPLIT_RE = re.compile(r"[.,;:!?—–]+|\s-\s|\n")
HOLD_CLAUSE_RE = re.compile(
    r"^\s*((ok|okay|please|pls|wait|alright|right|hey|yes|so|now|then|let's|lets|let us|we'll|we will|"
    r"can you|could you|time to)\s+){0,2}"
    r"(?P<verb>pause|hold|stop|halt|park)"
    r"(\s+(on|off|it|this|that|here|there|now|please|everything|all|for|the|a|drive|work|working|session|task|"
    r"today|tonight|tomorrow|later|day|moment|minute|bit|while|until|till|i'm|i|am|back|and|save|progress|"
    r"commit|what|you|have|wait|me))*\s*$", re.I)
# Any clause that says the opposite voids the whole prompt: "Stop. Do not pause the drive; keep working."
HOLD_CONTRARY_RE = re.compile(
    r"\b(don't|dont|do not|never|no need to|not)\s+(\w+\s+){0,2}(pause|hold|stop|halt|park)\b"
    r"|\bkeep (going|working)\b|\bcarry on\b", re.I)
HOLD_MAX_WORDS = 40  # a long prompt that happens to contain a hold-shaped clause is not an order
# The operator's `! drive.py pause` as a COMMAND (optionally through python3), not a grep/log that mentions it.
# A QUOTED path may contain spaces. The first form matched the path with `\S*`, so on a checkout such as
# ".../Atelier Framework/..." the operator's own `!python3 "<path>/drive.py" pause` was not recognised and the
# pause was refused — the one order the gate exists to obey, lost to a directory name.
BASH_PAUSE_RE = re.compile(
    r"^<bash-input>\s*((\"[^\"\n]*python3?(\.\d+)?\"|'[^'\n]*python3?(\.\d+)?'|(\S*/)?python3?(\.\d+)?)\s+)?"
    r"(\"[^\"\n]*drive\.py\"|'[^'\n]*drive\.py'|\S*drive\.py)\s+pause(\s+--reason\s+.*)?\s*</bash-input>\s*$",
    re.S)
# Consecutive empty blocks → the gate pauses the drive. OFF by default (start --auto-pause-empty N opts in): a model
# can end turns silently on purpose, and nothing a Stop hook sees tells that apart from an abandoned session.
AUTO_PAUSE_EMPTY = 0
AUTO_PAUSE_FLOOR = 3
EMPTY_GROWTH_BYTES = 64_000  # an "empty" turn: no tool call and at most this much non-hook transcript growth
HUMAN_SKIP_PREFIXES = ("<task-notification", "<local-command", "<system-reminder", "<bash-stdout", "<bash-stderr",
                       "Stop hook feedback", "<agent-message", "Another Claude session sent a message")
OPERATOR_ACTION_PREFIXES = ("<command-", "[Request interrupted")  # the operator's, but never a hold
HOOKED_CLOSE_REFUSAL = ("REFUSED — hooked drive — end your turn; the Stop hook closes it. "
                        "`close` is the unhooked path.")


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def epoch(ts):
    return datetime.fromisoformat(ts).timestamp()


def me():
    """This script's own absolute path. Never print a relative one: the block reason is
    the model's whole instruction sheet and it is read from an unknown cwd."""
    return os.path.realpath(__file__)


def drive_base(ws):
    return os.path.join(ws, DRIVE_DIRNAME)


def active_path(ws):
    return os.path.join(drive_base(ws), "active")


def _walk_up(start):
    """Nearest ancestor of `start` (inclusive) holding .drive/active, or None."""
    p = os.path.abspath(start)
    while True:
        if os.path.exists(active_path(p)):
            return p
        parent = os.path.dirname(p)
        if parent == p:
            return None
        p = parent


def ws_root(cwd=None):
    """Workspace of the ACTIVE drive.

    The drive lives where it was sealed, so a cwd *inside* the workspace (the model
    `cd`-ed; the hook fired from a subdir) must still find it: walk UP looking for
    `.drive/active`. Without the walk the gate finds no drive and silently allows
    every stop. Order: $DRIVE_WORKSPACE (explicit override), then the payload cwd
    and its ancestors, then CLAUDE_PROJECT_DIR, then os.getcwd(). Nothing is ever
    written outside the workspace — there is no $HOME pointer.
    """
    env = os.environ.get("DRIVE_WORKSPACE")
    if env:
        e = os.path.abspath(os.path.expanduser(env))
        if os.path.exists(active_path(e)):
            return e
    first = None
    for cand in (cwd, os.environ.get("CLAUDE_PROJECT_DIR"), os.getcwd()):
        if not cand:
            continue
        p = os.path.abspath(cand)
        if first is None:
            first = p
        found = _walk_up(p)
        if found:
            return found
    return first or os.path.abspath(os.getcwd())


def sha256_file(p):
    try:
        with open(p, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()
    except OSError:
        return None


def read_json(p, default=None):
    try:
        with open(p) as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def write_json(p, obj, sort_keys=True):
    # A shared tmp name races two concurrent gates into FileNotFoundError → fail-open
    # → a block that was decided but never counted.
    tmp = "%s.tmp.%d" % (p, os.getpid())
    with open(tmp, "w") as f:
        json.dump(obj, f, indent=2, sort_keys=sort_keys)
        # POSIX text files end in a newline. Without it, rewriting an operator's
        # settings.json turns every future diff into a spurious ±1 line.
        f.write("\n")
    os.replace(tmp, p)


@contextlib.contextmanager
def drive_lock(cdir):
    """Serialise the gate's read-modify-write of state.json.

    Best effort: if the lock cannot be taken we proceed anyway — FAIL-OPEN beats a
    Stop hook that hangs on a stale lock.
    """
    f = None
    try:
        f = open(os.path.join(cdir, ".lock"), "w")
        fcntl.flock(f, fcntl.LOCK_EX)
    except Exception:  # noqa: BLE001
        f = None
    try:
        yield
    finally:
        if f is not None:
            try:
                fcntl.flock(f, fcntl.LOCK_UN)
            finally:
                f.close()


def load_active(ws, why=None):
    """Return (cdir, contract, state) for the active drive, or (None,)*3.

    `why` (a list) collects a one-phrase reason when a drive pointer exists but the
    drive behind it does not load — the gate turns that into its single fail-open line.
    """
    try:
        with open(active_path(ws)) as f:
            did = f.read().strip()
    except OSError:
        return None, None, None  # no drive here at all: not a fail-open, say nothing
    cdir = os.path.join(drive_base(ws), did)
    contract = read_json(os.path.join(cdir, "contract.json"))
    state = read_json(os.path.join(cdir, "state.json"))
    if not contract or not state:
        if why is not None:
            missing = []
            if not contract:
                missing.append("contract.json")
            if not state:
                missing.append("state.json")
            why.append(f"{cdir}: {' and '.join(missing)} missing or corrupt")
        return None, None, None
    return cdir, contract, state


def audit(cdir, event, **kw):
    rec = {"ts": now_iso(), "event": event, **kw}
    p = os.path.join(cdir, "audit.jsonl")
    lead = ""
    try:
        with open(p, "rb") as f:
            f.seek(-1, os.SEEK_END)
            lead = "" if f.read(1) == b"\n" else "\n"  # a hand append with no newline never swallows this event
    except OSError:
        pass
    with open(p, "a") as f:
        f.write(lead + json.dumps(rec, sort_keys=True) + "\n")


def audit_events(cdir, event):
    """Every audit.jsonl record of `event`, oldest first (unreadable lines skipped)."""
    out = []
    try:
        with open(os.path.join(cdir, "audit.jsonl")) as f:
            for ln in f:
                try:
                    rec = json.loads(ln)
                except ValueError:
                    continue
                if isinstance(rec, dict) and rec.get("event") == event:
                    out.append(rec)
    except OSError:
        pass
    return out


def outcome_attested(cdir, state):
    """A state `outcome` counts only when audit.jsonl holds a matching `terminal` event
    (set_terminal appends the audit line BEFORE it writes state.json)."""
    o = state.get("outcome")
    return o is None or any(r.get("outcome") == o for r in audit_events(cdir, "terminal"))


def attest_outcome(cdir, state, quiet=False):
    """STATE TAMPERED check. An unattested outcome is dropped IN MEMORY (the drive is live again)
    and returned; None when the outcome is absent or attested."""
    if outcome_attested(cdir, state):
        return None
    bad = state.get("outcome")
    state["outcome"] = None
    state.pop("ended_at", None)
    if not quiet:
        audit(cdir, "state_tampered", outcome=bad)
    return bad


def state_tamper_line(bad):
    return f"STATE TAMPERED: outcome {bad} not attested by audit.jsonl"


def audited_first_green(cdir):
    """The ts of the first `first_green` audit event, or None. The freeze reads this too, so
    deleting state.first_green_at unfreezes nothing."""
    ev = audit_events(cdir, "first_green")
    return (ev[0].get("ts") or "unknown") if ev else None


def snapshot_env(pass_names, allow_user_site=False):
    env = {k: os.environ[k] for k in ENV_KEYS if k in os.environ}
    for n in pass_names:
        env[n] = os.environ[n]
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    if not allow_user_site:
        env["PYTHONNOUSERSITE"] = "1"  # a usercustomize.py/.pth in the sealed HOME's user site never runs
    return env


def condition_env(contract):
    """The SCRUBBED environment every condition runs in: the sealed `env` of the contract. A contract
    sealed before `env` existed gets the fixed keys only — never the caller's whole environment."""
    contract = contract or {}
    env = contract.get("env")
    if not isinstance(env, dict):
        env = {k: os.environ[k] for k in ENV_KEYS if k in os.environ}
    out = {str(k): str(v) for k, v in env.items()
           if str(k) not in UNPASSABLE_ENV and not str(k).startswith("BASH_FUNC_")}
    allow = bool(contract.get("allow_user_site"))
    for k in [k for k in out if python_env_refused(k, allow)]:
        out.pop(k)
    out["PYTHONDONTWRITEBYTECODE"] = "1"
    if not allow:
        out["PYTHONNOUSERSITE"] = "1"
    return out


def python_env_refused(name, allow_user_site=False):
    """Z3: every PYTHON* name is refused, except PYTHONPATH and PYTHONUSERBASE under --allow-user-site."""
    return name.startswith("PYTHON") and not (allow_user_site and name in USER_SITE_PASSABLE)


def parse_pass_env(specs, allow_user_site=False):
    names = []
    for spec in specs or []:
        for n in (x.strip() for x in spec.split(",")):
            if not n:
                continue
            if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", n) or n in UNPASSABLE_ENV or n.startswith("BASH_FUNC_"):
                sys.exit(f"REFUSED — --pass-env {n!r}: not a passable variable name "
                         f"({', '.join(UNPASSABLE_ENV)} and BASH_FUNC_* never reach a condition)")
            if python_env_refused(n, allow_user_site):
                sys.exit(f"REFUSED — --pass-env {n}: a Python startup variable (every PYTHON* name, e.g. "
                         + ", ".join(PYTHON_STARTUP_ENV) + ") can change what every python condition runs. "
                         "`start --allow-user-site \"<reason>\"` admits only " + " and ".join(USER_SITE_PASSABLE))
            if n not in os.environ:
                sys.exit(f"REFUSED — --pass-env {n}: not set at start; its value is snapshotted and sealed now")
            if n not in names and n not in ENV_KEYS:
                names.append(n)
    return names


def run_shell(cmd, cwd, t, env=None, deadline=None):
    """→ (returncode | None on timeout, combined output). `/bin/bash -o pipefail` (absolute: a fake
    `bash` on PATH is never run), so a pipeline fails when ANY stage fails. `env` is the sealed,
    scrubbed condition env — never the caller's. Its own process group, so a timeout kills
    grandchildren too. The post-kill drain (an escaped grandchild may hold the pipe) is bounded by
    `deadline`, so a budgeted sweep never overruns its budget by the drain."""
    if env is None:
        env = condition_env({})
    p = subprocess.Popen([BASH, "-o", "pipefail", "-c", cmd], cwd=cwd, env=env, stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, text=True,
                         start_new_session=True)
    try:
        out, _ = p.communicate(timeout=t)
        return p.returncode, out or ""
    except subprocess.TimeoutExpired:
        try:
            os.killpg(os.getpgid(p.pid), signal.SIGKILL)
        except Exception:  # noqa: BLE001
            pass
        drain = 5.0 if deadline is None else max(0.0, min(5.0, deadline - time.time()))
        try:
            out, _ = p.communicate(timeout=drain)
        except Exception:  # noqa: BLE001
            out = ""
        return None, out or ""


def run_condition(cond, ws, timeout, deadline=None, cwd=None, env=None):
    """Run one condition; return (met: bool, tail: str).

    `deadline` is the absolute time by which the WHOLE gate sweep must be able to
    print. A condition that cannot be run inside it is UNMET and says so — never a
    silent pass, because a Stop hook killed by its own timeout produces no decision
    and the stop is then allowed with conditions still red.
    """
    t = cond.get("timeout", timeout)
    if deadline is not None:
        left = deadline - time.time()
        if left <= 0:
            return False, "NOT RUN — gate budget exhausted (not run is never 'met')"
        t = min(t, left)
    ck = cond.get("checker")
    if isinstance(ck, dict) and sha256_file(ck.get("path") or "") != ck.get("sha256"):
        # hashed right before it runs: a copy swapped in by an earlier condition and restored later
        # would pass the before- and after-sweep hashes
        return False, f"{CHECKER_RUN_TAMPER}: its sealed copy does not match the seal hash"
    try:
        rc, out = run_shell(cond["cmd"], cwd or ws, t, env=env, deadline=deadline)
        if rc is None:
            return False, f"TIMEOUT after {t:g}s"
        lines = out.strip().splitlines()
        tail = "\n".join(lines[-4:]) if lines else "(no output)"
        return rc == 0, f"exit {rc}: {tail}"
    except Exception as e:  # noqa: BLE001
        return False, f"error: {e}"


def sealed_python(contract):
    return (contract or {}).get("python") or os.path.abspath(sys.executable)


def self_cmd(python, *args):
    """An auto condition runs drive.py by the SEALED interpreter as `-I -S` (-I: no user site, no PYTHON* env,
    no script dir on sys.path; -S: no site import, so no `.pth`/sitecustomize in ANY site dir runs, a workspace
    venv's included) — never `python3` via PATH. drive.py imports only the stdlib (Z1a)."""
    return " ".join([shlex.quote(python), "-I", "-S", shlex.quote(me())] + [shlex.quote(x) for x in args])


def report_condition(cdir, verify=True, python=None):
    # Every path here is absolute and quoted: this condition is re-run by the gate, by
    # `check`, and by workers from their own cwd, so `report-check` must be pinned to THIS
    # drive dir rather than resolving whatever CLAUDE_PROJECT_DIR points at.
    cmd = self_cmd(python or os.path.abspath(sys.executable), "report-check", "--cdir", cdir)
    desc = (f"REPORT.md at {cdir}/REPORT.md passes `report-check` (sections {', '.join(REPORT_SECTIONS)}; "
            f"≥{REPORT_PROSE_FLOOR} chars of prose outside fences; every condition id and collected agent "
            "named; the 'planned P, dispatched D' line; known-incomplete + map rows placed)")
    if verify:
        desc += "; AND the newest agents/verify-*/RETURN.md opens with 'VERDICT: CONVERGED' and is collected"
    return {"id": "report", "desc": desc, "cmd": cmd}


# ------------------------------------------------------------- seals: contract, baseline, checkers

def checker_cmd(path, python=None, user_site=False):
    """The condition command that runs a SEALED checker copy: .py → the interpreter resolved and sealed
    at start (absolute), `-s` (unless --allow-user-site) and the runner that puts the workspace at
    sys.path[0]; .sh → /bin/bash, else exec."""
    ext = os.path.splitext(path)[1].lower()
    q = shlex.quote(path)
    if ext == ".py":
        return " ".join([shlex.quote(python or os.path.abspath(sys.executable))] + ([] if user_site else ["-s"])
                        + ["-c", shlex.quote(CHECKER_RUNNER), q])
    return f"{BASH} {q}" if ext == ".sh" else q


def seal_breaks(cdir, contract, state, live_sha=None):
    """→ (files, checker_ids): sealed files whose live hash no longer matches, and sealed checker
    copies that no longer match. Either one makes `met` impossible (never a trap: caps release).
    Checker path+sha and the tests-baseline sha are read from the CONTRACT (itself hashed), never
    from state.json. `live_sha`: the hash of the contract bytes the caller already parsed."""
    files = []
    sealed = state.get("contract_sha256")
    live = sha256_file(os.path.join(cdir, "contract.json")) if live_sha is None else live_sha
    if not sealed or live != sealed:
        files.append("contract.json")
    tb = contract.get("tests_baseline_sha256") or (
        None if "tests_baseline_sha256" in contract else state.get("tests_baseline_sha256"))
    if (tb or contract.get("protect_tests")) and sha256_file(os.path.join(cdir, TESTS_BASELINE)) != tb:
        files.append(TESTS_BASELINE)
    ids = []
    for c in contract.get("conditions", []):
        ck = c.get("checker")
        if isinstance(ck, dict) and (not ck.get("path") or sha256_file(ck["path"]) != ck.get("sha256")):
            ids.append(c["id"])
    ib = interpreter_break(contract)
    if ib:
        ids.append(INTERPRETER_BREAK + ib)
    ids += [INTERPRETER_BREAK + STARTUP_BREAK + p for p in startup_breaks(contract)]
    return files, ids


def _startup_digest(p):
    """sha256 of a startup file; a package dir hashes its whole tree (relative names + file hashes)."""
    if os.path.isdir(p):
        h = hashlib.sha256(b"dir\0")
        for root, dirs, files in os.walk(p):
            dirs.sort()
            for fn in sorted(files):
                fp = os.path.join(root, fn)
                h.update(os.path.relpath(fp, p).encode() + b"\0" + (sha256_file(fp) or "-").encode() + b"\0")
        return "dir:" + h.hexdigest()
    return sha256_file(p) or "unreadable"


def _pth_dirs(pth, site_dir):
    """Directories a `.pth` adds to sys.path (a sitecustomize there runs too); `import` lines add none."""
    out = []
    try:
        with open(pth, errors="replace") as f:
            for ln in f:
                ln = ln.rstrip("\n").strip()
                if not ln or ln.startswith("#") or ln.startswith(("import ", "import\t")):
                    continue
                d = os.path.normpath(os.path.join(site_dir, ln))
                if os.path.isdir(d):
                    out.append(d)
    except OSError:
        pass
    return out


def startup_scan(sealed):
    """→ {path: digest} of every startup file the sealed dir set holds NOW: `*.pth` in site dirs; sitecustomize /
    usercustomize (and their __pycache__ bytecode) in every dir; the pyvenv.cfg candidates. Absent = not listed."""
    files = {}
    dirs = sealed.get("dirs") or {}
    for d, kind in dirs.items():
        for sub in (d, os.path.join(d, "__pycache__")):
            try:
                names = sorted(os.listdir(sub))
            except OSError:
                continue
            for n in names:
                p = os.path.join(sub, n)
                if STARTUP_CUSTOMIZE_RE.match(n) or (sub == d and kind == "site" and n.endswith(".pth")):
                    files[p] = _startup_digest(p)
    for c in sealed.get("cfg") or []:
        if os.path.lexists(c):
            files[c] = _startup_digest(c)
    return files


def probe_startup(pythons, env, cwd, allow_user_site):
    """Z1b, at `start`: run each interpreter once with -S (no site import) to list its startup dirs, then hash
    the startup files in them. → (sealed dict | None, error text). The first interpreter is the sealed one and
    must answer; others (the `python3` the sealed PATH resolves to) are best effort."""
    dirs, cfg, probed = {}, [], []
    for i, py in enumerate(pythons):
        try:
            r = subprocess.run([py, "-S", "-c", STARTUP_PROBE], env=env, cwd=cwd, capture_output=True, text=True,
                               timeout=30, stdin=subprocess.DEVNULL)
            info = json.loads(r.stdout.strip().splitlines()[-1])
        except Exception as e:  # noqa: BLE001
            if i == 0:
                return None, f"{py} -S could not list its site dirs ({e!r})"
            continue
        probed.append(py)
        sites = list(info.get("site") or []) + ([info["user"]] if allow_user_site and info.get("user") else [])
        for d in sites:
            dirs.setdefault(os.path.normpath(d), "site")
        for d in info.get("path") or []:
            dirs.setdefault(os.path.normpath(d), "path")
        cfg += [c for c in info.get("cfg") or [] if c not in cfg]
    for d, kind in list(dirs.items()):
        if kind != "site":
            continue
        try:
            pths = [n for n in os.listdir(d) if n.endswith(".pth")]
        except OSError:
            continue
        for n in sorted(pths):
            for extra in _pth_dirs(os.path.join(d, n), d):
                dirs.setdefault(extra, "path")
    sealed = {"interpreters": probed, "dirs": dirs, "cfg": cfg}
    sealed["files"] = startup_scan(sealed)
    return sealed, ""


def startup_breaks(contract):
    """Paths of startup files added, removed or changed since the seal (sorted); [] when intact or unsealed."""
    sealed = (contract or {}).get("startup")
    if not isinstance(sealed, dict):
        return []
    want = sealed.get("files") or {}
    now = startup_scan(sealed)
    return sorted(p for p in set(want) | set(now) if want.get(p) != now.get(p))


def interpreter_break(contract):
    """The sealed interpreter's path when it no longer resolves to the sealed realpath or no longer hashes
    to the sealed sha256; None when intact (or sealed before Y2)."""
    want = contract.get("python_sha256")
    if not want:
        return None
    py = contract.get("python") or ""
    real = contract.get("python_realpath") or ""
    if os.path.realpath(py) != real or sha256_file(real) != want:
        return py or real
    return None


def read_contract(cdir):
    """→ (contract parsed from the very bytes that were hashed, their sha256). (None, sha|None) when
    missing or unparseable."""
    try:
        with open(os.path.join(cdir, "contract.json"), "rb") as f:
            raw = f.read()
    except OSError:
        return None, None
    sha = hashlib.sha256(raw).hexdigest()
    try:
        c = json.loads(raw)
    except ValueError:
        return None, sha
    return (c if isinstance(c, dict) and isinstance(c.get("conditions"), list) else None), sha


def sealed_sweep(cdir, contract, state, ws):
    """The seal is verified BEFORE and AFTER every sweep: read contract.json once, hash those bytes,
    parse the same bytes, run them, then re-hash contract, checker copies and baseline. A break at
    either end (or a checker copy that fails its run-time hash) is a break.
    → (contract actually run, res, files, checker_ids)."""
    parsed, live = read_contract(cdir)
    if parsed is not None:
        contract = parsed
    files, ids = seal_breaks(cdir, contract, state, live_sha=live if parsed is not None else "")
    res = evaluate(cdir, contract, ws, budget=gate_budget(contract))
    f2, i2 = seal_breaks(cdir, contract, state)
    run_ids = [i for i, m, t in res if not m and t.startswith(CHECKER_RUN_TAMPER)]
    run_ids += [INTERPRETER_BREAK + t.split(": ", 1)[1] for i, m, t in res
                if not m and t.startswith(STARTUP_RUN_TAMPER + ": ")]
    files += [f for f in f2 if f not in files]
    ids += [i for i in i2 + run_ids if i not in ids]
    return contract, res, files, ids


def tamper_lines(files, ids):
    out = []
    if files:
        out.append(
            "CONTRACT TAMPERED — met is impossible until the seal is restored. "
            f"{' and '.join(files)} no longer match{'es' if len(files) == 1 else ''} the seal hash. "
            "A weakened condition is a RED condition. Restore the sealed contract, or — if the contract "
            "was genuinely wrong — `abort` and re-seal in the open. The caps still release this drive; "
            "nothing here traps you.")
    for cid in ids:
        if cid.startswith(INTERPRETER_BREAK + STARTUP_BREAK):
            out.append(f"INTERPRETER TAMPERED: {cid[len(INTERPRETER_BREAK):]} — a Python startup file (.pth, "
                       "sitecustomize, usercustomize, pyvenv.cfg) of the sealed interpreter was added, removed or "
                       "changed since the seal; met is impossible until it is restored. The caps still release "
                       "this drive; nothing here traps you.")
            continue
        if cid.startswith(INTERPRETER_BREAK):
            out.append(f"INTERPRETER TAMPERED: {cid[len(INTERPRETER_BREAK):]} — the sealed interpreter no longer "
                       "resolves to or hashes to its seal; met is impossible until it is restored. The caps "
                       "still release this drive; nothing here traps you.")
            continue
        out.append(
            f"CHECKER TAMPERED: {cid} — its sealed copy no longer matches the seal hash; met is impossible "
            "until it is restored. The caps still release this drive; nothing here traps you.")
    return out


def audit_breaks(cdir, state, files, ids):
    if "contract.json" in files:
        audit(cdir, "contract_tampered", sealed=state.get("contract_sha256"),
              live=sha256_file(os.path.join(cdir, "contract.json")))
    if TESTS_BASELINE in files:
        audit(cdir, "tests_baseline_tampered", sealed=state.get("tests_baseline_sha256"),
              live=sha256_file(os.path.join(cdir, TESTS_BASELINE)))
    ck = [i for i in ids if not i.startswith(INTERPRETER_BREAK)]
    if ck:
        audit(cdir, "checker_tampered", ids=ck)
    if len(ck) != len(ids):
        audit(cdir, "interpreter_tampered", path=contract_python_break(ids),
              paths=[i[len(INTERPRETER_BREAK):] for i in ids if i.startswith(INTERPRETER_BREAK)][:20])


def contract_python_break(ids):
    return next((i[len(INTERPRETER_BREAK):] for i in ids if i.startswith(INTERPRETER_BREAK)), None)


def stamp_first_green(cdir, state, via):
    """First all-green, untampered evaluation → state.first_green_at (+ audit). Returns True if
    THIS call stamped it. The caller holds the drive lock and passes a freshly read state."""
    if state.get("first_green_at") or state.get("outcome") is not None:
        return False
    stamped = ensure_first_green(cdir, state, via)
    write_json(os.path.join(cdir, "state.json"), state)
    return stamped


def ensure_first_green(cdir, state, via):
    """Set state.first_green_at without writing state. An audited first green is RESTORED (its ts),
    never re-stamped later. → True only when this call stamped a new one."""
    if state.get("first_green_at"):
        return False
    prior = audited_first_green(cdir)
    if prior:
        state["first_green_at"] = prior
        audit(cdir, "first_green_restored", ts=prior, via=via)
        return False
    state["first_green_at"] = now_iso()
    audit(cdir, "first_green", ts=state["first_green_at"], via=via)
    return True


def first_green_line(ts):
    return (f"FIRST GREEN {ts} — close out now: hooked → end your turn; unhooked → run "
            f"python3 \"{me()}\" close. No amend, no --force from here.")


def print_results(contract, res):
    """The per-condition lines `check`, `collect` and `close` share."""
    by_id = {c["id"]: c for c in contract.get("conditions", [])}
    for i, m, tail in res:
        print(f"[{'MET  ' if m else 'UNMET'}] {i}: {tail.splitlines()[0][:160]}")
        for t in (by_id.get(i, {}).get("known_incomplete") or []):
            print(f"  known incomplete: {t}")


def observe(cdir, contract, state, ws, via):
    """Sealed sweep (budgeted, seal hashed before and after), stamp first green if earned.
    → (contract, res, unmet, files, ids, fresh_state, stamped_now, unattested_outcome)."""
    bad = attest_outcome(cdir, state)
    contract, res, files, ids = sealed_sweep(cdir, contract, state, ws)
    unmet = [i for i, m, _ in res if not m]
    stamped = False
    if files or ids:
        audit_breaks(cdir, state, files, ids)
    elif not unmet:
        with drive_lock(cdir):
            fresh = read_json(os.path.join(cdir, "state.json")) or state
            attest_outcome(cdir, fresh, quiet=True)
            stamped = stamp_first_green(cdir, fresh, via)
            state = fresh
    return contract, res, unmet, files, ids, state, stamped, bad


# ------------------------------------------------------------- tests baseline (--protect-tests)

def _norm_line(s):
    return " ".join(s.split())


def comment_style(path):
    """`#` for .py .rb .sh .pl .r .yaml; `//` + `/* */` for the C family; both for anything else."""
    ext = os.path.splitext(path or "")[1].lower()
    if ext in HASH_COMMENT_EXTS:
        return "hash"
    return "slash" if ext in SLASH_COMMENT_EXTS else "both"


def strip_comment(line, style="hash", block=None):
    """Drop comments by the file type's syntax, outside '…'/"…" (and `…` for non-# files) — best effort, no
    triple-quote tracking. `#` counts at line start or after whitespace; `//` anywhere outside a string;
    `/* … */` spans lines through `block` (a one-item list carrying the in-block flag between calls).
    A commented-out assertion is not one."""
    block = block if block is not None else [False]
    hashc, slash = style in ("hash", "both"), style in ("slash", "both")
    quotes = "'\"" if style == "hash" else "'\"`"
    out, q, prev, i = [], None, " ", 0
    while i < len(line):
        ch = line[i]
        if block[0]:
            if line.startswith("*/", i):
                block[0] = False
                i += 2
                prev = " "
                continue
            i += 1
            continue
        if q:
            out.append(ch)
            if ch == "\\" and i + 1 < len(line):
                out.append(line[i + 1])
                i += 2
                continue
            if ch == q:
                q = None
        elif ch in quotes:
            q = ch
            out.append(ch)
        elif hashc and ch == "#" and prev.isspace():
            break
        elif slash and line.startswith("//", i):
            break
        elif slash and line.startswith("/*", i):
            block[0] = True
            i += 2
            continue
        else:
            out.append(ch)
        prev = ch
        i += 1
    return "".join(out)


def mask_strings(line):
    """Replace each string literal's body with a short digest of it: equal literals stay equal (same-literal
    rules still work), and nothing inside a string can look like code (`"x or True"`, `"expect(true)"`)."""
    def sub(m):
        return m.group(1) + "s" + hashlib.sha256(m.group(0).encode()).hexdigest()[:8] + m.group(1)
    return re.sub(r"""(['"`])(?:\\.|(?!\1).)*\1""", sub, line)


def scan_assertions(path):
    """→ (count, normalized assertion lines, normalized vacuous lines) for one file. Comments are stripped by
    the file type's syntax; doctest `>>>` lines are skipped; assertion and vacuous patterns see the line with
    its string literals masked, and vacuous patterns count only on assertion lines."""
    lines, vac = [], []
    style, block = comment_style(path), [False]
    try:
        with open(path, errors="replace") as f:
            for raw in f:
                n = _norm_line(strip_comment(raw.rstrip("\n"), style, block))
                if not n or n.startswith(">>>"):
                    continue
                m = mask_strings(n)
                if any(r.search(m) for r in ASSERT_RES):
                    lines.append(n)
                    if any(r.search(m) for r in VACUOUS_RES):
                        vac.append(n)
    except OSError:
        return None, [], []
    return len(lines), lines, vac


def expand_test_globs(ws, globs):
    """→ (sorted relpaths, globs that matched nothing). Existing files only, never .drive/.git."""
    import glob as _g
    hits, empty = set(), []
    for g in globs:
        found = [p for p in _g.glob(os.path.join(ws, g), recursive=True) if os.path.isfile(p)]
        rels = {os.path.relpath(p, ws) for p in found}
        rels = {r for r in rels if not r.startswith((DRIVE_DIRNAME + os.sep, ".git" + os.sep))}
        if not rels:
            empty.append(g)
        hits |= rels
    return sorted(hits), empty


def build_tests_baseline(ws, globs):
    files, empty = expand_test_globs(ws, globs)
    snap, total = {}, 0
    for rel in files:
        n, lines, vac = scan_assertions(os.path.join(ws, rel))
        snap[rel] = {"count": n or 0, "lines": lines, "vacuous": vac}
        total += n or 0
    return {"workspace": ws, "globs": globs, "files": snap, "total_assertions": total,
            "ts": now_iso()}, empty


def cmd_tests_guard(a):
    """The `tests-not-weakened` condition. Exit 1 on a missing baselined file, a drop in a file's
    assertion count, or a vacuous assertion the baseline did not have. Fails CLOSED: no readable
    baseline is red, never a vacuous pass."""
    bpath = os.path.join(a.cdir, TESTS_BASELINE)
    try:
        with open(bpath, "rb") as f:
            raw = f.read()
        base = json.loads(raw)
    except (OSError, ValueError):
        raw, base = None, None
    want = (read_json(os.path.join(a.cdir, "contract.json")) or {}).get("tests_baseline_sha256")
    if raw is not None and want and hashlib.sha256(raw).hexdigest() != want:
        # hashed at use: a baseline lowered by an earlier condition and restored later is still caught
        print(f"{TESTS_COND}: {bpath} does not match its seal hash in contract.json — counts as weakened")
        sys.exit(1)
    if not isinstance(base, dict) or not isinstance(base.get("files"), dict):
        print(f"{TESTS_COND}: {bpath} missing or corrupt — cannot compare, counts as weakened")
        sys.exit(1)
    ws = base.get("workspace") or os.getcwd()
    fails, changed = [], []
    for rel in sorted(base["files"]):
        b = base["files"][rel]
        p = os.path.join(ws, rel)
        if not os.path.isfile(p):
            fails.append(f"missing: {rel} (baselined with {b.get('count', 0)} assertion(s))")
            continue
        n, lines, vac = scan_assertions(p)
        if n is None:
            fails.append(f"unreadable: {rel}")
            continue
        if n < b.get("count", 0):
            fails.append(f"weakened: {rel}: {n} assertion(s) < baseline {b.get('count', 0)}")
        for v in (collections.Counter(vac) - collections.Counter(b.get("vacuous") or [])).elements():
            fails.append(f"vacuous: {rel}: {v}")
        if n >= b.get("count", 0):
            removed = list((collections.Counter(b.get("lines") or []) - collections.Counter(lines)).elements())
            added = list((collections.Counter(lines) - collections.Counter(b.get("lines") or [])).elements())
            for old, new in zip(removed, added):
                changed.append(f"changed (not blocking): {rel}: -{old} +{new}")
    for ln in fails + changed:
        print(ln)
    if fails:
        print(f"{TESTS_COND}: {len(fails)} problem(s)")
        sys.exit(1)
    print(f"{TESTS_COND}: ok ({len(base['files'])} file(s), baseline "
          f"{base.get('total_assertions', 0)} assertion(s))")
    sys.exit(0)


# ------------------------------------------------------------- report-check

def _sections(text, heading):
    """Text of every section whose heading line starts with `heading`, up to the next #/## heading."""
    out, on = [], False
    for ln in text.splitlines():
        if re.match(r"^#{1,2}\s", ln):
            on = ln.startswith(heading)
            continue
        if on:
            out.append(ln)
    return "\n".join(out)


def _outside_fences(text):
    """The lines of `text` outside ``` / ~~~ fenced blocks (fence markers excluded)."""
    out, fence = [], None
    for ln in text.splitlines():
        m = re.match(r"^(```|~~~)", ln.strip())
        if fence:
            if m and m.group(1) == fence:
                fence = None
            continue
        if m:
            fence = m.group(1)
            continue
        out.append(ln)
    return out


def _prose(text):
    """→ (chars, distinct words ≥ 3 letters case-folded) of non-heading text outside fences."""
    n, words = 0, set()
    for ln in _outside_fences(text):
        s = ln.strip()
        if re.match(r"^#{1,6}(\s|$)", s):
            continue
        n += len(s)
        words.update(w.casefold() for w in re.findall(r"[^\W\d_]{3,}", s))
    return n, len(words)


def _has_word(text, word):
    return re.search(r"(?<![A-Za-z0-9_-])" + re.escape(word) + r"(?![A-Za-z0-9_-])", text) is not None


def report_requirements(cdir):
    """→ (unmet lines, n requirements checked). One line per unmet requirement."""
    contract = read_json(os.path.join(cdir, "contract.json"))
    if not isinstance(contract, dict):
        return [f"contract.json missing or corrupt under {cdir} — nothing to check the report against"]
    rpath = os.path.join(cdir, "REPORT.md")
    try:
        text = open(rpath, errors="replace").read()
    except OSError:
        text = None
    unmet = []
    body = text or ""
    # HTML comments are stripped like fences before the heading, prose and section checks (Y10);
    # condition ids and agent names may still appear anywhere.
    shown = re.sub(r"<!--.*?(-->|\Z)", "", body, flags=re.S)
    # 1. file + section headings
    if text is None:
        unmet.append(f"1. REPORT.md missing: {rpath}")
    else:
        heads = _outside_fences(shown)  # a heading inside a fence or an HTML comment is not a section
        missing = [s for s in REPORT_SECTIONS if not any(ln.startswith(s) for ln in heads)]
        if missing:
            unmet.append("1. missing section line(s) outside fences: " + ", ".join(missing))
    # 2. prose floor
    chars, nwords = _prose(shown)
    if chars < REPORT_PROSE_FLOOR or nwords < REPORT_MIN_WORDS:
        unmet.append(f"2. prose floor: {chars} chars (need ≥{REPORT_PROSE_FLOOR}) and {nwords} distinct words "
                     f"(need ≥{REPORT_MIN_WORDS}) of non-heading text outside fences")
    # 3. every condition id
    ids = [c["id"] for c in contract.get("conditions", []) if c.get("id") != "report"]
    miss = [i for i in ids if not _has_word(body, i)]
    if miss:
        unmet.append("3. condition id(s) not named: " + ", ".join(miss))
    # 4. every collected agent
    collected = [n for n in _agent_dirs(cdir) if agent_collected(cdir, n)]
    miss = [n for n in collected if not _has_word(body, n)]
    if miss:
        unmet.append("4. collected agent(s) not named: " + ", ".join(miss))
    cancelled = cancelled_agents(cdir)
    miss = [n for n in cancelled if not _has_word(body, n)]
    if miss:
        unmet.append("4. cancelled agent(s) not named: " + ", ".join(miss))
    # 5. planned vs dispatched, under ## Agents
    P = (contract.get("policy") or {}).get("agents_planned", 0)
    D = len({n for n in _agent_dirs(cdir, cancelled=True) if agent_ever_collected(cdir, n)
             and not n.startswith(("verify", "relay"))})
    agents_txt = _sections(shown, "## Agents")
    pat = re.compile(r"planned\s+%d\s*,\s*dispatched\s+%d(?!\d)" % (P, D), re.I)
    if not any(pat.search(ln) for ln in agents_txt.splitlines()):
        unmet.append(f"5. ## Agents lacks the line: planned {P}, dispatched {D}")
    # 6. known-incomplete texts under ## Unverified (whitespace-insensitive, otherwise verbatim)
    unv = _norm_line(_sections(shown, "## Unverified"))
    miss = [f"{c['id']}: {t}" for c in contract.get("conditions", [])
            for t in (c.get("known_incomplete") or []) if _norm_line(t) not in unv]
    if miss:
        unmet.append("6. known-incomplete text not under ## Unverified: " + " | ".join(m[:120] for m in miss))
    # 7. map keys
    cmap = contract.get("map") or {}
    outc = _norm_line(_sections(shown, "## Outcome"))
    parts = []
    k_out = [k for k in cmap if _norm_line(k) not in outc]
    if k_out:
        parts.append("map key(s) not under ## Outcome: " + ", ".join(k_out))
    k_unv = [k for k, v in cmap.items() if v == "unmapped" and _norm_line(k) not in unv]
    if k_unv:
        parts.append("unmapped key(s) not under ## Unverified: " + ", ".join(k_unv))
    if parts:
        unmet.append("7. " + "; ".join(parts))
    # 8. verifier
    if (contract.get("policy") or {}).get("verify", "required") == "required":
        ok, msg = verified_status(cdir)
        if not ok:
            unmet.append("8. verify: " + msg)
    # 9. no outstanding agent: every briefed agent is returned + collected, or cancelled
    left = [n for n in _agent_dirs(cdir) if not agent_collected(cdir, n)]
    if left:
        unmet.append("9. " + "; ".join(f"outstanding agent {n}: collect, cancel, or re-dispatch it" for n in left))
    return unmet


def cmd_report_check(a):
    cdir = a.cdir
    if not cdir:
        cdir, _, _ = load_active(ws_root())
    if not cdir or not os.path.isdir(cdir):
        print("no active drive"); sys.exit(2)
    unmet = report_requirements(cdir)
    for ln in unmet:
        print(ln)
    print(f"report: {len(unmet)} requirement(s) unmet" if unmet else "report: ok")
    sys.exit(1 if unmet else 0)


def newest_verdict(cdir):
    """(agent, verdict) of the newest verify-* RETURN.md, or (None, None)."""
    adir = os.path.join(cdir, "agents")
    best = None
    try:
        for n in os.listdir(adir):
            p = os.path.join(adir, n, "RETURN.md")
            if (n.startswith("verify") and os.path.isfile(p) and os.path.getsize(p) > 0
                    and not agent_cancelled(cdir, n)):  # a cancelled verifier never decides (Y3c)
                m = os.path.getmtime(p)
                if best is None or m > best[0]:
                    best = (m, n, p)
    except OSError:
        return None, None
    if not best:
        return None, None
    try:
        first = open(best[2]).readline().strip()
    except OSError:
        return best[1], None
    return best[1], first


def gate_budget(contract):
    return contract.get("gate_budget") or int(DEFAULT_HOOK_TIMEOUT * GATE_BUDGET_FRAC)


def evaluate(cdir, contract, ws, budget=None):
    """Run every condition; return list of (id, met, tail).

    Conditions run serially, so N × the per-condition timeout is the worst case;
    `budget` bounds the TOTAL sweep so the gate always returns a decision inside the
    Stop hook's own timeout.
    """
    timeout = contract.get("timeout", DEFAULT_TIMEOUT)
    deadline = (time.time() + budget) if budget else None
    env = condition_env(contract)
    res = []
    for c in contract["conditions"]:
        sb = startup_breaks(contract)  # before EVERY condition: a file planted by one and removed by a later one
        if sb:
            res.append((c["id"], False, f"{STARTUP_RUN_TAMPER}: {STARTUP_BREAK}{sb[0]}"))
            continue
        met, tail = run_condition(c, ws, timeout, deadline, env=env)
        res.append((c["id"], met, tail))
    return res


def set_terminal(cdir, state, outcome, **kw):
    state["outcome"] = outcome
    state["ended_at"] = now_iso()
    audit(cdir, "terminal", outcome=outcome, **kw)
    write_json(os.path.join(cdir, "state.json"), state)


def abort_file_present(cdir):
    p = os.path.join(cdir, "ABORT.md")
    try:
        txt = open(p).read()
    except OSError:
        return False
    return all(h in txt for h in ("## Blocked", "## Mechanism", "## Evidence")) and (
        len([ln for ln in txt.splitlines() if ln.strip()]) >= 6
    )


def workspace_trusted(ws):
    """(trusted, detail) from ~/.claude.json → projects[<ws>]["hasTrustDialogAccepted"].

    An untrusted workspace has its `permissions.allow` entries dropped while the hooks
    block in the same settings file is still honoured: the gate blocks while the grants
    the model needs to satisfy the conditions are void. Warn — never refuse; the trust
    state is the operator's to fix.
    """
    cfg = read_json(os.path.expanduser("~/.claude.json"))
    if not isinstance(cfg, dict):
        return True, "no ~/.claude.json to check"
    projects = cfg.get("projects")
    if not isinstance(projects, dict):
        return True, "no projects map in ~/.claude.json"
    entry = projects.get(ws)
    if entry is None:
        entry = projects.get(os.path.realpath(ws))
    if not isinstance(entry, dict):
        return False, "not listed in ~/.claude.json projects"
    if entry.get("hasTrustDialogAccepted") is True:
        return True, "trusted"
    return False, "hasTrustDialogAccepted is false/missing"


# ------------------------------------------------------- Stop-hook plumbing
#
# The gate is the whole mechanism, and it only runs if a Stop hook says so. It is ARMED BY
# INVOKING /drive: SKILL.md's frontmatter carries a `hooks: Stop:` entry running `drive.py gate`,
# and Claude Code registers a skill's frontmatter hooks when the skill is invoked (a
# `disable-model-invocation` skill included) and keeps them for the rest of that session
# process. Measured with claude 2.1.272, live `claude -p` probes 2026-09-15:
#   * the frontmatter hook fired on the invoking turn and on every later turn, a blocking
#     decision from it worked, and it kept firing after `/compact`;
#   * it did NOT fire in a `claude --resume <id>` process until the skill was invoked again —
#     the SessionStart `session-resume-gates.sh` hook tells the operator to re-type /drive;
#   * `CLAUDE_SKILL_DIR` is not set in the hook's env (`CLAUDE_PROJECT_DIR` is), so the command
#     resolves drive.py through `${CLAUDE_PROJECT_DIR}` exactly as the settings form does;
#   * a byte-identical command in settings.json AND the frontmatter fired TWICE, concurrently,
#     for one stop — there is no dedup, so `gate` dedups itself (`_duplicate_firing`).
# A settings-file hook is no longer wired by default (it ran after every response of every
# session, drive or not); `install-hook` stays as an explicit opt-in for a session that never
# invokes /drive.

HOOK_COMMAND = ("sh -c 'exec python3 \"${CLAUDE_PROJECT_DIR:-.}"
                "/.claude/skills/drive/drive.py\" gate'")
HOOK_MARKERS = ('drive.py" gate', "drive.py gate")
SKILL_HOOK_LABEL = "skill"
SKILL_HOOK_ARMING = ("armed when /drive is invoked in this session process; a `claude --resume` "
                     "process is not gated until /drive is typed again")


def user_settings_path():
    """Claude Code's user settings file: `$CLAUDE_CONFIG_DIR/settings.json`, else
    `~/.claude/settings.json` — the file the CLI actually reads, and the one doctor and
    session-resume-gates.sh check (Atelier's `_statusline.settings_path`, inlined: this file
    ships standalone)."""
    base = os.environ.get("CLAUDE_CONFIG_DIR") or os.path.expanduser(os.path.join("~", ".claude"))
    return os.path.join(base, "settings.json")


def settings_files(ws):
    """(label, path) for every settings file whose Stop hooks a session merges, in order."""
    return [
        ("project", os.path.join(ws, ".claude", "settings.json")),
        ("local", os.path.join(ws, ".claude", "settings.local.json")),
        ("user", user_settings_path()),
    ]


def _stop_hook_entries(obj):
    """Yield every {"type":"command",...} entry under hooks.Stop[*].hooks[*]."""
    if not isinstance(obj, dict):
        return
    stop = (obj.get("hooks") or {}).get("Stop") if isinstance(obj.get("hooks"), dict) else None
    if not isinstance(stop, list):
        return
    for group in stop:
        if not isinstance(group, dict):
            continue
        for h in group.get("hooks") or []:
            if isinstance(h, dict):
                yield h


def is_drive_hook(entry):
    cmd = entry.get("command")
    return isinstance(cmd, str) and any(m in cmd for m in HOOK_MARKERS)


def _yaml_scalar(v):
    """A frontmatter scalar as its string: a double-quoted YAML string decodes like JSON for
    every escape this file uses (`\\"`), a single-quoted one doubles its quotes."""
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] == '"':
        try:
            return json.loads(v)
        except ValueError:
            return v[1:-1]
    if len(v) >= 2 and v[0] == v[-1] == "'":
        return v[1:-1].replace("''", "'")
    return v


def skill_frontmatter_hook(skill_md):
    """→ timeout (int, or 0 when none is declared) if `skill_md`'s frontmatter declares a Stop
    hook running `drive.py gate`, else None.

    A line reader, not a YAML parser (drive.py imports only the stdlib): the frontmatter is the
    block between the leading `---` lines; inside it the `hooks:` key, its `Stop:` child, and a
    `command:` under that carrying a HOOK_MARKER once unquoted. Anything it cannot read that way
    is "not declared" — hook-status then says NONE and `start` refuses, which fails closed.
    """
    try:
        with open(skill_md, encoding="utf-8") as f:
            lines = f.read().splitlines()
    except (OSError, UnicodeDecodeError):
        return None
    if not lines or lines[0].strip() != "---":
        return None
    try:
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
    except StopIteration:
        return None
    fm = lines[1:end]

    def indent(s):
        return len(s) - len(s.lstrip(" "))

    def block(start, parent_indent, src):
        out = []
        for ln in src[start:]:
            if ln.strip() and indent(ln) <= parent_indent:
                break
            out.append(ln)
        return out

    for i, ln in enumerate(fm):
        if ln.rstrip() != "hooks:" or indent(ln) != 0:
            continue
        hooks_blk = block(i + 1, 0, fm)
        for j, h in enumerate(hooks_blk):
            if h.strip() != "Stop:":
                continue
            stop_blk = block(j + 1, indent(h), hooks_blk)
            cmd_at = None
            for k, s in enumerate(stop_blk):
                m = re.match(r"^\s*(?:-\s+)?command:\s*(.+)$", s)
                if m and any(mk in _yaml_scalar(m.group(1)) for mk in HOOK_MARKERS):
                    cmd_at = k
                    break
            if cmd_at is None:
                continue
            # The timeout belongs to the same list item as the command: walk up to the item's
            # `- ` line and down to the next sibling item, reading keys at the command's column.
            def key_col(s):
                return indent(s) + (2 if s.lstrip().startswith("- ") else 0)
            col = key_col(stop_blk[cmd_at])
            st = cmd_at
            while (st > 0 and not stop_blk[st].lstrip().startswith("- ")
                   and key_col(stop_blk[st - 1]) == col):
                st -= 1
            en = cmd_at + 1
            while en < len(stop_blk) and (not stop_blk[en].strip() or key_col(stop_blk[en]) > col or (
                    key_col(stop_blk[en]) == col and not stop_blk[en].lstrip().startswith("- "))):
                en += 1
            for s in stop_blk[st:en]:
                m = re.match(r"^\s*(?:-\s+)?timeout:\s*(\d+)\s*$", s)
                if m:
                    return int(m.group(1))
            return 0
    return None


def skill_md_path():
    """The SKILL.md shipped beside THIS drive.py — the file whose frontmatter arms the gate."""
    return os.path.join(os.path.dirname(me()), "SKILL.md")


def find_skill_hook():
    """→ (label, path, timeout) for the SKILL.md frontmatter declaration, or (None,)*3."""
    p = skill_md_path()
    to = skill_frontmatter_hook(p)
    if to is None:
        return None, None, None
    return SKILL_HOOK_LABEL, p, (to or DEFAULT_HOOK_TIMEOUT)


def find_settings_hooks(ws):
    """→ [(label, path, timeout)] for EVERY settings-file Stop hook running the gate.

    With the frontmatter hook live, each one of these fires the gate a second time per stop —
    `gate` counts that stop once, but it is still a second python process per response in
    every session, drive or not.
    """
    found = []
    for label, path in settings_files(ws):
        obj = read_json(path)
        for entry in _stop_hook_entries(obj):
            if is_drive_hook(entry):
                found.append((label, path, entry.get("timeout")))
    return found


def find_drive_hook(ws):
    """→ (label, path, timeout) of the FIRST settings file carrying a drive gate Stop hook.

    Settings files only: `install-hook` treats a hit here as "already installed". The skill's
    own frontmatter declaration is `find_skill_hook`.
    """
    hits = find_settings_hooks(ws)
    return hits[0] if hits else (None, None, None)


def cmd_hook_status(_a):
    ws = ws_root()
    # First line, hook or not: the absolute `D` the skill uses from here on (before `start` prints it).
    print(f'D = python3 "{os.path.abspath(__file__)}"')
    s_label, s_path, s_to = find_skill_hook()
    settings_hits = find_settings_hooks(ws)
    if not s_path and not settings_hits:
        print(f"drive Stop hook: NONE (workspace {ws})")
        print("  looked in: " + ", ".join([skill_md_path() + " (frontmatter)"]
                                          + [p for _, p in settings_files(ws)]))
        print("  the frontmatter `hooks: Stop:` entry is missing from SKILL.md — restore the skill "
              "(`atelier upgrade --refresh-commands --apply`), or wire a settings hook with "
              "drive.py install-hook")
        sys.exit(1)
    if s_path:
        print(f"drive Stop hook: {s_label} ({s_path}) timeout {s_to}s — {SKILL_HOOK_ARMING}")
    for label, path, timeout in settings_hits:
        print(f"drive Stop hook: {label} ({path}) timeout {timeout}s")
        if s_path:
            print(f"  redundant with the skill frontmatter: the gate fires twice per stop (counted "
                  f"once) and runs after every response of every session — remove it with "
                  f"drive.py uninstall-hook --from {label}")
    sys.exit(0)


def _backup_settings(path):
    """`<file>.bak-<stamp>` beside an operator's settings file, before any rewrite of it."""
    stamp = datetime.now().strftime("%Y%m%dT%H%M%S")
    backup = f"{path}.bak-{stamp}"
    with open(path, "rb") as src, open(backup, "wb") as dst:
        dst.write(src.read())
    return backup


def cmd_install_hook(a):
    ws = ws_root()
    label, path, timeout = find_drive_hook(ws)
    if path:
        print(f"already installed: {label} ({path}) timeout {timeout}s — nothing written "
              "(a second copy would double-fire the gate and double-count blocks)")
        sys.exit(0)
    target = os.path.join(ws, ".claude",
                          "settings.json" if a.project else "settings.local.json")
    os.makedirs(os.path.dirname(target), exist_ok=True)
    obj = read_json(target)
    if not isinstance(obj, dict):
        obj = {}
    hooks = obj.setdefault("hooks", {})
    if not isinstance(hooks, dict):
        sys.exit(f"REFUSED — {target} has a non-object 'hooks' key; fix it by hand.")
    stop = hooks.setdefault("Stop", [])
    if not isinstance(stop, list):
        sys.exit(f"REFUSED — {target} has a non-list 'hooks.Stop'; fix it by hand.")
    entry = {"type": "command", "command": HOOK_COMMAND, "timeout": a.timeout}
    group = next((g for g in stop if isinstance(g, dict) and isinstance(g.get("hooks"), list)), None)
    if group is None:
        stop.append({"hooks": [entry]})
    else:
        group["hooks"].append(entry)
    # An operator reads this file: keep the settings shape, do not re-sort their keys.
    write_json(target, obj, sort_keys=False)
    print(f"installed drive Stop hook → {target} (timeout {a.timeout}s)")
    # Measured 2026-09-15 (claude 2.1.272, `claude -p` stream-json): a Stop hook written into
    # .claude/settings.json between two turns fired on the very next turn — settings files are
    # watched, as settings.md says. The old "gates the NEXT session" note was wrong.
    print("NOTE: opt-in only — SKILL.md's frontmatter already arms the gate whenever /drive is "
          "invoked. This copy also gates sessions that never invoke /drive (a `claude --resume` "
          "included) and runs after every response of every session in its scope; where both are "
          "live the gate fires twice per stop and counts it once. Claude Code watches settings "
          "files, so it applies from the running session's next turn. Undo: drive.py uninstall-hook "
          f"--from {'project' if a.project else 'local'}")
    sys.exit(0)


def cmd_uninstall_hook(a):
    """Remove every `drive.py gate` Stop-hook entry from ONE settings file (backup first).

    The removal command doctor and hook-status name for a redundant settings copy. It matches
    on HOOK_MARKERS alone — the operator named the file, so a hand-rolled gate command there is
    theirs to drop too; empty groups and an empty `Stop` list go with it, nothing else moves.
    """
    ws = ws_root()
    path = dict(settings_files(ws))[a.from_]
    if not os.path.isfile(path):
        print(f"nothing to remove: {path} does not exist")
        sys.exit(0)
    obj = read_json(path)
    if not isinstance(obj, dict):
        sys.exit(f"REFUSED — {path} is not a JSON object; nothing written.")
    hooks = obj.get("hooks")
    stop = hooks.get("Stop") if isinstance(hooks, dict) else None
    if not isinstance(stop, list):
        print(f"nothing to remove: {path} has no hooks.Stop array")
        sys.exit(0)
    removed = 0
    kept_groups = []
    for g in stop:
        if isinstance(g, dict) and isinstance(g.get("hooks"), list):
            keep = [h for h in g["hooks"] if not (isinstance(h, dict) and is_drive_hook(h))]
            removed += len(g["hooks"]) - len(keep)
            if not keep and len(g["hooks"]):
                continue
            g["hooks"] = keep
        kept_groups.append(g)
    if not removed:
        print(f"nothing to remove: no drive gate Stop hook in {path}")
        sys.exit(0)
    if kept_groups:
        hooks["Stop"] = kept_groups
    else:
        del hooks["Stop"]
    mode = os.stat(path).st_mode & 0o7777
    backup = _backup_settings(path)
    write_json(path, obj, sort_keys=False)
    with contextlib.suppress(OSError):
        os.chmod(path, mode)
    print(f"removed {removed} drive Stop hook entr{'y' if removed == 1 else 'ies'} from {path} "
          f"(backup {backup})")
    sys.exit(0)


# --------------------------------------------------------- transcript derivation

def project_slug(ws):
    """Claude Code's ~/.claude/projects/<slug> rule: abs path, every char outside
    [A-Za-z0-9-] → '-'. Verified against this machine's real dir."""
    return re.sub(r"[^A-Za-z0-9-]", "-", os.path.abspath(ws))


def derive_transcript(ws, session, home=None):
    """The transcript path the model can never see: ~/.claude/projects/<slug>/<session>.jsonl.

    Returns it only if the file exists — a guessed path that is not there would silently
    baseline context growth at 0 MB forever.
    """
    if not session:
        return None
    root = os.path.join(home or os.path.expanduser("~"), ".claude", "projects")
    p = os.path.join(root, project_slug(ws), str(session) + ".jsonl")
    return p if os.path.isfile(p) else None


def _ts_epoch(ts):
    """ISO timestamp (a transcript's `...Z` included, on Python 3.9) → epoch, or None."""
    if not isinstance(ts, str) or not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return None


def _content_text(content):
    """A message content (str, or a list of text/image/document blocks) → its text; None for anything else
    (a tool_result list is never operator text)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        if any(not isinstance(x, dict) or x.get("type") not in ("text", "image", "document") for x in content):
            return None
        return "\n".join(x.get("text") or "" for x in content if x.get("type") == "text")
    return None


def _operator_entry(rec):
    """→ (text, ts) for a transcript entry the OPERATOR produced, else None. `text` is "" for an operator entry
    that is not a prompt (a slash command, an interrupt): it is still the LATEST thing they did, so an older
    prompt behind it never counts as their current order.

    Two shapes carry a typed prompt (measured on this machine's transcripts, 2026-09-16):
      * `type: user`, string/text content, `origin.kind == "human"` on a current harness (no origin on an
        older one);
      * `type: attachment` / `queued_command` with `commandMode: prompt` and `origin.kind == "human"` — a
        prompt typed WHILE a turn runs, which under /drive is nearly every prompt. The same attachment with
        `origin.kind == "peer"` (a sub-agent hand-back) or `commandMode: task-notification` is not the operator.
    Never the operator: tool results, isMeta, sidechains, compaction summaries, hook feedback, notifications."""
    if not isinstance(rec, dict) or rec.get("isSidechain"):
        return None
    ts = _ts_epoch(rec.get("timestamp"))
    if rec.get("type") == "attachment":
        att = rec.get("attachment")
        if not isinstance(att, dict) or att.get("type") != "queued_command" or att.get("commandMode") != "prompt":
            return None
        origin = att.get("origin")
        if att.get("isMeta") or not isinstance(origin, dict) or origin.get("kind") != "human":
            return None
        text = _content_text(att.get("prompt"))
        return (text.strip(), _ts_epoch(att.get("timestamp")) or ts) if text is not None else None
    if rec.get("type") != "user" or rec.get("isMeta") or "toolUseResult" in rec:
        return None
    if rec.get("isCompactSummary") or rec.get("isVisibleInTranscriptOnly"):
        return None
    msg = rec.get("message")
    text = _content_text(msg.get("content") if isinstance(msg, dict) else None)
    if text is None:
        return None
    text = text.strip()
    origin = rec.get("origin")
    kind = origin.get("kind") if isinstance(origin, dict) else None
    if kind is not None and kind != "human" and not text.startswith("<bash-input>"):
        return None
    if text.startswith(OPERATOR_ACTION_PREFIXES):
        return "", ts
    if not text or text.startswith(HUMAN_SKIP_PREFIXES):
        return None
    return text, ts


def last_human_prompt(path, chunk=1 << 20, session=None):
    """→ (text, ts_epoch) of the newest operator entry in the transcript, or (None, None). With `session`, an
    entry stamped with another `sessionId` is not this drive's operator.

    Read backwards in chunks: the newest one is usually near the end, and every other line is skipped by a
    substring test before any JSON parse."""
    try:
        f = open(path, "rb")
    except (OSError, TypeError):
        return None, None
    with f:
        pos = f.seek(0, os.SEEK_END)
        tail = b""
        while pos > 0:
            step = min(chunk, pos)
            pos -= step
            f.seek(pos)
            lines = (f.read(step) + tail).split(b"\n")
            tail = lines.pop(0) if pos > 0 else b""
            for ln in reversed(lines):
                if b'"human"' not in ln and not (b'"user"' in ln and b'"toolUseResult"' not in ln):
                    continue
                try:
                    rec = json.loads(ln)
                except ValueError:
                    continue
                hit = _operator_entry(rec)
                if hit is not None and session and rec.get("sessionId") not in (None, session):
                    continue
                if hit is not None:
                    return hit
    return None, None


def hold_word(text):
    """The hold verb of an operator prompt that ORDERS a pause/hold/stop, or None.

    A regex cannot read intent, so the bar is deliberately narrow (HOLD_CLAUSE_RE): some clause of the prompt
    must lead with the verb and carry nothing but where/when/what to hold. A negation ("don't stop", "no need
    to stop") or an object ("stop adding debug prints") breaks the clause shape. A `!` command counts only when
    it runs this script's `pause`. What it misses — a long-winded or non-English hold — leaves the drive
    enforced, and the operator can still type `! drive.py pause` or `release`."""
    t = (text or "").replace("\u2019", "'").strip()
    if not t:
        return None
    if t.startswith("<bash-input>"):
        # The operator's own `! drive.py pause` is the plainest order there is; any other shell command is not.
        return "pause" if BASH_PAUSE_RE.match(t) else None
    if len(t.split()) > HOLD_MAX_WORDS or HOLD_CONTRARY_RE.search(t):
        return None
    for clause in HOLD_CLAUSE_SPLIT_RE.split(t):
        m = HOLD_CLAUSE_RE.match(clause)
        if m:
            return m.group("verb").lower()
    return None


def operator_hold(path, since_epoch, session=None):
    """→ (word, excerpt) when the operator's latest entry, made after `since_epoch`, is a hold; else None.
    An entry with no timestamp cannot be placed after the seal, so it never counts."""
    text, ts = last_human_prompt(path, session=session)
    if not text or ts is None or ts <= since_epoch:
        return None
    w = hold_word(text)
    return (w, " ".join(text.split())[:120]) if w else None


def _hook_record_len(ln):
    """Bytes of `ln` when it is the harness's record of a Stop-hook BLOCK (the `Stop hook feedback` meta entry or
    the `hook_blocking_error` attachment), else 0. Parsed, not substring-matched: a tool result that merely
    quotes those words (reading drive.py does) is work, not a block record."""
    try:
        rec = json.loads(ln)
    except ValueError:
        return 0
    if not isinstance(rec, dict):
        return 0
    if rec.get("type") == "attachment":
        att = rec.get("attachment")
        return len(ln) if isinstance(att, dict) and att.get("type") == "hook_blocking_error" else 0
    msg = rec.get("message")
    content = msg.get("content") if isinstance(msg, dict) else None
    if (rec.get("type") == "user" and rec.get("isMeta") and isinstance(content, str)
            and content.startswith("Stop hook feedback")):
        return len(ln)
    return 0


def _assistant_said_something(ln):
    try:
        rec = json.loads(ln)
    except ValueError:
        return False
    msg = rec.get("message") if isinstance(rec, dict) and rec.get("type") == "assistant" else None
    content = msg.get("content") if isinstance(msg, dict) else None
    if isinstance(content, str):
        return bool(content.strip())
    return isinstance(content, list) and any(
        isinstance(x, dict) and x.get("type") == "text" and (x.get("text") or "").strip() for x in content)


def transcript_segment(path, start):
    """What the transcript gained since byte `start`: tool calls, assistant text messages, the bytes the harness
    spent recording the gate's own blocks (measured 2026-09-11: one block is stored twice, as a `Stop hook
    feedback` entry and a `hook_blocking_error` attachment), and the total. None when unreadable."""
    try:
        f = open(path, "rb")
    except (OSError, TypeError):
        return None
    out = {"tool_uses": 0, "texts": 0, "hook_bytes": 0, "total": 0}
    with f:
        size = f.seek(0, os.SEEK_END)
        f.seek(start if isinstance(start, int) and 0 <= start <= size else size)
        for ln in f:
            out["total"] += len(ln)
            if b'"assistant"' in ln:
                out["tool_uses"] += ln.count(b'"type":"tool_use"') + ln.count(b'"type": "tool_use"')
                out["texts"] += 1 if b'"text"' in ln and _assistant_said_something(ln) else 0
            elif b"Stop hook feedback" in ln or b"hook_blocking_error" in ln:
                out["hook_bytes"] += _hook_record_len(ln)
    return out


def wall_minutes(state):
    """Minutes the drive has been LIVE: wall time since the seal minus every finished and running pause."""
    paused = float(state.get("paused_seconds") or 0)
    if state.get("paused_at"):
        paused += max(0.0, time.time() - epoch(state["paused_at"]))
    return max(0.0, time.time() - epoch(state["started_at"]) - paused) / 60


def pause_attested(cdir, state):
    """A state `paused_at` counts only when audit.jsonl's newest pause event is `paused` (the pause
    writes its audit line BEFORE state.json, like set_terminal)."""
    if not state.get("paused_at"):
        return False
    last = None
    try:
        with open(os.path.join(cdir, "audit.jsonl")) as f:
            for ln in f:
                try:
                    rec = json.loads(ln)
                except ValueError:
                    continue
                if isinstance(rec, dict) and rec.get("event") in ("paused", "unpaused"):
                    last = rec
    except OSError:
        return False
    return bool(last and last["event"] == "paused" and last.get("paused_at") == state["paused_at"])


def set_paused(cdir, state, by, **kw):
    state["paused_at"] = now_iso()
    state["paused_by"] = by
    audit(cdir, "paused", by=by, paused_at=state["paused_at"], blocks=state.get("blocks"), **kw)
    write_json(os.path.join(cdir, "state.json"), state)


def crash_red(tail):
    """A seal-time red that is a CRASH (exit 126/127, or a last line naming an import/syntax error), as a
    one-line reason; None for a real red. `tail` is run_condition's `exit N: <last lines>`."""
    m = re.match(r"exit (-?\d+): ", tail or "")
    if not m:
        return None
    rc = int(m.group(1))
    lines = [ln.strip() for ln in tail[m.end():].splitlines() if ln.strip()]
    last = lines[-1] if lines else ""
    if rc in CRASH_RCS:
        return f"exit {rc} ({'not executable' if rc == 126 else 'command not found'}): {last[:160]}"
    # The error line alone is not enough: a detector may print `SyntaxError: <what it found>` and exit 1 on
    # purpose. The interpreter's own crash also prints a frame (`File "...", line N`) or the traceback header.
    if CRASH_LAST_LINE_RE.match(last) and any(TRACEBACK in ln or CRASH_FRAME_RE.match(ln) for ln in lines[:-1]):
        return f"exit {rc}, the interpreter crashed: {last[:160]}"
    if CRASH_LAUNCH_RE.search(last):
        return f"exit {rc}, the interpreter could not start the module or file: {last[:160]}"
    if rc == 2 and any(CRASH_BASH_SYNTAX_RE.match(ln) for ln in lines):
        return f"exit 2, the condition's own shell syntax is broken: {last[:160]}"
    return None


def refuse_crash_reds(res, allowed, where):
    crashed = [(i, why) for i, m, t in res
               if not m and i not in RESERVED_IDS and i not in allowed for why in [crash_red(t)] if why]
    if crashed:
        sys.exit(f"REFUSED — red at {where} by CRASHING, not by detecting: "
                 + "; ".join(f"{i}: {why}" for i, why in crashed)
                 + ". A crash stays red whatever the work does. Fix the command or the sealed env "
                   "(a missing module: `--allow-user-site \"<reason>\"` or a sealed interpreter that has it); "
                   "if the missing piece IS the work, name the id in --allow-crash-red.")


# ----------------------------------------------------------------- commands


def _split_spec(flag, spec):
    if "=" not in spec:
        sys.exit(f"REFUSED — {flag} needs ID=VALUE, got {spec!r}")
    k, v = spec.split("=", 1)
    return k.strip(), v


def _check_new_id(cid, taken):
    if not cid or cid in RESERVED_IDS or cid in taken:
        sys.exit(f"REFUSED — bad/duplicate condition id {cid!r} ('report' and '{TESTS_COND}' are "
                 "reserved; an existing id is never redefined)")


def check_ceiling(n):
    if n > MAX_CONDS:
        sys.exit(f"REFUSED — need {MIN_CONDS}–{MAX_CONDS} conditions besides the auto ones, got {n}. "
                 f"The rule: {DECOMPOSE_RULE}. Past {MAX_CONDS}, split the task into drives.")
    if n < MIN_CONDS:
        sys.exit(f"need {MIN_CONDS}–{MAX_CONDS} conditions besides the auto 'report', got {n}")


def prepare_checker(cid, path):
    if os.sep in cid or "/" in cid or cid.startswith("."):
        sys.exit(f"REFUSED — checker id {cid!r} must be a plain name (it becomes a file name)")
    src = os.path.abspath(os.path.expanduser(path.strip()))
    if not os.path.isfile(src):
        sys.exit(f"REFUSED — --checker {cid}={path}: {src} does not exist or is not a file")
    ext = os.path.splitext(src)[1]
    if ext.lower() not in (".py", ".sh") and not os.access(src, os.X_OK):
        sys.exit(f"REFUSED — --checker {cid}: {src} is neither .py/.sh nor executable, so its sealed "
                 "copy could never run")
    with open(src, "rb") as f:
        data = f.read()
    return {"id": cid, "src": src, "ext": ext, "data": data,
            "mode": os.stat(src).st_mode & 0o777, "sha256": hashlib.sha256(data).hexdigest()}


def checker_condition(cdir, prep, python, user_site=False):
    dest = os.path.join(cdir, CHECKERS_DIRNAME, prep["id"] + prep["ext"])
    return {"id": prep["id"], "cmd": checker_cmd(dest, python, user_site),
            "checker": {"path": dest, "source": prep["src"], "sha256": prep["sha256"],
                        "red_proven": False}}


def install_checker(cond, prep):
    dest = cond["checker"]["path"]
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest):
        sys.exit(f"REFUSED — {dest} already exists; a sealed checker copy is never overwritten")
    with open(dest, "wb") as f:
        f.write(prep["data"])
    os.chmod(dest, prep["mode"] | 0o600)
    if sha256_file(dest) != prep["sha256"]:
        sys.exit(f"REFUSED — {dest} does not hash to what was read from {prep['src']}")
    return dest


def parse_red_proofs(specs, checker_ids, ws, where="--checker"):
    out = {}
    wr = os.path.realpath(ws)
    dr = os.path.realpath(drive_base(ws))
    for spec in specs or []:
        cid, d = _split_spec("--red-proof", spec)
        if cid not in checker_ids:
            sys.exit(f"REFUSED — --red-proof {cid}: only ids given by {where} can be red-proven")
        if cid in out:
            sys.exit(f"REFUSED — --red-proof {cid} given twice")
        rd = os.path.abspath(os.path.expanduser(d.strip()))
        if not os.path.isdir(rd):
            sys.exit(f"REFUSED — --red-proof {cid}={d}: {rd} is not a directory (the broken fixture tree)")
        rr = os.path.realpath(rd)
        if rr == wr or wr.startswith(rr.rstrip(os.sep) + os.sep) or rr == dr or rr.startswith(dr + os.sep):
            sys.exit(f"REFUSED — --red-proof {cid}={d}: {rd} is the workspace, an ancestor of it, or inside "
                     f"{DRIVE_DIRNAME}/ — a red there proves only 'red at seal'. Build a separate broken fixture tree.")
        out[cid] = rd
    return out


def run_red_proof(cond, rdir, timeout, env):
    rc, out = run_shell(cond["cmd"], rdir, timeout, env=env)
    first = (out.strip().splitlines() or ["(no output)"])[0][:200]
    if rc == 0:
        sys.exit(f"REFUSED — checker {cond['id']} passed on the broken fixture — it cannot detect what it "
                 f"guards (cwd {rdir}: {first})")
    if rc is not None and TRACEBACK in out:
        sys.exit(f"REFUSED — checker {cond['id']} crashed on the fixture — a crash is not a detection "
                 f"(cwd {rdir}: `{TRACEBACK}` in its output). Make it exit non-zero with a message instead.")
    ck = cond["checker"]
    ck["red_proof_dir"] = rdir
    if rc is None:
        ck["red_proven"] = False
        ck["red_proof"] = f"TIMEOUT after {timeout}s on the fixture — a hang is not a red"
    else:
        ck["red_proven"] = True
        ck["red_proof"] = f"exit {rc}: {first}"


def parse_known_incomplete(specs, ids):
    out = []
    for spec in specs or []:
        cid, text = _split_spec("--known-incomplete", spec)
        if cid not in ids:
            sys.exit(f"REFUSED — --known-incomplete names unknown condition id {cid!r}")
        if not text.strip():
            sys.exit(f"REFUSED — --known-incomplete {cid} has empty text")
        out.append((cid, text.strip()))
    return out


def parse_map(specs, ids):
    out = {}
    for spec in specs or []:
        key, val = _split_spec("--map", spec)
        if not key or len(key) > MAP_KEY_MAX:
            sys.exit(f"REFUSED — --map key {key!r} must be 1–{MAP_KEY_MAX} chars with no '='")
        if key in out:
            sys.exit(f"REFUSED — --map key {key!r} given twice")
        v = val.strip()
        if v == "unmapped":
            out[key] = "unmapped"
            continue
        lst = [x.strip() for x in v.split(",") if x.strip()]
        if not lst:
            sys.exit(f"REFUSED — --map {key}= needs a comma list of condition ids, or `unmapped`")
        unknown = [x for x in lst if x not in ids]
        if unknown:
            sys.exit(f"REFUSED — --map {key} names unknown condition id(s): {', '.join(unknown)}")
        out[key] = lst
    return out


def map_summary(cmap):
    u = sum(1 for v in (cmap or {}).values() if v == "unmapped")
    return f"map: {len(cmap or {})} rows, {u} unmapped"


def discard_staged(cdir, base, created_base):
    """Remove a refused seal's staging dir. `shutil.rmtree` first; if anything survives (a sandbox can
    deny rmtree's fd-relative deletes while path deletes work), walk it bottom-up by path. Then remove
    `.drive/` only if THIS call created it and it is empty. A survivor is said out loud."""
    shutil.rmtree(cdir, ignore_errors=True)
    if os.path.lexists(cdir):
        for root, dirs, files in os.walk(cdir, topdown=False):
            for n in files + [d for d in dirs if os.path.islink(os.path.join(root, d))]:
                with contextlib.suppress(OSError):
                    os.remove(os.path.join(root, n))
            for n in dirs:
                with contextlib.suppress(OSError):
                    os.rmdir(os.path.join(root, n))
        with contextlib.suppress(OSError):
            os.rmdir(cdir)
    if os.path.lexists(cdir):
        print(f"WARNING — could not remove the refused seal's staging dir {cdir}; delete it by hand",
              file=sys.stderr)
    if created_base:
        with contextlib.suppress(OSError):
            os.rmdir(base)


def cmd_start(a):
    ws = ws_root()
    base = drive_base(ws)
    old = load_active(ws)
    warnings = []
    # --- every refusal runs BEFORE anything is created on disk (a refused seal must
    #     not litter .drive/ with an empty directory).
    # Enforcement precondition: with no Stop hook there is no block, and every promise this
    # drive makes is a promise it cannot keep. Refuse, or make the gap explicit and loud.
    # Two sources: SKILL.md's frontmatter (armed by the /drive invocation that is running this
    # seal) and any settings-file copy. drive.py cannot observe whether the skill was invoked in
    # THIS process — `drive.py start` run by hand, from another process or after a `--resume`
    # sees the same file — so an explicit `--unhooked` is honoured over a frontmatter-only
    # declaration. A settings hook IS loaded wherever this workspace runs, so it still wins.
    s_label, s_path, s_to = find_skill_hook()
    hooks_found = ([(s_label, s_path, s_to)] if s_path else []) + find_settings_hooks(ws)
    settings_found = [h for h in hooks_found if h[0] != SKILL_HOOK_LABEL]
    if a.unhooked and not settings_found:
        enforcement, enf_detail = "none", a.unhooked
        hook_label = hook_path = hook_to = None
        if s_path:
            warnings.append(f"--unhooked honoured: only the SKILL.md frontmatter declares the gate "
                            f"({s_path}), and drive.py cannot see whether /drive armed it in this "
                            "session process.")
    elif hooks_found:
        # Every copy is its own hook process with its own timeout; the harness kills each at
        # ITS number, so the gate budget comes from the smallest one.
        timed = [h for h in hooks_found if isinstance(h[2], int) and h[2] > 0]
        hook_label, hook_path, hook_to = min(timed, key=lambda h: h[2]) if timed else hooks_found[0]
        enforcement = "hook"
        enf_detail = "; ".join(
            f"{p}, timeout {to}s" + (f" ({SKILL_HOOK_ARMING})" if lbl == SKILL_HOOK_LABEL else "")
            for lbl, p, to in hooks_found)
        if a.unhooked:
            warnings.append(f"--unhooked ignored: a drive Stop hook IS installed ({settings_found[0][1]}).")
    else:
        sys.exit(
            "REFUSED — no Stop hook running `drive.py gate`: none declared in the frontmatter of "
            + skill_md_path() + " and none in "
            + ", ".join(p for _, p in settings_files(ws))
            + ". Without it nothing blocks your stop and every claim this drive makes about "
              "observed completion is false. Restore the skill's frontmatter (`atelier upgrade "
              "--refresh-commands --apply`) and invoke /drive, run `drive.py install-hook` (or "
              "--project to commit it), or seal with --unhooked \"<reason>\" and run `check` by "
              "hand at every boundary."
        )
    if a.hook_timeout is None:
        # The gate budget is a fraction of the HOOK's timeout, so the hook file is the
        # authority on it; the flag is for overriding a hook you are about to change.
        a.hook_timeout = hook_to if isinstance(hook_to, int) and hook_to > 0 else DEFAULT_HOOK_TIMEOUT
    elif isinstance(hook_to, int) and hook_to != a.hook_timeout:
        warnings.append(f"HOOK TIMEOUT MISMATCH: --hook-timeout {a.hook_timeout}s but the "
                        f"installed hook says timeout {hook_to}s ({hook_path}). The gate is "
                        "killed at the hook's number, not yours.")
    # A state outcome counts only when audit.jsonl attests it (X2): a hand-set outcome leaves the drive live.
    old_live = bool(old[0]) and (old[2].get("outcome") is None or not outcome_attested(old[0], old[2]))
    if old_live:
        old_fg = old[2].get("first_green_at") or audited_first_green(old[0])
        if old_fg:
            # The contract froze at first green: re-sealing now is the one move that can turn a
            # finished drive into an easier one. The audit's first_green counts even if state lost it.
            hint = ("end your turn (hooked)" if old[1].get("enforcement") == "hook"
                    else f"python3 \"{me()}\" close")
            sys.exit(f"REFUSED — first green recorded ({old_fg}) on {old[0]} — close it "
                     f"with `close` instead of re-sealing: {hint}")
        if not a.force:
            sys.exit(f"drive already active: {old[0]} (outcome=None). Finish it, `abort`, or --force.")
        if not a.why_force:
            sys.exit("--force replaces a LIVE contract: it needs --why-force '<reason>'. Re-sealing an "
                     "unfinished drive with easier conditions is the cheapest way to fake done.")
    conds, taken = [], []
    for spec in a.cond:
        if "=" not in spec:
            sys.exit(f"--cond needs ID=CMD, got {spec!r}")
        cid, cmd = spec.split("=", 1)
        cid = cid.strip()
        _check_new_id(cid, taken)
        if not cmd.strip():
            sys.exit(f"condition {cid!r} has an empty command")
        conds.append({"id": cid, "cmd": cmd.strip()})
        taken.append(cid)
    preps = []
    for spec in a.checker:
        cid, path = _split_spec("--checker", spec)
        _check_new_id(cid, taken)
        preps.append(prepare_checker(cid, path))
        taken.append(cid)
    check_ceiling(len(conds) + len(preps))
    red_dirs = parse_red_proofs(a.red_proof, {p["id"] for p in preps}, ws)
    user_site = (a.allow_user_site or "").strip()
    pass_names = parse_pass_env(a.pass_env, allow_user_site=bool(user_site))
    python = os.path.abspath(sys.executable)
    python_real = os.path.realpath(python)
    sealed_env = snapshot_env(pass_names, allow_user_site=bool(user_site))
    wsr = os.path.realpath(ws)
    in_ws = lambda q: bool(q) and (os.path.realpath(q) == wsr or os.path.realpath(q).startswith(wsr + os.sep))
    ws_on_path = [e for e in sealed_env.get("PATH", "").split(os.pathsep) if in_ws(e)]
    ws_python = (a.allow_workspace_python or "").strip()
    # the interpreter's own path counts with its LAST symlink unresolved: a .venv/bin/python3 links outside
    py_link = os.path.join(os.path.realpath(os.path.dirname(python)), os.path.basename(python))
    if (in_ws(py_link) or py_link.startswith(wsr + os.sep) or in_ws(python_real)) and not ws_python:
        # Z1c: its installed packages (pytest itself) are agent-writable and NOT hashed
        sys.exit(f"REFUSED — the interpreter {python} (realpath {python_real}) is inside the workspace: packages "
                 "installed there (pytest itself) are agent-writable and are NOT hashed, so a python condition could "
                 "be turned green by editing them. Run drive.py with an interpreter outside the workspace, or pass "
                 "--allow-workspace-python \"<reason>\" (sealed and announced).")
    probe_env = condition_env({"env": sealed_env, "allow_user_site": user_site or None})
    path_py = shutil.which("python3", path=sealed_env.get("PATH", ""))
    pythons = [python] + ([path_py] if path_py and os.path.realpath(path_py) != python_real else [])
    startup, perr = probe_startup(pythons, probe_env, ws, bool(user_site))
    if startup is None:
        sys.exit(f"REFUSED — {perr}; the startup set cannot be sealed")
    # Judgment calls are main's — but they are DECLARED here, with a reason, and audited.
    if a.verify == "none" and not a.why_no_verify:
        sys.exit("--verify none needs --why-no-verify '<reason>' (blast radius, size, who else checks)")
    if a.agents < 0:
        sys.exit("--agents is the PLANNED total worker count and cannot be negative "
                 "(--max-agents is the concurrent width, a different number)")
    if a.agents == 0 and not a.why_solo:
        sys.exit("--agents 0 needs --why-solo '<reason>' (one seam, tiny task, agent tool unavailable, ...)")
    globs = [g.strip() for g in (a.protect_tests or "").split(",") if g.strip()]
    baseline = None
    if a.protect_tests is not None and not globs:
        sys.exit("REFUSED — --protect-tests needs at least one glob")
    if globs:
        baseline, empty = build_tests_baseline(ws, globs)
        if not baseline["files"]:
            sys.exit(f"REFUSED — --protect-tests matched no existing file in {ws}: {', '.join(globs)}")
        if baseline["total_assertions"] < 1:
            sys.exit(f"REFUSED — --protect-tests matched {len(baseline['files'])} file(s) but 0 assertions "
                     "in total: there is nothing to protect")
        if empty:
            warnings.append("PROTECT-TESTS glob(s) matched nothing: " + ", ".join(empty))
    did = time.strftime("%Y%m%d-%H%M%S") + "-" + uuid.uuid4().hex[:6]
    cdir = os.path.join(base, did)  # path only: nothing is created until every refusal has passed
    ck_conds = [checker_condition(cdir, p, python, bool(user_site)) for p in preps]
    conds += ck_conds
    allow_green = set(filter(None, (a.allow_green or "").split(",")))
    if baseline:
        conds.append({"id": TESTS_COND,
                      "cmd": self_cmd(python, "tests-guard", "--cdir", cdir),
                      "desc": f"no baselined test file ({len(baseline['files'])}) is missing, loses "
                              "assertions, or gains a vacuous one"})
        allow_green.add(TESTS_COND)  # green at seal by construction
    conds.append(report_condition(cdir, verify=(a.verify == "required"), python=python))
    ids = [c["id"] for c in conds]
    if a.auto_pause_empty and not a.auto_pause_empty >= AUTO_PAUSE_FLOOR:
        sys.exit(f"REFUSED — --auto-pause-empty {a.auto_pause_empty}: 0 (off) or ≥ {AUTO_PAUSE_FLOOR}")
    crash_ok = set(filter(None, (a.allow_crash_red or "").split(",")))
    if crash_ok - set(ids):
        sys.exit("REFUSED — --allow-crash-red names unknown condition id(s): " + ", ".join(sorted(crash_ok - set(ids))))
    for cid, text in parse_known_incomplete(a.known_incomplete, ids):
        next(c for c in conds if c["id"] == cid).setdefault("known_incomplete", []).append(text)
    cmap = parse_map(a.map, ids)
    budget = int(a.hook_timeout * GATE_BUDGET_FRAC)
    contract = {
        "id": did,
        "task": a.task,
        "conditions": conds,
        "caps": {"max_blocks": a.max_blocks, "max_minutes": a.max_minutes},
        "timeout": a.timeout,
        "hook_timeout": a.hook_timeout,
        "gate_budget": budget,
        "enforcement": enforcement,
        "enforcement_detail": enf_detail,
        "allow_green": sorted(allow_green),
        "allow_crash_red": sorted(crash_ok),
        "workspace": ws,
        "relay_mb": a.relay_mb,
        # sealed condition environment (X1): conditions run with exactly this, never the caller's env
        "env": sealed_env,
        "pass_env": pass_names,
        "allow_user_site": user_site or None,
        "python": python,
        # the interpreter is sealed by content too (Y2): every sweep re-hashes it before and after
        "python_realpath": python_real,
        "python_sha256": sha256_file(python_real),
        # Z1b: every .pth / sitecustomize / usercustomize / pyvenv.cfg its startup would run, re-scanned each sweep
        "startup": startup,
        "allow_workspace_python": ws_python or None,
        "tests_baseline_sha256": None,
        "map": cmap,
        "protect_tests": ({"globs": globs, "files": len(baseline["files"]),
                           "assertions": baseline["total_assertions"]} if baseline else None),
        "amendments": [],
        "policy": {
            "verify": a.verify, "why_no_verify": a.why_no_verify,
            "agents_planned": a.agents, "why_solo": a.why_solo, "max_agents": a.max_agents,
            "auto_pause_empty": a.auto_pause_empty,
            "seams": [s.strip() for s in a.seams.split(";") if s.strip()],
        },
    }
    # Gate-budget guard: conditions run SERIALLY inside one Stop-hook firing, and a hook
    # that outruns its `timeout` is killed with no decision — the stop is then allowed
    # with conditions still red, and nothing is audited. Refuse a contract that cannot
    # print in time.
    worst = a.timeout * len(conds)
    if worst > budget:
        per = max(1, budget // len(conds))
        sys.exit(
            f"REFUSED — worst-case gate sweep {worst}s ({len(conds)} conditions × --timeout "
            f"{a.timeout}s, run serially) exceeds the {budget}s gate budget for a Stop hook with "
            f"timeout={a.hook_timeout}s. The hook would be KILLED mid-sweep and the stop allowed "
            f"with conditions red. Use --timeout {per} (or fewer/faster conditions), or raise the "
            "Stop-hook timeout in settings.json and pass a matching --hook-timeout."
        )
    # Sealed checker copies and the tests baseline must exist for the seal-time sweep and the
    # red-proof, so they are STAGED in the drive dir — and removed again on any refusal below.
    staged = bool(preps or baseline)
    created_base = not os.path.isdir(base)
    sealed_ok = False
    try:
        if staged:
            os.makedirs(cdir)
            for cond, prep in zip(ck_conds, preps):
                install_checker(cond, prep)
            if baseline:
                write_json(os.path.join(cdir, TESTS_BASELINE), baseline)
                contract["tests_baseline_sha256"] = sha256_file(os.path.join(cdir, TESTS_BASELINE))
            for cond in ck_conds:
                if cond["id"] in red_dirs:
                    run_red_proof(cond, red_dirs[cond["id"]], a.timeout, condition_env(contract))
        # Vacuous-contract guard: a contract green at seal drives nothing.
        res = evaluate(cdir, contract, ws, budget=budget)
        green = [i for i, m, _ in res if m and i != "report"]
        red = [i for i, m, _ in res if not m]
        unexpected = [i for i in green if i not in contract["allow_green"]]
        if unexpected:
            sys.exit(
                "REFUSED — already green at seal: " + ", ".join(unexpected)
                + ". A condition that passes before the work is not a done-condition. "
                "Tighten it, or name it in --allow-green if it is a regression guard."
            )
        if not [i for i in red if i not in RESERVED_IDS]:
            sys.exit("REFUSED — every condition is green already; nothing to drive.")
        refuse_crash_reds(res, crash_ok, "seal")
        if baseline and TESTS_COND in red:
            sys.exit(f"REFUSED — {TESTS_COND} is red at seal, against its own fresh baseline: "
                     + next((t for i, m, t in res if i == TESTS_COND), ""))
        sealed_ok = True
    finally:
        if staged and not sealed_ok:
            discard_staged(cdir, base, created_base)
    unproven = [c["id"] for c in ck_conds if not c["checker"].get("red_proven")]
    session = a.session or os.environ.get("CLAUDE_CODE_SESSION_ID") or None
    # The model cannot see its own transcript path (the gate reads it from a payload only the
    # harness sends), so asking it for one invites an invented value. Derive it instead.
    transcript, tsource = a.transcript, ("flag" if a.transcript else "none")
    if not transcript:
        transcript = derive_transcript(ws, session)
        tsource = "derived" if transcript else "none"
    if enforcement == "none":
        warnings.append("ENFORCEMENT NONE (" + enf_detail + "): nothing blocks your stop. Run "
                        "`check` by hand at every boundary and before you answer; finish with `close`.")
    if not session:
        warnings.append("NO SESSION ID at seal: the drive will be adopted by whichever session fires "
                        "the Stop hook first — a sibling session included. Pass --session, or seal from "
                        "the session that will do the work.")
    trusted, detail = workspace_trusted(ws)
    if not trusted:
        warnings.append(f"UNTRUSTED WORKSPACE ({detail}): Claude Code drops this project's "
                        "permissions.allow entries while still honouring its hooks — the gate will block "
                        "while the grants the model needs are void. Accept the trust dialog before driving.")
    for w in warnings:
        print("WARNING — " + w, file=sys.stderr)
    if ws_on_path:
        print("WARNING: WORKSPACE ON PATH: " + ", ".join(ws_on_path) + " — binaries there are agent-writable; "
              "only the interpreter and its startup files are hashed", file=sys.stderr)

    # --- refusals are past; now, and only now, create state.
    if old_live:
        # A superseded drive is never left at outcome=None: the record follows the work.
        set_terminal(old[0], old[2], "superseded", why=a.why_force, by=did)
    os.makedirs(os.path.join(cdir, "agents"), exist_ok=True)
    state = {
        "session": session,
        "started_at": now_iso(),
        "sealed_at_ms": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
        "blocks": 0,
        "history": [],
        "outcome": None,
        "first_green_at": None,
        "transcript_at_seal": transcript_bytes(transcript),
        "transcript_baseline": "seal" if transcript else None,
        "transcript_source": tsource,
        "transcript_path": transcript,
        "checkers": {c["id"]: {"path": c["checker"]["path"], "sha256": c["checker"]["sha256"]}
                     for c in ck_conds},
    }
    if baseline:
        state["tests_baseline_sha256"] = sha256_file(os.path.join(cdir, TESTS_BASELINE))
    write_json(os.path.join(cdir, "contract.json"), contract)
    # Tamper-EVIDENCE, not tamper-proofing: the contract is in-workspace and writable, so
    # a weakened condition cannot be prevented — but it can be made loud instead of silent.
    state["contract_sha256"] = sha256_file(os.path.join(cdir, "contract.json"))
    write_json(os.path.join(cdir, "state.json"), state)
    with open(os.path.join(cdir, "PROGRESS.md"), "w") as f:
        f.write(f"# drive {did}\n\n{a.task}\n\n")
    with open(active_path(ws), "w") as f:
        f.write(did + "\n")
    audit(cdir, "sealed", session=session, red=red, green=green, policy=contract["policy"],
          contract_sha256=state["contract_sha256"], gate_budget=budget, timeout=a.timeout,
          enforcement=enforcement, enforcement_detail=enf_detail, transcript_source=tsource,
          checkers={c["id"]: c["checker"] for c in ck_conds}, protect_tests=contract["protect_tests"],
          map=cmap)
    pol = contract["policy"]
    print(json.dumps({
        "id": did, "dir": cdir, "session": session, "red_at_seal": red,
        "green_at_seal": green, "caps": contract["caps"], "policy": pol,
        "gate_budget": budget, "report": os.path.join(cdir, "REPORT.md"),
        "enforcement": enforcement, "enforcement_detail": enf_detail,
        "transcript_source": tsource, "D": os.path.abspath(__file__),
        "unproven_checkers": unproven, "protect_tests": contract["protect_tests"],
    }, indent=2))
    # `D` is printed ABSOLUTE: the gate walks up from any cwd, a relative `D` does not.
    print(f'\nD = python3 "{os.path.abspath(__file__)}"   (absolute — a relative D dies after a cd)')
    # The announce line is printed by the script, so its shape is not up to the model.
    print(f"\n[/drive {did} · conditions={len(conds)} · agents={pol['agents_planned']} planned"
          f"/{pol['max_agents']} at a time"
          f"{' (' + pol['why_solo'] + ')' if pol['agents_planned'] == 0 else ''}"
          f" · verify={pol['verify']}{' (' + pol['why_no_verify'] + ')' if pol['verify'] == 'none' else ''}"
          f" · caps {contract['caps']['max_blocks']} blocks/{contract['caps']['max_minutes']} min"
          f" · gate budget {budget}s"
          f" · enforcement={enforcement} ({enf_detail})"
          + (f" · {map_summary(cmap)}" if cmap else "")
          + (f" · unproven checkers: {', '.join(unproven)}" if unproven else "")
          + (f" · auto-pause after {pol['auto_pause_empty']} empty stops" if pol.get("auto_pause_empty") else "")
          + (f" · crash-red allowed: {', '.join(contract['allow_crash_red'])}" if contract["allow_crash_red"] else "")
          + (f" · user-site allowed ({user_site})" if user_site else "")
          + (f" · workspace python allowed ({ws_python})" if ws_python else "")
          + (f" · WARNING: WORKSPACE ON PATH: {', '.join(ws_on_path)}" if ws_on_path else "")
          + ("".join(" · WARNING: " + w.split(":")[0] for w in warnings)) + "]")


def cmd_amend(a):
    """ADDITIVE-only change to the live contract. Nothing can be dropped, redefined or lowered."""
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        sys.exit("REFUSED — no active drive")
    if not (a.reason or "").strip():
        sys.exit('REFUSED — amend needs --reason "<why>" (it is written into contract.json amendments[])')
    with drive_lock(cdir):
        fresh = load_active(ws)
        if fresh[0] == cdir and fresh[1] and fresh[2]:
            contract, state = fresh[1], fresh[2]
        if state.get("outcome") is not None and outcome_attested(cdir, state):
            sys.exit(f"REFUSED — drive is terminal (outcome={state['outcome']}); nothing to amend")
        attest_outcome(cdir, state)
        fg = state.get("first_green_at") or audited_first_green(cdir)
        if fg:
            sys.exit(f"REFUSED — first green recorded ({fg}): the contract is frozen. Close out: hooked → "
                     f"end your turn; unhooked → python3 \"{me()}\" close.")
        files, ck_ids = seal_breaks(cdir, contract, state)
        if files or ck_ids:
            audit_breaks(cdir, state, files, ck_ids)
            sys.exit("REFUSED — the seal is broken (" + ", ".join(files + [f"checker {i}" for i in ck_ids])
                     + "); an amend never blesses a hand edit. Restore it first.")
        if not (a.add_cond or a.checker or a.known_incomplete or a.map or a.timeout is not None
                or a.raise_blocks is not None or a.raise_minutes is not None):
            sys.exit("REFUSED — nothing to amend: give --add-cond/--checker/--known-incomplete/--map/"
                     "--raise-blocks/--raise-minutes/--timeout")
        existing = [c["id"] for c in contract["conditions"]]
        taken = list(existing)
        added = []
        for spec in a.add_cond:
            cid, cmd = _split_spec("--add-cond", spec)
            _check_new_id(cid, taken)
            if not cmd.strip():
                sys.exit(f"REFUSED — condition {cid!r} has an empty command")
            added.append({"id": cid, "cmd": cmd.strip()})
            taken.append(cid)
        preps = []
        for spec in a.checker:
            cid, path = _split_spec("--checker", spec)
            _check_new_id(cid, taken)
            preps.append(prepare_checker(cid, path))
            taken.append(cid)
        red_dirs = parse_red_proofs(a.red_proof, {p["id"] for p in preps}, ws, "--checker in this amend")
        python = contract.get("python") or os.path.abspath(sys.executable)
        env = condition_env(contract)  # the env sealed at start; amend has no way to change it
        caps = dict(contract["caps"])
        raises = {}
        if a.raise_blocks is not None:
            if a.raise_blocks <= caps["max_blocks"]:
                sys.exit(f"REFUSED — --raise-blocks {a.raise_blocks} is not higher than the current cap "
                         f"{caps['max_blocks']}; a cap is never lowered")
            raises["max_blocks"] = [caps["max_blocks"], a.raise_blocks]
            caps["max_blocks"] = a.raise_blocks
        if a.raise_minutes is not None:
            if a.raise_minutes <= caps["max_minutes"]:
                sys.exit(f"REFUSED — --raise-minutes {a.raise_minutes} is not higher than the current cap "
                         f"{caps['max_minutes']}; a cap is never lowered")
            raises["max_minutes"] = [caps["max_minutes"], a.raise_minutes]
            caps["max_minutes"] = a.raise_minutes
        ck_conds = [checker_condition(cdir, p, python, bool(contract.get("allow_user_site"))) for p in preps]
        new_conds = added + ck_conds
        new_ids = [c["id"] for c in new_conds]
        allow = set(filter(None, (a.allow_green or "").split(",")))
        if allow - set(new_ids):
            sys.exit("REFUSED — --allow-green in an amend may only name conditions added by it; unknown: "
                     + ", ".join(sorted(allow - set(new_ids))))
        # merged contract: auto conditions stay last, the report very last
        user = [c for c in contract["conditions"] if c["id"] not in RESERVED_IDS]
        auto = [c for c in contract["conditions"] if c["id"] in RESERVED_IDS]
        merged = user + new_conds + auto
        check_ceiling(len(user) + len(new_conds))
        all_ids = [c["id"] for c in merged]
        ki = parse_known_incomplete(a.known_incomplete, all_ids)
        cmap = dict(contract.get("map") or {})
        map_changes = {}
        for key, val in parse_map(a.map, all_ids).items():
            cur = cmap.get(key)
            if cur is None or cur == "unmapped":
                new = val
            elif val == "unmapped":
                sys.exit(f"REFUSED — --map {key}: already mapped to {','.join(cur)}; a mapped row never "
                         "goes back to unmapped")
            else:
                new = list(cur) + [x for x in val if x not in cur]
            if cur == "unmapped" and new == "unmapped":
                continue
            cmap[key] = new
            map_changes[key] = new
        budget = gate_budget(contract)
        timeout = old_timeout = contract.get("timeout", DEFAULT_TIMEOUT)
        if a.timeout is not None:
            # LOWER only: a condition that outruns its timeout is unmet, so a lower one can only make the
            # contract harder to pass. A raise would loosen what was sealed.
            if not 1 <= a.timeout < old_timeout:
                sys.exit(f"REFUSED — --timeout {a.timeout}: the per-condition timeout can only be LOWERED "
                         f"(sealed {old_timeout}s; 1 ≤ N < {old_timeout})")
            # Only as far as the budget needs: a red condition's run time says nothing about its green run (it
            # often fails in milliseconds until the evidence exists), so no measurement proves a deeper cut safe.
            need = budget // len(merged)
            if need >= old_timeout:
                sys.exit(f"REFUSED — --timeout {a.timeout}: {len(merged)} conditions × the sealed {old_timeout}s "
                         f"already fit the {budget}s gate budget; nothing needs a lower timeout.")
            if a.timeout < need:
                sys.exit(f"REFUSED — --timeout {a.timeout}: lower it only as far as the gate budget needs — "
                         f"`--timeout {need}` fits {len(merged)} conditions in {budget}s. A timeout below a "
                         "condition's green run makes it unmet for good, and it can never be raised back.")
            # A lower timeout must not turn an existing condition into a permanent TIMEOUT (it could never be
            # raised back): time each one now under the sealed timeout, and refuse if any needs ≥ 80% of the new.
            slow = []
            for c in user + new_conds + auto:
                t0 = time.time()
                _, tail = run_condition(c, ws, old_timeout, env=env)
                took = time.time() - t0
                if took >= 0.8 * a.timeout:
                    slow.append(f"{c['id']} took {took:.1f}s" + (" (TIMEOUT)" if tail.startswith("TIMEOUT") else ""))
            if slow:
                sys.exit(f"REFUSED — --timeout {a.timeout}: " + "; ".join(slow) + f" under the sealed {old_timeout}s. "
                         "A timeout below a condition's own run time makes it unmet for good.")
            timeout = a.timeout
        if timeout * len(merged) > budget:
            fit = budget // len(merged)
            sys.exit(f"REFUSED — worst-case gate sweep {timeout * len(merged)}s ({len(merged)} conditions × "
                     f"timeout {timeout}s) exceeds the {budget}s gate budget; the amended contract could not "
                     "print in time. "
                     + (f"It fits at exactly `--timeout {fit}` (lower it in this amend)" if fit >= 1
                        else "Split the task into drives"))
        crash_ok = set(filter(None, (a.allow_crash_red or "").split(",")))
        if crash_ok - set(new_ids):
            sys.exit("REFUSED — --allow-crash-red in an amend may only name conditions added by it; unknown: "
                     + ", ".join(sorted(crash_ok - set(new_ids))))
        written = []
        try:
            for cond, prep in zip(ck_conds, preps):
                written.append(install_checker(cond, prep))
            for cond in ck_conds:
                if cond["id"] in red_dirs:
                    run_red_proof(cond, red_dirs[cond["id"]], timeout, env)
            if new_conds:
                res = evaluate(cdir, {"conditions": new_conds, "timeout": timeout, "env": env,
                                      "allow_user_site": contract.get("allow_user_site"),
                                      "startup": contract.get("startup")}, ws, budget=budget)
                refuse_crash_reds(res, crash_ok, "amend")
                green = [i for i, m, _ in res if m and i not in allow]
                if green:
                    sys.exit("REFUSED — added condition(s) already green at amend: " + ", ".join(green)
                             + ". A condition that passes before the work is not a done-condition; name "
                               "it in --allow-green if it is a regression guard.")
        except BaseException:
            for p in written:
                with contextlib.suppress(OSError):
                    os.remove(p)
            raise
        old_sha = state.get("contract_sha256")
        by_id = {c["id"]: c for c in merged}
        for cid, text in ki:
            by_id[cid].setdefault("known_incomplete", []).append(text)
        contract["conditions"] = merged
        contract["caps"] = caps
        contract["map"] = cmap
        contract["allow_green"] = sorted(set(contract.get("allow_green") or []) | allow)
        if timeout != old_timeout:
            contract["timeout"] = timeout
            raises["timeout_lowered"] = [old_timeout, timeout]
        contract["allow_crash_red"] = sorted(set(contract.get("allow_crash_red") or []) | crash_ok)
        entry = {"ts": now_iso(), "reason": a.reason.strip(), "added": new_ids, "raises": raises,
                 "old_sha": old_sha, "known_incomplete": [[i, t] for i, t in ki], "map": map_changes,
                 "allow_green": sorted(allow),
                 "red_proven": {c["id"]: c["checker"].get("red_proven") for c in ck_conds}}
        contract.setdefault("amendments", []).append(entry)
        write_json(os.path.join(cdir, "contract.json"), contract)
        state["contract_sha256"] = sha256_file(os.path.join(cdir, "contract.json"))
        ckmap = dict(state.get("checkers") or {})
        for c in ck_conds:
            ckmap[c["id"]] = {"path": c["checker"]["path"], "sha256": c["checker"]["sha256"]}
        state["checkers"] = ckmap
        write_json(os.path.join(cdir, "state.json"), state)
        audit(cdir, "amended", reason=entry["reason"], added=new_ids, raises=raises, old_sha=old_sha,
              new_sha=state["contract_sha256"], known_incomplete=entry["known_incomplete"], map=map_changes)
    unproven = [c["id"] for c in ck_conds if not c["checker"].get("red_proven")]
    print(f"amended {contract['id']} (#{len(contract['amendments'])}): added {new_ids or 'none'}"
          f"{'; changed ' + ', '.join(f'{k} {v[0]}→{v[1]}' for k, v in raises.items()) if raises else ''}"
          f"{'; known-incomplete +' + str(len(ki)) if ki else ''}"
          f"{'; ' + map_summary(cmap) if map_changes else ''}"
          f"{'; unproven checkers: ' + ', '.join(unproven) if unproven else ''}"
          f" · blocks carried {state['blocks']}/{caps['max_blocks']}")


def cmd_check(a):
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        print("no active drive"); sys.exit(2)
    contract, res, unmet, files, ids, state, _, bad = observe(cdir, contract, state, ws, "check")
    if (state.get("first_green_at") and not unmet and not (files or ids) and not bad
            and state.get("outcome") is None):
        print(first_green_line(state["first_green_at"]))
    if bad:
        print(state_tamper_line(bad))
    if pause_attested(cdir, state):
        print(f"PAUSED since {state['paused_at']} (by {state.get('paused_by')}): the gate lets every stop "
              f"through; `python3 {me()} resume` re-arms it")
    for ln in tamper_lines(files, ids):
        print(ln)
    for ln in not_attested_lines(cdir):
        print(ln)
    print_results(contract, res)
    print(f"unmet={unmet} blocks={state['blocks']}/{contract['caps']['max_blocks']} outcome={state['outcome']}")
    if contract.get("enforcement") == "none":
        # The one line that has to survive every block: this drive is advisory.
        print("enforcement=none: run check at every boundary; nothing blocks your stop")
        print("enforcement=none: finish with close")
    audit(cdir, "check", unmet=unmet, tampered=files + [f"checker:{i}" for i in ids] + (["state"] if bad else []))
    # Exit code so the caller can chain on it: 1 = still work to do (or a broken seal).
    sys.exit(1 if unmet or files or ids or bad else 0)


def cmd_close(a):
    """The close-out: all green (and the seal intact) → terminal `met`. No session check, no
    block bump. Not green → prints what `check` prints and changes nothing."""
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        print("no active drive"); sys.exit(2)
    report = os.path.join(cdir, "REPORT.md")
    if state.get("outcome") is not None and outcome_attested(cdir, state):
        # already terminal (attested) → print it, whatever the enforcement (Y8)
        if state["outcome"] == "met":
            print(f"MET {contract['id']} — {report} (already terminal)")
            sys.exit(0)
        print(f"already terminal: outcome={state['outcome']} — not met")
        sys.exit(1)
    if contract.get("enforcement") == "hook":
        # The gate runs in the harness's environment and closes a hooked drive as the turn ends; a
        # model-side close is the unhooked path only (X1a). A contract hand-edited to `none` is a
        # broken seal and is refused by the sweep below.
        audit(cdir, "close_refused", reason="hooked")
        print(HOOKED_CLOSE_REFUSAL)
        sys.exit(1)
    with drive_lock(cdir):
        fresh = load_active(ws)
        if fresh[0] == cdir and fresh[1] and fresh[2]:
            contract, state = fresh[1], fresh[2]
        bad = None
        if state.get("outcome") is not None:
            if outcome_attested(cdir, state):
                if state["outcome"] == "met":
                    print(f"MET {contract['id']} — {report} (already terminal)")
                    sys.exit(0)
                print(f"already terminal: outcome={state['outcome']} — not met")
                sys.exit(1)
            bad = attest_outcome(cdir, state)  # never the "already terminal" MET: sweep it as live
            print(state_tamper_line(bad))
        contract, res, files, ids = sealed_sweep(cdir, contract, state, ws)
        unmet = [i for i, m, _ in res if not m]
        if files or ids:
            audit_breaks(cdir, state, files, ids)
        if unmet or files or ids:
            for ln in tamper_lines(files, ids):
                print(ln)
            print_results(contract, res)
            print(f"unmet={unmet} blocks={state['blocks']}/{contract['caps']['max_blocks']} "
                  f"outcome={state['outcome']}")
            print(f"NOT CLOSED — {len(unmet)} unmet{' and a broken seal' if files or ids else ''}; "
                  "the drive stays open")
            audit(cdir, "close_refused", unmet=unmet, tampered=files + [f"checker:{i}" for i in ids])
            sys.exit(1)
        ensure_first_green(cdir, state, "close")
        audit(cdir, "closed", blocks=state["blocks"], first_green_at=state["first_green_at"])
        set_terminal(cdir, state, "met", blocks=state["blocks"], via="close")
    print(f"MET {contract['id']} — {report}")
    sys.exit(0)


def exits_line():
    return ("Legal exits: every condition green (including the REPORT.md `report` condition), an audited abort, "
            f"or the cap. The OPERATOR's exits: `python3 {me()} pause` keeps the drive for a later session "
            "(honoured only when the operator's latest prompt asks to pause/hold/stop), "
            f"`python3 {me()} release` ends it (operator-only).")


def build_block_reason(cdir, contract, state, res, stall, tbytes=0, delta_mb=0.0, baseline=False, flags=None):
    """→ (reason, signature). `flags` colour the reason, never the record: tampered_files, tampered_checkers,
    state_tampered, abort_file_unaudited, budget_starved, pause_unattested, hold (word, excerpt), empty.

    The signature is what makes a block NEW: each unmet condition's last output line (numbers masked), the
    stall tier, the agents waited on, every warning. A block whose signature equals the previous block's
    prints a short form (P5) — each block reason is stored twice in the transcript. The short form still
    repeats every warning, the collect instruction and the hard-stall demand; it drops only the condition
    descriptions and the standing rules."""
    f = flags or {}
    caps = contract["caps"]
    n = state["blocks"]
    me_ = me()
    growth = "baseline" if baseline else f"+{delta_mb:.1f} MB since the last block"
    head = (f"/drive {contract['id']} — NOT DONE. Block {n}/{caps['max_blocks']}; "
            f"wall {int(wall_minutes(state))}/{caps['max_minutes']} min; "
            f"transcript {tbytes / 1e6:.1f} MB ({growth}).")
    unmet = [i for i, m, _ in res if not m]
    hold = f.get("hold")
    relay_mb = contract.get("relay_mb", DEFAULT_RELAY_MB)
    pressure = delta_mb >= relay_mb
    tier = "hard" if stall >= STALL_HARD else "k" if stall >= STALL_K else ""
    pending = outstanding_agents(cdir)
    uncollected = uncollected_agents(cdir)
    tails = [[i, re.sub(r"\d+(\.\d+)?", "#", (t.strip().splitlines() or [""])[-1])] for i, m, t in res if not m]
    sig = hashlib.sha256(json.dumps([
        tails, tier, pending, uncollected, bool(f.get("state_tampered")), f.get("tampered_files") or [],
        f.get("tampered_checkers") or [], bool(f.get("abort_file_unaudited")), f.get("budget_starved") or [],
        pressure, bool(f.get("pause_unattested")), bool(f.get("empty")), bool(hold),
    ], sort_keys=True, default=str).encode()).hexdigest()[:16]

    # Lines every form carries.
    warn = []
    if f.get("state_tampered"):
        warn.append(state_tamper_line(f["state_tampered"]) + " — the drive is live; it is enforced as one.")
    if f.get("pause_unattested"):
        warn.append("PAUSE NOT ATTESTED: state.json says paused but audit.jsonl records no such pause — the drive "
                    f"is live and enforced. A real pause is `python3 {me_} pause`, on the operator's order.")
    warn += tamper_lines(f.get("tampered_files") or [], f.get("tampered_checkers") or [])
    if f.get("abort_file_unaudited"):
        warn.append(
            f"ABORT.md is present but no audited abort was run — a hand-written ABORT.md ends nothing. Run "
            f"`python3 {me_} abort --blocked ... --mechanism ... --evidence ... --attempts '<try 1>;<try 2>'`."
        )
    if f.get("budget_starved"):
        warn.append(
            f"GATE BUDGET EXHAUSTED: {', '.join(f['budget_starved'])} could not be run inside the "
            f"{gate_budget(contract)}s sweep budget, so they count UNMET. Make the earlier conditions "
            "faster (or lower --timeout at the next seal); a gate that cannot finish cannot enforce."
        )
    if pressure:
        warn.append(
            f"CONTEXT PRESSURE: +{delta_mb:.1f} MB of transcript since the last block (relay threshold {relay_mb} MB). "
            "You did the work in main context. From here on: `drive.py brief --agent relay-<n>` and dispatch a "
            "RELAY orchestrator agent to continue the drive; main context only dispatches, waits, verifies."
        )
    collect = ([f"Returned, not collected: {', '.join(uncollected)} — run collect for each "
                f"(reading a RETURN.md by hand bypasses validation): `python3 {me_} collect <name>`. "
                "A verifier's verdict does not count until it is collected."] if uncollected else [])
    # P3: an operator hold is a THIRD legal move, never a replacement for the stall ladder — the hold is read
    # by a regex, and a misread must not switch the ladder off.
    hold_line = ([f"OPERATOR HOLD?: the operator's latest prompt (\"{hold[1]}\") reads as a request to {hold[0]}. "
                  f"If it asks to pause this drive, run `python3 {me_} pause` and end your turn — a hold is not a "
                  "stall, so do not dispatch or abort over it. Otherwise keep working."] if hold else [])
    hard = ([f"STALLED ×{stall}: the same unmet set for {stall} consecutive blocks. Legal moves only: "
             "(1) dispatch one fresh-context agent per stalled condition NOW, or (2) "
             "`drive.py abort --blocked … --mechanism … --evidence … --attempts '<a>;<b>'` naming what you "
             "ruled out" + (", or (3) the operator's hold above: `pause`" if hold else "")
             + ". Restating the problem is not a move."] if stall >= STALL_HARD else [])
    spine = ([("Spine: numbers pass — regenerate every count from the artifact · verify by contact, not recognition · "
               "prove yourself wrong once before reporting · a worker's 'done' is a claim until a condition or a "
               "separate verifier says so · never game the gate (a weakened condition is a red one).")]
             if n == 1 or n % SPINE_EVERY == 0 else [])

    prev = state.get("last_reason") if isinstance(state.get("last_reason"), dict) else {}
    if prev.get("sig") == sig and isinstance(prev.get("full_block"), int):
        lines = [head,
                 f"Unmet set, last output lines and warnings unchanged since block {prev['full_block']}: unmet {unmet}"
                 + (f"; STALLED ×{stall}" if STALL_K <= stall < STALL_HARD else "")
                 + (f"; agents without a RETURN.md: {', '.join(pending)}" if pending else "")
                 + f". That block's instructions stand; `python3 {me_} check` prints the full output."]
        lines += warn + collect + hold_line + hard + spine
        lines.append("Keep working in THIS turn. " + exits_line())
        return "\n".join(lines), sig

    lines = [head, "Unmet conditions (observed by running them just now):"] + warn
    for i, m, tail in res:
        if not m:
            c0 = next((c for c in contract["conditions"] if c["id"] == i), {})
            # No description? Print the command itself — a bare id tells the model nothing.
            desc = c0.get("desc") or ("`" + c0.get("cmd", "")[:300] + "`")
            lines.append(f"  - {i}: {desc}".rstrip())
            tl = tail.split("\n")
            if i == "report" and len(tl) > 1:
                # report-check's detail lines echo sealed map keys and known-incomplete texts; those
                # never ride a block reason (checked once, in the report) — keep only its summary.
                tail = tl[0].split(": ", 1)[0] + ": " + tl[-1]
            lines.append(f"      {tail.replace(chr(10), ' | ')[:300]}")
    lines.append("")
    if pending:
        lines.append(
            f"Agents without a RETURN.md yet: {', '.join(pending)}. Poll their return files IN THIS TURN "
            "(bounded sleep loop); do not end the turn to wait. Each block spent waiting costs budget. "
            f"An agent you stopped or never dispatched: `python3 {me_} cancel <name>` — the gate stops waiting "
            "for it (cancel does not stop a running agent)."
        )
    lines += collect + hold_line + hard
    if STALL_K <= stall < STALL_HARD:
        lines.append(
            f"STALLED ×{stall}: unmet set unchanged for {stall} blocks. Dispatch a fresh-context agent "
            "for each stalled condition (brief = the condition id + its cmd + allowed files + a return "
            "path under .drive/<id>/agents/<name>/), then verify with a separate read-only agent."
        )
    if f.get("empty"):
        lines.append("EMPTY TURN: no tool call and no message since the last block. Ending a turn without work "
                     "spends a block and changes nothing.")
    lines += spine
    lines += [
        "Rules: keep working in THIS turn. Do not summarize, do not ask, do not end the turn to wait "
        "for agents — poll their return files in-turn (`sleep` loops ≤600s per Bash call). "
        f"Run `python3 {me_} check` before your next attempt to stop. " + exits_line(),
    ]
    return "\n".join(lines), sig


def cmd_gate(_a):
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except ValueError:
        payload = {}
    if not isinstance(payload, dict):
        payload = {}
    # The stop EVENT's identity is taken NOW, before the lock: a duplicate firing that waits
    # out a sibling's whole sweep must still describe the stop it was fired for (see
    # `_stop_event`).
    event = _stop_event(payload)
    why = []
    ws = ws_root(payload.get("cwd"))
    cdir, contract, state = load_active(ws, why)
    if not cdir:
        if why:  # a drive pointer exists but the drive behind it does not load → fail-open, loudly
            print(f"drive gate: {why[0]} (allowing stop)", file=sys.stderr)
        return
    if state.get("outcome") is not None and outcome_attested(cdir, state):
        return  # settled (and attested by audit.jsonl) → allow, silently
    with drive_lock(cdir):
        fresh = load_active(ws)  # re-read under the lock: two gates must not lose a block
        if fresh[0] == cdir and fresh[1] and fresh[2]:
            contract, state = fresh[1], fresh[2]
            if state.get("outcome") is not None and outcome_attested(cdir, state):
                return
        _gate_locked(cdir, contract, state, ws, payload, event)


# --- one stop, several firings.
#
# Claude Code does not dedup hooks: measured 2026-09-15 (claude 2.1.272), a byte-identical
# `drive.py gate` command in settings.json AND in SKILL.md's frontmatter ran TWICE for one stop,
# 2 ms apart. A leftover settings copy (user-level, an un-refreshed project, an explicit
# `install-hook`) next to the frontmatter hook is therefore two gates per stop, and without this
# every stop would bump `blocks` twice (the cap arrives at half the stops) and audit two blocks.
#
# Identity of a stop event = (session_id, prompt_id, transcript_path, transcript byte count),
# sampled when the firing STARTS. Why that is sound:
#   * concurrent firings of one stop receive the same payload and start together, before either
#     writes anything; both probes logged the same byte count for the same stop. Live check, same
#     day: a real /drive with a settings copy AND the frontmatter hook recorded two blocking hook
#     results per blocked stop in the transcript, and audit.jsonl counted 3 blocks for 3 stops;
#   * two DIFFERENT stops of one session cannot share it: a block makes the model produce output
#     before it can stop again, and that output is appended to the transcript, so the count
#     grows; `prompt_id` (present in 2.1.272 Stop payloads) separates two prompts outright;
#   * it is only trusted when it can discriminate: no session id or an unreadable/empty
#     transcript is no identity at all, and every such firing counts — a duplicate counted twice
#     is the old behaviour, a real stop NOT counted would stall the block cap.
# A dedup also requires the previous evaluation to be the LAST thing that touched the block
# count (`blocks` unchanged) and to have started within DEDUP_WINDOW_S of this one, so a stale
# record can never swallow a later stop. Only a BLOCK is replayed: a met/capped first firing
# has already made the drive terminal, and the attested-outcome check before the lock allows
# the duplicate. Replaying a block is also the only safe direction for a forged record — it can
# withhold a block count, never grant a stop.
DEDUP_WINDOW_S = 30
GATE_LAST = "gate-last.json"


def _stop_event(payload):
    """→ the stop-event identity dict for this firing, or None when it cannot discriminate."""
    sid = payload.get("session_id")
    tpath = payload.get("transcript_path")
    size = transcript_bytes(tpath) if isinstance(tpath, str) else 0
    if not sid or not size:
        return None
    return {"session": sid, "prompt_id": payload.get("prompt_id"), "transcript_path": tpath,
            "transcript_bytes": size, "started": time.time()}


def _duplicate_firing(cdir, state, event):
    """→ the block reason already issued for this same stop event, or None."""
    if not event:
        return None
    last = read_json(os.path.join(cdir, GATE_LAST))
    if not isinstance(last, dict) or not isinstance(last.get("reason"), str):
        return None
    if last.get("block") != state.get("blocks"):
        return None
    if any(last.get(k) != event[k] for k in ("session", "prompt_id", "transcript_path",
                                             "transcript_bytes")):
        return None
    started = last.get("started")
    if not isinstance(started, (int, float)) or abs(event["started"] - started) > DEDUP_WINDOW_S:
        return None
    return last["reason"]


def _hold_since(state):
    """A hold counts only from a prompt typed after the seal and after the last resume: an old `pause`
    prompt that a resume already answered never re-pauses the drive."""
    # `sealed_at_ms` is exact; a drive sealed before it existed has only second-precision `started_at`, where
    # +1 s keeps a prompt from earlier in the seal's own second out.
    sealed = _ts_epoch(state.get("sealed_at_ms"))
    return max(sealed if sealed is not None else epoch(state["started_at"]) + 1,
               _ts_epoch(state.get("unpaused_at")) or 0)


def _gate_locked(cdir, contract, state, ws, payload, event=None):
    sid = payload.get("session_id")
    if state.get("session") and sid and state["session"] != sid:
        return  # sibling session in the same repo → never blocked
    # P1: a paused drive lets EVERY stop through — no sweep, no block, no cap, and wall time frozen —
    # until `resume`. Only an audit-attested pause counts; a hand-set `paused_at` is dropped (enforced).
    # One line to the operator on every allowed stop, so a paused drive never passes for a met one.
    if pause_attested(cdir, state):
        print(json.dumps({"systemMessage": (
            f"/drive {contract['id']} is PAUSED (by {state.get('paused_by')}, since {state['paused_at']}); "
            f"not met. `python3 {me()} resume` re-arms it, `python3 {me()} release` ends it.")}))
        return
    if not state.get("session") and sid:
        state["session"] = sid  # adopt on first firing
        audit(cdir, "adopted", session=sid)
    dup = _duplicate_firing(cdir, state, event)
    if dup is not None:
        # Same stop, second hook copy: the same decision, no second block, no second audit line.
        print(json.dumps({"decision": "block", "reason": dup}))
        return
    pause_unattested = bool(state.get("paused_at"))
    if pause_unattested:
        audit(cdir, "state_tampered", paused_at=state.pop("paused_at"))
        state.pop("paused_by", None)
    bad = attest_outcome(cdir, state)  # a hand-set outcome is not a settled drive
    # Only an audited `abort` ends a drive. A hand-written ABORT.md is a stop wearing a
    # heading: say so and block (block-counted, so the cap still releases).
    abort_unaudited = abort_file_present(cdir) and not state.get("abort_declared")
    if abort_unaudited:
        audit(cdir, "abort_file_unaudited", n=state["blocks"])
    # Conditions FIRST: a drive whose last block lands exactly on the cap is met, not
    # capped. The cap ends a drive that is not done; it does not overwrite one that is.
    # The seal is hashed before AND after the sweep, from the very bytes that run (X3).
    contract, res, t_files, t_ids = sealed_sweep(cdir, contract, state, ws)
    caps = contract["caps"]
    budget = gate_budget(contract)
    tampered = bool(t_files or t_ids)
    if tampered:
        audit_breaks(cdir, state, t_files, t_ids)
    unmet = [i for i, m, _ in res if not m]
    starved = [i for i, m, t in res if not m and t.startswith("NOT RUN")]
    if starved:
        audit(cdir, "gate_budget_exhausted", not_run=starved, budget=budget)
    if not unmet and not tampered:
        ensure_first_green(cdir, state, "gate")
        set_terminal(cdir, state, "met", blocks=state["blocks"])
        return
    wall_min = wall_minutes(state)
    if wall_min >= caps["max_minutes"]:
        set_terminal(cdir, state, "capped", cap="wall", minutes=int(wall_min), unmet=unmet,
                     tampered=tampered)
        return
    if state["blocks"] >= caps["max_blocks"]:
        set_terminal(cdir, state, "capped", cap="blocks", blocks=state["blocks"], unmet=unmet,
                     tampered=tampered)
        return
    tpath = payload.get("transcript_path") if isinstance(payload.get("transcript_path"), str) else None
    tbytes = transcript_bytes(tpath)
    baseline = False
    last_path = state.get("last_transcript_path")
    if tpath and tbytes:
        state["last_transcript_path"] = tpath
    if state.pop("transcript_rebase", False) or (tpath and tbytes and last_path and last_path != tpath):
        # First block after a resume, or on another transcript file (P7): the growth since the last block is
        # pre-pause work, or another file's bytes — never this block's. This firing is the new baseline.
        prev, baseline = tbytes, True
    elif state["history"]:
        prev = state["history"][-1]["transcript_bytes"]
    else:
        prev = state.get("transcript_at_seal") or 0
        if not prev:
            # No --transcript at seal: this firing IS the baseline. Deltas start at block 2.
            state["transcript_at_seal"] = tbytes
            state["transcript_baseline"] = "gate"
            prev = tbytes
            baseline = True
    # What the transcript gained since the last block, minus the harness's copies of the gate's own
    # reasons (P7), and whether any tool was called in it (P4).
    # A transcript that SHRANK is another file (a resumed or forked session), not this one's growth:
    # nothing is known about the turn, so it is neither empty nor measured.
    seg = (transcript_segment(tpath, prev)
           if (tpath and tbytes and prev and tbytes >= prev and not baseline) else None)
    grown = max(0, tbytes - prev - (seg["hook_bytes"] if seg else 0)) if (tbytes and prev) else 0
    delta_mb = 0.0 if baseline else grown / 1e6
    # `hook_bytes > 0` is the harness's own record of the previous block: `gate` run by hand (any payload, any
    # number of times) writes no `Stop hook feedback` entry, so it can never manufacture an empty streak.
    # And only the HARNESS transcript of the bound session counts (a JSONL the model wrote could hold anything).
    canonical = derive_transcript(ws, sid)
    own = bool(canonical and tpath and os.path.realpath(canonical) == os.path.realpath(tpath))
    # And a turn that SAID something is not empty: "all done, the work is complete" three times is a model
    # declaring done — the one thing this gate exists to refuse — not a session that wants to end.
    empty = bool(own and seg is not None and seg["tool_uses"] == 0 and seg["texts"] == 0
                 and seg["hook_bytes"] > 0 and grown <= EMPTY_GROWTH_BYTES)
    floor = min(int(state.get("stall_floor") or 0), len(state["history"]))
    run_empty = 1 if empty else 0
    if empty:
        for h in reversed(state["history"][floor:]):
            if not h.get("empty"):
                break
            run_empty += 1
    auto = (contract.get("policy") or {}).get("auto_pause_empty", AUTO_PAUSE_EMPTY)
    # Never while an agent is out: its notification wakes the model into work that must be gated.
    if empty and auto and run_empty >= auto and not outstanding_agents(cdir):
        # P4: N stops in a row with nothing done in between are not a drive, they are a session that
        # wants to end. Hand the drive back to the operator instead of burning the block cap on it.
        set_paused(cdir, state, "gate-empty", empty_blocks=run_empty, unmet=unmet)
        print(json.dumps({"systemMessage": (
            f"/drive {contract['id']} PAUSED by the gate after {run_empty} empty turns in a row (no tool call). "
            f"Unmet: {unmet}. The drive is kept: `python3 {me()} resume` re-arms it, "
            f"`python3 {me()} release` ends it.")}))
        return
    hold = operator_hold(tpath, _hold_since(state), session=sid) if tpath and tbytes else None
    state["blocks"] += 1
    state["history"].append({"ts": now_iso(), "block": state["blocks"], "unmet": unmet,
                             "transcript_bytes": tbytes, "empty": empty})
    hist = state["history"]
    stall = 1
    while stall < len(hist) - floor and hist[-1 - stall]["unmet"] == unmet:
        stall += 1
    audit(cdir, "blocked", n=state["blocks"], unmet=unmet, stall=stall,
          transcript_bytes=tbytes, delta_mb=round(delta_mb, 2), tampered=tampered, empty=empty,
          hold=hold[0] if hold else None)
    # The block is recorded BEFORE the reason is rendered: a render that fails (fail-open) still counts.
    write_json(os.path.join(cdir, "state.json"), state)
    flags = {"tampered_files": t_files, "tampered_checkers": t_ids, "state_tampered": bad,
             "abort_file_unaudited": abort_unaudited, "budget_starved": starved,
             "pause_unattested": pause_unattested, "hold": hold, "empty": empty}
    reason, sig = build_block_reason(cdir, contract, state, res, stall, tbytes, delta_mb, baseline, flags)
    prev_reason = state.get("last_reason") if isinstance(state.get("last_reason"), dict) else {}
    short = prev_reason.get("sig") == sig and isinstance(prev_reason.get("full_block"), int)
    state["last_reason"] = {"sig": sig, "full_block": prev_reason["full_block"] if short else state["blocks"]}
    with contextlib.suppress(OSError):
        write_json(os.path.join(cdir, "state.json"), state)
    if event:
        # Best effort: a lost record only means a duplicate firing counts (the old behaviour).
        with contextlib.suppress(OSError):
            write_json(os.path.join(cdir, GATE_LAST), {**event, "block": state["blocks"],
                                                       "reason": reason})
    print(json.dumps({"decision": "block", "reason": reason}))


def _norm_pat(g):
    g = (g or "").strip().rstrip("/")
    return os.path.normpath(g) if g else ""


def _pat_hits(pattern, s):
    """Does `pattern` claim `s`? `**` is handled by fnmatch on the pattern string, with a
    plain `*` fallback for the `a/**` vs `a/x` shape."""
    if not pattern or not s:
        return False
    return (pattern == s or fnmatch.fnmatch(s, pattern)
            or fnmatch.fnmatch(s, pattern.replace("**", "*")))


def files_overlap(ws, globs_a, globs_b):
    """Paths/patterns claimed by BOTH sides — the write-collision test for two writers.

    On-disk expansion cannot see NET-NEW files, and net-new files are exactly what two
    parallel writers collide on. So: (a) expanded matches intersect, or (b) a pattern of
    one side fnmatch-es a pattern OR an expanded path of the other, in both directions.
    """
    import glob as _g

    def expand(gs):
        out = set()
        for g in gs:
            if not g.strip():
                continue
            out.update(os.path.relpath(p, ws) for p in _g.glob(os.path.join(ws, g.strip()), recursive=True))
        return out

    pa = [p for p in (_norm_pat(g) for g in globs_a) if p]
    pb = [p for p in (_norm_pat(g) for g in globs_b) if p]
    ea, eb = expand(globs_a), expand(globs_b)
    inter = ea & eb
    inter |= set(pa) & set(pb)
    for x in pa:
        for y in pb:
            if _pat_hits(x, y) or _pat_hits(y, x):
                inter.add(f"{x} ~ {y} (patterns overlap; may match files neither has created yet)")
        for p in eb:
            if _pat_hits(x, p):
                inter.add(p)
    for y in pb:
        for p in ea:
            if _pat_hits(y, p):
                inter.add(p)
    return inter


def porcelain_path(line):
    """The path out of one `git status --porcelain` line.

    Three shapes naive `line[3:]` slicing gets wrong, all surfacing as a phantom
    "changed outside the allowed files": a rename (`R  old -> new`), any path with a
    space or control char (git C-quotes it), and a directory (git appends `/`).
    """
    p = line[3:]
    if " -> " in p:
        p = p.split(" -> ", 1)[1]  # the destination is the file that exists now
    if len(p) > 1 and p.startswith('"') and p.endswith('"'):
        try:
            p = p[1:-1].encode().decode("unicode_escape")
        except (UnicodeDecodeError, ValueError):
            p = p[1:-1]
    return p.rstrip("/")


def agent_returned(adir, name):
    """A 0-byte RETURN.md is NOT a return: an agent that opened the file but has not
    written it yet must not clear the pending list or the redispatch guard."""
    try:
        return os.path.getsize(os.path.join(adir, name, "RETURN.md")) > 0
    except OSError:
        return False


_ATTEST_CACHE = {}


def agent_attestations(cdir):
    """Z2: name -> {"cancelled": bool, "collected": bool}, replayed from audit.jsonl in order: `cancelled` sets and
    `uncancelled` clears the cancel; a clean `collected` (no problems) sets and a redispatching `brief` clears the
    collection. A marker or stamp on disk counts only when this says so (mirrors outcome_attested)."""
    p = os.path.join(cdir, "audit.jsonl")
    try:
        st = os.stat(p)
    except OSError:
        return {}
    key = (st.st_size, st.st_mtime_ns)
    hit = _ATTEST_CACHE.get(p)
    if hit and hit[0] == key:
        return hit[1]
    out = {}
    try:
        with open(p) as f:
            for ln in f:
                try:
                    rec = json.loads(ln)
                except ValueError:
                    continue
                if not isinstance(rec, dict) or not isinstance(rec.get("agent"), str):
                    continue
                s = out.setdefault(rec["agent"], {"cancelled": False, "collected": False, "ever_collected": False})
                ev = rec.get("event")
                if ev == "cancelled":
                    s["cancelled"] = True
                elif ev == "uncancelled":
                    s["cancelled"] = False
                elif ev == "collected" and not rec.get("problems"):
                    s["collected"] = s["ever_collected"] = True
                elif ev == "brief" and rec.get("redispatch"):
                    s["collected"] = False
    except OSError:
        return {}
    _ATTEST_CACHE[p] = (key, out)
    return out


def agent_cancelled(cdir, name):
    return (os.path.isfile(os.path.join(cdir, "agents", name, CANCELLED_MARKER))
            and agent_attestations(cdir).get(name, {}).get("cancelled", False))


def not_attested_lines(cdir):
    """`NOT ATTESTED: <agent> <marker>` for every .cancelled / .collected on disk with no matching audit event."""
    att = agent_attestations(cdir)
    out = []
    for n in _agent_dirs(cdir, cancelled=True):
        for marker, k in ((CANCELLED_MARKER, "cancelled"), (COLLECTED_STAMP, "collected")):
            if os.path.isfile(os.path.join(cdir, "agents", n, marker)) and not att.get(n, {}).get(k):
                out.append(f"NOT ATTESTED: {n} {marker}")
    return out


def cancelled_agents(cdir):
    """Names cancelled by marker, plus legacy ones whose dir was moved under `_cancelled/` (audit names them)."""
    names = [n for n in _agent_dirs(cdir, cancelled=True) if agent_cancelled(cdir, n)]
    for ev in audit_events(cdir, "cancelled"):
        n = ev.get("agent")
        if n and ev.get("archived_to") and not os.path.isdir(os.path.join(cdir, "agents", n)) and n not in names:
            names.append(n)
    return names


def outstanding_agents(cdir):
    adir = os.path.join(cdir, "agents")
    return [n for n in _agent_dirs(cdir) if not agent_returned(adir, n)]


def collected_stamp(cdir, name):
    """`collect` writes this after a clean validation. It is what makes collection
    MECHANICAL: `cat`ting a RETURN.md leaves no stamp, so its verdict cannot count."""
    return os.path.join(cdir, "agents", name, COLLECTED_STAMP)


def agent_ever_collected(cdir, name):
    """Collected cleanly at least once (P8). A redispatch clears `collected` — the new return owes its own
    collect — but never this: the agent WAS dispatched and its work was collected, so the report's `dispatched
    D` does not shrink when a collected agent is pushed again."""
    return agent_attestations(cdir).get(name, {}).get("ever_collected", False)


def agent_collected(cdir, name):
    return (os.path.isfile(collected_stamp(cdir, name))
            and agent_attestations(cdir).get(name, {}).get("collected", False))


def _agent_dirs(cdir, cancelled=False):
    """Agent dirs; a cancelled one (marker) only when `cancelled=True`. Legacy `_cancelled/` is never an agent."""
    adir = os.path.join(cdir, "agents")
    try:
        names = sorted(os.listdir(adir))
    except OSError:
        return []
    return [n for n in names if not n.startswith("_") and os.path.isdir(os.path.join(adir, n))
            and (cancelled or not agent_cancelled(cdir, n))]


def uncollected_agents(cdir):
    """Returned (non-empty RETURN.md) but never `collect`ed — the width slot is free, but
    the collect-side validation, stray-file list and PROGRESS entry never ran."""
    adir = os.path.join(cdir, "agents")
    return [n for n in _agent_dirs(cdir)
            if agent_returned(adir, n) and not agent_collected(cdir, n)]


def agent_states(cdir):
    """name -> 'outstanding' | 'returned' | 'collected' | 'cancelled'."""
    adir = os.path.join(cdir, "agents")
    out = {}
    for n in _agent_dirs(cdir, cancelled=True):
        if agent_cancelled(cdir, n):
            out[n] = "cancelled"
        elif not agent_returned(adir, n):
            out[n] = "outstanding"
        else:
            out[n] = "collected" if agent_collected(cdir, n) else "returned"
    return out


def transcript_bytes(path):
    try:
        return os.path.getsize(path) if path else 0
    except OSError:
        return 0


def cmd_abort(a):
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    attempts = [s.strip() for s in (a.attempts or "").split(";") if s.strip()]
    if len(set(attempts)) < 2:
        sys.exit("ABORT refused: --attempts \"<attempt 1>;<attempt 2>\" needs ≥2 DISTINCT non-empty "
                 "entries. An abort is legal only after two real, different fixes failed — naming them "
                 "is what separates a blocker from giving up.")
    body = (
        f"# ABORT — drive {contract['id']}\n\n## Blocked\n{a.blocked}\n\n"
        f"## Mechanism\n{a.mechanism}\n\n## Evidence\n{a.evidence}\n\n## Attempts\n"
        + "".join(f"{i}. {t}\n" for i, t in enumerate(attempts, 1))
    )
    with open(os.path.join(cdir, "ABORT.md"), "w") as f:
        f.write(body)
    if not abort_file_present(cdir):
        sys.exit("ABORT refused: each of blocked/mechanism/evidence must be non-trivial")
    state["abort_declared"] = True
    set_terminal(cdir, state, "aborted", blocked=a.blocked, mechanism=a.mechanism, attempts=attempts)
    print(f"aborted: {cdir}/ABORT.md — everything NOT blocked is still owed in REPORT.md")


def cmd_note(a):
    ws = ws_root()
    cdir, _, _ = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    with open(os.path.join(cdir, "PROGRESS.md"), "a") as f:
        f.write(f"- {now_iso()} {a.text}\n")
    audit(cdir, "note", text=a.text)


def cmd_status(_a):
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        print("no active drive"); sys.exit(2)
    live_sha = sha256_file(os.path.join(cdir, "contract.json"))
    print(json.dumps({"dir": cdir, "task": contract["task"], "caps": contract["caps"],
                      "conditions": [c["id"] for c in contract["conditions"]],
                      "gate_budget": gate_budget(contract),
                      "contract_intact": (not state.get("contract_sha256")
                                          or live_sha == state.get("contract_sha256")),
                      "seal_breaks": dict(zip(("files", "checkers"), seal_breaks(cdir, contract, state))),
                      "first_green_at": state.get("first_green_at") or audited_first_green(cdir),
                      "paused": ({"since": state["paused_at"], "by": state.get("paused_by")}
                                 if pause_attested(cdir, state) else None),
                      "wall_minutes": int(wall_minutes(state)),
                      "outcome_attested": outcome_attested(cdir, state),
                      "amendments": len(contract.get("amendments") or []),
                      "outstanding_agents": outstanding_agents(cdir),
                      # per-agent: outstanding (no return yet) / returned (return on disk,
                      # never validated) / collected (went through `collect`).
                      "agents": agent_states(cdir),
                      "uncollected_agents": uncollected_agents(cdir),
                      "cancelled_agents": cancelled_agents(cdir),
                      "not_attested": not_attested_lines(cdir),
                      "state": state}, indent=2))
    for ln in not_attested_lines(cdir):
        print(ln, file=sys.stderr)


def cmd_resume(a):
    """Rebind the active drive to THIS session (after /clear, a crash, or a new terminal)."""
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    if state.get("outcome") is not None and outcome_attested(cdir, state):
        sys.exit(f"drive is settled: outcome={state['outcome']} — nothing to resume")
    bad = attest_outcome(cdir, state)
    if bad:
        print(state_tamper_line(bad))
    sid = a.session or os.environ.get("CLAUDE_CODE_SESSION_ID")
    unpaused = ""
    with drive_lock(cdir):
        fresh = read_json(os.path.join(cdir, "state.json"))
        if isinstance(fresh, dict) and fresh.get("started_at"):
            state = fresh
            attest_outcome(cdir, state, quiet=True)
        old = state.get("session")
        if pause_attested(cdir, state):
            # P1/P3/P7: re-arm. The paused span leaves the wall clock, the stall ladder restarts, and the
            # next block measures context growth from itself, not from before the pause.
            secs = max(0.0, time.time() - epoch(state["paused_at"]))
            audit(cdir, "unpaused", paused_at=state["paused_at"], by=state.get("paused_by"),
                  seconds=int(secs), session=sid)
            unpaused = (f"unpaused: paused {int(secs // 60)} min (by {state.get('paused_by')}); the gate "
                        "blocks again from the next stop\n")
            state["paused_seconds"] = float(state.get("paused_seconds") or 0) + secs
            state["unpaused_at"] = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
            state["stall_floor"] = len(state.get("history") or [])
            state.pop("last_reason", None)
        elif state.get("paused_at"):
            unpaused = "PAUSE NOT ATTESTED: state.json said paused with no audit record; dropped\n"
            audit(cdir, "state_tampered", paused_at=state["paused_at"])
        state.pop("paused_at", None)
        state.pop("paused_by", None)
        # A new session writes another transcript file, and an un-pause spans unmeasured time: the next block
        # is a baseline (P7). A same-session resume is not — it must not silence CONTEXT PRESSURE on demand.
        if unpaused.startswith("unpaused") or sid != old:
            state["transcript_rebase"] = True
        state["session"] = sid
        write_json(os.path.join(cdir, "state.json"), state)
        audit(cdir, "resumed", old_session=old, session=sid)
    res = evaluate(cdir, contract, ws, budget=gate_budget(contract))
    unmet = [i for i, m, _ in res if not m]
    print(f"{unpaused}resumed drive {contract['id']} → session {sid}\n"
          f"task: {contract['task']}\nunmet: {unmet}  blocks: {state['blocks']}/{contract['caps']['max_blocks']}\n"
          f"--- PROGRESS.md (tail) ---")
    try:
        print("".join(open(os.path.join(cdir, "PROGRESS.md")).readlines()[-25:]))
    except OSError:
        pass


def cmd_pause(a):
    """Keep the drive for a later session and let every stop through until `resume` (P1). Honoured only on
    the operator's order: their latest typed prompt, sent after the seal (and after the last resume), must
    ask to pause/hold/stop. The model cannot write that entry, so it cannot pause past a red gate."""
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    with drive_lock(cdir):
        fresh = read_json(os.path.join(cdir, "state.json"))
        if isinstance(fresh, dict) and fresh.get("started_at"):
            state = fresh
        if state.get("outcome") is not None and outcome_attested(cdir, state):
            sys.exit(f"REFUSED — drive is settled: outcome={state['outcome']}; nothing to pause")
        attest_outcome(cdir, state)
        if pause_attested(cdir, state):
            print(f"already paused since {state['paused_at']} (by {state.get('paused_by')}); "
                  f"`python3 {me()} resume` re-arms it")
            return
        # The transcript is DERIVED from the BOUND session, never taken from a flag, a Stop payload (`gate` can be
        # run by hand with any payload) or another session's id: only the drive's own operator can pause it. An
        # operator in a new session resumes there first (audited), then pauses.
        bound = state.get("session")
        env_sid = os.environ.get("CLAUDE_CODE_SESSION_ID")
        if not bound:
            sys.exit(f"REFUSED — the drive is bound to no session; `python3 {me()} resume` in the operator's session first")
        if env_sid and env_sid != bound:
            sys.exit(f"REFUSED — this session ({env_sid}) is not the drive's ({bound}). The operator's own session "
                     f"pauses it: `python3 {me()} resume` here first, then pause.")
        tpath = derive_transcript(ws, bound)
        if not tpath:
            sys.exit("REFUSED — pause cannot find this session's transcript, so it cannot see the operator's "
                     f"order. The drive stays live; the operator can end it with `python3 {me()} release`.")
        hold = operator_hold(tpath, _hold_since(state), session=bound)
        if not hold:
            text, _ = last_human_prompt(tpath, session=bound)
            seen = f'"{" ".join(text.split())[:120]}"' if text else "none found"
            sys.exit("REFUSED — pause is the operator's call: their latest prompt after the seal must be a short "
                     f"order to pause/hold/stop, e.g. \"pause here\" (latest seen: {seen}). Keep working, or ask the operator.")
        set_paused(cdir, state, "operator", word=hold[0], prompt=hold[1], transcript=tpath,
                   note=(a.reason or "").strip())
    print(f"paused drive {contract['id']} (operator said \"{hold[1]}\"). Every stop is allowed until "
          f"`python3 {me()} resume`; blocks, the stall count and wall time are frozen. "
          f"`python3 {me()} release` ends the drive instead.")


def build_brief(ws, cdir, contract, agent, files, cond, minutes, context,
                redispatch=False, allow_overlap=False, why="", enforce=True):
    """Reserve an agent dir and write its BRIEF.md. Returns (adir, ret, bpath, lines)."""
    adir = os.path.join(cdir, "agents", agent)
    pol = contract.get("policy", {})
    max_agents = pol.get("max_agents", DEFAULT_MAX_AGENTS)
    outstanding = outstanding_agents(cdir)
    verify = agent.startswith("verify")
    relay = agent.startswith("relay")
    if os.path.isfile(os.path.join(adir, CANCELLED_MARKER)):
        if not redispatch:
            sys.exit(f"agent {agent!r} was cancelled. Brief a new name, or --redispatch to re-open this one.")
    if enforce:
        if agent in outstanding and not redispatch:
            sys.exit(f"agent {agent!r} is still outstanding (no RETURN.md). Push it by message, or --redispatch.")
        # Width cap: enforced, not advised.
        live = [n for n in outstanding if n != agent]
        if len(live) >= max_agents:
            sys.exit(f"REFUSED — {len(live)} agents outstanding ({', '.join(live)}) ≥ max_agents={max_agents}. "
                     "Collect one first (`D collect <name>`), cancel an undispatched one (`D cancel <name>`), "
                     "or raise --max-agents at the next seal.")
    else:
        live = [n for n in outstanding if n != agent]
    mine = [g.strip() for g in (files or "").split(",") if g.strip()]
    # --files is what makes the overlap check EXIST. A writer without it is two writers
    # to one file, accepted silently — so it is refused instead.
    if enforce and not mine and not (verify or relay):
        sys.exit(f"REFUSED — --files is required for writer agent {agent!r} (only names starting "
                 "'verify' or 'relay' may omit it). Without --files there is nothing to compare, so the "
                 "writer-disjointness check silently does not run and two agents can write one file.")
    if enforce and mine and not (verify or relay):
        # Disjointness: two concurrent WRITERS with overlapping allowed files is a collision.
        for n in live:
            if n.startswith(("verify", "relay")):
                continue
            theirs = read_json(os.path.join(cdir, "agents", n, "brief.json"), {}).get("files", [])
            clash = files_overlap(ws, mine, theirs)
            if clash and not allow_overlap:
                sys.exit(f"REFUSED — allowed files overlap with outstanding agent {n!r}: {sorted(clash)[:5]}. "
                         "Wait for it to return, merge the seams, or --allow-overlap --why '<reason>' (audited).")
            if clash:
                audit(cdir, "overlap_allowed", agent=agent, other=n, files=sorted(clash)[:20], why=why)
    os.makedirs(adir, exist_ok=True)
    ret = os.path.join(adir, "RETURN.md")
    if redispatch and os.path.isfile(os.path.join(adir, CANCELLED_MARKER)):
        audit(cdir, "uncancelled", agent=agent)
        os.remove(os.path.join(adir, CANCELLED_MARKER))
    if redispatch and os.path.exists(ret):
        os.replace(ret, os.path.join(adir, f"RETURN.{int(time.time())}.md"))
        # The stamp belongs to the return that was just archived: the NEW return owes its
        # own `collect`, or a redispatch would launder an uncollected verdict.
        try:
            os.remove(os.path.join(adir, COLLECTED_STAMP))
        except OSError:
            pass
    write_json(os.path.join(adir, "brief.json"),
               {"agent": agent, "files": mine, "cond": cond, "minutes": minutes,
                "context": context, "ts": now_iso()})
    want = set(filter(None, (cond or "").split(",")))
    conds = [c for c in contract["conditions"] if (not want or c["id"] in want) and c["id"] != "report"]
    if want and len(conds) != len(want):
        sys.exit(f"unknown condition id(s): {want - {c['id'] for c in conds}}")
    kind = "RELAY ORCHESTRATOR" if relay else "VERIFIER (read-only)" if verify else "WORKER"
    lines = [
        f"# {kind} brief — drive {contract['id']} — agent `{agent}`",
        "",
        f"Task under drive: {contract['task']}",
        "",
        "## Your done-conditions (exit 0 = met; run them yourself, from the repo root):",
    ]
    for c in conds:
        lines.append(f"- `{c['id']}`: `{c['cmd']}`" + (f" — {c['desc']}" if c.get("desc") else ""))
    if context:
        lines += ["", "## Frozen interfaces (code against these — binding, do not renegotiate):", context]
    if not (verify or relay):
        # Auto sibling map: a worker that does not know who else is in the tree invents a
        # second home for the same file (measured: two READMEs, two test suites).
        sibs = []
        for n in live:
            bj = read_json(os.path.join(cdir, "agents", n, "brief.json"), {})
            sibs.append(f"- `{n}` — files: {', '.join(bj.get('files') or []) or 'unstated'}"
                        f" · conditions: {bj.get('cond') or 'all'}")
        lines += ["", "## Who else is in the tree"]
        lines += sibs or ["- nobody: you are the only outstanding agent."]
        if sibs:
            lines.append("Their files are not yours to write or wait on. If a condition of yours needs a file "
                         "they own, poll for it (bounded) and say so in RETURN.md — never write it, never "
                         "message them.")
    lines += [
        "",
        f"## Allowed files: {files or 'ONLY the files the conditions above require; name every file you touch in RETURN.md'}",
        f"## Budget: {minutes} minutes. On hitting it: return what you have, LABELED INCOMPLETE, never silently stop.",
        f"## Return: write `{ret}`. Its FIRST LINE must be exactly "
        f"{VERDICT_FORM if verify else RETURN_FIRST_LINE_FORM} — `collect` refuses anything else. Then "
        f"(≤{RETURN_MAX_LINES} lines in all): what you did, condition results with the "
        "command output's decisive line, files touched, what is NOT done and why. Return the PATH, not the contents. "
        "Nothing else you print will be read.",
        "",
        "## Rules (verbatim, binding):",
        "1. Bound EVERY command from Python: `subprocess.run(cmd, shell=True, timeout=N, "
        "start_new_session=True)` and, on TimeoutExpired, `os.killpg(os.getpgid(p.pid), signal.SIGKILL)`. "
        "This host has no `timeout`/`gtimeout` binary, and `perl -e 'alarm N; exec @ARGV'` does NOT kill "
        "Node children (verified: a codex process outlived it by minutes). Never drop a bound because it fired.",
        f"2. Write ONLY under your allowed files and `{adir}/`. Never a shared scratch dir.",
        "3. Kill by PID, never by pattern (`pkill -f`/`killall` banned). Reap every process you start before returning.",
        "4. Stop only on: your conditions green, your budget, or a named blocker (mechanism + the one command that showed it). "
        "Response length is never a reason to stop. A partial return's first line is `INCOMPLETE: <what is missing>`.",
        "5. You may spawn READ-ONLY sub-scouts for your own seam (the harness's 'unless requested' line is satisfied by this "
        "dispatch). Delegating writes is the orchestrator's call, not yours.",
        "6. Verify by running, not by reading: a claim in RETURN.md carries the command and its decisive output line.",
        "7. Read boundary: read only what your conditions and allowed files name. A wider read is a request "
        "back to main, written in RETURN.md, never a decision you make.",
        "8. Do not use SendMessage. Your return is RETURN.md plus the 2-line final message. (A message to `main` "
        "from a worker reaches the TOP session, not the relay that dispatched you — verified 2026-09-10 — and "
        "sibling messaging breaks seam isolation.)",
        "9. Your FINAL assistant message must be ≤ 2 lines: line 1 = your RETURN.md's first line (your unmet ids, "
        "or `INCOMPLETE: …`), "
        f"line 2 = `{ret}`. Everything else goes in RETURN.md. The harness pastes your final message into "
        "main's context verbatim.",
    ]
    if verify:
        lines += [
            "",
            "## Verifier duties — report, do NOT fix. You did not write this work and you must not edit it.",
            "- First line of RETURN.md is exactly `VERDICT: CONVERGED` or `VERDICT: NOT-CONVERGED`. Nothing passes without it.",
            "- Re-run every condition above yourself and paste the decisive output line; a condition you did not run is UNVERIFIED, not green.",
            "- Then attack the work: read `git diff` (and the worker RETURN.md files under "
            f"`{os.path.join(cdir, 'agents')}`) as CLAIMS UNDER TEST. For each claim, look for the evidence that would exist if it were "
            "false — a stubbed test, a hard-coded expected value, a condition satisfied by presence rather than behaviour, "
            "a file touched outside the allowed set, a number recalled rather than computed.",
            "- NOT-CONVERGED needs one concrete finding with a path and the command that shows it. CONVERGED needs the list of what you checked.",
            "- On confirming a defect, sweep the rest of that file against each function's own contract and report "
            "`swept <file>, found N`.",
            "- Never write anything outside your own agent dir.",
        ]
    if relay:
        lines += [
            "",
            "## Relay duties (you ARE the orchestrator for this leg):",
            f"- Orient from `python3 {me()} status` and `{cdir}/PROGRESS.md`, not from history you do not have.",
            "- Do the work, or dispatch workers per the seam map (disjoint file sets, one brief each via "
            f"`python3 {me()} brief --agent <name> --files <globs>`), "
            "wait for their RETURN.md files in-turn, verify with a separate read-only agent, then run `drive.py check`.",
            f"- Append every decision and dispatch to `{cdir}/PROGRESS.md` (`drive.py note`) — it is the only memory the next leg gets.",
            "- Collect what returned when your own analysis is done; an agent that has not returned is named "
            "uncovered and its ask item re-dispatched or done by you — never footnoted.",
            f"- Draft/refresh `{cdir}/REPORT.md` (sections: {', '.join(REPORT_SECTIONS)}) before returning; "
            f"`python3 {me()} report-check --cdir {cdir}` lists what it still lacks.",
            "- Return when `drive.py check` shows unmet=[] or your budget is hit; first line of RETURN.md = "
            f"{RETURN_FIRST_LINE_FORM}.",
        ]
    bpath = os.path.join(adir, "BRIEF.md")
    with open(bpath, "w") as f:
        f.write("\n".join(lines) + "\n")
    audit(cdir, "brief", agent=agent, conds=[c["id"] for c in conds], relay=relay, verify=verify,
          files=mine, context=bool(context), redispatch=bool(redispatch))
    return adir, ret, bpath, lines


def cmd_brief(a):
    """Print a worker/relay brief that already carries the drive's mechanics, and reserve its dir."""
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    adir, ret, bpath, lines = build_brief(
        ws, cdir, contract, a.agent, a.files, a.cond, a.minutes, a.context,
        redispatch=a.redispatch, allow_overlap=a.allow_overlap, why=a.why)
    if a.print:
        print("\n".join(lines))
    else:
        # Main never reads the brief: the worker does. One line of prompt, not 1.5 KB of it.
        print(f"You are agent `{a.agent}` under /drive {contract['id']}. Read {bpath} and follow it exactly; "
              f"it is your whole context. Write your return to {ret}. Working directory: {ws}. "
              "Your final assistant message must be ≤2 lines: your unmet ids (or INCOMPLETE), then that path.")


def cancel_agent(cdir, agent, reason=""):
    """Mark an agent cancelled: writes agents/<name>/.cancelled. Nothing is moved or deleted (a sandbox
    that denies moves/deletes can still cancel). Returns the marker path."""
    adir = os.path.join(cdir, "agents", agent)
    if not os.path.isdir(adir):
        return None
    marker = os.path.join(adir, CANCELLED_MARKER)
    audit(cdir, "cancelled", agent=agent, reason=reason, marker=marker)  # the attestation first (Z2)
    with open(marker, "w") as f:  # a plain write: no tmp+rename, so a rename-denying sandbox can still cancel
        f.write(json.dumps({"ts": now_iso(), "reason": reason}, sort_keys=True) + "\n")
    return marker


def cmd_cancel(a):
    """Free the slot of an agent that was stopped, abandoned or never dispatched. It does not stop a running
    agent — that is the Agent tool's (or the operator's) job; this only makes the drive stop waiting for it."""
    ws = ws_root()
    cdir, _, _ = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    adir = os.path.join(cdir, "agents", a.agent)
    if not os.path.isdir(adir):
        sys.exit(f"no such agent: {a.agent}")
    if agent_cancelled(cdir, a.agent):
        sys.exit(f"{a.agent} is already cancelled")
    if agent_collected(cdir, a.agent):
        sys.exit(f"REFUSED — {a.agent} is collected; a collected agent cannot be cancelled (no override).")
    if agent_returned(os.path.join(cdir, "agents"), a.agent):
        if a.agent.startswith("verify"):
            sys.exit(f"REFUSED — {a.agent} returned: collect it; a verdict cannot be withdrawn by cancel.")
        if not a.force:
            sys.exit(f"{a.agent} has a RETURN.md — `collect` it, or --force to cancel anyway.")
    dest = cancel_agent(cdir, a.agent, a.reason)
    print(f"cancelled {a.agent} → {dest}; it no longer counts against max_agents and the gate stops waiting "
          "for it (a still-running agent is NOT stopped by this)")


def cmd_codex_verify(a):
    """Cross-vendor verifier: same brief, run through the `codex` CLI instead of the Agent tool.

    Writes RETURN.md ONLY on a real verdict line. Anything else — no verdict, a timeout, no
    `codex` binary — cancels the agent and exits 3, so the caller falls back to an Agent-tool
    verifier instead of poisoning the `verified` check with a transcript.
    """
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    agent = a.agent
    adir, ret, bpath, _ = build_brief(ws, cdir, contract, agent, "", a.cond, a.minutes, "",
                                      redispatch=True)
    log = os.path.join(adir, "codex.log")

    def give_up(msg):
        audit(cdir, "codex_verify_failed", agent=agent, reason=msg)
        cancel_agent(cdir, agent, reason=f"codex-verify: {msg}")
        print(f"codex-verify: {msg} — no verdict — fall back to an Agent-tool verifier "
              f"(`brief --agent verify-1`).", file=sys.stderr)
        sys.exit(3)

    if not shutil.which("codex"):
        give_up("no `codex` binary on PATH")
    prompt = (f"You are agent {agent} under /drive {contract['id']}. Read {bpath} and follow it exactly; "
              f"it is your whole context. Working directory: {ws}. Print your findings to stdout and make "
              "the FIRST line of your final answer exactly 'VERDICT: CONVERGED' or 'VERDICT: NOT-CONVERGED'.")
    cmd = ["codex", "exec", "--cd", ws, prompt]
    audit(cdir, "codex_verify_started", agent=agent, minutes=a.minutes)
    out = ""
    p = None
    try:
        p = subprocess.Popen(cmd, cwd=ws, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                             stdin=subprocess.DEVNULL, text=True, start_new_session=True)
        out, _ = p.communicate(timeout=a.minutes * 60)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(os.getpgid(p.pid), signal.SIGKILL)
        except Exception:  # noqa: BLE001
            pass
        try:
            out, _ = p.communicate(timeout=15)
        except Exception:  # noqa: BLE001
            out = out or ""
        with open(log, "w") as f:
            f.write(out or "")
        give_up(f"codex exceeded its {a.minutes}-minute budget (killed by process group)")
    except Exception as e:  # noqa: BLE001
        give_up(f"codex failed to run: {e!r}")
    with open(log, "w") as f:
        f.write(out or "")
    lines = (out or "").splitlines()
    verdict = next((ln.strip() for ln in lines
                    if ln.strip().startswith(("VERDICT: CONVERGED", "VERDICT: NOT-CONVERGED"))), None)
    if not verdict:
        give_up(f"no VERDICT line in {log} ({len(lines)} lines of codex output)")
    verdict = "VERDICT: CONVERGED" if verdict.startswith("VERDICT: CONVERGED") else "VERDICT: NOT-CONVERGED"
    with open(ret, "w") as f:
        f.write(verdict + "\n")
        f.write(f"(codex exec, last {CODEX_LOG_TAIL} lines of {log})\n")
        f.write("\n".join(lines[-CODEX_LOG_TAIL:]) + "\n")
    audit(cdir, "codex_verify", agent=agent, verdict=verdict, log_lines=len(lines))
    print(f"{verdict} — {ret} (full log: {log})")
    print(f"NOT counted yet — collect it: python3 {me()} collect {agent}")


def cmd_collect(a):
    """Validate and print an agent's RETURN.md (bounded), then run the check — the phase boundary, as a command."""
    ws = ws_root()
    cdir, contract, state = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    adir = os.path.join(cdir, "agents", a.agent)
    ret = os.path.join(adir, "RETURN.md")
    if not agent_returned(os.path.join(cdir, "agents"), a.agent):
        why = "no RETURN.md yet" if not os.path.isfile(ret) else "RETURN.md is 0 bytes (still being written)"
        print(f"NOT RETURNED: {a.agent} — {why}. Wait in-turn, push it, or `brief --redispatch`.")
        sys.exit(1)
    lines = open(ret).read().splitlines()
    first = lines[0].strip() if lines else ""
    fatal, warn = [], []
    if len(lines) > RETURN_MAX_LINES:
        warn.append(f"{len(lines)} lines > {RETURN_MAX_LINES}; truncated here — the rest is not read")
    # One shared form (RETURN_FIRST_LINE_FORM/RE) for the brief's text and this check.
    if a.agent.startswith("verify"):
        if first not in VERDICTS:
            fatal.append(f"first line must be {VERDICT_FORM}")
    elif not RETURN_FIRST_LINE_RE.match(first):
        fatal.append(f"first line must be {RETURN_FIRST_LINE_FORM}")
    incomplete = first.upper().startswith("INCOMPLETE")
    print(f"=== RETURN {a.agent} ({len(lines)} lines){' — INCOMPLETE' if incomplete else ''} ===")
    print("\n".join(lines[:RETURN_MAX_LINES]))
    if warn:
        print("=== WARNING: " + "; ".join(warn))
    if fatal:
        print("=== PROBLEMS: " + "; ".join(fatal))
    # Changed files outside what any outstanding/collected writer was allowed — visible, not fatal.
    try:
        r = subprocess.run(["git", "status", "--porcelain"], cwd=ws, capture_output=True, text=True,
                           timeout=30)
        if r.returncode != 0:
            print(f"=== NOTE: {ws} is not a git repo (git status: rc={r.returncode}) — "
                  "the stray-file check is SKIPPED, not passed.")
        else:
            changed = [porcelain_path(ln) for ln in r.stdout.splitlines() if ln]
            changed = [c for c in changed if c and not c.startswith(DRIVE_DIRNAME)]
            allowed = read_json(os.path.join(adir, "brief.json"), {}).get("files", [])
            if allowed and changed:
                owned = set()
                for c in changed:
                    if any(_pat_hits(_norm_pat(g), c) for g in allowed):
                        owned.add(c)
                owned |= files_overlap(ws, allowed, changed) & set(changed)
                stray = [c for c in changed if c not in owned]
                if stray:
                    print(f"=== CHANGED OUTSIDE {a.agent}'s allowed files (or by another agent): {stray[:10]}")
    except Exception as e:  # noqa: BLE001
        print(f"=== NOTE: stray-file check skipped ({e!r})")
    audit(cdir, "collected", agent=a.agent, first=first[:200], lines=len(lines),
          problems=fatal, warnings=warn)
    with open(os.path.join(cdir, "PROGRESS.md"), "a") as f:
        f.write(f"- {now_iso()} collected {a.agent}: {first[:160]}\n")
    if not fatal:
        # The stamp is the mechanical half of collection, and it is written BEFORE the check
        # below, because the `report` condition's `verified` reads it.
        write_json(collected_stamp(cdir, a.agent),
                   {"ts": now_iso(), "agent": a.agent, "lines": len(lines),
                    "first": first[:200], "problems": fatal})
    print("=== CHECK ===")
    contract, res, unmet, files, ids, state, _, bad = observe(cdir, contract, state, ws, "collect")
    if (state.get("first_green_at") and not unmet and not (files or ids) and not bad
            and state.get("outcome") is None):
        print(first_green_line(state["first_green_at"]))
    if bad:
        print(state_tamper_line(bad))
    for ln in tamper_lines(files, ids):
        print(ln)
    print_results(contract, res)
    print(f"unmet={unmet}")
    audit(cdir, "check", unmet=unmet, after=a.agent)
    # Exit 0 unless the return itself is unusable: an over-length return is truncated, not fatal.
    sys.exit(1 if fatal else 0)


def verified_status(cdir):
    """→ (ok, message). One implementation for `verified` and report-check requirement 8. The newest
    non-cancelled verify-* return decides: NOT-CONVERGED there never falls back to an older verdict, and
    `cancel` refuses a collected or returned verifier, so no legal command removes the newest verdict; a hand-written
    `.cancelled` or `.collected` with no audit event counts for nothing (Z2)."""
    agent, first = newest_verdict(cdir)
    if not agent:
        return False, "no verify-* agent has returned: dispatch one (D brief --agent verify-1)"
    if first != "VERDICT: CONVERGED":
        return False, f"newest verifier {agent} says: {first!r} — push the worker or re-verify"
    if not agent_collected(cdir, agent):
        # A verdict read by hand never went through collect's validation, stray-file list or
        # PROGRESS entry. Make the missing step mechanical instead of a rule in the doc.
        return False, f"{agent} returned but was not collected — run: python3 {me()} collect {agent}"
    return True, f"verified by {agent}"


def cmd_verified(a):
    cdir = getattr(a, "cdir", None)
    if not cdir:
        cdir, _, _ = load_active(ws_root())
    if not cdir or not os.path.isdir(cdir):
        print("no active drive"); sys.exit(2)
    ok, msg = verified_status(cdir)
    print(msg)
    sys.exit(0 if ok else 1)


def cmd_release(a):
    ws = ws_root()
    cdir, _, state = load_active(ws)
    if not cdir:
        sys.exit("no active drive")
    set_terminal(cdir, state, "released", reason=a.reason)
    print(f"released: {cdir}")


def _add_contract_flags(p):
    """Flags shared by `start` and `amend`."""
    p.add_argument("--checker", action="append", default=[], metavar="ID=PATH",
                   help="add condition ID that runs a SEALED copy of PATH (<cdir>/checkers/<ID><ext>; .py → "
                        "the sealed interpreter -s with the workspace on sys.path, .sh → /bin/bash, else exec; cwd = workspace). A changed copy is CHECKER TAMPERED")
    p.add_argument("--red-proof", action="append", default=[], metavar="ID=DIR",
                   help="for a --checker ID: run the sealed checker with cwd=DIR (a deliberately broken fixture) "
                        "at seal; exit 0 there is REFUSED. Without it the checker is announced unproven")
    p.add_argument("--known-incomplete", action="append", default=[], metavar="ID=TEXT",
                   help="what condition ID knowingly does NOT cover; printed by `check`, required verbatim "
                        "under ## Unverified in REPORT.md")
    p.add_argument("--map", action="append", default=[], metavar="KEY=IDS|unmapped",
                   help="sealed ask→condition row: KEY (≤40 chars) = comma list of condition ids, or "
                        "`unmapped`; every KEY must appear under ## Outcome (unmapped ones under ## Unverified too)")
    p.add_argument("--allow-crash-red", default="", metavar="ID,..",
                   help="ids (added by this call) whose red may be a crash — exit 126/127 or a last line naming "
                        "ModuleNotFoundError/ImportError/SyntaxError — because the missing piece IS the work. "
                        "Otherwise such a red is REFUSED: a crash is not a detection")


def main():
    p = argparse.ArgumentParser(prog="drive.py")
    sp = p.add_subparsers(dest="cmd", required=True)
    ih = sp.add_parser("install-hook", help="opt-in: also wire the `drive.py gate` Stop hook into settings "
                       "(SKILL.md's frontmatter already arms it when /drive is invoked)")
    ih.add_argument("--project", action="store_true",
                    help="write .claude/settings.json (committed) instead of settings.local.json")
    ih.add_argument("--timeout", type=int, default=DEFAULT_HOOK_TIMEOUT,
                    help=f"hook timeout in seconds (default {DEFAULT_HOOK_TIMEOUT})")
    ih.set_defaults(fn=cmd_install_hook)
    uh = sp.add_parser("uninstall-hook", help="remove the drive Stop hook from one settings file (backup first)")
    uh.add_argument("--from", dest="from_", required=True, choices=["project", "local", "user"],
                    help="project = .claude/settings.json, local = .claude/settings.local.json, "
                         "user = $CLAUDE_CONFIG_DIR/settings.json, else ~/.claude/settings.json")
    uh.set_defaults(fn=cmd_uninstall_hook)
    sp.add_parser("hook-status", help="the SKILL.md frontmatter Stop hook and any settings copies (exit 1 = none)"
                  ).set_defaults(fn=cmd_hook_status)
    s = sp.add_parser("start", help="seal a drive for this session")
    s.add_argument("--task", required=True)
    s.add_argument("--cond", action="append", default=[], help="ID=shell command; exit 0 = met")
    s.add_argument("--max-blocks", type=int, default=DEFAULT_MAX_BLOCKS)
    s.add_argument("--max-minutes", type=int, default=DEFAULT_MAX_MINUTES)
    s.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT,
                   help=f"per-condition timeout, seconds (default {DEFAULT_TIMEOUT})")
    # NOTE the `%%`: argparse re-formats every help string through `help % params`, so a bare
    # `%` from a percent format spec crashes `--help` with "%o format: an integer is required".
    s.add_argument("--hook-timeout", type=int, default=None,
                   help="the Stop-hook `timeout` wired in settings.json; the gate keeps its whole "
                        f"condition sweep inside {int(GATE_BUDGET_FRAC * 100)}%% of it "
                        f"(default: the installed hook's own timeout, else {DEFAULT_HOOK_TIMEOUT})")
    s.add_argument("--unhooked", default="",
                   help="seal with NO Stop hook installed; takes the reason. Nothing will block "
                        "your stop: run `check` by hand at every boundary")
    s.add_argument("--allow-green", default="", help="comma list of ids allowed to pass at seal")
    s.add_argument("--session", default=None,
                   help="the session id the gate binds to (default $CLAUDE_CODE_SESSION_ID); "
                        "also selects the transcript to baseline")
    s.add_argument("--transcript", default=None,
                   help="transcript path, to baseline context growth (default: derived from the "
                        "session id under ~/.claude/projects/, used only if that file exists)")
    s.add_argument("--relay-mb", type=float, default=DEFAULT_RELAY_MB)
    s.add_argument("--auto-pause-empty", type=int, default=AUTO_PAUSE_EMPTY, metavar="N",
                   help="opt-in: after N consecutive EMPTY blocks (no tool call, no message, only the harness's "
                        "record of the last block) the gate pauses the drive and lets the stop through; `resume` "
                        "re-arms it. A silent model can trigger it on purpose, so it is off unless asked for "
                        f"(default {AUTO_PAUSE_EMPTY} = never)")
    s.add_argument("--verify", choices=("required", "none"), default="required",
                   help="required: the report cannot pass without a verify-* CONVERGED verdict")
    s.add_argument("--why-no-verify", default="", help="mandatory reason when --verify none")
    s.add_argument("--agents", type=int, default=1,
                   help="PLANNED total worker count (0 = solo, needs --why-solo); may exceed --max-agents")
    s.add_argument("--why-solo", default="")
    s.add_argument("--max-agents", type=int, default=DEFAULT_MAX_AGENTS,
                   help="concurrent width cap (how many at a time), enforced by brief")
    s.add_argument("--seams", default="", help="seam names, ';'-separated (recorded for the report)")
    s.add_argument("--force", action="store_true",
                   help="replace a live drive (needs --why-force); refused once first green is recorded")
    s.add_argument("--why-force", default="", help="mandatory reason when --force replaces a live drive")
    _add_contract_flags(s)
    s.add_argument("--pass-env", action="append", default=[], metavar="NAME[,NAME]",
                   help="extra env var(s) conditions may see, value snapshotted NOW and sealed (start only). "
                        "Otherwise conditions get only PATH/HOME/USER/LANG/LC_ALL/TMPDIR/TERM as they were at start "
                        "(plus PYTHONNOUSERSITE=1, PYTHONDONTWRITEBYTECODE=1). Every PYTHON* name is refused")
    s.add_argument("--allow-user-site", default="", metavar="REASON",
                   help="let conditions read Python's user site (usercustomize/.pth) and --pass-env PYTHONPATH/"
                        "PYTHONUSERBASE; sealed and announced as `user-site allowed (<reason>)`")
    s.add_argument("--allow-workspace-python", default="", metavar="REASON",
                   help="seal an interpreter whose path or realpath is inside the workspace (a .venv); its installed "
                        "packages are agent-writable and NOT hashed. Sealed, announced `workspace python allowed (<reason>)`")
    s.add_argument("--protect-tests", default=None, metavar="GLOBS",
                   help="comma list of test-file globs (workspace-relative): snapshot assertion counts and "
                        f"lines at seal and auto-add `{TESTS_COND}` (start only; ≥1 file and ≥1 assertion)")
    s.set_defaults(fn=cmd_start)
    am = sp.add_parser("amend", help="ADDITIVE-only change to the live contract (refused after first green)")
    am.add_argument("--reason", default="", help="REQUIRED: why the contract grows (recorded in amendments[])")
    am.add_argument("--add-cond", action="append", default=[], metavar="ID=CMD",
                    help="add a new condition (never an existing or reserved id); must be red unless in --allow-green")
    _add_contract_flags(am)
    am.add_argument("--raise-blocks", type=int, default=None, metavar="N",
                    help="new max_blocks; must be strictly higher than the current cap")
    am.add_argument("--raise-minutes", type=int, default=None, metavar="M",
                    help="new max_minutes; must be strictly higher than the current cap")
    am.add_argument("--allow-green", default="", help="comma list of ADDED ids allowed to pass at amend")
    am.add_argument("--timeout", type=int, default=None, metavar="S",
                    help="LOWER the per-condition timeout (never raise it), e.g. to make room in the gate "
                         "budget for an added condition")
    am.set_defaults(fn=cmd_amend)
    sp.add_parser("check", help="run the conditions now; exit 1 while any is unmet").set_defaults(fn=cmd_check)
    sp.add_parser("close", help="all conditions green → terminal met (the unhooked close-out); "
                  "exit 1 and no change otherwise").set_defaults(fn=cmd_close)
    sp.add_parser("gate", help="Stop hook (payload on stdin); always exits 0").set_defaults(fn=cmd_gate)
    b = sp.add_parser("brief", help="reserve an agent dir and write its brief")
    b.add_argument("--agent", required=True, help="worker name, or relay-<n>/verify-<n>")
    b.add_argument("--cond", default="", help="comma list of condition ids this agent owns (default: all)")
    b.add_argument("--files", default="", help="allowed file globs, comma-separated (REQUIRED for writers)")
    b.add_argument("--minutes", type=int, default=20)
    b.add_argument("--redispatch", action="store_true", help="re-brief an outstanding/returned agent name")
    b.add_argument("--allow-overlap", action="store_true", help="permit an allowed-files overlap (audited; needs --why)")
    b.add_argument("--why", default="")
    b.add_argument("--context", default="", help="frozen interfaces/decisions this agent must code against")
    b.add_argument("--print", action="store_true", help="print the full brief instead of the one-line prompt")
    b.set_defaults(fn=cmd_brief)
    c = sp.add_parser("collect", help="validate + print an agent's RETURN.md, then check")
    c.add_argument("agent"); c.set_defaults(fn=cmd_collect)
    cn = sp.add_parser("cancel", help="free the slot of an agent you stopped or never dispatched (does not stop it)")
    cn.add_argument("agent"); cn.add_argument("--reason", default="")
    cn.add_argument("--force", action="store_true", help="cancel even though a RETURN.md exists")
    cn.set_defaults(fn=cmd_cancel)
    cv = sp.add_parser("codex-verify", help="run a cross-vendor verifier through `codex exec`")
    cv.add_argument("--agent", default="verify-codex")
    cv.add_argument("--minutes", type=int, default=15)
    cv.add_argument("--cond", default="", help="comma list of condition ids to verify (default: all)")
    cv.set_defaults(fn=cmd_codex_verify)
    vf = sp.add_parser("verified", help="exit 0 iff the newest verify-* RETURN.md says VERDICT: CONVERGED")
    vf.add_argument("--cdir", default=None, help="drive dir to read (the report condition pins it)")
    vf.set_defaults(fn=cmd_verified)
    rc = sp.add_parser("report-check", help="the `report` condition: exit 0 iff REPORT.md meets all 9 requirements")
    rc.add_argument("--cdir", default=None, help="drive dir to read (the report condition pins it)")
    rc.set_defaults(fn=cmd_report_check)
    tg = sp.add_parser("tests-guard", help=f"the `{TESTS_COND}` condition: exit 1 on a missing/weakened/vacuous test file")
    tg.add_argument("--cdir", required=True, help="drive dir holding tests-baseline.json")
    tg.set_defaults(fn=cmd_tests_guard)
    ab = sp.add_parser("abort", help="audited abort → terminal")
    ab.add_argument("--blocked", required=True)
    ab.add_argument("--mechanism", required=True)
    ab.add_argument("--evidence", required=True)
    ab.add_argument("--attempts", required=True,
                    help="';'-separated: ≥2 DISTINCT fixes you actually tried and what each did")
    ab.set_defaults(fn=cmd_abort)
    n = sp.add_parser("note", help="append to the progress log"); n.add_argument("text")
    n.set_defaults(fn=cmd_note)
    sp.add_parser("status", help="print state").set_defaults(fn=cmd_status)
    pz = sp.add_parser("pause", help="keep the drive for later: every stop is allowed until resume "
                       "(only on the operator's order — their latest prompt must ask for it)")
    pz.add_argument("--reason", default="")
    pz.set_defaults(fn=cmd_pause)
    rs = sp.add_parser("resume", help="rebind the active drive to THIS session; re-arms a paused drive")
    rs.add_argument("--session", default=None); rs.set_defaults(fn=cmd_resume)
    r = sp.add_parser("release", help="operator-only: end the drive")
    r.add_argument("--reason", default="operator"); r.set_defaults(fn=cmd_release)
    a = p.parse_args()
    if a.cmd == "gate":
        try:
            cmd_gate(a)
        except Exception as e:  # noqa: BLE001 — FAIL-OPEN, see module docstring
            print(f"drive gate: {e!r} (allowing stop)", file=sys.stderr)
        sys.exit(0)
    a.fn(a)


if __name__ == "__main__":
    main()
