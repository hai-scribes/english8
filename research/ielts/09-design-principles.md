# Design Principles — The Build Constitution

**What this is.** Phase 6 of the IELTS knowledge base
(`research/ielts-research-plan.md`), and the last of the nine documents. It turns
everything established in `01`–`08` into **rules every future lesson, tool and
test in this repo must satisfy**, and it supplies the **audit checklist** (§1)
that any artefact can be checked against.

The checklist is the deliverable. Sections §2–§7 exist to justify it and to say
where the justification runs out. An auditor should be able to work from §1 alone.

**Research date.** 2026-08-08. Two evidence bases feed this file:

1. **The eight sibling documents** `01`–`08`. Nothing about the test, the
   descriptors, or the language foundation is re-derived here; it is cited.
2. **A Phase-6 pedagogy research run** — 133 candidate claims from 29 sources on
   learning science, writing feedback, washback, assessment design and progress
   measurement. 25 went to a 3-vote adversarial panel: **16 confirmed, 4 not
   sustained, 5 errored**. Where the digest was thin, the full texts in the
   research cache were mined directly; those quotes are marked **[S]**.

**Dependency.** Unusable without `01-exam-structure.md` (test facts and the eight
build constraints in its §12), `02-band-descriptors.md` (the descriptor
traceability rule and the eight build rules in its §10), `03`–`06` (per-skill
mechanics), `07-language-foundation.md` (what is trainable, and the CEFR
labelling rule in its §8.4), and `08-bridge-map.md` (the per-unit alignment and
its marker convention, which this file inherits).

**This file sits at the end of the citation chain.** It will be quoted as
authority by lessons and tools that never read the siblings. That makes it the
single easiest place in the repo for a hedged finding to harden into a fact.
§0.1 exists to stop that, and §0.2 is the rule that makes it enforceable.

---

## 0. Conventions

### 0.1 Markers — inherited from `08` §0.1, never upgraded

| Marker | Meaning | Origin |
| --- | --- | --- |
| **[V]** *n-n* | Passed a 3-vote adversarial panel — either the Phase-6 pedagogy panel that produced this file, or an upstream panel in `01` / `07`. Vote shown | this pass; `01`, `07` |
| **[C]** *n-n* | Confirmed by an upstream adversarial panel, vote shown | `03`–`06` |
| **[Q]** | Tier-1 verbatim — the quote *is* the claim | `01`, `03`–`06` |
| **[D]** | Band-descriptor wording quoted in `02` | `02` |
| **[S]** | Quoted verbatim from a primary document held in the research cache, **not** panel-verified | `01`, `07`; new here for the Phase-6 pedagogy corpus |
| **[S/NS]** | In the cache and quoted, **but** the corresponding panel claim was not sustained — well-evidenced but singly-sourced | `07` |
| **[T2]** | Tier-2 evidence — a research finding about tendencies, never a rule of the test | `03`–`07` |
| **[X]** | Tested and **not sustained**. Neither the claim nor its negation is asserted here | `03`–`06`; new here for the 4 Phase-6 refutations |
| **[?]** | Verification attempted and **errored** — unconfirmed. Usable only with this marker attached | `01`; new here for the 5 Phase-6 unverified claims |
| **[INF]** | **This document's own reasoning.** No source states the recommendation; the facts it rests on are cited and the inferential step is mine | new here |

`> **GAP**` blockquotes mark something the plan asked for that neither evidence
base supplies. Gaps are left visible and are never filled from memory.

**The marker schemes across the knowledge base are not uniform, and the
difference is substantive.** `03`/`04` use `[X]` to *withhold* a panel-failed
claim entirely. `07` uses `[S/NS]` to *use* one, quoted, where the primary source
is in the cache. Most of `07`'s grammar ladder and half its vocabulary ladder are
`[S/NS]`. `02` carries no per-claim tags at all — its brackets are descriptor
*version* labels, `[2023]` and `[2013]`. An audit rule that treats "verified" as
one thing across the nine files will over-rate `07`. Checklist item **G2**
handles this explicitly.

### 0.2 The rule that makes §1 enforceable

**Every recommendation in this document cites its evidence.** Where a
recommendation rests on reasoning rather than on a source, it carries **[INF]**
and says what it is reasoning from. Where the evidence is genuinely mixed, this
file says so and gives the **design-safe default** rather than a verdict.

Three prohibitions bind this document itself:

1. **Refuted claims (`[X]`) are not stated, and neither are their negations.**
   Four Phase-6 claims failed the panel; §8.2 logs them so they are not silently
   re-derived, without asserting either side.
2. **Unverified claims (`[?]`) may be used only with the marker attached.** Five
   Phase-6 claims errored in verification. They appear in §5.1 and nowhere else.
3. **No marker is ever upgraded.** A `[T2]` finding upstream is `[T2]` here.

### 0.3 One version string

`02` mandates a version string on every rubric line. When this file was written
`02` gave **two different literals** for it — `IELTS Writing Band Descriptors,
updated May 2023` (§1.3 rule 1) and `Writing Band Descriptors, updated May 2023`
(§10 rule 1) — and a checklist that greps for one would pass lines written to the
other. This section adjudicated in favour of the `IELTS`-prefixed forms.

**As of 2026-08-08 there is nothing left to adjudicate: `02` §10 rule 1 has been
corrected to print the prefixed literals, and `02` is now self-consistent.** This
section records the agreed strings rather than a ruling between them.

- Writing: `IELTS Writing Band Descriptors, updated May 2023`
- Speaking: `IELTS Speaking Band Descriptors, retrieved 2026-08-08`

The Speaking string is a *retrieval date*, not a version, because the Speaking
descriptor PDF carries no revision date at all (`02` §1.3 **GAP**) — that gap is
still open and the retrieval-date convention exists because of it.

---

## 1. The audit checklist

**How to use it.** No artefact is audited against all 66 items. **Group A**
(claims and labels) and **Group G** (citation hygiene) apply to everything. The
rest apply by artefact type: **B** lessons, **C** auto-marked practice,
**D** rubrics and feedback tools, **E** anything that reports progress,
**F** vocabulary tooling.

Each item names what failure looks like, because an item a bad lesson can pass is
not an audit item.

### The fast gate — seven checks that fail most bad artefacts

Run these first. They are a subset of the full list, repeated here because they
catch the most common failures.

| | Check | Traces to |
| --- | --- | --- |
| 1 | Does it print an IELTS band number anywhere? → **fail** (A2) | `02` §10.2; `03` §9; `04` §11; `07` §8.1, §8.3 |
| 2 | Is it labelled with a CEFR level rather than a band? (A1) | `07` §8.4 |
| 3 | Does every rubric line quote a descriptor phrase and carry the version string? (D1, D2) | `02` §10.1, §1.3 |
| 4 | Does every writing exercise name the criterion it trains? (B1) | `02` §10.1; `05` §1 |
| 5 | Does it promise something the format cannot support — "Task 2 practice" on an 80–100-word paragraph, "get to band 7"? (B2, A2) | `05` §1; `08` §2.5 |
| 6 | Does it teach templates, model sentences, or memorised openers? → **fail** (B3) | `02` §10.3, §7 items 1–4, 21 |
| 7 | Does every claim carry the marker it had upstream, unchanged? (G2) | `08` §0.1 |

### Group A — Claims and labels *(applies to everything)*

| # | Check | Fails if | Traces to |
| --- | --- | --- | --- |
| **A1** | The artefact's level label is a **CEFR level**, sourced to a Companion Volume descriptor for the named scale | It says "IELTS band 4.5 lesson", "band 5 vocabulary", or any IELTS band as a level label | `07` §8.4; `08` §0.3 |
| **A2** | **No band number is output as a score, prediction, or promise.** A band number may appear only to locate a feature on the descriptor grid, and must be phrased that way | "Estimated band: 6.5"; "this lesson takes you to band 6"; a progress dial reading 5.5 | `02` §10.2; `03` §9; `04` §11; `07` §8.1, §8.3 |
| **A3** | **No half-band is used as a descriptor target.** No half-band descriptors exist; any half-band level is unpublished interpolation | A rubric column headed "Band 6.5"; a "band 7.5 checklist" | `02` §9 |
| **A4** | Any raw-score display shows only the four published benchmark rows and carries the "average, varies by test version" wording | A 0–40 → band lookup table presented as exact conversion | `01` §7.3, §12.4 |
| **A5** | Where the two circulating Writing descriptor documents disagree, the version used is named | A rubric quoting descriptor wording with no version attached | `02` §1.1–1.3 |
| **A6** | Bullet-style descriptor wording is treated as a **[2013]** tell and re-checked before use | Quoting "uses a wide range of vocabulary fluently and flexibly" as current | `02` §1.3 rule 2 |
| **A7** | **No rubric line cites the British Council descriptor mirror URL.** That host returned `Access Denied` and its version is unknown | `takeielts.britishcouncil.org/.../ielts_writing_band_descriptors.pdf` in a source line | `02` §1.3 **GAP** |
| **A8** | Speaking's four criteria are **reported separately, never averaged** into one figure | A Speaking self-review that produces one overall number | `01` §7.4, §12.3 |
| **A9** | Where a criterion has no published wording at a band, the artefact says so and does not invent it | An invented "band 7 pronunciation checklist" | `02` §5.1 **GAP** |
| **A10** | Nothing is asserted that is recorded upstream as a **GAP** or **[X]** — **and neither is its negation** | Asserting a Task 2 archetype taxonomy, a Listening distractor rule, a plural trap, or "band 9 readers do X" | `05` §3.2; `03` §5, §9; `04` §4.5, §8.4 |

### Group B — Lessons and exercises

