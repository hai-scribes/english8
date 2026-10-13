/* The lesson driver: operates the site's own controls the way a learner does.

   Every function here commits work through the real UI -- clicks, taps and
   typing -- and reads results back from what the page shows. The only
   functions that write localStorage are `seedDueReview`,
   `storedUnmarkLessonFinished` and `storeSamples`; `stored` and `storedAll`
   read it.

   The driver reads `<script id="page-data">` (the same JSON the page reads)
   to know which answer is right, so it can answer right or wrong on purpose.

   DRIVER.md beside this file is the reference: what each function needs, the
   fixture pages and ids, and what each action writes. */
import { expect, type Locator, type Page } from "@playwright/test";

/* ---------------- fixture pages ------------------------------------------- */

export const pagePaths = {
  HOME: "/index.html",
  UNIT: "/unit-01/index.html",
  /** Lesson 1: three instant tasks (01-1-1.1-1, 01-1-1.2-1, 01-1-1.3-1). */
  LESSON_WITH_INSTANT_TASK: "/unit-01/lesson-1/index.html",
  /** Lesson 2: Meet the words (01-2-v1, 5 sets) and two instant tasks. */
  LESSON_WORDS: "/unit-01/lesson-2/index.html",
  /** Lesson 3: the practice bank (01-3-b1) and four jot boxes. */
  LESSON_PRACTICE: "/unit-01/lesson-3/index.html",
  /** Lesson 4: clock 01-4-c1, passage 01-4-p1, timed tasks, writing 01-4-w1. */
  LESSON_READING_WRITING: "/unit-01/lesson-4/index.html",
  /** Lesson 5: two sure/not-sure tasks under the script, fluency 01-5-f1. */
  LESSON_WITH_CONF_TASK: "/unit-01/lesson-5/index.html",
  /** Lesson 5 again: the fluency strand 01-5-f1 (three rounds, mode "talk"). */
  LESSON_FLUENCY: "/unit-01/lesson-5/index.html",
  /** A read-again strand (mode "read", prints words a minute): 02-4-f1. */
  LESSON_READ_AGAIN: "/unit-02/lesson-4/index.html",
  /** Lesson 6: four instant tasks and the tap-then-fix task 01-6-6.5-1. */
  LESSON_WITH_TAP_TASK: "/unit-01/lesson-6/index.html",
  /** Unit 03 Lesson 6: the tile task 03-6-6.3-3 (unit 01 has none). */
  LESSON_WITH_TILES_TASK: "/unit-03/lesson-6/index.html",
  /** Same page as LESSON_PRACTICE: jot boxes 01-3-j1-1 .. 01-3-j1-4. */
  LESSON_WITH_JOT: "/unit-01/lesson-3/index.html",
  /** A strand check with number inputs ("articles"): unit 06 Lesson 4. */
  LESSON_WITH_THREAD: "/unit-06/lesson-4/index.html",
  CHECKPOINT: "/review-1/index.html",
  STORY: "/story/index.html",
  WORDS: "/words/index.html",
} as const;

export const LESSON_WITH_INSTANT_TASK = pagePaths.LESSON_WITH_INSTANT_TASK;
export const LESSON_WORDS = pagePaths.LESSON_WORDS;
export const LESSON_PRACTICE = pagePaths.LESSON_PRACTICE;
export const LESSON_READING_WRITING = pagePaths.LESSON_READING_WRITING;
export const LESSON_FLUENCY = pagePaths.LESSON_FLUENCY;
export const HOME = pagePaths.HOME;

/* ---------------- page data ------------------------------------------------ */

type Opt = { k: string; t: string } | string;
interface TaskItem {
  q: string; key: string; why?: string;
  opts?: Opt[]; tiles?: string[]; tap?: string[]; span?: [number, number]; fix?: string;
}
interface TaskData {
  id: string; skill: string; conf: boolean; either: string; variant: string; items: TaskItem[];
}
/* A word, a pool question, a bank question or a review item: the engine asks
   all of them, and tells them apart by which fields they carry. */
interface EngineItem {
  word?: string; vi?: string; pos?: string; colloc?: string[]; cloze?: string; clozeKey?: string;
  q?: string; a?: string; ask?: string; from?: string; type?: string; unit?: string; id?: string;
  lesson?: number; opts?: string[]; optsH?: string[]; tiles?: string[]; tap?: string[];
  span?: [number, number]; fix?: string;
}
interface PageData {
  kind?: string; unit?: string; lesson?: number;
  tasks?: TaskData[];
  vocabIntake?: { id: string; size: number; words: EngineItem[]; pool?: EngineItem[] }[];
  bank?: { id: string; draw: number; items: EngineItem[] }[];
  write?: { id: string; lo: number; hi: number; secs: number }[];
  clock?: { id: string; secs: number }[];
  passage?: { id: string }[];
  /* Home: the review queue's items. A checkpoint page: its number (1-4). */
  review?: EngineItem[] | number;
  /* Unit page: the unit's words. Home: every unit's words, keyed by unit. */
  vocab?: EngineItem[] | Record<string, EngineItem[]>;
}

/** The page's own data blob (`DATA` in app.js). */
export async function pageData(page: Page): Promise<PageData> {
  return await page.evaluate(() => {
    const el = document.getElementById("page-data");
    return el ? JSON.parse(el.textContent || "{}") : {};
  });
}

/** Read one localStorage value as stored (a string), or null. Not UI. */
export async function stored(page: Page, key: string): Promise<string | null> {
  return await page.evaluate(k => localStorage.getItem(k), key);
}

/** Every `en8:` key now in localStorage, as stored. Not UI. */
export async function storedAll(page: Page): Promise<Record<string, string>> {
  return await page.evaluate(() => {
    const out: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || "";
      if (k.startsWith("en8:")) out[k] = localStorage.getItem(k) || "";
    }
    return out;
  });
}

/** The local calendar day number the app calls "today" (`todayNum` in app.js). */
export async function browserTodayNum(page: Page): Promise<number> {
  return await page.evaluate(() =>
    Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000));
}

/* ---------------- small text helpers --------------------------------------- */

const squash = (s: string) => s.replace(/\s+/g, " ").trim();
function htmlText(html: string): string {
  return String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
const bareWord = (w: EngineItem) => squash(String(w.word || "").replace(/\s*\(.*?\)\s*/g, " "));
const optKey = (o: Opt) => (typeof o === "string" ? o : o.k);

/** The tile indices, in order, that build a sentence the key accepts.
    The key's first alternate is used, with every optional part included. */
export function tileSequence(key: string, tiles: string[]): number[] {
  const first = String(key).split("/")[0].replace(/\(([^)]*)\)/g, "$1");
  const words = first.replace(/([,;:])/g, " $1").split(/\s+/).filter(Boolean);
  const used = new Set<number>();
  const seq: number[] = [];
  for (const w of words) {
    const bare = w.replace(/[.!?]+$/, "");
    const tests: ((t: string) => boolean)[] = [
      t => t === w,
      t => t.toLowerCase() === w.toLowerCase(),
      t => t.toLowerCase() === bare.toLowerCase(),
    ];
    let j = -1;
    for (const test of tests) {
      j = tiles.findIndex((t, k) => !used.has(k) && test(t));
      if (j >= 0) break;
    }
    if (j < 0) throw new Error(`driver: no tile for "${w}" of key "${key}" in [${tiles.join(" | ")}]`);
    used.add(j);
    seq.push(j);
  }
  return seq;
}

