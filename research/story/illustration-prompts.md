# Illustration prompts — *The Calling Lamp*

Every prompt the site's art needs, and nothing else. Written for **Gemini**
(Nano Banana / Imagen). Each block is complete: paste it, generate, save.

The Getting Started dialogue on every Lesson 1 page is a **comic** — a
background plate, the speaker, one speech balloon, advancing as the reader
scrolls. So there are exactly two kinds of image, and the page composites them:

| | What | Files |
| --- | --- | --- |
| **Part 1** | Five character sheets — six emotion panels in a row, half-body, on transparency | `docs/assets/cast/<slug>.png` |
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

**Attach the Doraemon style reference to every generation** and say: *"Match the
line weight, colouring, shading and background treatment of the attached image.
Do not copy, quote or resemble any character in it."* The house look is Fujiko
F. Fujio's line and flat colour applied to a Mekong delta town; the style is the
borrowed part, the cast is not.

That is the only attachment. Each character prompt below carries its own full
design, so there is no separate cast sheet to generate first and no figure
numbers to keep straight — a character only has to be consistent across its own
six panels, and one sheet guarantees that.

Ask for **16:9** explicitly every time. Gemini defaults to square.

**What unit 1 needs:** Tí, Thảo and `canal-landing`. Everything else is for the
chapters after it, and the other eleven dialogues read as plain text until they
are staged.

---

# Part 1 — the character sheets

## 1. Tí — six-panel half-body sheet

**File:** `ti.png` — the **whole sheet, uncut**, saved as one image.

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy, quote or resemble any character in it.
> The character is described below and appears nowhere in the reference.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded characters
> drawn in clean even-weight black ink outlines. Not modern anime, not moe, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous. No
> tapering brush strokes, no cross-hatching, no stippling, no sketchy or broken
> linework, no visible pencil. Interior detail is minimal: a face is a handful
> of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients, no visible texture, no paper grain, no brush grain,
> no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a half.
> Eyes are plain white ovals with a black dot pupil and one thin brow; the nose
> is a small simple shape; the mouth is one curve that opens to a plain rounded
> shape when speaking. Hands are simple and rounded, five fingers, no knuckle
> detail. Hair is one solid flat colour with at most a single flat highlight
> band — never strand-shaded.
>
> **The character.** **Tí** — a thirteen-year-old
> Vietnamese boy, the smallest and thinnest of the children. Narrow and slightly
> caved-in, one shoulder lower than the other where an oversized shirt slips off
> it. Black hair in an uneven spiky cluster with **one cowlick standing up at
> the back of the crown** that never lies flat. Eyes smallish and round under a
> low flat brow line, giving a permanently slightly wary look. A faded
> jade-green t-shirt a size too big. Ordinary and a bit closed-off — not cute,
> not heroic. Reproduce that design exactly, with no change to hair, face,
> clothing, colour or proportion between panels.
> **Must not:** wear glasses of any kind; wear a yellow top with blue shorts;
> resemble any existing Doraemon character.
>
> **The sheet.** Six panels in one row on a plain white background. **The image
> must divide into exactly six equal vertical sixths, each holding one panel,
> with the figure centred in its sixth and the same margin on both sides.** No
> gap, no border and no gutter between panels — the six sixths are edge to edge
> and fill the whole width. Identical size, identical framing. Each panel shows the **upper half
> of the body — head, shoulders, chest, both arms and hands, cropped straight
> across at the waist** — facing the viewer and turned very slightly to one
> side. The shirt, the build and both hands are visible in every panel.
>
> **The head stays exactly the same size and in exactly the same place in all
> six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it — but
> the framing, the scale and the eye level never do.
>
> Left to right, face and body together:
> **1 — neutral:** an ordinary talking face, mouth slightly open, no strong
> feeling; arms relaxed at the sides.
> **2 — happy:** a real open smile, eyes curved; shoulders lifted, one hand
> raised in a small open gesture.
> **3 — worried:** brows raised and pulled together, mouth a small flat line;
> shoulders drawn in, hands close to the body.
> **4 — annoyed:** brows down and level, mouth pressed or turned down at one
> corner; arms folded.
> **5 — surprised:** eyes wide and round, brows high, mouth open in a small
> circle; shoulders up, both hands lifted slightly.
> **6 — sad:** eyes lowered, brows slack, mouth a short downward curve;
> shoulders dropped, arms hanging.
>
> **The standing cowlick at the back of the crown must be clearly visible in all
> six panels** — it is the one feature that identifies him at small size.
>
> Each panel is cut off cleanly and straight across at the bottom edge of the
> frame, at the waist, with nothing below it and no legs. Plain white behind
> every panel and no border between them. 16:9.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> exaggerated screaming-face gags. No sparkles or glows.

