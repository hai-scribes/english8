# 01 — Assignment dose: how much, how often

**What this file establishes.** What the empirical literature says about how much
homework to set a 13–14-year-old, how often, and what to measure. The headline is
that the question as usually asked — *how many minutes?* — has no evidenced
answer at this age, and that the variable worth designing around is not time at
all.

Markers follow `README.md` §2 and are never upgraded. Every population in this
file is a school system with a teacher and a class; none is solo self-study from
a website, and none is Vietnamese. See §8.

---

## §1 There is no experimentally warranted minutes-per-night figure

The only systematic mapping of *experimental* homework-duration research found
eleven publications across K-12, of which **two** actually manipulated homework
time — and both were primary-school **[V 3-0]**:

> "Eleven publications were identified that examined the relationship between
> homework duration and academic outcomes using an experimental design… Due to
> the insufficient data on homework duration and academic achievement, we
> analyzed these data using qualitative synthesis."
> — Guo et al. (2024), *Campbell Systematic Reviews* 20(3):e1431

The two duration-manipulating studies are Koch (1965, grade 6 arithmetic) and
Dolean & Lervåg (2021, grade 2 writing). The review's own conclusion restricts
its findings to primary school and states that "additional research is required
to understand the impact of homework on secondary school students" **[V 3-0]**.
All included studies were rated low quality and GRADE was not attempted.

> **GAP** — no experimental evidence establishes an optimal daily assignment
> length at any age, and none at all for ages 12–15. **Any minutes figure this
> repo adopts is a design choice, not an evidenced dose, and must be labelled
> as one.**

Note the direction of the two experiments that *did* vary duration: both
favoured **more** time, with no diminishing-returns point observed. That pair
was put to the panel as evidence against a ceiling and **refuted 0-3** — two
primary-school studies cannot establish a dose curve — but it is logged here so
it is not later re-derived as support for a short-assignment rule. It is not.

## §2 The correlational dose curve, and where it flattens

Correlationally, the relation is positive at small doses and flat past 1–2 hours
a night for this age band **[V 3-0]**:

> "For junior high school students, achievement continued to improve with more
> homework until assignments lasted between 1 and 2 hours a night. More homework
> than that was no longer associated with higher achievement. For high school
> students, the line-of-progress continued to climb."
> — Cooper, Robinson & Patall (2006), *Review of Educational Research* 76(1), p.9

That chart is Cooper's own 1989 synthesis of nine studies, carried forward
unchanged; **the 2006 synthesis added no new junior-high dose data**, finding
only one study (Lam 1996, 12th grade) that permitted an optimum interpretation,
and could not replicate the curve **[V 3-0]**.

Independent corroboration at almost exactly the target age, from a full
population sample **[V 3-0]**:

> "The top of the curve is between 90 and 100 min per day of homework for all
> subjects combined… the gains between 70 and 90 min barely reach 3% of a SD…
> The data suggest that spending 60 min per day doing homework is a reasonable
> and effective time."
> — Fernández-Alonso, Suárez-Álvarez & Muñiz (2015), *J. Educational Psychology*
> 107(4):1075–1085, n = 7,725 Spanish pupils, mean age 13.78, 353 classes,
> 148 schools

A second Spanish sample (N = 26,543, mean age 14.4) lands on "60–70 min of
homework a day" as its recommendation **[S]** — but verification established
that this is **a judgment call, not a modelled inflection**: those models are
linear three-level HLMs with no quadratic term, and the stated rationale is
that schools assigning 120 min/day double the between-student spread in time
spent (25 min → over 50 min). Do not cite it as a measured optimum.

**Three limits travel with every number in this section, and they are load-bearing:**

1. **It is total homework across all subjects.** It therefore *caps* an
   English-only assignment and never *sets* one. Nothing in this literature
   separates per-subject from total dose.
2. **The 2015 optimum is interpolated from a four-option ordinal item.**
   "90–100 minutes" is a curve fitted over four bins, not a measured value, and
   must never be quoted as a precise optimum.
