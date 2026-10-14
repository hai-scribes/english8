import { test, expect, type Device, type Lab } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-47: an update cut off part way leaves the previous copy whole and
   usable: offline, a lesson loads and works from one build's page and
   scripts together, and the previous build's files are dropped only once the
   new build is wholly kept.

   Bytes decide "one build": the document and its scripts, as the device
   serves them offline, must all equal one build's published copies. */

const CONFIG = "/assets/firebase-config.js"; // always served by the test site itself; not part of a build

async function sha(buf: ArrayBuffer): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/** SHA-256 of each path as the site publishes it now; memoised until reset(). */
function published(lab: Lab) {
  let memo = new Map<string, Promise<string | null>>();
  return {
    get(entry: string): Promise<string | null> {
      if (!memo.has(entry)) memo.set(entry, (async () => {
        const r = await lab.fetchSite(entry);
        if (!r.ok) return null;
        return sha(await r.arrayBuffer());
      })());
      return memo.get(entry)!;
    },
    reset() { memo = new Map(); },
    async version(): Promise<string> {
      const r = await lab.fetchSite("/precache.json");
      expect(r.ok).toBe(true);
      return ((await r.json()) as { v: string }).v;
    },
  };
}

/** Every entry in the device's Cache Storage with the SHA-256 of its bytes. */
function kept(d: Device): Promise<{ entry: string; hash: string }[]> {
  return d.page.evaluate(async () => {
    const hex = async (buf: ArrayBuffer) => {
      const h = await crypto.subtle.digest("SHA-256", buf);
      return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
    };
    const out: { entry: string; hash: string }[] = [];
    for (const name of await caches.keys()) {
      const c = await caches.open(name);
      for (const req of await c.keys()) {
        const res = await c.match(req);
        if (!res) continue;
        const u = new URL(req.url);
        out.push({ entry: u.pathname + u.search, hash: await hex(await res.clone().arrayBuffer()) });
      }
    }
    return out;
  });
}

/** The document the page is on and each same-origin script it runs, as the
    device serves them right now (offline: from what it keeps), by hash. */
function pageParts(d: Device): Promise<{ entry: string; hash: string }[]> {
  return d.page.evaluate(async cfg => {
    const hex = async (buf: ArrayBuffer) => {
      const h = await crypto.subtle.digest("SHA-256", buf);
      return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
    };
    const grab = async (u: string) => {
      try { const r = await fetch(u); return r.ok ? await hex(await r.arrayBuffer()) : "missing"; } catch (e) { return "missing"; }
    };
    const entries = [location.pathname + location.search];
    for (const s of Array.from(document.scripts)) {
      if (!s.src) continue;
      const u = new URL(s.src);
      if (u.origin !== location.origin || u.pathname === cfg) continue;
      entries.push(u.pathname + u.search);
    }
    const out: { entry: string; hash: string }[] = [];
    for (const e of entries) out.push({ entry: e, hash: await grab(e) });
    return out;
  }, CONFIG);
}

async function leftovers(lab: Lab, d: Device, site: ReturnType<typeof published>): Promise<string[]> {
  const out: string[] = [];
  for (const { entry, hash } of await kept(d)) {
    if (entry === CONFIG) continue;
    if ((await site.get(entry)) !== hash) out.push(entry);
  }
  return out;
}

test("test_learn_anywhere_AC47_interrupted_update_keeps_the_previous_copy_usable", async ({ lab }) => {
  test.setTimeout(480_000);
  const site = published(lab);

  // The device wholly holds the previous build.
  const d = await lab.device();
  await d.open(lesson.HOME);
  await d.workerReady();
  await d.courseKept();
  const v1 = await site.version();
  expect(await d.build()).toBe(v1);
  const kept1 = await kept(d);
  expect(kept1.length).toBeGreaterThan(0);
  // The previous build's published copies, by path, while it is still published.
  const b1 = new Map<string, string | null>();
  for (const { entry } of kept1) if (!b1.has(entry)) b1.set(entry, await site.get(entry));

  // A new build is published, and the fetch of its files is cut off part way.
  await lab.site.publish("b2");
  site.reset();
  const v2 = await site.version();
  expect(v2).not.toBe(v1);
  const askedBefore = (await lab.site.asked()).length;
  await lab.site.cutAfter(8);
  await d.open(lesson.HOME).catch(() => {});
  await d.page.waitForTimeout(8_000);
  expect((await lab.site.asked()).length).toBeGreaterThan(askedBefore);

  // Offline, a lesson loads and works ...
  await d.offline(true);
  await lab.site.cutAfter(null); // the device is offline; this only frees the test's own reads of the site
  await d.open(lesson.LESSON_WITH_INSTANT_TASK);
  expect(new URL(d.page.url()).pathname).toBe(lesson.LESSON_WITH_INSTANT_TASK);
  expect((await lesson.tasksOn(d.page)).length).toBeGreaterThan(0);
  const id = await lesson.answerTask(d.page);
  await lesson.expectTaskDone(d.page, id);
  const running = await d.build();
  expect([v1, v2]).toContain(running);

  // ... from one build's page and scripts together.
  const parts = await pageParts(d);
  expect(parts.length).toBeGreaterThanOrEqual(2);
  for (const p of parts) expect(p.hash, `${p.entry} served offline`).not.toBe("missing");
  const allPrevious = parts.every(p => b1.get(p.entry) === p.hash);
  let allNew = true;
  for (const p of parts) if ((await site.get(p.entry)) !== p.hash) allNew = false;
  expect(allPrevious || allNew, "the page and its scripts come from one build").toBe(true);

  // The previous build's files are still kept: the new build is not wholly kept yet.
  const keptNow = new Set((await kept(d)).map(k => k.entry));
  expect(kept1.map(k => k.entry).filter(e => !keptNow.has(e))).toEqual([]);

  // Back online the update completes; only then are the previous build's files dropped.
  await d.offline(false);
  await d.open(lesson.HOME);
  await d.courseKept();
  await expect.poll(() => leftovers(lab, d, site), { timeout: 180_000, intervals: [3_000] }).toEqual([]);
  for (let i = 0; i < 3 && (await d.build()) !== v2; i++) await d.open(lesson.HOME);
  expect(await d.build()).toBe(v2);
  expect(await leftovers(lab, d, site)).toEqual([]);
});
