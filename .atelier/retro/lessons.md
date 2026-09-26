# Project lessons — durable dev observations

Domain-specific lessons learned while building this project. The AI
auto-redirects dev-observation memories here per `[[retro_destination_redirect]]`
instead of burning MEMORY.md lines + creating one project_*.md per save.

Format: append-only sections, terminal-friendly. Each entry should
cover what was non-obvious, why it mattered, and what you'd do next
time. Prefer one short paragraph per lesson.

Curate by running `/retro` periodically — that's the heavyweight
review pass; this file is the durable lightweight tracker.

- 2026-09-26 · test_reading.js injects app.js into every page itself, so a page
  that cannot load its own stylesheet or script passes every behavioural test.
  story/ and words/ shipped at depth=0 and were broken live (no chapter could
  open) until a UI walk-through with real Chrome caught it. The asset-path
  check in test_reading.js now guards it; when adding a page, pass the depth
  that matches its folder.
