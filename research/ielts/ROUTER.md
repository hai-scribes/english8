# Router — finding things in this knowledge base

The nine documents total ~93,000 words. **Do not read them to answer a
question.** Grep `index.jsonl`, then open only the section it names.

`index.jsonl` holds **1,244 claims**, one JSON object per line. Every line
carries the file and section to open, the evidential marker, the source URL,
and a `terms` field of natural-language synonyms so grep finds it even when
your wording differs from the document's.

## The protocol

```sh
cd research/ielts

# 1. Find — by natural term, controlled tag, or both
grep -i 'overview' index.jsonl
grep '"prohibition"' index.jsonl
grep -i 'paraphrase' index.jsonl | grep '"speaking"'

# 2. Read the hit: it names file + sec, e.g. "05-writing.md" "§2.3"

# 3. Open only that section
```

Pretty-print hits instead of reading raw JSON:

```sh
grep -i 'coda' index.jsonl | python3 -c "
import sys,json
for l in sys.stdin:
    c=json.loads(l); print(f\"{c['file']} {c['sec']:9} [{c['mk'] or '-'}] {c['claim']}\")"
```

Count what exists before committing to a line of enquiry:

```sh
grep -c '"vietnamese-l1"' index.jsonl      # 114
grep -c '"gap"' index.jsonl                # 177
```

## Fields

| Field | Use |
| --- | --- |
| `id` | Stable handle. `09-1-D7` is checklist item D7; `08-3-U8` is Unit 8 |
| `file`, `sec`, `heading` | Where to open. Every `sec` is verified to resolve |
| `mk` | **Normalised marker** — grep this, not `marker`. `V C Q D S S/NS T2 X ? INF SPEC`, or empty |
| `marker` | The document's verbatim marker, including vote. Punctuation varies by document |
| `claim` | Self-contained. Correct on its own without opening the file |
| `tags` | Controlled vocabulary — reliable for grep |
| `terms` | Natural-language synonyms — what makes fuzzy queries land |
| `source` | Tier-1/2 URL, or empty where the document cites a sibling |
| `note` | Caveats, sample sizes, effect sizes. **Read this before using a claim** |

## Markers — what you may do with a hit

Grep `"mk":"V"` etc. **Never upgrade a marker when re-citing.**

| `mk` | Lines | Meaning |
| --- | --- | --- |
| `V` / `C` | 61 / 79 | Adversarially verified, 3-vote panel. Same strength; two labels are an artefact of different passes |
| `Q` / `D` | 112 / 4 | Verbatim Tier-1 quote / band-descriptor wording |
| `S` | 252 | Sourced from a primary document but not panel-verified |
| `S/NS` | 29 | Quoted from the source, **but the panel did not sustain it**. Weaker than `V`/`C` — say so at point of use |
| `T2` | 134 | Research evidence. A tendency in candidate performance, **never a rule of the test** |
| `X` | 23 | Tested and not sustained. **Neither the claim nor its negation is asserted** |
| `?` | 2 | Verification errored. Usable only with the marker attached |
| `INF` / `SPEC` | 12 / 1 | The document's own reasoning / untested speculation |
| *(empty)* | 533 | Structural, authorial synthesis, or a gap statement |

## Common questions → where to look

| You need | Grep |
| --- | --- |
| What a tool may **not** do | `'"prohibition"'` (229) or `'"blocked"'` (44) |
| Whether something is a **known unknown** | `'"gap"'` (177) |
| Whether a belief is **prep folklore** | `'"folklore"'` (109) — `note` says *contradicted* vs *merely unsupported* |
| To **audit a lesson or tool** | `'09-1-'` — all 66 checklist items + 7 fast-gate items |
| What a **specific unit** trains | `'"u8"'` — units `u1`–`u12`, in `08` only |
| What separates **two bands** | `'"band-delta"'` (100) |
| What **caps** a score | `'"band-ceiling"'` (129) — includes 19 real examiner verdicts |
| **Vietnamese learner** evidence | `'"vietnamese-l1"'` (114) |
| **CEFR** labelling | `'"cefr"'` (55) |
| **Question types** | `'"question-type"'` (107) |
| **Marking mechanics** (word limits, spelling) | `'"marking-rule"'` (122) |
| Which **descriptor version** applies | `'"version-conflict"'` (72) |
| **Pedagogy** evidence with effect sizes | `'"pedagogy"'` (156) — sizes are in `note` |
| Computer-delivered vs paper | `'"computer-delivered"'` (50) |

## What the index does not do

- **It is not a substitute for the source section.** Lines are lossy by design —
  a claim needing exact descriptor wording must be read in the file, and quoted
  from the `[2023]` Writing descriptors with the version string attached.
- **It does not rank or resolve.** Where the knowledge base holds an open
  question — rarity vs formulaicity in Lexical Resource is the main one — the
  index returns both sides plus a line saying it is unresolved. That is correct;
  do not pick a side from the index alone.
- **It carries no negations.** A claim absent from the index is not thereby
  false. Absence means unindexed or unestablished, and `"gap"` lines mark the
  cases where the difference was checked.

## Keeping it current

If you add, move or reword a claim in any of the nine documents, update
`index.jsonl` in the same change. Regenerate-and-diff is safer than hand-editing.
Validate before committing:

```sh
python3 -c "
import json,collections
rows=[json.loads(l) for l in open('research/ielts/index.jsonl')]
ids=collections.Counter(r['id'] for r in rows)
assert not [i for i,n in ids.items() if n>1], 'duplicate ids'
print(len(rows),'lines OK')"
```
