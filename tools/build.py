#!/usr/bin/env python3
"""Generate the English 8 static site from units/*.md.

    python3 tools/build.py            # write docs/
    python3 tools/build.py --check    # parse only, report counts, write nothing

Three levels, one page each:

    docs/index.html                        every unit
    docs/unit-NN/index.html                that unit's seven lessons, then
                                           the gated practice + test
    docs/unit-NN/lesson-M/index.html       one lesson: teaching blocks and
                                           its exercises, inline, in order

The ordering rule the site is built around: a lesson page never opens with
an exercise, and a unit page never places practice or test above its lesson
links. Lesson 7 ("Looking Back") is all checks in the source, so it is given
a real recap block first -- you should know what you are being checked on.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import sys
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "units"
OUT = ROOT / "docs"
ASSETS = Path(__file__).resolve().parent / "assets"

SITE = "English 8 — Global Success"
LESSONS = 7

RE_TITLE = re.compile(r"^#\s+Unit\s+(\d+)\s+—\s+(.+)$", re.M)
RE_VI = re.compile(r"^>\s*\*\*Bài\s+\d+\s*—\s*(.+?)\*\*\s*$", re.M)
RE_LESSON = re.compile(r"^##\s+Lesson\s+(\d)\s+—\s+(.+)$", re.M)
RE_BLOCK = re.compile(r"^###\s+(.+)$", re.M)
RE_TEACHES = re.compile(r"^##\s+What this unit teaches\s*$", re.M)
RE_AK = re.compile(r"^##\s+Answer Key\s*$", re.M)
RE_AK_ENTRY = re.compile(r"^\*\*(\d+\.\d+)\*\*\s*", re.M)
RE_STRAND = re.compile(r"^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*$", re.M)
RE_VOCAB_ROW = re.compile(
    r"^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(/[^|]*?)\s*\|\s*(.*?)\s*\|\s*(.+?)\s*\|\s*$", re.M)

BLANK = "\x00B%d\x00"


# ----------------------------------------------------------------- markdown --
def render(md_text: str) -> str:
    """Markdown -> HTML, with two corpus-specific corrections.

    1. Runs of underscores are fill-in-the-blank slots, not emphasis. Left
       alone, python-markdown turns "→ _______" into <strong><em>_</em></strong>
       and every gap in every exercise silently disappears (1014 of them).
    2. Dialogue turns are separate source lines inside one blockquote, so they
       collapse into a single paragraph. A markdown hard break is inserted
       before each new speaker -- and only there, because the source is
       hard-wrapped and a blanket nl2br would shred every prose paragraph.
    """
    holes: list[int] = []

    def stash(m):
        holes.append(len(m.group(0)))
        return BLANK % (len(holes) - 1)

    text = re.sub(r"_{3,}", stash, md_text)

    lines = text.split("\n")
    for i in range(len(lines) - 1):
        if lines[i].startswith(">") and re.match(r"^>\s*\*\*[^*]+:\*\*", lines[i + 1]):
            lines[i] += "  "
    text = "\n".join(lines)

    md = markdown.Markdown(extensions=["tables", "sane_lists"])
    out = md.convert(text)

    for i, n in enumerate(holes):
        out = out.replace(BLANK % i, f'<span class="blank" style="--w:{n}"></span>')
    out = re.sub(r"<li>\[ \]\s*", '<li class="task"><input type="checkbox"> ', out)
    out = re.sub(r"<li>\[[xX]\]\s*", '<li class="task"><input type="checkbox" checked> ', out)
    out = out.replace("<table>", '<div class="scroll"><table>').replace("</table>", "</table></div>")
    # Unit 1's markdown links out to the old standalone trainer file
    # (app/unit-01-vocab.html), which this site replaces with the practice
    # engine on the unit page. Point the callout at what now serves its
    # purpose instead of leaving a link that 404s.
    out = re.sub(r'href="\.\./app/unit-\d+-vocab\.html"', 'href="../index.html"', out)
    return out


def vocab_table(u) -> str:
    """The vocabulary table, rebuilt from parsed data rather than passed through.

    Two reasons not to just render the markdown table: every row needs a
    data-role marker so the parity checker can count what actually shipped,
    and every headword needs its own audio button. Rebuilding also pins the
    row count to the parse, so a table that loses a row loses it loudly.
    """
    rows = []
    for w in u["vocab"]:
        say = re.sub(r"\s*\(.*?\)\s*", " ", w["word"]).strip()
        rows.append(
            f'<tr data-role="vocab-row">'
            f'<td class="num">{w["n"]}</td>'
            f'<td><b>{e(w["word"])}</b> '
            f'<button class="speak" type="button" data-say="{e(say)}" '
            f'aria-label="Hear {e(say)}">🔊</button></td>'
            f'<td class="ipa">{e(w["ipa"])}</td>'
            f'<td>{e(w["pos"])}</td>'
            f'<td class="vi">{e(w["vi"])}</td></tr>')
    return ('<div class="scroll"><table><thead><tr>'
            '<th>#</th><th>Word</th><th>IPA</th><th>Type</th><th>Nghĩa tiếng Việt</th>'
            '</tr></thead><tbody>' + "".join(rows) + "</tbody></table></div>")


RE_FIRST_TABLE = re.compile(r'<div class="scroll"><table>.*?</table></div>', re.S)


def e(s) -> str:
    return html.escape(str(s), quote=True)


# -------------------------------------------------------------------- parse --
def parse_unit(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")

    m = RE_TITLE.search(text)
    if not m:
        raise SystemExit(f"{path.name}: no '# Unit N — Title' heading")
    num, title = int(m.group(1)), m.group(2).strip()
    vi = (RE_VI.search(text).group(1).strip() if RE_VI.search(text) else "")

    ak_at = RE_AK.search(text)
    ak_start = ak_at.start() if ak_at else len(text)

    # "What this unit teaches" strand table
    strands = []
    tm = RE_TEACHES.search(text)
    if tm:
        first_lesson = RE_LESSON.search(text)
        seg = text[tm.end():first_lesson.start() if first_lesson else ak_start]
        strands = [(a.strip(), b.strip()) for a, b in RE_STRAND.findall(seg)]

    # lessons
    marks = list(RE_LESSON.finditer(text))
    if len(marks) != LESSONS:
        raise SystemExit(f"{path.name}: {len(marks)} lessons, expected {LESSONS}")
    lessons = []
    for i, mk in enumerate(marks):
        start = mk.end()
        end = marks[i + 1].start() if i + 1 < len(marks) else ak_start
        body = text[start:end]
        heads = list(RE_BLOCK.finditer(body))
        intro = body[:heads[0].start()] if heads else body
        blocks = []
        for j, h in enumerate(heads):
            b_start = h.end()
            b_end = heads[j + 1].start() if j + 1 < len(heads) else len(body)
            head = h.group(1).strip()
            em = re.match(r"^(\d+\.\d+)\s+(.*)$", head)
            blocks.append({
                "kind": "exercise" if em else "teach",
                "id": em.group(1) if em else "",
                "title": em.group(2).strip() if em else head,
                "md": body[b_start:b_end].strip("\n"),
            })
        lessons.append({
            "n": int(mk.group(1)),
            "title": mk.group(2).strip(),
            "intro": intro.strip(),
            "blocks": blocks,
        })

    # answer key: **N.M** ... up to the next entry or heading
    answers = {}
    if ak_at:
        ak = text[ak_at.end():]
        hits = list(RE_AK_ENTRY.finditer(ak))
        for i, h in enumerate(hits):
            end = hits[i + 1].start() if i + 1 < len(hits) else len(ak)
            chunk = ak[h.end():end]
            chunk = re.split(r"^###\s+", chunk, maxsplit=1, flags=re.M)[0]
            answers[h.group(1)] = chunk.strip()

    # vocabulary: the numbered table whose third column is IPA
    vocab = []
    for n, word, ipa, pos, gloss in RE_VOCAB_ROW.findall(text[:ak_start]):
        if not ipa.startswith("/"):
            continue
        vocab.append({"n": int(n), "word": word.strip(), "ipa": ipa.strip(),
                      "pos": pos.strip(), "vi": gloss.strip()})

    return {"num": num, "nn": f"{num:02d}", "title": title, "vi": vi,
            "strands": strands, "lessons": lessons, "answers": answers,
            "vocab": vocab, "src": path.name}


def strand(u, key, default=""):
    for k, v in u["strands"]:
        if k.lower().startswith(key.lower()):
            return v
    return default


# ------------------------------------------------------------------ shell ----
def shell(*, title, depth, body, crumb, data=None, desc=""):
    up = "../" * depth
    crumb_html = "".join(
        f'<a href="{e(h)}">{e(t)}</a><i>›</i>' if h else f"<b>{e(t)}</b>"
        for t, h in crumb)
    data_tag = (f'<script id="page-data" type="application/json">'
                f'{json.dumps(data, ensure_ascii=False)}</script>' if data else "")
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="color-scheme" content="light dark">
<link rel="stylesheet" href="{up}assets/app.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><text y=%2226%22 font-size=%2226%22>📗</text></svg>">
</head>
<body>
<header class="top"><div class="shell">
  <a class="mark" href="{up}index.html"><b>English 8</b><span>Global Success</span></a>
  <nav class="crumb" aria-label="Breadcrumb">{crumb_html}</nav>
  <span class="sp"></span>
  <button class="iconbtn" id="themeBtn" type="button">◒ Auto</button>
</div></header>
<div class="shell"><main>
{body}
</main>
<footer class="foot">
  <p><b>English 8 — Global Success.</b> Original self-study material written against the
  Tiếng Anh 8 syllabus (NXB Giáo dục Việt Nam × Pearson, GDPT 2018). This site records
  structure and targets and carries our own exercises; it is not the textbook's text.</p>
  <p>Progress is stored in this browser only. Audio uses your device's speech voices —
  a good model of which word you are hearing, and not a reliable model of vowel length.</p>
</footer></div>
{data_tag}
<script src="{up}assets/app.js"></script>
</body>
</html>
"""


