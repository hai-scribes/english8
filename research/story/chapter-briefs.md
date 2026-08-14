# The Sea Gives Back — the twelve chapter briefs

The **frozen interface** for the rewrite. `story-bible.md` is the foundation;
this file is what a drafter is actually handed. Every chapter is written against
its brief here, and nothing in a brief may be renegotiated by the drafter — if a
brief cannot be satisfied without damaging curriculum, the drafter stops and says
so rather than inventing around it.

Companion documents: `story-bible.md` (world, cast, rule, arc),
`chain-and-payoff.md` (the causality audit every chapter must survive), and
`doraemon-craft.md` (why these shapes work).

---

## 0. The correction this file makes to the bible

`story-bible.md` §7 assigns **Lesson 4's content block** to the story. **That is
wrong and is superseded here.**

`tools/check_coverage.py` shows Lesson 4 carries two prescribed halves: the
book's **Everyday English function** and its **named content block** — Unit 1's
"Teens' leisure activities around the world" (Japan · Switzerland · Viet Nam),
Unit 4's ethnic-groups quiz and Jrai fact-file, Unit 5's "The Japanese lion
dance and the Vietnamese unicorn dance", and so on for all twelve. The coverage
checker verifies only that *a* block is **present**, not that it does the book's
job — which is precisely the silent failure `CLAUDE.md` warns about. A story
scene written over that block would go green while deleting required curriculum.

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
| 5 — Skills 1 | `::: passage`, ~240 w | **The tide turns, and what came back.** |
| 6 — Skills 2 | `::: audio` ~200 w + writing model ~95 w | **It goes wrong**, then a character writes something. |
| 7 — Looking Back | error-hunt paragraph, ~50 w | **Where we are now**, and the mark on the wall. Doubles as the recap. |

The turn of the tide therefore lands in **Lesson 5**, not Lesson 4 — which still
honours the craft finding it was chosen for (`doraemon-craft.md` §2: the magic
arrives at the midpoint, after four beats of ordinary pressure). Lessons 1–4
stay pure A2 daily-life language carrying no fantasy vocabulary load.

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
4. **State the rule in-world, once per chapter, in one line of dialogue** — a
   learner joining at Unit 7 must be able to learn it from a character saying it
   to another character.
5. **A diacritic-bearing name is never a required typed answer.** *Tí*, *Thảo*,
   *Bống*, *Hùng*, *Đạt*, *Bà Sáu*, *Chú Bảy*, *Cô Yến* may appear freely in
   prose and in multiple choice, but a `short-answer` or `sentence-completion`
   key must never demand a learner type them. **Khoa** and **Minh** are
   diacritic-free and safe as keys, and so are the untitled roles — *the
   keeper*, *the whale*.
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
   phrases, paragraph counts.
10. **`[[gloss]]` markers in the dialogue must resolve** in the dictionary.
    Gloss only words that already have entries.

### The five that fail silently or fail hard

11. **Never insert, delete or reorder a bullet inside an existing `::: task`.**
    Edit bullet text **in place**. `review_items()` in `build.py` derives the
    spaced-review schedule from marked tasks with **position-based ids**
    (`3.1-1`), so inserting a bullet silently re-points a learner's saved
    schedule onto different content. **No gate catches this.** Same bullet
    count, same order, new text.
12. **Units 02, 07 and 12 carry `::: fluency mode="read" words="N"`, where N is
    the learner's words-per-minute denominator** — currently **363, 255 and
    490**, each exactly its passage's length. Rewriting one of those passages
    leaves every gate green while the reading speed shown to the learner is
    computed against a stale number. **Recompute N**, and if the passage's
    length moves far, move `secs=` with it or the top band becomes unreachable.

    > **This is not gated, whatever an earlier version of this file said.** It
    > claimed a check called `fluency-words-true`; no such thing exists anywhere
    > in `tools/`, and the numbers it quoted (249, 246, 236) were already wrong
    > when it quoted them. Recompute by counting the passage body yourself.

13. **The `*(N words)*` stamp under a writing model is authored, not derived.**
    `check_write.js` gates the declared *bound* but never the printed number.
    Recompute it whenever the model changes. **Also not gated** — the same
    earlier version credited a `writing-model-true` that does not exist either.
