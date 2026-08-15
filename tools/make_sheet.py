#!/usr/bin/env python3
"""Compose six single-emotion drawings into one character sheet.

Run: python3 tools/make_sheet.py ti
     python3 tools/make_sheet.py --all
     python3 tools/make_sheet.py ti --keep-white     # skip the transparency step

    in   art/cast/<slug>/<emotion>.{png,jpg}  six square-ish drawings, full size
    out  art/cast/<slug>.webp               one 3x2 sheet, which build.py
                                            copies to docs/assets/cast/

Why this exists. Asking an image generator to lay out a six-panel grid does not
work: it returned eight panels four times running, because multi-panel layout is
the weakest thing these models do and a four-across contact sheet is far commoner
in their training data than three-across. Telling it "not eight" made that worse
rather than better — diffusion models do not represent negation, so naming a
number raises its salience however the sentence is phrased.

So the generator is now asked for exactly one thing per image, which is the thing
it is reliable at, and the grid is arithmetic done here. That also makes the
guarantees the page depends on absolute rather than hoped for: six cells, equal,
square, identically placed.

Three jobs, in order:

  square    each drawing is padded (never cropped, never stretched) to a square,
            centred horizontally and sat on the bottom edge, so the character
            stands on the floor of the panel
  key       white is flooded out from the border and becomes transparent. It is
            a CONTIGUOUS fill from outside the figure, not a global "remove all
            white", so Thảo's and Khoa's white shirts survive — the figure's
            closed contour is what separates inside from outside. That contour
            is a soft coloured pencil line in this style rather than a cel
            outline, so it is the drawing, not the code, that has to keep it
            unbroken: a gap lets the fill in and hollows the figure out. The
            prompts in research/story/illustration-prompts.md ask for a closed
            line and for the watercolour to stay inside it, for this reason
  compose   the six squares are pasted into a 3 x 2 grid, in the order
            data/cast.json declares, and written as one PNG

`data/cast.json` is the authority for the grid and the emotion order. Nothing
here hard-codes either.
"""
import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageDraw
except ImportError:
    print("FAIL: this needs Pillow — `pip3 install Pillow`")
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
CAST_DIR = ROOT / "art" / "cast"

# The panel is drawn at height:74% of a stage capped at 26rem, so an avatar is
# at most ~310 CSS px tall. 640 covers that at 2x and leaves a little headroom;
# past that is bytes nobody can see, multiplied by six.
CELL = 640

# WebP rather than PNG, measured on the real art rather than assumed: the sheet
# is 1008 KB as RGBA PNG and 209 KB at q90, with no difference visible at 2x
# zoom. Palette PNG was tried first and rejected — it is the textbook answer for
# flat cel art, but this art is not flat. It has soft shading in the hair and a
# soft-edged cheek blush, and 64-128 colours speckles the one and rings the
# other. Do not "optimise" this back to PNG-8 without looking at a cheek.
WEBP_Q = 90

# Masters are whatever the generator returned. Re-encoding a JPEG as a PNG to
# satisfy a suffix adds nothing and loses the provenance, so both are read.
MASTER_EXT = (".png", ".jpg", ".jpeg", ".webp")

# How far a drawing's figure may sit from the set's median before the composer
# rescales it. The panel exists so the head cannot jump between lines, and the
# commonest way a set breaks that is one re-roll framed a little differently.
# 1.0% of the frame is under half a head's difference — below it, leave alone.
ALIGN_TOL = 0.010

# How far from pure white still counts as background. Generators rarely return
# exactly #FFFFFF — JPEG-ish ringing and faint paper tone drift a few levels —
# and a threshold this tight still cannot reach a drawn line.
WHITE_TOL = 18
SENTINEL = (255, 0, 255)


def is_keyed(im: Image.Image) -> bool:
    """Does this drawing already carry transparency? Generators increasingly
    return a cut-out PNG, and keying one again is at best a no-op and at worst
    destroys it: converting RGBA to RGB drops the alpha and leaves whatever is
    underneath, which for a transparent pixel is black."""
    a = im.getchannel("A")
    return a.getextrema()[0] < 250


