Tests are Playwright (TypeScript), one file per criterion, each holding one
test named exactly as the criterion's `test:` field. Before writing anything,
read these four files in the target test directory; they are the whole API and
you may not guess beyond them:

- tests/support/CONTEXT.md — how a test is shaped, what the lab and a device
  offer, and what the pages expose
- tests/support/DRIVER.md — how to do a learner's work on a lesson page
- tests/support/harness.ts — the lab: devices, accounts, network, store, clock
- tests/support/driver.ts — the lesson driver

Import only `./support/harness` and `./support/driver`. Use the `lab` fixture,
never the bare `page`. If a criterion needs something those files do not
offer, set ok to false and say which helper is missing.