| # | Check | Fails if | Traces to |
| --- | --- | --- | --- |
| **B1** | **Every writing exercise names the criterion it trains** — Task Response / Task Achievement, Coherence & Cohesion, Lexical Resource, or Grammatical Range & Accuracy — and the descriptor phrase behind it | "IELTS writing practice", with no criterion named | `02` §10.1; `05` §1 |
| **B2** | The genre label matches what the format can carry. The 80–100-word paragraph is a **Task 2 body paragraph**, not a Task 2 essay | Labelling an 80–100w paragraph "Task 2 practice" | `05` §1; `08` §2.5 |
| **B3** | **No templates, memorised phrases, model openers, or "useful sentences".** Memorised language is the explicitly penalised category, not a shortcut | A "linking phrases to memorise" box; a fill-in essay skeleton | `02` §10.3, §7 items 1–4, 21 |
| **B4** | Any technique taught for Speaking cashes out in one of the four Speaking scales | A "Part 3 idea bank"; teaching content quality as if it were scored | `06` §1 |
| **B5** | Notice-writing and instruction-writing are **not** claimed to train GT Writing Task 1 | "Unit 7's notice trains IELTS Task 1" | `01` §11.3, §12.8; `08` §1 |
| **B6** | Grammar lessons train **flexibility**, not subordination density. Complex sentences are taught to clear the band-5 threshold, and stop there | "Write more complex sentences to raise your band" | `07` §4.2, §8.2; `08` §2.2 |
| **B7** | **Vietnamese-specific pronunciation guidance ships only within `07` §8.3's three permitted targets** — coda obstruents incl. final /s~z/ (VN-1), onset-cluster **voicing/aspiration** (VN-2, U6–U7), deaccenting and question tunes (VN-3, U11–U12) — each labelled **[S]**: singly-sourced, panel-unverified, N = 16–36. VN-4's four prohibitions are absolute: **no** Vietnamese-specific vowel guidance (U1–U4), **no** North/South region-specific guidance, **no** justification of word-stress teaching by Vietnamese tone transfer (contested — Brunelle 2017), **no** error prediction by contrasting the two sound inventories | A "Vietnamese vowel difficulties" lesson for U1–U4; a Northern-vs-Southern lesson split; "Vietnamese is a tone language, so teach word stress"; presenting the U8 `-s` drill as covering the pronunciation cause too, when `07` §5.5.2 shows the two causes are additive and need two interventions; presenting any of it as panel-verified | `07` §5.5, §8.3; `08` §5.4 |
| **B8** | Each unit's topic lexis is pre-taught **before** that unit's reading and listening, as a first-class step | Topic vocabulary presented after or alongside the text | `07` §2.2; `08` §4.5 |
| **B9** | Any extensive-reading provision **limits text choice to the learner's level** and includes an accountability step (log, quiz, or report) | A free-choice reading library with no level constraint and no accountability | §2.2 below; Sangers et al. 2025 **[V 3-0]** |
| **B10** | No lesson claims a named listening strategy raises a score | "Listen for signposting to get more answers right" | `03` §6.5 **GAP** |
| **B11** | Yes/No/Not Given is not taught as logically harder than True/False/Not Given | "YNNG needs a different reasoning process" | `04` §4.1 |
| **B12** | Distractor annotation is used for **Reading only**, and only via the four official Not-Given generators plus documented item-writer practice. Listening distractor design is not asserted | A Listening transcript annotated "the recording always states the wrong answer first" | `04` §4.4–4.5; `03` §5.2 **GAP** |

### Group C — Auto-marked practice (Listening and Reading)

| # | Check | Fails if | Traces to |
| --- | --- | --- | --- |
| **C1** | The answer key implements the **official key grammar**: `( )` optional token, `/` alternates, "in either order" pairs. Not bare exact-string matching | `answer === "library"` rejecting "the public library" | `03` §3.2; `01` §8 |
| **C2** | Both UK and US spellings are accepted | "colour" marked wrong | `01` §8; `03` §4 |
| **C3** | Two answers written in one gap score **zero**, not partial credit | Awarding the mark because one of two answers was right | `01` §8; `03` §4 |
| **C4** | The word limit is **per task**, printed on the task, and enforced as a hard fail | A repo-wide "3 words" constant; an over-limit answer scored correct | `03` §4; `04` §5 |
| **C5** | Spelling and grammar errors cost the mark, and the artefact says so before the exercise | Silent leniency on spelling in a Listening gap-fill | `01` §8; `03` §4 |
| **C6** | The Listening tool **declares its delivery mode and enforces that timing**. Computer-delivered — the default from mid-2026 — means answers typed *during* the audio and a **2-minute review**, not a 10-minute transfer | A listening trainer granting 10 minutes at the end | `01` §9.1, §12.1; `03` §4.2 |
| **C7** | The Reading tool runs **one clock covering everything**, including writing answers | A reading trainer that pauses the clock while the learner types | `04` §1.1 |
| **C8** | The Listening tool reproduces the unwritten spoken orientation, the pre-question preview window, single play, and Part 4's block preview with an unannounced mid-part pause | Printing the scene-setter on screen; allowing replay | `03` §1.1 |
| **C9** | Screen affordances match the real test: Reading offers colour highlighting and on-screen notes, a 40-question navigation bar and a review flag; Writing shows a live word count | Inert HTML passage with no highlight tool | `01` §9.1, §12.7 |
| **C10** | Every listening item carries a **confidence rating**, and the learner is shown their calibration alongside their score | A score-only report | `03` §6.6; §4.4 below |

### Group D — Rubrics, feedback, and any LLM-based tool

| # | Check | Fails if | Traces to |
| --- | --- | --- | --- |
| **D1** | **Every rubric line traces to a quoted descriptor phrase.** Nothing downstream may assert a band claim not traceable to a phrase in `02` | A rubric line written from teaching experience | `02` preamble, §10.1 |
| **D2** | Every rubric line carries the version string decided in §0.3 | An unversioned rubric line | `02` §10.1; §0.3 above |
| **D3** | Output is a **criterion-level observation**, never a number — "complex structures are less accurate than your simple ones; that is the band-6 signature" | "Your GRA is about 6.5" | `02` §10.2 |
| **D4** | Error feedback reports **density and communicative effect**, not raw counts | "You made 7 spelling errors" as the LR verdict | `02` §2.1, §10.4 |
| **D5** | A Speaking review tool does not flag all pauses. At the top of the scale the criterion is *what the pause is for*, which the tool cannot see | A "hesitation count" presented as a fluency score | `02` §4.1 |
| **D6** | Dimensions that IELTS does **not** score — notably interactional competence — are recorded as unscored rather than quietly scored | A rubric row for "answers questions well" with no note that it is unscored | `06` §7 |
| **D7** | **No Speaking rubric or Speaking feedback tool ships before `06`'s second research pass.** Only two Speaking claims survived verification; fluency indicators, pronunciation ordering and lexical-resource mechanisms are all `[X]` | Shipping a four-criterion Speaking scorer today | `06` preamble, §7; `02` §9 |
| **D8** | Pronunciation is never scored as a band, and materials state that Pronunciation claims are the least reliable of the four | A pronunciation band estimate from acoustic features | `07` §8.3; `02` §5.2 |
| **D9** | Any automated or LLM-produced judgement is confined to the **defensible set** in §5.3 — obligatory-context accuracy on named structures, error-free sentence density, presence/absence of named discourse moves, paraphrase identification, and explanation of a descriptor phrase against the learner's own sentence | An LLM asked for a holistic band, or for a "flexibility" score | §5.4 below |
| **D10** | Any automated scorer reports its **disagreement rate with human judgement**, or reports nothing scored at all | Publishing a score with no reliability figure | Powers et al. 2001 **[S]**; §5.2 below |
| **D11** | The tool is **adversarially tested before shipping**: one paragraph repeated many times, a thesaurus-inflated essay with no argument, a cue-word template with no reasoning. It must not reward any of them | Shipping without running the repetition attack | Powers et al. 2001 **[S]**; **[INF]** |
| **D12** | If internal Writing arithmetic is used at all, it is `(T1 + 2·T2) / 3`, and it is **not surfaced** as a band | Averaging Task 1 and Task 2 equally; or displaying the result | `01` §5.1, §12.2 |

### Group E — Progress reporting

| # | Check | Fails if | Traces to |
| --- | --- | --- | --- |
| **E1** | Progress indicators are **criterion-referenced and countable in obligatory contexts** — "third-person `-s` supplied in 8 of 10 obligatory contexts" | "Your grammar improved 12%" | `07` §8.2 |
| **E2** | **No syntactic-complexity index is used as a progress metric.** Complexity measures peak at band 7 and fall at band 8 | Tracking clauses-per-T-unit as a growth curve | `07` §4.2, §8.2 |
| **E3** | A **rising error rate alongside rising range is not reported as regression.** At the A2→B1 transition this is the expected signature of progress | "Your accuracy got worse this month" | `07` §4.4; `08` §6.3 item 1 |
| **E4** | Vocabulary progress is reported as **coverage**, with the curve visible, never as a predicted band | "Your vocabulary is band 6" | `07` §8.1 |
| **E5** | Retention is measured on a **delayed** check, not in the same session. Short intervals match long ones on immediate tests and lose on delayed ones | A "mastered" badge awarded at end of session | §2.1 below **[V 3-0]** |
| **E6** | Gains on our own practice tests are **never presented as proficiency gains** without an independent measure of the same ability | "Your score rose, so your English improved" | §3.3 below; Green 2007 / Field 2023 **[S]** |
| **E7** | **No hours-to-band promise of any kind** | "200 hours = one band"; "8 weeks to band 6" | §3.2 below **[S]** |
| **E8** | Self-assessment output is treated as a **learner-facing prompt, never as a measure**, and is paired with an objective anchor | A dashboard driven by the learner's own rating | §4.4 below **[S]** |
| **E9** | A single retest is not reported as improvement. Regression to the mean is named where before/after figures are shown | A one-shot "you improved by 0.5" | Green 2007 **[S]**; **[INF]** |

### Group F — Vocabulary trainer and review scheduling

