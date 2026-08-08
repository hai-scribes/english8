#!/usr/bin/env python3
"""The IELTS knowledge base's audit checklist, made executable.

Run: python3 tools/check_ielts.py

`research/ielts/09-design-principles.md` §1 is a 66-item checklist any lesson
or tool in this repo can be audited against. Most of it needs a human. Some of
it does not, and the items that do not are the ones a course drifts on
quietly — a caveat dropped in a rewrite, a cross-reference that stopped
resolving, a band number that crept into a progress line. Those are checked
here, fail-closed, so drift is a build failure rather than a discovery.

What this gate enforces
-----------------------
  A1  every level label is CEFR, never an IELTS band
  A2  no band number is output as a score, prediction or promise
  A3  no half-band appears anywhere in learner-facing text
  A5  a bridge quoting Writing descriptor wording names the version
  B1  every unit's writing task names the criterion it trains
  B2  the 80-100 word paragraph is never called a Task 2 essay
  B3  no templates, model openers or "useful language" phrase banks
  B5  notices and instructions are not claimed to train GT Writing Task 1
  B7  Vietnamese-specific pronunciation guidance stays inside the three
      permitted targets; the four VN-4 prohibitions are absolute
  E7  no hours-to-band promise of any kind
  G1  every bridge's source resolves to a real section of a real KB file
  G2  every bridge carries a legal evidential marker, printed at use

What it deliberately does not do
--------------------------------
It does not read the knowledge base and re-derive the claims. It checks that
what the units *say* is shaped the way the constitution requires, and that
every citation lands. Judging whether a claim is a fair reading of its source
is the reviewer's job and this script does not pretend otherwise.
"""
from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "research" / "ielts"

