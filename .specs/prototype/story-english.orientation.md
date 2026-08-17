# story-english — worker orientation

You are working in a throwaway git worktree forked from the `prototype/story-english`
branch. This file exists to save you the twenty minutes of `ls`, `find`, `grep` and
`cat` that a fresh session otherwise spends rediscovering an unchanged tree. It is
**facts only**.

## It carries no architectural preference, deliberately

Nothing here tells you how to build anything. Where this lane runs a tournament, the
competing approaches are the *point*, and a sentence in a shared orientation that
leaned toward one of them would silently decide the contest before it ran. If you
find yourself citing this file as a reason to prefer one design, that is a defect in
this file — say so in your summary and ignore it.

This file is not covered by any freeze hash. Treat it as convenience, never as
authority. The authority is the milestone objective you were given, the charter, and
the gate.

## What the product is

An English self-study app for one named learner: a Vietnamese grade-8 student,
studying alone, phone-first. The spine is a story read in chapters rather than a
syllabus worked through in units. The full prescribed curriculum is still delivered
and still marked honestly.

## Where things are

| Path | What it is |
| --- | --- |
| `harness/` | The gate. **Frozen — do not edit.** See below. |
| `content/` | The rebuild's authored content, where it exists |
| `units/`, `tools/`, `docs/` | The build being **replaced**. Reference only; not to be ported. `docs/` is generated output and is never hand-edited. |
| `curriculum/sgk/` | The prescribed textbook, recorded. 400 targets in `targets.json`. Kept, never regenerated. |
| `research/ielts/` | ~102,000 source-verified words. **Grep `index.jsonl`, open only the `file`+`sec` it names.** Reading these wholesale wastes a context window. |
| `research/story/` | Story bible, chapter briefs, chain-and-payoff audit |
| `data/`, `art/` | Dictionary, cast manifest, drawn assets. Kept. |

`curriculum/`, `research/`, `data/` and `art/` are assets the rebuild exists to
deliver better. Regenerating them is years of work; do not.

## What the gate runs

Three scenarios, from `.specs/prototype/story-english.checks.yaml` in the main
worktree. The driver runs these exact commands and its verdict is the only one that
counts:

- `build` — `node harness/coverage.mjs` and `node harness/support.mjs`
- `marking` — `node harness/marking.mjs`
- `session` — `node harness/session.mjs` and `node harness/surfaces.mjs` (real
  browser, phone width)

Each harness prints `ATELIER_METRIC <id>=<number>` on stdout. Run them yourself for
fast feedback.

**`harness/` is a declared gate artifact and is content-hashed into the milestone
freeze.** A variant that edits it is disqualified and burns the whole round. If a
harness looks broken, stop and say so in your summary — do not repair it.

## Hard constraints the gates enforce

These are not style preferences; each is checked mechanically and each traces to the
knowledge base.

- **No IELTS band number, half-band, band promise, or hours-to-band claim may ever
  reach a page.** Not a score, not a prediction, not a progress dial. `surfaces.mjs`
  scans every built page for them. Label by CEFR if you must label at all.
- **Never less than the prescribed book.** Coverage of `targets.json` may not
  regress. `coverage.mjs` measures it.
- **An exercise a key can settle is a committed, marked attempt** — never
  reveal-and-self-mark. Official key grammar, per-task word limits, spelling costs
  the mark.
- **The interface explains nothing about itself.** No criterion names, no evidential
  markers, no citations, no CEFR labels on the page. The learner is there to learn
  English, not to audit the course.
- **No Speaking scorer, and no Vietnamese pronunciation payoff claim.**

## Practical notes

- **This repo's path contains a space** (`/Users/.../Per/English 8`). Quote every
  path.
- Node dependencies: `[ -d node_modules ] || npm ci`. `playwright` is needed by the
  `session` scenario.
- Bind any port you serve from `${ATELIER_VARIANT_PORT:-<default>}`, never a
  literal — variants run concurrently and will collide on a fixed socket.
- Commit your own logical units as you go; the driver auto-commits leftovers as a
  backstop.