/* ================== marked tasks ========================================== */

export type TaskKind = "instant" | "check" | "tiles" | "tap" | "conf" | "timed";
export interface TaskInfo { id: string; kind: TaskKind; items: number; done: boolean }

const taskRoot = (page: Page, id: string): Locator => page.locator(`[data-task="${id}"]`);

/** Every marked task on this lesson page, in page order, with how it commits.
    timed    owned by a `:::clock` (the nearest timer above it is a clock):
             answered during the test, marked together at Finish test
    conf     every item needs a Sure / Not sure mark before Check opens
    tiles    build-the-sentence, committed with Check
    tap      tap the mistake then pick the fix, committed with Check
    instant  each pick is marked at once; the last pick commits; no Check
    check    plain picks committed with Check */
export async function tasksOn(page: Page): Promise<TaskInfo[]> {
  return await page.evaluate(() => {
    const el = document.getElementById("page-data");
    const data = el ? JSON.parse(el.textContent || "{}") : {};
    const timers = Array.from(document.querySelectorAll<HTMLElement>(
      '[data-role="clock"], [data-role="audio"]'));
    const out: { id: string; kind: "instant" | "check" | "tiles" | "tap" | "conf" | "timed";
                 items: number; done: boolean }[] = [];
    for (const t of (data.tasks || []) as { id: string; conf: boolean;
         items: { tiles?: unknown; tap?: unknown }[] }[]) {
      const root = document.querySelector<HTMLElement>('[data-task="' + t.id + '"]');
      if (!root) continue;
      const above = timers.filter(x =>
        x.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING);
      const owner = above.length ? above[above.length - 1] : null;
      const kind = owner && owner.dataset.clock ? "timed"
        : t.conf ? "conf"
        : t.items.some(it => it.tiles) ? "tiles"
        : t.items.some(it => it.tap) ? "tap"
        : root.classList.contains("is-instant") ? "instant" : "check";
      out.push({ id: t.id, kind, items: t.items.length, done: root.dataset.done === "1" });
    }
    return out;
  });
}

function wrongAt(wrong: boolean | number[] | undefined, i: number): boolean {
  return Array.isArray(wrong) ? wrong.includes(i) : !!wrong;
}

async function taskData(page: Page, id: string): Promise<TaskData> {
  const t = ((await pageData(page)).tasks || []).find(x => x.id === id);
  if (!t) throw new Error(`driver: no task "${id}" in this page's data`);
  return t;
}

/** Answer every item of a task (or the items listed in `only`) without
    committing it. An instant task commits itself on its last pick all the
    same. Used inside a running timed test, where nothing is marked until the
    end.
    A wrong answer is: another option (picks); a word outside the mistake
    (tap -- the item then locks with no fix to choose); the right tiles in
    reverse order (tiles). */
export async function fillTask(page: Page, id: string,
    opts: { wrong?: boolean | number[]; sure?: boolean; only?: number[] } = {}): Promise<void> {
  const t = await taskData(page, id);
  const root = taskRoot(page, id);
  for (let i = 0; i < t.items.length; i++) {
    if (opts.only && !opts.only.includes(i)) continue;
    const it = t.items[i];
    const li = root.locator(`li.i[data-i="${i}"]`);
    const wrong = wrongAt(opts.wrong, i);
    if (it.tiles) {
      let seq = tileSequence(it.key, it.tiles);
      if (wrong) seq = seq.length > 1 ? seq.slice().reverse() : [];
      for (const j of seq) await li.locator(`.i-tiles .i-tile[data-j="${j}"]`).click();
    } else if (it.tap) {
      const span = it.span || [0, 0];
      if (wrong) {
        const j = it.tap.findIndex((_, k) => k < span[0] || k > span[1]);
        await li.locator(`.i-tok[data-j="${j}"]`).click();
      } else {
        await li.locator(`.i-tok[data-j="${span[0]}"]`).click();
        const k = (it.opts || []).findIndex(o => optKey(o) === it.fix);
        await li.locator(".i-fix .i-opt").nth(k).click();
      }
    } else if (it.opts) {
      const keys = it.opts.map(optKey);
      const k = wrong ? keys.findIndex(x => x !== it.key) : keys.indexOf(it.key);
      if (k < 0) throw new Error(`driver: task ${id} item ${i} has no ${wrong ? "wrong" : "right"} option`);
      await li.locator(".i-opt").nth(k).click();
    } else {
      /* No typed item ships today; kept so a text box would still be driven. */
      await li.locator(".i-in").fill(wrong ? "zzzz" : it.key.split("/")[0].replace(/[()]/g, "").trim());
    }
    if (t.conf) await li.locator(`.i-conf button[data-conf="${opts.sure === false ? 0 : 1}"]`).click();
  }
}

/** Commit one complete attempt on a task and wait until the page shows it
    committed. With no id: the first task that is not timed and not yet done.
    All right by default; `wrong:true` all wrong; `wrong:[0,2]` those items.
    `sure` picks the Sure (default) or Not sure mark on a "conf" task.
    Returns the task id. A timed task cannot be committed this way while its
    Check is hidden -- use `finishTimedReading`. */
export async function answerTask(page: Page, id?: string,
    opts: { wrong?: boolean | number[]; sure?: boolean } = {}): Promise<string> {
  const all = await tasksOn(page);
  const info = id ? all.find(t => t.id === id) : all.find(t => t.kind !== "timed" && !t.done);
  if (!info) throw new Error(id ? `driver: no task "${id}" on this page`
                                : "driver: no task on this page is both untimed and not yet done");
  if (info.done) throw new Error(`driver: task ${info.id} is already done -- tryAgain() first`);
  const root = taskRoot(page, info.id);
  await fillTask(page, info.id, opts);
  if (info.kind !== "instant") {
    const check = root.locator(".t-check");
    if (!(await check.isVisible()))
      throw new Error(`driver: task ${info.id} (${info.kind}) has no Check to press here -- `
        + "a timed task is marked by finishTimedReading()");
    await check.click();
  }
  await expectTaskDone(page, info.id);
  return info.id;
}

export interface TaskView {
  done: boolean;
  /** Per item, the answer on show: the checked option's value; the built
      sentence; for tap-then-fix "tapped word → fix" (or just the tapped word
      when no fix was chosen). "" when nothing is answered. */
  given: string[];
  /** Per item: true right, false wrong, null not marked (`li.i[data-ok]`). */
  marks: (boolean | null)[];
  /** The text of `.t-score`, e.g. "5 / 5 All right". "" before marking. */
  scoreLine: string;
  /** One entry per listed attempt, e.g. ["2/5", "5/5"]. Empty until there
      are two attempts; the page lists the last eight. */
  history: string[];
}

