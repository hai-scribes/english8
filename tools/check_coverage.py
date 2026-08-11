#!/usr/bin/env python3
"""Report what the official textbook teaches that our units do not.

Reads curriculum/sgk/targets.json — the syllabus of the prescribed student's
book — and checks each unit of ours against it: the lexis, the Everyday English
function, the Communication content block, and the named language targets.

This is a *report*, not a gate. Coverage is a curriculum decision and the point
is to make the decision visible, not to fail a build over it. It exits 0 unless
something is actually broken (a missing file, malformed JSON).

    python3 tools/check_coverage.py             # all twelve units, summary
    python3 tools/check_coverage.py --unit 3    # one unit, every missing item
    python3 tools/check_coverage.py --full      # every missing item, all units
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGETS = ROOT / "curriculum" / "sgk" / "targets.json"
UNITS = ROOT / "units"
DICT = ROOT / "data" / "dict"

BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
OFF = "\033[0m"


def paint(text, colour):
    return f"{colour}{text}{OFF}" if sys.stdout.isatty() else text


def unit_haystack(n):
    """Everything we teach in unit n, lowercased: the markdown and the dictionary."""
    md = sorted(UNITS.glob(f"unit-{n:02d}-*.md"))
    if not md:
        raise SystemExit(f"no unit file for unit {n} in {UNITS}")
    raw = md[0].read_text(encoding="utf-8")
    text = raw.lower()
    entries = DICT / f"unit-{n:02d}.json"
    if entries.exists():
        text += "\n" + entries.read_text(encoding="utf-8").lower()
    return text, md[0].name, raw


def communication_blocks(raw):
    """Headings inside our Lesson 4 that are neither Everyday English nor an exercise.

    The book's Communication section has two halves: Everyday English, and a
    named content block with its own exercises. Ours has historically had only
    the first, so this reports the structural fact — what extra headings exist —
    rather than guessing at the topic, which topic words cannot settle.
    """
    body = re.search(r"^## Lesson 4 .*?(?=^## Lesson 5 |\Z)", raw, re.S | re.M)
    if not body:
        return []
    out = []
    for line in body.group(0).splitlines():
        # h3 only: a content block is a peer of "Everyday English", whereas
        # h4s are its own sub-headings (Warning someone, Reassuring someone …).
        m = re.match(r"^###(?!#)\s+(.*\S)\s*$", line)
        if not m:
            continue
        head = m.group(1)
        if head.startswith("Everyday English"):
            continue
        if re.match(r"^4\.\d", head):
            continue
        out.append(head)
    return out


def covers(haystack, term):
    """A term counts as covered if it appears as a whole word or phrase.

    Single words match on a word boundary so that `mark` is not satisfied by
    `market`; multi-word phrases match as a substring, because our prose bends
    them (`chase away` → `chasing away`).
    """
    t = term.lower()
    if " " in t or "-" in t:
        return t in haystack
    return re.search(rf"\b{re.escape(t)}", haystack) is not None


def check_unit(spec, verbose):
    n = spec["unit"]
    hay, filename, raw = unit_haystack(n)

    missing_lexis = [w for w in spec["lexis"] if not covers(hay, w)]
    got = len(spec["lexis"]) - len(missing_lexis)

    ee = spec["everyday_english"]
    ee_hit = next((e for e in ee["exponents"] if e in hay), None)

    extra = communication_blocks(raw)
    block_hit = bool(extra)

    result = {
        "extra_blocks": extra,
        "unit": n,
        "title": spec["title"],
        "file": filename,
        "lexis_got": got,
        "lexis_total": len(spec["lexis"]),
        "missing_lexis": missing_lexis,
        "ee_function": ee["function"],
        "ee_hit": ee_hit,
        "culture_block": spec["culture_block"],
        "block_hit": block_hit,
        "missing_grammar": [g for g in spec["grammar"] if not grammar_covered(hay, g)],
        "pronunciation": spec["pronunciation"],
        "pron_hit": pron_covered(hay, spec["pronunciation"]),
    }
    return result


# Grammar and pronunciation targets are prose, so each needs a probe: a short
# list of strings, any one of which shows the point is actually taught.
GRAMMAR_PROBES = {
    "conjunctive adverbs": ["however", "therefore", "otherwise"],
    "countable and uncountable": ["uncountable", "a few", "a little"],
    "zero article": ["zero article", "no article"],
    "unless": ["unless"],
    "possessive pronouns": ["possessive", "of mine", "of yours"],
    "adverb clauses of time": ["as soon as", "adverb clause", "adverbial"],
    "present simple for future": ["timetable", "schedule"],
    "adverbs of frequency": ["frequency", "rarely", "seldom"],
    "past continuous": ["past continuous"],
    "reported speech (statements)": ["reported speech", "reported statement"],
    "reported speech (questions)": ["reported question", "wonder", "asked me"],
    "first conditional": ["first conditional", "conditional"],
    "future simple": ["will ", "future simple"],
    "comparative forms of adverbs": ["comparative adverb", "comparative"],
    "gerunds": ["v-ing", "gerund"],
    "to-infinitives": ["to-v", "infinitive"],
    "simple sentences": ["simple sentence"],
    "coordinating conjunctions": ["coordinating", "fanboys"],
    "yes/no questions": ["yes/no", "yes / no"],
    "wh-questions": ["wh-", "question word"],
    "prepositions of place": ["preposition"],
    "prepositions of time": ["preposition"],
}

PRON_PROBES = {
    "-al and -ous": ["-al", "-ous", "dangerous", "poisonous"],
    "-ese and -ee": ["-ese", "-ee", "vietnamese"],
    "sentence stress": ["sentence stress", "content word"],
    "intonation for making lists": ["intonation", "list"],
}


def grammar_covered(hay, target):
    t = target.lower()
    for key, probes in GRAMMAR_PROBES.items():
        if key in t:
            return any(p in hay for p in probes)
    # A phonemic or otherwise unprobed target: fall back to a loose word match.
    words = [w for w in re.findall(r"[a-z]{5,}", t)]
    return all(w in hay for w in words[:2]) if words else True


def pron_covered(hay, target):
    t = target.lower()
    for key, probes in PRON_PROBES.items():
        if key in t:
            return any(p in hay for p in probes)
    # A phoneme pair like "/ʊ/ and /uː/" — both symbols must be taught.
    symbols = re.findall(r"/[^/]+/", target)
    return all(s in hay for s in symbols) if symbols else True


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--unit", type=int, help="report one unit in full detail")
    ap.add_argument("--full", action="store_true", help="list every missing item")
    args = ap.parse_args()

    if not TARGETS.exists():
        raise SystemExit(f"missing {TARGETS.relative_to(ROOT)} — see curriculum/sgk/README.md")
    spec = json.loads(TARGETS.read_text(encoding="utf-8"))

    wanted = [u for u in spec["units"] if args.unit is None or u["unit"] == args.unit]
    if not wanted:
        raise SystemExit(f"no unit {args.unit} in the book")

    results = [check_unit(u, args.full) for u in wanted]
    detail = args.full or args.unit is not None

    print(f"\n{paint('Coverage against the official book', BOLD)} "
          f"{DIM}· {spec['source']['title']}{OFF}\n")

    hdr = f"{'':4} {'Unit':<28} {'Lexis':>11}  {'EvEng':<6} {'Block':<6} {'Gram':<5} {'Pron':<5}"
    print(paint(hdr, DIM))
    print(paint("-" * len(hdr), DIM))

    tot_got = tot_all = 0
    for r in results:
        tot_got += r["lexis_got"]
        tot_all += r["lexis_total"]
        pct = round(100 * r["lexis_got"] / r["lexis_total"])
        colour = RED if pct < 50 else (YELLOW if pct < 80 else GREEN)
        lex = paint(f"{r['lexis_got']:>3}/{r['lexis_total']:<3} {pct:>3}%", colour)
        tick = lambda ok: paint("  ok  ", GREEN) if ok else paint(" MISS ", RED)
        gram_ok = not r["missing_grammar"]
        print(f"U{r['unit']:02d}  {r['title']:<28} {lex}  "
              f"{tick(bool(r['ee_hit']))}{tick(r['block_hit'])}"
              f"{paint(' ok  ', GREEN) if gram_ok else paint('MISS ', RED)}"
              f"{paint(' ok  ', GREEN) if r['pron_hit'] else paint('MISS ', RED)}")

        if detail:
            print(f"     {DIM}Everyday English:{OFF} {r['ee_function']}"
                  f" — {paint('found: ' + r['ee_hit'], GREEN) if r['ee_hit'] else paint('no exponent present', RED)}")
            print(f"     {DIM}Content block the book has:{OFF} {r['culture_block']}")
            if r["extra_blocks"]:
                print(f"     {DIM}our Lesson 4 also has:{OFF} "
                      f"{paint('; '.join(r['extra_blocks']), YELLOW)} "
                      f"{DIM}— check by hand whether it does the same job{OFF}")
            else:
                print(f"     {paint('our Lesson 4 has no block beyond Everyday English', RED)}")
            for g in r["missing_grammar"]:
                print(f"     {paint('grammar not found:', RED)} {g}")
            if not r["pron_hit"]:
                print(f"     {paint('pronunciation target not found:', RED)} {r['pronunciation']}")
            if r["missing_lexis"]:
                print(f"     {DIM}missing lexis ({len(r['missing_lexis'])}):{OFF} "
                      f"{', '.join(r['missing_lexis'])}")
            print()

    print(paint("-" * len(hdr), DIM))
    pct = round(100 * tot_got / tot_all)
    print(f"{'':4} {'TOTAL':<28} {tot_got:>3}/{tot_all:<3} {pct:>3}%\n")

    ee_missing = sum(1 for r in results if not r["ee_hit"])
    blk_missing = sum(1 for r in results if not r["block_hit"])
    print(f"  Everyday English functions not covered: "
          f"{paint(str(ee_missing), RED if ee_missing else GREEN)} of {len(results)}")
    print(f"  Lesson 4s with no block beyond Everyday English: "
          f"{paint(str(blk_missing), RED if blk_missing else GREEN)} of {len(results)}")
    if not detail:
        print(f"\n  {DIM}Run with --full, or --unit N, to list every missing item.{OFF}")
    print()


if __name__ == "__main__":
    main()
