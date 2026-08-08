#!/usr/bin/env python3
"""Every vocabulary slot in every unit resolves to a real dictionary entry.

Run: python3 tools/check_dict.py

Checks, all fail-closed:
  1. every data/dict/*.json parses
  2. every headword in every unit's markdown table has an entry
  3. every entry has at least one sense with pos, en, vi and >= 2 examples
  4. every example actually contains the **bolded** target word
  5. no entry is orphaned (defined but never used by any unit)
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import importlib.util
spec = importlib.util.spec_from_file_location("b", ROOT / "tools" / "build.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)

REQ_SENSE = ("pos", "en", "vi")


def main() -> int:
    dict_dir = ROOT / "data" / "dict"
    if not dict_dir.is_dir():
        print(f"FAIL: no {dict_dir}")
        return 2

    entries, where = {}, {}
    for f in sorted(dict_dir.glob("unit-*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            print(f"FAIL: {f.name} is not valid JSON — {exc}")
            return 2
        for k, v in data.items():
            if k.startswith("_"):
                continue
            if k.lower() not in entries:
                entries[k.lower()] = v
                where[k.lower()] = f.name

    problems, used = [], set()
    slots = 0
    for md in sorted((ROOT / "units").glob("unit-*.md")):
        u = b.parse_unit(md)
        for w in u["vocab"]:
            slots += 1
            key = w["word"].lower()
            e = entries.get(key)
            if not e:
                problems.append(f"unit {u['nn']}: no dictionary entry for {w['word']!r}")
                continue
            used.add(key)
            senses = e.get("senses") or []
            if not senses:
                problems.append(f"{key!r}: no senses")
                continue
            for i, s in enumerate(senses, 1):
                for field in REQ_SENSE:
                    if not s.get(field):
                        problems.append(f"{key!r} sense {i}: missing {field}")
                egs = s.get("examples") or []
                if len(egs) < 2:
                    problems.append(f"{key!r} sense {i}: only {len(egs)} example(s), want >= 2")
                for eg in egs:
                    if "**" not in eg:
                        problems.append(f"{key!r} sense {i}: example has no bolded target — {eg[:48]!r}")

    orphans = sorted(set(entries) - used)
    for o in orphans:
        problems.append(f"{o!r} defined in {where[o]} but no unit uses it")

    if problems:
        print(f"FAIL: {len(problems)} problem(s)")
        for p in problems[:40]:
            print("  -", p)
        if len(problems) > 40:
            print(f"  … and {len(problems) - 40} more")
        return 1

    multi = sum(1 for e in entries.values() if len(e.get("senses", [])) > 1)
    forms = sum(1 for e in entries.values() if e.get("forms"))
    notes = sum(1 for e in entries.values() if e.get("note"))
    senses = sum(len(e.get("senses", [])) for e in entries.values())
    egs = sum(len(s.get("examples", [])) for e in entries.values() for s in e.get("senses", []))
    print(f"PASS: {slots} vocabulary slots all resolve · {len(entries)} distinct entries · "
          f"{senses} senses ({multi} words with 2+) · {egs} examples · "
          f"{forms} word-family blocks · {notes} usage notes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
