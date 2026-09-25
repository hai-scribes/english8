# English 8 — working notes for agents

Self-study material for Tiếng Anh 8 (Global Success), built as a static site.
`README.md` has the layout and provenance. Source of truth is `units/*.md`;
`docs/` is generated — never hand-edit it.

```sh
bash tools/gates.sh               # the build, then every gate, in the only order they mean anything in
bash tools/gates.sh --deploy      # the same, plus docs/ must already match a fresh build
python3 tools/build.py            # regenerate docs/
python3 tools/build.py --check    # parse and report counts, write nothing
python3 tools/check_dict.py       # gate: every vocabulary slot resolves
python3 tools/check_ielts.py      # gate: every IELTS claim is legal and cited
node tools/test_marking.js        # gate: the marking engine obeys the published rules
node tools/check_write.js         # gate: each model satisfies its own checklist (after build)
node tools/test_reading.js        # gate: the reading screen behaves (after build; needs jsdom)
python3 tools/check_coverage.py   # report: what the official textbook covers that we don't
python3 tools/index_sgk.py --check  # gate: the recorded book's lookup index is current
python3 tools/check_level.py --strict-through 12  # gate: story prose stays inside grade 8
python3 tools/check_cast.py       # gate: manifest and art brief agree · report: what is drawn
python3 tools/make_sheet.py --all   # compose the drawn expressions into character sheets
python3 tools/make_overlay.py --all # cut the prop and effect drawings out of their white
python3 tools/make_overlay.py --plates # shrink the background plates to what the page uses
```

Run them through `tools/gates.sh` rather than one at a time. Two of the nine
read the *built* pages, so running them before `build.py` marks the previous
build's output — the runner exists to make that ordering unforgettable, and it
prints the coverage and art reports underneath without failing on either.

`test_reading.js` needs `npm install jsdom` and skips loudly without it, so the
other eight still run on a clean checkout. `--deploy` refuses that skip, because
a gate that excused itself has not been run.

## Publishing, and the account this repo pushes as

**The push is the deploy.** GitHub Pages serves `docs/` from `main` directly —
there is no CI between a commit and the live site at
<https://hai-scribes.github.io/english8/>. So `docs/` must be rebuilt and every
gate green *before* you push, because nothing downstream will catch you.

That was a rule with nothing holding it up, so `tools/hooks/pre-push` now holds
it: a push that moves `main` runs `tools/gates.sh --deploy` and is refused if
anything is red. It gates `main` only — a branch or a tag publishes nothing.
On top of the nine gates, `--deploy` adds the check the prose could only ask
for: **the committed `docs/` must equal what today's sources build.** That is
one check standing in for two rules — *never hand-edit `docs/`* and *rebuild
before you push* — and it works because the build is deterministic, so a
rebuild that changes a tracked file means the published output was stale or
touched by hand. `research/evidence-register.md` is written by the build too,
and is checked with it.

**`.git/hooks` and `.git/config` are not committed**, so a fresh clone must
install the pre-push hook and pin pushes to `hai-scribes` again — the
`clone-setup` skill has the commands. The escape hatches are
`git push --no-verify` and `GATES_SKIP=1`, and both announce themselves — if you
take one, you are publishing unchecked.

This repo belongs to **`hai-scribes`**, and pushes must authenticate as that
account. `gh`'s credential helper hands git the **active** account's token, so a
push from the wrong active account dies with a 403 naming the wrong user — the
`clone-setup` skill's pin fixes it without `gh auth switch`.

## Editing a unit: the order of work

Everything below has its reasoning somewhere in this file. This is the order,
so that nothing load-bearing is discovered after the fact. The steps a machine
can check are marked; **the rest are checked by reading, and no gate will
catch you.**

1. **Read the book's own section first** — `curriculum/sgk/unit-NN.md`, found
   through `index.jsonl`, never by reading the record wholesale — then run
   `python3 tools/check_coverage.py --unit NN`. We never ship less than the
   official book, and the two things our shape has historically dropped are the
   Everyday English function and the Communication content block.
2. **Convert every exercise a key can settle into a `:::task`**, and leave the
   genuinely open ones as prose. Expect roughly a dozen per unit, and **say in
   the commit which went which way.** A reveal-and-self-mark exercise is the
   arrangement every directive here exists to replace.
3. **Put the genre in a `variant`, never into `ask=` prose.** A task's own
   `ask=` is extra detail appended to the variant's, never a replacement — and
   odd-one-out without its variant renders as a free-text box, where spelling
   costs the mark on a question about meaning.
4. **Read every new key back against the text above it.** A marked task must
   not print its own answer. *Deliberately not gated* — a rule matching keys
   against nearby prose fires almost entirely on legitimate exercises, and a
   gate that cries wolf gets ignored. This is the one you have to do by eye.
5. **Check what the lesson actually enrols** in the review queue: candidates
   rank produced before picked, so confirm the queue took the productive item
   and not a classification drill that happened to be printed above it.
