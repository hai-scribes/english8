# IELTS Band Descriptors, Deconstructed

Phase 2 of the IELTS knowledge base (`research/ielts-research-plan.md`). This is
the reference document every rubric, feedback tool, and lesson target in this
project derives from. Nothing downstream may assert a band claim that is not
traceable to a phrase quoted here.

**Research date:** 2026-08-08.
**Scope:** Writing (Task Achievement / Task Response, Coherence & Cohesion,
Lexical Resource, Grammatical Range & Accuracy) and Speaking (Fluency &
Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation),
bands 4→9, plus the band-ceiling behaviours named in official examiner
commentary.

**Source policy.** Tier 1 (binding): ielts.org descriptor PDFs, key assessment
criteria guides, and examiner-commented sample scripts. Tier 2 (evidence):
IELTS Research Reports. Tier 3: none used. Every descriptor phrase below is
quoted verbatim from a document named in `## Sources`, and every band-ceiling
claim is tied to an examiner sentence.

**How to read the quoting convention.** Descriptor wording appears in
"double quotes" and is verbatim. Where the two circulating Writing descriptor
documents disagree, both are shown and labelled **[2023]** and **[2013]** — see
the next section before using any of it.

---

## 1. Source version warning — read this first

Two different official IELTS Writing band descriptor documents are in
circulation, with **materially different wording**. Prep sites, teacher blogs,
and even some institutional pages mirror whichever one they happened to
download. A rubric built from one and checked against the other will appear to
be wrong.

### 1.1 The two documents

| Label | Document | Format | Dating evidence |
| --- | --- | --- | --- |
| **[2023]** | `ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf` — "Writing Band Descriptors", separate Task 1 and Task 2 grids, each 3 pages | Continuous prose in each cell; header on every page reads "Updated May 2023" | Document text says "Updated May 2023". PDF XMP metadata: `CreateDate 2023-05-03`, `ModifyDate 2023-10-18`, producer "Microsoft PowerPoint for Microsoft 365" |
| **[2013]** | `assets.ctfassets.net/.../writingbanddescriptorstask1and2.pdf` — "WRITING TASK 1: Band Descriptors (public version)" / "WRITING TASK 2: Band Descriptors (public version)", both grids on 2 pages | Bulleted lists in each cell | PDF metadata: `ModDate 2013-06-13`, creator "Nitro Pro 8". Footer credits "Cambridge English Language Assessment" — a corporate name retired in 2021, when it became Cambridge University Press & Assessment |

The **[2023]** document is the current one and supersedes **[2013]**. The
[2013] grid is still hosted on a live IDP/IELTS Contentful CDN path, which is
why it keeps propagating.

Corroborating evidence that May 2023 was a coordinated revision of the whole
Writing/Speaking assessment documentation set: the two "key assessment
criteria" guides carry the same creation date in their metadata —
`ielts-writing-key-assessment-criteria.pdf` (`CreateDate 2023-05-03T10:24`) and
`ielts-speaking-key-assessment-criteria.pdf` (`CreateDate 2023-05-03T10:23`),
minutes apart, and the descriptors PDF at `2023-05-03T12:02`.

### 1.2 What actually changed (the differences that bite)

| Criterion | [2013] wording | [2023] wording | Why it matters |
| --- | --- | --- | --- |
| Task Response, band 6 | "addresses all parts of the task although some parts may be more fully covered than others" | "The main parts of the prompt are addressed (though some may be more fully covered than others). An appropriate format is used." | "all parts of the task" became "the main parts of the prompt" — the 2013 framing supports the popular "band 6 already covers all parts" argument; the 2023 framing does not |
| Task Response, band 7 | "addresses all parts of the task" | "The main parts of the prompt are appropriately addressed." | Same shift, plus "appropriately" is now the 6→7 discriminator |
| Task Response, band 8 | "sufficiently addresses all parts of the task" | "The prompt is appropriately and sufficiently addressed." | |
| Coherence & Cohesion, band 6 | "cohesion within and/or between sentences may be faulty or mechanical" | "Cohesive devices are used to some good effect but cohesion within and/or between sentences may be faulty or mechanical **due to misuse, overuse or omission**." | 2023 names the three mechanisms |
| Coherence & Cohesion, band 7 | "uses a range of cohesive devices appropriately although there may be some under-/over-use" | "A range of cohesive devices including reference and substitution is used flexibly but with some inaccuracies or some over/under use." | 2023 promotes *flexibility* over *appropriacy* and names reference/substitution |
| Lexical Resource, band 6 | "uses an adequate range of vocabulary for the task / attempts to use less common vocabulary but with some inaccuracy" | adds "**If the writer is a risk-taker, there will be a wider range of vocabulary used but higher degrees of inaccuracy or inappropriacy.**" | Entirely new clause. It explicitly says reaching for bigger words does not by itself leave band 6 |
| Lexical Resource / GRA, bands 8–9 | identical wording in Task 1 and Task 2 | Task 1 adds "**within the scope of the task**"; Task 2 does not | The two tasks are no longer word-identical on LR/GRA at the top of the scale |
| Task Achievement, band 5 (Academic) | "recounts detail mechanically with no clear overview" | "The recounting of detail is mainly mechanical. **There may be no data to support the description.**" | |
| Paragraphing, Task 2 band 7 | "presents a clear central topic within each paragraph" | "Paragraphing is generally used effectively to support overall coherence, and the sequencing of ideas within a paragraph is generally logical." | |
| Bolding convention | none stated | every page carries: "A script must fully fit the positive features of the descriptor at a particular level. **Bolded text indicates negative features that will limit a rating.**" | This is a scoring instruction that only exists in [2023] — see §6.1 |

### 1.3 The rule this project adopts

1. **Writing rubrics in this repo derive from [2023]** and must carry the string
   `IELTS Writing Band Descriptors, updated May 2023` in their source line.
2. Any rubric line quoting bullet-style wording ("uses a wide range of
   vocabulary fluently and flexibly...") is [2013]-derived and must be re-checked
   before use.
3. When a prep source and this document disagree, assume the prep source is
   mirroring [2013] before assuming either is wrong.

> **GAP** — the British Council mirror
> (`takeielts.britishcouncil.org/sites/default/files/ielts_writing_band_descriptors.pdf`)
> could not be retrieved in this research run: the host returned an Akamai
> `Access Denied` page, not a PDF. We therefore **cannot state which version the
> British Council publishes**, and cannot rule out a third wording variant in
> circulation. This should be re-checked before any public-facing claim that
> "the official descriptors say X".

> **GAP** — the **Speaking** band descriptors PDF carries **no revision date at
> all** on its face (its header reads only "Please visit IELTS.org for
> updates"), and its file metadata shows a 2025 regeneration by a PDF library,
> not an authoring date. We cannot say whether Speaking was revised alongside
> Writing in May 2023, or when the current Speaking wording took effect.
> Speaking rubrics in this repo must therefore cite *retrieval date*, not
> version — the literal is `IELTS Speaking Band Descriptors, retrieved
> 2026-08-08` (§10 rule 1).

---

## 2. The scoring frame

Four criteria per productive skill. From `ielts-writing-key-assessment-criteria.pdf`
and `ielts-speaking-key-assessment-criteria.pdf` (both Tier 1):

| | Writing Task 1 | Writing Task 2 | Speaking |
| --- | --- | --- | --- |
| 1 | Task Achievement | Task Response | Fluency and Coherence |
| 2 | Coherence and Cohesion | Coherence and Cohesion | Lexical Resource |
| 3 | Lexical Resource | Lexical Resource | Grammatical Range and Accuracy |
| 4 | Grammatical Range and Accuracy | Grammatical Range and Accuracy | Pronunciation |

Task weighting is stated explicitly: "Each task is assessed independently. **The
assessment of Task 2 carries more weight in marking than Task 1.**" Minimum
lengths are part of the criterion definitions, not separate rules: Task 1 is
assessed "using a minimum of 150 words", Task 2 "using a minimum of 250 words".

### 2.1 What each criterion officially assesses

These sub-feature lists are the closest thing to an operational definition IELTS
publishes, and they are what a self-study checklist should be built from.

**Writing — Lexical Resource** assesses six things:

- "the range of general words used (e.g. the use of synonyms to avoid repetition)"
- "the adequacy and appropriacy of the vocabulary (e.g. topic-specific items, indicators of writer's attitude)"
- "the precision of word choice and expression"
- "the control and use of collocations, idiomatic expressions and sophisticated phrasing"
- "the density and communicative effect of errors in spelling"
- "the density and communicative effect of errors in word formation"

Note the last two: error impact is judged by **density and communicative
effect**, not raw error count. A checklist that counts spelling errors is not
measuring what the criterion measures.

**Writing — Grammatical Range and Accuracy** assesses four:
"the range and appropriacy of structures used in a given response (e.g. simple,
compound and complex sentences)"; "the accuracy of simple, compound and complex
sentences"; "the density and communicative effect of grammatical errors"; "the
accurate and appropriate use of punctuation". **Punctuation is scored under
grammar, not cohesion.**

**Writing — Coherence and Cohesion** assesses five, and the guide defines the
two halves separately: "Coherence refers to the linking of ideas through logical
sequencing, while cohesion refers to the varied and appropriate use of cohesive
devices (e.g. logical connectors, conjunctions and pronouns)". The five
sub-features are logical organisation/progression; "the appropriate use of
paragraphing for topic organisation and presentation"; logical sequencing within
and across paragraphs; "the flexible use of reference and substitution (e.g.
definite articles, pronouns)"; and appropriate discourse markers.

