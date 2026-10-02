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

# The cheaper sibling, for the kinds that are flat ink marks rather than
# painting. At a third of the price a miss costs little, and `--model` puts any
# target back on the main model.
IMAGE_MODEL_BY_KIND = {
    "fx": os.environ.get("GEMINI_IMAGE_MODEL_FX", "gemini-3.1-flash-lite-image"),
}

# Ask for the size the page can use, not the largest on offer. The price is per
# output size: a prop is published at 512 px, an effect at 768 and a character
# cell at 640, so 1K covers all three; only a plate (1800 px wide) needs 2K.
# Everything was drawn at 2K at first, which was a third more than it had to be
# on every image that was not a plate.
SIZE_BY_KIND = {"bg": "2K", "cast": "1K", "props": "1K", "fx": "1K"}

# USD per image, from https://ai.google.dev/gemini-api/docs/pricing (2026-10).
# An ESTIMATE for the run summary and `art.py report` — the bill is the truth.
PRICE = {
    "gemini-3.1-flash-image":      {"1K": 0.067, "2K": 0.101, "4K": 0.151},
    "gemini-3.1-flash-lite-image": {"1K": 0.034, "2K": 0.034},
    "gemini-3-pro-image":          {"1K": 0.134, "2K": 0.134, "4K": 0.24},
    "gemini-2.5-flash-image":      {"1K": 0.039, "2K": 0.039},
}
CRITIC_PRICE = 0.004      # a rough figure per judgement: three small images in, a line of JSON out


# Targets the cheaper model could not do. `splash` is a solid white body of
# water, not an ink mark, and came back as thin scribbles.
MAIN_MODEL_ONLY = {"fx/splash"}


def image_model(kind, override=None, target_id=None):
    if override:
        return override
    if target_id in MAIN_MODEL_ONLY:
        return IMAGE_MODEL
    return IMAGE_MODEL_BY_KIND.get(kind, IMAGE_MODEL)


def price(model, size):
    return PRICE.get(model, {}).get(size or "1K", 0.10)


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
