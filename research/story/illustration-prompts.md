# Illustration prompts — *The Calling Lamp*

Every prompt the site's art needs, and nothing else. Written for **Gemini**
(Nano Banana / Imagen). Each block is complete: paste it, generate, save.

The Getting Started dialogue on every Lesson 1 page is a **comic** — a
background plate, the speaker, one speech balloon, advancing as the reader
scrolls. So there are exactly two kinds of image, and the page composites them:

| | What | Files |
| --- | --- | --- |
| **Part 1** | Thirty drawings — five characters × six expressions, one square picture each, chest up, on flat white | `docs/assets/cast/<slug>/<emotion>.png` |
| | …composed by `tools/make_sheet.py` into the 3 × 2 sheet the page loads | `docs/assets/cast/<slug>.png` |
| **Part 2** | Nine background plates — the story's places, drawn empty | `docs/assets/bg/<slug>.jpg` |

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

**Optionally attach the Doraemon graphic** as a style reference. Each prompt
already tells the model what to do with it *and* describes the whole style in
words, so a prompt works either way — attaching it just makes the line and the
flat colour land faster. It is the only attachment any prompt wants.

The house look is Fujiko F. Fujio's line and flat colour applied to a Mekong
delta town. The style is the borrowed part; the cast is not, which is what the
**must not** line in every character prompt is defending.

**What unit 1 needs:** Part 1 §1 (Tí), Part 1 §2 (Thảo) and Part 2 §1
(`canal-landing`). Everything else is for the chapters after it, and the other
eleven dialogues read as plain text until they are staged.

---

# Part 1 — the character drawings

**Thirty drawings: five characters × six expressions, one image each.** Each is
a single square picture of one character — no grids, no sheets, no panels.
`tools/make_sheet.py` composes each set of six into the 3 × 2 sheet the page
loads, so the layout is arithmetic rather than something a generator has to get
right.

Save each one as `docs/assets/cast/<slug>/<emotion>.png`, then run
`python3 tools/make_sheet.py <slug>`.

---

## Tí — six drawings, `docs/assets/cast/ti/`

### Tí · neutral

**File:** `docs/assets/cast/ti/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children. Narrow and slightly caved-in, one
> shoulder lower than the other where an oversized shirt slips off it. Black
> hair in an uneven spiky cluster with **one cowlick standing up at the back
> of the crown** that never lies flat. Eyes smallish and round under a low
> flat brow line, giving a permanently slightly wary look. A faded
> jade-green t-shirt a size too big. Ordinary and a bit closed-off — not
> cute, not heroic. Reproduce that design exactly, with no change to hair,
> face, clothing, colour or proportion. **Must not:** wear
> glasses of any kind; wear a yellow top with blue shorts; resemble any
> existing Doraemon character.
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
> **Keep visible:** the single cowlick standing up at the back of the crown.
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

**File:** `docs/assets/cast/ti/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children. Narrow and slightly caved-in, one
> shoulder lower than the other where an oversized shirt slips off it. Black
> hair in an uneven spiky cluster with **one cowlick standing up at the back
> of the crown** that never lies flat. Eyes smallish and round under a low
> flat brow line, giving a permanently slightly wary look. A faded
> jade-green t-shirt a size too big. Ordinary and a bit closed-off — not
> cute, not heroic. Reproduce that design exactly, with no change to hair,
> face, clothing, colour or proportion. **Must not:** wear
> glasses of any kind; wear a yellow top with blue shorts; resemble any
> existing Doraemon character.
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
> **Keep visible:** the single cowlick standing up at the back of the crown.
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

