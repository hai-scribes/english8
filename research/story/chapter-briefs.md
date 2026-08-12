# The Calling Lamp — the twelve chapter briefs

The **frozen interface** for the rewrite. `story-bible.md` is the foundation;
this file is what a drafter is actually handed. Every chapter is written against
its brief here, and nothing in a brief may be renegotiated by the drafter — if a
brief cannot be satisfied without damaging curriculum, the drafter stops and says
so rather than inventing around it.

Companion documents: `story-bible.md` (world, cast, rule, arc) and
`doraemon-craft.md` (why those are the right shapes).

---

## 0. The correction this file makes to the bible

`story-bible.md` §7 assigns **Lesson 4's content block** to the story ("the
lighting, ~200 w"). **That is wrong and is superseded here.**

`tools/check_coverage.py` shows Lesson 4 carries two prescribed halves: the
book's **Everyday English function** and its **named content block** — Unit 1's
"Teens' leisure activities around the world" (Japan · Switzerland · Viet Nam),
Unit 5's "The Japanese lion dance and the Vietnamese unicorn dance", and so on
for all twelve. The coverage checker verifies only that *a* block is **present**,
not that it does the book's job — which is precisely the silent failure
`CLAUDE.md` warns about. A story scene written over that block would go green
while deleting required curriculum.

**So: the prescribed Lesson 4 content block is untouchable.** Leave its prose,
its named people (Sakura, Eric, Lan and their siblings in other units) and its
exercises exactly as they are. They are the *book's* characters, not the
course's, and the all-new-cast rule does not reach them.

### The revised seven-scene template — this one binds

| Lesson | Slot | Story load |
| --- | --- | --- |
| 1 — Getting Started | `::: dialogue`, ~210 w | **The trouble.** Ordinary want, present tense, two characters. |
| 2 — A Closer Look 1 | example sentences | Story words only. No plot. |
| 3 — A Closer Look 2 | example sentences | The unit's grammar, spoken by our people. No plot. |
| 4 — Communication | **prescribed — do not restory** | Only the Everyday English *mini-dialogue stems* may take story names. |
| 5 — Skills 1 | `::: passage`, ~240 w | **The lighting, and what came back.** |
| 6 — Skills 2 | `::: audio` ~200 w + writing model ~95 w | **It goes wrong**, then a character writes something. |
| 7 — Looking Back | error-hunt paragraph, ~50 w | **Where we are now.** Doubles as the recap. |

The lighting therefore lands in **Lesson 5**, not Lesson 4 — which still honours
the craft finding it was chosen for (`doraemon-craft.md` §2: the gadget arrives
at the midpoint, after four beats of ordinary pressure). Lessons 1–4 stay pure
A2 daily-life language carrying no fantasy vocabulary load.

---

## 1. Rules every chapter obeys

**Curriculum first, always.** If a story beat and a prescribed target collide,
the target wins and the beat bends. The whole point of the rewrite is a course
that is *also* a story, never a story that used to be a course.

1. **Every prescribed vocabulary word must still appear in the unit.** Coverage
   is 328/328 today and must be 328/328 after. Words that lived only in the old
   dialogue or old passage must be re-homed into the new prose. This is the
   single easiest thing to break and it fails silently.
2. **The unit's grammar target is what the new prose is built to exhibit.** The
   chapter is the *vehicle* for V-ing/to-V, comparatives, reported speech —
   not a story that happens to sit near them.
3. **Never a narrator explaining the course.** No "in this chapter you will
   learn". No framing device. The story is the material.
4. **State the lamp's rule in-world, once per chapter, in one line of
   dialogue** — a learner joining at Unit 7 must be able to learn it from a
   character saying it to another character.
5. **A diacritic-bearing name is never a required typed answer.** *Tí*, *Thảo*,
   *Hùng*, *Đạt*, *Bạch*, *Bà Sáu* may appear freely in prose and in multiple
   choice, but a `short-answer` or `sentence-completion` key must never demand a
   learner type them. **Mun** and **Khoa** are diacritic-free and safe as keys.
6. **Every task key that quotes rewritten prose is rewritten with it**, and the
   Answer Key section at the foot of the unit with it. A key quoting text that
   no longer exists is the defect this rewrite most easily ships.
7. **Never print the listening script.** The `::: audio` body is the recording;
   no sentence of it may appear in a task prompt or anywhere on the page.
8. **The writing model is in-world** (a character writes it); the learner's task
   stays about the learner's own life. Eight of twelve genres ask the learner to
   write about themselves and that must not change.
