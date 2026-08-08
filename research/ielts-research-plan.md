# Deep-Research Plan: An IELTS Foundation for Everything We Build

**Goal.** Build a durable, source-verified IELTS knowledge base so that every
lesson, tool, and test in this project does double duty: it teaches the
English 8 curriculum *and* moves the learner along a measurable path toward
IELTS band 9.

**Scale note.** IELTS tops out at **band 9.0** — there is no 9.5. Band 9 in
Writing/Speaking means performance matching the public band-9 descriptors
(roughly CEFR C2). So the target is not "test tricks for a high score" but
*the underlying language competencies the descriptors describe*, taught from
grade-8 level upward. That framing is itself a design principle: descriptors
first, question formats second.

**Where the learner starts.** The GDPT 2018 curriculum places grade 8 at
roughly A2 moving toward B1. IELTS band 9 is C2. The research must therefore
produce not just "what IELTS tests" but a **bridge map**: which band-9
competencies have precursors we can start training now, at A2/B1, inside the
existing 12-unit structure.

---

## Phase 1 — The exam, exactly as it is

*Establish ground truth about the test before anything else. Everything
downstream cites this.*

**Research questions**

- Full structure of IELTS Academic and General Training: sections, timing,
  question counts, question types per section. Which variant do we target?
  (Default assumption: **Academic**, since the long-term goal for a Vietnamese
  student is usually university admission — confirm.)
- Raw-score → band conversion for Listening and Reading (published tables).
- How Writing and Speaking are scored: the four criteria each, equal
  weighting, half-band mechanics, overall band rounding rules.
- Computer-delivered vs paper differences (matters for what our tools should
  simulate).
- The 2024–2026 changes, e.g. One Skill Retake, any format updates — verify
  against ielts.org, not blogs.

**Primary sources** (authoritative only for this phase): ielts.org,
British Council takeielts, IDP, Cambridge English. Secondary sources may fill
gaps but never override these.

**Deliverable** → `research/ielts/01-exam-structure.md` — a spec of the test:
every section, every question type with one worked example each, timing,
scoring mechanics, conversion tables.

## Phase 2 — Band descriptors, deconstructed

*This is the heart of the project. The public band descriptors define what
"band 9" concretely means; our rubrics, feedback tools, and lesson targets
all derive from them.*

**Research questions**

- For **Writing** (Task Achievement / Task Response, Coherence & Cohesion,
  Lexical Resource, Grammatical Range & Accuracy) and **Speaking** (Fluency &
  Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation):
  what exactly distinguishes each band from 4 through 9, criterion by
  criterion? Build the delta table: "what changes between band 6 and band 7
  in Lexical Resource" etc.
- What do examiner-annotated sample answers reveal? Cambridge publishes
  scored scripts with examiner comments; ielts.org publishes samples. Collect
  the *reasons* given for each score.
- Common band ceilings: what specific behaviours cap candidates at 6.5 or 7
  (memorised language, overused linkers, mechanical templates, limited
  flexibility in Part 3, etc.)?
- Pronunciation criterion specifics: which features (chunking, stress,
  intonation, individual sounds) appear at which bands — this connects
  directly to our existing per-unit phonology strand.

**Deliverable** → `research/ielts/02-band-descriptors.md` — per-criterion band
ladders (4→9) with delta tables, plus a "band ceiling behaviours" list, each
claim tied to a descriptor phrase or examiner comment.

## Phase 3 — Skill-by-skill knowledge base

*One document per skill: the question types, the sub-skills they probe, and
the known failure modes.*

**Listening** — the four parts and their genres; question types (form/note
completion, matching, map labelling, MCQ…); distractor engineering (how
recordings set up and cancel wrong answers); spelling/plural traps; why
Part 3 and 4 discriminate high bands.

**Reading** — passage sources and difficulty profile; every question type,
especially True/False/Not Given vs Yes/No/Not Given; paragraph-heading
matching; time economics (20 min per passage); what separates band 8–9
readers (speed *and* precision, vocabulary depth).

**Writing** — Task 1 Academic genres (line/bar/pie/table/process/map) and
their language systems (trend lexis, comparison, passives for processes);
Task 2 question archetypes (opinion, discussion, advantage/disadvantage,
problem/solution, double question) and what band-9 responses actually look
like — position clarity, progression, precision over decoration.

**Speaking** — Parts 1/2/3 mechanics; what Part 3 rewards (speculation,
evaluation, abstraction); long-turn structure for Part 2; fluency features
(chunking, self-repair) that examiners score.

**Deliverables** → `research/ielts/03-listening.md`, `04-reading.md`,
`05-writing.md`, `06-speaking.md`.

## Phase 4 — The language foundation behind the bands

*What vocabulary, grammar, and phonology actually carry a candidate up the
scale — the trainable substance.*

**Research questions**

- **Vocabulary:** which word lists matter and in what order — Oxford
  3000/5000 (CEFR-graded), Academic Word List / Academic Vocabulary List,
  topic lexis frequency across past papers (education, environment,
  technology, health, work, culture — note the overlap with our unit themes).
  What does "Lexical Resource band 9" mean in corpus terms: precision,
  collocation, idiomaticity — not rare words.
