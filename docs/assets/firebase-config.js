/* The Firebase web config. Public by design — security is enforced by
   firestore.rules, not by hiding these values — so it ships as an ordinary
   asset rather than an injected secret.

   A harness run substitutes this whole file's bytes over the wire with one
   that points at the local emulators (see harness/browser.mjs); the app
   itself takes the same branch either way, keyed off `emulators` below being
   present or absent.

   Placeholder project: replace with the real project's values before this
   ships past a prototype. */
window.__EN8_FIREBASE__ = {
  apiKey: "AIzaSyDEMO-english8-learn-anywhere-00000000000",
  authDomain: "english8-learn-anywhere.firebaseapp.com",
  projectId: "english8-learn-anywhere",
  appId: "1:000000000000:web:0000000000000000000000",
};
