# IELTS Listening — Format, Mechanics, and What the Evidence Supports

**What this is.** Phase 3b of the IELTS knowledge base (see
`../ielts-research-plan.md`), companion to `04-reading.md`. A source-verified
description of what the IELTS Listening test is, how answers are actually
marked, and what published research says about the listening the test demands.
It is a curriculum reference, not a prep guide: every entry exists so that a
lesson, a rubric, or a listening tool built in this repo can trace its claim to
a document.

**Research date.** 2026-08-08.

**Source policy.** Tier 1 (binding): ielts.org, British Council, IDP, Cambridge
English — test facts, marking rules, official sample tasks. Tier 2 (evidence):
IELTS Research Reports and Cambridge Studies in Language Testing — tendencies
and cognitive findings, never rules of the test. Tier 3 (prep-industry lore) is
never a warrant here; where it appears it is the *object* of a claim, not the
support for one. Section 7 audits the folklore explicitly.

**Verification legend.** This pass generated 100 candidate claims from 20
sources; 25 went through adversarial verification (21 confirmed, 4 not
sustained) — the highest confirmation rate of the six research runs. Format and
mechanics are therefore on solid ground. The cognitive and strategy material is
Tier 2 and labelled as such.

| Tag | Meaning |
| --- | --- |
| **[C]** | Confirmed — passed adversarial verification this pass; vote shown, e.g. `C 3-0` |
| **[Q]** | Tier-1 verbatim — quoted directly from a primary document in the research cache; the quote *is* the claim, with no interpretation layered on it |
| **[T2]** | Tier-2 evidence — a research finding about tendencies or cognition; not a rule of the test |
| **[X]** | Tested, not sustained — an interpretation adversarial verification refused. **Neither it nor its negation is asserted here**; it is logged so it is not silently re-derived later |

A `> **GAP**` blockquote marks something the plan asked for that this research
pass did not establish. Gaps are left visible rather than filled from memory.

---

## 1. The test, exactly as it is

| Fact | Status | Evidence |
| --- | --- | --- |
| Approximately 30 minutes of recording, **plus a separate 10 minutes** to transfer answers | **[C]** 3-0 | "Approximately 30 minutes (plus 10 minutes to transfer your answers to an answer sheet)" ([Academic format — Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)) |
| 4 parts, 40 questions, 10 questions per part | **[C]** 3-0 | "The test is in four parts, with 40 questions in total." ([Sample test questions](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)) |
| Each correct answer = 1 mark; reported in whole or half bands | **[C]** 3-0 | "Each correct answer receives 1 mark" … "Your final score is given as a band score in whole or half bands" ([Academic format — Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)) |
| Identical paper for Academic and General Training | **[C]** 3-0 | "The Listening test is the same for both IELTS Academic and IELTS General Training and consists of four recorded monologues and conversations." ([Sample test questions](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)); "Is the Listening paper different for Academic and General Training? No. All candidates take the same paper." ([Cambridge Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)) |
| The recording is heard **once** | **[Q]** | "How many times do I hear the recording? You will hear each recording ONCE only." ([Cambridge Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)) |
| Questions follow the order of the recording — **for every question type** | **[Q]** | "Are the questions in the same order as the information in the recording? Yes. This is true for all question types in IELTS Listening." ([Cambridge Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)) |

That last row is the single most consequential design fact for anyone building
practice material. It is stated without qualification and it holds across all
task types — which is *not* true of Reading (see `04-reading.md` §4.3, where text
order is official for TFNG/YNNG and a recorded **GAP** for every other type).
*(Pointer corrected 2026-08-08: this line previously cited `04` §6, which is Time
economics.)*

### 1.1 What the candidate is given before each part

Three separate provisions, all Tier 1, all from the
[Cambridge Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf) **[Q]**:

- A spoken scene-setter: "At the beginning of each part you will hear a short
  description of the situation you are about to listen to. This may give
  information about who the speakers are, where they are and what the general
  topic is. **This description is not written on the question paper**, so it is
  important to listen carefully."
- Reading time: "there is time to look at the questions before each set of
  questions. The voice on the recording will tell you which questions to look
  at."
- An asymmetric pause structure: "there is one break during Parts 1, 2 and 3 to
  allow you time to look at the following questions. **In Part 4 there is a
  short pause in the middle of the recording** to allow you time to refocus if
  required, but this is not mentioned on the recording. The time for reading all
  Part 4 questions is given at the start of the part."

Part 4 is thus mechanically different from Parts 1–3: all ten questions must be
previewed in one block up front, and the mid-part pause is unannounced.

> **Teaching implication.** Any listening exercise we build should include an
> unwritten spoken orientation before the audio and a fixed preview window
> before the questions. Removing either changes the task. For Part-4-style
> tasks, preview all questions at once.

---

## 2. The four parts

