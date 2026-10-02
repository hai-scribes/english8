"""Cut a drawing out of its flat background: the one keyer the whole pipeline uses.

    key(im)              -> (RGBA image, report)
    is_keyed(im)         -> already carries transparency?

`make_sheet.py` and `make_overlay.py` used to carry a keyer each — each a copy
of the other, with a comment calling them "deliberately identical" beside two
different tolerances. They both import this one now.

The rule is unchanged from theirs, because it is the right rule: **background is
flooded inward from the border**, so white enclosed by a closed contour — Thảo's
shirt, a class list's paper, the fill of an impact burst — survives. What is new
is everything around that rule:

1. **The background colour is measured, not assumed.** Generators return
   #FDFDFB and #F8F8F6 as often as #FFFFFF; the median of the top, left and
   right edges is what gets keyed (the bottom is left out because a figure
   stands on it).
2. **It is numpy, not a per-pixel Python loop** — a 2048² master keys in well
   under a second. Flood fill is done by alternating row and column run
   propagation, which converges in a handful of passes without scipy.
3. **A leak is detected.** The failure every prompt defends against is a gap in
   the outline letting the flood into the figure and hollowing it out. The
   keyer floods a second time with every gap narrower than `gap` px closed, and
   reports how much of the first flood only got where it did through a gap.
   With `repair=True` it keys the gap-closed version instead.
4. **The edge is softened, not left as a white halo.** A binary key leaves the
   anti-aliased pixels between line and paper fully opaque and pale, which on a
   dark plate is a white fringe round every figure. Pixels in a thin band just
   inside the keyed area are un-mixed from the background colour (the
   colour-to-alpha operation), so the line fades out the way it was drawn.
"""
import numpy as np
from PIL import Image

TOL = 16          # max per-channel distance from the measured background
FRINGE_PX = None  # band width for the edge un-mixing; None = scale with size
GAP_FRAC = 0.004  # outline gaps under ~2 x this fraction of the short side


def is_keyed(im: Image.Image) -> bool:
    """Does this drawing already carry transparency? Keying one again is at best
    a no-op and at worst destroys it — RGBA to RGB drops alpha, and what is
    under a transparent pixel is usually black."""
    if im.mode not in ("RGBA", "LA", "PA"):
        return False
    return im.convert("RGBA").getchannel("A").getextrema()[0] < 250


def _runs(filled, allowed):
    """Grow `filled` along each row through contiguous `allowed` runs."""
    h, w = allowed.shape
    prev = np.zeros_like(allowed)
    prev[:, 1:] = allowed[:, :-1]
    start = allowed & ~prev
    ids = np.cumsum(start.ravel()).reshape(h, w) * allowed
    hit = np.zeros(ids.max() + 1, dtype=bool)
    hit[ids[filled & allowed]] = True
    hit[0] = False
    return hit[ids]


def flood(seed, allowed):
    """Everything in `allowed` connected (4-way) to `seed`."""
    f = seed & allowed
    while True:
        g = _runs(f, allowed)
        g = _runs(g.T, allowed.T).T
        if (g == f).all():
            return g
        f = g


def dilate(mask, r):
    """Square dilation by r px, by shifting — separable and scipy-free."""
    if r <= 0:
        return mask
    out = mask.copy()
    for axis in (0, 1):
        acc = out.copy()
        for d in range(1, r + 1):
            acc[tuple(slice(d, None) if a == axis else slice(None) for a in (0, 1))] |= \
                out[tuple(slice(None, -d) if a == axis else slice(None) for a in (0, 1))]
            acc[tuple(slice(None, -d) if a == axis else slice(None) for a in (0, 1))] |= \
                out[tuple(slice(d, None) if a == axis else slice(None) for a in (0, 1))]
        out = acc
    return out


def border_mask(shape, bottom=True):
    m = np.zeros(shape, dtype=bool)
    m[0, :] = m[:, 0] = m[:, -1] = True
    if bottom:
        m[-1, :] = True
    return m


def measure_bg(rgb):
    """The background colour, from the top, left and right edges, and how much
    of those edges is within TOL of it."""
    edge = np.concatenate([rgb[0], rgb[:, 0], rgb[:, -1]]).astype(np.int16)
    bg = np.median(edge, axis=0)
    flat = float((np.abs(edge - bg).max(axis=1) <= TOL).mean())
    return bg, flat, edge


