#!/usr/bin/env python3
"""Build curriculum/sgk/index.jsonl — the lookup index over the recorded book.

`curriculum/sgk/` is 4,400 lines. Answering one question from it by reading it
is a wasted context window, and the failure mode is worse than the waste: an
agent that cannot afford to read the record stops consulting it and writes the
lesson from memory, which is how the site drifted behind the book in the first
place.

So the record gets the same treatment `research/ielts/` has. One JSON object per
addressable thing, each carrying the `file` and `sec` to open and the natural
words somebody would actually search for. Grep the index, open the one section
it names.

    python3 tools/index_sgk.py            # regenerate
    python3 tools/index_sgk.py --check    # report drift, write nothing

Generated from the record itself — headings and targets.json — so it cannot
disagree with what it indexes. Never hand-edit index.jsonl.
"""
import argparse
import json
import re
import sys
from pathlib import Path

SGK = Path(__file__).resolve().parent.parent / "curriculum" / "sgk"
OUT = SGK / "index.jsonl"

RE_H = re.compile(r"^(#{1,3})[ \t]+(.+?)[ \t]*$", re.M)
# "## 4 · Communication (book p. 32)" -> the section number and its name
RE_SEC = re.compile(r"^(\d+)[ \t]*·[ \t]*(.+)$")
RE_PAGES = re.compile(r"\(?book pp?\.[ \t]*([\d–—-]+)\)?")

# What a heading is about, by the word it leads with. The book's seven sections
# are fixed, so this table is closed rather than clever.
KIND = [
    ("getting started",  "getting-started"),
    ("a closer look 1",  "closer-look-1"),
    ("a closer look 2",  "closer-look-2"),
    ("communication",    "communication"),
    ("skills 1",         "skills-1"),
    ("skills 2",         "skills-2"),
    ("looking back",     "looking-back"),
    ("vocabulary",       "vocabulary"),
    ("pronunciation",    "pronunciation"),
    ("grammar",          "grammar"),
    ("everyday english", "everyday-english"),
    ("content block",    "content-block"),
    ("reading",          "reading"),
    ("speaking",         "speaking"),
    ("listening",        "listening"),
    ("writing",          "writing"),
    ("project",          "project"),
    ("now i can",        "now-i-can"),
]


def kind_of(title: str) -> str:
    low = title.lower()
    for lead, tag in KIND:
        if low.startswith(lead):
            return tag
    return "section"


def words(*bits) -> list:
    """Search terms: lower-cased, de-duplicated, order kept."""
    seen, out = set(), []
    for b in bits:
        for w in (b if isinstance(b, (list, tuple)) else [b]):
            w = re.sub(r"\s+", " ", str(w)).strip().lower()
            w = w.strip("*_`—–- ")
            if w and w not in seen:
                seen.add(w)
                out.append(w)
    return out


def headings(path: Path) -> list:
    text = path.read_text(encoding="utf-8")
    out = []
    for m in RE_H.finditer(text):
        out.append({"level": len(m.group(1)), "title": m.group(2).strip(),
                    "line": text[:m.start()].count("\n") + 1})
    return out


