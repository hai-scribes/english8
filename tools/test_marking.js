/* The marking engine, tested against the published rules it implements.
 *
 *     node tools/test_marking.js
 *
 * Every case below is one line of `research/ielts/03-listening.md` §3.2 or §4,
 * or `01-exam-structure.md` §8 -- the official answer-key grammar and the
 * mechanical marking rules. They are here rather than in a review note
 * because they are the rules a kind author breaks silently: accepting a
 * misspelling, awarding half a mark for one of two answers, letting a
 * four-word answer through a two-word limit. A learner marked leniently here
 * is a learner surprised there.
 *
 * The file loads tools/assets/app.js with just enough browser stubbed to let
 * its top-level statements run, then exercises the pure functions. boot() is
 * stripped, so nothing touches the DOM.
 */
const fs = require("fs");
const src = fs.readFileSync("tools/assets/app.js", "utf8");
// Minimal browser stubs: enough for the top-level statements to evaluate.
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
eval(src.replace(/if \(document.readyState[\s\S]*$/, "") + "\n;module.exports={markTask,overLimit,markAnswer,fold,acceptedForms,parseEither,calibrationLine,itemHTML};");
const M = module.exports;

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : (fail++, console.log("FAIL " + name + "\n  got  " + JSON.stringify(got)
                                     + "\n  want " + JSON.stringify(want)));
};
const one = (item, given, words) =>
  M.markTask({ items:[item], words: words || "" }, [given])[0];

// --- C1 official key grammar (03 §3.2) --------------------------------------
const lib = { q:"", key:"(the) (public) library/libraries" };
t("optional tokens: bare",      one(lib,"library").ok,            true);
t("optional tokens: all",       one(lib,"the public library").ok, true);
t("optional tokens: partial",   one(lib,"the library").ok,        true);
t("alternate branch",           one(lib,"libraries").ok,          true);
t("wrong word",                 one(lib,"librarian").ok,          false);

// --- C2 UK/US spellings (01 §8) ---------------------------------------------
const spell = (key, given) => one({q:"",key}, given).ok;
[["colour","color"],["organise","organize"],["organize","organise"],["centre","center"],
 ["theatre","theater"],["travelled","traveled"],["labelling","labeling"],
 ["neighbour","neighbor"],["metres","meters"],["practise","practice"],
 ["programme","program"],["grey","gray"],["realised","realized"],["favourite","favorite"]
].forEach(([k,g]) => t("accepts " + k + "/" + g, spell(k,g), true));

// C5 is the rule the fold must not break: a misspelling that happens to look
// like the other variant's suffix is still a misspelling. Each of these was a
// false accept before the alternations became closed lists.
[["four","for"],["promise","promize"],["filled","filed"],["contour","contor"],
 ["acre","acer"],["tour","tor"],["exercise","exercize"],["surprise","surprize"],
 ["called","caled"],["spelling","speling"],["genre","gener"],["hour","hor"]
].forEach(([k,g]) => t("rejects " + k + "/" + g, spell(k,g), false));

// --- C3 two answers in one gap score zero (01 §8) ---------------------------
t("two answers slash", one(lib,"library / libraries").why, "two");
t("two answers comma", one({q:"",key:"tests"},"tests, sleep").why, "two");

// --- C4 word limit is a hard fail (03 §4) -----------------------------------
t("within 2 words",      one({q:"",key:"two hundred"},"two hundred","2").ok,    true);
t("over 2 words",        one({q:"",key:"two hundred"},"about two hundred","2").why, "limit");
t("hyphen = one word",   M.overLimit("twenty-minute walk","2"),  false);
t("number is free",      M.overLimit("two hundred 45","2+number"), false);
t("number not free",     M.overLimit("two hundred 45","2"),        true);

// --- C5 spelling costs the mark ---------------------------------------------
t("misspelling is wrong", one({q:"",key:"counsellor"},"councellor").ok, false);

// --- either-order pairs (03 §3.2) -------------------------------------------
const pair = { items:[{q:"",key:"tests"},{q:"",key:"sleep"}], either:"1-2", words:"" };
t("pair, in order",  M.markTask(pair,["tests","sleep"]).map(m=>m.ok), [true,true]);
t("pair, swapped",   M.markTask(pair,["sleep","tests"]).map(m=>m.ok), [true,true]);
t("pair, one bogus", M.markTask(pair,["sleep","noise"]).map(m=>m.ok), [true,false]);
// A pair is one set with two marks, so a key can only be claimed once.
t("pair, same answer twice", M.markTask(pair,["tests","tests"]).map(m=>m.ok), [true,false]);
t("pair, repeat is named",   M.markTask(pair,["tests","tests"])[1].why,       "repeat");
t("pair, both blank",        M.markTask(pair,["",""]).map(m=>m.ok),           [false,false]);
t("pair honours word limit",
  M.markTask({ items:pair.items, either:"1-2", words:"1" },["too many words","sleep"])[0].why,
  "limit");
// Overlapping keys need a real assignment, not first-fit: "library" could take
// either key, but only one pairing marks both answers right.
const nest = { items:[{q:"",key:"(public) library"},{q:"",key:"library"}],
               either:"1-2", words:"2" };
