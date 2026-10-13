/* English 8 — her work on every device. No dependencies, no build step for
   this file; the Firebase client is a separate bundle that only signs in.

   The lesson code is not asked to know any of this. It reads and writes
   localStorage exactly as before; this file watches those writes, and when an
   account is signed in it carries them to a store under that account and
   brings back what her other devices wrote. Nothing here is on the path that
   draws a lesson: the page is whole before the first request leaves.

   Three kinds of key:
     en8:…            her work (all but en8:theme). Uploaded.
     en8-sync:…       this layer's own notes. Never uploaded.
     en8-sync:parked: work held for an account that signed out before it could
                      be saved, encrypted with a key made from that account.

   Every exchange with the store is said on the page first: the status reads
   "Saving…" or "Checking…" before a request leaves and "Saved" only after the
   answer is back. */
(function(){
"use strict";

const LS = (() => { try { return window.localStorage; } catch(e){ return null; } })();
if (!LS) return;
const root = document.documentElement;
const self_ = document.currentScript;

/* ---------------- where things are kept --------------------------------- */
const K = {
  owner:   "en8-sync:owner",      // { uid, email }: whose work the en8: keys are
  meta:    "en8-sync:meta",       // stamps, what is unsent, where reading stopped
  base:    "en8-sync:base:",      // a key's value as it last agreed with the store
  config:  "en8-sync:config",     // the sign-in settings last seen, for a page opened offline
  anon:    "en8-sync:anon",       // signed-out work she chose to keep out of the account
  parked:  "en8-sync:parked:",    // held work, encrypted
  leaving: "en8-sync:leaving",    // a tab is signing out; the others wait for it
  blocked: "en8-sync:blocked",    // another account was turned away to protect unsaved work
};
const isWork = k => typeof k === "string" && k.indexOf("en8:") === 0 && k !== "en8:theme";
/* Written by a page merely loading, not by anything she did: these never
   count as "work was done on this device while nobody was signed in". */
const isIncidental = k => /^en8:(shape|comic):/.test(k);

const TEXT = {
  saving: "Saving…",
  saved: "Saved",
  checking: "Checking…",
  offline: "No connection. Your work is kept on this device and will be saved when you are back online.",
  failed: "Could not save just now. Trying again in a moment.",
  held: "Your work is kept on this device. Sign in to see it and save it.",
  other: "This device is holding unsaved work for another account. Sign in to that account first.",
  later: "Saved. Work from your other device will show on the next page you open.",
  signIn: "Could not sign in. Check your connection and try again.",
  ask: "Work was done on this device while nobody was signed in. Add it to your account?",
};

const P = Storage.prototype;
const rawSet = P.setItem, rawRemove = P.removeItem;
const put = (k, v) => rawSet.call(LS, k, v);
const drop = k => rawRemove.call(LS, k);
const get = k => LS.getItem(k);
const readJSON = (k, d) => { try { const v = JSON.parse(get(k)); return v == null ? d : v; } catch(e){ return d; } };
const workKeys = () => {
  const out = [];
  for (let i = 0; i < LS.length; i++){ const k = LS.key(i); if (isWork(k)) out.push(k); }
  return out;
};

/* The notes are read fresh for every change and written straight back, so two
   tabs of one device never work from different copies. If the device has no
   room to write them, the copy in memory serves for the life of the page. */
let metaMem = null;
function meta(){
  const m = metaMem || readJSON(K.meta, null) || {};
  m.st = m.st || {};          // key -> change stamp
  m.dirty = m.dirty || {};    // key -> 1 while the store has not got it
  m.u = m.u || {};            // key -> the store's own time for the copy last seen
  return m;
}
function saveMeta(m){
  try { put(K.meta, JSON.stringify(m)); metaMem = null; }
  catch(e){ metaMem = m; }
}
const owner = () => readJSON(K.owner, null);
/* A stamp is never earlier than any this device has made or seen, so a clock
   that runs fast on one device cannot outrank a later change on another. */
function tick(m){
  m.clock = Math.max(Date.now(), (m.clock || 0) + 1);
  return m.clock;
}

/* ---------------- watching her writes ----------------------------------- */
let applying = 0;                  // set while this layer itself writes her keys
function note(k, was){
  if (!owner()) return;            // signed out: the work stays on the device
  const m = meta();
  if (!m.dirty[k]){
    try { put(K.base + k, JSON.stringify({ v: was })); } catch(e){}
    m.dirty[k] = 1;
  }
  m.st[k] = tick(m);
  saveMeta(m);
  changed();
}
P.setItem = function(k, v){
  if (this !== LS || applying || !isWork(k)) return rawSet.call(this, k, v);
  const was = this.getItem(k), now = String(v);
  rawSet.call(this, k, now);
  if (was !== now) note(k, was);
};
P.removeItem = function(k){
  if (this !== LS || applying || !isWork(k)) return rawRemove.call(this, k);
  const was = this.getItem(k);
  rawRemove.call(this, k);
  if (was !== null) note(k, was);
};
function writeWork(k, v){
  applying++;
  try { if (v === null) drop(k); else put(k, v); }
  finally { applying--; }
}

/* ---------------- the header -------------------------------------------- */
const $ = id => document.getElementById(id);
let ui = null;
let user = null;                 // the signed-in account, once the client has said so
let statusText = "", authState = "signed-out", signInError = false, drawLater = false, sayLater = false;
function wire(){
  const box = $("acct");
  if (!box) return;
  ui = { box, status: $("syncStatus"), retry: $("syncRetry"), who: $("acctWho"),
         inBtn: $("signInBtn"), outBtn: $("signOutBtn"), err: $("signInErr") };
  ui.inBtn.addEventListener("click", signIn);
  ui.outBtn.addEventListener("click", signOut);
  ui.retry.addEventListener("click", () => { wait = FIRST_WAIT; clearTimeout(retryTimer); cycle("retry"); });
  paint();
}
function setAuth(s){
  authState = s;
  root.dataset.auth = s;
  paint();
}
function say(t){
  statusText = t;
  paint();
}
/* Kept where it can be: the device may have no room left at all. */
let blockedMem = false;
function isBlocked(){
  try { return blockedMem || !!get(K.blocked) || sessionStorage.getItem(K.blocked) === "1"; }
  catch(e){ return blockedMem; }
}
function setBlocked(on){
  blockedMem = on;
  try { if (on) put(K.blocked, "1"); else drop(K.blocked); } catch(e){}
  try { if (on) sessionStorage.setItem(K.blocked, "1"); else sessionStorage.removeItem(K.blocked); } catch(e){}
}
const hasParked = () => {
  for (let i = 0; i < LS.length; i++) if ((LS.key(i) || "").indexOf(K.parked) === 0) return true;
  return false;
};
/* The status is one sentence. While work from another device is waiting to be
   shown, a round that only looked says so; a round that saved her own work
   says "Saved", which is what she is waiting to read. */
function shown(){
  if (authState !== "signed-in"){
    if (isBlocked()) return TEXT.other;
    return authState === "signed-out" && hasParked() ? TEXT.held : "";
  }
  if (drawLater && sayLater && (statusText === TEXT.saved || statusText === "")) return TEXT.later;
  return statusText;
}
function paint(){
  if (!ui) return;
  const o = owner() || user, inn = authState === "signed-in", t = shown();
  if (ui.status.textContent !== t) ui.status.textContent = t;
  ui.retry.hidden = !(inn && statusText === TEXT.failed);
  ui.who.hidden = !inn;
  ui.who.textContent = inn && o ? o.email || "" : "";
  ui.outBtn.hidden = !inn;
  ui.inBtn.hidden = inn || !config();
  ui.inBtn.disabled = authState === "signing-in";
  ui.err.textContent = signInError && authState === "signed-out" ? TEXT.signIn : "";
  ui.box.hidden = false;
}

/* ---------------- the sign-in settings ---------------------------------- */
function config(){
  if (window.EN8_FIREBASE && window.EN8_FIREBASE.projectId){
    try { put(K.config, JSON.stringify(window.EN8_FIREBASE)); } catch(e){}
    return window.EN8_FIREBASE;
  }
  return readJSON(K.config, null);
}
function storeBase(){
  const c = config();
  const host = c.emulators && c.emulators.firestore
    ? "http://" + c.emulators.firestore : "https://firestore.googleapis.com";
  return host + "/v1/projects/" + c.projectId + "/databases/(default)/documents";
}
const docName = (uid, id) => "projects/" + config().projectId + "/databases/(default)/documents/users/" + uid + "/kv/" + id;
/* A key as a document id: anything outside A-Z a-z 0-9 _ . - becomes ~ and
   four hex digits, which turns back into exactly the key it came from. */
const idOf = k => k.replace(/[^A-Za-z0-9_.-]/g, c => "~" + ("000" + c.charCodeAt(0).toString(16)).slice(-4));
const keyOf = id => id.replace(/~([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

/* ---------------- two copies of one key --------------------------------- */
/* When a key changed here and in the store since they last agreed, the two
   are put together where that means something and the later one wins where it
   does not. A note is one piece of text: the later stamp wins it whole. A log
   of attempts is many pieces: each device's entries are kept. `base` is the
   value both started from, which is what tells "she removed this" from "the
   other device added that". */
const isObj = x => x !== null && typeof x === "object" && !Array.isArray(x);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const family = k => (/^en8:([a-z]+)/.exec(k) || [])[1] || "";
const MERGED = { tasks:1, days:1, progress:1, review:1, intake:1, bank:1, fluency:1, seen:1,
                 story:1, write:1, calib:1, marks:1, flags:1, jot:1, thread:1 };
/* Counts that two devices each add to: the merged figure is the start plus
   what each added, so a day reviewed on two devices counts both. */
const SUMMED = { days:1, calib:1 };

function mergeTask(b, m, t, mineLater){
  const log = mergeList((b && b.log) || [], m.log || [], t.log || [], mineLater, "tasks");
  const cleared = x => typeof x.at !== "number";
  let win;
  if (cleared(m) && cleared(t)) win = m;
  /* A record with no answers is a fresh start. It stands unless the other
     device answered after it — which shows as an attempt its history lacks. */
  else if (cleared(m)) win = (m.log || []).some(a => a.at === t.at) ? m : t;
  else if (cleared(t)) win = (t.log || []).some(a => a.at === m.at) ? t : m;
  else win = m.at === t.at ? (mineLater ? m : t) : (m.at > t.at ? m : t);
  const out = Object.assign({}, win);
  out.log = log;
  return out;
}
function mergeList(b, m, t, mineLater, fam){
  /* Rounds and drafts are told apart by their place in the list, so two
     devices' lists cannot be added together: the longer one has them all. */
  if (fam === "fluency" || fam === "write")
    return m.length === t.length ? (mineLater ? m : t) : (m.length > t.length ? m : t);
  const id = x => JSON.stringify(x);
  const inB = new Set((b || []).map(id)), inM = new Set(m.map(id)), inT = new Set(t.map(id));
  const out = [], seen = new Set();
  for (const x of t.concat(m)){
    const k = id(x);
    if (seen.has(k)) continue;
    seen.add(k);
    /* In the start and missing from one side: that side took it out. */
    if (inB.has(k) && !(inM.has(k) && inT.has(k))) continue;
    out.push(x);
  }
  if (out.every(x => isObj(x) && typeof x.at === "number")) out.sort((x, y) => x.at - y.at);
  return out;
}
function merge3(b, m, t, mineLater, fam, depth){
  if (same(m, t)) return m;
  if (b !== undefined && same(b, m)) return t;
  if (b !== undefined && same(b, t)) return m;
  if (fam === "tasks" && depth === 1 && isObj(m) && isObj(t)) return mergeTask(isObj(b) ? b : null, m, t, mineLater);
  /* One item's place in the review cycle is a single fact: the copy that was
     answered later is the true one. */
  if (fam === "review" && depth === 1 && isObj(m) && isObj(t)){
    const lm = m.last || 0, lt = t.last || 0;
    return lm === lt ? (mineLater ? m : t) : (lm > lt ? m : t);
  }
  if (isObj(m) && isObj(t)){
    const bb = isObj(b) ? b : {}, out = {};
    for (const k of Object.keys(t).concat(Object.keys(m).filter(k => !(k in t)))){
      const inM = k in m, inT = k in t, inB = k in bb;
      if (inM && inT) out[k] = merge3(inB ? bb[k] : undefined, m[k], t[k], mineLater, fam, depth + 1);
      /* On one side only. New there: kept. Taken out by the other side: it
         stays out, unless this side changed it afterwards. */
      else if (inM){ if (!inB || (!same(bb[k], m[k]) && mineLater)) out[k] = m[k]; }
      else { if (!inB || (!same(bb[k], t[k]) && !mineLater)) out[k] = t[k]; }
    }
    return out;
  }
  if (Array.isArray(m) && Array.isArray(t)) return mergeList(Array.isArray(b) ? b : [], m, t, mineLater, fam);
  if (typeof m === "number" && typeof t === "number"){
    if (SUMMED[fam]){ const s = typeof b === "number" ? b : 0; return s + (m - s) + (t - s); }
    if (fam === "seen") return Math.max(m, t);
  }
  return mineLater ? m : t;
}
/* Strings in, string out; null is "the key is gone". */
function merge(k, base, mine, theirs, tm, tt){
  const mineLater = tm === tt ? String(mine) > String(theirs) : tm > tt;
  const whole = mineLater ? mine : theirs;
  if (mine === null || theirs === null) return whole;
  const fam = family(k);
  if (!MERGED[fam]) return whole;
  let m, t, b;
  try { m = JSON.parse(mine); t = JSON.parse(theirs); } catch(e){ return whole; }
  try { b = base == null ? undefined : JSON.parse(base); } catch(e){ b = undefined; }
  if ((!isObj(m) && !Array.isArray(m)) || Array.isArray(m) !== Array.isArray(t) || isObj(m) !== isObj(t)) return whole;
  return JSON.stringify(merge3(b, m, t, mineLater, fam, 0));
}

/* ---------------- talking to the store ---------------------------------- */
const online = () => navigator.onLine !== false;
/* The account's token is good for an hour. It is asked for once and kept for
   half of that, so a request leaves the moment it is decided on; a token the
   store turns down is fetched again, once. */
let pass = null;
async function token(){
  const now = Date.now();
  if (pass && now >= pass.at && now - pass.at < 30 * 60 * 1000) return pass.t;
  pass = { t: await window.EN8Auth.token(), at: Date.now() };
  return pass.t;
}
/* A request the store accepts and never answers is a failed request: without
   a limit the page would read "Saving…" for as long as it stayed open. */
const LONGEST_ANSWER = 20000;
async function call(method, url, body){
  const stop = new AbortController();
  const limit = setTimeout(() => stop.abort(), LONGEST_ANSWER);
  const send = async () => fetch(url, {
    method, headers: { authorization: "Bearer " + await token(), "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined, signal: stop.signal,
  });
  let res, json = null;
  try {
    res = await send();
    if (res.status === 401){ pass = null; res = await send(); }
    try { json = await res.json(); } catch(e){ if (stop.signal.aborted) throw e; }
  } finally { clearTimeout(limit); }
  if (!res.ok){
    const err = new Error("store " + res.status);
    const info = Array.isArray(json) ? json[0] : json;
    err.status = res.status;
    err.state = info && info.error ? info.error.status || "" : "";
    throw err;
  }
  return json;
}
const fieldsOf = d => {
  const f = d.fields || {};
  return {
    key: keyOf(d.name.split("/").pop()),
    v: f.v && typeof f.v.stringValue === "string" ? f.v.stringValue : null,
    t: f.t ? Number(f.t.integerValue || f.t.doubleValue || 0) : 0,
    s: f.s ? f.s.timestampValue || "" : "",
    u: d.updateTime || "",
  };
};
async function readAll(uid){
  const out = [];
  let page = "";
  do {
    const j = await call("GET", storeBase() + "/users/" + uid + "/kv?pageSize=300" + (page ? "&pageToken=" + encodeURIComponent(page) : ""));
    for (const d of (j && j.documents) || []) out.push(fieldsOf(d));
    page = (j && j.nextPageToken) || "";
  } while (page);
  return out;
}
async function readSince(uid, cursor){
  const j = await call("POST", storeBase() + "/users/" + uid + ":runQuery", { structuredQuery: {
    from: [{ collectionId: "kv" }],
    where: { fieldFilter: { field: { fieldPath: "s" }, op: "GREATER_THAN", value: { timestampValue: cursor } } },
    orderBy: [{ field: { fieldPath: "s" }, direction: "ASCENDING" }],
  } });
  return (j || []).filter(x => x.document).map(x => fieldsOf(x.document));
}
/* The store's times come with as many decimals as they need, so they are
   compared as times, not as text. */
const later = (a, b) => {
  const cut = x => { const m = /^(.*?)(?:\.(\d+))?Z$/.exec(x) || [0, x, ""]; return m[1] + "." + ((m[2] || "") + "000000000").slice(0, 9); };
  return cut(a) > cut(b);
};

/* What came from the store, put beside what is here. Returns the keys whose
   value on this device changed. */
function take(docs){
  const m = meta(), moved = [];
  for (const d of docs){
    if (!isWork(d.key)) continue;
    const k = d.key, here = get(k), seenAt = m.u[k];
    m.clock = Math.max(m.clock || 0, d.t);
    if (d.s && (!m.cursor || later(d.s, m.cursor))) m.cursor = d.s;
    if (seenAt && seenAt === d.u) continue;             // the copy already known
    m.u[k] = d.u;
    if (!m.dirty[k]){
      if (here !== d.v){ writeWork(k, d.v); moved.push(k); }
      m.st[k] = d.t;
      continue;
    }
    if (here === d.v){ delete m.dirty[k]; drop(K.base + k); m.st[k] = d.t; continue; }
    const base = readJSON(K.base + k, { v: null }).v;
    const out = merge(k, base, here, d.v, m.st[k] || 0, d.t);
    if (out !== here){ writeWork(k, out); moved.push(k); }
    if (out === d.v){ delete m.dirty[k]; drop(K.base + k); m.st[k] = d.t; }
    else {
      try { put(K.base + k, JSON.stringify({ v: d.v })); } catch(e){}
      m.st[k] = tick(m);
    }
  }
  saveMeta(m);
  return moved;
}

const DAY = 24 * 3600 * 1000, BATCH = 500;
async function pull(uid){
  const m = meta(), now = Date.now();
  /* Everything is read the first time, and again once a day in case a change
     was missed; otherwise only what the store says changed since last time. */
  const whole = !m.cursor || !m.full || now - m.full >= DAY || now < m.full;
  const docs = whole ? await readAll(uid) : await readSince(uid, m.cursor);
  const moved = take(docs);
  if (whole){
    const n = meta();
    n.full = now;
    if (!n.cursor) n.cursor = "1970-01-01T00:00:00Z";      // an empty account: read from the start next time
    saveMeta(n);
  }
  return moved;
}
async function push(uid){
  let sent = 0;
  for (;;){
    const m = meta();
    const keys = Object.keys(m.dirty).slice(0, BATCH);
    if (!keys.length) return sent;
    const stamps = {};
    const writes = keys.map(k => {
      const v = get(k);
      stamps[k] = m.st[k] || 0;
      return {
        update: { name: docName(uid, idOf(k)), fields: {
          v: v === null ? { nullValue: null } : { stringValue: v },
          t: { integerValue: String(stamps[k]) },
        } },
        updateTransforms: [{ fieldPath: "s", setToServerValue: "REQUEST_TIME" }],
        /* Only over the copy this device has seen: if another device wrote
           in between, the write is refused and the two are merged first. */
        currentDocument: m.u[k] ? { updateTime: m.u[k] } : { exists: false },
      };
    });
    const j = await call("POST", storeBase() + ":commit", { writes });
    const n = meta();
    keys.forEach((k, i) => {
      const r = j.writeResults && j.writeResults[i];
      n.u[k] = (r && r.updateTime) || j.commitTime || n.u[k];
      /* Changed again while the write was on its way: it is still unsent. */
      if ((n.st[k] || 0) === stamps[k]){ delete n.dirty[k]; drop(K.base + k); }
    });
    saveMeta(n);
    sent += keys.length;
  }
}

/* ---------------- one round with the store ------------------------------ */
const FIRST_WAIT = 8000, LONGEST_WAIT = 5 * 60 * 1000;
let running = null, again = false, wait = FIRST_WAIT, retryTimer = null, pushTimer = null;
const unsent = () => Object.keys(meta().dirty).length > 0;

function changed(){
  if (authState !== "signed-in" || !user) return;
  if (!online()){ say(TEXT.offline); return; }
  /* While saves are failing, a new change waits for the next try like the
     rest: the wait between tries is for the store's sake, not hers. */
  if (statusText === TEXT.failed) return;
  say(TEXT.saving);
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => cycle("save"), 700);
}
function cycle(why){
  if (running){ again = true; return running; }
  running = round(why).then(ok => {
    running = null;
    const more = again;
    again = false;
    if (more && ok) cycle("again");        // after a failure the timer decides
    return ok;
  }, () => { running = null; again = false; return false; });
  return running;
}
async function round(why){
  if (!user || authState !== "signed-in" || get(K.leaving)) return false;
  const o = owner();
  if (!o || o.uid !== user.uid) return false;
  if (!online()){ say(TEXT.offline); return false; }
  clearTimeout(retryTimer);
  /* Said before anything leaves. A failure stays on the page until a try
     succeeds, except when she asked for the try herself. */
  /* A try after a failure sends what is waiting straight away; reading
     first would only put the same failure a round-trip later. */
  const straight = statusText === TEXT.failed && unsent();
  if (statusText !== TEXT.failed || why === "retry") say(unsent() ? TEXT.saving : TEXT.checking);
  try {
    let moved = [], sent = false;
    for (let tries = 0; ; tries++){
      if (tries || !straight) moved = moved.concat(await pull(o.uid));
      if (unsent() && statusText === TEXT.checking) say(TEXT.saving);
      try {
        /* What was just written is read back once, so the next round does
           not mistake it for news. */
        if (await push(o.uid)){ sent = true; moved = moved.concat(await pull(o.uid)); }
        break;
      } catch(e){
        /* Refused because the store's copy is newer than the one seen: read
           again, merge, and write over that. */
        const clash = e.status === 409 || /FAILED_PRECONDITION|ABORTED|ALREADY_EXISTS/.test(e.state || "");
        if (!clash || tries >= 4) throw e;
        if (tries >= 1){ const m = meta(); delete m.full; m.u = {}; saveMeta(m); }
      }
    }
    wait = FIRST_WAIT;
    if (unsent()) again = true;
    sayLater = !sent;
    say(TEXT.saved);
    if (moved.length) arrived();
    return true;
  } catch(e){
    if (!online()){ say(TEXT.offline); return false; }
    say(TEXT.failed);
    /* 8 seconds, then 16, 32 ... up to five minutes; a success starts over. */
    const after = wait;
    wait = Math.min(wait * 2, LONGEST_WAIT);
    retryTimer = setTimeout(() => cycle("backoff"), after);
    return false;
  }
}

/* ---------------- drawing what arrived ---------------------------------- */
/* Work from another device is on this device the moment it is merged, but the
   page in front of her was drawn before it came. The page is drawn again only
   when that cannot cost her anything: never during a timed test, never while
   she has answers chosen, a run open or a box in use, and never within thirty
   seconds of her last touch on the lesson. */
const QUIET = 30000;
let lastTouch = 0;
function busy(){
  if (document.body.classList.contains("exam-on")) return true;
  const since = Date.now() - lastTouch;
  if (since >= 0 && since < QUIET) return true;
  const a = document.activeElement;
  if (a && a.closest && a.closest("main") && (a.tagName === "TEXTAREA" || a.isContentEditable
      || (a.tagName === "INPUT" && !/^(radio|checkbox|button|submit)$/.test(a.type)))) return true;
  for (const t of document.querySelectorAll('main [data-task]:not([data-done="1"])')){
    if (t.querySelector("input:checked, .i[data-ok], .i[data-tap], .i-line .i-tile")) return true;
  }
  /* A practice, word or review run is open while its question card shows. */
  for (const e of document.querySelectorAll("main .engine")){
    if (e.offsetParent !== null) return true;
  }
  return false;
}
function draw(){
  let recent = [];
  const now = Date.now();
  try { recent = JSON.parse(sessionStorage.getItem("en8-sync:draws") || "[]"); } catch(e){}
  recent = recent.filter(t => t <= now && now - t < 20000);
  if (recent.length >= 3) return false;
  recent.push(now);
  try { sessionStorage.setItem("en8-sync:draws", JSON.stringify(recent)); } catch(e){}
  location.reload();
  return true;
}
function arrived(){
  if (busy() || !draw()){ drawLater = true; paint(); }
}
function maybeDraw(){
  if (drawLater && authState === "signed-in" && !busy()) draw();
}

/* ---------------- held work --------------------------------------------- */
const enc = new TextEncoder(), dec = new TextDecoder();
const hex = buf => Array.from(new Uint8Array(buf)).map(b => ("0" + b.toString(16)).slice(-2)).join("");
const b64 = buf => { let s = ""; for (const b of new Uint8Array(buf)) s += String.fromCharCode(b); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function parkName(uid){
  return K.parked + hex(await crypto.subtle.digest("SHA-256", enc.encode("en8 held work " + uid))).slice(0, 32);
}
async function parkKey(uid){
  const raw = await crypto.subtle.importKey("raw", enc.encode(uid), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: enc.encode("en8-sync held work"), iterations: 100000, hash: "SHA-256" },
    raw, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function unpark(uid, keep){
  const name = await parkName(uid), raw = get(name);
  if (!raw) return {};
  try {
    const parts = raw.split(".");
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(parts[0]) }, await parkKey(uid), unb64(parts[1]));
    if (!keep) drop(name);
    return JSON.parse(dec.decode(plain));
  } catch(e){ return {}; }
}
/* Everything the store has not got, with what is needed to merge it later.
   Throws if the device has no room for it. */
async function park(uid){
  const m = meta(), held = {};
  for (const k of Object.keys(m.dirty)){
    held[k] = { v: get(k), t: m.st[k] || 0, b: readJSON(K.base + k, { v: null }).v };
  }
  if (!Object.keys(held).length) return;
  const before = await unpark(uid, true);
  for (const k of Object.keys(before)) if (!(k in held)) held[k] = before[k];
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const box = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await parkKey(uid), enc.encode(JSON.stringify(held)));
  put(await parkName(uid), b64(iv) + "." + b64(box));
}

/* ---------------- whose work is on the device ---------------------------- */
function clearWork(){
  for (const k of workKeys()) writeWork(k, null);
  const gone = [];
  for (let i = 0; i < LS.length; i++){
    const k = LS.key(i) || "";
    if (k === K.meta || k.indexOf(K.base) === 0) gone.push(k);
  }
  gone.forEach(drop);
  metaMem = null;
}
function restoreAnon(){
  const a = readJSON(K.anon, null);
  if (!a) return;
  for (const k of Object.keys(a)) writeWork(k, a[k]);
  drop(K.anon);
}
/* The device becomes this account's: what is on it is hers to send. */
function adopt(u, keys){
  put(K.owner, JSON.stringify({ uid: u.uid, email: u.email || "" }));
  const m = meta();
  for (const k of keys){
    m.dirty[k] = 1;
    /* A key no one chose a value for gives way to whatever the account has. */
    m.st[k] = isIncidental(k) ? 0 : tick(m);
  }
  saveMeta(m);
}
async function restoreHeld(u){
  const held = await unpark(u.uid, false), m = meta();
  for (const k of Object.keys(held)){
    writeWork(k, held[k].v);
    m.dirty[k] = 1;
    m.st[k] = held[k].t || tick(m);
    try { put(K.base + k, JSON.stringify({ v: held[k].b })); } catch(e){}
  }
  saveMeta(m);
  return Object.keys(held).length;
}

/* ---------------- the question ------------------------------------------ */
function ask(){
  return new Promise(done => {
    const was = document.activeElement;
    const card = document.createElement("div");
    card.className = "sync-ask";
    card.id = "syncAsk";
    card.setAttribute("role", "group");
    card.setAttribute("aria-labelledby", "syncAskQ");
    card.tabIndex = -1;
    card.innerHTML = '<p id="syncAskQ"></p><div class="row">'
      + '<button class="btn" type="button" data-a="add">Add it</button>'
      + '<button class="btn quiet" type="button" data-a="separate">Keep it separate</button></div>';
    card.firstChild.textContent = TEXT.ask;
    /* Above the lesson, and the page is brought up to it: she may be anywhere
       down the page, and a card pinned over her work would be in its way. */
    const top = document.querySelector("header.top");
    top.parentNode.insertBefore(card, top.nextSibling);
    window.scrollTo(0, 0);
    card.focus({ preventScroll: true });
    card.addEventListener("click", ev => {
      const b = ev.target.closest("button[data-a]");
      if (!b) return;
      card.remove();
      /* Focus goes back to where it was; the button she pressed to sign in
         is gone by now, and Sign out stands where it stood. */
      if (was && was !== document.body && document.contains(was) && was.offsetParent !== null) was.focus();
      else if (ui && !ui.outBtn.hidden) ui.outBtn.focus();
      done(b.dataset.a);
    });
  });
}

/* ---------------- the account changes ----------------------------------- */
let settling = Promise.resolve();
function onUser(u){
  settling = settling.then(() => settle(u)).catch(() => {});
}
async function settle(u){
  if (get(K.leaving)) return;             // a tab is signing out; it will say when it is done
  const o = owner();
  if (!u || !user || user.uid !== u.uid) pass = null;
  user = u;
  if (!u){
    if (o && !isBlocked()){
      /* The session ended somewhere else. Her unsent work is held, the rest
         goes, and the page is drawn without it. If it cannot be held it is
         left where it is. */
      try { if (unsent()) await park(o.uid); }
      catch(e){ setBlocked(true); setAuth("signed-out"); return; }
      clearWork(); drop(K.owner); restoreAnon();
      setAuth("signed-out");
      location.reload();
      return;
    }
    if (!signingIn) setAuth("signed-out");
    return;
  }
  if (o && o.uid !== u.uid){
    /* A different account, and the first never signed out. Its unsent work is
       held before anything else; if the device has no room to hold it, the
       newcomer is turned away and the work is left exactly as it is. */
    if (unsent()){
      try { await park(o.uid); }
      catch(e){
        setBlocked(true);
        user = null;
        try { await window.EN8Auth.signOut(); } catch(e2){}
        setAuth("signed-out");
        return;
      }
    }
    clearWork(); drop(K.owner);
  }
  setBlocked(false);
  signInError = false;
  if (owner()){ setAuth("signed-in"); cycle("load"); return; }

  /* This account is new to the device as it stands. */
  const mine = workKeys(), real = mine.filter(k => !isIncidental(k));
  let redraw = !!(o && o.uid !== u.uid);
  setAuth("signed-in");
  if (real.length){
    if ((await ask()) === "add") adopt(u, mine);
    else {
      const keep = {};
      for (const k of mine) keep[k] = get(k);
      put(K.anon, JSON.stringify(keep));
      clearWork();
      adopt(u, []);
      redraw = true;                       // the page still shows what was set aside
    }
  } else adopt(u, mine);
  if (await restoreHeld(u)) redraw = true;
  paint();
  await cycle("sign-in");
  if (redraw) draw();
}

let signingIn = false;
async function signIn(){
  if (signingIn || authState !== "signed-out") return;
  signInError = false;
  if (!window.EN8Auth || !online()){ signInError = true; paint(); return; }
  signingIn = true;
  setAuth("signing-in");
  try {
    await window.EN8Auth.signIn();        // the account arriving is told to onUser
    signingIn = false;
  } catch(e){
    signingIn = false;
    signInError = true;
    setAuth("signed-out");
  }
}

/* Under the six seconds she is promised, with room for holding the work and
   drawing the page. */
const LONGEST_GOODBYE = 5000;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function signOut(){
  const o = owner();
  if (!o || get(K.leaving)) return;
  ui.outBtn.disabled = true;
  /* Her last change is saved first. If it cannot be — no network, a store
     that fails, or no answer in time — it is held on the device. */
  clearTimeout(pushTimer);
  const end = Date.now() + LONGEST_GOODBYE;
  let ok = online();
  if (ok && unsent()) say(TEXT.saving);
  while (ok && unsent() && Date.now() < end){
    ok = await Promise.race([cycle("leave"), sleep(Math.max(0, end - Date.now())).then(() => false)]);
  }
  put(K.leaving, o.uid);
  clearTimeout(pushTimer); clearTimeout(retryTimer);
  if (unsent()){
    try { await park(o.uid); }
    catch(e){ drop(K.leaving); ui.outBtn.disabled = false; say(TEXT.failed); return; }
  }
  clearWork();
  restoreAnon();
  user = null;
  pass = null;
  try { await window.EN8Auth.signOut(); } catch(e){}
  drop(K.owner);
  drop(K.leaving);
  setAuth("signed-out");
  location.reload();
}

/* ---------------- start -------------------------------------------------- */
root.dataset.auth = authState = owner() && !isBlocked() ? "signed-in" : "signed-out";
window.EN8Sync = { onUser };

/* The sign-in settings and the client that uses them are fetched beside the
   page, never before it. With no network the settings last seen serve. */
function loadClient(){
  if (!self_ || !self_.dataset.auth) return;
  const client = () => {
    paint();
    if (!config()) return;
    const tag = document.createElement("script");
    tag.type = "module";
    tag.src = self_.dataset.auth;
    document.head.appendChild(tag);
  };
  const cfg = document.createElement("script");
  cfg.src = self_.dataset.config;
  cfg.onload = cfg.onerror = client;
  document.head.appendChild(cfg);
}
function start(){
  wire();
  if (owner() && !online()) say(TEXT.offline);
  loadClient();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();

window.addEventListener("online", () => { if (authState === "signed-in"){ wait = FIRST_WAIT; cycle("online"); } });
window.addEventListener("offline", () => { if (authState === "signed-in") say(TEXT.offline); });
let lastLook = 0;
function look(){
  maybeDraw();
  if (authState !== "signed-in" || !user || document.visibilityState === "hidden") return;
  const now = Date.now();
  if (now >= lastLook && now - lastLook < 1000) return;
  lastLook = now;
  if (statusText === TEXT.failed) return;        // the wait before the next try stands
  cycle("look");
}
document.addEventListener("visibilitychange", look);
window.addEventListener("focus", look);
setInterval(maybeDraw, 2000);
setInterval(look, 60000);
for (const type of ["pointerdown", "keydown", "input"]){
  document.addEventListener(type, ev => {
    if (ev.target && ev.target.closest && ev.target.closest("main")) lastTouch = Date.now();
  }, true);
}
/* Another tab signed out: this one follows. */
window.addEventListener("storage", ev => {
  if (ev.storageArea !== LS) return;
  if (ev.key === K.owner && ev.oldValue && !ev.newValue) location.reload();
  if (ev.key === K.meta) metaMem = null;
});

/* ---------------- the offline copy --------------------------------------- */
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && self_){
  const site = new URL("../", self_.src).href;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(site + "sw.js", { scope: site }).then(() => navigator.serviceWorker.ready).then(reg => {
      const tell = () => {
        const sw = reg.active;
        if (!sw) return;
        /* The page that was loaded before the worker took over, and what it
           fetched, are kept too. */
        const mine = [location.href.split("#")[0]].concat(
          performance.getEntriesByType("resource").map(e => e.name).filter(u => u.indexOf(site) === 0));
        sw.postMessage({ type: "en8:keep-page", urls: mine });
        /* The whole course, unless the device asks sites to save data. */
        const c = navigator.connection;
        if (!(c && c.saveData)) sw.postMessage({ type: "en8:keep-course" });
      };
      if (navigator.serviceWorker.controller) tell();
      else navigator.serviceWorker.addEventListener("controllerchange", tell, { once: true });
    }).catch(() => {});
  });
}
})();