| # | Check | Fails if | Traces to |
| --- | --- | --- | --- |
| **F1** | **No ranking function optimising rarity, and none optimising collocation accuracy.** Store frequency band, collocation membership and CEFR tag as independent attributes; keep the selection policy swappable | An "advanced words first" mode | `07` §3, §8.1 |
| **F2** | AWL / AVL membership is a **tag on an item**, never a stage gate | A "finish general, then start academic" pipeline | `07` §8.1 |
| **F3** | Every item has an **audio form**, not just print | A print-only flashcard deck | `07` §8.1 **[S/NS]** |
| **F4** | Review scheduling may use **fixed/uniform intervals**. Nothing may claim expanding intervals are superior — two independent meta-analyses find them equivalent | Marketing copy about an "optimised forgetting curve"; a difficulty-modulated interval algorithm justified by evidence | §2.1 below **[V 3-0]** ×2 |
| **F5** | Where intervals are chosen, they err **long** rather than short, and the scheduler is evaluated against delayed retention | Tuning intervals against next-day recall | §2.1 below **[V 3-0]** |
| **F6** | **No "98% coverage of IELTS Listening" figure is displayed.** 3,000 BNC/COCA families for 95% coverage is the only defensible Listening number | Any 98% listening claim | `07` §2.1 **GAP** |
| **F7** | Items are taught **inside collocations**, which is the one thing both sides of the open rarity/formulaicity question support | Bare word–gloss pairs | `07` §8.1; `08` §6.3 item 4 |

### Group G — Citation hygiene *(applies to everything)*

| # | Check | Fails if | Traces to |
| --- | --- | --- | --- |
| **G1** | Every factual claim resolves to a numbered section of `01`–`08`, or to a row in this file's `## Sources` | A claim with no citation path | plan, source policy |
| **G2** | **Markers are inherited, never upgraded** — and `07`'s **[S/NS]** is *not* the same strength as a **[V]** or **[C]**. Anything resting on `[S/NS]`, `[T2]`, `[S]` or `[?]` says so at the point of use | Quoting Banerjee's complexity finding as established fact | `08` §0.1; §0.1 above |
| **G3** | **[?]** claims — the five Phase-6 verification errors — appear only with the marker attached | Citing the `g = 0.59` WCF figure bare | §0.2 above; §5.1 below |
| **G4** | Tier-3 prep-industry material is never a warrant. It may be the *object* of a claim, never its support | "Most IELTS teachers recommend…" as evidence | plan, source policy; `05`, `03`, `04` preambles |
| **G5** | Cross-references are verified against the section they name, not assumed. Four were found broken in this knowledge base and **all four are now fixed at source** — `07` §1 (said §4, meant §3), `03` §1 (said `04` §6, meant `04` §4.3), and this file's own **D9** (said §5.4, meant §5.3) and **C10**/**E8** (said §5.3, meant §4.4). Do not reintroduce them, and re-check any pointer copied out of an older draft | A citation whose target section does not contain the claim | §8.3 below |
| **G6** | A claim that failed verification is treated as **unproven, not disproven**. Its negation is not asserted either | "Spacing has been shown not to beat massing" | `07` preamble; §0.2 above |

**Count: 66 items** — A 10, B 12, C 10, D 12, E 9, F 7, G 6 — plus a seven-item
fast gate drawn from them.

---

## 2. Evidence review — what works

Everything below is Tier 2. It describes tendencies in learners, not rules of
the test, and it may never be quoted as a scoring rule.

### 2.0 Summary table

| Intervention | Effect | Sample | Replication | Marker |
| --- | --- | --- | --- | --- |
| Spaced practice, L2 learning | "medium-to-large" | 98 effect sizes, 48 experiments, N = 3,411 | Well replicated (two literatures) | **[V 3-0]** |
| **Expanding** vs uniform intervals | **g = 0.034** (SE 0.0626), n.s. | 54 effect sizes | **Well replicated** — two independent meta-analyses agree | **[V 3-0]** ×2 |
| Short vs long intervals | Equal on immediate tests, **short is worse on delayed** | same L2 meta | Single meta | **[V 3-0]** |
| Extensive reading, group contrasts | **d = 0.46** | Nakanishi 2015 meta | Well replicated — 6 metas, all positive | **[V 3-0]** |
| Extensive reading, all comparisons | **d = 0.41** (SE 0.07); 0.38 excluding follow-ups | 73 studies, 82 interventions, 86 comparisons | as above | **[V 3-0]** |
| ER moderator: level-limited text choice | d = 0.73 vs 0.22 | k = 25 vs 57 | Single meta | **[V 3-0]** / **[S]** |
| ER moderator: accountability | d = 0.51 vs 0.01 (n.s.) | k = 59 vs 23 | Single meta | **[V 3-0]** / **[S]** |
| Technology-assisted L2 vocabulary | **d = 0.64** | 34 studies, N = 2,511, 49 effect sizes | Single meta | **[V 3-0]** |
| Written corrective feedback | "greater grammatical accuracy" | 21 primary studies | **Well replicated** — 3 metas | **[V 2-0]** |
| WCF durability | "robust evidence of the durability of moderate effectiveness over time" | 52 control-group studies (Bayesian) | as above | **[V 2-0]** |
| Task repetition, oral production | "substantial impact on syntactic complexity and accuracy" | 2025 meta in *System* | Single meta | **[V 3-0]** |
| Shadowing | **No pooled effect size exists** | 44 studies, only 15 with a control group | Narrative synthesis only | **[S]** |
| Pronunciation instruction (background) | d = 0.89 within / 0.80 between | 86 quasi-experimental studies | Single meta, cited secondhand | **[S]** |
| Self-regulated learning interventions | g = 0.72 overall; achievement 1.32–1.39 | 16 studies, N = 1,780 | Single meta; **abstract and results disagree**; publication bias detected | **[S]** |

### 2.1 Spaced retrieval — and the finding that should change how we build

**Spacing works.** A meta-analysis of L2 learning "retrieved 98 effect sizes from
48 experiments (N = 3,411)" and found "spacing had a medium-to-large effect on
second language learning" **[V 3-0]**.

> One honest limit, recorded in the claim itself: the numeric point estimate and
> confidence interval sit behind the publisher's paywall. Only the verbal
> magnitude was retrievable. **Do not cite a specific *d* for L2 spacing** until
> the full text is obtained.

**Expanding intervals are not better than uniform ones.** This is the finding
that contradicts how nearly every spaced-repetition tool on the market is built,
and it is **well replicated** — two independent meta-analyses, in two different
literatures, reach it separately:

- Latimier, Peyre & Ramus (2021), retrieval-practice literature, 29 studies:
  "Results from subset 2 indicated no significant difference between expanding
  and uniform spacing schedules of retrieval practice (**g = 0.034**)" across 54
  effect sizes **[V 3-0]**. The authors state the design consequence explicitly:
  the findings "support the advantage of spacing out the retrieval practice
  episodes on the same content, but do not support the widely held belief that
  inter-retrieval intervals should be progressively increased until a retention
  test" **[V 3-0]**.
- The L2 meta-analysis, independently: "equal and expanding spacing were
  statistically equivalent" **[V 3-0]**.

**What this changes for us.** A vocabulary trainer does **not** need a
per-item, difficulty-modulated interval algorithm to be defensible. A **fixed
review ladder** — the same day offsets for every item — is supported by the
evidence and is an order of magnitude cheaper to build, test, and explain to a
learner. Building an Anki-style expanding scheduler is not *wrong*; claiming it
is *better* is. Checklist **F4**.

**Interval length still matters, in one direction.** "Shorter spacing was as
effective as longer spacing in immediate posttests but was less effective in
delayed posttests than longer spacing" **[V 3-0]**. Two consequences: err long
(**F5**), and never evaluate a scheduler against same-session recall (**E5**).

> **GAP** — not established in this research pass: **any absolute interval
> value.** The evidence says *spaced beats massed* and *long beats short on
> delayed tests*; it does not say "review at 1, 3, 7, 21 days". Any specific
> schedule we ship is an engineering choice, not an evidence-backed one, and
> must be labelled as such.

### 2.2 Extensive reading — the strongest content-side evidence we have

Extensive reading is the best-replicated intervention in this corpus. Six
meta-analyses since 2011, all positive — Krashen 2011, Kim 2012, Nakanishi 2015,
Jeon & Day 2016, Liu & Zhang 2018, Sangers et al. 2025, the first five summarised
inside the sixth **[S]**. The two most recent:

- Nakanishi (2015), *TESOL Quarterly*: "a medium effect size (**d = 0.46**) for
  group contrasts … for students who received extensive reading instruction
  compared to those who did not" **[V 3-0]**, concluding that "extensive reading
  improves students' reading proficiency and should be a part of language
  learning curricula" **[V 3-0]**.
- Sangers et al. (2025), *Educational Psychology Review*, 73 studies / 82
  interventions / 86 comparisons: "a small, significant positive effect
  (**Cohen's d = 0.41**; SE = 0.07)", and 0.38 excluding follow-up measurements
  **[V 3-0]**. Gains appear "across all included language domains (reading
  comprehension, vocabulary, decoding/fluency, motivation, writing, oral
  proficiency, general language proficiency) … with effect sizes ranging from
  small to medium" **[V 3-0]** — i.e. reading is not only a reading intervention.

**The two moderators are product features, and this is the most actionable
finding in the whole pedagogy pass.** "Variability in effect sizes was affected
by two intervention characteristics: when learners' text choice was limited and
when some form of accountability was included, effects were larger than when
these elements were absent" **[V 3-0]**. The magnitudes **[S]**: level-limited
text choice d = 0.73 (k = 25) versus d = 0.22 (k = 57); accountability d = 0.51
(k = 59) versus **d = 0.01, non-significant** (k = 23).

Free, unaccountable reading has an effect indistinguishable from zero in this
data. Constrained, logged reading has a medium effect. Checklist **B9**.

**Three limits that must travel with these numbers [S]:**

- **Duration was not a moderator** — "the continuous variable that indicated the
  duration of the interventions in weeks was not found to be significant
  (β = −0.002, SE = 0.004, p = .669)". A longer programme is not automatically a
  better one.
- **Reading volume was not analysed at all**, because 45 of 73 studies did not
  report implementation fidelity. Nobody knows how much reading is enough.
- **Retention is barely tested** — "only three studies … included tests of
  retention effects." And 95% of studies were foreign-language classroom
  contexts, 60% in Asia.

