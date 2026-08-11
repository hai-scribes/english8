/* The writing checklists, run against the models the units print.
 *
 *     node tools/check_write.js
 *
 * Every unit prints a model — "read this first, then cover it" — and then a
 * checklist the learner is held to. Ten of the twelve models did not satisfy
 * the checklist beside them: one was 101 words under an 80-100 limit, and
 * eight used fewer of the unit's own vocabulary than they demanded. A model
 * that would fail two of the boxes teaches that the boxes are decoration,
 * which is the state `:::write` was built to end.
 *
 * This runs the shipped artefact, not the source: it reads the built pages
 * out of docs/, pulls each page's own `write` payload and its own model text,
 * and runs the real runCheck() from app.js over them. There is one
 * implementation of the checking rules and this gate uses it, so the gate
 * cannot pass while the page fails.
 */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync("tools/assets/app.js", "utf8");
const noop = () => {};
const el = { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [],
             classList:{toggle:noop,add:noop}, dataset:{}, style:{}, setAttribute:noop,
             removeAttribute:noop, getAttribute:()=>null, insertAdjacentHTML:noop,
             closest:()=>null, remove:noop, textContent:"", innerHTML:"" };
global.window = {};
global.document = { documentElement: el, getElementById: () => null, querySelector: () => null,
                    querySelectorAll: () => [], addEventListener: noop, readyState:"complete",
                    createElement: () => el, body: el };
global.localStorage = { getItem: () => null, setItem: noop };
global.matchMedia = () => ({ matches:false, addEventListener:noop });
global.speechSynthesis = undefined;
global.CustomEvent = class {};
eval(src.replace(/if \(document.readyState[\s\S]*$/, "")
     + "\n;module.exports={runCheck,wordsIn};");
const { runCheck } = module.exports;

const DOCS = "docs";
const RE_DATA = /<script id="page-data" type="application\/json">([\s\S]*?)<\/script>/;
const RE_MODEL = /<h4>(?:Model|One finished)[^<]*<\/h4>\s*<blockquote>([\s\S]*?)<\/blockquote>/;

/* Back to the text the learner would type. Block tags become paragraph breaks
   so `para`/`paras` see the same shape the textarea would hold. */
function detag(html){
  return html
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'")
    .trim();
}

let checked = 0, problems = [];
const pages = [];
for (const d of fs.readdirSync(DOCS)){
  /* A Review's writing task is one page deep rather than two, and it is held
     to exactly the same rule: the model printed above it has to satisfy the
     checklist printed below it. A cumulative section is the last place a model
     may be aspirational, because it is the third time the learner has met the
     same target. */
  if (/^review-\d$/.test(d)){
    const f = path.join(DOCS, d, "index.html");
    if (fs.existsSync(f)) pages.push(f);
    continue;
  }
  if (!/^unit-\d\d$/.test(d)) continue;
  for (const l of fs.readdirSync(path.join(DOCS, d))){
    const f = path.join(DOCS, d, l, "index.html");
    if (fs.existsSync(f)) pages.push(f);
  }
}
if (!pages.length){
  console.error("FAIL: no built pages under docs/ — run python3 tools/build.py first");
  process.exit(2);
}

let writes = 0;
for (const f of pages){
  const html = fs.readFileSync(f, "utf8");
  const dm = RE_DATA.exec(html);
  if (!dm) continue;
  const data = JSON.parse(dm[1]);
  if (!data.write || !data.write.length) continue;
  const mm = RE_MODEL.exec(html);
  const where = f.replace(/\/index\.html$/, "");
  if (!mm){
    problems.push(`${where}: a writing task with no model above it. The model is what a `
                  + `learner compares their own attempt against`);
    continue;
  }
  const model = detag(mm[1]);
  for (const p of data.write){
    writes++;
    p.items.forEach((it, i) => {
      if (!it.c) return;
      checked++;
      const r = runCheck(it.c, model, p);
      const label = it.t.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "'");
      if (!r){
        problems.push(`${where} (${p.id}) item ${i + 1}: check ${JSON.stringify(it.c)} `
                      + `did not run — an unusable check silently passes everything`);
      } else if (!r.ok){
        problems.push(`${where} (${p.id}): the unit's own model fails "${label}" `
                      + `[${r.found}]. A model that would not tick the box teaches that `
                      + `the box does not matter`);
      }
    });
  }
}

if (problems.length){
  console.log(`FAIL: ${problems.length} problem(s)`);
  for (const p of problems) console.log("  -", p);
  process.exit(1);
}
console.log(`PASS: ${writes} committed writing task(s) · ${checked} counted checklist `
            + `line(s) · every unit's own model satisfies the checklist it prints`);
