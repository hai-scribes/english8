# learn-anywhere — orientation

> **DRAFT for re-freeze (harness v2, 2026-09-25).** Proposed replacement for
> `.specs/prototype/learn-anywhere.orientation.md` on `prototype-lane-review`.
> What changed and why is in `AMENDMENTS.md` beside this file.

Facts about this repository, so a cycle is not spent rediscovering them. This
file steers every variant in every round and **nothing gates it**, so it states
what is true and avoids stating what is preferable. Design choices belong to
the variant.

## What the product is

A static site. `tools/build.py` (~3,470 lines) reads `units/*.md` and writes 103
HTML pages into `docs/`, which GitHub Pages serves directly from `main` at
`https://hai-scribes.github.io/english8/` — **under `/english8/`, not at the
root**. There is no server and no CI between a commit and the live page.

- **`docs/` is generated. Never hand-edit it** — `build.py` deletes
  `docs/assets/` wholesale on every run.
- The client is **`tools/assets/app.js`** (~4,700 lines, plain ES, no
  framework) and `tools/assets/app.css`. `build.py` copies both into
  `docs/assets/` and cache-busts them with a content hash in the query string
  (`ASSET_V`, around build.py:2380).
- Milestone 1 added the sign-in layer: **`tools/assets/auth-src.mjs`**, which
  `build.py` bundles with esbuild (from `node_modules/`) straight into
  `docs/assets/auth.bundle.js`, and **`tools/assets/firebase-config.js`**, the
  public web config (a placeholder project today). Every page loads the config
  as a classic script and the bundle as a module. The bundle is versioned off
  `auth-src.mjs` only, so a Firebase SDK bump does not change its `?v=`.
- Script order on a page: `firebase-config.js`, then the module bundle, then
  `app.js` as a classic script at the end of `<body>`. `app.js` renders the
  marked tasks at `DOMContentLoaded`, which fires **after** module scripts have
  run — code in the bundle that looks for a task at module time finds none.
- `bash tools/gates.sh` runs the build then nine content gates in the only
  order they mean anything in. It takes about 5 seconds.

## Learner state: there is none to carry

**This is a fresh app — no users, no history, no backwards compatibility**
(operator decision, 2026-09-25). Nothing already in a learner's
`localStorage` has to survive, be migrated or keep its format. The sync layer
may own storage outright — one store that `app.js` reads and writes through —
and the existing save/load pairs in `app.js` may be changed or removed.

For orientation only, `app.js` today keeps its state in `localStorage` under
`en8:` keys through small save/load pairs (tasks at ~line 1142, review queue
~677, writing ~4193, passage marks/notes ~4336, and others). It reads that
state **once, at boot**, and paints from it. Work that arrives from another
device after boot is not on the page until something paints it again —
in place or by reloading.

No gate reads storage. The gates assert on what the learner sees: a task
answered on one device is shown done — same answers, same marks, same attempt
history — on the other.

## The harness

`.specs/prototype/learn-anywhere.checks.yaml` declares six scenarios; the code
is in `harness/` on this branch, which is a declared gate artifact — **editing
it disqualifies the variant that edits it.**

`serve:` boots the static site under `/english8/` plus the Firebase Auth and
Firestore emulators, and writes the ports it bound to
`.atelier/harness/ports.json`. Read that file rather than assuming a port.
`node harness/stack.mjs <scenario>` runs one scenario against a live stack and
boots one if none is up — it is what the benchmarks call.

`harness/browser.mjs` carries the contract the gates assert — the markup
attributes they look for, what each sync state means, and how the
configuration is injected. **Read it first; it is the specification of what
the gates will accept.** In particular:

- `syncing` must be showing **before any request to a backend leaves the
  page**, including the SDK's own start-up traffic (auth initialisation, token
  refresh) and any request a service worker makes on the page's behalf. A
  request that leaves while the page reads `idle` or `synced` — or before the
  indicator exists — is a silent operation, and one fails milestone 4.
  `data-en8-auth-state="signing-in"` also surfaces a request: the learner has
  just asked for it.
- `syncing` covers a pending local change, not only an open request: it shows
  from the moment of the change, through any debounce, until the backend has
  it. `synced` is never shown over an unsent change.
- The service worker must let `assets/firebase-config.js` through to the
  network, never answer it from a cache. The harness substitutes that file to
  point the app at the emulators; a cached copy is the production config and
  the page stops talking to the emulators.
- After a new build is published, the new `app.js` must reach a device that
  already has the old one within three ordinary reloads. A worker that serves
  cached HTML pins the device to the old `?v=` hash forever.
- The site is served with **no custom response headers** (GitHub Pages cannot
  send any), so a service worker has to live at or above the scope it claims.

Firestore **lite** (`firebase/firestore/lite`) issues one-shot REST requests,
each of which starts and ends inside a state the page chose. The full
Firestore SDK keeps a listen channel and re-issues requests on it on its own
schedule; the audit judges each request by the state showing when it LEFT,
so every one that leaves while the page reads `synced` counts as silent.
That is a fact about what the audit sees, not a prescription.

Java note: the Firestore emulator is a Java program and Homebrew installs
`openjdk` keg-only, so it is not on `PATH`. `harness/lib.mjs`'s `javaEnv()`
resolves it. This is already handled — do not edit a shell profile.

Sign-in note: `signInWithPopup` loads `https://apis.google.com/js/api.js`
even against the Auth emulator (the SDK and the emulator's helper iframe talk
over `gapi.iframes`). A machine that cannot reach that host cannot complete
sign-in, and every browser gate then fails at "signing in".

## Constraints that are not style

- **Spark plan only.** No payment method is attached. Cloud Storage for
  Firebase requires the paid Blaze plan and is therefore unavailable.
- The Firebase web config is public by design and ships in the build. Security
  is enforced by `firestore.rules`, which `serve.mjs` loads from the worktree
  when present and otherwise runs deny-all. The isolation check asks the rules
  engine directly, as a second learner, for every document that exists.
- The daily and weekly record is keyed by the learner's **local** day
  (Quy Nhơn, UTC+7); the gate works at 06:30 local, which is the previous day
  in UTC. It must never show a streak, a score, a comparison or time spent.
- **Nothing on a page explains the design** — no criterion names, no CEFR
  levels, no citations. This binds the new sync and rhythm surfaces too.
- The nine content gates must stay green. `repo_gate_failures` is a charter
  guardrail because everything here lands in the same `app.js` that renders the
  curriculum.
