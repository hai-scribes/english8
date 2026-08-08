# Design Foundations — production-quality UI rules

These rules are injected into Atelier elevate/extract/scribe prompts via
`prepare-payload.sh` (the `<RULES_DESIGN_FOUNDATIONS>` block). They give
the LLM a project-specific bar for UI quality. Override the per-rule
sections below with rules that match your product; the headings shown
are the categories the W3.3 prompts know to look for.

Format: `## Section`, one short paragraph (the rule), then `good:`/`bad:`
examples on bulleted lines. Keep entries terminal-friendly — these are
read by both humans during review and by LLMs during dispatch. The
shorter and more concrete, the better.

These starter entries are illustrative — replace with your product's
actual UI bar before running `/develop` on shippable specs.

## Error messages
"[What went wrong]. [How to fix it]." Never just "Error".
- good: "Email already registered. Sign in instead."
- bad: "Error"

## Empty states
Never blank. Guidance, illustration, or CTA.
- good: empty dashboard → illustration + "Create your first project" button
- bad: blank white area

## Loading
Skeleton for layout, spinner for actions; spinner only after 1s.

## Feedback timing
User actions need acknowledgement within 100ms. >400ms needs a fix, not
a spinner — see patterns.md "User-action responsiveness".

## Form labels
Always visible; placeholder is NOT a label. Required fields marked
explicitly; error text adjacent to the field, not at form-bottom.

## Disabled controls
Disabled state needs a tooltip or inline reason. Silent disabled =
broken UX. Prefer enabling + showing the validation error on submit.
