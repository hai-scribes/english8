# 06 — What this base licenses, and what it blocks

**Read this file last.** It inherits markers from `01`–`05` and adds no new
sources. It is to this base what `../ielts/09-design-principles.md` §1 is to the
IELTS base: a checklist the site can be audited against.

**Fifteen rules, `P1`–`P15`.** They sit alongside the 66 items in `09` §1 and
never override them. Where the two collide — and one does, at **P3** — the
IELTS base wins, because it governs what the site may *claim* and this one only
informs how the work is *shaped*.

**A standing marker rule for everything in this file.** No study in `01`–`05`
was run on a Vietnamese learner, a self-study website, or (with two thin
exceptions) a foreign language at all. **Every rule below that turns a finding
into a design decision is `[INF]` — this base's own reasoning — even where the
underlying finding is `[V 3-0]`.** The finding's marker and the rule's marker
are different things and both are shown.

---

## §1 The checklist

### Group P — Assignment design and progress

| # | Rule | Fails if | Finding | Rule |
| --- | --- | --- | --- | --- |
| **P1** | **Elapsed time is never displayed, recorded as progress, or used to rank sessions.** At the individual level more minutes predicts *lower* achievement across four samples in three countries, including a grade-8 foreign-language one | A "time studied this week" counter; a minutes-based streak; sorting anything by duration | `01` §5 **[V 3-0]** | **[INF]** |
| **P2** | **Any minutes figure the site adopts is labelled a design choice, not an evidenced dose.** No experiment establishes an optimal assignment length at this age — the only systematic mapping found two duration-manipulating studies, both primary-school | "Research says 20 minutes a day" | `01` §1 **[V 3-0]** + GAP | **[INF]** |
| **P3** | **The progress signal is effort-shaped and objectively anchored** — attempts committed, tasks completed as real attempts, items *produced* rather than picked — never elapsed time and never the learner's self-rating | A dashboard driven by "how hard did you try?"; a minutes counter standing in for engagement | `01` §5 **[V 3-0]**; `09` **E8**, §4.4 **[S]** | **[INF]** |
| **P4** | **Prefer short and frequent to long and occasional — and say that this is a heuristic.** One significant unstandardised coefficient in one German mathematics sample supports it; three parallel claims were refuted | Citing "daily beats sporadic by 15% of an SD"; presenting frequency-over-duration as established | `01` §6 **[V 3-0]** / **[X]** | **[INF]** |
| **P5** | **A daily English assignment is *capped* by the ~60 min/day total-homework figure, never *set* by it.** Every dose number in the literature is total homework across all subjects | Reading "60 minutes" as a per-subject budget | `01` §2 **[V 3-0]** + GAP | **[INF]** |
| **P6** | **In-session accuracy is not a proxy for retention, and nothing is tuned to maximise it.** The schedule with the worst in-session accuracy (77.0% vs 87.2%) beat the comfortable one a week later | Tuning difficulty until the learner gets most items right; treating a low in-session score as a design failure | `02` §1 **[V 3-0]** | **[INF]** |
| **P7** | **The learner's felt sense of a practice arrangement is not a design input.** Learners rated three schedules of markedly different effectiveness as equally effective (p = .443) | "Which practice mode felt best?" driving what the site offers next | `02` §1 **[V 3-0]** | **[INF]** |
| **P8** | **Daily assignments are completable alone.** Parental involvement in daily homework carries a weak *negative* association across 378,222 participants, and no positive association to lean on | A weekday task that needs an adult to explain it | `05` §3 **[V 3-0]** | **[INF]** |
| **P9** | **No points, badges, or tangible rewards for completing study.** Expected tangible rewards undermine free-choice intrinsic motivation, worse in children (d = −0.39) than adults (d = −0.27) | A points economy; a prize for a completed week | `03` §2 **[V 3-0]** | **[INF]** |
| **P10** | **No motivational instrumentation justified by "it keeps her engaged."** Attrition tracked dispositional persistence, not motivation, proficiency or interest | Adding a feature and warranting it as retention-improving from this base | `03` §1 **[V 3-0]**, single study | **[INF]** |
| **P11** | **A struggling learner is not treated as a flight risk.** Neither self-rated nor measured proficiency predicted dropout | A "she's falling behind, lighten the load" rule sourced to this base | `03` §1 **[V 3-0]** | **[INF]** |
| **P12** | **The weekly session is not designed as homework supervision.** Non-professional tutors average 0.21 SD and parent tutors 0.23 SD against teacher 0.50 — and the 0.37 headline was refuted as a benchmark | Designing the Saturday hour as "go through the week's answers together" and citing 0.37 SD for it | `05` §1 **[V 3-0]** / **[X]** | **[INF]** |
| **P13** | **No claim that mixing beats blocking, in either direction.** One study says interleave (adults, receptive grammar); one says block first (adolescents, vocabulary) — this learner is the case where they disagree | Shipping a mixing policy and warranting it from `02` | `02` §2 **[SPEC]** + GAP | **[SPEC]** |
| **P14** | **No concrete review-day offsets are warranted.** Both candidate findings that would have supplied them were refuted 0-3; `09` §2.1's GAP stands unclosed | "Review on day 2 and day 7, per the research" | `02` §3 **[X]** | **[INF]** |
| **P15** | **Markers are inherited from `01`–`05` and never upgraded, and every rule here states its population mismatch at the point of use** | Quoting P6 as "research shows" without saying it is 18–22-year-old adults on a receptive test | `README.md` §2; `09` **G2** | **[INF]** |

