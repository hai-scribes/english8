import { test, expect, TEXT, type StoreRequest } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-12: every request to Firestore leaves while the page says so — "Saving…",
   "Checking…", the offline text or the error text — or while the auth state
   reads "signing-in"; none leaves while the status is idle or "Saved". */
test("test_learn_anywhere_AC12_no_firestore_request_while_page_reads_idle_or_saved", async ({ lab }) => {
  test.setTimeout(180_000);
  const her = lab.account();
  const TASKS = "en8:tasks:v1";
  const announced: string[] = [TEXT.saving, TEXT.checking, TEXT.offline, TEXT.failed];
  const allowed = (r: StoreRequest) => announced.includes(r.status) || r.auth === "signing-in";

  const a = await lab.device();
  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  expect(a.storeRequests).toEqual([]);

  // Sign in, answer, go offline, answer again, come back, reload.
  await a.signIn(her);
  await a.expectSaved();
  await lesson.answerTask(a.page, "01-1-1.1-1");
  await lab.store.expectValue(her, TASKS, v => typeof v === "string" && v.includes("01-1-1.1-1"));
  await a.expectSaved();
  await a.offline(true);
  await a.expectStatus(TEXT.offline, 10_000);
  await lesson.answerTask(a.page, "01-1-1.2-1");
  await a.offline(false);
  await a.expectSaved();
  await lab.store.expectValue(her, TASKS, v => typeof v === "string" && v.includes("01-1-1.2-1"));
  const m = a.mark();
  await a.page.reload({ waitUntil: "load" });
  await a.expectAuth("signed-in");
  await expect.poll(() => a.requestsSince(m).some(r => r.kind === "read" && r.code === 200), { timeout: 30_000 }).toBe(true);
  await a.expectSaved();

  // The record covers real traffic: writes that landed and reads that answered.
  const reqs = a.storeRequests;
  expect(reqs.some(r => r.kind === "write" && r.code === 200)).toBe(true);
  expect(reqs.some(r => r.kind === "read" && r.code === 200)).toBe(true);

  // None left while the page read idle or "Saved".
  const unannounced = reqs.filter(r => !allowed(r))
    .map(r => ({ method: r.method, url: r.url, status: r.status, auth: r.auth }));
  expect(unannounced).toEqual([]);
  expect(reqs.filter(r => r.status === TEXT.saved)).toEqual([]);
  expect(reqs.filter(r => r.status === "" && r.auth !== "signing-in")).toEqual([]);
});