**Academic Task 1 — Task Achievement** is defined by five abilities, one of
which is the single most quotable line in the whole guide for our purposes:

> "comparing or contrasting the information by adequately highlighting the
> identifiable trends, principal changes or differences in the data and other
> inputs (**rather than mechanical description reporting detail**)."

and the task is bounded: it "relates narrowly to the factual content of a
diagram, graph, table, chart, map or other visual input, **not to speculative
explanations that lie outside the given data**."

**Speaking — Fluency** has exactly two key indicators: "speech rate" and
"speech continuity", where continuity is defined as flow "not excessively
interrupted by false starts, backtracking, functionless repetitions of words and
phrases, and/or pausing during which the test taker searches for words".
**Coherence** is separately indicated by logical sequencing of spoken sentences,
clear marking of stages, relevance to the purpose of the turn, and cohesive
devices.

**Speaking — Pronunciation** has exactly five key indicators:

1. "the ability to divide speech into meaningful utterances or chunks within spoken sentences"
2. "the appropriate use of rhythm and stress timing, and the linking of sounds, using features such as elision to produce connected speech"
3. "the use of stress (e.g. emphatic/contrastive) and intonation to enhance meaning"
4. "the production of sounds at the word and phoneme level (e.g. word stress, vowel and consonant production), and the degree of effort required of the listener to understand these"
5. "the overall effect of accent on intelligibility"

This five-part construct is the spine of §5 and maps directly onto the U1–U12
phonology strand.

**Speaking — Lexical Resource** includes an indicator with no Writing
equivalent: "ability to use paraphrase (getting round a vocabulary gap by using
other words), **with or without noticeable hesitation**."

---

## 3. Writing — band ladders 4→9

All wording below is **[2023]** unless labelled otherwise. Task 1 and Task 2
share Coherence & Cohesion, Lexical Resource and GRA wording almost exactly; the
differences are noted.

### 3.1 Task Response (Task 2)

| Band | Prompt coverage | Position | Ideas |
| --- | --- | --- | --- |
| 9 | "The prompt is appropriately addressed and explored in depth." | "A clear and fully developed position is presented which directly answers the question/s." | "Ideas are relevant, fully extended and well supported." · "Any lapses in content or support are extremely rare." |
| 8 | "The prompt is appropriately and sufficiently addressed." | "A clear and well-developed position is presented in response to the question/s." | "Ideas are relevant, well extended and supported." · "There may be occasional omissions or lapses in content." |
| 7 | "The main parts of the prompt are appropriately addressed." | "A clear and developed position is presented." | "Main ideas are extended and supported but there may be a tendency to over-generalise or there may be a lack of focus and precision in supporting ideas/material." |
| 6 | "The main parts of the prompt are addressed (though some may be more fully covered than others). An appropriate format is used." | "A position is presented that is directly relevant to the prompt, although the conclusions drawn may be unclear, unjustified or repetitive." | "Main ideas are relevant, but some may be insufficiently developed or may lack clarity, while some supporting arguments and evidence may be less relevant or inadequate." |
| 5 | "The main parts of the prompt are **incompletely addressed**. The format may be inappropriate in places." | "The writer expresses a position, but the development is not always clear." | "Some main ideas are put forward, but they are limited and are not sufficiently developed and/or there may be irrelevant detail." · "There may be some repetition." |
| 4 | "The prompt is tackled in a minimal way, or the answer is tangential, possibly due to some misunderstanding of the prompt. **The format may be inappropriate.**" | "A position is discernible, but the reader has to read carefully to find it." | "Main ideas are difficult to identify and such ideas that are identifiable may lack relevance, clarity and/or support." · "Large parts of the response may be repetitive." |

**Deltas**

| Step | What changes |
| --- | --- |
| 6→7 | Coverage gains the word **"appropriately"** and loses the concession "though some may be more fully covered than others". Position goes from "relevant … conclusions may be unclear, unjustified or repetitive" to **"clear and developed"**. Ideas go from "some may be insufficiently developed" to **"extended and supported"**. The residual weakness allowed at 7 shifts from *underdevelopment* to *over-generalisation*. |
| 7→8 | The unit of coverage changes from **"the main parts of the prompt"** to **"the prompt"** as a whole, plus "sufficiently". Position gains "well-". Ideas gain "well extended". Over-generalisation is no longer tolerated; what remains tolerable is "occasional omissions or lapses in content". |
| 8→9 | "Sufficiently addressed" → **"explored in depth"**. "Well-developed" → "fully developed" *and* "directly answers the question/s". "Well extended" → **"fully extended"**. Tolerance narrows from "occasional" lapses to "extremely rare". |