9. **`::: write` checklists are hard bounds.** The model must satisfy its own
   checklist — word range, `vocab:N` headwords from that unit's table, required
   phrases, paragraph counts. Unit 7's model is 119 words against a 100–120
   bound; one extra clause of scene-setting breaks the build.
10. **`[[gloss]]` markers in the dialogue must resolve** in the dictionary.
    Gloss only words that already have entries.

### The five that fail silently or fail hard — added after a peer session's audit

11. **Never insert, delete or reorder a bullet inside an existing `::: task`.**
    Edit bullet text **in place**. `review_items()` in `build.py` derives the
    spaced-review schedule from marked tasks with **position-based ids**
    (`3.1-1`), so inserting a bullet silently re-points a learner's saved
    schedule onto different content. **No gate catches this.** Same bullet
    count, same order, new text.
12. **Units 02, 07 and 12 carry `::: fluency mode="read" words="N"`, where N is
    the learner's words-per-minute denominator** — currently 249, 246, 236,
    each exactly its passage's length. Rewriting one of those passages leaves
    every gate green while the reading speed shown to the learner is computed
    against a stale number. **Recompute N.** (Now gated by `fluency-words-true`.)
13. **The `*(N words)*` stamp under a writing model is authored, not derived.**
    `check_write.js` gates the declared *bound* but never the printed number.
    Recompute it whenever the model changes. (Now gated by `writing-model-true`.)
14. **Dialogue glosses are enforced twice and fail hard.** Every `[[token]]` or
    `[[surface|dictkey]]` must resolve in `data/dict/*.json` **with a non-empty
    Vietnamese `vi` sense**, or `build.py` dies. Beyond that: at least **three**
    marked tokens per dialogue; `gramvi=` is required on the directive if any
    `[[x|gram:...]]` marker is used; **exactly one dialogue per unit, under
    Lesson 1**; and **zero gloss controls anywhere in Lessons 2–7** — that is
    the support-then-withdrawal rule. Practical upshot: the rewritten dialogue
    needs at least three words that already exist in **that unit's own**
    dictionary entries. Units 07 and 10 had to be fixed once for exactly this.
15. **Units 07 and 09 have zero headroom.** Their models measure 120 against a
    100–120 bound and 100 against an 80–100 bound. One extra word fails the
    build.

## 2. The cast, frozen

| Name | Diacritics | Who |
| --- | --- | --- |
| **Tí** | yes | the boy, 13, lives with his grandmother; parents work away |
| **Mun** | no | the thin black cat; an *apprentice* lamp-keeper, missing his name and half his instructions |
| **Thảo** | yes | the friend who sees it work and simply believes it |
| **Hùng** | yes | big, loud, a terrible singer who thinks otherwise; supplies the deadline |
| **Đạt** | yes | has everything, smallest, talks his way out; supplies envy |
| **Bà Sáu** | yes | the grandmother; strict, funny, worried about money out loud |
| **Chú Bảy** | yes | an uncle who was also bad at school and is fine |
| **Cô Yến** | yes | the teacher; makes failure public |
| **Khoa** | no | top of everything and genuinely kind |
| **Bạch** | yes | a properly-trained rival cat; Act III only |
| **the Lamp-keeper** | — | the guest; lost, then found; the farewell belongs to him |

**Retired, and to be removed from every story slot:** Duy, Linh, Mai, Hoa, and
the per-unit one-offs (Khang, Trang, Nam, and their siblings in other units).
**Not retired:** any name inside a prescribed Lesson 4 content block.

**The place:** Bến Sẻ, a delta town. Four fixed settings — the canal landing,
Bà Sáu's kitchen, the school yard, the market. The lamp lives under the bed,
wrapped in a rice sack.

**The magic:** *Light the lamp, and the nearest lost thing comes back. You
cannot choose what. Blow it out — "Go well" — and it goes away again. Twelve
measures of oil.* To call: **"Come back."**

---

## 3. The twelve briefs

Each brief gives: what is lost, the four story scenes, and **the hand-off** — the
sentence-level fact the next chapter is built on. A drafter must leave the
hand-off true.

### Chapter 1 — Unit 1, Leisure Time · *a game comes back*
**Grammar the prose must exhibit:** verbs of liking/disliking + V-ing vs to-V.
**Oil:** 12 → 11.

- **L1 trouble.** Tí and Thảo at the canal landing on a Saturday. Hùng has a new
  board game and everyone is invited but Tí. An ordinary want: to be included.