POCKET_TOL = 5      # how close to the paper an enclosed region must be to BE paper
# Of the image. The white of an eye is paper-white too, and enclosed: at 0.0004
# this took the whites out of Bà Sáu's startled eyes. An eye is under 0.1% of
# the picture and the gap inside a raised arm is over 1%, so the line goes
# between them, with room on both sides.
POCKET_MIN = 0.004


def pockets(rgb, bg, near, bgm):
    """Paper the border flood could not reach: the gap inside a raised arm, the
    space between a hand and a face. It is enclosed by the figure, so it looks
    to the flood exactly like a white shirt — but it is not painted. A cel white
    is a slightly warm off-white, a dozen levels from the paper; a pocket IS the
    paper, within a level or two. Only regions that close to it are taken."""
    enclosed = near & ~bgm
    tight = enclosed & (np.abs(rgb - bg).max(axis=2) <= POCKET_TOL)
    out = np.zeros_like(bgm)
    m = tight.copy()
    least = POCKET_MIN * m.size
    for _ in range(64):
        if not m.any():
            break
        y, x = np.argwhere(m)[0]
        seed = np.zeros_like(m)
        seed[y, x] = True
        r = flood(seed, m)
        m &= ~r
        if r.sum() >= least and np.abs(rgb[r].mean(axis=0) - bg).max() <= POCKET_TOL / 2:
            out |= r
    return out


def key(im: Image.Image, tol: int = TOL, repair: bool = False, gap: int = None,
        stands: bool = False):
    """Return (RGBA cut-out, report). Never modifies an already-keyed image.

    `stands` is for a figure the frame crops at the bottom — every character.
    The flood is then not seeded from the bottom edge, where the figure's own
    clothes meet the border with no outline between them (a white shirt running
    off the edge was eaten from below), and enclosed paper is taken out."""
    w, h = im.size
    if is_keyed(im):
        a = np.asarray(im.convert("RGBA").getchannel("A")) > 12
        return im.convert("RGBA"), _report(a, None, 1.0, 0.0, 0, pre_cut=True)

    rgb = np.asarray(im.convert("RGB")).astype(np.int16)
    bg, flat, _ = measure_bg(rgb)
    near = (np.abs(rgb - bg).max(axis=2) <= tol)
    edges = border_mask(near.shape, bottom=not stands)
    bgm = flood(edges, near)
    # Pockets are found now and added AFTER the leak is measured: a pocket is
    # paper the flood never reached, and counted in with the flood it reads as
    # a leak of exactly its own size — three sound drawings were rejected so.
    pk = pockets(rgb, bg, near, bgm) if stands else np.zeros_like(bgm)
    pocket_px = int(pk.sum())
    if pocket_px:
        # A pocket is found at a tight tolerance, which stops a pixel or two
        # short of the outline and leaves a pale dotted ring. Take the rest of
        # the paper up to the line — but only a step, never a flood: the cel
        # white next door is inside the ordinary tolerance too.
        pk = dilate(pk, max(2, round(min(w, h) / 400))) & near & ~bgm

    # The same flood with every narrow gap in the outline closed. Whatever the
    # first flood reached that this one (grown back over the band it gave up)
    # did not, it reached through a gap.
    gap = gap if gap is not None else max(2, round(min(w, h) * GAP_FRAC))
    barrier = dilate(~near, gap)
    allowed = near & ~barrier
    closed = flood(edges & allowed, allowed)
    recovered = bgm & dilate(closed, gap + 1)
    leak = bgm & ~recovered
    fg_area = max(1, int((~recovered).sum()))
    leak_frac = float(leak.sum()) / fg_area
    if repair and leak.any():
        bgm = recovered
    bgm = bgm | pk

    alpha = np.where(bgm, 0.0, 1.0)
    out = rgb.astype(np.float64)

    # Un-mix a thin band of foreground from the background colour, so an
    # anti-aliased edge fades instead of standing as a pale ring.
    band_px = FRINGE_PX or max(1, round(min(w, h) / 1024))
    band = dilate(bgm, band_px) & ~bgm
    if band.any():
        c = out[band]
        b = bg.astype(np.float64)
        lo = np.where(c < b, (b - c) / np.maximum(b, 1), 0.0)
        hi = np.where(c > b, (c - b) / np.maximum(255 - b, 1), 0.0)
        a = np.clip(np.maximum(lo, hi).max(axis=1), 0.0, 1.0)
        safe = np.maximum(a, 1e-3)[:, None]
        out[band] = np.clip((c - (1 - a)[:, None] * b) / safe, 0, 255)
        alpha[band] = a

    rgba = np.dstack([out, alpha * 255]).round().astype(np.uint8)
    rgba[bgm] = (255, 255, 255, 0)
    fg = alpha > 0.05
    return (Image.fromarray(rgba, "RGBA"),
            _report(fg, bg, flat, leak_frac, int(bgm.sum()), leak_px=int(leak.sum()),
                    repaired=bool(repair and leak.any()), gap=gap, pocket_px=pocket_px))