Note what does *not* change: at every band 6–9 the response must present a
position. Failure to present one is a band 4–5 feature ("A position is
discernible, but the reader has to read carefully to find it").

### 3.2 Task Achievement (Task 1, Academic)

| Band | Coverage | Academic-specific |
| --- | --- | --- |
| 9 | "All the requirements of the task are fully and appropriately satisfied." · "There may be extremely rare lapses in content." | — |
| 8 | "The response covers all the requirements of the task appropriately, relevantly and sufficiently." · "There may be occasional omissions or lapses in content." | "Key features are skilfully selected, and clearly presented, highlighted and illustrated." |
| 7 | "The response covers the requirements of the task." · "The content is relevant and accurate – there may be a few omissions or lapses. The format is appropriate." | "Key features which are selected are covered and clearly highlighted but could be more fully or more appropriately illustrated or extended." · "**It presents a clear overview, the data are appropriately categorised, and main trends or differences are identified.**" |
| 6 | "The response focuses on the requirements of the task and an appropriate format is used." · "Some details may be missing (or excessive) and further extension or illustration may be needed." | "Key features which are selected are covered and adequately highlighted. **A relevant overview is attempted.** Information is appropriately selected and supported using figures/data." |
| 5 | "The response generally addresses the requirements of the task. The format may be inappropriate in places." · "There may be a tendency to focus on details (without referring to the bigger picture)." | "Key features which are selected are not adequately covered. **The recounting of detail is mainly mechanical. There may be no data to support the description.**" |
| 4 | "The response is an attempt to address the task." · "**The format may be inappropriate.**" · "Key features/bullet points which are presented may be irrelevant, repetitive, inaccurate or inappropriate." | "Few key features have been selected." |

**Deltas**

| Step | What changes |
| --- | --- |
| 6→7 | The overview goes from **attempted** ("A relevant overview is attempted") to **achieved and specified** ("a clear overview, the data are appropriately categorised, and main trends or differences are identified"). Highlighting goes from "adequately" to "clearly". Accuracy becomes explicit: "The content is relevant and accurate". |
| 7→8 | "Covers the requirements" → "covers **all** the requirements … appropriately, relevantly and sufficiently". Key-feature handling goes from "could be more fully … illustrated or extended" to **"skilfully selected, and clearly presented, highlighted and illustrated"** — i.e. the 7-level shortfall (under-illustration) is closed. |
| 8→9 | "Covers all the requirements" → "**fully and appropriately satisfied**". Lapse tolerance goes from "occasional" to "extremely rare". The 2023 grid states no separate overview requirement at 8–9; examiner commentary supplies it (§6.2, item 6). |

The Task 1 overview is the single highest-leverage feature on this ladder: it is
the named difference between 5 (mechanical recounting), 6 (attempted), and 7
(clear, categorised, trends identified).

> **[2013] variant** — the older grid put the overview differently: band 6
> "(A) presents an overview with information appropriately selected"; band 7
> "(A) presents a clear overview of main trends, differences or stages"; band 5
> "(A) recounts detail mechanically with no clear overview". Same ladder,
> different words. Note [2013] does **not** contain "A relevant overview is
> attempted", which is the phrase most prep material now needs.

### 3.3 Coherence and Cohesion

| Band | Readability | Cohesive devices | Paragraphing |
| --- | --- | --- | --- |
| 9 | "The message can be followed effortlessly." · "Any lapses in coherence or cohesion are minimal." | "Cohesion is used in such a way that it very rarely attracts attention." | "Paragraphing is skilfully managed." |
| 8 | "The message can be followed with ease." · "Occasional lapses in coherence or cohesion may occur." | "Information and ideas are logically sequenced, and cohesion is well managed." | "Paragraphing is used sufficiently and appropriately." |
| 7 | "Information and ideas are logically organised, and there is a clear progression throughout the response. (A few lapses may occur, but these are minor.)" | "A range of cohesive devices including reference and substitution is used flexibly but with some inaccuracies or some over/under use." | (T2) "Paragraphing is generally used effectively to support overall coherence, and the sequencing of ideas within a paragraph is generally logical." |
| 6 | "Information and ideas are generally arranged coherently and there is a clear overall progression." | "Cohesive devices are used to some good effect but **cohesion within and/or between sentences may be faulty or mechanical due to misuse, overuse or omission**." · "The use of reference and substitution may lack flexibility or clarity and result in some repetition or error." | (T2) "Paragraphing may not always be logical and/or the central topic may not always be clear." |
| 5 | "Organisation is evident but is not wholly logical and there may be a lack of overall progression. Nevertheless, there is a sense of underlying coherence to the response." · "The relationship of ideas can be followed but the sentences are not fluently linked to each other." | "There may be limited/overuse of cohesive devices with some inaccuracy." · "The writing may be repetitive due to inadequate and/or inaccurate use of reference and substitution." | (T2) "**Paragraphing may be inadequate or missing.**" |
| 4 | "Information and ideas are evident but not arranged coherently and there is no clear progression within the response." · "Relationships between ideas can be unclear and/or inadequately marked." | "There is some use of basic cohesive devices, which may be inaccurate or repetitive." · "There is inaccurate use or a lack of substitution or referencing." | (T2) "There may be no paragraphing and/or no clear main topic within paragraphs." |

**Deltas**

| Step | What changes |
| --- | --- |
| 6→7 | Progression goes from "**generally** arranged coherently … clear **overall** progression" to "**logically organised** … clear progression **throughout**". Devices go from "faulty or mechanical" to "used **flexibly**". Reference and substitution stop being a weakness ("may lack flexibility or clarity") and become part of the flexible range. Paragraphing goes from possibly illogical/unclear-topic to "generally used effectively". |
| 7→8 | The criterion stops describing devices and starts describing **effect**: "cohesion is well managed", "The message can be followed with ease". The 7-level tolerance for "some inaccuracies or some over/under use" disappears; what remains is "occasional lapses". Paragraphing: "generally used effectively" → "used sufficiently and appropriately". |
| 8→9 | Reading effort drops from "with ease" to "**effortlessly**"; cohesion becomes invisible ("very rarely attracts attention"); paragraphing becomes "**skilfully** managed"; lapses go from "occasional" to "minimal". |

**The important negative finding.** Mechanical cohesion *is* a band-6 descriptor
feature. It is **not** printed in bold. See §6.1 — this matters, because the
[2023] grid's own instruction is that bold marks features that limit a rating,
and no band-6 or band-7 text is bolded anywhere in the document.

### 3.4 Lexical Resource

Task 1 and Task 2 wording is identical at bands 4–7. At bands 8–9 Task 1 adds
the qualifier "within the scope of the task", Task 2 does not.

| Band | Range and flexibility | Less common / idiomatic items | Errors |
| --- | --- | --- | --- |
| 9 | T2: "Full flexibility and precise use are widely evident." · T1: "…are evident within the scope of the task." · "A wide range of vocabulary is used accurately and appropriately with very natural and sophisticated control of lexical features." | (subsumed into "sophisticated control") | "Minor errors in spelling and word formation are extremely rare and have minimal impact on communication." |
| 8 | "A wide resource is fluently and flexibly used to convey precise meanings." | "There is **skilful use** of uncommon and/or idiomatic items when appropriate, despite occasional inaccuracies in word choice and collocation." | "Occasional errors in spelling and/or word formation may occur, but have minimal impact on communication." |
| 7 | "The resource is **sufficient** to allow some flexibility and precision." | "There is **some ability** to use less common and/or idiomatic items." · "An awareness of style and collocation is evident, though inappropriacies occur." | "There are only a few errors in spelling and/or word formation, and they do not detract from overall clarity." |
| 6 | "The resource is **generally adequate** and appropriate for the task." · "The meaning is generally clear in spite of a rather restricted range or a lack of precision in word choice." | "**If the writer is a risk-taker, there will be a wider range of vocabulary used but higher degrees of inaccuracy or inappropriacy.**" | "There are some errors in spelling and/or word formation, but these do not impede communication." |
| 5 | "The resource is limited but minimally adequate for the task." · "Simple vocabulary may be used accurately but the range does not permit much variation in expression." | "There may be frequent lapses in the appropriacy of word choice, and a lack of flexibility is apparent in frequent simplifications and/or repetitions." | "Errors in spelling and/or word formation may be noticeable and may cause some difficulty for the reader." |
| 4 | "The resource is limited and inadequate for or **unrelated to the task**. Vocabulary is basic and may be used repetitively." | "**There may be inappropriate use of lexical chunks (e.g. memorised phrases, formulaic language and/or language from the input material).**" | "Inappropriate word choice and/or errors in word formation and/or in spelling may impede meaning." |

**Deltas**

| Step | What changes |
| --- | --- |
| 6→7 | Resource goes from "generally adequate" to "**sufficient to allow some flexibility and precision**". Less-common items arrive as a stated capability ("some ability to use less common and/or idiomatic items") rather than as a risk. **Awareness of style and collocation appears for the first time.** Spelling/word-formation errors go from "do not impede communication" to "do not detract from overall clarity" — a higher bar. |
| 7→8 | "Sufficient" → "**wide**"; "some flexibility and precision" → "fluently and flexibly … to convey precise meanings"; "some ability" → "**skilful use**"; and "less common" → "uncommon **and/or idiomatic** … when appropriate". Appropriacy of deployment (`when appropriate`) enters as a condition. |
| 8→9 | Range is already "wide" at 8 — **range does not separate 8 from 9**. What separates them is control: band 8 tolerates "occasional inaccuracies in word choice and collocation"; band 9 requires "used accurately and appropriately with very natural and sophisticated control of lexical features", with errors "extremely rare". |

**The band-6 "risk-taker" clause is the most teachable line in the whole grid.**
The descriptor states outright that a candidate who deploys a wider vocabulary
at higher inaccuracy is still band 6. Vocabulary *reach* is not the 6→7 lever;
*style and collocation awareness* is.

### 3.5 Grammatical Range and Accuracy

| Band | Range | Accuracy | Punctuation |
| --- | --- | --- | --- |
| 9 | "A wide range of structures is used with full flexibility and control." (T1 adds "within the scope of the task") | "Minor errors are extremely rare and have minimal impact on communication." | "Punctuation and grammar are used appropriately throughout." |
| 8 | "A wide range of structures is flexibly and accurately used." | "**The majority of sentences are error-free.**" · "Occasional, non-systematic errors and inappropriacies occur, but have minimal impact on communication." | "punctuation is well managed" |
| 7 | "A variety of complex structures is used with some flexibility and accuracy." | "**error-free sentences are frequent**" · "A few errors in grammar may persist, but these do not impede communication." | "Grammar and punctuation are generally well controlled" |
| 6 | "A mix of simple and complex sentence forms is used but flexibility is limited." | "Examples of more complex structures are not marked by the same level of accuracy as in simple structures." · "Errors in grammar and punctuation occur, but rarely impede communication" | (bundled) |
| 5 | "The range of structures is limited and rather repetitive." | "Although complex sentences are attempted, they tend to be faulty, and the greatest accuracy is achieved on simple sentences." · "Grammatical errors may be frequent and cause some difficulty for the reader." | "Punctuation may be faulty." |
| 4 | "A very limited range of structures is used." · "**Subordinate clauses are rare and simple sentences predominate.**" | "Some structures are produced accurately but grammatical errors are frequent and may impede meaning." | "Punctuation is often faulty or inadequate." |

**Deltas**

| Step | What changes |
| --- | --- |
| 6→7 | "A mix of simple and complex sentence forms … flexibility is limited" → "**a variety of complex structures … with some flexibility and accuracy**". The band-6 signature — complex structures being less accurate than simple ones — must disappear. Error-free sentences become **"frequent"**. |
| 7→8 | "Variety of complex structures" → "**wide range**"; "some flexibility and accuracy" → "flexibly and **accurately**". The measurable threshold moves from "error-free sentences are frequent" to "**the majority of sentences are error-free**". Persisting errors ("a few errors … may persist") are replaced by "occasional, **non-systematic** errors" — systematic error is what caps at 7. |
| 8→9 | "Majority error-free" → errors "extremely rare"; "flexibly and accurately used" → "**full flexibility and control**"; punctuation goes from "well managed" to "used appropriately throughout". |

The 6→7→8 ladder here is the most quantifiable thing in the entire descriptor
set: *complex structures as accurate as simple ones* → *frequent error-free
sentences* → *majority error-free sentences*. That is a checkable, teachable
progression and should drive our writing-feedback tooling.

**Tier-2 empirical anchor.** Müller & Han (2022), an IELTS Research Report,
tagged errors in scripts scored 5.5–7.5 and produced mean error rates per part
of speech. Their headline figures:

| IELTS band | 5.5 | 6.0 | 6.5 | 7.0 | 7.5 |
| --- | --- | --- | --- | --- | --- |
| Mean error rate (all 8 POS categories) | 14.8% | 10.1% | 8.3% | 6.0% | 4.9% |
| Determiners | 18.7% | 14.2% | 12.8% | 8.0% | 4.7% |
| Prepositions | 16.2% | 10.0% | 8.5% | 7.7% | 5.2% |
| Verbs | 14.7% | 10.5% | 8.8% | 6.1% | 5.0% |

In their words: "the worst rate was 3 errors per 20 words at IELTS 5.5, and the
best rate was 1 error per 20 words at IELTS 7.5." They also found improvement is
**not linear**: "there is a period of mixed regression and improvement found for
scores 6.5 and 7.0 where scores jump around unexpectedly", which they attribute
to possible "fossilization, attention deficits, and linguistic restructuring".
Determiners and prepositions are the two largest error categories throughout —
directly relevant to Vietnamese L1 learners, and to our Unit 5 (articles) and
Unit 10 (prepositions) grammar targets.

> **GAP** — these are *research* error rates from one study's sample, not
> official thresholds. IELTS publishes **no** numeric definition of "frequent"
> versus "the majority of" error-free sentences. Do not convert Müller & Han's
> percentages into band predictions in any tool we build.

---

## 4. Speaking — band ladders 4→9

The Speaking descriptors are structured differently from Writing and are
**thinner**. Stating that plainly up front:

> **GAP — Speaking is materially less well evidenced than Writing in this
> research run.** Three specific shortfalls: (a) the Pronunciation criterion has
> no independent wording at bands 3, 5 and 7 (§5.1); (b) **this document's own
> pass retrieved only one** official examiner commentary on a Speaking
> performance (Alexandra, Band 7) — the ielts.org speaking-clip commentary pages
> returned archive misses here — **but see the correction below: the knowledge
> base as a whole holds four**, and even four is not a band-by-band rationale
> comparable to §6.2 for Writing; (c) the document carries no version date
> (§1.3). Nothing in this section has been padded to match the Writing sections'
> density; the tables below are as complete as the evidence allows.

> **Correction, 2026-08-08 — the commentary count is four, not one.** This
> section originally stated flatly that only one Speaking commentary was
> retrievable. `06` §5 contradicted it, and `06` is right: **four officially
> commented Speaking performances were located across the knowledge base,
> spanning bands 5–7**, and `06` §5 quotes the decisive examiner sentence from
> each —
>
> | Candidate | Part · Band | Where it came from |
> | --- | --- | --- |
> | **Tina** (Vietnam) | Part 2 · Band 5 | ielts.org, *Speaking clips — examiner comments* |
> | **Xin** (China) | Part 3 · Band 6 | same page |
> | **Hendrik** (Germany) | Part 3 · Band 7 | same page |
> | **Alexandra** | Band 7 | IELTS Online Tutorial, "Speaking test: Examiner comments for Alexandra" — the one this document retrieved |
>
> The discrepancy is a **retrieval-time difference, not an evidential
> disagreement**: the speaking-clips page was unreachable during this document's
> pass and reachable during `06`'s. Both statements were true of their own pass;
> only this one was written as though it were true of the corpus. §6.2's Speaking
> row still contains only Alexandra, because that is the commentary *this*
> document worked from — **the other three live in `06` §5 and are cited there**,
> and any band-ceiling claim drawn from them belongs to that file.
>
> **What does not change.** Four commentaries across three bands is still not a
> ladder, still contains no band 8 or 9 (`06` §5 **GAP**), and still leaves
> Speaking materially under-evidenced relative to Writing's dozen-plus scored
> scripts. `06`'s own build gate — no Speaking rubric or feedback tool until a
> second Speaking research pass — is unaffected and remains binding
> (`09` checklist **D7**).

The descriptors carry two scoring notes: "A candidate must fully fit the
positive features of the descriptor at a particular level" and "A candidate will
be rated on their **average performance across all parts of the test**."

### 4.1 Fluency and Coherence

| Band | Keeping going | Hesitation | Coherence / discourse marking |
| --- | --- | --- | --- |
| 9 | "Fluent with only very occasional repetition or self-correction." | "Any hesitation that occurs is used **only to prepare the content of the next utterance and not to find words or grammar**." | "Speech is situationally appropriate and cohesive features are fully acceptable." · "Topic development is fully coherent and appropriately extended." |
| 8 | "Fluent with only very occasional repetition or self-correction." | "Hesitation may occasionally be used to find words or grammar, but **most will be content related**." | "Topic development is coherent, appropriate and relevant." |
| 7 | "Able to keep going and **readily produce long turns without noticeable effort**." | "Some hesitation, repetition and/or self-correction may occur, often mid-sentence and indicate problems with accessing appropriate language. **However, these will not affect coherence.**" | "Flexible use of spoken discourse markers, connectives and cohesive features." |
| 6 | "Able to keep going and demonstrates a **willingness** to produce long turns." | — | "**Coherence may be lost at times** as a result of hesitation, repetition and/or self-correction." · "Uses a range of spoken discourse markers, connectives and cohesive features **though not always appropriately**." |
| 5 | "Usually able to keep going, but relies on repetition and self-correction to do so and/or on slow speech." | "Hesitations are often associated with mid-sentence searches for fairly basic lexis and grammar." | "**Overuse** of certain discourse markers, connectives and other cohesive features." · "More complex speech usually causes disfluency but simpler language may be produced fluently." |
| 4 | "Unable to keep going without noticeable pauses." · "Speech may be slow with frequent repetition." · "Often self-corrects." | — | "Can link simple sentences but often with repetitious use of connectives." · "Some breakdowns in coherence." |

**Deltas**

| Step | What changes |
| --- | --- |
| 6→7 | The decisive line is **"these will not affect coherence"** vs "Coherence may be lost at times". Hesitation is *permitted* at 7 — it just must not break the message. Long turns go from "willingness to produce" to "readily produce … without noticeable effort". Markers go from "not always appropriately" to "**flexible** use". |
| 7→8 | The label changes to "**Fluent**". Hesitation's *cause* changes: at 7 it "indicates problems with accessing appropriate language"; at 8 "most will be content related". Topic development is named for the first time as a scored feature. |
| 8→9 | Hesitation becomes **exclusively** content-planning ("only to prepare the content … and not to find words or grammar"). Topic development goes from "coherent, appropriate and relevant" to "**fully** coherent and appropriately extended". Situational appropriacy is added. |

The 8→9 hesitation criterion is worth stressing for tool design: at the top of
the scale, IELTS is not measuring *whether* a speaker pauses but *what the pause
is for*. A speaking self-review tool that flags all pauses is measuring the
wrong thing.

### 4.2 Lexical Resource (Speaking)

| Band | Resource | Less common / idiomatic | Paraphrase |
| --- | --- | --- | --- |
| 9 | "Total flexibility and precise use in all contexts." | "Sustained use of accurate and idiomatic language." | — |
| 8 | "Wide resource, readily and flexibly used to discuss all topics and convey precise meaning." | "**Skilful use** of less common and idiomatic items despite occasional inaccuracies in word choice and collocation." | "Effective use of paraphrase as required." |
| 7 | "Resource flexibly used to discuss a variety of topics." | "**Some ability** to use less common and idiomatic items and an awareness of style and collocation is evident though inappropriacies occur." | "Effective use of paraphrase as required." |
| 6 | "Resource sufficient to discuss topics **at length**." · "Vocabulary use may be inappropriate but meaning is clear." | — | "**Generally** able to paraphrase successfully." |
| 5 | "Resource sufficient to discuss familiar and unfamiliar topics but there is limited flexibility." | — | "**Attempts** paraphrase but not always with success." |
| 4 | "Resource sufficient for familiar topics but only basic meaning can be conveyed on unfamiliar topics." · "Frequent inappropriacies and errors in word choice." | — | "**Rarely attempts** paraphrase." |

**Deltas**

| Step | What changes |
| --- | --- |
| 6→7 | Range shifts from "at length" (duration) to "a **variety of topics**" (breadth), and becomes "flexibly used". Less-common/idiomatic items and "awareness of style and collocation" appear — the same phrase that marks 6→7 in Writing LR. |
| 7→8 | "A variety of topics" → "**all** topics"; "some ability" → "**skilful use**"; the resource is now "wide" and conveys "precise meaning". |
| 8→9 | "Wide" → "**total** flexibility … in all contexts"; idiomatic use becomes "**sustained**" and "accurate", closing the band-8 tolerance for "occasional inaccuracies in word choice and collocation". |

**Paraphrase is a 4→6 ladder, not a 7→8 one.** "Rarely attempts" (4) → "attempts
… not always with success" (5) → "generally able … successfully" (6) →
"effective use as required" (7 **and** 8, identical wording). Paraphrase ability
therefore cannot distinguish a 7 from an 8.

> **Tier-2 caution.** Brown (2006), analysing candidate discourse across bands
> 5–8, found for the lexical measures "little difference between means for **all**
> of the measures" — the only criterion of the four where her discourse measures
> failed to separate adjacent bands at all. The Speaking LR ladder is the least
> empirically discriminated of the four.

### 4.3 Grammatical Range and Accuracy (Speaking)

| Band | Range | Accuracy |
| --- | --- | --- |
| 9 | — | "Structures are precise and accurate at all times, apart from '**mistakes**' characteristic of native speaker speech." |
| 8 | "Wide range of structures, flexibly used." | "**The majority of sentences are error free.**" · "Occasional inappropriacies and non-systematic errors occur. A few basic errors **may** persist." |
| 7 | "A range of structures flexibly used." · "Both simple and complex sentences are used effectively despite some errors." | "**Error-free sentences are frequent.**" · "A few basic errors persist." |
| 6 | "Produces a mix of short and complex sentence forms and a variety of structures with **limited flexibility**." | "Though errors frequently occur in complex structures, these rarely impede communication." |
| 5 | "Complex structures are attempted but these are limited in range, nearly always contain errors and may lead to the need for reformulation." | "Basic sentence forms are fairly well controlled for accuracy." |
| 4 | "Subordinate clauses are rare and, overall, turns are short, structures are repetitive and errors are frequent." | "Can produce basic sentence forms and some short utterances are error-free." |

**Deltas**

| Step | What changes |
| --- | --- |
| 6→7 | "Limited flexibility" → "**flexibly used**". Complex sentences move from a site of frequent error to being "used **effectively** despite some errors". Error-free sentences become "frequent". |
| 7→8 | Range: "a range" → "**wide** range". Accuracy: "frequent" error-free sentences → "**the majority** of sentences are error free". Basic errors go from "persist" to "**may** persist", and errors are specified as "non-systematic". |
| 8→9 | All residual error tolerance is removed: "precise and accurate **at all times**", with the sole exception of native-speaker-type slips. |

This mirrors Writing GRA almost exactly ("error-free sentences are frequent" at
7 → "the majority of sentences are error-free" at 8), which means one shared
teaching construct — *error-free sentence density* — serves both skills.

> **Tier-2 anchor.** Brown (2006) measured error-free utterance rates and
> utterance complexity across bands 5–8. Her finding cuts against the intuitive
> reading of the descriptors: for complexity measures (utterance length, clauses
> per utterance) "the differences were **not significant**", and "Band 8
> utterances were on average **less** complex than those of Band 7". For accuracy
> measures, by contrast, "the greatest difference lay between Bands 7 and 8, with
> Bands 5 and 6 being very similar." Her summary map places the substantial
> complexity break at 5 vs 6–8, and the substantial accuracy break at 7 vs 8.
> **Implication:** above band 6, adding grammatical complexity buys little;
> removing error buys the band.

---

## 5. Pronunciation — the criterion that maps onto our phonology strand

### 5.1 Structural fact: only even bands are specified

The Speaking Pronunciation column has **substantive wording only at bands 9, 8,
6, 4, 2 and 1**. The odd bands are defined purely by reference:

- Band 7: "Displays all the positive features of band 6, and some, but not all, of the positive features of band 8."
- Band 5: "Displays all the positive features of band 4, and some, but not all, of the positive features of band 6."
- Band 3: "Displays some features of band 2, and some, but not all, of the positive features of band 4."

> **GAP** — there is **no independent band-7 Pronunciation descriptor**. Any
> "band 7 pronunciation checklist" is necessarily a construction, not a quotation.
> Our tools must present band 7 as "all of the band-6 list, plus part of the
> band-8 list", and must not invent band-7 criteria.

This structure is a residue of the pre-2008 scale, which had only four
Pronunciation bands; the 2008 revision "expanded the four bands to nine bands, in
line with the three other analytic scales" (Yates, Zielinski & Pryor, IELTS
Research Report).

