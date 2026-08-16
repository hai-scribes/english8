/* Curriculum coverage, and the invariant that keeps the story a spine.
 *
 * Two things are measured here and they are different jobs.
 *
 * COVERAGE. Every prescribed target across all six families is placed in the
 * new shape. The 328 figure quoted throughout this repo is LEXIS ALONE; the
 * other five families are separately gated and are exactly the ones this
 * project has historically dropped. check_coverage.py reports and exits 0 by
 * design, which means a large rewrite can go fully green while quietly
 * deleting required curriculum. This one fails.
 *
 * THE INVARIANT. No target may have its encounter, its production and its
 * delayed check in the same session. That is E5 restated as architecture, and
 * it is the mechanical guard against degenerating into "a lesson with a story
 * printed above it" — which is precisely the shape where all three co-occur on
 * one screen.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { REPO, read, metric, gate, finish } from "./lib.mjs";

const TARGETS = join(REPO, "curriculum/sgk/targets.json");
const spec = JSON.parse(read(TARGETS));

/* Enumerate every target as a stable id, family by family. */
function enumerate(spec) {
  const out = [];
  for (const u of spec.units) {
    const n = u.unit;
    for (const w of u.lexis || []) out.push({ family: "lexis", unit: n, id: `lexis:${n}:${w}` });
    const gram = Array.isArray(u.grammar) ? u.grammar : [u.grammar];
    gram.filter(Boolean).forEach((g, i) => out.push({ family: "grammar", unit: n, id: `grammar:${n}:${i}` }));
    for (const [family, key] of [
      ["pronunciation", "pronunciation"],
      ["everyday_english", "everyday_english"],
      ["culture_block", "culture_block"],
      ["writing_genre", "writing_genre"],
    ]) if (u[key] != null) out.push({ family, unit: n, id: `${family}:${n}` });
  }
  return out;
}

const targets = enumerate(spec);
const byFamily = targets.reduce((a, t) => ((a[t.family] = (a[t.family] || 0) + 1), a), {});

/* The placement map is milestone 1's deliverable: the architecture AS DATA.
 * A design document no machine reads drifts from the build the day after it is
 * written, so the map is what the gate reads. */
const MAP = join(REPO, "content/placement.json");
const haveMap = existsSync(MAP);
const map = haveMap ? JSON.parse(read(MAP)) : { placements: [] };
const placements = map.placements || [];

const placed = new Set();
const bySession = new Map();
for (const p of placements) {
  if (!p || !p.target) continue;
  placed.add(p.target);
  for (const role of ["encounter", "production", "check"]) {
    const s = p[role];
    if (s == null) continue;
    const k = `${p.target}@@${s}`;
    bySession.set(k, (bySession.get(k) || new Set()).add(role));
  }
}

/* A target whose three roles land in one session is the failure mode. */
const collisions = [];
for (const [k, roles] of bySession) if (roles.size === 3) collisions.push(k.split("@@")[0]);

const covered = targets.filter(t => placed.has(t.id)).length;

console.log(`build: curriculum coverage`);
console.log(`  placement map: ${haveMap ? MAP.replace(REPO, "") : "ABSENT — nothing placed yet"}`);
console.log(`  target families:`);
for (const [f, n] of Object.entries(byFamily)) {
  const c = targets.filter(t => t.family === f && placed.has(t.id)).length;
  console.log(`    ${f.padEnd(18)} ${String(c).padStart(4)} / ${n}`);
}
console.log(`  total ${covered} / ${targets.length}`);
if (collisions.length) {
  console.log(`  E5 invariant violated by ${collisions.length} target(s):`);
  for (const c of collisions.slice(0, 8)) console.log(`    ${c}`);
}

metric("sgk_targets_covered", covered);
metric("items_swept", targets.length);
metric("invariant_violations", collisions.length);

finish([
  gate("every prescribed target is placed", covered === targets.length,
       `${covered}/${targets.length}`),
  gate("no target has encounter+production+check in one session",
       collisions.length === 0, `${collisions.length} violation(s)`),
]);
