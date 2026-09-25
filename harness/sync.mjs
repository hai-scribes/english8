/* "Access and learn everywhere", made falsifiable.
 *
 * Browser contexts are devices: separate storage, separate cookies, separate
 * service workers. Progress made on one has to appear on the other, and —
 * the half that is a safety property rather than a feature — progress made by
 * one learner must NOT be readable by another. The second is why this runs
 * against the real Firestore emulator and the shipped `firestore.rules` rather
 * than against a stub: a rule that lets any signed-in user read any document
 * is a defect only the rules engine can catch, and it is the defect that
 * exposes a child's work to strangers.
 *
 * Four round trips, each a thing a learner would notice if it broke:
 *
 *   1. A answers a task, takes it again, and both attempts reach the backend.
 *   2. B, a clean device signed in as the same learner, SHOWS that task as
 *      A shows it — done, the same answers, the same marks, the same score
 *      line and the same attempt history — without the learner doing
 *      anything but sign in. A sync that carries "done" but loses the answers,
 *      or the latest attempt but not the history, draws a different page.
 *   3. ISOLATION, asked of the rules engine directly. After C (a different
 *      learner) has used the app, the harness lists every document in the
 *      emulator with admin rights, then tries to read and to write each one
 *      as C. C must be able to read its own (proving the probe's credential is
 *      honoured, so a refusal means something) and must be refused on every
 *      other. Asking the app would not do: an app only ever fetches its own
 *      learner's path, so it passes under `allow read: if request.auth !=
 *      null` — the rule this probe exists to catch.
 *   4. OFFLINE WORK AND A CONCURRENT EDIT MERGE. A, with the page already open,
 *      loses the network and answers a second task; meanwhile B, online,
 *      answers a third. A reconnects. A fresh device D must end up with BOTH.
 *      A whole-record last-write-wins drops one of them, and it is the
 *      failure that silently loses a study session. (No reload while offline:
 *      loading a page with no network is the service worker's job, gated in
 *      milestone 4's session scenario, not here.)
 *
 * Every run signs in as learners of its own (`learner()` in browser.mjs), so
 * what an earlier run or another scenario left in the shared emulator cannot
 * answer this one's question.
 *
 * Asserted on the PAGE, never on how the build stores anything. There is no
 * legacy data to carry (a fresh app, by the operator's decision of
 * 2026-09-25), so the storage format is the variant's business; what a
 * learner sees on the other device is not. Pulled work has to be SHOWN:
 * a build that fills storage and leaves the page it already drew stale fails
 * here, whether it repaints in place or reloads itself to do it.
 */
import { metric, gate, finish } from "./lib.mjs";
import {
  launch, device, url, aLessonPath, signIn, answerTask, taskView, showsDone,
  waitSynced, mark, learner, P, portsError,
} from "./browser.mjs";

const LEARNER = learner("sync");
const OTHER = learner("sync-other");

const problems = [];
let swept = 0, leaks = 0;
const LESSON = aLessonPath();
const browser = await launch();

/* Where two views of one task disagree, named field by field. */
function differences(a, b) {
  const out = [];
  if (a.done !== b.done) out.push(`done ${a.done} vs ${b.done}`);
  if (a.score !== b.score) out.push(`score line ${JSON.stringify(a.score)} vs ${JSON.stringify(b.score)}`);
  if (a.history !== b.history) out.push(`attempt history ${JSON.stringify(a.history)} vs ${JSON.stringify(b.history)}`);
  if (a.items.length !== b.items.length) out.push(`${a.items.length} items vs ${b.items.length}`);
  a.items.forEach((x, i) => {
    const y = b.items[i];
    if (!y) return;
    if (x.ok !== y.ok) out.push(`item ${i + 1} marked ${x.ok} vs ${y.ok}`);
    if (JSON.stringify(x.given) !== JSON.stringify(y.given)) out.push(`item ${i + 1} answer ${JSON.stringify(x.given)} vs ${JSON.stringify(y.given)}`);
  });
  return out;
}

/* --- the rules engine, asked directly ------------------------------------ */
const FS = `http://${P.firestoreHost}:${P.firestorePort}/v1/projects/${P.project}/databases/(default)/documents`;
const ADMIN = { authorization: "Bearer owner" };   // the emulator's rules bypass

/* An unsigned ID token for `uid`. The emulator evaluates rules against its
 * claims without checking a signature — the mechanism Firebase's own
 * rules-unit-testing uses — so the probe can act as C without reaching into
 * how the app stores its session. */
