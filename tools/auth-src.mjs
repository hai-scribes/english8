/* English 8 — signing in. This is the only file that touches Firebase, and it
   does one thing: it knows who is signed in. It is bundled into
   auth.bundle.js (`npm run bundle`) and fetched beside the page, never before
   it; sync.js does everything else and talks to the store itself.

   Google is the one way in. The session is kept by the browser (IndexedDB), so
   a page opened later — or with no network — still knows the account. */
import { initializeApp } from "firebase/app";
import {
  getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "firebase/auth";

const cfg = window.EN8_FIREBASE || (() => {
  try { return JSON.parse(localStorage.getItem("en8-sync:config")); } catch (e) { return null; }
})();

if (cfg && cfg.projectId) {
  const auth = getAuth(initializeApp(cfg));
  if (cfg.emulators && cfg.emulators.auth) connectAuthEmulator(auth, cfg.emulators.auth, { disableWarnings: true });
  window.EN8Auth = {
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signOut: () => signOut(auth),
    /* A token the store will accept; refreshed by the client when it is old. */
    token: () => (auth.currentUser ? auth.currentUser.getIdToken() : Promise.reject(new Error("signed out"))),
  };
  onAuthStateChanged(auth, u => {
    if (window.EN8Sync) window.EN8Sync.onUser(u ? { uid: u.uid, email: u.email || "" } : null);
  });
}
