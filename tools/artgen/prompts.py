"""Read research/story/illustration-prompts.md into generation targets.

That file stays the only place a prompt is written. This module does not
paraphrase, summarise or "improve" a block — it lifts the blockquote verbatim,
unwrapped, because the file's own rule is that a prompt is complete as it stands
and some of its sentences are load-bearing (`check_cast.py` guards them).

A block is everything from its `**File:**` line to the next heading or rule. Its
prompt is the blockquote inside it. A retired block — marked `Not currently
placed by any dialogue` — is returned with `retired=True` and is never generated.
"""
import re
from dataclasses import dataclass
from typing import Optional

from . import config

RE_FILE = re.compile(r"^\*\*File:\*\* `([^`]+)`", re.M)
RE_END = re.compile(r"^(#{1,3} |---\s*$)", re.M)
RETIRED = "Not currently placed by any dialogue"


@dataclass
class Target:
    path: str                  # repo-relative master path, as the block names it
    kind: str                  # cast | bg | props | fx
    slug: str
    emotion: Optional[str]     # cast only
    prompt: str
    retired: bool

    @property
    def id(self):
        return f"{self.slug}/{self.emotion}" if self.kind == "cast" else f"{self.kind}/{self.slug}"

    @property
    def aspect(self):
        return "16:9" if self.kind == "bg" else "1:1"


def _kind(path):
    parts = path.split("/")
    if parts[:2] == ["art", "cast"]:
        return "cast", parts[2], parts[3].rsplit(".", 1)[0]
    if parts[:2] == ["art", "bg"]:
        return "bg", parts[2].rsplit(".", 1)[0], None
    if parts[:2] in (["art", "props"], ["art", "fx"]):
        return parts[1], parts[-1].rsplit(".", 1)[0], None
    raise ValueError(f"unrecognised art path in the prompts file: {path}")


def _quote_paragraphs(block):
    """The blockquote as a list of unwrapped paragraphs. Separate quotes and
    `>` blank lines both end a paragraph."""
    paras, cur = [], []
    for line in block.splitlines():
        m = re.match(r"^\s*>\s?(.*)$", line)
        if not m or not m.group(1).strip():
            if cur:
                paras.append(" ".join(cur))
                cur = []
            continue
        cur.append(m.group(1).strip())
    if cur:
        paras.append(" ".join(cur))
    return paras


def load(doc: str = None):
    doc = doc if doc is not None else config.PROMPTS.read_text(encoding="utf-8")
    out = []
    for m in RE_FILE.finditer(doc):
        end = RE_END.search(doc, m.end())
        block = doc[m.end(): end.start() if end else len(doc)]
        paras = _quote_paragraphs(block)
        retired = any(RETIRED in p for p in paras)
        paras = [p for p in paras if RETIRED not in p]
        kind, slug, emo = _kind(m.group(1))
        out.append(Target(m.group(1), kind, slug, emo, "\n\n".join(paras), retired))
    return out


def find(query: str, targets=None):
    """Resolve what a person types: `ti/happy`, `props/cakes`, `cakes`,
    `harbour-wall`, `bong` (all six), or a path from the prompts file."""
    targets = targets if targets is not None else load()
    q = query.strip().strip("/")
    hits = [t for t in targets if q in (t.path, t.id, t.slug)
            or t.path.rsplit(".", 1)[0] == q
            or f"{t.kind}/{t.slug}" == q]
    if not hits:
        raise SystemExit(f"{query!r} names nothing in {config.PROMPTS.relative_to(config.ROOT)}")
    return hits
