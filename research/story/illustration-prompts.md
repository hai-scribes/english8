# Illustration prompts — *The Calling Lamp*

Every prompt the site's art needs, and nothing else. Written for **Gemini**
(Nano Banana / Imagen). Each block is complete: paste it, generate, save.

The Getting Started dialogue on every Lesson 1 page is a **comic** — a
background plate, the speaker, one speech balloon, advancing as the reader
scrolls. So there are exactly two kinds of image, and the page composites them:

| | What | Files |
| --- | --- | --- |
| **Part 1** | Five character sheets — six square emotion panels in a 3 × 2 grid, chest up, on flat white to key out | `docs/assets/cast/<slug>.png` |
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
remember, no cast sheet to make first. If you find yourself typing anything into
a prompt, that is a bug in this file.

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

# Part 1 — the character sheets

## 1. Tí — six-panel chest-up sheet

**File:** `ti.png` — the **whole sheet, uncut**, saved as one image.

> **Draw exactly SIX panels — six and only six — laid out as a grid of three
> columns across and two rows down, in one image. Six. Not four, not eight,
> not nine. Do not add a seventh panel, an extra pose, an alternative angle,
> a close-up, a colour variant or a blank cell.** The six are listed further
> down and are the whole deliverable.
>
> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy, quote or
> resemble any character in it — the character below appears nowhere in it.
> If nothing is attached, follow the written style exactly as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded
> characters drawn in clean even-weight black ink outlines. Not modern
> anime, not moe, not Ghibli, not American cartoon, not 3D, not
> photorealistic, not painterly.
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
> face, clothing, colour or proportion between panels. **Must not:** wear
> glasses of any kind; wear a yellow top with blue shorts; resemble any
> existing Doraemon character.
>
> **The sheet.** Six square panels arranged as a grid of **three across and
> two down**, filling one 3:2 image edge to edge. The image must divide into
> exactly three equal columns and two equal rows, with **every panel exactly
> square** and no gap, border, gutter or margin anywhere — the six squares
> tile the whole image. Each panel shows the character from the **chest
> up**: head, shoulders, upper chest, and both arms and hands wherever they
> are, drawn in **three-quarter view, not facing the camera**. The body and
> the head are turned about 30 to 45 degrees away from straight-on, and the
> character **looks toward the right-hand side of the frame** — as if
> speaking to somebody standing off to their right, never out at the reader.
> Manga stages a conversation this way: the two speakers are angled toward
> each other, and a character square to the camera reads as posing rather
> than talking. **Every one of the six panels uses the same three-quarter
> angle, turned the same way** — only the expression changes. The panel is
> square precisely so that folded arms and a raised hand fit inside it —
> **nothing may be cropped by the edge of a panel, least of all a hand.**
> Keep a little clear space on all four sides of the figure.
>
> **The head stays exactly the same size and in exactly the same place in
> all six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it —
> but the framing, the scale and the eye level never do. Because the crop is
> at the chest, keep every gesture at chest height or above, so hands stay
> inside the frame.
>
> Reading order — left to right along the top row, then left to right along
> the bottom row:
> **1 — neutral:** an ordinary talking face, mouth slightly open, no strong
> feeling; hands resting together in front of the chest.
> **2 — happy:** a real open smile, eyes curved; shoulders lifted, one hand
> raised in a small open gesture.
> **3 — worried:** brows raised and pulled together, mouth a small flat
> line; shoulders drawn in, hands close to the body.
> **4 — annoyed:** brows down and level, mouth pressed or turned down at one
> corner; arms folded.
> **5 — surprised:** eyes wide and round, brows high, mouth open in a small
> circle; shoulders up, both hands lifted slightly.
> **6 — sad:** eyes lowered, brows slack, mouth a short downward curve;
> shoulders dropped, one hand held loosely at the collarbone.
>
> **The standing cowlick at the back of the crown must be clearly visible in
> all six panels** — it is the one feature that identifies him at small
> size.
>
> Every panel is cropped at the **chest**, not the waist — no stomach, no
> hips, no legs. The background behind and between the figures is **pure
> flat white #FFFFFF**, edge to edge across the whole image — no shadow, no
> gradient, no texture, no paper tone, no border and no line between panels.
> **Do not draw a transparency checkerboard.** Do not render a
> grey-and-white chequered pattern, a grid, or any other stand-in for
> transparency: a drawn checkerboard is pixels, not alpha, and is far harder
> to remove than plain white. Plain white, and nothing else. The image is
> **3:2**.
>
> **Do not include:** a seventh or eighth panel, or any panel beyond the six
> listed; any text, letters, numbers, captions, watermarks, signatures,
> speech bubbles, logos, panel borders or motion lines. No exaggerated
> screaming-face gags. No sparkles or glows.

