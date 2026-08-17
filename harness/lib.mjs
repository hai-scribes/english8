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

/* A harness is run in two different jobs and must answer differently in each.
 *
 * As a checks.yaml SCENARIO it is a gate: a failed threshold must exit non-zero,
 * or the driver cannot tell a working build from a broken one.
 *
 * As a milestone BENCHMARK it is an instrument, and the driver reads the number
 * off stdout. But `default_bench_runner` discards stdout entirely on a non-zero
 * exit — so a harness that gates itself reports its measurement only when it is
 * already at threshold. Every benchmark here was therefore a boolean: exactly
 * the threshold, or nothing. A variant at 380/400 recorded `null`, which is what
 * a variant that crashed on import also records, so no round could ever rank its
 * variants or see a number improving.
 *
 * The two jobs are told apart without touching `benchmark.command` — which is
 * inside the frozen benchmark hash — because the tournament exports
 * ATELIER_BENCH_METRIC_ID when, and only when, it is calling a benchmark.
 * Measure-only still prints every PASS/FAIL line; it just does not exit on them.
 * The gate keeps its teeth: the scenario path is unchanged. */
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
