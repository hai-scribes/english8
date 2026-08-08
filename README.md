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
```

Requires `markdown` (`pip install markdown`). Edit the markdown in `units/`,
re-run the build, commit `docs/`. There is no CI step — a push publishes, so
run both gates before you push.

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