### 5.2 The feature-by-band map

Built from the five key indicators (§2.1) crossed with the specified bands.

| Feature | Band 4 | Band 6 | Band 8 | Band 9 |
| --- | --- | --- | --- | --- |
| **Chunking** (dividing speech into meaningful units) | "Produces some acceptable chunking, but there are frequent lapses in overall rhythm." | "Chunking is generally appropriate…" | (subsumed) "Flexible use of stress and intonation across long utterances" | "Flexible use of features of connected speech is sustained throughout." |
| **Rhythm / stress-timing / linking** | "frequent lapses in overall rhythm" | "…but rhythm may be affected by a **lack of stress-timing** and/or a rapid speech rate." | "**Can sustain appropriate rhythm.**" | "Uses a **full range** of phonological features" |
| **Stress and intonation for meaning** | "Attempts to use intonation and stress, but control is limited." | "Some effective use of intonation and stress, but **this is not sustained**." | "Flexible use of stress and intonation **across long utterances**, despite occasional lapses." | "…to convey **precise and/or subtle** meaning." |
| **Segmentals (words / phonemes)** | "Individual words or phonemes are **frequently** mispronounced, causing lack of clarity." | "Individual words or phonemes may be mispronounced but this causes only **occasional** lack of clarity." | (not separately mentioned) | (not separately mentioned) |
| **Overall range/control** | "Uses some acceptable phonological features, but the range is limited." | "Uses a range of phonological features, but **control is variable**." | "Uses a **wide range** of phonological features" | "Uses a **full range** of phonological features" |
| **Intelligibility / listener effort** | "Understanding requires some effort and there may be patches of speech that cannot be understood." | "Can generally be understood throughout **without much effort**." | "Can be **easily** understood throughout." | "Can be **effortlessly** understood throughout." |
| **Accent** | (not mentioned) | (not mentioned) | "Accent has **minimal** effect on intelligibility." | "Accent has **no** effect on intelligibility." |