> **GAP** — not established in this research pass: **how much of the extensive-
> reading effect survives in unsupervised self-study.** Almost the entire
> evidence base is classroom-mediated. The accountability moderator suggests
> self-study is the *harder* case, not the easier one, which is an argument for
> building the log rather than an argument that it will work without one.

### 2.3 Vocabulary tooling

"The overall effect size for using technology to learn L2 vocabulary was
**d = 0.64**, which is a moderate effect size", from 34 studies, 2,511
participants and 49 effect sizes, after Hunter & Schmidt corrections **[V 3-0]**.

Read this narrowly. It is a defensible upper-bound expectation for *digital
vocabulary tooling as a category*. It is **not** evidence for spaced repetition
specifically, and it is not a promise about our trainer.

The incidental-versus-intentional question — whether words learned from exposure
beat words learned from deliberate study — was tested this pass and **not
sustained** **[X]**. This document asserts neither side. The design-safe default
is to do both and not claim a ranking: extensive reading (§2.2) and deliberate
study (this section) each have independent positive evidence, and nothing here
licenses trading one against the other.

### 2.4 Task repetition and shadowing — and a collision with `07`

**Task repetition.** A 2025 meta-analysis in *System* "reveal[s] that TR has a
substantial impact on syntactic complexity and accuracy, with learners producing
more complex and less erroneous utterances" **[V 3-0]**. Its effects are
"moderated by implementation variables — such as … task type, task repetition
type, spacing interval, and repetition frequency — as well as learner-related
factors, notably L2 proficiency" **[V 2-1]**, so the parameters of a repetition
drill are load-bearing, not incidental.

**And here is the collision.** The single best-evidenced outcome of task
repetition is *syntactic complexity* — which `07` §4.2 establishes, flatly, does
not predict IELTS band: complexity measures peak at band 7 and **fall** at band 8
(Banerjee et al., 275 scripts, **[S/NS]**), and Kang et al. found grammatical
complexity a *negative* predictor of Speaking score **[S]**.

**Resolution, and it is a build rule.** Use task repetition for its **accuracy**
effect, which does track the scale via target-like use on named structures
(`07` §4.3), and **never report the complexity gain as progress** (**E2**). A
speaking drill that repeats a task is defensible; a dashboard showing
clauses-per-utterance rising is not. **[INF]** — the two findings are separately
sourced; the reconciliation is this document's reasoning.

**Shadowing.** The evidence is thinner than its popularity suggests. The one
systematic review in the corpus (Whitworth 2024, University of Oxford MSc
dissertation, 44 studies 2008–2023) is a **narrative synthesis with no pooled
effect size**, and only 15 of 44 studies had a control or comparison group
**[S]**. Its verdict: shadowing "can help improve learners' comprehensibility,
intelligibility, and accentedness, as well as certain aspects of suprasegmental
pronunciation control, such as fluency and prosody", while "research into the
impact of shadowing on segmental pronunciation control was, however,
inconclusive" **[S]**. Only two of the 44 studies were judged methodologically
strong; the stronger of the two (16 learners, no control group) found
improvement in comprehensibility and fluency but not accentedness **[S]**.

> **GAP** — not established in this research pass: **an effect size for
> shadowing.** There is no pooled estimate to cite, and two thirds of the
> literature is uncontrolled. Shadowing may be offered as a practice activity;
> it may not be presented as an evidence-backed intervention with a known
> magnitude.

Note the direction the review does support — suprasegmentals and prosody, not
segments — agrees with `07` §5.2's discriminant loadings (chunking .745,
intonation .735 > segmentals .551). Two independent literatures pointing the same
way is worth more than either alone.

### 2.5 Written corrective feedback

The Truscott–Ferris question — does correcting grammar in L2 writing do anything
— is settled enough to build on, by three meta-analyses:

- 21 primary studies: "written corrective feedback can lead to greater
  grammatical accuracy in second language writing" **[V 2-0]**.
- A Bayesian meta-analysis of 52 control-group studies: "robust evidence of the
  durability of moderate effectiveness of WCF over time" **[V 2-0]** — the gain
  persists past the immediate posttest.

**But the effect is not portable.** "Its efficacy is mediated by a host of
variables, including learners' proficiency, the setting, and the genre of the
writing task" **[V 2-0]**. There is no single "WCF works" effect size to apply to
a Vietnamese grade-8 self-study context, and none of these meta-analyses studied
one.

> Truscott's own position could not be read directly: the source page in the
> cache is a bot-challenge stub. Everything above characterises his argument
> through the meta-analyses that answer it. Recorded so that the asymmetry is
> visible.

The five claims about *which type* of feedback to give — direct versus indirect
versus metalinguistic, focused versus unfocused — all errored in verification.
They appear in §5.1 with the **[?]** marker and nowhere else.

---

## 3. Washback — testing the plan's own framing

The plan states a design principle up front: **"descriptors first, question
formats second."** It is asserted, not argued. This section tests it.

### 3.1 The verdict

**Supported, with one amendment.** The evidence does not merely permit
descriptors-first; it makes format-first look actively counterproductive. But
format familiarisation is cheap, bounded, and removes a construct-irrelevant
penalty, so it stays in the syllabus as a one-off — not as the curriculum.

All evidence in this section is **[S]** — retrieved verbatim from full texts in
the research cache during this pass, not put through the verification panel.

### 3.2 What IELTS preparation actually produces

The anchor study is Green (2007), *IELTS Washback in Context*, Studies in
Language Testing 25 — 663 volunteers across 18 courses at 15 institutions, of
whom **476 completed both an entry and an exit IELTS Academic Writing test**.

**Score gains are small.** Mean Writing gain **0.21 bands** (SD 0.59) over a mean
5.5 weeks / 130 hours. "Just three of the 476 learners gain[ed] by two bands or
more and only 39 (8.2%) gain[ed] by one band or more", while "as many as 31% of
students had lower scores on the second test" **[S]**.

**The published hours-to-band guideline does not hold.** "Taken as a whole, the
score gains fell well short of the figure previously suggested by the IELTS
partners of a half band for each month (100 hours) of study" **[S]**. Even at
200–250 hours, "41.5% made no substantial improvement on their Initial Writing
score" **[S]**. The same pattern appears in Cambridge ESOL's own data on
**15,343 repeat candidates**: those at band 6+ were "as a group, unlikely to
improve their IELTS Writing performance" **[S]**.

**Starting level dominates everything.** "The most accurate predictions of
Writing score gain were provided not by Course Length, but by Initial Writing
score. This feature alone accounted for approximately 25% of the variance …
Course Length in Weeks, in contrast, accounted for just under 8%" **[S]**. Green
names regression to the mean as part of the explanation, and says so plainly.

Kang et al. (2021), *IELTS Research Reports* 2021/1, replicates the shape in an
EFL setting: 52 learners, 12 weeks, **mean 284 hours** of study, overall gain
**0.298 bands** (d = .36); writing gained most (0.462, d = .69), **speaking did
not gain significantly at all** (0.125, p = .185); hours of study explained 17%
of gain variance, initial proficiency 22.5% and negatively **[S]**.

**Checklist consequence: E7.** No artefact in this repo may promise a band per
unit of study time. The best-sourced answer to "how long to gain a band" is that
the question is mis-framed — the answer depends more on where the learner starts
than on how long they study.

### 3.3 Does prep raise scores without raising proficiency?

Green is unusually well designed for this question because he ran **independent
grammar and vocabulary tests** alongside the writing test. Two findings:

**IELTS-preparation courses gave no score advantage.** "There is little support
here for the belief … that courses directed towards the IELTS test are more
effective than broader-based EAP pre-sessional courses in boosting IELTS Writing
scores" — "no significant differences between Course Types in terms of Writing
score gains" **[S]**. The only course in the study to average over one band of
gain was a **pre-sessional EAP course, not an IELTS preparation course** **[S]**.

**And prep courses produced the *least* linguistic gain.** "When covariates were
taken into account, **IELTS preparation students were seen to make the least gain
in their grammar and vocabulary composite scores**" **[S]** — despite their
teachers reporting *more* attention to grammar and vocabulary than EAP teachers.
Green's reading: "the narrow focus of the IELTS courses limited learning of
grammar and vocabulary to items their teachers considered of relevance to the
test" **[S]**.

**Memorised formulae are not rewarded.** "The highest gains were achieved by
those espousing a Meaning-Based Approach. This weighs against the contention that
improved IELTS responses might be constructed from an assemblage of memorised
formulae. Rather the IELTS Writing test appears to reward a more analytic and
exploratory approach to learning" **[S]**.

That is independent corroboration, from a completely different method, of `02`
§10 rule 3 and checklist item **B3**. `02` gets there from the descriptors (a
memorised answer is band 0; memorised phrases cap Lexical Resource at 4); Green
gets there from 476 learners' outcomes.

**The measurement warning that follows.** Green quotes Madaus: "A rise in scores
may reflect increasing test-wiseness rather than improving skills, but this will
be masked if test scores are used as the index of improvement … More robust
designs will include the use of at least one alternative measure of the focal
construct" **[S]**. Field (2023) restates it independently for Listening: "any
increase in scores (particularly in listening) may simply reflect the acquisition
of test-wise strategies irrelevant to real-world performance" **[S]**.

**Checklist consequence: E6.** Our own practice-test scores are not evidence of
proficiency gain. If we want to claim learning, we need a second measure of the
same ability.

### 3.4 The amendment — format familiarity is not nothing

The washback literature's own framework explains why format still has to be
taught once. Green, following Messick: **construct-irrelevant variance** arises
where "unfamiliar formats … cause confusion for some test takers (resulting in
invalidly low scores)" **[S]**. Unfamiliarity is a penalty unrelated to English
ability, and removing it is a legitimate, bounded job.

