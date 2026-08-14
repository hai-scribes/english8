# English 8 — working notes for agents

Self-study material for Tiếng Anh 8 (Global Success), built as a static site.
`README.md` has the layout and provenance. Source of truth is `units/*.md`;
`docs/` is generated — never hand-edit it.

```sh
python3 tools/build.py            # regenerate docs/
python3 tools/build.py --check    # parse and report counts, write nothing
python3 tools/check_dict.py       # gate: every vocabulary slot resolves
python3 tools/check_ielts.py      # gate: every IELTS claim is legal and cited
node tools/test_marking.js        # gate: the marking engine obeys the published rules
node tools/check_write.js         # gate: each model satisfies its own checklist (after build)
node tools/test_reading.js        # gate: the reading screen behaves (after build; needs jsdom)
python3 tools/check_coverage.py   # report: what the official textbook covers that we don't
python3 tools/index_sgk.py --check  # gate: the recorded book's lookup index is current
python3 tools/check_level.py --strict-through 3   # gate: story prose stays inside grade 8
python3 tools/check_cast.py       # gate: manifest and art brief agree · report: what is drawn
python3 tools/make_sheet.py --all   # compose the drawn expressions into character sheets
python3 tools/make_overlay.py --all # cut the prop and effect drawings out of their white
```

`test_reading.js` needs `npm install jsdom` and skips loudly without it, so the
other four still run on a clean checkout.

## Publishing, and the account this repo pushes as

**The push is the deploy.** GitHub Pages serves `docs/` from `main` directly —
there is no CI between a commit and the live site at
<https://hai-scribes.github.io/english8/>. So `docs/` must be rebuilt and every
gate green *before* you push, because nothing downstream will catch you.

This repo belongs to **`hai-scribes`**, and pushes must authenticate as that
account. The trap: `gh` can hold several logged-in accounts, and its git
credential helper hands git the token of whichever one is **active** —
it ignores the username git asks for, so `credential.username` will not fix it.
If the active account is somebody else, the push dies with a 403 that names the
wrong user.

`.git/config` is not committed, so **a fresh clone has to be pinned again**:

```sh
git config --local --replace-all 'credential.https://github.com.helper' ''
git config --local --add 'credential.https://github.com.helper' \
  '!f() { test "$1" = get && printf "username=hai-scribes\npassword=%s\n" \
   "$(gh auth token -u hai-scribes)"; }; f'
git config --local user.name  "hai-scribes"
git config --local user.email "230175965+hai-scribes@users.noreply.github.com"
```

The empty first value is load-bearing: it resets the helper list inherited from
global config so only this one runs. Check it took with

```sh
printf 'protocol=https\nhost=github.com\n\n' | git credential fill | grep username
```

This changes nothing globally — other repos keep using whichever account is
active, and `gh auth switch` is not needed.

## The unit-1 pilot, and the rules it established

Unit 1 has been rebuilt end to end as the pattern for the other eleven. Nothing
below is a preference: each line is a defect the pilot found, with the fix that
was shipped. **Process units 2–12 against this list**, one unit at a time,
running every gate after each.

### An exercise a machine can mark is a `:::task`, not printed prose

Unit 1 had nine printed exercises with no directive. Four were genuinely open
(write about yourself, speak, invent an invitation) and stay prose. The rest —
correct-the-mistake, build-the-sentence, complete-the-mini-dialogue — are now
marked. A reveal-and-self-mark exercise is the arrangement every directive in
this repo exists to replace, and `09` §4.4 is the reason: learners cannot
self-assess accurately. **Expect roughly a dozen per unit; convert the ones a
key can settle and leave the rest, saying which is which.**

### The genre lives in a `variant`, never in `ask=` prose

`type` says what an exercise is in the test's vocabulary. It does not say what
the learner does. Five genres were shipping as `type="choice"` with the real
instruction hand-written into `ask=`, so polishing one polished one — and
odd-one-out, whose instruction said "pick", rendered as a **free-text box**
where spelling could cost the mark on a question about meaning.

