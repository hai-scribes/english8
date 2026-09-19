# A learning system for one grade-8 learner, designed from the evidence

**Status: proposal, 2026-09-05. Not built, not committed to.** It sets the
current site aside and re-derives a system from what `research/ielts/` and
`research/pedagogy/` actually license. Every structural decision carries the
marker of the evidence behind it, and the decisions the evidence does *not*
reach are collected in §9 rather than smuggled into the prose.

Read `research/pedagogy/README.md` §2 for the marker convention. One rule from
there governs everything here: **the finding's marker and the design decision's
marker are different things.** A `[V 3-0]` finding on German mathematics
homework becomes an `[INF]` decision the moment it is applied to a Vietnamese
girl learning English on a phone.

---

## 0. What this design changes, stated first

Three things. Everything else is detail.

1. **The day is organised by stream, not by lesson.** The evidence with the
   strongest replication is about things that happen *every day regardless of
   topic* — spaced retrieval, levelled reading with a log, accuracy on a handful
   of named structures. A lesson-shaped day cannot carry them, because a lesson
   ends. So the textbook's units become a *feed* into three daily streams, not
   the container the learner opens.
2. **Saturday has a designed role, and it is not teaching.** Two evidence lines
   converge on what the one weekly hour with a human is *for*: it is the
   accountability step without which extensive reading's effect is
   indistinguishable from zero (`09` §2.2 **[V 3-0]**), and it is the
   independent measure without which nothing may be called a proficiency gain
   (`09` **E6**). The tutoring literature says a non-professional tutor is worth
   0.21 SD against a teacher's 0.50 and says nothing about what the hour should
   contain (`pedagogy/05` §1, §5). This design does not ask the uncle to teach.
3. **Reading is a daily stream with a log.** Free, unlogged reading has an
   effect of d = 0.01 (n.s.); level-limited, logged reading has d = 0.51–0.73
   (`09` §2.2 **[V 3-0]** / **[S]**). The site currently has twelve chapters and
   no log. The corpus must grow and the log must exist, or the best-replicated
   content intervention in the whole knowledge base is not actually in the
   system.

What does *not* change is the constraint underneath all of it: **never less than
the official book** (328 targets, `tools/check_coverage.py`) and **never an
IELTS band, a minute counter, a self-rating as a measure, or a template**.

---

## 1. Who, and when

One learner. Vietnamese, ~13, grade 8, *Tiếng Anh 8 — Global Success*, at CEFR
A2 heading for B1, already doing IELTS preparation elsewhere. Two surfaces, and
they are structural, not incidental (memory: `saturday-rhythm`):

| | Weekdays | Saturday morning |
| --- | --- | --- |
| Who | Alone | With her uncle |
| Where | Phone | Together, a screen between them |
| How long | Short — see §7 | About an hour |
| What it must be | **Completable without an adult** (`pedagogy` **P8**) | **Not homework supervision** (`pedagogy` **P12**) |
| What it measures | Effort-shaped signals only (`pedagogy` **P3**) | The independent observation (`09` **E6**) |

Two consequences the evidence forces and a folk design would get wrong:

- **Her north star is weekday unprompted opens** — Saturday cannot evidence
  unprompted return, so it is not counted (memory).
- **Nothing on her surface is a lever she performs for.** No streak, no points,
  no minutes, no "you improved" (`pedagogy` **P1**, **P9**; `09` **E9**).
  Attrition in solo study tracks dispositional persistence, not motivation, and
  a struggling learner is not a flight risk (`pedagogy/03` §1 **[V 3-0]**,
  single study). The design therefore optimises for *a known next action and a
  finishable session*, and claims nothing about retention.

Because she is doing exam preparation separately, **this is not exam prep.** It
is the curriculum, built so that every part compounds toward B1 and carries the
right precursor (§5). Format-honest mechanics — one clock, play-once, official
key grammar — stay, because washback runs in the right direction when the
practice behaves like the real thing (`09` §3.4 **[S]**).