14. **Dialogue glosses are enforced twice and fail hard.** Every `[[token]]` or
    `[[surface|dictkey]]` must resolve in `data/dict/*.json` **with a non-empty
    Vietnamese `vi` sense**, or `build.py` dies. Beyond that: at least **three**
    marked tokens per dialogue; `gramvi=` is required on the directive if any
    `[[x|gram:...]]` marker is used; **exactly one dialogue per unit, under
    Lesson 1**; and **zero gloss controls anywhere in Lessons 2–7** — that is
    the support-then-withdrawal rule. Practical upshot: the rewritten dialogue
    needs at least three words that already exist in **that unit's own**
    dictionary entries.
15. **Units 07 and 09 have zero headroom.** Their models measure 120 against a
    100–120 bound and 100 against an 80–100 bound. One extra word fails the
    build.

### And two that are new to this rewrite

16. **The mark goes on the wall in Lesson 7, by a character, with chalk.** Never
    by a narrator, never as a heading, never as a number in a box. It is the
    chapter counter and it is furniture. Chapter N ends at mark N.
17. **The sea is never angry and nobody drowns.** Chapter 9 goes as close as the
    book goes, and it stops at *nearly*.

## 2. The cast, frozen

| Name | Diacritics | Who |
| --- | --- | --- |
| **Tí** | yes | the boy, 13, lives with his grandmother; parents work away |
| **Bống** | yes | the sea-child; was a *cá bống* in a bucket for three days; only she can call |
| **Thảo** | yes | the friend who sees it work and simply believes it |
| **Hùng** | yes | big, loud, a terrible singer who thinks otherwise; supplies the deadline |
| **Đạt** | yes | his family owns the hotel on the promenade; smallest, talks his way out; supplies envy |
| **Bà Sáu** | yes | the grandmother; sells at the fish market before light; strict, funny, worried about money out loud |
| **Chú Bảy** | yes | an uncle on a boat, who was also bad at school and is fine |
| **Cô Yến** | yes | the teacher; makes failure public |
| **Khoa** | no | top of everything and genuinely kind |
| **Minh** | no | Chapter 3 on. The boy who left on the boat a year ago and comes back still thirteen |
| **the keeper** | — | the lighthouse keeper who measured the tides and stayed in the water; Act III on; the farewell belongs to him |
| **the whale** | — | unnamed, silent, twice: Chapter 5 and Chapter 12 |

**Retired, and to be removed from every story slot:** Duy, Linh, Mai, Hoa, Mun,
and the per-unit one-offs (Khang, Trang, Nam, and their siblings in other
units). **Not retired:** any name inside a prescribed Lesson 4 content block.

**The place:** **Quy Nhơn**, on the central coast, part of Gia Lai province
since 1 July 2025. Tí lives in **Bãi Sẻ**, an invented fishing quarter at the
north end of the bay. Four fixed settings — the harbour wall, Bà Sáu's kitchen,
the school yard, the fish market. Bống sleeps in the water butt behind the
kitchen, under a tin lid.

Real and used truthfully, when a chapter needs them: the promenade and the city
beach; the fishing port; **Ghềnh Ráng** and its pebble beach; **Tháp Đôi**, the
Chăm towers in the middle of town; **Nhơn Lý** across the bay with its cliffs at
**Eo Gió**, its coral and its **Lăng Ông Nam Hải** whale shrine.

**The magic:** *The sea gives back what it took. It is looking for her. Wherever
she is standing when the tide turns, it gives back the nearest thing it took
there. You never choose what comes back — you choose where you are standing.
Carry a thing into the water and say "Go well." and it goes home. Every time,
the sea stands higher: twelve marks on the harbour wall.* To call, and only she
can: **"Come back."**

---

## 3. The twelve briefs

Each brief gives: what comes back, the four story scenes, and **the hand-off** —
the sentence-level fact the next chapter is built on. A drafter must leave the
hand-off true.

### Chapter 1 — Unit 1, Leisure Time · *a game comes back*
**Grammar the prose must exhibit:** verbs of liking/disliking + V-ing vs to-V.
**Mark:** 0 → 1.

- **L1 trouble.** Tí and Thảo on the harbour wall on a Saturday. Hùng has a new
  board game and everyone is invited but Tí. An ordinary want: to be included.
  Tí has something in a bucket he has not mentioned to anybody.
- **L5 turn.** The bucket is empty and there is a girl behind the kitchen in
  Thảo's old shirt. She walks him down to the wall at the turn of the tide, says
  *"Come back,"* and states the rule. What comes back is not the invitation — it
  is **a game**: a hand-made wooden one, lost years ago, silly and useless. They
  play it. It is the best afternoon of the year.
