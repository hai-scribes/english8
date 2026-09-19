# story-english — handoff for an unattended run

> **Stale in two known ways — read `reports/` and `goal.json` over this file.**
> It was written for the **four**-milestone plan (there are six) and for the old
> budget block (`n_variants` is now 1 and `run.worker` is set). The measured
> baselines below are still accurate as baselines, but the run has since
> happened: milestone 1 is grafted, milestones 2–5 advanced on milestone 1's
> work without spending a cycle, and the lane is stopped at milestone 5's
> coverage floor. `git log` and the run records are the current truth.

Everything that could be prepared without the operator is prepared. What is
left is three acts, two of which are the operator's by design.

## Run this, in order

```sh
# 1. OPERATOR — freeze the charter. Nothing can be proposed until this lands.
atelier prototype goal approve-charter story-english \
  --with-risks a-cleanroom-better,a-selfstudy-transfer,a-story-spine,a-ielts-precursor,a-variant-tractable,a-storymode-reuse,a-assets-kept,a-accountability-tolerable,a-browser-only \
  --agent --compact

# 2. AGENT — persist the four drafted milestones, then author the four honesty
#    reviews (--auto refuses to launch, exit 9, on any unanswered review).
cat .specs/prototype/story-english.milestones.draft.json \
  | atelier prototype goal propose story-english --set-json - --agent --compact

# 3. OPERATOR — freeze each gate. Binds the checks.yaml hash and the harness
#    contents, so nothing can quietly edit the measuring stick afterwards.
for i in 1 2 3 4; do
  atelier prototype goal approve-milestone story-english $i --agent --compact
done

# 4. AGENT — launch. Backgrounded; add --max-wall-clock-sec 0 to outlive a session.
atelier prototype run story-english --auto --agent --compact
```

## What is already done

- **Charter** — validated clean, `validation_errors: []`. Draft persisted at
  `story-english.charter.draft.json`; the live copy is in `goal.json`.
- **Four milestones** — drafted, shape-checked, at
  `story-english.milestones.draft.json`. Gates, SLOs, benchmarks, tournament
  candidates and task ledgers all written. They are NOT yet in `goal.json`
  because `goal propose` refuses with `charter-not-frozen`.
- **`story-english.checks.yaml`** — three scenarios (`build`, `marking`,
  `session`), one of them `kind: interaction` as the final milestone requires.
  Every milestone declares exactly this set, which is what `approve-milestone`
  demands.
- **Five harnesses**, in the prototype worktree under `harness/`, each verified
  against the build that exists rather than the one being planned.
- **Playwright + Chromium** installed in the worktree.
- **`.atelier/rules/`** — both files rewritten from the shipped starter
  templates to this product's actual bar, and copied onto the prototype branch.

## Measured baselines, from the real build

These are what the milestones have to move. Every number came out of a harness
run, not an estimate.

| harness | result |
| --- | --- |
| `coverage` | **0 / 400** targets placed. 400 = lexis 328 + grammar 24 + pronunciation 12 + everyday-English 12 + culture block 12 + writing genre 12. The widely-quoted 328 is lexis alone. |
| `marking` | **18 / 46** legitimate answers rejected; **0 / 41** distractors accepted; `key_variant_coverage` **0.208** |
| `session` | first readable paint **1079 ms** at 360 px under 4x CPU throttle; **448,092** bytes of JavaScript — **3x** the 150 KB guardrail |
| `surfaces` | 103 pages, **0** band numbers, CEFR labels or criterion names |
| `support` | 68 glosses, **0** re-offered |

The reported marking defect reproduces exactly against the live engine:

```
markAnswer("yes, it is", ["yes"])  →  { ok: false, why: "two" }
```

She is not merely marked wrong. `TWO_ANSWERS` fires on the comma, so she is
told *"two answers in one gap score zero"* when she wrote one answer and it was
correct — an authoritative wrong explanation, to a child with nobody to appeal
to. `markAnswer` never receives `skill=`, so test severity is applied to all
1,851 coursework items as well as the 313 that simulate a test.

## Two things the automation cannot do

1. **Milestone 4 will stop for a human, however green it is.** `--auto` never
   auto-accepts a `deferred_to_boundary` honesty surface, and milestone 4
   carries one: a headless gate cannot see whether a child came back.
   `returns_unprompted` is observed on a Saturday, not computed. Best
   achievable is **milestones 1–3 unattended, stop at 4**.
2. **The second-brain review does NOT block a boundary, and never did.** Codex is
   dropped — it is spend-capped — and replaced by an adversarial opus subagent
   briefed to disagree. But an earlier version of this line claimed the review
   was "an open task in every milestone, and an open task blocks a boundary".
   That is false: `open_milestone_tasks` counts only *dict* tasks carrying
   `status: "open"`, and every one of the 45 tasks across the six milestones is
   a bare string — which the framework documents as "a free-form description (no
   status, never open)". Verified: zero open tasks on every milestone. So
   milestones 1–4 auto-advanced with no review, and milestone 6 will too.

   This matches the operator's deliberate choice to keep the review as
   non-blocking direction rather than a gate. The defect was the sentence, not
   the configuration. **If you ever want a task to actually block, it must be
   authored as `{"text": "...", "status": "open"}`, not as a string.**

## Uncommitted

A commit was proposed and declined, so the following are on disk but not in
git. Nothing is lost; the auto run reads the working tree.

- `harness/` (new, untracked) in `.worktrees/prototype-story-english/`
- `.atelier/rules/*.md` (modified) in both the main tree and the worktree
- `package.json` / `package-lock.json` (playwright added) in the worktree
- `.specs/` (untracked) in the main tree
