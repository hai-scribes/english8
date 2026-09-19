# Pedagogy Knowledge Base — Index

**Research date: 2026-09-05.** Six documents, two research passes (the second a
repair of the first — see §4). 24 sources fetched, 113 claims extracted, 41 put
to a 3-vote adversarial panel, **23 sustained, 18 refuted**.

**What this is.** A source-verified reference on *how to shape the work* — how
much to assign, how often, what to mix, what to reward, and what a weekly tutor
session is worth. It answers the question the IELTS base does not: not what to
teach or what may be claimed, but what a week of study should look like for a
13–14-year-old at A2 studying alone on weekdays.

**What it is not.** It is not a curriculum, not a lesson plan, and not a set of
answers. Most of what was asked came back empty, and **the empty parts are the
most important thing in it** — see §3.

**Why it is separate from `../ielts/`.** None of this is IELTS evidence. Merging
it would let claims that are extrapolations from school mathematics inherit the
credibility of a base built on Tier-1 test documentation, and would put
unresolvable citations in front of `tools/check_ielts.py`. The two bases share a
marker convention and nothing else.

**Looking for one fact?** Do not read these documents. Grep
[`index.jsonl`](index.jsonl) and see [`ROUTER.md`](ROUTER.md) for the recipes.

---

## §1 The six documents

| # | File | What it establishes |
| --- | --- | --- |
| **01** | [`01-homework-dose.md`](01-homework-dose.md) | **How much, how often, and what to measure.** The dose curve and where it flattens; how thin the causal base is; grade level as a moderator; and the central finding — **time is not the variable, effort is** |
| **02** | [`02-scheduling-and-sequencing.md`](02-scheduling-and-sequencing.md) | **What to mix and when to review.** Interleaving beat blocking on adults and lost on adolescents; in-session accuracy is not retention; the concrete-day-offset GAP stands unclosed |
| **03** | [`03-adherence-and-motivation.md`](03-adherence-and-motivation.md) | **Who keeps going, and what not to reward.** Attrition tracks persistence, not motivation; tangible completion rewards undermine children more than adults. Four of five sub-questions came back empty |
| **04** | [`04-lesson-architecture.md`](04-lesson-architecture.md) | **Almost nothing, and that is the finding.** "TBLT beats PPP" is not available as a rule; explicit-vs-implicit grammar, input enhancement, the output hypothesis and **extensive listening** are all unestablished |
| **05** | [`05-tutoring.md`](05-tutoring.md) | **What a non-expert tutor is worth.** 0.21 SD for non-professionals against 0.50 for teachers; parental homework involvement at r = −0.064 over 378,222 participants; and no evidence at all on what the hour should contain |
| **06** | [`06-build-rules.md`](06-build-rules.md) | **The payoff.** Fifteen rules `P1`–`P15`, a four-item fast gate, a blocked list, and the worked resolution of the one collision with `../ielts/09` |

**Shortest useful path if you are building something:** `06` §1 (the checklist)
→ `06` §2 (what is blocked) → the sibling section the rule traces to.

## §2 Markers — inherited from `../ielts/`, unchanged

Same letters, same strengths, same prohibition on upgrading. `../ielts/README.md`
§2 is canonical; this base uses a subset.

| Marker | Meaning |
| --- | --- |
| **[V]** *n-n* | Sustained by a 3-vote adversarial panel, vote shown |
| **[S]** | Sourced and quoted, but not panel-verified — or verified only through an abstract, a paywall, or a secondhand summary |
| **[S/NS]** | Quoted from the source, **but the panel did not sustain it** (2-1). Weaker than **[V]**; say so at the point of use |
| **[X]** | **Tested and not sustained.** Logged so it is not silently re-derived. **Neither the claim nor its negation is asserted** |
| **[INF]** | This base's own reasoning. No source states the link; the underlying facts are cited and the inferential step is owned |
| **[SPEC]** | Plausible and untested — no source says it works |

**One marker rule specific to this base.** Every population here is wrong in at
least one dimension: none Vietnamese, none a self-study website, two thin
exceptions aside none a foreign language, and the 13–14 band is where this
literature is *thinnest*. **So every rule in `06` that turns a finding into a
design decision is `[INF]`, even where the finding behind it is `[V 3-0]`.** The
finding's marker and the rule's marker are shown separately in `06` §1 for
exactly this reason.