6. **Keep the reasoning off the page.** No criterion names, no markers, no CEFR
   levels, no citations, no accounts of evidence — and any IELTS claim lives in
   a `:::bridge` with its `marker` and `src`, or it does not exist, because the
   gate cannot see a claim made in ordinary prose.
7. **Run `bash tools/gates.sh`** and read the reports under it, not just the
   verdict — a coverage drop is printed there and will never fail a build.
8. **Commit the regenerated `docs/` in the same commit as the source.** The
   pre-push hook enforces this; committing them apart leaves `main` in a state
   where the live site does not match the unit that produced it.

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

**All eighteen odd-one-out exercises in `units/` now carry the variant, and so
do the five in the four Reviews** — which is where the last of them were, and
why "ten units" was the wrong place to look. The Reviews had the genre written
into `ask=` and their candidates laid out as `(a) … (b) … (c) …`, so they were
not the text boxes the units had been; they marked a *letter*. That is why no
gate found them and why reading for the defect by its symptom missed them: the
rule is that the genre lives in a `variant`, not that a widget is wrong.

The conversion is worth knowing because it will come up again. `a · b · c =
key` replaces the lettered options, the key becomes the candidate itself rather
than its letter, and the build then checks **the key is one of the candidates**
— which is a real check on every line, and the reason a conversion that builds
is a conversion that is right.

### Answers are picked, tapped or built — never typed

