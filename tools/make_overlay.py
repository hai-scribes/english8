#!/usr/bin/env python3
"""Turn a prop or effect drawing into the transparent cut-out the page uses.

Run: python3 tools/make_overlay.py bucket
     python3 tools/make_overlay.py --all
     python3 tools/make_overlay.py dizzy --keep-white

    in   art/props/src/<slug>.{png,jpg,jpeg,webp}   one drawing, on white
    out  art/props/<slug>.webp                      one cut-out, transparent

    in   art/fx/src/<slug>.{png,jpg,jpeg,webp}
    out  art/fx/<slug>.webp

     --plates  art/bg/*.jpg, downscaled in place to the size the page can use

`build.py` copies the top level of each directory into docs/assets/, and only
files — which is why the masters live in a `src/` subdirectory rather than
beside their output. Nothing has to be told to skip them.

This is `make_sheet.py`'s smaller sibling and shares its keying: white is
flooded out FROM THE BORDER, so enclosed white survives. The board game's
bottle-top counters, the paper of a class list, the white of a lantern and the
whole of a sweat drop are all white and all inside a closed contour, and a
global "remove white" would delete every one of them. The contour is the
drawing's job: a gap in the line lets the fill in and hollows the object out.

Two rules that differ from the character sheets, and each is a real difference
rather than an oversight.

**A prop is TRIMMED to its content; an effect is not.** `data/cast.json` gives
every prop a `size`, which is its height as a fraction of the panel, and that
number is only true if the file's edges are the object's edges. An effect is
the opposite case: half of them (the stars, the vein, the drop) belong ABOVE a
figure's head, so their position inside the frame is the information. Trimming
one would throw that away and drop the stars onto the character's shoes. The
prompts therefore ask for every figure effect on a square canvas with a figure
implied in the lower three-quarters, and this tool keeps the canvas as drawn.

**There is no alignment pass.** A character sheet has six drawings that have to
share a baseline or the head jumps between lines. A prop is one drawing and has
nothing to agree with.
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

# A prop is at most about a quarter of a panel that is itself capped near
# 900 CSS px wide, so ~230 px; 512 covers that at 2x with room to spare. An
# effect can cover the whole frame, so it gets the larger cell.
PROP_PX = 512
FX_PX = 768
WEBP_Q = 90

# A plate is the one asset with no compose step — it is saved straight into
# art/bg/ and published as it is. That is fine until you look at the bytes: a
# generator returns about 2750 px across and nearly a megabyte, and the frame it
# lands in is at most ~900 CSS px wide, so 1800 covers it at 2x with nothing
# spare. The other ~550 KB is a Vietnamese teenager's mobile data, eleven times
# over. Downscaling is IN PLACE and idempotent: a plate already inside the
# budget is skipped, so running this twice costs nothing and re-encodes nothing.
PLATE_PX = 1800
PLATE_Q = 85
MASTER_EXT = (".png", ".jpg", ".jpeg", ".webp")

# Shared with make_sheet.py, and deliberately identical: a prop drawn in the
# same session as a character must key the same way or the two will not sit in
# one panel together.
WHITE_TOL = 12
SENTINEL = (1, 2, 3)


def is_keyed(im: Image.Image) -> bool:
    """Does this drawing already carry transparency? Generators increasingly
    return a cut-out, and keying one again is at best a no-op and at worst
    destroys it — RGBA to RGB drops the alpha and leaves black behind."""
    if im.mode not in ("RGBA", "LA"):
        return False
    return im.convert("RGBA").getchannel("A").getextrema()[0] < 250


def key_white(im: Image.Image) -> Image.Image:
    """White that touches the border becomes transparent; enclosed white stays."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    near = lambda p: all(c >= 255 - WHITE_TOL for c in p)

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


def trim(im: Image.Image) -> Image.Image:
    """Crop away the transparent margin, so the file's edges are the object's."""
    bb = im.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox()
    if not bb:
        print("      note: the drawing is entirely transparent — left as it is")
        return im
    return im.crop(bb)


