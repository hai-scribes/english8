# story-english — direction brief for the prototype lane

**What this is.** The input document for `/prototype story-english` at Step 4
(goal discovery). It carries the *direction* extracted from the current build,
which is being discarded as code. It is not a spec — the spec is extracted from
the validated prototype later, at `/promote`. Nothing here is frozen; the
operator freezes the charter, not this file.

**Provenance labels** are the charter's own vocabulary and transfer directly:
`operator_stated` · `source_backed` · `codebase_observed` · `ai_inferred`.
Every `ai_inferred` line below is a candidate for the charter's assumptions
ledger and must be consciously accepted at `approve-charter --with-risks`.

---

## 1. The product, in one paragraph

An English self-study app a teenager uses alone, where the spine is a **story
read in chapters** rather than a syllabus worked through in units. The
curriculum is still delivered in full and still marked honestly — but it is
carried by the chapter the learner came back for. Grade 8 (Tiếng Anh 8, Global
Success) is the first scope; the shape must not assume it. Learning through the
app should build real IELTS precursors, without the app ever saying so or
scoring a band. `operator_stated`

## 2. Who it is for

**One named learner: the operator's niece.** Vietnamese, grade 8, self-study,
phone-first, unsupervised. `operator_stated`

This is a strength, not a limitation, and it should be used: UC9 step 4 assumes
out-of-band user validation, and most prototypes cannot get any. Here the
north-star metric can be *observed* weekly rather than modelled. Commercial
scale-up is possible later and is explicitly **not** a goal of this charter.
`operator_stated`

The user population it must not silently design for: a motivated adult
test-taker. Almost the entire IELTS-preparation evidence base is built on that
person, and this learner is not them. `ai_inferred`

## 3. What the current build proves — reference only

The existing repo is being kept as a **reference corpus and is not being
ported**. What it establishes, and what a rebuild should not have to rediscover:

| Established | Where | Verdict |
| --- | --- | --- |
| The full grade-8 curriculum is coverable, and is covered | `curriculum/sgk/`, 328/328 via `check_coverage.py` | **Carry the record forward, rebuild the delivery** |
| A directive vocabulary can encode exercise semantics a build can enforce | 10 directives in `tools/build.py`; 357 tasks | **Carry the idea, redesign the surface** |
| Honest marking is buildable — official key grammar, per-task word limits, spelling costing the mark | `tools/test_marking.js`, Group C of `09` §1 | **Carry the rules; they are test-derived, not preference** |
| A dialogue can be staged as a comic and read one panel at a time | `app.js` 1843–3778 | **Carry the intent, discard the implementation** |
| A deterministic build plus a gate suite prevents a stale publish | `tools/gates.sh --deploy` | **Carry the discipline** |

**What the current build got wrong, and the rebuild should not repeat:**

- **The story is a decoration on a syllabus, not the spine.** Twelve dialogues
  sit inside twelve units as the Getting Started text. The learner meets the
  unit first and the story second. The user's framing inverts this, and §6
  below says the research supports the inversion. `codebase_observed`
- **41% of the runtime is unverifiable.** `app.js` is 4,702 lines, of which
  1843–3778 is comic geometry. The only automated guard is jsdom, which does no
  layout (`test_reading.js:35`, `:617`): the stylesheet is asserted as a
  *string* and the JS by grepping its own source for `function ovoidPath` and
  the literal `" C"`. Renaming a function fails the gate with a pixel-identical
  picture; a balloon landing on a character's face passes. Any rebuild must
  have a real-browser interaction gate from milestone one. `codebase_observed`
- **Engineering ran far ahead of content.** `check_cast.py` reports **3 of 32**
  art assets drawn — 29 placeholders, including every one of the 12 effects and
  two of five characters. A reading-adventure whose art is dashed boxes is not
  the product. `codebase_observed`
- **One 4,702-line script loads on all 101 pages**, with no module boundary.
  `codebase_observed`

## 4. What must survive any rebuild — non-negotiable

These are not preferences. Each is either a rule of the test, a finding in the
knowledge base, or an audit item in `research/ielts/09-design-principles.md` §1.
A rebuild that trades one away is not the same product.