3. **All of it is correlational and cross-sectional.** The authors' own words:
   "the word effect must be understood as predictive effect."

## §3 The causal base is thin, immediate-only, and has no adolescent or FL data

Cooper's five exogenous-intervention effect sizes are the whole causal warrant
for assigning homework at all **[V 3-0]**:

> "the weighted mean d-index across the five studies from which effect sizes
> could be obtained was d = .60 and was significantly different from zero
> (95% CI = .38/.82)" — falling to **d = .48** after trim-and-fill, with the
> three randomised studies at d = .53/.54.

Read the next sentence with it, because it bounds everything above **[V 3-0]**:

> "the positive causal effect of homework on achievement has been tested and
> found only on measures of an immediate outcome, the unit test. Therefore, it
> is not possible to make claims about homework's causal effects on longer-term
> measures of achievement."

Three further qualifications from verification: the effect loses significance
entirely under an assumed ICC of .4; **the two adolescent-age studies among the
five produced the two smallest effects (.46, .39)**; and the outcome is a unit
test aligned to the assignment's own content, which is close to measuring
whether practice helps on the thing practised.

The 2024 Campbell pooled figure is **g = 0.45 (95% CI 0.24–0.66)** across 14
comparisons **[S/NS — 2-1]**, from 10 articles spanning 1939–2021 with all but
one predating 1996, I² = 71.3%, all low quality. Its components are revealing:
arithmetic computation g = 0.46, problem-solving g = 0.17, **arithmetic concepts
g = −0.02 (null)** — practice-type outcomes benefit, conceptual understanding
did not. Its planned grade-level subgroup analysis failed for want of data:

> "the planned subgroup analyses were not feasible due to insufficient data.
> Consequently, potential differences across genders, grades, subjects, and
> regions remain untested." **[V 3-0]**

Only one included study sampled 8th grade — Ewart Anderson (1946), n = 58.

## §4 Grade level moderates it, but r = .25 is not this learner's number

The homework–achievement correlation is real only from about grade 7 up
**[V 3-0]**: secondary r = .25 (fixed) / .20 (random) against elementary
r = −.04 / .05, the latter not different from zero under random error;
Q(1) = 710.68, p < .0001 fixed, Q(1) = 10.43, p < .002 random. Overall r = .24
fixed / .16 random across 69 correlations, 35 samples, 32 studies.

**The middle grades are not the secondary headline.** From Cooper's earlier meta
of 50 correlational studies (1962–1987) **[S]**:

> "for students in middle grades it was r = .07; and for high school students it
> was r = .25."

Two things weaken the moderator, both from inside the same paper **[V 3-0]**:

- "Strongest moderator" holds only under fixed-error assumptions. Under the
  random-error model Cooper himself prefers for heterogeneous data, **respondent
  type is a bigger moderator** (Q = 20.06 vs 10.43).
- Restricted to student respondents it **disappears**: "the correlation… was NOT
  significantly higher for secondary school students, r = .19… than for
  elementary school students, r = .22… Q(1) = 0.57, ns." Part of the split is
  who reported the time, not who did the homework.

The grade moderator rests on 33 of the 69 correlations. The direction replicates
in Fan et al. (2017, *Educational Research Review* 20:35–54), where 8th-grade
effects exceed 4th-grade **[S]**.

**Practical read: r ≈ .07 is this learner's number, and it is a correlation with
self-reported time — which §5 shows is the wrong lever anyway.**

## §5 Time is not the variable. Effort is. — the central finding of this file

This is the best-replicated result in the pass and the one that should change
what the site records.

**At the individual-student level, more time predicts *lower* achievement once
prior achievement and ability are controlled.** Four independent large samples,
three countries, three research groups **[V 3-0]**:

