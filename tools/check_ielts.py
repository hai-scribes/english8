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
  B11 True/False/Not Given and Yes/No/Not Given are two types, and neither
      is taught as the harder reasoning
  C1  every task key parses under the official key grammar
  C4  every task whose answers are written declares its word limit, and the
      limit is one the official instruction line can express
  C6  a recording declares its delivery mode, and computer-delivered means a
      two-minute review rather than a transfer window
  C8  a recording's script is carried by the directive, never printed above
      the questions, and it declares its spoken orientation
  E7  no hours-to-band promise of any kind
  G1  every bridge's source resolves to a real section of a real KB file
  G2  every bridge carries a legal evidential marker, printed at use

  Plus one rule the constitution does not have, because the constitution is
  about claims made of IELTS and this is a claim the course makes of itself:
  a strand that announces it recurs in later units must actually recur in
  each of them. Unit 5 promised in bold that "every writing task from Unit 6
  to Unit 12 carries a five-item article check" and not one of those seven
  units carried one. Nothing could catch that, because the promise was prose.

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
    # "get you to band 6" slipped through an earlier "get to band" — the
    # promise takes an object as often as not, so the verb and the noun are
    # allowed a few words between them.
    (re.compile(r"\b(reach|get(s|ting)?|take[sn]?|bring|push|lift|move|hit|achiev\w+|"
                r"guarantee[sd]?)\b(\s+\w+){0,3}\s+to\s+(ielts\s+)?band\b", re.I),
     "a band presented as a promise (A2)"),
    (re.compile(r"\b(reach|hit|achiev\w+|guarantee[sd]?|score)\s+(ielts\s+)?band\s*\d", re.I),
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
    # The hole Unit 9 went through: a quoted passage carrying three or more
    # gaps is a skeleton to fill in, whatever the sentence above it calls it.
    # Matching on the shape rather than on the invitation is the only version
    # of this check that a rewording cannot walk around.
    (re.compile(r"^>[^\n]*(_{3,}[^\n]*){3,}$", re.M),
     "a quoted line with three or more gaps is a fill-in skeleton — the "
     "memorised-language category, not a scaffold (B3)"),
]

