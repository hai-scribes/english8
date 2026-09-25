/* Boots everything a scenario needs and holds it open: the static site as it
 * actually ships, plus the Firebase Auth and Firestore emulators.
 *
 * `serve:` owns boot/readiness/teardown, so nothing here is hand-rolled into a
 * scenario command and nobody is ever asked to start a server in another
 * terminal.
 *
 * PORTS ARE NEVER LITERALS. A goal-lane tournament runs several variant
 * worktrees concurrently on one machine; a fixed port makes the second variant
 * fail for a reason that has nothing to do with its work. The static port comes
 * from ATELIER_VARIANT_PORT (the runner exports it; the fallback keeps a plain
 * single-worktree run working) and the two emulator ports are bound ephemerally
 * — asked of the kernel, then released — and recorded in ports.json for the
 * scenarios to read.
 *
 * The project id is `demo-english8`. The `demo-` prefix is Firebase's own
 * convention for an emulator-only project: it has no cloud counterpart, so this
 * harness cannot reach production data and cannot bill anything, by
 * construction rather than by care.
 */
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { spawn } from "node:child_process";
import { existsSync, statSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { tmpdir } from "node:os";
import { REPO, HARNESS_DIR, PORTS_FILE, resolveBuild, javaEnv } from "./lib.mjs";

const PROJECT = "demo-english8";

const build = resolveBuild();
if (!build.path) { console.error("no build directory found (dist/, build/, docs/)"); process.exit(1); }
console.log(`serving ${build.dir}/`);

/* Ask the kernel for a free port, then let it go. There is a race between
 * releasing and re-binding, but it is the same race every dev server runs and
 * it is bounded to this machine; the alternative — a fixed offset from the
 * variant port — collides deterministically instead of rarely. */
function freePort() {
  return new Promise((resolve, reject) => {
    const s = createNetServer();
    s.once("error", reject);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".map": "application/json",
};

const staticPort = Number(process.env.ATELIER_VARIANT_PORT || 8788);

/* The site is served under the path it is published at —
 * https://hai-scribes.github.io/english8/ — not at the root. A service worker
 * scoped to `/`, or an asset referenced as `/assets/…`, works at the root of
 * a local server and breaks on the live site; serving at the root would pass
 * exactly the builds that fail in production. */
const BASE = "/english8/";

/* A simulated deploy. POST /__harness/deploy makes the server behave as if a
 * new build had been published: every page names a new `?v=` for app.js and
 * app.css, and app.js itself sets `window.__EN8_DEPLOY__` to the deploy
 * count. That is the shape of a real deploy here — build.py content-hashes
 * those two assets into the query string — and it is what lets the gate ask
 * whether a service worker lets a new build reach a device that already has
 * the old one, which is the service worker's own named risk. The control path
 * lives outside BASE so no page of the site can collide with it. */
let deploys = 0;

const site = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/__harness/deploy" && req.method === "POST") {
      deploys++;
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ deploys }));
      return;
    }
    if (url === "/" || url === BASE.slice(0, -1)) {
      res.writeHead(302, { location: BASE }).end();
      return;
    }
    if (!url.startsWith(BASE)) {
      res.writeHead(404, { "content-type": "text/plain" }).end("not found (the site lives under " + BASE + ")");
      return;
    }
    let p = join(build.path, url.slice(BASE.length));
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
    let body = await readFile(p);
    if (deploys && extname(p) === ".html") {
      body = Buffer.from(body.toString("utf8")
        .replace(/(app\.(?:js|css)\?v=)([0-9A-Za-z]+)/g, `$1$2d${deploys}`));
    } else if (deploys && p.endsWith(`${join("assets", "app.js")}`)) {
      body = Buffer.concat([body, Buffer.from(`\n;window.__EN8_DEPLOY__ = ${deploys};\n`)]);
    }
    /* No caching from the harness. GitHub Pages serves these with
     * `max-age=600` and the build already content-hashes app.js/app.css in the
     * query string; a harness cache would only hide a stale-asset defect that
     * the real deploy would show.
     *
     * And no Service-Worker-Allowed header: GitHub Pages cannot send custom
     * headers, so a service worker has to live at (or above) the scope it
     * claims, exactly as it will on the live site. */
    res.writeHead(200, {
      "content-type": TYPES[extname(p)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("not found");
  }
});

await new Promise((resolve, reject) => {
  site.once("error", reject);
  site.listen(staticPort, "127.0.0.1", resolve);
});
console.log(`static site on http://127.0.0.1:${staticPort}${BASE}`);

/* --- the emulators ------------------------------------------------------- */
const authPort = await freePort();
const firestorePort = await freePort();
const uiPort = await freePort();
/* The hub, the logging channel and Firestore's own websocket default to the
 * FIXED ports 4400, 4500 and 9150. They are not mentioned in the emulator's
 * own summary as configurable, and they are the reason two concurrent variants
 * collide even when the auth and firestore ports differ — the second variant
 * then fails for a reason that looks like a defect in its code. Every port
 * this process opens is ephemeral. */
