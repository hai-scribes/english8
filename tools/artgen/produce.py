"""Generate → cut out → check → critique → choose → promote → compose.

    produce(target, n=3, accept=False, replace=False, critic=True, run=Run())

Every candidate is kept under .artgen/cand/<id>/ with its raw bytes, its
cut-out preview and a JSON sidecar; nothing reaches art/ unless `accept` is set
AND a candidate passed both the machine checks and the critic. An existing
master is never overwritten without `replace` — Tí's six are drawn and final,
and an autonomous loop is exactly the thing that should not be able to
"improve" them by accident. A replaced master is moved to .artgen/replaced/,
never deleted.

The critic is a vision model reading the picture against the very prompt it
was drawn from, plus the drift table's symptoms for its kind. It is a filter,
not an authority: it misses things and it invents things, which is why its
verdicts are logged (`art.py report`) and a person — or Claude, looking at the
contact sheet — still reads the result before it is committed.
"""
import datetime as dt
import io
import json
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image

from . import config, cutout, gemini, place, prompts, qa

EXT = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}
MASTER_EXT = (".png", ".jpg", ".jpeg", ".webp")
EARLY_STOP = 8     # a passing candidate scoring this or better ends the search


@dataclass
class Run:
    budget: int = config.DEFAULT_BUDGET
    spent: int = 0
    model: str = None
    critic_model: str = None
    log: list = field(default_factory=list)

    def take(self):
        if self.spent >= self.budget:
            raise BudgetExhausted(f"image-call budget of {self.budget} spent")
        self.spent += 1


class BudgetExhausted(RuntimeError):
    pass


def _cast():
    return json.loads(config.CAST_JSON.read_text(encoding="utf-8"))


def _now():
    return dt.datetime.now().strftime("%Y%m%dT%H%M%S")


def _existing(path: Path):
    """Any master for this path, whatever extension it was saved with."""
    return [p for p in (path.with_suffix(e) for e in MASTER_EXT) if p.is_file()]


def _read(p: Path):
    mime = {".png": "image/png", ".webp": "image/webp"}.get(p.suffix.lower(), "image/jpeg")
    return p.read_bytes(), mime


def _style_ref():
    for e in MASTER_EXT:
        p = config.WORK / "ref" / f"style{e}"
        if p.is_file():
            return p
    return None


# ------------------------------------------------------------- references --
def references(t: prompts.Target, like=None):
    """(images, preamble). A preamble says what each attachment is FOR; the
    prompt itself is sent unaltered after it. `like` is a drawing of this same
    target whose LOOK is right and whose execution is not — a candidate that was
    liked but floats, say — to be redrawn rather than re-invented."""
    refs, lines = [], []
    if like:
        refs.append(_read(Path(like)))
        lines.append(
            "The first attached image is an earlier drawing of this same subject. Its "
            "look is approved: keep the same person — identical face, hair, clothes, "
            "colours, line and proportions. Redraw it so that it satisfies everything in "
            "the prompt below; where that drawing and the prompt disagree, the prompt wins.")
    if t.kind == "cast":
        # Another drawing of the same person is the strongest consistency
        # signal there is. Neutral first — the prompts file says it is the one
        # drawn first and judged against.
        d = config.ROOT / "art" / "cast" / t.slug
        order = ["neutral", "happy", "worried", "annoyed", "surprised", "sad"]
        others = [p for e in order if e != t.emotion for p in _existing(d / f"{e}.png")][:2]
        for p in others:
            refs.append(_read(p))
        if others:
            lines.append(
                f"The first {len(others)} attached image{'s are' if len(others) > 1 else ' is'} "
                f"this same character in other drawings from the same set. Draw the "
                f"same person: identical face, hair, clothes, colours, line and "
                f"proportions, at the same size in the frame and the same eye level. "
                f"Only the expression and the hands change, as described below.")
        if not others:
            # A character nobody has drawn yet has nothing to agree with, and
            # the first three Bà Sáus came back in three different styles — one
            # of them not this comic's at all. The cast that IS drawn is the
            # style reference we own: same hand, different person.
            mates = []
            for c in _cast()["characters"].values():
                if c["slug"] != t.slug:
                    mates += _existing(config.ROOT / "art" / "cast" / c["slug"] / "neutral.png")[:1]
            for p in mates[:2]:
                refs.append(_read(p))
            if mates:
                lines.append(
                    f"The first {len(mates[:2])} attached image(s) show OTHER characters "
                    f"from the same comic, drawn by the same hand. They are attached for "
                    f"the drawing style only: match their line weight and colour, the "
                    f"flat fills with one hard-edged shadow, the way a face is built from "
                    f"a few lines, the cheek blush, and how large the figure is in the "
                    f"frame. The person you are drawing is somebody else entirely — "
                    f"do not copy their face, hair, age, clothes or pose.")
    style = _style_ref() if t.kind in ("cast", "bg", "props") else None
    if style:
        refs.append(_read(style))
        lines.append("The last attached image is the style reference the prompt "
                     "below refers to.")
    return refs, ("\n\n".join(lines) + "\n\n---\n\n") if lines else ""