/** What the page shows for a task -- read from the DOM, never from storage. */
export async function taskView(page: Page, id: string): Promise<TaskView> {
  return await page.evaluate(taskId => {
    const root = document.querySelector<HTMLElement>('[data-task="' + taskId + '"]');
    if (!root) throw new Error('driver: no [data-task="' + taskId + '"] on this page');
    const text = (el: Element | null) => (el ? (el.textContent || "").replace(/\s+/g, " ").trim() : "");
    const given: string[] = [], marks: (boolean | null)[] = [];
    root.querySelectorAll<HTMLElement>("li.i").forEach(li => {
      const on = li.querySelector<HTMLInputElement>("input:checked");
      if (li.querySelector(".i-tiles")) {
        given.push(Array.from(li.querySelectorAll(".i-line .i-tile.in"))
          .map(b => b.textContent || "").join(" ").replace(/ ([,;:])/g, "$1"));
      } else if (li.querySelector(".i-tok")) {
        const tok = li.querySelector(".i-tok.on");
        given.push(tok ? text(tok) + (on ? " → " + on.value : "") : "");
      } else if (li.querySelector(".i-opt")) {
        given.push(on ? on.value : "");
      } else {
        const box = li.querySelector<HTMLInputElement>(".i-in");
        given.push(box ? box.value : "");
      }
      marks.push(li.dataset.ok === "1" ? true : li.dataset.ok === "0" ? false : null);
    });
    return {
      done: root.dataset.done === "1",
      given, marks,
      scoreLine: text(root.querySelector(".t-score")),
      history: Array.from(root.querySelectorAll(".t-log .runs b")).map(b => text(b)),
    };
  }, id);
}

/** Press the task's "Try it again" and wait until it is cleared. */
export async function tryAgain(page: Page, id: string): Promise<void> {
  const root = taskRoot(page, id);
  await root.locator(".t-again").click();
  await expectTaskNotDone(page, id);
  await expect(root.locator(".t-again")).toBeHidden();
  await expect(root.locator("li.i[data-ok]")).toHaveCount(0);
}

export async function expectTaskDone(page: Page, id: string): Promise<void> {
  await expect(taskRoot(page, id)).toHaveAttribute("data-done", "1");
}
export async function expectTaskNotDone(page: Page, id: string): Promise<void> {
  await expect(taskRoot(page, id)).toHaveCount(1);
  await expect(taskRoot(page, id)).not.toHaveAttribute("data-done", "1");
}

/* ================== the question engine ====================================
   One engine asks Meet-the-words, the practice bank and the review. It paints
   one question at a time into a host element. `probeEngine` reports what is
   on show; `solve` finds the item in the page data and picks the answer. */

interface EngineFacts {
  s: "gone" | "done" | "next" | "conf" | "settling" | "choices" | "typed" | "tiles" | "tap";
  labels: string[]; ask: string; prompt: string | null; promptHead: string | null;
  promptIpa: boolean; lede: string | null; tiles: string[]; toks: string[];
}

/* The engine moves on by its own 300 ms and 900 ms timers, so "settling" is
   waited out here in short steps (a single waitForFunction timed out once on
   a busy machine while the page was showing an ordinary question). */
async function probeEngine(page: Page, host: string): Promise<EngineFacts> {
  const until = Date.now() + 30_000;
  for (;;) {
    const facts = await probeOnce(page, host);
    if (facts) return facts;
    if (Date.now() > until) {
      const html = await page.evaluate(sel => {
        const el = document.querySelector(sel);
        return el ? el.innerHTML.slice(0, 400) : "(no host)";
      }, host);
      throw new Error(`driver: the question in ${host} never settled: ${html}`);
    }
    await page.waitForTimeout(40);
  }
}
async function probeOnce(page: Page, host: string): Promise<EngineFacts | null> {
  return await page.evaluate(sel => {
    const txt = (el: Element | null) => (el ? (el.textContent || "").replace(/\s+/g, " ").trim() : "");
    const blank = { labels: [] as string[], ask: "", prompt: null as string | null,
                    promptHead: null as string | null, promptIpa: false,
                    lede: null as string | null, tiles: [] as string[], toks: [] as string[] };
    const hostEl = document.querySelector<HTMLElement>(sel);
    if (!hostEl || hostEl.hidden) return { s: "gone", ...blank };
    const card = hostEl.querySelector<HTMLElement>(".card.engine");
    if (!card) return { s: "gone", ...blank };
    if (card.querySelector("#back, #again")) return { s: "done", ...blank };
    const next = card.querySelector<HTMLButtonElement>("#next");
    if (next && !next.disabled) return { s: "next", ...blank };
    if (card.querySelector(".choices.conf")) return { s: "conf", ...blank };
    if (card.classList.contains("is-right") || card.classList.contains("is-wrong")) return null;
    const go = card.querySelector<HTMLButtonElement>("#go");
    if (go && go.disabled) return null;
    const p = card.querySelector<HTMLElement>(".prompt");
    const facts = {
      labels: [] as string[],
      ask: txt(card.querySelector(".e-ask")),
      prompt: p ? txt(p) : null,
      promptHead: p && p.firstChild && p.firstChild.nodeType === 3 ? (p.firstChild.nodeValue || "") : null,
      promptIpa: !!(p && p.querySelector(".ipa")),
      lede: card.querySelector(".lede") ? txt(card.querySelector(".lede")) : null,
      tiles: [] as string[], toks: [] as string[],
    };
    const li = card.querySelector<HTMLElement>("li.i");
    if (li && li.querySelector(".i-tiles")) {
      facts.tiles = Array.from(li.querySelectorAll(".i-tiles .i-tile")).map(b => b.textContent || "");
      facts.prompt = txt(li.querySelector(".i-q"));
      return { s: "tiles", ...facts };
    }
    if (li && li.querySelector(".i-tok")) {
      if (li.dataset.tap !== undefined && li.dataset.tap !== "" && li.dataset.missed === "1") return null;
      facts.toks = Array.from(li.querySelectorAll(".i-tok")).map(b => txt(b));
      return { s: "tap", ...facts };
    }
    const btns = Array.from(card.querySelectorAll<HTMLButtonElement>(".choices button[data-i]"));
    if (btns.length) {
      if (btns.some(b => b.disabled)) return null;
      facts.labels = btns.map(b => txt(b));
      return { s: "choices", ...facts };
    }
    if (card.querySelector("#ans")) return { s: "typed", ...facts };
    return null;
  }, host) as EngineFacts | null;
}

type EnginePlan =
  | { kind: "choices"; index: number; known: boolean }
  | { kind: "typed"; text: string; known: boolean }
  | { kind: "tiles"; seq: number[]; known: boolean }
  | { kind: "tap"; j: number; fix: number; known: boolean };

