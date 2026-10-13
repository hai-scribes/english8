# Browser tests

These drive a real Chromium against the built site and the Firebase Auth and
Firestore emulators. They cover what the ten gates in `tools/gates.sh` cannot:
signing in, work moving between devices, the day record, and the offline copy.
Nothing in them reaches Google or the live project.

```sh
npm install                              # once
npx playwright install chromium          # once
bash tests/support/playwright.sh                # everything
bash tests/support/playwright.sh tests/learn-anywhere.AC-4.spec.ts
```

The run starts the emulators and the test site itself and builds the site
twice the first time (about two minutes; kept until a source file changes).

Needs Node 20+, Python 3 and a Java runtime for the emulators. On macOS
`brew install openjdk` is enough: the runner finds Homebrew's JDK without it
being linked into the system.

| | |
| --- | --- |
| `support/harness.ts` | devices, accounts, the network between them, the store |
| `support/driver.ts` | does a learner's work on a lesson page |
| `support/CONTEXT.md`, `support/DRIVER.md` | how to write a test with them |
| `support/server.mjs` | the test site: serves a build, and can publish a later one, hang, or cut a download |
| `support/emulators.mjs` | starts the emulators; uses `firestore.rules` from the repo root |
| `support/builds.mjs` | the two builds the test site serves |

Ports: site 8793, Auth 9199, Firestore 8188 (`support/ports.mjs`).

## Pipeline commands (Atelier develop lane)

```sh
export MAIN_ROOT="$PWD"                  # from a linked worktree
export TYPECHECK_CMD='npx tsc -p . && node --check tools/assets/app.js'
export BUILD_CMD='python3 tools/build.py --check'
export TEST_CMD='bash tests/support/playwright.sh'
export INTERACTION_TEST_CMD='bash tests/support/playwright.sh'
export REGRESSION_BATCH_CMD='bash tests/support/playwright.sh'
export SCRIBE_CONTEXT_PACK_CMD='cat tests/support/PACK.md'
```