t("pair, overlapping keys", M.markTask(nest,["library","public library"]).map(m=>m.ok),
  [true,true]);
// An either group naming an item that does not exist must not throw.
t("pair, index out of range",
  M.markTask({ items:[{q:"",key:"a"}], either:"1-99", words:"" },["a"]).map(m=>m.ok),
  [true]);

// --- one number comes free, not every number (03 §4) ------------------------
t("one free number",   M.overLimit("twenty 45","1+number"),  false);
t("two numbers is two", M.overLimit("45 60","1+number"),     true);

// --- picked options bypass the key grammar (the IPA slash bug) --------------
const ipa = { q:"", key:"/ʊə/", opts:[{k:"/ʊə/",t:"/ʊə/"},{k:"/ɔɪ/",t:"/ɔɪ/"}] };
t("IPA option accepted", one(ipa,"/ʊə/").ok,  true);
t("IPA option rejected", one(ipa,"/ɔɪ/").ok,  false);
t("blank option",        one(ipa,"").why,     "blank");

// --- calibration reporting (03 §6.6) ----------------------------------------
// Four of each is the minimum before any verdict is read off the split. Two
// observations cannot establish a person's calibration, and claiming they can
// would be exactly the overconfidence this column is about.
// unit omitted, so no accumulation: the tallies are this task alone.
const cal = (oks, cs) => M.calibrationLine(oks.map(o => ({ok:o})), cs);
const many = (n, v) => Array(n).fill(v);
t("calibration: too few to read",
  /Not enough of each/.test(cal([true,true,false,false], [1,1,0,0])), true);
t("calibration: sure beats unsure",
  /right much more often/.test(cal(many(4,true).concat(many(4,false)),
                                   many(4,1).concat(many(4,0)))), true);
// A real listening set is 4-7 items, so the verdict must be reachable from a
// 4/3 split accumulated across the unit, not from 8 items in one task.
t("calibration: reachable from a real set size",
  /Not enough of each/.test(cal(many(4,true).concat(many(3,false)),
                                many(4,1).concat(many(3,0)))), true);
t("calibration: reversed is not a verdict",
  /worth watching for now/.test(
    cal(many(4,false).concat(many(4,true)), many(4,1).concat(many(4,0)))), true);
t("calibration: one-sided",
  /nothing to compare/.test(cal(many(4,true), many(4,1))), true);
// UK/US pairs no suffix rule reaches. A false REJECTION marks a right answer
// wrong, which is the direction that must never regress.
[["jewellery","jewelry"],["catalogue","catalog"],["defence","defense"],
 ["licence","license"],["tyre","tire"],["cheque","check"],["aluminium","aluminum"]
].forEach(([k,g]) => t("accepts " + k + "/" + g, spell(k,g), true));
// Three numbers packed into one token are still three numbers.
t("packed numbers exceed", M.overLimit("answer 45,60,90","1+number"), true);
t("one decimal is one number", M.overLimit("5.30","1+number"), false);
// An either-order pair of PICKED options must not run through key grammar.
const ipaPair = { items:[{q:"",key:"/ʊə/",opts:[{k:"/ʊə/",t:"a"},{k:"/ɔɪ/",t:"b"}]},
                         {q:"",key:"/ɔɪ/",opts:[{k:"/ʊə/",t:"a"},{k:"/ɔɪ/",t:"b"}]}],
                  either:"1-2", words:"" };
t("either-order over picked options",
  M.markTask(ipaPair,["/ɔɪ/","/ʊə/"]).map(m=>m.ok), [true,true]);
t("calibration: nothing marked", cal([true], [null]), "");
// No payoff may be promised: the finding is [T2] and no study shows training
// calibration raises anything.
t("calibration: promises no payoff",
  /worth more than the score|will improve|raises? your/.test(
    cal(many(4,true).concat(many(4,false)), many(4,1).concat(many(4,0)))), false);

// --- item rendering ---------------------------------------------------------
// Two tasks on one page must not share a radio group, or answering the second
// silently clears the first and the learner is marked blank for it.
const opts = [{k:"a",t:"one"},{k:"b",t:"two"}];
const nameOf = h => (h.match(/name="([^"]+)"/) || [])[1];
t("radio group is per task+item",
  nameOf(M.itemHTML({id:"03-2-2.2-1"}, {q:"Q", opts}, 0))
    === nameOf(M.itemHTML({id:"03-2-2.4-1"}, {q:"Q", opts}, 0)), false);
t("radio group is per item",
  nameOf(M.itemHTML({id:"x"}, {q:"Q", opts}, 0))
    === nameOf(M.itemHTML({id:"x"}, {q:"Q", opts}, 1)), false);
// An option key is author-supplied and lands in innerHTML: it must be escaped.
t("option key is escaped",
  /<img/.test(M.itemHTML({id:"x"}, {q:"Q", opts:[{k:"<img src=x>",t:"safe"}]}, 0)),
  false);
// A gap in the prompt becomes the input; a prompt without one gets its own box.
t("gap becomes the input",
  /The school asked <input/.test(M.itemHTML({id:"x"}, {q:"The school asked ___ students."}, 0)),
  true);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
