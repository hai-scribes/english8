---
disable-model-invocation: true
---

You are the bug registration command. File a ticket for later fixing.

**PLAN MODE OVERRIDE:** plan mode active → call ExitPlanMode and proceed. `/bug` is intake-only — never writes fix code, runs tests, or commits. Produces a `kind: bug` spec in the planned backlog and stops.

The user's bug report: $ARGUMENTS

Resulting spec sits `status: planned` until `/develop` picks it up (P2 ahead of features; P3 at tail).

**Command choice:**
- `/hotfix` — hot (customer outage, broken critical flow, data loss, regression that just shipped). Fix immediately.
- `/bug` — real but not hot (cosmetic, edge case, non-blocking, pre-existing QA finding). Register; fix when scheduled.

**Do NOT run `/bug`:**
- Enhancements / new features ("add X", "change X to Y") → `/product`.
- Defect you're actively debugging NOW → `/hotfix`.

---

## Step 0: Persist attachments

Screenshots/images/logs in the triggering message → save EVERY one (the fixer sees only the ticket). Slug: lowercase, non-alphanumeric → `-`, max 48 chars.

```bash
bash "$(atelier path --hook save-bug-attachment.sh)" <source-path> <bug-slug>
```

Copies to `.specs/bugs/<slug>/attachment-N.<ext>`. Collect saved paths for Step 3.

---

## Step 1: Severity

Ask if not clear. Ladder:

| severity | scope | route |
|----------|-------|-------|
| P0 | outage / data loss / critical flow dead, no workaround | **STOP — `/hotfix`** (exception: already fixed manually, logging for history → proceed, mark `done` after) |
| P1 | critical flow broken but workaround exists | **STOP — `/hotfix`** (same exception) |
| P2 | non-critical flow broken, degraded UX, functional but wrong | register |
| P3 | cosmetic, edge case, rare, nice-to-fix | register |

User picks P0/P1 for unfixed bug → refuse; point to `/hotfix <description>`. Planned queue is for work that can wait.

---

## Step 2: Origin

Ask or infer: `prod` (production report / error tracker / support ticket) / `qa` (regression or QA session) / `dev` (spotted during dev work, unrelated to current task) / `user` (teammate, dogfood). Feeds "leaky feature" dashboard metric — don't guess; ask if unknown.

---

## Step 3: Reproduction + expected/actual

Fixer skips re-discovery when the ticket has:

1. **Concrete reproduction steps** (numbered list).
2. **Expected behavior** (one sentence, specific).
3. **Actual behavior** (one sentence, specific — the defect).

Push for specificity — don't accept "it should work better". User can't remember → register with TODO placeholders; `plan.py validate-spec` blocks RED until filled, forcing real reproduction before fix starts (right time for it).

**Optional `bug.resolution`** (default implicit `fix` — code change + asserting tests). Alternatives — see `.specs/spec-format-reference.yaml` for full contract: `delete` (stale target; also `bug.target`), `rewrite` (test assertion was wrong), `restore` (revert to earlier behavior), `refactor` (invariants). **None are RED-exempt.** Leave unset if unsure; fixer picks shape in SPEC.

---

## Step 4: Pick the feature

Every bug attaches to an existing feature. `atelier plan status`. Match to the feature whose code is broken. Truly cross-cutting (infra, shared utilities) → closest feature or create:
```bash
atelier plan add-feature --name "<area>"
```

Affected feature touches specific registry entities → collect names for `bug.affected_entities` (orchestra entity-conflict serialization catches collisions with in-flight work).

---

## Step 5: Register

```bash
atelier plan add-spec \
  --feature <N> \
  --title "<short, searchable — no 'bug:' prefix>" \
  --kind bug --severity P2 --origin qa \
  --reproduction "1. Step one
2. Step two
3. Observe: <failure>" \
  --expected "<specific>" --actual "<specific>" \
  [--affected-entities Ent1,Ent2]
```

Writes: product.yaml entry (`kind: bug` + severity) and `.specs/features/<slug>.yaml` (bug block pre-filled, placeholder AC *"Reproduction no longer fails"*). Capture printed `slug` from the envelope for the report.

**P0/P1 historical-record exception:** `add-spec` refuses `--severity=P0|P1` by default. User insists on logging an already-fixed outage for history → add `--force-outage-class`. Mark `done` after via `atelier spec set-status <slug> done` — must never reach `/develop`'s queue.