Decided by the operator on 2026-09-25, after the learner kept being marked
wrong for right answers: a typed key is a list of accepted strings and is never
complete (*cannot* for *can't*, a missing comma, *Thao* for *Thảo*). Every item
is now `{a | b | c}` choices, shared `opts=`, word tiles (`sentence-build`) or
tap-the-mistake-then-fix (`error-correction`) — README §`:::task` has the
syntax. **This reverses C4/C5 as written**: no spelling mark, no written
completion. Do not put a text box back.

Distractors are where this can go wrong the other way: an option that is also
right in that sentence marks a right answer wrong. **Read every option against
its sentence.** `PICK_ONLY` in `check_ielts.py` lists the files already
converted and only ever grows — the same progress-marker pattern as
`--strict-through`.

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

**`.claude/skills/story-staging/` owns this** — the markup, the caps, the art
pipeline and the reasons. Load it before writing or revising a `:::dialogue`, or
touching `data/cast.json` or `art/`. What must hold even without it:

- **The transcript stays in the document as real markup** — exercises send the
  learner back to it, and `Ctrl+F`, screen readers and printouts use it.
- **The balloon carries no name.** The picture and the tail show the speaker. Do
  not put it back.
- **Nothing intercepts `scroll`, `wheel` or `touchmove`**; the comic has its own
  controls, and a test asserts it.
- **Do not put art in `docs/`** — the build deletes `docs/assets/`. Art lives in `art/`.
- Reordering `col` in `data/cast.json` without regenerating the art gives every
  character the wrong face.
- All twelve units are staged; a dialogue with no `bg=` is an error state.

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

One continuous adventure, **The Sea Gives Back**, set in Quy Nhơn. The story
documents, their binding order and the house style live in the story-staging
skill. **The style is borrowed from *Ponyo*; the plot is not** —
`research/story/story-bible.md` §9 lists elements that may never appear.

### The story prose stays inside grade 8

`tools/check_level.py` scans the four story slots for structures the prescribed
book never teaches. Two severities: **BEYOND** (a second conditional, a perfect
modal, a modal passive — in no unit, at any point in the year) and **FORWARD**
(taught, but in a later unit — defensible input, reported and never failed).

`--strict-through N` fails on any BEYOND finding in units 1..N. **That number
is the progress marker, and it is now at 12** — every unit is clean, so the
gate is at its strictest and any new BEYOND structure anywhere in the book
fails the build. It moved 3 → 12 by clearing the findings, never by widening
the exemption, and that is the only way it may ever move.

The eight that were cleared, in case the shapes recur: three present perfect
continuous in unit 8's recording and one in unit 10's, one past perfect
continuous in unit 9's passage, and in unit 12's recording a third conditional
carrying two perfect modals. Every one had a taught equivalent that said the
same thing — *have done* for *have been doing*, and unit 6's first conditional
for the counterfactual, which read truer anyway: the keeper is stating a
standing rule, not a regret.

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
| `:::task` | An exercise becomes a committed, marked attempt — retakeable, as a new attempt — answered by picking, tapping or building, never typing | C1–C3; C4/C5's spelling and word-limit half was reversed on 2026-09-25 (see above) |
| `:::audio` | A script becomes a recording that plays once, after a replayable learning pass | C6, C8: declared delivery mode, unwritten orientation, no replay |
| `:::write` | A writing task is attempted on the page, and counted | C9 live word count; E8 + §4.4, a self-report needs an objective anchor |
| `:::clock` | The reading runs one clock, and it does not stop while you type | C7, from `04` §1.1 |
| `:::passage` | The reading text can be highlighted and annotated, and its paragraphs carry the labels its questions name | C9's reading half, from `01` §9.1, §12.7 |
| `:::thread` | A strand that says it recurs is made to recur | the course's promises about itself |
| `:::dialogue` | The Getting Started text glosses its own words, in Vietnamese, in Lesson 1 only, and plays as a comic | support where the word is, and withdrawn afterwards |
| `:::fluency` | Repeated performance on known material against a shrinking clock | fluency practice as an activity in its own right, on material already known — which a printed instruction to "read it again, faster" never actually delivered |
| `:::vocab` | New words are met a few at a time, then answered on | B8: lexis pre-taught as a first-class step, not tabled |

The right-hand column is **design rationale, not citation**. Where a cell reads
like a code — **B8**, **D9**, **C1–C5** — it indexes the checklist in `09` §1
and resolves. Where it does not, it is our own reasoning and should be written
as such: `:::fluency`'s cell used to read "Nation's fourth strand", which named
a framework `research/ielts/` does not carry anywhere — zero hits for *four
strands*, *meaning-focused input* or *fluency development*, Nation appearing
only as the 2006 coverage paper. The framework is real; our warrant for it was
not, and an unwarranted attribution reads exactly like a sourced one. **If you
want to cite it, source it into the knowledge base with a marker and an
`index.jsonl` row first.** Nothing of this ever reached a page, and it must not:
that is the separate rule below.

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

## The pedagogy knowledge base — read this before shaping the work

`research/pedagogy/` is a second source-verified base, sibling to
`research/ielts/` and deliberately **not** merged with it. Where the IELTS base
says what may be *claimed*, this one says how the work should be *shaped*: how
much to assign, how often, what to mix, what to reward, and what a weekly tutor
session is worth. Six documents, 99 indexed claims, same marker convention, same
grep protocol — `ROUTER.md` first, never the documents wholesale.

**It is separate on purpose.** None of it is IELTS evidence, and merging would
let extrapolations from school mathematics inherit the credibility of a base
built on Tier-1 test documentation. **Nothing in it may appear in a `:::bridge`**;
`check_ielts.py` resolves citations against `research/ielts/` only.

**The three findings that change what we build**, each with its build rule in
`06-build-rules.md`:

- **Elapsed time is never shown or recorded as progress** (**P1**). At the
  individual level more minutes predicts *lower* achievement — four samples,
  three countries, including 1,832 Swiss grade-8 students learning French. A
  slow learner spending longer is the signature of difficulty. What predicts
  gains is **effort**, and effort is near-uncorrelated with time.
- **In-session accuracy is not a proxy for retention** (**P6**), and **the
  learner's felt sense of a practice arrangement is not a design input**
  (**P7**). The schedule with the worst in-session accuracy won a week later,
  and learners rated three schedules of different effectiveness as equally
  effective.
- **No points, badges or tangible rewards for completing study** (**P9**), and
  no feature warranted as engagement-improving (**P10**) — attrition tracks
  dispositional persistence, not motivation or proficiency.

**Every build rule in it is `[INF]` even where its finding is `[V 3-0]`**, because
the population is wrong in at least one dimension every time: none Vietnamese,
none a self-study site, and the 13–14 band is where this literature is thinnest,
not thickest. **State the population when you cite it.** A rule quoted without
"18–22-year-old adults on a receptive test" attached has been laundered.

**A third of the base is `> **GAP**` blockquotes, and that is its most useful
half.** Extensive *listening*, explicit-vs-implicit grammar, streaks, habit
formation, what a fluent-but-untrained tutor should do with an hour, and whether
to interleave or block for an adolescent are all *unestablished* — `04` is nearly
empty and its brevity is a finding, not a summary of consensus held elsewhere.
`06` §2 is the blocked list and names what would unblock each item.

**Ten claims are marked `[X]` — tested and not sustained** — and several are
figures that look eminently quotable: the "15% of an SD" for daily assignment,
the `0.37 SD` tutoring benchmark, the Cepeda `8–43%` spacing rule. **Grep
`'"refuted"'` before quoting any effect size you half-remember from this area.**

<!-- atelier:memory-routing -->
## Auto-memory routing (Atelier)

Durable learning goes to files, not to AI memory — memory has no size gate.
When the AI would otherwise save a **dev observation** (a non-obvious
framework / domain / process lesson learned while doing the work), redirect it:

- Project-domain lessons -> `.atelier/retro/lessons.md` (append).
- Framework / upstream observations -> `.atelier/retro/notes-for-operator.md`
  (append; intentionally not memory-indexed — the operator reads it during `/retro`).

`MEMORY.md` carries **one** pointer line for the whole `lessons.md` surface, never
one entry per lesson. Memory still takes the user / feedback / reference types,
plus load-bearing project pointers (design-anchor commit hashes and the like).

**Session progress never goes to memory.** "Save progress" / "save for a new
session" — slash command or not — means the local `saved-progress/<ts>-<slug>.md`
snapshot that `/save-progress` writes, never an auto-memory entry.

*Don't want these rules?* Replace this whole block — markers included — with the
single line `<!-- atelier:memory-routing:off -->` and Atelier will stop adding it
back. Deleting it without that marker is temporary: the next `atelier init` or
`atelier upgrade --refresh-commands` restores it.
<!-- /atelier:memory-routing -->