**File:** `docs/assets/cast/ti/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children. Narrow and slightly caved-in, one
> shoulder lower than the other where an oversized shirt slips off it. Black
> hair in an uneven spiky cluster with **one cowlick standing up at the back
> of the crown** that never lies flat. Eyes smallish and round under a low
> flat brow line, giving a permanently slightly wary look. A faded
> jade-green t-shirt a size too big. Ordinary and a bit closed-off — not
> cute, not heroic. Reproduce that design exactly, with no change to hair,
> face, clothing, colour or proportion. **Must not:** wear
> glasses of any kind; wear a yellow top with blue shorts; resemble any
> existing Doraemon character.
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
> **Keep visible:** the single cowlick standing up at the back of the crown.
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

**File:** `docs/assets/cast/ti/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children. Narrow and slightly caved-in, one
> shoulder lower than the other where an oversized shirt slips off it. Black
> hair in an uneven spiky cluster with **one cowlick standing up at the back
> of the crown** that never lies flat. Eyes smallish and round under a low
> flat brow line, giving a permanently slightly wary look. A faded
> jade-green t-shirt a size too big. Ordinary and a bit closed-off — not
> cute, not heroic. Reproduce that design exactly, with no change to hair,
> face, clothing, colour or proportion. **Must not:** wear
> glasses of any kind; wear a yellow top with blue shorts; resemble any
> existing Doraemon character.
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
> **Keep visible:** the single cowlick standing up at the back of the crown.
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

**File:** `docs/assets/cast/ti/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children. Narrow and slightly caved-in, one
> shoulder lower than the other where an oversized shirt slips off it. Black
> hair in an uneven spiky cluster with **one cowlick standing up at the back
> of the crown** that never lies flat. Eyes smallish and round under a low
> flat brow line, giving a permanently slightly wary look. A faded
> jade-green t-shirt a size too big. Ordinary and a bit closed-off — not
> cute, not heroic. Reproduce that design exactly, with no change to hair,
> face, clothing, colour or proportion. **Must not:** wear
> glasses of any kind; wear a yellow top with blue shorts; resemble any
> existing Doraemon character.
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
> **Keep visible:** the single cowlick standing up at the back of the crown.
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

**File:** `docs/assets/cast/ti/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Tí** — a thirteen-year-old Vietnamese boy, the
> smallest and thinnest of the children. Narrow and slightly caved-in, one
> shoulder lower than the other where an oversized shirt slips off it. Black
> hair in an uneven spiky cluster with **one cowlick standing up at the back
> of the crown** that never lies flat. Eyes smallish and round under a low
> flat brow line, giving a permanently slightly wary look. A faded
> jade-green t-shirt a size too big. Ordinary and a bit closed-off — not
> cute, not heroic. Reproduce that design exactly, with no change to hair,
> face, clothing, colour or proportion. **Must not:** wear
> glasses of any kind; wear a yellow top with blue shorts; resemble any
> existing Doraemon character.
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
> **Keep visible:** the single cowlick standing up at the back of the crown.
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

## Thảo — six drawings, `docs/assets/cast/thao/`

### Thảo · neutral

**File:** `docs/assets/cast/thao/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight black hair cut to the
> jaw with a straight fringe, **tucked behind one ear so that one ear shows
> and the other is covered.** Eyes large and open, brows set high, a small
> closed half-smile — she is the one who is sure of things. White
> short-sleeved school shirt, dark blue skirt. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/thao/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight black hair cut to the
> jaw with a straight fringe, **tucked behind one ear so that one ear shows
> and the other is covered.** Eyes large and open, brows set high, a small
> closed half-smile — she is the one who is sure of things. White
> short-sleeved school shirt, dark blue skirt. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/thao/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight black hair cut to the
> jaw with a straight fringe, **tucked behind one ear so that one ear shows
> and the other is covered.** Eyes large and open, brows set high, a small
> closed half-smile — she is the one who is sure of things. White
> short-sleeved school shirt, dark blue skirt. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/thao/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight black hair cut to the
> jaw with a straight fringe, **tucked behind one ear so that one ear shows
> and the other is covered.** Eyes large and open, brows set high, a small
> closed half-smile — she is the one who is sure of things. White
> short-sleeved school shirt, dark blue skirt. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/thao/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight black hair cut to the
> jaw with a straight fringe, **tucked behind one ear so that one ear shows
> and the other is covered.** Eyes large and open, brows set high, a small
> closed half-smile — she is the one who is sure of things. White
> short-sleeved school shirt, dark blue skirt. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/thao/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Thảo** — a thirteen-year-old Vietnamese girl, the
> same height as Tí or a little taller. Upright and square-shouldered,
> deliberately **asymmetric at the head**: straight black hair cut to the
> jaw with a straight fringe, **tucked behind one ear so that one ear shows
> and the other is covered.** Eyes large and open, brows set high, a small
> closed half-smile — she is the one who is sure of things. White
> short-sleeved school shirt, dark blue skirt. Reproduce that design
> exactly, with no change to hair, face, clothing, colour or proportion.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink;
> resemble any existing Doraemon character.
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

## Bà Sáu — six drawings, `docs/assets/cast/basau/`

### Bà Sáu · neutral

**File:** `docs/assets/cast/basau/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose brown-and-indigo *áo bà ba* style tunic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/basau/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose brown-and-indigo *áo bà ba* style tunic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/basau/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose brown-and-indigo *áo bà ba* style tunic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/basau/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose brown-and-indigo *áo bà ba* style tunic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/basau/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose brown-and-indigo *áo bà ba* style tunic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Doraemon character.
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