- **L6 wrong.** The game is not Tí's. It belonged to Chú Bảy as a boy and went
  off the back of a boat, and its return means it is gone from wherever it had
  been. Someone notices. Bống is visibly surprised it reached that far back —
  the first hint she does not know her own range.
- **L7 now.** One mark on the wall, in chalk, at Tí's shoulder. The game stays.
- **Hand-off → 2:** the sea reaches *further back than she was told it reaches.*
  Nobody yet knows how much further.

### Chapter 2 — Unit 2, Life in the Countryside · *a path comes back*
**Grammar:** comparative adverbs. **Mark:** 1 → 2.
**Carries `::: fluency words="N"` — recompute N to the new passage's length.**

- **L1 trouble.** Chú Bảy has sent word that he wants to see Tí — about the
  game. Bà Sáu, who knows none of this, turns it into an errand to the village
  behind the headland with a deadline: be back before dark. The dialogue must
  name the game and Chú Bảy in the same breath.
- **L5 turn.** They take Bống, because leaving her is worse. At the headland the
  tide turns and the sea gives back **the old track round the point**, which it
  took thirty years ago and the new road replaced. Comparatives are the chapter:
  the old way is *shorter*, climbs *more steeply*, gets you there *more quickly*
  at low water.
- **L6 wrong.** The path goes somewhere it should not still go — down to a
  landing that has not existed since before Tí was born.
- **L7 now.** Two marks. Thảo has now seen it twice and simply believes it.
- **Hand-off → 3:** *the sea gives back across years, not days.* That is the
  inference Chapter 3 is built on, and Chapter 2's last beat must state it out
  loud.

### Chapter 3 — Unit 3, Teenagers · *a boat comes back, and Minh is on it*
**Grammar:** simple & compound sentences. **Mark:** 2 → 3.
**Handle with care:** this is the darkest beat in Act I.
**Binding:** the loss is **economic, not fatal** — Minh's family sold the boat
and left in the night, and it is the *boat* the sea took, off a beach, later and
elsewhere. **A line in the dialogue must close off the drowning reading
explicitly**, in a character's own words, before the return happens. Play it as
*strange and quietly sad*, never as horror, and never as a body.

- **L1 trouble.** The class list goes up and Tí is bottom again. But the real
  problem is an idea he has just had, and the dialogue must carry the inference
  out loud: *the path was lost before I was born and it came back.* The reader
  must know what he is about to do before he does it.
- **L5 turn.** He walks to where the boat went, and stands there. It comes back.
  Minh is on it, exactly as he was, and everyone else in the class is a year
  older. He is not frightening — he is *out of step*, and knows it.
- **L6 wrong.** Two words would send him home. Tí will not say them. **The first
  thing he refuses to give back.**
- **L7 now.** Three marks, and one return that will not be undone.
- **Hand-off → 4:** Minh knows something about a house upriver that the water
  reached once before. **End of Act I.**

### Chapter 4 — Unit 4, Ethnic Groups of Viet Nam · *a house comes back*
**Grammar:** questions; countable/uncountable. **Mark:** 3 → 4.
**Note the geography:** since the 2025 merger the coast and the highlands are
one province, so going upriver is going home, not going abroad. Treat the
village as a place people live now, not as an exhibit.

- **L1 trouble.** A school project that requires asking strangers questions —
  which Tí is bad at.
- **L5 turn.** Following what Minh said, upriver, a **stilt house** comes back
  where the reservoir covered one. Whose? The questions *are* the chapter: who
  lived here, how many people, how much rice, how many years.
- **L6 wrong.** The answers do not match any family anyone knows, and the house
  has a shrine in it for a festival nobody there keeps any more.
- **L7 now.** Four marks. The water is at Tí's chest.
- **Hand-off → 5:** the house's people kept **a festival** that stopped, and the
  questions in this chapter are what date it.

### Chapter 5 — Unit 5, Our Customs and Traditions · *a festival comes back*
**Grammar:** articles. **Mark:** 4 → 5.
**Get the shrine right.** *Thờ Cá Ông* is live practice on this coast: the whale
brings drowning fishermen in, the shrine holds her bones, the festival prays for
a calm year and a full net. Write it as the town's own, from the inside. **The
whale appears here and says nothing.** No explanation on the page, ever.

