#!/usr/bin/env python3
"""Every avatar and background a dialogue names, and which of them exist yet.

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

    docs/assets/cast/<character-slug>.png     one sheet, all six emotions
    docs/assets/bg/<background-slug>.jpg
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RE_DIALOGUE = re.compile(r"^:::[ \t]*dialogue(?P<attrs>[^\n]*)\n(?P<body>.*?)\n:::[ \t]*$",
                         re.M | re.S)
RE_SPEAKER = re.compile(r"^\*\*(?P<who>[^:*|]+?)(?:\|(?P<emo>[a-z]+))?:\*\*", re.M)
RE_BG_LINE = re.compile(r"^@bg[ \t]+(?P<slug>[a-z0-9-]+)[ \t]*$", re.M)
RE_BG_ATTR = re.compile(r'\bbg="([a-z0-9-]+)"')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true",
                    help="fail when a declared asset has no file yet")
    args = ap.parse_args()

    cast = json.loads((ROOT / "data" / "cast.json").read_text(encoding="utf-8"))
    chars, emos, bgs = cast["characters"], cast["emotions"], cast["backgrounds"]

    problems, want_av, want_bg, staged = [], set(), set(), 0
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
                    want_bg.add(s)
            for who, emo in RE_SPEAKER.findall(body):
                who = who.strip()
                c = chars.get(who)
                if not c:
                    problems.append(f"{md.name}: {who!r} speaks but is not in data/cast.json")
                    continue
                emo = emo or "neutral"
                if emo not in emos:
                    problems.append(f"{md.name}: {who} is {emo!r}, not one of "
                                    f"{', '.join(sorted(emos))}")
                    continue
                # Only a staged dialogue needs art. An unstaged one still names
                # its speakers and they still have to be real people.
                #
                # One sheet per CHARACTER, not per emotion: the file carries all
                # six panels, so a character who has spoken once needs the same
                # single file as one who has used every face.
                if slugs:
                    want_av.add(c["slug"])

    if problems:
        print(f"FAIL: {len(problems)} problem(s)")
        for p in problems:
            print("  -", p)
        return 1

    av_dir, bg_dir = ROOT / "docs" / "assets" / "cast", ROOT / "docs" / "assets" / "bg"
    missing_av = sorted(f"{s}.png" for s in want_av
                        if not (av_dir / f"{s}.png").is_file())
    missing_bg = sorted(f"{s}.jpg" for s in want_bg
                        if not (bg_dir / f"{s}.jpg").is_file())

    have_av, have_bg = len(want_av) - len(missing_av), len(want_bg) - len(missing_bg)
    print(f"{staged} staged dialogue(s) · {len(want_av)} character sheet(s) and "
          f"{len(want_bg)} background(s) named · "
          f"{have_av + have_bg} of {len(want_av) + len(want_bg)} drawn")

    if missing_av or missing_bg:
        print("\n  not drawn yet — the page falls back to a plain panel until they land:")
        for f in missing_av:
            print(f"    docs/assets/cast/{f}")
        for f in missing_bg:
            print(f"    docs/assets/bg/{f}")
        if args.strict:
            print(f"\nFAIL: --strict, and {len(missing_av) + len(missing_bg)} "
                  f"declared asset(s) have no file.")
            return 1

    # The whole cast is what the art brief has to cover, whether a dialogue has
    # reached that character yet or not — knowing the full set up front is what
    # lets somebody draw them in one sitting and keep them consistent.
    print(f"\n  the complete set is {len(chars)} character sheet(s) of "
          f"{len(emos)} panels each, plus {len(bgs)} backgrounds.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
