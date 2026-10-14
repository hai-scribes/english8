import { test, expect, docIdOfKey } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-6: another account sees none of X's work, and the shipped rules refuse
   every operation under X's path to Y's credential, allow them under Y's own,
   and refuse any path outside users/{uid} to everyone. */
test("test_learn_anywhere_AC6_account_isolation_enforced_by_rules", async ({ lab }) => {
  test.setTimeout(180_000);
  const x = lab.account("x");
  const y = lab.account("y");
  const id = "01-1-1.1-1";
  const TASKS = "en8:tasks:v1";

  // X has synced work.
  const dx = await lab.device();
  await dx.open(lesson.LESSON_WITH_INSTANT_TASK);
  await dx.signIn(x);
  await lesson.answerTask(dx.page, id);
  await dx.expectSaved();
  await lab.store.expectValue(x, TASKS, v => typeof v === "string" && v.includes(id));
  const xuid = await lab.store.uid(x);
  expect(xuid).not.toBeNull();

  // Y signs in on a clean device: X's task is not done before, and not after the sync.
  const dy = await lab.device();
  await dy.open(lesson.LESSON_WITH_INSTANT_TASK);
  await lesson.expectTaskNotDone(dy.page, id);
  const m = dy.mark();
  await dy.signIn(y);
  await expect.poll(() => dy.requestsSince(m).some(r => r.kind === "read" && r.code === 200), { timeout: 30_000 }).toBe(true);
  await dy.open(lesson.LESSON_WITH_INSTANT_TASK);
  await dy.expectAuth("signed-in");
  await lesson.expectTaskNotDone(dy.page, id);
  expect((await dy.stored(TASKS)) ?? "").not.toContain(id);
  const yuid = await lab.store.uid(y);
  expect(yuid).not.toBeNull();
  expect(yuid).not.toBe(xuid);

  // Y's credential, used directly against the store.
  const yCred = await dy.credential();
  expect(yCred).not.toBeNull();
  expect(yCred!.uid).toBe(yuid);
  const yTok = yCred!.idToken;
  const probe = `probe-${Date.now()}`;
  const xDoc = `users/${xuid}/kv/${docIdOfKey(TASKS)}`;

  // Under X's path: all five refused.
  const underX = {
    get: await lab.store.as(yTok, "get", xDoc),
    list: await lab.store.as(yTok, "list", xDoc),
    create: await lab.store.as(yTok, "create", `users/${xuid}/kv/${probe}`),
    update: await lab.store.as(yTok, "update", xDoc),
    delete: await lab.store.as(yTok, "delete", xDoc),
  };
  expect(underX).toEqual({ get: 403, list: 403, create: 403, update: 403, delete: 403 });
  // X's work is untouched by the refused writes.
  await lab.store.expectValue(x, TASKS, v => typeof v === "string" && v.includes(id));
  expect(await lab.store.value(x, probe)).toBeUndefined();

  // Under Y's own path: all five succeed.
  const yDoc = `users/${yuid}/kv/${probe}`;
  const underY = {
    create: await lab.store.as(yTok, "create", yDoc),
    get: await lab.store.as(yTok, "get", yDoc),
    update: await lab.store.as(yTok, "update", yDoc),
    list: await lab.store.as(yTok, "list", yDoc),
    delete: await lab.store.as(yTok, "delete", yDoc),
  };
  expect(underY).toEqual({ create: 200, get: 200, update: 200, list: 200, delete: 200 });

  // Outside users/{uid}: refused for everyone, with X's credential as well as Y's.
  const xCred = await dx.credential();
  expect(xCred).not.toBeNull();
  const outside: Record<string, number> = {};
  for (const [who, tok] of [["y", yTok], ["x", xCred!.idToken]] as const) {
    for (const path of [`shared/${probe}`, `probe/${probe}`]) {
      for (const op of ["get", "list", "create", "update", "delete"] as const) {
        outside[`${who} ${op} ${path}`] = await lab.store.as(tok, op, path);
      }
    }
  }
  expect(Object.keys(outside)).toHaveLength(20);
  expect(Object.values(outside)).toEqual(new Array(20).fill(403));
});