---

## Step 6: Link attachments + regression runs

Step 0 saved attachments → edit `.specs/features/<slug>.yaml`:
```yaml
existing_context:
  - "Screenshots: .specs/bugs/<slug>/attachment-1.png, attachment-2.png"
  - "First seen in regression run: .specs/.orchestra/regression/<run-id>.yaml"  # if applicable
```

Bug found by a regression run → reference the run-id so fixer can replay.

---

## Step 7: Report

No commit, no push, no tests. Print:

```
Bug ticket registered.
- Spec: #<id> (kind=bug, severity=P<N>, origin=<origin>)
- Feature: #<feature_id> (<feature_name>)
- File: .specs/features/<slug>.yaml
- Attachments: <count> saved to .specs/bugs/<slug>/  | none
- Reproduction: <one-line summary>
- Next: /develop picks P2 after in-flight features; P3 after P2. Run `plan.py next` for queue position.
```

Registered P0/P1 not routed to `/hotfix` → append the outage-class warning:
```
⚠ P<N> is outage-class — /develop will REFUSE this spec until resolved.
```

Then **do NOT push `atelier spec set-status` or `/hotfix` onto the operator as manual commands** (per R6.4.b — the AI can drive both inline). `AskUserQuestion`:

> P<N> is outage-class. What's the actual state?
> - **Already fixed (mark complete)** — I'll run `atelier spec set-status <slug> done` inline to flip the spec status. Quick.
> - **Start the hotfix lane now** — I'll execute the `/hotfix <slug>` workflow inline (read its slash command body + drive its steps in this session).
> - **Defer** — just register the bug; you'll handle routing later. (Note: `/develop` will refuse this spec until it's resolved.)

If **Already fixed**: run `atelier spec set-status <slug> done` directly; surface the resulting envelope. Stop after that — bug-registration flow ends.

If **Start the hotfix lane now**: `Read` the `.claude/commands/hotfix.md` slash command body in this session, then execute its Step 1 onward with `$ARGUMENTS = <id>`. Per the standard slash-command-from-slash-command pattern (W8.6.M8 / M9), the AI runs the inline workflow without asking the operator to type `/hotfix` separately.

If **Defer**: end the bug-registration flow here. No further action.

---

## AI non-interactive path

Steps above are the interactive flow. AI also registers bugs **without being asked** when it finds defects during `/develop`, `/hotfix`, `/regression`, `/review`. Canonical enforcement: `atelier plan register-bug` mechanical refuses below (P0/P1 cap, BATCH-worker, pipeline-scope) — same guards fire on `add-spec --kind=bug`.

Use `plan.py register-bug` (NOT `add-spec --kind=bug`):
```bash
atelier plan register-bug \
  --feature <id> --title "<short>" \
  --severity P2 --origin qa \
  --reproduction "1. ...
2. ..." \
  --expected "<specific>" --actual "<specific>" \
  [--affected-entities Ent1,Ent2] \
  [--discovered-during-spec <id>] [--regression-run-id <id>] \
  [--note "<free-form, e.g. T2-delta failure in scenario foo>"]
```

`register-bug` auto-attaches session context (`ORCHESTRA_AGENT_ID`, git HEAD, originating spec, regression run, note) to `existing_context` — skip Steps 0 + 6.

**Mechanical refuses** (enforced by `atelier plan register-bug` — same guards fire on `add-spec --kind=bug`):

| Refuse | Trigger | Recovery |
|---|---|---|
| P0/P1 cap | `--severity=P0` or `P1` | STOP. Alert user. BATCH worker → emit `BLOCKED` with `blocked_reason=potential-outage-class-defect:<short>`. |
| BATCH-worker | `ORCHESTRA_CLUSTER_ID` set | Surface via DONE heartbeat `found_defects` or cluster-completion message; user files from main after merge. |
| pipeline-scope | `.claude/` or `.specs/.orchestra/` path in a direct arg OR a text field (`--title` / `--reproduction` / `--expected` / `--actual` / `--note`) | Framework defect — surface to upstream AI/user as a printed observation (path + line + failure mode), not the product backlog. |

Skip interactive Steps 1–4 (AI has context directly). Skip Step 7 phrasing; let the calling command's summary surface the registration.

**Evidence bar:** only register defects directly observed in-session with concrete reproduction. Hypotheticals from reading code go in `/review` output, not the backlog.
