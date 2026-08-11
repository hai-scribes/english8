# Where the original came from

## The source

| | |
| --- | --- |
| Title | *Tiếng Anh 8 — Global Success*, Sách học sinh (student's book) |
| Publisher | NXB Giáo dục Việt Nam × Pearson Education, 2023 |
| ISBN | 978-604-0-35127-2 |
| Chief editor | GS.TS. Hoàng Văn Vân · chief author Lương Quỳnh Trang |
| File read | `Tiếng anh 8 Global Success - Sách học sinh - minhphamblog.pdf` |
| Held at | `~/Downloads/` on the maintainer's machine — **not in this repo** |
| Size | 34,037,080 bytes · 143 pages |
| SHA-256 | `9875ea146df5d9b9a71a7030dc8fd6aca44a8410c76803aec76fc6cacc8b63dc` |
| Read on | 2026-08-10, page by page as images — the scan has no text layer |

The checksum is here so a future copy can be proved to be the same edition
before anything is checked against it. Two editions of a textbook with the same
title is exactly the kind of difference that would make the record silently
wrong.

## Page arithmetic

Book page *n* is PDF page *n + 2*. Units are 10 book pages each, Reviews 2, the
glossary 4 (pp. 136–139). Every unit file records its own page range in the
`# Unit N` heading, and `index.jsonl` carries it in the `pages` field.

Audio track numbers are printed on the page and are recorded with the exercises
that use them, because they identify which recording on sachmem.vn a listening
task belongs to.

## Why the PDF is not committed

The imprint reserves all reproduction rights, this repository is public, and
`docs/` publishes to GitHub Pages. A 34 MB copyrighted scan in the tree would be
a redistribution regardless of which directory it sat in, and git would keep it
after any later deletion.

**Do not add it.** If a future reader needs the original, this file says which
file it is and how to prove a copy is the right one.

## What was extracted instead

`curriculum/sgk/` — the syllabus at exercise resolution: what each exercise
asks, its type, its cues, its target language, and the book's own glossary with
its IPA and Vietnamese. Passages and scripts are **described, not transcribed**.

That is the whole of what the site is checked against. `tools/check_coverage.py`
reads `targets.json`; `tools/build.py` never opens this directory at all, so
nothing recorded here can reach a published page.
