/* THROWAWAY reference implementation — exists only to prove the harness can
 * go green on a correct build and red on each targeted defect. Never shipped.
 * Defect switches come from window.__REF_DEFECT__ (set via a query string). */
import { initializeApp } from "firebase/app";
import {
  getAuth, setPersistence, indexedDBLocalPersistence, connectAuthEmulator,
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from "firebase/firestore/lite";

const DEFECT = __DEFECT__;
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
  if (DEFECT === "utc-day") return new Date().toISOString().slice(0, 10);
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

function paintRhythm() {
  const days = readJSON(DAYS, {});
  rhythmEl.innerHTML = "<h3>Your week</h3>" + Object.keys(days).sort().map(d =>
    `<p data-en8-day="${d}">${d}: ${days[d]} task${days[d] === 1 ? "" : "s"} answered</p>`).join("")
    + (DEFECT === "streak" ? "<p>2 day streak!</p>" : "")
    + (DEFECT === "minutes" ? "<p>12 minutes studied</p>" : "");
}

/* --- local change detection --------------------------------------------- */
let pulling = false, pending = false, timer = null, user = null;
const rawSet = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) {
  rawSet.call(this, k, v);
  if (DEFECT === "slow-save" && k === "en8:tasks:v1") { const t = performance.now(); while (performance.now() - t < 150) {} }
  if (this !== localStorage || pulling || !String(k).startsWith("en8:") || k === "en8:theme") return;
  pending = true;
  if (!navigator.onLine) { setSync("offline", "Offline — your work is kept on this device"); return; }
  if (!user) return;
  if (DEFECT !== "silent-push") setSync("syncing", "Saving…");
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
  if (DEFECT === "blob-lww") return pending ? { ...local } : { ...remote, ...(Object.keys(remote).length ? {} : local) };
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
function writeLocal(blob) {
  pulling = true;
  try { for (const [k, v] of Object.entries(blob)) localStorage.setItem(k, v); } finally { pulling = false; }
  paintRhythm();
}

let db, ref;
async function exchange() {
  if (!user) return;
  if (!navigator.onLine) { setSync("offline", "Offline — your work is kept on this device"); return; }
  if (DEFECT !== "silent-push") setSync("syncing", "Saving…");
  try {
    const snap = await getDoc(ref);
    const remote = snap.exists() ? snap.data().keys || {} : {};
    const merged = merge(remote, localBlob());
    await setDoc(ref, { keys: merged });
    writeLocal(merged);
    pending = false;
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
if ("serviceWorker" in navigator && DEFECT !== "no-sw") {
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
if (DEFECT === "cloud-render") {
  const hidden = [...document.querySelectorAll('.task[data-done="1"]')];
  hidden.forEach(t => { t.dataset.done = ""; t.style.visibility = "hidden"; });
  window.__refReveal = () => hidden.forEach(t => { t.dataset.done = "1"; t.style.visibility = ""; });
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
      ref = doc(db, "users", DEFECT === "shared-doc" ? "everyone" : u.uid, "state", "main");
      await exchange();
    } else {
      setAuth("signed-out");
      $("[data-en8-signin]").hidden = false; $("[data-en8-signout]").hidden = true;
      if (navigator.onLine) setSync("idle", "Sign in to keep your work on every device");
    }
  });
  $("[data-en8-signin]").addEventListener("click", async () => {
    setAuth("signing-in");
    try { await ready; await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch { setAuth("signed-out"); }
  });
  $("[data-en8-signout]").addEventListener("click", () => signOut(auth));
}
