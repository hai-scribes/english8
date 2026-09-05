/* Google sign-in, via the Firebase JS SDK. Bundled separately from app.js so
   the hand-written client stays dependency-free; this is the one file allowed
   a dependency, and it is bundled by esbuild at build time into
   assets/auth.bundle.js — never fetched from a CDN, so the page still works
   offline once that bundle is cached.

   Configuration comes from window.__EN8_FIREBASE__ (set by the sibling
   assets/firebase-config.js, loaded first) rather than being inlined here, so
   the harness can substitute an emulator config over the wire without this
   file changing between a developer's machine and a test run. */
import { initializeApp } from "firebase/app";
import {
  getAuth, setPersistence, indexedDBLocalPersistence, connectAuthEmulator,
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "firebase/auth";

const cfg = window.__EN8_FIREBASE__;
const stateEl = document.querySelector("[data-en8-auth-state]");
const signinBtn = document.querySelector("[data-en8-signin]");
const signoutBtn = document.querySelector("[data-en8-signout]");
const idEl = document.querySelector("[data-en8-identity]");

function setState(s) {
  if (stateEl) stateEl.setAttribute("data-en8-auth-state", s);
}

function paintSignedOut() {
  setState("signed-out");
  if (idEl) { idEl.textContent = ""; idEl.hidden = true; }
  if (signinBtn) signinBtn.hidden = false;
  if (signoutBtn) signoutBtn.hidden = true;
}

function paintSignedIn(user) {
  setState("signed-in");
  if (idEl) { idEl.textContent = user.email || user.displayName || user.uid; idEl.hidden = false; }
  if (signinBtn) signinBtn.hidden = true;
  if (signoutBtn) signoutBtn.hidden = false;
}

if (!cfg) {
  setState("error");
} else {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  if (cfg.emulators?.auth) {
    connectAuthEmulator(auth, cfg.emulators.auth, { disableWarnings: true });
  }

  /* Started, not awaited, before the listeners below are wired: awaiting here
     would delay attaching the click handler, and a click landing in that
     window finds no handler and does nothing — silently losing the sign-in
     rather than merely storing it under the wrong persistence. The listener
     is wired synchronously instead, and it is the handler itself that awaits
     this promise before ever calling signInWithPopup, so the write to
     indexedDB persistence still lands before any session does. */
  const persistenceReady = setPersistence(auth, indexedDBLocalPersistence)
    .catch(e => console.warn("en8: persistence could not be set", e));

  onAuthStateChanged(auth, user => {
    if (user) paintSignedIn(user); else paintSignedOut();
  });

  signinBtn?.addEventListener("click", async () => {
    setState("signing-in");
    try {
      await persistenceReady;
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      console.warn("en8: sign-in failed", e);
      paintSignedOut();
    }
  });

  signoutBtn?.addEventListener("click", () => {
    signOut(auth).catch(e => console.warn("en8: sign-out failed", e));
  });
}
