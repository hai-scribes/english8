/* THROWAWAY reference implementation — exists only to prove the harness can
 * go green on a correct build and red on each targeted defect. Never shipped.
 * Defect switches are compiled in by make-ref.sh (esbuild --define). */
import { initializeApp } from "firebase/app";
import {
  getAuth, setPersistence, indexedDBLocalPersistence, connectAuthEmulator,
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from "firebase/firestore/lite";

/* One defect, or several joined with "+" (e.g. "shared-doc+open-rules"). */
const DEFECTS = new Set(__DEFECT__.split("+").filter(Boolean));
const has = d => DEFECTS.has(d);
const cfg = window.__EN8_FIREBASE__;
const $ = s => document.querySelector(s);
const stateEl = $("[data-en8-auth-state]");
const syncEl = $("[data-en8-sync-state]");
const detailEl = $("[data-en8-sync-detail]");
const rhythmEl = $("[data-en8-rhythm]");
const setAuth = s => stateEl.setAttribute("data-en8-auth-state", s);
const setSync = (s, text) => { syncEl.setAttribute("data-en8-sync-state", s); detailEl.textContent = text; };

const DAYS = "en8:days:v1";
const localDay = () => {
  if (has("utc-day")) return new Date().toISOString().slice(0, 10);
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

function paintRhythm() {
  const days = readJSON(DAYS, {});
  rhythmEl.innerHTML = "<h3>Your week</h3>" + Object.keys(days).sort().map(d =>
    `<p data-en8-day="${d}">${d}: ${days[d]} task${days[d] === 1 ? "" : "s"} answered</p>`).join("")
    + (has("streak") ? "<p>2 day streak!</p>" : "")
    + (has("minutes") ? "<p>12 minutes studied</p>" : "");
}

/* --- local change detection --------------------------------------------- */
let pulling = false, pending = false, timer = null, user = null, signInSettled = true;
const rawSet = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) {
  rawSet.call(this, k, v);
  if (has("slow-save") && k === "en8:tasks:v1") { const t = performance.now(); while (performance.now() - t < 150) {} }
  if (this !== localStorage || pulling || !String(k).startsWith("en8:") || k === "en8:theme") return;
  pending = true;
  if (!navigator.onLine) { setSync("offline", "Offline — your work is kept on this device"); return; }
  if (!user) return;
  if (!has("silent-push")) setSync("syncing", "Saving…");
  clearTimeout(timer);
  timer = setTimeout(push, 300);
};

document.addEventListener("en8:task-done", () => {
  const days = readJSON(DAYS, {});
  const d = localDay();
  days[d] = (days[d] || 0) + 1;
  localStorage.setItem(DAYS, JSON.stringify(days));
  paintRhythm();
});

/* --- merge: tasks per id (later `at` wins), days by max, rest local-wins -- */
function merge(remote, local) {
  const out = { ...remote, ...local };
  if (has("blob-lww")) return pending ? { ...local } : { ...remote, ...(Object.keys(remote).length ? {} : local) };
  const rt = JSON.parse(remote["en8:tasks:v1"] || "{}"), lt = JSON.parse(local["en8:tasks:v1"] || "{}");
  const tasks = { ...rt };
  for (const [id, rec] of Object.entries(lt)) if (!tasks[id] || (rec.at || 0) >= (tasks[id].at || 0)) tasks[id] = rec;
  if (Object.keys(tasks).length) out["en8:tasks:v1"] = JSON.stringify(tasks);
  const rd = JSON.parse(remote[DAYS] || "{}"), ld = JSON.parse(local[DAYS] || "{}");
  const days = { ...rd };
  for (const [d, n] of Object.entries(ld)) days[d] = Math.max(days[d] || 0, n);
  if (Object.keys(days).length) out[DAYS] = JSON.stringify(days);
  return out;
}
const localBlob = () => {
  const o = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith("en8:") && k !== "en8:theme") o[k] = localStorage.getItem(k);
  }
  return o;
};
/* Order-blind comparison, so a push that merely re-serialised the same record
 * is not mistaken for new work arriving. */
const canon = v => JSON.stringify(v, (k, x) =>
  x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort()) : x);
const same = (a, b) => { try { return canon(JSON.parse(a)) === canon(JSON.parse(b)); } catch { return a === b; } };
/* Returns true when work that app.js paints arrived from elsewhere: app.js
 * reads storage once at boot, so the page it drew is stale and has to be
 * drawn again. The reference reloads; the rhythm record repaints in place. */
