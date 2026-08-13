# Illustration prompts — *The Calling Lamp*

Twelve prompts, one per chapter, for the Getting Started dialogue on each unit's
Lesson 1 page. Written for **Gemini** (Nano Banana / Imagen in the Gemini app or
API).

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
2. **Generate the character sheets first** (§2). Keep the outputs. §2.1 is the
   sheet you will attach to all twelve scene generations; §2.2 makes a labelled
   copy of it for your own use, which is **never attached to anything**.
3. For every scene prompt, attach **both** the Doraemon style reference **and**
   the **unlabelled** §2.1 sheet, and say *"Style from image 1, character design
   from image 2."* Gemini holds identity far better from an image than from
   text.
4. Paste **§1 verbatim**, then one scene block from §3. The style block is
   repeated in full each time on purpose — do not shorten it between runs, or
   the style drifts back toward generic anime within two or three images.
5. Generate 3–4 variants per scene, keep one, and feed the keeper back as an
   additional reference for the next chapter. Consistency compounds.

Aspect ratio: **16:9** for scene illustrations (they sit above the dialogue on a
phone-width page). Ask for it explicitly — Gemini defaults to square.

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
text on it**, and it is the image attached to all twelve scene prompts. §2.2
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

Keep the returned image as `cast-sheet.png`. Every scene prompt in §3 assumes it
is attached.

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
| `cast-sheet.png` | no | attached to the style reference on all twelve scene prompts |
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

### 2.3 Turnarounds — the sheets that actually buy you reuse

The front-facing group sheet fixes *identity*. It does not fix what a character
looks like from behind or in motion, and the scene blocks need both: Chapter 1
puts Tí three-quarters away from the viewer, Chapter 6 turns Thảo's head in
profile, and Chapter 12 — the last image of the story — is **entirely from
behind**. Without a turnaround, the generator invents the back of a head afresh
each time, and the cowlick, the tucked ear and the torn left ear are the first
things it loses.

Generate one of these per character for at least **Tí, Thảo and Mun**. It is
three extra generations that pay for themselves by Chapter 4.

> [paste the §1 style block]
>
> A single-character turnaround sheet on a plain white background, no text
> anywhere. **[NAME], figure [N] on the attached sheet** — reproduce that design
> exactly, with no changes to hair, clothing, colour or proportion.
>
> **Top row:** the same figure standing in a neutral pose, full body, at the same
> scale and under the same flat lighting, shown five times — **front, three-
> quarter front, side profile, three-quarter back, and straight back view.**
>
> **Bottom row:** the same character's head only, five times, same size, same
> front-facing angle, with five expressions — **neutral, pleased, worried,
> caught out, and asleep.**
>
> [for Mun, replace the bottom row with:] **Bottom row:** the same cat, full
> body, five times — **sitting, walking, crouched low, curled asleep, and
> looking back over one shoulder.** He is on four legs in all five.
>
> Every view must keep [GRAPHIC TAG] visible and unchanged.

Fill `[GRAPHIC TAG]` from §2.1: for Tí, *the cowlick standing at the back of the
crown and the band of dried mud on one shin*; for Thảo, *the hair tucked behind
one ear only, so one ear shows and the other does not*; for Mun, *the torn left
ear*. That last one is the reason the back view matters — a torn ear is
invisible from exactly the angle Chapter 12 is drawn from unless the sheet
settles how it reads there.

Attach the relevant turnaround **in addition to** the group sheet for any scene
where that character is turned away, crouching or in profile: Chapters 1, 4, 6,
10 and 12.

### 2.4 Secondary sheet — only if the illustrations extend past the dialogues

These six appear in the prose but not in any Lesson 1 dialogue scene below, so
this sheet is optional. Generate it the same way — §1 style block, same
six-abreast layout, same *must not* discipline.

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

## 3. The twelve scenes

Each block is written to be pasted **after** the §1 style block, with the
Doraemon style reference and the §2.1 character sheet both attached.

### Chapter 1 — Unit 1 · *The list in the yard*

