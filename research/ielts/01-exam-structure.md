# IELTS Exam Structure — Ground Truth

Phase 1 of the IELTS knowledge base (`research/ielts-research-plan.md`). This file
is the **spec of the test itself**: sections, timings, question types, answer
rules, and scoring mechanics. Everything downstream — band descriptors, skill
documents, the bridge map, the tooling rules — cites this file rather than
re-deriving test facts.

**Research date:** 2026-08-08.

**Source policy.** Tier 1 (binding) is ielts.org, British Council, IDP, and
Cambridge English only. Tier 2 (evidence) is used nowhere in this document —
every assertion below is Tier 1. Where exact wording carries weight (scoring
rules, instruction lines, penalties), the source is quoted verbatim.

**Verification status.** Claims were extracted from 25 sources and put through a
3-vote adversarial verification panel. Each assertion below carries one marker:

| Marker | Meaning |
| --- | --- |
| **[V]** | Passed the verification panel (vote shown, e.g. 3-0) |
| **[S]** | Quoted directly from a Tier-1 page held in the research cache, but not put through the panel |
| **[?]** | Verification attempted and errored — treat as unconfirmed |

A `> **GAP**` blockquote means the research pass did not establish something the
plan asked for. Gaps are left visible rather than filled from memory.

**Second pass, 2026-08-08 — gap closure.** Four gaps were reopened and worked by
direct Tier-1 source fetch rather than by verification panel: General Training
Writing (§11.1–11.3), computer-delivered mechanics (§9.1), paper retirement
(§9.2), and One Skill Retake (§10). Everything added in that pass is **[S]** —
quoted from a Tier-1 page, not panel-verified. One gap was closed only partially
and its blockquote is still standing: Vietnam-specific paper availability (§9.2).

---

## 1. Which variant we target

**IELTS Academic.** Cambridge English's official IELTS FAQ states: "The Academic
module is ideal if you want to study at undergraduate/postgraduate level or for
professional registration. The General Training module is normally taken by those
who want to migrate to an English-speaking country or study at below degree
level."
([Cambridge English, IELTS Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)) **[S]**

For a Vietnamese grade-8 learner whose long arc is university admission, Academic
is the correct target. The plan's default assumption is confirmed.

This matters less than it sounds: **Listening and Speaking are identical across
the two variants** — "The Speaking and Listening tests are the same in both the
Academic and the General Training tests, but the Reading and Writing tests are
different."
([ielts.org, Academic test format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail)) **[S]**
Half the exam is common ground; see §10 for the differences.

## 2. The test at a glance

| Section | Time | Items | Marking | Transfer time |
| --- | --- | --- | --- | --- |
| Listening | ~30 min audio | 40 questions, 4 parts | 1 mark per correct answer | **+10 min** |
| Reading (Academic) | 60 min | 40 questions, 3 passages, 2,150–2,750 words | 1 mark per correct answer | **none — inside the hour** |
| Writing (Academic) | 60 min | 2 compulsory tasks | Examiner, 4 criteria per task | n/a |
| Speaking | 11–14 min | 3 parts | Examiner, 4 criteria | n/a |

**[V 3-0]** for every cell above
([Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening) ·
[Reading](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading) ·
[Writing](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing) ·
[format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail)).