---

## 2. Thảo — six-panel chest-up sheet

**File:** `thao.png` — the **whole sheet, uncut**, saved as one image.

> **Draw exactly SIX panels — six and only six — laid out as a grid of three
> columns across and two rows down, in one image. Six. Not four, not eight,
> not nine. Do not add a seventh panel, an extra pose, an alternative angle,
> a close-up, a colour variant or a blank cell.** The six are listed further
> down and are the whole deliverable.
>
> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy, quote or
> resemble any character in it — the character below appears nowhere in it.
> If nothing is attached, follow the written style exactly as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded
> characters drawn in clean even-weight black ink outlines. Not modern
> anime, not moe, not Ghibli, not American cartoon, not 3D, not
> photorealistic, not painterly.
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
> exactly, with no change to hair, face, clothing, colour or proportion
> between panels. **Must not:** wear a hairband, ribbon, bow or hairclip;
> wear pink; resemble any existing Doraemon character.
>
> **The sheet.** Six square panels arranged as a grid of **three across and
> two down**, filling one 3:2 image edge to edge. The image must divide into
> exactly three equal columns and two equal rows, with **every panel exactly
> square** and no gap, border, gutter or margin anywhere — the six squares
> tile the whole image. Each panel shows the character from the **chest
> up**: head, shoulders, upper chest, and both arms and hands wherever they
> are, drawn in **three-quarter view, not facing the camera**. The body and
> the head are turned about 30 to 45 degrees away from straight-on, and the
> character **looks toward the right-hand side of the frame** — as if
> speaking to somebody standing off to their right, never out at the reader.
> Manga stages a conversation this way: the two speakers are angled toward
> each other, and a character square to the camera reads as posing rather
> than talking. **Every one of the six panels uses the same three-quarter
> angle, turned the same way** — only the expression changes. The panel is
> square precisely so that folded arms and a raised hand fit inside it —
> **nothing may be cropped by the edge of a panel, least of all a hand.**
> Keep a little clear space on all four sides of the figure.
>
> **The head stays exactly the same size and in exactly the same place in
> all six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it —
> but the framing, the scale and the eye level never do. Because the crop is
> at the chest, keep every gesture at chest height or above, so hands stay
> inside the frame.
>
> Reading order — left to right along the top row, then left to right along
> the bottom row:
> **1 — neutral:** an ordinary talking face, mouth slightly open, no strong
> feeling; hands resting together in front of the chest.
> **2 — happy:** a real open smile, eyes curved; shoulders lifted, one hand
> raised in a small open gesture.
> **3 — worried:** brows raised and pulled together, mouth a small flat
> line; shoulders drawn in, hands close to the body.
> **4 — annoyed:** brows down and level, mouth pressed or turned down at one
> corner; arms folded, or one hand on the hip.
> **5 — surprised:** eyes wide and round, brows high, mouth open in a small
> circle; shoulders up, both hands lifted slightly.
> **6 — sad:** eyes lowered, brows slack, mouth a short downward curve;
> shoulders dropped, one hand held loosely at the collarbone.
>
> **The hair tucked behind one ear only — one ear showing, the other covered
> — must read clearly in all six panels.**
>
> Every panel is cropped at the **chest**, not the waist — no stomach, no
> hips, no legs. The background behind and between the figures is **pure
> flat white #FFFFFF**, edge to edge across the whole image — no shadow, no
> gradient, no texture, no paper tone, no border and no line between panels.
> **Do not draw a transparency checkerboard.** Do not render a
> grey-and-white chequered pattern, a grid, or any other stand-in for
> transparency: a drawn checkerboard is pixels, not alpha, and is far harder
> to remove than plain white. Plain white, and nothing else. The image is
> **3:2**.
>
> **Do not include:** a seventh or eighth panel, or any panel beyond the six
> listed; any text, letters, numbers, captions, watermarks, signatures,
> speech bubbles, logos, panel borders or motion lines. No exaggerated
> screaming-face gags. No sparkles or glows.

---

## 3. Bà Sáu — six-panel chest-up sheet

**File:** `basau.png` — the **whole sheet, uncut**, saved as one image.