# ------------------------------------------------------------------- pages ---
def page_home(units) -> str:
    cards = []
    for u in units:
        cards.append(f"""    <a class="unitcard" href="unit-{u['nn']}/index.html" data-unit-progress="{u['nn']}">
      <div class="hd"><span class="num">{u['num']:02d}</span><h3>{e(u['title'])}</h3></div>
      <p class="vi">{e(u['vi'])}</p>
      <div class="tags">
        <span class="chip ipa">{e(strand(u, 'Pronunciation', '—'))}</span>
        <span class="chip gram">{e(strand(u, 'Grammar', '—'))}</span>
      </div>
      <div class="foot"><span data-progress-text>7 lessons</span><span class="bar"><i></i></span></div>
    </a>""")
    body = f"""  <header class="masthead">
    <p class="eyebrow">Self-study course · 12 units · 84 lessons</p>
    <h1>Tiếng Anh 8 — Global Success</h1>
    <p class="standfirst">Every unit runs the same seven lessons. Work through them in order:
    each lesson teaches, then practises what it just taught, and the unit test opens only
    once all seven are done.</p>
  </header>

  <div class="overview">
    <div class="stat"><span class="n" data-units-started>0</span><span class="k">units started</span></div>
    <div class="stat good"><span class="n" data-units-done>0</span><span class="k">units finished</span></div>
    <div class="stat hot"><span class="n" data-total-lessons>0</span><span class="k">lessons done</span></div>
    <div class="stat"><span class="n">12</span><span class="k">units available</span></div>
  </div>

  <div class="sectionhead"><h2>The twelve units</h2><span class="label">phonology in clay · grammar in teal</span></div>
  <div class="unitgrid">
{chr(10).join(cards)}
  </div>

  <div class="card"><h3>How the course is put together</h3>
    <p class="lede">Seven lessons per unit, always in this shape — material written for one
    slot transfers to the same slot in all twelve.</p>
    <div class="strands">
      <div><span class="k">Lesson 1</span><span class="v">Getting Started — opening dialogue</span></div>
      <div><span class="k">Lesson 2</span><span class="v">A Closer Look 1 — vocabulary + pronunciation</span></div>
      <div><span class="k">Lesson 3</span><span class="v">A Closer Look 2 — grammar</span></div>
      <div><span class="k">Lesson 4</span><span class="v">Communication — everyday English</span></div>
      <div><span class="k">Lesson 5</span><span class="v">Skills 1 — reading → speaking</span></div>
      <div><span class="k">Lesson 6</span><span class="v">Skills 2 — listening → writing</span></div>
      <div><span class="k">Lesson 7</span><span class="v">Looking Back — consolidation + project</span></div>
    </div>
  </div>"""
    return shell(title=SITE, depth=0, body=body, crumb=[("Course", "")],
                 desc="Self-study English 8 course: 12 units, 84 lessons, with practice and unit tests.")


