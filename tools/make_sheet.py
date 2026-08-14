#!/usr/bin/env python3
"""Compose six single-emotion drawings into one character sheet.

Run: python3 tools/make_sheet.py ti
     python3 tools/make_sheet.py --all
     python3 tools/make_sheet.py ti --keep-white     # skip the transparency step

    in   art/cast/<slug>/<emotion>.png     six square-ish drawings, full size
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
    from PIL import Image, ImageDraw
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
          cell_px: int = CELL) -> bool:
    src = CAST_DIR / slug
    if not src.is_dir():
        print(f"  {slug}: no {src.relative_to(ROOT)}/ — nothing to compose")
        return False
    parts = []
    for emo in emotions:
        f = src / f"{emo}.png"
        if not f.is_file():
            print(f"  {slug}: missing {f.relative_to(ROOT)}")
            return False
        im = Image.open(f).convert("RGBA")
        if is_keyed(im):
            parts.append((emo, square(im, (0, 0, 0, 0)), True))
        else:
            parts.append((emo, square(im.convert("RGB"), (255, 255, 255)), False))

    # One cell size for all six, so the head cannot jump or resize between
    # lines. The largest wins and the rest are scaled up to meet it.
    side = min(cell_px, max(p.size[0] for _, p, _ in parts))
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
        made += build(s, emotions, cols, rows, args.keep_white, args.cell)
    print(f"\n{made} sheet(s) written")
    return 0 if made else 1


if __name__ == "__main__":
    sys.exit(main())