const b64 = o => Buffer.from(JSON.stringify(o)).toString("base64url");
function tokenFor(uid, email) {
  const now = Math.floor(Date.now() / 1000);
  return `${b64({ alg: "none", typ: "JWT" })}.${b64({
    iss: `https://securetoken.google.com/${P.project}`, aud: P.project,
    iat: now, exp: now + 3600, auth_time: now, sub: uid, user_id: uid,
    email, email_verified: true,
    firebase: { sign_in_provider: "google.com", identities: { email: [email] } },
  })}.`;
}

async function uidOf(email) {
  const r = await fetch(
    `http://${P.authHost}/identitytoolkit.googleapis.com/v1/projects/${P.project}/accounts:query`,
    { method: "POST", headers: { ...ADMIN, "content-type": "application/json" }, body: "{}" });
  const users = (await r.json()).userInfo || [];
  return users.find(u => u.email === email)?.localId ?? null;
}

/* Every existing document, found with admin rights: collection ids at each
 * level, the documents in each collection, recursively. `showMissing` so a
 * document that exists only as the parent of a subcollection is still walked
 * into. */
async function allDocuments() {
  const docs = [];
  async function collections(parent) {
    const r = await fetch(`${FS}${parent ? "/" + parent : ""}:listCollectionIds`,
      { method: "POST", headers: { ...ADMIN, "content-type": "application/json" }, body: "{}" });
    return r.ok ? (await r.json()).collectionIds || [] : [];
  }
  async function walk(parent, depth) {
    if (depth > 8) return;
    for (const c of await collections(parent)) {
      const coll = parent ? `${parent}/${c}` : c;
      let pageToken = "";
      do {
        const r = await fetch(`${FS}/${coll}?pageSize=300&showMissing=true${pageToken ? "&pageToken=" + pageToken : ""}`,
          { headers: ADMIN });
        const j = r.ok ? await r.json() : {};
        for (const d of j.documents || []) {
          const path = d.name.split("/documents/")[1];
          if (d.createTime) docs.push(path);
          await walk(path, depth + 1);
        }
        pageToken = j.nextPageToken || "";
      } while (pageToken);
    }
  }
  await walk("", 0);
  return docs;
}

