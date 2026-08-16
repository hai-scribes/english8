/* Shared harness plumbing.
 *
 * Two rules every harness here obeys, both learned from the build being
 * replaced:
 *
 *   1. Emit a bare number. `ATELIER_METRIC <id>=<n>` — the unit lives in the
 *      metric id, never in the value. Prose is for humans; the gate parses
 *      this line.
 *   2. Emit a coverage count beside every result. A sweep that rendered
 *      nothing and a sweep that found no defects produce identical output
 *      otherwise, and one is a pass while the other is a broken harness.
 *
 * The build directory is resolved rather than hard-coded so this file does not
 * have to change when the rebuild lands — which matters because harness/ is a
 * declared gate artifact and editing it breaks the frozen hash.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

/* fileURLToPath, not URL.pathname: this repository's path contains a space
 * ("/Users/.../Per/English 8") and pathname hands back "English%208", which
 * fails to open. Every path in this tree is quoted for the same reason. */
export const REPO = fileURLToPath(new URL("..", import.meta.url));

/** Prefer the rebuild's output; fall back to the committed legacy build. */
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

export function finish(results) {
  const failed = results.filter(r => !r);
  if (failed.length) {
    console.log(`\n${failed.length} gate(s) failed.`);
    process.exit(1);
  }
  console.log("\nall gates passed.");
}