**Deltas**

| Step | What changes |
| --- | --- |
| 4→6 | Segmental accuracy is the lever: mispronunciation goes from "frequently … causing lack of clarity" to "may be mispronounced … only occasional lack of clarity". Chunking becomes "generally appropriate". The listener stops having to work ("requires some effort" → "without much effort"). |
| 6→8 | **Suprasegmentals are the lever.** Rhythm goes from disrupted by lack of stress-timing to "can sustain appropriate rhythm"; stress and intonation go from "not sustained" to "flexible use across long utterances". Control goes from "variable" to a "wide range". Segmentals drop out of the descriptor entirely — by band 8 they are assumed. |
| 8→9 | Range "wide" → "full"; connected speech becomes "sustained throughout"; the meaning conveyed becomes "precise and/or subtle"; accent effect goes from "minimal" to "none". |

**This is directly exploitable by our syllabus.** The U1–U12 phonology strand
runs vowel/consonant contrasts (U1–U8) → word stress (U9) → stress in
statements/questions (U11) → intonation in lists (U12). That is precisely the
4→6 lever followed by the 6→8 lever, in order. The mapping is not approximate:
segmental contrasts are what the band-4→6 descriptors talk about, and word
stress / sentence stress / intonation are what the band-6→8 descriptors talk
about. Phase 5 should treat this as the single strongest existing alignment in
the course.

**Tier-2 evidence on how examiners actually use this scale.** Yates, Zielinski &
Pryor surveyed 27 IELTS examiners on the revised Pronunciation scale. Confidence
ratings (1–5) were highest for the *global* features — intelligibility (M =
4.19), listener effort (M = 4.07), accent (M = 3.96) — and lower for the
*concrete* features: rhythm (M = 3.52), sentence stress and intonation (M =
3.67), chunking and word stress (M = 3.74), sounds (M = 3.78). Asked which
features were most important when awarding a Pronunciation score, 85.2% named
intelligibility and 70.4% named listener effort; chunking was next at 48.1%,
word stress 33.3%, intonation 25.9%, accent last at 7.4%.

Two consequences for us. First, **intelligibility is the operative construct**;
the concrete phonological features are the means, not the end. Second, Brown
(2003) reported that examiners "identified … a lack of clear distinction between
levels" and that "there were concerns that the Pronunciation scale did not
adequately differentiate levels of proficiency" — so we should be honest in our
own materials that Pronunciation band claims are the least reliable of the four.

---

## 6. Examiner rationale — what the annotated scripts actually say

### 6.1 The bolding instruction, and what it reveals

Every page of the **[2023]** Writing descriptors carries this instruction:

> "A script must fully fit the positive features of the descriptor at a
> particular level. **Bolded text indicates negative features that will limit a
> rating.**"

Because the descriptor PDF's bold markup is machine-readable, the complete
inventory of bolded (rating-limiting) text can be extracted. The result is
striking:

| Band | Bolded text in Task 1 grid | Bolded text in Task 2 grid |
| --- | --- | --- |
| 9 | *none* | *none* |
| 8 | *none* | *none* |
| 7 | *none* | *none* |
| 6 | **none** | **none** |
| 5 | "There may be no data to support the description." (TA) | "incompletely addressed" (TR) · "Paragraphing may be inadequate or missing." (CC) |
| 4 | "(General Training) Not all bullet points are presented." · "The tone may be inappropriate." · "The format may be inappropriate." · "unrelated to the task" (LR) · "Subordinate clauses are rare and simple sentences predominate." (GRA) | "The format may be inappropriate." · "unrelated to the task" (LR) · "Subordinate clauses are rare and simple sentences predominate." (GRA) |
| 3 | "Length may be insufficient to provide evidence of control of sentence forms." | same |
| 2 | "the entire response may be off-topic" | same |
| 1 | "Responses of 20 words or fewer are rated at Band 1." (all four columns) · "The content is wholly unrelated to the task." | same, plus "…unrelated to the prompt" |
| 0 | "where there is proof that a candidate's answer has been totally memorised" | same |

**Finding: no text at bands 6, 7, 8 or 9 is bolded.** The rating-limiting
mechanism the descriptors define does not operate above band 5. Any prep claim
of the form "X is bolded in the descriptors, therefore it caps you at 6" is
false on its face. Band ceilings at 6.5/7/7.5 are produced by *failure to meet
positive features of the next band*, not by triggering a marked negative.

### 6.2 Examiner comments on scored scripts

All from Tier-1 ielts.org publications: the Academic Writing sample tasks with
band scores and examiner comments (2023 edition), and the sample candidate
responses booklet.