let step = "starting";
try {
  if (portsError) throw portsError;

  /* --- 1. device A: sign in, answer twice, and it reaches the backend --- */
  const A = await device(browser);
  await A.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  step = "signing A in";
  await signIn(A.page, LEARNER);
  let m = await mark(A.page);
  step = "A answering its first task";
  const task0 = await answerTask(A.page, 0);
  step = "A taking it again";
  await answerTask(A.page, 0);                 // a retake: two attempts in the history
  step = "waiting for A's answers to sync";
  await waitSynced(A.page, { since: m });
  swept++;
  const aView = await taskView(A.page, task0);
  if (!aView.done || !aView.history) {
    problems.push(`device A answered ${task0} twice but does not show it as done with its two attempts — nothing to compare`);
  }

  /* --- 2. device B: same learner, clean device, shows the same task ------ */
  const B = await device(browser);
  await B.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  m = await mark(B.page);
  step = "signing B in";
  await signIn(B.page, LEARNER);
  step = "waiting for B to pull";
  await waitSynced(B.page, { since: m });
  swept++;
  if (!await showsDone(B.page, task0)) {
    problems.push(`device B, signed in as the same learner and synced, does not show ${task0} as done — A's work never reached B's page`);
  } else {
    const diff = differences(aView, await taskView(B.page, task0));
    if (diff.length) problems.push(`device B shows ${task0} differently from A: ${diff.join("; ")}`);
  }

  /* --- 3. device C: a DIFFERENT learner, and the rules engine asked ------ */
  const C = await device(browser);
  await C.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  m = await mark(C.page);
  step = "signing C in";
  await signIn(C.page, OTHER);
  await waitSynced(C.page, { since: m });
  /* C has answered nothing, so ANY task shown done on C's page is another
   * learner's work handed to the wrong account. A few seconds' grace, so a
   * build that repaints just after it says `synced` is still looked at. */
  step = "looking at C's page before C has done anything";
  const done = C.page.locator('.task[data-task][data-done="1"]');
  await done.first().waitFor({ state: "attached", timeout: 3_000 }).catch(() => {});
  const foreign = await done.evaluateAll(els => els.map(e => e.getAttribute("data-task")));
  if (foreign.length) {
    leaks++;
    problems.push(`LEAK: ${OTHER} has answered nothing, yet its page shows work as done: ${foreign.join(", ")}`);
  }
  m = await mark(C.page);
  step = "C answering";
  await answerTask(C.page, 0);                 // so C has documents of its own
  await waitSynced(C.page, { since: m });
  swept++;
  step = "probing the rules engine";
  const cUid = await uidOf(OTHER);
  if (!cUid) problems.push(`the Auth emulator has no account for ${OTHER} — isolation NOT MEASURED`);
  else {
    const as = { authorization: `Bearer ${tokenFor(cUid, OTHER)}` };
    const docs = await allDocuments();
    const mine = docs.filter(d => d.split("/").includes(cUid));
    const theirs = docs.filter(d => !d.split("/").includes(cUid));
    console.log(`  isolation probe: ${docs.length} document(s), ${mine.length} ${OTHER}'s own`);
    if (!theirs.length) problems.push("no other learner's documents exist in the backend — isolation NOT MEASURED (did A's work sync at all?)");
    let ownReadable = 0;
    for (const d of mine) if ((await fetch(`${FS}/${d}`, { headers: as })).status === 200) ownReadable++;
    if (!ownReadable) {
      problems.push(`${OTHER} cannot read any of its own documents with its own credential — ` +
        "either its work is not stored under its uid or the probe's credential is refused, and either way a refusal elsewhere proves nothing");
    }
    for (const d of theirs) {
      const r = await fetch(`${FS}/${d}`, { headers: as });
      if (r.status !== 403) { leaks++; problems.push(`LEAK: ${OTHER} can READ ${d} (HTTP ${r.status})`); }
      const w = await fetch(`${FS}/${d}?updateMask.fieldPaths=__harness_probe`, {
        method: "PATCH", headers: { ...as, "content-type": "application/json" },
        body: JSON.stringify({ fields: { __harness_probe: { stringValue: "x" } } }),
      });
      if (w.status !== 403) { leaks++; problems.push(`LEAK: ${OTHER} can WRITE ${d} (HTTP ${w.status})`); }
    }
  }

  /* --- 4. offline work + a concurrent edit, merged ---------------------- */
  swept++;
  try {
    await A.ctx.setOffline(true);
    await A.page.waitForFunction(
      () => document.querySelector("[data-en8-sync-state]")?.getAttribute("data-en8-sync-state") === "offline",
      null, { timeout: 10_000 })
      .catch(() => problems.push("A lost its network and the page never said so (sync state never became \"offline\")"));
    const offlineTask = await answerTask(A.page, 1);

    m = await mark(B.page);
    const concurrentTask = await answerTask(B.page, 2);
    await waitSynced(B.page, { since: m });

    m = await mark(A.page);
    await A.ctx.setOffline(false);
    await waitSynced(A.page, { since: m, ms: 30_000 });

    const D = await device(browser);
    await D.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
    m = await mark(D.page);
    await signIn(D.page, LEARNER);
    await waitSynced(D.page, { since: m });
    for (const [what, id] of [["work done offline on A", offlineTask],
                              ["work done meanwhile on B", concurrentTask],
                              ["A's first answer", task0]]) {
      if (!await showsDone(D.page, id)) problems.push(`${what} (${id}) is not shown on a fresh device after A reconnected — one device's work overwrote the other's`);
    }
  } catch (e) { problems.push(`offline round trip: ${e.message}`); }
} catch (e) {
  problems.push(`harness could not complete the round trip: while ${step}: ${e.message.split("\n")[0]}`);
} finally {
  await browser.close();
}

for (const p of problems) console.log(`  · ${p}`);
metric("sync_roundtrips_swept", swept);
metric("sync_mismatches", problems.length);
metric("cross_account_leaks", leaks);
/* Coverage first, and every other gate CONDITIONED on it. A harness that
 * never signed in reports zero leaks and zero mismatches — the same numbers a
 * perfectly isolated, perfectly syncing build reports. Passing on those is how
 * a gate certifies work it did not do. */
const covered = swept >= 4;
finish([
  gate("round trips swept", covered, `${swept} of 4`),
  gate("cross-account isolation", covered && leaks === 0,
       covered ? `${leaks} leak(s)` : "NOT MEASURED — the isolation probe never ran"),
  gate("progress travels", covered && problems.length === 0, `${problems.length} problem(s)`),
]);