def fit(im: Image.Image, longest: int) -> Image.Image:
    """Scale so the longer side is `longest`. Never up: an upscale invents
    detail the drawing does not have, and a small master is a re-roll, not a
    resampling problem."""
    w, h = im.size
    if max(w, h) <= longest:
        return im
    s = longest / max(w, h)
    return im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)


def build(kind: str, slug: str, keep_white: bool, do_trim: bool) -> bool:
    out_dir = ROOT / "art" / kind
    src_dir = out_dir / "src"
    found = [src_dir / f"{slug}{e}" for e in MASTER_EXT]
    master = next((f for f in found if f.is_file()), None)
    if master is None:
        print(f"  {kind}/{slug}: no drawing in {src_dir.relative_to(ROOT)}/")
        return False

    im = Image.open(master)
    im = im.convert("RGBA") if im.mode != "RGBA" else im
    already = is_keyed(im)
    if not keep_white and not already:
        im = key_white(im)
    elif already:
        print("      (already cut out — keying skipped)")

    if do_trim:
        im = trim(im)
    im = fit(im, PROP_PX if kind == "props" else FX_PX)

    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{slug}.webp"
    im.save(out, "WEBP", quality=WEBP_Q, method=6)
    print(f"  {kind}/{slug}: {master.name} -> {out.relative_to(ROOT)} "
          f"({im.size[0]}x{im.size[1]}, {out.stat().st_size // 1024} KB)")
    return True


def shrink_plates(px: int, q: int) -> int:
    """Bring every background plate inside the publishing budget, in place."""
    d = ROOT / "art" / "bg"
    if not d.is_dir():
        print("  no art/bg/ yet — nothing to shrink")
        return 0
    done = 0
    for f in sorted(d.iterdir()):
        if f.suffix.lower() not in (".jpg", ".jpeg") or f.name.startswith("."):
            continue
        im = Image.open(f)
        was = f.stat().st_size
        if im.size[0] <= px:
            print(f"  bg/{f.stem}: {im.size[0]}px, {was // 1024} KB — already inside "
                  f"the budget")
            continue
        im = im.convert("RGB").resize(
            (px, max(1, round(im.size[1] * px / im.size[0]))), Image.LANCZOS)
        im.save(f, "JPEG", quality=q, optimize=True, progressive=True)
        now = f.stat().st_size
        print(f"  bg/{f.stem}: -> {px}px, {was // 1024} KB -> {now // 1024} KB "
              f"({100 - now * 100 // was}% off)")
        done += 1
    return done


def main() -> int:
    cast = json.loads((ROOT / "data" / "cast.json").read_text(encoding="utf-8"))
    props, fx = cast["props"], cast["fx"]

    ap = argparse.ArgumentParser()
    ap.add_argument("slug", nargs="*", help="a prop or effect slug, e.g. bucket")
    ap.add_argument("--all", action="store_true",
                    help="every prop and effect in data/cast.json")
    ap.add_argument("--plates", action="store_true",
                    help="also bring art/bg/*.jpg inside the publishing budget")
    ap.add_argument("--keep-white", action="store_true",
                    help="the drawing is already cut out, or the white is wanted")
    args = ap.parse_args()

    if args.plates:
        shrink_plates(PLATE_PX, PLATE_Q)
        if not (args.all or args.slug):
            return 0

    if args.all:
        want = [("props", s) for s in props] + [("fx", s) for s in fx]
    else:
        want = []
        for s in args.slug:
            if s in props:
                want.append(("props", s))
            elif s in fx:
                want.append(("fx", s))
            else:
                print(f"FAIL: {s!r} is neither a prop nor an effect in "
                      f"data/cast.json")
                return 2
    if not want:
        print("nothing asked for — give a slug, or --all")
        return 2

    made = 0
    for kind, slug in want:
        # A panel-wide effect is a wash across the whole frame, so its canvas
        # IS the composition and trimming it would crop the composition away.
        do_trim = kind == "props"
        if build(kind, slug, args.keep_white, do_trim):
            made += 1
    print(f"\n{made} of {len(want)} written.")
    return 0 if made else 1


if __name__ == "__main__":
    sys.exit(main())
