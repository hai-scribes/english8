# Code Patterns — production-quality engineering rules

These rules are injected into Atelier elevate/extract/scribe prompts via
`prepare-payload.sh` (the `<RULES_PATTERNS>` block). They give the LLM
a project-specific bar for code quality. Override the per-rule sections
below with patterns that match your stack; the headings shown are the
categories the W3.3 prompts know to look for.

Format: `## Section`, one short paragraph (the rule), then `good:`/`bad:`
examples on bulleted lines when helpful. Keep entries concrete and
short. Anti-patterns help as much as patterns.

These starter entries are illustrative — replace with your stack's
actual patterns before running `/develop` on shippable specs.

## Type safety
No `any`. Narrow `unknown` instead.

## External API — timeouts
Every external call has an explicit timeout (max 10s).
- good: `fetch(url, { signal: AbortSignal.timeout(5000) })`
- bad: `fetch(url)`

## Error handling
Catch at the boundary, not at every call site. Internal code trusts
internal contracts; only validate at system boundaries (user input,
external APIs, persisted state).

## User-action responsiveness
>400ms needs a fix, not a spinner. Prefer optimistic update >
background processing > lazy load > loading indicator.
