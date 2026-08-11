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
# Generated, but not part of the site: the IELTS evidence register is written
# for whoever maintains the course, not for the learner using it.
REGISTER = ROOT / "research" / "evidence-register.md"
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
BRIDGE = "\x00R%d\x00"

# --------------------------------------------------------------- IELTS bridge --
# A ":::bridge" directive is the one place a lesson may make a claim about IELTS.
# Everything the knowledge base insists on is carried by the *syntax*, so a
# bridge that omits its warrant cannot be authored: the marker and the source
# section are required attributes, and the generator prints both, glossed in
# plain English, underneath every block it emits. See research/ielts/09 §1.
RE_BRIDGE = re.compile(r"^:::[ \t]*bridge(?P<attrs>[^\n]*)\n(?P<body>.*?)\n:::[ \t]*$",
                       re.M | re.S)
RE_ATTR = re.compile(r'(\w+)="([^"]*)"')

BRIDGE_ATTRS = {"name", "trains", "marker", "src", "cefr"}
BRIDGE_REQUIRED = {"name", "trains", "marker", "src"}

# The only labels a bridge may train toward. The four Writing criteria and the
# four Speaking criteria are the descriptors' own names (`02`); Reading and
# Listening are skills, not scales, and are labelled as such.
TRAINS = {
    "Task Achievement":              ("w", "Writing Task 1 criterion"),
    "Task Response":                 ("w", "Writing Task 2 criterion"),
    "Coherence & Cohesion":          ("w", "Writing criterion"),
    "Lexical Resource":              ("b", "Writing and Speaking criterion"),
    "Grammatical Range & Accuracy":  ("b", "Writing and Speaking criterion"),
    "Fluency & Coherence":           ("s", "Speaking criterion"),
    "Pronunciation":                 ("s", "Speaking criterion"),
    "Reading":                       ("r", "Reading skill — not a scored criterion"),
    "Listening":                     ("r", "Listening skill — not a scored criterion"),
}
WRITING_CRITERIA = {k for k, (side, _) in TRAINS.items() if side in ("w", "b")}

# Marker glosses. `09` G2: anything resting on a weak marker must say so *at the
# point of use*. Printing the gloss is not optional, so it always does.
MARKERS = {
    "[Q]":    ("quoted", "quoted word-for-word from IELTS's own published material"),
    "[D]":    ("descriptor", "wording taken from the published band descriptors"),
    "[C]":    ("verified", "checked by a three-vote adversarial panel and sustained"),
    "[V]":    ("verified", "checked by a three-vote adversarial panel and sustained"),
    "[S]":    ("one source", "quoted from a single primary source, not independently checked"),
    "[S/NS]": ("one source, unsustained",
               "quoted from a single source — the matching verification did not hold. "
               "Weaker than a verified claim"),
    "[T2]":   ("research, not a rule",
               "a tendency measured in candidates. Never a rule of the test"),
    "[INF]":  ("our reasoning",
               "our own inference from the cited facts. No source states this link"),
    "[SPEC]": ("untested", "plausible and level-appropriate, but no source says it works"),
}
RE_MARKER = re.compile(r"^(\[[A-Z2/]+\])(?:\s+(\d+-\d+))?$")

KB_FILES = {
    "01": "01-exam-structure.md",   "02": "02-band-descriptors.md",
    "03": "03-listening.md",        "04": "04-reading.md",
    "05": "05-writing.md",          "06": "06-speaking.md",
    "07": "07-language-foundation.md", "08": "08-bridge-map.md",
    "09": "09-design-principles.md",
}
KB_TITLES = {
    "01": "the exam structure", "02": "the band descriptors", "03": "Listening",
    "04": "Reading", "05": "Writing", "06": "Speaking",
    "07": "what is trainable", "08": "the grade-8 bridge map",
    "09": "the build constitution",
}
RE_SRC = re.compile(r"^(0[1-9]) (§[\d.]+[a-z]?(?:[–-]§?[\d.]+[a-z]?)?)$")

CEFR = {"A1", "A2", "A2→B1", "B1", "B1→B2", "B2", "C1", "C2"}


def bridge_attrs(m) -> dict:
    return dict(RE_ATTR.findall(m.group("attrs")))


# ------------------------------------------------------------- typed tasks --
# `09` §1 Group C is the constitution's longest unenforced group, because until
# now there was nothing to enforce it against: every exercise outside the
# vocabulary trainer was a printed gap and a "Show answer" button. A ":::task"
# turns one exercise into a committed attempt marked by the published rules —
# the item type is named from the official inventory, the word limit is per
# task and printed, and the key is written in IELTS's own key grammar.
#
# The learner is not being told about the marking rules. They are being marked
# by them, which is the only version of that lesson that survives contact with
# a real test.
RE_TASK = re.compile(r"^:::[ \t]*task\b(?P<attrs>[^\n]*)\n(?P<body>.*?)\n:::[ \t]*$", re.M | re.S)
RE_AUDIO = re.compile(r"^:::[ \t]*audio\b(?P<attrs>[^\n]*)\n(?P<body>.*?)\n:::[ \t]*$", re.M | re.S)
# A thread declaration is attributes only — everything it renders comes from
# the strand's introduction — so unlike bridge and task its body is optional.
RE_THREAD = re.compile(r"^:::[ \t]*thread\b(?P<attrs>[^\n]*)\n(?P<body>.*?)"
                       r"\n?:::[ \t]*$", re.M | re.S)

# One pass over all of them, so a block's widgets come out in source order and
# a misspelled directive name (":::taskk") fails to match instead of matching
# ":::task" with the rest silently dropped.
RE_DIRECTIVE = re.compile(
    r"^:::[ \t]*(?P<kind>task|audio|write|clock|thread|passage)\b(?P<attrs>[^\n]*)\n"
    r"(?P<body>.*?)\n?:::[ \t]*$", re.M | re.S)
WIDGET = "\x00W%d\x00"

TASK_ATTRS = {"type", "skill", "words", "ask", "either", "opts"}
TASK_REQUIRED = {"type", "skill"}

# The official inventories, verbatim from the two format pages: Listening names
# six categories (`03` §3 **[C]** 3-0), Reading eleven (`04` §3 **[C]** 3-0).
# Both were adversarially tested against longer proposed lists and the longer
# lists were not sustained, so these are the closed sets a task may name.
LISTENING_TYPES = {
    "multiple-choice":     "Multiple choice",
    "matching":            "Matching",
    "labelling":           "Plan/map/diagram labelling",
    "completion":          "Form/note/table/flow-chart/summary completion",
    "sentence-completion": "Sentence completion",
    "short-answer":        "Short-answer questions",
}
READING_TYPES = {
    "multiple-choice":           "Multiple choice",
    "true-false-not-given":      "True/False/Not given",
    "yes-no-not-given":          "Yes/No/Not given",
    "matching-information":      "Matching information",
    "matching-headings":         "Matching headings",
    "matching-features":         "Matching features",
    "matching-sentence-endings": "Matching sentence endings",
    "sentence-completion":       "Sentence completion",
    "completion":                "Summary/note/table/flow-chart completion",
    "diagram-completion":        "Diagram label completion",
    "short-answer":              "Short-answer questions",
}
# A grade-8 grammar drill is not an IELTS item and must never be dressed as
# one. It is still marked — by the same engine, minus the test's own rules,
# which do not apply to it. The one exception carries its own warrant:
# synonym search under search conditions is named auto-scorable upstream
# (`04` §8.3), so it is a course drill with a citation rather than a fiction.
COURSE_TYPES = {
    "gap-fill":        "Gap-fill",
    "choice":          "Choose the right one",
    "short-answer":    "Short answer",
    "sort":            "Sort into groups",
    "synonym-search":  "Synonym search against the clock",
}
TASK_TYPES = {"listening": LISTENING_TYPES, "reading": READING_TYPES, "course": COURSE_TYPES}

# Types whose answers are written rather than chosen carry a word limit, and
# `03` §4 makes it per task and printed on the task — never a repo-wide
# constant. Exceeding it forfeits the mark outright **[C]** 3-0.
NEEDS_LIMIT = {"completion", "sentence-completion", "short-answer", "diagram-completion"}

WORDS_IN_ENGLISH = {"1": "ONE WORD", "2": "TWO WORDS", "3": "THREE WORDS"}

# Types the learner picks from a fixed set rather than typing. The widget
# differs; the marking does not.
PICK_SETS = {
    "true-false-not-given": ["T", "F", "NG"],
    "yes-no-not-given":     ["YES", "NO", "NG"],
}