---

## 2. Thảo — six-panel half-body sheet

**File:** `thao.png` — the **whole sheet, uncut**, saved as one image.

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy, quote or resemble any character in it.
> The character is described below and appears nowhere in the reference.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded characters
> drawn in clean even-weight black ink outlines. Not modern anime, not moe, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous. No
> tapering brush strokes, no cross-hatching, no stippling, no sketchy or broken
> linework, no visible pencil. Interior detail is minimal: a face is a handful
> of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients, no visible texture, no paper grain, no brush grain,
> no airbrushing, no ambient occlusion. Bright and clear.
>
> **Figures.** Head large relative to the body — roughly one to four and a half.
> Eyes are plain white ovals with a black dot pupil and one thin brow; the nose
> is a small simple shape; the mouth is one curve that opens to a plain rounded
> shape when speaking. Hands are simple and rounded, five fingers, no knuckle
> detail. Hair is one solid flat colour with at most a single flat highlight
> band — never strand-shaded.
>
> **The character.** **Thảo** — a
> thirteen-year-old Vietnamese girl, the same height as Tí or a little taller.
> Upright and square-shouldered, deliberately **asymmetric at the head**:
> straight black hair cut to the jaw with a straight fringe, **tucked behind one
> ear so that one ear shows and the other is covered.** Eyes large and open,
> brows set high, a small closed half-smile — she is the one who is sure of
> things. White short-sleeved school shirt, dark blue skirt. Reproduce that
> design exactly, with no change to hair, face, clothing, colour or proportion
> between panels.
> **Must not:** wear a hairband, ribbon, bow or hairclip; wear pink; resemble
> any existing Doraemon character.
>
> **The sheet.** Six panels in one row on a plain white background. **The image
> must divide into exactly six equal vertical sixths, each holding one panel,
> with the figure centred in its sixth and the same margin on both sides.** No
> gap, no border and no gutter between panels — the six sixths are edge to edge
> and fill the whole width. Identical size, identical framing. Each panel shows the **upper half
> of the body — head, shoulders, chest, both arms and hands, cropped straight
> across at the waist** — facing the viewer and turned very slightly to one
> side. The shirt, the build and both hands are visible in every panel.
>
> **The head stays exactly the same size and in exactly the same place in all
> six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it — but
> the framing, the scale and the eye level never do.
>
> Left to right, face and body together:
> **1 — neutral:** an ordinary talking face, mouth slightly open, no strong
> feeling; arms relaxed at the sides.
> **2 — happy:** a real open smile, eyes curved; shoulders lifted, one hand
> raised in a small open gesture.
> **3 — worried:** brows raised and pulled together, mouth a small flat line;
> shoulders drawn in, hands close to the body.
> **4 — annoyed:** brows down and level, mouth pressed or turned down at one
> corner; arms folded, or one hand on the hip.
> **5 — surprised:** eyes wide and round, brows high, mouth open in a small
> circle; shoulders up, both hands lifted slightly.
> **6 — sad:** eyes lowered, brows slack, mouth a short downward curve;
> shoulders dropped, arms hanging.
>
> **The hair tucked behind one ear only — one ear showing, the other covered —
> must read clearly in all six panels.**
>
> Each panel is cut off cleanly and straight across at the bottom edge of the
> frame, at the waist, with nothing below it and no legs. Plain white behind
> every panel and no border between them. 16:9.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No
> exaggerated screaming-face gags. No sparkles or glows.

---

## 3. Bà Sáu — six-panel half-body sheet

