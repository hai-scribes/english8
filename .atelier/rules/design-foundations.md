# Design Foundations — story-english

The product: an English self-study app one Vietnamese grade-8 learner uses
alone, on a phone, unsupervised. A story read chapter by chapter is the spine;
the syllabus is carried by it, not printed above it.

These rules are injected into Atelier extract/elevate/scribe prompts. They are
the UI bar for *this* product. Most of them are not preferences — they trace to
`research/ielts/09-design-principles.md` §1 (the 66-item audit checklist) or to
a defect the discarded build actually shipped. The trace is named so a reviewer
can check it rather than take it.

**The reader is thirteen, reading in her second language, on a phone, with
nobody in the room.** Every rule below is that sentence applied somewhere.

## The page never explains itself

Nothing on a learner-facing surface says why it is built the way it is. No
criterion names, no evidential markers, no CEFR labels, no citations, no "this
trains X", no accounts of what a study found. The learner is here to learn
English, not to audit the course. The reasoning belongs in the repo.
- good: "Read the chapter. Then three questions about what happened."
- bad: "This chapter builds your Coherence & Cohesion (B1 level)."
- bad: a tooltip explaining the review schedule's spacing interval

## No band number, anywhere, ever

No IELTS band as a score, a prediction, a promise, a progress dial, or a goal.
Not in copy, not in a label, not in generated output. Level, if it must be
shown at all, is CEFR. (§1 **A2**, **A1** — the first item of the fast gate.)
- bad: "Estimated band 4.5", "on track for band 6", a dial reading 5.5
- bad: "200 hours to one band" — no hours-to-band promise of any kind (**E7**)

## The story is the spine, not the wrapper

The learner arrives for the chapter. Curriculum is met *inside* the narrative —
in what a character says, needs, or gets wrong — never as a lesson with a story
printed above it. A framing device that narrates the course ("follow our story
and you'll learn the past perfect") is the prohibited construct twice over: it
explains the page, and it demotes the story to decoration.
- good: a character has to write the notice, and the notice is the writing task
- bad: a chapter, then a horizontal rule, then "Now let's practise"

## Support appears where the reader stalls, and then withdraws

Gloss the thing a grade-8 Vietnamese reader will actually stall on — which is
usually a phrase, an idiom or a phrasal verb, not a single word. **One gloss per
item per chapter.** Handing the same word back three chapters later is the
support failing to withdraw, and withdrawal is the point.
- good: `[[can't stand]]` glossed once, in Vietnamese, at first meeting
- bad: every content word underlined; the same gloss re-offered each chapter

## An exercise a key can settle is a committed attempt

Never a reveal-and-self-mark. The learner commits, it is marked, and the mark
is honest: official key grammar (`( )` optional, `/` alternates, in-either-order
pairs), UK and US spellings both accepted, two answers in one gap score zero,
a per-task word limit printed on the task, spelling and grammar costing the mark
and said so *before* the exercise. (§1 **C1–C5**.) Learners cannot self-assess
accurately — §4.4, Phakiti 2016, up to 93% miscalibrated on hard items — so a
reveal button is not an assessment, it is a copy exercise.
- good: an answer box, a commit, a mark, and *try it again* as a new attempt
- bad: a "Show answer" button beside a blank; a tick-box self-report as the score

## A retake is a new attempt, never an edit

Answers clear, the earlier attempt survives, both runs are listed. Never an
average across attempts (**E3**), never a trend or a "better" (**E9** — one
retest is regression to the mean as much as learning), and never a retake on a
task a clock has already spent (**C6**, **C7**).

## A marked task must not print its own answer

Ask for what is not on screen. If the answer is visible in the prose above the
box — bolded, listed, or twenty lines up — the task measures transcription, not
retrieval. No gate catches this; it is checked by reading.

## Phone-first is a layout constraint, not a media query

Design at 360 px and let it grow. One thumb, one hand, held vertically. Nothing
essential below the fold at first paint; nothing that needs a hover; nothing
that needs two hands. Tap targets ≥ 44 px. Text sized to be read on a bus.
- bad: a desktop layout with a breakpoint bolted on
- bad: a control whose only affordance is hover

## One gesture moves one thing

The reader is already moving through a page; do not put the story on the same
gesture. The story advances by its own controls — a tap, an arrow key, a swipe —
and the scroll position means nothing to it. Never intercept `scroll`, `wheel`
or `touchmove` to drive narrative. (This is a defect the discarded build shipped
and had to unship: scrolling to the exercise ran the story on.)

## The picture carries who is speaking

In any staged scene, the speaker is shown — the balloon sits over them and is
held to the frame, the other figures are held back. The balloon carries no name
label. The name still belongs in the accessible name, because a screen-reader
user has no tail to follow.

## Reduced motion gets the finished state, not a broken one

Typewriter text, entrances, transitions: `prefers-reduced-motion` gets the
complete panel immediately, with nothing lost. A screen reader gets the whole
beat at once from a live region — announcing a line one letter at a time is not
an accessible typewriter, it is noise.

## Vietnamese is the support language; English is the material

Glosses, and only glosses, are in Vietnamese. Instructions, story and exercises
are in English at the learner's level. Diacritics render correctly everywhere,
including in names — Tí, Thảo, Quy Nhơn — in every font used.

## Accountability is visible and is not a report card

The learner can see what she has read and what is waiting. Show what happened —
chapters opened, what came back for review — never a score, a percentage, a
total, a band or a composite. (**D3**, **E1**, **A2**.) A streak that punishes a
missed day is a design decision with known failure behaviour, not a default.
- good: twelve chalk marks on a wall, filling in
- bad: "78% complete", "Level 4 reader", a broken-streak shame screen

## Never less than the official book

Whatever the shape, every target in `curriculum/sgk/targets.json` is delivered —
including the two this project has historically dropped, the Everyday English
function and the Communication content block. A prettier surface that covers
less is a regression, not a redesign.

## Empty and first-run states are in-world

The learner has never seen this app before and nobody is going to explain it.
The first screen starts the story. No onboarding carousel, no feature tour, no
account, no settings gate.
- good: chapter one, open, readable, on first paint
- bad: "Welcome! Let's set up your learning goals" — three screens before a word
