#!/usr/bin/env python3
"""Every drawing a dialogue names, and which of them exist yet.

Run: python3 tools/check_cast.py
     python3 tools/check_cast.py --strict     # also fail on a missing image file

Two different questions, and they are deliberately answered with two different
severities.

**Is it declared?** A dialogue naming a character, an emotion or a background
that `data/cast.json` does not know is a build failure already — `build.py`
refuses it. This re-checks it so somebody auditing the art layer sees the same
answer without reading the generator.

**Is it drawn?** Reported, and by default not a failure. The dialogues are
authored before the art exists; that is the intended order, and a gate that
failed on undrawn art would mean no dialogue could be written until every
avatar was finished. `--strict` is for the day the art is supposed to be
complete, and for CI after that.

Filenames are fixed by this file and by
`research/story/illustration-prompts.md`, which must agree:

    art/cast/<character-slug>.webp     one sheet, all six emotions
    art/bg/<background-slug>.jpg
    art/props/<prop-slug>.webp         one cut-out, transparent
    art/fx/<effect-slug>.webp          one overlay, transparent

art/ is the source tree; build.py copies all four into docs/assets/, which it
deletes and rewrites on every run.

An effect is the one asset the PAGE says nothing about when it is missing: a
dashed box labelled "dizzy" over somebody's face is worse than no effect, so a
missing one simply does not render. This report is therefore the only place an
undrawn effect shows up at all, which is the reason to run it.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RE_DIALOGUE = re.compile(r"^:::[ \t]*dialogue(?P<attrs>[^\n]*)\n(?P<body>.*?)\n:::[ \t]*$",
                         re.M | re.S)
# Three fields, and the third is the balloon shape. Matching only two was how
# this checker would silently stop seeing any line that asked for a shout.
RE_SPEAKER = re.compile(r"^\*\*(?P<who>[^:*|]+?)(?:\|(?P<emo>[a-z]+))?"
                        r"(?:\|(?P<bub>[a-z]+))?:\*\*", re.M)
RE_BG_LINE = re.compile(r"^@bg[ \t]+(?P<slug>[a-z0-9-]+)[ \t]*$", re.M)
RE_BG_ATTR = re.compile(r'\bbg="([a-z0-9-]+)"')
RE_CAST_LINE = re.compile(r"^@cast[ \t]+(?P<who>.+?)[ \t]*$", re.M)
RE_ITEM_LINE = re.compile(r"^@item[ \t]+(?P<slug>[a-z0-9-]+)", re.M)
RE_FX_LINE = re.compile(r"^@fx[ \t]+(?P<slug>[a-z0-9-]+)", re.M)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true",
                    help="fail when a declared asset has no file yet")
    args = ap.parse_args()

    cast = json.loads((ROOT / "data" / "cast.json").read_text(encoding="utf-8"))
    chars, emos, bgs = cast["characters"], cast["emotions"], cast["backgrounds"]
    props, fxs, bubbles = cast["props"], cast["fx"], cast["bubbles"]
    by_slug = {c["slug"]: n for n, c in chars.items()}

    problems, staged = [], 0
    want = {"cast": set(), "bg": set(), "props": set(), "fx": set()}
    for md in sorted((ROOT / "units").glob("unit-*.md")):
        text = md.read_text(encoding="utf-8")
        for m in RE_DIALOGUE.finditer(text):
            attrs, body = m.group("attrs"), m.group("body")
            here = RE_BG_ATTR.search(attrs)
            slugs = ([here.group(1)] if here else []) + RE_BG_LINE.findall(body)
            if slugs:
                staged += 1
            for s in slugs:
                if s not in bgs:
                    problems.append(f"{md.name}: background {s!r} is not in data/cast.json")
                else:
                    want["bg"].add(s)

            def person(name, why):
                """A speaker or a @cast entry -> their sheet slug, or a problem."""
                name = name.strip()
                if name in chars:
                    return chars[name]["slug"]
                if name in by_slug:
                    return chars[by_slug[name]]["slug"]
                problems.append(f"{md.name}: {why} names {name!r}, who is not in "
                                f"data/cast.json")
                return None

            for who, emo, bub in RE_SPEAKER.findall(body):
                slug = person(who, "a speaker")
                if not slug:
                    continue
                if (emo or "neutral") not in emos:
                    problems.append(f"{md.name}: {who.strip()} is {emo!r}, not one "
                                    f"of {', '.join(sorted(emos))}")
                    continue
                if bub and bub not in bubbles:
                    problems.append(f"{md.name}: {who.strip()}'s line asks for a "
                                    f"{bub!r} balloon, not one of "
                                    f"{', '.join(sorted(bubbles))}")
                    continue
                # Only a staged dialogue needs art. An unstaged one still names
                # its speakers and they still have to be real people.
                #
                # One sheet per CHARACTER, not per emotion: the file carries all
                # six panels, so a character who has spoken once needs the same
                # single file as one who has used every face.
                if slugs:
                    want["cast"].add(slug)

            # A silent character on stage is drawn exactly like a speaking one,
            # so @cast pulls in a sheet just as a spoken line does.
            for spec in RE_CAST_LINE.findall(body):
                if spec.strip() == "none":
                    continue
                for part in spec.split(","):
                    nm = part.split("|")[0].strip()
                    if not nm:
                        continue
                    slug = person(nm, "@cast")
                    if slug and slugs:
                        want["cast"].add(slug)

            for slug in RE_ITEM_LINE.findall(body):
                if slug == "none":
                    continue
                if slug not in props:
                    problems.append(f"{md.name}: @item {slug!r} is not a prop in "
                                    f"data/cast.json")
                else:
                    want["props"].add(slug)
            for slug in RE_FX_LINE.findall(body):
                if slug not in fxs:
                    problems.append(f"{md.name}: @fx {slug!r} is not an effect in "
                                    f"data/cast.json")
                else:
                    want["fx"].add(slug)

    if problems:
        print(f"FAIL: {len(problems)} problem(s)")
        for p in problems:
            print("  -", p)
        return 1

    # (key, directory, extension) per kind, in the order they are reported.
    KINDS = (("cast", "cast", ".webp"), ("bg", "bg", ".jpg"),
             ("props", "props", ".webp"), ("fx", "fx", ".webp"))
    missing = {}
    for key, d, ext in KINDS:
        here = ROOT / "art" / d
        missing[key] = sorted(f"{s}{ext}" for s in want[key]
                              if not (here / f"{s}{ext}").is_file())

    named = sum(len(v) for v in want.values())
    gone = sum(len(v) for v in missing.values())
    print(f"{staged} staged dialogue(s) · {len(want['cast'])} character sheet(s), "
          f"{len(want['bg'])} background(s), {len(want['props'])} prop(s) and "
          f"{len(want['fx'])} effect(s) named · {named - gone} of {named} drawn")

    if gone:
        print("\n  not drawn yet:")
        for key, d, _ in KINDS:
            for f in missing[key]:
                # Two different consequences, and saying which is the point of
                # naming them separately.
                how = ("the effect simply does not appear" if key == "fx"
                       else "a dashed placeholder holds its place")
                print(f"    art/{d}/{f}  —  {how}")
        if args.strict:
            print(f"\nFAIL: --strict, and {gone} declared asset(s) have no file.")
            return 1

    # The whole vocabulary is what the art brief has to cover, whether a
    # dialogue has reached a given prop yet or not — knowing the full set up
    # front is what lets somebody draw them in one sitting and keep them
    # consistent. Anything here that no dialogue names is a drawing nobody
    # needs, which is worth seeing too.
    print(f"\n  the complete set is {len(chars)} character sheet(s) of "
          f"{len(emos)} panels each, {len(bgs)} backgrounds, {len(props)} props "
          f"and {len(fxs)} effects.")
    idle = ([f"props/{s}" for s in sorted(set(props) - want["props"])]
            + [f"fx/{s}" for s in sorted(set(fxs) - want["fx"])])
    if idle:
        print(f"  declared but named by no dialogue yet: {', '.join(idle)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