function writeLocal(blob) {
  let stale = false;
  pulling = true;
  try {
    for (const [k, v] of Object.entries(blob)) {
      const old = localStorage.getItem(k);
      if (k !== DAYS && (old == null || !same(old, v))) stale = true;
      localStorage.setItem(k, v);
    }
  } finally { pulling = false; }
  paintRhythm();
  return stale;
}

let db, ref;
async function exchange() {
  if (!user) return;
  if (!navigator.onLine) { setSync("offline", "Offline — your work is kept on this device"); return; }
  if (!has("silent-push")) setSync("syncing", "Saving…");
  try {
    const snap = await getDoc(ref);
    const remote = snap.exists() ? snap.data().keys || {} : {};
    const merged = merge(remote, localBlob());
    await setDoc(ref, { keys: merged });
    const stale = writeLocal(merged);
    pending = false;
    if (stale && !has("no-repaint")) { location.reload(); return; }
    window.__refReveal?.();
    setSync("synced", "Saved a moment ago");
  } catch (e) {
    console.warn("ref sync failed", e);
    setSync(navigator.onLine ? "error" : "offline", "Could not save just now — your work is safe on this device");
  }
}
const push = () => exchange();

addEventListener("offline", () => setSync("offline", "Offline — your work is kept on this device"));
addEventListener("online", () => { if (user) exchange(); });

/* --- service worker ------------------------------------------------------ */
if ("serviceWorker" in navigator && !has("no-sw")) {
  const swUrl = new URL("../sw.js", import.meta.url).href;
  navigator.serviceWorker.register(swUrl).then(async () => {
    const reg = await navigator.serviceWorker.ready;
    const urls = [location.href, ...performance.getEntriesByType("resource").map(e => e.name)]
      .filter(u => u.startsWith(location.origin) && !u.includes("firebase-config"));
    reg.active?.postMessage({ precache: urls });
  }).catch(e => console.warn("sw", e));
}

/* --- auth ---------------------------------------------------------------- */
paintRhythm();
if (has("cloud-render")) {
  /* app.js renders the tasks at DOMContentLoaded, which fires after this
   * module runs (modules run at readyState "interactive"). So every saved
   * attempt is hidden AS it is painted — watched, not looked for once — and
   * shown only when the cloud has answered. */
  const hidden = new Set();
  let revealed = false;
  const hide = t => { hidden.add(t); t.dataset.done = ""; t.style.visibility = "hidden"; };
  const mo = new MutationObserver(recs => {
    if (revealed) return;
    for (const r of recs) if (r.target.dataset?.done === "1" && r.target.matches(".task")) hide(r.target);
  });
  mo.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["data-done"] });
  document.querySelectorAll('.task[data-done="1"]').forEach(hide);
  window.__refReveal = () => {
    if (revealed) return;
    revealed = true; mo.disconnect();
    hidden.forEach(t => { t.dataset.done = "1"; t.style.visibility = ""; });
  };
}
if (!cfg) setAuth("error");
else {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  db = getFirestore(app);
  if (cfg.emulators?.auth) connectAuthEmulator(auth, cfg.emulators.auth, { disableWarnings: true });
  if (cfg.emulators?.firestoreHost) connectFirestoreEmulator(db, cfg.emulators.firestoreHost, cfg.emulators.firestorePort);
  if (navigator.onLine) setSync("syncing", "Checking your account…");
  else setSync("offline", "Offline — your work is kept on this device");
  const ready = setPersistence(auth, indexedDBLocalPersistence).catch(() => {});
  onAuthStateChanged(auth, async u => {
    user = u;
    if (u) {
      setAuth("signed-in");
      $("[data-en8-identity]").textContent = u.email; $("[data-en8-identity]").hidden = false;
      $("[data-en8-signin]").hidden = true; $("[data-en8-signout]").hidden = false;
      ref = doc(db, "users", has("shared-doc") ? "everyone" : u.uid, "state", "main");
      await exchange();
    } else {
      /* The first callback can land after an early click: a sign-in already
       * under way must not be painted over as "signed out". */
      if (stateEl.getAttribute("data-en8-auth-state") === "signing-in" && !signInSettled) return;
      setAuth("signed-out");
      $("[data-en8-signin]").hidden = false; $("[data-en8-signout]").hidden = true;
      if (navigator.onLine) setSync("idle", "Sign in to keep your work on every device");
    }
  });
  $("[data-en8-signin]").addEventListener("click", async () => {
    setAuth("signing-in");
    signInSettled = false;
    try { await ready; await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch { setAuth("signed-out"); }
    finally { signInSettled = true; }
  });
  $("[data-en8-signout]").addEventListener("click", () => signOut(auth));
}
