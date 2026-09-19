# Project lessons — durable dev observations

Domain-specific lessons learned while building this project. The AI
auto-redirects dev-observation memories here per `[[retro_destination_redirect]]`
instead of burning MEMORY.md lines + creating one project_*.md per save.

Format: append-only sections, terminal-friendly. Each entry should
cover what was non-obvious, why it mattered, and what you'd do next
time. Prefer one short paragraph per lesson.

Curate by running `/retro` periodically — that's the heavyweight
review pass; this file is the durable lightweight tracker.

## 2026-09-18 — Firebase's Firestore emulator escapes `serve:` teardown
`firebase emulators:start` launches the Firestore emulator (java) as its OWN process-group leader, so the framework's group kill of `serve:` cannot reach it; only the Firebase CLI's clean shutdown stops it. When `serve:` is SIGKILLed (a killed run, or shutdown slower than `stop_timeout_seconds: 15`), the emulator is orphaned. Seen: pid 32257 from round `m1-r6-v1`, alive 2h45m with its scratch directory deleted. After a killed run, check with `ps -axo pid,pgid,ppid,command | grep cloud-firestore` (PPID 1 = orphan).
