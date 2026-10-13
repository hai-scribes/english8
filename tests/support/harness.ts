/* What a test of this feature stands on: devices, accounts, the network
   between them, and a view of the store that does not go through the page.

   A "device" is one browser context — its own storage, service worker, clock
   and network. Two devices of one learner are two contexts signed in as one
   account. Everything a test steers on the site itself (a second build, a
   request that hangs) belongs to that test alone; see server.mjs.

   Nothing here reads the feature's code. It reads the page as the criteria
   describe it, and the few hooks listed in tests/support/CONTEXT.md. */
import { test as base, expect, type Browser, type BrowserContext, type Locator, type Page, type Request } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { SITE, AUTH, STORE, HOST, SITE_PORT, AUTH_PORT, STORE_PORT, PROJECT } from "./ports.mjs";

export { expect };
export const ADDR = { SITE, AUTH, STORE, PROJECT };

/* ---- the status texts, verbatim from the criteria ----------------------- */
export const TEXT = {
  saving: "Saving…",
  saved: "Saved",
  checking: "Checking…",
  offline: "No connection. Your work is kept on this device and will be saved when you are back online.",
  failed: "Could not save just now. Trying again in a moment.",
  held: "Your work is kept on this device. Sign in to see it and save it.",
  otherAccount: "This device is holding unsaved work for another account. Sign in to that account first.",
  laterDraw: "Saved. Work from your other device will show on the next page you open.",
  signInFailed: "Could not sign in. Check your connection and try again.",
  question: "Work was done on this device while nobody was signed in. Add it to your account?",
} as const;

export type Account = { email: string };
export type StoreRequest = {
  url: string;
  method: string;
  /** what the request did: a read of documents, a write of documents, or something else */
  kind: "read" | "write" | "other";
  /** the Sync status text on the page at the moment the request left ("" when it showed nothing) */
  status: string;
  /** <html data-auth> at the moment the request left */
  auth: string;
  /** documents the answer carried (reads) */
  docsRead: number;
  /** documents the request wrote (writes) */
  docsWritten: number;
  /** HTTP status of the answer; 0 when it never arrived */
  code: number;
  /** the device's own clock when the request left */
  at: number;
};
export type StoredDoc = { id: string; key: string; v: string | null; t: number; s: string | null };

const isStoreUrl = (u: string) => u.includes(`${HOST}:${STORE_PORT}`) || u.includes("firestore.googleapis.com");
const isAuthUrl = (u: string) => u.includes(`${HOST}:${AUTH_PORT}`) || u.includes("identitytoolkit.googleapis.com")
  || u.includes("securetoken.googleapis.com");

/* A document id back to the localStorage key it stands for: every character
   outside A-Z a-z 0-9 _ . - is written as ~ and four hex digits. */