RE_ITEM = re.compile(
    r"^[-*][ \t]+(?P<prompt>.+?)[ \t]+=[ \t]+(?P<key>[^~\n]+?)"
    r"(?:[ \t]+~[ \t]+(?P<why>.+))?$", re.M)
RE_BULLET = re.compile(r"^[-*][ \t]+\S", re.M)
# Option text runs to the next marker rather than to the next "(", so an
# option may contain brackets of its own: "(a) Teenagers (aged 13-19)".
RE_MCQ_OPT = re.compile(r"\((?P<letter>[a-z])\)[ \t]*(?P<text>.*?)"
                        r"(?=\([a-z]\)|$)")


def word_limit_text(words: str) -> str:
    """The instruction line, in IELTS's own wording.

    The official sample tasks read "Write NO MORE THAN THREE WORDS AND/OR A
    NUMBER for each answer" and "Write NO MORE THAN TWO WORDS for each answer"
    **[Q]** (`03` §4). Printing our own paraphrase would be a small lie about
    what the learner will actually see.
    """
    n, _, num = words.partition("+")
    out = f"Write <b>NO MORE THAN {WORDS_IN_ENGLISH[n]}"
    if num:
        out += " AND/OR A NUMBER"
    return out + "</b> for each answer."


def parse_task(m) -> dict:
    return parse_task_body(dict(RE_ATTR.findall(m.group("attrs"))), m.group("body"))


def parse_task_body(a: dict, body: str) -> dict:
    """One :::task directive -> its attributes and its items.

    An item is one line: the prompt, ` = `, the key in official key grammar,
    and optionally ` ~ ` and the reason. Keeping key and prompt on one line is
    what lets the generator author the answer-key entry from the same source
    the widget is built from, so the two cannot drift apart.
    """
    # A fixed option set shared by every item — "S|C", "/ʊə/|/ɔɪ/". Written
    # once on the task rather than repeated on twelve lines.
    shared = [x.strip() for x in a["opts"].split("|")] if a.get("opts") else None
    items = []
    for im in RE_ITEM.finditer(body):
        prompt, key = im.group("prompt").strip(), im.group("key").strip()
        item = {"q": prompt, "key": key}
        if im.group("why"):
            item["why"] = im.group("why").strip()
        if not shared and RE_MCQ_OPT.search(prompt):
            # Inline "(a) … (b) … (c) …", the layout the official sample tasks
            # use. Everything before the first marker is the stem.
            opts = [(o.group("letter"), o.group("text").strip())
                    for o in RE_MCQ_OPT.finditer(prompt)]
            item["q"] = prompt[:prompt.index("(" + opts[0][0] + ")")].strip()
            item["opts"] = [{"k": k, "t": t} for k, t in opts]
        elif a.get("type") in PICK_SETS:
            item["opts"] = [{"k": k, "t": k} for k in PICK_SETS[a["type"]]]
        elif shared:
            item["opts"] = [{"k": k, "t": k} for k in shared]
        # A gap at the END of a picked-answer prompt is left-over furniture —
        # "sure of yourself → ____" with buttons under it. A gap in the MIDDLE
        # is the question: "The sale ___ on 15 September" needs to show where
        # the word goes, or the options have nothing to attach to.
        if item.get("opts"):
            item["q"] = re.sub(r"\s*(→|->)?\s*_{3,}\s*$", "", item["q"]).strip()
            item["opts"] = [{"k": o["k"], "t": inline(o["t"])} for o in item["opts"]]
        # Prompts are escaped and their **bold**/*italic* honoured here rather
        # than in the browser: a pronunciation item is written "t**ou**rist"
        # and the marked-up syllable is the whole point of the question.
        item["q"] = inline(item["q"])
        if item.get("why"):
            item["why"] = inline(item["why"])
        items.append(item)
    a["items"] = items
    # A bullet that does not parse is a question the learner never sees, and
    # silence is the worst possible way to report it. Counted rather than
    # matched so a mistyped separator ("second___= two") is caught too.
    a["bullets"] = len(RE_BULLET.findall(body))
    return a


def task_payload(u, lesson, ex_id, a: dict, idx: int = 0) -> dict:
    """What the browser needs to run and mark one task.

    `conf` is not a flag the author sets. `03` §6.6 is the one listening
    finding with an effect size attached, and `09` C10 requires the rating on
    *every* listening item — so it is structural here rather than optional,
    and no unit can quietly ship a listening set without it.
    """
    return {
        # The index keeps two tasks in one exercise from sharing a DOM id,
        # which would leave the second inert: querySelector returns the first.
        "id": f"{u['nn']}-{lesson}-{ex_id}-{idx + 1}",
        "ex": ex_id,
        "skill": a["skill"],
        "type": a["type"],
        "words": a.get("words", ""),
        "either": a.get("either", ""),
        "conf": a["skill"] == "listening",
        "items": a["items"],
    }


# The rules a learner is marked by, printed before the task rather than after
# it. `09` C5 requires this: silent leniency on spelling teaches the opposite
# of what the test does, and a rule discovered at the moment it costs you a
# mark has been taught too late.
MARKING_RULES = (
    "<li>One mark each. Nothing is part-marked.</li>"
    "<li>Spelling and grammar mistakes lose the mark.</li>"
    "<li>British and American spellings are both accepted.</li>"
    "<li>A hyphenated word counts as one word.</li>"
    "<li>Two answers in one gap score <b>zero</b>, even if one of them is right.</li>")

# The subset that still applies when the answer is chosen rather than written.
PICK_RULES = ("<li>One mark each. Nothing is part-marked.</li>"
              "<li>One answer per item — a second one scores zero.</li>")


def task_html(p: dict, a: dict) -> str:
    """The task shell. Items, inputs and marking are the browser's job.

    The instruction block is generated from the type and the word limit, so an
    author cannot ship a completion task whose limit is only in their head.
    """
    types = TASK_TYPES[p["skill"]]
    label = types.get(p["type"], p["type"])
    # Rules about *writing* an answer are noise on a task where the answer is
    # picked from buttons. Printing them anyway is how a rules box stops being
    # read.
    typed = any(not it.get("opts") for it in p["items"])
    if p["skill"] == "course":
        head = (f'<span class="t-k">Marked</span>'
                f'<span class="t-t">{e(label)}</span>')
        rules = ("<li>Spelling counts.</li>"
                 "<li>British and American spellings are both accepted.</li>"
                 ) if typed else "<li>One mark each. Nothing is part-marked.</li>"
    else:
        head = (f'<span class="t-k">{"Listening" if p["skill"] == "listening" else "Reading"}'
                f'</span><span class="t-t">{e(label)}</span>')
        rules = MARKING_RULES if typed else PICK_RULES
    limit = (f'<p class="t-lim">{word_limit_text(p["words"])}</p>' if p.get("words") else "")
    ask = f'<p class="t-ask">{inline(a["ask"])}</p>' if a.get("ask") else ""
    conf = ('<p class="t-conf">Mark <b>sure</b> or <b>not sure</b> next to each answer '
            '<i>before</i> you check, so you can see whether your <b>sure</b> answers '
            'really are right more often.</p>') if p["conf"] else ""
    return (f'<div class="task" data-role="task" data-task="{e(p["id"])}">'
            f'<div class="t-h">{head}</div>'
            f'{ask}{limit}'
            f'<ul class="t-rules">{rules}</ul>'
            f'{conf}'
            f'<div class="t-items"></div>'
            f'<div class="t-foot"><button class="btn t-check" type="button">Check answers</button>'
            f'<span class="t-score" role="status"></span></div>'
            f'</div>')


def task_answer_html(p: dict) -> str:
    """The answer-key entry, authored by the generator from the task itself.

    The hand-written key and the widget's key were two copies of one fact, and
    two copies drift. This makes the exercise the single source: change the
    key and the printed answers change with it, or the build fails because the
    exercise has both.
    """
    rows = []
    for it in p["items"]:
        why = f' <i>({it["why"]})</i>' if it.get("why") else ""
        rows.append(f'<li><b>{e(it["key"])}</b>{why}</li>')
    return f'<ol class="t-key">{"".join(rows)}</ol>'


# ------------------------------------------------------------------ audio ---
# `03` §1.1 and §4.2, both **[Q]**/**[C]**: the orientation is spoken and *not*
# written on the paper, there is a fixed preview window before the questions,
# the recording is played once, and computer-delivered means two minutes of
# review rather than ten minutes of transfer. Printing the script above the
# questions — which is what all twelve units did — removes the task.
AUDIO_ATTRS = {"orientation", "mode", "preview", "review"}
AUDIO_REQUIRED = {"orientation", "mode"}
AUDIO_MODES = {"computer", "paper"}


