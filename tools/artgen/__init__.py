"""Generate the comic's art with Gemini, cut it out, and check it.

The functions worth calling from Python (run from tools/, or with tools/ on
sys.path):

    from artgen import prompts, produce, cutout, gemini

    t = prompts.find("props/cakes")[0]            # a block of the prompts file
    produce.produce(t, n=3)                       # candidates, checked + critiqued
    produce.produce(t, n=3, accept=True)          # …and promote the best one
    cut, report = cutout.key(Image.open(p))       # any drawing -> transparent
    data, mime = gemini.generate_image("…", refs=[], aspect="1:1")

`tools/art.py` is the same thing from the shell; `.claude/skills/art-generation/`
is how to drive it, and why it is shaped as it is.
"""