export const keyOfDocId = (id: string) => id.replace(/~([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
export const docIdOfKey = (key: string) => key.replace(/[^A-Za-z0-9_.-]/g, c => "~" + c.charCodeAt(0).toString(16).padStart(4, "0"));

/* Runs in every page of a device, before the page's own scripts. It notes each
   request to the store as it leaves — with what the page was showing at that
   instant — and reports it to the test. */
function recorder(storeHost: string) {
  const w = window as any;
  if (w.__en8Rec) return;
  w.__en8Rec = true;
  const isStore = (u: string) => u.indexOf(storeHost) >= 0 || u.indexOf("firestore.googleapis.com") >= 0;
  const snap = () => {
    const el = document.querySelector('[role="status"][aria-label="Sync status"]') as HTMLElement | null;
    const shown = !!el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    return {
      status: el && shown ? (el.textContent || "").replace(/\s+/g, " ").trim() : "",
      auth: document.documentElement.dataset.auth || "",
      at: Date.now(),
    };
  };
  const kindOf = (url: string, method: string) =>
    /:commit|:batchWrite|:write/.test(url) || /^(PATCH|DELETE)$/i.test(method) ? "write"
      : /:runQuery|:batchGet|:listen|:runAggregationQuery/i.test(url) || /^GET$/i.test(method) ? "read" : "other";
  const count = (text: string, url: string, method: string) => {
    let read = 0;
    try {
      const j = JSON.parse(text);
      if (Array.isArray(j)) read = j.filter(x => x && (x.document || x.found)).length;
      else if (j && Array.isArray(j.documents)) read = j.documents.length;
      else if (j && j.name && /^GET$/i.test(method)) read = 1;
    } catch (e) {}
    return read;
  };
  const written = (body: string) => {
    try { const j = JSON.parse(body); return Array.isArray(j.writes) ? j.writes.length : 0; } catch (e) { return 0; }
  };
  const report = (rec: any) => { try { w.__en8Record(rec); } catch (e) {} };

  const realFetch = w.fetch;
  w.fetch = function (input: any, init: any) {
    const url = typeof input === "string" ? input : (input && input.url) || String(input);
    if (!isStore(url)) return realFetch.apply(this, arguments as any);
    const method = (init && init.method) || (input && input.method) || "GET";
    const body = init && typeof init.body === "string" ? init.body : "";
    const rec: any = { url, method, kind: kindOf(url, method), docsRead: 0, docsWritten: written(body), code: 0, ...snap() };
    const p = realFetch.apply(this, arguments as any);
    p.then(async (r: Response) => {
      rec.code = r.status;
      try { rec.docsRead = count(await r.clone().text(), url, method); } catch (e) {}
      report(rec);
    }, () => report(rec));
    return p;
  };
  const X = w.XMLHttpRequest.prototype, open = X.open, send = X.send;
  X.open = function (method: string, url: string) {
    (this as any).__en8 = { method, url: String(url) };
    return open.apply(this, arguments as any);
  };
  X.send = function (body: any) {
    const m = (this as any).__en8;
    if (m && isStore(m.url)) {
      const rec: any = { url: m.url, method: m.method, kind: kindOf(m.url, m.method), docsRead: 0,
        docsWritten: typeof body === "string" ? written(body) : 0, code: 0, ...snap() };
      this.addEventListener("loadend", () => {
        rec.code = this.status;
        try { rec.docsRead = count(this.responseText, m.url, m.method); } catch (e) {}
        report(rec);
      });
    }
    return send.apply(this, arguments as any);
  };
}

/* Makes the device's storage refuse anything that would make it bigger, the
   way a full disk does. Switched by a flag so a test can turn it on and off. */
function quota() {
  const w = window as any;
  if (w.__en8Quota) return;
  w.__en8Quota = true;
  const P = Storage.prototype, set = P.setItem;
  P.setItem = function (k: string, v: string) {
    let full = false;
    try { full = sessionStorage.getItem("__en8_full") === "1"; } catch (e) {}
    if (full && this === localStorage) {
      const was = localStorage.getItem(k);
      if (was === null || String(v).length > was.length) {
        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      }
    }
    return set.call(this, k, v);
  };
}

export type DeviceOptions = {
  /** e.g. "Asia/Ho_Chi_Minh" */
  timezone?: string;
  /** the device's clock at the start, e.g. "2026-09-08T06:30:00+07:00"; installs a clock the test controls */
  at?: string | Date;
  /** the browser reports navigator.connection.saveData as true */
  saveData?: boolean;
  viewport?: { width: number; height: number };
};

export class Device {
  readonly page: Page;
  /** every request this device has sent to the store, oldest first */
  readonly storeRequests: StoreRequest[] = [];
  private loads: number[] = [];
  private blocked = { backend: false, saves: false };

  constructor(readonly context: BrowserContext, page: Page, readonly lab: Lab) {
    this.page = page;
    this.watch(page);
  }

  private watch(page: Page) {
    page.on("load", () => { this.loads.push(Date.now()); });
  }

  /* ---- going places ---------------------------------------------------- */
  async open(path: string) {
    await this.page.goto(path, { waitUntil: "load" });
    return this.page;
  }
  home() { return this.open("/index.html"); }
  lesson(unit: number | string, n: number) {
    return this.open(`/unit-${String(unit).padStart(2, "0")}/lesson-${n}/index.html`);
  }
  /** another tab on this same device (same storage, same account) */
  async newTab(path?: string): Promise<Device> {
    const page = await this.context.newPage();
    const tab = new Device(this.context, page, this.lab);
    if (path) await tab.open(path);
    return tab;
  }

  /* ---- what the page says ---------------------------------------------- */
  get html(): Locator { return this.page.locator("html"); }
  /** the status beside the account: role=status, named "Sync status" */
  get status(): Locator { return this.page.getByRole("status", { name: "Sync status" }); }
  get signInButton(): Locator { return this.page.getByRole("button", { name: "Sign in with Google" }); }
  get signOutButton(): Locator { return this.page.getByRole("button", { name: "Sign out" }); }
  get retryButton(): Locator { return this.page.getByRole("button", { name: "Try again", exact: true }); }
  get addItButton(): Locator { return this.page.getByRole("button", { name: "Add it" }); }
  get keepSeparateButton(): Locator { return this.page.getByRole("button", { name: "Keep it separate" }); }
  /** the "Your days" region (on the Today page) */
  get days(): Locator { return this.page.getByRole("region", { name: "Your days" }); }
  expectAuth(state: "signed-out" | "signing-in" | "signed-in") {
    return expect(this.html).toHaveAttribute("data-auth", state, { timeout: 15_000 });
  }
  expectStatus(text: string, timeout = 15_000) {
    return expect(this.status).toHaveText(text, { timeout });
  }
  expectSaved(timeout = 20_000) { return this.expectStatus(TEXT.saved, timeout); }
  /** the build id of the script that is running: <html data-build> */
  build(): Promise<string | null> { return this.html.getAttribute("data-build"); }

  /* ---- signing in and out ---------------------------------------------- */
  /** clicks "Sign in with Google" and returns the popup, untouched */
  async startSignIn(): Promise<Page> {
    const [popup] = await Promise.all([this.page.waitForEvent("popup"), this.signInButton.click()]);
    return popup;
  }
  /** picks (or makes) the account in the emulator's Google popup */
  async completeSignIn(popup: Page, account: Account) {
    await popup.waitForLoadState("load");
    const known = popup.locator("li.js-reuse-account", { hasText: account.email });
    const add = popup.locator("#add-account-button button");
    await expect(known.or(add).first()).toBeVisible();
    if (await known.count()) {
      await known.first().click();
    } else {
      await add.click();
      await popup.locator("#email-input").fill(account.email);
      await popup.locator("#sign-in").click();
    }
  }
  /**
   * The whole sign-in. When the page asks about work done while signed out,
   * `signedOutWork` answers it; leave it out to leave the question on the page.
   */
  async signIn(account: Account, opts: { signedOutWork?: "add" | "separate" } = {}) {
    const popup = await this.startSignIn();
    await this.completeSignIn(popup, account);
    await this.expectAuth("signed-in");
    if (opts.signedOutWork === "add") await this.addItButton.click();
    if (opts.signedOutWork === "separate") await this.keepSeparateButton.click();
  }
  async signOut() {
    await this.signOutButton.click();
    await this.expectAuth("signed-out");
  }
  /** the signed-in account as Firebase holds it on this device: its uid and a fresh ID token */
  async credential(): Promise<{ uid: string; idToken: string } | null> {
    return this.page.evaluate(() => new Promise<{ uid: string; idToken: string } | null>(done => {
      const open = indexedDB.open("firebaseLocalStorageDb");
      open.onerror = () => done(null);
      open.onsuccess = () => {
        const db = open.result;
        if (!db.objectStoreNames.contains("firebaseLocalStorage")) return done(null);
        const all = db.transaction("firebaseLocalStorage").objectStore("firebaseLocalStorage").getAll();
        all.onsuccess = () => {
          const row = (all.result as any[]).find(x => /^firebase:authUser:/.test(x.fbase_key));
          done(row && row.value ? { uid: row.value.uid, idToken: row.value.stsTokenManager.accessToken } : null);
        };
        all.onerror = () => done(null);
      };
    }));
  }
  /**
   * Signs a different account in on this device without the page's own
   * controls — as another tab or a restored session would — so the page meets
   * an account it did not sign in. Uses the test's own sign-in page.
   */
  async signInBehindThePage(account: Account) {
    const side = await this.context.newPage();
    await side.goto("/__test/auth.html");
    const [popup] = await Promise.all([side.waitForEvent("popup"), side.locator("#go").click()]);
    await this.completeSignIn(popup, account);
    await expect(side).toHaveTitle("in:" + account.email, { timeout: 15_000 });
    await side.close();
  }

  /* ---- the network ------------------------------------------------------ */
  /** no network at all for this device (pages, sign-in and the store) */
  async offline(on = true) { await this.context.setOffline(on); }
  /** the site still loads; sign-in and the store cannot be reached */
  async backendUnreachable(on = true) {
    this.blocked.backend = on;
  }
  /** the store answers every write with an error; reads still work */
  async failSaves(on = true) {
    this.blocked.saves = on;
  }
  /** hold every write to the store open, unanswered, until released */
  private held: Array<() => void> = [];
  private holding = false;
  async holdSaves(on = true) {
    this.holding = on;
    if (!on) { this.held.splice(0).forEach(go => go()); }
  }
  /** requests to the store since the mark (or all of them) */
  requestsSince(mark = 0): StoreRequest[] { return this.storeRequests.slice(mark); }
  mark(): number { return this.storeRequests.length; }
  docsReadSince(mark = 0): number { return this.requestsSince(mark).reduce((n, r) => n + r.docsRead, 0); }
  writesSince(mark = 0): StoreRequest[] { return this.requestsSince(mark).filter(r => r.kind === "write"); }

  async install() {
    const ctx = this.context;
    await ctx.exposeBinding("__en8Record", (_src, rec: StoreRequest) => { this.storeRequests.push(rec); });
    await ctx.addInitScript(recorder, `${HOST}:${STORE_PORT}`);
    await ctx.addInitScript(quota);
    await ctx.route(u => isStoreUrl(u.href) || isAuthUrl(u.href), async route => {
      const req: Request = route.request();
      const url = req.url();
      if (this.blocked.backend) return route.abort("connectionfailed");
      const write = isStoreUrl(url) && (/:commit|:batchWrite|:write/.test(url) || /^(PATCH|DELETE)$/.test(req.method()));
      if (write && this.blocked.saves) {
        return route.fulfill({ status: 503, contentType: "application/json",
          body: JSON.stringify({ error: { code: 503, status: "UNAVAILABLE", message: "made to fail by the test" } }) });
      }
      if (write && this.holding) {
        await new Promise<void>(go => this.held.push(go));
      }
      return route.fallback();
    });
  }

  /* ---- the page being drawn again --------------------------------------- */
  /** how many times the page has been loaded (drawn) so far; a redraw is a reload of the document */
  draws(): number { return this.loads.length; }
  drawsSince(count: number): number { return this.loads.length - count; }

  /* The learner comes back to this tab. A device looks for work from her other
     devices when a page loads, when the tab is returned to, when the network
     comes back, after each of its own saves, and once a minute while the tab
     is showing; this is the one a test can cause without waiting or reloading. */
  async returnToTab() {
    await this.page.evaluate(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("focus"));
    });
  }

  /* ---- the device's clock ----------------------------------------------- */
  /** set the clock to this instant; timers keep running from there */
  async setTime(at: string | Date) { await this.context.clock.setSystemTime(new Date(at)); }
  /** let this much time pass at once, firing every timer due on the way */
  async advance(ms: number) { await this.context.clock.runFor(ms); }

  /* ---- the device's storage, read and written directly ------------------ */
  stored(key: string): Promise<string | null> {
    return this.page.evaluate(k => localStorage.getItem(k), key);
  }
  /** writes through localStorage.setItem on the page, exactly as the lesson code does */
  setStored(key: string, value: string) {
    return this.page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
  }
  removeStored(key: string) {
    return this.page.evaluate(k => localStorage.removeItem(k), key);
  }
  /** every localStorage key and value on the device */
  storage(): Promise<Record<string, string>> {
    return this.page.evaluate(() => {
      const out: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        out[k] = localStorage.getItem(k)!;
      }
      return out;
    });
  }
  /** everything readable from the browser's storage as one string: localStorage and sessionStorage */
  storageText(): Promise<string> {
    return this.page.evaluate(() => {
      const parts: string[] = [];
      for (const s of [localStorage, sessionStorage]) {
        for (let i = 0; i < s.length; i++) {
          const k = s.key(i)!;
          if (k === "__en8_full") continue;
          parts.push(k + "=" + s.getItem(k));
        }
      }
      return parts.join("\n");
    });
  }
  /** from now on the device's storage has no room for anything new or bigger */
  async storageFull(on = true) {
    await this.context.addInitScript(v => { try { sessionStorage.setItem("__en8_full", v); } catch (e) {} }, on ? "1" : "0");
    for (const p of this.context.pages()) {
      await p.evaluate(v => { try { sessionStorage.setItem("__en8_full", v); } catch (e) {} }, on ? "1" : "0").catch(() => {});
    }
  }

  /* ---- the service worker's copy of the course -------------------------- */
  /** resolves once a service worker controls the page */
  async workerReady() {
    await this.page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await expect.poll(() => this.page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 20_000 }).toBe(true);
  }
  /** every URL path kept in Cache Storage on this device */
  keptPaths(): Promise<string[]> {
    return this.page.evaluate(async () => {
      const out: string[] = [];
      for (const name of await caches.keys()) {
        const c = await caches.open(name);
        for (const r of await c.keys()) { const u = new URL(r.url); out.push(u.pathname + u.search); }
      }
      return out;
    });
  }
  /**
   * Waits until the device holds every page and asset the published build
   * lists in /precache.json (the list is read from the server, not the device).
   */
  async courseKept(timeout = 120_000) {
    const res = await this.lab.fetchSite("/precache.json");
    const list = await res.json() as { files: Record<string, string> };
    const want = Object.keys(list.files).map(u => new URL(u, SITE + "/").pathname.replace(/index\.html$/, ""));
    await expect.poll(async () => {
      const have = new Set((await this.keptPaths()).map(p => p.split("?")[0].replace(/index\.html$/, "")));
      return want.filter(p => !have.has(p)).length;
    }, { timeout, intervals: [500, 1000, 2000] }).toBe(0);
  }
}