1. **Never less than the official book.** Whatever the shape, coverage of
   `curriculum/sgk/targets.json` may not regress. `check_coverage.py` is the
   measure and it reports rather than fails — so this needs a milestone gate,
   not a good intention. `source_backed`
2. **No IELTS band number is ever output** — not a score, not a prediction, not
   a progress dial. Label by CEFR. **A1, A2, A3.** `source_backed`
3. **No promise of a band per unit of study time. E7.** Green (2007): mean
   Writing gain **0.21 bands** over ~130 hours across 476 completers, with 31%
   scoring *lower* on retest; starting level explained ~25% of variance and
   course length under 8%. Kang et al. (2021): 0.298 bands over a mean 284
   hours. `source_backed`
4. **An exercise a key can settle is a committed, marked attempt** — not a
   reveal-and-self-mark. Group C: official key grammar, UK/US spellings, two
   answers in one gap score zero, per-task word limit, spelling costs the mark.
   `source_backed`
5. **The interface explains nothing about itself.** No criterion names, no
   evidential markers, no CEFR labels on the page, no citations. The learner is
   there to learn English, not to audit the course. `operator_stated`
6. **No Speaking rubric or Speaking feedback tool. D7.** Only two Speaking
   claims survived verification. `source_backed`
7. **No Vietnamese pronunciation tooling** beyond `07` §8.3's three permitted
   targets, and **no claim that any of it raises a score or transfers to
   spontaneous speech** — both were tested and neither is evidenced. **B7.**
   `source_backed`
8. **Nothing recorded upstream as a GAP or [X] may be asserted — and neither
   may its negation. A10.** `source_backed`

## 5. What the research already settles — do not re-run this

`research/ielts/` is ~102,000 words, source-verified, with an evidential marker
on every claim. **Grep `research/ielts/index.jsonl` and open only the `file` +
`sec` it names.** `ROUTER.md` maps questions to locations. Reading the documents
wholesale wastes the context window.

The pedagogy pass most relevant to this product is `09` §2–§4:

- **§2.2 Extensive reading — the strongest content-side evidence in the
  corpus.** Six meta-analyses since 2011, all positive; Nakanishi 2015 d = 0.46
  **[V 3-0]**, Sangers et al. 2025 d = 0.41 across 73 studies **[V 3-0]**, with
  gains across *every* language domain, not just reading.
- **§2.1** spaced retrieval · **§2.3** vocabulary tooling · **§2.4** task
  repetition and shadowing · **§2.5** written corrective feedback.
- **§3** washback — what IELTS preparation actually produces, and §3.3, whether
  prep raises scores without raising proficiency.
- **§4** assessment design for self-study; **§4.2** which sub-skills can be
  validly auto-scored and which cannot.

Two further craft documents already exist and are directly on-direction:
`research/story/doraemon-craft.md` (how episodic chapters are built for exactly
this audience — §8 is *Vietnamese thirteen-year-olds in 2026*) and
`research/vocabulary-mode-design.md`.

### The finding this whole product should be built on

Sangers et al. (2025) found the variance in extensive-reading effect is
explained by **two moderators, and both are product features** — not teaching
technique, not learner trait **[V 3-0]**:

| Moderator | Present | Absent |
| --- | --- | --- |
| Text choice limited to the learner's level | **d = 0.73** (k = 25) | d = 0.22 (k = 57) |
| Some form of accountability | **d = 0.51** (k = 59) | **d = 0.01, n.s.** (k = 23) |

**Free, unaccountable reading has an effect indistinguishable from zero.** A
story-led English app is therefore not a good idea because stories are
motivating — it is a good idea *if and only if* it constrains text to level and
builds the accountability step in. That is checklist **B9**, and it is the
sharpest design constraint in this brief. `source_backed`

Three limits travel with those numbers: duration was **not** a moderator (a
longer programme is not automatically better); reading volume was never
analysed (nobody knows how much is enough); retention is barely tested.

## 6. What the charter still has to earn

Genuinely open. These are the discovery questions for Step 4, not answered here.