> **Draw exactly SIX panels — six and only six — laid out as a grid of three
> columns across and two rows down, in one image. Six. Not four, not eight,
> not nine. Do not add a seventh panel, an extra pose, an alternative angle,
> a close-up, a colour variant or a blank cell.** The six are listed further
> down and are the whole deliverable.
>
> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy, quote or
> resemble any character in it — the character below appears nowhere in it.
> If nothing is attached, follow the written style exactly as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded
> characters drawn in clean even-weight black ink outlines. Not modern
> anime, not moe, not Ghibli, not American cartoon, not 3D, not
> photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework, no visible pencil. Interior detail is minimal:
> a face is a handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, shaped as a clean geometric shape,
> never soft-edged. No gradients, no texture, no airbrushing. Bright and
> clear.
>
> **The character.** **Bà Sáu** — Tí's grandmother, around seventy. The
> shortest adult but the **widest and most stable** shape in the cast:
> square, planted, upright. Grey hair pulled back into a tight low bun drawn
> as one solid shape. Eyes usually drawn as two short downward curves,
> opening to circles only when startled; one deep line at each side of the
> mouth, set stern. A loose brown-and-indigo *áo bà ba* style tunic.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion between panels. **Must not:** be drawn frail, bent or
> sweet; resemble any existing Doraemon character.
>
> **The sheet.** Six square panels arranged as a grid of **three across and
> two down**, filling one 3:2 image edge to edge. The image must divide into
> exactly three equal columns and two equal rows, with **every panel exactly
> square** and no gap, border, gutter or margin anywhere — the six squares
> tile the whole image. Each panel shows the character from the **chest
> up**: head, shoulders, upper chest, and both arms and hands wherever they
> are, drawn in **three-quarter view, not facing the camera**. The body and
> the head are turned about 30 to 45 degrees away from straight-on, and the
> character **looks toward the right-hand side of the frame** — as if
> speaking to somebody standing off to their right, never out at the reader.
> Manga stages a conversation this way: the two speakers are angled toward
> each other, and a character square to the camera reads as posing rather
> than talking. **Every one of the six panels uses the same three-quarter
> angle, turned the same way** — only the expression changes. The panel is
> square precisely so that folded arms and a raised hand fit inside it —
> **nothing may be cropped by the edge of a panel, least of all a hand.**
> Keep a little clear space on all four sides of the figure.
>
> **The head stays exactly the same size and in exactly the same place in
> all six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it —
> but the framing, the scale and the eye level never do. Because the crop is
> at the chest, keep every gesture at chest height or above, so hands stay
> inside the frame.
>
> Reading order — left to right along the top row, then left to right along
> the bottom row:
> **1 — neutral:** an ordinary talking face, mouth slightly open; arms
> relaxed.
> **2 — happy:** a real smile, eyes curved — warm but still dry, never soft;
> one hand raised in a small gesture.
> **3 — worried:** brows drawn together, mouth a small flat line; hands
> close to the body.
> **4 — annoyed:** brows down and level, mouth turned down at one corner;
> arms folded, forearms prominent.
> **5 — surprised:** eyes opening to full circles, brows high, mouth open in
> a small circle; both hands lifted slightly.
> **6 — sad:** eyes lowered, mouth a short downward curve; shoulders
> dropped, hands in her lap.
>
> Every panel is cropped at the **chest**, not the waist — no stomach, no
> hips, no legs. The background behind and between the figures is **pure
> flat white #FFFFFF**, edge to edge across the whole image — no shadow, no
> gradient, no texture, no paper tone, no border and no line between panels.
> **Do not draw a transparency checkerboard.** Do not render a
> grey-and-white chequered pattern, a grid, or any other stand-in for
> transparency: a drawn checkerboard is pixels, not alpha, and is far harder
> to remove than plain white. Plain white, and nothing else. The image is
> **3:2**.
>
> **Do not include:** a seventh or eighth panel, or any panel beyond the six
> listed; any text, letters, numbers, captions, watermarks, signatures,
> speech bubbles, logos, panel borders or motion lines. No sparkles or
> glows.

---

## 4. Khoa — six-panel chest-up sheet

**File:** `khoa.png` — the **whole sheet, uncut**, saved as one image.