def audio_payload(u, lesson, a: dict, body: str, idx: int = 0) -> dict:
    return {
        "id": f"{u['nn']}-{lesson}-{idx + 1}",
        "mode": a["mode"],
        "orientation": a["orientation"],
        "preview": int(a.get("preview", "30")),
        "review": int(a.get("review", "120")),
        "script": [ln.strip() for ln in body.strip().split("\n\n") if ln.strip()],
    }


def audio_html(p: dict) -> str:
    timing = ("Answer <b>as you listen</b>. You then have <b>two minutes</b> to check "
              "what you wrote."
              if p["mode"] == "computer" else
              "Answer as you listen, then you get <b>ten minutes</b> to copy your "
              "answers out neatly.")
    return (f'<div class="player" data-role="audio" data-audio="{e(p["id"])}">'
            f'<div class="p-h"><span class="p-k">Listening</span>'
            f'<span class="p-t">Plays once</span></div>'
            f'<p class="p-mode">{timing}</p>'
            f'<p class="p-say">First you hear a short spoken introduction — it is '
            f'<b>not written down</b>, so listen to it. Then you get '
            f'<b>{p["preview"]} seconds</b> to read the questions, and then the '
            f'recording plays <b>once</b>.</p>'
            f'<div class="p-ctl"><button class="btn p-start" type="button">Start</button>'
            f'<span class="p-state" role="status"></span></div>'
            f'<div class="p-note"><b>The voice is your device\'s speech synthesiser.</b> '
            f'It says the words clearly, but it is not a real speaker: no accent range, '
            f'and none of the run-together sounds of natural speech.</div>'
            f'<div class="p-script" hidden><h4>Script</h4>'
            + "".join(f"<p>{inline(ln)}</p>" for ln in p["script"]) +
            f'</div></div>')


# ------------------------------------------------------------------ write ---
# Writing was the one skill that stayed a printed worksheet: a model, a plan
# table, a list of tick-boxes and six blank underscore lines. Everything the
# other three directives exist to do — commit the attempt, check it by a
# published rule, remember it — stopped at the writing task, and the `:::thread`
# strand beside it asked the learner to type "supplied _ of _" about a paragraph
# the page had never seen.
#
# `09` **E8** is explicit that a self-assessment is a prompt and never a
# measure, and must be *paired with an objective anchor*; `09` §4.4 is why —
# learners cannot self-assess accurately. So this directive keeps the
# checklist, and puts a machine behind every line of it that a machine can
# honestly decide.
#
# What may be decided is bounded by `09` **D9** and §5.3, the defensible set:
# obligatory-context accuracy on named structures, error-free sentence density,
# and the presence or absence of *named discourse moves*. Closed-list matching
# and a word count are inside it. A holistic judgement, a score, a percentage
# and a band are outside it — **A2**, **D3** — and nothing here computes one.
# The live word count is `09` **C9**'s, the one Writing affordance the real
# screen has that this course did not.
WRITE_ATTRS = {"words", "ask", "trains", "genre"}
WRITE_REQUIRED = {"words", "ask", "trains"}
RE_WORDS_RANGE = re.compile(r"^(\d{2,4})-(\d{2,4})$")

# One checklist line: the text, and optionally ` ~ ` and the check that decides
# it. A line with no check keeps its tick-box, honestly — "a topic sentence and
# a closing sentence" is not decidable by counting, and pretending otherwise
# would be exactly the overclaim the knowledge base blocks.
RE_CHECK_LINE = re.compile(r"^[-*][ \t]+\[[ xX]?\][ \t]*(?P<text>.+?)"
                           r"(?:[ \t]+~[ \t]+(?P<check>[a-z]+(?::\S+)?(?:[ \t]+.+)?))?$", re.M)

# The check vocabulary. Deliberately small: every one of these is exact on the
# learner's own text, so the panel never has to guess.
#   words          the word count falls inside the declared range
#   vocab:N        at least N distinct headwords from this unit's table
#   any:N a/b/c    at least N hits in total from a closed list
#   distinct:N …   at least N *different* members of that list
#   all a/b/c      every member present
#   none a/b/c     no member present
#   para:N         exactly N paragraphs, and no bullet list
#   paras:N        at least N paragraphs
#   re:N pattern   at least N matches of a literal pattern
CHECK_KINDS = {"words", "vocab", "any", "distinct", "all", "none", "para", "paras", "re"}


def parse_check(spec: str) -> dict:
    """` ~ any:3 always/usually/often` -> {kind, n, list}."""
    head, _, rest = spec.strip().partition(" ")
    kind, _, n = head.partition(":")
    if kind not in CHECK_KINDS:
        raise SystemExit(f"write: unknown checklist check {kind!r}")
    c: dict = {"k": kind}
    if n:
        c["n"] = int(n)
    rest = rest.strip()
    if kind in ("any", "distinct", "all", "none"):
        if not rest:
            raise SystemExit(f"write: {kind} needs a list — '{kind} a/b/c'")
        c["l"] = [x.strip().lower() for x in rest.split("/") if x.strip()]
    elif kind == "re":
        if not rest:
            raise SystemExit("write: re needs a pattern")
        c["p"] = rest
    return c


def word_forms(headword: str) -> list:
    """Every written form of one vocabulary item that should count as a hit.

    The dictionary's word-family block already holds the derived forms an
    author wrote by hand (*deliver* under *delivery*); regular inflections are
    generated, because a learner who wrote "delivers" has used the word.
    """
    entry = DICT.get(headword.lower()) or {}
    base = [headword.lower()] + [f["w"].lower() for f in entry.get("forms") or []]
    out = set()
    for raw in base:
        for w in _optional(raw):
            out.add(w)
            # Which word of a phrase carries the inflection is not decidable
            # here: "shopping centre" takes it on the last word, "take up" and
            # "pick fruit" on the first. Every position is varied instead. The
            # extra strings are not words and match nothing.
            parts = w.split(" ")
            for i, part in enumerate(parts):
                for form in _inflect(part):
                    out.add(" ".join(parts[:i] + [form] + parts[i + 1:]))
    return sorted(out)


def _optional(w: str) -> list:
    """`hang out (with)` -> both `hang out` and `hang out with`.

    The vocabulary tables mark an optional particle in brackets, the same way
    the answer keys mark an optional word. Matched literally, the bracketed
    form never appears in anyone's writing and the item could not be credited.
    """
    if "(" not in w:
        return [w]
    bare = RE_WS.sub(" ", re.sub(r"\s*\([^)]*\)", "", w)).strip()
    full = RE_WS.sub(" ", w.replace("(", "").replace(")", "")).strip()
    return sorted({bare, full})


RE_WS = re.compile(r"\s+")
VOWELS = "aeiou"
# Irregular past and participle forms for the verbs the vocabulary tables
# actually contain. A regular generator turns "take up" into "take uped", and
# the learner who wrote "I have taken up cooking" gets nothing for it.
IRREGULAR = {
    "take": ["took", "taken"],      "give": ["gave", "given"],
    "make": ["made"],               "get": ["got", "gotten"],
    "keep": ["kept"],               "leave": ["left"],
    "hang": ["hung"],               "feed": ["fed"],
    "grow": ["grew", "grown"],      "build": ["built"],
    "wear": ["wore", "worn"],       "blow": ["blew", "blown"],
    "hold": ["held"],               "sell": ["sold"],
    "rise": ["rose", "risen"],      "fly": ["flew", "flown"],
    "ride": ["rode", "ridden"],     "spend": ["spent"],
    "run": ["ran"],                 "cut": ["cut"],
    "put": ["put"],                 "come": ["came"],
    "become": ["became"],           "lose": ["lost"],
    "find": ["found"],              "break": ["broke", "broken"],
    "throw": ["threw", "thrown"],   "deal": ["dealt"],
}


def _inflect(w: str) -> set:
    """Regular written forms of one word, plus any irregular ones.

    Over-generation is cheap here and under-generation is not: a form that is
    not a word ("vendores") matches nothing, while a missing "shopping" costs
    the learner a vocabulary item they actually used.
    """
    out = {w, w + "s", w + "es", w + "ed", w + "ing"}
    out |= set(IRREGULAR.get(w, []))
    if w.endswith("e"):
        out |= {w[:-1] + "ed", w[:-1] + "ing"}
    if w.endswith("y") and len(w) > 2 and w[-2] not in VOWELS:
        out |= {w[:-1] + "ies", w[:-1] + "ied"}
    # shop -> shopped, shopping. A final consonant after a single vowel doubles.
    if (len(w) >= 3 and w[-1] not in VOWELS + "wxy"
            and w[-2] in VOWELS and w[-3] not in VOWELS):
        out |= {w + w[-1] + "ed", w + w[-1] + "ing"}
    return out