- **> GAP — how much of the extensive-reading effect survives unsupervised
  self-study is not established.** Almost the entire evidence base is
  classroom-mediated, and the accountability moderator suggests self-study is
  the *harder* case, not the easier one. This is an argument for building the
  log, not evidence that it will work without one. It is the central risk of
  the whole product. `source_backed`
- What "a chapter" is as a unit of work — one sitting? one grammar target? —
  and how a chapter and a syllabus target bind to each other without the story
  becoming a wrapper on a lesson again. `ai_inferred`
- Whether the marked-exercise machinery belongs *inside* the reading flow or
  after it, given that interrupting a story to be tested is how the current
  build lost the thread. `ai_inferred`
- What accountability looks like to a thirteen-year-old alone on a phone such
  that it is not experienced as homework. Prior art worth scanning: reading
  logs, streaks, Duolingo-style commitment devices, Doraemon's own chapter
  cadence. Seed these as `approach_candidates` on the relevant milestone —
  they become tournament variants. `ai_inferred`
- Whether art is a dependency of the reading experience or an enhancement to
  it. The current build's 29 placeholders are the evidence that this was never
  decided. `ai_inferred`

## 7. Scope

**In.** The reading-adventure loop end to end: a chapter is opened, read,
understood with support that withdraws, and accounted for; the grade-8
curriculum delivered against it; honest marking; one learner's progress across
chapters. Phone-first.

**Out — first class, and each for a reason.**

- **Commercial features** — accounts, payment, multi-tenant, content authoring
  for third parties. One learner. `operator_stated`
- **Grades other than 8.** The shape must not *assume* grade 8; it need not
  *deliver* anything else. `operator_stated`
- **Any Speaking scorer.** D7. `source_backed`
- **Any band number, dial, or predictor.** A2. `source_backed`
- **Porting the existing `app.js`/`app.css`.** Reference only. `operator_stated`
- **A native app.** Nothing observed requires leaving the browser. `ai_inferred`

## 8. Success metrics — candidates

Two tiers, and the distinction is load-bearing. A charter that promises to
measure the north star automatically would be lying.

**North star — observed, not computed.** The final milestone's honesty review
must carry this as a `deferred_to_boundary` surface: a headless gate cannot see
whether a child came back.

| id | measurable form | verification | evidence strength |
| --- | --- | --- | --- |
| `chapters_unprompted` | chapters the learner opens in a week without being asked | operator-observed, weekly | single user, n = 1 |
| `returns_unprompted` | days in a week the app is opened unprompted | operator-observed | single user, n = 1 |

**Guardrails and diagnostics — machine-measurable, and the gate's job.** A
milestone benchmark must emit `ATELIER_METRIC <id>=<number>` on stdout, a bare
number with the unit in the `metric_id`.

| id | measurable form | direction | why it is here |
| --- | --- | --- | --- |
| `sgk_targets_covered` | targets in `targets.json` satisfied | maximize → 328 | rule 1 of §4, made a gate rather than a hope |
| `ink_outside_frame_px` | drawn ink outside the panel, worst panel of a swept set | minimize → 0 | the defect the current gates cannot see |
| `balloon_face_overlap_px` | balloon ink over a face box, worst panel | minimize → 0 | ditto |
| `panel_layout_ms` | layout time per panel at 360 px | minimize | phone-first is a claim until measured |
| `panels_swept` | panels the harness actually rendered | coverage | a gate that renders nothing still reports 0 overlap |
| `band_tokens_emitted` | occurrences of a band number in built output | minimize → 0 | **A2** made mechanical |

`panels_swept` is a `slo.coverage_metric_id`, distinct from the primary — a
winner whose coverage is missing or ≤ `coverage_min` is not green.

## 9. Assumptions requiring conscious approval

Seed for the charter's anti-smuggling ledger. `approve-charter` **refuses**
until each `ai_inferred` id is listed in `--with-risks`, so these are surfaced
here deliberately rather than buried.