def rows() -> list:
    out = []
    targets = json.loads((SGK / "targets.json").read_text(encoding="utf-8"))
    by_unit = {u["unit"]: u for u in targets["units"]}

    # ---- one row per section of every unit ---------------------------------
    for path in sorted(SGK.glob("unit-*.md")):
        n = int(re.search(r"unit-(\d+)", path.name).group(1))
        t = by_unit.get(n, {})
        parent = ""
        for h in headings(path):
            if h["level"] == 1:
                continue
            title = h["title"]
            sec = RE_SEC.match(re.sub(r"\s*\(.*?\)\s*$", "", title))
            if h["level"] == 2:
                parent = title
            pages = RE_PAGES.search(title)
            out.append({
                "file": f"curriculum/sgk/{path.name}",
                "sec": title,
                "line": h["line"],
                "unit": n,
                "unit_title": t.get("title", ""),
                "section": int(sec.group(1)) if sec else None,
                "under": parent if h["level"] == 3 else None,
                "kind": kind_of(sec.group(2) if sec else title),
                "pages": pages.group(1) if pages else None,
                "tags": ["unit", "section", kind_of(sec.group(2) if sec else title)],
                "terms": words(title, t.get("title", ""), f"unit {n}"),
            })

        # ---- one row per named target, so a grep for the target lands -------
        # This is the half that answers "which unit teaches the past
        # continuous?" — a question the headings alone cannot answer, because
        # the heading says "A Closer Look 2" and nothing else.
        def target(kind, label, terms, extra=None):
            out.append({
                "file": f"curriculum/sgk/{path.name}", "sec": label, "line": None,
                "unit": n, "unit_title": t.get("title", ""), "section": None,
                "under": None, "kind": kind, "pages": None,
                "tags": ["unit", "target", kind],
                "terms": words(terms, f"unit {n}"),
                **(extra or {}),
            })

        if t.get("pronunciation"):
            target("pronunciation", f"Pronunciation — {t['pronunciation']}",
                   [t["pronunciation"], "pronunciation", "sounds"])
        for g in t.get("grammar", []):
            target("grammar", f"Grammar — {g}", [g, "grammar"])
        ee = t.get("everyday_english") or {}
        if ee.get("function"):
            target("everyday-english", f"Everyday English — {ee['function']}",
                   [ee["function"], "everyday english", "function", "speech act"]
                   + list(ee.get("exponents", [])),
                   {"exponents": ee.get("exponents", [])})
        if t.get("culture_block"):
            target("content-block", f"Communication content block — {t['culture_block']}",
                   [t["culture_block"], "content block", "culture", "communication"])
        if t.get("writing_genre"):
            target("writing", f"Writing genre — {t['writing_genre']}",
                   [t["writing_genre"], "writing genre"])
        if t.get("lexis"):
            target("lexis", f"Lexis — {len(t['lexis'])} words",
                   ["lexis", "vocabulary", "wordlist"] + list(t["lexis"]),
                   {"count": len(t["lexis"]), "lexis": t["lexis"]})

    # ---- the glossary, one row per unit block ------------------------------
    for h in headings(SGK / "glossary.md"):
        m = re.match(r"Unit (\d+)", h["title"])
        if h["level"] != 2 or not m:
            continue
        n = int(m.group(1))
        out.append({
            "file": "curriculum/sgk/glossary.md", "sec": h["title"], "line": h["line"],
            "unit": n, "unit_title": by_unit.get(n, {}).get("title", ""),
            "section": None, "under": None, "kind": "glossary", "pages": "136-139",
            "tags": ["glossary", "lexis", "ipa"],
            "terms": words(h["title"], "glossary", "headword", "ipa", "vietnamese",
                           "meaning", f"unit {n}"),
        })

    # ---- the four Reviews --------------------------------------------------
    parent = ""
    for h in headings(SGK / "reviews.md"):
        if h["level"] == 1:
            continue
        m = re.match(r"Review (\d+)", h["title"])
        if h["level"] == 2:
            parent = h["title"]
        pages = RE_PAGES.search(h["title"])
        out.append({
            "file": "curriculum/sgk/reviews.md", "sec": h["title"], "line": h["line"],
            "unit": None, "unit_title": None, "section": int(m.group(1)) if m else None,
            "under": parent if h["level"] == 3 else None,
            "kind": "review", "pages": pages.group(1) if pages else None,
            "tags": ["review", "cumulative"],
            "terms": words(h["title"], parent, "review", "cumulative", "revision"),
        })

    # ---- the book map ------------------------------------------------------
    for h in headings(SGK / "book-map.md"):
        if h["level"] == 1:
            continue
        out.append({
            "file": "curriculum/sgk/book-map.md", "sec": h["title"], "line": h["line"],
            "unit": None, "unit_title": None, "section": None, "under": None,
            "kind": "book-map", "pages": "4-7",
            "tags": ["book-map", "overview"],
            "terms": words(h["title"], "book map", "overview", "this unit includes"),
        })
    return out


def render(rs: list) -> str:
    return "".join(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n" for r in rs)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="report whether index.jsonl is current; write nothing")
    args = ap.parse_args()

    rs = rows()
    text = render(rs)
    if args.check:
        have = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if have != text:
            print("STALE: curriculum/sgk/index.jsonl is behind the record — "
                  "run `python3 tools/index_sgk.py`", file=sys.stderr)
            return 1
        print(f"PASS: index.jsonl is current — {len(rs)} rows")
        return 0

    OUT.write_text(text, encoding="utf-8")
    kinds = {}
    for r in rs:
        kinds[r["kind"]] = kinds.get(r["kind"], 0) + 1
    print(f"wrote {OUT.relative_to(SGK.parent.parent)} — {len(rs)} rows")
    print("      " + " · ".join(f"{k} {v}" for k, v in sorted(kinds.items())))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