### The fast gate — four checks that catch most of it

1. Does anything on screen show **elapsed time** as an achievement? → **P1**
2. Is any number of minutes presented as **evidence-backed**? → **P2**
3. Does any reward, badge or point attach to **completing** work? → **P9**
4. Does a design decision cite this base **without naming the population it came
   from**? → **P15**

## §2 What is blocked, and what would unblock it

Modelled on `09` §7.1. "Blocked" means *do not build it yet*, never *it cannot
work*.

| Blocked | Why | What unblocks it |
| --- | --- | --- |
| A mixing / interleaving policy | Two studies, opposite directions, and this learner sits exactly where they disagree | A pass on adolescent interleaving, especially Kim (2024) in full text, and any replication on productive work |
| Any specific review-day ladder presented as evidenced | Both offset findings refuted; `09` §2.1 GAP open | A study testing named offsets on school-age L2 learners. A ladder may still ship — as an engineering choice, labelled one (`09` **F4**, **F5**) |
| A streak mechanic | `03` §2 covers *tangible rewards* in a 1999 lab meta-analysis; nothing was retrieved on streaks as apps implement them, and a prizeless streak may not be a tangible reward at all | Direct evidence on streak mechanics, including what breaking one does |
| A prepared script or materials for the Saturday session | The lever exists — hand the tutor a session — but nothing establishes that structuring a non-professional tutor raises their 0.21 toward the paraprofessional 0.40 | Evidence on tutor training and structured materials by tutor type |
| Any extensive-listening programme warranted by analogy to extensive reading | Extensive reading is the best-replicated intervention in `09` §2.2; **no comparable evidence for listening was established** | An extensive-listening meta-analysis with its own effect size |
| Citing `d = 0.93` for task-based instruction | Pooled over 52 heterogeneous implementation studies, many single-group pre-post; not a head-to-head contrast; full text closed | Open access to the moderator directions, or a head-to-head meta-analysis |
| Any autonomy-support-versus-content-support rule for the tutor | The most design-relevant claim in `05`, **refuted 0-3** and therefore unproven, not disproven | Re-verification of Xu et al. (2024)'s moderator decomposition — **the highest-value target for the next pass** |

## §3 The collision at P3, worked through

`01` §5 establishes that **effort** predicts achievement gains and **time** does
not. That is the most useful finding in this base. But the instrument behind it
is a **six-item self-report** — *"I do my best in my homework"*, *"I often copy
homework from others"* — and `09` **E8** and §4.4 forbid exactly that: a
self-rating treated as a measure, unanchored.

Both rules are right and they do not actually conflict, because they are about
different things. The research needed a *measure* of effort and used the only
instrument available at survey scale. This site does not need to measure effort;
it needs to **not measure time**, and to record something that is not time.

What it can record without self-report:

- **an attempt was committed** — the `:::task` machinery already distinguishes a
  committed attempt from a revealed answer, which is the whole point of it;
- **a retake was taken** — a second attempt is a fact about behaviour, and `09`
  **E3**/**E9** already bound what may be *said* about the pair;
- **an item was produced rather than picked** — the review queue already ranks
  produced over picked (`CLAUDE.md`, "the review queue takes the productive
  item").

None of those is a self-rating, and none is a clock. **That is the whole of P3:
the site already has effort-shaped signals; the rule is to prefer them and to
stop reaching for the timer.**

> **GAP** — whether those three behavioural signals actually stand in for the
> effort construct that predicted gains is **unestablished**. Nothing validates
> them against it. P3 says what to record, and does not claim the substitution
> has been shown to work.

## §4 What this base is not

- **It is not a curriculum.** It says nothing about what to teach, and `04` is
  nearly empty on how to shape a lesson.
- **It does not license a weekly schedule.** The daily-solo-plus-Saturday-tutor
  shape has no direct support (`02` §4, `05` §5). It is a reasoned arrangement
  and should be described as one.
- **It carries no IELTS claims.** Nothing here may appear in a `:::bridge`;
  `check_ielts.py` resolves citations against `../ielts/` and this base is not
  part of that chain.
- **It never reaches a page.** Same rule as everything else in `research/`:
  the interface is the learner's, the reasoning is ours (`CLAUDE.md`).
