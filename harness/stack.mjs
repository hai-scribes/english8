/* `node harness/stack.mjs <scenario>` — run one scenario against a live stack,
 * booting one if none is up.
 *
 * Why this exists: the goal-lane tournament's benchmark runner executes a
 * milestone's benchmark command in the variant worktree WITHOUT the checks
 * file's `serve:` lifecycle, while the gate runs the same scenario through
 * `prototype check`, which boots it. Every scenario here needs the site and
 * both emulators, so a bare `node harness/sync.mjs` as a benchmark read the
 * stack-down numbers on every variant — m1's tournament could never certify
 * the work its own gate passed (charter, "Milestone 1 — findings"). Pointing
 * each benchmark at this wrapper makes the benchmark and the gate measure the
 * same thing.
 *
 * Under the gate a stack is already up and ports.json names it; this then
 * only runs the scenario. A ports.json whose servers no longer answer (a
 * serve.mjs killed hard never removes it) is not a live stack, and is
 * replaced rather than trusted. Output and exit code are the scenario's own,
 * so the metric protocol in lib.mjs passes through untouched.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { REPO, HARNESS_DIR, PORTS_FILE } from "./lib.mjs";

const SCENARIOS = ["build", "identity", "sync", "rhythm", "session", "speed"];
const name = process.argv[2];
if (!SCENARIOS.includes(name)) {
  console.error(`usage: node harness/stack.mjs <${SCENARIOS.join("|")}> [args…]`);
  process.exit(2);
}

async function answers(u) {
  try { return (await fetch(u, { signal: AbortSignal.timeout(3_000) })).status < 500; }
  catch { return false; }
}

async function liveStack() {
  if (!existsSync(PORTS_FILE)) return false;
  try {
    const p = JSON.parse(readFileSync(PORTS_FILE, "utf8"));
    return await answers(`${p.site}${p.base || "/english8/"}`) &&
           await answers(`http://${p.authHost}/`) &&
           await answers(`http://${p.firestoreHost}:${p.firestorePort}/`);
  } catch { return false; }
}

let serve = null;
function stop() {
  if (!serve || serve.exitCode !== null) return Promise.resolve();
  return new Promise(res => {
    const t = setTimeout(() => { try { serve.kill("SIGKILL"); } catch {} res(); }, 15_000);
    serve.once("exit", () => { clearTimeout(t); res(); });
    try { serve.kill("SIGTERM"); } catch { res(); }
  });
}
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, async () => { await stop(); process.exit(1); });
}

/* The build scenario needs no stack; every other one does. */
if (name !== "build" && !await liveStack()) {
  rmSync(PORTS_FILE, { force: true });
  mkdirSync(HARNESS_DIR, { recursive: true });
  const log = openSync(join(HARNESS_DIR, "stack-serve.log"), "w");
  serve = spawn(process.execPath, [join(REPO, "harness", "serve.mjs")],
    { cwd: REPO, stdio: ["ignore", log, log], env: process.env });
  const deadline = Date.now() + 240_000;
  while (!existsSync(PORTS_FILE) && serve.exitCode === null && Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 500));
  }
  /* Not ready is not a reason to skip the scenario: run it anyway, and it
   * reports its own stack-down numbers and names the cause, which is what
   * lib.mjs's protocol exists to guarantee. */
  if (!existsSync(PORTS_FILE)) {
    console.log(`stack.mjs: the stack did not come up (see ${join(HARNESS_DIR, "stack-serve.log")})`);
  }
}

const child = spawn(process.execPath, [join(REPO, "harness", `${name}.mjs`), ...process.argv.slice(3)],
  { cwd: REPO, stdio: "inherit", env: process.env });
const code = await new Promise(res => child.on("exit", (c, s) => res(c ?? (s ? 1 : 0))));
await stop();
process.exit(code);