def write_payload(u, lesson, a: dict, body: str, idx: int = 0) -> dict:
    lo, hi = RE_WORDS_RANGE.match(a["words"]).groups()
    items = []
    for m in RE_CHECK_LINE.finditer(body):
        it: dict = {"t": inline(m.group("text").strip())}
        if m.group("check"):
            it["c"] = parse_check(m.group("check"))
        items.append(it)
    return {
        "id": f"{u['nn']}-{lesson}-w{idx + 1}",
        "lo": int(lo), "hi": int(hi),
        "items": items,
        # Carried per task rather than per page: the vocabulary check has to
        # mean "this unit's table", and a lesson page knows nothing else.
        "vocab": {w["word"]: word_forms(w["word"]) for w in u["vocab"]},
    }


def write_html(p: dict, a: dict) -> str:
    n_auto = sum(1 for it in p["items"] if it.get("c"))
    # A counted line's box is not the learner's to tick: it is set from what
    # they wrote, and a box you can tick yourself is the tick-box this replaced.
    auto = ' data-auto="1"'
    rows = "".join(
        f'<li class="w-i" data-i="{i}"{auto if it.get("c") else ""}>'
        f'<input type="checkbox"{" disabled" if it.get("c") else ""}>'
        f'<span class="w-t">{it["t"]}</span><span class="w-f" role="status"></span></li>'
        for i, it in enumerate(p["items"]))
    return (
        f'<div class="write" data-role="write" data-write="{e(p["id"])}">'
        f'<div class="w-h"><span class="w-k">Write it here</span></div>'
        f'<p class="w-ask">{inline(a["ask"])}</p>'
        f'<textarea class="w-box" rows="10" spellcheck="false" '
        f'placeholder="Write your {p["lo"]}–{p["hi"]} words here. It is saved as you type."'
        f'></textarea>'
        f'<div class="w-bar"><span class="w-n" role="status"></span>'
        f'<span class="w-r">{p["lo"]}–{p["hi"]} words</span></div>'
        f'<h4 class="w-lh">Before you finish</h4>'
        f'<ul class="w-list">{rows}</ul>'
        f'<p class="w-note"><b>{n_auto} of these {len(p["items"])} are checked for you</b>, '
        f'from what you actually wrote. The rest you tick yourself — they need your '
        f'judgement, not a count. Nothing here gives your writing a score.</p>'
        f'<p class="w-note quiet">Trying longer sentences and newer words usually means '
        f'more mistakes for a while. That is normal at this stage — keep going.</p>'
        f'</div>')


# ------------------------------------------------------------------ clock ---
# `09` **C7**: the Reading tool runs *one clock covering everything*, including
# the time spent writing the answers down — `04` §1.1. It was the last Group C
# rule the course left to the learner's own discretion, in prose ("give
# yourself three minutes"), which is the arrangement every other rule here was
# built to replace. One clock per reading block, and it covers every reading
# task on the page.
CLOCK_ATTRS = {"mins", "for"}
CLOCK_REQUIRED = {"mins"}


def clock_payload(u, lesson, a: dict, idx: int = 0) -> dict:
    return {"id": f"{u['nn']}-{lesson}-c{idx + 1}",
            "secs": int(round(float(a["mins"]) * 60)),
            "for": a.get("for", "")}


def clock_html(p: dict) -> str:
    mins = p["secs"] / 60
    shown = f"{mins:g}"
    return (f'<div class="clock" data-role="clock" data-clock="{e(p["id"])}">'
            f'<div class="c-h"><span class="c-k">Reading</span>'
            f'<span class="c-t">One clock — {e(shown)} minutes</span></div>'
            f'<p class="c-say">{inline(p["for"]) + " " if p["for"] else ""}'
            f'The clock covers <b>everything</b>: reading the text, finding the answers '
            f'and typing them in. It does not stop while you type, and there is no extra '
            f'time at the end.</p>'
            f'<div class="c-ctl"><button class="btn c-start" type="button">Start reading</button>'
            f'<span class="c-state" role="status"></span></div>'
            f'</div>')


# --------------------------------------------------------------- passages ---
# `09` **C9**: the reading screen's affordances are part of the test, not
# decoration — `01` §9.1, §12.7 names colour highlighting, on-screen notes, a
# question navigation bar and a review flag. Writing's half of C9, the live
# word count, shipped with `:::write`; the reading half was a blockquote with
# nothing on it.
#
# The directive also fixes a defect that a blockquote could not fix. A
# paragraph-referencing question type — matching headings, matching
# information, matching features — asks "which paragraph", and the passage has
# to *have* labelled paragraphs for that question to be answerable the way the
# type is answered. Unit 03's lesson said "The report has six paragraphs" and
# unit 06's said "five paragraphs, **A** to **E**, in the order they are
# printed"; neither page printed a single label, so under a clock the learner
# counted paragraphs by hand before they could start. `label` makes the label
# real, and the gate makes it required wherever a task refers to one.
PASSAGE_ATTRS = {"label", "kind", "title"}

# A label scheme is a starting token: "A" letters the paragraphs A, B, C…,
# "1" numbers them. Anything else is rejected by the gate rather than guessed.
PASSAGE_LABELS = {"A": lambda i: chr(ord("A") + i), "1": lambda i: str(i + 1)}
RE_P_OPEN = re.compile(r"<p>")


def passage_labels(a: dict, body: str) -> list:
    """The labels a passage prints, derived rather than authored.

    The gate needs these without building a page, so the count comes from the
    rendered paragraphs — which is what the reader sees — rather than from the
    source, which for an interview is one blockquote and twelve turns.
    """
    scheme = PASSAGE_LABELS.get(a.get("label", ""))
    if not scheme:
        return []
    return [scheme(i) for i in range(len(RE_P_OPEN.findall(render(body))))]


def passage_block(u, lesson, a: dict, body: str, idx: int = 0):
    """The passage, its paragraph labels, and the reading tools that sit on it.

    The body keeps whatever markdown it was written in — the twelve passages
    are blockquotes, and one of them is an interview whose speaker turns depend
    on that — so this renders first and counts the paragraphs it actually
    produced, rather than counting the source and hoping the two agree.

    The labels are generated from that count rather than authored, so a
    paragraph added to the text cannot leave the lettering behind: the same
    reason the answer key is generated from the task and the strand check from
    the strand's introduction.
    """
    inner = render(body)
    n = len(RE_P_OPEN.findall(inner))
    labels = passage_labels(a, body)
    p = {"id": f"{u['nn']}-{lesson}-p{idx + 1}", "label": a.get("label", ""),
         "paras": n, "labels": labels}

    if labels:
        seq = iter(labels)

        def label(_m):
            lb = next(seq)
            return f'<p class="pg-p"><span class="pg-l" aria-hidden="true">{e(lb)}</span>'

        inner = RE_P_OPEN.sub(label, inner)
    title = a.get("title", "")
    kind = a.get("kind", "Reading passage")
    note = ("Paragraphs are lettered — the questions below refer to them by letter. "
            "Select any words to highlight them; select a highlight to take it off."
            if p["label"] == "A" else
            "Paragraphs are numbered — the questions below refer to them by number. "
            "Select any words to highlight them; select a highlight to take it off."
            if p["label"] else
            "Select any words to highlight them; select a highlight to take it off.")
    lab = ' data-labelled="1"' if p["labels"] else ""
    tt = f'<span class="pg-t">{inline(title)}</span>' if title else ""
    html = (f'<div class="pg" data-role="passage" data-passage="{e(p["id"])}"{lab}>'
            f'<div class="pg-h"><span class="pg-k">{e(kind)}</span>{tt}'
            f'<span class="pg-sp"></span>'
            f'<button class="pg-b" type="button" data-pg="note" aria-expanded="false">Notes</button>'
            f'<button class="pg-b" type="button" data-pg="clear">Clear marks</button>'
            f'</div>'
            f'<div class="pg-body" data-pg="body">{inner}</div>'
            f'<p class="pg-say">{e(note)} Your highlights and notes are kept on this '
            f'device, and the clock does not stop for either.</p>'
            f'<div class="pg-note" data-pg="notepad" hidden>'
            f'<label class="pg-nl" for="nt-{e(p["id"])}">On-screen notes</label>'
            f'<textarea id="nt-{e(p["id"])}" class="pg-ta" rows="4" '
            f'placeholder="Notes stay with this passage. Nothing here is marked."></textarea>'
            f'</div>'
            f'</div>')
    return p, html