| id | text | provenance |
| --- | --- | --- |
| `a-story-spine` | Making the story the spine rather than the frame raises sustained use | `ai_inferred` |
| `a-selfstudy-transfer` | The extensive-reading effect survives unsupervised self-study at all | `ai_inferred` — contradicted by no evidence, supported by none; see the GAP in §6 |
| `a-ielts-precursor` | Grade-8 work built this way develops IELTS precursors | `ai_inferred` — the alignment bottoms out at band 4.0 = B1, with no band for the A2/A1 range where this learner sits |
| `a-n-of-1` | One learner's response generalises far enough to justify the build | `operator_stated` — accepted knowingly; commercial scale-up is out of scope |
| `a-art-dependency` | The reading experience needs finished art to be evaluated honestly | `ai_inferred` |

## 10. Kill criteria — candidates

- The learner stops opening it unprompted for two consecutive weeks, with the
  content available and no external cause.
- Coverage of `targets.json` cannot be held above the current 328/328 in the
  new shape — the rebuild would be shipping less than the book.
- The story spine cannot be made to carry curriculum without degenerating into
  a lesson with a story printed above it. That is the current build's failure
  mode, and repeating it means the rebuild bought nothing.
- Accountability cannot be built into a form this learner tolerates. Per §5
  that is not a missing feature; it is the difference between d = 0.51 and
  d = 0.01.

## 11. Milestone sketch — risk-first

Ordered by design risk, not by build order. Each needs a `title`, an integer
`id`, a `gate` (`build` | `smoke` | `interaction`), an `slo` tracing to a
charter metric, and a `tasks[]` ledger. The **final milestone must carry ≥1
`kind: interaction`** check, and the shared `.specs/prototype/story-english.checks.yaml`
must contain an interaction scenario **before any milestone can run at all**.

1. **The reading loop exists** — a chapter opens, is read, and is finished on a
   phone-width viewport. Interaction gate. Highest risk: everything else is
   decoration if this is not pleasant.
2. **Support that withdraws** — glossing where the reader actually stalls, once
   per item, and gone afterwards.
3. **Accountability the learner tolerates** — the d = 0.51 / d = 0.01 fork.
   Seed `approach_candidates` from prior art; this is the milestone that most
   wants a tournament.
4. **Curriculum binds to chapter** — `sgk_targets_covered` becomes a gate.
5. **Marking is honest** — Group C rules, on the new surface.
6. **It renders correctly, measurably** — `ink_outside_frame_px`,
   `balloon_face_overlap_px`, `panels_swept`. If any milestone is typed
   `decision_type: perf_bakeoff`, it must declare `gate.artifacts` covering the
   whole harness subtree.

## 12. Before the lane runs — housekeeping

Four things, each of which will otherwise cost an operator hour:

1. **`.atelier/rules/design-foundations.md` and `patterns.md` are still the
   shipped starter templates** — they say so in their own headers. They are
   injected into the extract/elevate prompts at `/promote`, so today they would
   feed *"empty dashboard → Create your first project button"* and *"no `any`,
   narrow `unknown`"* into a spec for a Vietnamese grade-8 reading app. Rewrite
   both before promote, not after.
2. **`checks.yaml` is canonical in the main tree** at
   `<main-worktree-root>/.specs/prototype/story-english.checks.yaml`. A copy
   created inside the prototype worktree is silently ignored. No ancestor of
   this repo is itself a git repo, so the resolution trap does not apply here.
3. **This repo path contains a space** — `/Users/liemnguyen/Per/English 8`.
   Quote every `cd` and every path passed to a harness.
4. **A second worktree already exists** (`english8-rollout` on
   `lesson-shape-rollout`). It is unrelated to the lane and should not be
   confused with `.worktrees/prototype-story-english/`.

**On deleting the current code.** The lane forks its worktree from `main`, so
the existing build arrives in it intact. Deleting it there is an ordinary
commit on `prototype/story-english`; `main` and the live site are untouched and
every commit in the worktree auto-snapshots to `refs/atelier/snapshots/`.

**What is code and what is not.** "Remove all current code" should mean
`tools/`, `docs/` and the generated site. It should **not** mean
`curriculum/sgk/` (the official book, recorded — 328/328 of it), `research/`
(~102,000 source-verified words with an evidential marker on every claim),
`data/dict/`, `data/cast.json`, or `art/`. Those are the assets the rebuild
exists to deliver better; regenerating them is years of work and would be an
unforced loss. `ai_inferred` — flagged for conscious acceptance.
