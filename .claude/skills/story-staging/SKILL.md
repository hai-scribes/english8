---
name: story-staging
description: Stage a :::dialogue as a comic — backgrounds, drawn faces, balloon shapes, props beside a character, manga effect overlays, and more than two people in a panel. Use when writing or revising a Lesson 1 dialogue in units/*.md, when adding a character, place, prop or effect to data/cast.json, when a build fails with "is not a character/prop/effect in data/cast.json", or when asked to make a story scene richer, more visual, or more like a comic.
---

# Staging a dialogue as a comic

Every unit's Lesson 1 `:::dialogue` is a chapter of *The Sea Gives Back* and
renders as a comic: a background plate, the people in the scene, the things in
it, manga overlay marks, and speech balloons — one panel at a time, advanced by
the reader.

All twelve are staged. **You do not have to invent this vocabulary; it exists,
it is validated at build time, and using it is cheaper than describing something
in prose.** If a scene wants a golden ring to appear between two characters, or
a third person standing at the edge, or stars circling a stunned boy, that is a
line of markup, not a rewrite.

## Read these first

| | |
| --- | --- |
| `data/cast.json` | the whole vocabulary — who, which faces, which places, which props, which effects, which balloon shapes. **The build fails on anything not in it.** |
| `research/story/chapter-briefs.md` | the frozen story interface: what each chapter must contain. Never traded away |
| `research/story/illustration-prompts.md` | every generation prompt, and the filenames they must be saved under |
| `CLAUDE.md` § *The dialogue is a comic* | the rules a change here must not break |

## The markup, in full

```
::: dialogue title="…" bg="harbour-wall" gramen="…" gramvi="…" gramco="…"
@cast Tí|sad, Thảo|neutral
@item bucket at=left
@fx birds on=panel
**Thảo|neutral:** You've been down here all morning.
**Thảo|annoyed|shout:** Tí.
Narration has no speaker: a plate, a caption box, no avatar.
@bg school-yard
:::
```

| Line | What it does | Lifetime |
| --- | --- | --- |
| `**Name\|emotion\|balloon:** text` | somebody speaks. `emotion` defaults to `neutral`, `balloon` to `say` | the line |
| a line with no `**Name:**` | narration — a caption box over the plate. Nobody speaks; whoever is on stage stays on it | the line |
| `@bg <slug>` | changes the place | persists; **clears the props** |
| `@cast A\|emo, B, C` | sets who is on stage, including silent people. `@cast none` empties it | persists |
| `@item <slug> at=…` | a thing in the scene. `@item none` clears them | persists until cleared or `@bg` |
| `@fx <slug> on=…` | a manga overlay mark | **one panel**, then gone |

**Any `@` line is a panel break.** That is the panel-break tool — there is no
other syntax for one, and there does not need to be: a panel has one background,
one roster and one set of props, so a line that changes any of them cannot be in
the panel before it.

## Everything available, in one list

The whole vocabulary a chapter can be told with. Nothing here ranks above
anything else here, and nothing here has to be used: a dialogue that is six
speech balloons on one background is a complete dialogue. `data/cast.json`
carries the description of each slug and is what the build validates against —
where this list and that file disagree, that file is right.

| Kind | What there is |
| --- | --- |
| **Ways a line can appear** | a speech balloon, or narration (no `**Name:**` — a caption box over the plate, with the stage still standing behind it) |
| **Balloon shapes** | `say` · `shout` · `think` · `whisper` |
| **People** | Tí · Thảo · Bống · Bà Sáu · Khoa — up to four on stage at once |
| **Faces** | `neutral` · `happy` · `worried` · `annoyed` · `surprised` · `sad` |
| **Places** | `harbour-wall` · `kitchen` · `school-yard` · `fish-market` · `lane` · `town-beach` · `science-room` · `flooded-street` · `cliff-road` · `whale-temple` · `under-water` |
| **Props** (`at=left\|center\|right\|<person>`) | `bucket` · `board-game` · `class-list` · `notebook` · `green-notebook` · `cakes` · `lantern` · `rubbish-bag` · `money` · `radio` · `phone` · `box` · `worksheet` · `chalk` |
| **Effects over one figure** (`on=<person>`) | `impact` · `sparkle` · `dizzy` · `sweat` · `flush` · `anger` · `question` · `gloom` · `speed` |
| **Effects over the frame** (`on=panel`) | `birds` · `splash` · `rain` |
| **Panel breaks** | any `@` line |

Adding a slug to any of those rows means adding it to `data/cast.json` and to
`research/story/illustration-prompts.md` — see *Adding to the vocabulary*.

### Naming a person

`at=` and `on=` take **the display name or the slug**: `on=Tí` and `on=ti` are
the same. Prefer the slug — it is diacritic-free, and a name with a space
(`Bà Sáu`) otherwise has to be quoted as `at="Bà Sáu"`.

### The four balloon shapes, and narration

| | |
| --- | --- |
| `say` | the default. Rounded, hard contour, solid tail |
| `shout` | loud — called across a yard, or lost patience. A spiked burst. It is emphatic, so two in a row cancel each other |
| `think` | not said aloud. A cloud, with bubbles trailing to the thinker |
| `whisper` | said quietly, or not meant to carry. Broken contour |
| narration | a line with no `**Name:**` — a caption box over the plate, and no balloon. It does **not** clear the stage: whoever `@cast` has put there stays, none of them lit, which is what a beat with no dialogue in it looks like. For an establishing shot with nobody in it, write `@cast none` above the line |

One constraint, and it is about exercises rather than about the shape: a
`think` balloon is interior monologue, so a listening or speaking exercise
cannot be built on one, and a line the learner is meant to practise saying
aloud does not go in one.

### Props

```
@item board-game at=center      left | center | right
@item notebook at=ti            beside that person, on their outward side
@item class-list at=right       a prop that `hangs` goes BEHIND the people
@item none                      clear the stage
```

A prop is furniture: it exists in the scene and a line can point at it. Put one
on stage **only if it is really there** — a thing a character merely mentions is
not a prop, and drawing it is a lie the reader will notice. Unit 1 places none,
because nothing in that scene is on the harbour wall.

### Effects

```
@fx sparkle on=bong             a mark over one person
@fx rain on=panel               a mark over the whole frame
```

`data/cast.json` says which of the two each effect is, and the build refuses the
wrong one — rain over one boy and a sweat drop over a whole street are both
nonsense, in opposite directions.

**Hard caps, enforced at build:** one effect per person per panel, one panel-wide
effect per panel. A frame carrying a shock burst *and* circling birds *and*
motion lines is not three times as expressive; it is unreadable. If a beat wants
more, it wants fewer.

Two of these do a job the six drawn faces cannot: `flush` and `sweat` carry
embarrassment, which is not one of the six expressions and would otherwise have
cost five more character drawings.

### More than two people

The stage holds **four**, and the build fails on a fifth. That is legibility,
not layout: the avatars are half-body in one square-ish frame, so four are
already about a fifth of the width each, and a fifth figure is a silhouette —
which cannot carry an expression, and the expressions are the entire reason the
art exists. A scene that genuinely needs five people is two panels, and a
`@cast` line between two spoken lines is a panel break.

Figures are laid out left to right **in the order they arrive on stage**. The
speaker is at full strength and in front; everybody else is held back. Order the
`@cast` line deliberately — it is the blocking of the scene.

## Rules that bind a staged dialogue

These are defects that have already been paid for. None is negotiable.

1. **The transcript stays in the document as real markup.** Exercises say
   "find it in the dialogue" and send the learner back to look at a verb;
   neither is answerable one panel at a time. It is also what `Ctrl+F`, a screen
   reader and a printout use. The comic is the enhancement, not the page.
2. **The balloon carries no name.** Who is speaking is shown by the picture —
   the tail points at them and they are the figure in focus. The name is still
   in the stage's accessible name, because a screen-reader user has no tail to
   follow. Never put it back on the balloon.
3. **Nothing intercepts scroll, wheel or touchmove.** The panel is driven by its
   own controls and the page's scrolling is left completely alone. There is a
   test asserting the app registers no such listener.
4. **Glosses work inside the balloons**, wired per scope so the same marked word
   can exist in both views without sharing a DOM id. A dialogue needs **at least
   three** `[[glossed]]` tokens, each resolving in `data/dict/` with a
   non-empty Vietnamese sense, and there are **zero** gloss controls anywhere in
   Lessons 2–7 — support here, withdrawal after.
5. **A dialogue with no `bg=` ships as plain text.** That is the rollout, not a
   failure. Props and effects in an unstaged dialogue are a build error, because
   none of it would be drawn.
6. **Never insert, delete or reorder a bullet inside an existing `:::task`**
   while rewriting a dialogue the tasks quote. `review_items()` derives the
   spaced-review schedule from position-based ids, and no gate catches this.
   Same bullet count, same order, new text.
7. **Every task key that quotes the dialogue is rewritten with it**, and the
   Answer Key at the foot of the unit with it.

## Adding to the vocabulary

A new character, place, prop or effect goes into `data/cast.json` **and** gets a
prompt in `research/story/illustration-prompts.md` in the same change — the
manifest's slug and the prompt's filename must agree, and a slug nobody drew is
worse than one that is missing, because it reads as available.

Do not add a prop or an effect speculatively. `tools/check_cast.py` reports
anything declared that no dialogue names, and that report should stay empty.

## The pipeline

```sh
python3 tools/build.py                # regenerate docs/ — validates all of the above
python3 tools/check_cast.py           # what is declared, and what is drawn
python3 tools/make_sheet.py --all     # six character drawings -> one sheet each
python3 tools/make_overlay.py --all   # prop and effect drawings -> cut-outs
node tools/test_reading.js            # gates the navigation and balloon contract
python3 tools/check_level.py --strict-through 3   # story prose stays inside grade 8
```

Art lives in `art/` — masters under `art/cast/<slug>/`, `art/props/src/` and
`art/fx/src/`; published files beside them. **Never put art in `docs/`**: the
build deletes `docs/assets/` on every run.

While a file is missing the page still works. A character, a background or a
prop leaves a dashed placeholder naming the exact file. **An effect leaves
nothing at all**, deliberately — a labelled box over somebody's face is worse
than no effect — so `check_cast.py` is the only place an undrawn one is
reported.

## What not to do

- Do not write an instruction, a genre or a stage direction into `ask=` prose
  when markup exists for it.
- Do not stage the `:::audio` script. A listening task that shows the scene is a
  reading task, and printing any sentence of that script anywhere is forbidden
  outright.
- Do not explain the comic, the design or the research on a learner's page. The
  interface is the learner's; the reasoning goes in `research/`.
- Do not force a prop or an effect into a scene to use up the vocabulary. The
  list above is what is available, not a set of boxes to tick — Unit 1 places no
  props, because the bucket is behind the kitchen and not on the harbour wall.