Listening, Reading and Writing are sat on the same day; Speaking may be up to a
week before or after
([British Council, Choose how to take your IELTS test](https://takeielts.britishcouncil.org/take-ielts/book/paper-computer)) **[S]**.

**The single most important structural asymmetry**, and the one any practice tool
must get right: Listening gives 10 extra minutes to copy answers onto the answer
sheet; Reading does not. "You must transfer your answers during the hour you are
given for the Reading test. Unlike the Listening test, no extra transfer time is
given." **[V 3-0]**
([ielts.org, Academic Reading format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading))

**But note:** the +10 minutes is a *paper* artefact — it exists because answers
must be copied onto a physical answer sheet. On computer-delivered IELTS it does
not survive; it is replaced by a 2-minute review. See §9.1. Since computer is the
default delivery mode from mid-2026 (§9.2), **§9.1 is the timing model a simulator
should implement**, and the table above describes the retiring paper test.

## 3. Listening

Four parts, 10 questions each, in recording order — "The questions are in the same
order as the information in the recording"
([format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail)) **[S]**.
Each recording is heard **once only** **[V 3-0]**.

| Part | Setting | Speakers |
| --- | --- | --- |
| 1 | Everyday, social | Conversation between two speakers |
| 2 | Everyday, social | Monologue |
| 3 | Educational / training | Discussion between two main speakers (sometimes tutor-guided) |
| 4 | Educational / training | Monologue on an academic subject |

**[V 3-0]** — "everyday, social situations … educational and training situations"
([ielts.org, Listening format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)).

Accents: "Different accents, including British, Australian, New Zealand and North
American, are used." **[S]** (same page). The Cambridge FAQ adds that a short
spoken description of the situation opens each part and is *not* printed on the
question paper, and that there are pauses to read ahead in Parts 1–3 plus an
unannounced mid-part pause in Part 4 **[S]**
([Cambridge FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)).

### 3.1 The six Listening question types

Six official types **[V 3-0]**
([Listening format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)).
The "example" column gives the official instruction line as printed on the
ielts.org sample tasks — the rubric wording a tool should reproduce, not invented
paraphrase **[S]**
([ielts.org, IELTS Listening Sample Tasks 2023](https://ielts.org/cdn/ielts-sample-tests/ielts-listening-sample-tasks-2023.pdf)).

| # | Type | What it tests (official) | Official instruction line |
| --- | --- | --- | --- |
| 1 | Multiple choice | Detailed understanding of specific points, or general understanding of main points | "Choose the correct letter, A, B or C." |
| 2 | Matching | Detailed information; following a conversation; how facts connect | "Write the correct letter, A, B or C, next to questions 21-25. You may choose any letter more than once." |
| 3 | Plan/map/diagram labelling | Understanding description of a place and relating it to a visual; following directions | "Label the plan below. Choose FIVE answers from the box and write the correct letters, A-I, next to questions 11-15." |
| 4 | Form/note/table/flow-chart/summary completion | "The main points the person listening would naturally write down" | "Complete the form below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer." |
| 5 | Sentence completion | Identifying important information; relationships such as cause and effect | "Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer." |
| 6 | Short-answer questions | Listening for facts — places, prices, times | "Answer the questions below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer." |

Note the option count: **Listening multiple choice offers three options (A/B/C)**,
where Academic Reading offers four **[S]**
([format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail)).

Marking: "Each correct answer receives 1 mark. Your final score is given as a band
score in whole or half bands, e.g. 5.5 or 7.0." **[V 3-0]**

## 4. Reading (Academic)

Three sections, total text length 2,150–2,750 words, 40 questions, 60 minutes
including transfer **[V 3-0]**
([Academic Reading format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading)).

Text sources: "books, journals, magazines, newspapers and online resources,
written for a non-specialist audience" **[V 3-0]**. Topics are "of general
interest to students at undergraduate or postgraduate level"; styles may be
"narrative, descriptive or discursive/argumentative"; **"At least one text
contains detailed logical argument"**; technical vocabulary, if used, gets a
simple dictionary definition **[S]**
([format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail)).

Time economics per the Cambridge FAQ: "You have 60 minutes to read three texts and
answer 40 questions. You should spend about 20 minutes on each text." **[S]**

### 4.1 The eleven Academic Reading question types

**[V 2-1]** for the eleven-type list
([Academic Reading format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading)).
A competing claim that there are *fourteen* named types (splitting
summary/note/table/flow-chart completion into four) was put to the panel and **not
sustained** (vote 1-2) — so this document uses eleven, and treats the four-way
split as presentation, not as separate types.

Descriptions and the quoted question stems below are official wording **[S]**
([format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail)).

| # | Type | Defining mechanic | Official stem / rule |
| --- | --- | --- | --- |
| 1 | Multiple choice | Four options (A–D), or a stem with four endings; sometimes a longer list with multiple answers required | Questions follow text order |
| 2 | Identifying information (True/False/Not Given) | About the *information* in the text | "Do the following statements agree with the information in the text?" — "'False' means that the statement contradicts the information in the text. 'Not given' means that the statement neither agrees with nor contradicts the information in the text." |
| 3 | Identifying writer's views/claims (Yes/No/Not Given) | About the *writer's* views or claims | "Do the following statements agree with the views of the writer?" — "'No' means that the statement contradicts the writer's view or claim." |
| 4 | Matching information | Locate specific information in lettered paragraphs; paragraphs may repeat or go unused | "You may use any letter more than once" |
| 5 | Matching headings | Roman-numeral headings to paragraphs; **always more headings than paragraphs**; "No heading may be used more than once" | Tests main idea vs supporting idea |
| 6 | Matching features | Statements to a list of features from the text; options may repeat or go unused | "You may use any option more than once" |
| 7 | Matching sentence endings | More endings than beginnings; beginnings follow text order | Tests understanding of main ideas |
| 8 | Sentence completion | Words taken **from the text**; word limit applies | Questions follow text order |
| 9 | Summary/note/table/flow-chart completion | Two variants: select words from the text, **or** choose from a lettered word list | "The answers may not come in the same order as in the text" |
| 10 | Diagram label completion | Labels drawn from a description in the text | Answers may not follow text order |
| 11 | Short-answer questions | Factual detail, answers taken from words in the text | Answers follow text order |

The Not Given rule that decides bands 7–9 on these items, quoted in full because
learners systematically get it wrong: *"You must be careful not to use any
information you already know about the topic of the text when choosing your
answer."* **[S]**

Marking: "Each correct answer receives 1 mark. Your final score is given as a band
score from 1–9 in whole or half bands, e.g. 4 or 6.5." **[V 3-0]**

> **GAP** — not established in this research pass: the number of questions per
> Reading question type. Every official type description answers "How many
> questions are there?" with "Variable". Any tool that generates a full practice
> paper is therefore choosing its own distribution, and must say so.

> **GAP** — not established in this research pass: an official worked Reading item
> per question type. The ielts.org Reading sample-task PDFs were not captured in
> this pass (the Listening and Academic Writing sample-task PDFs were). The stems
> above are official rubric wording, not full worked items.

## 5. Writing (Academic)

60 minutes, two compulsory tasks **[V 3-0]**
([Academic Writing format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing)).

| | Task 1 | Task 2 |
| --- | --- | --- |
| Prompt | Describe visual information in your own words (graph, table, chart or diagram) | A point of view, argument or problem to discuss |
| Minimum length | 150 words | 250 words |
| Suggested time | ~20 min | ~40 min |
| Register | "academic or semi-formal/neutral" | "academic or semi-formal/neutral" |
| Weight | 1/3 of the Writing band | **2/3 of the Writing band** |

Official task rubric, verbatim from the ielts.org sample tasks **[S]**
([IELTS Academic Writing Sample Tasks 2023](https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf)):

- **Task 1** — "You should spend about 20 minutes on this task. … Summarise the
  information by selecting and reporting the main features, and make comparisons
  where relevant. … Write at least 150 words."
- **Task 2** — "You should spend about 40 minutes on this task. Write about the
  following topic: … Give reasons for your answer and include any relevant
  examples from your own knowledge or experience. … Write at least 250 words."

Task 1 sub-genres seen in the official samples: chart, graph, and **process
diagram** ("The diagram below shows the process by which bricks are manufactured
for the building industry") **[S]** — the process genre carries a different
language system (passives, sequencing) from the data genres, which matters for
Phase 3.

### 5.1 Weighting — the rule tools must implement

"Task 2 contributes twice as much as Task 1 to the Writing score." **[V 3-0]**
([Academic Writing format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing)).
So a computed Writing band = (Task 1 × 1 + Task 2 × 2) / 3.

Within each task, the four criteria — Task achievement (Task 1) / Task response
(Task 2), Coherence and cohesion, Lexical resource, Grammatical range and accuracy
— are **weighted equally**, and "the score on the task is the average" **[V 2-0]**
([ielts.org scoring in detail](https://www.ielts.org/take-a-test/your-results/ielts-scoring-in-detail)).
"Each task is assessed independently" **[S]**
([ielts.org, IELTS Writing Key Assessment Criteria](https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf)).

### 5.2 Penalties and constraints

All **[S]**, from the ielts.org format-in-detail page and the Cambridge FAQ:

- Answers must be "a whole piece of connected text" — notes or bullet points are
  penalised.
- Off-topic writing is penalised.
- "You will be severely penalised if your writing is plagiarised" — and the FAQ
  warns directly against memorised essays: "Don't waste your time learning essays
  by heart to use in the exam. You will be penalised for this."
- Under-length: "There is no direct penalty for writing fewer than 150 words … 250
  words … However, writing fewer words may impact on the range of ideas and
  evidence produced and may therefore affect your score." Note the tension with
  the format page's "will be penalised if your answer is too short" — the FAQ is
  the more precise statement of mechanism.
- Over-length is not penalised directly, but costs time for Task 2 and for
  checking.
- All-capitals writing is not automatically penalised, "However … punctuation is
  assessed in the Writing test and you may be penalised if it is not clear to the
  examiner where your sentences begin and end."
- Introductions/conclusions have "no separate assessment", but omitting them "may
  be penalised under 'Task response' and/or 'Coherence and cohesion'."
- Task 1 asks for description, not explanation: "you do not need to guess about
  the reasons for things in Task 1."

## 6. Speaking

11–14 minutes, three parts, face-to-face with an examiner, and **recorded**
("The recording is needed in case your performance needs to be re-marked") **[V 3-0]** / **[S]**
([format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail) ·
[Cambridge FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)).

| Part | Name | Length | What happens | Skills tested (official) |
| --- | --- | --- | --- | --- |
| 1 | Introduction and interview | 4–5 min | ID check, then general questions on familiar topics — home, family, work, studies, interests | "give opinions and information on everyday topics and common experiences or situations" |
| 2 | Long turn | 3–4 min **including** 1 min preparation | Task card with points to cover; pencil and paper for notes; talk for 2 minutes; examiner may ask one or two follow-up questions | "speak at length on a given topic, using appropriate language and organising your ideas logically" |
| 3 | Discussion | 4–5 min | Issues related to the Part 2 topic, "in a more general and abstract way and, where appropriate, in greater depth" | "explain your opinions and to analyse, discuss and speculate about issues" |

**[V 3-0]** on the timings and structure; the quoted skill statements are **[S]**.

Operational details from the Cambridge FAQ **[S]** that a speaking tool should
mirror: the candidate may start before the full preparation minute is up; notes
are optional; do not write on the task card; self-correction is fine; the examiner
gives no feedback; being stopped at 2 minutes in Part 2 is normal, not a failure.

## 7. Scoring mechanics

### 7.1 The 9-band scale

Public descriptors of the overall scale **[S]**
([ielts.org, Understanding and setting IELTS scores](https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring)):

| Band | Skill level | Official gloss (abridged) |
| --- | --- | --- |
| 9 | Expert | "fully operational command of the language … appropriate, accurate and fluent, and shows complete understanding" |
| 8 | Very good | "fully operational command … only occasional unsystematic inaccuracies … handle complex and detailed argumentation well" |
| 7 | Good | "operational command … occasional inaccuracies … generally handle complex language well and understand detailed reasoning" |
| 6 | Competent | "effective command … despite some inaccuracies … reasonably complex language, particularly in familiar situations" |
| 5 | Modest | "partial command … copes with overall meaning in most situations" |
| 4 | Limited | "basic competence is limited to familiar situations" |
| 3 | Extremely limited | "conveys and understands only general meaning in very familiar situations" |
| 2 | Intermittent | "great difficulty understanding spoken and written English" |
| 1 | Non-user | "no ability to use the language except a few isolated words" |
| 0 | Did not attempt | — |

The scale stops at 9. There is no 9.5 — consistent with the plan's framing that
the target is the band-9 competencies themselves, not score maximisation.

### 7.2 Overall band rounding

"The overall band score is the average of the four section band scores rounded to
the nearest half band. […] If the average of the four sections ends in .25, the
overall band score is rounded up to the next half band, and if it ends in .75, the
overall band score is rounded up to the next whole band." **[V 3-0]**
([ielts.org scoring in detail](https://www.ielts.org/take-a-test/your-results/ielts-scoring-in-detail))

So: 6.125 → 6.0; 6.25 → 6.5; 6.75 → 7.0. Rounding is **up** at both .25 and .75 —
there is no .25-rounds-down case.

### 7.3 Raw score → band: published benchmarks, not a conversion table

**Read this before building any score calculator.** ielts.org publishes four
benchmark points per section and explicitly frames them as *averages*: "Here are
the average number of marks scored at different levels of the IELTS scale … The
precise number of marks needed to achieve these band scores will vary slightly
from test version to test version." **[V 3-0]**
([scoring in detail](https://www.ielts.org/take-a-test/your-results/ielts-scoring-in-detail) ·
[understanding IELTS scoring](https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring))

Marks out of 40:

| Band | Listening | Academic Reading | General Training Reading |
| --- | --- | --- | --- |
| 8 | 35 | 35 | — |
| 7 | 30 | 30 | 35 |
| 6 | 23 | 23 | 30 |
| 5 | 16 | 15 | 23 |
| 4 | — | — | 15 |

**[V 3-0]**. Note the one-mark difference between Listening (16) and Academic
Reading (15) at band 5, and note that GT Reading sits a full band lower at every
row — see §10.

Because Academic and GT Reading "are graded on the same scale" while Academic
texts "may contain texts which feature more difficult vocabulary or greater
complexity of style", "It is usual that a greater number of questions must be
answered correctly on a General Training Reading test to secure a given band
score." **[S]**

> **GAP** — not established in this research pass: a full 0–40 → band conversion
> table. Only the four benchmark rows above are published, and they are averages
> that shift by test version. **Any tool in this repo that maps a raw score to a
> band must present it as an estimate anchored on these benchmarks, never as an
> exact conversion.** This is a hard build rule, not a caveat.

### 7.4 Writing vs Speaking criterion weighting — an asymmetry to respect

**Writing: equal weighting is confirmed.** "The criteria are weighted equally and
the score on the task is the average." **[V 2-0]**
([scoring in detail](https://www.ielts.org/take-a-test/your-results/ielts-scoring-in-detail))

**Speaking: equal weighting could NOT be verified.** The claim "Speaking is scored
on four equally weighted criteria" went to the panel and **all three verifier
votes errored** — zero valid votes. **[?]** It is unconfirmed, not refuted.

The raw Tier-1 page held in the research cache does carry the statement — "Each of
the criteria carry equal weighting and the overall average gives the IELTS score
for Speaking" **[S]**
([ielts.org, Understanding and setting IELTS scores](https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring)) —
but it has not been through verification, and the official *IELTS Speaking Key
Assessment Criteria* document, which defines all four criteria in detail, states
no weighting at all
([ielts.org, Speaking Key Assessment Criteria](https://ielts.org/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf)).

**Consequence for our tooling:** do not copy the Writing weighting rule into a
Speaking scorer on the assumption that the two work alike. Either re-verify this
claim in Phase 2 against the Speaking band descriptors, or have any Speaking
self-review tool report the four criteria separately without averaging them into a
single band.

### 7.5 The four criteria, named

| Writing (per task) | Speaking |
| --- | --- |
| Task achievement (T1) / Task response (T2) | Fluency and coherence |
| Coherence and cohesion | Lexical resource |
| Lexical resource | Grammatical range and accuracy |
| Grammatical range and accuracy | Pronunciation |

**[V 3-0]**
([Academic Writing format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing) ·
[format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail)).
Band-by-band deconstruction of these eight criteria is Phase 2's job
(`02-band-descriptors.md`).

## 8. Answer-recording rules a practice tool must enforce

These are the mechanical rules that cost real marks. All **[V 3-0]** or **[S]**
from ielts.org and the Cambridge FAQ.

| Rule | Applies to | Official wording |
| --- | --- | --- |
| Spelling and grammar are marked | Listening + Reading | "you will lose marks for incorrect spelling and grammar" **[V 3-0]** |
| Both UK and US spellings accepted | Listening | "Both UK and US spellings are accepted" **[S]** |
| Word limits are hard | Listening + Reading | "Answers which are over the word limit will be marked as incorrect" **[S]** |
| Hyphenated words count as one | Listening + Reading | "Hyphenated words such as 'check-in' count as single words" **[S]** |
| Contractions are never tested | Listening + Reading | "Contracted words such as 'they're' will not be tested" **[S]** |
| Numbers may be figures or words | Reading short-answer | "Numbers can be written using figures (1, 2, etc.) or words (one, two, etc.)" **[S]** |
| Never write two answers for one gap | Listening + Reading | "Even if one of your answers is correct, you will not receive a mark" **[S]** |
| Reading answers must come from the text | Reading | "Answers must be taken from words in the text" **[S]** |
| Reading transfer happens inside the hour | Reading | "No extra time is allowed to copy answers to the answer sheet" **[S]** |

Official answer keys accept documented variants — e.g. the Listening sample key
lists "0.75 m/metre(s)/meter(s) (wide) / three(-)quarter(s) (of) (a) metre/meter
(wide) / ¾ m (wide) / 75 cm(s) (wide)" as all correct for one gap, with the note
"Words in brackets are optional - they are correct, but not necessary" **[S]**
([Listening Sample Tasks](https://ielts.org/cdn/ielts-sample-tests/ielts-listening-sample-tasks-2023.pdf)).
An auto-marker that does exact string matching will under-score learners; ours
needs a variant list per answer.

## 9. Delivery modes, and the 2026 change

Three modes currently exist **[S]**
([British Council, Choose how to take your IELTS test](https://takeielts.britishcouncil.org/take-ielts/book/paper-computer)):

- **On paper at a test centre** — Listening/Reading/Writing on paper; Speaking
  face-to-face or by video call.
- **On computer at a test centre** — "This is exactly the same test as IELTS on
  paper, but instead of writing your answers on paper, you will type them on a
  computer."
- **IELTS Online** (Academic only) — at home; Speaking by video call, usually
  before the other sections.

For IELTS Online, the British Council states that "All other aspects of the test
are exactly the same … including: content, timings, question types, scoring,
speaking test format, test report forms, results verification." **[S]**

**The transition.** "Therefore, from mid-2026 IELTS will no longer be available on
paper. All IELTS tests will be delivered on computer. In some locations we will
introduce a **Writing on Paper** option." **[S]** (same page). This is confirmed
and superseded in more precise wording by ielts.org's own announcement — see §9.2.

### 9.1 Computer-delivered mechanics — what a simulator must imitate

The following are the interface mechanics of computer-delivered IELTS, all **[S]**
from IDP's official explainer
([ielts.idp.com, How computer-delivered IELTS works](https://ielts.idp.com/prepare/article-how-computer-delivered-ielts-works)).
Direct source fetch, 2026-08-08; not panel-verified. **A caveat on source
breadth:** the British Council pages
(`takeielts.britishcouncil.org/take-ielts/book/paper-computer` and the
computer-delivered equivalent) were unreachable throughout this pass — every
request timed out — so §9.1 rests on **one** Tier-1 co-owner rather than two.
Treat the mechanics below as sound but singly-sourced, and re-confirm against
British Council before shipping a simulator that claims fidelity.

**The headline finding — the 10-minute transfer is gone.**

> "No extra time will be given to transfer your answers. You will only have
> **2 minutes to review your answers** at the end of the test." **[S]**

This resolves the open question directly. On computer, Listening's +10 minutes
does **not** survive; it is replaced by a 2-minute review window. The transfer
step existed only because answers had to be copied onto a paper answer sheet, and
with no answer sheet there is nothing to transfer. Answers are typed into the
on-screen fields **as the recording plays**, not afterwards. This is a real change
in task demand, not a cosmetic one: the paper test let a candidate scribble rough
answers and tidy them in a protected 10-minute block, and the computer test does
not. **Any Listening trainer we build must drill answer entry concurrent with
audio, and must not offer a 10-minute grace period.**

| Feature | Computer-delivered behaviour **[S]** |
| --- | --- |
| Listening extra time | **None.** 2 minutes to review at the end, in place of the paper test's 10-minute transfer |
| Reading extra time | None (unchanged from paper — transfer was always inside the hour) |
| Navigation | Buttons for all 40 questions along the bottom of the screen; forward/back arrows between items |
| Review / flag | A **Review** function marks a question for later checking; flagged items render as **circles** instead of squares in the question bar |
| Reading layout | "The texts are in the left corner of the screen, while the questions are on the right" — split screen, text and questions visible together |
| Reading annotation | Text can be **highlighted in different colours**, and notes added on-screen |
| Writing layout | Question on the left, answer area on the right |
| Writing word count | **Yes — a live word count in the lower-left corner.** Responses auto-save |
| Timer | On-screen stopwatch, upper-middle. "This chronometer starts to flash in the last 10 minutes and 5 minutes before reading and writing tests end" |
| Section timings | Unchanged from paper: ~30 min Listening, 60 min Reading, 60 min Writing, 11–14 min Speaking |

Two consequences worth stating plainly:

1. **The word counter changes what "at least 150/250 words" means as a skill.**
   On paper, estimating length is itself a trained sub-skill (counting words per
   line, tracking lines). On computer it is a solved problem the interface hands
   over. A practice tool should show a live count, because the real test does —
   but our teaching should not spend time on manual word-estimation drills.
2. **Reading highlighting and note-taking are official on-screen affordances**, not
   improvisations. A Reading trainer that renders text as inert HTML with no
   highlight tool is *less* capable than the real exam, and will train a strategy
   the candidate cannot execute on the day.

### 9.2 Paper retirement — the current position

ielts.org's own announcement, **published 05 March 2026** and therefore current as
of this document's research date **[S]**
([ielts.org, Updates to IELTS test delivery](https://ielts.org/news-and-insights/updates-to-ielts-test-delivery)):

> "from mid-2026, we will no longer offer IELTS as a paper-based test. All IELTS
> tests will be delivered on computer."

> "In selected markets, we will introduce 'Writing on Paper'. This update will
> allow test takers to personalise their test experience by handwriting their
> answers to the 'Writing' component on paper if they choose."

> "Exact timelines will vary by market."

Also from that announcement **[S]**: existing results are unaffected — "All
current paper-based test results are not affected and will remain valid until the
end of the recommended two-year period"; IELTS for UKVI (SELT) "will only be
available in the fully digital format"; and One Skill Retake "must be taken in the
same delivery mode as the original test" (see §10).

**What "Writing on Paper" actually is** — it is *not* the old paper test kept
alive. It is a variant of the computer test **[S]**
([ielts.org, IELTS on computer, Writing on paper](https://ielts.org/take-a-test/test-types/ielts-on-computer-writing-on-paper)):

> "Writing on Paper enables you to take your IELTS test on computer and complete
> the Writing component by hand."

| Component | Writing on Paper delivery **[S]** | Time |
| --- | --- | --- |
| Listening | On computer | 30 min |
| Reading | On computer | 60 min |
| Writing | **Questions on computer. Handwritten responses.** | 60 min |
| Speaking | With an examiner | 11–14 min |

So Listening and Reading are computer-delivered in **every** current mode —
including Writing on Paper. §9.1's mechanics therefore apply to Listening and
Reading regardless of which option a learner books. Only the Writing response
medium varies. Further **[S]** from the same page: "'Writing on Paper' will be
available in selected countries from mid-2026"; it "is not available for test
takers taking an IELTS for UKVI test"; and "You will receive your results within
five days of your test date. Your IELTS Test Results Form will not specify that
you chose the Writing on Paper option."

**A live inconsistency on ielts.org, recorded rather than resolved.** The
organisations-facing "ways to take IELTS" page still describes IELTS on paper in
the present tense — "Test takers who opt to take the test on paper will sit at a
desk with question-and-answer papers for the Listening, Reading, and Writing
sections", results "13 days after test completion" **[S]**
([ielts.org, Ways to take IELTS](https://ielts.org/organisations/ielts-for-organisations/test-types/ways-to-take-ielts)).
This page has not been updated to match the 05 March 2026 announcement. Where the
two conflict, the dated announcement is the later and more specific statement and
governs. But it means **a stale page is not evidence that paper survives** in any
given market, and equally is not evidence that it has gone.

> **GAP (partially open)** — **Vietnam specifically is not established from a
> Tier-1 source.** The global rule is settled (paper discontinued from mid-2026),
> but "Exact timelines will vary by market" and no official page names Vietnam's
> cut-off date. What was searched: IDP's Vietnam site
> ([ielts.idp.com/vietnam](https://ielts.idp.com/vietnam)) promotes only
> computer-delivered IELTS (results "trong khoảng 2 ngày" / in about 2 days) and
> One Skill Retake, and **makes no mention of paper-based testing at all** — which
> is suggestive but is absence of evidence, not a statement. `ielts.idp.com/vietnam/book`,
> `/vietnam/book/test-format` and `/vietnam/about/computer-delivered` all 404;
> every `britishcouncil.vn` and `takeielts.britishcouncil.org` request timed out
> across the whole pass. **Resolve by checking live booking availability on the
> Vietnamese IDP and British Council booking engines**, which is a question about
> bookable dates rather than about published policy.

**Design implication — and it is now a firm one.** Build for a **computer-delivered
interaction model**: typing, on-screen timer, on-screen answer entry, a Listening
section with a 2-minute review and no transfer block, a live word counter in
Writing, and highlight/note tools in Reading. Whether a given Vietnamese learner
handwrites their Writing response (the Writing on Paper option) is a variation on
top of that model, not an alternative to it. A paper answer-sheet simulator would
now be training for a test that no longer exists.

> **GAP** — not established in this research pass: any 2024–2026 change to test
> *format* (sections, timings, question types). The only 2024–2026 changes this
> pass established are the delivery-mode transition above and a cosmetic Test
> Report Form change ("From 15 July we will be updating our Test Report Forms to
> ensure they meet Ofqual requirements" — the addition of the Ofqual logo and
> qualification title; no effect on test content or scoring) **[S]**
> ([ielts.org, Changes to Test Report Forms](https://ielts.org/news-and-insights/changes-to-test-report-forms)).
> Absence of evidence is not evidence of absence — this should be re-checked
> against ielts.org before we publish any "the test has not changed" claim.

## 10. IELTS One Skill Retake

One Skill Retake (OSR) lets a test taker re-sit a single section rather than the
whole test. All of the following are **[S]** from the official booking page
([ielts.org, IELTS One Skill Retake](https://ielts.org/take-a-test/booking-your-test/one-skill-retake)),
fetched directly on 2026-08-08. This supersedes the earlier uncaptured *Teacher's
guide* quotation, which said only "within 60 days" — the 60-day figure is
confirmed, now with a canonical URL behind it.

**Eligibility — all three conditions must hold:**

| Condition | Official wording |
| --- | --- |
| Participating centre | "you have completed a full test at a centre that offers IELTS One Skill Retake" |
| Computer-delivered original | "your full test was an IELTS on computer test" |
| 60-day window | "you sit your IELTS One Skill Retake within 60 days of your full IELTS test" |

**The window is book *and* sit, not book-by:** "You need to book and take an IELTS
One Skill Retake within 60 days of your original test."

**One retake only:** "you can only complete one retake for each full IELTS test."
There is no second bite — a failed OSR means re-sitting the full test.

**Which skill:** any one of the four (Listening, Reading, Writing or Speaking).
Available for both Academic and General Training.

**How the result is reported:**

> "You will receive a new Test Report Form. This includes your updated IELTS One
> Skill Retake score as well as the results for the other three skills in the
> original test. **You can choose whether you use your original or your new Test
> Report Form.**"

That last clause matters: an OSR that goes *worse* than the original is not
destructive — the candidate keeps both forms and submits whichever is stronger.

**Delivery mode must match.** From the March 2026 delivery announcement (§9.2),
OSR "must be taken in the same delivery mode as the original test" **[S]**
([Updates to IELTS test delivery](https://ielts.org/news-and-insights/updates-to-ielts-test-delivery)).
A learner who sat the original under the Writing on Paper option retakes under it
too. Note the interaction with §9.2: as paper is retired and **all** tests become
computer-delivered, the "must have been an IELTS on computer test" condition stops
excluding anyone. OSR eligibility broadens automatically as a side effect of the
delivery transition.

**Acceptance is the institution's decision, not IELTS's** — and this is the single
most important thing to tell a learner:

> "We recommend that you check with the organisation directly to see if they
> accept IELTS One Skill Retake before booking your test."

A university is under no obligation to accept an OSR-composed Test Report Form.
**Never present OSR to a learner as a safety net for a weak section.** It is a
conditional option whose value depends entirely on the receiving institution, and
it costs a separate fee ("Prices will vary, so please contact your local test
centre").

**Availability:** "IELTS One Skill Retake is widely available in many countries.
For specific availability, please check with your test centre." No official
country list is published.

**Vietnam:** IDP's Vietnamese site advertises OSR as available to Vietnamese test
takers — "cho phép bạn thi lại 1 kỹ năng (Nghe, Đọc, Viết hoặc Nói)" ("allows you
to retake 1 skill — Listening, Reading, Writing or Speaking") **[S]**
([ielts.idp.com/vietnam](https://ielts.idp.com/vietnam)). This is a marketing page
rather than a policy page, so treat it as evidence of availability through IDP
Vietnam specifically, not as a guarantee for every Vietnamese centre. The official
instruction stands: check with the centre.

## 11. General Training — differences only

Academic is our target; this section exists so the difference is on record.

**Identical across variants:** Listening and Speaking — same paper, same format,
same scoring **[S]**
([format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail);
Cambridge FAQ: "Is the Listening paper different for Academic and General
Training? No. All candidates take the same paper.").

**GT Reading** — same shell (60 minutes including transfer, 3 sections,
2,150–2,750 words, 40 questions, 1 mark each, same 11 question types), different
content **[S]**
([ielts.org, GT Reading format](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading)):

| Section | Content | Structure |
| --- | --- | --- |
| 1 | "Everyday topics … the sort of texts that a person would need to be able to understand when living in an English-speaking country" — notices, advertisements, timetables | Two or three short texts, or several shorter texts |
| 2 | Work topics — "job descriptions, contracts, staff development and training materials" | Two texts |
| 3 | "A topic of general interest", descriptive and instructive, "longer and more complex" than Sections 1–2; from newspapers, magazines, books and online resources | One long text |

**GT Reading scores harder.** Same 1–9 scale, but the band thresholds sit a full
band apart from Academic at every published benchmark — 15/23/30/35 marks buy
bands 4/5/6/7 in GT versus 5/6/7/8 in Academic **[V 3-0]** (§7.3). A learner
comparing practice scores across variants without knowing this will badly
misjudge their level.

### 11.1 GT Writing

Same shell as Academic: 60 minutes, two compulsory tasks, Task 2 worth twice Task
1, same four assessment criteria. "Both the Academic and General Training Writing
Modules consist of two tasks, Task 1 and Task 2. Each task is assessed
independently. The assessment of Task 2 carries more weight in marking than Task
1" **[S]**
([Writing Key Assessment Criteria](https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf)).

**Task 1 is a letter. Always a letter.** All **[S]** from the official GT Writing
format page
([ielts.org, GT Writing format](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-writing)):

> "In General Training Writing Task 1, you are given a situation and you need to
> write a response of **at least 150 words in the form of a letter**."

> "Depending on the task, the letter may be **personal, semi-formal or formal** in
> style."

> "The question paper tells you what information to include in the form of **three
> bullet points**."

Skills the official page names for Task 1 **[S]**: asking for and providing
factual information; expressing needs, wants, likes and dislikes; expressing
opinions and complaints. Responses must be in full sentences — notes and bullet
points are penalised, as in Academic (§5.2) — and the register must suit the
stated recipient.

**Task 2 is a discursive essay** — "In General Training Writing Task 2, you need to
write a semi-formal/neutral discursive essay of a minimum of 250 words" **[S]**,
about 40 minutes, on a topic of general interest.

### 11.2 The official GT rubric, verbatim

From the ielts.org sample tasks **[S]**
([IELTS General Training Writing Sample Tasks 2023](https://ielts.org/cdn/Sample-tests/ielts-general-training-writing-sample-tasks-2023.pdf)).
This is the exact printed frame a GT Task 1 always uses — situation, addressed
recipient, three bullets, length, address waiver, prescribed salutation:

> **WRITING TASK 1**
>
> You should spend about 20 minutes on this task.
>
> *You live in a room in college which you share with another student. However,
> there are many problems with this arrangement and you find it very difficult to
> work.*
>
> *Write a letter to the accommodation officer at the college. In the letter*
>
> - *describe the situation*
> - *explain your problems and why it is difficult to work*
> - *say what kind of accommodation you would prefer*
>
> Write at least 150 words.
>
> You do NOT need to write any addresses.
>
> Begin your letter as follows:
>
> Dear Sir or Madam,

The second published sample is structurally identical — a situation, then "Write a
letter to the librarian. In your letter" followed by three bullets ("describe what
you like about the library / say what you don't like / make suggestions for
improvements"), the same length line, address waiver and salutation. **The frame
is fixed; only the situation and the three bullets vary.**

**GT Task 2 is rubric-identical to Academic Task 2.** The sample tasks print it
word for word the same as §5's Academic rubric **[S]**:

> **WRITING TASK 2**
>
> You should spend about 40 minutes on this task.
>
> Write about the following topic:
>
> […]
>
> Give reasons for your answer and include any relevant examples from your own
> knowledge or experience.
>
> Write at least 250 words.

The only stated difference is register framing — GT Task 2 is described as
"semi-formal/neutral", Academic as "academic or semi-formal/neutral" — and topic
selection, GT leaning to general-interest subjects. **Structurally, timing-wise,
length-wise and rubric-wise there is no difference.** For our purposes: any Task 2
essay work trains both variants at once. Task 1 is where the two diverge
completely.

### 11.3 Verdict on the bridge-map claim — it does not hold

`08-bridge-map.md` is expected to claim that this course's **Unit 7 notice-writing**
and **Unit 9 instruction-writing** lessons train "Task 1 General genres." On the
evidence above, **that claim is false as stated and must be corrected before the
bridge map ships.**

GT Task 1 admits exactly one genre — a letter, to a named or role-identified
recipient, opened with a salutation, in one of three registers, covering three
supplied bullets, at 150+ words. A notice and a set of instructions are neither
letters nor addressed to a recipient, and neither takes a salutation. There is no
official GT Task 1 variant that is a notice, and none that is a set of
instructions. The confusion is traceable and worth naming so it is not repeated:
**notices and instructions do appear in General Training — but in GT *Reading*
Section 1** ("notices, advertisements, timetables", §11 table) and in GT Reading
Section 3, which is "descriptive and instructive". They are texts a GT candidate
must *read*, not texts a GT candidate is ever asked to *write*.

What Unit 7 and Unit 9 genuinely buy us, stated so the bridge map can claim
something true instead:

| Course lesson | What the bridge map should NOT claim | What it can defensibly claim |
| --- | --- | --- |
| Unit 7 — notice writing | "Trains GT Task 1" | Trains **audience-appropriate register and concision**, and builds familiarity with the notice as a *text type read* in GT Reading Section 1. No direct Academic Writing transfer. |
| Unit 9 — instruction writing | "Trains GT Task 1" | Trains **sequencing, imperative/procedural language and step ordering** — which transfers to **Academic Writing Task 1 process-diagram description** (§5: passives, sequencing), not to GT Task 1. |

The Unit 9 → Academic Task 1 *process* link is the genuinely valuable one, and it
is the one the current claim obscures. Since this course targets **Academic**
(§1), a GT Task 1 justification was the wrong bridge to build in the first place.
If the bridge map wants a real GT Task 1 lesson, it needs a **letter-writing**
lesson: three-bullet prompt, fixed salutation, register selected from
personal / semi-formal / formal.

## 12. What this document fixes for everything downstream

Eight facts from above become build constraints, and are restated in
`09-design-principles.md` when it is written:

1. **On paper, Reading has no transfer time and Listening has ten minutes — but on
   computer, Listening's ten minutes become a 2-minute review** (§9.1). Since
   computer is the default from mid-2026, build the 2-minute model and require
   answer entry during the audio. A timer that grants ten minutes is simulating a
   retired test.
2. **Task 2 is worth twice Task 1.** Writing band = (T1 + 2·T2) / 3.
3. **Writing's four criteria are equally weighted; Speaking's weighting is
   unconfirmed.** Score Writing as an average; report Speaking criteria
   separately until §7.4 is resolved.
4. **Raw-to-band is an estimate.** Four published benchmark averages, varying by
   test version. No exact conversion table exists to implement.
5. **Spelling, word limits, and hyphen/contraction conventions carry marks** in
   Listening and Reading — and answer keys accept documented variants, so exact
   string matching is wrong.
6. **Computer delivery is the default from mid-2026** — paper is discontinued
   (§9.2). Build for typing and on-screen answering, not answer sheets.
7. **The computer interface has affordances the exam expects candidates to use**
   (§9.1): a live word counter in Writing, colour highlighting and on-screen notes
   in Reading, a question-navigation bar and a Review flag. A trainer lacking these
   is less capable than the real test and trains unusable strategies.
8. **GT Task 1 is a letter and only a letter** (§11.1–11.3). Notice-writing and
   instruction-writing do not train it. `08-bridge-map.md` must not claim they do;
   Unit 9's procedural language maps to **Academic** Task 1 process description
   instead.

## Sources

**Tier 1 — binding.** All were used above.

| Source | URL |
| --- | --- |
| ielts.org — IELTS Academic test format in detail | https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail |
| ielts.org — IELTS Academic: Listening test format | https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening |
| ielts.org — IELTS Academic: Reading test format | https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading |
| ielts.org — IELTS Academic: Writing test format | https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing |
| ielts.org — Academic sample test questions | https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test |
| ielts.org — IELTS scoring in detail | https://www.ielts.org/take-a-test/your-results/ielts-scoring-in-detail |
| ielts.org — Understanding and setting IELTS scores | https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring |
| ielts.org — IELTS Listening Sample Tasks (2023) | https://ielts.org/cdn/ielts-sample-tests/ielts-listening-sample-tasks-2023.pdf |
| ielts.org — IELTS Academic Writing Sample Tasks (2023) | https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf |
| ielts.org — IELTS Writing Key Assessment Criteria | https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf |
| ielts.org — IELTS Speaking Key Assessment Criteria | https://ielts.org/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf |
| ielts.org — IELTS General Training: Reading test format | https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading |
| ielts.org — IELTS General Training: Writing test format | https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-writing |
| ielts.org — IELTS General Training Writing Sample Tasks (2023) | https://ielts.org/cdn/Sample-tests/ielts-general-training-writing-sample-tasks-2023.pdf |
| ielts.org — General Training sample test questions | https://ielts.org/take-a-test/preparation-resources/sample-test-questions/general-training-test |
| ielts.org — IELTS One Skill Retake | https://ielts.org/take-a-test/booking-your-test/one-skill-retake |
| ielts.org — Updates to IELTS test delivery *(news, 05 March 2026 — paper retirement)* | https://ielts.org/news-and-insights/updates-to-ielts-test-delivery |
| ielts.org — IELTS on computer, Writing on paper | https://ielts.org/take-a-test/test-types/ielts-on-computer-writing-on-paper |
| ielts.org — Updates to IELTS Writing test delivery mode | https://ielts.org/organisations/ielts-for-organisations/test-types/ways-to-take-ielts/updates-to-ielts-writing-test-delivery-mode |
| ielts.org — Ways to take IELTS *(note: not updated for the 2026 transition — see §9.2)* | https://ielts.org/organisations/ielts-for-organisations/test-types/ways-to-take-ielts |
| ielts.org — Changes to Test Report Forms *(news, 11 June 2026)* | https://ielts.org/news-and-insights/changes-to-test-report-forms |
| IDP — How computer-delivered IELTS works *(sole source for §9.1)* | https://ielts.idp.com/prepare/article-how-computer-delivered-ielts-works |
| IDP Vietnam — IELTS in Vietnam *(marketing page; used only for OSR availability, §10)* | https://ielts.idp.com/vietnam |
| Cambridge English — IELTS Academic FAQs | https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf |
| British Council — Choose how to take your IELTS test *(cited from the earlier research cache; **unreachable on 2026-08-08** — all requests timed out)* | https://takeielts.britishcouncil.org/take-ielts/book/paper-computer |
| IELTS — *Teacher's guide to IELTS* *(official PDF in the research cache; canonical URL still not captured — its 60-day OSR claim is now superseded by the sourced §10)* | — |

**Tier 2 — evidence.** None cited. This document is Tier 1 only by design; Tier 2
enters from Phase 2 onward.

**Not sustained.** One claim was put to the verification panel and failed: that
Academic Reading has *fourteen* named question types (vote 1-2). This document
uses the eleven-type list, which passed 2-1. A failed claim is unproven, not
disproven — the four-way split of summary/note/table/flow-chart completion is
simply not established as an official type boundary.
