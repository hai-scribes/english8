#!/usr/bin/env python3
"""Generate, cut out and check the comic's art — the shell face of tools/artgen/.

    python3 tools/art.py status                  what is drawn, missing, retired
    python3 tools/art.py prompt ti/happy         exactly what would be sent
    python3 tools/art.py models                  image models the key can reach
    python3 tools/art.py gen props/cakes         3 candidates, checked + critiqued
    python3 tools/art.py gen --missing fx -n 2   every undrawn effect
    python3 tools/art.py gen bong --accept       promote passing drawings
    python3 tools/art.py gen ti/sad --trial      redraw a finished one, to test consistency
    python3 tools/art.py accept props/cakes      promote the best logged candidate
    python3 tools/art.py contact props/cakes     one image of every candidate
    python3 tools/art.py recheck props/cakes     judge them again (no new images)
    python3 tools/art.py cut in.png -o out.png   any drawing -> transparent
    python3 tools/art.py check art/props/src/x.png --kind props
    python3 tools/art.py free --kind props "A dented tin kettle…" --out .artgen/free/kettle
    python3 tools/art.py report                  what the critic keeps rejecting

Targets are what `status` prints: `ti/happy`, `props/cakes`, `fx/sweat`,
`bg/kitchen`, a bare slug (`cakes`, `harbour-wall`), or a character slug for all
six of their drawings.

Nothing is written to art/ without --accept, and nothing already in art/ is
replaced without --replace. Candidates, previews and the log live in .artgen/,
which is gitignored. The key: .secrets/gemini.key or $GEMINI_API_KEY.
"""
import argparse
import collections
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from PIL import Image, ImageDraw  # noqa: E402

from artgen import config, cutout, gemini, produce, prompts, qa  # noqa: E402


def cmd_status(a):
    ts = prompts.load()
    by = collections.defaultdict(list)
    for t in ts:
        state = ("retired" if t.retired else
                 "drawn" if produce._existing(config.ROOT / t.path) else "missing")
        by[t.kind].append((t.id, state))
    for kind in ("cast", "bg", "props", "fx"):
        rows = by[kind]
        c = collections.Counter(s for _, s in rows)
        print(f"{kind:6} {c['drawn']:3} drawn · {c['missing']:3} missing · {c['retired']} retired")
        if a.verbose or kind != "cast":
            miss = [i for i, s in rows if s == "missing"]
            if miss:
                print("        missing: " + " ".join(miss))
        else:
            chars = collections.defaultdict(int)
            for i, s in rows:
                if s == "missing":
                    chars[i.split("/")[0]] += 1
            if chars:
                print("        missing: " + " ".join(f"{k}×{v}" for k, v in chars.items()))
    print(f"\nkey: {'found' if config.api_key(required=False) else 'NOT SET'}"
          f" · image model {config.IMAGE_MODEL} · critic {config.CRITIC_MODEL}"
          f" · style ref {'yes' if produce._style_ref() else 'none'} (.artgen/ref/style.*)")
    return 0


def cmd_prompt(a):
    for t in prompts.find(a.target):
        refs, pre = produce.references(t)
        print(f"=== {t.id}  ->  {t.path}  ({t.aspect}, {len(refs)} reference image(s))"
              + ("  [RETIRED]" if t.retired else ""))
        print(pre + t.prompt + "\n")
    return 0


def cmd_models(a):
    for mid, name, methods in gemini.list_models():
        if "generateContent" in methods and ("image" in mid or a.all):
            print(f"{mid:44} {name}")
    return 0


def _targets(a):
    if a.missing is not None:
        kinds = {a.missing} if a.missing else {"cast", "bg", "props", "fx"}
        return [t for t in prompts.load() if t.kind in kinds and not t.retired
                and not produce._existing(config.ROOT / t.path)]
    out = []
    for q in a.targets:
        out += prompts.find(q)
    return out