| Band | What the examiner credited | What the examiner said limited it |
| --- | --- | --- |
| **Task 1, 8.5** | "This response fully satisfies the requirements of the task." · "seamless cohesion" · "Paragraphing, linking and referencing are all skilfully managed." · "A wide range of vocabulary and structures are used with full flexibility and accuracy within the scope of this task." | "There is an overview in the first paragraph indicating that there are 'seven consecutive steps' **however for the highest score, a fuller overview would be needed, to summarise those key stages**, for example; extracting the clay, then shaping, drying and delivering the bricks." |
| **Task 1, 7** | "**A wide range of sophisticated lexis** is used to convey meaning with precision" · "A wide range of structures is also used fluently with only occasional slight error and **the majority of sentences are error-free**." | "This test taker uses an **inappropriate format** at times (e.g. the letter-style opening and personal comments) and this limits the band for Task Achievement." · "there is **no clear overview**" · "**paragraphing would have helped**" · "**In spite of the high level of language proficiency, the flaws in format and organisation limit the rating for this response to Band 7.**" |
| **Task 1, 6** | "The key features which are selected are covered and clearly highlighted" · "There is a relevant overview in the final paragraph" | "reporting is somewhat **mechanical** and data is provided to support only some of the descriptions" · "there is **not a wide enough variety of structures** to achieve a higher band" |
| **Task 1, 5** | "the basic process is accurately described" | "this script **fails to present an overview**" · "there is **effective, though mechanical, use of linkers and sequencers**" |
| **Task 2, 8.5** | "The topic is very well addressed and **explored in depth**." · "The answer can be read with ease due to the **sophisticated handling of cohesive devices**" · "a wide and very natural range of vocabulary with full flexibility" · "many examples of appropriate **modification, collocation and precise vocabulary choice**" | "some over-generalisation in the penultimate paragraph" · "only minimal lapses (for example, the use of 'e.g.')" |
| **Task 2, 7.5** | "presents a clear position throughout" · "Ideas are relevant, well extended and supported" · "A wide range of vocabulary is used flexibly" · "a good range of sentence structures is used with a high level of accuracy resulting in **frequent error-free sentences**" | "some **under-use** of connectives and substitution and some lapses in the use of referencing" · "**Minor systematic errors persist**, however, and punctuation is unhelpful at times." |
| **Task 2, 7.5** (second script) | "evidence of **higher-level features, such as 'softening'**, e.g. 'They tend to', 'This appears to be', and 'might disagree'" | "some **overuse of sequencers** in paragraph 2 [Firstly \| So \| Also \| Yet]" · "Paragraphing … could perhaps be used more appropriately by breaking down paragraphs 2 and 3" |
| **Task 2, 6.5** | "The arguments in this response are generally well developed, ideas are appropriate and there is a clear position." · "the test taker can evidently incorporate less common/idiomatic phrases into the argument" | "the first paragraph, and beginning of the second are **mainly copied from the rubric**" · "**The repetition of language from the rubric, while integrated, reveals a lack of ability to paraphrase.**" · "**the weaknesses in organisation and grammatical control limit the rating to Band 6.5**" |
| **Task 2, 5.5** | "The topic is addressed and a relevant position is expressed" · "ideas are clearly organised and there is an overall progression" | "**The first five lines of this response are directly copied rubric; no credit is given for copied rubric.**" · "some **mechanical use of linkers** in places" · "control is weak and there are frequent spelling errors … **thus keeping the rating down for the lexical criterion**" · "**flaws in the paragraphing and the errors in vocabulary limit this rating to Band 5.5**" |
| **Task 2, 5.5** (second script) | "A clear position is presented from the outset, supported by relevant ideas." | "this response **does not meet the minimum word count for Task 2 of 250 words**, so there is room for further development" · "**the level of error is too high** to achieve a higher band score" |
| **Task 2, 4** | (topic-related) | "Language from the input material is used inappropriately and frequent errors in word choice and collocation cause severe problems for the reader." |
| **Speaking, 7** (Alexandra) | "uses a wide range, including some less common, idiomatic and colloquial items (lose your privacy; selling their soul to the devil; getting dumped)" · "There is some hesitation, but it is **mainly content-related** … Coherence is not affected by these slight pauses." · "Stress and intonation are used well to enhance meaning" | "noticeable errors in areas such as articles, prepositions, subject/verb agreement and verb tense" · "She has a tendency to use **syllable-timing, which prevents her sustaining appropriate rhythm over longer utterances**." · "**This test taker only just achieves Band 7, owing to a weaker performance in grammar.**" |

---

## 7. Band-ceiling behaviours

The highest-value section of this document. Each item is a behaviour that
demonstrably holds a response below a band it otherwise reaches, tied to a
descriptor phrase or examiner sentence. Ordered by severity.

| # | Behaviour | Ceiling | Evidence |
| --- | --- | --- | --- |
| 1 | **A totally memorised answer** | **Band 0** | Writing descriptors, band 0: "Should only be used where a candidate did not attend or attempt the question in any way, used a language other than English throughout, **or where there is proof that a candidate's answer has been totally memorised**." Memorisation sits in the same category as non-attendance. |
| 2 | **Memorised phrases, formulaic language, or language lifted from the input material used inappropriately** | **Band 4** (LR) | Writing descriptors, band 4 LR: "There may be inappropriate use of lexical chunks (e.g. memorised phrases, formulaic language and/or language from the input material)." Band 3 LR: "Possible over-dependence on input material or memorised language." Confirmed by examiner comment on a Band 4 script: "Language from the input material is used inappropriately." **Memorised language is a band-4-and-below feature, not a soft penalty at 6–7.** |
| 3 | **Copied rubric** | **earns zero credit; must be discounted** | Writing descriptors, band 1 Task Achievement: "**Any copied rubric must be discounted.**" Examiner, Band 5.5 script: "The first five lines of this response are directly copied rubric; **no credit is given for copied rubric**." |
| 4 | **Rubric repetition that reveals inability to paraphrase** | contributed to a **6.5** | Examiner, Band 6.5: "The repetition of language from the rubric, while integrated, reveals a lack of ability to paraphrase." (The examiner named organisation and grammatical control as the *stated* limiters — see §8, R10.) |
| 5 | **Sophisticated language with format/organisation flaws** | **Band 7**, despite band-8-level language | Examiner, Task 1 Band 7: the script is credited with "a wide range of sophisticated lexis", "a wide range of structures … used fluently", and "the majority of sentences are error-free" — all band-8 descriptor language — yet: "**In spite of the high level of language proficiency, the flaws in format and organisation limit the rating for this response to Band 7.**" This is the single clearest demonstration that lexis and grammar cannot buy a band on their own. |
| 6 | **Task 1 overview that signals structure without summarising it** | **8.5, not 9** | Examiner, Band 8.5: "There is an overview in the first paragraph indicating that there are 'seven consecutive steps' however **for the highest score, a fuller overview would be needed, to summarise those key stages**." |
| 7 | **No overview at all (Academic Task 1)** | **Band 5** territory | Descriptors band 5 TA: "The recounting of detail is mainly mechanical." Examiner, Band 5: "this script **fails to present an overview** and some of the key features are not adequately covered." Band 6 requires only that "a relevant overview is **attempted**". |
| 8 | **Mechanical description instead of comparison (Task 1)** | **6 or below** | Key assessment criteria define the target as "comparing or contrasting the information by adequately highlighting the identifiable trends, principal changes or differences … **rather than mechanical description reporting detail**". Examiner, Band 6: "reporting is somewhat mechanical". |
| 9 | **Speculating beyond the data (Task 1)** | off-task | Key assessment criteria: Task 1 "relates narrowly to the factual content of a diagram, graph, table, chart, map or other visual input, **not to speculative explanations that lie outside the given data**." |
| 10 | **Mechanical or misused cohesion between sentences** | **Band 6** (CC) | Descriptors band 6 CC: "cohesion within and/or between sentences may be faulty or mechanical **due to misuse, overuse or omission**". Band 7 requires devices "used **flexibly**". Examiner, Band 5: "effective, though mechanical, use of linkers and sequencers". **Nuance:** this is diagnostic of band 6, not a marked negative (§6.1), and *overuse alone is survivable at 7.5* — a Band 7.5 script was noted for "some overuse of sequencers in paragraph 2 [Firstly \| So \| Also \| Yet]". |
| 11 | **Illogical or inadequate paragraphing** | named limiter at **5.5** and **6.5** | Examiner, Band 5.5: "flaws in the paragraphing and the errors in vocabulary limit this rating to Band 5.5." Examiner, Band 6.5: "Better use of paragraphing would have allowed a clearer focus to some of the supporting points." Descriptors band 6 CC (T2): "Paragraphing may not always be logical and/or the central topic may not always be clear." |
| 12 | **Systematic (as opposed to occasional) grammatical error** | **7.5** | Examiner, Band 7.5: "**Minor systematic errors persist**, however, and punctuation is unhelpful at times." Descriptors band 8 GRA require errors to be "occasional, **non-systematic**". Systematicity, not frequency, is the 7→8 barrier. |
| 13 | **Reaching for a wider vocabulary at the cost of accuracy** | **Band 6** (LR) | Descriptors band 6 LR: "**If the writer is a risk-taker, there will be a wider range of vocabulary used but higher degrees of inaccuracy or inappropriacy.**" The descriptor explicitly places the ambitious-but-inaccurate writer at 6. |
| 14 | **Complex structures less accurate than simple ones** | **Band 6** (GRA) | Descriptors band 6 GRA: "Examples of more complex structures are not marked by the same level of accuracy as in simple structures." Band 5: "the greatest accuracy is achieved on simple sentences." |
| 15 | **Under-length** | limits development; ≤20 words = **Band 1** | Task 2 minimum is 250 words, Task 1 is 150. Examiner, Band 5.5: "this response does not meet the minimum word count for Task 2 of 250 words, so there is room for further development." Descriptors band 3 LR: "The resource is inadequate (which may be due to the response being **significantly underlength**)." Band 1, all four columns: "Responses of 20 words or fewer are rated at Band 1." |
| 16 | **Bullet points or note form anywhere in the response** | script "may be penalised" | Key assessment criteria: "scripts may be penalised if they are a) partly or wholly plagiarised, b) **not written as full, connected text (e.g. using bullet points in any part of the response, or note form, is not appropriate)**." |
| 17 | **Plagiarism, partial or whole** | script "may be penalised" | Same sentence as above. |
| 18 | **Syllable-timed rhythm (Speaking)** | named limiter at **Band 7** | Examiner, Alexandra Band 7: "She has a tendency to use syllable-timing, **which prevents her sustaining appropriate rhythm over longer utterances**." Band 8 Pronunciation requires "Can sustain appropriate rhythm"; band 6 concedes "rhythm may be affected by a lack of stress-timing". **No L1 typology is claimed here** — see the note below. |
| 19 | **Hesitation to retrieve language rather than to plan content (Speaking)** | **Band 8 ceiling** | Band 9 FC: "Any hesitation that occurs is used **only** to prepare the content of the next utterance and **not to find words or grammar**." Band 8: "Hesitation may occasionally be used to find words or grammar, but most will be content related." |
| 20 | **Coherence breaking down under hesitation (Speaking)** | **Band 6 ceiling** | Band 6 FC: "**Coherence may be lost at times** as a result of hesitation, repetition and/or self-correction." Band 7: "these will not affect coherence." |
| 21 | **Memorised utterances in Speaking** | discounted as evidence | Band 3 GRA: "grammatical errors are numerous **except in apparently memorised utterances**." Band 1 GRA: "**No rateable language unless memorised.**" Memorised strings are explicitly excluded from what counts as rateable language. |