`VARIANTS` in `tools/build.py` now owns the instruction, the label and the
widget for `odd-one-out`, `error-correction` and `sentence-build`. A task's own
`ask=` is *extra* detail appended to the variant's, never a replacement. Add a
genre by adding a variant, never by writing the instruction into a unit.

> **Still to do:** ten units carry odd-one-out exercises in the old prose form
> (`a · b · c = key` under `type="choice"`). They are still text boxes. Adding
> `variant="odd-one-out"` is the whole fix.

### A marked task must not print its own answer

Unit 1's 1.3 bolded `can't stand **hearing**` and asked which form follows —
the answer was the suffix on the bolded word. Its 3.1 asked which group a verb
belonged to, with the groups listed twenty lines above. Both are transcription
wearing retrieval's clothes.

The fixes generalise: **ask for the thing that is not on screen** (1.3 now
names the verbs and sends the learner back to the dialogue to find the form),
and **move a classification check away from the box that answers it** (3.1's
went to Lesson 7, where it is a delayed check instead of a copying exercise).

*Noticing* is a real activity and is worth keeping — but it must not be a
scored, committed, one-shot attempt, because that is the machinery of
retrieval and it measures nothing here.

> This one is **not gated**, and deliberately. The defect is semantic, not
> lexical: a rule matching keys against the text above fires almost entirely on
> legitimate exercises — inline `(many / much)` choices, `/br/` keys inside
> the word that contains them, MCQ letters. A gate that cries wolf gets
> ignored, which costs more than it saves. Check this by reading.

### The review queue takes the productive item, not the first one

`review_items()` used to take the first N keyed items it met in a lesson, so
unit 1's entire grammar review was `enjoy → 1, would love → 3` — four recalls
of an arbitrary group number, because a classification drill happened to be
printed above the gap-fill. Candidates are now ranked **produced before
picked** and the cap applied afterwards. Check what a unit actually enrols
before assuming it is teaching anything.

### A retake is a new attempt, never an edit

Every marked task now offers *Try it again*: the answers clear, the attempt
history survives, and both runs are listed. Repeated retrieval is what builds
memory, so locking a task after one go cost learning for nothing.

Three things it must never become, each from a rule a friendlier version would
break — no average across attempts (**E3**), no trend or "better" (**E9**: a
single retest is regression to the mean as much as learning), and **no retake
at all on a task a timer has already spent**, or the button quietly repeals C6
and C7. That last one is gated in `test_reading.js`.

### The dialogue is a comic, and the transcript is still the page

**`.claude/skills/story-staging/` is the working guide** — the whole markup
vocabulary, the rules that bind it and the art pipeline, in one place. Read it
before writing or revising a dialogue. What follows is the summary.

`:::dialogue` renders as a background plate, the people in the scene, the things
in it, manga overlay marks and speech balloons — **one panel at a time, advanced
by the reader**. `data/cast.json` declares the five characters, the six
emotions, the eleven backgrounds, the ten props, the twelve effects and the
four balloon shapes; the build **fails** on a dialogue naming anything outside
it, and `tools/check_cast.py` reports which images have actually been drawn.

**All twelve units are staged.** The rollout is finished; what is outstanding is
art, not authoring.

Art is **one drawing per expression** — thirty square pictures — composed into a
3 x 2 sheet per character by `tools/make_sheet.py`, which squares each drawing,
keys the white to transparency by flooding in from the border (skipping a
drawing that already arrives cut out), lays out the grid, and encodes it at
640 px panels as WebP. The drawings live in **`art/cast/<slug>/<emotion>.png`**
and the sheet beside them as `art/cast/<slug>.webp`; `art/` is a source tree
and `build.py` copies the sheets and the plates into `docs/assets/`. **Do not
put art in `docs/`** — the build deletes `docs/assets/` on every run. Asking a generator for the six-panel sheet directly returned eight panels
four times running: multi-panel layout is the weakest thing these models do, and
"not eight" made it worse, because diffusion models have no representation of
negation and naming a number only raises its salience. Layout is arithmetic; ask
a generator only for what it is good at. The `col` index in `data/cast.json` is
the panel's position and is load-bearing twice over — the composer writes to it
and the page reads from it — so reordering it without regenerating the art gives
every character the wrong face. `research/story/illustration-prompts.md` is the
brief — every prompt the art needs, and nothing else — and its filenames and the
manifest's slugs must agree.

Props and effects are **one cut-out each**, keyed by `tools/make_overlay.py`
from masters in `art/props/src/` and `art/fx/src/`. It is `make_sheet.py`'s
smaller sibling and differs in two deliberate ways: it **trims a prop** to its
content, because the manifest's `size` is its height as a fraction of the panel
and that is only true if the file's edges are the object's; and it **does not
trim an effect**, because half of them belong above a figure's head and their
position inside the square is the information.

```
::: dialogue title="…" bg="harbour-wall"
@cast Tí|sad, Thảo|neutral
@item bucket at=left
@fx sparkle on=ti
**Thảo|neutral:** You've been down here all morning.
**Thảo|annoyed|shout:** Tí.
@bg school-yard
**Tí|sad:** Nothing's wrong.
:::
```

`|emotion` defaults to `neutral` and `|balloon` to `say`. `@bg` moves the scene
and clears the props; `@cast` sets who is on stage, silent people included;
`@item` puts a thing in it, which persists; `@fx` puts a manga mark over one
person or the whole frame, for **one panel only**. **Any `@` line breaks the
panel** — that is the panel-break tool, and it is the only honest reading, since
a panel has one background, one roster and one set of props. A line with no
speaker is narration — a caption box over the plate, no balloon, and **the stage
stays as it stands**: narration means nobody is speaking, not that nobody is
there, so the roster survives it with none of its figures lit. `@cast none` is
how you get an empty establishing shot. A dialogue with no `bg=`
is unstaged and ships as plain text; that is now an error state rather than the
rollout, because all twelve are staged.

Two caps, enforced at build because both are legibility: **four people** on
stage (a fifth half-body figure is a silhouette, and a silhouette carries no
expression), and **one effect** per person plus one over the frame (a frame with
a shock burst and circling birds and motion lines is unreadable, not expressive).

Four things that must survive any change here, because each is load-bearing and
two of them are exercises:

- **The transcript stays in the document as real markup.** Exercise 1.2 asks
  the learner to find a phrase "in the dialogue" and 1.3 sends them back to
  look at a verb; neither is answerable one panel at a time. It is also what
  `Ctrl+F`, a screen reader and a printout use.
- **Glosses work inside the balloons**, wired per scope so the same marked word
  can exist in both views without sharing a DOM id. A gloss opens *after* the
  balloon rather than inside it — inside a shout balloon the spikes would clip
  it away.
- **The balloon carries no name.** Who is speaking is shown by the picture: the
  tail is measured in JS to point at the speaker, and the speaker is the figure
  at full strength while the rest are held back. The name is still in the
  panel's accessible name, because a screen-reader user has no tail to follow.
  Do not put it back on the balloon.
- **The panel is not driven by scroll, and nothing intercepts a wheel or touch
  event.** The stage used to be sticky inside a tall track and stepped as the
  page scrolled past it. That worked and was still wrong: it put two things the
  reader moves through — the page and the story — on one gesture, so scrolling
  to the exercise ran the story on and scrolling back landed it somewhere else.
  The comic now has its own controls, the arrow keys and a swipe, and the scroll
  position means nothing to it. There is a test asserting the app registers no
  `scroll`, `wheel` or `touchmove` listener, and one asserting no sticky track
  is left in the stylesheet.

### Lexis is met, not tabled

`:::vocab` runs the three-stage intake in A Closer Look 1 — meet the words a
few at a time, answer on the set just met through the existing engine, then see
the whole set with the offer to run it again. The table above it stays, as
reference. This is **B8** (topic lexis pre-taught as a first-class step) doing
the job a table never did, and it reuses `runEngine` on purpose: the engine
already asks items as collocations (**F7**), already speaks them (**F3**) and
already schedules what it touches.

Bounded by **E5**: nothing is marked learned in the session that taught it, so
the intake never says "mastered" and the delayed check stays the review queue's
job.

### The story the twelve units carry

All twelve chapters tell one continuous adventure, **The Sea Gives Back**, set
in **Quy Nhơn** on the central coast. A boy called Tí keeps a fish in a bucket
and it will not stay a fish; the sea has come looking for her, and everywhere it
reaches it puts back what it took. Twelve chalk marks climb the harbour wall,
one per chapter, and at twelve the water is over the street.

Three documents own it, and they bind in this order:

| | |
| --- | --- |
| `research/story/story-bible.md` | world, cast, the one changed rule, the arc, the ending — and §9, what the story deliberately does **not** take from either of the works it learns from |
| `research/story/chapter-briefs.md` | **the frozen interface.** Twelve briefs, and every hard rule a drafter may not trade away. Where it and the bible differ, the briefs win |
| `research/story/chain-and-payoff.md` | the audit a finished chapter has to survive: the *because* test, the payoff ledger, what happens to each return |

The house art style is Studio Ghibli's *Ponyo*, and the story shares its shape —
a sea-child ashore, water that rises without malice, a town that floods and is
beautiful rather than tragic. **The style is borrowed; the plot is not**, and
`story-bible.md` §9 lists the specific elements that may never appear. Tí's and
Thảo's designs carry no setting on them and did not change when the story moved
from a delta to a coast.

### The story prose stays inside grade 8

`tools/check_level.py` scans the four story slots for structures the prescribed
book never teaches. Two severities: **BEYOND** (a second conditional, a perfect
modal, a modal passive — in no unit, at any point in the year) and **FORWARD**
(taught, but in a later unit — defensible input, reported and never failed).

`--strict-through N` fails on any BEYOND finding in units 1..N. **That number
is the progress marker.** It is at 3 because units 1–3 are clean and 4–12 are
not yet processed; raise it as you process them, and never raise it to silence
a finding. Eight BEYOND findings remain in units 4–12.

What it cannot see, stated plainly: the detectors are regexes, so they find
structures with a distinctive surface shape and miss the rest. A bare
hypothetical `would` with no `if`-clause is invisible to it. A clean report is
evidence, not proof.

## Never ship less than the official book

`curriculum/sgk/` is a complete record of the prescribed student's book — all
twelve units section by section, its 282-word glossary, its four cumulative
Reviews, and a machine-readable `targets.json`. The standing rule is that this
site is **at least as complete as that book on every target, and never less**.

Before adding or revising a lesson, read `curriculum/sgk/unit-NN.md` and run:

```sh
python3 tools/check_coverage.py --unit NN
```

**Do not read `curriculum/sgk/` wholesale to answer one question** — it is
~4,400 lines. Grep `curriculum/sgk/index.jsonl` (one row per section and per
named target, carrying the `file`, `sec` and `line` to open) and read only what
it names; `curriculum/sgk/ROUTER.md` maps common questions to locations. The
index is generated by `tools/index_sgk.py` and never hand-edited — regenerate it
in the same change that edits the record, and `--check` reports drift.

It checks the unit's lexis, its Everyday English function, its Communication
content block, and each named grammar and pronunciation target. It **reports and
exits 0** — coverage is a curriculum decision, and the point is to make the
decision visible rather than fail a build over it. Do not close a gap by editing
`targets.json`; that file records what the book does, not what we wish it did.

Two things the book has that our shape has historically dropped, so check them
first: the **Everyday English function** (the book names a different speech act
in each unit) and the **Communication content block** (the book's Communication
section has two halves — Everyday English *and* a named content block with its
own exercises; ours has had only the first).

`curriculum/sgk/` is reference material. `tools/build.py` never reads it and
nothing in it is published — see its `README.md` for what "recorded" means and
why passages are described rather than reproduced.

## Ten directives, and what each one is for

`:::bridge` makes an IELTS *claim*. The other nine make the app *behave* like
IELTS, which is a different job — see `README.md` for the full syntax.

| | What it does | The rule it stops you breaking |
| --- | --- | --- |
| `:::task` | An exercise becomes a committed, marked attempt — retakeable, as a new attempt | C1–C5: official key grammar, per-task word limit, spelling costs the mark |
| `:::audio` | A script becomes a recording that plays once, after a replayable learning pass | C6, C8: declared delivery mode, unwritten orientation, no replay |
| `:::write` | A writing task is attempted on the page, and counted | C9 live word count; E8 + §4.4, a self-report needs an objective anchor |
| `:::clock` | The reading runs one clock, and it does not stop while you type | C7, from `04` §1.1 |
| `:::passage` | The reading text can be highlighted and annotated, and its paragraphs carry the labels its questions name | C9's reading half, from `01` §9.1, §12.7 |
| `:::thread` | A strand that says it recurs is made to recur | the course's promises about itself |
| `:::dialogue` | The Getting Started text glosses its own words, in Vietnamese, in Lesson 1 only, and plays as a comic | support where the word is, and withdrawn afterwards |
| `:::fluency` | Repeated performance on known material against a shrinking clock | Nation's fourth strand, which printed instructions never delivered |
| `:::vocab` | New words are met a few at a time, then answered on | B8: lexis pre-taught as a first-class step, not tabled |

Four things follow for anyone adding lessons. **Prefer a `:::task` to a printed
gap** — a reveal button is not an attempt, and the whole Group C half of the
constitution is unenforceable against prose. **Never print a listening
script**: put it in `:::audio` or the exercise above it is a reading task
wearing a listening label. **A `:::write` checklist line that a machine
could decide should carry its check** — a tick-box beside a text box is the
unanchored self-assessment the directive replaced. Lines that genuinely need
judgement keep their box and say so; over-claiming a check is worse than not
having one. And **a question that says "which paragraph" needs a lettered
passage**: put the text in `:::passage label="A"`, because a question type
whose whole mechanic is the paragraph label is unanswerable over a blockquote
that prints none — which is exactly what units 03 and 06 shipped.

What a `:::write` panel may report is bounded by **D9** and §5.3: counts of
named features in the learner's own text. **Never a total, a percentage, a
score or a band** (**A2**, **D3**) — the lines are reported separately and
nothing adds them up.

## The IELTS claims are enforced, not just documented

`tools/check_ielts.py` turns the auditable part of `09` §1 into a build gate.
Run it after any change to `units/*.md`. It fails on a band promise, a
half-band, a template or phrase bank, a genre over-claim, a Vietnamese-L1
pronunciation claim outside the three permitted targets, a unit whose writing
task names no criterion, an illegal evidential marker, or a citation whose
section does not exist in the file it names.

A lesson may make an IELTS claim in exactly one construct — a `:::bridge`
directive, whose `marker` and `src` are required attributes and whose warrant
the build writes to `research/evidence-register.md`. `README.md` §"The IELTS
bridge" has the syntax. Do not make IELTS claims in ordinary prose; the gate
cannot see them there.

## The interface is the learner's. The reasoning is ours.

Nothing on a page explains why the page is built the way it is. No criterion
names, no evidential markers, no CEFR levels, no citations, no "this trains X",
no accounts of what a study found or how strong its evidence was — not in the
generator's copy, and not in the prose of a unit. A grade-8 learner opening a
lesson wants to know what to do and how to do it.

That is a rule about the *audience*, not about rigour: the bridge attributes
are still required, `check_ielts.py` still refuses an illegal marker or an
unresolvable citation, and every claim, marker and warrant is written to
`research/evidence-register.md` on each build — generated from the directives,
so it cannot drift and cannot be forgotten. Justify a decision there, in the
knowledge base, or in a code comment. Never on the page.

A `:::bridge` body is therefore an *instruction*, plus at most a plain-English
reason a thirteen-year-old would accept. "One difference stated clearly beats
three the reader has to rank" is a reason. "The criterion asks for highlighting
rather than mechanical description" is a citation wearing a reason's clothes.

## The IELTS knowledge base — read this before making any IELTS claim

`research/ielts/` holds a source-verified knowledge base (~93,000 words, nine
documents) describing what the IELTS test is, what its band descriptors say,
what is trainable toward them, how this course's twelve units map onto that,
and **what this repo may therefore build**. This project's standing goal is
that every lesson does double duty: teach the grade-8 curriculum *and* build
precursors toward IELTS. That knowledge base is the warrant for any such claim.

### How to search it — do not read the documents wholesale

They total 8,400 lines. Reading them to answer one question wastes a context
window. Instead:

1. **Grep the index.** `research/ielts/index.jsonl` is one JSON object per
   claim, with `tags` (controlled vocabulary), `terms` (natural-language
   synonyms), the exact `file` and `sec` to open, the evidential `marker`, and
   the `source` URL.
   ```sh
   grep -i 'overview' research/ielts/index.jsonl          # by natural term
   grep '"prohibition"' research/ielts/index.jsonl        # everything forbidden
   grep '"vietnamese-l1"' research/ielts/index.jsonl      # by controlled tag
   ```
2. **Jump to the `file` and `sec` the hit names.** Read that section only.
3. `research/ielts/ROUTER.md` maps common questions to locations if grep misses.
4. `research/ielts/README.md` is the full human index — read it when you need
   the whole picture, not to answer one question.

Every claim carries an **evidential marker**. `[V]`/`[C]` are adversarially
verified; `[Q]`/`[D]` are verbatim Tier-1; `[S]` is sourced but unverified;
`[S/NS]` is quoted but panel-unsustained; `[T2]` is research evidence and never
a rule of the test; `[INF]` is the citing document's own reasoning; `[SPEC]` is
untested; `[X]` was tested and not sustained. **Never upgrade a marker when
re-citing.** `README.md` §2 has the full table.

### Hard prohibitions

These hold repo-wide and need no lookup. Each traces to a documented gap.

- **No IELTS band number may ever be output** — not a score, not a prediction,
  not a progress dial. No published raw-score→band table, no half-band
  descriptors, no official criterion-to-band arithmetic exists. **Label by CEFR
  instead** — and note the official alignment bottoms out at band 4.0 = B1, with
  no band at all for A2 or A1, which is where grade-8 learners sit.
- **No Speaking rubric or Speaking feedback tool.** Only two Speaking claims
  survived verification.
- **No Vietnamese pronunciation tooling** beyond the three sourced findings in
  `07` §5.5; vowels, region and intelligibility ranking are open gaps. Those
  findings say what is **hard**, not what pays: no evidence relates coda omission
  to any score or to intelligibility, and none shows coda teaching transfers to
  spontaneous speech (`07` §5.5.7a–c). Never claim a payoff for it.
- **The vocabulary trainer's ranking function is permitted, to one spec**
  (`07` §8.1a): a coverage gate, then rank by collocational association strength
  (`max MI`). Never rank by raw frequency band, CEFR level, list membership or
  diversity, and ship **no accuracy-scoring module**.
- **Do not average Speaking's four criteria** — the equal-weighting claim errored
  in verification. Report them separately.
- **Writing descriptor claims must cite the [2023] version.** Two official
  versions circulate with different wording; bullet-style cells are a [2013]
  tell.
- **"Write more complex sentences" is not a valid progress metric.** Syntactic
  complexity peaks at band 7 and falls at band 8.
- Rising error rate alongside rising range is the **expected** signature of
  progress at A2→B1. A tool reporting "your accuracy got worse" will be wrong.

`research/ielts/09-design-principles.md` §1 is a 66-item checklist any new
lesson, tool or test can be audited against; §7.1 lists what is blocked and what
would unblock it.

### Maintaining the knowledge base

- Never delete a `> **GAP**` blockquote that is still real — removing an honest
  limitation is worse than the limitation.
- Never assert the negation of a claim that failed verification. Unproven is not
  disproven.
- Tier 3 (prep blogs, teacher lore) is never a warrant — only ever the *object*
  of a claim.
- If you add or move a claim, update `index.jsonl` in the same change.