def wash(im: Image.Image, strength: float = 1.0):
    """A see-through effect: darkness becomes opacity, everywhere.

    `key` answers "what is background and what is drawing", and makes the
    drawing solid. That is right for a figure and wrong for a shadow, a rain
    shower or a gloom: those are drawn pale-on-white because paper cannot be
    half transparent, and keyed solid they would paint opaque bars across the
    face they are meant to darken. Here every pixel is un-mixed from the paper —
    white becomes nothing, black becomes solid, a pale grey becomes thin black —
    and `strength` caps how opaque the darkest part may be, so the picture
    underneath always reads through.
    """
    if is_keyed(im):
        a = np.asarray(im.convert("RGBA").getchannel("A")) > 12
        return im.convert("RGBA"), _report(a, None, 1.0, 0.0, 0, pre_cut=True)
    rgb = np.asarray(im.convert("RGB")).astype(np.float64)
    # The paper is the brightest common colour. The edges cannot be trusted
    # here: a gloom hangs from the top edge and rain crosses all four.
    bg = np.percentile(rgb.reshape(-1, 3), 95, axis=0)
    a = np.clip(((bg - rgb) / np.maximum(bg, 1)).max(axis=2), 0.0, 1.0)
    a[a < 0.04] = 0.0                      # paper grain and JPEG noise
    safe = np.maximum(a, 1e-3)[..., None]
    col = np.clip((rgb - (1 - a)[..., None] * bg) / safe, 0, 255)
    out = np.dstack([col, a * strength * 255]).round().astype(np.uint8)
    out[a == 0] = (255, 255, 255, 0)
    fg = a > 0.05
    return (Image.fromarray(out, "RGBA"),
            _report(fg, bg, 1.0, 0.0, int((~fg).sum()), wash=strength))


def _report(fg, bg, flat, leak_frac, keyed_px, pre_cut=False, **extra):
    h, w = fg.shape
    ys, xs = np.nonzero(fg)
    if len(xs):
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        m = max(2, round(min(w, h) * 0.002))
        touches = [side for side, hit in (("top", y0 < m), ("bottom", y1 >= h - m),
                                          ("left", x0 < m), ("right", x1 >= w - m)) if hit]
        bbox = [int(x0), int(y0), int(x1) + 1, int(y1) + 1]
    else:
        touches, bbox = [], None
    # How much of the bottom edge the figure covers. A half-body figure the frame
    # crops covers a third of it or more; a bust that ends inside the picture
    # covers none, or stands on a point.
    band = max(2, round(h * 0.004))
    base = float(fg[-band:].any(axis=0).mean())
    return {
        "base_frac": round(base, 4),
        "pre_cut": pre_cut,
        "bg": None if bg is None else [int(v) for v in bg],
        "edge_flat": round(flat, 4),
        "fg_frac": round(float(fg.mean()), 4),
        "keyed_frac": round(keyed_px / (w * h), 4),
        "leak_frac": round(leak_frac, 4),
        "touches": touches,
        "bbox": bbox,
        **extra,
    }


def preview(cut: Image.Image, colour=(38, 110, 120)) -> Image.Image:
    """The cut-out over a dark teal, which shows a halo, a hole and a leak far
    better than a checkerboard does."""
    base = Image.new("RGBA", cut.size, colour + (255,))
    return Image.alpha_composite(base, cut.convert("RGBA")).convert("RGB")