---

## 2. Seven principles, each with its warrant

| # | Principle | Warrant | Finding | Decision |
| --- | --- | --- | --- | --- |
| **i** | **Every interaction is a committed, marked attempt.** Reading a card is not progress; answering is. A wrong answer requeues the item, it does not end anything | Retrieval beats restudy; recall beats recognition (`vocabulary-mode-design.md`); the only honest progress signals are effort-shaped — attempts committed, items produced (`pedagogy` **P3**); official key grammar marks it (`09` **C1–C5**) | **[S]** / **[V 3-0]** | **[INF]** |
| **ii** | **Nothing is known the day it is taught.** "Known" means correct retrieval on three separate later days, one of them productive. The unit test is a checkpoint, never the finish | Short and long intervals tie on immediate tests and short loses on delayed ones; retention is measured on delay (`09` **E5**, **F5**) | **[V 3-0]** | **[INF]** |
| **iii** | **Small, frequent, finishable.** Six new items at a time; a session that ends; a backlog that never becomes a wall | Bigger learning sets are simply harder with no delayed payoff (`vocabulary-mode-design.md`); frequency over duration is the best available heuristic (`pedagogy` **P4**); any dose is a design choice (`pedagogy` **P2**) | **[S]** / **[V 3-0]** | **[INF]** |
| **iv** | **A word is a collocation with a sound.** Every item is taught inside a phrase and has an audio form; heard-word prompts enter once the written form is stable | Teach items as collocations, the least-contested decision in the area (`07` §8.1); orthographic and phonological vocabulary correlate only .46 and predict different skills (`07` §2.4, N = 30) | **[V 3-0]** / **[S/NS]** | **[INF]** |
| **v** | **Accuracy on named forms; flexibility over complexity; emergence over mastery.** Two structures inside grade 8 track the whole IELTS scale — determiners and third-person `-s` — and one outside it does — passives. Complexity does not | Determiners the largest error category at every band 5.5–7.5 (`07` §4.4); 3SG `-s` and passives climb TLU 0.4→1.0 across bands 3–8 (`07` §4.3); complexity peaks at 7 and falls at 8 (`07` §4.2); the descriptors' word is *flexibility* (`07` §4.1); progress is emergence, not mastery (`07` §6.3) | **[S]** / **[S/NS]** / **[D]** | **[INF]** |
| **vi** | **Reading is levelled, logged, and talked about.** Text choice is limited to her level; every text has a question that is marked; the log is read on Saturday as conversation | The two moderators: level-limited choice d = 0.73 vs 0.22; accountability d = 0.51 vs 0.01 n.s. (`09` §2.2, **B9**). Self-study is the *harder* case | **[V 3-0]** / **[S]** | **[INF]** |
| **vii** | **The interface says what to do, never why, and never a number that lies.** No criterion names, no CEFR labels, no citations on a page; no band, no minutes, no self-rating as a measure, no accuracy line presented as the story | Learner-facing rule (memory; `CLAUDE.md`); **A2**; `pedagogy` **P1**; **E8**; **E3** — a rising error rate is the *expected* signature of A2→B1 | rule / **[V 3-0]** / **[S]** | — |

---

## 3. The shape: three cards a day, one hour a week

Her home screen is three cards and nothing above them. Each is a known action
with a known end. The session is over when all three are.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Review     │  │    Read      │  │     New      │
│  12 due      │  │  Chapter 4,  │  │  Unit 5 ·    │
│              │  │  part 2      │  │  6 new words │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 3.1 Review — one scheduler for words and forms

**What it is.** The items due today, asked, marked, requeued. Two kinds of item
share one engine:

- **A word**, as a collocation: `keen on` not `keen`. Four rungs, hardest last —
  recognise the meaning → recall the meaning → produce the form from the
  Vietnamese and part of speech → produce it in a gapped sentence. Audio-prompt
  items (hear it → type it) join once the written form has cleared the ladder
  once. Semantic neighbours never share a round (`vocabulary-mode-design.md`
  **[S]**).
