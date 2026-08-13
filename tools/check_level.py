#!/usr/bin/env python3
"""The story prose stays inside grade 8, and never teaches ahead of itself.

Run: python3 tools/check_level.py
     python3 tools/check_level.py --unit 1
     python3 tools/check_level.py --strict-through 3      # the build gate

Twelve chapters of narrative prose sit in the four story slots of every unit —
the Getting Started dialogue, the Skills 1 passage, the Skills 2 recording and
its writing model. Prose written to be *good* drifts above the syllabus without
anybody noticing, because no exercise ever asks about the structure that drifted.
This is the check nothing else performs.

Two severities, and the difference matters.

  BEYOND    A structure that is in NO unit of the prescribed book, at any point
            in the year — a second conditional, a perfect modal. A grade-8
            reader will not have met it and will not meet it. These are defects.

  FORWARD   A structure the book does teach, in a LATER unit. Meeting a form
            before it is taught is defensible input and the story often pays for
            it, so this reports and never fails. It is a curriculum decision,
            made visible — the same stance `check_coverage.py` takes.

`--strict-through N` fails the build on any BEYOND finding in units 1..N. That
number is the progress marker: it rises as units are processed, and the honest
reading of `--strict-through 3` is "units 1-3 are clean and 4-12 are not yet
done". Do not raise it to silence a finding.

What this cannot see, stated plainly: the detectors are regular expressions over
sentences, so they find structures with a distinctive surface shape and miss
those without one. A clean report is evidence, not proof. Lexical difficulty is
`check_dict.py`'s half and is not assessed here at all.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# The four story slots. Lesson 4 is prescribed and never restoried
# (`research/story/chapter-briefs.md` §0), so it carries no narrative prose.
RE_DIALOGUE = re.compile(r"^:::[ \t]*dialogue\b[^\n]*\n(?P<body>.*?)\n:::[ \t]*$", re.M | re.S)
RE_PASSAGE = re.compile(r"^:::[ \t]*passage\b[^\n]*\n(?P<body>.*?)\n:::[ \t]*$", re.M | re.S)
RE_AUDIO = re.compile(r"^:::[ \t]*audio\b[^\n]*\n(?P<body>.*?)\n:::[ \t]*$", re.M | re.S)

SLOTS = (("dialogue", RE_DIALOGUE), ("passage", RE_PASSAGE), ("recording", RE_AUDIO))

# ---------------------------------------------------------------- detectors --
# Each is (label, compiled pattern, note). A pattern matches inside one
# sentence, so a `would` in one clause cannot pair with an `if` two sentences
# away — which is where a looser pattern produces most of its false alarms.

# A modal, with its contracted negative attached. `\bcould\b` does NOT match
# inside "couldn't" — the `n` keeps the word going — and that silently cost the
# second-conditional detector its first real find.
MODAL = r"(?:would|could|might)(?:n[’']t)?"
# `if you paid me` is a second conditional and `paid` does not end in -ed. A
# regex cannot conjugate, so the common irregular pasts are listed. The list is
# the detector's ceiling: an irregular outside it is a miss, not a pass.
PAST_V = (r"(?:\w+ed|paid|went|said|had|was|were|knew|took|got|made|came|saw|"
          r"gave|found|told|left|felt|kept|put|ran|sat|stood|thought|brought|"
          r"bought|caught|taught|held|heard|meant|met|lost|won|sent|spent|"
          r"built|wrote|read|spoke|broke|chose|drove|rode|wore|woke|fell|did)")

BEYOND = [
    ("second conditional",
     re.compile(rf"\bif\s+\w{{1,12}}\s+{PAST_V}\b[^.?!]{{0,80}}\b{MODAL}\b"
                rf"|\b{MODAL}\b[^.?!]{{0,80}}\bif\s+\w{{1,12}}\s+{PAST_V}\b", re.I),
     "if + past + would. The book teaches the first conditional (unit 6) and "
     "stops there."),
    ("perfect modal",
     re.compile(r"\b(would|could|should|might|must)(n[’']t)?\s+"
                r"(not\s+)?have\s+\w+", re.I),
     "would/could have + past participle. Not taught in any unit."),
    ("present perfect continuous",
     re.compile(r"\b(have|has|'ve|'s)\s+been\s+(?P<w>\w+ing)\b", re.I),
     "have been + -ing. Present perfect SIMPLE is grade 7 and fine; the "
     "continuous is not taught."),
    ("past perfect continuous",
     re.compile(r"\bhad\s+been\s+(?P<w>\w+ing)\b", re.I),
     "had been + -ing. Not taught in any unit."),
    ("modal passive",
     re.compile(r"\b(can|could|will|would|may|might|must|should)\s+"
                r"(not\s+|n't\s+)?be\s+(?P<w>\w+(?:ed|en))\b", re.I),
     "modal + be + past participle. The passive is not a target in any unit, "
     "and under a modal it is furthest from anything the book models."),
    ("wish / unreal past",
     re.compile(r"\bwish(es|ed)?\s+(\w+\s+){0,2}(were|had|would|could)\b", re.I),
     "unreal past after wish. Not taught in any unit."),
]

# A structure the book does teach, keyed to the unit that first licenses it. A
# hit only reports when it appears in an EARLIER unit than its key.
FORWARD = [
    (6, "future simple with will",
     re.compile(r"\b(will|won't|'ll)\s+\w+", re.I)),
    (6, "first conditional",
     re.compile(r"\bif\b[^.?!]{0,60}\b(will|won't|'ll)\b", re.I)),
    (6, "unless",
     re.compile(r"\bunless\b", re.I)),
    (9, "past continuous",
     re.compile(r"\b(was|were)\s+(?P<w>\w+ing)\b", re.I)),
    (11, "reported statement",
     re.compile(r"\b(said|told\s+\w+|says|tells\s+\w+)\s+that\b", re.I)),
    (12, "reported question",
     re.compile(r"\b(asked|wondered|wanted\s+to\s+know)\s+(\w+\s+){0,2}"
                r"(whether|if|what|why|how|where|when)\b", re.I)),
]

# Reported speech backshifts into the past perfect by rule, so a past perfect
# inside units 11-12 is the target doing its job rather than a level slip.
PAST_PERFECT = re.compile(r"\bhad\s+(?P<w>\w+(?:ed|en))\b", re.I)

RE_SENTENCE = re.compile(r"[^.?!…]+[.?!…]*")

# `was nothing`, `will be thirteen`, `is a garden` — the -ing and -en/-ed
# suffixes are not reliable participle tells, and a gate that cries wolf on
# ordinary nouns and numerals gets ignored, which costs more than it saves.
NOT_A_PARTICIPLE = re.compile(
    r"^(nothing|something|anything|everything|thing|things|morning|evening|"
    r"during|king|ring|string|spring|ceiling|building|willing|young|"
    r"thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|"
    r"often|children|women|men|garden|kitchen|golden|wooden|sudden|listen|"
    r"oven|even|seven|eleven|dozen|green|kitten|"
    r"need|indeed|red|bed|hundred|sacred|hatred|ahead|instead)$", re.I)


def sentences(body: str):
    """Story prose, stripped to plain sentences.

    Speaker labels, gloss markers, blockquote markers and emphasis all carry no
    grammar of their own, and leaving them in makes every excerpt unreadable in
    the report.
    """
    text = re.sub(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]", r"\1", body)
    text = re.sub(r"^\s*>\s?", "", text, flags=re.M)
    text = re.sub(r"^\*\*[^:*]{1,20}:\*\*\s*", "", text, flags=re.M)
    text = text.replace("**", "").replace("*", "")
    for s in RE_SENTENCE.finditer(text.replace("\n", " ")):
        t = " ".join(s.group(0).split())
        if len(t) > 3:
            yield t


def fires(pat, s: str) -> bool:
    """A match counts only if its participle slot really holds a participle."""
    for m in pat.finditer(s):
        try:
            w = m.group("w")
        except IndexError:
            return True
        if not w or not NOT_A_PARTICIPLE.match(w):
            return True
    return False


def scan_unit(nn: int, path: Path) -> list:
    text = path.read_text(encoding="utf-8")
    out = []
    for slot, rx in SLOTS:
        for m in rx.finditer(text):
            for s in sentences(m.group("body")):
                perfect_cont = False
                for label, pat, why in BEYOND:
                    if fires(pat, s):
                        out.append(("BEYOND", slot, label, why, s))
                        perfect_cont |= label == "past perfect continuous"
                for first, label, pat in FORWARD:
                    if nn < first and fires(pat, s):
                        out.append(("FORWARD", slot, label,
                                    f"the book teaches this in unit {first}", s))
                # `had been standing` is already reported, as the harder finding
                # of the two. Reporting its past perfect as well says nothing new
                # and makes the sentence look like two separate problems.
                if nn < 11 and not perfect_cont and fires(PAST_PERFECT, s):
                    out.append(("FORWARD", slot, "past perfect",
                                "licensed from unit 11 as reported-speech backshift", s))
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--unit", type=int, help="report one unit only")
    ap.add_argument("--strict-through", type=int, default=0, metavar="N",
                    help="exit 1 on any BEYOND finding in units 1..N")
    args = ap.parse_args()

    targets = json.loads((ROOT / "curriculum" / "sgk" / "targets.json").read_text())
    titles = {u["unit"]: u["title"] for u in targets["units"]}

    found, beyond_in = {}, {}
    for md in sorted((ROOT / "units").glob("unit-*.md")):
        nn = int(re.search(r"unit-(\d+)", md.name).group(1))
        if args.unit and nn != args.unit:
            continue
        hits = scan_unit(nn, md)
        if hits:
            found[nn] = hits
            beyond_in[nn] = [h for h in hits if h[0] == "BEYOND"]

    n_beyond = sum(len(v) for v in beyond_in.values())
    n_forward = sum(len(v) for v in found.values()) - n_beyond

    for nn in sorted(found):
        print(f"\nunit {nn:02d}  {titles.get(nn, '')}")
        for sev, slot, label, why, s in sorted(found[nn], key=lambda h: (h[0], h[2])):
            excerpt = s if len(s) <= 96 else s[:93] + "…"
            print(f"  {sev:8} {slot:9} {label}")
            print(f"           {excerpt}")
            if sev == "BEYOND":
                print(f"           \033[2m{why}\033[0m")

    print("\n" + "-" * 72)
    print(f"  {n_beyond} beyond grade 8 · {n_forward} taught later in the book")

    fail = [nn for nn in sorted(beyond_in) if nn <= args.strict_through and beyond_in[nn]]
    if args.strict_through:
        if fail:
            print(f"\nFAIL: units {', '.join(str(n) for n in fail)} are inside "
                  f"--strict-through {args.strict_through} and still carry "
                  f"beyond-grade-8 structures.")
            return 1
        print(f"\nPASS: units 1–{args.strict_through} carry nothing beyond grade 8.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