Field reports Winke and Lim's conclusion that the best function of test
preparation "is perhaps familiarization with test format and the test's item
types, especially items that are relatively new or unknown to the test takers"
**[S]**. And Field reports a Vietnamese-context study — Nguyen (2007), 95
participants — finding "a strong effect of instruction upon learners' ability to
perform well in the IELTS Listening module", attributed to IELTS's "wider range
and complexity of test formats" **[S]**. IELTS has more formats to be unfamiliar
with than a single-format test, which makes familiarisation *more* worth doing,
and no more of a proficiency gain than before.

Field's own line on how to keep the two apart, which is the operational form of
"descriptors first, formats second": compensatory strategies "should be clearly
distinguished from test-wise techniques which exploit loopholes in test method
and item information" **[S]**.

**The rule this yields.** Format familiarisation is a **one-off orientation**
per question type — what it looks like, what the instruction line says, what the
answer key accepts — and is never the curriculum. Everything recurring is
descriptor work. **[INF]**, reasoning from the three sources above.

### 3.5 Where the washback evidence is mixed — say so

**Which skill gains fastest is unresolved.** Elder & O'Loughlin (N = 112, via
Field): Listening gained most (mean 0.781), Reading least (0.402) **[S]**. Kang
et al. (N = 52): Writing gained most (0.462), Speaking not significantly at all
**[S]** — and Kang attributes this to how learners *allocated study time*, not to
skill difficulty. Allen (2016, via Field) reports the reverse ordering again,
with Field noting a probable ceiling effect **[S]**.

**Design-safe default:** do not sequence or budget the course on any claim about
which skill improves fastest. Kang's time-allocation explanation is the one
finding with a mechanism attached, and it points at *effort distribution*, which
is a product decision rather than a linguistic fact.

**A caveat that must travel with all of §3.** Green's own inter-rater
correlations were 0.70–0.81 against the 0.85 Cambridge reports for operational
IELTS Writing, and he had to introduce half-band ratings because "it is
impossible to register small gains using the official IELTS band scores for
Writing as these only allow raters to express scores in whole numbers" **[S]**.
The numbers in §3.2 are the best available and are not precise.

> **GAP** — not established in this research pass: **any IELTS washback study
> conducted in Vietnam.** Nguyen (2007) exists in this corpus only as a
> paragraph inside Field's review; the primary text was not retrieved. Every
> washback number in §3 comes from UK, Australian, New Zealand or Korean
> contexts.

---

## 4. Assessment design for self-study

### 4.1 What makes a band-aligned rubric learner-usable

`02` sets the traceability rule — "nothing downstream may assert a band claim
that is not traceable to a phrase quoted here" — and `02` §10 sets the output
rule: criterion-level observations, never a number. Those are checklist items
**D1** and **D3**. Three further constraints make a rubric usable rather than
merely correct:

1. **One criterion at a time.** A rubric that asks a learner to judge four
   criteria simultaneously is asking for a holistic judgement in disguise.
2. **Observable, not evaluative.** "Did you write an overview sentence?" is
   checkable by a 14-year-old. "Is your overview clear?" is not.
3. **Version-stamped** (§0.3, **D2**), because two official Writing descriptor
   documents are in circulation with materially different wording, and a rubric
   built from one and checked against the other will appear to be wrong (`02`
   §1).

### 4.2 Which sub-skills can be validly auto-scored, and which cannot

| Sub-skill | Auto-scorable? | Basis |
| --- | --- | --- |
| Listening and Reading items, all types | **Yes** — 1 mark each, provided the official key grammar is implemented | `03` §1, §3.2; `04` §3 |
| Synonym recognition under search conditions | **Yes**, and named as such upstream — "It is auto-scorable and level-appropriate" | `04` §8.3 |
| Target-like use in obligatory contexts (3rd-person `-s`, plural `-s`, articles, copula, passives) | **Yes** — obligatory contexts are countable | `07` §4.3, §8.2 **[S/NS]** |
| Error-free sentence density | **Yes** — "directly measurable", and the shared spine of Writing and Speaking GRA at 6→7→8 | `02` §10.5 |
| Presence/absence of named discourse moves (Task 1 overview; Task 2 position; topic sentence; one marker per stage) | **Yes**, as a binary observation traceable to a descriptor phrase | `02` §7 items 5–11; `05` §2.4 |
| Answer-key conformity (word limit, spelling, hyphens, two-answers) | **Yes**, mechanically | `01` §8; `03` §4 |
| **Coherence and Cohesion as a criterion** | **No** — nothing in the corpus establishes a valid automatic measure | — |
| **Task Response quality** | **No** | — |
| **Lexical Resource "precision" or "flexibility"** | **No** — and see the GAP below | `07` §4.1, §8.2 |
| **Pronunciation as a band** | **No** — explicitly forbidden | `07` §8.3 |
| **Pause intent** (planning content vs searching for a word) | **No** — this is a judgement of intent the criterion turns on | `02` §4.1 |

> **GAP** — the plan asked for "auto-scorable exercise formats … for each
> sub-skill". Only the six rows marked Yes above are established. Nothing in
> either evidence base establishes an auto-scorable format for Coherence &
> Cohesion, Task Response, or Pronunciation. **The most important absence is
> "flexibility"**: it is the word the descriptors use at every band from 6 up
> (`07` §4.1), and `07` §8.2 specifies it only as an *exercise design* — express
> the same proposition three ways — with **no scoring mechanism named**. The
> discriminator we most want to measure is the one we cannot.

### 4.3 The human-rater ceiling — read before believing any scorer

No automatic scorer can be more reliable than the construct allows, and for
Pronunciation the construct is very loose. Yates, Zielinski & Pryor (IELTS
Research Reports vol. 12; 27 examiners, 312 scores) **[S]**:

> "Less than one-third of the scores awarded to the Band 7 samples (29.8%) agreed
> with the IELTS-assigned score, and approximately one quarter of the scores
> differed by more than one band."

The examiners' own explanation is worth reading as a design lesson: "I would like
[the descriptors for] bands 7 and 5 to be longer as often I find it difficult to
differentiate. If I am confused, I often find myself choosing 6" **[S]**.

Isaacs et al. (2015; 80 test-takers, 8 accredited examiners) found the same
structural cause: "classification scores were lowest for Band 5 (27.7%) and
particularly Band 7 (8.4%), which happen to be the bands that feature the
Pronunciation descriptors, 'shows all the positive features of <the scale band
immediately below> and some, but not all, of the positive features of <the scale
band immediately above>'" **[S]**.

That is exactly the band `02` §5.1 records as having **no independent descriptor
wording**. Checklist **A9** and **D8** follow directly: the bands with no text
are the bands nobody can rate.

### 4.4 Learners cannot self-assess accurately

This matters because a self-study rubric is, by construction, self-applied.

Phakiti (2016), *IELTS Research Reports* 2016/6, N = 376, simulated IELTS
Listening **[S]**:

> "It was found that test-takers were miscalibrated in their performance
> appraisals, exhibiting a tendency to be overconfident across the four test
> sections. Their appraisal calibration scores were found to be worst for very
> difficult questions."

> "**up to 93% of the test-takers were miscalibrated in very difficult
> questions**"

Overall correlation between self-appraisal and actual performance was r = 0.73
(R² = 0.53) — real, but leaving half the variance unexplained; and it fell to
0.54 on Section 4. Phakiti's summary of the prior literature: "low-proficient
learners tended to overestimate their skills and high-proficient learners tended
to underestimate their skills" **[S]**. Field, independently: "self-assessment is
an approximate tool at best" **[S]**.

**Design consequence — checklist E8.** A self-applied rubric is a *learning
prompt*: it directs attention to a criterion. It is not a *measure*, and no
dashboard, progress bar or level decision may be driven by one.

> **GAP** — not established in this research pass: **whether giving a learner a
> checklist or rubric improves their self-assessment accuracy.** This is the
> load-bearing assumption behind "rubrics a learner can self-apply", and nothing
> in either evidence base tests it. What is established is that learners are
> badly calibrated without one. Treat the self-applied rubric as an untested
> intervention that is cheap and plausible, not as a validated one.

The one *calibration* finding that is buildable is `03` §6.6's: attach a
confidence rating to each listening answer and show the learner their calibration
alongside their score. `03` calls it "the most directly buildable finding in the
document … the only trainable behaviour here with an effect size attached"
(overconfidence *d* = 0.62 on very difficult items). Checklist **C10**.

---

## 5. Automated and LLM-based feedback — where it is and isn't defensible

This repo will probably build an LLM writing-feedback tool. This section is the
boundary.

### 5.1 The five unverified WCF claims, flagged

These errored in verification — three votes, zero valid — and are **[?]**
throughout. They are recorded once, here, so that later work does not re-derive
them as established:

- Direct, indirect and metalinguistic WCF produced similar effect sizes at the
  meta-analytic level **[?]**.
- A 2020 meta-analysis of 35 control-group studies reported Hedges' g = 0.59
  (SE = 0.085, 95% CI 0.423–0.755) for WCF on written grammatical accuracy
  **[?]**.
- Direct (g = 0.761) vs indirect (g = 0.625) was non-significant (Q = 0.322,
  p = .570); focused (g = 0.628) vs unfocused (g = 0.445) also non-significant
  **[?]**.
- Delayed post-test effects (g = 0.569) were essentially equal to immediate ones
  **[?]**.
- The result contradicts Truscott's (2007) reported d = −0.155, with pre-2008
  studies near null (g = 0.111) versus g = 0.667 from 2008 onward **[?]**.

**What this means practically.** The question "which *type* of correction should
an automated tool give?" has **no confirmed answer in this evidence base**. The
design-safe default is to pick the type on engineering and pedagogic grounds —
indirect and metalinguistic coding is cheaper to automate and does not do the
learner's revision for them — and to state that the choice is not evidence-driven.
**[INF]**

### 5.2 What automated scoring is known to get wrong

The only direct evidence in the corpus is Powers, Burstein, Chodorow, Fowles &
Kukich (2001), *Stumping E-Rater*, ETS Research Report 01-03 — writing experts
invited to defeat an automated essay scorer, 27 participants, 63 essays, each
scored by the machine and by two trained readers **[S]**.

**Agreement, on genuine essays** — the baseline:

