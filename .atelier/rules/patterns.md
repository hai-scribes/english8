# Code Patterns — story-english

Engineering rules for the rebuild. The stack is not yet chosen, so these are
written to be stack-agnostic and concrete. Where a rule exists because the
discarded build got it wrong, the defect is named — those are the expensive
ones, already paid for once.

## A visual claim needs a real browser

Anything asserted about layout, geometry or overlap is measured in a real
rendering engine against real boxes, or it is not asserted. A DOM shim that
does no layout cannot see a balloon covering a face.
- good: headless Chromium, read `getBoundingClientRect()`, assert the numbers
- bad: `expect(css).toContain('.balloon { position: absolute')` — asserting a
  stylesheet as a *string*
- bad: grepping the app's own source for `function ovoidPath` — renaming a
  function fails the gate with a pixel-identical picture, and a balloon landing
  on a character's face passes it

This is the single most expensive lesson from the previous build: 41% of its
runtime was geometry guarded only by string matching.

## A gate that renders nothing must not report success

Every sweep emits a coverage count alongside its result. Zero panels rendered
and "0 px overlap" are the same output otherwise, and one is a pass and the
other is a broken harness.
- good: emit `panels_swept` next to `ink_outside_frame_px`; fail on zero
- bad: a soak that loops over an empty list and reports 0% growth

## Benchmarks emit a bare number

A measurement harness prints `ATELIER_METRIC <metric_id>=<number>` on stdout —
a bare number, no unit, the unit lives in the metric id. Prose is for humans;
the gate parses the line.
- good: `ATELIER_METRIC panel_layout_ms=8.4`
- bad: `Layout took 8.4ms per panel` as the only output

## The measuring stick is not editable by the thing being measured

Harness code, fixtures and their manifests live in a declared subtree and are
content-hashed into the gate. A variant that edits the harness it is judged by
is disqualified. Declare the whole subtree — a helper module the harness imports
is part of the stick.

## Module boundaries, enforced by the build

No single script does everything. Each surface loads what it needs, and the
dependency direction is checkable. The previous build shipped one 4,702-line
script on all 101 pages with no module boundary; the cost was that nothing could
be tested, replaced or deleted in isolation.
- bad: one file owning reading, marking, comic geometry, audio and scheduling

## Content is data; the renderer never hard-codes a chapter

Chapters, exercises, glosses, cast and schedule are data the renderer consumes.
Adding a chapter is adding data. A `switch` on chapter number, or a component
named for one unit, means the shape has assumed grade 8 — which is the thing the
brief says it must not do.

## Source trees are inputs; generated output is disposable

`curriculum/sgk/`, `research/`, `data/dict/`, `data/cast.json` and `art/` are
**sources and are never edited by a build**. Generated output is deleted and
rebuilt wholly on every run, so nothing may be hand-placed inside it and nothing
irreplaceable may live there.
- bad: dropping an image into the output directory — the next build deletes it

## The build is deterministic

Same sources in, byte-identical output. No timestamps, no ordering that depends
on filesystem iteration, no randomness. Determinism is what lets a rebuild-diff
prove that published output is not stale or hand-edited.

## Persisted learner state is versioned and forward-safe

Attempt history, review schedule and reading position outlive any release. Every
persisted record carries a schema version; a reader that meets an unknown
version degrades rather than throwing away the learner's history. There is one
learner and no server-side backup — losing her record is losing the product.

## Validate at the boundary, trust inside it

Parse and validate content data, persisted state and user input where they enter
the system; internal code then trusts its own contracts. Do not re-check the
same invariant at every call site.

## Fail the build on an unresolvable reference

A gloss with no dictionary entry, a chapter naming a character or background
that does not exist, an answer key that is not among its own candidates, a
target claimed but not delivered — each is a build failure at authoring time,
not a blank on a page at reading time. The previous build got this right and it
is worth carrying: a conversion that builds is a conversion that is right.

## Report and fail are different verbs — choose consciously

A curriculum-coverage report that exits 0 is a decision surface, not a gate; a
large rewrite can go fully green while quietly dropping required content. If a
rule must hold, it fails the build. If it is a judgement, it reports — and
something else has to be watching.

## No timing measurement without a stated workload

A latency or throughput number is meaningless without what was rendered, at what
width, how many times, and on what. Bounds are declared so an implausibly good
result stops for review instead of certifying a fantasy.

## Type safety at the edges

No implicitly-untyped content records. Parse external and persisted data into
known shapes; narrow unknowns rather than asserting them.

## Do not port the previous implementation

`tools/`, `docs/` and the generated site are reference for *intent* only. Read
them to learn what a feature had to do, never to copy how it did it.
