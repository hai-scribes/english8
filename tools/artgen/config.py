"""Where things live, which models to call, and where the key comes from.

The key is never committed. It is looked for, in order, in:

    $GEMINI_API_KEY  or  $GOOGLE_API_KEY
    .secrets/gemini.key          (repo root, gitignored)
    ~/.config/english8/gemini.key

Models are overridable per run (`--model`, `--critic-model`) or by environment,
because Google renames them every few months and a default that has been
retired should cost one flag, not an edit. `python3 tools/art.py models` lists
what the key can actually reach.
"""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "art"
PROMPTS = ROOT / "research" / "story" / "illustration-prompts.md"
CAST_JSON = ROOT / "data" / "cast.json"

# Everything a run produces that is not a promoted master: candidates, the
# critic's verdicts, the call log. Gitignored, and deliberately outside art/ so
# nothing in it can ever be copied into docs/ by the build.
WORK = ROOT / ".artgen"
LOG = WORK / "log.jsonl"

# Nano Banana 2 — Google's "generalist workhorse" as of 2026-09. The Pro model
# (`gemini-3-pro-image`) holds a face across references a little better and
# costs more; worth trying for a character whose set keeps drifting.
IMAGE_MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image")

# The critic only reads images and writes JSON. The `-latest` alias follows
# Google's current Flash text model, so it does not need chasing.
CRITIC_MODEL = os.environ.get("GEMINI_CRITIC_MODEL", "gemini-flash-latest")

API_BASE = os.environ.get("GEMINI_API_BASE",
                          "https://generativelanguage.googleapis.com/v1beta")

# A hard ceiling on image calls per invocation. An autonomous loop that goes
# wrong should run out of budget, not run up a bill.
DEFAULT_BUDGET = int(os.environ.get("ARTGEN_BUDGET", "24"))

KEY_FILES = (ROOT / ".secrets" / "gemini.key",
             Path.home() / ".config" / "english8" / "gemini.key")


def api_key(required: bool = True):
    for var in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
        if os.environ.get(var, "").strip():
            return os.environ[var].strip()
    for f in KEY_FILES:
        if f.is_file() and f.read_text().strip():
            return f.read_text().strip()
    if required:
        raise SystemExit(
            "No Gemini API key. Put it in .secrets/gemini.key (gitignored) or "
            "export GEMINI_API_KEY=… — see tools/artgen/config.py.")
    return None