> "Trained readers agreed exactly with one another 52% of the time, while e-rater
> agreed exactly with individual readers about 34% of the time. … The
> product-moment correlation between readers was .82, while the correlations
> between e-rater and individual first and second readers were .42 and .37 …
> Cohen's kappa … .42 between readers, and .16 and .27 between e-rater and
> individual first and second readers."

**The winning attack** — and it is embarrassingly cheap:

> "His principal strategy was simply to write several paragraphs and to repeat
> them (37 times, in fact!). This strategy did indeed fool e-rater … E-rater
> assigned the essay the highest possible score (6), while both study readers
> awarded it the lowest possible score (1)."

A third strategy — vary sentence structure, use discourse cue words, use topic
vocabulary, supply no critical analysis whatsoever — scored 6 from the machine
and 2 and 3 from the humans. The failure is asymmetric: it was harder to make the
machine score *too low*, and the two essays that managed it did so through
metaphor and literary allusion.

The authors' own limit statement is the one to carry: "e-rater scores have
meaning only if writers make genuine and legitimate attempts to respond to essay
prompts" **[S]**, and they flag as unwarranted "the implicit and unwarranted
assumption that e-rater will be used by itself for high-stakes testing" **[S]**.

> **GAP** — not established in this research pass: **anything about LLM-based
> writing or speech scoring.** Powers et al. tested a feature-based system in
> 2001. No source in either evidence base evaluates an LLM as a rater, measures
> its agreement with human examiners, or tests it adversarially. **Every claim
> in §5.3–§5.5 about LLMs is reasoning from adjacent evidence, marked [INF].**

### 5.3 Where an LLM feedback tool *is* defensible

All **[INF]**, reasoning from `02` §10, `07` §8.2, `04` §8.3 and §5.2 above. The
common property is that each output is **checkable by a third party against a
quoted descriptor phrase or a countable linguistic fact** — which is exactly what
a holistic band is not.

1. **Obligatory-context accuracy on named structures.** "Third-person `-s`
   supplied in 8 of 10 obligatory contexts." Countable, auditable, and the thing
   `07` §4.3 says tracks the band scale from 3 to 8.
2. **Error-free sentence density.** `02` §10.5 names it the shared spine of
   Writing and Speaking GRA at the 6→7→8 steps and directly measurable.
3. **Presence or absence of named discourse moves.** Is there an overview
   sentence? Is a position stated? Does each paragraph open with a topic
   sentence? Each is binary and each traces to a descriptor phrase or an examiner
   comment in `02` §7.
4. **Paraphrase and synonym identification** — the `04` §8.3 drill, already
   established as auto-scorable.
5. **Explaining a descriptor phrase against the learner's own sentence.** "The
   descriptor says *cohesion may be faulty or mechanical due to misuse, overuse
   or omission*; here is the overuse in your paragraph 2." This is exposition,
   not measurement, and it is the highest-value thing an LLM does.
6. **Generating practice items** at a specified CEFR level, and generating
   worked feedback text once a human-defined judgement has been made.

### 5.4 Where it is not

1. **Any band number.** Prohibited four times over upstream (`02` §10.2, `03`
   §9, `04` §11, `07` §8.1/§8.3) and by checklist **A2**.
2. **Holistic judgement of Task Response, Coherence & Cohesion, or Lexical
   Resource "precision".** No auto-scorable format is established (§4.2).
3. **Flexibility** — the descriptors' actual discriminator, with no scoring
   mechanism named anywhere in the knowledge base (§4.2 GAP).
4. **Pronunciation**, at all. Human examiners agreed with the assigned band on
   fewer than a third of band-7 samples (§4.3).
5. **Pause intent** in Speaking (`02` §4.1).
6. **Anything at all in Speaking, until `06`'s second pass** (checklist **D7**).
7. **Raw counts as verdicts.** "A checklist that counts spelling errors is not
   measuring what the criterion measures" (`02` §2.1). Checklist **D4**.

### 5.5 Gaming — the test to run before shipping

Powers' result generalises as a design discipline even though the system tested
was not an LLM: **any feature a scorer rewards is a feature a learner can inflate
without improving.** The repo's own rules already forbid teaching the inflation
moves (**B3**, from `02` §10.3), which means a tool that rewards them is
contradicting our own curriculum.

Minimum adversarial suite before any scoring tool ships (**D11**, **[INF]**):

| Attack | Must not be rewarded |
| --- | --- |
| One good paragraph repeated *n* times | The 37-paragraph attack, verbatim from Powers |
| Cue words and discourse markers with no reasoning | Powers' third strategy |
| Thesaurus-inflated rare vocabulary with degraded accuracy | `02` §7 item 13: reaching for wider vocabulary at the cost of accuracy caps LR at 6 |
| A memorised template with the topic swapped in | `02` §7 items 1–4: band 0 to band 4 territory |
| A response 40% under the word minimum | `02` §7 item 15 |

And the honest disclosure rule, **D10**: if we cannot state how often our tool
disagrees with a human judgement, we do not publish the judgement.

---

## 6. Honest progress metrics

### 6.1 The rule

**Criterion-referenced indicators, countable in obligatory contexts, reported as
fractions.** `07` §8.2: "Track target-like use in obligatory contexts for named
structures ('3PS `-s` supplied in 8/10 obligatory contexts'), not a complexity
index."

This is checklist **E1**, and it is the alternative to the band prediction that
**A2** forbids.

### 6.2 Reconciling "can produce a 3-clause complex sentence" with `07` §4.2

The plan's own example indicator is "can produce a 3-clause complex sentence
accurately". `07` §4.2 says syntactic complexity does not predict band. These are
compatible, and the distinction is the important one in this whole section:

- **As a criterion-referenced attainment statement, the indicator is valid.** It
  asserts that the learner can, on demand, do a named thing accurately. `07`
  §4.6 places subordination precisely: band 4 is *defined* by "subordinate
  clauses are rare", so producing an accurate complex sentence is a real
  threshold — the band-5 threshold — and crossing it is a real event.
- **As a growth index, it is invalid.** "More clauses = higher band" is exactly
  what Banerjee's data refuses: complexity measures peak at band 7 and fall at
  band 8 **[S/NS]**.

**The rule that follows.** A complexity indicator may be a **gate** (can / cannot,
once) and may never be a **curve** (more / less, over time). Once the learner
clears it, the metric retires and accuracy and flexibility take over. **[INF]**,
reconciling `07` §4.2, §4.6 and the plan's example.

### 6.3 Five measurement rules

1. **Never report our own test score as proficiency.** Madaus' circularity
   warning; needs "at least one alternative measure of the focal construct"
   (§3.3) **[S]**. Checklist **E6**.
2. **Never treat one retest as improvement.** Regression to the mean explains a
   large part of the pattern in Green's data, by his own account **[S]**.
   Checklist **E9**.
3. **Measure retention on delay, not in session.** Short intervals match long
   ones on immediate tests and lose on delayed ones **[V 3-0]**. Checklist
   **E5**.
4. **A rising error rate is not regression at this level.** `07` §4.4 and the
   CEFR Companion Volume: "inaccuracy increases at around B1 as the learner is
   beginning to use language more independently and creatively" **[S]**.
   Checklist **E3**.
5. **Emergence, not mastery, is the evidence of progress.** CEFR Companion
   Volume, via `07` §6.3: "the primary evidence for second language acquisition
   (that is, progress) is the emergence of new forms and not their mastery"
   **[S]**.

### 6.4 What a progress screen may show

| Display | Basis |
| --- | --- |
| Target-like use fractions for named structures | `07` §8.2 **[S/NS]** |
| Error-free sentence density over time | `02` §10.5 |
| Vocabulary **coverage curve** with the flattening visible, so 3,000→4,000 does not read as failure | `07` §8.1 **[V 3-0]** |
| Calibration — predicted vs actual, per session | `03` §6.6 **[T2]** |
| Delayed-retention checks on reviewed items | §2.1 **[V 3-0]** |
| CEFR can-do statements, ticked, sourced to a Companion Volume descriptor | `07` §8.4 |
| Discourse-move checklists completed (overview written, position stated) | `02` §7 |

| Forbidden display | Rule |
| --- | --- |
| Any band number or band trajectory | **A2** |
| A complexity index over time | **E2** |
| A predicted band from vocabulary size or pronunciation features | `07` §8.1, §8.3 |
| An accuracy-only line presented as the progress story | **E3** |
| A self-rating as the primary metric | **E8** |

---

## 7. Tooling, ranked by leverage

Ranked by **evidence strength × feasibility**. "Blocked" means an upstream gap
forbids building it, not that it is hard.

