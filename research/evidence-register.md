# Evidence register — generated, do not hand-edit

`python3 tools/build.py` writes this file from the `:::bridge` directives in
`units/*.md`. It is the audit trail for every IELTS claim the course makes:
what the claim is, which criterion it trains, the evidential marker it carries,
and the knowledge-base section that warrants it.

**It is deliberately not published.** The site is for someone learning English;
markers, warrants and CEFR coordinates are notes from the authors to
themselves. `tools/check_ielts.py` still refuses to build a claim whose marker
is illegal or whose citation does not resolve, so nothing is weakened by the
register living here instead of on a page.

29 claims across 12 units. **17** of them rest on
evidence weaker than verified.

## Three rules this course does not break

1. **No IELTS band number is ever put on a learner** — not as a score, not as a
   prediction, not as a progress dial. There is no published table converting
   raw marks to a band, no half-band descriptors, and no official arithmetic
   for combining criterion scores. A band number is legitimate in exactly one
   place: as a coordinate on the published descriptor grid, inside this
   repository's own documents. Never in the interface.
2. **Levels are labelled by CEFR.** The official IELTS–CEFR alignment stops at
   band 4.0 = the B1 threshold and assigns *no band at all* to A2 or A1.
   Grade-8 work sits at A2, so there is no band to label it with and none can
   be derived. The `cefr` attribute records the level; the pages do not print
   it, because a learner does not need a coordinate to do an exercise.
3. **No templates and no model openers.** Memorised language is the explicitly
   penalised category — a wholly memorised answer scores zero, and memorised
   chunks are a band-4 feature of Lexical Resource. Where a lesson gives a
   structure, it gives it as questions the writer has to answer, never as
   sentences to reuse.

## How to read the strength labels

Every claim carries the marker it had in the research, unchanged. Re-stating a
finding never makes it stronger, so nothing here upgrades one.

| Marker | Short | What it means | Used |
| --- | --- | --- | --- |
| `[Q]` | quoted | quoted word-for-word from IELTS's own published material | 6 |
| `[D]` | descriptor | wording taken from the published band descriptors | 1 |
| `[C]` | verified | checked by a three-vote adversarial panel and sustained | 5 |
| `[V]` | verified | checked by a three-vote adversarial panel and sustained | 0 |
| `[S]` | one source | quoted from a single primary source, not independently checked | 6 |
| `[S/NS]` | one source, unsustained | quoted from a single source — the matching verification did not hold. Weaker than a verified claim | 1 |
| `[T2]` | research, not a rule | a tendency measured in candidates. Never a rule of the test | 5 |
| `[INF]` | our reasoning | our own inference from the cited facts. No source states this link | 4 |
| `[SPEC]` | untested | plausible and level-appropriate, but no source says it works | 1 |

## The register

