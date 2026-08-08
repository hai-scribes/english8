# IELTS Knowledge Base — Index

**Research date: 2026-08-08.** Nine documents, ~7,700 lines, six research passes
plus two targeted gap-closure passes.

**What this is.** A source-verified reference describing what the IELTS test *is*,
what its band descriptors *say*, what published research establishes about each
skill, what language is actually trainable toward the bands, how the twelve-unit
grade-8 course in `curriculum/syllabus.md` maps onto all of that, and what may
therefore be built in this repo.

**What it is not.** It is not a prep guide, not a curriculum, and not a set of
answers. It is a citation chain. Every claim in it resolves to a named document,
carries a marker saying how strongly it is evidenced, and — where the evidence
ran out — says so in a `> **GAP**` blockquote instead of filling the space.

**Looking for one fact?** Do not read these documents. Grep
[`index.jsonl`](index.jsonl) — 1,244 claims, one JSON object per line, each
naming the file and section to open — and see [`ROUTER.md`](ROUTER.md) for the
grep recipes. This file is the whole picture; the router is the fast path.

---

## Read the limits first

The single most useful property of this knowledge base is the list of things it
**refuses** to claim. If you take one section from this file, take
[§5 — What this knowledge base does not establish](#5-what-this-knowledge-base-does-not-establish).
The five headlines:

1. **No tool in this repo may output an IELTS band number** — not as a score, not
   as a prediction, not as a progress dial. There is no published raw-score→band
   conversion table, no half-band descriptors, and no official arithmetic for
   combining criterion scores into a band. Label by **CEFR** instead.
2. **The official IELTS↔CEFR alignment bottoms out at band 4.0 = the B1
   threshold, and assigns no band at all to A2 or A1.** Grade-8 learners sit at
   A2. There is no band to label them with and none can be derived.
3. **No Speaking rubric or Speaking feedback tool may ship yet.** Only two
   Speaking claims survived adversarial verification; fluency indicators,
   pronunciation ordering and lexical-resource mechanisms are all unresolved.
4. **The vocabulary trainer's ranking function is now buildable — to one
   specification and no further** *(changed 2026-08-08)*. The rare-versus-
   formulaic split was a **false opposition**: word-level rarity and
   combination-level rarity are different constructs, and a formulaic sequence
   *is* a rare item counted on combinations. Rank by **collocational association
   strength inside a coverage gate** (`07` §8.1a). Still forbidden: ranking by
   raw frequency band, CEFR level, list membership or diversity, and **any
   accuracy module**. Two caveats travel with it — **no intervention study**
   exists, and **all MI evidence is B2-and-above**.
5. **A claim that failed verification is unproven, not disproven.** Nowhere in
   these nine files is the negation of a failed claim asserted either.

---

## 1. The nine documents, in reading order

Read `01` → `02` first; they are the ground truth everything else cites. `03`–`06`
are per-skill and independent of each other. `07` is the heaviest and the most
contested. `08` and `09` are the payoff and must be read last, because they
inherit markers from everything above.

| # | File | What it establishes |
| --- | --- | --- |
| **01** | [`01-exam-structure.md`](01-exam-structure.md) | **The spec of the test itself** — sections, timings, question types, answer-recording rules, scoring mechanics, the 2026 move to computer delivery, One Skill Retake, and how General Training differs. Tier 1 only, by design. |
| **02** | [`02-band-descriptors.md`](02-band-descriptors.md) | **What the scale says** — Writing and Speaking band ladders 4→9 with delta tables, the two circulating Writing descriptor versions and what changed between them, the bolding convention, examiner rationale on scored scripts, and the 21-item band-ceiling table. Nothing downstream may assert a band claim not traceable to a phrase quoted here. |
| **03** | [`03-listening.md`](03-listening.md) | **Listening** — part structure, the six question types, the official answer-key grammar, marking mechanics, delivery-mode timing, the cognitive evidence on what Part 4 actually demands, the calibration finding, and a folklore audit. |
| **04** | [`04-reading.md`](04-reading.md) | **Reading** — the one-clock rule, passage selection and editing for density, the eleven question types, the official TFNG/YNNG distinction and Not-Given generators, time economics, what reading the test elicits, and the eye-tracking evidence on what separates strong readers from weak ones. |
| **05** | [`05-writing.md`](05-writing.md) | **Writing** — Task 1 as information transfer, the comparison clause, the overview as a band-gated summarising skill, Task 2 position clarity and licensed personal examples, the underlength finding, copied rubric, discourse-marker overuse, and the full examiner verdict corpus. |
| **06** | [`06-speaking.md`](06-speaking.md) | **Speaking** — the four-criterion architecture, the coherence indicators (the one criterion this pass established in detail), verbatim criterion text for the other three, the three Parts, four officially commented performances at bands 5–7, and the Tier-2 correlates. **Deliberately shorter than `05`, and that is a finding.** |
| **07** | [`07-language-foundation.md`](07-language-foundation.md) | **What is trainable, and at what CEFR level** — vocabulary coverage thresholds and list strategy, the rarity-vs-formulaicity question (**resolved 2026-08-08** by separating word-level from combination-level rarity, with two errors of fact corrected in §3), the grammar ladder (complexity does *not* predict band; accuracy on named structures does), phonology and the Vietnamese-L1 evidence, and the IELTS↔CEFR crosswalk with its band-4.0 floor. **The lowest confirmation rate of the six passes — read its verification note.** |
| **08** | [`08-bridge-map.md`](08-bridge-map.md) | **Grade 8 → IELTS** — per-unit alignment for all twelve units, each with at least one upgrade implementable inside the existing lesson, the cross-cutting strands, the gaps grade 8 cannot fix, and the post-grade-8 arc. Introduces no new sources; synthesises `01`–`07` and the syllabus. |
| **09** | [`09-design-principles.md`](09-design-principles.md) | **The build constitution** — a 66-item audit checklist any lesson, tool or test in this repo can be checked against, plus the pedagogy evidence behind it (spacing, extensive reading, corrective feedback), a washback review, the boundary on LLM-based feedback, honest progress metrics, and the tooling leverage ranking with its blocked list. |

**Shortest useful path if you are building something:** `09` §1 (the checklist)
→ `09` §7.1 (what is blocked and why) → the specific sibling section the
checklist item traces to.

---

## 2. The shared marker convention

Every claim carries a marker. **Markers are inherited down the citation chain and
are never upgraded** — a Tier-2, singly-sourced or unsustained finding stays that
way wherever it is re-cited. The most developed tables are `08` §0.1 and `09`
§0.1; those are canonical where files disagree.

| Marker | Meaning | Used in |
| --- | --- | --- |
| **[C]** *n-n* | **Confirmed** by a 3-vote adversarial panel, vote shown | `03`–`06`; re-cited in `08`, `09` |
| **[V]** *n-n* | **Verified** by a 3-vote adversarial panel, vote shown. *Same strength as `[C]`* — the two labels are an artefact of different research passes, not a difference in evidence | `01`, `07`, `09` |
| **[Q]** | **Tier-1 verbatim** — the quote *is* the claim, with no interpretation layered on it | `01`, `03`–`06`, `08`, `09` |
| **[D]** | **Band-descriptor wording** quoted in `02`. `02` carries no per-claim markers because every descriptor line in it is verbatim Tier 1 | `08`, `09` |
| **[S]** | **Sourced but not panel-verified** — quoted from a primary document held in the research cache | `01`, `07`, `09`; inherited by `08` |
| **[S/NS]** | In the cache and quoted, **but the corresponding panel claim was not sustained**. Well-evidenced but singly-sourced. **Not the same strength as `[C]`/`[V]`**, and anything resting on it must say so at the point of use (`09` **G2**) | `07`; inherited by `08`, `09` |
| **[T2]** | **Tier-2 evidence** — a tendency in candidate performance or a cognitive finding, **never a rule of the test** | `03`–`09` |
| **[X]** | **Tested and not sustained.** Logged so it is not silently re-derived. **Neither the claim nor its negation is asserted** | `03`–`06`, `09` |
| **[?]** | **Verification attempted and errored** — unconfirmed. Usable only with the marker attached | `01`, `07`, `09` |
| **[INF]** | **The citing document's own reasoning.** No source states the link; the underlying facts are cited and the inferential step is owned | `08`, `09` |
| **[SPEC]** | **Speculative.** Plausible, level-appropriate, and untested — no source says it works | `08` |

**Two divergences worth knowing about.** First, `[C]` and `[V]` mean the same
thing; do not read one as weaker. Second, `03`/`04` use `[X]` to *withhold* a
panel-failed claim entirely, while `07` uses `[S/NS]` to *use* one, quoted, where
the primary source is in the cache — most of `07`'s grammar ladder and half its
vocabulary ladder are `[S/NS]`. These are different conventions for different
evidential situations, not contradictory claims, and they are deliberately not
reconciled (`09` §8.3 item 3). **An audit rule that treats "verified" as one
thing across the nine files will over-rate `07`.**

**`> **GAP**` blockquotes** mark something the research plan asked for that the
evidence base does not supply. Gaps are left visible and are never filled from
memory, and never closed by an upgrade.

---

## 3. Source policy

| Tier | What counts | How it may be used |
| --- | --- | --- |
| **Tier 1 — binding** | ielts.org, British Council, IDP, Cambridge English; the Council of Europe for CEFR descriptors | Rules of the test. Quoted verbatim wherever wording carries weight |
| **Tier 2 — evidence** | IELTS Research Reports, Cambridge *Studies in Language Testing*, peer-reviewed applied linguistics | **Tendencies in candidate performance, never rules of the test.** Always labelled, always with sample size and effect size where the source gives them |
| **Tier 3 — prep industry** | Teacher blogs, prep-school lore, marketing pages | **Never a warrant.** May be the *object* of a claim ("this is widely taught"), never its support. `03` §7, `04` §9 and `05` §6 audit the folklore explicitly |

Two standing hygiene rules that follow: sample sizes travel with every empirical
claim (several load-bearing Vietnamese-L1 studies have N under 20), and where a
source's own authors attach caveats, the caveats are reproduced rather than
dropped.

---

## 4. Conventions for maintaining these files

- **Never upgrade a marker.** Re-citing a finding does not strengthen it.
- **Never delete a GAP that is still real.** Removing an honest limitation is a
  worse defect than any it might be hiding.
- **Never state the negation of a failed claim.** Unproven is not disproven.
- **Verify cross-references against the section they name.** Four were found
  broken and fixed on 2026-08-08 (`09` §8.3 item 4); section numbers drift when
  documents are written in parallel.
- **Record inconsistencies rather than smoothing them.** Where two files
  genuinely disagree and the truth cannot be determined, make it an explicit GAP
  in both, not a silent contradiction.

---

## 5. What this knowledge base does not establish

Consolidated from all nine files. **Read this before the contents.**

### 5.1 Blocked — things this repo may not build, and what would unblock them

| Blocked | Blocked by | Unblocked by |
| --- | --- | --- |
| **Any IELTS band number as output** — score, prediction, promise, or progress dial | `02` §9, §10 rule 2; `03` §9; `04` §11; `07` §8.1, §8.3 | Nothing available. No criterion-to-band arithmetic is published |
| **Any raw-score → band converter** beyond the four published benchmark rows | `01` §7.3 **GAP** | A published full conversion table — which does not exist. The four benchmarks are *averages* that shift by test version |
| **Half-band anything** — a "Band 6.5" rubric column, a "band 7.5 checklist" | `02` §9 **GAP** | Nothing. No half-band descriptors are published |
| **Any Speaking rubric or feedback tool** | `06` preamble and §7; `09` **D7** | A second Speaking research pass re-testing fluency indicators, pronunciation ordering and lexical-resource mechanisms |
| **Averaging Speaking's four criteria** into one figure | `01` §7.4 — the equal-weighting claim errored in verification **[?]** | Verification of that claim. Report the four separately meanwhile |
| ~~**The vocabulary trainer's ranking function**~~ — **unblocked 2026-08-08** | Was `07` §3, §8.1. Resolved: word-level and combination-level rarity are different constructs (`07` §3.0) | **Permitted to one spec** (`07` §8.1a): coverage eligibility gate K1–K4, then rank inside it by `max MI` over the item's collocations, filtered `n > 5`, `t > 2`, tie-break dobj > amod > advmod. Carries `07` §3.6's *no-intervention-study* and *B2-and-above* caveats |
| **An accuracy-scoring module** in the vocabulary trainer; ranking by raw frequency band, CEFR level, word-list membership, or diversity | `07` §3.5 **GAP**; `07` §8.1a's "explicitly NOT supported" table | For accuracy: a study that manipulates **error gravity**. For the rest: nothing — each was checked and each fails |
| **Any claim that syllable-final consonant work raises a score, band, comprehensibility or intelligibility**, or transfers to spontaneous speech | `07` §5.5.7a, §5.5.7b **GAP**s — no cost evidence for any L1; 77-study meta-analysis finds spontaneous-speech CIs crossing zero; the one Vietnamese trial is N = 30, uncontrolled, null | A cost study in Vietnamese B2–C1 speakers **and** a coda-targeted intervention with a control group and a spontaneous-speech outcome. Teaching the contrast as a *difficulty* finding is not blocked; claiming a *payoff* is |
| **Any claim that an inaudible inflectional ending is charged to the Grammar scale** rather than Pronunciation | `07` §5.5.7c **GAP** — unexamined by anyone; Isaacs et al. demonstrate bleed in the **opposite** direction (grammar → Pronunciation, loading .945) | An attribution experiment: resynthesised `-s` within speaker, Pronunciation and Grammar scored separately |
| **Distractor-annotated Listening transcripts** | `03` §5, §5.2 **GAP** — no official account of how Listening distractors are built | An official or research account. **Reading** annotation is *not* blocked — `04` §4.4–4.5 has four official Not-Given generators |
| **Task 1 data-description and map lessons** | `05` §2.6 **GAP** ×2 | A Tier-1 trend-lexis inventory; an official map task with examiner commentary |
| **A five-way Task 2 archetype taxonomy** | `05` §3.2 **GAP** — only two archetypes are attested by official prompts | A Tier-1 source enumerating Task 2 question archetypes |
| **Vietnamese-specific *vowel* guidance** (U1–U4) | `07` §5.5.6 **GAP** | A peer-reviewed learner study of /ʊ/–/uː/ and /ə/–/ɪ/ by Vietnamese speakers. **Contrastive reasoning does not unblock it** |
| **Region-specific (North/South) pronunciation guidance** | `07` §5.5.5 **GAP** — the segmental evidence is Northern, the prosodic evidence Southern | A quantified Northern-vs-Southern comparison of *English* production |
| **A rhythm lesson premised on "Vietnamese is syllable-timed"** | `07` §5.5.4 **GAP** — no rhythm-metric characterisation of Vietnamese-accented English exists | A rhythm-metric study. The *deaccenting* finding is separately sourced and is **not** blocked |
| **Any ranking of Vietnamese pronunciation features by intelligibility damage** | `07` §5.5.7 **GAP** | A study measuring listener comprehension across an adequate Vietnamese sample |
| **Pronunciation scored as a band, from any feature set** | `07` §8.3; `02` §5.2 — examiner classification accuracy was 47%, band 6 misclassified 80% of the time | Nothing available. Pronunciation claims are the least reliable of the four |

**Permitted but narrow:** an LLM writing-feedback tool, bounded to `09` §5.3's
defensible set — obligatory-context accuracy on named structures, error-free
sentence density, presence/absence of named discourse moves, paraphrase
identification, and explaining a descriptor phrase against the learner's own
sentence. Everything holistic is out (`09` §5.4), and the adversarial suite in
`09` §5.5 is mandatory before shipping.

### 5.2 The highest-value open gaps

Ordered by what they block, not by file.

**Curriculum**

- **No unit in the twelve teaches syllable-final consonants** — rank 1 in the
  Vietnamese-L1 **difficulty** ordering, structurally guaranteed (no Vietnamese
  dialect permits a coda fricative) and measured at 28.4% omission of final
  /s~z/ in learners already at C1. `07` §5.5.8, `08` §5.4. *Corrected
  2026-08-08:* this was previously listed as "a gap in the course, not in the
  research". **It is now a gap in the research.** Adding coda work was tested
  against the condition *only if proved helpful for reaching the top of the
  scale* and **was not supported** — no cost evidence exists for any L1
  (`07` §5.5.7a), the trainability evidence points the other way (`07` §5.5.7b),
  the cross-criterion argument is unexamined (`07` §5.5.7c) and age
  appropriateness at ~14 is unknown. **Best-evidenced difficulty is not
  best-evidenced payoff.** No syllabus change is recommended, and the negation is
  not asserted either.
- **Passives are absent from the grade-8 syllabus** and are the second-best
  accuracy discriminator across bands 3–8. `07` §8.2, `08` §5.1.

**Descriptors and scoring**

- No official **criterion-to-band arithmetic**, no half-band descriptors, no
  numeric threshold for "frequent" vs "the majority of" error-free sentences.
  `02` §9.
- No independent **band-7 Pronunciation descriptor** (nor band 3 or 5) — the odd
  bands are defined purely by reference. `02` §5.1.
- No **band-9 exemplar** for Writing (`05` §5) or Speaking (`06` §5). Everything
  said about the top of the scale derives from descriptor wording.
- No **band 8–9 Speaking commentary** at all; four commentaries exist, at bands
  5, 6, 7 and 7. `02` §4, `06` §5.
- The **British Council descriptor version is unknown** — that mirror returned
  `Access Denied` — so a third wording variant cannot be excluded. `02` §1.3.
- The **Speaking descriptor PDF carries no revision date**; Speaking rubrics cite
  a retrieval date instead. `02` §1.3.

**Per skill**

- Listening: how **distractors are engineered**; whether **plural traps** are a
  designed feature (no support found); which individual **strategies** raise
  scores; whether Field's 2008 critique still describes current item-writing.
  `03` §9.
- Reading: what distinguishes **band 8–9 readers** (no study stratifies by band);
  which **question types follow text order** beyond TFNG/YNNG; the officially
  stated sub-skill for nine of the eleven types; what happens when *copy exactly*
  and *write grammatically* conflict. `04` §11.
- Writing: **trend lexis** for data charts from a Tier-1 source; an official map
  task with commentary; a Tier-1 statement on off-topic responses. `05` §7.
- Speaking: **fluency indicators**, **pronunciation ordering** and
  **lexical-resource mechanisms** all tested and not sustained; the Part 2
  preparation minute; a Part 3 question taxonomy; computer-delivered Speaking
  (not examined at all). `06` §7.

**Language foundation**

- ~~Whether high-band Lexical Resource rewards **rarity or formulaicity**~~ —
  **resolved 2026-08-08** by separating word-level from combination-level rarity.
  `07` §3.0. Four narrower gaps replace it:
- Whether **teaching** high-MI collocations raises a rated band. Every supporting
  finding is correlational or a rater-perception experiment on texts no learner
  studied; **no intervention study exists**. `07` §3.6.
- Whether **collocational accuracy** affects band outcomes. Now a **three-way
  split** — one null (Naismith & Juffs, whose authors blame their own design),
  one positive (Fritz & Ruegg, second-hand), one pair of correlations whose
  predictor and outcome are both human ratings — and **no study has manipulated
  error gravity**. `07` §3.5.
- **Any lexical feature separating band 8 from band 9.** Nearest proxy is
  Paquot's C2-vs-C1 contrast on **n = 11 C2 texts** in French-L1 academic
  writing. `07` §3.6.
- **What MI values suit A2/B1 learners.** Every MI finding comes from a
  B2-and-above population; grade-8 application is an **extrapolation, not a
  finding**. `07` §3.6.
- **Any measurable cost of coda omission**, for any L1 (`07` §5.5.7a); whether
  **coda instruction transfers to spontaneous speech** (`07` §5.5.7b); whether
  **~14 is an appropriate age** for it (`07` §5.5.7b); and whether raters charge
  an inaudible inflection to **grammar** rather than pronunciation — unexamined by
  anyone (`07` §5.5.7c).
- Band-level evidence for **conditionals, modality, reported speech, cleft or
  inversion** — none. Any claim that "inversion is a band-8 structure" would be
  invented. `07` §4.6.
- The vocabulary size reaching **98% coverage of IELTS Listening**. Do not display
  a 98% Listening figure; 3,000 families for 95% is the only defensible one.
  `07` §2.1.
- Whether bands **8.0–9.0 map to C1 or C2**, beyond the "8.5 and higher … C2" FAQ
  line. `07` §6.2a.

**Pedagogy and tooling**

- **Any absolute review-interval value.** Spacing beats massing and long beats
  short on delayed tests; nothing says "review at 1, 3, 7, 21 days". Any schedule
  shipped is an engineering choice. `09` §2.1.
- How much of the **extensive-reading effect survives unsupervised self-study**,
  and how much reading volume is enough (45 of 73 studies did not report
  fidelity). `09` §2.2.
- **No pooled effect size for shadowing** exists. `09` §2.4.
- **No IELTS washback study conducted in Vietnam** was retrieved. Every washback
  number comes from UK, Australian, NZ or Korean contexts. `09` §3.5.
- **No auto-scorable format for Coherence & Cohesion, Task Response or
  Pronunciation** — and **no scoring mechanism at all for "flexibility"**, which
  is the word the descriptors use at every band from 6 up. *The discriminator we
  most want to measure is the one we cannot.* `09` §4.2.
- Whether giving a learner a **rubric improves their self-assessment accuracy**
  is untested. Only the miscalibration is established. `09` §4.4.
- **Nothing in either evidence base evaluates an LLM as a rater** — not its
  agreement with humans, not its failure modes, not its gaming surface. Every LLM
  recommendation in `09` is `[INF]`. `09` §5.2.

### 5.3 Tested and not sustained

Logged across the files so they are not silently re-derived, with **neither the
claims nor their negations asserted**: `02` §8 (fourteen items, mostly caused by
the [2013]/[2023] version collision), `03` §3 and §4.2, `04` §3 and `05` §2.4,
§2.5, §3.3, §3.4, §4, `06` §3 and §7, `07` "Not sustained by the verification
panel", `09` §8.2.

---

## 6. Cross-cutting facts worth knowing before you read anything

- **Two official Writing descriptor documents are in circulation** with materially
  different wording. This repo derives from the **[2023]** version. Bullet-style
  descriptor wording is a **[2013]** tell. `02` §1.
- **Computer delivery is the default from mid-2026.** Listening's 10-minute
  transfer window is gone, replaced by a 2-minute review; answers are typed
  during the audio. A trainer granting ten minutes is simulating a retired test.
  `01` §9.
- **Discourse-level failures cap scripts whose sentence-level language is already
  at band 8.** An official Task 1 script credited with band-8 language was held
  at 7 by format and organisation. `02` §7 item 5.
- **The descriptors' recurring word is *flexibility*, not *complexity*.**
  Syntactic complexity measures peak at band 7 and *fall* at band 8. `07` §4.1–4.2.
- **Progress is not monotonic at A2→B1.** Rising error rate alongside rising range
  is the expected signature of progress at exactly the transition these learners
  are making. A tool reporting "your accuracy got worse" will be wrong. `07` §4.4.
- **Memorised and template language is the explicitly penalised category** — band
  0 for a wholly memorised answer, band 4 for memorised chunks — not a low-yield
  shortcut. `02` §7 items 1–4, 21.