**File:** `basau.png` — the **whole sheet, uncut**, saved as one image.

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy, quote or resemble any character in it.
> The character is described below and appears nowhere in the reference.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded characters
> drawn in clean even-weight black ink outlines. Not modern anime, not moe, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous. No
> tapering brush strokes, no cross-hatching, no stippling, no sketchy or broken
> linework, no visible pencil. Interior detail is minimal: a face is a handful
> of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients, no texture, no airbrushing. Bright and clear.
>
> **The character.** **Bà Sáu** — Tí's
> grandmother, around seventy. The shortest adult but the **widest and most
> stable** shape in the cast: square, planted, upright. Grey hair pulled back
> into a tight low bun drawn as one solid shape. Eyes usually drawn as two short
> downward curves, opening to circles only when startled; one deep line at each
> side of the mouth, set stern. A loose brown-and-indigo *áo bà ba* style tunic.
> Reproduce that design exactly, with no change to hair, face, clothing, colour
> or proportion between panels.
> **Must not:** be drawn frail, bent or sweet; resemble any existing Doraemon
> character.
>
> **The sheet.** Six panels in one row on a plain white background. **The image
> must divide into exactly six equal vertical sixths, each holding one panel,
> with the figure centred in its sixth and the same margin on both sides.** No
> gap, no border and no gutter between panels — the six sixths are edge to edge
> and fill the whole width. Identical size, identical framing. Each panel shows the **upper half
> of the body — head, shoulders, chest, both arms and hands, cropped straight
> across at the waist** — facing the viewer and turned very slightly to one
> side.
>
> **Her forearms are drawn noticeably thicker and stronger than anyone else's in
> the cast, and both must be visible in all six panels.** They are what
> identifies her at small size, and they are the reason this sheet is half-body
> rather than a headshot.
>
> **The head stays exactly the same size and in exactly the same place in all
> six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it — but
> the framing, the scale and the eye level never do.
>
> Left to right, face and body together:
> **1 — neutral:** an ordinary talking face, mouth slightly open; arms relaxed.
> **2 — happy:** a real smile, eyes curved — warm but still dry, never soft;
> one hand raised in a small gesture.
> **3 — worried:** brows drawn together, mouth a small flat line; hands close
> to the body.
> **4 — annoyed:** brows down and level, mouth turned down at one corner; arms
> folded, forearms prominent.
> **5 — surprised:** eyes opening to full circles, brows high, mouth open in a
> small circle; both hands lifted slightly.
> **6 — sad:** eyes lowered, mouth a short downward curve; shoulders dropped,
> hands in her lap.
>
> Each panel is cut off cleanly and straight across at the bottom edge of the
> frame, at the waist, with nothing below it. Plain white behind every panel and
> no border between them. 16:9.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles
> or glows.

---

## 4. Khoa — six-panel half-body sheet

**File:** `khoa.png` — the **whole sheet, uncut**, saved as one image.

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy, quote or resemble any character in it.
> The character is described below and appears nowhere in the reference.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded characters
> drawn in clean even-weight black ink outlines. Not modern anime, not moe, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous. No
> tapering brush strokes, no cross-hatching, no stippling, no sketchy or broken
> linework. Interior detail is minimal: a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, never soft-edged. No gradients, no texture,
> no airbrushing. Bright and clear.
>
> **The character.** **Khoa** — a boy of
> thirteen, half a head taller than the others, neat and calm. A straight
> vertical silhouette, arms at rest, the stillest figure in the cast. Black
> hair, flat and combed, with **a clean side parting** — the only parting in the
> cast. Eyes even ovals with the pupil centred, and a small level closed-mouth
> smile. Genuinely kind; **never smug, never sneering.** White shirt buttoned to
> the collar. Reproduce that design exactly, with no change to hair, face,
> clothing, colour or proportion between panels.
> **Must not:** be drawn as a rival or a snob; resemble any existing Doraemon
> character.
>
> **The sheet.** Six panels in one row on a plain white background. **The image
> must divide into exactly six equal vertical sixths, each holding one panel,
> with the figure centred in its sixth and the same margin on both sides.** No
> gap, no border and no gutter between panels — the six sixths are edge to edge
> and fill the whole width. Identical size, identical framing. Each panel shows the **upper half
> of the body — head, shoulders, chest, both arms and hands, cropped straight
> across at the waist** — facing the viewer and turned very slightly to one
> side.
>
> **He carries a green notebook held flat against his side, and it is visible in
> all six panels.** That and the side parting are what identify him at small
> size.
>
> **The head stays exactly the same size and in exactly the same place in all
> six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it — but
> the framing, the scale and the eye level never do.
>
> Left to right, face and body together:
> **1 — neutral:** an ordinary talking face, mouth slightly open; arms at rest,
> notebook against his side.
> **2 — happy:** a real open smile, eyes curved; shoulders lifted, free hand
> raised in a small open gesture.
> **3 — worried:** brows raised and pulled together, mouth a small flat line;
> notebook held with both hands.
> **4 — annoyed:** brows down and level, mouth pressed — mildly, he does not
> scowl; free hand on the hip.
> **5 — surprised:** eyes wide and round, brows high, mouth open in a small
> circle; free hand lifted.
> **6 — sad:** eyes lowered, brows slack, mouth a short downward curve;
> shoulders dropped, notebook lowered.
>
> Each panel is cut off cleanly and straight across at the bottom edge of the
> frame, at the waist, with nothing below it. Plain white behind every panel and
> no border between them. 16:9.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles
> or glows.