| Unit·Lesson | What changes | What it trains | CEFR | Strength | Source | Authored in |
| --- | --- | --- | --- | --- | --- | --- |
| 1.5 | One turn, one subject | Fluency & Coherence | B1 | `[C] 3-0` | `06 §2` | `units/unit-01-leisure-time.md` |
| 1.6 | Mark how sure you are, then check your calibration | Listening | A2→B1 | `[T2]` | `03 §6.6` | `units/unit-01-leisure-time.md` |
| 1.6 | Your own life is evidence — but it has to support a point | Task Response | B1 | `[C] 3-0` | `05 §3.1` | `units/unit-01-leisure-time.md` |
| 2.6 | The one sentence a reader who reads nothing else should get | Coherence & Cohesion | B1 | `[Q]` | `05 §2.5` | `units/unit-02-life-in-the-countryside.md` |
| 2.6 | One comparison, highlighted — not a list of differences | Task Achievement | B1 | `[INF]` | `02 §2.1` | `units/unit-02-life-in-the-countryside.md` |
| 3.6 | One marker per stage, none inside a stage | Coherence & Cohesion | B1 | `[Q]` | `05 §4` | `units/unit-03-teenagers.md` |
| 4.2 | Final /ɡ/ is outside the Vietnamese coda inventory — that is why it drifts to /k/ | Pronunciation | A2 | `[S]` | `07 §5.5.1` | `units/unit-04-ethnic-groups-of-viet-nam.md` |
| 4.5 | Synonym search against the clock | Reading | B1 | `[T2]` | `04 §8.3` | `units/unit-04-ethnic-groups-of-viet-nam.md` |
| 4.5 | Answer, then develop — two beats for every reply | Fluency & Coherence | A2→B1 | `[T2]` | `06 §6.3` | `units/unit-04-ethnic-groups-of-viet-nam.md` |
| 4.6 | Countable or uncountable is a determiner decision | Grammatical Range & Accuracy | B1 | `[S]` | `07 §4.4` | `units/unit-04-ethnic-groups-of-viet-nam.md` |
| 5.6 | Articles are a spine, not a single lesson | Grammatical Range & Accuracy | B1 | `[S]` | `07 §4.4` | `units/unit-05-our-customs-and-traditions.md` |
| 5.6 | Report it as a fraction, not as a mark | Grammatical Range & Accuracy | B1 | `[S/NS]` | `07 §8.2` | `units/unit-05-our-customs-and-traditions.md` |
| 6.2 | This is a voicing drill, not a cluster drill | Pronunciation | A2 | `[S]` | `07 §5.5.3` | `units/unit-06-lifestyles.md` |
| 6.6 | Open → stand → close. Learn the name once; you will meet it three more times | Task Response | B1 | `[Q]` | `05 §3.1` | `units/unit-06-lifestyles.md` |
| 6.6 | One concession sentence — built from two simple sentences | Task Response | A2 | `[INF]` | `05 §5` | `units/unit-06-lifestyles.md` |
| 7.2 | The same drill as Unit 6, on two new clusters | Pronunciation | A2 | `[S]` | `07 §5.5.3` | `units/unit-07-environmental-protection.md` |
| 7.6 | Two cause-and-result sentences on what you just heard | Grammatical Range & Accuracy | B1 | `[Q]` | `05 §2.6` | `units/unit-07-environmental-protection.md` |
| 7.6 | Write the same three facts twice, and name what changed | Lexical Resource | B1 | `[SPEC]` | `07 §4.6` | `units/unit-07-environmental-protection.md` |
| 8.5 | One turn, one subject — again, and for the same reason | Fluency & Coherence | B1 | `[C] 3-0` | `06 §2` | `units/unit-08-shopping.md` |
| 8.6 | Re-score the frequency drill: say it aloud first, and count the -s | Grammatical Range & Accuracy | B1 | `[S]` | `07 §4.5` | `units/unit-08-shopping.md` |
| 9.6 | Same ninety seconds, more facts in it | Listening | B1 | `[T2]` | `03 §2.1` | `units/unit-09-natural-disasters.md` |
| 9.6 | After the three stages, one sentence saying which matters most | Task Achievement | B1 | `[C] 2-1` | `05 §2.2` | `units/unit-09-natural-disasters.md` |
| 10.6 | Open → stand → close, out loud, with an audible pause at each turn | Fluency & Coherence | B1 | `[C] 3-0` | `06 §2` | `units/unit-10-communication-in-the-future.md` |
| 10.6 | Prepositions, tracked the way Unit 5 tracks articles | Grammatical Range & Accuracy | B1 | `[INF]` | `07 §8.2` | `units/unit-10-communication-in-the-future.md` |
| 11.2 | One new-information word per sentence — and unstress the rest | Pronunciation | B1 | `[T2]` | `06 §6.2` | `units/unit-11-science-and-technology.md` |
| 11.6 | Say the prompt in your own words before you answer it | Lexical Resource | B1 | `[D]` | `02 §7` | `units/unit-11-science-and-technology.md` |
| 12.2 | A list read aloud is chunking in miniature | Pronunciation | B1 | `[INF]` | `07 §5.2` | `units/unit-12-life-on-other-planets.md` |
| 12.5 | Only what the text says — and space is the hardest place to obey that | Reading | B1 | `[Q]` | `04 §4.2` | `units/unit-12-life-on-other-planets.md` |
| 12.6 | One sentence that carries the whole paragraph | Coherence & Cohesion | B1 | `[Q]` | `05 §2.5` | `units/unit-12-life-on-other-planets.md` |

Sources are sections of `research/ielts/` — a source-verified reference built
from ielts.org, British Council, IDP and Cambridge material plus peer-reviewed
research. `tools/check_ielts.py` fails the build if a cited section does not
exist in the file it names.