def cmd_gen(a):
    config.api_key()
    run = produce.Run(budget=a.budget, model=a.model, critic_model=a.critic_model)
    ts = _targets(a)
    if not ts:
        print("nothing to generate")
        return 0
    print(f"{len(ts)} target(s), up to {a.n} candidate(s) each, budget {a.budget} calls\n")
    summary = []
    for t in ts:
        print(f"  {t.id}")
        try:
            r = produce.produce(t, n=a.n, accept=a.accept, replace=a.replace,
                                critic=not a.no_critic, run=run, trial=a.trial, like=a.like)
        except produce.BudgetExhausted as e:
            print(f"    {e}")
            break
        except gemini.QuotaError as e:
            print(f"\n  STOPPED: {e}")
            return 2
        if r["status"] in ("exists", "retired"):
            print(f"    skipped: {r['note']}")
        summary.append((t.id, r["status"], (r.get("best") or {}).get("file")))
        if run.spent >= run.budget:
            print(f"\nbudget of {run.budget} image calls spent — stopping")
            break
    print(f"\n{run.spent} image call(s) spent")
    for tid, status, f in summary:
        print(f"  {status:10} {tid}" + (f"  ({f})" if f else ""))
    print("\nLook before you commit: python3 tools/art.py contact <target>")
    return 0 if all(s != "no-pass" for _, s, _ in summary) else 1


def _candidates(t):
    d = config.WORK / "cand" / t.id.replace("/", "__")
    return sorted(d.glob("*.json")) if d.is_dir() else []


def cmd_accept(a):
    t = prompts.find(a.target)
    if len(t) != 1:
        raise SystemExit("accept one drawing at a time")
    t = t[0]
    if a.file:
        cand = Path(a.file).resolve()
    else:
        rows = [json.loads(p.read_text()) for p in _candidates(t)]
        rows = [r for r in rows if r.get("ok")]
        if not rows:
            raise SystemExit(f"no passing candidate for {t.id}; name a file to override")
        best = max(rows, key=lambda r: (r.get("critic") or {}).get("score", 0))
        cand = config.ROOT / best["file"]
    produce.promote(t, cand, replace=a.replace)
    return 0


def cmd_recheck(a):
    config.api_key()
    for t in prompts.find(a.target):
        print(f"  {t.id}")
        produce.recheck(t, produce.Run(critic_model=a.critic_model))
    return 0


