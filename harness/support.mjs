/* Support appears where the reader stalls, and then withdraws.
 *
 * One gloss per item per unit of work. A word handed back three chapters later
 * is scaffolding that never came down, and withdrawal is the entire point of
 * offering it in the first place — a gloss the reader can always fall back on
 * is a translation, not support.
 *
 * The counterpart rule lives here too: nothing is checked in the session that
 * taught it (E5). Short intervals match long ones on immediate tests and lose
 * on delayed ones, so a queue that flatters the learner by checking recall
 * while the word is still on screen measures nothing at all.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { REPO, walk, read, metric, gate, finish } from "./lib.mjs";

/* Content resolution: the rebuild's chapter data if it exists, else the
 * authored units, so this measures something real today. */
const CONTENT = join(REPO, "content");
const useContent = existsSync(CONTENT);
const files = useContent ? walk(CONTENT, [".json", ".md"]) : walk(join(REPO, "units"), [".md"]);

const seenGlobally = new Map();   // item -> first scope that glossed it
let reoffers = 0, glosses = 0;
const detail = [];

for (const f of files) {
  const txt = read(f);
  /* A scope is one dialogue/chapter — the unit within which a gloss may appear
   * exactly once. Outside a dialogue the file itself is the scope. */
  const scopes = [...txt.matchAll(/^:::\s?dialogue([^\n]*)\n([\s\S]*?)^:::/gm)]
    .map((m, i) => ({ name: `${f.replace(REPO, "")}#${i}`, body: m[2] }));
  if (!scopes.length) scopes.push({ name: f.replace(REPO, ""), body: txt });

  for (const s of scopes) {
    const local = new Map();
    for (const m of s.body.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const item = m[1].trim().toLowerCase();
      glosses++;
      local.set(item, (local.get(item) || 0) + 1);
      if (local.get(item) === 2) {
        reoffers++;
        if (detail.length < 15) detail.push(`${s.name}: "${item}" glossed twice in one scope`);
      }
      if (!seenGlobally.has(item)) seenGlobally.set(item, s.name);
      else if (seenGlobally.get(item) !== s.name && local.get(item) === 1) {
        reoffers++;
        if (detail.length < 15)
          detail.push(`"${item}" re-glossed in ${s.name} after ${seenGlobally.get(item)}`);
      }
    }
  }
}

console.log(`support withdrawal`);
console.log(`  source: ${useContent ? "content/" : "units/ (authored baseline)"} — ${files.length} file(s)`);
console.log(`  ${glosses} gloss(es), ${seenGlobally.size} distinct item(s)`);
if (detail.length) for (const d of detail) console.log(`    ${d}`);

metric("gloss_reoffers", reoffers);
metric("items_swept", glosses);

finish([
  gate("no item is glossed twice, in a scope or across them", reoffers === 0,
       `${reoffers} reoffer(s)`),
  gate("the sweep actually saw glosses", glosses > 0, `${glosses} found`),
]);