**File:** `docs/assets/cast/basau/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose brown-and-indigo *áo bà ba* style tunic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn frail, bent or sweet;
> resemble any existing Doraemon character.
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

## Khoa — six drawings, `docs/assets/cast/khoa/`

### Khoa · neutral

**File:** `docs/assets/cast/khoa/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Black hair, flat and combed, with **a
> clean side parting** — the only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Doraemon character.
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
> **Keep visible:** the clean side parting, and the green notebook held flat
> against his side.
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

**File:** `docs/assets/cast/khoa/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Black hair, flat and combed, with **a
> clean side parting** — the only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Doraemon character.
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
> **Keep visible:** the clean side parting, and the green notebook held flat
> against his side.
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

**File:** `docs/assets/cast/khoa/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Black hair, flat and combed, with **a
> clean side parting** — the only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Doraemon character.
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
> **Keep visible:** the clean side parting, and the green notebook held flat
> against his side.
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

**File:** `docs/assets/cast/khoa/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Black hair, flat and combed, with **a
> clean side parting** — the only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Doraemon character.
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
> **Keep visible:** the clean side parting, and the green notebook held flat
> against his side.
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

**File:** `docs/assets/cast/khoa/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Black hair, flat and combed, with **a
> clean side parting** — the only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Doraemon character.
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
> **Keep visible:** the clean side parting, and the green notebook held flat
> against his side.
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

**File:** `docs/assets/cast/khoa/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Black hair, flat and combed, with **a
> clean side parting** — the only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion. **Must not:** be drawn as a rival or a snob;
> resemble any existing Doraemon character.
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
> **Keep visible:** the clean side parting, and the green notebook held flat
> against his side.
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

## Mun — six drawings, `docs/assets/cast/mun/`

### Mun · neutral

**File:** `docs/assets/cast/mun/neutral.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Mun** — a thin black cat, ordinary house-cat size and
> build, **on four legs**. Low, lean, slightly scruffy, ribs faintly
> suggested by two short lines. Solid flat black with a single flat
> dark-grey band along the spine as its only shading. Amber-gold eyes drawn
> as full circles with a **vertical slit pupil** — the only slit pupils in
> the cast. A scholar's air he has not earned. Reproduce that design
> exactly, with no change to colour or proportion. **Must
> not:** be blue, or blue-and-white; have a white belly or a pouch; wear a
> collar, bell, clothing or any prop; stand upright, walk on two legs, sit
> like a person, or have round mitten paws; resemble any existing Doraemon
> character.
>
> **Framing.** Draw the cat's head, shoulders and front legs, on four legs,
> cropped straight across mid-body. He never sits like a person and never
> stands on two legs. The character is in **three-quarter view, not facing
> the camera**: body and head turned about 30 to 45 degrees off straight-on,
> **looking toward the right-hand side of the frame**, as if speaking to
> somebody standing off to their right — never out at the reader. The
> picture is **square, 1:1**, with the figure centred across it and sitting
> on the bottom edge. Leave a little clear space at the top and both sides:
> **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** His expression is **neutral**: ears up, eyes level,
> mouth slightly open as if talking. The feeling is carried by the ears, the
> eyes and the set of the shoulders — never by arms, hands or human posture.
>
> **Keep visible:** the one torn left ear.
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

### Mun · happy

