# Illustration prompts — *The Sea Gives Back*

Every prompt the site's art needs, and nothing else. Written for **Gemini**
(Nano Banana / Imagen). Each block is complete: paste it, generate, save.

The Getting Started dialogue on every Lesson 1 page is a **comic** — a
background plate, the speaker, one speech balloon, advancing as the reader
scrolls. So there are exactly two kinds of image, and the page composites them:

| | What | Files |
| --- | --- | --- |
| **Part 1** | Thirty drawings — five characters × six expressions, one square picture each, chest up, on flat white | `art/cast/<slug>/<emotion>.png` |
| | …composed by `tools/make_sheet.py` into the 3 × 2 sheet the page loads | `art/cast/<slug>.webp` |
| **Part 2** | Eleven background plates — the story's places, drawn empty | `art/bg/<slug>.jpg` |

`data/cast.json` is the contract. It declares the slugs, the six emotions and
their panel order, and `tools/build.py` fails the build on a dialogue naming
anything outside it.

```sh
python3 tools/check_cast.py     # what is declared, and what is drawn
```

Nothing here goes on a learner's page — this is reference material, and
`tools/build.py` never reads it.

## Before you start

**Copy one block. Paste it. Generate.** Every prompt below is complete on its
own — nothing to fill in, nothing to append, no aspect ratio or style note to
remember. If you find yourself typing anything into a prompt, that is a bug in
this file.

**Each prompt asks for exactly one picture**, which is the thing image models
are reliable at. Nothing asks for a grid, a sheet or a set of panels — see
*Why one drawing at a time* below.

**Optionally attach a *Ponyo* still** as a style reference — a background or a
quiet character moment, not a poster. Each prompt already tells the model what
to do with it *and* describes the whole style in words, so a prompt works either
way; attaching it just makes the line, the flat colour and the light land
faster. It is the only attachment any prompt wants.

Attach it to both parts, but take a different thing from it each time: a **cast**
prompt copies how the *people* in the still are drawn — the fine line, the flat
fills, the hard-edged shadows — and a **plate** prompt copies how the *place*
behind them is painted, and ignores the figures entirely.

The house look is Studio Ghibli's — Miyazaki's *Ponyo* — applied to a Vietnamese
harbour city. The fit is close on purpose: this is a sea story about a town the
water comes into, told with the same warmth, and *Ponyo* is the film that
already knows how to paint bright water and low concrete houses and a flood that
is not a tragedy.

**The style is the borrowed part; the story and the cast are not.** That is what
the **must not** line in every character prompt is defending, and it is why
Bống's own description spends four lines saying what she is *not* — no orange
hair, no red dress, no fish features. `story-bible.md` §9 lists the plot
elements that go with them, and the same rule applies here: a reference still is
for line, colour and light, and for nothing else. If a generation starts
resembling a character from the film, it is wrong even when it is beautiful.

> **The film paints its people and its places differently, and so do we.**
> *Ponyo*'s cast is **clean cel** — flat colour and a hard-edged shadow inside
> a fine dark line, no texture at all — while its backgrounds are **soft
> coloured pencil and pastel**, which is the thing that film is famous for.
> Asking for coloured pencil on a character is the commonest way to get this
> style wrong: it produces a sketch, not a Ghibli figure. So Part 1 says
> *painted, not sketched*, and Part 2 is as painterly as the film is.
>
> That split is also what keeps the pipeline working. `make_sheet.py` makes the
> avatars transparent by flooding white inward from the border, and the figure's
> closed line is the wall that stops it — a cel outline is a wall by
> construction, which is why the cast prompts insist the contour **closes all
> the way round with no gaps** and that nothing fades out past it. Plates are
> never keyed, so nothing constrains them.

**What unit 1 needs:** Part 1 §1 (Tí), Part 1 §2 (Thảo) and Part 2 §1
(`harbour-wall`). Everything else is for the chapters after it, and the other
eleven dialogues read as plain text until they are staged.

**Tí's six are already drawn and do not change.** His design carries no setting
on it — a green shirt with a cream collar, charcoal shorts — so moving the story
from a delta to a coast costs nothing in Part 1. Thảo's six are written and
unchanged for the same reason. What is new here is **Bống**, who takes the slot
the cat used to hold.

---

# Part 1 — the character drawings

**Thirty drawings: five characters × six expressions, one image each.** Each is
a single square picture of one character — no grids, no sheets, no panels.
`tools/make_sheet.py` composes each set of six into the 3 × 2 sheet the page
loads, so the layout is arithmetic rather than something a generator has to get
right.

Save each one as `art/cast/<slug>/<emotion>.png` — full size, lossless, exactly
as the generator returned it — then run `python3 tools/make_sheet.py <slug>`.