# ----------------------------------------------------------------- threads --
# The defect this construct exists for: Unit 5 promised in bold that "every
# writing task from Unit 6 to Unit 12 carries a five-item article check", and
# not one of those seven units carried one. The gate could prove the bridge's
# citation resolved; nothing could prove the course kept its own promise,
# because the promise was prose.
#
# A thread makes recurrence structural. The unit that introduces it declares
# which later units resume it; each of those declares its check; and a promise
# with no matching declaration is a build failure rather than a discovery.
THREAD_ATTRS = {"id", "name", "stage", "measure", "resumes", "marker", "src"}
THREAD_STAGES = {"introduce", "check"}


def thread_html(a: dict, threads: dict) -> str:
    intro = threads.get(a["id"], {})
    name = a.get("name") or intro.get("name", a["id"])
    measure = a.get("measure") or intro.get("measure", "")
    if a["stage"] == "introduce":
        units = ", ".join(f"Unit {int(x):02d}" for x in a.get("resumes", "").split(",") if x.strip())
        return (f'<aside class="thread" data-role="thread" data-thread="{e(a["id"])}" '
                f'data-stage="introduce">'
                f'<div class="th-h"><span class="th-k">Something to keep doing</span>'
                f'<span class="th-t">{inline(name)}</span></div>'
                f'<p class="th-m">Every time this comes back, you count the same thing: '
                f'<b>{inline(measure)}</b></p>'
                f'<p class="th-u">You will do it again in {e(units)}.</p>'
                f'</aside>')
    return (f'<aside class="thread" data-role="thread" data-thread="{e(a["id"])}" '
            f'data-stage="check">'
            f'<div class="th-h"><span class="th-k">Check it again</span>'
            f'<span class="th-t">{inline(name)}</span></div>'
            f'<p class="th-m">On the paragraph you just wrote: <b>{inline(measure)}</b></p>'
            f'<p class="th-a">Count this one yourself. Finding the places that '
            f'<i>needed</i> one is the work, and no counter can do that for you.</p>'
            f'<div class="th-in"><label>supplied <input type="number" min="0" '
            f'inputmode="numeric" data-th="got"></label>'
            f'<label>of <input type="number" min="0" inputmode="numeric" '
            f'data-th="all"></label>'
            f'<span class="th-out" role="status"></span></div>'
            f'<p class="th-r">A fraction, not a mark. It moves around from one piece of '
            f'writing to the next, and a lower one this time is not a step backwards.</p>'
            f'</aside>')


def bridge_html(a: dict, body: str) -> str:
    """One bridge block, as a learner meets it: a name and an instruction.

    The evidence apparatus is unchanged where it matters — `marker` and `src`
    are still required on the directive, `check_ielts.py` still refuses a
    claim whose citation does not resolve, and `09` G2's demand that a weak
    marker be declared is met by writing every claim, marker and warrant to
    `research/evidence-register.md` at build time. What changed is the
    audience: the register is a note from the authors to themselves, and this
    page belongs to someone learning English. See `register_md`.
    """
    return (f'<aside class="bridge" data-role="bridge">'
            f'<div class="b-h"><span class="b-k">Go further</span></div>'
            f'<h4 class="b-n">{inline(a.get("name", ""))}</h4>'
            f'<div class="prose">{render(body)}</div>'
            f'</aside>')


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
    blocks: list[str] = []

    def stash_bridge(m):
        blocks.append(bridge_html(bridge_attrs(m), m.group("body")))
        return BRIDGE % (len(blocks) - 1)

    md_text = RE_BRIDGE.sub(stash_bridge, md_text)

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
    for i, h in enumerate(blocks):
        out = out.replace(f"<p>{BRIDGE % i}</p>", h).replace(BRIDGE % i, h)
    return out


DICT_DIR = ROOT / "data" / "dict"


