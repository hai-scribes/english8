---
disable-model-invocation: true
---

## Atelier port note

**Implementation notes:**

- **SK-6 rule** — Spec Reviewer prompt now requires emitting `unclear[]`
  entries with `status: active` and a focused question rather than silently
  guessing at underspecified requirements. The operator resolves at Gate E
  or sends the spec back for revision. The `unclear[]` block already exists
  in the prior spec-format-reference; this rule lifts enforcement earlier.
- **GL-1 goals-layer MERGE (W8.4.13b wired)** — `non_goals: [list]` top-
  level field (ships in scaffold as `non_goals: []`; operator authors
  items) + per-AC `user_story: <one-line>` field. `atelier spec validate`
  emits WARN-level violations `GL1_NON_GOALS_MISSING` and
  `GL1_AC_USER_STORY_MISSING` when fields are absent — WARN does NOT
  block (exit 0); FAIL promotion lands in a later sub-wave once
  population is reliable. **When authoring a spec in this command**:
  always populate `non_goals: [...]` with operator-stated anti-goals
  (ask in Phase 1/2 if not stated; never invent), and add per-AC
  `user_story: "as a <actor>, when <trigger> I want <outcome> so that
  <value>"` to each AC at draft time. Prototype-first via `/prototype`
  → `/promote` is unchanged; the operator authors non_goals at step 5.5
  review there (see promote.md).
- **Spec validate command** — `atelier spec validate <slug>` replaces
  `python3 .claude/scripts/plan.py validate-spec <slug>`.
- **Gate E approval** — `bash "$(atelier path --hook approve-spec.sh)" <slug>`
  (resolver-mediated path; semantics unchanged).

Per ATELIER_PLAN.md § W8.4 + the 2026-05-13 [GL-1] simulation verdict.

---

You are the planning command. You edit `.specs/` files only. You never write application code.

The user's request: $ARGUMENTS

---

## Ground rules