**File:** `docs/assets/cast/mun/happy.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Mun** — a thin black cat, ordinary house-cat size and
> build, **on four legs**. Low, lean, slightly scruffy, ribs faintly
> suggested by two short lines. Solid flat black with a single flat
> dark-grey band along the spine as its only shading. Amber-gold eyes drawn
> as full circles with a **vertical slit pupil** — the only slit pupils in
> the cast. A scholar's air he has not earned. Reproduce that design
> exactly, with no change to colour or proportion. **Must
> not:** be blue, or blue-and-white; have a white belly or a pouch; wear a
> collar, bell, clothing or any prop; stand upright, walk on two legs, sit
> like a person, or have round mitten paws; resemble any existing Doraemon
> character.
>
> **Framing.** Draw the cat's head, shoulders and front legs, on four legs,
> cropped straight across mid-body. He never sits like a person and never
> stands on two legs. The character is in **three-quarter view, not facing
> the camera**: body and head turned about 30 to 45 degrees off straight-on,
> **looking toward the right-hand side of the frame**, as if speaking to
> somebody standing off to their right — never out at the reader. The
> picture is **square, 1:1**, with the figure centred across it and sitting
> on the bottom edge. Leave a little clear space at the top and both sides:
> **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** His expression is **happy**: eyes curved to two upward
> arcs, ears forward, head slightly raised. The feeling is carried by the
> ears, the eyes and the set of the shoulders — never by arms, hands or
> human posture.
>
> **Keep visible:** the one torn left ear.
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

### Mun · worried

**File:** `docs/assets/cast/mun/worried.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Mun** — a thin black cat, ordinary house-cat size and
> build, **on four legs**. Low, lean, slightly scruffy, ribs faintly
> suggested by two short lines. Solid flat black with a single flat
> dark-grey band along the spine as its only shading. Amber-gold eyes drawn
> as full circles with a **vertical slit pupil** — the only slit pupils in
> the cast. A scholar's air he has not earned. Reproduce that design
> exactly, with no change to colour or proportion. **Must
> not:** be blue, or blue-and-white; have a white belly or a pouch; wear a
> collar, bell, clothing or any prop; stand upright, walk on two legs, sit
> like a person, or have round mitten paws; resemble any existing Doraemon
> character.
>
> **Framing.** Draw the cat's head, shoulders and front legs, on four legs,
> cropped straight across mid-body. He never sits like a person and never
> stands on two legs. The character is in **three-quarter view, not facing
> the camera**: body and head turned about 30 to 45 degrees off straight-on,
> **looking toward the right-hand side of the frame**, as if speaking to
> somebody standing off to their right — never out at the reader. The
> picture is **square, 1:1**, with the figure centred across it and sitting
> on the bottom edge. Leave a little clear space at the top and both sides:
> **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** His expression is **worried**: ears half back, eyes
> wide, head lowered a little. The feeling is carried by the ears, the eyes
> and the set of the shoulders — never by arms, hands or human posture.
>
> **Keep visible:** the one torn left ear.
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

### Mun · annoyed

