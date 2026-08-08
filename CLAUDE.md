# English 8 — working notes for agents

Self-study material for Tiếng Anh 8 (Global Success), built as a static site.
`README.md` has the layout and provenance. Source of truth is `units/*.md`;
`docs/` is generated — never hand-edit it.

```sh
python3 tools/build.py            # regenerate docs/
python3 tools/build.py --check    # parse and report counts, write nothing
python3 tools/check_dict.py       # gate: every vocabulary slot resolves
```

## The IELTS knowledge base — read this before making any IELTS claim

`research/ielts/` holds a source-verified knowledge base (~93,000 words, nine
documents) describing what the IELTS test is, what its band descriptors say,
what is trainable toward them, how this course's twelve units map onto that,
and **what this repo may therefore build**. This project's standing goal is
that every lesson does double duty: teach the grade-8 curriculum *and* build
precursors toward IELTS. That knowledge base is the warrant for any such claim.

### How to search it — do not read the documents wholesale

They total 8,400 lines. Reading them to answer one question wastes a context
window. Instead:

1. **Grep the index.** `research/ielts/index.jsonl` is one JSON object per
   claim, with `tags` (controlled vocabulary), `terms` (natural-language
   synonyms), the exact `file` and `sec` to open, the evidential `marker`, and
   the `source` URL.
   ```sh
   grep -i 'overview' research/ielts/index.jsonl          # by natural term
   grep '"prohibition"' research/ielts/index.jsonl        # everything forbidden
   grep '"vietnamese-l1"' research/ielts/index.jsonl      # by controlled tag
   ```
2. **Jump to the `file` and `sec` the hit names.** Read that section only.
3. `research/ielts/ROUTER.md` maps common questions to locations if grep misses.
4. `research/ielts/README.md` is the full human index — read it when you need
   the whole picture, not to answer one question.

Every claim carries an **evidential marker**. `[V]`/`[C]` are adversarially
verified; `[Q]`/`[D]` are verbatim Tier-1; `[S]` is sourced but unverified;
`[S/NS]` is quoted but panel-unsustained; `[T2]` is research evidence and never
a rule of the test; `[INF]` is the citing document's own reasoning; `[SPEC]` is
untested; `[X]` was tested and not sustained. **Never upgrade a marker when
re-citing.** `README.md` §2 has the full table.

### Hard prohibitions

These hold repo-wide and need no lookup. Each traces to a documented gap.

- **No IELTS band number may ever be output** — not a score, not a prediction,
  not a progress dial. No published raw-score→band table, no half-band
  descriptors, no official criterion-to-band arithmetic exists. **Label by CEFR
  instead** — and note the official alignment bottoms out at band 4.0 = B1, with
  no band at all for A2 or A1, which is where grade-8 learners sit.
- **No Speaking rubric or Speaking feedback tool.** Only two Speaking claims
  survived verification.
- **No Vietnamese pronunciation tooling** beyond the three sourced findings in
  `07` §5.5; vowels, region and intelligibility ranking are open gaps.
- **Do not average Speaking's four criteria** — the equal-weighting claim errored
  in verification. Report them separately.
- **Writing descriptor claims must cite the [2023] version.** Two official
  versions circulate with different wording; bullet-style cells are a [2013]
  tell.
- **"Write more complex sentences" is not a valid progress metric.** Syntactic
  complexity peaks at band 7 and falls at band 8.
- Rising error rate alongside rising range is the **expected** signature of
  progress at A2→B1. A tool reporting "your accuracy got worse" will be wrong.

`research/ielts/09-design-principles.md` §1 is a 66-item checklist any new
lesson, tool or test can be audited against; §7.1 lists what is blocked and what
would unblock it.

### Maintaining the knowledge base

- Never delete a `> **GAP**` blockquote that is still real — removing an honest
  limitation is worse than the limitation.
- Never assert the negation of a claim that failed verification. Unproven is not
  disproven.
- Tier 3 (prep blogs, teacher lore) is never a warrant — only ever the *object*
  of a claim.
- If you add or move a claim, update `index.jsonl` in the same change.