function engineCandidates(d: PageData): EngineItem[] {
  const out: EngineItem[] = [];
  for (const p of d.vocabIntake || []) out.push(...p.words, ...(p.pool || []));
  for (const p of d.bank || []) out.push(...p.items);
  if (Array.isArray(d.review)) out.push(...d.review);
  if (Array.isArray(d.vocab)) out.push(...d.vocab);
  else if (d.vocab) for (const list of Object.values(d.vocab)) out.push(...list);
  return out;
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.slice().sort().join("\u0001") === b.slice().sort().join("\u0001");
const optLabel = (c: EngineItem, i: number) =>
  squash((c.optsH || [])[i] ? htmlText((c.optsH || [])[i]) : String((c.opts || [])[i]).replace(/\*\*(.+?)\*\*/g, "$1"));
const qText = (c: EngineItem) => squash(htmlText(String(c.q || "").replace(/_{3,}/, "")));

function solve(f: EngineFacts, cands: EngineItem[], wrong: boolean): EnginePlan {
  if (f.s === "tiles") {
    const c = cands.find(x => !!x.tiles && !!x.a && x.tiles.join("\u0001") === f.tiles.join("\u0001")
      && qText(x) === (f.prompt || ""))
      || cands.find(x => !!x.tiles && !!x.a && x.tiles.join("\u0001") === f.tiles.join("\u0001"));
    if (!c || !c.tiles || !c.a) return { kind: "tiles", seq: [], known: false };
    const seq = tileSequence(c.a, c.tiles);
    return { kind: "tiles", seq: wrong ? (seq.length > 1 ? seq.slice().reverse() : []) : seq, known: true };
  }
  if (f.s === "tap") {
    const c = cands.find(x => !!x.tap && x.tap.map(t => squash(htmlText(t))).join("\u0001") === f.toks.join("\u0001"));
    if (!c || !c.tap || !c.span) return { kind: "tap", j: 0, fix: -1, known: false };
    const [s, e] = c.span;
    if (wrong) return { kind: "tap", j: c.tap.findIndex((_, k) => k < s || k > e), fix: -1, known: true };
    return { kind: "tap", j: s, fix: (c.opts || []).indexOf(String(c.fix)), known: true };
  }
  if (f.s === "typed") {
    const c = cands.find(x => !x.word && !!x.a && !x.opts && !x.tiles && !x.tap && qText(x) === (f.prompt || ""));
    if (wrong || !c || !c.a) return { kind: "typed", text: "zzzz", known: !!c };
    return { kind: "typed", text: c.a.split("/")[0].replace(/[()]/g, "").trim(), known: true };
  }
  /* choices */
  let right: string | null = null;
  const words = cands.filter(c => !!c.word);
  const asked = cands.filter(c => !c.word && !!c.a && !!c.opts && !c.tiles && !c.tap
    && sameSet((c.opts || []).map((_, i) => optLabel(c, i)), f.labels)
    && (f.prompt === null ? !c.q : qText(c) === f.prompt)
    && (!c.ask || !f.ask || squash(htmlText(c.ask)) === f.ask));
  if (asked.length) {
    const c = asked[0];
    right = optLabel(c, (c.opts || []).indexOf(String(c.a)));
  } else if (f.ask === "Choose the missing word.") {
    const c = words.find(w => !!w.cloze && squash(w.cloze.split("\u0001").join("")) === f.prompt
      && f.labels.includes(squash(w.clozeKey || bareWord(w))));
    if (c) right = squash(c.clozeKey || bareWord(c));
  } else if (f.ask === "Complete the phrase." || f.ask === "Which English word means this?") {
    const vi = f.ask === "Complete the phrase." ? f.lede : f.promptHead;
    const c = words.find(w => squash(String(w.vi)) === squash(String(vi)) && f.labels.includes(bareWord(w)));
    if (c) right = bareWord(c);
  } else if (f.promptIpa && f.promptHead !== null) {
    const c = words.find(w => w.word === f.promptHead && f.labels.includes(squash(String(w.vi))));
    if (c) right = squash(String(c.vi));
  }
  if (right === null || !f.labels.includes(right)) return { kind: "choices", index: 0, known: false };
  const index = wrong ? f.labels.findIndex(l => l !== right) : f.labels.indexOf(right);
  return { kind: "choices", index, known: true };
}

export interface EngineRun {
  /** Answers given in this call (a question that came back counts again). */
  answered: number;
  /** True when the run reached its end (result card, or the host emptied). */
  ended: boolean;
  /** Questions the driver could not match to page data; it took the first
      option. Expect 0. */
  unknown: number;
}
export interface EngineOpts {
  /** Answer wrong on purpose: all, or a predicate on the 0-based answer number. */
  wrong?: boolean | ((n: number) => boolean);
  /** Review only: press Sure (default) or Not sure after each answer. */
  sure?: boolean;
  /** Stop after this many answers, leaving the last verdict on screen. */
  limit?: number;
}

/** Answer the question engine painted in `host` (a selector) until it ends
    or `limit` answers are given. The other functions here are built on it;
    use it directly for the unit page's Practice / Unit test (`#engine`). */
export async function driveEngine(page: Page, host: string, o: EngineOpts = {}): Promise<EngineRun> {
  const data = await pageData(page);
  let cands = engineCandidates(data);
  if (data.kind === "home") {
    /* Two review items can print the same prompt ("a new ___" is in units 08
       and 11). The one being asked is one that is due, so those go first. */
    const due = new Set(await page.evaluate(() => {
      const today = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
      let rev: Record<string, { due: number; retired?: boolean }> = {};
      try { rev = JSON.parse(localStorage.getItem("en8:review:v1") || "{}") || {}; } catch (e) { rev = {}; }
      return Object.keys(rev).filter(k => !rev[k].retired && rev[k].due <= today);
    }));
    const key = (c: EngineItem) =>
      c.unit + ":" + (c.type && c.type !== "word" ? c.type + ":" : "") + String(c.id).toLowerCase();
    cands = cands.filter(c => due.has(key(c))).concat(cands.filter(c => !due.has(key(c))));
  }
  const root = page.locator(host);
  const limit = o.limit === undefined ? Infinity : o.limit;
  const run: EngineRun = { answered: 0, ended: false, unknown: 0 };
  for (let guard = 0; guard < 2000; guard++) {
    const f = await probeEngine(page, host);
    if (f.s === "gone" || f.s === "done") { run.ended = true; return run; }
    if (f.s === "conf") {
      await root.locator(`.choices.conf button[data-conf="${o.sure === false ? 0 : 1}"]`).click();
      continue;
    }
    if (run.answered >= limit) return run;
    if (f.s === "next") { await root.locator("#next").click(); continue; }
    const wrong = typeof o.wrong === "function" ? o.wrong(run.answered) : !!o.wrong;
    const plan = solve(f, cands, wrong);
    if (!plan.known) run.unknown++;
    if (plan.kind === "choices") {
      await root.locator(".card.engine .choices button[data-i]").nth(plan.index).click();
    } else if (plan.kind === "typed") {
      await root.locator("#ans").fill(plan.text);
      await root.locator("#go").click();
    } else if (plan.kind === "tiles") {
      for (const j of plan.seq) await root.locator(`.i-tiles .i-tile[data-j="${j}"]`).click();
      await root.locator("#go").click();
    } else {
      await root.locator(`.i-tok[data-j="${plan.j}"]`).click();
      if (plan.fix >= 0) {
        await root.locator(".i-fix .i-opt").nth(plan.fix).click();
        await root.locator("#go").click();
      } else if (!plan.known) {
        /* Unmatched: the tap may have found the mistake; hand it in as it is. */
        const go = root.locator("#go");
        if (await go.isEnabled().catch(() => false)) await go.click();
      }
    }
    run.answered++;
  }
  throw new Error("driver: the question engine did not end");
}

/* ================== Lesson 2: Meet the words =============================== */

/** How many Meet-the-words stacks there are, and which are answered (green). */
export async function wordSets(page: Page): Promise<{ set: number; done: boolean; runs: string[] }[]> {
  await expect(page.locator(".v-stage .v-stack").first()).toBeVisible();
  return await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>(".v-stage .v-pile")).map(p => {
    const b = p.querySelector<HTMLElement>(".v-stack");
    return {
      set: Number(b ? b.dataset.set : -1),
      done: !!b && b.classList.contains("ok"),
      runs: Array.from(p.querySelectorAll(".runs b")).map(x => (x.textContent || "").trim()),
    };
  }));
}