def content_box(im: Image.Image, keyed: bool):
    """The figure's bounding box — by alpha if it has one, else by what is not
    white. Returns (top, height) as fractions of the image height."""
    if keyed:
        mask = im.getchannel("A").point(lambda v: 255 if v > 20 else 0)
    else:
        bg = Image.new("RGB", im.size, (255, 255, 255))
        mask = ImageChops.difference(im.convert("RGB"), bg).convert("L") \
                        .point(lambda v: 255 if v > 20 else 0)
    bb = mask.getbbox()
    if not bb:
        return None
    h = im.size[1]
    return bb, bb[1] / h, (bb[3] - bb[1]) / h


def align(im: Image.Image, bb, top_f: float, h_f: float,
          want_top: float, want_h: float, fill) -> Image.Image:
    """Rescale and reposition one drawing so its figure matches the set's
    median top and height. Uniform scale, never a stretch: a figure squashed to
    fit would be a worse defect than the one being fixed."""
    W, H = im.size
    scale = want_h / h_f
    cut = im.crop(bb)
    cw, ch = max(1, round(cut.width * scale)), max(1, round(cut.height * scale))
    cut = cut.resize((cw, ch), Image.LANCZOS)
    out = Image.new(im.mode, (W, H), fill)
    cx = (bb[0] + bb[2]) // 2                      # keep it where it was, across
    out.paste(cut, (int(cx - cw / 2), int(round(want_top * H))))
    return out