- **L1 trouble.** Bà Sáu is preparing for the whale festival, and it has grown
  thin: fewer boats, fewer people, a shorter night.
- **L5 turn.** The night as it used to be, happening again — its people, its
  lanterns, its offerings, its full harbour. And out past the moorings,
  once, the whale.
- **L6 wrong.** In the crowd **somebody recognises what Bống is** and says so
  out loud. The rumour starts here.
- **L7 now.** Five marks. The lanterns are released and most of the night goes
  home with them; the drafter must show that happening.
- **Hand-off → 6:** the town now knows there is a girl who can call things back,
  and people begin asking Tí for things.

### Chapter 6 — Unit 6, Lifestyles · *a way of living comes back*
**Grammar:** future simple & first conditional. **Mark:** 5 → 6.

- **L1 trouble.** Because of the rumour, people are asking Tí for things, and
  the asks are not small.
- **L5 turn.** The conditional *is* the chapter — *if we call it back, then…*
  An older way of living returns to one lane: no fridges, no engines, everybody
  out of doors, the whole street eating together.
- **L6 wrong.** It is better in some ways and much worse in others, and nobody
  agrees which. The question stops being *what shall we call back* and becomes
  *what happens to now, if we keep doing this.* The lane is at war by the end.
- **L7 now.** Six marks. Tí decides to stop, and says so. **End of Act II.**
- **Hand-off → 7:** the town's compromise, agreed because the lane could agree
  on nothing else, is a harbour clean-up on Saturday.

### Chapter 7 — Unit 7, Environmental Protection · *a reef comes back*
**Grammar:** complex sentences; time clauses. **Mark:** 6 → 7.
**Hard constraint:** the writing model here is a **notice** (impersonal genre,
100–120 words, currently 119 against a 100–120 bound). It may be wholly
in-world. Do not overflow it.
**Carries `::: fluency words="N"` — recompute N.**
**The true fact this chapter is built on**, and Chú Bảy may say it in a line:
the reef that used to break the waves off this coast was destroyed decades ago,
and that is why the sea now reaches the road. Never as a lesson; as a thing an
old man says while picking up litter.

- **L1 trouble.** The harbour clean-up. Tí goes because he has sworn off it and
  wants to be seen doing something ordinary. He brings Bống **because he means
  to walk her down the beach and let the sea have her back** — which is why she
  is standing on the breakwater at all.
- **L5 turn.** He cannot do it, and while he is failing to, the tide turns.
  **A reef comes back, all at once, under the boats** — coral through the
  moorings, in the channel, against the harbour wall. The first time the sea
  frightens them. A dugong in the shallows by morning.
- **L6 wrong.** Real damage: hulls, propellers, a channel nobody can use. It
  cannot be given back in one piece, and clearing it costs weeks of everybody's
  hands. The adults now know.
- **L7 now.** Seven marks, and coral on the steps.
- **Hand-off → 8:** Bống can no longer be kept behind the kitchen, and the whole
  town knows where she is.

### Chapter 8 — Unit 8, Shopping · *a market comes back*
**Grammar:** adverbs of frequency. **Mark:** 7 → 8.

- **L1 trouble.** Money. Bà Sáu is short and Đạt is not, and Đạt has something
  Tí lost. **One return in this book is caused by plain envy and this is it.**
  Do not redeem Đạt in the same chapter.
- **L5 turn.** A whole **market** comes back — its sellers, its prices, and its
  **old money**, which no shop will take.
- **L6 wrong.** The disorder is large enough to be news, and **the keeper
  arrives.** A man off no boat, who knows the tide table better than the tide
  table does. He is not a rival and not a villain: he is right, he is kind
  about it, and he is no help at all. He says the sea has been coming for a week
  and will not stop, that Bống has been told none of this, and — the thing
  nobody has said out loud yet — *you never choose what comes back, but you have
  been choosing where you stand, and that is not allowed either.*
- **L7 now.** Eight marks. The old money goes back into the water with its
  debts.
- **Hand-off → 9:** stung, Bống insists she can hold it.

### Chapter 9 — Unit 9, Natural Disasters · *a town comes back*
**Grammar:** past continuous + past simple. **Mark:** 8 → 9.
**This is the dark hour.** Past continuous is the grammar of a flood, exactly:
*while the water was rising, we were…* **Nobody dies.** It goes as far as
*nearly* and stops. Frightening first, beautiful second, in that order.
**Zero headroom on the writing model: 100 words against an 80–100 bound.**