/** On a Lesson 2 page: open the first stack not yet answered (or `set`),
    step through every card with Next, press Start, and answer the questions
    until the set is recorded and its stack is green. */
export async function finishWordSet(page: Page,
    opts: { set?: number; wrong?: EngineOpts["wrong"] } = {}): Promise<void> {
  const data = await pageData(page);
  const intake = (data.vocabIntake || [])[0];
  if (!intake) throw new Error("driver: this page has no Meet-the-words (Lesson 2 only)");
  const stage = page.locator(`[data-vocab="${intake.id}"] .v-stage`);
  const sets = await wordSets(page);
  const set = opts.set !== undefined ? opts.set : (sets.find(s => !s.done) || { set: -1 }).set;
  if (set < 0) throw new Error("driver: every Meet-the-words set is already answered -- pass {set} to run one again");
  const before = sets[set].runs.length;
  await stage.locator(`.v-stack[data-set="${set}"]`).click();
  const next = stage.locator('[data-v="next"]');
  const cards = await stage.locator(".v-deck .v-card:not(.v-last)").count();
  for (let i = 0; i < cards; i++) {
    await expect(stage.locator(".v-count")).toHaveText(`Word ${i + 1} of ${cards}`);
    await next.click();
  }
  await expect(next).toHaveText("Start");
  await next.click();
  const run = await driveEngine(page, `#v-eng-${intake.id}`, { wrong: opts.wrong });
  if (!run.ended) throw new Error("driver: the questions on the set did not finish");
  const stack = stage.locator(`.v-stack[data-set="${set}"]`);
  await expect(stack).toHaveClass(/\bok\b/);
  await expect.poll(async () => (await wordSets(page))[set].runs.length).toBeGreaterThan(Math.min(before, 3));
}

/* ================== Lesson 3: the practice bank ============================ */

/** The bank's listed runs, e.g. ["7/10", "10/12"] (the page shows the last 8). */
export async function practiceRuns(page: Page): Promise<string[]> {
  await expect(page.locator(".bk-stage .bk-cover")).toBeVisible();
  return await page.locator(".bk-stage .bk-cover .runs b").allTextContents();
}

/** On a Lesson 3 page: press Start (or New questions) on the practice bank
    and answer to the end of one run; the cover comes back with the run listed. */
export async function finishPracticeRun(page: Page, opts: { wrong?: EngineOpts["wrong"] } = {}): Promise<void> {
  const data = await pageData(page);
  const bank = (data.bank || [])[0];
  if (!bank) throw new Error("driver: this page has no practice bank (Lesson 3 only)");
  const stage = page.locator(`[data-bank="${bank.id}"] .bk-stage`);
  await stage.locator('[data-b="go"]').click();
  const run = await driveEngine(page, `#b-eng-${bank.id}`, { wrong: opts.wrong });
  if (!run.ended) throw new Error("driver: the practice run did not finish");
  await expect(stage.locator(".bk-cover")).toBeVisible();
  await expect(stage.locator('[data-b="go"]')).toHaveText("New questions");
}

/* ================== Today: the review ====================================== */

async function needHome(page: Page): Promise<PageData> {
  const d = await pageData(page);
  if (d.kind !== "home") throw new Error("driver: the review is on the home page only");
  return d;
}

/** STORED, not UI. Make at least `count` review items due today by writing
    `en8:review:v1`, then reload. Each record is what the app itself would
    hold for an item answered right once, seven days ago:
    {due:today, seen:1, kept:0, delayed:0, last:today-7, retired:false}.
    Records already stored are kept. `kind` picks which items (default
    "word": every one is a four-button choice). The page asks at most 20 a
    day, less what was already reviewed today. */