# ----------------------------------------------------------------- critic --
CHECKLIST = {
    "cast": """\
- resembles any existing Studio Ghibli character (e.g. Ponyo's red dress or orange hair, Sosuke's striped top and blue shorts)
- drawn sketchy, grainy, pencil-textured or watercoloured — OR glossy modern digital anime with gradients and airbrushing; it must be flat cel colour with one hard-edged shadow inside a fine closed dark line
- the outline has a gap, or colour fades out past the line (the cut-out preview would show a hole or a ragged edge)
- a garment has a pattern, pocket, logo, visible seams or an extra colour not named in the description
- colours dusty, muddy or washed out
- faces the viewer or looks to the LEFT; it must be three-quarter, looking toward the RIGHT side of the frame
- the expression or the hands do not match 'The expression' paragraph; a hand below chest height or cropped by an edge
- more than one figure, a grid, panels, an inset, a border
- any text, letters, signature or watermark
- differs from the attached drawings of the same character (hair, face, clothes, colours, proportions, size in frame)""",
    "bg": """\
- any person, animal or character anywhere in the frame
- any text, letters, numbers or signage (generators add shop signs unasked)
- the setting drifts Japanese (sliding doors, suburban houses, concrete pipes) or away from central Vietnam
- vague, empty or blurred where the prompt names concrete objects
- the top quarter is busy (balloons and a caption go there) or the lower third is cluttered (figures stand there)
- chalk marks or tally marks on a wall
- not painted as soft watercolour and coloured pencil""",
    "props": """\
- the object sits on a table, floor or surface, or casts a drop shadow
- watercoloured, soft-edged or paper-textured instead of flat cel with a closed dark outline
- not recognisable when imagined about two centimetres tall
- hands, people or animals; more than one object; any text or letters (on a class list or worksheet, illegible squiggles are fine; real words are not)""",
    "fx-panel": """\
- painted, shaded or glowing instead of flat ink marks
- any character, face, body or scenery drawn (it must be the marks alone)
- the important marks sit at the extreme edges, where a phone crop removes them
- so dense that the scene underneath stops reading
- any text or letters""",
    "fx": """\
- painted, shaded or glowing instead of flat ink marks
- any character, face, body or scenery drawn (it must be the mark alone)
- in the composite preview the mark is in the wrong place on the figure (e.g. a sweat drop on the chest, blush beside the head rather than on the cheeks), or it hides the face
- any text or letters""",
}