> Late morning, hot and still, wide blue sky with two or three flat white
> clouds. A wooden landing stage at the edge of a jade-green canal, mud and
> water hyacinth at the waterline, every plank and mooring rope drawn in.
> **Tí** crouches right at the water with his back half-turned, one hand in the
> mud, shorts wet to the thigh, staring down at something very small and bright
> just under the surface — the one object in the frame given a colour used
> nowhere else. **Thảo** stands three steps above him on the dry bank, arms
> folded, patient rather than cross, looking down at the back of his head. She
> has clearly been standing there a while. The distance between them is the
> subject of the picture. Far bank drawn in thinner line and lighter flat green,
> banana palms fully drawn, no haze. 16:9.

### Chapter 2 — Unit 2 · *The long way round*

> Interior, a small delta kitchen in mid-morning, light coming through an open
> doorway. **Bà Sáu** stands square in the doorway, filling it, holding out a
> small paper packet of medicine. **Tí** is caught halfway to the door with a
> rolled rice sack under one arm that he is plainly trying not to draw attention
> to. Through the doorway behind her: a bright hot road and, far off, low green
> hills in a flat lighter green. Inside, drawn in full: a low table, enamel
> bowls, a tin of tea, a bunch of bananas hanging, a calendar with a blank page.
> Bà Sáu's body language says *no*; Tí's says *I am going anyway*. The interior
> is one flat warm tone; the doorway is a hard-edged rectangle of pale outdoor
> colour. 16:9.

### Chapter 3 — Unit 3 · *The list on the wall*

> A school yard in late afternoon, long flat shadow shapes laid across concrete.
> A painted noticeboard on a yellow-ochre wall carries a single sheet of paper
> pinned at the corners — **render it as a blank sheet, no text, no numbers, no
> marks of any kind.** **Tí** stands close to it, hands at his sides, shoulders
> down, reading it again. **Thảo** waits a few metres back, half-turned toward
> the gate, looking at him rather than at the paper. Empty yard, one bicycle
> against the wall drawn in full detail, a flame tree throwing one clean shadow
> shape. The emptiness of the yard matters — everyone else has gone. 16:9.

### Chapter 4 — Unit 4 · *Ten questions for a stranger*

> The canal landing, late afternoon, the water a flat warm gold-green. **Thảo**
> sits cross-legged on the wooden boards with her hands raised and open in front
> of her, mid-gesture, pretending to weave a basket that is not there — clearly
> performing, clearly enjoying it. **Tí** sits opposite with a folded exercise
> book on his knee and a pencil he is not using, caught between embarrassment
> and interest. **Mun** the black cat sits a little apart on a mooring post on
> all fours, watching the invisible basket with total seriousness; his torn left
> ear is clearly visible. A long wooden boat is moored behind them, planks and
> ropes fully drawn; the far bank rises into green hills with a suggestion of
> terraced fields in flat lighter green. 16:9.

### Chapter 5 — Unit 5 · *Forty cakes before breakfast*

> Interior, the kitchen, early morning: a cool blue flat tone through the window
> meeting the warm yellow flat tone of a single bulb, the two colours meeting on
> a hard edge across the room. The low table is covered in broad green banana
> leaves, soaked rice, mung bean paste, a heap of small green oranges and a
> bundle of incense sticks — all drawn item by item. **Bà Sáu** works fast and
> precisely, hands mid-fold over a square cake, thick forearms clear. **Tí**
> sits beside her with a badly wrapped, obviously loose cake coming apart in his
> hands, looking sideways at hers. A large pot waits on the floor. **Mun** is on
> the windowsill behind them, tail curled, ignoring everything. Green is the
> dominant colour. 16:9.

### Chapter 6 — Unit 6 · *Everybody wants something*

> Early evening in a narrow lane between houses. Flat deep-blue sky; warm yellow
> light falls out of open doorways as hard-edged rectangles on the ground.
> **Tí** and **Thảo** stand close together mid-lane, heads bent toward each
> other in a private conversation. Behind and around them, at a distance and
> **drawn smaller, in thinner line, with plain simplified faces**, four or five
> adult villagers stand in doorways and at the lane's mouth, all facing the two
> children — not threatening, just *waiting*, all of them wanting something. A
> few spent paper lanterns lie collapsed in the gutter from the night before.
> Through an open doorway on the right, deep inside the house, a small ochre
> shape of brass sits on a shelf. Crowded and slightly airless. No blur
> anywhere — depth is line weight and flat tone only. 16:9.

