# English 8 — Global Success

Self-study material for Tiếng Anh 8 (Global Success), published as a static site.

**→ [hai-scribes.github.io/english8](https://hai-scribes.github.io/english8/)**

Twelve units, seven lessons each. Every lesson teaches, then practises what it
just taught; the unit test opens only once all seven lessons are done.

Twenty-eight of those tasks do double duty. Each carries one changed
instruction, checkpoint or re-scored drill drawn from what the IELTS band
descriptors reward — no new topics, no extra homework, the same task aimed
better. See [The IELTS bridge](#the-ielts-bridge) below, and the generated
[evidence register](docs/evidence/index.html), which lists all twenty-eight with
the evidence behind each and how strong that evidence is.

## How the site is laid out

```
/                          the twelve units
/unit-NN/                  that unit's seven lessons, then practice + test
/unit-NN/lesson-M/         one lesson: teaching blocks, then its exercises
```

Exercises are inline with the lesson that teaches them, each with the answer
behind a reveal. Practice and the unit test live at the foot of the unit page —
never above the lessons, and inert until the lessons they cover are complete.

## Repository

| Path | What it is |
| --- | --- |
| `units/*.md` | **Source of truth.** One markdown file per unit. |
| `data/dict/*.json` | Dictionary entries — senses, definitions, examples, collocations, word families. |
| `research/ielts/` | The source-verified IELTS knowledge base every bridge cites. |
| `tools/check_dict.py` | Gate: every vocabulary slot resolves to a complete entry. |
| `tools/check_ielts.py` | Gate: the knowledge base's audit checklist, enforced. |
| `tools/test_marking.js` | Gate: the marking engine, against the published rules. |
| `tools/build.py` | Generator: markdown → the 98-page site. |
| `tools/assets/` | `app.css` and `app.js`, copied into the build. |
| `docs/` | Generated output. GitHub Pages serves this directory. |
| `curriculum/syllabus.md` | The syllabus map the units are written against. |
| `app/` | The earlier single-page artifacts this site replaces. |

## Building

```sh
python3 tools/build.py            # regenerate docs/
python3 tools/build.py --check    # parse and report counts, write nothing
python3 tools/check_dict.py       # gate: every vocabulary slot resolves
python3 tools/check_ielts.py      # gate: every IELTS claim is legal and cited
node tools/test_marking.js        # gate: the marking engine obeys the published rules
```

Requires `markdown` (`pip install markdown`). Edit the markdown in `units/`,
re-run the build, commit `docs/`. There is no CI step — a push publishes, so
run all three gates before you push.

## Marked tasks, one play, and strands

Three directives carry the parts of IELTS that are a *system* rather than a
label. Each replaces an instruction the learner used to be trusted to follow
with a mechanic the page enforces.

### `:::task` — a committed answer, marked by the published rules

```markdown
::: task skill="listening" type="sentence-completion" words="2+number"
- The school asked ___ students. = two hundred ~ written as words
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
  that says quoted. The footer prints the marker; the two must agree.

The same prohibitions are scanned over `tools/build.py`, because the generator
authors learner-facing copy too — the home page, the unit cards, the register.

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
script unlocks. It also unlocks as soon as every task on the page is marked.

The voice is the device's speech synthesiser and the page says so plainly —
what this trains is the shape of the task, not the ear.

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
| `name` | The instruction, in a phrase. Shown on the unit page and in the register. |
| `trains` | One of the descriptors' own criterion names, or `Reading` / `Listening`. |
| `marker` | The evidential marker, **inherited from the source and never upgraded**. |
| `src` | `NN §X.Y` — a real section of a real file in `research/ielts/`. |
| `cefr` | Optional. A CEFR level. Never an IELTS band; there is no band for A2. |

`tools/check_ielts.py` fails the build if a marker is not in the legal set, if a
cited section does not exist in the file it names, if a unit's writing task
names no criterion, or if any unit's text contains a band promise, a half-band,
a template or a Vietnamese-L1 pronunciation claim outside the three permitted
targets. The generator prints the marker under every bridge, glossed in plain
English — a weak claim reads as weak on the page, because a caveat that has to
be remembered is a caveat that gets dropped.

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

## Provenance

Original teaching material written against a curriculum map compiled from public
sources (NXB Giáo dục Việt Nam × Pearson, GDPT 2018 curriculum; chief editor
GS.TS. Hoàng Văn Vân). It records structure and targets. It is not the
textbook's text.