- **L1 trouble.** A storm is forecast, and Bống means to prove the keeper wrong
  in front of him.
- **L5 turn.** The town the sea took — a coast village gone under decades of
  storms and erosion — comes back, and the water it displaces has to go
  somewhere. It goes up the street.
- **L6 wrong.** She cannot hold it. The water goes over the ninth mark and
  **somebody is nearly lost.** Nearly. Then the second half of the beat, which
  is not optional: the flood becomes quiet and strange and rather beautiful —
  boats where the buses were, everybody on the roofs and talking, lanterns.
- **L7 now.** Nine marks, and the ninth is above the door. **End of Act III.**
- **Hand-off → 10:** in the flood they find something that was **sent and never
  arrived**.

### Chapter 10 — Unit 10, Communication in the Future · *a voice comes back*
**Grammar:** prepositions; possessives. **Mark:** 9 → 10.

- **L1 trouble.** A message that does not get through.
- **L5 turn.** **A voice** — a radio call from a boat that never came in, made
  by the keeper before he went into the water. It says what he was measuring and
  why.
- **L6 wrong.** It is incomplete; it stops mid-sentence.
- **L7 now.** Ten marks.
- **Hand-off → 11:** the call names the keeper's **work**, and where it is.

### Chapter 11 — Unit 11, Science and Technology · *a life's work comes back*
**Grammar:** reported speech — statements. **Mark:** 10 → 11.
Reported speech is the chapter: *he said the water would…*

- **L1 trouble.** Science club; something built that does not work.
- **L5 turn.** They find the keeper's own notebooks — years of measurements in a
  hand that gets worse — and **what he said would happen at the twelfth mark.**
- **L6 wrong.** The notebooks answer the wrong question first. The one the boys
  most want answered is not about the water: it is *what happens to a person who
  was called back.* The green notebook does answer it, in one line, and the line
  is that **a called-back thing stays as long as somebody holds on to what it
  was.** Nobody in the room works out yet that this is about Minh, or about
  anyone else.
- **L7 now.** Eleven marks. The keeper says he will come for her at the next
  tide.
- **Hand-off → 12:** one mark left, and a rule nobody has finished reading.

### Chapter 12 — Unit 12, Life on Other Planets · *a name comes back*
**Grammar:** reported speech — questions. **Mark:** 11 → 12.
**Read `story-bible.md` §6 "The ending" before drafting this one.**
**Carries `::: fluency words="N"` — recompute N.**

- **L1 trouble.** An ordinary school day, deliberately ordinary. The moon is at
  its closest this week and the science lesson says why: *gravity*, and the sea
  answering it. Nobody in the dialogue connects that to anything.
- **L5 turn.** The twelfth. The water is over the street and the town is quiet
  and alive and full of boats. What comes back is **Bống's own name** — the one
  the sea took when she left it — and with it, everything she had forgotten,
  including the keeper.
- **L6 wrong / resolved.** The keeper is thanked and **goes home; the sea goes
  back out with him.** The farewell belongs to the guest. The whale, once, and
  silent. Bống **stays, by choice**, and the reason it is allowed is the line in
  the green notebook and the boy who never forgets a face — which also, in the
  same breath, settles Minh. Minh must be **present, named, and unfrightened**.
- **L7 now.** No marks; the tide has taken the chalk off the wall. The path from
  Chapter 2 is still there. So is Minh. So is she.
- **Binding:** nothing in this chapter may be irreversible *about the cast* — no
  character written out, no relationship closed, no sentence that forecloses
  another journey. The last beat is small, ordinary, and implies tomorrow.

---

## 4. What a drafter must not do

- Touch the prescribed Lesson 4 content block, or its people.
- Drop a prescribed vocabulary word to make a sentence read better.
- Let a chapter end without its hand-off being true.
- Print any sentence of the `::: audio` script elsewhere on the page.
- Make a diacritic-bearing name a required typed answer.
- Insert, delete or reorder a bullet inside an existing `::: task`.
- Explain the whale shrine, or any custom, to the reader. The characters
  already know; the reading passage may describe what happens, never what it
  means to Vietnamese culture.
- Let the sea be angry, or let anybody drown.
- Report a score, a band, a total or a percentage anywhere.
- Explain, anywhere on a learner's page, why the page is built the way it is.
