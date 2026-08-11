# Vocabulary trainer — design and evidence

Why the Unit 1 vocabulary trainer (`app/unit-01-vocab.html`) works the way it
does. Read this before changing the learning flow or porting the trainer to
another unit.

## The design that was asked for

> Show each new word one at a time — examples, pronunciation, explanation. The
> learner presses Next until there are no new words left (progress bar). Then a
> test: score them, show what they still get wrong, let them take it again.
> Prepare so many tests that the learner almost never sees the same one twice.

Three of those instincts are right: explicit first exposure, a low-stakes test
with feedback, and another attempt after errors. The sequencing is not.

## What the research says

Sources were gathered in a web search pass (2026-08-08) and are cited inline.

| Claim | Evidence |
| --- | --- |
| Retrieval beats restudy for anything you want to still know in a week | Roediger & Karpicke, *Psych. Science* 2006 ([doi](https://doi.org/10.1111/j.1467-9280.2006.01693.x)); Karpicke & Roediger, *Science* 2008 ([doi](https://doi.org/10.1126/science.1152408)) |
| Spacing beats massing, robustly | Cepeda et al., *Psych. Bulletin* 2006, 317 experiments ([doi](https://doi.org/10.1037/0033-2909.132.3.354)) |
| Recall practice beats recognition practice | Rowland, 2014 meta-analysis ([pubmed](https://pubmed.ncbi.nlm.nih.gov/25150680/)) |
| Getting it wrong then seeing the answer beats never being asked | Kornell, Hays & Bjork 2009 ([pubmed](https://pubmed.ncbi.nlm.nih.gov/19586265/)); Potts & Shanks 2014 ([UCL](https://discovery.ucl.ac.uk/id/eprint/1399515/)) |
| Repeating the *same* word-meaning mapping is what builds memory; varied contexts add transfer on top | Nakata, *SSLA* 2017; Johns et al., *JML* 2020 ([doi](https://doi.org/10.1016/j.jml.2020.104156)); Pan & Rickard 2018, transfer *d* = 0.40 ([pubmed](https://pubmed.ncbi.nlm.nih.gov/29733621/)) |
| Productive practice builds productive knowledge; receptive practice builds receptive knowledge. They are not interchangeable | Nakata 2016 ([doi](https://doi.org/10.1515/iral-2015-0022)); Yanagisawa 2016 ([doi](https://doi.org/10.20806/katejournal.30.0_139)) |
| Bigger learning sets are simply harder, with no delayed payoff | Huelser et al., 2025 ([PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12108878/)) |
| Teaching close semantic neighbours together *impedes* learning | Tinkham 1994; Waring, *System* 1997 ([ERIC](https://eric.ed.gov/?id=EJ547530)) |
| For a beginner, an L1 gloss is the efficient meaning bridge — not an L2 definition | Nation 1982 ([doi](https://doi.org/10.1177/003368828201300102)); Lei & Reynolds 2022 ([PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9485613/)) |
| "Learned" means retrieval to criterion repeated across separated sessions | Rawson & Dunlosky 2011 ([ERIC](https://eric.ed.gov/?id=EJ934616)) |

Caveat carried over from the review: most of this evidence comes from adults,
lab materials, or university EFL learners. The mechanisms are robust; the exact
numbers below (six words, four rungs, 1/3/7/14/30 days) are defensible defaults
to tune with real usage, not constants.

## What was built instead

### The word list is the home page

Opening the trainer shows the 18 words of Lesson 2 — spelling, IPA, part of
speech, Vietnamese, a 🔊 button, and where the learner stands with each one
(*not started* / *learning* / *due today* / *known well*). They are grouped
into the three rounds they are actually taught in, so the grouping is visible
rather than hidden in the engine.

The button that starts the learning mode sits **inside that section**, directly
above the list, and names the six words it is about to teach. Review and the
practice test sit below the list as secondary actions. The learner should never
have to guess which words a button applies to.

### Six words per round, not eighteen

Round membership is authored, not alphabetical, so that confusable neighbours
are split across rounds — `leisure`/`pastime`, `hang out`/`socialise`,
`bookshop`/`swimming pool` never appear in the same round. Multiple-choice
distractors are drawn from a different meaning group for the same reason.

### Retrieval starts after one exposure, not after eighteen

Each word gets one card — spelling, part of speech, IPA, audio, Vietnamese
gloss, English definition, two examples, collocations, a usage tip. Then the
first question for that word arrives **two to three items later**, while five
other words are being introduced around it. Nothing is asked back-to-back.

### Four rungs, hardest last

| Rung | Format | Builds |
| --- | --- | --- |
| 1 | English word → choose the Vietnamese meaning | receptive, scaffolded |
| 2 | English word → recall the meaning, reveal, self-mark | receptive recall |
| 3 | Vietnamese + part of speech → type the English word | productive form |
| 4 | Sentence with a gap → type the English word | productive in context |

A word leaves the round only after clearing all four. A wrong answer shows the
correct pairing immediately and requeues the word three items later — it does
not end the round and it does not erase earlier progress. Listening prompts
(audio → type the word) are held back for review sessions, once the written
form is stable.

### The test is a checkpoint, not the finish line

The practice test covers every word met so far, roughly half receptive and half
productive, and only uses auto-gradable formats so the score means something.
It is generated fresh on every run — format, order, sentence context and wrong
options all re-roll — so retakes are not the same paper. Results feed the
schedule: missed words drop back to tomorrow.

### Words come back on a schedule

Leitner-style day ladder, scheduled from the day the review actually happened:

| Outcome | Next due |
| --- | --- |
| Round finished | tomorrow |
| Correct on a later day | +3, then +7, +14, +30, then doubling to a 90-day cap |
| Wrong, or answer revealed | tomorrow, and back to the bottom of the ladder |

**Known well** requires correct retrieval on three *separate later days*
including at least one productive answer. A lapse revokes it. Home-screen
counters report due / learned today / known well rather than one flattering
percentage.

## What was deliberately cut

1. **The eighteen-card reading tour.** Reading a card is an event, not
   learning; progress now tracks retrieval, not exposures.
2. **A single end-of-session test as the boundary between learning and
   assessment.** Every question with feedback is itself learning.
3. **Full-test retakes after a few errors.** Repair is capped at the missed
   words, twice, then the scheduler takes over.
4. **The near-infinite question bank.** This was the biggest requested feature
   and the evidence is against it: the app must ask about the *same* word many
   times. Variety comes from rotating format × sentence context × distractor
   set around a stable core, which already makes repeat papers vanishingly
   rare, without giving up the repetition that does the work. Authoring effort
   went into accurate glosses, unambiguous cloze sentences and accepted-answer
   lists instead.

## Where it lives

The mode ships in two places. **The course homepage is the one to use.**

| File | Role |
| --- | --- |
| `app/course-home.artifact.html` | **The real home.** The whole grade-8 course page — curriculum map, Unit 1 study app, roadmap. The guided mode is a view inside it, entered from the button under the word list in **Unit 1 → Word & Rule**. |
| `app/unit-01-vocab.html` | Standalone trainer. Double-click to run offline with no network at all. Source of truth for the standalone build. |
| `app/unit-01-vocab.artifact.html` | Generated wrapper-stripped copy of the standalone file, for hosting. Regenerate after any change to its source. |

- Course homepage: <https://claude.ai/code/artifact/993fe8a4-4bfd-438d-a006-2aa17ae0f120>
- Standalone trainer: <https://claude.ai/code/artifact/08914336-f9c1-40db-abd7-72ed7d42cebe>

Both are private until shared from the page's share menu. The course homepage
deliberately keeps every unit on one page, because a share grants access to
that page only — one link then covers the whole course as it grows.

### How the mode fits into the course homepage

It does **not** bring its own scheduler. Everything it grades writes through
the page's existing Leitner record (`S.items`, boxes 0–5 over 0/1/3/7/14/30
days) using the same item ids the Practice tab uses — receptive answers land on
that word's `vr` item, productive answers on its `vc` item. A word learned in
the guided mode is therefore due, counted and revised alongside the grammar and
pronunciation items, and shows up in Today and Progress without any extra
plumbing. It reuses the page's answer matching too, including the learner's
"my answer was right too" overrides, so a synonym accepted once is never
rejected again.

The split of labour: the **Practice** tab tests items you already know;
the **guided mode** is what comes before that, for words never met.

Progress is per-browser, so the course homepage and the standalone file keep
separate records. Pick one and stay on it.

## Implementation notes

- Single file, no dependencies, no network. Double-click to run from `file://`.
- Colour lives entirely in CSS custom properties, defined three times: the bare
  `:root` light palette, a `prefers-color-scheme: dark` block guarded with
  `:root:not([data-theme="light"])`, and a `:root[data-theme="dark"]` block. All
  six combinations of stamp × OS preference were verified by reading the
  resolved tokens back out of `getComputedStyle`. No component hard-codes a
  colour, which is what keeps that guarantee true.
- Progress lives in `localStorage` under `en8:vocab:unit01:v1`, keyed by a
  stable word id, written after **every** graded answer. Export / Import /
  Reset are in the footer; a blocked or full store warns once and keeps going.
- Dates are stored as local `YYYY-MM-DD` day strings and advanced through a
  noon-anchored `Date`, so DST shifts and time zones cannot move a due date.
- Typed answers are Unicode-normalised, lowercased, trimmed and stripped of
  trailing punctuation, then matched against an authored accept-list. No fuzzy
  edit distance — `cook`/`book` are different words and a typo must not pass.
- Pronunciation uses the browser's speech synthesis, which is a **fallback, not
  a model voice**: it needs an installed English voice and its stress is not
  always right. When no English voice exists the app says so and switches
  listening questions off rather than failing silently. Recorded audio would be
  a straight upgrade.
- No pictures. The evidence supports them only for concrete, unambiguous
  meanings, and vague stock imagery for words like *leisure* misleads.

## Porting to Units 2–12

The engine is content-agnostic. To add a unit, copy the file and replace the
`WORDS` array; each entry needs `id`, `round` (1–3, six words each, confusable
neighbours split), `word`, `ipa`, `pos`, `syn` (meaning group — used to keep
distractors honest), `vi`, `en`, `note`, two `examples`, `colloc`, an `accept`
list, and two `cloze` sentences with a single `___` gap each. Bump `STORE_KEY`
so units keep separate progress.

The cloze sentences are the part that needs care: each gap must have exactly
one right answer within that unit's word set. The trainer shows the Vietnamese
gloss under the sentence, which resolves most near-misses, but an ambiguous
item cannot be rescued by the grader.
