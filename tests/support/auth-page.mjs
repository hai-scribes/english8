/* The test's own sign-in page, served at /__test/auth.html. It signs an
   account in on the device without going through the feature's controls: the
   same Firebase app, the same emulator, so the session it makes is the one the
   site's pages find. The page title says who is signed in. */
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

const cfg = window.EN8_FIREBASE;
const auth = getAuth(initializeApp(cfg));
connectAuthEmulator(auth, cfg.emulators.auth, { disableWarnings: true });
onAuthStateChanged(auth, u => { document.title = u ? "in:" + u.email : "out"; });
document.getElementById("go").onclick = () =>
  signInWithPopup(auth, new GoogleAuthProvider()).catch(e => { document.title = "err:" + e.code; });