> **Note on item 18 — an unsourced L1 claim, removed 2026-08-08.** This row
> previously ended "Highly relevant to Vietnamese L1, a syllable-timed
> language." **That parenthetical had no phonology source behind it and has been
> deleted.** It is not supportable from the Vietnamese-L1 phonology evidence
> since assembled in `07` §5.5, and one branch of that evidence contests it
> outright:
>
> - `07` §5.5.4 records a standing **GAP**: **no rhythm-metric characterisation
>   of Vietnamese-accented English exists** in that evidence base. Grabe & Low
>   (2002), the standard rhythm-class study, was retrieved in full and **does not
>   include Vietnamese**. The only rhythm-metric study of Vietnamese itself uses
>   four speakers per language and describes Vietnamese as a language "which is
>   *claimed to* cluster with syllable-timed languages" — the hedge is that
>   author's. `07`'s instruction is explicit: "**Do not state that Vietnamese is
>   syllable-timed and English is stress-timed as an established premise for a
>   rhythm lesson.**"
> - The related word-stress premise is **contested at the root**: Brunelle
>   (2017), *JIPA* 47(3), N = 18 Southern Vietnamese speakers, concludes "there
>   is little evidence for word stress in Southern Vietnamese and … reports of
>   final stress can be reinterpreted as phrase-final lengthening" (`07`
>   §5.5.4). Marker inherited from `07` unchanged: **[S]** — quoted from a
>   primary document in the research cache, **not** panel-verified. This
>   document does not pick a side on that dispute.
> - What *is* sourced about Vietnamese prosodic transfer is narrower and
>   different: Vietnamese learners **fail to deaccent**, because in a lexical
>   tone language "every syllable is specified for a tone and there was neither
>   toneless syllable nor tonal reduction" (Nguyễn & Đào 2018, N = 30, all
>   Southern learners; `07` §5.5.4) **[S]**. That is a finding about accent
>   placement and final tunes, not a rhythm-class label, and it must not be
>   restated as one.
>
> **The descriptor claim in item 18 is untouched and stands on its own
> evidence:** syllable-timing is named by an examiner as what prevented a Band 7
> candidate sustaining rhythm, and the band-6/8 descriptor wording brackets it.
> Note also that the examiner corpus supplies **no Vietnamese instance** of this
> limiter: `06` §5 records syllable-timing as a rhythm limiter in two of its four
> commentaries, and those two candidates are **Xin (China)** and **Alexandra**
> (whose L1 is not stated in the source). The one Vietnamese candidate in the
> corpus, Tina, was limited by grammar and pronunciation problems, not by rhythm.

### 7.1 The pattern

Items 1–4 and 21 form one family: **anything the candidate did not generate in
the room earns nothing**, and depending on quantity moves the script to band 4,
band 1, or band 0. Items 5–11 form a second: **discourse-level failures cap
scripts whose sentence-level language is already at band 8**. Items 12–14 form a
third: **the 6→8 climb is about removing systematicity from error, not about
adding ambition.**

For a project teaching grade-8 learners, the operational reading is that
template-and-memorise strategies are not merely low-yield — they are the
explicitly penalised category — while the discourse skills (overview, position,
paragraph topic, progression) are the ones that gate the top of the scale even
for strong language users.

---

## 8. What this research did *not* establish

Fourteen of twenty-five adversarially verified claims did not survive
verification in this research run. **"Not established by this research" is not
the same as "false"**, and in several cases the negation is equally unsupported.
The dominant cause was the version collision documented in §1: verifiers
checking a claim quoting **[2013]** against the **[2023]** PDF, or vice versa.

| # | Claim not sustained | Adjudication after reading the primary documents directly |
| --- | --- | --- |
| R1 | Mechanical/overused linkers are **printed in bold** at band 6 CC | **Refutation upheld, and now proved.** Extraction of the [2023] PDF's own bold markup shows zero bolded text at bands 6–9 (§6.1). The substantive part of the claim — that band 6 names mechanical cohesion and band 7 requires flexible use — is true; the bolding part is false. |
| R2 | TR 6/7 delta is coverage depth; ≤20 words = band 1 on every criterion | **Split.** The 20-word rule is verbatim in [2023] and is used above (§7 item 15). The 6/7 characterisation mixes [2013] and [2023] wording. |
| R3 | TR 6/7 boundary is *not* about covering all parts; both bands say "addresses all parts of the task" | **Version collision.** True of **[2013]**. False of **[2023]**, which says "The main parts of the prompt are addressed" (6) and "appropriately addressed" (7). |
| R4 | Lexical Resource wording is **identical** across Task 1 and Task 2 at every band | **Version collision.** True of **[2013]**. False of **[2023]**, where Task 1 adds "within the scope of the task" at bands 8–9. |
| R5 | GRA wording is identical across Task 1 and Task 2 | Same as R4 — [2023] Task 1 adds "within the scope of the task". |
| R6 | Task 1 uses "Task achievement", overview mandatory from band 6, memorised = band 0 | **Split.** The criterion name and the band-0 memorisation rule are confirmed in **both** versions and are used above. The quoted overview wording is [2013]. |
| R7 | Speaking Pronunciation is defined by exactly **five** key indicators | **Refutation appears to be a verification failure.** The primary text of `ielts-speaking-key-assessment-criteria.pdf`, read directly for this document, lists exactly five bullets under "Key indicators of pronunciation" (§2.1). Treated here as established, sourced to the document rather than to the digest. |
| R8 | Speaking fluency = speech rate + speech continuity only | **Same.** The document lists exactly two "Key indicators of fluency". The claim's framing is nonetheless imprecise: the *criterion* is Fluency **and Coherence**, and coherence has four further indicators. |
| R9 | Paraphrase is an official LR indicator, graded by whether hesitation is noticeable, and this drives the 6/7 split | **Split.** The indicator exists verbatim ("with or without noticeable hesitation"). The claimed *mechanism* is **not established**: the Speaking descriptors mention hesitation nowhere in their paraphrase wording, and bands 7 and 8 carry the identical phrase "Effective use of paraphrase as required" (§4.2). |
| R10 | Inability to paraphrase is an explicitly stated ceiling behaviour capping a script at 6.5 | **Overstated.** The examiner text exists — "The repetition of language from the rubric … reveals a lack of ability to paraphrase" — but the same comment names the limiters as "the weaknesses in **organisation and grammatical control**". Paraphrase failure is *observed*, not *named as the cap*. Listed at §7 item 4 with that caveat. |
| R11 | Examiners apply an explicit "weakest criterion caps the score" rule, evidenced across three Speaking scripts | **Not established, and re-checked 2026-08-08 against all four commentaries** (§4 correction). Alexandra says "**only just** achieves Band 7, owing to a weaker performance in grammar"; Tina's rating is "restrict[ed] … to Band 5" by "grammatical limitations and pronunciation problems" (`06` §5). Both are profile effects reported on a rating, not a stated capping rule; Xin's and Hendrik's comments state no cap at all. **No official statement of criterion-combination arithmetic was found in any of the four**, and `01` §7.4 records that even the equal-weighting claim for Speaking is unverified **[?]**. The adjudication is unchanged: neither the claim nor its negation is asserted. |
| R12 | Mechanical formulaic linkers are named by examiners as a **Band 5** feature | **Not established as stated.** A Writing examiner does say "effective, though mechanical, use of linkers and sequencers" of a Band 5 script, but a Band 7.5 script survives "some overuse of sequencers". Mechanical linking correlates with low bands; it is not a stated Band 5 marker. |
| R13 | The graded Pronunciation distinguishers across examiner commentary are sound formation, syllable-timing, and listener effect, from Band 5 to Band 9 | **Partly verifiable.** The Band 7 syllable-timing observation is verbatim in the Alexandra commentary and is used at §7 item 18. The Band 5, 8 and 9 commentary could not be retrieved. |
| R14 | The 8.5→9 Fluency delta is the **cause** of hesitation | **Sourcing failed, substance holds.** The examiner page was unavailable, but the descriptors themselves state it: band 9 "Any hesitation … used only to prepare the content … and not to find words or grammar" vs band 8 "most will be content related". Used at §7 item 19, sourced to the descriptors. |

---