def load_dictionary() -> dict:
    """Merge every data/dict/unit-NN.json into one lookup keyed by headword.

    Nine headwords appear in two units (bamboo, custom, device, generation,
    hang out (with), preserve, ritual, socialise, traditional). First
    definition wins, so a repeated word is authored once and stays consistent
    wherever it turns up.
    """
    out: dict = {}
    if not DICT_DIR.is_dir():
        return out
    for f in sorted(DICT_DIR.glob("unit-*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise SystemExit(f"{f.name}: invalid JSON — {exc}")
        for k, v in data.items():
            if k.startswith("_"):
                continue
            out.setdefault(k.lower(), v)
    return out


DICT = load_dictionary()


def sense_html(sn, n=None) -> str:
    """One numbered sense: definition, Vietnamese subtitle, examples."""
    num = f'<span class="s-n">{n}</span>' if n else ""
    gram = f'<span class="s-g">{e(sn["grammar"])}</span>' if sn.get("grammar") else ""
    egs = "".join(f"<li>{inline(x)}</li>" for x in sn.get("examples", []))
    coll = ""
    if sn.get("colloc"):
        coll = ('<p class="s-c">' + " · ".join(f"<span>{e(c)}</span>" for c in sn["colloc"]) + "</p>")
    return (f'<div class="sense">{num}<div class="s-b">'
            f'<p class="s-p"><span class="s-pos">{e(sn.get("pos",""))}</span>{gram}</p>'
            f'<p class="s-en">{inline(sn.get("en",""))}</p>'
            f'<p class="s-vi">{inline(sn.get("vi",""))}</p>'
            + (f'<ul class="s-eg">{egs}</ul>' if egs else "")
            + coll + "</div></div>")


def slug(s) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")


def entry_html(w, entry) -> str:
    """An Oxford-style entry: headword line, the first sense flat, the rest
    behind one toggle. A word with a single sense, no forms and no note gets
    no toggle at all — an empty expander is worse than none."""
    say = re.sub(r"\s*\(.*?\)\s*", " ", w["word"]).strip()
    audio = (f'<button class="speak" type="button" data-say="{e(say)}" '
             f'aria-label="Hear {e(say)}">🔊</button>'
             f'<button class="speak" type="button" data-say="{e(say)}" data-slow="1" '
             f'aria-label="Hear {e(say)} slowly">🐢</button>')
    if not entry:
        # No dictionary entry authored yet: fall back to the unit table's own
        # part of speech and gloss rather than dropping the word.
        entry = {"senses": [{"pos": w.get("pos", ""), "en": "", "vi": w["vi"], "examples": []}]}
    senses = entry.get("senses", [])
    head = (f'<div class="e-h"><h3>{e(w["word"])}</h3>'
            f'<span class="e-ipa">{e(w["ipa"])}</span>{audio}'
            f'<span class="e-n">{w["n"]}</span></div>')
    flat = sense_html(senses[0], 1 if len(senses) > 1 else None) if senses else ""

    rest = "".join(sense_html(sn, i + 2) for i, sn in enumerate(senses[1:]))
    forms = ""
    if entry.get("forms"):
        rows = "".join(
            f'<li><b>{e(f["w"])}</b> <span class="s-pos">{e(f.get("pos",""))}</span> '
            f'{inline(f.get("en",""))} <span class="s-vi">{inline(f.get("vi",""))}</span>'
            + (f'<span class="f-ex">{inline(f["ex"])}</span>' if f.get("ex") else "")
            + "</li>" for f in entry["forms"])
        forms = f'<div class="e-sec"><h4>Word family</h4><ul class="e-forms">{rows}</ul></div>'
    note = (f'<div class="e-sec"><h4>Watch out</h4><p class="e-note">{inline(entry["note"])}</p></div>'
            if entry.get("note") else "")

    body = rest + forms + note
    if not body:
        return f'<article class="entry" id="w-{e(slug(w["word"]))}" data-role="vocab-row">{head}{flat}</article>'
    extra = len(senses) - 1
    bits = []
    if extra > 0:
        bits.append(f"{extra} more meaning" + ("s" if extra != 1 else ""))
    if entry.get("forms"):
        bits.append("word family")
    if entry.get("note"):
        bits.append("usage")
    return (f'<article class="entry" id="w-{e(slug(w["word"]))}" data-role="vocab-row">{head}{flat}'
            f'<div class="e-more">'
            f'<button type="button" class="e-toggle" aria-expanded="false">'
            f'<span class="bk">📖</span> Full entry <span class="e-hint">{e(" · ".join(bits))}</span></button>'
            f'<div class="e-full" hidden="until-found" id="full-{e(slug(w["word"]))}">{body}</div></div></article>')


def vocab_entries(u) -> str:
    return ('<div class="entries">'
            + "".join(entry_html(w, DICT.get(w["word"].lower())) for w in u["vocab"])
            + "</div>")


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

RE_BOLD_TARGET = re.compile(r"\*\*(.+?)\*\*")


def practice_data(u) -> list:
    """The unit's words, packed for the practice engine — as collocations.

    `09` **F7** is the least-contested finding in the vocabulary evidence and
    the one the trainer was failing: items are taught as collocations, not as
    bare word-gloss pairs. Every dictionary entry already carries both, so the
    only thing missing was carrying them to the page.

    `cloze` keeps the *inflected* form the example actually uses, because that
    is what the learner has to produce; the headword is accepted alongside it.
    """
    out = []
    for w in u["vocab"]:
        entry = DICT.get(w["word"].lower()) or {}
        sense = (entry.get("senses") or [{}])[0]
        item = {"n": w["n"], "word": w["word"], "ipa": w["ipa"],
                "pos": w["pos"], "vi": w["vi"]}
        coll = [c for c in (sense.get("colloc") or []) if c][:3]
        if coll:
            item["colloc"] = coll
        for eg in sense.get("examples") or []:
            m = RE_BOLD_TARGET.search(eg)
            if not m:
                continue
            item["cloze"] = RE_BOLD_TARGET.sub("\x01", eg, count=1).replace("**", "")
            item["clozeKey"] = m.group(1)
            break
        out.append(item)
    return out


def e(s) -> str:
    return html.escape(str(s), quote=True)


RE_STRONG = re.compile(r"\*\*(.+?)\*\*", re.S)
RE_EM = re.compile(r"(?<!\*)\*([^*]+?)\*(?!\*)")


def inline(s) -> str:
    """Escape, then honour **bold** and *italic*.

    The strand table cells are markdown like `short *book* vs long *food*` and
    `**V-ing** vs **to-V**`. Passing them through e() alone printed the
    asterisks literally on every unit card and in every "What this unit
    teaches" strip -- the whole course looked like unrendered source.
    """
    out = e(s)
    out = RE_STRONG.sub(r"<strong>\1</strong>", out)
    out = RE_EM.sub(r"<em>\1</em>", out)
    return out


def plain(s) -> str:
    """Strip markdown markers for places that can only hold text.

    A title attribute cannot carry <strong>, so passing raw markdown there
    put literal asterisks in the tooltip -- "**Word stress** in multi-syllable
    words" -- on the four units whose pronunciation strand has no em dash.
    """
    return RE_EM.sub(r"\1", RE_STRONG.sub(r"\1", str(s)))


def short_strand(s) -> str:
    """The headline half of a strand, for the space-constrained unit card.

    `/ʊ/ vs /uː/ — short *book* vs long *food*` -> `/ʊ/ vs /uː/`. The full
    text still appears on the unit page and in the card's title attribute.
    """
    return re.split(r"\s+—\s+", str(s), maxsplit=1)[0].strip()


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
        blocks, lesson_intro = [], None
        for j, h in enumerate([None] + heads):
            if h is None:
                # The lesson's opening prose is parsed as a block too. It was
                # a blind spot: a directive placed above the first heading
                # rendered as raw markdown and was invisible to every gate.
                head, em, md = "", None, intro.strip()
                if not md:
                    continue
            else:
                b_start = h.end()
                b_end = heads[j].start() if j < len(heads) else len(body)
                head = h.group(1).strip()
                em = re.match(r"^(\d+\.\d+)\s+(.*)$", head)
                md = body[b_start:b_end].strip("\n")

            # The three instrumented constructs are lifted out of the prose in
            # one ordered pass and replaced by a token, so a widget renders
            # exactly where it was written rather than after everything else.
            widgets: list = []

            def stash(m, _w=widgets):
                kind = m.group("kind")
                a = dict(RE_ATTR.findall(m.group("attrs")))
                if kind == "task":
                    _w.append((kind, parse_task_body(a, m.group("body"))))
                elif kind in ("audio", "write", "passage"):
                    _w.append((kind, (a, m.group("body"))))
                else:
                    _w.append((kind, a))
                return WIDGET % (len(_w) - 1)

            md = RE_DIRECTIVE.sub(stash, md)
            blk = {
                "kind": "exercise" if em else "teach",
                "id": em.group(1) if em else "",
                "title": em.group(2).strip() if em else head,
                "md": md.strip("\n"),
                "widgets": widgets,
                "tasks": [d for k, d in widgets if k == "task"],
                "audio": [d for k, d in widgets if k == "audio"],
                "writes": [d for k, d in widgets if k == "write"],
                "clocks": [d for k, d in widgets if k == "clock"],
                "threads": [d for k, d in widgets if k == "thread"],
                "passages": [d for k, d in widgets if k == "passage"],
            }
            if h is None:
                blk["kind"] = "intro"
                lesson_intro = blk
            else:
                blocks.append(blk)
        lessons.append({
            "n": int(mk.group(1)),
            "title": mk.group(2).strip(),
            "intro": lesson_intro,
            "blocks": blocks,
            "bridges": [dict(bridge_attrs(bm), body=bm.group("body"), lesson=int(mk.group(1)))
                        for bm in RE_BRIDGE.finditer(body)],
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
            "vocab": vocab, "src": path.name,
            "bridges": [b for L in lessons for b in L["bridges"]],
            "tasks": [(L["n"], blk, t) for L in lessons for blk in lesson_blocks(L)
                      for t in blk["tasks"]],
            "audio": [(L["n"], a, s) for L in lessons for blk in lesson_blocks(L)
                      for a, s in blk["audio"]],
            "writes": [(L["n"], a, s) for L in lessons for blk in lesson_blocks(L)
                       for a, s in blk["writes"]],
            "clocks": [(L["n"], c) for L in lessons for blk in lesson_blocks(L)
                       for c in blk["clocks"]],
            "threads": [(L["n"], t) for L in lessons for blk in lesson_blocks(L)
                        for t in blk["threads"]],
            "passages": [(L["n"], a, s) for L in lessons for blk in lesson_blocks(L)
                         for a, s in blk["passages"]]}


def lesson_blocks(L):
    """Every block a lesson renders, opening prose included.

    The intro is a block like any other. Keeping it out of this list is what
    made a directive above the first heading invisible to the gates.
    """
    return ([L["intro"]] if L["intro"] else []) + L["blocks"]


# Filled by main() once every unit is parsed: a thread's check block in Unit 9
# needs the name and measure declared by its introduction in Unit 5, and the
# gate needs to see every declaration at once to prove a promise was kept.
THREADS: dict = {}


def thread_registry(units) -> dict:
    out = {}
    for u in units:
        for _, t in u["threads"]:
            if t.get("stage") == "introduce":
                out[t.get("id", "")] = dict(t, unit=u["num"])
    return out


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
    # `<` is escaped to its JSON unicode form so no value can close the script
    # tag it lives in. An answer key of "a<b" or a script line containing
    # "</script>" would otherwise end the JSON island and put the rest of the
    # payload into the document as markup.
    payload = json.dumps(data, ensure_ascii=False).replace("<", "\\u003c") if data else ""
    data_tag = (f'<script id="page-data" type="application/json">{payload}</script>'
                if data else "")
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
def ipa_title(u) -> str:
    full = strand(u, "Pronunciation", "")
    return "" if plain(full) == plain(short_strand(full)) else f' title="{e(plain(full))}"'


def page_home(units) -> str:
    cards = []
    for u in units:
        cards.append(f"""    <a class="unitcard" href="unit-{u['nn']}/index.html" data-unit-progress="{u['nn']}">
      <div class="hd"><span class="num">{u['num']:02d}</span><h3>{e(u['title'])}</h3></div>
      <p class="vi">{e(u['vi'])}</p>
      <div class="tags">
        <span class="chip ipa"{ipa_title(u)}>{inline(short_strand(strand(u, 'Pronunciation', '—')))}</span>
        <span class="chip gram">{inline(strand(u, 'Grammar', '—'))}</span>
      </div>
      <div class="foot"><span data-progress-text>7 lessons</span><span class="bar"><i></i></span></div>
    </a>""")
    body = f"""  <header class="masthead">
    <p class="eyebrow">Self-study course · 12 units · 84 lessons</p>
    <h1>Tiếng Anh 8 — Global Success</h1>
    <p class="standfirst">Twelve units, seven lessons each, in order. Every lesson teaches
    something and then asks you to use it; when all seven are done, the unit's practice and
    test open. Your work is saved on this device as you go.</p>
  </header>

  <div class="card start" id="startCard">
    <h3 id="startTitle">Start here</h3>
    <p class="lede" id="startLede">Begin with <b>Unit 01, Lesson 1</b> and work down the
    list. About 20–30 minutes a lesson is plenty.</p>
    <div class="row">
      <a class="btn" id="startLink" href="unit-01/index.html">Open Unit 01</a>
    </div>
  </div>

  <div class="overview">
    <div class="stat"><span class="n" data-units-started>0</span><span class="k">units started</span></div>
    <div class="stat good"><span class="n" data-units-done>0</span><span class="k">units finished</span></div>
    <div class="stat hot"><span class="n" data-total-lessons>0</span><span class="k">lessons done</span></div>
    <div class="stat"><span class="n" data-review-due>0</span><span class="k">words due today</span></div>
  </div>

  <div class="card review" id="reviewCard" hidden>
    <h3>Words due for review</h3>
    <p class="lede" id="reviewLede"></p>
    <div class="row">
      <button class="btn" id="startReview" type="button">Start review</button>
      <span class="label" id="reviewBreak"></span>
    </div>
    <div id="reviewEngine" hidden></div>
  </div>

  <div class="sectionhead"><h2>The twelve units</h2><span class="label">sounds in clay · grammar in teal</span></div>
  <div class="unitgrid">
{chr(10).join(cards)}
  </div>"""
    # The review queue spans units, so the home page carries every unit's items.
    # ~216 of them; the alternative is a fetch, and this site has no server.
    return shell(title=SITE, depth=0, body=body, crumb=[("Course", "")],
                 data={"kind": "home",
                       "vocab": {u["nn"]: practice_data(u) for u in units}},
                 desc="Self-study English 8 course: 12 units, 84 lessons, with practice and unit tests.")


def start_card(u) -> str:
    """The first thing on a unit page: what to do, in the order to do it.

    Opening on "What this unit teaches" answered a question nobody had asked
    yet. A learner arriving here needs one instruction — open Lesson 1 — and a
    short account of what a lesson asks of them; the syllabus strands are
    reference, and now sit underneath.

    The button is a plain link to Lesson 1 in the HTML and is repointed by
    app.js to the first lesson not yet marked complete, so a page opened with
    no progress and a page opened with six lessons done both say the right
    thing.
    """
    return f"""  <div class="card start" id="startCard">
    <h2 id="startTitle">Where to begin</h2>
    <p class="lede" id="startLede">Start with <b>Lesson 1</b> and work down the list —
    each lesson builds on the one before it.</p>
    <ol class="steps">
      <li><b>Read the teaching part</b> at the top of the lesson: the example, the table,
      the rule. Nothing to fill in yet.</li>
      <li><b>Do the exercises.</b> Type or choose your answer, then press
      <b>Check answers</b>. You will see what was right and, where it helps, why.</li>
      <li><b>Press “Mark lesson complete”</b> at the bottom before you move on. That is
      what fills the progress bar and opens the practice and the test.</li>
    </ol>
    <div class="row">
      <a class="btn" id="startLink" href="lesson-1/index.html">Start Lesson 1</a>
      <span class="label">About 20–30 minutes a lesson.</span>
    </div>
  </div>

"""


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
        f'<div><span class="k">{e(k)}</span><span class="v">{inline(v)}</span></div>'
        for k, v in u["strands"])

    body = f"""  <header class="masthead">
    <p class="eyebrow">Unit {u['num']:02d} of 12</p>
    <h1>{e(u['title'])}</h1>
    <p class="vi">{e(u['vi'])}</p>
  </header>

{start_card(u)}  <div class="card"><h2>What this unit teaches</h2>
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
    <div class="lock" id="gateLock"><span>🔒</span><div>Work through the lessons first.</div></div>
    <div class="gategrid">
      <div class="gatecard" data-role="practice">
        <h3>Practice this unit's words</h3>
        <p>All {len(u['vocab'])} words from Lesson 2, asked in five ways: from the meaning,
        from the word, from what you hear, and — most often — inside a phrase the word
        really goes in. Anything you get wrong comes straight back, then again in a week.</p>
        <button class="btn" id="startPractice" type="button" aria-disabled="true">Start practice</button>
      </div>
      <div class="gatecard" data-role="test">
        <h3>Unit test</h3>
        <p>Every word once, with no feedback until the end. Before each answer is checked
        you say how sure you were, and the result shows whether feeling sure actually
        meant being right.</p>
        <button class="btn" id="startTest" type="button" aria-disabled="true">Take the test</button>
      </div>
    </div>
  </div>
  <div id="engine" hidden></div>
  <p class="note" id="ttsNote" hidden></p>"""

    return shell(title=f"Unit {u['num']:02d} — {u['title']} · {SITE}", depth=1, body=body,
                 crumb=[("Course", "../index.html"), (f"Unit {u['num']:02d}", "")],
                 data={"kind": "unit", "unit": u["nn"], "vocab": practice_data(u)},
                 desc=f"Unit {u['num']}: {u['title']}. Seven lessons, practice and a unit test.")


def register_md(units) -> str:
    """The evidence register: every IELTS claim the course makes, and what backs it.

    This used to be a page on the site. It is not learner-facing material — a
    grade-8 learner opening a lesson needs the instruction, not the strength of
    the evidence behind the instruction — so it is written to the repo instead,
    for whoever maintains the course.

    Keeping it *generated* is the part that matters. `09` G2 requires a weak
    marker to be declared rather than quietly carried, and a register built
    from the same directives the lessons render cannot drift from them the way
    a hand-kept list would. `check_ielts.py` is the gate; this is the ledger it
    leaves behind.
    """
    all_b = [(u, x) for u in units for x in u["bridges"]]
    by_marker: dict = {}
    for u, x in all_b:
        mk = RE_MARKER.match(x.get("marker", "").strip())
        by_marker.setdefault(mk.group(1) if mk else "?", []).append((u, x))
    weak = sum(len(by_marker.get(k, [])) for k in ("[INF]", "[SPEC]", "[S/NS]", "[T2]", "[S]"))

    legend = "\n".join(
        f"| `{k}` | {short} | {gloss} | {len(by_marker.get(k, []))} |"
        for k, (short, gloss) in MARKERS.items())

    rows = "\n".join(
        f"| {u['num']}.{x['lesson']} | {plain(x.get('name',''))} | {x.get('trains','')} | "
        f"{x.get('cefr','—')} | `{x.get('marker','')}` | `{x.get('src','')}` | "
        f"`units/{u['src']}` |"
        for u, x in all_b)

    return f"""# Evidence register — generated, do not hand-edit

`python3 tools/build.py` writes this file from the `:::bridge` directives in
`units/*.md`. It is the audit trail for every IELTS claim the course makes:
what the claim is, which criterion it trains, the evidential marker it carries,
and the knowledge-base section that warrants it.

**It is deliberately not published.** The site is for someone learning English;
markers, warrants and CEFR coordinates are notes from the authors to
themselves. `tools/check_ielts.py` still refuses to build a claim whose marker
is illegal or whose citation does not resolve, so nothing is weakened by the
register living here instead of on a page.

{len(all_b)} claims across {len(units)} units. **{weak}** of them rest on
evidence weaker than verified.

## Three rules this course does not break

1. **No IELTS band number is ever put on a learner** — not as a score, not as a
   prediction, not as a progress dial. There is no published table converting
   raw marks to a band, no half-band descriptors, and no official arithmetic
   for combining criterion scores. A band number is legitimate in exactly one
   place: as a coordinate on the published descriptor grid, inside this
   repository's own documents. Never in the interface.
2. **Levels are labelled by CEFR.** The official IELTS–CEFR alignment stops at
   band 4.0 = the B1 threshold and assigns *no band at all* to A2 or A1.
   Grade-8 work sits at A2, so there is no band to label it with and none can
   be derived. The `cefr` attribute records the level; the pages do not print
   it, because a learner does not need a coordinate to do an exercise.
3. **No templates and no model openers.** Memorised language is the explicitly
   penalised category — a wholly memorised answer scores zero, and memorised
   chunks are a band-4 feature of Lexical Resource. Where a lesson gives a
   structure, it gives it as questions the writer has to answer, never as
   sentences to reuse.

## How to read the strength labels

Every claim carries the marker it had in the research, unchanged. Re-stating a
finding never makes it stronger, so nothing here upgrades one.

| Marker | Short | What it means | Used |
| --- | --- | --- | --- |
{legend}

## The register

| Unit·Lesson | What changes | What it trains | CEFR | Strength | Source | Authored in |
| --- | --- | --- | --- | --- | --- | --- |
{rows}

Sources are sections of `research/ielts/` — a source-verified reference built
from ielts.org, British Council, IDP and Cambridge material plus peer-reviewed
research. `tools/check_ielts.py` fails the build if a cited section does not
exist in the file it names.
"""


def recap_block(u) -> str:
    """Lesson 7 is all checks in the source. Open it with what is being checked.

    This is the one block the generator authors rather than renders: without
    it the consolidation lesson opens cold on exercise 7.1, which is both bad
    teaching and the one ordering rule this site is built to keep.
    """
    items = "".join(
        f'<div><span class="k">{e(k)}</span><span class="v">{inline(v)}</span></div>'
        for k, v in u["strands"])
    return f"""  <section class="block" data-role="teach">
    <h2>Before you start — what this checks</h2>
    <p class="lede">Everything below is drawn from Lessons 1–6 of this unit. Skim these
    targets first; if one of them feels blank, go back to that lesson before answering.</p>
    <div class="strands">{items}</div>
  </section>"""


def page_lesson(u, L) -> str:
    parts = []
    payload: dict = {"tasks": [], "audio": [], "write": [], "clock": [], "passage": []}
    if L["n"] == LESSONS:
        parts.append(recap_block(u))
    def prose(b) -> str:
        """One block's markdown, with each directive rendered where it stands.

        The widget HTML is substituted for the token render() carried through,
        the same way a bridge is, so source order survives: a warning written
        between a task and its recording still prints between them.
        """
        out = render(b["md"])
        n_task = n_audio = n_write = n_clock = n_pass = 0
        for i, (kind, d) in enumerate(b["widgets"]):
            if kind == "passage":
                p, html_ = passage_block(u, L["n"], d[0], d[1], n_pass)
                n_pass += 1
                payload["passage"].append(p)
            elif kind == "audio":
                p = audio_payload(u, L["n"], d[0], d[1], n_audio)
                n_audio += 1
                payload["audio"].append(p)
                html_ = audio_html(p)
            elif kind == "write":
                p = write_payload(u, L["n"], d[0], d[1], n_write)
                n_write += 1
                payload["write"].append(p)
                html_ = write_html(p, d[0])
            elif kind == "clock":
                p = clock_payload(u, L["n"], d, n_clock)
                n_clock += 1
                payload["clock"].append(p)
                html_ = clock_html(p)
            elif kind == "thread":
                html_ = thread_html(d, THREADS)
            else:
                p = task_payload(u, L["n"], b["id"] or slug(b["title"]), d, n_task)
                n_task += 1
                payload["tasks"].append(p)
                html_ = task_html(p, d)
            tok = WIDGET % i
            out = out.replace(f"<p>{tok}</p>", html_).replace(tok, html_)
        return out

    if L["intro"]:
        parts.append(f'  <section class="block" data-role="teach">\n'
                     f'    <div class="prose">{prose(L["intro"])}</div>\n  </section>')

    for b in L["blocks"]:
        if b["kind"] == "teach":
            inner = prose(b)
            # The vocabulary block's table is swapped for the rebuilt one, so
            # every row carries its marker and its own audio button.
            if b["title"].lower().startswith("vocabulary") and u["vocab"]:
                inner, n = RE_FIRST_TABLE.subn(lambda _: vocab_entries(u), inner, count=1)
                if n != 1:
                    raise SystemExit(
                        f"unit {u['nn']} lesson {L['n']}: vocabulary block has no table to replace")
            parts.append(f"""  <section class="block" data-role="teach">
    <h2>{e(b['title'])}</h2>
    <div class="prose">{inner}</div>
  </section>""")
        else:
            ans_html = ""
            if b["tasks"]:
                # A task carries its own key, so the generator writes the
                # answer entry. parse_unit's hand-written entry for the same
                # exercise would be a second copy of the same fact, and the
                # gate rejects having both.
                #
                # data-locked: the reveal opens only once the task has been
                # checked. A key readable beside an unanswered task makes the
                # attempt optional, and an optional attempt is the reveal
                # button this construct replaced.
                body = "".join(task_answer_html(task_payload(u, L["n"], b["id"], t, i))
                               for i, t in enumerate(b["tasks"]))
                ans_html = f"""
    <div class="answer" data-role="answer" data-locked="1">
      <button type="button">Show answer</button>
      <div class="body prose" hidden>{body}</div>
    </div>"""
            elif u["answers"].get(b["id"]):
                ans_html = f"""
    <div class="answer" data-role="answer">
      <button type="button">Show answer</button>
      <div class="body prose" hidden>{render(u["answers"][b["id"]])}</div>
    </div>"""
            parts.append(f"""  <section class="block ex" data-role="exercise" data-ex="{e(b['id'])}">
    <div class="exhead"><span class="exno">{e(b['id'])}</span><h2>{e(b['title'])}</h2></div>
    <div class="prose">{prose(b)}</div>{ans_html}
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
                       "titles": {str(x["n"]): x["title"] for x in u["lessons"]},
                       "tasks": payload["tasks"], "audio": payload["audio"],
                       "write": payload["write"], "clock": payload["clock"],
                       "passage": payload["passage"]},
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
    # A thread's check in a later unit renders from the declaration made where
    # the strand was introduced, so the registry has to exist before any page
    # does.
    THREADS.clear()
    THREADS.update(thread_registry(units))

    tot_ex = sum(len([b for L in u["lessons"] for b in L["blocks"] if b["kind"] == "exercise"]) for u in units)
    tot_teach = sum(len([b for L in u["lessons"] for b in L["blocks"] if b["kind"] == "teach"]) for u in units)
    tot_ans = sum(len(u["answers"]) for u in units)
    tot_vocab = sum(len(u["vocab"]) for u in units)

    tot_bridge = sum(len(u["bridges"]) for u in units)
    tot_task = sum(len(u["tasks"]) for u in units)
    tot_item = sum(len(t["items"]) for u in units for _, _, t in u["tasks"])
    tot_audio = sum(len(u["audio"]) for u in units)
    tot_write = sum(len(u["writes"]) for u in units)
    tot_clock = sum(len(u["clocks"]) for u in units)
    tot_pass = sum(len(u["passages"]) for u in units)
    tot_lab = sum(len(passage_labels(a, body)) for u in units for _, a, body in u["passages"])
    write_items = [it for u in units for _, a, body in u["writes"]
                   for it in write_payload(u, 0, a, body)["items"]]
    tot_checked = sum(1 for it in write_items if it.get("c"))

    if args.check:
        for u in units:
            ex = len([b for L in u["lessons"] for b in L["blocks"] if b["kind"] == "exercise"])
            print(f"  unit {u['nn']}  {u['title'][:34]:36} lessons={len(u['lessons'])} "
                  f"ex={ex:3} answers={len(u['answers']):3} vocab={len(u['vocab']):3} "
                  f"bridges={len(u['bridges']):2} marked={len(u['tasks']):2} "
                  f"audio={len(u['audio'])} write={len(u['writes'])} "
                  f"clock={len(u['clocks'])} passage={len(u['passages'])} "
                  f"threads={len(u['threads'])}")
        print(f"\n{len(units)} units · {tot_ex} exercises · {tot_teach} teaching blocks · "
              f"{tot_ans} answers · {tot_vocab} vocabulary rows · {tot_bridge} IELTS bridges")
        print(f"{tot_task} marked tasks · {tot_item} marked items · {tot_audio} single-play "
              f"recordings · {len(THREADS)} strands")
        print(f"{tot_write} committed writing tasks · {tot_checked} of {len(write_items)} "
              f"checklist lines decided from the learner's own text · {tot_clock} reading clocks")
        print(f"{tot_pass} reading passages, highlightable and annotatable · "
              f"{tot_lab} generated paragraph labels")
        return 0

    # Rebuild the generated tree only — remove what we own by name rather than
    # nuking docs/, which also holds .nojekyll and anything a host puts there.
    OUT.mkdir(parents=True, exist_ok=True)
    for u in units:
        d = OUT / f"unit-{u['nn']}"
        if d.is_dir():
            shutil.rmtree(d)
    # docs/evidence/ was the published register. It is now research/evidence-register.md,
    # so an existing checkout still carrying the old page has it removed here.
    if (OUT / "evidence").is_dir():
        shutil.rmtree(OUT / "evidence")
    if (OUT / "assets").is_dir():
        shutil.rmtree(OUT / "assets")

    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    (OUT / "assets").mkdir(parents=True, exist_ok=True)
    for a in ASSETS.iterdir():
        shutil.copy2(a, OUT / "assets" / a.name)

    (OUT / "index.html").write_text(page_home(units), encoding="utf-8")
    # The evidence register is a maintainer's document, not a page. It lives in
    # the repo beside the knowledge base it cites.
    REGISTER.write_text(register_md(units), encoding="utf-8")
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
          f"{len(units)} units, {tot_ex} exercises, {tot_ans} answers, "
          f"{tot_vocab} vocabulary rows, {tot_bridge} IELTS bridges")
    print(f"        {tot_task} marked tasks ({tot_item} items), {tot_audio} single-play "
          f"recordings, {len(THREADS)} strands")
    return 0


if __name__ == "__main__":
    sys.exit(main())
