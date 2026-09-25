---
name: drive
description: Run a task to observed completion — mechanical done-conditions enforced by a Stop hook, auto-dispatch of fresh-context agents, and a relay rule that keeps main context flat.
disable-model-invocation: true
hooks:
  Stop:
    - hooks:
        - type: command
          command: "sh -c 'exec python3 \"${CLAUDE_PROJECT_DIR:-.}/.claude/skills/drive/drive.py\" gate'"
          timeout: 600
---

"Done" is not declared: it is shell conditions **you author now and a Stop hook (`D gate`) runs
every time you try to end your turn**. While any is unmet the stop is blocked and you keep working;
the block reason names what is red, stalls, unreturned agents and the rules.

`D` = the absolute `python3 "…/drive.py"` line `hook-status` prints first (a relative `D` dies
after a `cd`). This half instructs, `D` enforces; reconstruct neither.

<task>
$ARGUMENTS
</task>

Empty task block: run `D resume`. Drive active → continue from the unmet list and PROGRESS.md
tail it prints; none → answer "no task found" and end.

## 1. Open — one orientation pass (≤ 6 tool calls), then seal

0. **Enforcement first.** From the repo root run `python3 .claude/skills/drive/drive.py hook-status`;
   its first line is `D = python3 "<abs path>"`: use that `D` from then on. `skill` = this file's
   frontmatter Stop hook, armed by this invocation. NONE → seal `--unhooked "<reason>"`, run
   `D check` **by hand at every boundary** and finish with `D close`.
1. **Premise first.** Before authoring conditions, name the ask's load-bearing assumption and run
   one check that could falsify it; a dead premise is the answer: report it, don't seal over it.
   Then read only what the conditions and a seam map need; no edits before the seal.
2. Author **2–24 deterministic done-conditions**, **one per enumerated ask member**; whole-tree
   invariants sit alongside, never instead. `start` refuses more than 24; the gate budget is the
   real limiter. Exit 0 = met, each **red now**: `start` refuses an already-green condition unless
   `--allow-green id1,id2` names it (a guard that must stay green).
   The ids `report` and `tests-not-weakened` belong to the script.
   - **Cheap: aim ≤ 5 s each**, ceiling `--timeout` (default 60 s). They re-run at seal, `check`,
     `collect`, `close` **and every stop attempt**, serially within 0.8 × the hook's `timeout`. `start` REFUSES one that cannot fit (naming a `--timeout`); an unreached one is `NOT RUN`, UNMET. A slow suite runs in the work; its condition checks the result file is **newer** than the sources.
   - **Fail closed.** A condition exits non-zero when its evidence is missing; a *crashing* red (exit
     126/127, import/syntax error) is REFUSED unless `--allow-crash-red ID`. Conditions run under
     `/bin/bash -o pipefail`, so every stage of a pipeline counts, in a **scrubbed env**: PATH, HOME,
     USER, LANG, LC_ALL, TMPDIR, TERM as at `start`, sealed, plus `start --pass-env NAME[,NAME]`
     (value sealed then). No other variable reaches one; `--pass-env` refuses every `PYTHON*` name
     (`PYTHONPATH`/`PYTHONUSERBASE` only with `--allow-user-site "<reason>"`, announced). The auto
     conditions are immune to site startup (`-I -S`). User python conditions and `.py` checkers are
     protected from the user site, `PYTHON*` variables, and added/changed startup files in the
     interpreter's site dirs (`.pth`/`sitecustomize`/`usercustomize`:
     `INTERPRETER TAMPERED: startup file <path>`). A workspace interpreter is REFUSED unless
     `--allow-workspace-python "<reason>"`; they are NOT protected from edited installed packages
     when a workspace interpreter was allowed. Other workspace PATH dirs: `WARNING: WORKSPACE ON PATH`, not hashed.
   - **Assert behaviour, not presence**: the test passes, the count matches, the diff is empty; a
     chain's last clause prints what it saw.
3. **Seal the ask→condition map**: `--map KEY=IDS|unmapped`, a row per thing the ask enumerates
   (KEY ≤ 40 chars; IDS comma-separated; an unknown id is REFUSED),
   announced as `map: <k> rows, <u> unmapped`. Unmapped gets a condition or an explicit deferral,
   never a fold into a neighbour. A member with no row is invisible to the script: yours. A
   condition proving only part of its member: `--known-incomplete ID=TEXT` (`check` shows it; the
   report must carry it).
