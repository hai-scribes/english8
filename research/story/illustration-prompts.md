# Illustration prompts — *The Calling Lamp*

The art the site loads. Written for **Gemini** (Nano Banana / Imagen in the
Gemini app or API).

The Getting Started dialogue on every Lesson 1 page is a **comic**: a background
plate, the speaker's face, and one speech balloon, advancing as the reader
scrolls. So this file asks for exactly two kinds of image, and both are
composited by the page rather than drawn as finished scenes:

- **§2.3 — five character sheets.** One image each, six emotion panels in a
  row, **half-body, cropped at the waist** so the build and the clothes read,
  on transparency. The page shows one panel by offsetting the sheet, so these
  are saved whole and never cut up.
- **§3 — nine background plates.** The story's four fixed places plus five
  others, drawn empty.

That is why there are no longer twelve one-per-chapter scene illustrations here:
a scene with its characters drawn in cannot change expression, and every line of
every dialogue now needs to. Nine plates and five six-panel sheets cover all
twelve chapters and recombine; ninety fixed scenes would not.

`data/cast.json` is the contract between this file and the build — §4 has the
filenames, and `tools/build.py` fails on a dialogue naming anything the manifest
does not declare.

Nothing here goes on a learner's page. Like the rest of `research/story/`, this
is reference material: `tools/build.py` never reads it.

The house look is **the Doraemon drawing style** — Fujiko F. Fujio's line, his
flat colour, his carefully-built ordinary backgrounds — applied to a Mekong
delta canal town and to a cast that is entirely ours. The style is the borrowed
part. The characters are not, and §2.0 is the guard that keeps it that way.

## How to use these

1. **Attach the Doraemon reference graphic as a style reference** on every
   generation, and say: *"Match the line weight, colouring, shading and
   background treatment of the attached image. Do not copy, quote or resemble
   any character in it — the characters come from the second attached sheet."*
2. **Generate the group sheet first** (§2.1) and keep it. It is the character
   reference attached to every avatar generation. §2.2 makes a labelled copy for
   your own use, which is **never attached to anything**.
3. For an **avatar sheet** (§2.3), attach the Doraemon style reference **and**
   the unlabelled §2.1 sheet, and say *"Style from image 1, character design
   from image 2."* Gemini holds identity far better from an image than from
   text. For a **background plate** (§3), attach the style reference only —
   there are no characters in a plate.
4. Paste **§1 verbatim**, then the block you want. The style block is repeated
   in full each time on purpose — do not shorten it between runs, or the style
   drifts back toward generic anime within two or three images.
5. Generate 3–4 variants, keep one, and feed the keeper back as an additional
   reference for the next generation. Consistency compounds.
6. Run `python3 tools/check_cast.py` to see what is still missing.

Aspect ratio: **16:9** for both. An avatar sheet is a wide strip of six panels
in one 16:9 image, saved whole — the page does the cropping. Say it explicitly;
Gemini defaults to square.

---

## 1. The style block — paste this first, every time