export async function seedDueReview(page: Page, count: number,
    opts: { kind?: "word" | "colloc" | "pron" | "grammar" | "any"; unit?: string } = {}): Promise<void> {
  await needHome(page);
  const made = await page.evaluate(({ count, kind, unit }) => {
    const KEY = "en8:review:v1";
    const el = document.getElementById("page-data");
    const data = el ? JSON.parse(el.textContent || "{}") : {};
    const today = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    let rev: Record<string, { due: number; seen: number; kept: number; delayed: number;
                              last?: number; retired?: boolean }> = {};
    try { rev = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { rev = {}; }
    const rKey = (it: { unit: string; type: string; id: string }) =>
      it.unit + ":" + (it.type && it.type !== "word" ? it.type + ":" : "") + String(it.id).toLowerCase();
    const items = (data.review || []) as { unit: string; type: string; id: string }[];
    const isDue = (k: string) => !!rev[k] && !rev[k].retired && rev[k].due <= today;
    let due = items.filter(it => isDue(rKey(it))).length;
    for (const it of items) {
      if (due >= count) break;
      if (kind !== "any" && it.type !== kind) continue;
      if (unit && it.unit !== unit) continue;
      const k = rKey(it);
      if (rev[k]) continue;
      rev[k] = { due: today, seen: 1, kept: 0, delayed: 0, last: today - 7, retired: false };
      due++;
    }
    localStorage.setItem(KEY, JSON.stringify(rev));
    return due;
  }, { count, kind: opts.kind || "word", unit: opts.unit || "" });
  if (made < count) throw new Error(`driver: only ${made} review items could be made due (asked for ${count})`);
  await page.reload();
  await expect(page.locator("#reviewCard")).toBeVisible();
}

/** How many items the review card offers today, read from its title
    ("Review 6 items"). 0 when the card is hidden or reads "Review — done". */
export async function reviewDueCount(page: Page): Promise<number> {
  await needHome(page);
  if (!(await page.locator("#reviewCard").isVisible())) return 0;
  const m = /^Review (\d+) item/.exec(((await page.locator("#reviewTitle").textContent()) || "").trim());
  return m ? Number(m[1]) : 0;
}

async function openReview(page: Page): Promise<void> {
  await needHome(page);
  const host = page.locator("#reviewEngine");
  if (await host.locator(".card.engine").count() && await host.isVisible()) return;
  await page.locator("#startReview").click();
  await expect(host.locator(".card.engine")).toBeVisible();
}

/** Answer exactly `n` review items through the UI -- the answer, then the
    Sure / Not sure mark that grades it -- and return how many were answered
    (fewer only if the session ended first). Starts the review if it is not
    open, and carries on from where an earlier call stopped. The last verdict
    is left on screen. Answers are right unless `wrong` says otherwise. */
export async function answerReviewItems(page: Page, n: number, opts: EngineOpts = {}): Promise<number> {
  if (n <= 0) return 0;
  await openReview(page);
  const run = await driveEngine(page, "#reviewEngine", { ...opts, limit: n });
  return run.answered;
}

/** Answer until the review session ends, then press Done; the review card
    then reads "Review — done" (or offers what is left of a larger queue). */
export async function finishReview(page: Page, opts: EngineOpts = {}): Promise<void> {
  await needHome(page);
  const host = page.locator("#reviewEngine");
  const onResult = await host.locator("#back").count();
  if (!onResult) {
    await openReview(page);
    const run = await driveEngine(page, "#reviewEngine", { ...opts, limit: undefined });
    if (!run.ended) throw new Error("driver: the review did not finish");
  }
  await host.locator("#back").click();
  await expect(host).toBeHidden();
}

/* ================== Lesson 4: the timed reading ============================ */

const clockRoot = (page: Page): Locator => page.locator('[data-role="clock"]').first();

/** True while a timed test is on screen (`body.exam-on`): the timed reading
    OR the timed writing -- both use the same exam mode. */
export async function timedTestRunning(page: Page): Promise<boolean> {
  return await page.evaluate(() => document.body.classList.contains("exam-on"));
}

/** Press Start on the `:::clock` cover. Afterwards `body.exam-on` is set, the
    passage and its questions are on screen, and the clock is spent for good
    (`en8:clock:<id>` = true is written at Start, not at Finish). */
export async function startTimedReading(page: Page): Promise<void> {
  await clockRoot(page).locator(".c-start").click();
  await expect(page.locator("body")).toHaveClass(/\bexam-on\b/);
  await expect(page.locator(".exam-bar .eb-go")).toBeVisible();
}

/** The ids of the tasks the page's clock owns, in order. */
export async function timedTaskIds(page: Page): Promise<string[]> {
  return (await tasksOn(page)).filter(t => t.kind === "timed").map(t => t.id);
}

/** Inside a running timed reading: answer the clock's tasks, then press
    Finish test, and wait until every one of them is marked.
    `answer`: "all" (default) every item, "first" only the first item of each
    task, "none" nothing. Unanswered items are marked wrong. */
export async function finishTimedReading(page: Page,
    opts: { wrong?: boolean; answer?: "all" | "first" | "none" } = {}): Promise<void> {
  if (!(await clockRoot(page).getAttribute("data-running")))
    throw new Error("driver: the timed reading is not running -- startTimedReading() first");
  const ids = await timedTaskIds(page);
  const how = opts.answer || "all";
  if (how !== "none")
    for (const id of ids) await fillTask(page, id, { wrong: opts.wrong, only: how === "first" ? [0] : undefined });
  await page.locator(".exam-bar .eb-go").click();
  await expect(page.locator("body")).not.toHaveClass(/\bexam-on\b/);
  for (const id of ids) await expectTaskDone(page, id);
}

/* ================== Lesson 4: the timed writing ============================ */

const writeRoot = (page: Page): Locator => page.locator('[data-role="write"]').first();

/** Press Start on the `:::write` cover. Afterwards `body.exam-on` is set and
    the task, the notes box and the answer box are on screen. */
export async function startTimedWriting(page: Page): Promise<void> {
  await writeRoot(page).locator(".w-start").click();
  await expect(page.locator("body")).toHaveClass(/\bexam-on\b/);
  await expect(writeRoot(page).locator(".w-box")).toBeVisible();
}

/** Put `text` in the answer box (it replaces what is there). Saved as typed. */
export async function typeWriting(page: Page, text: string): Promise<void> {
  const box = writeRoot(page).locator(".w-box");
  await box.fill(text);
  await expect(box).toHaveValue(text);
}

/** Put `text` in the "Your notes (not counted)" box beside the task. */
export async function typeWritingNotes(page: Page, text: string): Promise<void> {
  await writeRoot(page).locator(".w-plan").fill(text);
}

/** Press "I've finished": the clock bar's button in a timed draft, the
    button under the box in an untimed one. Afterwards the draft is listed
    and the checklist has run. */
export async function handInWriting(page: Page): Promise<void> {
  const bar = page.locator(".exam-bar .eb-go");
  if (await bar.isVisible()) await bar.click();
  else await writeRoot(page).locator(".w-done").click();
  await expect(writeRoot(page).locator(".w-after")).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/\bexam-on\b/);
}

/** Press "Write draft 2" (or 3): an untimed attempt that starts from the
    last draft. There is no button once three drafts are kept. */
export async function writeDraftAgain(page: Page): Promise<void> {
  await writeRoot(page).locator(".w-again").click();
  await expect(writeRoot(page).locator(".w-box")).toBeVisible();
}

/** The writing on show: the answer box while a draft is open, otherwise the
    latest handed-in draft as the page prints it. "" before Start. */
export async function writingText(page: Page): Promise<string> {
  const root = writeRoot(page);
  if (await root.locator(".w-main").isVisible()) return await root.locator(".w-box").inputValue();
  const drafts = await writingDrafts(page);
  return drafts.length ? drafts[drafts.length - 1] : "";
}

/** Every handed-in draft the page lists, oldest first. */
export async function writingDrafts(page: Page): Promise<string[]> {
  return await writeRoot(page).evaluate(root =>
    Array.from(root.querySelectorAll<HTMLElement>(".w-drafts .w-dt")).map(p =>
      p.innerHTML.replace(/<br\s*\/?>/g, "\n").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&amp;/g, "&")));
}

/* ================== the reading passage: notes and highlights ==============
   A note is ONE notes box per passage (not a note per highlight). The passage
   is hidden until its timed test has been started, so all of this needs a
   test that is running or already taken. */

const passageRoot = (page: Page): Locator => page.locator('[data-role="passage"]').first();

async function needPassage(page: Page): Promise<Locator> {
  const root = passageRoot(page);
  if (!(await root.isVisible()))
    throw new Error("driver: the passage is hidden -- it opens when the timed reading is started");
  return root;
}
async function openNotepad(page: Page): Promise<Locator> {
  const root = await needPassage(page);
  const ta = root.locator(".pg-ta");
  if (!(await ta.isVisible())) await root.locator('[data-pg="note"]').click();
  await expect(ta).toBeVisible();
  return ta;
}

/** Open the passage's Notes box and write `text` in it. The box must be empty. */
export async function addNote(page: Page, text: string): Promise<void> {
  const ta = await openNotepad(page);
  if (await ta.inputValue()) throw new Error("driver: the notes box already has text -- editNote() replaces it");
  await ta.fill(text);
}
/** Replace the text of the passage's Notes box. */
export async function editNote(page: Page, text: string): Promise<void> {
  const ta = await openNotepad(page);
  await ta.fill(text);
}
/** Empty the passage's Notes box. The stored value becomes "" (the key stays). */
export async function removeNote(page: Page): Promise<void> {
  const ta = await openNotepad(page);
  await ta.fill("");
}
/** The text in the passage's Notes box, or null when it is empty. */
export async function noteText(page: Page): Promise<string | null> {
  const v = await passageRoot(page).locator(".pg-ta").inputValue();
  return v === "" ? null : v;
}