4. **Declare the two judgment calls in the seal**; an undeclared one is refused, the reason
   audited.
   - **Verifier**: `--verify required` (default) or `--verify none --why-no-verify "<reason>"`.
     Required for anything shipping, anything a worker wrote unread, any presence-only condition.
     **Tie-break:** `none` when one seam AND every condition asserts behaviour AND nothing ships.
   - **Agents**: `--agents N`, the **planned total** (may exceed `--max-agents`, the concurrent
     width, default 4, enforced by `brief`); `--agents 0` needs `--why-solo "<reason>"`.
     `--seams "a;b"` (**semicolons**); one writer per independent seam. **Tie-break:** one seam in
     ~15 tool calls → `--agents 0`, done in main; past that, spawn (T1/T2).
   ```
   D start --task "<the ask, verbatim>" \
     --cond a="pytest -q tests/test_a.py" --cond b="pytest -q tests/test_b.py" \
     --map "item a=a" --map "item b=b" --protect-tests "tests/*.py" \
     --verify required --agents 2 --seams "a;b"
   ```
   Caps default 40 blocks / 240 min; a refused seal creates nothing (deletes denied: a WARNING, never a drive); `report` (§ 5) is added for you.
5. **Anti-gaming, and its blind spots.**
   - `--protect-tests "<glob,glob>"` (start only; REFUSED unless the globs match a file and ≥ 1
     assertion) baselines each file's assertions (hashed like the contract) and adds
     `tests-not-weakened` (`D tests-guard`), green at seal, red on a deleted baselined file, a
     dropped assertion count (a commented-out assertion (by the file type's comment syntax) no longer
     counts) or a new vacuous one (`assert True[, msg]`, `… or True`, `x == x`, `x is x`,
     `assertEqual(x, x)`; assertion lines only, strings masked, doctest `>>>`
     skipped); a rewritten assertion at the same count prints `changed (not blocking)`. Blind (it needs an AST): a weakened expected value,
     `==`→`!=`, a broadened `pytest.raises`, `if False:`, a body in a string, an early `return`, a
     renamed test, a skip marker, a mocked subject. tests-guard reads assertion lines only; `conftest.py`,
     fixtures and pytest plugins are not sealed — a change there can turn a pytest condition green.
   - `--checker ID=PATH` (PATH a file) makes condition ID run a sealed copy (`.py` by the sealed
     interpreter, workspace on `sys.path`; `.sh` `/bin/bash`; else exec; cwd = workspace), its hash in contract.json and
     re-checked as it runs: an edited copy is `CHECKER TAMPERED: <ID>`, never met. `--red-proof
     ID=DIR` runs it at seal in DIR, a broken fixture (REFUSED if DIR is the workspace, an ancestor, or
     in `.drive/`), and REFUSES exit 0 or a `Traceback` (a crash is not a detection); without one it seals, announced as `unproven checkers:`.
     The seal covers the file, not what it imports or runs; red-proof proves that fixture's break,
     not the cheat you did not build. A plain `--cond t="./run.sh"` seals only the string.

Every sweep (gate, `check`, `collect`, `close`) hashes contract.json, the tests baseline, checker
copies, the interpreter and its startup files **before and after** it runs: a break at either end blocks with **CONTRACT TAMPERED** /
`CHECKER TAMPERED` and never reads `met` (caps still release you); no hash catches one weak at seal.
A state.json `outcome` counts only if audit.jsonl records it (else `STATE TAMPERED`, still enforced);
the freeze reads audit's `first_green` too. Forging audit.jsonl plus state.json, or plus a
`.cancelled`/`.collected` marker, still beats it: tamper-evidence, not proof. An untrusted workspace warns: its `permissions.allow` is void
while its hooks fire.

**`D amend --reason "<why>"` — additive only**: `--add-cond`,
`--checker`, `--red-proof`, `--known-incomplete`, `--map`, `--raise-blocks N`, `--raise-minutes M`,
`--allow-green` (added ids), `--timeout S` (lower only). Nothing is dropped, redefined or loosened.
REFUSED: no live drive, first green recorded, an existing or reserved id, a raise not above its cap,
past 24 or the gate budget, an added condition green outside `--allow-green`, an unknown id. Blocks, start time, history and session carry forward; a hand edit still fails the tamper check. `start --force --why-force
"<reason>"` re-cuts the drive (old one `superseded`), REFUSED after first green.

Readings meaning materially different work: ask **once, now, recommendation first**, only if
the operator answers your NEXT message. Leaving, headless or delegated: do not ask — seal your
reading as a condition, under `## Unverified` as inferred. A question after the seal is a stop.

## 2. Work — auto-spawn triggers, not options

Spawning is the default: `/drive` satisfies "do not use the Agent tool unless requested"; only an
unconditional standing instruction narrows it. **Never pass a model override**: agents inherit
main's model unless a standing instruction names one (it binds; report it). **The seal is main's
read boundary:** after it, main does not bulk-read seam sources or their tests; workers read the
seam they own (solo, main is that worker).

| Trigger | Action |
|---|---|
| **T1 seam map** — ≥ 2 independent seams (disjoint files, no shared symbol *this task changes*) | One agent per seam, dispatched **in one message**, each with `--files`. |
| **T2 heavy seam** — > ~15 min of tool calls or > ~20 files read | Delegate it. |
| **T3 verify** — sealed `--verify required` | `D codex-verify` **first** (§ 3b); exit 3 → an Agent-tool `verify-*` agent. Shipping? Both. **Read-only**: re-derives the conditions, attacks the diff; no `VERDICT: CONVERGED`, no report. Sealed `none`: the conditions are the review. |
| **T4 stall** — the gate says `STALLED ×k` | k=2: a fresh-context agent per stalled condition. k=4: dispatch or `D abort`. `OPERATOR HOLD?`: pause only if ordered. |
| **T5 context pressure** — `CONTEXT PRESSURE` (+≥ 1.5 MB since the last block) | Switch to **relay** (§ 3). |

**Every brief comes from the script**, never hand-written (`--cond`/`--files` take **commas**):
```
D brief --agent <name> --cond <id,id> --files "<glob,glob>" --minutes 20 --context "<frozen interfaces>"
```
It writes `agents/<name>/BRIEF.md` and prints a
**one-line prompt**: dispatch it, never read the brief.

`brief` refuses a writer without `--files` (only `verify*`/`relay*` may omit it), an outstanding
name without `--redispatch`, a dispatch past `--max-agents`, and a writer overlapping an outstanding
writer's `--files`, patterns included (`--allow-overlap --why "<x>"` is audited). A slot frees when a
**non-empty** RETURN.md appears, not on `collect`: dead agent → `--redispatch`; stopped or never
dispatched → `D cancel <name>` (frees the slot, stops nothing; a marker; REFUSED for a collected agent or a returned verifier: collect it). A hand-written `.cancelled`/`.collected` with no audit event counts for nothing (`check`/`status`: `NOT ATTESTED`). `--files` refuses overlapping *allowed sets*, not duplicated
*deliverables*: freeze layout, output format and test home in `--context`.

Every agent returns **a path**, `agents/<name>/RETURN.md`, ≤ 60 lines, first line exactly
`unmet=[<ids>]` (as `check` prints it) or `INCOMPLETE: <what is missing>`; verifiers
`VERDICT: CONVERGED` / `VERDICT: NOT-CONVERGED`. Its **final message ≤ 2 lines** (that line, the
path): the harness pastes it whole into your context. **Workers message no one**: a message to
`main` reaches the TOP session, not the relay, and sibling messages break seam isolation.

**Waiting is in-turn** (ending the turn spends a block): poll RETURN.md in a bounded `sleep` loop.

**Boundaries** (a condition newly passing, an agent returning, a failed check):
`D check` at each and **never ~15 tool calls
without one**, not after every edit.

Collect **only** via `D collect <name>`, relay legs included: it validates the return (first line,
length, verdict), prints it bounded, lists changed files outside the agent's allowed set, logs to
PROGRESS.md **and runs the check**. Exit 1, no stamp, for a missing return or a first line not in
the brief's form. Never `cat` a RETURN.md or open a BRIEF.md: a verdict counts only once `collect` stamps it.
`D note "<text>"` logs decisions; PROGRESS.md is the only memory a relay or resumed session gets.

**First green freezes the contract.** Any all-green evaluation (`check`, `collect`, `close`, the
gate) stamps `first_green_at`; `check` prints `FIRST GREEN`. From then `amend` and `start --force`
are REFUSED. Close out at once: hooked → end your turn (`close` is the unhooked path, REFUSED on a
hooked drive); unhooked → `D close`. A defect the conditions miss is a follow-up in the report,
not a new condition; a later regression still blocks: fix it under the frozen contract.

**Pushing** an unmet worker or NOT-CONVERGED verifier: first, message the **same named agent** with
the failing output; then `D brief --agent <same name> --redispatch` (archives
the old return). A worker's "done" counts only by running its conditions.

## 3. Relay — keeping a long run cheap

**Main dispatches, waits, verifies, adjudicates; it does not do the work.** When T5 fires, or from
the start on a drive over ~10 blocks, run legs:

1. `D brief --agent relay-1 --minutes 45` → dispatch one relay. It orients from `D status` +
   PROGRESS.md, works or delegates, updates PROGRESS.md and REPORT.md, returns its unmet list.
2. Wait in-turn, then `D collect relay-1`.
3. Unmet beyond `report` → `relay-2`, same call. Otherwise verify (T3), finish REPORT.md, close out.

Relays skip the overlap check: one at a time. A relay may be a **separate session** (ungated: the gate never blocks another session id); wake it once via **`SendMessage`**,
`notify_when_idle: true`; do not poll.

## 3b. When the session breaks

- **"Stop hook error occurred"** is a blocking hook rendering, not a fault.
- **After `/clear`, a crash, `--resume` or a new terminal: `D resume` first.** The gate binds one session id
  and **never blocks another**: until you resume, the drive is silently ungated; the operator must
  re-type `/drive` (a skill cannot self-invoke).
- **The gate walks UP** from its payload cwd to the nearest `.drive/active`; a drive sealed with no session id is adopted by the first session that fires.
- **State or contract missing or corrupt** → the gate fails open, one stderr line naming what.
- **No Agent tool**: `--agents 0` and `--verify none`, or the Codex verifier.
- **Operator's pause order**: `D pause`, end the turn; stops pass until `D resume`.
  REFUSED unless their latest prompt orders it. `D release` ends the drive.

**Codex verifier, cross-vendor first** (T3), never hand-written: `D codex-verify --agent verify-codex
--minutes 15 --cond <ids>` writes RETURN.md **only** on a verdict line; else it cancels the agent, exits **3**: use an Agent-tool verifier, noted in the report.

## 3c. Where the enforcement stops

Everything above called REFUSED, blocked or red is enforced every time. Unchecked, and yours: the
premise check, a map row per member, the read boundary, asking once, closing out, and:

- **The abort bar.** `--attempts` needs two distinct entries but cannot spot a rephrasing.
  Say what each ruled out.
- **Whether a NOT-CONVERGED finding is real**, and whether to push, redispatch or abort.
- **The relaunch.** A hook cannot call the Agent tool: you relaunch, or the stall counter climbs
  to CAPPED, never met.

## 4. Exits — exactly three

- **MET**: every condition green, `report` included, recorded by the gate as you end the turn
  (hooked) or by `D close` (unhooked only; on a terminal drive it prints the outcome). **An unhooked drive left open is a violation**; `start`
  refuses the next seal while it is open. Final message, first line: `MET <id>` and REPORT.md's path.
- **ABORT**: `D abort --blocked "<piece>" --mechanism "<why it cannot be done>" --attempts
  "<attempt 1>;<attempt 2>" --evidence "<commands and output>"`, legal only after ≥ 2 *distinct* fix
  attempts; a hand-written ABORT.md settles nothing. It covers the blocked piece; the rest is owed.
- **CAP**: the gate released you at `max_blocks` / `max_minutes`. Conditions run *before* the cap,
  so all-green on the boundary still reads MET; anything red ends it CAPPED.

"Taking long", "unclear remaining work" and response length are not exits. Write nothing that reads
as a completion summary while `D check` shows unmet ids.

## 5. REPORT.md — the `report` condition

`D report-check --cdir <drive dir>` prints a line per unmet requirement, then `report: ok` or
`report: N requirement(s) unmet`:

1. Lines starting `## Outcome`, `## Evidence`, `## Agents`, `## Unverified`, outside fences and `<!-- -->` comments.
2. ≥ 400 characters and ≥ 40 distinct words (≥ 3 letters) of non-heading text outside fences and comments.
3. Every condition id you sealed, and `tests-not-weakened` when present, as a whole word.
4. Every collected and every cancelled agent's name.
5. Under `## Agents`, `planned <P>, dispatched <D>` with P = `--agents`, D = distinct agents collected at
   least once, not named `verify*`/`relay*`. A shortfall: say why.
6. Every `--known-incomplete` TEXT, verbatim, under `## Unverified`.
7. Every `--map` KEY under `## Outcome`; a KEY mapped `unmapped` under `## Unverified` too.
8. Verify required: the newest non-cancelled `verify-*` return is `VERDICT: CONVERGED` and collected
   (`D verified`).
9. No outstanding agent: every briefed agent is collected or cancelled.

Content is yours. `## Outcome`: MET / ABORTED / CAPPED, a sentence per map row. `## Evidence`: per
condition, the command and its decisive output line, **regenerated at write-up**. `## Agents`:
agent, seam, verdict, RETURN.md path. `## Unverified`: every claim not run, labeled inferred / assumed.