---

## 5. Mun — six-panel sheet, cropped mid-body

**File:** `mun.png` — the **whole sheet, uncut**, saved as one image.

Mun does not speak in any Lesson 1 dialogue yet. Generate this sheet anyway —
he speaks in the passages, he is the character most likely to be given a line
next, and a cat drawn six months after the rest of the cast will not match it.

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy, quote or resemble any character in it.
> The character is described below and appears nowhere in the reference.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look, drawn in clean even-weight
> black ink outlines with flat cel colour. Not modern anime, not moe, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly. No
> gradients, no texture, no airbrushing, no soft edges.
>
> **The character.** **Mun** — a thin black cat,
> ordinary house-cat size and build, **on four legs**. Low, lean, slightly
> scruffy, ribs faintly suggested by two short lines. Solid flat black with a
> single flat dark-grey band along the spine as its only shading. Amber-gold
> eyes drawn as full circles with a **vertical slit pupil** — the only slit
> pupils in the cast. A scholar's air he has not earned. Reproduce that design
> exactly, with no change to colour or proportion between panels.
> **Must not:** be blue, or blue-and-white; have a white belly or a pouch; wear
> a collar, bell, clothing or any prop; stand upright, walk on two legs, sit
> like a person, or have round mitten paws; resemble any existing Doraemon
> character.
>
> **The sheet.** Six panels in one row on a plain white background. **The image
> must divide into exactly six equal vertical sixths, each holding one panel,
> with the figure centred in its sixth and the same margin on both sides.** No
> gap, no border and no gutter between panels — the six sixths are edge to edge
> and fill the whole width. Identical size, identical framing. Each panel shows the cat's **head,
> shoulders and front legs, on four legs, facing the viewer, cropped straight
> across mid-body.**
>
> **His one torn left ear must be clearly visible in all six panels.** It is the
> only thing that identifies him at small size.
>
> **The head stays exactly the same size and in exactly the same place in all
> six panels.** His feelings are carried by the ears, the eyes and the set of
> the shoulders — never by arms, hands or human posture.
>
> Left to right:
> **1 — neutral:** ears up, eyes level, mouth slightly open as if talking.
> **2 — happy:** eyes curved to two upward arcs, ears forward, head slightly
> raised.
> **3 — worried:** ears half back, eyes wide, head lowered a little.
> **4 — annoyed:** ears flat back, eyes narrowed to slits, chin down.
> **5 — surprised:** eyes fully round and large, ears straight up, whiskers out.
> **6 — sad:** ears down and out, eyes lowered, head dropped.
>
> Each panel is cut off cleanly and straight across at the bottom edge of the
> frame, with nothing below it. Plain white behind every panel and no border
> between them. 16:9.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles
> or glows.

---
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
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

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy or quote any character in it.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Not modern anime, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous,
> and drawn **thinner and lighter than a figure's line would be.** No sketchy or
> broken linework, no cross-hatching, no visible pencil.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients except in the open sky, no texture, no grain, no
> airbrushing, no ambient occlusion, no blur and no depth-of-field. Depth is
> shown by **lighter flat colour and thinner line only.**
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the world is literal and fully catalogued even though the people are simple.
> Correct one- or two-point perspective, real architecture, and everyday objects
> all in their places — every plank, rope, pot, wire and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **Setting discipline.** Bến Sẻ, a small canal town in the Mekong delta of Việt
> Nam, present day but modest. **Nothing Japanese** — no sliding paper doors, no
> tatami, no Japanese suburban houses, no vacant lot with stacked concrete
> pipes, no Japanese signage. No temples, no strings of tourist lanterns, no
> conical hats as decoration, no dragons.
>
> **Composition.** An empty background plate, 16:9, camera at standing eye level
> looking straight ahead. Keep the **lower third of the frame simple and
> uncluttered** — figures will be placed there and detail behind them is lost.
> Keep the interest in the middle and upper thirds. Nothing important in the
> top-left or top-right corners, where speech balloons sit.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.
>
> **No people, no animals, and no characters of any kind anywhere in the
> frame. Draw the place only.**
>
> A dirt road at the edge of town at first light, the sky going from deep
> blue to peach. The road runs away from the viewer toward a wide pale river
> and low hills beyond. Two or three stars still out. The town behind is
> dark.