export class StoreView {
  constructor(private lab: Lab) {}
  private admin = { authorization: "Bearer owner" };
  private base = `${STORE}/v1/projects/${PROJECT}/databases/(default)/documents`;

  /** the uid the Auth emulator gave this account, or null if it has never signed in */
  async uid(account: Account): Promise<string | null> {
    const r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:query`, {
      method: "POST", headers: { ...this.admin, "content-type": "application/json" }, body: "{}",
    });
    const j = await r.json() as any;
    const row = (j.userInfo || []).find((u: any) => u.email === account.email
      || (u.providerUserInfo || []).some((p: any) => p.email === account.email));
    return row ? row.localId : null;
  }
  /** every document under users/<uid>/kv, read past the rules */
  async docs(account: Account): Promise<StoredDoc[]> {
    const uid = await this.uid(account);
    if (!uid) return [];
    const out: StoredDoc[] = [];
    let token = "";
    do {
      const r = await fetch(`${this.base}/users/${uid}/kv?pageSize=300${token ? "&pageToken=" + token : ""}`, { headers: this.admin });
      const j = await r.json() as any;
      for (const d of j.documents || []) {
        const id = String(d.name).split("/").pop()!;
        const f = d.fields || {};
        out.push({
          id, key: keyOfDocId(id),
          v: f.v && "stringValue" in f.v ? f.v.stringValue : null,
          t: f.t ? Number(f.t.integerValue ?? f.t.doubleValue ?? 0) : 0,
          s: f.s ? (f.s.timestampValue ?? null) : null,
        });
      }
      token = j.nextPageToken || "";
    } while (token);
    return out;
  }
  /** the stored value for one localStorage key: a string, null for a kept deletion, undefined when absent */
  async value(account: Account, key: string): Promise<string | null | undefined> {
    const d = (await this.docs(account)).find(x => x.key === key);
    return d ? d.v : undefined;
  }
  /** waits until the store holds this value for this key */
  expectValue(account: Account, key: string, check: (v: string | null | undefined) => boolean, timeout = 20_000) {
    return expect.poll(async () => check(await this.value(account, key)), { timeout }).toBe(true);
  }
  /**
   * One operation on a document path, made with an ID token as a client would
   * (so the rules apply). Returns the HTTP status: 200 allowed, 403 refused.
   * `path` is relative to the database root, e.g. `users/<uid>/kv/probe`.
   */
  async as(idToken: string, op: "get" | "list" | "create" | "update" | "delete", path: string): Promise<number> {
    const h = { authorization: "Bearer " + idToken, "content-type": "application/json" };
    const doc = JSON.stringify({ fields: { v: { stringValue: "probe" }, t: { integerValue: "1" } } });
    const url = `${this.base}/${path}`;
    if (op === "get") return (await fetch(url, { headers: h })).status;
    if (op === "list") return (await fetch(url.replace(/\/[^/]+$/, ""), { headers: h })).status;
    if (op === "delete") return (await fetch(url, { method: "DELETE", headers: h })).status;
    if (op === "create") {
      const parent = url.replace(/\/[^/]+$/, ""), id = url.split("/").pop();
      return (await fetch(`${parent}?documentId=${id}`, { method: "POST", headers: h, body: doc })).status;
    }
    return (await fetch(`${url}?currentDocument.exists=true`, { method: "PATCH", headers: h, body: doc })).status;
  }
  /** puts a document in place past the rules, for arranging a test */
  async seed(path: string, value = "seeded") {
    await fetch(`${this.base}/${path}`, {
      method: "PATCH", headers: { ...this.admin, "content-type": "application/json" },
      body: JSON.stringify({ fields: { v: { stringValue: value }, t: { integerValue: "1" } } }),
    });
  }
}

export class SiteControl {
  constructor(readonly id: string) {}
  private async post(patch: Record<string, unknown>) {
    const r = await fetch(`${SITE}/__test/site?id=${this.id}`, { method: "POST", body: JSON.stringify(patch) });
    return r.json() as Promise<{ build: string; asked: string[] }>;
  }
  /** publish the later build (b2), or go back to the first (b1) */
  publish(build: "b1" | "b2") { return this.post({ build }); }
  /** hold every request whose path matches open, unanswered (null to stop) */
  hang(pattern: string | null) { return this.post({ hang: pattern }); }
  /** answer this many more requests for the site's files, then drop the connection on the rest (null to stop) */
  cutAfter(n: number | null) { return this.post({ cutAt: n }); }
  /** the site cannot be reached at all (the device itself still thinks it is online) */
  down(on = true) { return this.post({ down: on }); }
  /** the paths this test's devices have asked the site for, oldest first */
  async asked(): Promise<string[]> { return (await this.post({})).asked; }
  forget() { return this.post({ forget: true }); }
}

export class Lab {
  readonly site: SiteControl;
  readonly store = new StoreView(this);
  private made: BrowserContext[] = [];
  private n = 0;
  constructor(private browser: Browser, readonly id: string) {
    this.site = new SiteControl(id);
  }
  /** a new account, unlike any other test's */
  account(name = "learner"): Account {
    return { email: `${name}-${this.id}-${++this.n}@example.com` };
  }
  /** a new device with nothing on it */
  async device(opts: DeviceOptions = {}): Promise<Device> {
    const context = await this.browser.newContext({
      baseURL: SITE,
      timezoneId: opts.timezone,
      viewport: opts.viewport ?? { width: 1100, height: 900 },
      serviceWorkers: "allow",
    });
    this.made.push(context);
    await context.addCookies([{ name: "en8site", value: this.id, domain: HOST, path: "/" }]);
    if (opts.at) await context.clock.install({ time: new Date(opts.at) });
    if (opts.saveData) {
      await context.addInitScript(() => {
        const c = (navigator as any).connection || {};
        Object.defineProperty(navigator, "connection", {
          configurable: true,
          get: () => new Proxy(c, { get: (t, k) => (k === "saveData" ? true : typeof t[k] === "function" ? t[k].bind(t) : t[k]) }),
        });
      });
    }
    const page = await context.newPage();
    const device = new Device(context, page, this);
    await device.install();
    return device;
  }
  /** a request to the site as this test's devices see it (same published build) */
  fetchSite(path: string) {
    return fetch(SITE + path, { headers: { cookie: `en8site=${this.id}` } });
  }
  async close() { for (const c of this.made) await c.close().catch(() => {}); }
}

export const test = base.extend<{ lab: Lab }>({
  lab: async ({ browser }, use) => {
    const lab = new Lab(browser, randomUUID().slice(0, 8));
    await use(lab);
    await lab.close();
  },
});
