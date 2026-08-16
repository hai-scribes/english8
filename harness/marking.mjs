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

/* ---- marking_rule_violations: Group C conformance ------------------------- */
/* The measurement precondition for both numbers above. A false negative counted
 * against a key that never carried official key grammar is measuring the key,
 * not the engine — and with coverage at 0.2 that is four keys in five.
 *
 * Every rule here is probed against the REAL key corpus rather than a fixture
 * set, because a fixture set is written by someone who already knows the answer
 * and these are exactly the cases they do not think to write down.
 */
/* -ise does NOT imply -ize. A closed set of English verbs ends in -ise from a
 * different root and has no -ize form at all: "practise" is the British verb
 * beside the noun "practice", and "practize" is not a word in any variety.
 * Proposing it and then reporting the engine for rejecting it is the same
 * cry-wolf failure as reading IPA slashes as alternates. */
const NEVER_IZE = new Set([
  "practise", "advise", "revise", "devise", "supervise", "televise", "improvise",
  "surprise", "promise", "exercise", "compromise", "precise", "concise", "wise",
  "rise", "arise", "disguise", "comprise", "despise", "enterprise", "franchise",
  "merchandise", "advertise", "chastise", "excise", "incise", "paradise",
]);
const izable = w => !NEVER_IZE.has(w.toLowerCase());

const SPELLING = [
  [/\b(\w*?)ise\b/gi, (m, s) => (izable(m) ? `${s}ize` : m)],
  [/\b(\w*?)ize\b/gi, (m, s) => (izable(`${s}ise`) ? `${s}ise` : m)],
  [/\b(\w*?)yse\b/gi, "$1yze"], [/\b(\w*?)yze\b/gi, "$1yse"],
  [/\b(enrol|fulfil|instal|skilful|instalment)\b/gi, m => m.replace(/l(?=\w*$)/, "ll")],
  [/\b(enroll|fulfill|install|skillful|installment)\b/gi, m => m.replace(/ll/, "l")],
];

/* Not every `=` in a task body is an answer key. A pronunciation exercise keys a
 * sentence of explanation carrying IPA and markdown emphasis — "c**oo**l ~
 * *cool* has the long /uː/; the other three are short /ʊ/" — and the slashes in
 * it are phonemic, not alternates. Reading them as key grammar produced 620 of
 * the first 626 findings here, all of them nonsense, which is a gate that cries
 * wolf and gets ignored. The sweep therefore probes only keys that are
 * plausibly things a learner TYPES. */
const isAnswerKey = k =>
  k.length <= 40 &&
  !/[*~`]/.test(k) &&              // markdown emphasis — prose, not an answer
  !/\/[^\/]*[ːɪʊəɔæŋʃʒθð][^\/]*\//.test(k) &&   // IPA between slashes
  !/[;:]/.test(k);                 // an explanation, not a gap filler

/** The surface forms a key's own official grammar licenses.
 *
 *  `/` separates WHOLE alternatives, not adjacent words: "on her own/nobody/
 *  alone" offers three complete answers, and reading it as a word-level swap
 *  manufactures "on her nobody" and then reports the engine for rejecting it.
 *  `(x)` is an optional token inside one alternative: "(the) chess club".
 *
 *  A key that declares a form and rejects it is the defect this counts. */
function licensedForms(key) {
  const OPT = /\(([A-Za-z][A-Za-z'’ -]*)\)/;
  const out = new Set();
  for (const alt of key.split("/")) {
    let forms = [alt];
    for (let i = 0; i < 4; i++) {
      const next = [];
      let changed = false;
      for (const f of forms) {
        const opt = f.match(OPT);
        if (opt) { next.push(f.replace(opt[0], opt[1]), f.replace(opt[0], "")); changed = true; }
        else next.push(f);
      }
      forms = next;
      if (!changed) break;
    }
    for (const f of forms) {
      const t = f.replace(/\s+/g, " ").trim();
      if (t) out.add(t);
    }
  }
  return [...out];
}

let ruleViolations = 0, keysProbed = 0;
const ruleDetail = [], ruleTally = new Map();
const bump = (rule, msg) => {
  ruleViolations++;
  ruleTally.set(rule, (ruleTally.get(rule) || 0) + 1);
  if (ruleDetail.length < 20) ruleDetail.push(`${rule}: ${msg}`);
};
const ok = (answer, key) => { const r = engine.markAnswer(answer, [key]); return !!(r && r.ok); };

/* The severity channel. Group C is titled "Auto-marked practice (Listening and
 * Reading)" — test strictness applied to a grammar drill is a rule applied
 * outside the skill it was written for. This is one structural violation, not
 * one per item: counting it per item would put it at ~2,164 and drown every
 * other rule in the metric. */
const hasSeverityChannel = engine.markAnswer.length >= 3;
if (!hasSeverityChannel)
  bump("severity-not-declared",
       `markAnswer(${engine.markAnswer.length} args) has no skill= channel — test ` +
       `severity is applied to coursework and test items alike`);

for (const f of walk(join(REPO, "units"), [".md"])) {
  const txt = read(f);
  for (const m of txt.matchAll(/^:::\s?task([^\n]*)\n([\s\S]*?)^:::/gm)) {
    if (/\bopts=/.test(m[1])) continue;
    for (const line of m[2].split("\n")) {
      const eq = line.indexOf("=");
      if (eq < 0 || !line.trim() || line.trim().startsWith("#")) continue;
      const key = line.slice(eq + 1).trim();
      if (!key || !isAnswerKey(key)) continue;
      keysProbed++;

      /* 1. Key grammar not honoured — the key licenses a form and it is rejected. */
      for (const form of licensedForms(key)) {
        if (form !== key && !ok(form, key))
          bump("key-grammar-not-honoured", `key ${JSON.stringify(key)} licenses ${JSON.stringify(form)} and rejects it`);
      }

      /* 2. A UK or US spelling rejected — C4 is explicit that both are correct. */
      for (const [re, to] of SPELLING) {
        const variant = key.replace(re, to);
        if (variant !== key && !ok(variant, key)) {
          bump("spelling-variant-rejected", `key ${JSON.stringify(key)} rejects ${JSON.stringify(variant)}`);
          break;
        }
      }

      /* 3. Two answers in one gap must score zero — never partial credit. */
      if (!/[,/]/.test(key) && ok(`${key}, ${key}`, key))
        bump("two-answers-credited", `key ${JSON.stringify(key)} credits ${JSON.stringify(`${key}, ${key}`)}`);
    }
  }
}

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
console.log(`  Group C conformance: ${ruleViolations} violation(s) over ${keysProbed} key(s) probed`);
for (const [rule, n] of [...ruleTally].sort((a, b) => b[1] - a[1]))
  console.log(`    ${String(n).padStart(5)}  ${rule}`);
for (const d of ruleDetail) console.log(`      ${d}`);

metric("false_negative_marks", fn);
metric("false_positive_marks", fp);
metric("false_negative_rate", accepts ? fn / accepts : 0);
metric("key_variant_coverage", coverage);
metric("marking_rule_violations", ruleViolations);
metric("items_swept", accepts + rejects);

finish([
  gate("no correct answer is marked wrong", fn === 0, `${fn}/${accepts} rejected`),
  gate("no wrong answer is marked right", fp === 0, `${fp}/${rejects} accepted`),
  gate("every marked item honours the Group C rules", ruleViolations === 0,
       `${ruleViolations} violation(s)`),
  gate("the conformance sweep actually probed keys", keysProbed > 0, `${keysProbed} probed`),
]);
