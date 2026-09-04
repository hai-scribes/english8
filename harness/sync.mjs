/* "Access and learn everywhere", made falsifiable.
 *
 * Two browser contexts are two devices: separate storage, separate cookies,
 * separate service workers. Progress made on one has to appear on the other,
 * and — the half that is a safety property rather than a feature — progress
 * made by one learner must NOT appear for another. The second is why this runs
 * against the real Firestore emulator and the shipped `firestore.rules` rather
 * than against a stub: a rule that lets any signed-in user read any document
 * is a defect only the rules engine can catch, and it is the defect that
 * exposes a child's work to strangers.
 */
import { metric, gate, finish } from "./lib.mjs";
import { launch, device, url, aLessonPath, signIn, answerFirstTask, localState, waitSynced , portsError } from "./browser.mjs";

const problems = [];
let swept = 0, leaks = 0;
const LESSON = aLessonPath();
const browser = await launch();

const progressOf = s => Object.entries(s)
  .filter(([k]) => k.startsWith("en8:") && k !== "en8:theme")
  .map(([k, v]) => `${k}=${v}`).sort().join("\n");

try {
  if (portsError) throw portsError;
  /* --- device A: sign in, do a lesson, let it sync --------------------- */
  const A = await device(browser);
  await A.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  await signIn(A.page, "learner@example.com");
  const taskId = await answerFirstTask(A.page);
  await waitSynced(A.page);
  const before = progressOf(await localState(A.page));
  swept++;
  if (!before) problems.push("device A recorded no local progress after answering a task — nothing to sync");

  /* --- device B: same learner, clean device, must inherit -------------- */
  const B = await device(browser);
  await B.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  await signIn(B.page, "learner@example.com");
  await waitSynced(B.page);
  swept++;
  const after = progressOf(await localState(B.page));
  if (!after.includes(taskId)) {
    problems.push(`device B did not receive task ${taskId} after signing in as the same learner`);
  }

  /* --- device C: a DIFFERENT learner must see none of it --------------- */
  const C = await device(browser);
  await C.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
  await signIn(C.page, "someone-else@example.com");
  await waitSynced(C.page);
  swept++;
  const other = progressOf(await localState(C.page));
  if (other.includes(taskId)) {
    leaks++;
    problems.push(`LEAK: someone-else@example.com received learner@example.com's task ${taskId}`);
  }

  /* --- offline, then back: the work is not lost ------------------------ */
  swept++;
  try {
    await A.ctx.setOffline(true);
    await A.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
    const offlineTask = await answerFirstTask(A.page);
    const offState = await A.page.$eval("[data-en8-sync-state]",
      el => el.getAttribute("data-en8-sync-state")).catch(() => null);
    if (offState !== "offline") {
      problems.push(`while offline the page reported sync state ${offState ?? "absent"}, expected "offline"`);
    }
    await A.ctx.setOffline(false);
    await waitSynced(A.page, 30_000);

    const D = await device(browser);
    await D.page.goto(url(LESSON), { waitUntil: "domcontentloaded" });
    await signIn(D.page, "learner@example.com");
    await waitSynced(D.page);
    if (!progressOf(await localState(D.page)).includes(offlineTask)) {
      problems.push("work done offline never reached another device after reconnecting");
    }
  } catch (e) { problems.push(`offline round trip: ${e.message}`); }
} catch (e) {
  problems.push(`harness could not complete the round trip: ${e.message}`);
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