- **Grammar:** map grammatical structures to bands (complex sentences,
  conditionals, modality, passives, cleft/inversion for emphasis). Where does
  the grade-8 grammar syllabus sit on this ladder, and what's the sequence
  above it?
- **Phonology:** the pronunciation feature set IELTS scores, mapped against
  our U1–U12 phonology strand (segmentals → stress → intonation — our
  progression already mirrors the descriptor ladder; verify and exploit).
- **CEFR anchoring:** published IELTS↔CEFR alignments, so every lesson can
  carry an honest "this trains toward X" label.

**Deliverable** → `research/ielts/07-language-foundation.md` — band-graded
vocabulary strategy, grammar ladder, phonology map, CEFR crosswalk.

## Phase 5 — Bridge map: English 8 → IELTS

*The payoff document: connect what we already teach to where it leads.*

- Per unit: which IELTS competencies each lesson already trains, and the
  cheapest upgrades that add IELTS value without breaking grade-8 level.
  Seeds already visible in the syllabus:
  - The **balanced-argument-then-position** move (U6, U8, U11 writing) *is*
    Task 2's discussion/opinion structure in miniature — teach it as one
    reusable schema from the start.
  - The 80–100w paragraph genre is a Task 2 body paragraph; topic sentence →
    support → example is Coherence & Cohesion training.
  - U9 instructions and U7 notice train Task 1 General genres.
  - The phonology strand (contrasts → stress → intonation) maps directly onto
    the Speaking pronunciation criterion.
  - Report-back speaking tasks (U1, U3, U8, U10) are proto-Part 2 long turns.
- Define the **post-grade-8 arc**: what a follow-on course (B1→B2→C1) must
  cover, so today's design decisions don't dead-end.

**Deliverable** → `research/ielts/08-bridge-map.md` — a per-unit alignment
table plus the longer arc.

## Phase 6 — Pedagogy and product implications

*Turn knowledge into build rules for this repo.*

- Evidence on what works: retrieval practice and spaced repetition for
  lexis; task-based writing feedback; shadowing/recording for speaking;
  extensive vs intensive reading for band growth; the washback literature
  (teaching to descriptors vs teaching to tricks).
- Assessment design: how to write **band-aligned rubrics** usable in
  self-study (checklists a learner can self-apply, or an LLM tool can apply);
  what auto-scorable exercise formats exist for each sub-skill; honest
  progress metrics (e.g. "can produce a 3-clause complex sentence accurately"
  rather than fake band predictions).
- Tooling opportunities ranked by leverage: vocabulary trainer keyed to
  CEFR/AWL bands with spaced repetition; writing feedback tool scoring
  against the four criteria; listening player with distractor-annotated
  transcripts; speaking recorder with descriptor-based self-review.

**Deliverable** → `research/ielts/09-design-principles.md` — the build
constitution: rules every future lesson/tool/test must satisfy (e.g. "every
writing exercise names the criterion it trains", "every rubric line traces to
a descriptor phrase", "no band promises the format can't support").

---

## Source policy

1. **Tier 1 (binding):** ielts.org, British Council, IDP, Cambridge English —
   test facts, descriptors, official samples.
2. **Tier 2 (evidence):** Cambridge IELTS 1–19 examiner-commented scripts,
   IELTS Research Reports, applied-linguistics literature, CEFR companion
   volume. We study *structure and findings*; we never copy test content —
   same originality rule the README already sets for the textbook.
3. **Tier 3 (leads only):** prep-industry blogs and teacher sites — useful
   for spotting patterns and failure lore, but every claim gets verified
   against Tier 1/2 before it enters the knowledge base.

Every knowledge-base file carries its sources inline, the way
`curriculum/syllabus.md` already does.

## Execution order and effort

| Order | Phase | Depth | Why this order |
| --- | --- | --- | --- |
| 1 | Exam structure (P1) | Medium | Ground truth; fast to verify |
| 2 | Band descriptors (P2) | **Deep** | Everything else keys off it |
| 3 | Writing + Speaking (P3 half) | **Deep** | Productive skills = where descriptors bite and where our tools can help most |
| 4 | Language foundation (P4) | Deep | Feeds vocabulary/grammar tooling |
| 5 | Listening + Reading (P3 half) | Medium | Receptive skills; format knowledge |
| 6 | Bridge map (P5) | Medium | Needs P1–P4 done |
| 7 | Design principles (P6) | Medium | Synthesis; written last, cited forever |

Each phase is independently useful the day it lands; nothing blocks the
existing site. Phases 1–2 are the minimum before we should let IELTS claims
into any lesson or tool.

## Definition of done

The research is "foundation" when:

- [ ] `research/ielts/` holds the nine documents above, all Tier-1/2 sourced.
- [ ] Every band-9-relevant claim traces to a descriptor phrase, official
      document, or examiner comment.
- [ ] The bridge map covers all 12 units with at least one concrete,
      grade-8-appropriate IELTS upgrade each.
- [ ] `09-design-principles.md` gives a checklist that any new lesson, tool,
      or test in this repo can be audited against.
