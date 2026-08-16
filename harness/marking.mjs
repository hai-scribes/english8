/* Marking correctness, gated as a PAIR.
 *
 * A false-negative gate on its own is trivially satisfied by an engine that
 * accepts everything, so false positives gate alongside it and neither number
 * means anything without the other.
 *
 * A false negative is the worst thing this system can do. The learner is alone
 * and has nobody to appeal to, so a correct answer marked wrong teaches her
 * that the right answer is wrong — and 09 §4.4 (Phakiti 2016, N = 376, up to
 * 93% miscalibrated on hard items) says she cannot self-assess her way out of
 * it. A false positive costs one under-learned item, which spaced retrieval
 * re-presents. The asymmetry is real; the gate refuses to trade on it.
 *
 * Engine resolution: prefers the rebuild's module, falls back to the legacy
 * engine so this harness measures a real baseline today rather than waiting
 * for something to measure.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO, walk, read, metric, gate, finish } from "./lib.mjs";

/* ---- load a marking engine ------------------------------------------------ */
async function loadEngine() {
  const modern = join(REPO, "src/marking.mjs");
  if (existsSync(modern)) {
    const m = await import(modern);
    return { origin: "src/marking.mjs", markAnswer: m.markAnswer };
  }
  const legacy = join(REPO, "tools/assets/app.js");
  if (!existsSync(legacy)) throw new Error("no marking engine found");
  const src = readFileSync(legacy, "utf8").replace(/if \(document\.readyState[\s\S]*$/, "");
  const noop = () => {};
  const el = { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [],
    classList: { toggle: noop, add: noop }, dataset: {}, style: {}, setAttribute: noop,
    removeAttribute: noop, getAttribute: () => null, insertAdjacentHTML: noop,
    closest: () => null, remove: noop, textContent: "", innerHTML: "" };
  globalThis.window = {};
  globalThis.document = { documentElement: el, getElementById: () => null,
    querySelector: () => null, querySelectorAll: () => [], addEventListener: noop,
    readyState: "complete", createElement: () => el, body: el };
  globalThis.localStorage = { getItem: () => null, setItem: noop };
  globalThis.matchMedia = () => ({ matches: false, addEventListener: noop });
  globalThis.speechSynthesis = undefined;
  globalThis.CustomEvent = class {};
  const fn = new Function(`${src}\nreturn { markAnswer };`);
  return { origin: "tools/assets/app.js (legacy baseline)", markAnswer: fn().markAnswer };
}

const engine = await loadEngine();

/* ---- run the fixture set -------------------------------------------------- */
const fx = JSON.parse(read(join(REPO, "harness/fixtures/variants.json")));

let fn = 0, fp = 0, accepts = 0, rejects = 0;
const fnDetail = [], fpDetail = [];

for (const c of fx.cases) {
  for (const a of c.accept) {
    accepts++;
    const r = engine.markAnswer(a, [c.key]);
    if (!r || !r.ok) { fn++; fnDetail.push(`${c.id}: key ${JSON.stringify(c.key)} rejected ${JSON.stringify(a)}${r && r.why ? ` (why:"${r.why}")` : ""}`); }
  }
  for (const d of c.reject) {
    rejects++;
    const r = engine.markAnswer(d, [c.key]);
    if (r && r.ok) { fp++; fpDetail.push(`${c.id}: key ${JSON.stringify(c.key)} ACCEPTED ${JSON.stringify(d)}`); }
  }
}

/* ---- key_variant_coverage: the leading indicator -------------------------- */
/* Free-text keys carrying official key grammar — optional tokens, alternates,
 * either-order pairs — rather than a bare exact string. The false-negative rate
 * is downstream of this number. */
let freeKeys = 0, richKeys = 0;
for (const f of walk(join(REPO, "units"), [".md"])) {
  const txt = read(f);
  for (const m of txt.matchAll(/^:::\s?task([^\n]*)\n([\s\S]*?)^:::/gm)) {
    if (/\bopts=/.test(m[1])) continue;              // closed answer space
    for (const line of m[2].split("\n")) {
      const eq = line.indexOf("=");
      if (eq < 0 || !line.trim() || line.trim().startsWith("#")) continue;
      const key = line.slice(eq + 1).trim();
      if (!key) continue;
      freeKeys++;
      if (/[\/()]/.test(key)) richKeys++;
    }
  }
}
const coverage = freeKeys ? richKeys / freeKeys : 0;

console.log(`smoke: marking`);
console.log(`  engine: ${engine.origin}`);
console.log(`  fixture cases ${fx.cases.length} — ${accepts} legitimate variants, ${rejects} distractors`);
if (fnDetail.length) {
  console.log(`  FALSE NEGATIVES (correct answers marked wrong):`);
  for (const d of fnDetail) console.log(`    ${d}`);
}
if (fpDetail.length) {
  console.log(`  FALSE POSITIVES (wrong answers marked right):`);
  for (const d of fpDetail) console.log(`    ${d}`);
}
console.log(`  key_variant_coverage ${richKeys}/${freeKeys}`);

metric("false_negative_marks", fn);
metric("false_positive_marks", fp);
metric("false_negative_rate", accepts ? fn / accepts : 0);
metric("key_variant_coverage", coverage);
metric("items_swept", accepts + rejects);

finish([
  gate("no correct answer is marked wrong", fn === 0, `${fn}/${accepts} rejected`),
  gate("no wrong answer is marked right", fp === 0, `${fp}/${rejects} accepted`),
]);
