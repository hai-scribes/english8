/* MARKING architecture — local, synchronous, offline.
 *
 * A correct answer is a family of surface forms, not one string: British and
 * American spelling, a contraction and its expansion, a digit and its word
 * form, and a leading article a learner adds to a bare noun because that is
 * how English answers "what did the sea put back?" All of it folds to one
 * canonical form before two answers are compared, so the comparison measures
 * only the thing the exercise is actually testing.
 *
 * markAnswer(given, keys, skill) — three states, not two. `ok:true` is
 * right; `ok:false, why:"wrong"` is wrong; `ok:false, why:"near-miss"` is a
 * single-edit slip on coursework (skill !== "test"), reported as neither —
 * a test item (skill === "test") never softens into near-miss, because C8's
 * severity split cuts the other way there: test strictness stays on test
 * items, not on every gap.
 *
 * A false negative here is worse than a false positive (09 §4.4: a learner
 * alone cannot self-assess her way out of being told a right answer is
 * wrong), so every fold below only ever ADDS an equivalence — it can widen
 * what a key accepts, never narrow it.
 */

function norm(s) {
  return String(s == null ? "" : s).normalize("NFC").toLowerCase()
    .replace(/[’‘`´]/g, "'").replace(/[.,!?;:]+$/g, "").replace(/\s+/g, " ").trim();
}

/* ---- spelling: UK and US fold to one canonical surface -------------------
   Ported from the legacy engine's finite lists (a suffix rule over-fires:
   promise/promize, filled/filed), plus two additions the fixture set found
   missing: -yse/-yze, and the single-consonant British spellings the old
   DOUBLE_L list does not cover (that list is about an inflection like
   "travelled", not the bare word "enrol" itself). */
const OUR_OR = ("armour behaviour candour clamour colour demeanour endeavour favour "
  + "fervour flavour glamour harbour honour humour labour neighbour odour parlour "
  + "rigour rumour saviour splendour succour tumour valour vapour vigour").split(" ");
const PAIRS = {
  jewellery: "jewelry", catalogue: "catalog", dialogue: "dialog", monologue: "monolog",
  defence: "defense", offence: "offense", pretence: "pretense", licence: "license",
  practise: "practice", storey: "story", plough: "plow", cheque: "check",
  draught: "draft", kerb: "curb", tyre: "tire", pyjamas: "pajamas", aluminium: "aluminum",
  moustache: "mustache", axe: "ax", grey: "gray", programme: "program", sceptical: "skeptical",
  aeroplane: "airplane", mould: "mold", smoulder: "smolder", woollen: "woolen",
};
const RE_ER = ("calibre centre fibre goitre litre lustre manoeuvre meagre metre mitre "
  + "ochre sabre sceptre sepulchre sombre spectre theatre").split(" ");
const NEVER_IZE = ("advertise advise apprise arise chastise circumcise comprise "
  + "compromise demise despise devise disguise enterprise excise exercise franchise "
  + "guise improvise incise likewise merchandise otherwise paradise precise premise "
  + "promise reprise revise rise supervise surmise surprise televise treatise wise"
  ).split(" ");
const DOUBLE_L = ("cancel channel counsel dial equal fuel grovel initial jewel label "
  + "level libel marvel medal model parcel pedal quarrel refuel revel rival shrivel "
  + "signal snivel total travel tunnel unravel").split(" ");
const SINGLE_L = { enrol: "enroll", fulfil: "fulfill", instal: "install",
  skilful: "skillful", instalment: "installment" };

const INFLECT = "(?:s|es|d|ed|ing)?";
const anyOf = (list, tail) => new RegExp("^(" + list.join("|") + ")" + (tail || "") + "$");
const RE_OUR = anyOf(OUR_OR, "(s|ed|ing|ite|ful|less|able)?");
const RE_RE = anyOf(RE_ER, "(s|d|ing)?");
const RE_LL = anyOf(DOUBLE_L, "l(ed|ing|er|or)");
const RE_NEVER = anyOf(NEVER_IZE, INFLECT);
const PAIR_STEM = new RegExp("^(" + Object.keys(PAIRS).join("|") + ")(s|d|ed|ing|es)?$");

function foldSpelling(w) {
  if (SINGLE_L.hasOwnProperty(w)) return SINGLE_L[w];
  const p = PAIR_STEM.exec(w);
  if (p) return PAIRS[p[1]] + (p[2] || "");
  let m = RE_OUR.exec(w);
  if (m) return m[1].replace(/our$/, "or") + (m[2] || "");
  m = RE_RE.exec(w);
  if (m) return m[1].replace(/re$/, "er") + (m[2] || "");
  m = RE_LL.exec(w);
  if (m) return m[1] + m[2];
  if (/yse$/.test(w)) return w.replace(/yse$/, "yze");
  if (/is(e|ed|es|ing|ation)$/.test(w) && !RE_NEVER.test(w))
    return w.replace(/is(e|ed|es|ing|ation)$/, "iz$1");
  return w;
}

/* ---- contractions fold to their expansion --------------------------------
   "can't"/"cannot" and "won't"/"shan't" have irregular stems and are listed;
   every other n't/'ve/'re/'ll/'d/'m is regular enough for one rule each. A
   different modal never folds to the same string as another ("couldn't" stays
   "could not", not "can not"), so this only ever equates a contraction with
   its OWN expansion. */
const NEG_IRREGULAR = { "can't": "can not", cannot: "can not", "won't": "will not", "shan't": "shall not" };
function expandWord(w) {
  if (NEG_IRREGULAR.hasOwnProperty(w)) return NEG_IRREGULAR[w];
  let m = w.match(/^([a-z]+)n't$/);
  if (m) return m[1] + " not";
  m = w.match(/^([a-z]+)'ve$/);
  if (m) return m[1] + " have";
  m = w.match(/^([a-z]+)'re$/);
  if (m) return m[1] + " are";
  m = w.match(/^([a-z]+)'ll$/);
  if (m) return m[1] + " will";
  m = w.match(/^([a-z]+)'d$/);
  if (m) return m[1] + " would";
  m = w.match(/^([a-z]+)'m$/);
  if (m) return m[1] + " am";
  return w;
}

/* ---- number words fold to digits: "three hours" meets "3 hours" ---------- */
const NUM_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
  fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };

function foldWords(s) {
  return s.split(" ").flatMap(w => expandWord(w).split(" "))
    .map(part => foldSpelling(NUM_WORDS.hasOwnProperty(part) ? String(NUM_WORDS[part]) : part))
    .join(" ").replace(/\s+/g, " ").trim();
}

/* A leading "the"/"a"/"an" never costs the mark — "bracelets" and "the
   bracelets" answer the same question. This can only ADD acceptance: it is
   applied identically to a key's own forms, so dropping the article never
   makes two previously-equal forms unequal. */
function stripLeadingArticle(s) {
  return s.replace(/^(the|an?)\s+/, "");
}

function canonicalize(s) {
  return stripLeadingArticle(foldWords(norm(s)));
}

/* "(the) old (public) library" -> every combination the key admits. */
function expandOptional(s) {
  const m = /\(([^)]*)\)/.exec(s);
  if (!m) return [s];
  const without = s.slice(0, m.index) + s.slice(m.index + m[0].length);
  const with_ = s.slice(0, m.index) + m[1] + s.slice(m.index + m[0].length);
  return expandOptional(with_).concat(expandOptional(without));
}
function acceptedForms(spec) {
  const out = [];
  for (const alt of String(spec).split("/"))
    for (const v of expandOptional(alt)) out.push(canonicalize(v));
  return out.filter(Boolean);
}

/* Two answers in one gap score zero — never partial credit (C4). Checked
   against the RAW answer, so a key whose own alternate legitimately contains
   "or" is not penalised for the learner echoing it. */
const TWO_ANSWERS = /\s*(\/|,|;|\bor\b)\s*/i;

/* A bare "yes"/"no" key answers a polarity question; a learner who writes the
   polarity out in full ("Yes, it is.") has answered it, not failed to. Scoped
   to bare yes/no keys only. The remainder must not be the polarity word
   repeated ("no, no") — that is the two-answers-in-one-gap case above, not an
   elaboration, and the sweep's own doubled-key probe depends on this staying
   excluded. */
function polarityMatch(canon, keySpec) {
  const k = canonicalize(keySpec);
  if (k !== "yes" && k !== "no") return false;
  const tokens = canon.replace(/[^a-z0-9' ]/gi, " ").trim().split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens[0] !== k) return false;
  const rest = tokens.slice(1);
  return !(rest.length && rest.every(t => t === "yes" || t === "no"));
}

/* Edit distance <= 1, over the whole string. Cheap and only ever consulted
   after every real match has failed. */
function withinOneEdit(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  const [s, t] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0, j = 0, spent = false;
  while (i < s.length && j < t.length) {
    if (s[i] === t[j]) { i++; j++; continue; }
    if (spent) return false;
    spent = true;
    if (s.length === t.length) { i++; j++; } else j++;
  }
  return true;
}

function markAnswer(given, keys, skill) {
  const raw = String(given || "").trim();
  if (!raw) return { ok: false, why: "blank" };
  const specs = [].concat(keys).filter(Boolean);
  const accepted = specs.flatMap(acceptedForms);
  const canon = canonicalize(raw);

  if (accepted.includes(canon)) return { ok: true };
  if (specs.some(k => polarityMatch(canon, k))) return { ok: true };

  if (TWO_ANSWERS.test(raw) && !accepted.some(a => a.includes(" or ")))
    return { ok: false, why: "two" };

  if (skill !== "test") {
    for (const a of accepted) {
      if (a.length >= 4 && canon.split(" ").length === a.split(" ").length && withinOneEdit(canon, a))
        return { ok: false, why: "near-miss", near: true };
    }
  }
  return { ok: false, why: "wrong" };
}

export { markAnswer };
