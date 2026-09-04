/* Shared harness plumbing for the learn-anywhere lane.
 *
 * The metric protocol and the MEASURE_ONLY escape are lifted deliberately from
 * the story-english harness (`harness/lib.mjs` on prototype/story-english),
 * because both were defects paid for once already and there is no reason to
 * pay again:
 *
 *   1. Emit a bare number. `ATELIER_METRIC <id>=<n>` — the unit lives in the
 *      metric id, never in the value.
 *   2. Emit a coverage count beside every result. A sweep that drove nothing
 *      and a sweep that found no defects produce identical output otherwise,
 *      and one is a pass while the other is a broken harness.
 *   3. Report the number even when the gate fails. `default_bench_runner`
 *      discards stdout on a non-zero exit, so a harness that gates itself
 *      reports its measurement only when it is ALREADY at threshold — which
 *      made every benchmark a boolean and left a variant at 380/400 recording
 *      `null`, indistinguishable from a variant that crashed on import.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

/* fileURLToPath, not URL.pathname: this repository's path contains a space
 * ("/Users/.../Per/English 8") and pathname hands back "English%208", which
 * fails to open. Every path in this tree is quoted for the same reason. */
export const REPO = fileURLToPath(new URL("..", import.meta.url));

export const HARNESS_DIR = join(REPO, ".atelier", "harness");

/** Where serve.mjs records the ports it actually bound. Never a literal port:
 *  a tournament runs variants concurrently and a fixed port makes the second
 *  variant fail for a reason that has nothing to do with its work. */
export const PORTS_FILE = join(HARNESS_DIR, "ports.json");

export function ports() {
  if (!existsSync(PORTS_FILE)) {
    throw new Error(
      `no ${PORTS_FILE} — serve.mjs did not start, or did not reach readiness. ` +
      `Read .atelier/harness/serve.log rather than guessing.`);
  }
  return JSON.parse(readFileSync(PORTS_FILE, "utf8"));
}

/** Prefer the rebuild's output; fall back to the committed build. */
export function resolveBuild() {
  for (const dir of ["dist", "build", "docs"]) {
    const p = join(REPO, dir);
    if (existsSync(p) && statSync(p).isDirectory()) return { dir, path: p };
  }
  return { dir: null, path: null };
}

export function walk(root, exts) {
  const out = [];
  if (!root || !existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const d = stack.pop();
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (!exts || exts.includes(extname(e.name))) out.push(p);
    }
  }
  return out;
}

export const read = p => readFileSync(p, "utf8");

/** A bare number, always. Integers print as integers; ratios to 4 places. */
export function metric(id, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`metric ${id} is not finite: ${value}`);
  console.log(`ATELIER_METRIC ${id}=${Number.isInteger(n) ? n : n.toFixed(4)}`);
}

/** Exit non-zero on a failed threshold, but print the number first — a gate
 *  that dies without emitting its measurement tells you nothing. */
export function gate(label, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

export const MEASURE_ONLY =
  "ATELIER_BENCH_METRIC_ID" in process.env || process.argv.includes("--measure-only");

export function finish(results) {
  const failed = results.filter(r => !r);
  if (failed.length) {
    console.log(`\n${failed.length} gate(s) failed.`);
    if (MEASURE_ONLY) {
      console.log("measure-only: reporting the number, not gating on it.");
      return;
    }
    process.exit(1);
  }
  console.log("\nall gates passed.");
}

/* --- Java, for the Firestore emulator ------------------------------------
 *
 * The Firestore and Realtime Database emulators are Java programs; the Auth
 * emulator is not. Homebrew installs `openjdk` KEG-ONLY on macOS — it is not
 * on PATH, and `/usr/bin/java` is a stub that errors — so a harness that just
 * spawns `firebase emulators:start` dies with "Unable to locate a Java
 * Runtime" and reads as a Firebase problem rather than a PATH problem.
 *
 * Resolved rather than hard-coded, and never by editing the operator's shell
 * profile: a harness that requires a machine to have been configured by hand
 * is one a fresh variant worktree cannot satisfy.
 */
export function javaBin() {
  const cands = [];
  if (process.env.JAVA_HOME) cands.push(join(process.env.JAVA_HOME, "bin", "java"));
  cands.push(
    "/opt/homebrew/opt/openjdk/bin/java",
    "/usr/local/opt/openjdk/bin/java",
    "/opt/homebrew/opt/openjdk@21/bin/java",
    "/usr/lib/jvm/default-java/bin/java",
  );
  for (const c of cands) if (existsSync(c)) return c;
  return null;
}

/** An env with a real JDK on PATH, or null if none was found. */
export function javaEnv(base = process.env) {
  const bin = javaBin();
  if (!bin) return null;
  const dir = bin.slice(0, bin.lastIndexOf("/"));
  return { ...base, PATH: `${dir}:${base.PATH || ""}`, JAVA_HOME: dir.replace(/\/bin$/, "") };
}