def square(im: Image.Image, fill) -> Image.Image:
    """Pad to a square. Never crop: a cropped hand is the whole reason the
    panel is square in the first place."""
    w, h = im.size
    if w == h:
        return im
    side = max(w, h)
    out = Image.new(im.mode, (side, side), fill)
    # Centred across, sitting on the bottom — the avatar stands on the floor of
    # the panel, and air underneath makes it read as a sticker.
    out.paste(im, ((side - w) // 2, side - h))
    return out


def key_white(im: Image.Image) -> Image.Image:
    """White that touches the border becomes transparent; enclosed white stays."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    near = lambda p: all(c >= 255 - WHITE_TOL for c in p)

    # Seed from every border pixel that is background-coloured. Later seeds are
    # cheap: the fill short-circuits on anything already sentinel-coloured.
    border = ([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
              + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    for xy in border:
        if near(px[xy]):
            ImageDraw.floodfill(rgb, xy, SENTINEL, thresh=WHITE_TOL)

    out = im.convert("RGBA")
    op = out.load()
    cleared = 0
    for y in range(h):
        for x in range(w):
            if px[x, y] == SENTINEL:
                op[x, y] = (255, 255, 255, 0)
                cleared += 1
    if not cleared:
        print("      note: nothing was keyed — is the background actually white?")
    return out


def build(slug: str, emotions: list, cols: int, rows: int, keep_white: bool,
          cell_px: int = CELL, do_align: bool = True) -> bool:
    src = CAST_DIR / slug
    if not src.is_dir():
        print(f"  {slug}: no {src.relative_to(ROOT)}/ — nothing to compose")
        return False
    # Read the masters first, unsquared: the framing pass below needs to compare
    # them against each other before any padding changes their proportions.
    raw = []
    for emo in emotions:
        found = [src / f"{emo}{e}" for e in MASTER_EXT]
        f = next((c for c in found if c.is_file()), None)
        if f is None:
            print(f"  {slug}: missing {(src / (emo + '.png')).relative_to(ROOT)}")
            return False
        im = Image.open(f).convert("RGBA")
        keyed = is_keyed(im)
        raw.append([emo, im if keyed else im.convert("RGB"), keyed,
                    content_box(im if keyed else im.convert("RGB"), keyed)])

    # One framing for the whole set. The median is the reference rather than the
    # first drawing, so a single odd re-roll is corrected towards the other five
    # instead of dragging them towards it.
    boxes = [r[3] for r in raw if r[3]]
    if do_align and len(boxes) == len(raw):
        med_top = sorted(b[1] for b in boxes)[len(boxes) // 2]
        med_h = sorted(b[2] for b in boxes)[len(boxes) // 2]
        for r in raw:
            bb, top_f, h_f = r[3]
            if abs(top_f - med_top) > ALIGN_TOL or abs(h_f - med_h) > ALIGN_TOL:
                fill = (0, 0, 0, 0) if r[2] else (255, 255, 255)
                r[1] = align(r[1], bb, top_f, h_f, med_top, med_h, fill)
                print(f"      aligned {r[0]}: figure {h_f * 100:.1f}% high at "
                      f"{top_f * 100:.1f}% -> {med_h * 100:.1f}% at {med_top * 100:.1f}%")

    parts = [(emo, square(im, (0, 0, 0, 0) if keyed else (255, 255, 255)), keyed)
             for emo, im, keyed, _ in raw]

    # One cell size for all six, so the head cannot jump or resize between
    # lines. The largest wins and the rest are scaled up to meet it.
    side = min(cell_px, max(p.size[0] for _, p, _ in parts))

    # A sheet costs its DECODED size, not its file size, and the two are not
    # close. WebP compresses this art about fifty to one, so the 205 KB that
    # ships as ti.webp is 1920 x 1280 x 4 = 9.8 MB once the browser has it in
    # memory, and five characters on one page is ~49 MB of image data behind a
    # 1 MB download. Nothing here is wrong at 3 x 2 — the number is only
    # alarming when somebody grows the grid, and growing the grid is exactly
    # what any future mouth or blink state would do. A 6 x 4 sheet at this cell
    # size is 3840 x 2560, or 39 MB each and ~197 MB for a five-character page,
    # and it would be discovered on a phone, by a learner.
    #
    # 4096 px is the conservative ceiling: it is the documented cap on mobile
    # Safari's canvas dimensions, and while a CSS background is not a canvas,
    # no engine promises to decode past it either, and an image that quietly
    # fails to decode leaves every avatar blank with nothing in the console to
    # say why. At the 640 px cell that allows six panels on an axis and refuses
    # seven, which is room for a mouth or an eye dimension and not much more.
    # Raise the cell size or split the sheet; do not raise this.
    #
    # Reported like any other reason a character cannot be composed, rather than
    # raised: under --all the sheets are written one at a time, so exiting from
    # here would leave the characters before this one regenerated and the ones
    # after it stale — a mixed-generation set is worse than a refused one, and
    # main() already turns "nothing was made" into a non-zero exit.
    LIMIT = 4096
    if side * cols > LIMIT or side * rows > LIMIT:
        print(f"  {slug}: a {cols}x{rows} sheet at {side}px is "
              f"{side * cols}x{side * rows}, over the {LIMIT}px limit "
              f"({side * cols * side * rows * 4 / 1e6:.0f} MB decoded). "
              f"Use a smaller --cell, or fewer panels per axis.")
        return False

    sheet = Image.new("RGBA", (side * cols, side * rows), (255, 255, 255, 0))
    for i, (emo, p, keyed) in enumerate(parts):
        if p.size[0] != side:
            p = p.resize((side, side), Image.LANCZOS)
        if keyed or keep_white:
            cell = p.convert("RGBA")
        else:
            cell = key_white(p)
        sheet.paste(cell, (i % cols * side, i // cols * side))

    out = CAST_DIR / f"{slug}.webp"
    sheet.save(out, format="WEBP", quality=WEBP_Q, method=6)
    print(f"  {slug}: {cols}x{rows} of {side}px -> {out.relative_to(ROOT)} "
          f"({sheet.size[0]}x{sheet.size[1]})")
    return True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug", nargs="*", help="character slug, e.g. ti")
    ap.add_argument("--all", action="store_true", help="every character in the manifest")
    ap.add_argument("--keep-white", action="store_true",
                    help="compose without keying the background out")
    ap.add_argument("--no-align", action="store_true",
                    help="do not rescale an oddly-framed drawing to match the set")
    ap.add_argument("--cell", type=int, default=CELL,
                    help=f"panel size in px (default {CELL}); never upscales")
    args = ap.parse_args()

    cast = json.loads((ROOT / "data" / "cast.json").read_text(encoding="utf-8"))
    sheet, chars = cast["sheet"], cast["characters"]
    cols, rows = sheet["cols"], sheet["rows"]
    emotions = [e for e, _ in sorted(cast["emotions"].items(), key=lambda kv: kv[1]["col"])]

    slugs = ([c["slug"] for c in chars.values()] if args.all else args.slug)
    if not slugs:
        print(__doc__.strip().split("\n\n")[1])
        print(f"\nknown characters: {', '.join(c['slug'] for c in chars.values())}")
        print(f"emotions, in panel order: {' · '.join(emotions)}")
        return 1

    known = {c["slug"] for c in chars.values()}
    made = 0
    for s in slugs:
        if s not in known:
            print(f"  {s}: not a character in data/cast.json")
            continue
        made += build(s, emotions, cols, rows, args.keep_white, args.cell,
                      not args.no_align)
    print(f"\n{made} sheet(s) written")
    return 0 if made else 1


if __name__ == "__main__":
    sys.exit(main())
