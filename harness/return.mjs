/* Did she come back, on a day nobody asked her to?
 *
 * This is the north-star metric, and it is the one number in this harness
 * directory that a machine may not compute. The charter says so plainly:
 * the app's local activity log "corroborates but cannot establish it, because
 * no log distinguishes a prompted open from an unprompted one". An open is an
 * open. Whether it followed a text message from her uncle is not in the data.
 *
 * So this harness does not derive the number. It reads an observation file the
 * operator writes after the Saturday session, validates it, and emits what is
 * recorded there. That is the whole design: the gate cannot fabricate this
 * metric because the metric is not a function of anything the build produces.
 * A milestone resting on it therefore STOPS for a human, which is the honest
 * outcome and not a limitation to be engineered away.
 *
 * What the harness does contribute is refusal. It will not accept the activity
 * log as a substitute, it will not count a Saturday, and it will not silently
 * pass when the file is missing — an unobserved week reports zero and fails,
 * because "nobody looked" and "she did not come back" must not produce the
 * same green.
 *
 * Observation file — `observations/returns.json`, or $ATELIER_RETURNS_OBSERVATIONS:
 *
 *   {
 *     "records": [
 *       { "date": "2026-08-18", "unprompted": true,  "note": "opened after dinner, unasked" },
 *       { "date": "2026-08-19", "unprompted": false, "note": "I reminded her" }
 *     ]
 *   }
 *
 * `unprompted` is the operator's judgement, recorded at the Saturday session.
 * There is no other source for it.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { REPO, resolveBuild, walk, metric, gate, finish } from "./lib.mjs";

/* WHERE the observation lives is a security property, not a convenience.
 *
 * A tournament variant builds in its own worktree and can write any file it
 * likes there. If this harness read `observations/returns.json` from beside
 * itself, a variant could author its own north star — write five weekdays,
 * mark three unprompted, and report that a child came back. That is not a
 * hypothetical: it is the single cheapest green in this whole plan, and the
 * file is not inside the frozen gate artifact.
 *
 * So the record is read from the MAIN worktree's .specs, which no variant
 * worktree is, and a file resolving inside the current tree is refused outright
 * rather than read. The operator writes it; the build cannot reach it. */
function mainWorktree() {
  try {
    const common = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"],
                                { cwd: REPO, encoding: "utf8" }).trim();
    return dirname(common);           // <main>/.git -> <main>
  } catch { return null; }
}

const MAIN = mainWorktree();
const OBS = resolve(process.env.ATELIER_RETURNS_OBSERVATIONS ||
  (MAIN ? join(MAIN, ".specs/prototype/story-english.observations.json")
        : join(REPO, "../../.specs/prototype/story-english.observations.json")));

const inThisTree = (OBS + sep).startsWith(resolve(REPO) + sep);

/* --- read the operator's record, or fail saying so ------------------------ */

let records = null;
let parseError = null;
if (inThisTree) {
  parseError = `refused: ${OBS} is inside the build tree — an observation the ` +
               `build can write is not an observation`;
} else if (existsSync(OBS)) {
  try {
    const doc = JSON.parse(readFileSync(OBS, "utf8"));
    records = Array.isArray(doc) ? doc : doc.records;
    if (!Array.isArray(records)) throw new Error("expected `records` to be an array");
  } catch (e) {
    parseError = e.message;
    records = null;
  }
}

/* --- classify -------------------------------------------------------------- */

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekdayOf = d => new Date(`${d}T00:00:00Z`).getUTCDay();

const counted = new Set();   // distinct weekday dates recorded as unprompted
const rejected = [];         // why a record did not count
let malformed = 0;

for (const r of records || []) {
  const date = r && r.date;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(weekdayOf(date))) {
    malformed++;
    rejected.push(`${JSON.stringify(r)} — not a YYYY-MM-DD date`);
    continue;
  }
  if (typeof r.unprompted !== "boolean") {
    malformed++;
    rejected.push(`${date} — \`unprompted\` must be true or false, not ${JSON.stringify(r.unprompted)}`);
    continue;
  }
  const wd = weekdayOf(date);
  if (wd === 0 || wd === 6) {
    /* Saturday is the shared session and Sunday is not the measured week.
     * Excluded by construction, not by judgement — a scheduled session cannot
     * evidence an unprompted return however it felt on the day. */
    rejected.push(`${date} (${DAY[wd]}) — excluded by construction, not a weekday`);
    continue;
  }
  if (!r.unprompted) {
    rejected.push(`${date} (${DAY[wd]}) — recorded as prompted`);
    continue;
  }
  counted.add(date);
}

/* --- the activity log corroborates; it does not substitute ---------------- */

const { dir: buildDir, path: buildPath } = resolveBuild();
let logOpens = null;
/* The log, by contrast, IS a build artefact — it is what the app records. It
 * corroborates and never counts, so a variant writing it gains nothing. */
const LOG = join(REPO, "observations/activity-log.json");
if (existsSync(LOG)) {
  try {
    const doc = JSON.parse(readFileSync(LOG, "utf8"));
    const opens = Array.isArray(doc) ? doc : doc.opens;
    if (Array.isArray(opens)) {
      logOpens = new Set(
        opens
          .map(o => (typeof o === "string" ? o : o && o.date))
          .filter(d => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d))
          .filter(d => { const wd = weekdayOf(d); return wd >= 1 && wd <= 5; })
      );
    }
  } catch { /* a corrupt log is reported below as absent corroboration */ }
}

/* --- report ---------------------------------------------------------------- */

console.log("unprompted return");
console.log(`  observations: ${OBS}${records ? "" : (inThisTree ? " — REFUSED" : " — ABSENT")}`);
if (parseError) console.log(`    unreadable: ${parseError}`);
console.log(`  build: ${buildDir ? `${buildDir}/ (${walk(buildPath, [".html"]).length} page(s))` : "none built"}`);
console.log(`  ${counted.size} weekday(s) recorded as an unprompted open`);
for (const d of [...counted].sort()) console.log(`    ${d} (${DAY[weekdayOf(d)]})`);
if (rejected.length) {
  console.log(`  ${rejected.length} record(s) did not count:`);
  for (const r of rejected.slice(0, 15)) console.log(`    ${r}`);
}

if (logOpens === null) {
  console.log("  activity log: absent — nothing to corroborate against");
} else {
  const unbacked = [...counted].filter(d => !logOpens.has(d));
  const unclaimed = [...logOpens].filter(d => !counted.has(d));
  console.log(`  activity log: ${logOpens.size} weekday open(s) recorded by the app`);
  /* Disagreement is information, never an adjustment. A day the operator
   * observed but the log missed is still a return; a day the log recorded but
   * the operator did not attribute is NOT one, because the log cannot tell
   * whether she was asked. Neither number moves the metric. */
  if (unbacked.length) console.log(`    ${unbacked.length} observed day(s) the log did not record: ${unbacked.join(", ")}`);
  if (unclaimed.length) console.log(`    ${unclaimed.length} logged day(s) with no operator attribution: ${unclaimed.join(", ")}`);
}

metric("returns_unprompted", counted.size);
metric("items_swept", (records || []).length);

finish([
  gate("an observation file exists and parses", Array.isArray(records),
       records ? `${records.length} record(s)` : "no operator observation has been recorded"),
  gate("every record is well formed", malformed === 0, `${malformed} malformed`),
  gate("the observed week reaches the threshold", counted.size >= 3,
       `${counted.size} unprompted weekday(s), threshold 3`),
]);