| Rank | Tool | Evidence strength | Feasibility | Verdict |
| --- | --- | --- | --- | --- |
| **1** | **Vocabulary trainer**, CEFR-keyed, fixed-interval review | **Strong.** Technology-assisted L2 vocabulary d = 0.64 (34 studies, N = 2,511) **[V 3-0]**; spacing medium-to-large in L2 (48 experiments, N = 3,411) **[V 3-0]** | **High.** Oxford 3000/5000 is CEFR-tagged per word; the expanding-schedule null removes the hardest part of the build | **Build.** Ranking function **blocked** — store attributes, keep selection swappable |
| **2** | **Extensive-reading engine** — levelled library, limited choice, reading log | **Strong and best replicated.** d = 0.41–0.46 in the two most recent of six positive meta-analyses; gains across *all* language domains **[V 3-0]** | **Medium.** Needs a levelled text corpus, all original per the repo's rule. The two moderators are cheap product features | **Build.** Highest content leverage in the document; the moderators are non-optional (**B9**) |
| **3** | **Listening player** with official key grammar and calibration | **Mixed.** Marking mechanics fully Tier-1 sourced; the calibration finding is one study (N = 376) with an effect size **[T2]** | **High.** Everything needed is specified in `03` §3.2, §4.2, §6.6 | **Build.** Distractor-annotated transcripts — the plan's own feature — are **blocked** |
| **4** | **Reading trainer** — one clock, synonym-search drill, Not-Given generators | **Mixed.** The synonym drill is named auto-scorable upstream **[T2]**; the four NG generators are Tier-1 sourced | **High.** Needs highlighting, notes, nav bar and review flag to match the real interface (**C9**) | **Build** |
| **5** | **Writing feedback tool** (LLM), criterion-level only | **Mixed.** WCF works and is durable (3 metas) **[V 2-0]**, but is moderated by proficiency, setting and genre, and *which type* of feedback is **[?]**. Automated scoring evidence is a cautionary tale, and there is a **GAP** on LLMs entirely | **Medium.** The defensible set (§5.3) is buildable; the tempting set (§5.4) is not | **Build, narrowly.** Bounded to §5.3; adversarial suite mandatory (**D11**) |
| **6** | **Speaking recorder** with descriptor self-review | **Weak.** `06` reports only two Speaking claims survived verification; shadowing has no pooled effect size; task repetition's best-evidenced outcome is a measure `07` says does not predict band | **High** technically, which is the trap | **Blocked.** `06` requires a second research pass before any Speaking tool or rubric |
| **7** | **Pronunciation tooling**, Vietnamese-specific | **Weak but no longer absent.** `07` §5.5 closed on 2026-08-08 with seven sourced studies covering the coda inventory, final /s~z/ omission, onset clusters and question intonation. All **[S]** — quoted, panel-unverified, N = 16–36, several under 20. Vowels, rhythm metrics and region remain **GAP**s | **Medium.** The three permitted targets need recorded audio and a coda-consonant lesson the syllabus does not have | **Build, narrowly.** Bounded to `07` §8.3's VN-1/VN-2/VN-3 and bound by VN-4's four prohibitions (**B7**). No pronunciation **band** or score, ever (**D8**); no claim of an intelligibility ranking (`07` §5.5.7 **GAP**) |

### 7.1 The blocked list, and what unblocks each

| Blocked | Blocked by | Unblocked by |
| --- | --- | --- |
| Any Speaking rubric or feedback tool | `06` preamble and §7; `02` §9 (four examiner commentaries exist across bands 5–7, none at 8–9, and no band-by-band rationale) | A second Speaking research pass re-testing fluency indicators, pronunciation ordering and lexical-resource mechanisms |
| ~~Vietnamese-specific pronunciation guidance~~ — **unblocked 2026-08-08**, within limits | Was `07` §5.5 **GAP**; closed by seven retrieved sources | Bounded to `07` §8.3 VN-1/VN-2/VN-3, all **[S]**. See **B7** |
| Vietnamese-specific **vowel** guidance (U1–U4) | `07` §5.5.6 **GAP** — nothing peer-reviewed located; the one lead is conference proceedings and concerns a contrast the syllabus does not teach | A retrieved, peer-reviewed learner study of Vietnamese-L1 production or perception of /ʊ/–/uː/ and /ə/–/ɪ/. **Contrastive reasoning does not unblock it** |
| Region-specific (North/South) pronunciation guidance | `07` §5.5.5 **GAP** — the segmental evidence is Northern, the prosodic evidence Southern, and the only coda claim rests on one speaker per dialect in a clinical tutorial | A quantified Northern-vs-Southern comparison of **English** production |
| Any ranking of Vietnamese pronunciation features **by intelligibility damage** | `07` §5.5.7 **GAP** — the ordering in `07` §5.5.8 is built from difficulty-and-persistence evidence plus one N = 1 intelligibility result | A study that measures listener comprehension across an adequate sample of Vietnamese speakers and ranks the features |
| A rhythm lesson premised on "Vietnamese is syllable-timed, English is stress-timed" | `07` §5.5.4 **GAP** — no rhythm-metric characterisation of Vietnamese-accented English exists; Grabe & Low (2002) excludes Vietnamese. The unsourced typological claim has been removed from `02` §7 item 18 | A rhythm-metric study of Vietnamese-accented English. The *deaccenting* finding (Nguyễn & Đào 2018) is separately sourced and is **not** blocked |
| Vocabulary trainer ranking function | `07` §3, §8.1 | Resolving the rarity-versus-formulaicity question. Until then: attributes stored, policy swappable |
| Distractor-annotated Listening transcripts | `03` §5, §5.2 **GAP** | An official or research account of Listening distractor construction. Reading annotation is *not* blocked |
| Task 1 data-description and map lessons | `05` §2.6 **GAP** ×2 | A Tier-1 trend-lexis inventory; an official map task with examiner commentary |
| Any raw-score → band converter beyond the four benchmarks | `01` §7.3 **GAP** | A published full conversion table, which does not exist |
| A five-way Task 2 archetype taxonomy | `05` §3.2 **GAP** | A Tier-1 source enumerating Task 2 question archetypes |
| Averaging Speaking's four criteria | `01` §7.4 | Verification of the equal-weighting statement, which errored **[?]** |
| Half-band anything | `02` §9 **GAP** | Nothing — no half-band descriptors are published |

---

## 8. What this document does not establish

### 8.1 Gaps flagged above, collected

1. **§2.1** — no absolute interval value for review scheduling. Any schedule we
   ship is an engineering choice.
2. **§2.2** — how much of the extensive-reading effect survives unsupervised
   self-study; and how much reading volume is required (45 of 73 studies did not
   report fidelity).
3. **§2.4** — no pooled effect size for shadowing.
4. **§3.5** — no IELTS washback study conducted in Vietnam was retrieved.
5. **§4.2** — no auto-scorable format for Coherence & Cohesion, Task Response, or
   Pronunciation; and **no scoring mechanism at all for "flexibility"**, the
   descriptors' own discriminator.
6. **§4.4** — whether a checklist or rubric improves a learner's self-assessment
   accuracy is untested. Only the miscalibration is established.
7. **§5.2** — nothing in either evidence base evaluates an **LLM** as a writing or
   speech rater: not its agreement with humans, not its failure modes, not its
   gaming surface. Every LLM recommendation here is **[INF]**.

Inherited gaps that constrain everything built downstream are listed at `08`
§5.5 and are not restated: no band-9 exemplar for Writing or Speaking, no
half-band descriptors, **no IELTS↔CEFR alignment below band 4.0 and none at all
for A2 or A1** (`07` §6.2a — which is why **A1** labels by CEFR rather than by
band), Speaking materially under-evidenced, and the vocabulary ranking function
unbuildable. `08` §5.4 adds one more that post-dates this file's first draft:
**syllable-final consonants are rank 1 in the Vietnamese-L1 priority ordering and
no unit in the twelve teaches them.**

### 8.2 Tested and not sustained — logged, not asserted

Four Phase-6 claims failed the panel. **Neither they nor their negations are
stated anywhere in this document.** They are recorded so they are not silently
re-derived later:

| # | The claim that failed | Vote |
| --- | --- | --- |
| X1 | A specific pooled magnitude for the spacing-versus-massing contrast in the retrieval-practice meta-analysis | 1-2 |
| X2 | That the uncontrolled pre-post design inflates the apparent extensive-reading benefit relative to controlled comparisons | 0-3 |
| X3 | That incidental vocabulary instruction outperforms intentional instruction in technology-mediated settings | 0-2 |
| X4 | A claim ranking task repetition's fluency and lexical-complexity gains against its complexity and accuracy gains | 0-3 |

X1 is why §2.1 argues from the *expanding-versus-uniform* result rather than
from spacing-versus-massing magnitudes. X3 is why §2.3 recommends doing both.

### 8.3 Inconsistencies in the knowledge base — resolved 2026-08-08

This section previously logged four inconsistencies its author could not resolve.
**All four were re-examined against the primary evidence on 2026-08-08 and are
recorded below with their resolutions.** None was settled by splitting the
difference; where the truth could not be determined it is now an explicit GAP in
both files rather than a silent contradiction.

1. **Speaking examiner-commentary count — resolved. The number is four.**
   `02` §4 and §9 stated that only **one** commentary was retrievable
   (Alexandra, band 7); `06` §5 stated **four** (bands 5–7). Checking the files'
   own citations settles it in `06`'s favour: `06` §5 names four candidates —
   **Tina** (Vietnam, Part 2, band 5), **Xin** (China, Part 3, band 6),
   **Hendrik** (Germany, Part 3, band 7) and **Alexandra** (band 7) — and quotes
   the decisive examiner sentence verbatim from each, three of them cited to
   `ielts.org/for-organisations/speaking-clips-examiner-comments` and Alexandra
   to the IELTS Online Tutorial document. Verbatim quotation with candidate,
   part and band is retrieval; an unreachable page is not counter-evidence to it.
   The discrepancy is a **retrieval-time difference between two research passes**
   — that page was unreachable during `02`'s pass and reachable during `06`'s —
   and only `02` wrote its own pass's failure as a fact about the corpus.
   **Both files now say four**, with `02` §4 carrying the correction and the
   per-candidate table, and `06` §5 carrying the reconciliation note.
   What does not change: `02` §6.2's Speaking row still holds Alexandra alone,
   because that is the commentary `02` worked from; four commentaries across
   three bands is still not a band-by-band ladder; **no band 8 or 9 Speaking
   commentary exists anywhere in the corpus** (`06` §5 **GAP**); and checklist
   **D7** still blocks Speaking tooling on `06`'s own gate.
2. **The British Council descriptor mirror — resolved by repointing.** `02` §1.3
   records `takeielts.britishcouncil.org/.../ielts_writing_band_descriptors.pdf`
   as returning `Access Denied` with its version unknown, while `05` cited that
   same URL as its source for [2023] Writing wording (§2.4, §3.3, §3.4 and
   Sources) and `07` cited it in §4.1 — even though `07` §6.2a separately records
   the whole host as unreachable during its own pass. `06`'s citation was a
   *different* file, the Speaking descriptor PDF on the same host. The host is
   evidently **intermittently reachable**: `04` and `05` retrieved and quoted two
   British Council *teaching* PDFs from it, while `01` §9.1 and `07` §6.2a
   record timeouts across whole passes. The content was never in doubt — it
   matches the ielts.org copies `02` retrieved, dated from PDF metadata and
   diffed against the superseded [2013] grid. **All four descriptor-PDF citations
   in `05`, `06` and `07` have been repointed to the ielts.org URLs**, each with
   a note recording the change; quoted wording is untouched. Checklist **A7**
   still bans the mirror in rubric source lines, and `02` §1.3's **GAP** — we
   cannot say which version the British Council publishes — remains open.
