# learn-anywhere — orientation

Facts about this repository, so a cycle is not spent rediscovering them. This
file steers every variant in every round and **nothing gates it**, so it states
what is true and avoids stating what is preferable. Design choices belong to
the variant.

## What the product is

A static site. `tools/build.py` (3,440 lines) reads `units/*.md` and writes 103
HTML pages into `docs/`, which GitHub Pages serves directly from `main`. There
is no server and no CI between a commit and the live page.

- **`docs/` is generated. Never hand-edit it** — `build.py` deletes
  `docs/assets/` wholesale on every run.
- The client is **`tools/assets/app.js`** (4,702 lines, plain ES, no bundler,
  no framework, no dependencies) and `tools/assets/app.css`. `build.py` copies
  both into `docs/assets/` and cache-busts them with a content hash in the
  query string (`ASSET_V`, around build.py:2377).
- `bash tools/gates.sh` runs the build then nine content gates in the only
  order they mean anything in. It takes about 5 seconds.

## Where learner state lives today

Eleven `localStorage` keys, all prefixed `en8:`, all written through small
save/load pairs in `app.js`:

| key | line | holds |
| --- | --- | --- |
| `en8:theme` | 9 | light/dark |
| `en8:progress:v1` | 39 | lesson completion |
| `en8:story:v1` | 521 | chapters read |
| `en8:review:v1` | 677 | the review queue |
| `en8:tasks:v1` | 1142 | marked task attempts |
| `en8:calib:v1` | 1321 | confidence calibration |
| `en8:played:<id>` | 3997 | single-play recording flags |
| `en8:write:v1` | 4193 | writing tasks |
| `en8:marks:<id>` | 4336 | passage highlights |
| `en8:notes:<id>` | 4337 | passage notes |
| `en8:flags:<id>` | 4570 | question review flags |

`app.js` makes **no network calls of any kind** today — no `fetch`, no
`XMLHttpRequest`. There is no service worker and no web app manifest.

## The harness

`.specs/prototype/learn-anywhere.checks.yaml` declares six scenarios; the code
is in `harness/` on this branch, which is a declared gate artifact — **editing
it disqualifies the variant that edits it.**

`serve:` boots the static site plus the Firebase Auth and Firestore emulators
and writes the ports it bound to `.atelier/harness/ports.json`. Read that file
rather than assuming a port. Per-scenario logs land beside it.

`harness/browser.mjs` carries the contract the gates assert — the markup
attributes they look for and how the configuration is injected. Read it first;
it is the specification of what the gates will accept.

Java note: the Firestore emulator is a Java program and Homebrew installs
`openjdk` keg-only, so it is not on `PATH`. `harness/lib.mjs`'s `javaEnv()`
resolves it. This is already handled — do not edit a shell profile.

## Constraints that are not style

- **Spark plan only.** No payment method is attached. Cloud Storage for
  Firebase requires the paid Blaze plan and is therefore unavailable.
- The Firebase web config is public by design and ships in the build. Security
  is enforced by `firestore.rules`, which `serve.mjs` loads from the worktree
  when present and otherwise runs deny-all.
- **Nothing on a page explains the design** — no criterion names, no CEFR
  levels, no citations. This binds the new sync and rhythm surfaces too.
- The nine content gates must stay green. `repo_gate_failures` is a charter
  guardrail because everything here lands in the same `app.js` that renders the
  curriculum.