def page_unit(u) -> str:
    rows = []
    for L in u["lessons"]:
        n_ex = sum(1 for b in L["blocks"] if b["kind"] == "exercise")
        n_teach = sum(1 for b in L["blocks"] if b["kind"] == "teach")
        if L["n"] == LESSONS:
            n_teach += 1                       # the recap the generator adds
        bits = []
        if n_teach:
            bits.append(f"{n_teach} teaching block" + ("s" if n_teach != 1 else ""))
        if n_ex:
            bits.append(f"{n_ex} exercise" + ("s" if n_ex != 1 else ""))
        rows.append(f"""    <a class="lesson" data-role="lesson-link" data-lesson="{L['n']}"
       href="lesson-{L['n']}/index.html">
      <span class="n">{L['n']}</span>
      <span class="body"><span class="t">{e(L['title'])}</span><span class="d">{e(' · '.join(bits))}</span></span>
      <span class="go" aria-hidden="true">→</span>
    </a>""")

    strands = "".join(
        f'<div><span class="k">{e(k)}</span><span class="v">{e(v)}</span></div>'
        for k, v in u["strands"])

    body = f"""  <header class="masthead">
    <p class="eyebrow">Unit {u['num']:02d} of 12</p>
    <h1>{e(u['title'])}</h1>
    <p class="vi">{e(u['vi'])}</p>
  </header>

  <div class="card"><h2>What this unit teaches</h2>
    <div class="strands">{strands}</div>
  </div>

  <div class="sectionhead"><h2>Lessons</h2><span class="label">work through these in order</span></div>
  <div class="lessons" data-role="lesson-index" data-unit-progress="{u['nn']}">
{chr(10).join(rows)}
    <div class="row" style="margin-top:.2rem">
      <span class="bar" style="max-width:14rem"><i></i></span>
      <span class="label" data-progress-text>7 lessons</span>
    </div>
  </div>

  <div class="sectionhead"><h2>Practice &amp; test</h2><span class="label">after the lessons</span></div>
  <div class="gate" id="gate">
    <p class="lock" id="gateLock"><span>🔒</span><div>Work through the lessons first.</div></p>
    <div class="gategrid">
      <div class="gatecard" data-role="practice">
        <h3>Practice this unit's words</h3>
        <p>All {len(u['vocab'])} words from Lesson 2, mixed: recognise the meaning, produce
        the word, and write what you hear. Wrong answers come straight back.</p>
        <button class="btn" id="startPractice" type="button" aria-disabled="true">Start practice</button>
      </div>
      <div class="gatecard" data-role="test">
        <h3>Unit test</h3>
        <p>Every word once, scored, no feedback until the end. Opens when all seven
        lessons are marked complete.</p>
        <button class="btn" id="startTest" type="button" aria-disabled="true">Take the test</button>
      </div>
    </div>
  </div>
  <div id="engine" hidden></div>
  <p class="note" id="ttsNote" hidden></p>"""

    return shell(title=f"Unit {u['num']:02d} — {u['title']} · {SITE}", depth=1, body=body,
                 crumb=[("Course", "../index.html"), (f"Unit {u['num']:02d}", "")],
                 data={"kind": "unit", "unit": u["nn"], "vocab": u["vocab"]},
                 desc=f"Unit {u['num']}: {u['title']}. Seven lessons, practice and a unit test.")