| Part | Domain | Speakers | Official example |
| --- | --- | --- | --- |
| 1 | Everyday, social | Conversation, two speakers | "a conversation about travel arrangements" |
| 2 | Everyday, social | Monologue, one speaker | "a speech about local facilities" |
| 3 | Educational and training | Conversation, two main speakers, "perhaps guided by a tutor" | "two university students in discussion" |
| 4 | Educational and training | Monologue, one speaker | "only one person speaks on an academic subject" |

All wording verbatim from the
[Academic format — Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)
page **[C]** 3-0.

**A precision point that matters.** The official page defines the escalation
across the four parts as a **shift of domain** — social to academic — and does
*not* frame it as a difficulty ramp **[C]** 3-0. The "four sections in
increasing levels of difficulty" formula does exist: Field records it as the
wording of the test instructions themselves ([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 6) **[T2]**. But the same chapter reports test data in which the highest
error rate fell in Section 3 in two versions out of three, and the *lowest* in
Section 3 in the remaining one — "Yet the instructions for the whole test
specify: 'Four sections in increasing levels of difficulty'" **[T2]**. So:
domain escalates monotonically; difficulty, empirically, does not.

### 2.1 Why Parts 3 and 4 carry the discrimination

Three converging Tier-2 lines, none of them an official statement:

**Observed performance gradient.** Phakiti's study of 376 international students
on a simulated IELTS Listening test found: "test-takers tended to perform better
in Sections 1 (63%, SD = 22.33) and 3 (58%, SD = 27.37), which involved
conversational and transactional test tasks, than in Sections 2 (46%, SD = 23)
and 4 (32%, SD = 21), which involved monologue test tasks"
([Phakiti 2016](https://ielts.org/cdn/Research/test-takers-performance-appraisals-appraisal-calibration-state-trait-strategy-use-and-state-trait-ielts-listening-difficulty-phakiti-2016.pdf))
**[T2]**. Section 1 versus Section 4 was a large effect (Cohen's *d* = 1.33).

Note what that gradient actually tracks: **monologue versus dialogue**, not part
number. Section 3 (dialogue, academic) outscored Section 2 (monologue, social).

**The CEFR mapping in the item-writer guidelines.** Field quotes the IELTS Item
Writer Guidelines: "'Sections 1 and 2 of the test focus primarily on
intermediate level listening skills (CEFR B1, B2) and Sections 3 and 4 on
upper-intermediate/advanced listening skills (CEFR C1)'"
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 2) **[T2]**. This is the closest thing to an official statement that the
academic parts are where high bands are separated — but it reaches us
second-hand through a research volume, not from a public IELTS page.

**Information density, not duration.** Recording lengths across the four parts
are close (Section 1: 650–750 words; Section 2: 700–850; Section 3: 800–950;
Section 4: 750–850). Field's conclusion: "It is then not the duration of the
recording that creates difficulty but the density of the information that it
includes. A short passage with tightly packed information can place particularly
heavy cognitive demands upon a learner because of the speed at which the detail
has to be integrated into an overall picture."
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 6) **[T2]**

**The intuition that dialogue is easier is explicitly challenged.** "There is
sometimes an assumption in testing circles that dialogue material is necessarily
less demanding than monologue… There is some logic in this: information in
dialogues is often more thinly distributed and/or repeated between speakers."
But: "It can be considerably more demanding in a seminar setting to switch
between two speakers and to follow two distinct lines of argument than to listen
to a single lecturer whose presentation includes well-placed signposting"
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 6) **[T2]**.

> **Teaching implication.** The trainable variable that the evidence actually
> names is **information density per unit of time**, not speed and not
> vocabulary difficulty. A grade-8 listening task can be made harder in the
> IELTS direction by packing more distinct facts into the same 90 seconds
> without raising the lexical level at all.

---

## 3. Question types

The official inventory is **six categories** **[C]** 3-0, quoted verbatim from
the [Academic format — Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)
page:

| # | Type | Notes from official material |
| --- | --- | --- |
| 1 | Multiple choice | Sample uses three options, A/B/C |
| 2 | Matching | Sample uses a shared option set reused across items ("You may choose any letter more than once") |
| 3 | Plan/map/diagram labelling | — |
| 4 | Form/note/table/flow chart/summary completion | Counted as **one** category officially, despite five named formats |
| 5 | Sentence completion | — |
| 6 | Short-answer questions | — |

**[X]** A proposed alternative inventory — that the official list names **ten**
task types, splitting form/note/table/flow-chart/summary completion into five
separate entries — was **tested and not sustained** (0-3). Neither that claim
nor its negation is asserted here. What is confirmed is the six-category list
above. One genuine wrinkle worth recording: the
[Listening Sample Tasks PDF](https://ielts.org/cdn/ielts-sample-tests/ielts-listening-sample-tasks-2023.pdf)
opens by naming only five — "multiple choice, matching, plan/map/diagram
labelling, form/note/table/flow-chart/summary completion, sentence completion"
**[Q]** — while itself containing a worked short-answer sample. Treat the
format page's six as authoritative and the sample PDF's five as an omission in
that document's front matter.

### 3.1 Worked examples from the official sample set

These are drawn from the
[Listening Sample Tasks PDF](https://ielts.org/cdn/ielts-sample-tests/ielts-listening-sample-tasks-2023.pdf)
**[Q]**. They are cited to show what the published tasks *do*; they are not
reproduced as course content.

**Multiple choice (Part 1).** Instruction: "Choose the correct letter, A, B or
C." Item 9, "Type of insurance chosen", options Economy / Standard / Premium.
The tapescript names all three options in order and defines them, then the
customer says: "Oh I've been stung before with Economy insurance so I'll go for
the highest." Key: **C** (Premium). Item 10, delivery destination, options
port / home / depot; the agent offers all three, the customer answers "The
port'd be fine — I've got transport that end." Key: **A**.

**Matching (Part 3).** Instruction: "What does Jack tell his tutor about each of
the following course options?" with the option set "A He'll definitely do it. /
B He may or may not do it. / C He won't do it." and the rubric "You may choose
any letter more than once." Five course names are discussed in order; keys are
C, A, B, B, C.

**Short-answer (Part 2).** Instruction: "Write NO MORE THAN THREE WORDS AND/OR A
NUMBER for each answer." Paired items are keyed **"in either order"**.

### 3.2 The answer key conventions — directly relevant to auto-marking

The sample answer keys carry an explicit legend: **"Words in brackets are
optional - they are correct, but not necessary. Alternative answers are
separated by a slash (/)."** **[Q]** Worked instance from the short-answer
sample: the key for one item is `(the) (public) library/libraries`, and paired
items 11 & 12 are marked "in either order".

> **Teaching implication.** Any auto-marked listening exercise in this repo
> should implement exactly this key grammar — optional bracketed tokens,
> slash-separated alternates, and order-free pairs — rather than inventing its
> own. It is published, it is unambiguous, and copying it means our feedback
> matches what a real answer key would accept.

---

## 4. The mechanical marking rules

These are binding, they are the reason marks are lost that comprehension had
already earned, and a practice tool that ignores them teaches the wrong thing.

| Rule | Status | Verbatim |
| --- | --- | --- |
| Marks lost for incorrect spelling and grammar | **[C]** 3-0 | "will lose marks for incorrect spelling and grammar" ([Academic format — Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)) |
| Exceeding the stated word limit forfeits the mark | **[C]** 3-0 | "You will lose the mark for writing more than the word limit" (ielts.org); "Answers which are over the word limit **will be marked as incorrect**." ([Cambridge Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)) **[C]** 2-0 |
| Hyphenated words count as one word | **[C]** 3-0 | "Hyphenated words such as 'check-in' count as single words" ([Academic format — Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)) |
| Contracted forms are not tested | **[C]** 3-0 | "Contracted words such as 'they're' will not be tested." (same page) |
| Both UK and US spellings accepted | **[Q]** | "Both UK and US spellings are accepted." ([Cambridge Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)) |
| Names may be spelled out in the recording | **[Q]** | "When you hear the name of a person, place, company, etc., in the recording, it may be spelled out." (same) |
| Two answers where one is required scores zero | **[Q]** | "Don't write more than one answer when only one is required. Even if one of your answers is correct, you will not receive a mark." (same) |
| Illegible transfer loses the mark | **[Q]** | "If an answer isn't clear on your answer sheet, you will lose the mark." (same) |

The instruction line in the official sample tasks reads **"Write NO MORE THAN
THREE WORDS AND/OR A NUMBER for each answer"** and, on a sentence-completion
task, **"Write NO MORE THAN TWO WORDS for each answer"** **[Q]** — the limit is
per-task, printed on the task, and varies.

### 4.1 Two further official instructions that read like strategy but are rules

- **Do not paraphrase.** "Don't try to rephrase what you hear. Try to write down
  the words you hear which fit the question." ([Cambridge Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf))
  **[Q]** This is the opposite of what good writing instruction rewards, and it
  is official.
- **Do not copy surrounding text.** "Don't copy any words before or after the
  gaps on the question paper when you transfer your answers to the answer
  sheet." (same) **[Q]**

Field's independent description of the same constraint: "'The sentence frame
may well paraphrase information from the text, but the words to be inserted are
often to be taken verbatim from the recording and rarely from a larger unit than
a lexical chunk'"
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 9, quoting Field 2013) **[T2]**.

### 4.2 Delivery mode changes the timing — a tool must pick one

| Mode | Transfer provision | Status |
| --- | --- | --- |
| Paper | 30 min recording **+ 10 separate minutes** to transfer | **[C]** 3-0 |
| Computer-delivered | **No transfer window**; "only have 2 minutes to review your answers at the end" | **[C]** 3-0 ([IDP](https://ielts.idp.com/prepare/article-how-computer-delivered-ielts-works)) |

Compare Reading, where the 60 minutes *includes* transfer in both modes and "no
extra transfer time is given" **[C]** 3-0 — see `04-reading.md` §1.

**[X]** Two related propositions were tested and **not sustained** (0-3 each),
and are recorded so they are not re-derived: (a) that the absence of a transfer
window means computer-delivered candidates must type each answer at the moment
they hear it rather than noting it first; (b) that IDP states the two delivery
modes are equivalent in timing, evaluation and question types. Neither claim nor
its negation is asserted here.

> **Teaching implication.** A listening tool must declare which mode it
> simulates and enforce that timing. Ten minutes of quiet transfer is a
> different task from two minutes of on-screen review, and practising the wrong
> one trains a habit that costs marks.

### 4.3 Are spelling rules fair in a listening test? An open question, honestly flagged

Field raises it without settling it: "This raises the interesting question of
whether or not awareness of correct spelling and grammar can justifiably be
included as part of the marking criteria for a test of listening comprehension.
One practical argument in support of this policy is that it helps to ensure
marking consistency."
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 9) **[T2]** Field's own recommendation to item writers, from the earlier
report, was "to allow more latitude both on acceptable responses and on
spelling"
([Field 2008](https://ielts.org/cdn/Research/cognitive-validity-of-lecture-based-question-in-ielts-listening-paper-field-2008.pdf),
§6.1.1) **[T2]**. That is a proposal, not the rule. The rule is §4 above.

> **GAP** — not established in this research pass: **plural traps**
> specifically. The plan asked for "spelling/plural traps". Nothing in the
> Tier-1 material or the Tier-2 volumes addresses singular/plural marking in
> Listening answers as a distinct phenomenon; the SiLT 53 subject index carries
> "Spelling" but no plurals entry. The general rule ("lose marks for incorrect
> spelling and grammar") plainly covers a wrong plural, but the widely-taught
> claim that plurals are a *deliberately engineered* trap has no support in
> this evidence base.

---

## 5. Distractor engineering — what can and cannot be said

The plan asked how recordings "set up and cancel wrong answers". This is the
weakest-evidenced section in the document and the honest answer has three parts.

### 5.1 What is officially confirmed

That distractors exist and are meant to mislead is stated only obliquely, and by
a researcher rather than by the test owners. Field, in the Cambridge volume:
"In the case of (e.g.) a multiple-choice distractor, the text in question is
designed to mislead the listener – thus (ironically) providing the very opposite
of the support that, in real-world circumstances, a student would derive from a
lecturer's PowerPoint slide."
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Introduction) **[T2]**

On how they get into the recording, the same volume describes only the
production route, not the design principle: semi-scripted material "enables them
to manipulate the original text by editing its language and even by introducing
MCQ distractors (sometimes with unfortunate consequences for information
density)" (Ch. 7) **[T2]**.

And on what the candidate must actually do with them: "We tend to assume that
the sole goal of the test taker is to identify the correct option out of three
or four; but self-report protocols show that test takers feel themselves obliged
not simply to seek a match for the correct option but also to **disqualify the
incorrect ones**" (Ch. 9) **[T2]**. That doubles the processing load relative to
a naive model of the task.

### 5.2 What the published sample tasks demonstrably do

This is direct Tier-1 evidence, obtained by reading the official tapescripts
against their keys rather than by taking anyone's word for the mechanic. In the
[Listening Sample Tasks PDF](https://ielts.org/cdn/ielts-sample-tests/ielts-listening-sample-tasks-2023.pdf)
**[Q]**:

**All options are spoken.** In the multiple-choice sample, the shipping agent
names every one of Economy, Standard and Premium — and separately every one of
home, depot and port. Hearing an option word is therefore worth nothing. Both
items are decided by a *later* utterance from the other speaker.

**The key is delivered by reference, not by name.** The customer never says
"Premium". He says "I'll go for the highest", which is only resolvable by having
retained the agent's earlier ranking ("the highest comprehensive cover which is
Premium rate"). Answering requires holding a scale in memory across turns and
then resolving a superlative back onto it.

**In the matching sample, the answer is the speaker's stance, and stance is
revised in mid-conversation.** Jack's five verdicts are expressed as "I'd rather
do something completely new", "I'll sign up for that, then", "anyway I'll think
about that one", "I might wait until then to decide", "Oh, I'll forget about
that one, then". The keys (C, A, B, B, C) turn on modality and commitment — will
/ might / think about — not on any content word from the course titles.

That is as far as the evidence goes. It is a description of two published
samples, and it is stated here as such.

> **GAP** — not established in this research pass: **the general mechanics of
> distractor engineering in IELTS Listening.** No official document in the
> corpus describes how distractors are constructed. A targeted search of the
> Cambridge volume for a speaker stating something and then correcting,
> retracting or revising it — the "cancellation" pattern the plan asked about —
> returned nothing; the terms *trap*, *decoy*, *self-correction* and
> *changes his mind* do not appear in that sense anywhere in the volume. The
> pattern is visible in the sample above — Jack says of Introduction to Cultural
> Theory "I'm quite interested in that too", then after the tutor's warning
> concludes "Oh, I'll forget about that one, then" (key: **C, he won't do it**) —
> but generalising from two published tasks to a design rule would be invention.
> Anything a lesson asserts about "the recording will always say the wrong answer
> first" is, on this evidence, **teacher lore with no official or research
> basis**.

One adjacent finding that cuts the *other* way and is worth knowing: item
difficulty is also affected by wording overlap in the candidate's favour. "A
little-discussed factor determining an item's relative difficulty is the extent
to which its wording follows that of the recording. This potentially provides
the candidate with an easy indicator of where in the recording an answer is to
be found – and thus rewards the type of strategic 'key word' technique that
crammers are all too prone to recommend."
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 10) **[T2]**

---

## 6. What Part 4 actually demands — the cognitive evidence

The best single source on this is Field's 2008 IELTS-funded study of the
lecture-based section. It is Tier 2, it is now old, and its conclusions were
critical of the format. Everything in this section is a research finding about
what candidates *do*, not a rule about what the test *is*.

### 6.1 The model of listening

The Cambridge volume sets out a five-stage model: **input decoding → lexical
search → parsing → meaning construction → discourse construction**
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 5, "a simplified version based on Field 2008, 2013") **[T2]**. Definitions,
verbatim:

- *Input decoding* — "Listeners have first to decode the input – linking
  sensations reaching their ears to the sounds of the language being spoken."
- *Lexical search* — "matching groups of syllables to known words. Again, this
  is more demanding than one might suppose because of the way in which word
  forms change in connected speech".
- *Parsing* — "words then have to be retained in sequence in the listener's mind
  until such time as a syntactic pattern (e.g. Subject – Verb – Object) becomes
  evident and the string of words can be parsed into a phrase or clause."
- *Meaning construction* — "The linguistic form of the signal is then converted
  into a unit of information… Meaning construction draws upon the listener's
  world knowledge, recall of the current topic of conversation and impression of
  the speaker's apparent intentions."
- *Discourse construction* — "the new piece of information is added to what the
  listener has understood of the exchange up to now."

The stages are not strictly sequential: "the reverse arrows serve to remind us
that listening is not a purely linear progression."

The bottleneck for L2 listeners sits at the bottom: "L2 learners have to focus
heavily on perceptual processes (input decoding, lexical search and parsing). So
long as this is the case, they have insufficient…" capacity for the rest
(Ch. 5) **[T2]**. Phakiti reaches the same conclusion from the other direction —
his lowest-ability groups "could not adequately reach levels four and five of
listening comprehension"
([Phakiti 2016](https://ielts.org/cdn/Research/test-takers-performance-appraisals-appraisal-calibration-state-trait-strategy-use-and-state-trait-ielts-listening-difficulty-phakiti-2016.pdf))
**[T2]**.

> **Teaching implication.** This model, not a band table, is what a phonology
> strand is for. Our U1–U8 segmental and cluster work is *input decoding*
> training; U9–U12 stress and intonation work sits at the boundary of decoding
> and parsing. Naming the stage a lesson trains is more honest than naming a
> band.

### 6.2 The four meaning-building operations gap-filling removes

Field's central finding about the note-completion format used in Part 4: "In
process terms, the level of detail and the organisational structure of the notes
mean that the candidate is not required to undertake certain critical meaning
building operations which would normally play a central part in lecture
listening"
([Field 2008](https://ielts.org/cdn/Research/cognitive-validity-of-lecture-based-question-in-ielts-listening-paper-field-2008.pdf),
§3.3.1) **[T2]**. The four he names:

1. "distinguishing main points from subsidiary ones"
2. "distinguishing new propositions from instances of rephrasing and exemplification"
3. "recognising the argument relationships that link propositions"
4. "integrating incoming information into an ongoing discourse representation"

His summary judgement: "The focus of the testing, in other words, is very much
'bottom-up' in that what the candidate has to contribute chiefly takes the form
of lexical matching." **[T2]**

### 6.3 Candidates listen for words, not for meaning — with evidence

- "The protocols suggested that much of the processing was at a very local
  level. A number of participants who had scored quite well in the test condition
  were unable to report the two main topics of the lecture in question, to expand
  upon what the lecturer had said or to trace links between the points that were
  made." (§5.2) **[T2]**
- A participant, verbatim: "'my my method to + listen to to do the IELTS
  listening + yeah I just look at the words not focus what it is about'" — from
  a candidate who scored 8/10 (quoted in both
  [Field 2008](https://ielts.org/cdn/Research/cognitive-validity-of-lecture-based-question-in-ielts-listening-paper-field-2008.pdf)
  and [SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf) Ch. 8) **[T2]**
- Correct answers without comprehension: "some of the participants reported
  having located a correct word without understanding its significance to the
  lecture as a whole." Two participants wrote the correct answer *low frequency*
  while interpreting it as meaning "infrequency". (§3.3.2, §5.1) **[T2]**
- The counter-intuitive control result: participants identified the lecture's
  main points **better** in a free note-taking condition than in the test
  condition. "The test method may have served to distract attention from the
  main points." (§3.3.3) **[T2]** Roughly a third of participants found free
  note-taking *easier* than answering the questions, despite the cues the
  questions supplied ([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf), Ch. 8) **[T2]**.

Field is explicit that gap-filling is not note-taking: "the notes have not been
generated by the candidate and therefore represent an unseen text that has to be
mastered. The test format demands a combination of reading, listening and
writing." (§5.3) **[T2]** And: "the test methods used in connection with Paper 4
appear to make considerably heavier cognitive demands upon the candidate than
would a real-life situation." (§5.3) **[T2]**

### 6.4 The strategic properties candidates exploit

Two structural features, both officially true, that candidates convert into
technique:

- **Answers follow text order.** "they relied on the convention that the order
  of the questions closely follows the order in which the information occurs in
  the recording." (§5.1) **[T2]** — and this convention is Tier-1 confirmed (§1).
- **Answers are widely spaced.** "The information targeted needs to be quite
  widely spaced to allow participants to tune out partially in order to focus
  attention on the missing word (and pay due heed to its spelling) before tuning
  in again to anticipate the next piece of information." (§5.1) **[T2]** One
  participant reported that while writing an answer, the speaker "was speaking
  about something else not important for the test." (§3.3.2) **[T2]** Field's
  later analysis confirms the spacing is real: "Items in the IELTS samples appear
  well enough spaced to allow test takers to internalise their content, match it
  to the recording and identify a response."
  ([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf), Ch. 10) **[T2]**

The corresponding failure mode is a cascade: "a listener fails to match an item
to the relevant piece of information in the text and goes on listening for it
long after it is past – thus missing the answers to subsequent items as well."
(§5.3) **[T2]**

**A finding that contradicts standard EAP teaching.** The two techniques most
emphasised in lecture-listening materials were barely used: "two techniques for
lecture listening which are much discussed in EAP listening materials … namely,
paying heed to prominent items … and to discourse markers … were little
reported." Discourse markers accounted for 0 instances in one text and 2 in the
other; prominence, 1 and 0. (§3.3.2) **[T2]**

> **Teaching implication.** "Listen for signposting language" is a staple of
> listening instruction and, in this study, candidates did not do it. That does
> not make signposting useless — it makes it something that has to be *trained
> into automaticity*, not merely named. And the single-play, widely-spaced
> structure means the recoverable skill worth teaching most is **losing your
> place and finding it again**, which no textbook exercise practises.

### 6.5 What separates strong from weak listeners — mostly a gap

Field found **no significant correlation** between IELTS lecture-section score
and the ability to report propositional content from a lecture heard under
non-test conditions (*r*s = 0.43 and 0.53, both n.s., N = 13 each) **[T2]**. His
sample was small and he says so. The clearest process-level contrast he offers
is about depth, not proficiency: candidates "proved capable of scoring IELTS
points by providing the locally-based information that the tests required; but
they were not able to achieve what successful lecture attendance would normally
demand – a coherent account of the main points of the lecture and the ways in
which they were linked." (§6.1.3) **[T2]**

Phakiti's structural model gives one usable relationship: state cognitive
strategy use had "a direct positive influence on IELTS Listening test
performance" (β = 0.55, R² = 0.30, medium effect; falling to 0.36 with
difficulty factors in the model), and metacognitive strategy use "closely
regulated cognitive strategy use" (γ = 0.93, R² = 0.86)
([Phakiti 2016](https://ielts.org/cdn/Research/test-takers-performance-appraisals-appraisal-calibration-state-trait-strategy-use-and-state-trait-ielts-listening-difficulty-phakiti-2016.pdf))
**[T2]**.

> **GAP** — not established in this research pass: **which individual listening
> strategies help or hurt.** Phakiti reports relationships only between latent
> composites in a structural equation model. There is no correlation table
> linking a named strategy to a score, and no finding that any particular
> strategy is counterproductive. Any lesson claiming "strategy X raises your
> listening score" is unsupported by this evidence base.

### 6.6 Calibration: the one robust individual-difference finding

Phakiti's headline result is about self-assessment, not listening: "test-takers
were miscalibrated in their performance appraisals, exhibiting a tendency to be
overconfident across the four test sections. Their appraisal calibration scores
were found to be worst for very difficult questions." **[T2]** Specifics:

- "74% (Section 3) to 86% (Section 1) of the test-takers were miscalibrated
  (either over- or underconfident)"
- "in very difficult questions, test-takers were 25% overconfident (Cohen's
  *d* = 0.62)"; "up to 93% of the test-takers were miscalibrated in very
  difficult questions"
- "many high-ability test-takers (above 70% performance) tended to be
  underconfident in easy questions, whereas many low-ability test-takers (below
  50% performance) tended to be overconfident in easy questions"
- Perceived difficulty depressed performance (β = −0.32, R² = 0.10, small
  effect), and metacognitive strategy use reduced perceived difficulty
  (γ = −0.52 trait, −0.29 state)

His own training recommendation: "students may be better calibrated by, for
instance, receiving explicit feedback on whether they are realistic,
overconfident or underconfident." **[T2]** Sample caveat he attaches himself:
participants were "mainly Chinese" with mean IELTS Listening 5.71.

> **Teaching implication.** This is the most directly buildable finding in the
> document, and it costs almost nothing: attach a confidence rating to each
> answer in any listening exercise, then show the learner their calibration
> alongside their score. It is grade-8-appropriate, language-independent, and
> the only trainable behaviour here with an effect size attached.

---

## 7. Folklore audit

The plan requires separating official rule from research finding from teacher
lore. Applied to the most-repeated Listening claims:

| Widely taught | Status on this evidence |
| --- | --- |
| "Questions come in the order of the recording" | **Official rule**, unqualified, all question types ([Cambridge FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)) |
| "You only hear it once" | **Official rule** (same) |
| "Write exactly the words you hear, don't paraphrase" | **Official instruction** (same) |
| "Watch the word limit — over-length answers are wrong" | **Official rule**, stated twice ([ielts.org](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening); [Cambridge FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf)) |
| "Underline key words in the questions during preview" | **Widely taught; no official basis found.** Field documents candidates doing it and treats it as a test-wise strategy that *displaces* listening: "it quite often led to a dependence on the written text … which reduced the amount of attention given to the spoken signal" **[T2]** |
| "The speaker says the wrong answer first, then corrects it" | **Teacher lore.** Not stated in any official document in this corpus, and not found in the Cambridge volume. Visible in one published sample; not generalisable from that |
| "Listen for signposting/discourse markers" | **Teaching convention with adverse evidence.** Candidates in Field's study almost never reported doing it **[T2]** |
| "Parts get harder as you go" | **Half true.** The instruction wording says so **[T2]**; the official format page frames the escalation as domain, not difficulty **[C]** 3-0; observed error rates do not increase monotonically **[T2]** |
| "Watch out for plural traps" | **No support in this evidence base.** See the GAP in §4.3 |

Field's own verdict on the washback is worth recording in full, because it is
the reason this document is written as curriculum reference rather than exam
prep: "Training in using such strategies has come to feature prominently in EAP
instruction programmes at the expense of more constructive listening practice."
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 12) **[T2]** And from the volume's epilogue: "Inauthentic listening tasks,
including some discrete item formats, have the perverse effect of distracting
rather than focusing the attention of the listener." **[T2]**

---

## 8. Accents and connected speech

Official: "You will hear a range of English native-speaker accents on the
recordings (for example, Australian, British, New Zealand and North American
speakers)."
([Cambridge Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf))
**[Q]** Field records the set as "principally British, Australian/NZ, US and
South African" and notes that IELTS's restriction to standard international
varieties is, in his view, "a sound decision"
([SiLT 53](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf),
Ch. 7 and Ch. 12) **[T2]**.

Why accent range costs marks, in decoding terms **[T2]**:

- "By adding a wide variety of accents, the test designer considerably heightens
  the demands of the task. This is especially true when, as sometimes happens, a
  single dialogue features speakers of two different varieties, and the listener
  has to switch between the two." (Ch. 7)
- "word forms in connected speech are highly variable. Within a single speaker,
  they vary according to speaking style, context, speech rate, importance in the
  utterance and so on" (Ch. 7)
- "Speakers take the easiest articulatory route… To give two common instances:
  *half-past* might become *huppast* and *don't know* might become *dunno*."
  (Ch. 5)
- "there are no consistent spaces between words in connected speech, so that it
  falls to the listener to determine where one ends and the next begins."
  (Ch. 5)
- Voice normalisation costs time: item writers "still need to make some
  allowance for the need to adjust to unfamiliar voices by avoiding questions
  which target (say) the first 15 seconds of a recording." (Ch. 7)

> **Teaching implication.** The word-boundary problem is the one to exploit at
> grade 8. Our phonology strand already teaches segmental contrasts in isolation
> (/ʊ/ vs /uː/, /n/ vs /ŋ/); the IELTS-relevant upgrade is to hear the same
> contrasts *across a word boundary in connected speech*, where the boundary
> itself is the difficulty. No new vocabulary is required.

Also worth noting on delivery: lectures are, in the measured data, the *slowest*
of the common genres — "radio broadcasts (160 wpm), conversations (210 wpm),
interviews (190 wpm) and lectures (140 wpm)", with the IELTS lecture-style
samples measured at 158–197 wpm (Ch. 7, citing Tauroza and Allison 1990)
**[T2]**. Part 4 is not hard because it is fast.

---

## 9. Where the evidence runs out

Collected gaps, so a later pass knows what to target:

> **GAP** — **distractor engineering.** No official account exists in this
> corpus of how wrong answers are constructed in a recording. See §5.

> **GAP** — **plural and spelling traps as a designed feature.** The marking
> rule is confirmed; the claim that traps are engineered is not. See §4.3.

> **GAP** — **which individual strategies raise listening scores.** Only
> latent-composite relationships were found. See §6.5.

> **GAP** — **modern evidence on Part 4.** Field's cognitive-validity study is
> from 2008 and its recommendations (double play, skeleton outlines instead of
> simulated notes, paraphrase-based items) describe a test that was **not**
> adopted. Nothing in this pass establishes what changed between 2008 and now.
> Treat §6 as evidence about the format's known weaknesses, not as a current
> description of item-writing practice.

> **GAP** — **the raw-score-to-band conversion table for Listening.** Not
> established in this pass; see `01-exam-structure.md` for whatever Phase 1
> recovered, and do not let any tool report a predicted band without it.

---

## Sources

**Tier 1 — binding (test facts, marking rules, official samples)**

- [IELTS Academic format — Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening) — ielts.org. Timing, part structure, six-category question inventory, marking rules (spelling, word limit, hyphens, contractions).
- [Academic test format in detail](https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail) — ielts.org. Part descriptions and speaker configurations; Listening/Reading transfer-time contrast.
- [Sample test questions — Academic](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test) — ielts.org. Four parts / 40 questions; Listening identical across Academic and General Training.
- [IELTS Listening Sample Tasks](https://ielts.org/cdn/ielts-sample-tests/ielts-listening-sample-tasks-2023.pdf) — ielts.org. Worked tasks with tapescripts and answer keys for form completion, multiple choice, short answer, sentence completion, matching, plan labelling, note completion, table completion; the answer-key legend quoted in §3.2.
- [IELTS Academic FAQs](https://www.cambridgeenglish.org/images/269898-ielts-academic-faqs.pdf) — Cambridge English. Single play; question order across all types; pause structure; accents; UK/US spelling; the over-limit and multiple-answer marking rules; the "don't rephrase" instruction.
- [How computer-delivered IELTS works](https://ielts.idp.com/prepare/article-how-computer-delivered-ielts-works) — IDP. The 2-minute review window in place of the 10-minute transfer.

**Tier 2 — evidence (tendencies and cognition, never rules)**

- Field, J. (2008). [Cognitive validity of lecture-based questions in IELTS Listening](https://ielts.org/cdn/Research/cognitive-validity-of-lecture-based-question-in-ielts-listening-paper-field-2008.pdf). IELTS Research Reports. Verbal-protocol study of the lecture section; the four meaning-building operations gap-filling removes; local-level processing; test-wise strategies; recommendations to item writers (not adopted). Small N (13 per condition) — treat effect claims as indicative.
- Field, J. (2023). [*Insights into Assessing Academic Listening: The Case of IELTS*](https://www.cambridgeenglish.org/Images/735167-studies-in-language-testing-volume-53.pdf). Studies in Language Testing vol. 53, Cambridge University Press & Assessment. The five-stage listening model; part-by-part word counts and CEFR mapping from the Item Writer Guidelines; accent and connected-speech decoding; the distractor and lexical-overlap statements; the recommendations and washback verdict in Ch. 12.
- Phakiti, A. (2016). [Test-takers' performance appraisals, appraisal calibration, state/trait strategy use and state/trait IELTS Listening difficulty](https://ielts.org/cdn/Research/test-takers-performance-appraisals-appraisal-calibration-state-trait-strategy-use-and-state-trait-ielts-listening-difficulty-phakiti-2016.pdf). IELTS Research Reports. N = 376. Section-by-section performance gradient; SEM paths for cognitive and metacognitive strategy use; the calibration and overconfidence findings.

**Cross-references**

- Test structure, timing, band conversion → `01-exam-structure.md`
- Reading's contrasting transfer rule, question ordering and process model → `04-reading.md`
- Phonology strand and CEFR anchoring → `07-language-foundation.md`
- Which units already train these sub-skills → `08-bridge-map.md`
