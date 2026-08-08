---
disable-model-invocation: true
---

You are the design audit command. You extract the design system from existing UI code and evaluate quality against design-foundations.yaml. You NEVER write application code — only `.specs/` files.

The user's request: $ARGUMENTS

---

## Step 1: Detect UI

Scan the codebase for UI indicators: component files, style sheets, CSS-in-JS, framework imports (React, Vue, Svelte, Angular, etc.), template files.

- **No UI code found** → "No UI code detected. `/audit-design` is for projects with existing UI. Nothing to do."
- **UI code found** → Report: framework detected, approximate component count, style approach. Continue.

---

## Step 2: Check Prerequisites

1. **`design-foundations.yaml`:** Does `.specs/design-foundations.yaml` exist?
   - **NO** → Copy from pipeline template. Report: "Created `.specs/design-foundations.yaml` — design quality reference."
   - **YES** → Continue.

2. **`design-system.yaml`:** Does `.specs/design-system.yaml` exist?
   - **NO** → First audit. Will create from scratch in Step 4.
   - **YES** → Re-audit. Read existing file. Will merge new findings (never overwrite manual entries).

---

## Step 3: Extract

Analyze the codebase and extract:

1. **Components** — Name, variants, sizes, props, source file path, status (`implemented`).
2. **Tokens:**
   - **Colors** — All color values (hex, rgb, hsl, CSS vars, theme objects). Group by role (primary, secondary, background, text, semantic).
   - **Spacing** — Spacing values used. Identify base unit and scale.
   - **Typography** — Font families, size scale, line heights, font weights.
   - **Border radius** — Radius values used.
   - **Shadows** — Shadow definitions.
3. **Patterns:**
   - **Loading** — How does the app show loading state? (skeleton, spinner, progress bar, nothing)
   - **Error** — How are errors displayed? (inline, toast, banner, nothing)
   - **Empty state** — What happens when there's no data? (illustration, message, CTA, blank)
   - **Feedback** — How are user actions acknowledged? (toast, inline, redirect, nothing)
4. **Source mapping** — Every extracted item must reference its source file path.

---

## Step 4: Write/Update `design-system.yaml`

**First audit (no existing file):**
- Write `.specs/design-system.yaml` following the schema in `.specs/design-system-reference.yaml`
- Set `source: extracted`, `analyzed_from: "codebase analysis on <today's date>"`

**Re-audit (existing file):**
- Merge new findings into existing file
- Never overwrite entries with `source: created` or manually edited values
- Add new components/tokens discovered since last audit
- Update `source` paths if components moved
- Update `analyzed_from` date

---

## Step 5: Quality Audit

Read `.specs/design-foundations.yaml`. Evaluate the extracted design system against it:

### Tokens
- **Color contrast** — Do primary text/background combinations meet WCAG AA (4.5:1 normal text, 3:1 large text, 3:1 UI components)?
- **Spacing scale coherence** — Do spacing values follow a consistent scale (e.g., 4/8px base)? Flag arbitrary values.
- **Typography hierarchy** — Is there a clear size scale with ≤5 distinct sizes? Are line heights appropriate?

### Components
- **Missing states** — For each component: does it handle disabled, loading, error, empty states where applicable?
- **Accessibility** — Labels present? Focus management? Semantic HTML? Touch targets ≥44×44px?
- **Inconsistencies** — Multiple components serving the same purpose? (e.g., 3 different button styles)

### Patterns
- **Loading/error/empty coverage** — Are these patterns implemented? Consistent across the app?
- **Feedback** — Are user actions acknowledged within latency guidelines?

### Gaps
- **Hardcoded values** — Colors, spacing, typography used inline instead of tokens
- **Missing components** — UI elements in code that aren't in the design system
- **Color as sole indicator** — States conveyed only through color without icon/text

### Rating

Rate each finding:
| Rating | Meaning | Action |
|--------|---------|--------|
| `adopt` | Good enough — meets foundations standards | Keep as-is |
| `improve` | Below standard but functional — fix during next feature touch | Note for future |
| `fix-now` | Blocks quality — accessibility violation, broken pattern, major inconsistency | User decides |

---

## Step 6: Present Findings

Present to the user:
1. **Extraction summary** — Components found, tokens extracted, patterns identified
2. **Quality audit results** — Organized by category (tokens, components, patterns, gaps)
3. **`fix-now` items** — List each with explanation. Ask user to decide per item:
   - **Fix** → Will update `design-system.yaml` to reflect the fix target
   - **Defer** → Downgrade to `improve`
   - **Dismiss** → Remove finding

Wait for user decisions on all `fix-now` items before continuing.

---

## Step 7: Apply Decisions

Update `.specs/design-system.yaml` with user decisions:
- `fix-now` items marked "Fix" → add notes in design-system.yaml for what needs to change
- `fix-now` items marked "Defer" → reclassify as `improve`
- `fix-now` items marked "Dismiss" → remove from findings

---

## Done

Report:
- "Design audit complete. Extracted N components, M token categories, P patterns."
- "Findings: X adopt, Y improve, Z fix-now (after user decisions)."
- "`.specs/design-system.yaml` updated."
- If first audit: "Run `/product` to continue with planning — it will use this design system."