def recap_block(u) -> str:
    """Lesson 7 is all checks in the source. Open it with what is being checked.

    This is the one block the generator authors rather than renders: without
    it the consolidation lesson opens cold on exercise 7.1, which is both bad
    teaching and the one ordering rule this site is built to keep.
    """
    items = "".join(
        f'<div><span class="k">{e(k)}</span><span class="v">{e(v)}</span></div>'
        for k, v in u["strands"])
    return f"""  <section class="block" data-role="teach">
    <h2>Before you start — what this checks</h2>
    <p class="lede">Everything below is drawn from Lessons 1–6 of this unit. Skim these
    targets first; if one of them feels blank, go back to that lesson before answering.</p>
    <div class="strands">{items}</div>
  </section>"""


def page_lesson(u, L) -> str:
    parts = []
    if L["n"] == LESSONS:
        parts.append(recap_block(u))
    if L["intro"]:
        parts.append(f'  <section class="block" data-role="teach">\n'
                     f'    <div class="prose">{render(L["intro"])}</div>\n  </section>')

    for b in L["blocks"]:
        if b["kind"] == "teach":
            inner = render(b["md"])
            # The vocabulary block's table is swapped for the rebuilt one, so
            # every row carries its marker and its own audio button.
            if b["title"].lower().startswith("vocabulary") and u["vocab"]:
                inner, n = RE_FIRST_TABLE.subn(lambda _: vocab_table(u), inner, count=1)
                if n != 1:
                    raise SystemExit(
                        f"unit {u['nn']} lesson {L['n']}: vocabulary block has no table to replace")
            parts.append(f"""  <section class="block" data-role="teach">
    <h2>{e(b['title'])}</h2>
    <div class="prose">{inner}</div>
  </section>""")
        else:
            ans = u["answers"].get(b["id"])
            ans_html = ""
            if ans:
                ans_html = f"""
    <div class="answer" data-role="answer">
      <button type="button">Show answer</button>
      <div class="body prose" hidden>{render(ans)}</div>
    </div>"""
            parts.append(f"""  <section class="block ex" data-role="exercise" data-ex="{e(b['id'])}">
    <div class="exhead"><span class="exno">{e(b['id'])}</span><h2>{e(b['title'])}</h2></div>
    <div class="prose">{render(b['md'])}</div>{ans_html}
  </section>""")

    rail = "".join(
        f'<span class="cur" data-lesson="{i}">{i}</span>' if i == L["n"]
        else f'<a href="../lesson-{i}/index.html" data-lesson="{i}">{i}</a>'
        for i in range(1, LESSONS + 1))

    prev_l = (f'<a class="btn quiet" href="../lesson-{L["n"] - 1}/index.html">← Lesson {L["n"] - 1}</a>'
              if L["n"] > 1 else '<a class="btn quiet" href="../index.html">← Unit</a>')
    next_l = (f'<a class="btn" href="../lesson-{L["n"] + 1}/index.html">Lesson {L["n"] + 1} →</a>'
              if L["n"] < LESSONS else '<a class="btn" href="../index.html">Practice &amp; test →</a>')

    body = f"""  <div class="rail" aria-label="Lessons in this unit">{rail}</div>
  <header class="masthead">
    <p class="eyebrow">Unit {u['num']:02d} · {e(u['title'])} · Lesson {L['n']} of {LESSONS}</p>
    <h1>{e(L['title'])}</h1>
  </header>

{chr(10).join(parts)}

  <div class="pager">
    {prev_l}
    <button class="btn quiet" id="markDone" type="button">Mark lesson complete</button>
    <span class="sp"></span>
    {next_l}
  </div>"""

    return shell(title=f"Lesson {L['n']} — {L['title']} · Unit {u['num']:02d} · {SITE}",
                 depth=2, body=body,
                 crumb=[("Course", "../../index.html"),
                        (f"Unit {u['num']:02d}", "../index.html"),
                        (f"Lesson {L['n']}", "")],
                 data={"kind": "lesson", "unit": u["nn"], "lesson": L["n"],
                       "titles": {str(x["n"]): x["title"] for x in u["lessons"]}},
                 desc=f"Unit {u['num']} Lesson {L['n']}: {L['title']}.")