- **L5 lighting.** Tí dredges up a brass lamp; his tears fall on it and it
  lights. Mun comes out and states the rule. What comes back is not the
  invitation — it is **a game**: a hand-made wooden one, lost years ago, silly
  and useless. They play it. It is the best afternoon of the year.
- **L6 wrong.** The game is not Tí's. It belonged to Chú Bảy as a boy, and its
  return means it vanished from wherever it had been. Someone notices. Mun is
  visibly surprised that the lamp reached that far back — the first hint he does
  not know what he is doing.
- **L7 now.** Eleven measures left, and the game stays.
- **Hand-off → 2:** Mun says the lamp reaches *further than he was told it
  reaches.* Nobody yet knows how much further.

### Chapter 2 — Unit 2, Life in the Countryside · *a path comes back*
**Grammar:** comparative adverbs. **Oil:** 11 → 10.

- **L1 trouble.** Tí is sent to his grandmother's home village and must get
  somewhere faster than the road allows.
- **L5 lighting.** The lamp returns **the old path to the fields**, which the new
  road replaced and which nobody alive can find. Comparatives are the chapter:
  the old way is *shorter*, *steeper*, *quicker in the dry season*.
- **L6 wrong.** The path goes somewhere it should not still go — **upriver.**
- **L7 now.** Ten measures. Thảo has now seen it work and simply believes it.
- **Hand-off → 3:** the path is *the route upriver*. Everything in Act II is
  reachable only because of it.

### Chapter 3 — Unit 3, Teenagers · *a friend comes back*
**Grammar:** simple & compound sentences. **Oil:** 10 → 9.
**Handle with care:** this is the darkest beat in Act I. The friend has not aged.
Play it as *strange and quietly sad*, never as horror, and never as a body.

- **L1 trouble.** School stress; a friend who left the class last year is spoken
  about but not named as gone.
- **L5 lighting.** He comes back. He is exactly as he was, and everyone else is a
  year older. He is not frightening — he is *out of step*, and knows it.
- **L6 wrong.** Blowing the lamp out would send him back. Tí cannot do it.
  **The first thing he will not un-lose.**
- **L7 now.** Nine measures, and one lighting that can no longer be undone.
- **Hand-off → 4:** the friend knows something about **what else has been called
  back before** — the lamp has a history, and it is upriver.

### Chapter 4 — Unit 4, Ethnic Groups of Viet Nam · *a house comes back*
**Grammar:** questions; countable/uncountable. **Oil:** 9 → 8.

- **L1 trouble.** A school project that requires asking strangers questions —
  which Tí is bad at.
- **L5 lighting.** Following the path upriver, a **stilt house** returns. Whose?
  The questions *are* the chapter: who lived here, how many people, how much
  rice, how many years.
- **L6 wrong.** The answers do not match any family anyone knows.
- **L7 now.** Eight measures.
- **Hand-off → 5:** the house's people kept **a festival** that no longer happens.

### Chapter 5 — Unit 5, Our Customs and Traditions · *a festival comes back*
**Grammar:** articles. **Oil:** 8 → 7.

- **L1 trouble.** Bà Sáu is preparing for a festival that has grown thin.
- **L5 lighting.** One night that stopped happening, happening again — with its
  people, its lanterns, its food.
- **L6 wrong.** At the festival **somebody recognises the lamp**. The rumour
  starts here.
- **L7 now.** Seven measures.
- **Hand-off → 6:** other people now know the lamp exists and what it does.

### Chapter 6 — Unit 6, Lifestyles · *a way of living comes back*
**Grammar:** future simple & first conditional. **Oil:** 7 → 6.

- **L1 trouble.** Because of the rumour, people are asking Tí for things.
- **L5 lighting.** The conditional *is* the chapter — *if we call it back,
  then…* An older way of living returns to one street.
- **L6 wrong.** It is better in some ways and much worse in others, and nobody
  agrees which. The question stops being *what shall we call back* and becomes
  *what happens to now, if we keep doing this.*
- **L7 now.** Six measures. **End of Act II.**
- **Hand-off → 7:** Tí decides to stop lighting it. He is about to be overruled
  by an accident.

### Chapter 7 — Unit 7, Environmental Protection · *a forest comes back*
**Grammar:** complex sentences; time clauses. **Oil:** 6 → 5.
**Hard constraint:** the writing model here is a **notice** (impersonal genre,
100–120 words, currently 119 against a 100–120 bound). It may be wholly
in-world. Do not overflow it.