## 9. Remaining gaps

Consolidated list of everything the Phase 2 brief asks for that this research
did not deliver.

> **GAP — British Council descriptor version.** The BC-hosted Writing
> descriptors PDF returned HTTP `Access Denied`. We cannot confirm which version
> the British Council publishes, or exclude a third variant.

> **GAP — Speaking descriptor version and date.** No revision date on the
> document. Cannot state whether Speaking was revised in May 2023 with Writing.

> **GAP — Speaking band-by-band examiner rationale.** **Four** commentaries exist
> across the knowledge base, at bands 5, 6, 7 and 7 (§4 correction; quoted in
> `06` §5). One of them — Alexandra — was retrieved by *this* pass and is the
> only one in §6.2; the ielts.org speaking-clips pages were unavailable here and
> reachable during `06`'s pass. Four commentaries across three bands is still not
> a band-by-band ladder, and **no band 8 or 9 Speaking commentary exists in the
> corpus at all** (`06` §5 **GAP**). Re-attempt before building any Speaking
> feedback tool.

> **GAP — Pronunciation bands 3, 5, 7.** No independent descriptor wording
> exists. A band-7 pronunciation target can only be expressed as "all of band 6
> plus part of band 8".

> **GAP — Cambridge IELTS 1–19 examiner-commented scripts.** The plan lists
> these as Tier 2 evidence. None were obtained; only ielts.org's own sample
> scripts were used. This limits §6.2 to roughly a dozen scripts, none at bands
> 1–3 and none General Training.

> **GAP — General Training Task 1.** The (GT) descriptor clauses on letter
> purpose, bullet-point coverage and tone are quoted above but are **not
> illustrated by any examiner-commented GT script**. If we ever target GT, this
> needs its own pass.

> **GAP — criterion-to-band arithmetic.** No official statement was found on how
> four criterion scores combine into a reported Writing or Speaking band, how
> "Task 2 carries more weight" is operationalised numerically, or how half bands
> are derived. Examiner comments freely report 5.5 / 6.5 / 7.5 / 8.5 while the
> public descriptors define whole bands only. **This belongs to Phase 1
> (`01-exam-structure.md`) and must be resolved there before any tool reports a
> band estimate.**

> **GAP — no half-band descriptors exist.** Any tool that outputs "Band 6.5"
> is interpolating between two descriptor levels with no published basis for the
> interpolation.

> **GAP — quantification of "frequent" vs "the majority".** IELTS publishes no
> numeric threshold for error-free sentence density. Müller & Han's error rates
> (§3.5) are research findings from one L1-mixed sample across bands 5.5–7.5 and
> must not be presented as band criteria.

> **GAP — Listening and Reading.** Out of scope for Phase 2 by design; those
> skills have no band descriptors, only raw-score conversion. Phase 1 and
> Phase 3 cover them.

---

## 10. Build rules this document imposes

Carried forward to `09-design-principles.md`.

1. **Every rubric line traces to a quoted descriptor phrase**, with the version
   string `IELTS Writing Band Descriptors, updated May 2023` or
   `IELTS Speaking Band Descriptors, retrieved 2026-08-08`. These are the exact
   literals — the `IELTS`-prefixed forms, matching §1.3 rule 1 — so that one grep
   finds every rubric line in the repo. *(Corrected 2026-08-08: this rule
   previously printed the unprefixed `Writing Band Descriptors, updated May
   2023`, contradicting §1.3 rule 1 and forcing `09` §0.3 to adjudicate between
   two literals. There is one string per skill, not two.)*
2. **No band predictions.** We have no criterion-combination arithmetic and no
   half-band descriptors. Tools report *criterion-level observations*
   ("complex structures are less accurate than your simple ones — that is the
   band-6 signature"), never a number.
3. **Never train template or memorised language.** It is the explicitly
   penalised category (§7 items 1–4, 21), not a shortcut.
4. **Error metrics measure density and communicative effect**, per the official
   LR and GRA definitions — never raw counts.
5. **Error-free sentence density is the shared spine** of Writing GRA and
   Speaking GRA at the 6→7→8 steps, and is directly measurable. Build for it.
6. **The phonology strand is already band-aligned.** Segmentals train the 4→6
   pronunciation step; word stress, sentence stress and intonation train the
   6→8 step. Keep that order and say so in the lessons.
7. **Discourse-level skills gate the top.** Overview, position, paragraph topic
   sentence, and progression cap even band-8 language users. The 80–100w
   paragraph genre and the balanced-argument-then-position move already in the
   syllabus are the right vehicles; they need to be named as such.
8. **Cite the version, always.** Any claim in this repo that contradicts a prep
   source should first be checked against §1.2 before being treated as a
   disagreement of substance.

---

## Sources

### Tier 1 — binding (official IELTS/partner publications)

- **IELTS Writing Band Descriptors, updated May 2023** — `https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf`. Task 1 and Task 2 grids, bands 0–9, four criteria each. The binding source for §3 and §6.1. PDF metadata: created 2023-05-03, modified 2023-10-18.
- **Writing Task 1 & Task 2 Band Descriptors (public version)** — `https://assets.ctfassets.net/unrdeg6se4ke/19SJoSvnUYjrHgVhWvuMnC/42f1b0cb0d7709646a1392d8418646d0/writingbanddescriptorstask1and2.pdf`. **Superseded.** PDF metadata: modified 2013-06-13. Retained here only to document the wording differences in §1.2.
- **IELTS Speaking Band Descriptors** — `https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf`. Bands 0–9, four criteria. No revision date on the document. Source for §4 and §5.
- **IELTS Writing Key Assessment Criteria** — `https://ielts.org/cdn/Guides/ielts-writing-key-assessment-criteria.pdf`. Criterion definitions, sub-feature lists, task weighting, penalty statement. PDF created 2023-05-03.
- **IELTS Speaking Key Assessment Criteria** — `https://ielts.org/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf`. Key indicators for all four Speaking criteria. PDF created 2023-05-03.
- **IELTS Academic Writing sample tasks with band scores and examiner comments (2023)** — `https://ielts.org/cdn/Sample-tests/ielts-academic-writing-sample-tasks-2023.pdf`. Twelve scored scripts, bands 4–8.5. Primary source for §6.2 and most of §7.
- **Sample Candidate Writing Responses and Examiner Comments** — `https://ielts.org/cdn/computer-delivered-sample-tests-academic-writing/ielts-academic-writing-example-responses-to-parts-1-and-2-with-band-scores-and-examiner-comments.pdf`. Four scored scripts, bands 4–7.5.
- **Speaking test: Examiner comments for Alexandra (Band 7)** — ielts.org "Four skills → Speaking" module, page 9 of 12. The only Speaking examiner commentary retrievable in this run.
- *Not retrieved **in this pass**:* `takeielts.britishcouncil.org/sites/default/files/ielts_writing_band_descriptors.pdf` (HTTP Access Denied — this is the URL `09` checklist **A7** bans; `05` and `07` have been repointed to the ielts.org copy above); `ielts.org/for-organisations/speaking-clips-examiner-comments` pages for candidates other than Alexandra — **`06` §5 did retrieve that page and quotes three further commentaries from it** (Tina, Xin, Hendrik), so it is a per-pass retrieval failure here rather than a missing source. See the §4 correction.

### Tier 2 — evidence (IELTS Research Reports)

- **Müller, A. & Han, W. (2022).** *IELTS Writing band scores 5.5–7.5: Grammatical error rates, stakeholder perceptions, and risk.* IELTS Research Reports Online Series No. 1/22. — Source of the error-rate table in §3.5.
- **Brown, A. (2006).** *Candidate discourse in the revised IELTS Speaking Test.* IELTS Research Reports Vol. 6. — Discourse measures across bands 5–8; the finding that complexity does not separate bands 6–8 while accuracy separates 7 from 8 (§4.3).
- **Brown, A. (2006).** *An examination of the rating process in the revised IELTS Speaking Test.* IELTS Research Reports Vol. 6. — Examiner interpretation of the scales; reported difficulty with Fluency & Coherence and concerns that Pronunciation "did not adequately differentiate levels" (§5.2).
- **Yates, L., Zielinski, B. & Pryor, E.** *The assessment of pronunciation and the new IELTS Pronunciation scale.* IELTS Research Reports Vol. 12. — Examiner confidence and importance rankings for pronunciation features; the 2008 four-band → nine-band expansion (§5).
- **Riazi, A. M. & Knox, J. S. (2013).** *An investigation of the relations between test-takers' first language and the discourse of written performance on the IELTS Academic Writing Test, Task 2.* IELTS Research Reports Online Series No. 2/13. — Finds higher-band scripts (6, 7) "more complex … than cohesive", and text length, reading ease and word frequency as L1-independent band indicators.
- **Seedhouse, P. & Egbert, M. (2006).** *The interactional organisation of the IELTS Speaking Test.* IELTS Research Reports Vol. 6. — Consulted; concerns turn-taking, sequence and repair rather than band criteria, and contributed no descriptor claims here.

### Tier 3

None used. No prep-industry source contributed a claim to this document.

### Method note

The two Writing descriptor PDFs were text-extracted and diffed directly, and the
[2023] PDF's bold markup was extracted structurally (poppler XML) to produce the
inventory in §6.1 — the descriptors' own bolding convention cannot be recovered
from plain-text extraction, which is why prep sources routinely mis-report it.
Version dating in §1.1 comes from embedded PDF XMP metadata, not from
publication pages.