**File:** `docs/assets/cast/mun/annoyed.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Mun** — a thin black cat, ordinary house-cat size and
> build, **on four legs**. Low, lean, slightly scruffy, ribs faintly
> suggested by two short lines. Solid flat black with a single flat
> dark-grey band along the spine as its only shading. Amber-gold eyes drawn
> as full circles with a **vertical slit pupil** — the only slit pupils in
> the cast. A scholar's air he has not earned. Reproduce that design
> exactly, with no change to colour or proportion. **Must
> not:** be blue, or blue-and-white; have a white belly or a pouch; wear a
> collar, bell, clothing or any prop; stand upright, walk on two legs, sit
> like a person, or have round mitten paws; resemble any existing Doraemon
> character.
>
> **Framing.** Draw the cat's head, shoulders and front legs, on four legs,
> cropped straight across mid-body. He never sits like a person and never
> stands on two legs. The character is in **three-quarter view, not facing
> the camera**: body and head turned about 30 to 45 degrees off straight-on,
> **looking toward the right-hand side of the frame**, as if speaking to
> somebody standing off to their right — never out at the reader. The
> picture is **square, 1:1**, with the figure centred across it and sitting
> on the bottom edge. Leave a little clear space at the top and both sides:
> **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** His expression is **annoyed**: ears flat back, eyes
> narrowed to slits, chin down. The feeling is carried by the ears, the eyes
> and the set of the shoulders — never by arms, hands or human posture.
>
> **Keep visible:** the one torn left ear.
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

### Mun · surprised

**File:** `docs/assets/cast/mun/surprised.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Mun** — a thin black cat, ordinary house-cat size and
> build, **on four legs**. Low, lean, slightly scruffy, ribs faintly
> suggested by two short lines. Solid flat black with a single flat
> dark-grey band along the spine as its only shading. Amber-gold eyes drawn
> as full circles with a **vertical slit pupil** — the only slit pupils in
> the cast. A scholar's air he has not earned. Reproduce that design
> exactly, with no change to colour or proportion. **Must
> not:** be blue, or blue-and-white; have a white belly or a pouch; wear a
> collar, bell, clothing or any prop; stand upright, walk on two legs, sit
> like a person, or have round mitten paws; resemble any existing Doraemon
> character.
>
> **Framing.** Draw the cat's head, shoulders and front legs, on four legs,
> cropped straight across mid-body. He never sits like a person and never
> stands on two legs. The character is in **three-quarter view, not facing
> the camera**: body and head turned about 30 to 45 degrees off straight-on,
> **looking toward the right-hand side of the frame**, as if speaking to
> somebody standing off to their right — never out at the reader. The
> picture is **square, 1:1**, with the figure centred across it and sitting
> on the bottom edge. Leave a little clear space at the top and both sides:
> **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** His expression is **surprised**: eyes fully round and
> large, ears straight up, whiskers out. The feeling is carried by the ears,
> the eyes and the set of the shoulders — never by arms, hands or human
> posture.
>
> **Keep visible:** the one torn left ear.
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

### Mun · sad

**File:** `docs/assets/cast/mun/sad.png`

> **Draw ONE square picture of ONE character.** A single figure, alone in
> the frame, wearing a single expression. The whole image is that one
> drawing, filling the frame edge to edge.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. A simple rounded
> character drawn in clean even-weight black ink outlines. Not modern anime,
> not moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no visible texture, no paper grain, no
> brush grain, no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a
> half. Eyes are plain white ovals with a black dot pupil and one thin brow;
> the nose is a small simple shape; the mouth is one curve that opens to a
> plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded.
>
> **The character.** **Mun** — a thin black cat, ordinary house-cat size and
> build, **on four legs**. Low, lean, slightly scruffy, ribs faintly
> suggested by two short lines. Solid flat black with a single flat
> dark-grey band along the spine as its only shading. Amber-gold eyes drawn
> as full circles with a **vertical slit pupil** — the only slit pupils in
> the cast. A scholar's air he has not earned. Reproduce that design
> exactly, with no change to colour or proportion. **Must
> not:** be blue, or blue-and-white; have a white belly or a pouch; wear a
> collar, bell, clothing or any prop; stand upright, walk on two legs, sit
> like a person, or have round mitten paws; resemble any existing Doraemon
> character.
>
> **Framing.** Draw the cat's head, shoulders and front legs, on four legs,
> cropped straight across mid-body. He never sits like a person and never
> stands on two legs. The character is in **three-quarter view, not facing
> the camera**: body and head turned about 30 to 45 degrees off straight-on,
> **looking toward the right-hand side of the frame**, as if speaking to
> somebody standing off to their right — never out at the reader. The
> picture is **square, 1:1**, with the figure centred across it and sitting
> on the bottom edge. Leave a little clear space at the top and both sides:
> **nothing may be cropped by the edge, least of all a hand.**
>
> **The expression.** His expression is **sad**: ears down and out, eyes
> lowered, head dropped. The feeling is carried by the ears, the eyes and
> the set of the shoulders — never by arms, hands or human posture.
>
> **Keep visible:** the one torn left ear.
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

# Part 2 — the background plates

A plate is the place with **nobody in it**: the cast is composited on top, so a
figure drawn into the plate would appear beside itself.

Attach **the style reference only.** There are no characters in a plate.