def critique(t, raw, cut, run, findings):
    images = [raw]
    notes = ["Image 1 is the picture as generated."]
    if cut is not None:
        prev = cutout.preview(cut)
        if t.kind == "fx" and _fx_over(t) == "panel":
            prev = _fx_on_plate(cut) or prev
            notes.append("Image 2 is the mark cut out and laid over a whole comic "
                         "panel, cropped as the page crops it. It is meant to cover "
                         "the frame; characters stand in front of the plate later.")
        elif t.kind == "fx":
            prev = _fx_on_figure(_placed(t, cut)) or prev
            notes.append("Image 2 is the mark cut out and laid over a character on a "
                         "dark background, at exactly the position and scale the page uses.")
        else:
            notes.append("Image 2 is the automatic cut-out over dark teal: holes, "
                         "hollowed areas or a pale halo there are defects.")
        prev.thumbnail((1024, 1024))
        images.append(_png(prev))
    if t.kind == "cast":
        refs, _ = references(t)
        for r in refs[:1]:
            images.append(r)
            notes.append(f"Image {len(images)} is an accepted drawing of the same "
                         f"character, for comparison.")
    machine = "\n".join(f"- ({lvl}) {msg}" for lvl, msg in findings) or "- none"
    prompt = f"""You are the art director of a Studio-Ghibli-styled comic for a
Vietnamese grade-8 English course. Judge whether the picture can be used AS IS.

{chr(10).join(notes)}

The artist was given this prompt, and it is the standard:
<<<
{t.prompt}
>>>

Look hard for these known failure modes of this kind of drawing:
{CHECKLIST["fx-panel" if t.kind == "fx" and _fx_over(t) == "panel" else t.kind]}

Automatic measurements already flagged:
{machine}

Answer only with JSON:
{{"verdict": "pass" or "fail", "score": 0-10,
 "defects": [{{"what": "<short, concrete>", "fatal": true|false}}],
 "summary": "<one sentence>"}}
A defect is fatal if the picture needs re-rolling rather than accepting.
"verdict" is "fail" if any defect is fatal. Be strict; say nothing you
cannot see."""
    try:
        return gemini.judge(prompt, images, model=run.critic_model)
    except gemini.QuotaError:
        raise
    except gemini.GeminiError as e:
        return {"verdict": "error", "score": 0, "defects": [], "summary": str(e)[:300]}


def _png(im):
    b = io.BytesIO()
    im.save(b, "PNG")
    return b.getvalue(), "image/png"


# app.js paintFx: a figure effect is a square 1.34 x the figure's height,
# standing on the floor and centred on the figure — so the figure's own square
# cell is the bottom-centre 1/1.34 of the effect. Change one, change the other.
FIG_IN_FX = 1 / 1.34