**A cut-out PNG is welcome, and so is a white one.** Every prompt asks for a
plain white background, because that is what generators do reliably and a
prompt that asks for transparency tends to get a *drawn* checkerboard instead.
But some tools now return a genuine transparent PNG, which is strictly better —
nothing has to be keyed at all. `make_sheet.py` detects which it has been given
and does the right thing, so save whatever comes back and do not flatten it
onto white first. (Tí's six arrived cut out.)

**`art/` is the source tree, and it is deliberately not `docs/`.** `docs/` is
generated: `tools/build.py` deletes `docs/assets/` on every run and writes it
again, so a drawing saved there survives until the next build and no further.
The build copies the composed sheets and the plates out of `art/` for you.

**The six expressions are shared; the six poses are not.** Every character
carries the same emotion set, because thirty avatars is what one person can keep
consistent — but *how* a character is sad is characterisation, and for a while
all five were sad in the same way, with one hand at the collarbone and the
shoulders dropped. Read down a column of the finished sheets and it showed: five
people doing the same mime. So each character now has their own six, written
from what that person is like. Thảo is certain and keeps her shoulders square
even when she is sad; Bà Sáu is planted and her hands are always doing or having
just done something; Khoa has the notebook in every panel and it is his hands'
whole vocabulary; Bống uses both hands at once for everything, badly, because
she has not had them long.
**Do not normalise these back to one description.** The one thing they do share
is the last line — every gesture stays at chest height or above, because the
crop is chest-up and a hand below it is a hand nobody sees.

---

## Tí — six drawings, `art/cast/ti/`

### Tí · neutral

**File:** `art/cast/ti/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children, and **standing straight**: light,
> narrow shoulders, held level and square. **Warm brown-black hair, cut
> short** — a proper haircut, above the ears and clear of the collar — drawn
> as a few thick tufts ending in soft points, tidy in silhouette rather than
> shaggy, with a plain fringe and **one cowlick standing up at the back of
> the crown** that will not lie down however it is combed. That cowlick is
> the only untidy thing about him, and it is not his doing. Eyes a little
> smaller and rounder than the other children's — the smallest eyes in the
> cast — under a level brow, giving a watchful, slightly guarded look:
> attentive, never sullen and never scowling. **Clothes, simple and tidy:**
> a plain short-sleeved shirt in a **clear leaf green**, one block of colour
> with no pattern and no pocket, and a **small soft collar in cream** — the
> only second colour on him — sitting square against the base of both
> shoulders and closed at the neck. The sleeves end halfway down the upper
> arm; the shirt is worn tucked in, over plain charcoal shorts. It is an
> inexpensive shirt and a plain one, but it fits him and it is clean and
> worn properly: a boy with little money who is looked after and takes care
> of himself. Ordinary and a bit closed-off — not cute, not heroic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** wear glasses of any kind; wear a
> striped top with blue shorts; resemble any existing Studio Ghibli
> character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **neutral**: an ordinary talking
> face, mouth slightly open, no strong feeling; hands resting together in
> front of the chest. Keep every gesture at chest height or above.
>
> **Keep visible:** the single cowlick standing up at the back of the crown,
> and the cream collar — a different colour from the green shirt — sitting
> square and level on both shoulders.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Tí · happy

**File:** `art/cast/ti/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children, and **standing straight**: light,
> narrow shoulders, held level and square. **Warm brown-black hair, cut
> short** — a proper haircut, above the ears and clear of the collar — drawn
> as a few thick tufts ending in soft points, tidy in silhouette rather than
> shaggy, with a plain fringe and **one cowlick standing up at the back of
> the crown** that will not lie down however it is combed. That cowlick is
> the only untidy thing about him, and it is not his doing. Eyes a little
> smaller and rounder than the other children's — the smallest eyes in the
> cast — under a level brow, giving a watchful, slightly guarded look:
> attentive, never sullen and never scowling. **Clothes, simple and tidy:**
> a plain short-sleeved shirt in a **clear leaf green**, one block of colour
> with no pattern and no pocket, and a **small soft collar in cream** — the
> only second colour on him — sitting square against the base of both
> shoulders and closed at the neck. The sleeves end halfway down the upper
> arm; the shirt is worn tucked in, over plain charcoal shorts. It is an
> inexpensive shirt and a plain one, but it fits him and it is clean and
> worn properly: a boy with little money who is looked after and takes care
> of himself. Ordinary and a bit closed-off — not cute, not heroic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** wear glasses of any kind; wear a
> striped top with blue shorts; resemble any existing Studio Ghibli
> character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **happy**: a real open smile, eyes
> curved; shoulders lifted, one hand raised in a small open gesture. Keep
> every gesture at chest height or above.
>
> **Keep visible:** the single cowlick standing up at the back of the crown,
> and the cream collar — a different colour from the green shirt — sitting
> square and level on both shoulders.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Tí · worried

**File:** `art/cast/ti/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children, and **standing straight**: light,
> narrow shoulders, held level and square. **Warm brown-black hair, cut
> short** — a proper haircut, above the ears and clear of the collar — drawn
> as a few thick tufts ending in soft points, tidy in silhouette rather than
> shaggy, with a plain fringe and **one cowlick standing up at the back of
> the crown** that will not lie down however it is combed. That cowlick is
> the only untidy thing about him, and it is not his doing. Eyes a little
> smaller and rounder than the other children's — the smallest eyes in the
> cast — under a level brow, giving a watchful, slightly guarded look:
> attentive, never sullen and never scowling. **Clothes, simple and tidy:**
> a plain short-sleeved shirt in a **clear leaf green**, one block of colour
> with no pattern and no pocket, and a **small soft collar in cream** — the
> only second colour on him — sitting square against the base of both
> shoulders and closed at the neck. The sleeves end halfway down the upper
> arm; the shirt is worn tucked in, over plain charcoal shorts. It is an
> inexpensive shirt and a plain one, but it fits him and it is clean and
> worn properly: a boy with little money who is looked after and takes care
> of himself. Ordinary and a bit closed-off — not cute, not heroic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** wear glasses of any kind; wear a
> striped top with blue shorts; resemble any existing Studio Ghibli
> character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **worried**: brows raised and pulled
> together, mouth a small flat line; shoulders drawn in, hands close to the
> body. Keep every gesture at chest height or above.
>
> **Keep visible:** the single cowlick standing up at the back of the crown,
> and the cream collar — a different colour from the green shirt — sitting
> square and level on both shoulders.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Tí · annoyed

**File:** `art/cast/ti/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children, and **standing straight**: light,
> narrow shoulders, held level and square. **Warm brown-black hair, cut
> short** — a proper haircut, above the ears and clear of the collar — drawn
> as a few thick tufts ending in soft points, tidy in silhouette rather than
> shaggy, with a plain fringe and **one cowlick standing up at the back of
> the crown** that will not lie down however it is combed. That cowlick is
> the only untidy thing about him, and it is not his doing. Eyes a little
> smaller and rounder than the other children's — the smallest eyes in the
> cast — under a level brow, giving a watchful, slightly guarded look:
> attentive, never sullen and never scowling. **Clothes, simple and tidy:**
> a plain short-sleeved shirt in a **clear leaf green**, one block of colour
> with no pattern and no pocket, and a **small soft collar in cream** — the
> only second colour on him — sitting square against the base of both
> shoulders and closed at the neck. The sleeves end halfway down the upper
> arm; the shirt is worn tucked in, over plain charcoal shorts. It is an
> inexpensive shirt and a plain one, but it fits him and it is clean and
> worn properly: a boy with little money who is looked after and takes care
> of himself. Ordinary and a bit closed-off — not cute, not heroic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** wear glasses of any kind; wear a
> striped top with blue shorts; resemble any existing Studio Ghibli
> character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **annoyed**: brows down and level,
> mouth pressed or turned down at one corner; arms folded. Keep every
> gesture at chest height or above.
>
> **Keep visible:** the single cowlick standing up at the back of the crown,
> and the cream collar — a different colour from the green shirt — sitting
> square and level on both shoulders.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Tí · surprised

**File:** `art/cast/ti/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children, and **standing straight**: light,
> narrow shoulders, held level and square. **Warm brown-black hair, cut
> short** — a proper haircut, above the ears and clear of the collar — drawn
> as a few thick tufts ending in soft points, tidy in silhouette rather than
> shaggy, with a plain fringe and **one cowlick standing up at the back of
> the crown** that will not lie down however it is combed. That cowlick is
> the only untidy thing about him, and it is not his doing. Eyes a little
> smaller and rounder than the other children's — the smallest eyes in the
> cast — under a level brow, giving a watchful, slightly guarded look:
> attentive, never sullen and never scowling. **Clothes, simple and tidy:**
> a plain short-sleeved shirt in a **clear leaf green**, one block of colour
> with no pattern and no pocket, and a **small soft collar in cream** — the
> only second colour on him — sitting square against the base of both
> shoulders and closed at the neck. The sleeves end halfway down the upper
> arm; the shirt is worn tucked in, over plain charcoal shorts. It is an
> inexpensive shirt and a plain one, but it fits him and it is clean and
> worn properly: a boy with little money who is looked after and takes care
> of himself. Ordinary and a bit closed-off — not cute, not heroic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** wear glasses of any kind; wear a
> striped top with blue shorts; resemble any existing Studio Ghibli
> character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **surprised**: eyes wide and round,
> brows high, mouth open in a small circle; shoulders up, both hands lifted
> slightly. Keep every gesture at chest height or above.
>
> **Keep visible:** the single cowlick standing up at the back of the crown,
> and the cream collar — a different colour from the green shirt — sitting
> square and level on both shoulders.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Tí · sad

**File:** `art/cast/ti/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children, and **standing straight**: light,
> narrow shoulders, held level and square. **Warm brown-black hair, cut
> short** — a proper haircut, above the ears and clear of the collar — drawn
> as a few thick tufts ending in soft points, tidy in silhouette rather than
> shaggy, with a plain fringe and **one cowlick standing up at the back of
> the crown** that will not lie down however it is combed. That cowlick is
> the only untidy thing about him, and it is not his doing. Eyes a little
> smaller and rounder than the other children's — the smallest eyes in the
> cast — under a level brow, giving a watchful, slightly guarded look:
> attentive, never sullen and never scowling. **Clothes, simple and tidy:**
> a plain short-sleeved shirt in a **clear leaf green**, one block of colour
> with no pattern and no pocket, and a **small soft collar in cream** — the
> only second colour on him — sitting square against the base of both
> shoulders and closed at the neck. The sleeves end halfway down the upper
> arm; the shirt is worn tucked in, over plain charcoal shorts. It is an
> inexpensive shirt and a plain one, but it fits him and it is clean and
> worn properly: a boy with little money who is looked after and takes care
> of himself. Ordinary and a bit closed-off — not cute, not heroic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** wear glasses of any kind; wear a
> striped top with blue shorts; resemble any existing Studio Ghibli
> character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **sad**: eyes lowered, brows slack,
> mouth a short downward curve; shoulders dropped, one hand held loosely at
> the collarbone. Keep every gesture at chest height or above.
>
> **Keep visible:** the single cowlick standing up at the back of the crown,
> and the cream collar — a different colour from the green shirt — sitting
> square and level on both shoulders.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

---

## Thảo — six drawings, `art/cast/thao/`

### Thảo · neutral

**File:** `art/cast/thao/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight warm brown-black hair
> cut to the jaw with a straight fringe, drawn as a few broad tufted masses
> and **tucked behind one ear so that one ear shows and the other is
> covered.** Eyes large and open, brows set high, a small closed half-smile
> — she is the one who is sure of things. A crisp white short-sleeved school
> shirt and a deep blue skirt: two clean blocks of colour, nothing on
> either. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink; wear a
> red dress; resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **neutral**: an ordinary talking
> face, mouth slightly open, no strong feeling; **one hand turned palm-up at
> chest height**, mid-explanation, the other arm easy beside her. Keep every
> gesture at chest height or above.
>
> **Keep visible:** the hair tucked behind one ear only, so one ear shows
> and the other is covered.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Thảo · happy

**File:** `art/cast/thao/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight warm brown-black hair
> cut to the jaw with a straight fringe, drawn as a few broad tufted masses
> and **tucked behind one ear so that one ear shows and the other is
> covered.** Eyes large and open, brows set high, a small closed half-smile
> — she is the one who is sure of things. A crisp white short-sleeved school
> shirt and a deep blue skirt: two clean blocks of colour, nothing on
> either. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink; wear a
> red dress; resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **happy**: a real open smile, eyes
> curved; **both hands closed into small fists in front of her chest**,
> pleased and a little vindicated — she did say so. Keep every gesture at
> chest height or above.
>
> **Keep visible:** the hair tucked behind one ear only, so one ear shows
> and the other is covered.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Thảo · worried

**File:** `art/cast/thao/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight warm brown-black hair
> cut to the jaw with a straight fringe, drawn as a few broad tufted masses
> and **tucked behind one ear so that one ear shows and the other is
> covered.** Eyes large and open, brows set high, a small closed half-smile
> — she is the one who is sure of things. A crisp white short-sleeved school
> shirt and a deep blue skirt: two clean blocks of colour, nothing on
> either. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink; wear a
> red dress; resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **worried**: brows raised and pulled
> together, mouth a small flat line; **one hand at her chin, the other arm
> folded across to support that elbow.** She is thinking about it rather
> than shrinking from it, and her shoulders stay square. Keep every gesture
> at chest height or above.
>
> **Keep visible:** the hair tucked behind one ear only, so one ear shows
> and the other is covered.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Thảo · annoyed

**File:** `art/cast/thao/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight warm brown-black hair
> cut to the jaw with a straight fringe, drawn as a few broad tufted masses
> and **tucked behind one ear so that one ear shows and the other is
> covered.** Eyes large and open, brows set high, a small closed half-smile
> — she is the one who is sure of things. A crisp white short-sleeved school
> shirt and a deep blue skirt: two clean blocks of colour, nothing on
> either. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink; wear a
> red dress; resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **annoyed**: brows down and level,
> one a little higher than the other, mouth pressed or turned down at one
> corner; **one index finger raised straight up**, about to correct
> somebody, the other hand flat against her collarbone. Keep every gesture
> at chest height or above.
>
> **Keep visible:** the hair tucked behind one ear only, so one ear shows
> and the other is covered.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Thảo · surprised

**File:** `art/cast/thao/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight warm brown-black hair
> cut to the jaw with a straight fringe, drawn as a few broad tufted masses
> and **tucked behind one ear so that one ear shows and the other is
> covered.** Eyes large and open, brows set high, a small closed half-smile
> — she is the one who is sure of things. A crisp white short-sleeved school
> shirt and a deep blue skirt: two clean blocks of colour, nothing on
> either. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink; wear a
> red dress; resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **surprised**: eyes wide and round,
> brows high, mouth open in a small circle; **both hands stopped open in the
> air exactly where they were**, the gesture she was making abandoned
> half-finished. Keep every gesture at chest height or above.
>
> **Keep visible:** the hair tucked behind one ear only, so one ear shows
> and the other is covered.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Thảo · sad

**File:** `art/cast/thao/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight warm brown-black hair
> cut to the jaw with a straight fringe, drawn as a few broad tufted masses
> and **tucked behind one ear so that one ear shows and the other is
> covered.** Eyes large and open, brows set high, a small closed half-smile
> — she is the one who is sure of things. A crisp white short-sleeved school
> shirt and a deep blue skirt: two clean blocks of colour, nothing on
> either. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink; wear a
> red dress; resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **sad**: eyes lowered, brows slack,
> mouth a short downward curve; **both hands clasped together in front of
> her chest.** Her shoulders stay square: she is the one who does not slump.
> Keep every gesture at chest height or above.
>
> **Keep visible:** the hair tucked behind one ear only, so one ear shows
> and the other is covered.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

---

## Bà Sáu — six drawings, `art/cast/basau/`

### Bà Sáu · neutral

**File:** `art/cast/basau/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose *áo bà ba* style tunic in one deep indigo — the
> quietest colour in the cast, because the children carry the bright ones.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **neutral**: an ordinary talking
> face, mouth slightly open, no strong feeling; **one thick forearm laid
> across below her chest, the other hand resting loosely closed on top of
> it.** Unhurried, and not going anywhere. Keep every gesture at chest
> height or above.
>
> **Keep visible:** the forearms, drawn noticeably thicker and stronger than
> anyone else's.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Bà Sáu · happy

**File:** `art/cast/basau/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose *áo bà ba* style tunic in one deep indigo — the
> quietest colour in the cast, because the children carry the bright ones.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **happy**: a real open smile, the
> eyes curving further into their two crescents; **one hand raised flat and
> open beside her head**, brushing the compliment away. Keep every gesture
> at chest height or above.
>
> **Keep visible:** the forearms, drawn noticeably thicker and stronger than
> anyone else's.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Bà Sáu · worried

**File:** `art/cast/basau/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose *áo bà ba* style tunic in one deep indigo — the
> quietest colour in the cast, because the children carry the bright ones.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **worried**: brows raised and pulled
> together, mouth a small flat line; **one hand pressed flat over her heart,
> the other gripping her own opposite forearm.** Worried about the money,
> never about herself. Keep every gesture at chest height or above.
>
> **Keep visible:** the forearms, drawn noticeably thicker and stronger than
> anyone else's.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Bà Sáu · annoyed

**File:** `art/cast/basau/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose *áo bà ba* style tunic in one deep indigo — the
> quietest colour in the cast, because the children carry the bright ones.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **annoyed**: brows down and level,
> mouth pressed flat and the deep line at each corner deeper; **one index
> finger raised straight up** between her and whoever she is talking to, the
> other forearm folded beneath it. Keep every gesture at chest height or
> above.
>
> **Keep visible:** the forearms, drawn noticeably thicker and stronger than
> anyone else's.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Bà Sáu · surprised

**File:** `art/cast/basau/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose *áo bà ba* style tunic in one deep indigo — the
> quietest colour in the cast, because the children carry the bright ones.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **surprised**: the eyes open to full
> circles — the only time they do — brows high, mouth open in a small
> circle; **both hands stopped in the air, palms forward and fingers
> spread**, caught in the middle of a job. Keep every gesture at chest
> height or above.
>
> **Keep visible:** the forearms, drawn noticeably thicker and stronger than
> anyone else's.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Bà Sáu · sad

**File:** `art/cast/basau/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose *áo bà ba* style tunic in one deep indigo — the
> quietest colour in the cast, because the children carry the bright ones.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **sad**: eyes lowered, brows slack,
> mouth a short downward curve; **both hands folded together and let down to
> just below her chest**, and very still. She does not bend. Keep every
> gesture at chest height or above.
>
> **Keep visible:** the forearms, drawn noticeably thicker and stronger than
> anyone else's.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

---

## Khoa — six drawings, `art/cast/khoa/`

### Khoa · neutral

**File:** `art/cast/khoa/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Warm brown-black hair, combed flat and
> lying smoother than anyone else's, with **a clean side parting** — the
> only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **neutral**: an ordinary talking
> face, mouth slightly open, no strong feeling; **the green notebook held
> flat against his chest in both hands**, arms at rest. The stillest figure
> in the cast. Keep every gesture at chest height or above.
>
> **Keep visible:** the clean side parting, and the green notebook — he has
> it in his hands in every panel, though what his hands do with it changes.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Khoa · happy

**File:** `art/cast/khoa/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Warm brown-black hair, combed flat and
> lying smoother than anyone else's, with **a clean side parting** — the
> only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **happy**: a real open smile, eyes
> curved; **the notebook lowered into one hand while the other lifts in a
> small open gesture**, and his shoulders come up slightly. Keep every
> gesture at chest height or above.
>
> **Keep visible:** the clean side parting, and the green notebook — he has
> it in his hands in every panel, though what his hands do with it changes.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Khoa · worried

**File:** `art/cast/khoa/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Warm brown-black hair, combed flat and
> lying smoother than anyone else's, with **a clean side parting** — the
> only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **worried**: brows raised and pulled
> together, mouth a small flat line; **both hands closed a little too
> tightly on the notebook**, holding it up against his chest like something
> to stand behind. Keep every gesture at chest height or above.
>
> **Keep visible:** the clean side parting, and the green notebook — he has
> it in his hands in every panel, though what his hands do with it changes.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Khoa · annoyed

**File:** `art/cast/khoa/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Warm brown-black hair, combed flat and
> lying smoother than anyone else's, with **a clean side parting** — the
> only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **annoyed**: brows down and level,
> mouth pressed — a mild and patient annoyance, never a sneer; **the
> notebook held closed in one hand at chest height, the other hand resting
> flat on its cover**, as if he had stopped reading mid-page. Keep every
> gesture at chest height or above.
>
> **Keep visible:** the clean side parting, and the green notebook — he has
> it in his hands in every panel, though what his hands do with it changes.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Khoa · surprised

**File:** `art/cast/khoa/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Warm brown-black hair, combed flat and
> lying smoother than anyone else's, with **a clean side parting** — the
> only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **surprised**: eyes wide and round,
> brows high, mouth open in a small circle; **the notebook slipping in his
> grip so that both hands catch at it** — the one moment his stillness
> breaks. Keep every gesture at chest height or above.
>
> **Keep visible:** the clean side parting, and the green notebook — he has
> it in his hands in every panel, though what his hands do with it changes.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

### Khoa · sad

**File:** `art/cast/khoa/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Warm brown-black hair, combed flat and
> lying smoother than anyone else's, with **a clean side parting** — the
> only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **sad**: eyes lowered, brows slack,
> mouth a short downward curve; **the notebook held closed in both hands and
> lowered to just below his chest**, forgotten. Keep every gesture at chest
> height or above.
>
> **Keep visible:** the clean side parting, and the green notebook — he has
> it in his hands in every panel, though what his hands do with it changes.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.

---

## Bống — six drawings, `art/cast/bong/`

### Bống · neutral

**File:** `art/cast/bong/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bống** — a small Vietnamese girl who looks about
> six or seven, much smaller than the others and drawn a little rounder:
> head large relative to the body, about one to four, with full cheeks.
> **Heavy black hair cut blunt at the jaw**, drawn as thick clumped tufts
> that hang and point downward as though it has just been wet, with **two
> strands stuck flat across one cheek.** Her eyes are the largest in the
> cast, drawn as **full circles**, with a clear **sea-green iris** — the only
> green eyes in the cast. She wears **one pale yellow short-sleeved shirt,
> several sizes too big**, borrowed: it slips wide across both shoulders and
> the sleeves are **rolled into thick cuffs at her elbows**. One block of
> colour, nothing on it. Reproduce that design exactly, with no change to
> hair, face, clothing, colour or proportion. **Must not:** have orange,
> ginger or red hair; wear a red dress; have a fish tail, fins, gills,
> scales, webbed fingers, whiskers or any fish or mermaid feature of any
> kind; have wings, a halo or a glow; wear a shell, a starfish, a flower or
> any ornament in her hair; carry a bucket, a jar or a fish; resemble any
> existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **neutral**: an ordinary talking
> face, mouth slightly open, no strong feeling. **Both hands held up at
> chest height, palms turned toward herself, fingers spread**, and her eyes
> going down to them — she has not had hands very long and has not stopped
> noticing them. Keep every gesture at chest height or above.
>
> **Keep visible:** the two strands of hair stuck flat across one cheek, and
> the thick rolled cuffs of a shirt that is too big for her.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.


### Bống · happy

**File:** `art/cast/bong/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bống** — a small Vietnamese girl who looks about
> six or seven, much smaller than the others and drawn a little rounder:
> head large relative to the body, about one to four, with full cheeks.
> **Heavy black hair cut blunt at the jaw**, drawn as thick clumped tufts
> that hang and point downward as though it has just been wet, with **two
> strands stuck flat across one cheek.** Her eyes are the largest in the
> cast, drawn as **full circles**, with a clear **sea-green iris** — the only
> green eyes in the cast. She wears **one pale yellow short-sleeved shirt,
> several sizes too big**, borrowed: it slips wide across both shoulders and
> the sleeves are **rolled into thick cuffs at her elbows**. One block of
> colour, nothing on it. Reproduce that design exactly, with no change to
> hair, face, clothing, colour or proportion. **Must not:** have orange,
> ginger or red hair; wear a red dress; have a fish tail, fins, gills,
> scales, webbed fingers, whiskers or any fish or mermaid feature of any
> kind; have wings, a halo or a glow; wear a shell, a starfish, a flower or
> any ornament in her hair; carry a bucket, a jar or a fish; resemble any
> existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **happy**: a wide open laugh, eyes
> squeezed into upward curves, head tipped back a little. **Both fists up
> beside her face**, shoulders lifted, the whole body in it — she is the
> only one in the cast who is delighted with her arms as well as her face.
> Keep every gesture at chest height or above.
>
> **Keep visible:** the two strands of hair stuck flat across one cheek, and
> the thick rolled cuffs of a shirt that is too big for her.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.


### Bống · worried

**File:** `art/cast/bong/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bống** — a small Vietnamese girl who looks about
> six or seven, much smaller than the others and drawn a little rounder:
> head large relative to the body, about one to four, with full cheeks.
> **Heavy black hair cut blunt at the jaw**, drawn as thick clumped tufts
> that hang and point downward as though it has just been wet, with **two
> strands stuck flat across one cheek.** Her eyes are the largest in the
> cast, drawn as **full circles**, with a clear **sea-green iris** — the only
> green eyes in the cast. She wears **one pale yellow short-sleeved shirt,
> several sizes too big**, borrowed: it slips wide across both shoulders and
> the sleeves are **rolled into thick cuffs at her elbows**. One block of
> colour, nothing on it. Reproduce that design exactly, with no change to
> hair, face, clothing, colour or proportion. **Must not:** have orange,
> ginger or red hair; wear a red dress; have a fish tail, fins, gills,
> scales, webbed fingers, whiskers or any fish or mermaid feature of any
> kind; have wings, a halo or a glow; wear a shell, a starfish, a flower or
> any ornament in her hair; carry a bucket, a jar or a fish; resemble any
> existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **worried**: brows raised and pulled
> together, eyes very round, mouth a small flat line. **Both hands laid flat
> on her own collarbone**, shoulders pulled up toward her ears. Keep every
> gesture at chest height or above.
>
> **Keep visible:** the two strands of hair stuck flat across one cheek, and
> the thick rolled cuffs of a shirt that is too big for her.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.


### Bống · annoyed

**File:** `art/cast/bong/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bống** — a small Vietnamese girl who looks about
> six or seven, much smaller than the others and drawn a little rounder:
> head large relative to the body, about one to four, with full cheeks.
> **Heavy black hair cut blunt at the jaw**, drawn as thick clumped tufts
> that hang and point downward as though it has just been wet, with **two
> strands stuck flat across one cheek.** Her eyes are the largest in the
> cast, drawn as **full circles**, with a clear **sea-green iris** — the only
> green eyes in the cast. She wears **one pale yellow short-sleeved shirt,
> several sizes too big**, borrowed: it slips wide across both shoulders and
> the sleeves are **rolled into thick cuffs at her elbows**. One block of
> colour, nothing on it. Reproduce that design exactly, with no change to
> hair, face, clothing, colour or proportion. **Must not:** have orange,
> ginger or red hair; wear a red dress; have a fish tail, fins, gills,
> scales, webbed fingers, whiskers or any fish or mermaid feature of any
> kind; have wings, a halo or a glow; wear a shell, a starfish, a flower or
> any ornament in her hair; carry a bucket, a jar or a fish; resemble any
> existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **annoyed**: brows down and level,
> chin tucked, **cheeks puffed out** and mouth pushed into a small pout —
> a small child digging in, never an adult's exasperation. **Both fists
> closed at chest height**, elbows in. Keep every gesture at chest height or
> above.
>
> **Keep visible:** the two strands of hair stuck flat across one cheek, and
> the thick rolled cuffs of a shirt that is too big for her.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.


### Bống · surprised

**File:** `art/cast/bong/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bống** — a small Vietnamese girl who looks about
> six or seven, much smaller than the others and drawn a little rounder:
> head large relative to the body, about one to four, with full cheeks.
> **Heavy black hair cut blunt at the jaw**, drawn as thick clumped tufts
> that hang and point downward as though it has just been wet, with **two
> strands stuck flat across one cheek.** Her eyes are the largest in the
> cast, drawn as **full circles**, with a clear **sea-green iris** — the only
> green eyes in the cast. She wears **one pale yellow short-sleeved shirt,
> several sizes too big**, borrowed: it slips wide across both shoulders and
> the sleeves are **rolled into thick cuffs at her elbows**. One block of
> colour, nothing on it. Reproduce that design exactly, with no change to
> hair, face, clothing, colour or proportion. **Must not:** have orange,
> ginger or red hair; wear a red dress; have a fish tail, fins, gills,
> scales, webbed fingers, whiskers or any fish or mermaid feature of any
> kind; have wings, a halo or a glow; wear a shell, a starfish, a flower or
> any ornament in her hair; carry a bucket, a jar or a fish; resemble any
> existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **surprised**: eyes wide and
> perfectly round, brows high, mouth a round open O. **Both hands flying
> open on either side of her face, fingers spread wide.** Keep every gesture
> at chest height or above.
>
> **Keep visible:** the two strands of hair stuck flat across one cheek, and
> the thick rolled cuffs of a shirt that is too big for her.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.


### Bống · sad

**File:** `art/cast/bong/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Studio Ghibli feature animation — **exactly the way the
> characters are drawn and painted in Hayao Miyazaki's *Ponyo* (2008)**:
> clean hand-drawn cel animation, a fine dark line around flat painted
> colour, with crisp hard-edged shadow shapes. Warm, soft and simple, but
> **painted, not sketched**: no pencil texture, no paper grain, no
> watercolour wash and no visible brushwork anywhere on the figure. Not
> modern TV anime, not moe, not manga, not American cartoon, not 3D, not
> photorealistic.
>
> **Line.** A fine, clean, confident contour of near-constant width,
> **closed and continuous all the way round the figure with no gaps** —
> dark, but warmed rather than pure black: a deep brown-black around hair
> and clothes, a warmer brown where the line meets skin. Never sketchy,
> never searching, never tapering into a brush stroke; no cross-hatching, no
> stippling, no visible pencil. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat painted cel fills — each area one solid colour, carrying
> **one hard-edged shadow tone** where the light does not reach, shaped to
> follow the form: under the chin, beneath the hair, under a sleeve, along
> the side turned away. Those shadow edges are crisp, never blurred and
> never faded. **A small round patch of pink on each cheek**, which is the
> one soft edge the figure is allowed. No gradients, no airbrushing, no
> glow, no paper texture, no brush grain, no ambient occlusion.
>
> **Palette.** Few colours, each of them clear and strong, laid down in
> **big simple blocks** — a whole garment is one colour. Bright and
> cheerful: clear yellow, warm red, grass green, sky blue, cream, deep
> charcoal. Never dusty, never greyed-off, never neon. Skin is a light warm
> peach with a slightly deeper peach as its shadow. Count the colours on a
> figure: three or four is right, and more than that means something has
> been over-detailed.
>
> **Figures.** Round and soft, with real anatomy underneath. Head large
> relative to the body — roughly one to five — with full cheeks and a
> rounded jaw. **Eyes are large and round**, with a clear white, a coloured
> iris, a black pupil and **one small white highlight**, a firm upper lid
> line above and a thin simple brow. The nose is a tiny curve or a soft dot;
> the mouth is one simple line that opens to a plain rounded shape when
> speaking. Hands are small and rounded, five fingers, no knuckle detail.
>
> **Hair.** One solid mass built from **thick clumped tufts ending in soft
> points**, the points drawn into the silhouette so the outline itself is
> tufted — never a smooth helmet, never separate strands, never glossy. The
> colour is a **warm brown-black rather than a pure flat black**, carrying
> one **flat lighter patch** in a paler, cooler tone where the light falls,
> hard-edged like every other shadow shape here.
>
> **Clothes.** Simple and bold: **one strong colour per garment**, plain
> shapes, and nothing fussy on them — no pattern, no print, no logo, no
> piping, no pockets, no visible seams and no buttons unless the character's
> own description asks for one. Each garment reads at a glance as a single
> block of colour.
>
> **The character.** **Bống** — a small Vietnamese girl who looks about
> six or seven, much smaller than the others and drawn a little rounder:
> head large relative to the body, about one to four, with full cheeks.
> **Heavy black hair cut blunt at the jaw**, drawn as thick clumped tufts
> that hang and point downward as though it has just been wet, with **two
> strands stuck flat across one cheek.** Her eyes are the largest in the
> cast, drawn as **full circles**, with a clear **sea-green iris** — the only
> green eyes in the cast. She wears **one pale yellow short-sleeved shirt,
> several sizes too big**, borrowed: it slips wide across both shoulders and
> the sleeves are **rolled into thick cuffs at her elbows**. One block of
> colour, nothing on it. Reproduce that design exactly, with no change to
> hair, face, clothing, colour or proportion. **Must not:** have orange,
> ginger or red hair; wear a red dress; have a fish tail, fins, gills,
> scales, webbed fingers, whiskers or any fish or mermaid feature of any
> kind; have wings, a halo or a glow; wear a shell, a starfish, a flower or
> any ornament in her hair; carry a bucket, a jar or a fish; resemble any
> existing Studio Ghibli character.
>
> **Framing.** Draw the character from the **chest up** — head, shoulders,
> upper chest, and both arms and hands. The character is in **three-quarter
> view, not facing the camera**: body and head turned about 30 to 45 degrees
> off straight-on, **looking toward the right-hand side of the frame**, as
> if speaking to somebody standing off to their right — never out at the
> reader. The picture is **square, 1:1**, with the figure centred across it
> and sitting on the bottom edge. Leave a little clear space at the top and
> both sides: **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** The expression is **sad**: eyes lowered, brows drawn
> up in the middle, mouth small and turned down at one corner. **Both hands
> gripping the rolled cuffs of her sleeves and pulling them down over her
> knuckles**, arms held close in front of her. Keep every gesture at chest
> height or above.
>
> **Keep visible:** the two strands of hair stuck flat across one cheek, and
> the thick rolled cuffs of a shirt that is too big for her.
>
> **The background** is pure flat white #FFFFFF, edge to edge, with no
> shadow under or behind the figure, no gradient, no texture and no paper
> tone. **Do not draw a transparency checkerboard** — the background is one
> single uniform colour across the whole image. Plain white, and nothing
> else.
>
> **Do not include:** a second figure, a second pose, an inset, a border, a
> frame, or any division of the picture; any text, letters, numbers,
> captions, watermarks, signatures, speech bubbles or logos; motion lines.
> No exaggerated screaming-face gags. No sparkles or glows.


# Part 2 — the background plates

A plate is the place with **nobody in it**: the cast is composited on top, so a
figure drawn into the plate would appear beside itself.

Attach **the style reference only.** There are no characters in a plate.

Unit 1 needs `harbour-wall` and nothing else. The other ten are for the
chapters after it.

The four the whole year keeps coming back to are `harbour-wall`, `kitchen`,
`school-yard` and `fish-market` — the fixed furniture. Those are worth the
extra re-rolls; the rest appear once or twice each.

---

## 1. The harbour wall — background plate

**File:** `harbour-wall.jpg`  ·  **this is the one unit 1 needs**

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> The concrete sea wall along a fishing quarter, late morning, hot and
> bright. Worn concrete across the near ground with a rusted iron ladder set
> into its face; a metre below the top, the tide line dark and green with
> weed. Blue-hulled wooden fishing boats with painted eyes ride at their
> moorings beyond it, and two round woven basket boats lie upturned on the
> strip of sand at one side. Short chalk marks climb the wall's face in a
> ragged vertical line. Across the water the far side of the bay is a low
> green headland under a wide bright sky.

---

## 2. Bà Sáu's kitchen — background plate

**File:** `kitchen.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A small coastal kitchen interior, morning, seen from standing height. A
> low table with enamel bowls and a tin kettle, a blue plastic stool, a
> string of split dried fish hanging in the window, a cleaver on a board, a
> gas ring on the floor. Through the open doorway — a rectangle of hot white
> light — a concrete yard with a big glazed water butt standing in it under
> a tin lid. Plain, swept, cared for.

---

## 3. The school yard — background plate

**File:** `school-yard.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A concrete school yard in flat hard midday light. A painted noticeboard
> on a yellow-washed wall, a flame tree in full red flower throwing a hard
> shadow, a bicycle rack. Along one side a low wall, and below and beyond it
> the roofs of the fishing quarter and the blue of the bay.

---

## 4. The fish market — background plate

**File:** `fish-market.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A covered market lane at the fishing port before dawn, lit by bare bulbs
> strung down the middle. Shallow round baskets and blue plastic crates on
> both sides, heaped with crushed ice and fish; wet concrete underfoot
> throwing the bulbs back; a hanging spring balance; a stack of empty
> crates; a coil of orange rope. Past the far end of the lane, the dark blue
> of the harbour before sunrise and the working lights of one boat.

---

## 5. The lane — background plate

**File:** `lane.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A narrow lane between close-packed low concrete houses, running steeply
> downhill, early evening. Warm light out of open doorways, washing strung
> overhead, a motorbike leaned against a wall, a tangle of electrical wires
> crossing above. At the bottom of the slope, a slot of dark sea and one
> boat's light on it.

---

## 6. The town beach — background plate

**File:** `town-beach.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A city beach and its promenade, late afternoon. A long crescent of pale
> gold sand, coconut palms and a low painted sea wall along a paved walkway,
> hotel fronts set back behind them. The sea goes turquoise to deep blue. A
> dark green headland closes the far end of the bay.

---

## 7. The science room — background plate

**File:** `science-room.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A school science room after hours, lit by one desk lamp against a
> darkening window. A scarred wooden bench in the near ground carrying a
> circuit board, a screwdriver, a battery pack and two enamel cups. Shelves
> of jars and glassware behind, a wall chart, a stool pushed back. Outside
> the window, blue evening and the lights of the harbour below.

---

## 8. The flooded street — background plate

**File:** `flooded-street.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A town street under still brown-green water, grey overcast light after a
> storm, utterly quiet. The water stands halfway up the ground-floor
> shopfronts. A wooden fishing boat is tied to a lamp post out in the middle
> of what was the road. The top curve of a market awning, a road sign and a
> motorbike's mirror break the surface. Washing still hangs from the
> balconies above, and the sky is beginning to clear at one edge.

---

## 9. The headland road — background plate

**File:** `cliff-road.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A road along a rocky headland at first light, the sky going from deep
> blue to peach. Boulders and low wind-cut scrub on the seaward side, the
> open sea far below and pale, a crash barrier with its paint gone. At the
> end of the point stands a white lighthouse with a red-brown lantern
> house.

---

## 10. The whale shrine — background plate

**File:** `whale-temple.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A small village whale shrine on the sand at night, lit by lanterns. A low
> painted gate and a tiled roof over a single open hall; outside it a table
> under a red cloth carrying fruit, rice and burning incense; inside, dim
> and deep, the pale curve of very large bones resting on a wooden stand.
> Painted concrete, faded, swept and cared for — a working village shrine,
> not a tourist temple. Beyond the sand, small lanterns drifting out on
> black water.

---

## 11. Under the harbour — background plate

**File:** `under-water.jpg`

> **If a style reference image is attached**, match **the way its background
> is painted** — its colouring, its light, its softness and its texture. Do
> not copy or quote any character in it, and do not carry the figures' clean
> cel line into the plate: a plate has almost no line. If nothing is
> attached, follow the written style exactly as described.
>
> **Art style.** Hand-painted Studio Ghibli background art in the manner of
> Hayao Miyazaki's *Ponyo* (2008) — watercolour and coloured pencil on
> paper, soft, warm and luminous. Not modern TV anime, not manga, not
> American cartoon, not 3D, not photorealistic, not digital-airbrushed.
>
> **Line.** Almost no outline: form is made by **painted shape and edge**
> rather than by drawn contour, with at most a soft pencil line catching an
> important edge. No heavy black ink outline, no cross-hatching, no
> scribbled linework.
>
> **Colour.** Watercolour and coloured pencil — layered, gently uneven
> washes with the tooth of the paper showing and soft edges where two washes
> meet. Warm, bright and full without being harsh: the light of a hot
> morning. Soft gradients in the sky and the water are welcome. No
> airbrushed glow, no digital gloss, no lens blur and no depth-of-field.
> Depth is shown by **paler, cooler washes and less detail in the
> distance.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The central Việt Nam coast in watercolour: turquoise
> shallows going to deep blue, pale gold sand, sun-bleached whitewash and
> ochre concrete, red-brown roof tiles, the cobalt blue and red of painted
> boat hulls, bright sky. One object is given a colour used nowhere else in
> the frame — that is where the eye lands.
>
> **Setting discipline.** Quy Nhơn, a beach city on the central coast of
> Việt Nam, present day: a working fish harbour at one end of a wide bay and
> a hotel promenade at the other, with green headlands closing both ends.
> Bãi Sẻ, its fishing quarter, is close-packed low concrete houses running
> steeply down to the water, plain and cared for. The boats are **wooden
> Vietnamese fishing boats — blue hulls with a red or white stripe, a high
> curved prow, and an eye painted on each bow** — and small round woven
> **thúng chai** basket boats pulled up on the sand. **Nothing Japanese** —
> no sliding paper doors, no tatami, no Japanese suburban houses, no vacant
> lot with stacked concrete pipes, no Japanese signage. No junks, no mat
> sails, no Western dinghies or yachts. No strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye
> level looking straight ahead. Keep the **lower third of the frame simple
> and uncluttered** — figures will be placed there and detail behind them is
> lost. Keep the interest in the middle and upper thirds. Nothing important
> in the top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> sparkles, glows or lens flare.
>
> **No people and no characters of any kind anywhere in the frame.** Small
> reef fish are part of the place and are welcome — nothing bigger than a
> hand, and nothing that reads as a character.
>
> Underwater, looking along a shallow seabed in mid-morning light. Shafts
> of green-gold light come down through the surface above. Branching and
> plate coral heads crowd around the barnacled chain and concrete block of a
> mooring; small bright reef fish hang over them; pale sand and a bed of
> seagrass run off into a blue-green haze. Above and behind, the dark
> underside of a moored hull.

---

# After you generate

Save each drawing as `art/cast/<slug>/<emotion>.png` — a folder per character,
the emotion as the filename — then compose:

```sh
python3 tools/make_sheet.py ti        # one character
python3 tools/make_sheet.py --all     # everybody who has a full set
python3 tools/check_cast.py           # what is declared, and what is drawn
python3 tools/build.py                # then reload Unit 1 Lesson 1
```

`make_sheet.py` does four things you therefore do not have to:

1. **Squares each drawing** by padding, never cropping and never stretching,
   centred across and sitting on the bottom edge — so the character stands on
   the floor of the panel instead of floating like a sticker.
2. **Keys the white out**, *if there is any* — and saves with an alpha channel.
   It floods inward from the border rather than removing all white globally, so
   Thảo's and Khoa's white shirts survive: the figure's closed contour is what
   separates the white inside an outline from the white outside it. A drawing
   that already arrives cut out is detected and left alone, which matters more
   than it sounds: keying a transparent PNG again used to flatten it onto black.
3. **Composes the 3 × 2 grid** at one cell size, in the panel order
   `data/cast.json` declares. Six equal squares, identically placed, by
   arithmetic.
4. **Sizes and encodes it for the page** — 640 px panels, saved as WebP. The
   panel is drawn at 74% of a stage capped at 26 rem, so an avatar is never
   more than about 310 CSS px tall; 640 covers that at 2× and anything past it
   is bytes nobody can see, multiplied by six. WebP q90 rather than PNG is
   measured, not assumed: the sheet is 1008 KB as RGBA PNG and 209 KB at q90,
   with no difference visible at 2× zoom.

   > **Palette PNG was tried first, and rejected.** Indexed colour is the
   > textbook answer for flat cel art and it is wrong for *this* art: the
   > drawings have soft shading through the hair and a soft-edged cheek blush,
   > so 64–128 colours speckles the one and rings the other. If you ever
   > reach for `pngquant` here, look at a cheek at 2× before you keep it.

So the geometry the page depends on is now guaranteed rather than hoped for, and
none of it is the generator's job.

## Why one drawing at a time

The first version of this file asked for the whole six-panel sheet in one
generation. It came back with **eight panels, four times running.** Two reasons,
and both are worth knowing before writing any image prompt:

- **Multi-panel layout is the weakest thing these models do.** A four-across
  contact sheet is far commoner in training data than three-across, and a long
  prompt full of style and character constraints leaves layout competing for
  what attention is left.
- **Negation does not work.** The prompt said "not four, not eight, not nine",
  which put those numbers *in* the prompt. Diffusion models have no reliable
  representation of "not", so naming a number raises its salience however the
  sentence is phrased. That instruction was making the problem worse.

The fix is not a better-worded grid instruction. It is to ask for the one thing
the model is good at — a single figure with a single expression — and do the
layout in code, where six equal squares is four lines of arithmetic that cannot
come back as eight.

Two things you still do **not** have to do:

- **Do not draw a character facing both ways.** The page mirrors whoever stands
  on the right, so each character is drawn once, looking toward the right of the
  frame, and the layout turns them around.

  > **Why that direction and not the other.** The left-hand speaker is drawn as
  > it comes; the right-hand speaker is flipped horizontally. A character drawn
  > looking right therefore looks *inward* on the left of the panel, and —
  > flipped — looks inward on the right of it too, so the two speakers face each
  > other across the balloon. Drawn looking left, both would stare off the edge
  > of the frame away from the person they are talking to. This is the one place
  > where getting the art backwards is invisible until it is composited.
  >
  > **What mirroring costs, stated plainly.** A flipped character has their
  > asymmetry reversed: Thảo's tucked ear swaps sides, Khoa's parting swaps
  > sides, and the two strands of hair stuck to Bống's *left* cheek read as
  > stuck to her right one whenever she speaks second. Nobody has ever noticed this in a comic, and the alternative
  > is drawing every character twice. Accepted deliberately; do not "fix" it by
  > drawing a second facing.

- **Do not rename or reorder anything.** The emotion filenames and their panel
  order are the `col` index in `data/cast.json`; the composer reads that order
  and the page reads it back. Changing one without the other silently gives
  every character the wrong face.

# If a generation drifts

| Symptom | Fix |
| --- | --- |
| A character resembles a Studio Ghibli character — Bống acquires orange hair or a red dress, a girl acquires a red dress, a boy a striped shirt and blue shorts | Demote the reference image to *style only*, saying so in the prompt, and paste that character's **must not** line in verbatim. Do not keep a "close enough" variant; it contaminates everything fed from it. A *Ponyo* still pulls harder on the cast than the Doraemon reference did, because its children are the same age as ours |
| The figure comes back hollow, ragged-edged or missing part of a shirt after composing | The outline had a gap and `make_sheet.py`'s flood went through it, or the colour faded out past the line and the keyer took the pale edge with it. Both are drawing faults, not tool faults. Re-paste **Line** and re-roll. This is why the cast is specified as cel rather than painted: a closed line is the wall the transparency step leans on |
| Tí's shirt sags, gapes at the neck or slips off a shoulder | The clothing description was summarised. Re-paste **his clothes are simple and tidy** in full — the collar square on both shoulders, closed at the neck, the shirt cut to fit. He is a poor child, and poor is drawn as *plain and cared for*, never as unkempt: a sliding neckline reads as neglect, and it is the main character it reads it of |
| Tí's hair comes back as a shaggy overgrown mop, or his face sours into a scowl | Same defect as the shirt, in the other two places it can happen. The style draws hair as thick pointed tufts, so the line between *tousled* and *unkempt* is the **cut**, not the tufts: his is short, above the ears, clear of the collar, tidy in silhouette, with **one** cowlick standing up at the crown. Involuntary reads as charm; overgrown reads as neglect. The brow is level and the look watchful, not glowering — this is the character the reader has to like for twelve chapters |
| A garment comes back with a pattern, a pocket, a seam, a logo or a second colour | Re-paste **Clothes**. One strong colour per garment is the reference's whole clothing language — a plain tee, plain shorts — and detail is what a generator adds when it has spare attention. The two deliberate exceptions are Tí's cream collar and Khoa's buttons, and both are named in their own descriptions |
| The colours come back dusty, muted, muddy or washed out | Re-paste **Palette**. Poverty in this story is drawn as *plain*, never as *drab*: the shirt is a clear leaf green, not a greyed one. Muted colour is also the commonest way a generator says "nostalgic", and it is wrong here — the film these are drawn from is bright |
| Tí's collar comes back the same green as the shirt, or the cream spreads to the sleeves | The contrast is the point and it is the first thing a summariser drops. Two flat colours on the garment: green body, cream collar and placket. Collarless or single-colour is a re-roll — a plain tee is what made him read as slovenly in the first place |
| A character comes back sketchy, grainy or watercoloured | The film's coloured-pencil quality is in its **backgrounds**; its people are cel-painted. Re-paste **Art style** — *painted, not sketched* — and **Colour** in full. Do not borrow Part 2's vocabulary for a Part 1 prompt; that swap is what produces a soft sketch of a child instead of a Ghibli character |
| It comes back as glossy modern digital anime — airbrushed skin, gradient shading, shining hair | Re-paste **Line**, **Colour** and **Figures** in full; they are the whole defence and they degrade the moment they are summarised. The words that pull it back are *flat colour*, *one hard-edged shadow shape* and *cel* |
| A drawing comes back as a grid, a sheet or a set of panels | Every prompt asks for one figure with one expression. Re-roll rather than cropping a panel out of it — a cropped cell will not share a scale or an eye level with the other five, and `make_sheet.py` cannot fix a mismatch it was never given |
| Two characters come back doing the same thing with their hands | The pose was taken from another character's block, or from the old shared wording. Each character's six poses are their own — see the note under *Part 1* — and the tell is a column of the finished sheet where everybody is sad identically. Re-paste that character's own **The expression** line |
| The head jumps or resizes between expressions | The six drawings were framed differently. `make_sheet.py` squares and scales them to one cell but cannot re-frame a head — re-roll the odd one out, matching the head size and eye level of the `neutral` drawing, which is the one to draw first and judge the rest against |
| An avatar has a white box behind it | `make_sheet.py` keys the white itself, so this means it found none to key — check the drawing's background really is white and not a very pale grey, or re-run with the tolerance in mind |
| A drawing comes back with a grey-and-white chequered pattern behind the figure | The generator has *drawn* a transparency checkerboard instead of leaving alpha. Re-roll: every prompt already forbids it by name, so this is a miss rather than an ambiguity, and a drawn checkerboard is much harder to key than plain white |
| The characters look out at the reader, or the two speakers face away from each other | It was drawn square to the camera, or drawn looking *left*. Both must be three-quarter and looking toward the **right** of the frame — the page flips the right-hand speaker, so a left-looking sheet points both of them off the edges. Re-roll; it cannot be fixed by flipping the file, which would reverse the character's own asymmetry (Thảo's exposed ear, Khoa's parting, the strands on Bống's left cheek) |
| Keying the white also ate a white shirt | Something other than `make_sheet.py` was used, globally. The composer floods inward from the border instead, so the closed contour keeps the shirt's white separate from the background's — provided the contour is closed |
| A plate comes back with people in it | Repeat the "no people, no animals" clause as the **first** line of the description rather than the last. It must be re-rolled, not painted out: the cast is composited on top and a drawn figure appears beside itself |
| A plate comes back vague, empty or blurred | The style's whole contrast is simple figures against a literal world, and "watercolour" is an invitation to be vague that the plates must refuse. Re-paste **Backgrounds carry the realism** and name three specific objects the plate must contain |
| The setting drifts Japanese — sliding doors, a suburban street, a vacant lot with concrete pipes | Expected: it is copying the reference's *world* along with its style. Re-paste **Setting discipline** and add three objects only this coast has — a blue-hulled boat with an eye painted on the bow, a round woven *thúng chai* on the sand, a glazed water butt under a tin lid |
| Bống comes back with fins, gills, scales, webbed fingers or a tail | The prompt said *sea-child* somewhere it should not have, or the reference is pulling. Her prompt never says what she is — she is a small girl in a borrowed shirt and that is the whole description. Re-paste her **must not** line verbatim; do not soften it to "no obvious fish features", because a partial version reads as permission |
| Bống reads as the same age as Tí and Thảo | She is drawn at roughly one-to-four head to body where they are one-to-five, and she is *much* smaller in frame. The two ages are the only thing that separates her silhouette from Thảo's at panel size, so re-roll rather than accepting a tall version |
| Text appears in the image | Gemini adds signage unprompted in street scenes. Keep the "no text, no letters" clause and re-roll — it is not reliably fixable by inpainting |