> **Draw exactly SIX panels — six and only six — laid out as a grid of three
> columns across and two rows down, in one image. Six. Not four, not eight,
> not nine. Do not add a seventh panel, an extra pose, an alternative angle,
> a close-up, a colour variant or a blank cell.** The six are listed further
> down and are the whole deliverable.
>
> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy, quote or
> resemble any character in it — the character below appears nowhere in it.
> If nothing is attached, follow the written style exactly as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded
> characters drawn in clean even-weight black ink outlines. Not modern
> anime, not moe, not Ghibli, not American cartoon, not 3D, not
> photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and
> continuous. No tapering brush strokes, no cross-hatching, no stippling, no
> sketchy or broken linework. Interior detail is minimal: a face is a
> handful of lines.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At
> most one flat shadow tone per surface, never soft-edged. No gradients, no
> texture, no airbrushing. Bright and clear.
>
> **The character.** **Khoa** — a boy of thirteen, half a head taller than
> the others, neat and calm. A straight vertical silhouette, arms at rest,
> the stillest figure in the cast. Black hair, flat and combed, with **a
> clean side parting** — the only parting in the cast. Eyes even ovals with
> the pupil centred, and a small level closed-mouth smile. Genuinely kind;
> **never smug, never sneering.** White shirt buttoned to the collar.
> Reproduce that design exactly, with no change to hair, face, clothing,
> colour or proportion between panels. **Must not:** be drawn as a rival or
> a snob; resemble any existing Doraemon character.
>
> **The sheet.** Six square panels arranged as a grid of **three across and
> two down**, filling one 3:2 image edge to edge. The image must divide into
> exactly three equal columns and two equal rows, with **every panel exactly
> square** and no gap, border, gutter or margin anywhere — the six squares
> tile the whole image. Each panel shows the character from the **chest
> up**: head, shoulders, upper chest, and both arms and hands wherever they
> are, drawn in **three-quarter view, not facing the camera**. The body and
> the head are turned about 30 to 45 degrees away from straight-on, and the
> character **looks toward the right-hand side of the frame** — as if
> speaking to somebody standing off to their right, never out at the reader.
> Manga stages a conversation this way: the two speakers are angled toward
> each other, and a character square to the camera reads as posing rather
> than talking. **Every one of the six panels uses the same three-quarter
> angle, turned the same way** — only the expression changes. The panel is
> square precisely so that folded arms and a raised hand fit inside it —
> **nothing may be cropped by the edge of a panel, least of all a hand.**
> Keep a little clear space on all four sides of the figure.
>
> **The head stays exactly the same size and in exactly the same place in
> all six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it —
> but the framing, the scale and the eye level never do. Because the crop is
> at the chest, keep every gesture at chest height or above, so hands stay
> inside the frame.
>
> Reading order — left to right along the top row, then left to right along
> the bottom row:
> **1 — neutral:** an ordinary talking face, mouth slightly open; arms at
> rest, notebook against his side.
> **2 — happy:** a real open smile, eyes curved; shoulders lifted, free hand
> raised in a small open gesture.
> **3 — worried:** brows raised and pulled together, mouth a small flat
> line; notebook held with both hands.
> **4 — annoyed:** brows down and level, mouth pressed — mildly, he does not
> scowl; free hand on the hip.
> **5 — surprised:** eyes wide and round, brows high, mouth open in a small
> circle; free hand lifted.
> **6 — sad:** eyes lowered, brows slack, mouth a short downward curve;
> shoulders dropped, notebook lowered.
>
> Every panel is cropped at the **chest**, not the waist — no stomach, no
> hips, no legs. The background behind and between the figures is **pure
> flat white #FFFFFF**, edge to edge across the whole image — no shadow, no
> gradient, no texture, no paper tone, no border and no line between panels.
> **Do not draw a transparency checkerboard.** Do not render a
> grey-and-white chequered pattern, a grid, or any other stand-in for
> transparency: a drawn checkerboard is pixels, not alpha, and is far harder
> to remove than plain white. Plain white, and nothing else. The image is
> **3:2**.
>
> **Do not include:** a seventh or eighth panel, or any panel beyond the six
> listed; any text, letters, numbers, captions, watermarks, signatures,
> speech bubbles, logos, panel borders or motion lines. No sparkles or
> glows.

---

## 5. Mun — six-panel chest-up sheet

**File:** `mun.png` — the **whole sheet, uncut**, saved as one image.

Mun does not speak in any Lesson 1 dialogue yet. Generate this sheet anyway —
he speaks in the passages, he is the character most likely to be given a line
next, and a cat drawn six months after the rest of the cast will not match it.