> **Art style.** Classic Japanese children's-manga and TV-anime style in the
> tradition of Fujiko F. Fujio — the *Doraemon* look. Simple rounded characters
> drawn in clean even-weight black ink outlines, standing in front of carefully
> constructed, literal, everyday backgrounds. Not modern anime, not moe, not
> Ghibli, not American cartoon, not 3D, not photorealistic, not painterly.
>
> **Line.** Black contour line of near-constant width, closed and continuous.
> No tapering brush strokes, no cross-hatching, no stippling, no sketchy or
> broken linework, no visible pencil. Interior detail is minimal: a face is a
> handful of lines. Backgrounds are drawn with a **thinner, lighter** line than
> the figures, so the characters read cleanly against them.
>
> **Colour.** Flat cel fills — solid areas of colour with hard edges. At most
> one flat shadow tone per surface, shaped as a clean geometric shape, never
> soft-edged. No gradients (the open sky is the one exception), no visible
> texture, no paper grain, no brush grain, no airbrushing, no ambient occlusion.
> Bright, clear and cheerful even when the scene is sad.
>
> **Figures.** Head large relative to the body — roughly one to four and a half
> for the children. Eyes are plain white ovals with a black dot pupil and one
> thin brow; noses are a small simple shape; a mouth is one curve that opens to
> a plain rounded shape when speaking. Hands are simple and rounded, five
> fingers, no knuckle detail. Hair is one solid flat colour with at most a
> single flat highlight band — never strand-shaded. Embarrassment or heat is one
> small flat oval on each cheek and nothing more.
>
> **Backgrounds carry the realism.** This is the defining contrast of the style:
> the people are simple, the world behind them is not. Draw the setting with
> correct one- or two-point perspective, real architecture, and everyday objects
> catalogued in full — every tile, pot, wire, sandal and moored boat in its
> place. Wide open sky with a few plain white clouds. Depth is shown by
> **lighter flat colour and thinner line**, never by blur, haze or
> depth-of-field.
>
> **Palette.** The delta's own colours, rendered as flat cel fills: jade-green
> canal water, ochre mud, terracotta roof tiles, faded indigo and pale-jade
> cotton clothing, brass, bright blue sky. One object per image is given a
> colour used nowhere else in the frame — that is where the eye should land.
>
> **Setting.** Bến Sẻ, a small canal town in the Mekong delta of Việt Nam,
> present day but modest: concrete-and-tile houses, corrugated roofs, water
> hyacinth on the canal, a wooden landing stage, motorbikes, bamboo, banana and
> areca palms, tangled overhead wires. Ordinary and lived-in. **No temples, no
> lanterns-on-strings tourist imagery, no conical hats as decoration, no
> dragons. Nothing Japanese** — no sliding paper doors, no tatami, no Japanese
> suburban houses, no vacant lot with stacked concrete pipes, no Japanese
> school uniforms or signage.
>
> **Composition.** Cinematic wide shot, characters small-to-medium in frame so
> the place reads as much as the people. Eye level or slightly low. Leave the
> upper third relatively quiet.
>
> **Mood.** Everyday and unforced. The magic is never announced by the lighting.
>
> **Characters are original.** The style is borrowed; the cast is not. **Do not
> draw, echo or partially resemble any existing Doraemon character.** In
> particular: no blue-and-white round robot cat, no red collar, no bell, no
> belly pouch, no bipedal cat, no mitten hands, no round black-rimmed glasses on
> the boy, no yellow-shirt-and-blue-shorts combination, no hairband or ribbon on
> the girl, no orange-striped bully, no pointed-face boy with a swept quiff.
> Vietnamese characters throughout — do not restyle them as Japanese or Western.
>
> **Do not include:** any text, letters, numbers, captions, watermarks,
> signatures, speech bubbles, logos, manga panel borders, motion-line
> backgrounds, or UI. No exaggerated screaming-face gags. No sparkles, glows,
> lens flare, or magic effects unless the scene block explicitly asks for one.

---

## 2. The character sheets

### 2.0 Why these designs are shaped the way they are

Two constraints drive every choice below, and both are worth keeping in mind if
a design is ever revised.

**Readable at thumbnail.** The illustration sits above a dialogue on a
phone-width page, so each character must be identifiable from **silhouette and
one flat colour alone**, before any facial detail resolves. Each entry therefore
fixes three things: a *silhouette rule*, a *signature colour*, and *one graphic
tag* — a single feature visible from any angle. Do not let a generation trade
the tag away for a nicer pose.

**Distinct from the reference.** The reference graphic supplies line, colour and
background treatment. It supplies **no character design at all**. The
lookalike risk is real and directional — a black cat drifts blue, a boy drifts
toward glasses — so each entry below carries an explicit *must not* line, and
§1 repeats the general guard on every run. Check the *must not* lines before
keeping an image, not after building a chapter on it.

### 2.1 The primary sheet — generate this once, first, and keep it unlabelled

This is the master reference. It is generated **without a single character of
text on it**, and it is the image attached to every avatar sheet in §2.3. §2.2
explains why the names go on a *separate copy*.