Unit 1 needs `canal-landing` and nothing else. The other eight are for the
chapters after it.

---

## 1. The canal landing — background plate

**File:** `canal-landing.jpg`  ·  **this is the one unit 1 needs**

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> A wooden landing stage on a jade-green canal, late morning, hot and still.
> Worn planks in the near ground, thick ochre mud at the waterline, water
> hyacinth drifting. A long wooden boat moored at one side. The far bank is
> a low line of banana and areca palms under a wide bright sky.

---

## 2. Bà Sáu's kitchen — background plate

**File:** `kitchen.jpg`

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> A small delta kitchen interior, morning. A low table, enamel bowls, a tin
> of tea on a shelf, a bunch of bananas hanging from a beam, a large pot on
> the floor. One doorway on the right opens onto a bleached-white hot road
> outside. Warm interior against bright outdoor light.

---

## 3. The school yard — background plate

**File:** `school-yard.jpg`

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> A school yard, late afternoon, long low shadows on concrete. A yellow-
> ochre wall with a painted noticeboard on it, empty. A flame tree at one
> side, one bicycle leaning against the wall, a low gate at the back. Nobody
> in it.

---

## 4. The market — background plate

**File:** `market.jpg`

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> A covered market lane, early morning. Stalls on both sides heaped with
> green oranges, herbs and fish baskets, scales hanging, tarpaulins
> overhead, plastic stools stacked. Crowded with goods and completely empty
> of people.

---

## 5. The lane — background plate

**File:** `lane.jpg`

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> A narrow lane between two-storey concrete houses, blue hour. Warm light
> spilling from two open doorways, overhead wires tangled between the walls,
> a motorbike parked against one house, a few collapsed paper lanterns in
> the gutter.

---

## 6. The canal behind the school — background plate

**File:** `canal-school.jpg`

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> A narrow canal behind a school's back wall, flat hard midday light. The
> water is opaque brown-ochre with a dull scum at the edge and plastic
> caught in the reeds. On the far bank a low corrugated-iron workshop with a
> pipe discharging into the water. No birds.

---

## 7. The science room — background plate

**File:** `science-room.jpg`

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> A school science room after hours, warm desk-lamp light against a
> darkening window. A worktable with a tangle of jumper wires, a small
> circuit board, a screwdriver, a battery pack and two enamel cups. Shelves
> of jars behind.

---

## 8. The yard in the storm — background plate

**File:** `storm-yard.jpg`

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> The yard of a delta house under a low bruised storm sky, wind visible in
> everything. A tiled roof with one broken tile, a wooden ladder against the
> eaves, a snapped branch across the yard, buckets and basins lined along
> the wall, water standing at the bottom of the lane. No sunlight.

---

## 9. The road out of town — background plate

**File:** `road.jpg`

> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy or quote any
> character in it. If nothing is attached, follow the written style exactly
> as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous, and drawn **thinner and lighter than a figure's line would
> be.** No sketchy or broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients except in the open sky, no texture, no
> grain, no airbrushing, no ambient occlusion, no blur and no
> depth-of-field. Depth is shown by **lighter flat colour and thinner line
> only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the
> style: the world is literal and fully catalogued even though the people
> are simple. Correct one- or two-point perspective, real architecture, and
> everyday objects all in their places — every plank, rope, pot, wire and
> moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green
> canal water, ochre mud, terracotta roof tiles, brass, bright blue sky. One
> object is given a colour used nowhere else in the frame — that is where
> the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of
> Việt Nam, present day but modest. **Nothing Japanese** — no sliding paper
> doors, no tatami, no Japanese suburban houses, no vacant lot with stacked
> concrete pipes, no Japanese signage. No temples, no strings of tourist
> lanterns, no conical hats as decoration, no dragons.
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
> A dirt road at the edge of town at first light, the sky going from deep
> blue to peach. The road runs away from the viewer toward a wide pale river
> and low hills beyond. Two or three stars still out. The town behind is
> dark.

---

# After you generate

Save each drawing as `docs/assets/cast/<slug>/<emotion>.png` — a folder per
character, the emotion as the filename — then compose:

```sh
python3 tools/make_sheet.py ti        # one character
python3 tools/make_sheet.py --all     # everybody who has a full set
python3 tools/check_cast.py           # what is declared, and what is drawn
python3 tools/build.py                # then reload Unit 1 Lesson 1
```

`make_sheet.py` does three things you therefore do not have to:

1. **Squares each drawing** by padding, never cropping and never stretching,
   centred across and sitting on the bottom edge — so the character stands on
   the floor of the panel instead of floating like a sticker.
2. **Keys the white out** and saves with an alpha channel. It floods inward from
   the border rather than removing all white globally, so Thảo's and Khoa's
   white shirts survive: the style's closed black contour is what separates the
   white inside an outline from the white outside it.
3. **Composes the 3 × 2 grid** at one cell size, in the panel order
   `data/cast.json` declares. Six equal squares, identically placed, by
   arithmetic.

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
  > sides, and Mun's torn *left* ear reads as a torn right ear whenever he
  > speaks second. Nobody has ever noticed this in a comic, and the alternative
  > is drawing every character twice. Accepted deliberately; do not "fix" it by
  > drawing a second facing.

- **Do not rename or reorder anything.** The emotion filenames and their panel
  order are the `col` index in `data/cast.json`; the composer reads that order
  and the page reads it back. Changing one without the other silently gives
  every character the wrong face.

# If a generation drifts

| Symptom | Fix |
| --- | --- |
| A character resembles a Doraemon character — the cat goes blue or bipedal, the boy acquires round glasses | Demote the reference image to *style only*, saying so in the prompt, and paste that character's **must not** line in verbatim. Do not keep a "close enough" variant; it contaminates everything fed from it |
| It comes back as generic modern anime — soft shading, glossy eyes, strand-shaded hair | Re-paste the **Line** and **Colour** paragraphs in full. They are the whole defence and they degrade the moment they are summarised. Naming what it must *not* be does more work than naming what it should be |
| A drawing comes back as a grid, a sheet or a set of panels | Every prompt asks for one figure with one expression. Re-roll rather than cropping a panel out of it — a cropped cell will not share a scale or an eye level with the other five, and `make_sheet.py` cannot fix a mismatch it was never given |
| The head jumps or resizes between expressions | The six drawings were framed differently. `make_sheet.py` squares and scales them to one cell but cannot re-frame a head — re-roll the odd one out, matching the head size and eye level of the `neutral` drawing, which is the one to draw first and judge the rest against |
| An avatar has a white box behind it | `make_sheet.py` keys the white itself, so this means it found none to key — check the drawing's background really is white and not a very pale grey, or re-run with the tolerance in mind |
| A drawing comes back with a grey-and-white chequered pattern behind the figure | The generator has *drawn* a transparency checkerboard instead of leaving alpha. Re-roll: every prompt already forbids it by name, so this is a miss rather than an ambiguity, and a drawn checkerboard is much harder to key than plain white |
| The characters look out at the reader, or the two speakers face away from each other | It was drawn square to the camera, or drawn looking *left*. Both must be three-quarter and looking toward the **right** of the frame — the page flips the right-hand speaker, so a left-looking sheet points both of them off the edges. Re-roll; it cannot be fixed by flipping the file, which would reverse the character's own asymmetry (Thảo's exposed ear, Khoa's parting, Mun's torn left ear) |
| Keying the white also ate a white shirt | Something other than `make_sheet.py` was used, globally. The composer floods inward from the border instead, so the closed black contour keeps the shirt's white separate from the background's |
| A plate comes back with people in it | Repeat the "no people, no animals" clause as the **first** line of the description rather than the last. It must be re-rolled, not painted out: the cast is composited on top and a drawn figure appears beside itself |
| A plate comes back vague, empty or blurred | The style's whole contrast is simple figures against a literal world. Re-paste **Backgrounds carry the realism** and name three specific objects the plate must contain |
| The setting drifts Japanese — sliding doors, a suburban street, a vacant lot with concrete pipes | Expected: it is copying the reference's *world* along with its style. Re-paste **Setting discipline** and add three delta-specific objects |
| Text appears in the image | Gemini adds signage unprompted in street scenes. Keep the "no text, no letters" clause and re-roll — it is not reliably fixable by inpainting |
