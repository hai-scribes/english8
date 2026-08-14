# English 8 — Global Success

Self-study material for Tiếng Anh 8 (Global Success), published as a static site.

**→ [hai-scribes.github.io/english8](https://hai-scribes.github.io/english8/)**

Twelve units, seven lessons each. Every lesson teaches, then practises what it
just taught; the unit test opens only once all seven lessons are done.

The second job is mostly not something the pages *say* — it is how they
behave. 1,143 questions are marked the way a real answer key marks; twelve
recordings play once, behind a spoken introduction that is never written down;
every listening answer carries a *how sure are you* mark; twelve reading blocks
run one clock that does not stop while you type; twelve passages can be
highlighted and annotated under a numbered question bar with a review flag; and
twelve writing tasks are written into the page, where seventy of their
ninety-two checklist lines are settled from the text rather than from the
learner's own opinion of it. On top
of that, twenty-nine tasks carry one changed instruction, checkpoint or
re-scored drill built from the IELTS research — each cited, each carrying the
strength of its evidence — recorded in the generated
[evidence register](research/evidence-register.md), which is a maintainer's
document and is deliberately not part of the site. See
[Marked tasks, one play, and strands](#marked-tasks-one-play-and-strands) and
[The IELTS bridge](#the-ielts-bridge) below.

**The interface itself says none of this.** The pages carry the instruction and
nothing about where it came from: no criterion names, no evidential markers, no
CEFR coordinates, no explanation of what any of it is for. A learner opening a
lesson is there to learn English, not to audit the course. Everything that
justifies a design decision belongs in this repository.

## How the site is laid out

```
/                          the twelve units, then the four reviews
/unit-NN/                  that unit's seven lessons, then practice + test
/unit-NN/lesson-M/         one lesson: teaching blocks, then its exercises
/review-N/                 units 3N-2 to 3N, asked together
```

Exercises are inline with the lesson that teaches them. Most are marked: you
commit an answer and the page marks it by the published rules. The rest keep a
reveal, and where an exercise is marked its reveal stays shut until it has been
checked. Practice and the unit test live at the foot of the unit page — never
above the lessons, and inert until the lessons they cover are complete.

## The four reviews

The prescribed book has a two-page cumulative section after Units 3, 6, 9 and
12, and it is the only place in it where more than one unit is tested at once.
This site had nothing cross-unit at all: every exercise, every practice set and
every unit test stopped at the edge of its own unit. `units/review-N.md` closes
that, and `/review-N/` is where it lands.

A Review is deliberately not a thirteenth unit. It has no vocabulary table, no
seven lessons and no progress gate, because it teaches nothing — its words and
its structures have already been taught three units running. What it has is the
book's two halves on one page: **Language** (sounds, then vocabulary, then
grammar) and **Skills** — a text read against one clock, a speaking step, a
recording that plays once, and a paragraph of 80–100 words that recombines all
three units. Everything is the same machinery as a lesson: the same `:::task`,
the same clock, the same single-play player, the same highlightable passage,
the same counted checklist.

A Review is the only page in the course that carries **two timers at once**, and
that is what kept it from having a Listening half for as long as it did. A unit
splits across lesson pages — the reading clock on Skills 1, the player on Skills
2 — so each was alone on its page and could close over every task it found. On
one page that is wrong in both directions: the player would silence the five
Language exercises printed above it, and the clock would silence the listening
exercise printed below. So a timer now owns the tasks under it and above the
next timer (`owned` in `tools/assets/app.js`), `tools/test_reading.js` runs both
timers to expiry and checks exactly which exercises went dead, and
`tools/check_ielts.py` holds the page in the book's order — Reading, then
Listening — because the scoping is only safe while that order holds.

Four more rules hold that a unit cannot break. A Review may only reach into the
three units it follows — `tools/check_ielts.py` reads every `Unit N` its prose
names and fails on a fourth. It must carry its writing task, at the book's
length. Every task below its player must be a listening task, and there must be
one. And the set is closed: a `review-9.md`, a heading claiming the wrong units,
or one of the four simply missing is a build failure, not a file that nobody
reads.

## Repository

| Path | What it is |
| --- | --- |
| `units/*.md` | **Source of truth.** One markdown file per unit, plus `review-1..4.md`. |
| `data/dict/*.json` | Dictionary entries — senses, definitions, examples, collocations, word families. |
| `research/ielts/` | The source-verified IELTS knowledge base every bridge cites. |
| `research/evidence-register.md` | **Generated.** Every bridge's claim, marker and warrant. Not published. |
| `tools/check_dict.py` | Gate: every vocabulary slot resolves to a complete entry. |
| `tools/check_ielts.py` | Gate: the knowledge base's audit checklist, enforced. |
| `tools/test_marking.js` | Gate: the marking engine, against the published rules. |
| `tools/check_write.js` | Gate: every model — unit or review — satisfies the checklist printed under it. |
| `tools/test_reading.js` | Gate: the reading screen — labels, highlighting, notes, question bar. |
| `tools/index_sgk.py` | Generator: the recorded book's lookup index. `--check` reports drift. |
| `tools/build.py` | Generator: markdown → the 101-page site. |
| `tools/assets/` | `app.css` and `app.js`, copied into the build. |
| `art/cast/<slug>/<emotion>.png` | **Source.** The thirty drawings, full size and lossless, one per expression. |
| `art/cast/<slug>.webp` · `art/bg/<slug>.jpg` | **Generated / drawn.** The composed 3 × 2 sheet and the background plates — what the site actually loads. |
| `tools/make_sheet.py` | Generator: the six drawings → one sheet. `--all` does every character with a full set. |
| `tools/check_cast.py` | Report: which declared avatars and backgrounds have been drawn. |
| `docs/` | Generated output. GitHub Pages serves this directory. **Never put art here** — `build.py` deletes `docs/assets/` on every run and copies `art/` in. |
| `curriculum/syllabus.md` | The syllabus map the units are written against. |
| `curriculum/sgk/` | **The official book, recorded.** Every unit's targets, exercises and glossary, section by section — reference only, never built or published. |
| `tools/check_coverage.py` | Report: what the official book teaches that our units do not. |
| `app/` | The earlier single-page artifacts this site replaces. |

## Building

```sh
python3 tools/build.py            # regenerate docs/
python3 tools/build.py --check    # parse and report counts, write nothing
python3 tools/check_dict.py       # gate: every vocabulary slot resolves
python3 tools/check_ielts.py      # gate: every IELTS claim is legal and cited
node tools/test_marking.js        # gate: the marking engine obeys the published rules
node tools/check_write.js         # gate: each model satisfies its own checklist (needs docs/)
node tools/test_reading.js        # gate: the reading screen behaves (needs docs/ and jsdom)
python3 tools/check_coverage.py   # report: what the official textbook covers that we don't
python3 tools/check_cast.py       # report: which dialogue avatars and backgrounds exist
python3 tools/make_sheet.py --all # compose the drawn expressions into character sheets
```

Requires `markdown` (`pip install markdown`). Edit the markdown in `units/`,
re-run the build, commit `docs/`. There is no CI step — a push publishes, so
run all five gates before you push. `check_write.js` and `test_reading.js` read
the built pages, so run them after `build.py` rather than before.
`test_reading.js` additionally wants `npm install jsdom`; without it, it skips
loudly rather than failing, so a clean checkout still runs the other four.

## Marked tasks, one play, and strands

Six directives carry the parts of IELTS that are a *system* rather than a
label. Each replaces an instruction the learner used to be trusted to follow
with a mechanic the page enforces.

### `:::task` — a committed answer, marked by the published rules

```markdown
::: task skill="listening" type="sentence-completion" words="2+number"
- The school asked ___ students. = two hundred/200 ~ both forms are accepted
- Too little sleep was named by ___ per cent. = forty-five
:::
```

One line per item: the prompt, ` = `, the key, and optionally ` ~ ` and the
reason. The key is written in IELTS's own key grammar — `(the) (public)
library/libraries` — and the same engine the vocabulary trainer uses expands
it. The generator writes the answer-key entry from the task, so the printed
answers and the marked ones cannot drift; the gate rejects an exercise that
has both a task and a hand-written entry.

| Attribute | What it must be |
| --- | --- |
| `skill` | `listening`, `reading` or `course`. The first two must name an official question type; `course` is a grade-8 drill and is never dressed as an IELTS item. |
| `type` | One of the official six Listening or eleven Reading types, or a course type. |
| `words` | `1`–`3`, optionally `+number`. Required for completion and short-answer, printed on the task in IELTS's own wording, and enforced as a hard fail. |
| `opts` | `S\|C` — a fixed option set shared by every item. Inline `(a) … (b) …` works too. |
| `either` | `1-2` — those items are marked as an unordered pair. |
| `ask` | The instruction line, in markdown. |

Listening tasks get a confidence toggle on every item and a calibration report
next to the score. That is not optional and no attribute turns it off: it is
the one Listening finding with an effect size attached, and it costs nothing.
The Check button stays shut until every item is rated — a rating made after the
key is visible measures nothing.

**What the gate refuses**, so you meet it in the docs rather than in a build
failure. Each of these was a route around a rule, not a hypothetical:

- A bracketed *part* of a word — `give(s) up`. The published legend makes whole
  **words** optional; write the alternates out, `give up/gives up`.
- `opts` on a completion or short-answer task. Choosing an answer from buttons
  means never writing one, which drops both the word limit and the spelling
  rule off a task whose type requires them.
- A typed item on any IELTS-skill task with no `words` — whatever the type says.
- A `skill="course"` task in a lesson that has a recording. A listening set
  relabelled a course drill loses its word limit and its confidence rating.
- A sentence of the recording's script printed anywhere in the lesson, including
  inside a task prompt. The questions then test reading.
- A bullet that does not parse. The separator is ` = ` with a space either side;
  `second___= two` used to vanish silently, taking its question with it.
- A directive name the generator does not know — `:::taskk` — which would
  otherwise render its own source, answer keys and all.
- A key that accepts a form its own word limit forfeits. `(to) a primary
  school` under a three-word limit marks the learner wrong for writing the
  four-word form the key itself permits.
- A listening key the recording never says. `03` §4.1 is explicit and
  counter-intuitive: *"Don't try to rephrase what you hear."* The answers are
  the words on the tape, so a key that paraphrases them is unanswerable.
- An answer given away before it is earned — by the spoken orientation, or by
  another task's revealed reason. For a chosen answer the leak is the option's
  text, not its letter.
- An instruction to **score** a spoken answer, or any pronunciation score.
  Saying one does not exist is not shipping one, so a disclaimer passes.
- A bridge whose body admits it is our own reasoning while carrying a marker
  that says quoted. The register prints the marker; the two must agree.

The same prohibitions are scanned over `tools/build.py`, because the generator
authors learner-facing copy too — the home page, the unit cards, the widget
that wraps every task.

### `:::audio` — the recording plays once

```markdown
::: audio orientation="You will hear a school counsellor talking about stress."
          mode="computer" preview="30" review="120"
Hello. I'm Ms Trang, and I'm the school counsellor here…
:::
```

The script never reaches the printed page. The orientation is spoken and not
written down, because in the real test it never is; then a preview window over
the questions; then one play; then the declared review window, after which the
script unlocks. It also unlocks once every task on the page is marked — but only
after the recording has actually finished, and the spent play is remembered
across a reload, or "plays once" would only be a suggestion.

The voice is the device's speech synthesiser and the page says so plainly —
what this trains is the shape of the task, not the ear.

### `:::write` — the writing task is attempted on the page, and counted

```markdown
::: write words="80-100" trains="Coherence & Cohesion" ask="Now write yours."
- [ ] 80–100 words ~ words
- [ ] One paragraph, no bullet points ~ para:1
- [ ] Linking words: *First, Second, Third* ~ all first/second/third
- [ ] At least **five** words from the Lesson 2 vocabulary table ~ vocab:5
- [ ] A topic sentence and a closing sentence
:::
```

Writing was the last part of this course that was still a printed worksheet: a
model, a plan table, tick-boxes and six blank underscore lines. Nothing about
it was committed and nothing about it was counted — and the `:::thread` check
sitting beside it asked the learner to type *"articles supplied \_ of \_"*
about a paragraph the page had never seen.

Now there is a text box, a live word count against the declared range, and a
checker behind every checklist line a machine can honestly decide. A line with
no ` ~ ` check keeps its tick-box and stays the learner's own judgement,
because "a topic sentence and a closing sentence" is not decidable by counting
and pretending otherwise would be the overclaim the knowledge base blocks.
Across the twelve units, 70 of 92 lines are counted.

| Check | What it decides |
| --- | --- |
| `words` | the count falls inside the declared range |
| `vocab:N` | at least N distinct headwords from **this unit's** table, matched across the dictionary's own word families and regular inflections |
| `any:N a/b/c` | at least N hits in total from a closed list |
| `distinct:N a/b/c` | at least N *different* members of that list |
| `all a/b/c` · `none a/b/c` | every member present · no member present |
| `para:N` · `paras:N` | exactly N paragraphs and no bullet list · at least N |
| `re:N pattern` | at least N matches of a pattern |

What may be counted is bounded by `09` **D9** and §5.3, the defensible set:
obligatory-context accuracy on named structures, and the presence or absence of
named discourse moves. **No total is computed and nothing is scored.** Each
line reports what it found; no line is added to another, there is no
percentage, and there is no band — `09` **A2** and **D3**. The panel also says
in as many words that a rising error rate beside a growing range is what this
stage of progress looks like (**E3**).

The gate refuses a `:::write` whose checklist decides nothing at all. A list of
tick-boxes beside a text box is the unanchored self-assessment the construct
exists to replace — `09` **E8** wants a self-report paired with an objective
anchor, and §4.4 is why: learners cannot self-assess accurately.

`node tools/check_write.js` then runs each unit's **own model** through its
**own checklist**. That is not a hypothetical: ten of the twelve models failed
the list printed under them — one was 101 words against an 80–100 limit, and
eight used fewer of the unit's vocabulary than they demanded. A model that
would not tick the box teaches that the box does not matter.

### `:::clock` — one clock over the reading, and it does not stop

```markdown
::: clock mins="18" for="18 minutes for the text and every exercise below it."
:::
```

`09` **C7**, from `04` §1.1: the Reading test runs one clock covering
everything, **including the time spent writing the answers down**. It was the
last Group C rule this course left to the learner's discretion, in prose —
*"give yourself three minutes"* — which is precisely the arrangement every
other rule here was built to replace. One clock per reading block; when it
runs out the unfinished reading answers stop taking input, exactly as the
listening review window does, and Check stays live so what is written can
still be marked.

The build fails if a lesson with `skill="reading"` tasks does not carry exactly
one, or if a clock is declared where there is nothing to time. Each is sized
from the work it covers — the passage at 120 words per minute plus a minute a
question — not from IELTS's own pace over a text a grade-8 reader could not
read at all.

### `:::passage` — the reading text, on a screen that behaves like the test's

```markdown
::: passage label="A"
> For thousands of years, the Inupiat people of northern Alaska…
>
> Traditionally, families live from the land and the sea…
:::
```

`09` **C9**, from `01` §9.1 and §12.7: the Reading screen offers colour
highlighting and on-screen notes, and Writing shows a live word count. The
writing half shipped with `:::write`. The reading half did not exist — the
passage was an inert blockquote — so this adds selection highlighting (select
to mark, select a mark to take it off), a notes box, and a question navigation
bar with a review flag. All of it is kept on the device, and none of it stops
the clock.

`label` also fixes a defect the blockquote could not. A paragraph-referencing
question type — matching headings, matching information, matching features —
asks *which paragraph*, and needs the paragraphs to be labelled. Unit 3's
lesson said "The report has six paragraphs" and Unit 6's said "five paragraphs,
**A** to **E**, in the order they are printed", and neither page printed a
single label: under a clock, the learner counted paragraphs by hand before they
could start. `label="A"` letters them A, B, C…; `label="1"` numbers them. The
labels are generated from the paragraph count, never authored, so adding a
paragraph cannot leave the lettering behind.

The gate refuses a timed reading block without exactly one passage, a
paragraph-referencing task over an unlabelled one, and a question that names a
paragraph the passage does not have — `opts="A|B|C|D|E|F"` over five
paragraphs, or a key that says *Paragraph G*.

`node tools/test_reading.js` drives the built page in a DOM and checks the
behaviour, because none of it is visible to a static check. It earned that
straight away: the first highlighter asked `Selection.containsNode` which
paragraphs a drag touched, and the test found it naming every paragraph
*except* the selected one — four whole paragraphs highlighted instead of the
phrase the reader had dragged over.

### `:::thread` — a strand that says it recurs, and does

```markdown
::: thread id="articles" name="Articles — *a*, *an*, *the*, and no article"
           stage="introduce" measure="articles supplied correctly in the places
           that required one" resumes="6,7,8,9,10,11,12" marker="[S]" src="07 §4.4"
:::
```

Later units carry `stage="check"` and nothing else; the name and the measure
come from the introduction, so the strand cannot say two different things in
two places. The build fails if a unit named in `resumes` carries no check.

This construct exists because of a real defect: Unit 5 promised in bold that
every writing task from Unit 6 to Unit 12 carried a five-item article check,
and not one of the seven did. The gate could prove the bridge's citation
resolved. Nothing could prove the course kept its own promise, because the
promise was prose.

## The IELTS bridge

A lesson may make a claim about IELTS in exactly one place: a `:::bridge`
directive. Everything the knowledge base insists on is carried by the syntax, so
a bridge that omits its warrant cannot be authored.

```markdown
::: bridge name="One turn, one subject" trains="Fluency & Coherence"
            cefr="B1" marker="[C] 3-0" src="06 §2"
Before the turn, say in one short phrase what it is **for**, then drop anything
that does not serve it.
:::
```

| Attribute | What it must be |
| --- | --- |
| `name` | The instruction, in a phrase. Printed above the block, and in the register. |
| `trains` | One of the descriptors' own criterion names, or `Reading` / `Listening`. |
| `marker` | The evidential marker, **inherited from the source and never upgraded**. |
| `src` | `NN §X.Y` — a real section of a real file in `research/ielts/`. |
| `cefr` | Optional. A CEFR level. Never an IELTS band; there is no band for A2. |

`tools/check_ielts.py` fails the build if a marker is not in the legal set, if a
cited section does not exist in the file it names, if a unit's writing task
names no criterion, or if any unit's text contains a band promise, a half-band,
a template or a Vietnamese-L1 pronunciation claim outside the three permitted
targets. Every marker, warrant and CEFR level is written to
`research/evidence-register.md` on each build, glossed in plain English — a weak
claim reads as weak in the register, and because the register is generated from
the directives themselves, a caveat cannot be dropped by being forgotten. The
page prints the instruction only.

Read `CLAUDE.md` and `research/ielts/09-design-principles.md` §1 before adding
one.

## Vocabulary entries

Each word is a dictionary entry rather than a table row. The flat view shows the
most common sense — part of speech, an English definition, the Vietnamese under
it, examples and collocations. A **Full entry** toggle opens any further senses,
the word family and a usage note; words with only one meaning and nothing to add
get no toggle at all.

Entries live in `data/dict/unit-NN.json`, merged into one lookup keyed by
headword, so a word appearing in two units is written once. Definitions and
examples are original, written in the style of a learner's dictionary — they are
not taken from any published dictionary. Run `python3 tools/check_dict.py` to
confirm every headword resolves and every sense has a part of speech, both
glosses and at least two examples with the target word bolded.

## A note on the audio

Word audio uses your device's speech voices. The site ranks them (a British,
non-novelty, neural voice wins where one exists) but browser speech is a
reliable model of **which word** you are hearing and **not** of vowel length:
measured across the installed voices, the /ʊ/–/uː/ contrast Unit 1 teaches comes
out at 1–3% — and backwards on some voices — against the ~2× the lesson
describes. Use the audio for word identity and the IPA for length.

## Staying level with the prescribed book

The site's job is to be **at least as complete as the official student's book**,
never less. `curriculum/sgk/` records what that book actually teaches — all
twelve units section by section, its 282-word glossary, and its four cumulative
Reviews — and `python3 tools/check_coverage.py` checks our units against it:
the lexis, the Everyday English function, the Communication content block, and
each named grammar and pronunciation target.

The Reviews are the one part of that record the site used to have no shape
for, and `units/review-1..4.md` now carry them — see
[The four reviews](#the-four-reviews).

It reports rather than fails, because coverage is a curriculum decision and the
point is that the decision is visible instead of silent. Run it before adding or
revising a lesson, and read `curriculum/sgk/README.md` first.

## Provenance

Original teaching material written against a curriculum map compiled from public
sources (NXB Giáo dục Việt Nam × Pearson, GDPT 2018 curriculum; chief editor
GS.TS. Hoàng Văn Vân). It records structure and targets. It is not the
textbook's text.

The same is true of `curriculum/sgk/`: it records the book's syllabus at
exercise resolution — what each task asks, what type it is, what language it
targets — and describes the reading passages and listening scripts rather than
reproducing them. That directory is reference material for authors; the build
never reads it and the site never serves it.
