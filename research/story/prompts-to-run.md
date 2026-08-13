# Prompts to run — copy, paste, generate

Six prompts, each **complete and self-contained**. Nothing to fill in, nothing
to assemble: open Gemini, attach what the prompt says to attach, paste the whole
block, generate.

`illustration-prompts.md` is the reasoning — why the designs are shaped this
way, what each *must not* line is defending against, and how to fix a drift.
This file is just the work.

## What to attach

| Prompt | Attach |
| --- | --- |
| §1–§5, the character sheets | the **Doraemon style reference** image, **and** `cast-sheet.png` (the unlabelled group sheet from `illustration-prompts.md` §2.1) |
| §6, the background plate | the **Doraemon style reference** only — a plate has no characters in it |

If you have not generated `cast-sheet.png` yet, do that first from
`illustration-prompts.md` §2.1. Every character prompt below refers to it.

## What unit 1 actually needs

Unit 1's dialogue uses **Tí** and **Thảo** at the **canal landing**, so §1, §2
and §6 unblock the page you can see today. §3–§5 are the rest of the cast, and
they are here because a sheet is generated whole — you cannot draw four of six
faces and come back later without the set drifting.

```sh
python3 tools/check_cast.py    # what is declared, and what is drawn
```

Save each sheet **whole and uncut** to `docs/assets/cast/`, and the plate to
`docs/assets/bg/`, with exactly the filenames each prompt names. The page shows a dashed placeholder in the
avatar's place until the file exists, then swaps to the art on its own.

Ask for **16:9** explicitly every time — Gemini defaults to square.

---

## 1. Tí — six-panel half-body sheet

**File:** `ti.png` — the **whole sheet, uncut**, saved as one image.

> Match the line weight, colouring, shading and background treatment of the
> attached style reference. Do not copy, quote or resemble any character in it —
> the character comes from the second attached sheet.
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
> **The character.** **Tí**, figure 1 on the attached sheet — a thirteen-year-old
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
> attached style reference. Do not copy, quote or resemble any character in it —
> the character comes from the second attached sheet.
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
> **The character.** **Thảo**, figure 2 on the attached sheet — a
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
> attached style reference. Do not copy, quote or resemble any character in it —
> the character comes from the second attached sheet.
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
> **The character.** **Bà Sáu**, figure 3 on the attached sheet — Tí's
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
> attached style reference. Do not copy, quote or resemble any character in it —
> the character comes from the second attached sheet.
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
> **The character.** **Khoa**, figure 5 on the attached sheet — a boy of
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
> attached style reference. Do not copy, quote or resemble any character in it —
> the character comes from the second attached sheet.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look, drawn in clean even-weight
> black ink outlines with flat cel colour. Not modern anime, not moe, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly. No
> gradients, no texture, no airbrushing, no soft edges.
>
> **The character.** **Mun**, figure 4 on the attached sheet — a thin black cat,
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

## 6. The canal landing — background plate

**File:** `canal-landing.jpg` — this is unit 1's only background.

Attach **the style reference only.** No character sheet: a plate is the place
with nobody in it, because the cast is composited on top and a drawn figure
would appear beside itself.

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
> all in their places — every plank, rope, pot and moored boat.
>
> **Palette.** The Mekong delta's own colours as flat fills: jade-green canal
> water, ochre mud, terracotta roof tiles, brass, bright blue sky. One object is
> given a colour used nowhere else in the frame — that is where the eye lands.
>
> **The plate.** An empty background plate, 16:9. **No people, no animals, and
> no characters of any kind anywhere in the frame. Draw the place only.**
>
> A wooden landing stage on a jade-green canal in the Mekong delta of Việt Nam,
> late morning, hot and still. Worn planks in the near ground. Thick ochre mud
> at the waterline with water hyacinth drifting on the surface. A long narrow
> wooden boat moored at one side, a bamboo pole leaning against a post. The far
> bank is a low line of banana and areca palms under a wide bright sky with a
> few plain white clouds. Ordinary, lived-in and modest — a working village
> landing, not a beauty spot.
>
> **Composition.** The camera is at standing eye level, looking straight ahead.
> Keep the **lower third of the frame simple and uncluttered** — figures will be
> placed there and detail behind them is lost. Keep the interest in the middle
> and upper thirds. Nothing important in the top-left or top-right corners,
> where speech balloons sit.
>
> **Setting discipline.** Nothing Japanese — no sliding paper doors, no tatami,
> no Japanese suburban houses, no vacant lot with stacked concrete pipes, no
> Japanese signage. No temples, no strings of tourist lanterns, no conical hats
> as decoration, no dragons.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, panel borders or motion lines. No sparkles,
> glows or lens flare.

---

## After you generate

**Do not cut the sheet up.** The sheet *is* the asset: it is saved whole as
`<slug>.png`, and the page shows one emotion by sliding the image sideways
behind a window one-sixth of its width. Five files, not thirty, and no six
files that have to agree with each other about a baseline.

1. **Check the panels are exactly six equal sixths.** This is the one thing the
   sprite depends on. The page steps the image by a fixed fraction, so a sheet
   whose panels are uneven — or which has a margin down one side — shows a
   sliver of the neighbouring face. If it comes back uneven, re-roll rather
   than nudge it; if it is close, set the canvas width to a round multiple of
   six and centre each figure in its sixth.
2. **Cut the transparency out**, across the whole sheet. A white box behind a
   character is invisible on the generator's white sheet and glaring over a
   background plate — check against a dark colour before saving.
3. **Trim any empty rows off the bottom**, once, for the whole sheet. The avatar
   stands on the floor of the panel; a half-figure with air under it reads as a
   sticker.
4. Save as **PNG with transparency** to `docs/assets/cast/<slug>.png`, and the
   plate as **JPG** to `docs/assets/bg/<slug>.jpg`.
5. `python3 tools/check_cast.py` — it lists exactly what is still missing.
6. `python3 tools/build.py` and reload Unit 1 Lesson 1.

Two things you do **not** have to do:

- **Do not draw any character facing left and right separately.** The page
  mirrors whoever stands on the right, so every character is drawn facing one
  way and the layout turns them around.
- **Do not reorder the panels.** Left to right is `neutral · happy · worried ·
  annoyed · surprised · sad`, and that order is the `col` index in
  `data/cast.json`. Changing one without the other silently gives every
  character the wrong face.