- **A form**, as an obligatory context: *She ___ (go) to school every day* →
  produced, not picked. Third-person `-s` (U8), articles including the zero
  article (U5), the subordination that clears the band-5 threshold (U7), and —
  the first item added past the book — **passives**, absent from the grade-8
  syllabus and the second-best accuracy discriminator on the scale (`07` §4.6
  **[S/NS]**). Each form also carries a **flexibility** prompt on later rungs:
  *say it another way* — the same proposition, a second structure (`07` §8.2
  **[S]**).

**Schedule.** A fixed day ladder — tomorrow, then +3, +7, +14, +30, then
doubling — applied identically to every item, because expanding intervals are
**not** better than uniform ones (g = 0.034, two independent meta-analyses,
`09` §2.1 **[V 3-0]**) and erring long beats erring short on delayed tests
(**F5**). A lapse returns the item to the bottom. **The specific day offsets
are an engineering choice and are labelled one** — both findings that would
have supplied evidenced offsets were refuted (`pedagogy/02` §3 **[X]**).

**The interleaving question is not decided here, and that is deliberate.** One
study says interleave (adults, receptive grammar, d = 0.64); one says block
first (low-achieving adolescents, vocabulary); this learner is the case where
they disagree (`pedagogy/02` §2, **P13**). The design makes no claim. What it
does is introduce a new form on its own — inside the unit, in the **New** card —
and then let the scheduler bring it back *mixed with everything else that is
due*, because that is what a due-queue does. The system is blocked-then-mixed
as a side effect of scheduling, and nobody has to assert that this is better.
**[SPEC]**

**Backlog rule.** After a missed week the queue caps at a fixed number and the
rest wait — a two-hundred-item wall is a design failure, and the ladder tolerates
lateness because long beats short. **[INF]**

### 3.2 Read — one levelled text, one marked question, a log

**What it is.** One short original text at her level, every weekday: a section
of the current chapter of *The Sea Gives Back*, or a side piece from the same
town. Then **one question a key can settle** — that is the machine half of
accountability, and it is what makes "read" a committed attempt rather than a
scroll. The second time she meets a text it is a **fluency** re-read against a
clock that shrinks, on material already known.

**Why it is daily.** Extensive reading is the best-replicated intervention in
the corpus — six meta-analyses, d = 0.41–0.46, gains across *all* language
domains, not just reading (`09` §2.2 **[V 3-0]**). It is not a reading
intervention; it is the cheapest general-proficiency intervention there is.

**Why it is levelled and logged.** The two moderators are the whole design:
level-limited text choice (d = 0.73 vs 0.22) and accountability (d = 0.51 vs
**0.01, n.s.**). Free reading does nothing measurable in this data. The level
is enforced by `tools/check_level.py` (grade-8 structures only, gate at its
strictest); the log is read on Saturday (§3.4). **[V 3-0]** / **[S]**

**The honest cost.** Twelve chapters is not extensive reading volume. **The
corpus must grow** — one new short piece a week, authored at level, all
original, from the same world — and that is the single largest content cost in
this design. Nobody knows how much reading is enough: volume was not analysed
in any of the 73 studies (`09` §2.2 **GAP**). **The re-read for fluency is this
design's own reasoning, not an evidenced intervention** — the task-repetition
evidence is for *oral* production (`09` §2.4). **[INF]**

### 3.3 New — the unit, in small increments

**What it is.** The next step in the current unit, one step a day, in the order
the evidence fixes:

1. **Topic lexis first**, six at a time, before any of the unit's texts. This is
   worth roughly a thousand word-families of coverage on that unit's own texts —
   the topic-lexis discount (`07` §2.2 **[S]**; **B8**) — and it is the best
   argument in the knowledge base for a themed course at all.
2. **The dialogue**, as a comic, glossed in Vietnamese in this one place and
   withdrawn afterwards (`CLAUDE.md`, "support where the word is").