### Chapter 7 — Unit 7 · *The canal behind the school*

> Midday, flat hard light, plain pale sky. A narrow canal running behind a
> school's back wall. The water is opaque **brown-ochre**, drawn as one heavy
> flat fill with a dull grey scum shape along the edge, plastic caught in the
> reeds, and a dead grey-white fish belly-up near the bank — a deliberately ugly
> picture inside a bright, clean style. On the far bank, a low corrugated-iron
> workshop with a pipe discharging into the water, corrugations drawn line by
> line. **Thảo** stands at the edge holding up a phone to photograph the water;
> **Tí** stands behind her with two empty rice sacks over his shoulder. Both are
> looking at the water, not at each other. No birds anywhere, and no clouds.
> 16:9.

### Chapter 8 — Unit 8 · *Four days until the fifteenth*

> Interior, the kitchen, early morning. In the near foreground, cropped by the
> bottom edge of the frame, **Bà Sáu**'s hands on the low table sort small coins
> into short stacks beside a flat empty tin. Mid-ground, **Tí** and **Thảo**
> stand together, both turned away from the coins and looking at the shelf
> behind them. On that shelf, in plain sight in front of the tea tin, sits
> **the brass lamp** — small, dented, unlit, deliberately unhidden, and **the
> only object in the frame drawn with a heavier, darker contour line than
> anything around it.** A hard-edged shaft of morning light falls across it as a
> flat pale shape. Nobody is touching it. The composition should make the viewer
> look at the lamp before they look at the people. 16:9.

### Chapter 9 — Unit 9 · *The forecast turns west*

> Grey stormy morning, wind visible in everything. A tiled roof with **one
> broken tile** and a wooden ladder leaning against the eaves. The rain has
> stopped but the sky is a flat low grey with one darker grey cloud shape
> crossing it; a snapped branch lies across the yard. Buckets and basins of
> clean water are lined up along the wall, counted and drawn. **Tí** stands
> holding the ladder steady with both hands, looking up. **Bà Sáu** is near the
> top of it, one arm on the roof edge, examining the damage — small and
> absolutely unbothered. Water already stands at the bottom of the lane behind
> them. Wind is shown by **everything bending one way** and by a few clean
> curved motion lines in the air — nothing else. Cool desaturated flat palette,
> no sunlight at all. 16:9.

### Chapter 10 — Unit 10 · *Nothing is getting through*

> Late afternoon, an enormous flat high sky with two thin cloud shapes near the
> horizon. **Tí** sits alone on top of a low concrete wall, knees up, holding an
> old phone at arm's length above his head, looking at the screen with no
> expectation. Across the canal behind him, a communications mast lies **broken
> and half-submerged in the water**, its lattice bent and drawn strut by strut,
> the top section under the surface. Flood debris along both banks. The far bank
> is in plain daylight colour; his side of the canal is filled with one flat
> shadow tone, the edge between them hard and clean. Enormous empty sky over a
> very small boy. Loneliness, not danger. **Mun** sits on the wall an arm's
> length away, facing the opposite direction. 16:9.

### Chapter 11 — Unit 11 · *A very expensive shoe box*

> Interior, a school science-club room after hours: a flat warm yellow pool of
> desk-lamp light against a flat deep-blue window. On the table sits a home-made
> wooden box the size of a shoe box, its lid held by a small improvised lock, a
> fingerprint reader glued crookedly to the front, and a nest of jumper wires
> and a small circuit board spilling out of one side — every wire drawn
> individually. **Tí** presses his thumb flat on the reader, leaning in.
> **Khoa** stands beside him, straight and calm, watching the wires rather than
> the thumb, one hand out to steady the box; his side parting and green notebook
> are visible. The notebook lies open beside them with **blank pages — no text,
> no diagrams.** A screwdriver, a battery pack, two enamel cups of tea. Two tiny
> red indicator lights are the one colour used nowhere else in the frame. 16:9.

