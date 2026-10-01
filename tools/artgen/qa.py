"""Checks a machine can decide about a generated picture, before anyone looks.

    check(kind, image, cut_report, fx_over=None) -> [(level, message)]

`level` is "fail" (the candidate is rejected, whatever the critic thinks) or
"warn" (reported, and passed to the critic as something to look at). Every
check here is one of the symptoms in the prompts file's *If a generation
drifts* table that has a measurable signature. The rest — a Ghibli lookalike, a
patterned shirt, a sign with letters on it — need eyes, and are the critic's.
"""
import numpy as np

from . import cutout

LEAK_FAIL = 0.03   # of the figure's area, reached only through a gap in the line
BASE_FAIL = 0.20   # of the bottom edge a cropped half-body figure must cover
FLAT_FAIL = 0.90   # of the top/left/right edges within tolerance of the bg colour
# An effect is often ANCHORED to an edge — speed lines start at one, a gloom
# hangs from the top, a burst reaches all four — so most of an edge may be ink.
# The background still has to be the commonest thing on the border.
FX_FLAT_FAIL = 0.55


def _checkerboard(rgb, bg):
    """A drawn transparency checkerboard: the edges alternate between the
    background and a second, grey, level."""
    _, _, edge = cutout.measure_bg(rgb)
    off = np.abs(edge - bg).max(axis=1) > cutout.TOL
    if off.mean() < 0.2:
        return False
    o = edge[off]
    grey = (o.max(axis=1) - o.min(axis=1) < 14) & (o.min(axis=1) > 150)
    return grey.mean() > 0.8


def check(kind, im, rep=None, fx_over=None):
    out = []
    w, h = im.size
    if min(w, h) < 1000:
        out.append(("warn", f"small master ({w}x{h}); the pipeline never upscales"))

    if kind == "bg":
        if abs(w / h - 16 / 9) > 0.06:
            out.append(("fail", f"plate is {w}x{h}, not 16:9"))
        a = np.asarray(im.convert("L")).astype(np.float32)
        if a.std() < 12:
            out.append(("fail", "plate is nearly blank"))
        return out

    if abs(w / h - 1) > 0.03:
        out.append(("fail", f"{w}x{h} is not square"))
    if rep is None or rep.get("pre_cut"):
        return out

    rgb = np.asarray(im.convert("RGB")).astype(np.int16)
    if _checkerboard(rgb, np.array(rep["bg"])):
        out.append(("fail", "a transparency checkerboard is drawn into the background"))
    elif rep["edge_flat"] < (FX_FLAT_FAIL if kind == "fx" else FLAT_FAIL):
        out.append(("fail", f"background is not flat: only {rep['edge_flat']:.0%} of the "
                            f"edges match {tuple(rep['bg'])} — a surface, gradient or scene"))
    if min(rep["bg"]) < 225:
        out.append(("fail", f"background is not white: {tuple(rep['bg'])}"))

    fg, touches = rep["fg_frac"], set(rep["touches"])
    if kind == "cast":
        if touches - {"bottom"}:
            out.append(("fail", "the figure is cropped by the "
                                + "/".join(sorted(touches - {"bottom"})) + " edge"))
        # The cast is half-body and stands on the floor of the panel. A figure
        # that ends inside the picture leaves a gap under it on the page, next
        # to two characters who have none — and it cannot be slid down, because
        # the corners beside the arms stay empty.
        if "bottom" not in touches:
            out.append(("fail", "the body ends inside the picture, leaving a gap under the "
                                "figure — it must run off the bottom edge"))
        elif rep.get("base_frac", 1) < BASE_FAIL:
            out.append(("fail", f"the figure meets the bottom edge on only "
                                f"{rep.get('base_frac', 0):.0%} of its width — the body must "
                                f"run off the edge, not rest on it"))
        if not 0.15 <= fg <= 0.75:
            out.append(("fail", f"the figure covers {fg:.0%} of the square"))
    elif kind == "props":
        if touches:
            out.append(("fail", "the object is cropped by the "
                                + "/".join(sorted(touches)) + " edge"))
        if not 0.06 <= fg <= 0.85:
            out.append(("fail", f"the object covers {fg:.0%} of the square"))
    elif kind == "fx":
        if fg > 0.6:
            out.append(("fail", f"the mark covers {fg:.0%} of the frame — an overlay "
                                f"has to be seen through"))
        if fg < 0.002:
            out.append(("fail", "nothing was drawn"))
        if fx_over == "figure" and rep["bbox"]:
            x0, y0, x1, y1 = rep["bbox"]
            cx, cy = (x0 + x1) / 2 / w, (y0 + y1) / 2 / h
            if 0.35 < cx < 0.65 and 0.55 < cy and (y1 - y0) / h < 0.3:
                out.append(("warn", "the mark sits low and central — check it is not "
                                    "on the chest"))

    if kind in ("cast", "props") and rep["leak_frac"] >= LEAK_FAIL:
        out.append(("fail", f"the outline has a gap: {rep['leak_frac']:.1%} of the "
                            f"figure was flooded through it and would come out hollow"))
    elif kind in ("cast", "props") and rep["leak_frac"] >= LEAK_FAIL / 3:
        out.append(("warn", f"{rep['leak_frac']:.1%} of the figure is reachable only "
                            f"through narrow gaps — a pocket, or a hole in the line"))
    return out


def failed(findings):
    return any(level == "fail" for level, _ in findings)
