---
name: art-generation
description: Generate the comic's art with Gemini — characters, background plates, props, effects — cut it out to transparency, check it, and promote it into art/. Use when asked to draw, generate, re-roll or fill in missing art, when check_cast.py reports undrawn files, when a new prop, effect or place has just been added to data/cast.json, when an image needs its background removed, or when asked to make any graphical asset for the site.
---

# Generating the art

`tools/art.py` (the shell) and `tools/artgen/` (the Python behind it) turn the
prompt blocks in `research/story/illustration-prompts.md` into finished,
transparent, checked art. **Load `story-staging` too** — it owns what the art is
*for*; this skill owns how it gets made.

## Setup, once

The key lives in `.secrets/gemini.key` (gitignored) or `$GEMINI_API_KEY`.
`python3 tools/art.py status` says whether it is found. Then:

```sh
python3 tools/art.py models      # confirm the image model ids this key reaches
```

Defaults: `gemini-3.1-flash-image` to draw, `gemini-flash-latest` to critique.
Override per run with `--model` / `--critic-model`, or by
`GEMINI_IMAGE_MODEL` / `GEMINI_CRITIC_MODEL`. If a default 404s, `models` shows
what replaced it.

An optional *Ponyo* still as a style reference goes in `.artgen/ref/style.png`
(gitignored — it is not ours to publish). It is attached to cast, plate and
prop prompts and never to effects, as the prompts file says.

## The loop

```sh
python3 tools/art.py status                       # 1. what is missing
python3 tools/art.py gen fx/sweat -n 3            # 2. candidates, nothing promoted
python3 tools/art.py contact fx/sweat             # 3. one image of them all
#                                                    → Read .artgen/contact/fx__sweat.jpg
python3 tools/art.py accept fx/sweat [file]       # 4. promote + compose
python3 tools/check_cast.py && bash tools/gates.sh  # 5. prove it
```

Each candidate goes: **generate → cut out → machine checks → critic**. The
machine checks (`artgen/qa.py`) reject what is measurable: a background that is
not flat or not white, a drawn transparency checkerboard, a figure cropped by an
edge, an outline with a gap that the flood got through, an effect that covers
the frame. The critic (`produce.critique`) is a vision model reading the
picture against its own prompt plus that kind's drift-table symptoms. A strong
pass (8/10 or better) stops the search early, to save calls.

`gen --accept` does steps 2 and 4 in one go, for bulk runs. **Step 3 is never
optional before a commit.** Read the contact sheet yourself: the critic misses
things and invents things. It is a filter, not the judge.

### What happens on promote

| kind | master written to | then |
| --- | --- | --- |
| cast | `art/cast/<slug>/<emotion>.<ext>` | `make_sheet.py <slug>` once all six exist |
| bg | `art/bg/<slug>.jpg` | `make_overlay.py --plates` |
| props / fx | `art/<kind>/src/<slug>.<ext>` | `make_overlay.py <slug>` |

A master is kept exactly as the generator returned it. A replaced one is moved
to `.artgen/replaced/`, never deleted.

## Rules

- **Never `--replace` without being asked.** Tí's and Thảo's twelve are drawn and
  final. `--replace` exists for a person who has looked and said "redo that one".
- **Generate a new character's `neutral` first, accept it, then the other
  five.** The other five are sent the accepted drawings as references, and that
  is the whole of character consistency. Five emotions generated before a
  neutral exists have nothing to agree with.
- **Budget.** Every invocation is capped (`--budget`, default 24 image calls).
  Raise it knowingly for a bulk run; don't loop around it.
- **The prompt is edited in the prompts file, never in code.** `art.py` sends
  the block verbatim, plus one reference preamble. To fix a drift, edit the
  block, and keep the load-bearing sentences — `check_cast.py` fails if one goes.
- **New art the story needs** follows `story-staging`'s three edits (cast.json,
  a prompt block copied from one of the same kind, the scene), then
  `art.py gen <slug>`. `check_cast.py` fails on half of that.
- **Anything off-catalogue** (an illustration for a page, an icon) uses
  `art.py free --kind props|fx|bg "<subject>" --out .artgen/free/<name>`. It
  wraps the subject in an existing block's style text, the prompts file's own
  rule for a new prompt. `--raw` sends the text as the whole prompt. Where it
  ends up in the site is a separate decision: art in `docs/` is deleted on every
  build.
- **The art ships with the page.** A promoted file changes `art/`, which the build
  copies into `docs/assets/`. Commit the art, the rebuilt `docs/` and any prompt
  edit together.

## What the first runs taught

Each of these cost real generations to find. None is a guess.

- **The model draws a mark well and cannot place it.** Six blushes across two
  prompt versions landed on hair and eyes whatever percentages were given. An
  effect that must land on a feature is drawn **alone** and stamped by
  `make_overlay.py` at the `place` positions in `data/cast.json`
  (`tools/artgen/place.py` has the measurements). `flush`, `question` and
  `speed` work this way. Do not write coordinates into a prompt.
- **Keep a stamp out of the band above the head.** The speaker's balloon sits
  there and is drawn over effects. Beside the head, in front of the face, is
  free.
- **An effect is drawn OVER its figure**, so anything "behind" the figure must
  stop short of it. Speed lines are stamped into the space behind the head.
- **A glyph gets `"upright": true`.** The page mirrors a figure effect with its
  figure; a mirrored question mark is another character.
- **A new character is sent the drawn cast as style references.** With no
  reference, three Bà Sáus came back in three styles. `produce.references`
  now attaches other characters' neutrals, for style only.
- **The critic is good at style and bad at detail.** It passed a kitchen that
  faded out at the edges and missed a wrong hand pose; it also failed good
  birds when the preview was wrong. Read the contact sheet yourself.
- **Check the preview before believing a verdict.** A critic judging a wrong
  composite gives confident, wrong answers. `art.py recheck` re-judges for free
  once the preview is fixed.
- **Look at the real page, not only the composite.** The question mark passed
  every check and was half hidden by a balloon on the page.

## Getting better over time

`python3 tools/art.py report` groups every logged candidate by kind: pass rate,
the machine checks that fire most, and the critic's most common fatal defects.
When one defect keeps recurring for a kind, the fix is **an edit to that kind's
blocks in the prompts file**, following the drift table's own advice (usually
to restate a section in full, never to add a "not X" — the file explains why
negation backfires). Add a row to the drift table when the symptom is new. Then
re-roll, and compare `report` before and after. A change that doesn't move the
pass rate gets reverted.

Keying problems are fixed in `artgen/cutout.py` or `qa.py` with a new case in
`tools/test_artgen.py`, never by loosening a threshold until a bad image passes.

## Cutting out any image

```sh
python3 tools/art.py cut some.png -o some.cut.png --preview
python3 tools/art.py check some.png --kind props
```

The keyer measures the background colour from the edges, floods it inward from
the border (so white inside a closed outline survives), reports how much of the
figure was only reachable through a gap in the outline (`leak_frac`), and
softens the edge so it leaves no pale halo. `--repair` keys the gap-closed
version instead. That is a rescue for an otherwise perfect drawing, not a
substitute for a re-roll. `make_sheet.py` and `make_overlay.py` use the same
keyer.