`> **GAP**` blockquotes mark something the research asked for that the evidence
does not supply. They are never filled from memory and never closed by an
upgrade.

## §3 Read the limits first

This base's most useful property is the size of its empty half. Five headlines:

1. **No experimental evidence supports any minutes-per-night figure at this
   age** — the only systematic mapping found two duration-manipulating studies,
   both primary-school, and abandoned its dose-response analysis. Any number
   this repo picks is a design choice.
2. **Foreign-language homework has essentially no evidence base.** Cooper's
   canonical synthesis contained *exactly one* FL study, dropped for having no
   companions. The nearest proxy — language arts — was null.
3. **Time-on-task is contraindicated as a metric**, replicated across four
   samples in three countries including a grade-8 French-as-FL one. This is the
   strongest and most transferable result in the base.
4. **Whether to interleave or block for an adolescent at A2 is undetermined** —
   two studies, opposite directions, and this learner is the disputed case.
5. **`04` is nearly empty.** Extensive listening, explicit-vs-implicit grammar,
   input enhancement, dictogloss, the output hypothesis and receptive/productive
   ordering are all unestablished here. Do not read `04`'s brevity as consensus.

## §4 Provenance, and one method note worth keeping

Two passes. **The first pass reported three of five research angles as having
"produced no claim that survived verification". That was false, and the cause is
worth recording:** the harness ranked all extracted claims globally by importance
and source quality and verified the top 25, so one angle's claims swept every
slot and the other three were **never put to a panel at all**. *Never tested*
then read, wrongly, as *found nothing*. The second pass added a per-angle floor
and the three "empty" angles produced `03`, `04` and `05`.

**The general lesson, since it will recur: an absence reported by a fan-out
research process is only evidence of absence if you can show the search was
actually run.** The fix is in the workflow script; the reason it is recorded here
is that the same failure would be invisible in any future pass that did not check.

A second, smaller note — **the same study can be sustained and refuted without
contradiction, if the two panels were scoring different claims.** Rogers & Cheung
(2020) was confirmed 3-0 in pass one and refuted 0-3 in pass two. Pass one scored
the observation (*1-day and 8-day review produced no significant difference*);
pass two scored the generalisation drawn from it (*therefore no day offset is
preferable*). The observation stands, the generalisation does not, and `02` §3.1
records both. **Check what a verdict was actually about before treating it as a
reversal.**

### Verification hygiene in this pass

- **Several verifications ran with an exhausted web-search budget** (200/200) and
  could interrogate only the primary source rather than hunt for contradicting
  literature. "No contradicting evidence found" is correspondingly weaker than
  the vote counts suggest — this affects most of `01` §2–§6, `02` §1, `04` §1
  and `05` §1–§3.
- **Three findings are bounded by paywalls.** Bryfonski & McKay is closed access
  (no CI, no heterogeneity, no moderator directions); the Duolingo attrition
  paper's actual attrition *percentage* is unretrieved; Nakata & Suzuki's
  practice-phase percentages were not visible in an open copy.
- **Five surviving claims were found materially wrong as first stated** and were
  corrected before entry: an unstandardised coefficient labelled standardised;
  "60 teachers" that is 60 classes; an overreaching "interleaving produced the
  best retention"; a secondhand Swiss summary carrying no recoverable statistics;
  and a claimed attrition rate that does not exist in the retrievable text. The
  corrections travel with the findings in `01`–`05`.

## §5 Source policy

Tier 1 does not exist for this base — there is no governing body, so nothing is
*binding*. Everything here is **Tier 2: peer-reviewed research**, and it is
therefore always a tendency in learners and **never a rule of anything**.

**Tier 3 — prep blogs, app marketing, teacher lore — is never a warrant.** It may
be the *object* of a claim, never its support. Where folklore figures appear in
these documents (Walberg's "4–5 hours per night"; the "N days to form a habit"
figures) they are named as objects and carry no citation weight.

## §6 Maintaining this base

- **Never delete a `> **GAP**` blockquote that is still real.** More than half
  this base's value is in them.
- **Never assert the negation of a refuted claim.** Eighteen were refuted here;
  unproven is not disproven.
- **Never upgrade a marker when re-citing**, and never let an `[INF]` rule be
  quoted as though it were its `[V]` finding.
- **If you add or move a claim, update `index.jsonl` in the same change.**
- **State the population at the point of use.** A rule quoted without "18–22-year-
  old adults on a receptive test" attached is a rule that has been laundered.