# B11: the two Not Given types are officially distinguished by *target* —
# TFNG on information, YNNG on views and claims — not by difficulty. `04`
# §4.1 is explicit that the reasoning is the same.
TYPE_CONFUSION = [
    (re.compile(r"(yes/?no/?not given|ynng)[^.\n]{0,60}"
                r"(harder|more difficult|trickier|tougher)", re.I),
     "YNNG is not taught as harder than TFNG — the official distinction is "
     "target, not logic (B11)"),
    (re.compile(r"(harder|more difficult|trickier)[^.\n]{0,40}"
                r"than (true/?false/?not given|tfng)", re.I),
     "YNNG is not taught as harder than TFNG — the official distinction is "
     "target, not logic (B11)"),
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


def check_task(where: str, a: dict, problems: list):
    """Group C, for one :::task.

    Every rule here is published and mechanical, which is exactly why it is a
    gate rather than a review note: `09` C1-C5 are the items a well-meaning
    author fails silently, by being kind.
    """
    unknown = set(a) - b.TASK_ATTRS - {"items", "bullets"}
    if unknown:
        problems.append(f"{where}: unknown task attribute(s) {sorted(unknown)}")
    for req in sorted(b.TASK_REQUIRED):
        if not a.get(req):
            problems.append(f"{where}: task is missing required attribute {req!r}")
    # A bullet that did not parse is a question the learner never sees. The
    # separator is ` = ` with spaces on both sides; "second___= two" silently
    # vanished before this check existed.
    if a.get("bullets", 0) != len(a.get("items", [])):
        problems.append(f"{where}: {a['bullets']} bullet(s) but {len(a.get('items', []))} "
                        f"parsed — an item is '- prompt = key', with a space either side "
                        f"of the '='")
    skill, typ = a.get("skill", ""), a.get("type", "")
    if skill not in b.TASK_TYPES:
        problems.append(f"{where}: skill={skill!r} is not one of "
                        f"{', '.join(sorted(b.TASK_TYPES))}")
        return
    if typ not in b.TASK_TYPES[skill]:
        problems.append(f"{where}: {typ!r} is not one of the official "
                        f"{skill} question types (allowed: "
                        f"{', '.join(sorted(b.TASK_TYPES[skill]))})")
    if not a.get("items"):
        problems.append(f"{where}: task has no items — each is one line "
                        f"'- prompt = key'")
    # C4/C5. The limit is per task and printed on it, and only the forms the
    # official instruction line can express are legal — there is no such
    # published instruction as "no more than five words".
    #
    # Both directions are checked, because both were reachable. A completion
    # task with `opts` renders buttons, so no answer is ever written and the
    # spelling rule is never exercised; a multiple-choice task with an
    # untyped item renders a text box with no limit on it.
    typed = [i for i, it in enumerate(a.get("items", []), 1) if not it.get("opts")]
    if skill != "course" and typ in b.NEEDS_LIMIT:
        if a.get("opts"):
            problems.append(f"{where}: a {typ} task cannot declare opts — a completion "
                            f"answer is written, not chosen, and choosing it away drops "
                            f"the word limit and the spelling rule (C4, C5)")
        if not a.get("words"):
            problems.append(f"{where}: a {typ} task must declare its word limit "
                            f"(words=\"2\" or words=\"3+number\") — the limit is per task, "
                            f"printed, and a hard fail (C4)")
    if skill != "course" and typed and not a.get("words"):
        problems.append(f"{where}: item(s) {typed} are typed rather than chosen, so this "
                        f"task needs a word limit whatever its type says (C4)")
    if a.get("words"):
        n, _, num = a["words"].partition("+")
        if n not in b.WORDS_IN_ENGLISH or (num and num != "number"):
            problems.append(f"{where}: words={a['words']!r} is not a limit the official "
                            f"instruction line can express — use 1, 2 or 3, "
                            f"optionally +number (C4)")
    # "in either order" names item numbers. An index outside the task, a
    # repeat, or a group of one is a directive that cannot mean anything, and
    # an out-of-range index used to throw in the learner's browser.
    n_items = len(a.get("items", []))
    claimed: set[int] = set()
    for part in (a.get("either") or "").split(","):
        if not part.strip():
            continue
        nums = [x.strip() for x in part.split("-")]
        if len(nums) < 2:
            problems.append(f"{where}: either={part.strip()!r} names one item — an "
                            f"order-free group needs at least two")
        for x in nums:
            if not x.isdigit() or not 1 <= int(x) <= n_items:
                problems.append(f"{where}: either={part.strip()!r} names item {x!r}, "
                                f"which is not one of this task's {n_items}")
            elif int(x) in claimed:
                problems.append(f"{where}: item {x} is in two order-free groups")
            else:
                claimed.add(int(x))

    # C1. A key the marking engine cannot expand is a key that will mark a
    # right answer wrong.
    for i, it in enumerate(a.get("items", []), 1):
        k = it.get("key", "")
        if it.get("opts"):
            # A picked answer is matched against the option it *is*. The key
            # grammar does not apply, which is what lets an option be spelled
            # "/ʊə/" without its slashes reading as alternates.
            if k not in {o["k"] for o in it["opts"]}:
                problems.append(f"{where} item {i}: key {k!r} is not one of the options "
                                f"offered ({', '.join(o['k'] for o in it['opts'])})")
            continue
        # C4, the direction that is easy to miss: a key may not offer a form
        # its own limit forbids. "(to) a primary school" under a three-word
        # limit marks the learner wrong for writing the four-word form the key
        # explicitly permits — and every gate around it stays green, because
        # the limit is legal and the key is legal; only the pair is not.
        if a.get("words") and not it.get("opts"):
            longest = max(accepted_forms(k), key=lambda x: len(x.split()), default="")
            if over_limit(longest, a["words"]):
                problems.append(
                    f"{where} item {i}: key {k!r} accepts {longest!r} "
                    f"({len(longest.split())} words), which its own words={a['words']!r} "
                    f"forfeits. Tighten the key or raise the limit (C4)")
        if k.count("(") != k.count(")"):
            problems.append(f"{where} item {i}: key {k!r} has unbalanced brackets — "
                            f"'( )' marks an optional token (C1)")
        if any(not part.strip() for part in k.split("/")):
            problems.append(f"{where} item {i}: key {k!r} has an empty alternate — "
                            f"'/' separates alternatives (C1)")
        # The published legend is "words in brackets are optional". A bracketed
        # *suffix* — "give(s) up" — is our invention, and it silently accepts a
        # wrong inflection. Write the alternates out: "give up/gives up".
        for opt in RE_BRACKET.finditer(k):
            before = k[opt.start() - 1] if opt.start() else " "
            after = k[opt.end()] if opt.end() < len(k) else " "
            if before not in " " or after not in " ":
                problems.append(f"{where} item {i}: key {k!r} brackets part of a word. "
                                f"The official grammar makes whole *words* optional — "
                                f"write the alternates out with '/' instead (C1)")
                break


def check_audio(where: str, a: dict, script: str, problems: list):
    """Group C, for one :::audio. C6 and C8 are timing and orientation."""
    unknown = set(a) - b.AUDIO_ATTRS
    if unknown:
        problems.append(f"{where}: unknown audio attribute(s) {sorted(unknown)}")
    for req in sorted(b.AUDIO_REQUIRED):
        if not a.get(req):
            problems.append(f"{where}: recording is missing required attribute {req!r} — "
                            f"the spoken orientation is never written on the paper, so it "
                            f"has to be carried here (C8)")
    if a.get("mode") not in b.AUDIO_MODES:
        problems.append(f"{where}: mode={a.get('mode')!r} — a listening tool must declare "
                        f"which delivery it simulates, 'computer' or 'paper' (C6)")
    # C6: the two modes differ in exactly this, and practising the wrong one
    # trains a habit that costs marks.
    if a.get("mode") == "computer" and a.get("review") and a["review"] != "120":
        problems.append(f"{where}: computer-delivered gives two minutes to review, not "
                        f"{a['review']}s — there is no transfer window (C6)")
    if not script.strip():
        problems.append(f"{where}: recording has no script")


RE_WS = re.compile(r"\s+")
RE_BRACKET = re.compile(r"\([^)]*\)")

# The two published rules the browser marks by, restated here so the gate can
# apply them to the KEY at build time rather than to the learner at run time.
# Kept deliberately small and independent of app.js: a shared implementation
# would make a bug in one invisible to the other.
RE_NUMERIC = re.compile(r"\d[\d.,:/-]*$")


def _expand_optional(s: str) -> list[str]:
    m = RE_BRACKET.search(s)
    if not m:
        return [RE_WS.sub(" ", s).strip()]
    return (_expand_optional(s[:m.start()] + m.group(0)[1:-1] + s[m.end():])
            + _expand_optional(s[:m.start()] + s[m.end():]))


def accepted_forms(key: str) -> list[str]:
    """Every string this key marks correct — brackets expanded, / split."""
    out = []
    for alt in str(key).split("/"):
        out += [f for f in _expand_optional(alt) if f]
    return out


RE_WORD = re.compile(r"[^\W_]+", re.UNICODE)


def words_of(s: str) -> list[str]:
    """Lowercased word tokens, punctuation and markdown discarded.

    Comparison is on words rather than raw text so that a key does not miss
    its own script over a comma, a bold marker or a curly apostrophe.
    """
    return RE_WORD.findall(str(s).lower())


def over_limit(given: str, words: str) -> bool:
    """`03` §4: hyphens count as one word; AND/OR A NUMBER permits one number."""
    n, _, num = str(words).partition("+")
    toks = given.split()
    if not num:
        return len(toks) > int(n)
    nums = [t for t in toks if RE_NUMERIC.fullmatch(t)]
    return len(nums) > 1 or len(toks) - len(nums) > int(n)

# Every line that opens a directive, so a name the generator does not know is
# a build failure rather than a block of raw markdown on the page. ":::taskk"
# used to render its own source, keys and all, and no gate could see it.
RE_OPENER = re.compile(r"^:::[ \t]*(?P<name>[A-Za-z][\w-]*)", re.M)
KNOWN_DIRECTIVES = {"bridge", "task", "audio", "thread"}


def check_directives(tag: str, text: str, problems: list):
    for m in RE_OPENER.finditer(text):
        if m.group("name") not in KNOWN_DIRECTIVES:
            line = text[:m.start()].count("\n") + 1
            problems.append(f"{tag}:{line}: {':::' + m.group('name')!r} is not a directive "
                            f"({', '.join(sorted(KNOWN_DIRECTIVES))}) — it would render as "
                            f"raw markdown, answer keys and all")
    # A directive that is never closed swallows the rest of the file or, for
    # the ones whose body is optional, silently drops its content.
    opens = len(RE_OPENER.findall(text))
    closes = len(re.findall(r"^:::[ \t]*$", text, re.M))
    if opens != closes:
        problems.append(f"{tag}: {opens} directive(s) opened but {closes} closed — "
                        f"every ':::name' needs a bare ':::' to end it")


def check_not_printed(where: str, script: str, text: str, problems: list):
    """C8: a script inside :::audio and also printed above the questions.

    Moving the script into the directive is only half the change — leaving a
    copy in the prose gives it back, and the exercise is a reading task again.
    Every sentence long enough to be distinctive is checked, not just one, so
    quoting a slice of the script is caught as surely as quoting all of it.
    """
    # Only the recording's own directive is removed. A task body is shown to
    # the learner, so a transcript sentence pasted into an item prompt is the
    # script printed on the page by another route.
    prose = RE_WS.sub(" ", b.RE_AUDIO.sub("", text))
    for raw in re.split(r"[.!?]", script):
        s = RE_WS.sub(" ", raw.strip().lstrip("> "))
        if len(s) > 40 and s in prose:
            problems.append(f"{where}: the recording's script is also printed in the "
                            f"lesson — the questions then test reading, not listening "
                            f"(C8)\n      → {s[:70]!r}")
            return


def check_threads(units, problems: list):
    """A strand that says it comes back has to come back.

    This is the rule that would have caught the article spine: Unit 5's bridge
    named Units 6-12 in bold and nothing rendered in any of them.
    """
    intro, checks = {}, {}
    for u in units:
        for lesson, t in u["threads"]:
            tid, stage = t.get("id", ""), t.get("stage", "")
            where = f"unit {u['nn']} lesson {lesson} (thread {tid or '?'})"
            unknown = set(t) - b.THREAD_ATTRS
            if unknown:
                problems.append(f"{where}: unknown thread attribute(s) {sorted(unknown)}")
            if not tid:
                problems.append(f"{where}: thread is missing required attribute 'id'")
                continue
            if stage not in b.THREAD_STAGES:
                problems.append(f"{where}: stage={stage!r} is not "
                                f"{' or '.join(sorted(b.THREAD_STAGES))}")
                continue
            if stage == "introduce":
                if tid in intro:
                    problems.append(f"{where}: strand {tid!r} is introduced twice — "
                                    f"already at unit {intro[tid]['unit']:02d}")
                for req in ("name", "measure", "resumes"):
                    if not t.get(req):
                        problems.append(f"{where}: an introducing thread must declare "
                                        f"{req!r}")
                intro[tid] = dict(t, unit=u["num"])
            else:
                # A check renders the introduction's wording. Letting it carry
                # its own would mean the strand measured two different things
                # under one name, which is the failure the construct exists
                # to prevent.
                for banned in ("name", "measure", "resumes", "marker", "src"):
                    if t.get(banned):
                        problems.append(f"{where}: a check declares only 'id' and "
                                        f"'stage' — {banned!r} belongs to the "
                                        f"introduction, so the strand says one thing "
                                        f"everywhere")
                checks.setdefault(tid, set()).add(u["num"])

    for tid, seen in checks.items():
        if tid not in intro:
            problems.append(f"strand {tid!r}: checked in "
                            f"{', '.join(f'unit {n:02d}' for n in sorted(seen))} but never "
                            f"introduced — a check with no introduction has nothing to "
                            f"measure against")
            continue
        first = intro[tid]["unit"]
        early = sorted(n for n in seen if n <= first)
        if early:
            problems.append(f"strand {tid!r}: checked in "
                            f"{', '.join(f'unit {n:02d}' for n in early)}, which is not "
                            f"after unit {first:02d} where it is introduced — recurrence "
                            f"means a later unit")
    for tid, t in intro.items():
        want = {int(x) for x in t.get("resumes", "").split(",") if x.strip().isdigit()}
        missing = sorted(want - checks.get(tid, set()))
        if missing:
            problems.append(
                f"strand {tid!r} (introduced unit {t['unit']:02d}) says it comes back in "
                f"{', '.join(f'unit {n:02d}' for n in sorted(want))}, but "
                f"{', '.join(f'unit {n:02d}' for n in missing)} carr"
                f"{'ies' if len(missing) == 1 else 'y'} no check. A promise the course "
                f"makes about itself is a promise the build keeps")


def main() -> int:
    problems: list[str] = []
    units = []
    for md in sorted((ROOT / "units").glob("unit-*.md")):
        text = md.read_text(encoding="utf-8")
        u = b.parse_unit(md)
        units.append(u)
        tag = f"unit {u['nn']}"

        check_directives(tag, text, problems)

        for lesson, blk, t in u["tasks"]:
            check_task(f"{tag} lesson {lesson} ex {blk['id'] or blk['title']}", t, problems)
            # The generated answer entry and a hand-written one are two copies
            # of the same key, and two copies drift.
            if blk["id"] and u["answers"].get(blk["id"]):
                problems.append(f"{tag}: exercise {blk['id']} has both a :::task and a "
                                f"hand-written answer-key entry — the task's keys are the "
                                f"source, so delete the entry")
        scripts: dict[int, str] = {}
        orientations: dict[int, str] = {}
        for lesson, a, script in u["audio"]:
            check_audio(f"{tag} lesson {lesson} (recording)", a, script, problems)
            check_not_printed(f"{tag} lesson {lesson}", script, text, problems)
            scripts[lesson] = scripts.get(lesson, "") + "\n" + script
            orientations[lesson] = (orientations.get(lesson, "") + " "
                                    + a.get("orientation", ""))

        # Two ways a listening answer gets given away before it is earned, and
        # both were found in the wild:
        #
        #   the spoken orientation — unit 04's "a thirteen-year-old girl"
        #   preceding "Mai is ___ years old";
        #   another task's revealed reason — unit 09's 6.1 note "two hundred
        #   is the distance, not the speed" preceding 6.2's "= two hundred".
        #
        # A reason inside the SAME task is fine: it appears only once that task
        # has been marked, by which time its own items are committed.
        reasons: dict[tuple, str] = {}
        for lesson, blk, t in u["tasks"]:
            if t.get("skill") != "listening":
                continue
            reasons[(lesson, blk["id"])] = " ".join(
                it.get("why", "") for it in t["items"])
        for lesson, blk, t in u["tasks"]:
            if t.get("skill") != "listening" or lesson not in orientations:
                continue
            elsewhere = " ".join(v for (ln, ex), v in reasons.items()
                                 if ln == lesson and ex != blk["id"])
            said = " ".join(words_of(orientations[lesson] + " " + elsewhere))
            if not said:
                continue
            for i, it in enumerate(t["items"], 1):
                # For a chosen answer the leak is the option's TEXT, not its
                # letter: unit 06's orientation reproduced option (b) word for
                # word, so "= b" was readable without listening.
                if it.get("opts"):
                    hit = next((o["t"] for o in it["opts"] if o["k"] == it["key"]), "")
                    cands = [re.sub(r"<[^>]+>", "", hit)]
                else:
                    cands = accepted_forms(it["key"])
                for f in cands:
                    w = words_of(f)
                    # One-word keys that are ordinary function words are not a
                    # leak; a content answer appearing verbatim is.
                    if not w or (len(w) == 1 and len(w[0]) < 4):
                        continue
                    if " ".join(w) in said:
                        problems.append(
                            f"{tag} lesson {lesson} ex {blk['id']} item {i}: the spoken "
                            f"orientation already says {f!r}, which is this item's answer. "
                            f"The orientation sets the scene; it does not answer the paper")
                        break

        # `03` §4.1, official and counter-intuitive: "Don't try to rephrase what
        # you hear. Try to write down the words you hear which fit the
        # question." A listening key the recording never says is therefore not
        # a hard question — it is an unanswerable one, and only the author can
        # see that, because the script is no longer on the page.
        for lesson, blk, t in u["tasks"]:
            if t.get("skill") != "listening" or lesson not in scripts:
                continue
            said = " ".join(words_of(scripts[lesson]))
            for i, it in enumerate(t["items"], 1):
                if it.get("opts"):
                    continue
                if not any(" ".join(words_of(f)) in said for f in accepted_forms(it["key"])):
                    problems.append(
                        f"{tag} lesson {lesson} ex {blk['id']} item {i}: key "
                        f"{it['key']!r} is never said in the recording. The answers are "
                        f"the words you hear, not a paraphrase of them (`03` §4.1)")

        # C6/C10 cannot be dodged by relabelling. A lesson that carries a
        # recording is a listening lesson, and calling its questions a course
        # drill would strip the word limit, the marking rules and the
        # confidence rating off items that are supposed to have them.
        heard = {lesson for lesson, _, _ in u["audio"]}
        for lesson, blk, t in u["tasks"]:
            if lesson in heard and t.get("skill") != "listening":
                problems.append(f"{tag} lesson {lesson} ex {blk['id']}: this lesson has a "
                                f"recording, so its tasks are skill=\"listening\", not "
                                f"{t.get('skill')!r} — relabelling drops the word limit "
                                f"and the confidence rating (C6, C10)")

        for rx, why in (BAND_PROMISE + GENRE_OVERCLAIM + TEMPLATE_LANGUAGE
                        + VN_PROHIBITED + TYPE_CONFUSION):
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

    check_threads(units, problems)

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
    tasks = [t for u in units for _, _, t in u["tasks"]]
    items = sum(len(t["items"]) for t in tasks)
    ielts = sum(1 for t in tasks if t["skill"] != "course")
    audio = sum(len(u["audio"]) for u in units)
    strands = {t.get("id") for u in units for _, t in u["threads"]
               if t.get("stage") == "introduce"}
    print(f"PASS: {len(bridges)} IELTS bridges across {len(units)} units · every citation "
          f"resolves · {spread}")
    print(f"      {weak} of {len(bridges)} rest on evidence weaker than verified, and each "
          f"says so where it appears.")
    print(f"      {len(tasks)} marked tasks ({items} items), {ielts} of them official IELTS "
          f"question types · {audio} single-play recording(s) · {len(strands)} strand(s), "
          f"each recurring where it says it does.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