> **Draw exactly SIX panels — six and only six — laid out as a grid of three
> columns across and two rows down, in one image. Six. Not four, not eight,
> not nine. Do not add a seventh panel, an extra pose, an alternative angle,
> a close-up, a colour variant or a blank cell.** The six are listed further
> down and are the whole deliverable.
>
> **If a style reference image is attached**, match its line weight,
> colouring, shading and background treatment, and do not copy, quote or
> resemble any character in it — the character below appears nowhere in it.
> If nothing is attached, follow the written style exactly as described.
>
> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look, drawn in clean
> even-weight black ink outlines with flat cel colour. Not modern anime, not
> moe, not Ghibli, not American cartoon, not 3D, not photorealistic, not
> painterly. No gradients, no texture, no airbrushing, no soft edges.
>
> **The character.** **Mun** — a thin black cat, ordinary house-cat size and
> build, **on four legs**. Low, lean, slightly scruffy, ribs faintly
> suggested by two short lines. Solid flat black with a single flat
> dark-grey band along the spine as its only shading. Amber-gold eyes drawn
> as full circles with a **vertical slit pupil** — the only slit pupils in
> the cast. A scholar's air he has not earned. Reproduce that design
> exactly, with no change to colour or proportion between panels. **Must
> not:** be blue, or blue-and-white; have a white belly or a pouch; wear a
> collar, bell, clothing or any prop; stand upright, walk on two legs, sit
> like a person, or have round mitten paws; resemble any existing Doraemon
> character.
>
> **The sheet.** Six square panels arranged as a grid of **three across and
> two down**, filling one 3:2 image edge to edge. The image must divide into
> exactly three equal columns and two equal rows, with **every panel exactly
> square** and no gap, border, gutter or margin anywhere — the six squares
> tile the whole image. Each panel shows the character from the **chest
> up**: head, shoulders, upper chest, and both arms and hands wherever they
> are, drawn in **three-quarter view, not facing the camera**. The body and
> the head are turned about 30 to 45 degrees away from straight-on, and the
> character **looks toward the right-hand side of the frame** — as if
> speaking to somebody standing off to their right, never out at the reader.
> Manga stages a conversation this way: the two speakers are angled toward
> each other, and a character square to the camera reads as posing rather
> than talking. **Every one of the six panels uses the same three-quarter
> angle, turned the same way** — only the expression changes. The panel is
> square precisely so that folded arms and a raised hand fit inside it —
> **nothing may be cropped by the edge of a panel, least of all a hand.**
> Keep a little clear space on all four sides of the figure.
>
> **The head stays exactly the same size and in exactly the same place in
> all six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it —
> but the framing, the scale and the eye level never do. Because the crop is
> at the chest, keep every gesture at chest height or above, so hands stay
> inside the frame.
>
> Reading order — left to right along the top row, then left to right along
> the bottom row:
> **1 — neutral:** ears up, eyes level, mouth slightly open as if talking.
> **2 — happy:** eyes curved to two upward arcs, ears forward, head slightly
> raised.
> **3 — worried:** ears half back, eyes wide, head lowered a little.
> **4 — annoyed:** ears flat back, eyes narrowed to slits, chin down.
> **5 — surprised:** eyes fully round and large, ears straight up, whiskers
> out.
> **6 — sad:** ears down and out, eyes lowered, head dropped.
>
> Every panel is cropped at the **chest**, showing the head, shoulders and
> front legs and nothing below them.
> The background behind and between the figures is **pure flat white
> #FFFFFF**, edge to edge across the whole image — no shadow, no gradient,
> no texture, no paper tone, no border and no line between panels. **Do not
> draw a transparency checkerboard.** Do not render a grey-and-white
> chequered pattern, a grid, or any other stand-in for transparency: a drawn
> checkerboard is pixels, not alpha, and is far harder to remove than plain
> white. Plain white, and nothing else. The image is **3:2**.
>
> **Do not include:** a seventh or eighth panel, or any panel beyond the six
> listed; any text, letters, numbers, captions, watermarks, signatures,
> speech bubbles, logos, panel borders or motion lines. No sparkles or
> glows.

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

**Do not cut a character sheet up.** The sheet *is* the asset: saved whole as
`<slug>.png`, and the page shows one emotion by sliding it behind a window one
panel wide and one panel tall. Five files, not thirty, and no six files that
have to agree with each other about a baseline.

1. **Check the grid is exactly three equal columns by two equal rows**, with the
   panels square and tiling the image edge to edge. This is the one thing the
   sprite depends on: the page steps by a fixed fraction, so an uneven grid — or
   a margin down one side — shows a sliver of the neighbouring face. Re-roll
   rather than nudge; if it is close, set the canvas to a round multiple of
   three across and two down and centre each figure in its cell.