3. **Marker incompatibility — not an inconsistency, and it stays.** `03`/`04`'s
   `[X]` withholds a panel-failed claim; `07`'s `[S/NS]` uses one, quoted, where
   the primary source is in the cache. Re-examined: these are **different
   conventions applied to different evidential situations, not contradictory
   claims about the same fact**, and reconciling them would mean either
   suppressing `07`'s quoted primary sources or asserting `03`/`04`'s withheld
   claims. Both would be worse. The difference is substantive and is handled at
   the point of use by §0.1 and checklist **G2**: `[S/NS]` is *not* the same
   strength as `[V]` or `[C]`, and anything resting on it must say so. **No
   change; recorded as a standing convention difference rather than a defect.**
4. **Four broken cross-references — all fixed at source.** `07` §1 said "§4 lays
   out both sides" of the rarity/collocation tension when it is §3; `03` §1
   pointed to `04` §6 (time economics) for question ordering when it is `04`
   §4.3. Re-checking this file's own pointers found two more of the same kind:
   **D9** cited "§5.4" for the defensible LLM set when §5.4 is *where it is not*
   and the set is §5.3; **C10** and **E8** both cited "§5.3" for the calibration
   and self-assessment findings, which are in §4.4. All four are corrected in
   place. Checklist **G5** now records them as fixed rather than as pointers to
   avoid propagating.

**One inconsistency found during this pass that could not be closed**, converted
to an explicit GAP rather than left silent:

> **GAP** — **which host publishes which version of the Writing descriptors.**
> `02` §1.3 cannot state the British Council's version because the mirror is
> unreachable, and cannot exclude a third wording variant in circulation. The
> repointing in item 2 removes the *unverifiable citation*; it does not answer
> the *version* question. Any public-facing claim of the form "the official
> descriptors say X" must be re-checked against a reachable British Council copy
> first (`02` §1.3, `09` **A5**, **A7**).

---

## Sources

This document introduces **no Tier-1 sources**. Every test fact, descriptor
phrase and scoring rule resolves to `01`–`08`. The sources below are the Phase-6
pedagogy corpus only.

**Tier 2 — panel-verified this pass (the 16 confirmed claims)**

- [The effects of spacing on second language learning: a meta-analysis](https://onlinelibrary.wiley.com/doi/10.1111/lang.12479) — *Language Learning*, Wiley. 98 effect sizes, 48 experiments, N = 3,411. Source for the spacing magnitude, the equal-vs-expanding equivalence, and the short-vs-long interval asymmetry. *Point estimates are paywalled; only the verbal magnitude was retrievable.*
- Latimier, A., Peyre, H. & Ramus, F. — [A meta-analytic review of the benefit of spacing out retrieval practice episodes on retention](https://link.springer.com/article/10.1007/s10648-020-09572-8) — *Educational Psychology Review*. 29 studies; 39 effect sizes in subset 1, 54 in subset 2. Source for **g = 0.034** and the explicit rejection of progressively lengthening intervals. Full text in the research cache.
- Nakanishi, T. (2015). [A meta-analysis of extensive reading research](https://onlinelibrary.wiley.com/doi/10.1002/tesq.157) — *TESOL Quarterly*. Source for **d = 0.46** on group contrasts and the curricular recommendation.
- Sangers, N. L., van der Sande, L., Welie, C., Dobber, M. & van Steensel, R. (2025). [Learning a language through reading: a meta-analysis of studies on the effects of extensive reading on second and foreign language learning](https://link.springer.com/article/10.1007/s10648-025-10068-6) — *Educational Psychology Review* 37(4), art. 96. 73 studies, 82 interventions, 86 comparisons. Source for **d = 0.41**, the per-domain table, and the two significant moderators. Full text in the research cache.
- [A meta-analysis examining technology-assisted L2 vocabulary learning](https://www.cambridge.org/core/journals/recall/article/metaanalysis-examining-technologyassisted-l2-vocabulary-learning/08A549A6CFD1078406E6A4F8AFE28184) — *ReCALL*, Cambridge. 34 studies, N = 2,511, 49 effect sizes. Source for **d = 0.64**.
- Abdi Tabari, M., Zhuang, J. & Farahanynia, M. (2025). [Task repetition and L2 oral production: a meta-analysis](https://www.sciencedirect.com/science/article/abs/pii/S0346251X25002787) — *System*. Source for the complexity-and-accuracy finding and the moderator list.
- Kang, E. & Han, Z. (2015). [The efficacy of written corrective feedback in improving L2 written accuracy: a meta-analysis](https://onlinelibrary.wiley.com/doi/abs/10.1111/modl.12189) — *The Modern Language Journal*. 21 primary studies. Source for the accuracy finding and the moderation caveat.
- [A Bayesian meta-analysis of written corrective feedback](https://journals.sagepub.com/doi/10.1177/13621688221147374) — *Language Teaching Research*, SAGE. 52 control-group studies. Source for the durability finding.

**Tier 2 — retrieved verbatim from the research cache, not panel-verified [S]**

- Green, A. (2007). *IELTS Washback in Context: Preparation for Academic Writing in Higher Education.* Studies in Language Testing 25, Cambridge University Press / UCLES. N = 476 completing entry and exit tests across 18 courses; plus Cambridge ESOL data on 15,343 repeat candidates. The anchor for all of §3.
- Kang, O., Ahn, H., Yaw, K. & Chung, S-Y. (2021). [Investigation of relationships between learner background, linguistic progression, and score gain on IELTS](https://ielts.org/researchers/our-research/research-reports/investigation-of-relationships-between-learner-background-linguistic-progression-and-score-gain-on-ielts) — *IELTS Research Reports Online Series* 2021/1. N = 52, 12 weeks, mean 284 hours. Source for the EFL-context gain figures and the skill-by-skill breakdown.
- Field, J. (2023). *Insights into Assessing Academic Listening: The Case of IELTS.* Studies in Language Testing 53, Cambridge University Press & Assessment. Source for the Elder & O'Loughlin, Allen, Winke & Lim, Nguyen (2007) and Read & Hayes summaries in §3.4–3.5, and the independent circularity warning.
- Powers, D. E., Burstein, J. C., Chodorow, M., Fowles, M. E. & Kukich, K. (2001). [Stumping E-Rater: Challenging the Validity of Automated Essay Scoring](https://www.ets.org/Media/Research/pdf/RR-01-03-Powers.pdf) — ETS Research Report 01-03 / GRE Board Professional Report 98-08bP. 27 participants, 63 essays. The whole of §5.2 and the adversarial suite in §5.5.
- Phakiti, A. (2016). Test-takers' performance appraisals, appraisal calibration, state-trait strategy use, and state-trait IELTS listening difficulty — *IELTS Research Reports Online Series* 2016/6. N = 376. Source for §4.4.
- Yates, L., Zielinski, B. & Pryor, E. (2008). The assessment of pronunciation and the new IELTS Pronunciation scale — *IELTS Research Reports* vol. 12. 27 examiners, 312 scores. Source for the examiner-agreement figures in §4.3. Also cited in `02` §5.2 and `07` §8.3.
- Isaacs, T., Trofimovich, P., Yu, G. & Muñoz Chereau, B. (2015). Examining the linguistic aspects of speech that most efficiently discriminate between upper levels of the revised IELTS Pronunciation scale — *IELTS Research Reports Online Series* 2015/4. 80 test-takers, 8 examiners. Source for the band-5 and band-7 classification failures. Also cited in `07` §5.2.
- Whitworth, B. N. (2024). *Shadowing for Pronunciation: A Systematic Review.* MSc dissertation, University of Oxford (Oxford University Research Archive). 44 studies, 15 with control groups; narrative synthesis, no pooled effect size. Source for §2.4.
- Chen, J. (2022). [The effectiveness of self-regulated learning (SRL) interventions on L2 learning achievement, strategy employment and self-efficacy](https://pmc.ncbi.nlm.nih.gov/articles/PMC9650592/) — *Frontiers in Psychology* 13:1021101. 16 studies, N = 1,780. Cited only in §2.0, with its internal abstract/results discrepancy and detected publication bias noted.

**Not retrievable**

- Truscott's own statement of the anti-correction position — the cached page is a bot-challenge stub. §2.5 characterises it only through the meta-analyses that answer it, and says so.
- Elder & O'Loughlin (2003) and Powers (1993) — both cited above only as they appear inside Green and Field. Not obtained.

**Method note**

The 16 confirmed claims came from a 3-vote adversarial panel over 133 candidates
from 29 sources. Because the digest was thin on washback, assessment design and
automated scoring — the three areas this document most needed — the full texts in
the research cache were mined directly for those sections, which is why §3, §4.3,
§4.4 and §5.2 are almost entirely **[S]** rather than **[V]**. Those sections are
well-sourced and singly-verified, and should not be read as carrying the same
weight as the **[V 3-0]** rows in §2.0.

**Cross-references**

- Test facts, timings, scoring mechanics and the eight inherited build constraints → `01-exam-structure.md` §12
- Descriptor traceability, the version collision, band-ceiling behaviours, and the eight rules carried forward here → `02-band-descriptors.md` §10
- Listening marking mechanics, delivery-mode timing, and the calibration finding → `03-listening.md` §3.2, §4.2, §6.6
- Reading clock model, the auto-scorable synonym drill, and Not-Given generators → `04-reading.md` §1.1, §4.4, §8.3
- Writing criterion definitions and the examiner verdict corpus → `05-writing.md`
- The Speaking build gate → `06-speaking.md` preamble, §7
- CEFR labelling, the grammar ladder, vocabulary strategy, and the three tooling tables → `07-language-foundation.md` §8
- Per-unit alignment and the post-grade-8 arc → `08-bridge-map.md`
