# The official book, recorded — Tiếng Anh 8 (Global Success), Sách học sinh

A complete section-by-section record of what the prescribed student's book
teaches, so that nothing it covers can go missing from ours by accident.

This is **reference material, not lesson material**. `tools/build.py` does not
read this directory and nothing here is published. Our own teaching material
lives in `units/*.md` and is original; see `README.md` §Provenance.

## What is here

| File | What it holds |
| --- | --- |
| `book-map.md` | The Book Map (pp. 4–7) plus every unit's *This unit includes* box — the twelve units' seven official targets each |
| `glossary.md` | The book's own glossary (pp. 136–139) — 282 headwords with IPA and Vietnamese, by unit |
| `unit-NN.md` | One file per unit: all seven sections, every exercise, its type, its cues and its target language |
| `reviews.md` | Reviews 1–4, which fall after Units 3, 6, 9 and 12 |
| `targets.json` | The same content machine-readable, for `tools/check_coverage.py` |

## What "recorded" means, exactly

For every exercise this records **what it asks, what type it is, and what
language it targets** — the syllabus facts. Where an item's wording carries
the teaching point (a set of options, a cue list, a table's row labels, a
matching pair), the wording is given, because paraphrasing it would lose the
target. Reading passages, listening scripts and dialogues are **described,
not reproduced**: topic, length, structure, the facts the questions turn on,
and the vocabulary they carry.

That is the line the repo already draws. `curriculum/syllabus.md` records
structure and targets; this directory records the same thing at exercise
resolution. Neither is the textbook's text.

The book is © NXB Giáo dục Việt Nam and Pearson Education, 2023
(ISBN 978-604-0-35127-2) and its imprint reserves all reproduction rights.
Nothing in this directory is served by the site.

## How to use it

Before writing or revising a lesson, open the matching `unit-NN.md` and check
the unit against three things:

1. **The seven targets** — vocabulary set(s), pronunciation, grammar,
   Everyday English function, and the four skills topics.
2. **The Communication content block** — every unit has one, and it is the
   half of that section our units have historically dropped.
3. **The glossary list** for that unit — this is the lexis a learner is
   examined on.

Then run:

```sh
python3 tools/check_coverage.py            # what the book teaches that we don't
python3 tools/check_coverage.py --unit 3   # one unit, in detail
```

It reports; it does not fail the build. Coverage is a curriculum decision, not
a correctness one — the point is that the decision is visible.

## Source

Read from the student's book PDF (143 pages, scanned; no text layer), page by
page, on 2026-08-10. Book page *n* is PDF page *n+2*.

- Units are 10 pages each · Reviews 2 pages · Glossary 4 pages
- Chief editor GS.TS. Hoàng Văn Vân; chief author Lương Quỳnh Trang
- Audio track numbers are printed on the page and are recorded here, because
  they identify which recording each listening task uses on sachmem.vn
