# Writing tests for `learn-anywhere`: what the project gives you

The tests are Playwright (`@playwright/test`, TypeScript, Chromium). They live
in `tests/` beside `tests/support/`. One file per criterion,
`tests/learn-anywhere.AC-N.spec.ts`. Run with `bash tests/support/run.sh <file>`,
which starts the Firebase Auth and Firestore emulators and the test site by
itself. Nothing reaches Google or the real project.

**Import only from these two files** (relative to `tests/`), and read them —
they are short and they are the whole API:

```ts
import { test, expect, TEXT, ADDR, docIdOfKey, keyOfDocId, type Device, type Account } from "./support/harness";
import * as lesson from "./support/driver";
```

**Name each test exactly as the criterion's `test:` field** — the pipeline
finds the file by that name: `test("test_learn_anywhere_AC4_work_follows_account_to_second_device", …)`.
One `test()` per file. Write imports as if the file already sits in `tests/`
(`./support/harness`), although you write it to the staging folder.

Do not use the bare `page`/`context` fixtures: they are not wired to the test
site. Every test takes `{ lab }` and makes its own devices.

```ts
test("test_learn_anywhere_AC4_work_follows_account_to_second_device", async ({ lab }) => {
  const her = lab.account();
  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  const id = await lesson.answerTask(a.page);
  await a.expectSaved();
  const b = await lab.device();
  await b.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskNotDone(b.page, id);          // before: the cause is the sign-in
  await b.signIn(her);
  await lesson.expectTaskDone(b.page, id);
});
```

## The lab (`tests/support/harness.ts`)

| | |
| --- | --- |
| `lab.account(name?)` | a new account (an email) no other test has |
| `lab.device(opts?)` | a new device: its own storage, service worker, network and clock. `opts`: `timezone` (`"Asia/Ho_Chi_Minh"`), `at` (ISO instant; installs a clock the test controls), `saveData: true`, `viewport` |
| `lab.store` | the Firestore emulator, read past the rules: `docs(account)` → `{id, key, v, t, s}[]` under `users/<uid>/kv`; `value(account, key)` (string, `null` for a kept deletion, `undefined` when absent); `expectValue(account, key, check)`; `uid(account)`; `as(idToken, op, path)` → HTTP status of one `get`/`list`/`create`/`update`/`delete` made with a client's ID token, so the rules apply (200 allowed, 403 refused); `seed(path)` |
| `lab.site` | this test's copy of the site: `publish("b2")` publishes a later build of the same sources (`"b1"` is the first); `hang(pattern)` holds matching requests open unanswered; `cutAfter(n)` answers n more file requests then drops the rest; `down()`; `asked()` lists the paths asked for |

A **device** (`Device`): `page`, `context`; `open(path)`, `home()`,
`lesson(unit, n)`, `newTab(path?)` (another tab, same storage and account).

- **Account**: `signIn(account, { signedOutWork?: "add" | "separate" })`;
  `startSignIn()` returns the popup untouched; `completeSignIn(popup, account)`;
  `signOut()`; `credential()` → `{ uid, idToken }` of the signed-in account;
  `signInBehindThePage(account)` signs a different account in on the device
  without the page's controls (the page then meets an account it did not sign in).
- **What the page says**: `status` (the role=status "Sync status" locator),
  `expectStatus(text)`, `expectSaved()`, `expectAuth("signed-out" | "signing-in" | "signed-in")`,
  `signInButton`, `signOutButton`, `retryButton`, `addItButton`,
  `keepSeparateButton`, `days` (the "Your days" region), `build()`.
  `TEXT` holds every status sentence in the spec, verbatim.
- **Network**: `offline(on)` (no network at all); `backendUnreachable(on)` (the
  site loads; sign-in and the store cannot be reached); `failSaves(on)` (writes
  to the store get an error, reads work); `holdSaves(on)` (writes are held open
  until released).
- **Requests to the store**: `storeRequests` — each `{ url, method, kind:
  "read" | "write" | "other", status, auth, docsRead, docsWritten, code, at }`,
  where `status` and `auth` are what the page showed at the instant the request
  left. `mark()` then `requestsSince(mark)`, `docsReadSince(mark)`,
  `writesSince(mark)`.
- **Drawn again**: a redraw is a reload of the document. `draws()` counts loads;
  `drawsSince(n)`.
- **Work from another device**: a device looks for it when a page loads, when
  the tab is returned to, when the network comes back, after each of its own
  saves, and once a minute while the tab shows. `returnToTab()` causes the
  second of those; opening a page causes the first. Do not wait for the minute.
- **Clock** (only on a device made with `at`): `setTime(iso)`, `advance(ms)`
  (lets that much time pass, firing timers). The emulators keep real time.
- **Storage**: `stored(key)`, `setStored(key, value)` (through
  `localStorage.setItem` on the page, as lesson code writes), `removeStored(key)`,
  `storage()`, `storageText()` (all of localStorage and sessionStorage as one
  string — for "cannot be read from the browser's storage"), `storageFull(on)`
  (no room for anything new or bigger).
- **Offline copy**: `workerReady()`, `keptPaths()`, `courseKept()` (waits until
  every file in the published `/precache.json` is kept).

## What the pages expose (the feature provides these; assert on them)

- `<html data-auth="signed-out | signing-in | signed-in">` — the auth state.
- `<html data-build="…">` — the id of the build whose script is running. Two
  builds have different ids.
- The sync status is one element, `role="status"`, accessible name
  `Sync status`. Idle is empty text. It sits in the page header beside the
  account, on every page. The account's email is shown in the header.
- The controls have exactly the names in the spec's `ui_contract`.
- "Your days" is a region named `Your days` **on the Today page**
  (`/index.html`), with a heading and one list per week.
- Lesson pages already mark a committed task as
  `[data-task="<id>"][data-done="1"]`; a timed test running sets `body.exam-on`.
- The site reads its Firebase settings from `/assets/firebase-config.js`
  (`window.EN8_FIREBASE`). In tests that file points at the emulators.
- It talks to Firestore with plain `fetch` to the REST endpoints (`:runQuery`,
  `:batchGet`, `:commit`) — no long-lived channel — which is what
  `storeRequests` records and counts.
- Documents are `users/<uid>/kv/<id>` with fields `v`, `t`, `s`, as the spec's
  `entities.creates` describes; `docIdOfKey` / `keyOfDocId` convert.
- `/precache.json` is `{ "v": "<build id>", "files": { "<path relative to the site root>": "<hash>" } }`.
- The service worker is `/sw.js`.

## Rules of thumb

- Arrange with the UI where the criterion is about the UI (answer a task with
  `lesson.answerTask`). Where a criterion is about data of many kinds or
  volumes (AC-5, AC-34, AC-38, AC-40), arrange with `setStored` and
  `lesson.LEARNER_KEY_SAMPLES` — a real `localStorage.setItem` on the page.
- Assert on another device or on `lab.store`, not on the device that did the
  work, whenever the criterion says "other devices" or "the backend".
- A fresh device has no service worker until a page has loaded online; call
  `workerReady()` before going offline.
- Every test's accounts and site steering are its own; tests run in parallel.
- Two devices never share storage. Two tabs of one device do.

- The site has no control that un-marks a finished lesson. For AC-33 arrange
  the un-marking with `lesson.storedUnmarkLessonFinished`, which writes what
  the lesson code writes when a lesson is un-marked.

The lesson driver is described in `tests/support/DRIVER.md`, which follows.