const hubPort = await freePort();
const loggingPort = await freePort();
const wsPort = await freePort();

/* The generated config lives in the variant's own TMPDIR, never in the
 * worktree: the worktree copy would be a gate artifact whose bytes change per
 * run, and every variant would write the same path. */
const scratch = join(process.env.TMPDIR || tmpdir(), `en8-emul-${process.pid}`);
mkdirSync(scratch, { recursive: true });

/* Rules are a real part of the product — a rule that lets one signed-in user
 * read another's progress is a defect the emulator can catch and nothing else
 * can. They are read from the worktree when present so the gate tests the
 * shipped rules; the fallback below is deny-all, which fails loudly rather
 * than passing permissively. */
const shippedRules = join(REPO, "firestore.rules");
const rulesPath = join(scratch, "firestore.rules");
if (existsSync(shippedRules)) {
  writeFileSync(rulesPath, await readFile(shippedRules, "utf8"));
  console.log("using firestore.rules from the worktree");
} else {
  writeFileSync(rulesPath,
    "rules_version = '2';\n" +
    "service cloud.firestore {\n" +
    "  match /databases/{db}/documents {\n" +
    "    match /{document=**} { allow read, write: if false; }\n" +
    "  }\n" +
    "}\n");
  console.log("no firestore.rules in the worktree yet — running deny-all");
}

writeFileSync(join(scratch, "firebase.json"), JSON.stringify({
  firestore: { rules: rulesPath },
  emulators: {
    auth: { port: authPort, host: "127.0.0.1" },
    firestore: { port: firestorePort, host: "127.0.0.1", websocketPort: wsPort },
    hub: { port: hubPort, host: "127.0.0.1" },
    logging: { port: loggingPort, host: "127.0.0.1" },
    ui: { enabled: false, port: uiPort },
    singleProjectMode: true,
  },
}, null, 2));

/* The Firestore emulator is a Java program and Homebrew keeps openjdk off
 * PATH. Fail here, naming the cause, rather than letting the emulator die
 * with a message that reads like a Firebase fault. */
const jenv = javaEnv();
if (!jenv) {
  console.error(
    "no JDK found — the Firestore emulator is a Java program.\n" +
    "Install one with `brew install openjdk` (no PATH edit needed; this harness\n" +
    "resolves the keg itself), or set JAVA_HOME.");
  cleanup(1);
}

/* The binary by absolute path, not via `npx`: npx resolves from the cwd's
 * node_modules, and the cwd here is the variant scratch dir deliberately — so
 * that `firestore-debug.log` and `ui-debug.log`, which the emulator writes to
 * wherever it is started, land in TMPDIR instead of dirtying the worktree
 * (they are untracked files inside a declared gate artifact tree otherwise). */
const firebaseBin = join(REPO, "node_modules", ".bin", "firebase");
if (!existsSync(firebaseBin)) {
  console.error(`no ${firebaseBin} — run \`npm ci\` (firebase-tools is a devDependency).`);
  cleanup(1);
}

const emul = spawn(firebaseBin, [
  "emulators:start",
  "--project", PROJECT,
  "--only", "auth,firestore",
  "--config", join(scratch, "firebase.json"),
], { cwd: scratch, stdio: ["ignore", "inherit", "inherit"], env: jenv });

emul.on("exit", (code, signal) => {
  console.error(`firebase emulators exited (code=${code} signal=${signal})`);
  cleanup(code ?? 1);
});
emul.on("error", err => {
  console.error(`could not spawn the firebase emulators: ${err.message}`);
  cleanup(1);
});

/* Readiness is published, not guessed. ports.json appears only once BOTH
 * emulators answer, so `ready_command` polling for this file is polling for a
 * genuinely usable stack rather than for a process that has been spawned. */
mkdirSync(HARNESS_DIR, { recursive: true });
rmSync(PORTS_FILE, { force: true });

async function up(port, path = "/") {
  try {
    const r = await fetch(`http://127.0.0.1:${port}${path}`);
    return r.status < 500;
  } catch { return false; }
}

(async () => {
  const deadline = Date.now() + 150_000;
  while (Date.now() < deadline) {
    if (await up(authPort) && await up(firestorePort)) {
      writeFileSync(PORTS_FILE, JSON.stringify({
        project: PROJECT,
        site: `http://127.0.0.1:${staticPort}`,
        base: BASE,
        sitePort: staticPort,
        authHost: `127.0.0.1:${authPort}`,
        authPort,
        firestoreHost: "127.0.0.1",
        firestorePort,
      }, null, 2));
      console.log(`emulators ready — auth :${authPort}, firestore :${firestorePort}`);
      return;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  console.error("emulators never became ready within 150s");
  cleanup(1);
})();

function cleanup(code) {
  rmSync(PORTS_FILE, { force: true });
  rmSync(scratch, { recursive: true, force: true });
  try { emul.kill("SIGTERM"); } catch {}
  try { site.close(); } catch {}
  process.exit(code);
}
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => cleanup(0));