| Sample | N | Result |
| --- | --- | --- |
| Spain, Year 8, mean age 14.4 | 26,543 | individual-level time betas **all negative**, all p<.001: Maths −0.050, Sciences −0.053, Spanish −0.055, Citizenship −0.055 — while **school-level betas are all positive** (0.046–0.083) |
| PISA-Germany, grade 9 | 24,273 | "students who spent more time on their mathematics homework than their schoolmates scored lower" |
| TIMSS-Germany, grades 7–8 | 2,216 | B = −.13*** |
| Berlin path model, grade 8, mean age 13.45 | 483 | β = −.14*** on T2 grades |

**The sign literally reverses between levels of analysis.** Assigned volume at
the school level is positive; time spent at the individual level is negative.

**And it replicates on a foreign language** — the single most relevant transfer
in this whole base **[V 3-0]**, Schnyder, Niggli, Cathomas, Trautwein & Lüdtke
(2006), 1,832 grade-8 students, 104 classes, three Swiss cantons, **French as a
foreign language**, pre/post across grade 8:

> "Irrespective of the method used to tap time spent on French homework (global
> self-report, diary method) and of the dimensions examined (e.g., written work,
> learning vocabulary), homework time proved to be negatively related to
> achievement and achievement gains."

Cite that as reported-in Trautwein (2007) — it reaches us through a
one-paragraph summary and **carries no recoverable effect size** **[S]**.

**What does predict gains is effort, and effort is a different construct from
time** **[V 3-0]**. In the 483-student grade-8 model, T1 homework effort
predicted T2 grades at **β = .16** (p<.001) controlling T1 grades, while time
predicted them at **β = −.14**, and the two correlated **r = −.12**:

> "homework time was not related—or negatively related—to achievement and
> achievement gains… Moreover, there was no positive correlation between
> homework effort and homework time. Hence, the present findings indicate that
> homework time is not a suitable indicator of the effort that students put into
> their homework." — Trautwein (2007), *Learning and Instruction* 17:372–388, §5.3

The same split appears in the Swiss French sample, where effort was
"consistently associated with higher student achievement and greater achievement
gains" **[S]**.

**What "effort" is measured as** matters for anything we build on it: six items
on conscientious execution, α = .86/.84, anchored on *"I do my best in my
mathematics homework"* and *"I often copy homework from others"* (reverse-scored).
That is a self-report, and this repo forbids unanchored self-assessment
(`../ielts/09-design-principles.md` §4.4). The collision is real and is worked
through in `06-build-rules.md` **P3**.

**Qualifications that must travel with this finding:**

- Correlational. **Reverse causation is the leading explanation and is visible
  in the data** — good T1 grades predicted *less* T2 homework time (β = −.15**).
  A slow learner spending longer is the signature of difficulty, not of effort
  failing to pay off.
- The negative coefficient is significant on self-reported grades but **null
  (β = .03, ns) on a standardised test** in the same study. The honest general
  statement is **null-to-negative**, not negative.
- Trautwein's three studies are mathematics only, all German, all self-report
  including the outcome (shared method variance), and Study 3 is highest-track
  students in one city.
- The 2015 Model 4 may over-control: prior achievement was proxied by school
  grades, themselves contaminated by effort. Its sample was also purged of
  near-zero-homework students, so it is a **within-doers gradient**, not evidence
  that homework is worthless.
- **Unit mismatch in the sign reversal.** The +0.25 SD school-level figure is per
  *assigned hour*; the −0.05 is a standardised beta per SD of *individual time*.
  "Reverses sign" is a statement about direction, never a magnitude comparison.
- Trautwein's own scope warning, which limits transfer to a self-study site: the
  measures "clearly targeted homework assigned by the teacher. Extra study time
  was not included," and voluntary study time may behave differently.

## §6 Frequency over duration — a heuristic, not an established effect

The design question "short daily or long weekly?" has **one** significant
coefficient behind it, in one German mathematics sample **[V 3-0]**:

> "At the class level, more frequent homework assignments were associated with
> higher achievement at T2, but the coefficient for homework time was not
> significant… The direct effect of homework frequency was much smaller than in
> Model 1 (dropping from .59 to .11), but it remained significant."
> — Trautwein (2007) Study 2, N = 2,216, 91 intact classes, grade 7 → 8,
> controlling prior achievement, cognitive ability, gender and school track