def cmd_contact(a):
    out = []
    for t in prompts.find(a.target):
        tiles = []
        for p in _candidates(t)[-a.last:]:
            r = json.loads(p.read_text())
            raw = config.ROOT / r["file"]
            cut = raw.with_name(raw.stem + "-cut.jpg")
            src = cut if cut.is_file() else raw
            im = Image.open(src).convert("RGB")
            im.thumbnail((360, 360))
            tile = Image.new("RGB", (360, 400), (250, 250, 250))
            tile.paste(im, ((360 - im.width) // 2, 0))
            c = r.get("critic") or {}
            label = (f"#{r['i']} {'OK' if r.get('ok') else 'no'} "
                     f"{c.get('score', '-')}/10 {raw.stem[-8:]}")
            ImageDraw.Draw(tile).text((6, 370), label, fill=(0, 0, 0))
            tiles.append(tile)
        if not tiles:
            print(f"{t.id}: no candidates yet")
            continue
        cols = min(4, len(tiles))
        rows = (len(tiles) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * 360, rows * 400), (255, 255, 255))
        for i, tile in enumerate(tiles):
            sheet.paste(tile, (i % cols * 360, i // cols * 400))
        dest = config.WORK / "contact" / f"{t.id.replace('/', '__')}.jpg"
        dest.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(dest, quality=88)
        out.append(dest)
        print(dest.relative_to(config.ROOT))
    return 0 if out else 1


def cmd_cut(a):
    im = Image.open(a.src)
    cut, rep = cutout.key(im, repair=a.repair)
    dest = Path(a.out) if a.out else Path(a.src).with_name(Path(a.src).stem + ".cut.png")
    cut.save(dest)
    print(json.dumps(rep))
    print(f"-> {dest}")
    if a.preview:
        cutout.preview(cut).save(dest.with_name(dest.stem + ".preview.jpg"), quality=88)
    return 0


def cmd_check(a):
    im = Image.open(a.src)
    rep = None if a.kind == "bg" else cutout.key(im)[1]
    findings = qa.check(a.kind, im, rep, a.over)
    if rep:
        print(json.dumps(rep))
    for lvl, msg in findings:
        print(f"  {lvl}: {msg}")
    print("FAIL" if qa.failed(findings) else "ok")
    return 1 if qa.failed(findings) else 0


def cmd_free(a):
    config.api_key()
    text = a.text if a.raw else produce.from_exemplar(a.kind, a.text, a.over)
    aspect = a.aspect or ("16:9" if a.kind == "bg" else "1:1")
    run = produce.Run(budget=a.n, model=a.model)
    for i in range(a.n):
        out = Path(a.out) if a.n == 1 else Path(f"{a.out}-{i}")
        path, findings = produce.generate_free(text, out, a.kind, aspect, a.ref, run)
        print(f"-> {path}")
        for lvl, msg in findings:
            print(f"  {lvl}: {msg}")
    return 0


def cmd_report(a):
    if not config.LOG.is_file():
        print("no generations logged yet")
        return 0
    rows = [json.loads(l) for l in config.LOG.read_text().splitlines() if l.strip()]
    by = collections.defaultdict(list)
    for r in rows:
        by[r["kind"]].append(r)
    for kind, rs in sorted(by.items()):
        ok = sum(1 for r in rs if r.get("ok"))
        print(f"\n{kind}: {len(rs)} candidates, {ok} passed ({ok * 100 // max(1, len(rs))}%)")
        qa_fail = collections.Counter(m.split(":")[0].split("—")[0].strip()
                                      for r in rs for lvl, m in r.get("qa", []) if lvl == "fail")
        for m, c in qa_fail.most_common(6):
            print(f"   checks  {c:3}× {m}")
        crit = collections.Counter(d.get("what", "").lower()[:90] for r in rs
                                   for d in (r.get("critic") or {}).get("defects", [])
                                   if d.get("fatal"))
        for m, c in crit.most_common(a.top):
            print(f"   critic  {c:3}× {m}")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("status"); s.add_argument("-v", "--verbose", action="store_true")
    s = sub.add_parser("prompt"); s.add_argument("target")
    s = sub.add_parser("models"); s.add_argument("--all", action="store_true")

    s = sub.add_parser("gen")
    s.add_argument("targets", nargs="*")
    s.add_argument("--missing", nargs="?", const="", choices=["", "cast", "bg", "props", "fx"],
                   help="every undrawn, unretired target (optionally of one kind)")
    s.add_argument("-n", type=int, default=3, help="candidates per target (stops early on a strong pass)")
    s.add_argument("--accept", action="store_true", help="promote the best passing candidate into art/")
    s.add_argument("--replace", action="store_true", help="allow replacing an existing master")
    s.add_argument("--no-critic", action="store_true", help="machine checks only")
    s.add_argument("--like", help="an earlier drawing whose LOOK is right: redraw it to the prompt")
    s.add_argument("--trial", action="store_true",
                   help="redraw something already drawn, into .artgen/trial/, to compare; never promotes")
    s.add_argument("--budget", type=int, default=config.DEFAULT_BUDGET, help="max image calls")
    s.add_argument("--model"); s.add_argument("--critic-model")

    s = sub.add_parser("accept"); s.add_argument("target"); s.add_argument("file", nargs="?")
    s.add_argument("--replace", action="store_true")
    s = sub.add_parser("recheck"); s.add_argument("target"); s.add_argument("--critic-model")
    s = sub.add_parser("contact"); s.add_argument("target"); s.add_argument("--last", type=int, default=12)

    s = sub.add_parser("cut"); s.add_argument("src"); s.add_argument("-o", "--out")
    s.add_argument("--repair", action="store_true", help="key the gap-closed flood instead")
    s.add_argument("--preview", action="store_true", help="also write it over dark teal")

    s = sub.add_parser("check"); s.add_argument("src")
    s.add_argument("--kind", required=True, choices=["cast", "bg", "props", "fx"])
    s.add_argument("--over", choices=["figure", "panel"])

    s = sub.add_parser("free")
    s.add_argument("text", help="the subject paragraph (or, with --raw, the whole prompt)")
    s.add_argument("--kind", required=True, choices=["bg", "props", "fx"])
    s.add_argument("--over", default="figure", choices=["figure", "panel"])
    s.add_argument("--raw", action="store_true", help="send TEXT as the whole prompt")
    s.add_argument("--out", required=True); s.add_argument("--aspect")
    s.add_argument("--ref", action="append", default=[], help="attach a reference image")
    s.add_argument("-n", type=int, default=1); s.add_argument("--model")

    s = sub.add_parser("report"); s.add_argument("--top", type=int, default=8)

    a = ap.parse_args()
    if a.cmd == "gen" and not a.targets and a.missing is None:
        ap.error("gen needs targets or --missing")
    return globals()[f"cmd_{a.cmd}"](a)


if __name__ == "__main__":
    sys.exit(main())
