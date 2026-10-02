#!/usr/bin/env python3
"""Gate: the art generator's offline half behaves — no key, no network.

Run: python3 tools/test_artgen.py

What it holds:
  cutout    enclosed white survives; a gap in the outline is reported as a leak
            and --repair closes it; the measured background (not #FFFFFF) is
            keyed; the edge is un-mixed, not left as a pale ring; an image that
            is already cut out is returned untouched
  qa        a drawn checkerboard, a surface, a cropped figure and a hollow
            figure each fail; a clean one passes
  prompts   every block in the prompts file parses, retired ones are marked,
            and every slug data/cast.json declares resolves to a target
  gemini    the request carries the image config; thought parts are skipped;
            an imageSize refusal is retried without it; fenced JSON is read
  produce   candidates never touch art/ without --accept, an existing master is
            never replaced without --replace, and the call budget is a ceiling
"""
import base64
import io
import json
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from artgen import config, cutout, gemini, place, produce, prompts, qa  # noqa: E402

FAILS = []


def ok(cond, what):
    print(("  ok    " if cond else "  FAIL  ") + what)
    if not cond:
        FAILS.append(what)


def ring(size=600, bg=(250, 250, 247), gap=0, fill=(255, 255, 255), line=10):
    """A dark ring enclosing white — a white shirt inside its outline."""
    im = Image.new("RGB", (size, size), bg)
    d = ImageDraw.Draw(im)
    box = (150, 150, 450, 450)
    d.ellipse(box, fill=fill, outline=(40, 30, 25), width=line)
    if gap:
        d.rectangle((295 - gap // 2, 140, 295 + gap // 2, 175), fill=bg)
    return im


def test_cutout():
    print("cutout")
    cut, rep = cutout.key(ring())
    a = np.asarray(cut.getchannel("A"))
    ok(a[300, 300] == 255, "white enclosed by a closed line stays opaque")
    ok(a[20, 20] == 0, "background touching the border is keyed")
    ok(rep["bg"] == [250, 250, 247], "the background colour is measured, not assumed")
    ok(rep["leak_frac"] < 0.01, f"a closed outline reports no leak ({rep['leak_frac']})")
    ok(not rep["touches"], "a centred object touches no edge")

    # A 3 px break in a 10 px line, on a 600 px square: the keyer closes gaps
    # up to ~2 x GAP_FRAC of the short side, so this is inside its reach.
    cut, rep = cutout.key(ring(gap=3))
    a = np.asarray(cut.getchannel("A"))
    ok(a[300, 300] == 0, "a gap in the line lets the flood in (the known failure)")
    ok(rep["leak_frac"] > 0.3, f"…and the leak is reported ({rep['leak_frac']})")
    cut, rep = cutout.key(ring(gap=3), repair=True)
    ok(np.asarray(cut.getchannel("A"))[300, 300] == 255, "--repair keys the gap-closed flood")

    # An anti-aliased edge: a pale pixel between the line and the paper gets
    # partial alpha instead of standing as an opaque pale ring.
    im = Image.new("RGB", (400, 400), (255, 255, 255))
    ImageDraw.Draw(im).rectangle((100, 100, 300, 300), fill=(30, 30, 30))
    px = im.load()
    for y in range(100, 301):
        px[99, y] = (200, 200, 200)
    cut, _ = cutout.key(im)
    ca = cut.getpixel((99, 200))
    ok(0 < ca[3] < 255 and max(ca[:3]) < 60,
       f"an anti-aliased edge is un-mixed, not left pale ({ca})")

    # A see-through effect: darkness becomes opacity, capped by `strength`.
    g = Image.new("RGB", (200, 200), (255, 255, 255))
    ImageDraw.Draw(g).rectangle((0, 0, 60, 199), fill=(0, 0, 0))
    ImageDraw.Draw(g).rectangle((61, 0, 100, 199), fill=(128, 128, 128))
    w, _ = cutout.wash(g, 0.5)
    ok(w.getpixel((190, 100))[3] == 0, "wash: white paper becomes nothing")
    ok(abs(w.getpixel((30, 100))[3] - 128) <= 2, "wash: black is capped at the given strength")
    half = w.getpixel((80, 100))
    ok(abs(half[3] - 64) <= 3 and max(half[:3]) < 12,
       f"wash: a pale grey becomes thin BLACK, not opaque grey ({half})")

    pre = Image.new("RGBA", (100, 100), (0, 0, 0, 0))
    ImageDraw.Draw(pre).ellipse((20, 20, 80, 80), fill=(200, 10, 10, 255))
    out, rep = cutout.key(pre)
    ok(rep["pre_cut"] and out.tobytes() == pre.tobytes(), "an existing cut-out is untouched")


def test_place():
    print("place")
    # An asymmetric mark: a red bar with a blue block at its RIGHT end.
    mark = Image.new("RGBA", (300, 200), (0, 0, 0, 0))
    d = ImageDraw.Draw(mark)
    d.rectangle((60, 80, 240, 120), fill=(255, 0, 0, 255))
    d.rectangle((200, 80, 240, 120), fill=(0, 0, 255, 255))
    out = place.stamp(mark, [[0.25, 0.5, 0.2]], 1000)
    bb = out.getchannel("A").getbbox()
    ok(abs((bb[0] + bb[2]) / 2 - 250) <= 1 and abs((bb[1] + bb[3]) / 2 - 500) <= 1,
       f"a mark is trimmed and stamped centred on its position ({bb})")
    ok(abs((bb[2] - bb[0]) - 200) <= 1, "…at the width the manifest gives it")
    flip = place.stamp(mark, [[0.25, 0.5, 0.2]], 1000, mirrored=True)
    fb = flip.getchannel("A").getbbox()
    ok(abs((fb[0] + fb[2]) / 2 - 750) <= 1, "mirrored: the POSITION is mirrored")
    ok(flip.getpixel((fb[2] - 5, 500))[:3] == (0, 0, 255),
       "mirrored: the mark itself is not — its right end is still its right end")


def test_qa():
    print("qa")
    im = ring()
    ok(not qa.failed(qa.check("props", im, cutout.key(im)[1])), "a clean prop passes")

    chk = Image.new("RGB", (600, 600), (255, 255, 255))
    d = ImageDraw.Draw(chk)
    for y in range(0, 600, 20):
        for x in range(0, 600, 20):
            if (x // 20 + y // 20) % 2:
                d.rectangle((x, y, x + 19, y + 19), fill=(204, 204, 204))
    d.ellipse((200, 200, 400, 400), fill=(200, 40, 40), outline=(0, 0, 0), width=6)
    f = qa.check("props", chk, cutout.key(chk)[1])
    ok(any("checkerboard" in m for _, m in f), "a drawn checkerboard fails")

    table = ring()
    ImageDraw.Draw(table).rectangle((0, 470, 600, 600), fill=(150, 100, 60))
    f = qa.check("props", table, cutout.key(table)[1])
    ok(qa.failed(f), "an object on a table (a surface to the edge) fails")

    crop = Image.new("RGB", (600, 600), (255, 255, 255))
    ImageDraw.Draw(crop).ellipse((-50, 100, 300, 700), fill=(80, 120, 60), outline=(0, 0, 0), width=8)
    f = qa.check("cast", crop, cutout.key(crop)[1])
    ok(any("cropped by the left" in m for _, m in f), "a figure cropped by the side edge fails")

    # A bust: the body ends inside the picture, with a gap under it.
    bust = Image.new("RGB", (600, 600), (255, 255, 255))
    ImageDraw.Draw(bust).ellipse((120, 150, 480, 560), fill=(60, 60, 140), outline=(0, 0, 0), width=8)
    f = qa.check("cast", bust, cutout.key(bust)[1])
    ok(any("ends inside the picture" in m for lvl, m in f if lvl == "fail"),
       "a figure that ends above the bottom edge fails")
    # …and the same figure cropped by the frame, as a half-body is, passes.
    half = Image.new("RGB", (600, 600), (255, 255, 255))
    ImageDraw.Draw(half).ellipse((120, 150, 480, 900), fill=(60, 60, 140), outline=(0, 0, 0), width=8)
    ok(not qa.failed(qa.check("cast", half, cutout.key(half)[1])),
       "a figure that runs off the bottom edge passes")

    f = qa.check("props", ring(gap=3), cutout.key(ring(gap=3))[1])
    ok(any("gap" in m for lvl, m in f if lvl == "fail"), "a hollowed figure fails")

    f = qa.check("bg", Image.new("RGB", (1600, 900), (120, 160, 200)))
    ok(any("blank" in m for _, m in f), "a blank plate fails")


def test_prompts():
    print("prompts")
    doc = config.PROMPTS.read_text(encoding="utf-8")
    ts = prompts.load(doc)
    ok(len(ts) == doc.count("**File:** `"), f"every File block parses ({len(ts)})")
    ok(all(t.prompt.strip() for t in ts), "no block has an empty prompt")
    ok(all(prompts.RETIRED not in t.prompt for t in ts), "the retirement notice is never sent")
    cast = json.loads(config.CAST_JSON.read_text(encoding="utf-8"))
    ids = {t.id for t in ts if not t.retired}
    want = ({f"{c['slug']}/{e}" for c in cast["characters"].values() for e in cast["emotions"]}
            | {f"bg/{s}" for s in cast["backgrounds"]}
            | {f"props/{s}" for s in cast["props"]} | {f"fx/{s}" for s in cast["fx"]})
    ok(want <= ids, f"every declared slug has a target (missing: {sorted(want - ids)[:5]})")
    ok(prompts.find("ti")[0].emotion == "neutral", "a character's set starts with neutral")


def _png_b64(color=(255, 0, 0)):
    b = io.BytesIO()
    Image.new("RGB", (64, 64), color).save(b, "PNG")
    return base64.b64encode(b.getvalue()).decode()


def test_gemini():
    print("gemini")
    seen = []

    def fake(url, body, key, timeout=300):
        seen.append((url, body))
        if len(seen) == 1:
            raise gemini.GeminiError('HTTP 400: {"error": "Unknown name \\"imageSize\\""}')
        return {"candidates": [{"content": {"parts": [
            {"inlineData": {"mimeType": "image/png", "data": _png_b64((0, 0, 255))}, "thought": True},
            {"text": "here"},
            {"inlineData": {"mimeType": "image/png", "data": _png_b64((0, 255, 0))}}]}}]}

    gemini.transport = fake
    try:
        data, mime = gemini.generate_image("draw", refs=[(b"x", "image/png")], aspect="16:9",
                                           model="m")
        body = seen[0][1]
        ok(seen[0][0].endswith("/models/m:generateContent"), "calls generateContent on the model")
        ok(body["generationConfig"]["imageConfig"] == {"aspectRatio": "16:9", "imageSize": "2K"},
           "sends aspect ratio and size")
        ok(body["contents"][0]["parts"][1]["inline_data"]["mime_type"] == "image/png",
           "sends reference images after the text")
        ok("imageSize" not in seen[1][1]["generationConfig"]["imageConfig"],
           "an imageSize refusal is retried without it")
        ok(Image.open(io.BytesIO(data)).getpixel((0, 0)) == (0, 255, 0),
           "a thought image is skipped for the final one")

        gemini.transport = lambda *a, **k: {"candidates": [{"content": {"parts": [
            {"text": 'Sure!\n```json\n{"verdict": "pass", "score": 9}\n```'}]}}]}
        ok(gemini.judge("x", [], model="c")["score"] == 9, "fenced JSON from the critic is read")

        def zero(*a, **k):
            raise gemini.GeminiError('HTTP 429: {"error": {"message": "Quota exceeded for '
                                     'metric: generate_content_free_tier_requests, limit: 0"}}')
        gemini.transport = zero
        try:
            gemini.generate_image("x", model="m")
            ok(False, "a zero quota raises")
        except gemini.QuotaError as e:
            ok("billing" in str(e), "a zero quota stops at once and says to turn on billing")

        gemini.transport = lambda *a, **k: {"candidates": [{"finishReason": "SAFETY"}]}
        try:
            gemini.generate_image("x", model="m")
            ok(False, "no image raises")
        except gemini.GeminiError as e:
            ok("SAFETY" in str(e), "no image raises, with the reason")
    finally:
        gemini.transport = gemini._http


def test_produce():
    print("produce")
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        saved = (config.ROOT, config.WORK, config.LOG)
        # A throwaway tree: art/ and .artgen/ inside tmp, prompts and cast.json real.
        config.ROOT, config.WORK, config.LOG = tmp, tmp / ".artgen", tmp / ".artgen" / "log.jsonl"
        calls = {"image": 0, "verdict": "pass"}

        def fake(url, body, key, timeout=300):
            if "responseModalities" in body.get("generationConfig", {}):
                calls["image"] += 1
                im = ring(size=1024)
                b = io.BytesIO()
                im.save(b, "PNG")
                return {"candidates": [{"content": {"parts": [{"inlineData": {
                    "mimeType": "image/png", "data": base64.b64encode(b.getvalue()).decode()}}]}}]}
            return {"candidates": [{"content": {"parts": [{"text": json.dumps(
                {"verdict": calls["verdict"], "score": 9, "defects": []})}]}}]}

        gemini.transport = fake
        try:
            t = prompts.find("props/cakes")[0]
            r = produce.produce(t, n=3, run=produce.Run(budget=5))
            ok(r["status"] == "candidate", f"a passing candidate is found ({r['status']})")
            ok(calls["image"] == 1, "a strong pass stops the search early")
            ok(not (tmp / t.path).exists(), "nothing reaches art/ without --accept")

            (tmp / t.path).parent.mkdir(parents=True, exist_ok=True)
            (tmp / t.path).write_bytes(b"old")
            r = produce.produce(t, n=1, accept=True, run=produce.Run(budget=5))
            ok(r["status"] == "exists" and (tmp / t.path).read_bytes() == b"old",
               "an existing master is never replaced without --replace")

            calls["verdict"] = "fail"          # nothing passes, so only the budget stops it
            run = produce.Run(budget=2)
            r = produce.produce(prompts.find("fx/rain")[0], n=5, run=run)
            ok(run.spent == 2 and len(r["candidates"]) == 2, "the call budget is a ceiling")
            ok(r["status"] == "no-pass", "a critic failure is never promoted")
            ok(config.LOG.is_file() and len(config.LOG.read_text().splitlines()) >= 2,
               "every candidate is logged")
        finally:
            gemini.transport = gemini._http
            config.ROOT, config.WORK, config.LOG = saved


if __name__ == "__main__":
    # A dummy key: every call below goes to a fake transport, never the network.
    import os
    os.environ.setdefault("GEMINI_API_KEY", "test-key-never-sent")
    for t in (test_cutout, test_place, test_qa, test_prompts, test_gemini, test_produce):
        t()
    print(f"\n{'FAIL' if FAILS else 'PASS'}: {len(FAILS)} failure(s)")
    sys.exit(1 if FAILS else 0)