**That coefficient is unstandardised** — the source table's note reads "B:
unstandardized regression coefficient" — so .11 means 0.11 SD of achievement per
one point on a 1–5 frequency scale. It survives at p<.05 after 81% attenuation
under controls, on 91 level-2 units, in mathematics only.

**Three parallel frequency claims from the two Spanish samples were refuted
0-3** **[X]**, including the widely quotable "daily assignment beats sporadic by
15% of a SD". **Do not use that figure.** Neither the claim nor its negation is
asserted here.

Only the *time* half of the finding replicates independently (De Jong et al.
2000, Netherlands; Schnyder et al. 2006, Switzerland; Muhlenbruck et al. 2000).

> **Frequency-over-duration is therefore the best available design heuristic and
> not an established effect. It is marked [INF] wherever this repo acts on it,
> never [V].** It has never been tested on foreign-language homework.

## §7 The one foreign-language dose benchmark, and its underpowered null

Wallinger (2000), *Foreign Language Annals* 33(5):483–496 — Virginia grade-9
French I, **60 classes** across 49 teachers **[S/NS — 2-1]**:

> "students on the 4 x 4 schedule were expected to do an average of 12 minutes
> of homework per day (1 hour per week)… alternating day schedule was 14 minutes
> per day… daily schedule, the average was 17 minutes per day."

And the outcome across all four skills **[V 3-0]**:

> "Despite differences in both the amount of in-class time available for
> instruction and the amount of time expected for homework, there was no
> significant difference in the performance of students from any of the
> scheduling groups on the end-of-course test."

**This is descriptive practice, never a dose-response warrant**, and the errors
found in verification must travel with it: the 12/14/17 figures are an
arithmetic conversion of self-reported *annual* hours by an assumed 180-day year
that the author herself flags as not holding, and the conversion is internally
inconsistent (17 × 5 = 85 min, not the stated 75). The between-schedule
difference in expected hours was itself non-significant (F(2,57) = 2.8651,
p = .0652). The four-skill null is reported secondhand from the author's prior
work with **no test statistics, no effect size and no power analysis**, on a
researcher-developed instrument, over a homework contrast of only ~13.7 h/year.

**Record it as an underpowered null plus a practice benchmark. It is not
evidence that homework quantity does not matter.**

## §8 What this file does not establish

> **GAP** — **Foreign-language homework has essentially no evidence base.**
> Cooper's canonical synthesis (32 studies, 69 correlations) contained **exactly
> one** foreign-language study, dropped from the subject-matter moderator for
> having no companions **[V 2-1]**: "One study involving science, 1 involving
> foreign language, and 1 involving verbal and nonverbal ability were omitted
> from the analysis because there were too few studies in each of these
> outcome-type categories." Verification located it: Antonek (1996), unpublished
> dissertation, n = 89, r = +.26. The nearest proxy, language arts, was **null**
> (r = −.01 fixed, .01 random) while reading was positive (r = .21). Cooper's
> own hedge: subject-matter effects "should be viewed as suggestive rather than
> conclusive."

> **GAP** — **No study here separates per-subject dose from total dose.** What
> fraction of a ~60 min/day total one subject may claim is unaddressed, so
> whether a 20-minute daily English assignment sits on the rising part of the
> curve or below its detection threshold cannot be answered from this base.

> **GAP** — **The moderators a design would most want are untested.** Purpose,
> degree of choice, feedback, grading and parental involvement were not testable
> in the 2006 synthesis; the claim that they were is **refuted [X]**. Only four
> moderator variables had enough studies.

> **GAP** — **Setting mismatch is total.** Every finding is teacher-assigned
> homework inside a school, with a class, a teacher and an accountability
> structure. The one lever that came out positive — school-level assigned volume
> — has no analogue in solo self-study from a static site.
