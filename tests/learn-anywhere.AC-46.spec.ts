import { test, expect, type Device, type Lab } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-46: after an update the kept copy is the new build whole: a lesson
   opened earlier under ".../" and ".../index.html" gives, offline, the new
   build's page running the new build's scripts under both addresses, and no
   file that only the previous build used is still kept.

   "The new build's page/scripts" is checked by bytes: what the device serves
   offline for the document and each of its scripts must equal what the site
   publishes for that path now. "No previous-build file still kept" is checked
   the same way over everything in Cache Storage: every kept entry must equal
   the published build's copy of that path (a path the published build does
   not have, or holds with other bytes, is a leftover). */

const LESSON_SLASH = "/unit-01/lesson-1/";
const LESSON_INDEX = "/unit-01/lesson-1/index.html";
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

test("test_learn_anywhere_AC46_kept_copy_is_one_build_under_every_address", async ({ lab }) => {
  test.setTimeout(420_000);
  const site = published(lab);

  // The device holds the previous build, with the lesson opened under both addresses.
  const d = await lab.device();
  await d.open(LESSON_SLASH);
  await d.workerReady();
  await d.open(LESSON_INDEX);
  await d.courseKept();
  const v1 = await site.version();
  expect(await d.build()).toBe(v1);
  await expect.poll(() => leftovers(lab, d, site), { timeout: 60_000, intervals: [2_000] }).toEqual([]);

  // A new build is published.
  await lab.site.publish("b2");
  site.reset();
  const v2 = await site.version();
  expect(v2).not.toBe(v1);

  // The user opens the site online until the new build's list is wholly kept.
  for (let i = 0; i < 3 && (await d.build()) !== v2; i++) await d.open(lesson.HOME);
  await d.courseKept();
  await expect.poll(() => leftovers(lab, d, site), { timeout: 180_000, intervals: [3_000] }).toEqual([]);
  const keptNow = (await kept(d)).map(k => k.entry);
  expect(keptNow.some(p => /^\/unit-01\/lesson-1\/(index\.html)?(\?.*)?$/.test(p))).toBe(true);

  // Offline, the lesson by each address is the new build's page running the new build's scripts.
  await d.offline(true);
  for (const addr of [LESSON_SLASH, LESSON_INDEX]) {
    await d.open(addr);
    expect(new URL(d.page.url()).pathname).toBe(addr);
    expect(await d.build(), `build running at ${addr}`).toBe(v2);
    const parts = await pageParts(d);
    expect(parts.length).toBeGreaterThanOrEqual(2); // the document and at least one script
    for (const p of parts) {
      expect(p.hash, `${p.entry} served at ${addr}`).not.toBe("missing");
      expect(p.hash, `${p.entry} served at ${addr} is the published copy`).toBe(await site.get(p.entry));
    }
    const id = await lesson.answerTask(d.page);
    await lesson.expectTaskDone(d.page, id);
  }
  // And nothing only the previous build used is still kept.
  expect(await leftovers(lab, d, site)).toEqual([]);
});
