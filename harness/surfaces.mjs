/* Nothing on a learner-facing surface explains the learner-facing surface.
 *
 * Two separate rules, both mechanical here because neither survives being left
 * to discipline.
 *
 * A2/A3/E7 — no IELTS band number is ever output. Not a score, not a
 * prediction, not a progress dial, not a goal, and no half-band (no half-band
 * descriptors exist; any half-band level is unpublished interpolation). No
 * hours-to-band promise of any kind.
 *
 * The audience rule — no criterion names, no evidential markers, no CEFR
 * labels, no citations, no accounts of what a study found. A grade-8 learner
 * opening a lesson wants to know what to do, not to audit the course. The
 * reasoning belongs in the repository, and this is what keeps it there.
 */
import { join } from "node:path";
import { REPO, resolveBuild, walk, read, metric, gate, finish } from "./lib.mjs";

const build = resolveBuild();
if (!build.path) { console.log("no build directory found"); process.exit(1); }

/* Strip anything that is not shown to the learner before scanning: script and
 * style bodies, HTML comments, and the JSON island the page boots from. */
const visible = html => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<[^>]+>/g, " ");

const RULES = [
  { id: "band-number",   re: /\bband\s*(?:score\s*)?[0-9](?:\.[05])?\b/gi,
    note: "an IELTS band number (A2)" },
  { id: "half-band",     re: /\b[0-9]\.5\s*band/gi,
    note: "a half-band (A3 — no half-band descriptors exist)" },
  { id: "hours-to-band", re: /\b\d+\s*(?:hours?|weeks?|months?)\s*(?:=|to|→)\s*(?:one\s+)?band\b/gi,
    note: "an hours-to-band promise (E7)" },
  { id: "cefr-label",    re: /\b(?:CEFR|Common European Framework)\b/gi,
    note: "a CEFR label on the page (audience rule)" },
  { id: "criterion",     re: /\b(?:Task Response|Task Achievement|Coherence and Cohesion|Coherence &amp; Cohesion|Lexical Resource|Grammatical Range)\b/gi,
    note: "an IELTS criterion name (audience rule)" },
  { id: "marker",        re: /\[(?:V|C|Q|D|S\/NS|S|T2|INF|SPEC|X)\s*(?:\d-\d)?\]/g,
    note: "an evidential marker (audience rule)" },
];

const files = walk(build.path, [".html"]);
let hits = 0;
const detail = [];

for (const f of files) {
  const text = visible(read(f));
  for (const r of RULES) {
    for (const m of text.matchAll(r.re)) {
      hits++;
      if (detail.length < 20)
        detail.push(`${f.replace(REPO, "")}: ${r.note} — ${JSON.stringify(m[0].trim())}`);
    }
  }
}

console.log(`interaction: learner-facing surfaces`);
console.log(`  build ${build.dir}/ — ${files.length} page(s) scanned`);
if (detail.length) for (const d of detail) console.log(`    ${d}`);

metric("band_tokens_emitted", hits);
metric("items_swept", files.length);

finish([
  gate("no page explains itself or names a band", hits === 0, `${hits} occurrence(s)`),
  gate("the scan actually rendered something", files.length > 0, `${files.length} pages`),
]);