**When the lamp is lit** — the only place a flame ever appears — add:

> The flame is small, low and domestic: a plain flat teardrop shape with a
> single lighter shape inside it and the same black contour as everything else.
> It does not glow, radiate, sparkle, cast rays or light anything beyond arm's
> reach, and nothing in the frame is tinted by it.

The lamp never fails and never announces itself. A picture that renders it as a
magic item contradicts the story it sits above, and flat cel makes that
restraint easy to hold — there is no soft light to leak.

---

# After you generate

**Do not cut a character sheet up.** The sheet *is* the asset: saved whole as
`<slug>.png`, and the page shows one emotion by sliding it sideways behind a
window one-sixth of its width. Five files, not thirty, and no six files that
have to agree with each other about a baseline.

1. **Check the panels are exactly six equal sixths.** This is the one thing the
   sprite depends on. The page steps by a fixed fraction, so an uneven sheet —
   or one with a margin down one side — shows a sliver of the neighbouring face.
   Re-roll rather than nudge; if it is close, set the canvas width to a round
   multiple of six and centre each figure in its sixth.
2. **Cut the transparency out**, across the whole sheet. A white box behind a
   character is invisible on the generator's white sheet and glaring over a
   plate — check against a dark colour before saving.
3. **Trim empty rows off the bottom**, once, for the whole sheet. The avatar
   stands on the floor of the panel; a half-figure with air under it reads as a
   sticker.
4. Save sheets as **PNG with transparency** to `docs/assets/cast/`, plates as
   **JPG** to `docs/assets/bg/`.
5. `python3 tools/check_cast.py`, then `python3 tools/build.py`, then reload
   Unit 1 Lesson 1.

Two things you do **not** have to do:

- **Do not draw a character facing both ways.** The page mirrors whoever stands
  on the right, so each character is drawn facing one way and the layout turns
  them around.
- **Do not reorder the panels.** Left to right is `neutral · happy · worried ·
  annoyed · surprised · sad`, and that is the `col` index in `data/cast.json`.
  Changing one without the other silently gives every character the wrong face.

# If a generation drifts

| Symptom | Fix |
| --- | --- |
| A character resembles a Doraemon character — the cat goes blue or bipedal, the boy acquires round glasses | Demote the reference image to *style only*, saying so in the prompt, and paste that character's **must not** line in verbatim. Do not keep a "close enough" variant; it contaminates everything fed from it |
| It comes back as generic modern anime — soft shading, glossy eyes, strand-shaded hair | Re-paste the **Line** and **Colour** paragraphs in full. They are the whole defence and they degrade the moment they are summarised. Naming what it must *not* be does more work than naming what it should be |
| The panels do not line up, or a sliver of the next face shows | They are not exactly equal sixths. The page steps by a fixed fraction, so this cannot be fixed by re-cropping — re-roll, or set the canvas to a round multiple of six and centre each figure in its sixth |
| An avatar has a white box behind it | The transparency was never cut. Invisible against the generator's white sheet — always check against a dark colour |
| A plate comes back with people in it | Repeat the "no people, no animals" clause as the **first** line of the description rather than the last. It must be re-rolled, not painted out: the cast is composited on top and a drawn figure appears beside itself |
| A plate comes back vague, empty or blurred | The style's whole contrast is simple figures against a literal world. Re-paste **Backgrounds carry the realism** and name three specific objects the plate must contain |
| The setting drifts Japanese — sliding doors, a suburban street, a vacant lot with concrete pipes | Expected: it is copying the reference's *world* along with its style. Re-paste **Setting discipline** and add three delta-specific objects |
| Text appears in the image | Gemini adds signage unprompted in street scenes. Keep the "no text, no letters" clause and re-roll — it is not reliably fixable by inpainting |
