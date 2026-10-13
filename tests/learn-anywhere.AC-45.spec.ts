import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-45: a device holding the previous build reloads online after a new
   build is published; the new build's script is running within three reloads. */

async function publishedBuild(fetchSite: (path: string) => Promise<Response>): Promise<string> {
  const r = await fetchSite("/precache.json");
  expect(r.ok).toBe(true);
  const j = await r.json() as { v: string; files: Record<string, string> };
  expect(typeof j.v).toBe("string");
  expect(j.v.length).toBeGreaterThan(0);
  return j.v;
}

test("test_learn_anywhere_AC45_new_build_reaches_a_device_online", async ({ lab }) => {
  test.setTimeout(300_000);
  const fetchSite = (p: string) => lab.fetchSite(p);

  const d = await lab.device();
  await d.open(lesson.HOME);
  await d.workerReady();
  await d.courseKept();
  const v1 = await publishedBuild(fetchSite);
  expect(await d.build()).toBe(v1);

  await lab.site.publish("b2");
  const v2 = await publishedBuild(fetchSite);
  expect(v2).not.toBe(v1);
  // Before any reload the previous build's script is still the one running.
  expect(await d.build()).toBe(v1);

  let reloads = 0;
  for (; reloads < 3; reloads++) {
    await d.page.reload({ waitUntil: "load" });
    if ((await d.build()) === v2) break;
  }
  expect(reloads).toBeLessThan(3);
  expect(await d.build()).toBe(v2);
});
