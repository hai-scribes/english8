# English 8 — Global Success

Self-study material for Tiếng Anh 8 (Global Success), published as a static site.

**→ [hai-scribes.github.io/english8](https://hai-scribes.github.io/english8/)**

Twelve units, seven lessons each. Every lesson teaches, then practises what it
just taught; the unit test opens only once all seven lessons are done.

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
| `tools/build.py` | Generator: markdown → the 97-page site. |
| `tools/assets/` | `app.css` and `app.js`, copied into the build. |
| `docs/` | Generated output. GitHub Pages serves this directory. |
| `curriculum/syllabus.md` | The syllabus map the units are written against. |
| `app/` | The earlier single-page artifacts this site replaces. |

## Building

```sh
python3 tools/build.py            # regenerate docs/
python3 tools/build.py --check    # parse and report counts, write nothing
```

Requires `markdown` (`pip install markdown`). Edit the markdown in `units/`,
re-run the build, commit `docs/`. There is no CI step — a push publishes.

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