spec = importlib.util.spec_from_file_location("b", ROOT / "tools" / "build.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)

# --------------------------------------------------------------- A2, A3, E7 --
# Patterns that make a band number a promise rather than a coordinate on the
# descriptor grid. A2 permits "chunking is named in the band-6 Pronunciation
# column"; it forbids everything below.
BAND_PROMISE = [
    (re.compile(r"\b(your|estimated|predicted|target|current)\s+(ielts\s+)?band\b", re.I),
     "a band presented as the learner's own score (A2)"),
    (re.compile(r"\b(reach|get to|hit|achieve|guarantee[sd]?)\s+(ielts\s+)?band\b", re.I),
     "a band presented as a promise (A2)"),
    (re.compile(r"\bband\s*\d(\.\d)?\s*(lesson|level|vocabulary|words|checklist|rubric)\b", re.I),
     "a band used as a level label — label by CEFR instead (A1)"),
    (re.compile(r"\bband\s*\d\.5\b", re.I),
     "a half-band — no half-band descriptors are published (A3)"),
    (re.compile(r"\b\d+\s*(hours?|weeks?|months?)\s*(=|to|→)\s*(one\s+)?band\b", re.I),
     "an hours-to-band promise (E7)"),
    (re.compile(r"\bielts\s+score\s+of\b", re.I),
     "an IELTS score presented as an outcome (A2)"),
]

# ------------------------------------------------------------------ B2, B3 ---
GENRE_OVERCLAIM = [
    (re.compile(r"task\s*2\s*(essay\s*)?practice", re.I),
     "an 80-100 word paragraph is a Task 2 body paragraph, not Task 2 practice (B2)"),
    (re.compile(r"\bwrite\s+an?\s+ielts\s+essay\b", re.I),
     "the course format cannot carry a Task 2 essay (B2)"),
    (re.compile(r"notice.{0,40}\b(general training|gt)\b.{0,20}task\s*1", re.I),
     "notices do not train GT Writing Task 1 — GT Task 1 is a letter only (B5)"),
]

TEMPLATE_LANGUAGE = [
    (re.compile(r"structure to copy", re.I),
     "a fill-in structure is the memorised-language category, scored at band 4 (B3)"),
    (re.compile(r"^#+\s*useful (language|phrases|sentences|expressions)\s*$", re.I | re.M),
     "a phrase bank to reuse is memorised language (B3)"),
    (re.compile(r"\b(memoris|memoriz)e these (phrases|openers|sentences)", re.I),
     "memorised openers are explicitly penalised, not a shortcut (B3)"),
    (re.compile(r"sentence (frames?|starters?) to (use|copy|reuse)", re.I),
     "a sentence frame is a template (B3)"),
]

# --------------------------------------------------------------------- B7 ----
# VN-4's four prohibitions, plus the two added on 2026-08-08. Each pattern is
# written to catch the *claim*, not the topic: teaching /ʊ/ vs /uː/ is fine,
# attributing the difficulty to Vietnamese is not, because `07` §5.5.6 is a
# standing GAP and contrastive reasoning does not close it.
VOWELS = r"(/ʊ/|/uː/|/ə/|/ɪ/|vowel)"
VN_PROHIBITED = [
    (re.compile(rf"vietnamese[^.\n]{{0,60}}{VOWELS}|{VOWELS}[^.\n]{{0,60}}vietnamese", re.I),
     "Vietnamese-specific vowel guidance — `07` §5.5.6 is a GAP and contrastive "
     "reasoning does not close it (B7 / VN-4)"),
    (re.compile(r"\b(northern|southern|hanoi|saigon|ho chi minh)\b[^.\n]{0,60}"
                r"(pronounc|accent|sound)", re.I),
     "region-specific pronunciation guidance — the evidence is drawn from two "
     "different populations (B7 / VN-4)"),
    (re.compile(r"vietnamese is a tone|tone language[^.\n]{0,60}(stress|word stress)", re.I),
     "word stress justified by Vietnamese tone transfer — the premise is contested (B7 / VN-4)"),
    (re.compile(r"vietnamese (has|does not have|lacks|has no)[^.\n]{0,50}"
                r"(so|therefore|which is why|because of this)[^.\n]{0,40}"
                r"(you will|learners will|they will|students will)", re.I),
     "error prediction by contrasting the two sound inventories (B7 / VN-4)"),
    (re.compile(r"(final|ending|coda)[^.\n]{0,40}(consonant|/s/|/z/)[^.\n]{0,80}"
                r"(raise|improve|better)[^.\n]{0,30}(score|band|pronunciation)", re.I),
     "no evidence relates coda work to a score, band or intelligibility (B7)"),
    (re.compile(r"vietnamese is syllable[- ]timed", re.I),
     "no rhythm-metric characterisation of Vietnamese-accented English exists (B7)"),
]

# Vietnamese-L1 pronunciation claims are permitted only where `07` §8.3 ships
# one. A unit making such a claim must carry a bridge citing §5.5 or §8.3.
#
# Scoped to the Pronunciation block deliberately. B7 is a rule about phonology,
# and an unscoped version of this pattern fires on Unit 5's article lesson —
# "Vietnamese learners either drop articles or add them" — which is a claim
# about a grammar system Vietnamese does not have, not a sound-inventory
# inference, and is not what VN-4 prohibits.
RE_VN_CLAIM = re.compile(r"vietnamese (learners|speakers|students)[^.\n]{0,80}"
                         r"(merge|swap|drop|omit|confuse|mispronounce)", re.I)
RE_PRON_BLOCK = re.compile(r"^###\s+Pronunciation\b.*?(?=^###\s|\Z)", re.M | re.S)

WRITING_CRITERIA = b.WRITING_CRITERIA
RE_BRIDGE = b.RE_BRIDGE
RE_MARKER = b.RE_MARKER
RE_SRC = b.RE_SRC


def kb_sections(path: Path) -> set[str]:
    """Every section number a knowledge-base file actually defines."""
    out = set()
    for m in re.finditer(r"^#{2,4}\s*(\d+(?:\.\d+)*[a-z]?)[.\s—-]", path.read_text(encoding="utf-8"), re.M):
        out.add(m.group(1))
    return out


def check_bridge(where: str, a: dict, body: str, problems: list):
    unknown = set(a) - b.BRIDGE_ATTRS - {"body", "lesson"}
    if unknown:
        problems.append(f"{where}: unknown bridge attribute(s) {sorted(unknown)}")
    for req in sorted(b.BRIDGE_REQUIRED):
        if not a.get(req):
            problems.append(f"{where}: bridge is missing required attribute {req!r}")
    if a.get("trains") and a["trains"] not in b.TRAINS:
        problems.append(f"{where}: {a['trains']!r} is not a criterion the descriptors name "
                        f"(allowed: {', '.join(sorted(b.TRAINS))})")
    mk = RE_MARKER.match(a.get("marker", "").strip())
    if not mk or mk.group(1) not in b.MARKERS:
        problems.append(f"{where}: {a.get('marker')!r} is not a legal evidential marker (G2)")
    if a.get("cefr") and a["cefr"] not in b.CEFR:
        problems.append(f"{where}: cefr={a['cefr']!r} is not a CEFR level (A1)")
    sm = RE_SRC.match(a.get("src", "").strip())
    if not sm:
        problems.append(f"{where}: src={a.get('src')!r} is not of the form '08 §3.1' (G1)")
    else:
        f = KB / b.KB_FILES[sm.group(1)]
        if not f.is_file():
            problems.append(f"{where}: src names {f.name}, which does not exist (G1)")
        else:
            want = sm.group(2).lstrip("§").split("–")[0].split("-")[0].strip("§")
            have = kb_sections(f)
            if want not in have:
                problems.append(f"{where}: {f.name} has no section {want} — the citation does "
                                f"not resolve (G5)")
    # A5 / D2: descriptor wording carries its version, because two documents
    # with different wording circulate and a bare quote cannot be checked.
    #
    # Scoped to quotations of the *descriptors*. An earlier version fired on any
    # quotation inside a writing bridge, which would have forced a [2023] stamp
    # onto a CEFR Companion Volume quote and a research quote — attaching a
    # version string to a document that does not have one is a worse defect than
    # the one being prevented.
    quoted = re.search(r'["“][^"”\n]{12,}["”]', body)
    descriptor = re.search(r"\bdescriptors?\b", body, re.I)
    if a.get("trains") in WRITING_CRITERIA and quoted and descriptor and "[2023]" not in body:
        problems.append(f"{where}: quotes Writing descriptor wording without the [2023] "
                        f"version string (A5)")


def main() -> int:
    problems: list[str] = []
    units = []
    for md in sorted((ROOT / "units").glob("unit-*.md")):
        text = md.read_text(encoding="utf-8")
        u = b.parse_unit(md)
        units.append(u)
        tag = f"unit {u['nn']}"

        for rx, why in BAND_PROMISE + GENRE_OVERCLAIM + TEMPLATE_LANGUAGE + VN_PROHIBITED:
            for m in rx.finditer(text):
                line = text[:m.start()].count("\n") + 1
                problems.append(f"{tag}:{line}: {why}\n      → {m.group(0).strip()[:70]!r}")

        for i, bm in enumerate(RE_BRIDGE.finditer(text), 1):
            line = text[:bm.start()].count("\n") + 1
            check_bridge(f"{tag}:{line} (bridge {i})", b.bridge_attrs(bm), bm.group("body"), problems)

        # B7: a Vietnamese-L1 pronunciation claim needs a bridge that cites the
        # section licensing it. Without one it is folklore with a flag on it.
        srcs = {x.get("src", "") for x in u["bridges"]}
        licensed = any(s.startswith("07 §5.5") or s.startswith("07 §8.3") for s in srcs)
        if not licensed:
            for blk in RE_PRON_BLOCK.finditer(text):
                for m in RE_VN_CLAIM.finditer(blk.group(0)):
                    line = text[:blk.start() + m.start()].count("\n") + 1
                    problems.append(f"{tag}:{line}: a Vietnamese-L1 pronunciation claim with no "
                                    f"bridge citing `07` §5.5 or §8.3 to license it (B7)\n      "
                                    f"→ {m.group(0).strip()[:70]!r}")

        # B1: the unit's writing task must name the criterion it trains.
        if not any(x.get("trains") in WRITING_CRITERIA for x in u["bridges"]):
            problems.append(f"{tag}: no writing task names the criterion it trains (B1)")

    if problems:
        print(f"FAIL: {len(problems)} problem(s)")
        for p in problems[:60]:
            print("  -", p)
        if len(problems) > 60:
            print(f"  … and {len(problems) - 60} more")
        return 1

    bridges = [x for u in units for x in u["bridges"]]
    by_mark: dict[str, int] = {}
    for x in bridges:
        mk = RE_MARKER.match(x["marker"].strip())
        by_mark[mk.group(1)] = by_mark.get(mk.group(1), 0) + 1
    weak = sum(n for k, n in by_mark.items() if k in ("[S]", "[S/NS]", "[T2]", "[INF]", "[SPEC]"))
    spread = " · ".join(f"{k} {n}" for k, n in sorted(by_mark.items(), key=lambda kv: -kv[1]))
    print(f"PASS: {len(bridges)} IELTS bridges across {len(units)} units · every citation "
          f"resolves · {spread}")
    print(f"      {weak} of {len(bridges)} rest on evidence weaker than verified, and each "
          f"says so where it appears.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