/** Highlight a phrase by dragging over it: the start of paragraph `nth`
    (0-based) of the passage. One call adds one highlight; the same `nth`
    twice selects the same words, which merge into the one highlight. */
export async function addHighlight(page: Page, nth = 0): Promise<void> {
  const root = await needPassage(page);
  const para = root.locator('[data-pg="body"] p').nth(nth);
  /* To the middle of the screen: the test's clock bar is fixed to the top and
     its question bar to the bottom, and a drag under either selects nothing. */
  await para.evaluate(p => p.scrollIntoView({ block: "center", behavior: "instant" }));
  const before = await highlightCount(page);
  const had = await para.locator("mark").count();
  const box = await para.evaluate(p => {
    const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && n.parentElement.closest(".pg-l")) || !(n.nodeValue || "").trim()
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const node = w.nextNode();
    if (!node) return null;
    const s = node.nodeValue || "";
    const lead = s.length - s.trimStart().length;
    /* From the first letter to the end of the second word, on the first line. */
    const m = /^\S+\s+\S+/.exec(s.slice(lead));
    const end = lead + (m ? m[0].length : Math.min(s.trimEnd().length - lead, 6));
    const r = document.createRange();
    r.setStart(node, lead); r.setEnd(node, end);
    const first = r.getClientRects()[0];
    return first ? { x0: first.left, x1: first.right, y: first.top + first.height / 2 } : null;
  });
  if (!box) throw new Error(`driver: paragraph ${nth} of the passage has no text to select`);
  await page.mouse.move(box.x0 + 1, box.y);
  await page.mouse.down();
  await page.mouse.move((box.x0 + box.x1) / 2, box.y, { steps: 4 });
  await page.mouse.move(box.x1 - 1, box.y, { steps: 4 });
  await page.mouse.up();
  if (had) await expect(para.locator("mark")).toHaveCount(had);
  else await expect.poll(() => highlightCount(page)).toBe(before + 1);
}

/** Take a highlight off by clicking it: the `nth` one on the page (0-based). */
export async function removeHighlight(page: Page, nth = 0): Promise<void> {
  const root = await needPassage(page);
  const before = await highlightCount(page);
  await root.locator('[data-pg="body"] mark').nth(nth).click();
  await expect.poll(() => highlightCount(page)).toBe(before - 1);
}

/** Press "Clear marks": every highlight on the passage goes. */
export async function clearHighlights(page: Page): Promise<void> {
  const root = await needPassage(page);
  await root.locator('[data-pg="clear"]').click();
  await expect(root.locator('[data-pg="body"] mark')).toHaveCount(0);
}

/** How many highlights the passage shows (`mark` elements; works while the
    passage is hidden too). */
export async function highlightCount(page: Page): Promise<number> {
  return await passageRoot(page).locator('[data-pg="body"] mark').count();
}

/** The highlighted phrases, in page order. */
export async function highlightTexts(page: Page): Promise<string[]> {
  return await passageRoot(page).locator('[data-pg="body"] mark').allTextContents();
}

/* ================== finishing a lesson ===================================== */

/** Press the lesson's Finish control (`#markDone`). It is a LINK: the click
    records the lesson (if it was not already) and the browser goes straight
    to the next step -- the next lesson, the unit page's test (#gate) after
    Lesson 6, or Today from a checkpoint. Returns once that page has loaded;
    the page is then the NEXT one. Returns the path it came from. */
export async function markLessonFinished(page: Page): Promise<string> {
  const from = new URL(page.url()).pathname;
  const btn = page.locator("#markDone");
  await expect(btn).toBeVisible();
  await Promise.all([
    page.waitForURL(u => u.pathname !== from, { waitUntil: "load" }),
    btn.click(),
  ]);
  return from;
}

/** There is NO control that un-finishes a lesson: the app has no undo. This
    always throws, so a test cannot believe it un-marked something through the
    UI. `storedUnmarkLessonFinished` does it in storage. */
export async function unmarkLessonFinished(_page: Page): Promise<never> {
  throw new Error("driver: the site has no way to un-finish a lesson (initLesson: 'There is no undo'). "
    + "Use storedUnmarkLessonFinished(page) to remove the record from storage.");
}

/** STORED, not UI. Remove this lesson (or checkpoint) page's finished record
    from `en8:progress:v1` and its step from today's `en8:days:v1`, exactly
    what `markLesson(u, l, false)` would do, then reload. */
export async function storedUnmarkLessonFinished(page: Page): Promise<void> {
  await page.evaluate(() => {
    const el = document.getElementById("page-data");
    const d = el ? JSON.parse(el.textContent || "{}") : {};
    const prog = JSON.parse(localStorage.getItem("en8:progress:v1") || "{}");
    let step = "";
    if (d.kind === "review") {
      if (prog.checkpoints) delete prog.checkpoints[String(d.review)];
      step = "R" + d.review;
    } else if (d.kind === "lesson") {
      if (prog[d.unit] && prog[d.unit].lessons) delete prog[d.unit].lessons[String(d.lesson)];
      step = d.unit + ":L" + d.lesson;
    } else throw new Error("driver: not a lesson or checkpoint page");
    localStorage.setItem("en8:progress:v1", JSON.stringify(prog));
    const days = JSON.parse(localStorage.getItem("en8:days:v1") || "{}");
    const t = String(Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000));
    if (days[t]) {
      days[t].steps = (days[t].steps || []).filter((x: string) => x !== step);
      localStorage.setItem("en8:days:v1", JSON.stringify(days));
    }
  });
  await page.reload();
}

/** Whether THIS lesson (or checkpoint) page shows itself finished: its Finish
    control reads "✓ Finished — …". */
export async function lessonFinished(page: Page): Promise<boolean> {
  const btn = page.locator("#markDone");
  await expect(btn).toHaveText(/\S/);
  return ((await btn.textContent()) || "").trim().startsWith("✓ Finished");
}

/** Whether the lesson strip shows lesson `n` of this unit complete (the green
    tick: all its work attempted -- not the Finish button). Defaults to this
    page's own lesson. */
export async function lessonComplete(page: Page, n?: number): Promise<boolean> {
  const lesson = n !== undefined ? n : (await pageData(page)).lesson;
  return await page.evaluate(l => {
    const el = document.querySelector('.rail [data-lesson="' + l + '"]');
    return !!el && el.classList.contains("ok");
  }, lesson);
}

/* ================== the fluency strand ===================================== */

const fluencyRoot = (page: Page, id?: string): Locator =>
  id ? page.locator(`[data-fluency="${id}"]`) : page.locator('[data-role="fluency"]').first();

/** How many rounds the strand lists as finished (lines in its log). */
export async function readAgainRounds(page: Page, id?: string): Promise<number> {
  return await fluencyRoot(page, id).locator(".f-log > div").count();
}

/** Run one round: press "Start round N", then "I finished" straight away,
    and wait for the round's line. When every round is already done the
    button reads "Run it again from round 1": that press clears the log first,
    and round 1 is then run. */