def _fx_on_figure(mark):
    """Lay a figure effect over a real character exactly as the page does, so
    the critic and a person both see where it lands on a face."""
    for slug in ("thao", "ti", "khoa", "basau", "bong"):
        m = _existing(config.ROOT / "art" / "cast" / slug / "neutral.png")
        if m:
            fig, _ = cutout.key(Image.open(m[0]))
            side = mark.size[0]
            cell = round(side * FIG_IN_FX)
            base = Image.new("RGBA", mark.size, (38, 110, 120, 255))
            base.alpha_composite(fig.resize((cell, cell), Image.LANCZOS),
                                 ((side - cell) // 2, side - cell))
            base.alpha_composite(mark.convert("RGBA"))
            return base.convert("RGB")
    return None


def _fx_on_plate(mark):
    """Lay a panel effect over a plate, cropped to the 3:2 frame the way
    `background-size: cover` crops it."""
    plates = sorted((config.ROOT / "art" / "bg").glob("*.jpg"))
    if not plates:
        return None
    plate = Image.open(plates[0]).convert("RGBA")
    W, H = plate.size
    m = mark.convert("RGBA")
    s = max(W / m.width, H / m.height)
    m = m.resize((round(m.width * s), round(m.height * s)), Image.LANCZOS)
    m = m.crop(((m.width - W) // 2, (m.height - H) // 2,
                (m.width - W) // 2 + W, (m.height - H) // 2 + H))
    plate.alpha_composite(m)
    return plate.convert("RGB")


# ------------------------------------------------------------- the search --
def produce(t: prompts.Target, n=3, accept=False, replace=False, critic=True,
            run: Run = None, trial=False, like=None):
    """`trial` draws a target that already exists, to compare against the
    original — the consistency test — and can never promote."""
    run = run or Run()
    master = config.ROOT / t.path
    if trial and (accept or replace):
        raise ValueError("a trial never promotes")
    if t.retired:
        return {"id": t.id, "status": "retired", "note": "the prompts file marks this retired"}
    if _existing(master) and not replace and not trial:
        return {"id": t.id, "status": "exists", "note": f"{t.path} is drawn; pass --replace"}

    fx_over = _cast()["fx"].get(t.slug, {}).get("over") if t.kind == "fx" else None
    cand_dir = config.WORK / ("trial" if trial else "cand") / t.id.replace("/", "__")
    cand_dir.mkdir(parents=True, exist_ok=True)
    refs, preamble = references(t, like)
    results = []

    for i in range(n):
        try:
            run.take()
        except BudgetExhausted as e:
            print(f"    {e}")
            break
        stem = cand_dir / f"{_now()}-{i}"
        try:
            data, mime = gemini.generate_image(preamble + t.prompt, refs, t.aspect,
                                               model=run.model)
        except gemini.QuotaError:
            raise
        except gemini.GeminiError as e:
            print(f"    #{i}: generation failed — {gemini._short(str(e))}")
            results.append({"i": i, "error": str(e)})
            continue
        raw_path = stem.with_suffix(EXT.get(mime, ".png"))
        raw_path.write_bytes(data)
        im = Image.open(io.BytesIO(data))
        im.load()

        cut, rep = (None, None)
        if t.kind != "bg":
            cut, rep = cutout.key(im)
            shown = None
            if t.kind == "fx":
                shown = (_fx_on_plate(cut) if _fx_over(t) == "panel" else _fx_on_figure(_placed(t, cut)))
            (shown or cutout.preview(cut)).save(stem.with_name(stem.name + "-cut.jpg"),
                                                quality=88)
        findings = qa.check(t.kind, im, rep, fx_over)
        verdict = None
        if critic and not qa.failed(findings):
            verdict = critique(t, (data, mime), cut, run, findings)

        r = {"i": i, "file": str(raw_path.relative_to(config.ROOT)), "qa": findings,
             "cut": rep, "critic": verdict, "ok": _ok(findings, verdict, critic)}
        raw_path.with_suffix(".json").write_text(json.dumps(r, indent=1, ensure_ascii=False))
        results.append(r)
        _log(run, t, r)
        print(f"    #{i}: {_line(r)}")
        if r["ok"] and (not critic or (verdict or {}).get("score", 0) >= EARLY_STOP):
            break

    good = [r for r in results if r.get("ok")]
    best = max(good, key=lambda r: (r["critic"] or {}).get("score", 0), default=None)
    out = {"id": t.id, "status": "no-pass", "candidates": results, "best": best}
    if best:
        out["status"] = "candidate"
        if accept:
            promote(t, config.ROOT / best["file"], replace=replace)
            out["status"] = "promoted"
    return out


def recheck(t: prompts.Target, run: Run = None):
    """Judge the candidates already on disk again — after the checks or the
    critic improve — without paying for a single new image."""
    run = run or Run()
    fx_over = _fx_over(t) if t.kind == "fx" else None
    d = config.WORK / "cand" / t.id.replace("/", "__")
    out = []
    for side in sorted(d.glob("*.json")) if d.is_dir() else []:
        r = json.loads(side.read_text())
        raw = config.ROOT / r["file"]
        data = raw.read_bytes()
        im = Image.open(io.BytesIO(data))
        im.load()
        cut, rep = (None, None)
        if t.kind != "bg":
            cut, rep = cutout.key(im)
            shown = None
            if t.kind == "fx":
                shown = _fx_on_plate(cut) if fx_over == "panel" else _fx_on_figure(_placed(t, cut))
            (shown or cutout.preview(cut)).save(
                raw.with_name(raw.stem + "-cut.jpg"), quality=88)
        findings = qa.check(t.kind, im, rep, fx_over)
        mime = "image/png" if raw.suffix == ".png" else "image/jpeg"
        verdict = None if qa.failed(findings) else critique(t, (data, mime), cut, run, findings)
        r.update(qa=findings, cut=rep, critic=verdict, ok=_ok(findings, verdict, True))
        side.write_text(json.dumps(r, indent=1, ensure_ascii=False))
        _log(run, t, {**r, "recheck": True})
        print(f"    #{r['i']} {raw.stem}: {_line(r)}")
        out.append(r)
    return out


def _ok(findings, verdict, critic):
    if qa.failed(findings):
        return False
    if not critic:
        return True
    return bool(verdict) and verdict.get("verdict") == "pass"


def _fx_over(t):
    return _cast()["fx"].get(t.slug, {}).get("over")


def _placed(t, cut):
    """The effect as the page will get it: stamped, if cast.json places it."""
    places = _cast()["fx"].get(t.slug, {}).get("place") if t.kind == "fx" else None
    return place.stamp(cut, places, cut.size[0]) if places else cut


def _line(r):
    if "error" in r:
        return "error"
    fails = [m for lvl, m in r["qa"] if lvl == "fail"]
    if fails:
        return "rejected by checks — " + "; ".join(fails)
    c = r["critic"]
    if not c:
        return "passed checks (no critic)"
    defects = "; ".join(d.get("what", "") for d in c.get("defects", []) if d.get("fatal"))
    return f"critic {c.get('verdict')} {c.get('score')}/10" + (f" — {defects}" if defects else "")


def _log(run, t, r):
    config.WORK.mkdir(exist_ok=True)
    row = {"ts": _now(), "id": t.id, "kind": t.kind,
           "model": run.model or config.IMAGE_MODEL, **r}
    with open(config.LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


# --------------------------------------------------------------- promotion --
def promote(t: prompts.Target, cand: Path, replace=False):
    """Put a candidate where the prompts file says it goes, then run the
    step that turns a master into what the page loads."""
    master = config.ROOT / t.path
    old = _existing(master)
    if old and not replace:
        raise SystemExit(f"{t.path} already exists; pass --replace")
    if old:
        keep = config.WORK / "replaced" / _now()
        keep.mkdir(parents=True, exist_ok=True)
        for p in old:
            shutil.move(str(p), keep / f"{t.id.replace('/', '__')}{p.suffix}")
    master.parent.mkdir(parents=True, exist_ok=True)

    if t.kind == "bg":
        # A plate is published as it is, so it is stored as the JPEG the page
        # loads; --plates then brings it inside the size budget.
        Image.open(cand).convert("RGB").save(master.with_suffix(".jpg"), "JPEG",
                                             quality=92, optimize=True)
        dest = master.with_suffix(".jpg")
    else:
        # A master is kept exactly as the generator returned it; re-encoding a
        # JPEG as PNG to satisfy a suffix adds nothing and loses provenance.
        dest = master.with_suffix(cand.suffix)
        shutil.copyfile(cand, dest)
    print(f"    promoted -> {dest.relative_to(config.ROOT)}")
    compose(t)
    return dest


def compose(t: prompts.Target):
    tools = config.ROOT / "tools"
    if t.kind == "cast":
        d = config.ROOT / "art" / "cast" / t.slug
        emos = list(_cast()["emotions"])
        if all(_existing(d / f"{e}.png") for e in emos):
            cmd = [sys.executable, str(tools / "make_sheet.py"), t.slug]
        else:
            missing = [e for e in emos if not _existing(d / f"{e}.png")]
            print(f"    {t.slug}: sheet waits for {', '.join(missing)}")
            return
    elif t.kind == "bg":
        cmd = [sys.executable, str(tools / "make_overlay.py"), "--plates"]
    else:
        cmd = [sys.executable, str(tools / "make_overlay.py"), t.slug]
    subprocess.run(cmd, cwd=config.ROOT, check=False)


# ---------------------------------------------------- free-form generation --
def from_exemplar(kind, subject, over="figure"):
    """A new prompt of an existing kind: an exemplar block with only its
    subject paragraph replaced — the prompts file's own rule for adding one.
    For props and plates the subject is the last paragraph; for an effect it
    is the one before `Do not include`."""
    ts = [t for t in prompts.load() if t.kind == kind and not t.retired]
    if kind == "fx":
        fx = _cast()["fx"]
        ts = [t for t in ts if fx.get(t.slug, {}).get("over") == over]
    if not ts:
        raise SystemExit(f"no exemplar prompt of kind {kind!r}")
    paras = ts[0].prompt.split("\n\n")
    if kind == "fx":
        i = next(j for j, p in enumerate(paras) if p.startswith("**Do not include:**")) - 1
    else:
        i = len(paras) - 1
    paras[i] = subject.strip()
    return "\n\n".join(paras)


def generate_free(prompt, out: Path, kind=None, aspect="1:1", refs=(), run=None,
                  key=True):
    """One picture from any prompt, saved to `out`; for a keyed kind the cut-out
    is written beside it as <out>.cut.png. Returns (path, qa findings)."""
    run = run or Run()
    run.take()
    data, mime = gemini.generate_image(prompt, [_read(Path(r)) for r in refs], aspect,
                                       model=run.model)
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out = out.with_suffix(EXT.get(mime, ".png"))
    out.write_bytes(data)
    im = Image.open(out)
    findings = []
    if key and kind != "bg":
        cut, rep = cutout.key(im)
        cut.save(out.with_name(out.stem + ".cut.png"))
        findings = qa.check(kind or "props", im, rep)
    return out, findings
