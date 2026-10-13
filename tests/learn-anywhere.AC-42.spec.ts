import { test, expect } from "./support/harness";
import * as lesson from "./support/driver";

/* AC-42: one page opened online and the whole build kept; offline, a lesson
   never opened before loads with its tasks working and its drawings shown. */

const NEVER_OPENED = "/unit-02/lesson-1/index.html";

test("test_learn_anywhere_AC42_whole_course_loads_offline", async ({ lab }) => {
  test.setTimeout(300_000);

  const d = await lab.device();
  await d.open(lesson.HOME);
  await d.workerReady();
  await d.courseKept();
  // The lesson is among what is kept, though it was never opened.
  expect((await d.keptPaths()).some(p => /^\/unit-02\/lesson-1\/(index\.html)?(\?.*)?$/.test(p))).toBe(true);

  await d.offline(true);
  await d.open(NEVER_OPENED);
  expect(new URL(d.page.url()).pathname).toBe(NEVER_OPENED);

  // Its tasks work.
  const tasks = await lesson.tasksOn(d.page);
  expect(tasks.length).toBeGreaterThan(0);
  const id = await lesson.answerTask(d.page);
  await lesson.expectTaskDone(d.page, id);
  const view = await lesson.taskView(d.page, id);
  expect(view.scoreLine).toMatch(/^\d+ \/ \d+ All right$/);
  expect(view.marks.every(mk => mk === true)).toBe(true);

  // Its drawings are shown: every image the page references loads, offline.
  const pics = await d.page.evaluate(async () => {
    const urls = new Set<string>();
    for (const img of Array.from(document.images)) {
      const u = img.currentSrc || img.src;
      if (u && !u.startsWith("data:")) urls.add(u);
    }
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("*"))) {
      const bg = getComputedStyle(el).backgroundImage;
      const found = bg && bg !== "none" ? bg.match(/url\((['"]?)(.*?)\1\)/g) : null;
      if (!found) continue;
      for (const one of found) {
        const u = one.replace(/^url\((['"]?)/, "").replace(/(['"]?)\)$/, "");
        if (u && !u.startsWith("data:")) urls.add(new URL(u, location.href).href);
      }
    }
    const broken: string[] = [];
    await Promise.all(Array.from(urls).map(u => new Promise<void>(done => {
      const im = new Image();
      im.onload = () => { if (!im.naturalWidth) broken.push(u); done(); };
      im.onerror = () => { broken.push(u); done(); };
      im.src = u;
    })));
    return { total: urls.size, broken };
  });
  expect(pics.total).toBeGreaterThan(0);
  expect(pics.broken).toEqual([]);
});