> [paste the §1 style block]
>
> A character reference sheet on a plain white background, six figures standing
> side by side, full body, front-facing, evenly spaced, same scale, same flat
> lighting, all drawn in the attached style. Label nothing — no text anywhere.
>
> 1. **Tí** — a thirteen-year-old Vietnamese boy; the smallest and thinnest of
>    the children, slightly small for his age. *Silhouette:* narrow and
>    slightly caved-in, one shoulder lower than the other where an oversized
>    shirt slips off it. *Hair:* black, an uneven spiky cluster with **one
>    cowlick standing up at the back of the crown** that never lies flat.
>    *Face:* eyes smallish and round under a low flat brow line, giving a
>    permanently slightly wary look; mouth usually a short straight line.
>    *Clothes:* a faded jade-green t-shirt a size too big, dark shorts, plastic
>    sandals. *Graphic tag:* the standing cowlick, plus **a band of dried mud
>    across one shin.** Ordinary and a bit closed-off — not cute, not heroic.
>    **Must not:** wear glasses of any kind; wear a yellow top with blue shorts.
> 2. **Thảo** — a thirteen-year-old Vietnamese girl, the same height as Tí or a
>    little taller. *Silhouette:* upright and square-shouldered, deliberately
>    **asymmetric at the head** — straight black hair cut to the jaw with a
>    straight fringe, tucked behind one ear so that one ear shows and the other
>    is covered. *Face:* eyes large and open, brows set high, a small closed
>    half-smile — she is the one who is sure of things. *Clothes:* white
>    short-sleeved school shirt, dark blue skirt or trousers, sandals.
>    *Graphic tag:* the single exposed ear and the high brows. **Must not:**
>    wear a hairband, ribbon, bow or hairclip; wear pink.
> 3. **Bà Sáu** — Tí's grandmother, around seventy. *Silhouette:* the shortest
>    adult but the **widest and most stable** shape on the sheet — square,
>    planted, upright, feet apart. *Hair:* grey, pulled back into a tight low
>    bun drawn as one solid shape. *Face:* eyes usually drawn as two short
>    downward curves, opening to circles only when startled; one deep line at
>    each side of the mouth, set stern. *Clothes:* loose brown-and-indigo *áo bà
>    ba* style tunic and wide trousers, bare feet or wooden sandals. *Graphic
>    tag:* **forearms drawn noticeably thicker than anyone else's on the sheet.**
>    **Must not:** be drawn frail, bent or sweet.
> 4. **Mun** — a thin black cat, ordinary house-cat size and build, **on four
>    legs**. *Silhouette:* low, lean, slightly scruffy, ribs faintly suggested
>    by two short lines, tail thin and usually low. *Colour:* solid flat black
>    with a single flat dark-grey band along the spine as its only shading.
>    *Face:* amber-gold eyes drawn as full circles with a **vertical slit
>    pupil** — the only slit pupils in the cast — and a scholar's air he has not
>    earned. *Graphic tag:* **one torn left ear**, kept visible from every angle
>    in every drawing. **Must not:** be blue, or blue-and-white; have a white
>    belly or a pouch; wear a collar, bell, clothing or any prop; stand upright,
>    walk on two legs, sit like a person, or have round mitten paws.
> 5. **Khoa** — a boy of the same age, half a head taller than the others,
>    neat and calm. *Silhouette:* straight vertical, arms at rest, the stillest
>    figure on the sheet. *Hair:* black, flat and combed, with **a clean side
>    parting** — the only parting in the cast. *Face:* eyes even ovals with the
>    pupil centred (nobody else's pupils are centred), and a small level
>    closed-mouth smile. Genuinely kind; **never smug, never sneering.**
>    *Clothes:* white shirt buttoned to the collar, dark trousers, proper shoes.
>    *Graphic tag:* the parting, plus **a green notebook** carried flat against
>    his side. **Must not:** be drawn as a rival or a snob.
> 6. **The brass lamp** — a small oil lamp of dented, unpolished brass, about
>    the size of two fists, with a short spout, a shallow bowl and a wide flat
>    base. Drawn with the same even black contour as everything else: brass as a
>    flat ochre fill with **one flat lighter-ochre shape** for the shine, and two
>    or three short lines for dents and scratches. Old, domestic, working. Not a
>    genie lamp with a long curled spout. Unlit. **Must not:** glow, sparkle, or
>    emit smoke, light rays or any effect.
>
> Consistent, repeatable character designs suitable for reuse across a
> twelve-part illustrated story.

Keep the returned image as `cast-sheet.png`. Every avatar sheet in §2.3 assumes
it is attached.

### 2.2 The labelled copy — for you, not for the generator

You do want a named sheet: twelve chapters is long enough that "the tall neat
one" stops being unambiguous, and a prompt reads better as *"Khoa, figure 5 on
the sheet"* than as a re-description. But **do not ask the image model to write
the names.** Two reasons, both cheap to verify and expensive to discover late:

- **Vietnamese diacritics do not survive image generation.** Tí, Thảo and Bà Sáu
  come back as mangled glyphs or invented letterforms. A reference sheet whose
  labels are wrong is worse than one with no labels.
- **A labelled sheet leaks its text into every scene built from it.** §4 already
  records that Gemini adds unrequested signage to street scenes; handing it an
  image with words on it makes that much worse, and the resulting text is not
  reliably removable by inpainting.

So keep **two files** from one generation:

| File | Has names? | Where it goes |
| --- | --- | --- |
| `cast-sheet.png` | no | attached to the style reference on every avatar sheet |
| `cast-sheet-labelled.png` | yes | this repo, and your own screen while writing prompts. **Never attached to a generation.** |

**Making the labelled copy** — add the text yourself, outside the generator, so
the diacritics are correct:

- *Zero setup (macOS):* open `cast-sheet.png` in Preview → Markup toolbar → Text
  tool → one text box under each figure → **File ▸ Duplicate**, then save as
  `cast-sheet-labelled.png`. Duplicating first is what keeps the clean master
  clean.
- *Scripted:* `brew install imagemagick`, then annotate with a font that carries
  Vietnamese diacritics — `/System/Library/Fonts/Supplemental/Arial Unicode.ttf`
  is present on this machine and does. Do not use a font that silently
  substitutes; check `ả`, `ạ` and `í` in the output before trusting it.

Label the figures, left to right, exactly: **1 Tí · 2 Thảo · 3 Bà Sáu · 4 Mun ·
5 Khoa · 6 Cây đèn (the lamp)**. Keep that order fixed forever — the numbers are
what you cite in prompts, and they only work if they never move.

**If you want the names baked in anyway** — for a printed copy, or a sheet
shared with someone who will not open Preview — generate a *third* image, never
the master, using unaccented ASCII so the model has a chance of forming the
letters:

> [paste the §1 style block]
>
> — but **override its "no text" rule for this image only.**
>
> Reproduce the attached character sheet exactly: same six figures, same
> designs, same order, same scale, same plain white background, redrawn in the
> same style with no changes to any character.
>
> Below each figure, centred, add its name in **plain capital Latin letters with
> no accents and no diacritical marks**, in a simple clean sans-serif, black, at
> a small size: **TI**, **THAO**, **BA SAU**, **MUN**, **KHOA**, **DEN**. Those
> six words are the only text permitted anywhere in the image. No other letters,
> numbers, captions, watermarks, signatures, panel borders or logos.

Expect to re-roll this several times, and expect the names to still come back
slightly wrong. Treat it as a convenience, not as the reference — the reference
is `cast-sheet.png`, and its labels live in Preview or in this file.

### 2.3 The half-body sheet — this is the one the app actually loads

Everything above fixes *who* a character is. This fixes *what the site
displays*. The dialogue on every Lesson 1 page is now a comic: a background
plate, the speaker, and one speech balloon, advancing as the reader scrolls.
Which drawing appears is chosen per line from six emotions.

**These are half-body, not headshots.** Cropped at the waist, so the reader gets
the body type, the clothes, the arms and the posture — which is where most of
the characterisation in this style actually lives. Bà Sáu's forearms and Khoa's
green notebook are both §2.1 *graphic tags*, and a face-only crop throws both
away along with every silhouette rule on the sheet.

> One consequence worth knowing before you draw: **Tí's second graphic tag, the
> band of dried mud across one shin, is below the crop and cannot appear here.**
> On the avatars the standing cowlick carries him alone, so it has to be
> unmistakable in all six.

**Six emotions, shared by every character.** Not a per-character set — a
per-character set is more expressive and also means nobody can remember which
ones a given character has. Six × five is thirty avatars, which is a set one
person can draw in a sitting and keep consistent.

| Slug | What it is |
| --- | --- |
| `neutral` | Talking, unremarkable. The default, and by far the most used — draw this one first and judge the others against it |
| `happy` | Pleased, warm, amused. A real smile, not a smirk |
| `worried` | Anxious, concerned. Brows up and drawn together |
| `annoyed` | Cross, exasperated, digging in. Brows down |
| `surprised` | Caught out, startled. Eyes wide, mouth open |
| `sad` | Quiet, downcast, hurt. Eyes lowered |

Generate **one sheet per character**, then cut it into six files.

> [paste the §1 style block]
>
> A six-panel character sheet on a plain white background, no text anywhere.
> **[NAME], figure [N] on the attached sheet** — reproduce that design exactly,
> with no change to hair, face, clothing, colour or proportion between panels.
>
> Six panels in one row, evenly spaced, identical size, identical framing.
> Each panel shows the **upper half of the body — head, shoulders, chest, both
> arms and hands, cropped at the waist** — facing the viewer and turned very
> slightly to one side. The clothing, the build and both hands are visible in
> every panel.
>
> **The head stays exactly the same size and in exactly the same place in all
> six panels**, at the same scale and under the same flat lighting. The
> expression changes, and the shoulders, arms and hands may move with it — but
> the framing, the scale and the eye level never do.
>
> Left to right, face and body together:
> **1 — neutral:** an ordinary talking face, mouth slightly open; arms relaxed
> at the sides.
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
> Keep [GRAPHIC TAG] clearly visible in all six panels. Each panel is drawn
> **cut off cleanly and straight across at the bottom edge of the frame**, at
> the waist, with nothing below it and no legs. Plain white behind every panel
> and no border between them.

Fill `[GRAPHIC TAG]` from §2.1 — Tí's standing cowlick, Thảo's single exposed
ear, Bà Sáu's thick forearms, Khoa's side parting **and the green notebook held
flat against his side**, Mun's torn left ear. Two of those five are body tags
rather than face tags, which is the whole argument for cropping at the waist.

**For Mun**, replace the framing paragraph with: *each panel shows the cat's
head, shoulders and front legs, on four legs, facing the viewer, cropped
mid-body.* He never sits like a person, in any panel, for any emotion, and his
emotions are carried by ears, eyes and tail rather than by arms.

#### Saving them — the sheet is the asset, uncut

**Do not cut the sheet into six files.** It is saved whole, one file per
character, and the page shows an emotion by sliding the image sideways behind a
window one-sixth of its width.

```
docs/assets/cast/<character>.png      ti · thao · basau · khoa · mun
```

That is five files rather than thirty, and it removes the step that was most
likely to go wrong. Six separate files had to agree with each other about a
width, a height and a baseline, and that agreement was made by hand in an image
editor — get it slightly wrong and the character jumps or resizes every time the
emotion changes. A single sheet cannot disagree with itself. It also means every
emotion is already in memory the first time a character speaks, so the face
never flickers as it changes.

What the sprite buys is paid for by one requirement, and it is strict:

- **The panels must be exactly six equal sixths, edge to edge.** The page steps
  the image by a fixed fraction, so an uneven sheet — or one with a margin down
  one side — shows a sliver of the neighbouring face. If a sheet comes back
  uneven, re-roll it rather than nudging it; if it is close, set the canvas
  width to a round multiple of six and centre each figure in its sixth.

And three that were always true:

- **Transparent background**, across the whole sheet. A white box behind a
  character is the single most visible way to get this wrong, and it is
  invisible on the generator's white sheet — check it against a dark colour.
- **Flush with the bottom edge.** No transparent margin along the bottom: the
  avatar stands on the floor of the panel, and a half-figure with air under it
  reads as a sticker. Trim the empty rows once, for the whole sheet.
- **The panel order is load-bearing.** Left to right is `neutral · happy ·
  worried · annoyed · surprised · sad`, and that is the `col` index in
  `data/cast.json`. Reordering one without the other silently gives every
  character the wrong face.

The geometry lives in `data/cast.json` under `sheet` — `cols` and `aspect` —
and the page derives the crop from those two numbers alone. Nothing in the CSS
or the markup hard-codes six, so a seven-emotion sheet would need a new column
in the manifest and no code change.

Facing does not need drawing twice. The site mirrors the avatar horizontally
for whoever is on the right, so **draw every character facing the same way** and
let the layout turn them around.

### 2.4 Secondary cast — design them when they first speak

These five appear in the prose but do not speak in any Lesson 1 dialogue, so
they are not in `data/cast.json` and have no avatars. Generate the group sheet
the same way — §1 style block, same six-abreast layout, same *must not*
discipline — and then their emotion sheet from §2.3.

| Character | Silhouette rule | Signature colour | Graphic tag | Must not |
| --- | --- | --- | --- | --- |
| **Hùng** — the deadline in human form | Biggest in any frame by half a head; broad rounded-square head, thick neck, short flat-topped hair | Dark red | Mouth drawn wide open, singing, whenever he is happy | Wear an orange-and-white striped shirt |
| **Đạt** — the have, to Tí's have-not | The *smallest* of the boys, neatly dressed, rounded face; a small side sweep of hair | Pale blue with a stripe | Always carrying something new and unscuffed | Have a pointed fox face or a swept-up quiff |
| **Chú Bảy** — the mirror ahead | Tall, loose, unhurried, permanent slight stoop | Faded olive | A towel over one shoulder, always | Look successful, or look defeated |
| **Cô Yến** — the institutional scoreboard | Thin and precise, hair pinned flat, **rectangular** glasses | Grey-blue | A folder held flat against the chest | Wear round glasses; be drawn cruel |
| **Bạch** — the superior substitute | A real white cat on four legs, sleek and well-fed; **both ears whole** — the deliberate counterpoint to Mun's torn one | White, green eyes | The intact ears, and a posture that is always correct | Be a robot; wear a bow; be yellow |

**The Lamp-keeper is deliberately not designed here.** The bible leaves him
open — even his species — and he carries the story's only farewell, so guessing
a design in an illustration file would settle a decision that belongs upstream.
Design him in `story-bible.md` first.

---

These five do not speak in any Lesson 1 dialogue yet, so they have no avatars
and `data/cast.json` does not list them. Add a character there **and** generate
their emotion sheet in the same change — a name the site knows with no faces
behind it fails the build, which is the intended order.

---

## 3. The background plates

The other half of what the page loads. A plate is the *place* with nobody in it:
the cast is composited on top, so a figure drawn into the plate would appear
beside itself.

Nine plates cover all twelve chapters, because the story deliberately reuses
four places (`story-bible.md` §5). They are 16:9, and they are the only
full-scene images this file now asks for.

```
docs/assets/bg/<slug>.jpg
```

Every plate takes the same prompt frame:

> [paste the §1 style block]
>
> An empty background plate, 16:9, in the attached style. **No people, no
> animals, and no characters of any kind anywhere in the frame.** Draw the
> place only.
>
> Composition: the camera is at standing eye level, looking straight ahead, with
> the **lower third of the frame kept simple and uncluttered** — figures will be
> placed there, and detail behind them is lost. Keep the interest in the middle
> and upper thirds. Nothing important in the top-left or top-right corners,
> where speech balloons sit.
>
> [PLATE DESCRIPTION]

| Slug | Plate description to paste |
| --- | --- |
| `canal-landing` | A wooden landing stage on a jade-green canal, late morning, hot and still. Worn planks in the near ground, thick ochre mud at the waterline, water hyacinth drifting. A long wooden boat moored at one side. The far bank is a low line of banana and areca palms under a wide bright sky. |
| `kitchen` | A small delta kitchen interior, morning. A low table, enamel bowls, a tin of tea on a shelf, a bunch of bananas hanging from a beam, a large pot on the floor. One doorway on the right opens onto a bleached-white hot road outside. Warm interior against bright outdoor light. |
| `school-yard` | A school yard, late afternoon, long low shadows on concrete. A yellow-ochre wall with a painted noticeboard on it, empty. A flame tree at one side, one bicycle leaning against the wall, a low gate at the back. Nobody in it. |
| `market` | A covered market lane, early morning. Stalls on both sides heaped with green oranges, herbs and fish baskets, scales hanging, tarpaulins overhead, plastic stools stacked. Crowded with goods and completely empty of people. |
| `lane` | A narrow lane between two-storey concrete houses, blue hour. Warm light spilling from two open doorways, overhead wires tangled between the walls, a motorbike parked against one house, a few collapsed paper lanterns in the gutter. |
| `canal-school` | A narrow canal behind a school's back wall, flat hard midday light. The water is opaque brown-ochre with a dull scum at the edge and plastic caught in the reeds. On the far bank a low corrugated-iron workshop with a pipe discharging into the water. No birds. |
| `science-room` | A school science room after hours, warm desk-lamp light against a darkening window. A worktable with a tangle of jumper wires, a small circuit board, a screwdriver, a battery pack and two enamel cups. Shelves of jars behind. |
| `storm-yard` | The yard of a delta house under a low bruised storm sky, wind visible in everything. A tiled roof with one broken tile, a wooden ladder against the eaves, a snapped branch across the yard, buckets and basins lined along the wall, water standing at the bottom of the lane. No sunlight. |
| `road` | A dirt road at the edge of town at first light, the sky going from deep blue to peach. The road runs away from the viewer toward a wide pale river and low hills beyond. Two or three stars still out. The town behind is dark. |

**When the lamp is lit**, in any plate or later illustration, it is the only
place a flame appears and it stays ordinary:

> The flame is small, low and domestic — a plain flat teardrop shape with a
> single lighter shape inside it and the same black contour as everything else.
> It does not glow, radiate, sparkle, cast rays or light anything beyond arm's
> reach, and nothing in the frame is tinted by it.

That restraint is the point, and flat cel makes it easier to hold than paint
would: there is no soft light to leak. The lamp never fails and never announces
itself, and a picture that renders it as a magic item contradicts the story it
sits above.

---

## 4. Wiring the art to the site

The site reads `data/cast.json`. That file is the contract: it lists the
characters, the six emotions and the nine background slugs, and `tools/build.py`
**fails the build** on a dialogue that names anything outside it.

```sh
python3 tools/check_cast.py            # what is declared, and what is drawn
python3 tools/check_cast.py --strict   # fail while anything is still missing
```

Authoring a dialogue against the art looks like this:

```
::: dialogue title="The list in the yard" bg="canal-landing" gramen="…"
**Thảo|neutral:** You've been down here all morning. What's wrong?
**Tí|sad:** Nothing's wrong.
@bg school-yard
**Thảo|annoyed:** Tí.
:::
```

- `|emotion` picks the avatar. Leave it off and the line uses `neutral`.
- `@bg <slug>` on its own line moves the scene from there on. Use as many as
  the chapter needs, or none.
- A line with **no speaker** is narration: the plate carries the beat alone,
  with a caption box and no avatar.
- A dialogue with **no `bg=` at all** is unstaged and ships as plain text. That
  is the rollout, not a failure — a chapter becomes a comic the day somebody
  gives it a place and chooses faces.

Missing art degrades to an empty panel with a working balloon, so a half-drawn
cast never breaks a page.

---

## 5. If a generation drifts

The failures to expect, and the fix for each. The first two are the expensive
ones — catch them before a chapter is built on the image.

| Symptom | Fix |
| --- | --- |
| A character starts resembling a Doraemon character — the cat goes blue or bipedal, the boy acquires round glasses | Re-attach the §2.1 sheet **as the character reference** and demote the Doraemon image to *style only*, saying so in the prompt. Re-read that character's *must not* line and paste it into the prompt verbatim. Do not keep a "close enough" variant; it contaminates every later sheet fed from it |
| It comes back as generic modern anime — soft shading, glossy eyes, strand-shaded hair | Re-paste §1 in full. The **Line** and **Colour** paragraphs are the whole defence, and they degrade the moment they are summarised. Naming what it must *not* be ("not modern anime, not moe, not Ghibli") does more work than naming what it should be |
| A background plate comes back vague, empty or blurred | The style's whole contrast is simple figures against a literal world. Re-paste the **Backgrounds carry the realism** paragraph and name three specific objects the plate must contain |
| A background plate comes back with people in it | Expected, and it must be re-rolled rather than painted out — the cast is composited on top and a drawn figure appears beside itself. Repeat the "no people, no animals" clause as the **first** line of the plate description, not the last |
| The six faces do not line up when cut | The prompt fixes the body and moves only the face; if a panel drifts, re-roll that sheet rather than re-cutting. A character that jumps a few pixels between lines is very visible on a page that changes one line at a time |
| An avatar has a white box behind it | The transparency was never cut. Invisible against the generator's white sheet — always check against a dark colour before saving |
| The setting drifts Japanese — sliding doors, a suburban street, a vacant lot with concrete pipes | Expected: it is copying the reference's *world* along with its style. Re-paste the **Setting** paragraph including the "Nothing Japanese" clause, and add three delta-specific objects |
| Text appears in the image | Gemini adds signage unprompted in street scenes. Keep the "no text, no letters" clause and re-roll — it is not reliably fixable by inpainting. **First check you attached `cast-sheet.png` and not `cast-sheet-labelled.png`** (§2.2); an attached sheet with words on it puts words in every generation |