- **L1 trouble.** The lake/canal behind the school is filthy and a clean-up is
  organised.
- **L5 lighting.** The lamp is knocked over — the first *unintended* lighting.
  **A forest comes back, all at once, in the wrong place**: through the road,
  the yard, the market. The first time the lamp frightens them.
- **L6 wrong.** Real damage. The adults now know.
- **L7 now.** Five measures.
- **Hand-off → 8:** the lamp is dangerous, and it is no longer a secret.

### Chapter 8 — Unit 8, Shopping · *a market comes back*
**Grammar:** adverbs of frequency. **Oil:** 5 → 4.

- **L1 trouble.** Money. Bà Sáu is short and Đạt is not.
- **L5 lighting.** A whole **market** returns — its sellers, its prices, and its
  **old money**, which no shop will take.
- **L6 wrong.** The disorder is large enough that someone competent notices.
  **Bạch arrives** — a white cat, properly trained, faster and correct, and much
  worse for Tí because she has no idea who he is.
- **L7 now.** Four measures.
- **Hand-off → 9:** Bạch says the lamp was never meant to be used this way, and
  that Mun's instructions are wrong.

### Chapter 9 — Unit 9, Natural Disasters · *a town comes back*
**Grammar:** past continuous + past simple. **Oil:** 4 → 3.
**This is the dark hour.** Past continuous is the grammar of a flood, exactly:
*while the water was rising, we were…*

- **L1 trouble.** A storm is forecast.
- **L5 lighting.** The town under the river — drowned when the dam was built —
  comes back, and the water it displaces has to go somewhere.
- **L6 wrong.** Mun's instructions were wrong and **somebody is nearly lost.**
  Nearly. Nobody dies.
- **L7 now.** Three measures. **End of Act III.**
- **Hand-off → 10:** in the flood they find something that was *sent* and never
  arrived.

### Chapter 10 — Unit 10, Communication in the Future · *a voice comes back*
**Grammar:** prepositions; possessives. **Oil:** 3 → 2.

- **L1 trouble.** A message that does not get through.
- **L5 lighting.** **A voice** — a message the Lamp-keeper sent long ago that
  never arrived. It tells them what the lamp actually is.
- **L6 wrong.** It is incomplete; it stops mid-sentence.
- **L7 now.** Two measures.
- **Hand-off → 11:** the message names the keeper's **work**, and where it is.

### Chapter 11 — Unit 11, Science and Technology · *an inventor comes back*
**Grammar:** reported speech — statements. **Oil:** 2 → 1.
Reported speech is the chapter: *he said the lamp was never meant to…*

- **L1 trouble.** Science club; something built that does not work.
- **L5 lighting.** They find the Lamp-keeper's own work, and **what he said the
  lamp was never meant to do.**
- **L6 wrong.** One measure of oil left, and the thing they most want back is the
  one thing the keeper forbade.
- **L7 now.** One measure.
- **Hand-off → 12:** the keeper is findable. And Mun still has no name.

### Chapter 12 — Unit 12, Life on Other Planets · *a name comes back*
**Grammar:** reported speech — questions. **Oil:** 1 → 0.
**Read `story-bible.md` §6 "The ending" before drafting this one.**

- **L1 trouble.** An ordinary school day, deliberately ordinary.
- **L5 lighting.** The twelfth and last lighting. What comes back is **Mun's
  name** — and with it, everything he had forgotten, including the keeper.
- **L6 wrong / resolved.** The keeper is found, thanked, and **goes home; the
  empty lamp goes with him, because it was never ours.** The farewell belongs to
  the guest.
- **L7 now.** No oil. The lamp is cold. The town is ordinary again.
- **Binding:** **Mun stays, by choice.** Nothing in this chapter may be
  irreversible *about the cast* — no character written out, no relationship
  closed, no sentence that forecloses another journey. One thing in Bến Sẻ
  stayed returned. Tí still never forgets a face. The last beat is small,
  ordinary, and implies tomorrow.

---

## 4. What a drafter must not do

- Touch the prescribed Lesson 4 content block, or its people.
- Drop a prescribed vocabulary word to make a sentence read better.
- Let a chapter end without its hand-off being true.
- Print any sentence of the `::: audio` script elsewhere on the page.
- Make a diacritic-bearing name a required typed answer.
- Report a score, a band, a total or a percentage anywhere.
- Explain, anywhere on a learner's page, why the page is built the way it is.
