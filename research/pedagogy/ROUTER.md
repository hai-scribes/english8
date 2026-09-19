# Router — finding things in this knowledge base

Six documents. **Do not read them to answer a question.** Grep `index.jsonl`,
then open only the section it names.

`index.jsonl` holds **99 claims** (as of 2026-09-05), one JSON object per line,
carrying the file and section to open, the evidential marker, the source URL, and
a `terms` field of natural-language synonyms so grep lands even when your wording
differs from the document's.

## The protocol

```sh
cd research/pedagogy

# 1. Find — by natural term, controlled tag, or both
grep -i 'how many minutes' index.jsonl
grep '"build-rule"' index.jsonl
grep -i 'tutor' index.jsonl | grep '"gap"'

# 2. Read the hit: it names file + sec, e.g. "01-homework-dose.md" "§5"

# 3. Open only that section
```

Pretty-print hits instead of reading raw JSON:

```sh
grep -i 'streak' index.jsonl | python3 -c "
import sys,json
for l in sys.stdin:
    c=json.loads(l); print(f\"{c['file']} {c['sec']:6} [{c['mk'] or '-'}] {c['claim']}\")"
```

Counts below are as of 2026-09-05 and drift when the index is updated. Refresh
them all at once:

```sh
for t in build-rule gap prohibition blocked refuted method-note dose time-metric \
         effort frequency interleaving spacing tutoring parental reward \
         adherence motivation lesson-design extensive-listening foreign-language; do
  printf '%-22s %s\n' "$t" "$(grep -c "\"$t\"" index.jsonl)"
done
```

## Fields

Identical to `../ielts/index.jsonl`, so one grep recipe works on both.

| Field | Use |
| --- | --- |
| `id` | Stable handle. `p06-1-P3` is build rule **P3**; `p01-5-a` is `01` §5 |
| `file`, `sec`, `heading` | Where to open |
| `mk` | **Normalised marker** — grep this, not `marker`. `V S S/NS X INF SPEC`, or empty |
| `marker` | The document's verbatim marker |
| `claim` | Self-contained. Correct on its own without opening the file |
| `tags` | Controlled vocabulary — reliable for grep |
| `terms` | Natural-language synonyms — what makes fuzzy queries land |
| `source` | URL, or empty where the claim is this base's own reasoning |
| `note` | **Sample sizes, effect sizes, votes and caveats. Read this before using a claim** |

## Markers — what you may do with a hit

**Never upgrade a marker when re-citing.** `../ielts/README.md` §2 is canonical.

| `mk` | Lines | Meaning |
| --- | --- | --- |
| `V` | 30 | Sustained by a 3-vote adversarial panel |
| `S` | 13 | Sourced and quoted, but not panel-verified — or verified only through an abstract, a paywall or a secondhand summary |
| `S/NS` | 4 | Quoted, **but the panel did not sustain it** (2-1). Weaker than `V` — say so at point of use |
| `X` | 10 | **Tested and not sustained.** Neither the claim nor its negation is asserted |
| `INF` | 22 | This base's own reasoning, including all 15 build rules |
| *(empty)* | 20 | Gap statements and structural notes |

**Find gaps by the `gap` *tag*, never by `mk`** — a gap line's marker describes
the evidence around the absence, not the absence itself.

**`X` lines are the second most useful thing here.** Ten claims were refuted,
several of them figures that look quotable and are not: the "15% of an SD" for
daily assignment, the `0.37 SD` tutoring benchmark, the `8–43%` spacing rule, the
Deci per-contingency numbers. Grep `'"refuted"'` before quoting any effect size
you half-remember from this area.

## Common questions → where to look

| You need | Grep |
| --- | --- |
| A rule the site must follow | `'"build-rule"'` (36) — all 15 are `p06-1-P*` |
| What a tool may **not** do | `'"prohibition"'` (14) or `'"blocked"'` (10) |
| Whether something is a **known unknown** | `'"gap"'` (32) — a third of this base |
| Whether a figure was **refuted** | `'"refuted"'` (10) |
| How much / how long to assign | `'"dose"'` (19) |
| Why minutes are not tracked | `'"time-metric"'` (10) |
| What to show as progress instead | `'"effort"'` (8) |
| Mixing vs blocking practice | `'"interleaving"'` (11) |
| Review intervals and day offsets | `'"spacing"'` (8) |
| The Saturday session | `'"tutoring"'` (11) or `'"parental"'` (4) |
| Streaks, points, badges | `'"reward"'` (5) |
| Who keeps going, who drops out | `'"adherence"'` (7) |
| Lesson shape, TBLT, PPP | `'"lesson-design"'` (5) or `'"tblt"'` (4) |
| Whether the research process itself is trustworthy | `'"method-note"'` (11) |

## What this index does not do

- **It carries no negations.** A claim absent from the index is not thereby
  false. `"gap"` lines mark the cases where the difference was checked.
- **It does not resolve the open question.** Interleaving-versus-blocking returns
  both directions plus a line saying it is undetermined. That is correct; do not
  pick a side from the index alone.
- **It does not carry the population.** Nearly every `note` names the sample, and
  the sample is usually the reason a finding cannot be used as it stands. **Read
  `note` before quoting `claim`.**

## Keeping it current

If you add, move or reword a claim, update `index.jsonl` in the same change.
Validate before committing:

```sh
python3 -c "
import json,collections
rows=[json.loads(l) for l in open('research/pedagogy/index.jsonl')]
ids=collections.Counter(r['id'] for r in rows)
assert not [i for i,n in ids.items() if n>1], 'duplicate ids'
print(len(rows),'lines OK')"
```