2. **Key the white out**, across the whole sheet, then save with an alpha
   channel. Use a **contiguous** fill or magic wand from outside the figures —
   not a global "remove all white" — because Thảo and Khoa wear white shirts and
   a global key would eat them. The style guarantees this works: every figure is
   drawn with a closed, continuous black contour, so the white *inside* an
   outline is never connected to the white outside it.

   > Transparency is asked for nowhere in the prompts, deliberately. Generators
   > asked for a transparent background tend to *draw* the grey-and-white
   > checkerboard that editors use to depict it — pixels, not alpha, and far
   > harder to remove than plain white. Every prompt names that failure and
   > forbids it.
3. **Do not trim or re-crop the panels.** The grid is what the offsets are
   computed from; cropping to the figure breaks it.
4. Save sheets as **PNG with transparency** to `docs/assets/cast/`, plates as
   **JPG** to `docs/assets/bg/`.
5. `python3 tools/check_cast.py`, then `python3 tools/build.py`, then reload
   Unit 1 Lesson 1.

Two things you do **not** have to do:

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
  > is drawing every character twice — ten sheets instead of five, each pair
  > having to match. Accepted deliberately; do not "fix" it by drawing a second
  > facing.
- **Do not reorder the panels.** Reading order is `neutral · happy · worried`
  along the top row, then `annoyed · surprised · sad` along the bottom, and that
  is the `col` index in `data/cast.json`. Changing one without the other
  silently gives every character the wrong face.

# If a generation drifts

| Symptom | Fix |
| --- | --- |
| A character resembles a Doraemon character — the cat goes blue or bipedal, the boy acquires round glasses | Demote the reference image to *style only*, saying so in the prompt, and paste that character's **must not** line in verbatim. Do not keep a "close enough" variant; it contaminates everything fed from it |
| It comes back as generic modern anime — soft shading, glossy eyes, strand-shaded hair | Re-paste the **Line** and **Colour** paragraphs in full. They are the whole defence and they degrade the moment they are summarised. Naming what it must *not* be does more work than naming what it should be |
| The sheet comes back with eight panels, or four, instead of six | Generators default to familiar grids and will pad a set out. The count is now the first line of every character prompt and is repeated in the prohibitions, so this is a miss rather than an ambiguity — re-roll. Do **not** keep an eight-panel sheet and ignore two: the page computes the offsets from a 3 × 2 grid, so every face would be cropped wrong |
| The panels do not line up, or a sliver of the next face shows | They are not exactly equal sixths. The page steps by a fixed fraction, so this cannot be fixed by re-cropping — re-roll, or set the canvas to a round multiple of six and centre each figure in its sixth |
| An avatar has a white box behind it | The white was never keyed out. It is invisible against the generator's own preview — always check the saved PNG against a dark colour |
| The sheet comes back with a grey-and-white chequered pattern behind the figures | The generator has *drawn* a transparency checkerboard instead of leaving alpha. Re-roll: every prompt already forbids it by name, so this is a miss rather than an ambiguity, and a drawn checkerboard is much harder to key than plain white |
| The characters look out at the reader, or the two speakers face away from each other | The sheet was drawn square to the camera, or drawn looking *left*. Both must be three-quarter and looking toward the **right** of the frame — the page flips the right-hand speaker, so a left-looking sheet points both of them off the edges. Re-roll; it cannot be fixed by flipping the file, which would reverse the character's own asymmetry (Thảo's exposed ear, Khoa's parting, Mun's torn left ear) |
| Keying the white also ate a white shirt | A global "remove all white" was used. Key with a contiguous fill from outside the figure — the closed black contour keeps the shirt's white separate from the background's |
| A plate comes back with people in it | Repeat the "no people, no animals" clause as the **first** line of the description rather than the last. It must be re-rolled, not painted out: the cast is composited on top and a drawn figure appears beside itself |
| A plate comes back vague, empty or blurred | The style's whole contrast is simple figures against a literal world. Re-paste **Backgrounds carry the realism** and name three specific objects the plate must contain |
| The setting drifts Japanese — sliding doors, a suburban street, a vacant lot with concrete pipes | Expected: it is copying the reference's *world* along with its style. Re-paste **Setting discipline** and add three delta-specific objects |
| Text appears in the image | Gemini adds signage unprompted in street scenes. Keep the "no text, no letters" clause and re-roll — it is not reliably fixable by inpainting |