export async function finishReadAgainRound(page: Page, id?: string): Promise<void> {
  const root = fluencyRoot(page, id);
  const start = root.locator(".f-start");
  if (/Run it again/.test((await start.textContent()) || "")) {
    await start.click();
    await expect(start).toHaveText("Start round 1");
  }
  const before = await root.locator(".f-log > div").count();
  await start.click();
  await root.locator(".f-ctl button", { hasText: "I finished" }).click();
  await expect(root.locator(".f-log > div")).toHaveCount(before + 1);
}

/* ================== "About you" boxes ====================================== */

/** Write `text` in a `:::jot` box: the first on the page, or the one with
    this id (`data-jot`). It replaces what is there. */
export async function jot(page: Page, text: string, id?: string): Promise<void> {
  const box = id ? page.locator(`.j-box[data-jot="${id}"]`) : page.locator(".j-box").first();
  await box.fill(text);
  await expect(box).toHaveValue(text);
}

/** What a `:::jot` box holds. */
export async function jotText(page: Page, id?: string): Promise<string> {
  const box = id ? page.locator(`.j-box[data-jot="${id}"]`) : page.locator(".j-box").first();
  return await box.inputValue();
}

/* ================== stored samples ========================================
   One valid value for each kind of `en8:` key the app writes: the exact JSON
   string it stores, with unit-01 ids so a page would paint it. Timestamps are
   fixed (2026-10-13 09:00 +07:00); day numbers are that local day.
   `en8:days:v1` and `en8:review:v1` are keyed to a day number -- use
   `daysSample` / `reviewSample` with `browserTodayNum(page)` for "today". */

export const SAMPLE_AT = 1791856800000;      // 2026-10-13T02:00:00Z
export const SAMPLE_DAY = 20739;             // that local day, as the app counts days

export function daysSample(day: number): string {
  return JSON.stringify({ [String(day)]: { reviewed: 2, steps: ["01:L1"] } });
}
export function reviewSample(day: number): string {
  return JSON.stringify({
    "01:leisure": { due: day, seen: 1, kept: 0, delayed: 0, last: day - 7, retired: false },
    "01:pastime": { due: day + 7, seen: 2, kept: 1, delayed: 1, last: day, retired: false },
    /* Lesson 3's four items, enrolled as Today enrols them once the lesson is
       complete (the progress sample says it is): first due a week on. */
    "01:grammar:3.1-1-gap-fill-21": { due: day + 7, seen: 0, kept: 0, delayed: 0 },
    "01:grammar:3.1-5-sentence-build-1": { due: day + 7, seen: 0, kept: 0, delayed: 0 },
    "01:grammar:3.1-4-error-correction-1": { due: day + 7, seen: 0, kept: 0, delayed: 0 },
    "01:grammar:3.1-3-choice-4": { due: day + 7, seen: 0, kept: 0, delayed: 0 },
  });
}

export const LEARNER_KEY_SAMPLES: Record<string, { key: string; value: string }> = {
  progress: {
    key: "en8:progress:v1",
    value: JSON.stringify({
      "01": { lessons: { "1": SAMPLE_AT }, test: null, complete: { "1": SAMPLE_AT, "3": SAMPLE_AT } },
    }),
  },
  tasks: {
    key: "en8:tasks:v1",
    value: JSON.stringify({
      "01-1-1.1-1": {
        score: 5, of: 5, at: SAMPLE_AT,
        given: ["Khoa", "playing board games", "Thảo", "the list", "something"],
        conf: [null, null, null, null, null],
        log: [{ score: 5, of: 5, at: SAMPLE_AT }],
      },
      "01-1-1.2-1": {
        score: 4, of: 4, at: SAMPLE_AT,
        given: ["can't stand", "it doesn't matter", "ages ago", "hang out"],
        conf: [null, null, null, null],
        log: [{ score: 2, of: 4, at: SAMPLE_AT - 60000 }, { score: 4, of: 4, at: SAMPLE_AT }],
      },
      "01-1-1.3-1": {
        score: 4, of: 4, at: SAMPLE_AT,
        given: ["hearing", "teaching", "to go", "sitting"],
        conf: [null, null, null, null],
        log: [{ score: 4, of: 4, at: SAMPLE_AT }],
      },
    }),
  },
  review: { key: "en8:review:v1", value: reviewSample(SAMPLE_DAY) },
  story: { key: "en8:story:v1", value: JSON.stringify({ "01": SAMPLE_AT }) },
  days: { key: "en8:days:v1", value: daysSample(SAMPLE_DAY) },
  write: {
    key: "en8:write:v1",
    value: JSON.stringify({
      "01-4-w1": {
        text: "Hi Mai,\n\nI enjoy fishing.", ticks: {}, drafts: ["Hi Mai,\n\nI enjoy fishing."],
        deadline: null, plan: "greeting, hobby", committed: true,
      },
    }),
  },
  jot: { key: "en8:jot:v1", value: JSON.stringify({ "01-3-j1-1": "I enjoy reading comics." }) },
  notes: { key: "en8:notes:01-4-p1", value: "fish = three days in the bucket" },
  marks: { key: "en8:marks:01-4-p1", value: JSON.stringify([{ p: 0, s: 0, e: 9 }]) },
  flags: { key: "en8:flags:01-4-c1", value: JSON.stringify({ "0": true }) },
  clock: { key: "en8:clock:01-4-c1", value: "true" },
  fluency: { key: "en8:fluency:01-5-f1", value: JSON.stringify([{ secs: 1, left: 239 }]) },
  intake: {
    key: "en8:intake:01-2-v1",
    value: JSON.stringify([{ set: 0, right: 12, total: 12, at: SAMPLE_AT }]),
  },
  bank: { key: "en8:bank:01-3-b1", value: JSON.stringify([{ right: 10, total: 10, at: SAMPLE_AT }]) },
  comic: { key: "en8:comic:01-1-d1", value: "0" },
  seen: {
    key: "en8:seen:v1",
    value: JSON.stringify({ "01-3-b1": { _t: 1, "3.1-1-gap-fill-1": 1, "3.1-3-choice-1": 1 } }),
  },
  thread: { key: "en8:thread:articles:06:4", value: JSON.stringify({ got: 3, all: 5 }) },
  /* A read-again (mode "read") keeps its rounds under the same family as a
     talk-again; it is its own kind of work on its own page. */
  readAgain: { key: "en8:fluency:02-4-f1", value: JSON.stringify([{ secs: 41, left: 0 }, { secs: 33, left: 0 }]) },
  calib: {
    key: "en8:calib:v1",
    value: JSON.stringify({ "01": { "0": { n: 0, ok: 0 }, "1": { n: 5, ok: 5 } } }),
  },
};

/** STORED, not UI. Write samples into localStorage (all of them, or the kinds
    named). The page must be on the site's origin; reload to see them painted. */
export async function storeSamples(page: Page, kinds?: string[]): Promise<void> {
  const list = (kinds || Object.keys(LEARNER_KEY_SAMPLES)).map(k => {
    const s = LEARNER_KEY_SAMPLES[k];
    if (!s) throw new Error(`driver: no sample named "${k}"`);
    return s;
  });
  await page.evaluate(items => { for (const s of items) localStorage.setItem(s.key, s.value); }, list);
}
