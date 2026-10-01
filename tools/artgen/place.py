"""Put a figure effect's mark where it belongs on the face — in code.

    stamp(mark, places, side) -> RGBA square

Six generations across two prompt versions settled it: the image model draws a
blush cluster well and cannot put one at given coordinates. Asked for "50-56%
across, 53-58% down", it returns marks three times too large, 20-40 points
apart, on the hair. That is the same lesson `make_sheet.py` already records
about grids — ask the generator for the one thing it is reliable at, and do the
layout as arithmetic.

So an effect that has to land on a particular feature of the face carries
`place` in data/cast.json: a list of [x, y, width], each a fraction of the
effect square, giving the centre of one stamp and how wide it is. The master is
then the mark ALONE, drawn centred and large; it is trimmed to its content and
stamped once per entry. A later entry is the far side of a three-quarter face,
so it is usually smaller.

The effect square maps onto the figure at a fixed scale (app.js `paintFx`: the
square is 1.34 x the figure's height, standing on the floor, centred on the
figure, and mirrored with it), and the expressions are aligned by
`make_sheet.py`, so a position measured once holds for every face. Measured on
Tí and Thảo, all twelve drawings: near cheek (0.510-0.526, 0.558-0.561), far
cheek (0.607-0.614, 0.553-0.556).

An effect with no `place` is composed by the generator inside the square, as
before — right for a burst behind the head or lines from an edge, which are
placed against the frame rather than against a feature.
"""
from PIL import Image


def trim(im: Image.Image) -> Image.Image:
    bb = im.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox()
    return im.crop(bb) if bb else im


def stamp(mark: Image.Image, places, side: int) -> Image.Image:
    mark = trim(mark.convert("RGBA"))
    out = Image.new("RGBA", (side, side), (255, 255, 255, 0))
    for x, y, w in places:
        mw = max(1, round(w * side))
        mh = max(1, round(mark.height * mw / mark.width))
        m = mark.resize((mw, mh), Image.LANCZOS)
        out.alpha_composite(m, (round(x * side - mw / 2), round(y * side - mh / 2)))
    return out