- **Never assume** domain logic, business rules, or user behaviors. Ambiguous → ask.
- Two-phase writes per invocation:
  - **Phase A** — product.yaml / architecture.yaml / durable-rule edits; sweep `stale_rules`.
  - **Phase B** — draft spec files for newly-planned specs (copies parent feature's durable rules — freeze-at-bet).
- Both phases are driven by `.specs/.orchestra/product-tx.yaml` so an interrupted `/product` resumes cleanly without re-prompting.
- Every plan.py command is idempotent.

---

## Entry — resume check (FIRST, every invocation)

`atelier plan tx-status`.

- Output begins `tx:` → pending transaction exists. Print *"Resuming &lt;operation&gt; started at &lt;started_at&gt;."* Jump to **§ Resume**. Do NOT re-prompt — approval was captured at tx-begin.
- Output is `none` → fresh session. Continue.

---

## Bootstrap — only when `.specs/product.yaml` does NOT exist

Creates project infrastructure once. Skip entirely for existing plans.

### Phase 1: Discovery

Ask the user. Cover:

1. **Users** — persona, skill level, target audience.
2. **Core problem** — what the product solves; minimum viable outcome.
3. **Constraints** — timeline, deployment target, must-have integrations.
4. **Design preferences** — UI style, existing design systems, reference apps.
5. **Technical preferences** — stack, hosting, database.
6. **UI/UX** (if UI): key screens, flows, target devices, accessibility, design input availability (Figma/mockups/verbal/AI-designed), existing component library.

Summarize: *"Here's what I'll build: [summary]. Correct?"*

### Phase 2: Architecture + initial feature list

Propose:
- Stack (language, framework, database, hosting).
- Project structure (monorepo vs single; key directories).
- Ordered feature list with dependencies, entities, and any durable rules the user stated explicitly (must/never/success_metrics/design_refs/ui_contract).
- Parallelization map (features at same dep depth that can run concurrently).

`AskUserQuestion`: Approve / Revise / Reject.

### Phase 3: Foundation setup

After Approve:
1. Scaffold the project (`npx create-next-app`, `cargo init`, etc.).
2. Run `atelier init` to scaffold Atelier state (`.atelier/`, `.gitignore` entries, git hooks). Then export the operator-provided commands (`TYPECHECK_CMD`, `BUILD_CMD`, `PACKAGE_CMD`, `INTERACTION_TEST_CMD`) via `.envrc.atelier` / direnv / shell — `atelier doctor` confirms they're set.
3. Create `.specs/product.yaml` via `plan.py add-feature` (one call per feature, pass `--must` / `--never` / `--success-metric` / `--design-ref`).
4. `plan.py add-spec` for initial spec entries.
5. Create `.specs/architecture.yaml` + `.specs/architecture-decisions.md` if the project needs layered structure.
6. UI projects: `.specs/design-system.yaml` (run `/audit-design` if UI codebase exists; else scaffold from design-foundations).
7. `plan.py draft-pending-specs` — creates spec files under `.specs/features/`.

Wrap writes in a tx for resumability:
```
plan.py tx-begin --operation new_feature --steps scaffold,write_features,write_specs,draft_specs
```
Flip each step `done`, then `tx-archive`.

Skip the rest of this file for bootstrap.

---

## Dispatch — fresh session, product.yaml exists

Classify the user's request. Ambiguous → ask. **Read the Triggers/Constraints column BEFORE entering the operation flow** — rules AI most often misses mid-step.

| Intent cue | Operation | Triggers / Constraints |
|---|---|---|
| "Add a new feature" / "Build X" | **new_feature** | Phase A + B; UI w/ design image → Scribe pre-pass drafts `ui_contract` |
| "Add a ticket for Y" / "Enhance feature N" | **add_spec** | Phase B only. **Freezes feature's `ui_contract` at draft time** — edit contract via `edit_rules` first if new UI elements needed |
| "Change must/never" / "Update success metric" / "Switch design ref" | **edit_rules** | **Triggers Gate I** — every in-flight spec under N marked `stale_rules`, must reconcile before advancing |
| "Change description of feature N" (prose only) | **edit_description** | No Gate I trigger; lightweight |
| "Add a layer" / "Move X to its own service" / stack swap | **architecture_change** | **Single-envelope approval — no partial accepts.** Half-applied architecture is the worst state |
| "Remove feature N" / "Cut X" | **cut_feature** | **Blocks if any non-cut feature depends on N.** `done` specs leave impl code (operator removes manually) |
| No arguments | (status query) | `plan.py status`; ask next step |

---

## Operation: `new_feature`

1. **Read plane:**
   - `plan.py status` — feature index.
   - **`plan.py candidates-for-intent --intent "<one-line user ask>" --entities "E1,E2" --outcome "<user-visible result>"`** — ranked near-duplicates of the user's ask. Header-only fields; read the top candidate's full spec via `plan.py spec-summary <id>` only if attaching.
   - `plan.py check-impact --name "X" --creates "A,B" --requires "C,D" --deps "1,2"` — entity collisions, unknown requires/deps, dep cycles.
1b. **Near-duplicate guard:** If `candidates-for-intent` returns a top candidate with `score >= threshold` AND non-empty entity overlap AND `source: active`, halt drafting and `AskUserQuestion`:
   - *"Your intent looks ≥85% similar to spec `<id>-<slug>`. Attach to existing spec / Create new anyway / Abort?"*
   - **Attach** → switch to `add_spec` op against the existing feature; do NOT draft a new feature entry. Exit `new_feature` here.
   - **Create new anyway** → generate a stable session id and reserve the slot:
     ```bash
     mkdir -p .specs/.orchestra
     WORKER_ID="product-main-$(uuidgen 2>/dev/null || date +%s%N)"
     echo "$WORKER_ID" > .specs/.orchestra/product-session.id
     plan.py claim-intent --intent "<same>" --entities "E1,E2" --outcome "<same>" --worker-id "$WORKER_ID"
     ```
     The id must be written to `.specs/.orchestra/product-session.id` BEFORE calling claim-intent because each Bash tool call starts a fresh shell (so `$$` / `$PID` tokens would differ between claim and release — the on-disk file is the stable handoff). On `ok: true`, log rationale in the feature's `notes:` and proceed to step 2. On `ok: false` (another /product session raced you between the candidates read and the claim), present the fresh collision to the user via a second `AskUserQuestion` — candidates-for-intent is advisory; claim-intent is the authoritative gate.
   - **Abort** → no writes; return to prompt.
   If the top match is `source: pending` (another worker's in-flight claim), prefer **Abort** and let the claiming worker finish; the operator can re-enter /product once the pending claim resolves.
1c. **Release on failure or success.** If any step 1b–7 fails after `claim-intent` returned ok, read the persisted id and release before exiting:
    ```bash
    WORKER_ID=$(cat .specs/.orchestra/product-session.id 2>/dev/null)
    [ -n "$WORKER_ID" ] && plan.py release-intent --worker-id "$WORKER_ID"
    rm -f .specs/.orchestra/product-session.id
    ```
    Step 7's `tx-archive` block runs the same release+cleanup on success, so the slot is cleared immediately rather than waiting for the next caller's pid-dead sweep.
2. **Resolve blockers.** `check-impact.ok == false`:
   - Entity collisions → ask whether to rename or reuse the existing owner.
   - Dep cycles → present path; ask which dep to drop.
   - Unknown deps/requires → ask the user (usually a missed prerequisite feature).
3. **Propose the feature entry:** name, description (one-liner), dependencies, entities.creates, entities.requires, durable rules (must / never / success_metrics / design_refs / ui_contract — explicitly; do not invent). `ui_contract` is a dict of UI elements (role + accessible name + actions); pass via `--ui-contract <yaml-path>`.
4. **[IF UI feature AND design image provided] Scribe pre-pass — draft `ui_contract`:** (not yet shipped — the dispatcher prompt `atelier/prompts/scribe-draft-contract.md` is parked pending a future wave). For now, user hand-authors `ui_contract` after the design image lands, via `plan.py update-feature-rule --patch`, or leaves it unset until the contract becomes load-bearing.
5. **Propose initial spec(s).** Slice into shippable increments. One spec per independently-testable outcome.
6. **`AskUserQuestion`** with full proposal: Approve / Revise / Reject. UI contract draft (if any) shown inline — Approve covers both proposal and drafted contract.
7. On Approve, execute Phase A + B atomically:
   ```bash
   plan.py tx-begin --operation new_feature --steps write_feature,write_spec_entries,draft_specs
   plan.py add-feature --name "X" --deps "1,2" --creates "A,B" \
                       --must "..." --never "..." --success-metric "..." --design-ref "..." \
                       [--ui-contract /tmp/ui-contract-<feature-slug>.yaml]
   plan.py tx-update --step write_feature --status done

   # For each planned spec:
   plan.py add-spec --feature <N> --title "..."
   plan.py tx-update --step write_spec_entries --status done

   plan.py draft-pending-specs
   plan.py tx-update --step draft_specs --status done
   plan.py tx-archive
   # Release the pre-draft intent claim from step 1b. Idempotent.
   WORKER_ID=$(cat .specs/.orchestra/product-session.id 2>/dev/null)
   [ -n "$WORKER_ID" ] && plan.py release-intent --worker-id "$WORKER_ID"
   rm -f .specs/.orchestra/product-session.id
   ```
8. **Validate each drafted spec.** For each file created by `draft-pending-specs`: `atelier spec validate <spec-id>`. React per output:
   - `FAIL` → fix (missing fields, malformed YAML, broken `depends_on`, AC ambiguity, `existing_context` references that don't resolve); re-run.
   - `WARN: scope classifier (tier 1): codex done → ...` → dispatch a tier-2 Claude subagent (different model from this session) using `atelier/prompts/scope-classifier.md`, then run `classify-compare.sh` and `record-classification-decision.sh`; adjudicate disagreements via `AskUserQuestion`.
   - `WARN: scope classifier (tier 1): codex unavailable` → tier-2-only (single-model; `classify-compare.sh` with `""` for the codex side). classifier.yaml signs `agree_one` with capped confidence.
   - `PASS: scope classifier (persisted)` → nothing to do.

   **Validation is the queue-eligibility gate.** A spec only leaves `/product` as queue-eligible if `validate-spec` returns clean — every FAIL must be resolved before step 9. /develop's plan-time eligibility preflight (`spec-eligibility`) re-runs the same checks and will defer specs with unresolved FAILs into `batch-plan.yaml#deferred[]` with `reason: unprocessed` — but that's friction the operator pays at /develop time. Catch it here.

   **Iteration cap.** If a spec FAILs `validate-spec` twice with the same root cause after fix attempts (e.g., AC ambiguity that resists rewording), STOP and surface to the user via `AskUserQuestion` — don't loop. Don't proceed to step 9 carrying an unresolved FAIL.

9. **Final validation sweep before completion.** Before announcing the operation done (step 10), re-run validate-spec on every drafted spec one more time as a defense against the partial-fix anti-pattern (fix one FAIL, miss a second one in the same file). All specs must report no FAIL on this pass. If any FAIL re-surfaces, return to step 8.

10. **Approval binds classifier.** After validate-spec + user Approve, `bash "$(atelier path --hook approve-spec.sh)" <slug>` binds `classifier-sha256` alongside `spec-sha256` — post-approval edits to classifier decisions invalidate the marker (same drift-detection as ACs).
11. Summary + `AskUserQuestion`: `/develop`, plan another feature, or done.

---

## Operation: `add_spec`

Same shape as `new_feature`, feature already exists.

1. `plan.py feature <id>` + `plan.py feature-snapshot <id>`. Confirm current durable rules with the user.
2. Propose spec(s). Slice if needed.
3. **Note:** new specs inherit feature's current `ui_contract` verbatim at draft time (freeze-at-bet). NEW UI elements → edit contract via `edit_rules` BEFORE adding the spec. Editing after marks all in-flight specs stale (Gate I) — usually not what you want mid-session.
4. `AskUserQuestion` with proposal.
5. On Approve:
   ```bash
   plan.py tx-begin --operation add_spec --steps write_spec_entries,draft_specs
   plan.py add-spec --feature <N> --title "..."     # repeat per spec
   plan.py tx-update --step write_spec_entries --status done
   plan.py draft-pending-specs
   plan.py tx-update --step draft_specs --status done
   plan.py tx-archive
   ```
6. **Validate each drafted spec** + **final validation sweep** — same discipline as `new_feature` steps 8–9. A spec only leaves `add_spec` as queue-eligible if `validate-spec` returns no FAIL on the final sweep; otherwise /develop's preflight will defer it with `reason: unprocessed`, paying the friction at /develop time instead of catching it here.

---

## Operation: `edit_rules`

**Triggers Gate I:** every in-flight spec under the target feature marked stale; must reconcile before advancing.

1. Write a patch file:
   ```yaml
   # /tmp/patch.yaml
   must: [...]    # FULL replacement list (keys absent are untouched)
   never: [...]
   ```
2. `plan.py rule-impact --feature <N> --patch /tmp/patch.yaml` — JSON: `would_mark_stale`, `done_specs`, `scenarios_touching_feature`, `dependent_features`.
3. **Review.** Default: AI classifies each candidate as *contradicts* / *needs amendment* / *deprecation path* / *unaffected*. For durable + high-blast-radius rules (security, privacy, data retention, architectural invariants) add Codex cross-model critique via `audit-sign.sh`-style prompts. Skip Codex for cosmetic/narrow rules — over-applying makes this ceremonial.
4. Propose: patch + rule-impact findings + any migration specs a rule change implies.
5. `AskUserQuestion` with full bundle.
6. On Approve:
   ```bash
   plan.py tx-begin --operation edit_rules --steps update_rules,reconcile_notify
   plan.py update-feature-rule --feature <N> --patch /tmp/patch.yaml
       # ↑ writes product.yaml AND marks in-flight specs stale_rules atomically
   plan.py tx-update --step update_rules --status done
   plan.py stale-rules-check       # prints current stale set
   plan.py tx-update --step reconcile_notify --status done
   plan.py tx-archive
   ```
7. Print reconcile commands for the operator (do NOT auto-reconcile):
   ```bash
   plan.py reconcile-stale-rules --spec <id> --accept-new       # re-copy rules; reopens Gate E
   plan.py reconcile-stale-rules --spec <id> --exempt "<why>"   # keep frozen rules with justification
   ```

---

## Operation: `architecture_change`

First-class, atomically-approved, incrementally-executed. Never bundle silently into a feature spec.

1. Copy `.specs/architecture.yaml` to `/tmp/proposed-architecture.yaml`, apply diff.
2. `plan.py architecture-impact --diff /tmp/proposed-architecture.yaml` — four-set blast radius: non-conformant shipped features, invalidated in-flight specs, broken scenarios, migration prereqs.
3. **Propose the full migration envelope:**
   - architecture.yaml diff.
   - architecture-decisions.md ADR entry (context / decision / rationale / status).
   - Migration specs sequenced with `depends_on` for compat phases: introduce → dual edges → migrate features → tighten → remove compat.
4. `AskUserQuestion` with FULL bundle — one approval, no partial approvals.
5. On Approve:
   ```bash
   plan.py tx-begin --operation architecture_change \
       --steps write_architecture,write_adr,add_migration_specs,draft_specs

   # Step 1 — Write architecture.yaml.
   plan.py tx-update --step write_architecture --status done

   # Step 2 — Edit architecture-decisions.md (append ADR).
   plan.py tx-update --step write_adr --status done

   # Step 3 — Queue migration specs.
   plan.py add-spec --feature <N> --title "Migrate X to new layer"     # repeat
   plan.py tx-update --step add_migration_specs --status done

   # Step 4 — Phase B.
   plan.py draft-pending-specs
   plan.py tx-update --step draft_specs --status done
   plan.py tx-archive
   ```

---

## Operation: `edit_description`

Prose-only edit; no durable rules, no stale_rules trigger.

1. Read feature; propose new description.
2. `AskUserQuestion` (lightweight).
3. On Approve:
   ```bash
   plan.py tx-begin --operation edit_rules --steps update_description
   plan.py update-description --feature <N> --desc "..."
   plan.py tx-update --step update_description --status done
   plan.py tx-archive
   ```

---

## Operation: `cut_feature`

1. Enumerate dependents: features with `dependencies: [<id>]`, scenarios covering, entities owned by its specs that other features require.
2. **Block** if any non-cut feature depends on this one — user cuts dependents first or severs dependency.
3. Propose cut + cleanup: spec files to delete, entities to reclaim/orphan, scenarios to update, design artifacts to drop.
4. Warn if feature had `done` specs (impl code remains; operator removes manually).
5. `AskUserQuestion`.
6. On Approve:
   ```bash
   plan.py tx-begin --operation cut_feature --steps cut_from_index,cleanup
   plan.py cut-feature <id>
   plan.py tx-update --step cut_from_index --status done

   # Follow cleanup plan from cut-feature output:
   # - delete spec files
   # - reclaim/orphan entities in registry.yaml
   # - delete designs/, verify/ artifacts
   # - update or delete scenarios in regression-scenarios.yaml
   plan.py tx-update --step cleanup --status done
   plan.py tx-archive
   ```

---

## Resume

Entered when `tx-status` finds a pending tx on `/product` startup. Approval was captured; replay only the pending work.

1. `plan.py tx-status` — shows each step's status.
2. For each `status: pending`, in declared order:
   - Re-run corresponding commands from the operation's flow above. Each plan.py command is idempotent.
   - `plan.py tx-update --step <name> --status done`.
3. Every step terminal → `plan.py tx-archive`.
4. Summary of what the tx produced + next-step `AskUserQuestion`.

Ambiguous step on resume (e.g., `write_architecture` but you can't determine which diff was approved) → STOP, ask the user. User either provides missing context or `plan.py tx-abort --confirm` discards.

---

## Abort

User requests abort (fresh or resume):

1. `AskUserQuestion` to confirm: *"Abort pending tx `<id>`? Writes already made will remain — `git diff HEAD` and revert manually if desired."*
2. On confirm: `plan.py tx-abort --confirm`. Command prints `git status` for affected files so operator decides what to revert.
3. Do NOT run `git checkout` or any destructive git on the operator's behalf.

---

## Single-write discipline (READ — applies to EVERY operation)

**Every edit** to `.specs/product.yaml`, `.specs/architecture.yaml`, `.specs/architecture-decisions.md`, or `.specs/features/*.yaml` during a `/product` session **must** happen inside a step declared by `tx-begin`. No exceptions. If you want to write outside a step, open a new tx. Without this, Resume breaks and the operator gets a half-applied edit to revert by hand.

---

## Completion

After `tx-archive`, print:
- New/updated features (id + name).
- Specs drafted (slug).
- Stale specs awaiting reconciliation (with reconcile commands).
- Architecture diff (if applicable).

Then `AskUserQuestion`:
1. `/develop` — build what was just planned (first option).
2. `/product` — plan another change.
3. Done.

Pick `/develop` → invoke via Skill tool immediately.

---

## Pitfalls

- **Inventing durable rules.** Never add `must:` / `never:` the user did not state. Ask.
- **Half-approval on architecture.** Approve the whole envelope or none.
- **Auto-reconciling stale specs.** Surface reconcile commands; operator chooses per spec.
- **Skipping Phase B.** After Phase A steps finish, always `draft-pending-specs` before `tx-archive` — otherwise planned specs have no files and `/develop` can't pick them up.
- **Writing before `tx-begin`.** No `.specs/` edits happen until the tx is open.