# -------------------------------------------------------------------- main ---
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="parse and report; write nothing")
    args = ap.parse_args()

    files = sorted(SRC.glob("unit-*.md"))
    if not files:
        print(f"FAIL: no unit markdown under {SRC}", file=sys.stderr)
        return 2
    units = [parse_unit(f) for f in files]

    tot_ex = sum(len([b for L in u["lessons"] for b in L["blocks"] if b["kind"] == "exercise"]) for u in units)
    tot_teach = sum(len([b for L in u["lessons"] for b in L["blocks"] if b["kind"] == "teach"]) for u in units)
    tot_ans = sum(len(u["answers"]) for u in units)
    tot_vocab = sum(len(u["vocab"]) for u in units)

    if args.check:
        for u in units:
            ex = len([b for L in u["lessons"] for b in L["blocks"] if b["kind"] == "exercise"])
            print(f"  unit {u['nn']}  {u['title'][:34]:36} lessons={len(u['lessons'])} "
                  f"ex={ex:3} answers={len(u['answers']):3} vocab={len(u['vocab']):3}")
        print(f"\n{len(units)} units · {tot_ex} exercises · {tot_teach} teaching blocks · "
              f"{tot_ans} answers · {tot_vocab} vocabulary rows")
        return 0

    # Rebuild the generated tree only. docs/ may legitimately hold hand-written
    # files (it does), so remove what we own by name rather than nuking docs/.
    OUT.mkdir(parents=True, exist_ok=True)
    for u in units:
        d = OUT / f"unit-{u['nn']}"
        if d.is_dir():
            shutil.rmtree(d)
    if (OUT / "assets").is_dir():
        shutil.rmtree(OUT / "assets")

    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    (OUT / "assets").mkdir(parents=True, exist_ok=True)
    for a in ASSETS.iterdir():
        shutil.copy2(a, OUT / "assets" / a.name)

    (OUT / "index.html").write_text(page_home(units), encoding="utf-8")
    pages = 1
    for u in units:
        d = OUT / f"unit-{u['nn']}"
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(page_unit(u), encoding="utf-8")
        pages += 1
        for L in u["lessons"]:
            ld = d / f"lesson-{L['n']}"
            ld.mkdir(parents=True, exist_ok=True)
            (ld / "index.html").write_text(page_lesson(u, L), encoding="utf-8")
            pages += 1

    print(f"built {pages} pages into {OUT.relative_to(ROOT)}/ — "
          f"{len(units)} units, {tot_ex} exercises, {tot_ans} answers, {tot_vocab} vocabulary rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