3. **The form**, introduced on its own, then handed to the scheduler (§3.1).
4. **The book's exercises**, each one a key can settle as a marked task; the
   genuinely open ones held for Saturday (§3.4).
5. **The listening**, played **once**, behind a spoken orientation that is never
   written down, answers typed during the audio, with a **confidence mark on
   every item** and calibration shown beside the score (**C6**, **C8**, **C10**;
   `03` §6.6 **[T2]**, d = 0.62 overconfidence — "the only trainable behaviour
   here with an effect size attached").
6. **The reading passage**, lettered, under one clock that does not stop while
   she types, with highlighting and notes (**C7**, **C9**).
7. **The writing**, an 80–100-word **body paragraph** — never called an essay
   (**B2**) — with its checklist lines settled by the text where a machine can
   settle them (**D9**), and no template anywhere (**B3**).
8. **The pronunciation target**, in the book's order — segmentals, then onset
   clusters as voicing-and-aspiration (U6–U7), stress (U9–U10), then question
   tunes and deaccenting (U11–U12) — recorded and compared to a model as a
   *self-review prompt*, never scored (**B7**, **D8**; `07` §8.3 **[S]**).
9. **The unit test**, once every step is done. A checkpoint, not a finish.

Each step is one card, sized to be done in the New slot. A unit takes as many
days as it has steps; the book's twelve units fit the year with the four
cumulative reviews after units 3, 6, 9 and 12.

### 3.4 Saturday — the hour, and what it is for

The evidence does not say what a fluent-but-untrained adult should do with an
hour (`pedagogy/05` §5 **GAP**). It does say three things the hour is uniquely
placed to be, and this design builds the hour from those and nothing else.

| Part | What happens | Why this, and its marker |
| --- | --- | --- |
| **The log** (~10 min) | The week's reading, as *conversation*: what happened, what did she think, one thing she noticed. Not a count | The accountability moderator (`09` §2.2 **[V 3-0]**). Conversation rather than inspection because the moment it becomes a check she performs for, it stops being the independent measure (memory) **[INF]** |
| **The turn** (~15 min) | One long turn on the unit's topic, **one subject**, stages marked out loud, answer-then-develop. Recorded. The uncle listens, then asks one question. **Same turn again next Saturday** | *One turn, one subject* is the official Coherence indicator, seen capping a real Vietnamese band-5 candidate on this exact topic (`06` §2 **[C 3-0]**, `06` §5 **[Q]**); task repetition raises **accuracy** (`09` §2.4 **[V 3-0]**) — used for that and never reported as complexity (**E2**). The only time in the week a listener exists **[INF]** |
| **The paragraph** (~10 min) | The week's body paragraph, read back. The machine has already settled the checkable lines; the uncle reads it and asks one question about the *idea*. She revises once | Written corrective feedback works and is durable (`09` §2.5 **[V 2-0]**); *which type* of feedback is **[?]**, so the human half stays minimal and never scores. Discourse gates the top (`08` §2 **[Q]**) **[INF]** |
| **The open exercises** (~15 min) | The book's genuinely open tasks — the Communication block, the Everyday English function, the speaking exercises a key cannot settle | Never less than the book (`check_coverage.py`); these are the parts of it a solo phone session cannot carry **[INF]** |
| **The record** (~5 min) | He sees the week: what was due, what was done, the delayed-retention rate, the calibration, the two accuracy gates. She does not sit and watch this | E6's independent measure has to be *read* somewhere. The record stays a record, never a score (memory) **[INF]** |

**What the uncle is asked not to do**, each with its rule: not mark or correct
mid-turn (no Speaking rubric may exist, **D7**); not supervise weekday work
(parental homework involvement r = −0.064 across 378,222 participants,
`pedagogy/05` §3 **[V 3-0]**, **P8**); not say "you got worse" (**E3**) or "you
improved" (**E9**); not prepare a lesson. The Saturday screen hands him the
turn topic, the paragraph, and the record. **Whether structured materials raise
a non-professional tutor's effect toward a paraprofessional's is unestablished**
(`pedagogy/05` §5 **GAP**) — this is the lever the site can pull, and pulling
it is a bet.

---

## 4. The unit as a feed

The book has eight components per unit (`curriculum/sgk/targets.json`). Each
one enters a stream; none is dropped, because the coverage gate would report it.

| Book component | Enters | As |
| --- | --- | --- |
| Lexis (~30 items) | **New** → **Review** | Six at a time, pre-taught first, as collocations with audio, then scheduled |
| Grammar targets | **New** → **Review** | Introduced alone, then obligatory-context items on the ladder, with flexibility rungs |
| Pronunciation target | **New** | Record-and-compare, unscored |
| Getting Started dialogue | **New** | The comic, glossed once |
| Reading passage | **New** | Lettered, one clock, highlightable |
| Listening | **New** | Play-once, confidence-marked, calibration shown |
| Writing genre | **New** → **Saturday** | Body paragraph, machine-checked lines, one human question, one revision |
| Everyday English function | **Saturday** | The open exercise, with the only listener |
| Communication content block | **Saturday** | Same |
| Culture block | **Read** | A side piece from the same world, at level |
| Unit test; Reviews 1–4 | **New** | Checkpoints; cumulative, delayed |

The two things the book has that this repo has historically dropped — the
Everyday English *function* and the Communication *content block* — land on
Saturday by design, because they are the two components that most need a
second person.

---

## 5. What compounds — the B1 precursor inside each stream

The standing goal is that grade-8 work never dead-ends. Labelled by CEFR, never
by band: the official alignment bottoms out at band 4.0 = B1 and **assigns no
band at all to A2**, which is where she sits (`07` §6.2a **[S]**).

| Stream | Now (A2→B1) | The precursor it carries | Marker |
| --- | --- | --- | --- |
| **Review · words** | Oxford 3000 backbone plus the book's 282; topic sets first | Coverage: ~2,000 families ≈ 83% of written text (unreadable unassisted), 4,000 ≈ 95%, 8,000+ ≈ 98%. Show her the *curve*, so 3,000→4,000 does not read as failure. Both modalities, because heard vocabulary predicts Listening and Speaking | `07` §2.1 **[V 3-0]**; §2.4 **[S/NS]** |
| **Review · forms** | Articles (U5), 3SG `-s` (U8), subordination to threshold (U7) | The two in-syllabus structures that track the whole scale; passives as the first post-book add; flexibility, not density | `07` §4.3–4.6 **[S]** / **[S/NS]** |
| **Read** | Levelled originals, logged | Search reading combined with careful re-reading — the pattern that separated higher scorers; paragraph labels, so a *which paragraph* question is answerable | `04` §8.2 **[T2]**; **C9** |
| **New · listening** | Play-once, calibration | Calibration is the one listening behaviour with an effect size; the marking is the official key grammar | `03` §6.6 **[T2]**; `03` §3.2 **[Q]** |
| **New · writing** | The body paragraph | Topic sentence → support → example; open → stand → close. Discourse is what caps strong language users, so this is not the soft part | `08` §2 **[Q]**; `05` §1 |
| **Saturday · turn** | One subject, stages marked | The Coherence indicator, verbatim from a real rating on this learner's L1 and this unit's topic | `06` §2 **[C 3-0]**, §5 **[Q]** |
| **New · pronunciation** | The book's order | Segmentals are the floor and for Vietnamese learners the floor binds (coda consonants, still failing at C1) — taught as a *difficulty*, with **no payoff claim** | `07` §5.5 **[S]**; §5.5.7a–c **GAP** |

---

## 6. Progress: two surfaces, and what each may show

Learners cannot self-assess — up to 93% miscalibrated on hard items (`09` §4.4
**[S]**) — and the A2→B1 transition is where accuracy *should* get worse as
range grows (`07` §4.4 **[S]**). So the two surfaces show different things, and
neither shows the forbidden ones.

**Hers, daily.** Three cards and their state. *Due · done today · known well* as
counts, never a percentage. The coverage curve, with the flattening visible. A
can-do ticked when it is met, sourced to a Companion Volume descriptor but shown
as plain words (**A1**, and the learner-facing rule). That is all.

**His, Saturday.** The week's record: what was due, what was done, which days.
Delayed-retention rate on reviewed items (**E5**). Target-like use on the two
named structures as **gates** — *can / cannot, once* — never as a curve
(`09` §6.2 **[INF]**). Calibration, predicted against actual. The reading log.
The paragraph and its revision. Discourse moves completed.

**Neither, ever.**

| Never shown | Rule |
| --- | --- |
| A band, a band trajectory, a predicted band from anything | **A2** |
| Minutes, hours, time studied, a timer as achievement | `pedagogy` **P1** — more time predicts *lower* achievement at the individual level, four samples, three countries |
| A streak on her screen | `pedagogy/03` §3 **GAP** — nothing is known about streak mechanics; the week is a record he reads, not a number she keeps |
| "You improved" from one retest; "you got worse" from a rising error rate | **E9**; **E3** |
| A self-rating as a measure | **E8** |
| A complexity index over time | **E2** |
| Points, badges, a prize for a finished week | `pedagogy` **P9** — tangible rewards undermine children more than adults, d = −0.39 |

---

## 7. The dose, labelled

**Fifteen to twenty minutes on a weekday, defined by content, not by time.** The
session is three cards; it ends when they do. She never sees a clock.

That number is a **design choice** (`pedagogy` **P2**): no experiment establishes
an optimal assignment length at this age. What bounds it is that total homework
across *all* subjects flattens around 60–70 min/day in a full-population sample
at her exact age (`pedagogy/01` §2 **[V 3-0]**), and one subject can only claim
a fraction — the fraction is unevidenced (**P5**). The only foreign-language
benchmark is descriptive: beginner French classes were set 12–17 expected
minutes a day (`pedagogy/01` §7 **[S/NS]**). Fifteen to twenty sits inside both
and is chosen to be finishable.

**Short and frequent over long and occasional** is the heuristic — one
significant unstandardised coefficient in one German mathematics sample, three
parallel claims refuted (`pedagogy/01` §6, **P4**). It is the best available and
it is marked **[INF]**.

---

## 8. What this design refuses, and the rule behind each

| Refused | Because |
| --- | --- |
| A Speaking scorer, rubric, or AI conversation partner | Only two Speaking claims survived verification; **D7** blocks it until a second research pass |
| Pronunciation scoring of any kind | **D8**; discriminant accuracy 47%, band 6 misclassified 80% of the time (`07` §8.3) |
| Templates, phrase banks, "useful sentences", memorised openers | Memorised language is the explicitly penalised category (**B3**) |
| A points economy, badges, or a streak prize | `pedagogy` **P9** |
| Anything justified as "it keeps her engaged" | `pedagogy` **P10** — attrition tracked persistence, not motivation |
| An adaptive difficulty that tunes until she gets most items right | `pedagogy` **P6** — in-session accuracy is not retention |
| "Which mode felt best?" as an input | `pedagogy` **P7** |
| An extensive-*listening* library warranted by analogy to reading | `pedagogy/04` §3 **GAP** — no effect size exists; the audio form of every word is the defensible listening investment |
| A "learn 50 words a day" mode; a near-infinite question bank | Bigger sets are harder with no payoff; the same word must be asked many times (`vocabulary-mode-design.md`) |
| Ranking words by frequency band, CEFR level, or list membership | **F1**; each was checked and each fails (`07` §8.1a) |
| A weekly "how did it go?" self-report driving anything | **E8** |
| Any Vietnamese-specific vowel or regional pronunciation guidance | **B7**; `07` §5.5.5–5.5.6 **GAP** |

---

## 9. Decisions made without evidence — the honest list

Each is marked, each names what would settle it. This section is the one to
argue with.

| Decision | Marker | What would settle it |
| --- | --- | --- |
| Three cards, in that order, every day | **[INF]** | Nothing in either base tests session composition. Usage data on which card she skips |
| The 1 / 3 / 7 / 14 / 30 / doubling ladder | **[INF]** | A study naming offsets on school-age L2 learners — none exists (`pedagogy/02` §3) |
| Blocked-then-mixed as a scheduler side effect | **[SPEC]** | A dedicated pass on adolescent interleaving; Kim (2024) in full text |
| One levelled text a day; one side piece a week | **[INF]** | Any volume finding — 45 of 73 ER studies did not report fidelity |
| The fluency re-read against a shrinking clock | **[INF]** | Task-repetition evidence for *reading* rather than oral production |
| The whole Saturday structure | **[INF]** | `pedagogy/05` §5's GAPs: what an untrained tutor should do; whether a prepared session raises their effect |
| The turn repeated across Saturdays | **[INF]** on top of **[V 3-0]** | Task repetition's parameters are load-bearing (**[V 2-1]**); the interval is a guess |
| Committed attempts, retakes and produced-not-picked as effort proxies | **[INF]** | Validation against the effort construct that predicted gains (`pedagogy/06` §3 **GAP**) |
| Fifteen to twenty minutes | **[INF]** | Per-subject dose is unaddressed anywhere (`pedagogy/01` §8) |
| Conversation-not-inspection on the reading log | **[INF]** | The autonomy-support moderator, refuted 0-3 and flagged for re-verification — the most design-relevant claim in the area (`pedagogy/05` §4) |
| The story as the reading corpus | **[INF]** | Nothing tests narrative continuity as a reason to return; it is treated as *material*, not a lever |
| Passives as the first post-book form | **[S/NS]** → **[INF]** | Banerjee's TLU trajectory is the warrant; its marker travels |

---

## 10. What survives from the current build

"Disregard" is not "discard". Re-deriving from the evidence lands on several
things the site already has, because they were derived from the same evidence.
They carry over as components, not as the organising structure:

- **The marking engine** and its official key grammar (**C1–C5**), the play-once
  recording with confidence marks (**C6**, **C8**, **C10**), the one-clock
  reading with labelled paragraphs (**C7**, **C9**), the machine-settled writing
  checklist (**D9**). These *are* the evidence, built.
- **The vocabulary trainer's learning flow** — six per round, retrieval after
  one exposure, four rungs, requeue-not-fail, a day ladder, *known well* on
  three separate days (`vocabulary-mode-design.md`). It becomes the Review
  engine and gains forms as a second item type.
- **The story and its comic**, `check_level.py` at its strictest, the cast
  manifest. The story becomes the levelled corpus and needs to grow.
- **Every rule in `CLAUDE.md`** about what a page may say — nothing on a page
  explains itself.

What does *not* survive is the container: the seven-lesson unit page as the
thing she opens, the unit test as the thing a unit is for, and Saturday as
"sit together and use the app".

---

## 11. Questions for the operator

1. **The corpus.** One original short piece a week at grade-8 level is the
   largest recurring cost here. Is that sustainable, and is *The Sea Gives Back*
   the world to grow it in?
2. **The Saturday hour.** This asks the uncle to *not* correct, *not* mark, and
   *not* supervise — to listen, ask one question, read one paragraph, and see
   the record. Is that the hour he wants? The evidence says it is what the hour
   is worth; it does not say it is what the hour is for.
3. **Her IELTS preparation elsewhere.** This design assumes it exists and does
   not duplicate it. If it stops, the format-honest mechanics are already here
   and the body paragraph becomes the whole essay at B1→B2 (`08` §6.2) — but
   that is a different stage, and nothing here should be relabelled to look
   like it.