### Chapter 12 — Unit 12 · *Nine days on foot*

> Very early morning on a dirt road at the edge of town, first light. The sky is
> the one permitted gradient in the whole set: deep blue at the top easing to
> peach at the horizon. **Tí** and **Thảo** walk away from the viewer along the
> road, seen from behind, small in the frame, a canvas bag over Tí's shoulder.
> **Mun** trots at their heels on all fours. Ahead of them the road runs toward
> a wide pale river and, beyond it, hills in flat receding greens under a sky
> where **two or three stars have not gone out yet**, drawn as plain small white
> dots. Behind them, the town is still dark and asleep, its houses in one flat
> deep tone. This is the last image of the story: quiet, open, forward-facing,
> no goodbye in the frame. Wide, still, unhurried. 16:9.

---

## 4. If a chapter's illustration drifts

The failures to expect, and the fix for each. The first two are the expensive
ones — catch them before a chapter is built on the image.

| Symptom | Fix |
| --- | --- |
| A character starts resembling a Doraemon character — the cat goes blue or bipedal, the boy acquires round glasses | Re-attach the §2.1 sheet **as the character reference** and demote the Doraemon image to *style only*, saying so in the prompt. Re-read that character's *must not* line and paste it into the prompt verbatim. Do not keep a "close enough" variant; it contaminates every later chapter fed from it |
| It comes back as generic modern anime — soft shading, glossy eyes, strand-shaded hair | Re-paste §1 in full. The **Line** and **Colour** paragraphs are the whole defence, and they degrade the moment they are summarised. Naming what it must *not* be ("not modern anime, not moe, not Ghibli") does more work than naming what it should be |
| Backgrounds come back vague, empty or blurred | The style's whole contrast is simple figures against a literal world. Re-paste the **Backgrounds carry the realism** paragraph and name three specific objects the scene must contain |
| Faces change between chapters | Attach the character sheet **and** the two most recent keepers, and name the character in the prompt ("the boy from the reference sheet, Tí, with the cowlick and the muddy shin") |
| The setting drifts Japanese — sliding doors, a suburban street, a vacant lot with concrete pipes | Expected: it is copying the reference's *world* along with its style. Re-paste the **Setting** paragraph including the "Nothing Japanese" clause, and add three delta-specific objects to the scene block |
| Text appears in the image | Gemini adds signage unprompted in street scenes. Keep the "no text, no letters" clause and re-roll — it is not reliably fixable by inpainting. **First check you attached `cast-sheet.png` and not `cast-sheet-labelled.png`** (§2.2); an attached sheet with words on it puts words in every scene |
| The back of a head, or a turned-away figure, looks like someone else | Expected — the group sheet is front-facing only. Attach that character's §2.3 turnaround as well, and name the graphic tag in the prompt. Chapters 1, 4, 6, 10 and 12 all need this |

## 5. Extending this to the other prose slots

Each unit has four story slots (`chapter-briefs.md` §0): the Lesson 1 dialogue,
the Lesson 5 reading passage, the Lesson 6 recording and its writing model. Only
the dialogue is prompted here.

The Lesson 5 passages are the ones where **the lamp is actually lit**, so if
those get illustrated later, the style block needs one added clause — and it
should be the *only* place a flame ever appears:

> When the lamp is lit, its flame is small, low and ordinary — a domestic oil
> flame. Draw it as a plain flat teardrop shape with a single lighter shape
> inside it and the same black contour line as everything else. It does not
> glow, radiate, sparkle, cast rays, or light anything beyond arm's reach, and
> nothing in the frame is tinted by it. Whatever has come back is lit by
> daylight like everything else in the picture.

That restraint is the point, and the flat-cel style makes it easier to hold than
a painted one would: there is no soft light to leak. The bible's rule is that
the lamp never fails and never announces itself; an illustration that renders it
as a magic item contradicts the story it sits above.
