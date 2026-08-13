/* =========================================================================
   English 8 — Global Success · site behaviour
   Progress, answer reveals, the lesson gate, and the practice/test engine.
   No dependencies. Everything degrades to readable static content.
   ========================================================================= */
"use strict";

/* ---------------- theme (three states: system / light / dark) ------------- */
const THEME_KEY = "en8:theme";
function applyTheme(t){
  const r = document.documentElement;
  if (t === "light" || t === "dark") r.setAttribute("data-theme", t);
  else r.removeAttribute("data-theme");
}
function initTheme(){
  let t = null;
  try { t = localStorage.getItem(THEME_KEY); } catch(e){}
  applyTheme(t);
  const btn = document.getElementById("themeBtn");
  if (!btn) return;
  const label = () => {
    let cur = null;
    try { cur = localStorage.getItem(THEME_KEY); } catch(e){}
    btn.textContent = cur === "dark" ? "◐ Dark" : cur === "light" ? "◑ Light" : "◒ Auto";
    btn.setAttribute("aria-label", "Colour theme: " + (cur || "auto") + ". Click to change.");
  };
  label();
  btn.addEventListener("click", () => {
    let cur = null;
    try { cur = localStorage.getItem(THEME_KEY); } catch(e){}
    const next = cur === null ? "light" : cur === "light" ? "dark" : null;
    try { next ? localStorage.setItem(THEME_KEY, next) : localStorage.removeItem(THEME_KEY); } catch(e){}
    applyTheme(next); label();
  });
}

/* ---------------- progress ------------------------------------------------ */
/* { "01": { lessons: {"1": epochMs, ...}, test: {best: 0-100, at: epochMs} } } */
const P_KEY = "en8:progress:v1";
let PROG = (() => {
  try { return JSON.parse(localStorage.getItem(P_KEY)) || {}; } catch(e){ return {}; }
})();
let warnedStore = false;
function saveProg(){
  try { localStorage.setItem(P_KEY, JSON.stringify(PROG)); }
  catch(e){
    if (!warnedStore){
      warnedStore = true;
      console.warn("en8: progress cannot be saved (storage blocked or full)");
    }
  }
}
function unitRec(u){
  if (!PROG[u]) PROG[u] = { lessons:{}, test:null };
  if (!PROG[u].lessons) PROG[u].lessons = {};
  return PROG[u];
}
const lessonDone = (u, l) => !!unitRec(u).lessons[String(l)];
const lessonsDone = u => Object.keys(unitRec(u).lessons).length;
function markLesson(u, l, on){
  const r = unitRec(u);
  if (on) r.lessons[String(l)] = Date.now();
  else delete r.lessons[String(l)];
  saveProg();
}

/* ---------------- speech -------------------------------------------------- */
/* The voice is the pronunciation model, so it is ranked, not accepted:
   getVoices() is unordered, and on macOS eight of the nine en-GB voices are
   Apple's stylised set. A character voice is not a pronunciation model.
   Measured caveat carried from the audio review: TTS does NOT reliably
   render the /ʊ/-/uː/ length contrast, so audio here is a model of word
   identity, never of vowel length. */
const CHARACTER_VOICE = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|eddy|flo|fred|good news|grandma|grandpa|jester|junior|kathy|organ|ralph|reed|rocko|sandy|shelley|superstar|trinoids|whisper|wobble|zarvox)\b/i;
const NEURAL_VOICE = /(natural|neural|enhanced|premium|siri|google|online)/i;
const NEUTRAL_VOICE = /\b(daniel|kate|serena|libby|sonia|ryan|arthur|oliver|hazel|george|martha)\b/i;
const RATE_NORMAL = 1.0, RATE_SLOW = 0.6;

const TTS = { ready:false, voice:null, british:false, failed:false,
              supported:(typeof speechSynthesis !== "undefined") };
let onVoices = null;

function scoreVoice(v){
  const lang = String(v.lang || "").replace("_", "-");
  if (!/^en\b/i.test(lang)) return -Infinity;
  const n = String(v.name || "");
  let s = /^en-GB/i.test(lang) ? 100 : /^en-(IE|AU|NZ|ZA)/i.test(lang) ? 40 : 20;
  if (CHARACTER_VOICE.test(n)) s -= 200;   // beaten by any plain voice, any accent
  if (NEURAL_VOICE.test(n))    s += 50;
  if (NEUTRAL_VOICE.test(n))   s += 25;
  if (/compact/i.test(n))      s -= 15;
  if (v.localService === false) s += 5;
  return s;
}
function refreshVoice(){
  const was = TTS.ready;
  let best = null, bs = -Infinity;
  const vs = (TTS.supported && speechSynthesis.getVoices()) || [];
  for (const v of vs){ const s = scoreVoice(v); if (s > bs){ bs = s; best = v; } }
  TTS.voice = bs === -Infinity ? null : best;
  TTS.ready = !!TTS.voice;
  TTS.british = !!(TTS.voice && /^en[-_]GB/i.test(TTS.voice.lang));
  return TTS.ready !== was;
}
if (TTS.supported){
  refreshVoice();
  /* Chrome returns an empty list on the first call and fills it async. */
  speechSynthesis.addEventListener("voiceschanged", () => { if (refreshVoice() && onVoices) onVoices(); });
}
const canListen = () => TTS.supported && TTS.ready && !TTS.failed;

let primed = false;
function primeSpeech(){           // iOS grants synthesis only from a gesture
  if (primed || !TTS.supported) return;
  primed = true;
  try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } catch(e){}
}
let sTimer = null;
function speak(text, opts){
  if (!canListen() || !text) return false;
  opts = opts || {};
  try {
    speechSynthesis.cancel();
    if (sTimer) clearTimeout(sTimer);
    /* Chrome drops an utterance queued in the same tick as cancel(). */
    sTimer = setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = TTS.voice; u.lang = TTS.voice.lang;
      u.rate = opts.slow ? RATE_SLOW : RATE_NORMAL;
      u.onerror = ev => {
        const e = ev && ev.error;
        if (e === "interrupted" || e === "canceled") return;   // our own cancel()
        TTS.failed = true;
      };
      speechSynthesis.speak(u);
    }, 60);
    return true;
  } catch(e){ return false; }
}

/* ---------------- small helpers ------------------------------------------ */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
function esc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")
                  .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function shuffle(a){
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [b[i],b[j]] = [b[j],b[i]]; }
  return b;
}
const pick = a => a[Math.floor(Math.random() * a.length)];

/* The generator marks the removed word in a cloze sentence with U+0001 — a
   character no lesson can contain, so no escaping dance is needed. */
const GAP = "\u0001";

/* Blank the headword inside a collocation, whatever case it appears in. */
function blankOut(phrase, word){
  const i = String(phrase).toLowerCase().indexOf(String(word).toLowerCase());
  if (i < 0) return esc(phrase) + ' <b class="hole"></b>';
  return esc(phrase.slice(0, i)) + '<b class="hole"></b>' + esc(phrase.slice(i + word.length));
}
function norm(s){
  return String(s == null ? "" : s).normalize("NFC").toLowerCase()
    .replace(/[’‘`´]/g,"'").replace(/[.,!?;:]+$/g,"").replace(/\s+/g," ").trim();
}

/* ---------------- the official answer-key grammar ------------------------
   IELTS keys are not exact strings, and marking them as if they were fails
   learners for being right. The published rules this implements:

     ( )  a token in brackets is optional        "(the) public library"
     /    alternates                             "colour/color"
          both UK and US spellings are accepted
          two answers written in one gap score ZERO, not partial credit
          spelling and grammar errors cost the mark, and we say so up front

   The one rule deliberately NOT softened is the last: a misspelling is wrong
   here because it is wrong there, and hiding that would be the kind favour
   that costs a mark later. */

/* Fold UK and US spellings onto one form, so both are accepted (01 §8).
   Because the fold can only ever ACCEPT something, a rule that over-fires
   marks a misspelling right -- which is the one direction C5 forbids. Written
   as patterns, three of the four rules did exactly that:

     promise/promize   filled/filed   contour/contor   acre/acer

   So each alternation is now a closed list rather than a suffix rule. These
   are finite sets in English, they are the words a grade-8 learner will
   actually write, and a word that is not on one is simply not folded. */

const OUR_OR = ("armour behaviour candour clamour colour demeanour endeavour favour "
  + "fervour flavour glamour harbour honour humour labour neighbour odour parlour "
  + "rigour rumour saviour splendour succour tumour valour vapour vigour").split(" ");
/* Pairs that no suffix rule covers. Each is a real UK/US alternation, and
   leaving one out is a FALSE REJECTION -- the learner is right and marked
   wrong, which is worse than the over-acceptance the closed lists fixed.
   "jewellery" is in Unit 4's vocabulary, so this one shipped. */
const PAIRS = {
  jewellery:"jewelry", catalogue:"catalog", dialogue:"dialog", monologue:"monolog",
  defence:"defense", offence:"offense", pretence:"pretense", licence:"license",
  practise:"practice", storey:"story", plough:"plow", cheque:"check",
  draught:"draft", kerb:"curb", tyre:"tire", pyjamas:"pajamas", aluminium:"aluminum",
  moustache:"mustache", axe:"ax", grey:"gray", programme:"program", sceptical:"skeptical",
  aeroplane:"airplane", mould:"mold", smoulder:"smolder", woollen:"woolen",
};
const RE_ER = ("calibre centre fibre goitre litre lustre manoeuvre meagre metre mitre "
  + "ochre sabre sceptre sepulchre sombre spectre theatre").split(" ");
/* -ise verbs that never take -ize. The productive class is enormous, so this
   one is a blocklist: everything else ending -ise folds to -ize. */
const NEVER_IZE = ("advertise advise apprise arise chastise circumcise comprise "
  + "compromise demise despise devise disguise enterprise excise exercise franchise "
  + "guise improvise incise likewise merchandise otherwise paradise precise premise "
  + "promise reprise revise rise supervise surmise surprise televise treatise wise"
  ).split(" ");
/* Stems that double a final -l before a suffix in British spelling. */
const DOUBLE_L = ("cancel channel counsel dial equal fuel grovel initial jewel label "
  + "level libel marvel medal model parcel pedal quarrel refuel revel rival shrivel "
  + "signal snivel total travel tunnel unravel").split(" ");

const INFLECT = "(?:s|es|d|ed|ing)?";
const anyOf = (list, tail) => new RegExp("^(" + list.join("|") + ")" + (tail || "") + "$");
const RE_OUR = anyOf(OUR_OR, "(s|ed|ing|ite|ful|less|able)?");
const RE_RE = anyOf(RE_ER, "(s|d|ing)?");
const RE_LL = anyOf(DOUBLE_L, "l(ed|ing|er|or)");
const RE_NEVER = anyOf(NEVER_IZE, INFLECT);

const PAIR_STEM = new RegExp("^(" + Object.keys(PAIRS).join("|") + ")(s|d|ed|ing|es)?$");
function fold(s){
  return norm(s).split(" ").map(w => {
    const p = PAIR_STEM.exec(w);
    if (p) return PAIRS[p[1]] + (p[2] || "");
    let m = RE_OUR.exec(w);
    if (m) return m[1].replace(/our$/, "or") + (m[2] || "");
    m = RE_RE.exec(w);
    if (m) return m[1].replace(/re$/, "er") + (m[2] || "");
    m = RE_LL.exec(w);
    if (m) return m[1] + m[2];
    if (/is(e|ed|es|ing|ation)$/.test(w) && !RE_NEVER.test(w))
      return w.replace(/is(e|ed|es|ing|ation)$/, "iz$1");
    return w;
  }).join(" ");
}

/* "(the) old (public) library" -> every combination the key admits. */
function expandOptional(s){
  const m = /\(([^)]*)\)/.exec(s);
  if (!m) return [s];
  const without = s.slice(0, m.index) + s.slice(m.index + m[0].length);
  const with_   = s.slice(0, m.index) + m[1] + s.slice(m.index + m[0].length);
  return expandOptional(with_).concat(expandOptional(without));
}
function acceptedForms(spec){
  const out = [];
  for (const alt of String(spec).split("/"))
    for (const v of expandOptional(alt)) out.push(fold(v));
  return out.filter(Boolean);
}

/* Two answers in one gap score zero. Detected before marking, so the learner
   is told which rule bit them rather than just being marked wrong. */
const TWO_ANSWERS = /\s*(\/|,|;|\bor\b)\s*/i;
function markAnswer(given, keys){
  const raw = String(given || "").trim();
  if (!raw) return { ok:false, why:"blank" };
  const specs = [].concat(keys).filter(Boolean);
  const accepted = specs.flatMap(acceptedForms);
  if (accepted.includes(fold(raw))) return { ok:true };
  if (TWO_ANSWERS.test(raw) && !accepted.some(a => a.includes(" or ")))
    return { ok:false, why:"two" };
  return { ok:false, why:"wrong" };
}
/* Speak the headword, not its bracketed grammar note: "hang out (with)". */
const sayWord = w => String(w.word || "").replace(/\s*\(.*?\)\s*/g," ").trim();

/* ---------------- page data ---------------------------------------------- */
function pageData(){
  const el = document.getElementById("page-data");
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch(e){ return null; }
}
const DATA = pageData() || {};

/* ---------------- answer reveals ----------------------------------------- */
function initAnswers(){
  $$(".answer").forEach(a => {
    const btn = $("button", a), body = $(".body", a);
    if (!btn || !body) return;
    body.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    /* An exercise with a marked task keeps its key shut until the task is
       checked. Otherwise the attempt is optional, and an optional attempt is
       exactly the reveal-and-self-mark this replaced. */
    if (a.dataset.locked === "1"){
      const lock = () => {
        const open = $$('[data-role="task"]', a.closest(".block") || document)
          .every(x => x.dataset.done === "1");
        btn.disabled = !open;
        btn.title = open ? "" : "Check your answers first.";
      };
      lock();
      document.addEventListener("en8:task-done", lock);
    }
    btn.addEventListener("click", () => {
      const open = body.hidden;
      body.hidden = !open;
      a.dataset.open = open ? "1" : "0";
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Hide answer" : "Show answer";
    });
  });
}

/* ---------------- dictionary entries -------------------------------------
   One toggle per entry. Kept independent (not an accordion) because a learner
   comparing two words wants both open at once. */
function initEntries(){
  $$(".e-toggle").forEach(btn => {
    const full = btn.parentElement.querySelector(".e-full");
    if (!full) return;
    const sync = open => {
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector(".bk").textContent = open ? "📕" : "📖";
      const label = Array.from(btn.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
      if (label) label.textContent = open ? " Hide full entry " : " Full entry ";
    };
    /* Ctrl+F can reveal a hidden="until-found" block without a click; keep the
       button honest when the browser opens it for us. */
    full.addEventListener("beforematch", () => sync(true));
    btn.addEventListener("click", () => {
      const open = full.hasAttribute("hidden");
      if (open) full.removeAttribute("hidden");
      else full.setAttribute("hidden", "until-found");
      sync(open);
      return;
    });
  });
}

/* ---------------- lesson page -------------------------------------------- */
function initLesson(){
  if (DATA.kind !== "lesson") return;
  const { unit, lesson } = DATA;
  const btn = $("#markDone");
  const paint = () => {
    const done = lessonDone(unit, lesson);
    if (btn){
      btn.textContent = done ? "✓ Completed" : "Mark lesson complete";
      btn.classList.toggle("quiet", done);
      btn.setAttribute("aria-pressed", String(done));
    }
    /* The rail shows numbers only; name each one so hovering (or a screen
       reader) tells you which lesson it is, and mark the finished ones. */
    $$(".rail a, .rail span").forEach(el => {
      const n = el.dataset.lesson;
      if (!n) return;
      const t = (DATA.titles || {})[n];
      if (t){
        el.title = "Lesson " + n + " — " + t;
        el.setAttribute("aria-label", "Lesson " + n + ": " + t
          + (lessonDone(unit, Number(n)) ? " (done)" : ""));
      }
      if (lessonDone(unit, Number(n))) el.classList.add("ok");
    });
  };
  if (btn) btn.addEventListener("click", () => { markLesson(unit, lesson, !lessonDone(unit, lesson)); paint(); });
  paint();
}

/* ---------------- home + unit progress paint ------------------------------ */
function paintProgress(){
  $$("[data-unit-progress]").forEach(el => {
    const u = el.dataset.unitProgress;
    const n = lessonsDone(u), pct = Math.round(n / 7 * 100);
    const fill = $(".bar i", el) || $("i", el);
    if (fill) fill.style.width = pct + "%";
    const t = $("[data-progress-text]", el);
    if (t) t.textContent = n === 0 ? "7 lessons" : n + " of 7 done";
    if (n === 7) el.classList.add("is-complete");
  });
  const totalEl = $("[data-total-lessons]");
  if (totalEl){
    let done = 0;
    for (let u = 1; u <= 12; u++) done += lessonsDone(String(u).padStart(2, "0"));
    totalEl.textContent = done;
  }
  const unitsStarted = $("[data-units-started]");
  if (unitsStarted){
    let n = 0;
    for (let u = 1; u <= 12; u++) if (lessonsDone(String(u).padStart(2, "0")) > 0) n++;
    unitsStarted.textContent = n;
  }
  const unitsDone = $("[data-units-done]");
  if (unitsDone){
    let n = 0;
    for (let u = 1; u <= 12; u++) if (lessonsDone(String(u).padStart(2, "0")) === 7) n++;
    unitsDone.textContent = n;
  }
}

/* ---------------- where to begin -----------------------------------------
   The card at the top of the home page and of every unit page. Its markup
   ships pointing at the first thing a new learner should open, and this
   repoints it at the first thing *this* learner has not finished — because
   "start with Lesson 1" is wrong advice for someone who did Lessons 1 to 4
   yesterday, and a returning learner should not have to work out where they
   stopped. */
function initStart(){
  const card = $("#startCard");
  if (!card) return;
  const title = $("#startTitle", card), lede = $("#startLede", card), link = $("#startLink", card);
  if (!link) return;
  const say = (h, l, href, text) => {
    if (title) title.textContent = h;
    if (lede) lede.innerHTML = l;
    link.setAttribute("href", href);
    link.textContent = text;
  };

  if (DATA.kind === "unit"){
    const u = DATA.unit;
    let next = 0;
    for (let l = 1; l <= 7; l++) if (!lessonDone(u, l)){ next = l; break; }
    const done = lessonsDone(u);
    if (!next){
      say("This unit is finished",
        "All seven lessons are marked complete. The word practice and the unit test are "
        + "open at the bottom of this page.",
        "#gate", "Go to practice & test");
    } else if (done){
      say("Pick up where you left off",
        "You have finished <b>" + done + " of 7</b> lessons in this unit. The steps below "
        + "are the same every time.",
        "lesson-" + next + "/index.html", "Continue with Lesson " + next);
    }
    return;
  }

  if (DATA.kind === "home"){
    let next = 0, started = 0;
    for (let n = 1; n <= 12; n++){
      const u = String(n).padStart(2, "0"), d = lessonsDone(u);
      if (d < 7){ next = n; started = d; break; }
    }
    if (!next){
      say("Every unit is finished",
        "All twelve units are complete. Words you have practised keep coming back for "
        + "review — check the queue above.",
        "unit-01/index.html", "Back to Unit 01");
    } else if (started || next > 1){
      const nn = String(next).padStart(2, "0");
      say("Pick up where you left off",
        started ? "You are <b>" + started + " of 7</b> lessons into Unit " + nn + "."
                : "Unit " + nn + " is next.",
        "unit-" + nn + "/index.html", "Continue Unit " + nn);
    }
  }
}

/* ---------------- the gate ------------------------------------------------
   The operator's constraint: a test is never presented before the lessons it
   tests. That is enforced twice — structurally, because the generator only
   ever emits this block after all seven lesson links, and behaviourally here,
   because the buttons stay inert until the lessons are actually done. */
const PRACTICE_AFTER = 2;   // vocabulary is introduced in Lesson 2
function initGate(){
  if (DATA.kind !== "unit") return;
  const u = DATA.unit;
  const gate = $("#gate");
  if (!gate) return;
  const done = lessonsDone(u);
  const canPractise = lessonDone(u, PRACTICE_AFTER);
  const canTest = done === 7;

  const pBtn = $("#startPractice"), tBtn = $("#startTest"), lock = $("#gateLock");
  gate.dataset.open = (canPractise || canTest) ? "1" : "0";

  if (pBtn){
    pBtn.setAttribute("aria-disabled", String(!canPractise));
    if (canPractise) pBtn.addEventListener("click", () => runEngine("practice", DATA.vocab, u));
  }
  if (tBtn){
    tBtn.setAttribute("aria-disabled", String(!canTest));
    if (canTest) tBtn.addEventListener("click", () => runEngine("test", DATA.vocab, u));
  }
  if (lock){
    if (canTest){
      const best = unitRec(u).test;
      lock.innerHTML = "<span>✓</span><div>All seven lessons are done. "
        + (best ? "Your best test score so far is <b>" + best.best + "%</b>." : "The unit test is open.")
        + "</div>";
    } else if (canPractise){
      lock.innerHTML = "<span>◐</span><div>Practice is open. The <b>unit test</b> unlocks when all seven "
        + "lessons are marked complete — <b>" + (7 - done) + "</b> to go.</div>";
    } else {
      lock.innerHTML = "<span>🔒</span><div>Work through the lessons first. Practice opens once you finish "
        + "<b>Lesson " + PRACTICE_AFTER + "</b> (where this unit's vocabulary is taught); the "
        + "<b>unit test</b> opens when all seven are done.</div>";
    }
  }
}

/* ---------------- spaced review ------------------------------------------
   Fixed, uniform intervals. Two independent meta-analyses find expanding
   schedules no better than uniform ones, so the simplest thing that spaces
   at all is also the best-supported thing — and where an interval had to be
   chosen, it errs long, because short intervals match long ones on immediate
   tests and lose on delayed ones.

   The seven days is an engineering choice and the interface says so. Nothing
   in the evidence names an interval, and a tool implying otherwise would be
   selling a forgetting curve nobody has published. */
const R_KEY = "en8:review:v1";
const DAY = 86400000;
const REVIEW_DAYS = 7;      // uniform, not expanding
const RELEARN_DAYS = 1;     // an item you missed comes back tomorrow
const todayNum = () => Math.floor(Date.now() / DAY);

let REVIEW = (() => {
  try { return JSON.parse(localStorage.getItem(R_KEY)) || {}; } catch(e){ return {}; }
})();
function saveReview(){
  try { localStorage.setItem(R_KEY, JSON.stringify(REVIEW)); } catch(e){}
}
/* The record key carries the TYPE, not just the string. Without it a word and a
   grammar item that happen to share a spelling — "so" the conjunction against
   "so" the headword — would share one review record, and answering either would
   schedule both. Legacy word records were keyed `unit:word`, and that is still
   what a word produces, so a learner's existing schedule survives the change. */
const rKey = (u, type, id) => u + ":" + (type && type !== "word" ? type + ":" : "") + String(id).toLowerCase();

/* Delayed retention, not in-session recall. An item only counts toward
   retention when it comes back after a real gap; nothing is ever marked
   "mastered" in the session that taught it. */
function schedule(unit, type, id, ok){
  const k = rKey(unit, type, id), t = todayNum();
  const r = REVIEW[k] || { due:t, seen:0, kept:0, delayed:0 };
  const gap = r.last === undefined ? 0 : t - r.last;
  if (gap >= REVIEW_DAYS){ r.delayed++; if (ok) r.kept++; }
  r.seen++;
  r.last = t;
  r.due = t + (ok ? REVIEW_DAYS : RELEARN_DAYS);
  REVIEW[k] = r;
  saveReview();
}
/* Every kind the unit teaches, not only its words. `DATA.review` is a flat,
   typed list built from the units' own exercises, so nothing here rehearses
   something the lessons never asked. */
/* An item joins the cycle when the lesson that TAUGHT it is marked done, and
   its first return is one interval later — not today. Enrolling on sight would
   drop five hundred items into the queue on day one, and enrolling only on a
   right answer (which is how words enter, through practice) would mean a
   grammar target nobody practised never came back at all.
   Words keep their existing path and are not touched here. */
function enrolReview(){
  if (DATA.kind !== "home") return;
  const t = todayNum();
  let added = 0;
  for (const it of (DATA.review || [])){
    if (it.type === "word" || !it.lesson) continue;
    if (!lessonDone(it.unit, it.lesson)) continue;
    const k = rKey(it.unit, it.type, it.id);
    if (REVIEW[k]) continue;
    REVIEW[k] = { due:t + REVIEW_DAYS, seen:0, kept:0, delayed:0 };
    added++;
  }
  if (added) saveReview();
}

function dueItems(){
  const t = todayNum(), out = [];
  if (DATA.kind !== "home") return out;
  const all = DATA.review || [];
  for (const it of all){
    const r = REVIEW[rKey(it.unit, it.type, it.id)];
    if (r && r.due <= t) out.push(Object.assign({ _u:it.unit }, it));
  }
  return out;
}

/* What is in the cycle, per kind. Reported separately and never added up:
   one combined figure across five different kinds of target is exactly the
   composite D9 and A2 forbid, and no published scale would make it mean
   anything anyway. */
function reviewByKind(){
  const out = {};
  for (const it of (DATA.review || [])){
    const r = REVIEW[rKey(it.unit, it.type, it.id)];
    if (!r) continue;
    (out[it.type] = out[it.type] || { seen:0, due:0 }).seen++;
    if (r.due <= todayNum()) out[it.type].due++;
  }
  return out;
}
function retention(){
  let d = 0, k = 0;
  for (const key of Object.keys(REVIEW)){ d += REVIEW[key].delayed || 0; k += REVIEW[key].kept || 0; }
  return { checked:d, kept:k };
}

/* ---------------- practice / test / review engine -------------------------
   One engine, three modes, five item formats.

   Items are asked as collocations and in context wherever the dictionary has
   them, because the one thing the vocabulary evidence is not divided about is
   that items are learned as combinations rather than as word-gloss pairs. The
   bare word-to-meaning format survives only as one format among five.

   Every item also carries a confidence judgement, and the result screen
   reports calibration next to the score. Between 74% and 86% of test-takers
   are miscalibrated on listening items, and being told so is the only
   trainable behaviour in that research with an effect size attached. Knowing
   whether to trust your own sense of "I've got this" is worth more under time
   pressure than four more right answers.

   There is no accuracy-scoring module and no ranking of items by frequency
   band, CEFR level or word-list membership: each of those was checked against
   the evidence and each fails. Order is random. */
/* A word item names itself; a grammar or function item is a question, so it is
   labelled by the exercise it came back from rather than by its own prompt. */
const itemName = w => w.word || (w.from ? w.from : String(w.q || "").slice(0, 40));

function buildItems(words, mode){
  const list = shuffle(words);
  return list.map((w, i) => {
    /* The four non-word kinds are asked exactly as their own lesson asked
       them: the prompt the unit printed, marked against the key the unit
       published. Inventing a new question for a target the learner met in a
       different form would be testing something else. */
    if (!w.word && w.a){
      /* An imported choice item is unanswerable without the option set its own
         exercise printed — "enjoy" wanting "1" would mark every honest answer
         wrong. When the item had options, it comes back AS a choice. */
      if (w.opts && w.opts.length){
        return { fmt:"recall-mc", w,
                 options:shuffle(w.opts.map(o => ({ t:o, ok:o === w.a }))) };
      }
      return { fmt:"recall", w, keys:[w.a] };
    }
    const rich = [];
    if (w.colloc && w.colloc.length) rich.push("colloc");
    if (w.cloze) rich.push("cloze");
    let fmt;
    if (mode === "test"){
      fmt = i % 3 === 0 ? "mc"
          : (canListen() && i % 5 === 3) ? "listen"
          : rich.length ? rich[i % rich.length] : "type";
    } else {
      fmt = pick((canListen() ? ["mc","type","listen"] : ["mc","type"]).concat(rich, rich));
    }
    const q = { fmt, w };
    if (fmt === "mc"){
      const others = shuffle(words.filter(x => x.word !== w.word)).slice(0, 3);
      q.options = shuffle(others.map(x => ({ t:x.vi, ok:false })).concat([{ t:w.vi, ok:true }]));
    }
    if (fmt === "colloc"){
      q.phrase = pick(w.colloc);
      q.keys = [w.word, sayWord(w)];
    }
    if (fmt === "cloze") q.keys = [w.clozeKey, w.word, sayWord(w)];
    return q;
  });
}

const MODE_LABEL = { practice:"Practice", test:"Unit test", review:"Review" };

/* `opts.onDone({right, total})` lets a caller own what happens at the end
   instead of the engine's own result card — the vocabulary intake needs the
   engine's questions but its own next step. Everything up to the last answer
   is identical, which is the point: one engine, not a second one that drifts. */
function runEngine(mode, words, unit, hostSel, opts){
  opts = opts || {};
  const host = $(hostSel || "#engine");
  if (!host || !words || !words.length) return;
  const st = { items:buildItems(words, mode), i:0, right:0, wrong:[], mode, unit,
               conf:{ sure:0, sureRight:0, unsure:0, unsureRight:0 }, pending:null };
  host.hidden = false;
  host.scrollIntoView({ behavior:"smooth", block:"start" });
  const gate = $("#gate"); if (gate && mode !== "review") gate.hidden = true;
  paintQ();

  function chrome(inner, note){
    return '<div class="card engine"><div class="qbar">'
      + '<span class="chip">' + MODE_LABEL[st.mode] + '</span>'
      + '<span class="counter">' + Math.min(st.i + 1, st.items.length) + ' of ' + st.items.length + '</span>'
      + '<span class="counter sp">' + (st.mode === "test" ? "no feedback until the end" : st.right + " right") + '</span>'
      + '</div><div class="bar"><i style="width:' + (st.i / st.items.length * 100) + '%"></i></div>'
      + inner + (note || "") + '</div>';
  }

  function paintQ(){
    if (st.i >= st.items.length) return paintDone();
    const q = st.items[st.i], w = q.w;
    const audio = canListen()
      ? '<button class="speak" data-say="' + esc(sayWord(w)) + '">🔊 Hear it</button>'
        + '<button class="speak" data-say="' + esc(sayWord(w)) + '" data-slow="1">🐢 Slowly</button>'
      : "";
    const field = ph =>
      '<input type="text" id="ans" autocomplete="off" autocapitalize="off" '
      + 'autocorrect="off" spellcheck="false" placeholder="' + esc(ph) + '">'
      + '<div class="row"><button class="btn" id="go">Check</button></div>';
    let body = "", note = "";
    if (q.fmt === "recall" || q.fmt === "recall-mc"){
      const KIND = { grammar:"Grammar", function:"Everyday English",
                     pron:"Pronunciation", colloc:"Collocation" };
      /* The prompt has already been through the generator's inline renderer, so
         it is HTML. Escaping it again printed literal <strong> tags and turned
         &#x27; into visible text. */
      body = '<p class="lede">' + esc(KIND[w.type] || "From this unit")
        + (w.from ? ' · ' + esc(w.from) : "") + '</p>'
        + (w.ask ? '<p class="note small">' + w.ask + '</p>' : "")
        + '<div class="prompt sent">' + w.q + '</div>'
        + (q.fmt === "recall-mc"
            ? '<div class="choices">'
              + q.options.map((o, i) => '<button data-i="' + i + '">' + esc(o.t)
                                        + '</button>').join("")
              + '</div>'
            : field("your answer"));
    } else if (q.fmt === "mc"){
      body = '<div class="prompt">' + esc(w.word) + '<span class="ipa">' + esc(w.ipa) + '</span></div>'
        + (audio ? '<div class="row">' + audio + '</div>' : "")
        + '<div class="choices">'
        + q.options.map((o, i) => '<button data-i="' + i + '">' + esc(o.t) + '</button>').join("")
        + '</div>';
    } else if (q.fmt === "colloc"){
      body = '<p class="lede">Complete the phrase. Learn the word with the words it lives with.</p>'
        + '<div class="prompt gap">' + blankOut(q.phrase, sayWord(w)) + '</div>'
        + '<p class="lede">' + esc(w.vi) + '</p>' + field("the missing word");
    } else if (q.fmt === "cloze"){
      body = '<p class="lede">One word is missing. Write the form this sentence needs.</p>'
        + '<div class="prompt sent">' + esc(w.cloze).split(GAP).join('<b class="hole"></b>') + '</div>'
        + field("the missing word");
    } else if (q.fmt === "type"){
      body = '<div class="prompt">' + esc(w.vi) + '<span class="ipa">' + esc(w.pos || "") + '</span></div>'
        + field("the English word");
    } else {
      body = '<p class="lede">Play the word and write what you hear.</p>'
        + '<div class="row">' + audio + '</div>' + field("what you heard")
        + '<div class="row"><button class="btn quiet" id="noaudio">No sound — show the meaning</button></div>';
    }
    if (q.fmt === "colloc" || q.fmt === "cloze" || q.fmt === "type"
        || q.fmt === "listen" || q.fmt === "recall")
      note = '<p class="note small">Spelling counts. UK and US spellings are both accepted; '
           + 'two answers in one gap score nothing.</p>';
    host.innerHTML = chrome(body, note);
    if (q.fmt === "listen") setTimeout(() => speak(sayWord(w)), 200);
    const inp = $("#ans", host);
    if (inp){ try { inp.focus({ preventScroll:true }); } catch(e){ inp.focus(); } }
  }

  /* Confidence is asked after the answer and before the verdict, so it cannot
     be read off the feedback. */
  function askConfidence(res, given){
    st.pending = { res, given };
    host.innerHTML = chrome(
      '<div class="prompt small">How sure are you of that answer?</div>'
      + '<div class="choices conf">'
      + '<button data-conf="1">● Sure</button>'
      + '<button data-conf="0">○ Not sure</button></div>',
      '<p class="note small">Asked before you see the result, so it measures what you '
      + 'actually knew. The gap between your confidence and your accuracy is the thing '
      + 'worth watching.</p>');
  }

  function grade(){
    const { res, given } = st.pending;
    const q = st.items[st.i], w = q.w, ok = res.ok;
    if (ok) st.right++; else st.wrong.push({ q, given, why:res.why });
    schedule(q.w._u || st.unit, w.type || "word", w.id || w.word, ok);
    if (st.mode === "test"){ st.i++; return paintQ(); }
    const why = res.why === "two"
      ? '<div class="n">Two answers in one gap score nothing, even when one of them is right.</div>'
      : (given && !ok ? '<div class="n">You wrote: ' + esc(given) + '</div>' : "");
    host.innerHTML = chrome(
      '<div class="verdict ' + (ok ? "ok" : "no") + '">'
      + '<b>' + (ok ? "Correct" : "Not quite") + '</b>'
      + '<div>' + (w.word
            ? esc(w.word) + ' — ' + esc(w.vi)
            /* A non-word item has no gloss to show, so the answer IS the
               feedback — plus the unit's own reason where it wrote one. */
            : esc(w.a) + (w.why ? ' <span class="ipa">' + esc(w.why) + '</span>' : ""))
        + '</div>' + why + '</div>'
      + (w.colloc ? '<p class="note small"><b>Goes with:</b> ' + w.colloc.map(esc).join(" · ") + '</p>' : "")
      + (w.word && canListen() ? '<div class="row"><button class="speak" data-say="' + esc(sayWord(w)) + '">🔊 Hear it</button>'
          + '<button class="speak" data-say="' + esc(sayWord(w)) + '" data-slow="1">🐢 Slowly</button></div>' : "")
      + '<div class="row"><button class="btn" id="next">Continue</button></div>');
    if (!ok) st.items.push(q);                 // wrong items come back
    $("#next", host).addEventListener("click", () => { st.i++; paintQ(); });
  }

  function calibrationLine(){
    const c = st.conf;
    if (!c.sure && !c.unsure) return "";
    const pc = (r, n) => n ? Math.round(r / n * 100) : null;
    const s = pc(c.sureRight, c.sure), n = pc(c.unsureRight, c.unsure);
    let verdict;
    if (s === null || n === null) verdict = "Answer some of both kinds to see how well calibrated you are.";
    else if (s - n >= 25) verdict = "Well calibrated — when you feel sure, you generally are. "
      + "That is worth trusting when you are short of time.";
    else if (s - n >= 10) verdict = "Roughly calibrated. Your certainty means something, but not much.";
    else if (s >= n) verdict = "Not calibrated yet — you were about as accurate when unsure as when sure, "
      + "so the feeling of certainty is not yet telling you anything. Most people start here.";
    else verdict = "Inverted — you did better on the ones you doubted. Slow down on the ones that feel easy.";
    return '<div class="calib"><h3>Calibration</h3><div class="scroll"><table><thead><tr>'
      + '<th></th><th>Answered</th><th>Right</th><th></th></tr></thead><tbody>'
      + '<tr><td>● Sure</td><td>' + c.sure + '</td><td>' + c.sureRight + '</td>'
      + '<td>' + (s === null ? "—" : s + "%") + '</td></tr>'
      + '<tr><td>○ Not sure</td><td>' + c.unsure + '</td><td>' + c.unsureRight + '</td>'
      + '<td>' + (n === null ? "—" : n + "%") + '</td></tr>'
      + '</tbody></table></div><p class="lede">' + verdict + '</p></div>';
  }

  function paintDone(){
    const total = st.items.length;
    if (opts.onDone){ opts.onDone({ right: st.right, total }); return; }
    if (st.mode === "test" && st.unit){
      const r = unitRec(st.unit);
      const pct = Math.round(st.right / total * 100);
      if (!r.test || pct > r.test.best) r.test = { best:pct, at:Date.now() };
      saveProg();
    }
    const ret = retention();
    const names = [];
    for (const x of st.wrong){
      const nm = itemName(x.q.w);
      if (nm && !names.includes(nm)) names.push(nm);
    }
    const missed = names.length
      ? '<div class="note"><b>Back tomorrow:</b> ' + names.map(esc).join(" \u00b7 ") + '</div>'
      : '<div class="note">Every item right. They are scheduled to come back in '
        + REVIEW_DAYS + ' days.</div>';
    host.innerHTML = '<div class="card engine"><h2>'
      + (st.mode === "test" ? "Unit test — result" : MODE_LABEL[st.mode] + " finished") + '</h2>'
      + '<p class="tally-line"><b>' + st.right + ' of ' + total + '</b> right in this session.</p>'
      + calibrationLine()
      + (ret.checked
          ? '<p class="note"><b>Kept after a week:</b> ' + ret.kept + ' of ' + ret.checked
            + ' items were still right when they came back after a real gap. That is the number '
            + 'worth watching.</p>'
          : '<p class="note">Come back in ' + REVIEW_DAYS + ' days and these items will be waiting. '
            + 'What you remember after a gap is what counts, so nothing is marked learned today.</p>')
      + missed
      + '<p class="note small">This is a score on this unit\'s word list, not a measure of your '
      + 'English overall.</p>'
      + '<div class="row"><button class="btn" id="again">Go again</button>'
      + '<button class="btn quiet" id="back">Done</button></div></div>';
    $("#again", host).addEventListener("click", () => runEngine(st.mode, words, st.unit, hostSel));
    $("#back", host).addEventListener("click", () => {
      host.hidden = true;
      const g = $("#gate"); if (g){ g.hidden = false; initGate(); }
      if (DATA.kind === "home") paintReview();
      window.scrollTo({ top:0, behavior:"smooth" });
    });
  }

  host.addEventListener("click", ev => {
    const b = ev.target.closest("button");
    if (!b || !host.contains(b)) return;
    primeSpeech();
    if (b.dataset.say){ speak(b.dataset.say, { slow:!!b.dataset.slow }); return; }
    const q = st.items[st.i];
    if (!q) return;
    if (b.dataset.conf !== undefined){
      const sure = b.dataset.conf === "1", ok = st.pending.res.ok;
      if (sure){ st.conf.sure++; if (ok) st.conf.sureRight++; }
      else { st.conf.unsure++; if (ok) st.conf.unsureRight++; }
      grade();
      return;
    }
    if (b.dataset.i !== undefined){
      const i = Number(b.dataset.i), ok = q.options[i].ok;
      $$(".choices button", host).forEach((c, j) => {
        c.disabled = true;
        if (q.options[j].ok) c.classList.add("ok");
        else if (c === b) c.classList.add("no");
        else c.classList.add("dim");
      });
      setTimeout(() => askConfidence({ ok }, q.options[i].t), 300);
      return;
    }
    if (b.id === "go"){
      const v = ($("#ans", host) || {}).value || "";
      const keys = q.keys || [q.w.word, sayWord(q.w)];
      askConfidence(markAnswer(v, keys), v.trim());
      return;
    }
    if (b.id === "noaudio"){
      st.items[st.i] = { fmt:"type", w:q.w };
      paintQ();
      return;
    }
  });
  host.addEventListener("keydown", ev => {
    if (ev.key === "Enter" && $("#ans", host)){ ev.preventDefault(); const g = $("#go", host); if (g) g.click(); }
  });
}

/* ---------------- the review card on the home page ----------------------- */
function paintReview(){
  if (DATA.kind !== "home") return;
  enrolReview();
  const card = $("#reviewCard"), n = $("[data-review-due]");
  const due = dueItems();
  if (n) n.textContent = due.length;
  if (!card) return;
  const seen = Object.keys(REVIEW).length;
  if (!seen){ card.hidden = true; return; }
  card.hidden = false;
  const ret = retention();
  const lede = $("#reviewLede"), brk = $("#reviewBreak"), btn = $("#startReview");
  if (lede) lede.textContent = due.length
    ? due.length + " item" + (due.length === 1 ? " is" : "s are") + " due. They come back on a "
      + "fixed " + REVIEW_DAYS + "-day cycle, and anything you miss returns tomorrow."
    : "Nothing is due today. " + seen + " item" + (seen === 1 ? "" : "s") + " are in the cycle; "
      + "spacing them out is what makes them stick, so coming back tomorrow beats going again now.";
  if (brk) brk.textContent = ret.checked
    ? ret.kept + "/" + ret.checked + " kept after a real gap" : "";
  /* What is in the cycle, one line per kind, nothing summed. Five different
     kinds of target do not share a scale, so a single figure over them would
     be a number with no meaning as well as a prohibited one. */
  const kinds = $("#reviewKinds");
  if (kinds){
    const LABEL = { word:"Words", colloc:"Collocations", grammar:"Grammar",
                    function:"Everyday English", pron:"Pronunciation" };
    const by = reviewByKind();
    const rows = Object.keys(LABEL).filter(k => by[k])
      .map(k => '<tr><td>' + LABEL[k] + '</td><td>' + by[k].seen + '</td><td>'
                + (by[k].due || "—") + '</td></tr>').join("");
    kinds.innerHTML = rows
      ? '<div class="scroll"><table><thead><tr><th>In the cycle</th><th>Items</th>'
        + '<th>Due</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      : "";
  }
  if (btn){
    btn.setAttribute("aria-disabled", String(!due.length));
    btn.textContent = due.length ? "Review " + due.length + " item" + (due.length === 1 ? "" : "s")
                                 : "Nothing due";
    if (due.length && !btn.dataset.wired){
      btn.dataset.wired = "1";
      btn.addEventListener("click", () => runEngine("review", dueItems(), null, "#reviewEngine"));
    }
  }
}

/* ---------------- global speak buttons (vocabulary tables) ---------------- */
function initSpeakButtons(){
  document.addEventListener("click", ev => {
    const b = ev.target.closest("[data-say]");
    if (!b) return;
    primeSpeech();
    speak(b.dataset.say, { slow:!!b.dataset.slow });
  });
  if (!canListen()) $$("[data-say]").forEach(b => { b.hidden = true; });
  const warn = $("#ttsNote");
  if (warn && canListen() && !TTS.british){
    warn.hidden = false;
    warn.innerHTML = "Reading with <b>" + esc(TTS.voice.name) + "</b> (" + esc(TTS.voice.lang)
      + "). This course teaches British pronunciation, so a few words will not match the IPA shown.";
  }
}

/* ================== marked tasks =========================================
   Everything below exists because an exercise you mark yourself against a
   printed key is not the same exercise. The rules here are IELTS's own and
   published; the point of enforcing rather than describing them is that a
   rule you meet as feedback is a rule you keep.

     word limit   per task, printed, and a hard fail (03 §4)
     hyphens      "check-in" counts as one word (03 §4)
     spelling     costs the mark, and the task says so first (03 §4)
     UK/US        both accepted (already in fold(), above)
     two answers  in one gap score zero (already in markAnswer(), above)
     either order  a declared pair is marked as a set

   The marking core -- fold(), acceptedForms(), markAnswer() -- is the same
   code the vocabulary trainer has always used. Only the reach is new. */

const T_KEY = "en8:tasks:v1";
let TASKS = (() => {
  try { return JSON.parse(localStorage.getItem(T_KEY)) || {}; } catch(e){ return {}; }
})();
function saveTasks(){
  try { localStorage.setItem(T_KEY, JSON.stringify(TASKS)); } catch(e){}
}

/* "NO MORE THAN TWO WORDS AND/OR A NUMBER" -> 2, numbers free.
   Hyphenated words count as one, so a plain whitespace split is already the
   official rule and no de-hyphenating is wanted here. */
function overLimit(given, words){
  if (!words) return false;
  const [n, num] = String(words).split("+");
  const toks = String(given).trim().split(/\s+/).filter(Boolean);
  if (!num) return toks.length > Number(n);
  /* "AND/OR A NUMBER" is *a* number, singular: up to n words plus at most one
     numeric token. Letting every number through free would make "45 60 90" a
     legal one-word answer. */
  /* A numeric token is ONE number: "45" or "9:30" or "1,200" or "5.30". It is
     not "45,60,90" -- separators may join a number's own parts, never three
     numbers into one free token. */
  const one = /^\d+(?:[.,:]\d+)?(?:[-\/]\d+(?:[.,:]\d+)?)?%?$/;
  const nums = toks.filter(x => one.test(x));
  return nums.length > 1 || toks.length - nums.length > Number(n);
}

/* Items declared "in either order" are one SET with N marks, not N items in
   sequence -- the official keys mark pairs this way (03 §3.2). Returns the
   groups; markTask consumes each key once, so writing the same right answer
   in both gaps scores one, not two. */
function parseEither(spec, count){
  const groups = [], seen = new Set();
  String(spec || "").split(",").forEach(part => {
    const ns = [];
    part.split("-").forEach(x => {
      const n = Number(x.trim()) - 1;
      /* An index outside the task, a repeat, or an item already claimed by
         another group is dropped rather than trusted. The gate rejects all
         three at build time; this keeps a bad directive from throwing in the
         learner's browser. */
      if (!Number.isInteger(n) || n < 0 || n >= count || seen.has(n)) return;
      seen.add(n); ns.push(n);
    });
    if (ns.length > 1) groups.push(ns);
  });
  return groups;
}

const WHY_TEXT = {
  blank:  "nothing written",
  two:    "two answers in one gap score zero — even when one of them is right",
  limit:  "over the word limit, which forfeits the mark whatever it says",
  repeat: "already given above — these two may come in either order, but they are "
        + "two different answers",
  wrong:  ""
};

function markOne(t, it, given){
  /* An answer picked from buttons is matched against the option it IS.
     Running it through the key grammar would read the slashes in an IPA
     option like "/ʊə/" as a list of alternates and reject every answer. */
  if (it.opts){
    if (!given) return { ok:false, why:"blank" };
    return { ok: given === it.key };
  }
  if (given.trim() && overLimit(given, t.words)) return { ok:false, why:"limit" };
  return markAnswer(given, [it.key]);
}

function markTask(t, answers){
  const given = t.items.map((_, i) => answers[i] == null ? "" : String(answers[i]));
  const marks = t.items.map((it, i) => markOne(t, it, given[i]));

  /* Order-free groups are re-marked as SETS: each key may be claimed once, so
     the same right answer written in two gaps earns one mark, not two -- which
     is what marking a pair rather than two items means.

     The assignment is a full search rather than first-fit, because keys can
     overlap: with keys "(public) library" and "library", answering "library"
     then "public library" is a valid pairing that first-fit would reject by
     letting the first answer take the broader key. Groups are two or three
     items, so the permutations are trivial. */
  parseEither(t.either, t.items.length).forEach(group => {
    const keys = group.map(j => t.items[j].key);
    const over = group.map(i => given[i].trim() && overLimit(given[i], t.words));
    /* markOne, not markAnswer: a picked answer must be compared to the option
       it is, or an IPA option like "/ʊə/" is read as a list of alternates and
       every cell of the grid comes back false. bestAssignment is only as good
       as the matrix it is handed. */
    const fits = group.map((i, gi) =>
      over[gi] ? keys.map(() => false)
               : keys.map((k, ki) =>
                   markOne(t, Object.assign({}, t.items[group[ki]], { key:k }),
                           given[i]).ok));
    const best = bestAssignment(fits);
    group.forEach((i, gi) => {
      if (over[gi]){ marks[i] = { ok:false, why:"limit" }; return; }
      if (best[gi] >= 0){ marks[i] = { ok:true }; return; }
      marks[i] = fits[gi].some(Boolean)
        ? { ok:false, why:"repeat" }        /* right, but that key is spent */
        : markAnswer(given[i], keys);
    });
  });
  return marks;
}

/* Maximum matching over a tiny boolean grid: which answer takes which key.
   Returns, per answer, the key index assigned to it, or -1. Exhaustive
   backtracking -- a group is two or three items, so the search is trivial and
   a greedy pass would get overlapping keys wrong. */
function bestAssignment(fits){
  const n = fits.length, m = n ? fits[0].length : 0;
  const cur = fits.map(() => -1), used = new Array(m).fill(false);
  let bestCount = -1, best = fits.map(() => -1);
  const walk = (i, count) => {
    if (i === n){
      if (count > bestCount){ bestCount = count; best = cur.slice(); }
      return;
    }
    /* Assignments are explored before the skip branch, and a tie keeps the
       first maximum found. That makes the EARLIER answer the one credited
       when two answers claim one key, so a duplicate reads as the repeat it
       is rather than making the first attempt look wrong. */
    for (let k = 0; k < m; k++){
      if (!fits[i][k] || used[k]) continue;
      used[k] = true; cur[i] = k;
      walk(i + 1, count + 1);
      used[k] = false;
    }
    cur[i] = -1;
    walk(i + 1, count);                     // leave this answer unmatched
  };
  walk(0, 0);
  return best;
}

function itemHTML(t, it, i){
  const conf = t.conf
    ? '<span class="i-conf" role="group" aria-label="How sure are you?">'
      + '<button type="button" data-conf="1" title="I am sure">&#9679;</button>'
      + '<button type="button" data-conf="0" title="I am not sure">&#9675;</button></span>'
    : "";
  /* it.q, it.opts[].t and it.why arrive already escaped, with **bold** and
     *italic* resolved by the generator. Re-escaping here would print the
     tags; the generator is the only thing that ever builds this HTML. */
  let q;
  if (it.opts){
    /* The radio group is namespaced to the task. Without that, two tasks on
       one lesson page share the groups "q0", "q1"... and answering the second
       silently clears the first. */
    const group = "q-" + t.id + "-" + i;
    const opts = it.opts.map(o =>
      '<label class="i-opt"><input type="radio" name="' + esc(group) + '" value="'
      + esc(o.k) + '">'
      + '<span>' + (o.t === o.k ? esc(o.k) : "(" + esc(o.k) + ") " + o.t) + '</span></label>').join("");
    q = '<div class="i-q">' + it.q + '</div><div class="i-opts">' + opts + '</div>';
  } else {
    const box = '<input class="i-in" type="text" autocomplete="off" autocapitalize="off"'
      + ' spellcheck="false" aria-label="Answer ' + (i + 1) + '">';
    q = it.q.includes("___")
      ? '<div class="i-q">' + it.q.replace(/_{3,}/, box) + '</div>'
      : '<div class="i-q">' + it.q + '</div>' + box;
  }
  return '<li class="i" data-i="' + i + '">' + q + conf
    + '<div class="i-out" role="status"></div></li>';
}

/* Calibration, reported the way 03 §6.6 recommends: not a score, but whether
   feeling sure predicts being right. Phakiti's own training recommendation is
   explicit feedback on being realistic, overconfident or underconfident.

   Two things this must not do. It must not read a verdict off two or three
   answers -- a five-item set is far too small to establish anything about a
   person, and saying otherwise would be the overconfidence the feature is
   about. And it must not promise a payoff: the finding is [T2], a measured
   tendency in candidates, and no study shows that training calibration
   raises anything. So below MIN_CAL it reports the counts and stops. */
const MIN_CAL = 4;
const CAL_KEY = "en8:calib:v1";

/* The tallies accumulate across the unit, and that is not a nicety.
   A listening set is four to seven items, so a threshold of four sure AND
   four unsure can never be met inside one task -- the verdict would read
   "too few" forever and the feature would be decoration. Phakiti's finding is
   about a person's calibration, not one exercise's, so the person is what is
   counted. This task's own split is still shown beside the running total. */
function calTally(unit){
  try {
    const all = JSON.parse(localStorage.getItem(CAL_KEY) || "{}");
    return all[unit] || { 1:{n:0,ok:0}, 0:{n:0,ok:0} };
  } catch(e){ return { 1:{n:0,ok:0}, 0:{n:0,ok:0} }; }
}
function calSave(unit, tally){
  try {
    const all = JSON.parse(localStorage.getItem(CAL_KEY) || "{}");
    all[unit] = tally;
    localStorage.setItem(CAL_KEY, JSON.stringify(all));
  } catch(e){}
}

/* `record` is false when an already-marked task is being repainted after a
   reload. The line still reads the unit total, but adding to it a second time
   would inflate the running tally every time the page was refreshed. */
function calibrationLine(marks, conf, unit, record){
  const g = { 1:{n:0,ok:0}, 0:{n:0,ok:0} };
  marks.forEach((m, i) => {
    const c = conf[i];
    if (c !== 1 && c !== 0) return;
    g[c].n++; if (m.ok) g[c].ok++;
  });
  if (!g[1].n && !g[0].n) return "";

  let tot = { 1:{n:g[1].n,ok:g[1].ok}, 0:{n:g[0].n,ok:g[0].ok} };
  if (unit){
    const was = calTally(unit);
    tot = { 1:{ n:was[1].n + g[1].n, ok:was[1].ok + g[1].ok },
            0:{ n:was[0].n + g[0].n, ok:was[0].ok + g[0].ok } };
    if (record !== false) calSave(unit, tot);
  }
  const pct = s => s.n ? Math.round(s.ok / s.n * 100) : null;
  const hi = pct(tot[1]), lo = pct(tot[0]);
  let verdict;
  if (hi == null || lo == null)
    verdict = "So far you have marked every answer the same way, so there is nothing to "
            + "compare yet.";
  else if (tot[1].n < MIN_CAL || tot[0].n < MIN_CAL)
    verdict = "Not enough of each yet — a handful of answers cannot tell you what your "
            + "sense of certainty is worth. Keep marking them; this total carries across "
            + "the whole unit.";
  else if (hi - lo >= 25)
    verdict = "Across this unit your sure answers have been right much more often than "
            + "your unsure ones. Watch whether that holds as the unit goes on.";
  else if (hi >= lo)
    verdict = "Being sure has barely separated right from wrong so far. Noticing that is "
            + "the point of the column — keep marking.";
  else
    verdict = "You have been right more often when you felt unsure. That happens most on "
            + "hard questions — worth watching for now.";
  const row = (label, here, all) =>
    '<tr><td>' + label + '</td><td>' + here.n + '</td><td>'
    + (here.n ? Math.round(here.ok / here.n * 100) + "%" : "—") + '</td><td>' + all.n
    + '</td><td>' + (all.n ? Math.round(all.ok / all.n * 100) + "%" : "—") + '</td></tr>';
  return '<div class="t-cal"><b>Calibration</b>'
    + '<table><tr><th></th><th>here</th><th>right</th><th>unit</th><th>right</th></tr>'
    + row("&#9679; sure", g[1], tot[1]) + row("&#9675; not sure", g[0], tot[0])
    + '</table><p>' + verdict + '</p></div>';
}

/* A task's own "give it back to me" hook, keyed by task id.
   It exists for exactly one caller — the listening LEARN pass — and it is a
   registry rather than a button on the task because a task must never offer
   this to itself. A marked attempt is committed: that is what makes the word
   limit, the spelling rule and the single play mean anything, and a Try-again
   the learner can reach on any exercise would quietly undo all three. The
   learn pass may hand one exercise back because nothing there was spent. */
const TASK_RESET = {};

function initTasks(){
  const list = DATA.tasks || [];
  if (!list.length) return;
  list.forEach(t => {
    const root = document.querySelector('[data-task="' + t.id + '"]');
    if (!root) return;
    const box = $(".t-items", root);
    box.innerHTML = '<ol class="items">'
      + t.items.map((it, i) => itemHTML(t, it, i)).join("") + '</ol>';

    const conf = t.items.map(() => null);
    if (t.conf) $$(".i-conf button", root).forEach(b => {
      b.addEventListener("click", () => {
        const li = b.closest(".i"), i = Number(li.dataset.i);
        conf[i] = Number(b.dataset.conf);
        $$(".i-conf button", li).forEach(x => x.classList.toggle(
          "on", Number(x.dataset.conf) === conf[i]));
        gate();
      });
    });

    const check = $(".t-check", root), out = $(".t-score", root);

    /* C10: the rating is not an optional extra on a listening item. Marked
       after the key is visible it measures nothing, so Check stays shut until
       every item has one -- two clicks each, and the comparison it buys is
       the only trainable thing in the listening evidence. */
    const gate = () => {
      if (!t.conf || root.dataset.done === "1") return;
      const missing = conf.filter(c => c !== 0 && c !== 1).length;
      check.disabled = missing > 0;
      check.title = missing ? "Mark how sure you are on every item first." : "";
      const hint = $(".t-need", root);
      if (hint) hint.textContent = missing
        ? missing + (missing === 1 ? " item still needs" : " items still need")
          + " a ● / ○ mark."
        : "";
    };
    if (t.conf){
      $(".t-foot", root).insertAdjacentHTML("beforeend", '<span class="t-need"></span>');
      gate();
    }

    const read = () => t.items.map((it, i) => {
      const li = $('.i[data-i="' + i + '"]', root);
      if (it.opts){
        const on = $("input:checked", li);
        return on ? on.value : "";
      }
      const box = $(".i-in", li);
      return box ? box.value : "";
    });

    /* An attempt that a refresh wipes is not committed, it is a suggestion.
       The recording already remembers that its one play is spent; the task it
       belongs to has to remember the same way, or F5 is a retry button and
       every rule in the box above is optional. */
    const settle = (answers, confArr, record) => {
      const marks = markTask(t, answers);
      marks.forEach((m, i) => {
        const li = $('.i[data-i="' + i + '"]', root);
        li.dataset.ok = m.ok ? "1" : "0";
        const why = WHY_TEXT[m.why] || "";
        const it = t.items[i];
        $(".i-out", li).innerHTML = m.ok
          ? '<span class="ok">&#10003; right</span>'
          : '<span class="no">&#10007;</span> <b>' + esc(it.key) + '</b>'
            + (why ? ' <i>— ' + esc(why) + '</i>' : "")
            + (it.why ? ' <i>(' + it.why + ')</i>' : "");
        $$("input", li).forEach(x => { x.disabled = true; });
      });
      const score = marks.filter(m => m.ok).length;
      out.innerHTML = '<b>' + score + ' of ' + marks.length + '</b> — one mark each, '
        + 'nothing part-marked.';
      let cal = $(".t-cal", root);
      if (cal) cal.remove();
      if (t.conf){
        /* A rating changed after seeing the key measures nothing, so the
           toggles close with the task. */
        $$(".i-conf button", root).forEach(x => { x.disabled = true; });
        const html = calibrationLine(marks, confArr, DATA.unit, record);
        $(".t-foot", root).insertAdjacentHTML("afterend", html || '<div class="t-cal">'
          + '<b>Calibration</b><p>You did not mark how sure you were, so there is '
          + 'nothing to compare. Next time mark each answer before you check — on '
          + 'listening items that comparison is worth more than the score.</p></div>');
      }
      check.disabled = true;
      root.dataset.done = "1";
      return marks;
    };

    check.addEventListener("click", () => {
      const answers = read();
      const marks = settle(answers, conf, true);
      const score = marks.filter(m => m.ok).length;
      const log = ((TASKS[t.id] || {}).log || []).concat(
        [{ score, of: marks.length, at: Date.now() }]);
      TASKS[t.id] = { score, of: marks.length,
                      at: Date.now(), given: answers, conf: conf.slice(), log };
      saveTasks();
      paintLog();
      document.dispatchEvent(new CustomEvent("en8:task-done", { detail:{ id:t.id } }));
    });

    /* ---- taking it again ---------------------------------------------------
       Repeated retrieval is the thing that builds durable memory, so locking a
       task after one attempt costs learning for nothing. What it must NOT
       become is an edit: a second go is a second attempt, from blank, and both
       are kept.

       Three things this deliberately does not do, each from a rule that a
       friendlier version would break. It does not average the attempts (`09`
       E3: an accuracy line is not the progress story). It does not draw a
       trend or say "better" (E9: a single retest is regression to the mean as
       much as learning, and nothing here can tell them apart). And it does not
       appear at all on a task a timer has already spent -- otherwise "Try it
       again" quietly repeals the single play and the one clock. */
    const again = $(".t-again", root), logBox = $(".t-log", root);

    /* The nearest timer ABOVE this task is the one that owns it -- the inverse
       of `owned()`, asked from the task's end. */
    function ownerTimer(){
      const mine = $$(TIMERS).filter(x =>
        x.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING);
      return mine.length ? mine[mine.length - 1] : null;
    }
    function timerSpent(){
      const tm = ownerTimer();
      if (!tm) return false;
      const key = tm.dataset.audio ? "en8:played:" + tm.dataset.audio
                : tm.dataset.clock ? "en8:clock:" + tm.dataset.clock : null;
      if (!key) return false;
      try { return !!JSON.parse(localStorage.getItem(key) || "null"); } catch(e){ return false; }
    }

    function paintLog(){
      const rec = TASKS[t.id] || {};
      const log = rec.log || [];
      /* One line per attempt, each carrying its own count. Never a total, a
         percentage or an arrow. */
      logBox.innerHTML = log.length < 2 ? "" :
        '<p class="t-hist"><b>Your attempts:</b> '
        + log.map((a, i) => "#" + (i + 1) + " — " + a.score + "/" + a.of).join(" · ")
        + '</p><p class="t-hist small">These are separate attempts, not a score '
        + 'going up or down. What you remember after a few days is the part that '
        + 'counts, and that is what the review queue checks.</p>';
      if (!again) return;
      again.hidden = !(root.dataset.done === "1" && !timerSpent());
    }

    if (again) again.addEventListener("click", () => {
      if (timerSpent()) { again.hidden = true; return; }
      const keep = (TASKS[t.id] || {}).log || [];
      TASK_RESET[t.id]();
      TASKS[t.id] = { log: keep };        // the history outlives the answers
      saveTasks();
      paintLog();
      $(".i", root).scrollIntoView({ behavior: "smooth", block: "center" });
    });

    /* Undo a marked attempt completely: the stored answers go too, or a
       refresh would put the old marks straight back and the second attempt
       would be a suggestion rather than a fact. */
    TASK_RESET[t.id] = () => {
      delete TASKS[t.id];
      saveTasks();
      t.items.forEach((it, i) => {
        const li = $('.i[data-i="' + i + '"]', root);
        if (!li) return;
        delete li.dataset.ok;
        const out = $(".i-out", li);
        if (out) out.innerHTML = "";
        $$("input", li).forEach(x => {
          x.disabled = false;
          if (x.type === "radio" || x.type === "checkbox") x.checked = false;
          else x.value = "";
        });
        $$(".i-conf button", li).forEach(x => { x.disabled = false; x.classList.remove("on"); });
        conf[i] = null;
      });
      const cal = $(".t-cal", root);
      if (cal) cal.remove();
      out.innerHTML = "";
      check.disabled = false;
      root.dataset.done = "";
      delete root.dataset.timeup;
      if (t.conf) gate();
      if (again) again.hidden = true;
    };

    const was = TASKS[t.id];
    if (was && was.given){
      /* Put the answers back before re-marking, so the learner sees what they
         actually wrote rather than an empty form with a score under it. */
      t.items.forEach((it, i) => {
        const li = $('.i[data-i="' + i + '"]', root);
        const given = was.given[i] || "";
        if (it.opts){
          const on = $('input[value="' + String(given).replace(/"/g, '\\"') + '"]', li);
          if (on) on.checked = true;
        } else {
          const box = $(".i-in", li);
          if (box) box.value = given;
        }
      });
      (was.conf || []).forEach((c, i) => {
        if (c !== 0 && c !== 1) return;
        conf[i] = c;
        const li = $('.i[data-i="' + i + '"]', root);
        if (li) $$(".i-conf button", li).forEach(
          x => x.classList.toggle("on", Number(x.dataset.conf) === c));
      });
      settle(was.given, conf, false);
    }
    paintLog();
  });
}

/* ================== single-play listening ================================
   03 §1.1 and §4.2, all Tier 1: the orientation is spoken and deliberately
   NOT written down, there is a fixed window to read the questions, and the
   recording plays once. Printing the script above the questions -- which is
   what this course used to do -- deletes the task and leaves a reading
   comprehension exercise wearing its name. */

function speakSeq(lines, onEnd){
  if (!canListen()){ onEnd(false); return; }
  try { speechSynthesis.cancel(); } catch(e){}
  let i = 0;
  const next = () => {
    if (i >= lines.length){ onEnd(true); return; }
    const u = new SpeechSynthesisUtterance(lines[i++]);
    u.voice = TTS.voice; u.lang = TTS.voice.lang; u.rate = RATE_NORMAL;
    u.onend = next;
    u.onerror = ev => {
      const err = ev && ev.error;
      if (err === "interrupted" || err === "canceled") return;
      TTS.failed = true; onEnd(false);
    };
    speechSynthesis.speak(u);
  };
  setTimeout(next, 60);
}

/* ---------------- what a timer covers -------------------------------------
   Both timing devices on this course -- the reading clock and the single-play
   player -- stop input when their window closes, and both need the same answer
   to the same question: which exercises are mine?

   A timer covers the tasks printed BELOW it and ABOVE the next timer.

   Both halves of that are about the Review pages, because a Review is the only
   page in the course that carries two timers at once. A unit splits across
   lesson pages -- the reading clock on Skills 1, the player on Skills 2 -- so
   each of them was alone on its page and "every task on the page" happened to
   be right. A Review is one page: five Language exercises, then the timed
   reading block, then the Listening.

   So the player must not reach backwards over the Language half, which is the
   defect that kept the Reviews from having a Listening section at all; and the
   clock must not reach forwards into the listening exercises, which is the
   same defect pointing the other way and would have arrived with them. A timer
   hands over at the next timer, and on a unit page nothing changes. */
const TIMERS = '[data-role="clock"], [data-role="audio"]';
function owned(root){
  /* querySelectorAll is in document order, so the first timer after this one
     is where this one's territory ends. */
  const next = $$(TIMERS).find(t =>
    root.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING);
  const below = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  return $$('[data-role="task"]')
    .filter(x => below(root, x) && !(next && below(next, x)));
}

/* ---------------- the glossed dialogue -----------------------------------
   Tap, never hover: this is read on a phone, and a hover-only gloss reaches
   neither touch nor a keyboard. The gloss opens AFTER the paragraph rather
   than inside the line, so revealing one never reflows the sentence being
   read. One at a time, and Escape closes.

   Support here, withdrawal later — the same items come back bare in the later
   lessons and in the spaced review. That is the whole mechanism, and the half
   the build could most easily have shipped alone. */
function initDialogue(){
  $$('[data-role="dialogue"]').forEach(root => {
    let glosses = [];
    try { glosses = JSON.parse(root.dataset.glosses || "[]"); } catch(e){ return; }
    let open = null;

    const shut = btn => {
      btn.setAttribute("aria-expanded", "false");
      const g = document.getElementById(btn.getAttribute("aria-controls"));
      if (g) g.hidden = true;
      open = null;
    };

    $$(".gl", root).forEach((btn, i) => {
      const d = glosses[Number(btn.dataset.g)];
      if (!d) return;
      const id = (root.dataset.dialogue || "d") + "-g" + i;
      btn.setAttribute("aria-controls", id);

      const g = document.createElement("div");
      g.className = "gloss";
      g.id = id;
      g.hidden = true;
      if (d.kind === "gram") g.dataset.kind = "gram";
      g.innerHTML = '<span class="hw"></span><span class="ipa"></span>'
                  + '<span class="vi"></span><span class="co"></span>';
      $(".hw", g).textContent = d.hw || "";
      $(".ipa", g).textContent = d.ipa || "";
      $(".vi", g).textContent = d.vi || "";
      $(".co", g).textContent = d.co || "";
      const host = btn.closest("p") || root;
      host.parentNode.insertBefore(g, host.nextSibling);

      btn.addEventListener("click", () => {
        const was = btn.getAttribute("aria-expanded") === "true";
        if (open && open !== btn) shut(open);
        if (was){ shut(btn); return; }
        btn.setAttribute("aria-expanded", "true");
        g.hidden = false;
        open = btn;
      });
    });

    root.addEventListener("keydown", ev => {
      if (ev.key === "Escape" && open) shut(open);
    });
  });
}

/* ---------------- the vocabulary intake -----------------------------------
   Meet the words one at a time, answer on the set just met, then see the whole
   set with the option to run it again.

   The middle stage is the existing engine, called with an `onDone` so this can
   own the step after it. Reusing it is deliberate: the engine already asks
   items as collocations and in context (`09` F7), already speaks them (F3),
   and already schedules what it touches. A second, simpler quiz written here
   would have none of that and would look identical.

   What the last stage may say is bounded exactly as a task's attempt log is:
   one line per run, nothing summed, nothing called progress. */
function initVocab(){
  (DATA.vocabIntake || []).forEach(p => {
    const root = document.querySelector('[data-vocab="' + p.id + '"]');
    if (!root || !p.words.length) return;
    const stage = $(".v-stage", root), logBox = $(".v-log", root);
    const KEY = "en8:intake:" + p.id;

    const sets = [];
    for (let i = 0; i < p.words.length; i += p.size)
      sets.push(p.words.slice(i, i + p.size));

    let log = [];
    try { log = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch(e){}
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(log)); } catch(e){} };

    function paintLog(){
      /* Grouped by set, one line per attempt at that set. No total across
         sets, no average, no arrow: `09` E3 and E9. */
      const bySet = {};
      for (const a of log) (bySet[a.set] = bySet[a.set] || []).push(a);
      const rows = Object.keys(bySet).sort((a, b) => a - b).map(k =>
        '<div>Set ' + (Number(k) + 1) + ': '
        + bySet[k].map((a, i) => "#" + (i + 1) + " — " + a.right + "/" + a.total).join(" · ")
        + '</div>').join("");
      logBox.innerHTML = rows
        ? '<p class="t-hist"><b>What you have answered so far</b></p>'
          + '<div class="v-rows">' + rows + '</div>'
          + '<p class="t-hist small">Separate attempts, listed as they happened. '
          + 'Answering the same set again today is worth much less than answering '
          + 'it again next week, which is what the review queue is for.</p>'
        : "";
    }

    /* ---- stage 1: meet them, one at a time ---- */
    function meet(si, wi){
      const set = sets[si], w = set[wi];
      const eg = w.cloze ? w.cloze.replace("\x01", "<b>" + esc(w.clozeKey) + "</b>") : "";
      stage.innerHTML =
        '<div class="v-card"><div class="qbar">'
        + '<span class="chip">Set ' + (si + 1) + ' of ' + sets.length + '</span>'
        + '<span class="counter">' + (wi + 1) + ' of ' + set.length + '</span></div>'
        + '<div class="bar"><i style="width:' + (wi / set.length * 100) + '%"></i></div>'
        + '<p class="v-w">' + esc(w.word)
        + (w.ipa ? ' <span class="v-ipa">' + esc(w.ipa) + '</span>' : "")
        + ' <button class="speak" type="button" data-say="' + esc(sayWord(w)) + '">🔊</button></p>'
        + (w.pos ? '<p class="v-pos">' + esc(w.pos) + '</p>' : "")
        + '<p class="v-vi">' + esc(w.vi) + '</p>'
        + (w.colloc && w.colloc.length
            ? '<p class="v-co"><b>Goes with:</b> ' + w.colloc.map(esc).join(" · ") + '</p>' : "")
        + (eg ? '<p class="v-eg">' + eg + '</p>' : "")
        + '<div class="row"><button class="btn" data-v="next">'
        + (wi + 1 < set.length ? "Next word" : "Answer on these " + set.length) + '</button></div>'
        + '</div>';
      $('[data-v="next"]', stage).addEventListener("click", () =>
        wi + 1 < set.length ? meet(si, wi + 1) : recall(si));
    }

    /* ---- stage 2: the set just met, through the real engine ---- */
    function recall(si){
      stage.innerHTML = '<div id="v-eng-' + p.id + '"></div>';
      runEngine("practice", sets[si], null, "#v-eng-" + p.id, {
        onDone: r => {
          log.push({ set: si, right: r.right, total: r.total, at: Date.now() });
          save(); paintLog(); listing(si);
        },
      });
    }

    /* ---- stage 3: the whole set, and the offer to go again ---- */
    function listing(si){
      const set = sets[si];
      stage.innerHTML =
        '<div class="v-card"><h3>Set ' + (si + 1) + ' — all ' + set.length + ' words</h3>'
        + '<div class="scroll"><table class="v-list"><tbody>'
        + set.map(w => '<tr><td><b>' + esc(w.word) + '</b>'
            + (w.ipa ? ' <span class="v-ipa">' + esc(w.ipa) + '</span>' : "")
            + '</td><td>' + esc(w.vi) + '</td></tr>').join("")
        + '</tbody></table></div>'
        + '<div class="row"><button class="btn" data-v="retest">Answer this set again</button>'
        + (si + 1 < sets.length
            ? '<button class="btn quiet" data-v="on">Go on to set ' + (si + 2) + '</button>'
            : '<button class="btn quiet" data-v="restart">Start again from set 1</button>')
        + '</div></div>';
      $('[data-v="retest"]', stage).addEventListener("click", () => recall(si));
      const on = $('[data-v="on"]', stage);
      if (on) on.addEventListener("click", () => meet(si + 1, 0));
      const again = $('[data-v="restart"]', stage);
      if (again) again.addEventListener("click", () => meet(0, 0));
    }

    paintLog();
    /* A returning learner lands on the list of the last set they answered,
       not back at word one of set one. */
    const last = log.length ? log[log.length - 1].set : null;
    if (last === null) meet(0, 0); else listing(last);
  });
}

/* ---------------- the fluency strand -------------------------------------
   Known material, repeated, in less time each round. The panel's whole job is
   to make the repetition happen and to record what it took — so each round is
   logged on its OWN line, with its own rate. Nothing is averaged and nothing
   is scored: a single fluency figure over three rounds would be the composite
   this repository forbids everywhere else, and it would hide the only thing
   worth seeing, which is whether round 3 beat round 1. */
function initFluency(){
  $$('[data-role="fluency"]').forEach(root => {
    const btn = $(".f-start", root), state = $(".f-state", root),
          log = $(".f-log", root), rounds = $$(".f-rounds li", root);
    if (!btn || !rounds.length) return;
    const mode = root.dataset.mode || "talk";
    const words = Number(root.dataset.words || 0);
    const KEY = "en8:fluency:" + root.dataset.fluency;

    let done = [];
    try { done = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch(e){}

    const paint = () => {
      rounds.forEach((li, i) => {
        if (done[i]) li.dataset.done = "1";
      });
      log.innerHTML = done.map((d, i) => {
        if (!d) return "";
        const rate = (mode === "read" && words && d.secs)
          ? " · <b>" + Math.round(words / (d.secs / 60)) + "</b> words a minute" : "";
        return '<div>Round ' + (i + 1) + ': finished with <b>' + d.left
             + 's</b> to spare' + rate + '</div>';
      }).join("");
      const next = done.length;
      if (next >= rounds.length){
        btn.disabled = false;
        btn.textContent = "Run it again from round 1";
        state.innerHTML = "<b>All rounds done.</b> Fluency work is worth repeating — "
                        + "starting again clears this log.";
        if (!btn.dataset.rewired){
          btn.dataset.rewired = "1";
          btn.addEventListener("click", () => {
            if (done.length < rounds.length) return;
            done = [];
            try { localStorage.removeItem(KEY); } catch(e){}
            rounds.forEach(li => delete li.dataset.done);
            paint();
          });
        }
      } else {
        btn.disabled = false;
        btn.textContent = "Start round " + (next + 1);
      }
    };
    paint();

    btn.addEventListener("click", () => {
      const i = done.length;
      if (i >= rounds.length) return;
      const secs = Number(rounds[i].dataset.secs || 0);
      btn.disabled = true;
      let left = secs;
      const show = () => {
        state.textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0")
                          + " left — keep going";
      };
      show();
      const stop = document.createElement("button");
      stop.className = "btn quiet";
      stop.type = "button";
      stop.textContent = "I finished";
      $(".f-ctl", root).appendChild(stop);

      const finish = left_ => {
        clearInterval(iv);
        stop.remove();
        done[i] = { secs: secs - left_, left: left_ };
        try { localStorage.setItem(KEY, JSON.stringify(done)); } catch(e){}
        paint();
      };
      const iv = setInterval(() => {
        left--;
        if (left <= 0){ finish(0); state.innerHTML = "<b>Time.</b>"; return; }
        show();
      }, 1000);
      stop.addEventListener("click", () => finish(left));
    });
  });
}

function initAudio(){
  const list = DATA.audio || [];
  list.forEach(a => {
    const root = document.querySelector('[data-audio="' + a.id + '"]');
    if (!root) return;
    const btn = $(".p-start", root), state = $(".p-state", root),
          script = $(".p-script", root);
    /* Voices load asynchronously, so nothing is decided at boot. The device
       is only judged when the learner presses Start. */
    const noVoice = () => {
      btn.disabled = true;
      state.textContent = "No speech voice on this device.";
      script.hidden = false;
      script.insertAdjacentHTML("afterbegin",
        '<p class="p-fallback">Your device has no speech voice, so this cannot run as '
        + 'a single-play task. Cover the script, have someone read it aloud <b>once</b>, '
        + 'and answer as you listen.</p>');
    };
    /* "Plays once" has to survive a reload, or it is a suggestion. The flag is
       stored, not held in a variable a refresh throws away -- and `played`
       (set when the recording ENDS) is what unlocks the script, because Start
       only means the audio began. */
    const PLAY_KEY = "en8:played:" + a.id;
    let used = false, played = false;
    try {
      const was = JSON.parse(localStorage.getItem(PLAY_KEY) || "null");
      if (was){ used = true; played = !!was.done; }
    } catch(e){}
    const remember = done => {
      try { localStorage.setItem(PLAY_KEY, JSON.stringify({ done: !!done })); } catch(e){}
    };
    if (used){
      btn.disabled = true;
      state.innerHTML = played
        ? "<b>Already played.</b> It plays once."
        : "<b>Already started.</b> It plays once, and that play is spent.";
      if (played) revealScript();
    }
    /* ---- the learning pass ------------------------------------------------
       Replayable, and the script opens once a real attempt has been made.
       It deliberately does NOT touch PLAY_KEY: practising must not spend the
       single play, or the two passes collapse into one and C6 is decoration.
       It also never disables a task — nothing here is timed. */
    const lbtn = $(".p-learn", root), lstate = $(".p-lstate", root);
    if (lbtn){
      let plays = 0, running = false;
      const paintL = () => {
        lbtn.textContent = plays ? "Play it again" : "Practise it first";
        lstate.textContent = plays
          ? "Practised " + plays + (plays === 1 ? " time" : " times")
            + ". This does not use your one play."
          : "";
      };
      paintL();
      lbtn.addEventListener("click", () => {
        /* speakSeq() cancels synthesis globally and a cancelled utterance never
           fires its completion callback, so starting one pass mid-way through
           the other stalled the first and could leave the single play spent
           without ever playing. Neither pass may start while the other runs. */
        if (running || root.dataset.pass === "test") return;
        primeSpeech();
        if (!canListen()){
          lstate.textContent = "No speech voice on this device — use “Take it "
                             + "once” below, which shows you the script instead.";
          lbtn.disabled = true;
          return;
        }
        running = true;
        root.dataset.pass = "learn";      // which pass is running, for state and styling
        lbtn.disabled = true;
        lstate.textContent = "Playing — you can replay this as often as you like";
        speakSeq(a.script, () => {
          running = false;
          root.dataset.pass = "";
          lbtn.disabled = false;
          plays++;
          paintL();
          /* The script is the answer sheet, so it opens only after an attempt
             has been marked — otherwise the learning pass hands the listening
             lesson over as a reading lesson, which is the exact defect the
             directive exists to prevent. */
          if (owned(root).some(x => x.dataset.done === "1")) revealScript();
          paintRetry();
        });
      });
      /* `owned(root)`, not any task on the page: on a Review the Language
         exercises sit ABOVE the player, and marking one of those revealed a
         listening script the learner had never attempted. */
      document.addEventListener("en8:task-done", () => {
        if (plays > 0 && owned(root).some(x => x.dataset.done === "1")) revealScript();
        paintRetry();
      });

      /* The second half of a learning pass. Attempting once and reading the key
         is not practice — the loop is attempt, see what went wrong, go again.
         Three conditions, and each one is load-bearing:
           - only after the recording has been practised, so the questions are
             never handed back before they have been heard;
           - only while the single play is UNSPENT (`!used`), so this can never
             reach a committed attempt;
           - only over `owned(root)`, so it cannot touch an exercise belonging
             to another player or to the reading clock. */
      const retry = document.createElement("button");
      retry.className = "btn quiet p-retry";
      retry.type = "button";
      retry.textContent = "Try those questions again";
      retry.hidden = true;
      $(".p-ctl[data-pass='learn']", root).appendChild(retry);

      function paintRetry(){
        const mine = owned(root);
        retry.hidden = !(plays > 0 && !used && mine.some(x => x.dataset.done === "1"));
      }
      retry.addEventListener("click", () => {
        if (used) return;                       // the test pass owns them now
        owned(root).forEach(x => {
          const id = x.dataset.task;
          if (id && TASK_RESET[id]) TASK_RESET[id]();
        });
        lstate.textContent = "Cleared. Play it again, then answer them again.";
        paintRetry();
      });
      paintRetry();
    }

    const tick = (secs, label, then) => {
      let left = secs;
      state.textContent = label + " — " + left + "s";
      const iv = setInterval(() => {
        left--;
        if (left <= 0){ clearInterval(iv); then(); return; }
        state.textContent = label + " — " + left + "s";
      }, 1000);
    };
    btn.addEventListener("click", () => {
      if (used || root.dataset.pass === "learn") return;   // see the note on lbtn
      primeSpeech();
      if (!canListen()){ noVoice(); return; }
      used = true; remember(false);
      const rt = $(".p-retry", root);
      if (rt) rt.remove();               // a committed attempt is never handed back
      btn.disabled = true;
      root.dataset.pass = "test";       // the one-play pass; never written by learn
      root.dataset.playing = "1";
      state.textContent = "Introduction — listen, it is not written down";
      speakSeq([a.orientation], () => {
        tick(a.preview, "Read the questions", () => {
          state.textContent = "Playing — once only";
          speakSeq(a.script, () => {
            played = true; remember(true);
            root.dataset.playing = "";
            const label = a.mode === "computer"
              ? "Review your answers" : "Transfer your answers";
            tick(a.mode === "computer" ? a.review : 600, label, () => {
              /* C6: the review window is a window. When it closes, writing
                 stops -- otherwise "two minutes to review" is decoration and
                 the task has no timing at all. Check stays live, so whatever
                 is already written can still be submitted. `owned`, not every
                 task on the page: see the note above it. */
              owned(root).forEach(x => {
                if (x.dataset.done === "1") return;
                $$(".i-in, .i-opt input", x).forEach(y => { y.disabled = true; });
                x.dataset.timeup = "1";
              });
              state.innerHTML = '<b>Time.</b> Check your answers below.';
              revealScript();
            });
          });
        });
      });
    });
    function revealScript(){
      if (!script.hidden) return;
      script.hidden = false;
      script.insertAdjacentHTML("afterbegin",
        '<p class="p-fallback">The recording has played. Read the script now and find '
        + 'the places your answers came apart — that is the part of this worth doing '
        + 'twice.</p>');
    }
    /* The script also unlocks once every task this player covers has been
       marked, so a learner who finishes early is not held hostage to a
       countdown -- but only after the recording has been played. Checking
       blank answers before pressing Start would otherwise hand over the script
       and turn the whole lesson into a reading exercise. The exercises above
       the player are not part of the bargain: on a Review they belong to the
       Language half, and nobody should have to finish those to read a
       listening script they have already earned. */
    document.addEventListener("en8:task-done", () => {
      /* `played`, not `used`: submitting blank answers during the orientation
         must not hand over the script before the recording has run. */
      if (!played) return;
      const mine = owned(root);
      if (mine.length && mine.every(x => x.dataset.done === "1")) revealScript();
    });
  });
}

/* ================== strand checks ========================================
   A fraction in obligatory contexts, which 09 §4.2 lists as auto-scorable
   and E1 requires progress to be reported as. The reading rule underneath it
   matters more than the number: at A2->B1 a fraction that falls while range
   grows is the expected signature of progress, not regression (E3). */
/* ---------------- writing: a committed attempt ----------------------------
   The last place in this course that was still a printed worksheet. The page
   held a model, a plan table, a list of tick-boxes and six blank lines, and
   the strand check beside it asked the learner to type "supplied _ of _"
   about a paragraph nothing had ever read.

   `09` E8 wants a self-report anchored to something measured, and §4.4 says
   why: learners cannot self-assess accurately. So every checklist line a
   machine can honestly decide is decided here, against the learner's own
   text, and the rest keep their tick-box and say so.

   What is decidable is bounded by D9 and §5.3 -- obligatory-context accuracy
   on named structures, and the presence or absence of named discourse moves.
   Counting closed lists and words is inside that set. A holistic judgement is
   not, a score is not, and a band is not (A2, D3). Nothing below computes one:
   each line reports what it found, and no line is added to another. */
const W_KEY = "en8:write:v1";
let WRITE = (() => {
  try { return JSON.parse(localStorage.getItem(W_KEY)) || {}; } catch(e){ return {}; }
})();
function saveWrite(){
  try { localStorage.setItem(W_KEY, JSON.stringify(WRITE)); } catch(e){}
}

/* The official word rule, and the same one the marking engine uses: split on
   whitespace, and a hyphenated word counts as one (03 §4). */
const wordsIn = s => String(s).trim().split(/\s+/).filter(Boolean);

const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* A closed list -> one boundary-anchored matcher. Members may be phrases
   ("hardly ever"), so inner spaces match any run of whitespace. */
function listRe(list){
  const alts = list.slice().sort((a, b) => b.length - a.length)
                   .map(x => reEsc(x).replace(/\s+/g, "\\s+"));
  return new RegExp("(?:^|[^A-Za-z'])(" + alts.join("|") + ")(?![A-Za-z'])", "gi");
}
function hits(text, list){
  const re = listRe(list), seen = [];
  let m;
  while ((m = re.exec(text))){
    seen.push(m[1].toLowerCase().replace(/\s+/g, " "));
    re.lastIndex = m.index + m[1].length;   // allow adjacent members to match
  }
  return seen;
}

/* One checklist line -> {ok, found, need, label}. `found` is a count of a
   named feature, never a mark: nothing sums these and nothing grades them. */
function runCheck(c, text, p){
  const paras = text.trim().split(/\n\s*\n/).filter(x => x.trim());
  const bulleted = /^\s*([-*•]|\d+[.)])\s+/m.test(text);
  switch (c.k){
    case "words": {
      const n = wordsIn(text).length;
      return { ok: n >= p.lo && n <= p.hi, found: n + " words",
               need: p.lo + "–" + p.hi };
    }
    case "vocab": {
      const got = [];
      for (const w of Object.keys(p.vocab || {}))
        if (hits(text, p.vocab[w]).length) got.push(w);
      return { ok: got.length >= c.n, found: got.length + " used",
               need: c.n + " needed", list: got };
    }
    case "any": {
      const n = hits(text, c.l).length;
      return { ok: n >= c.n, found: n + " found", need: c.n + " needed" };
    }
    case "distinct": {
      const set = new Set(hits(text, c.l));
      return { ok: set.size >= c.n, found: set.size + " different",
               need: c.n + " needed", list: Array.from(set) };
    }
    case "all": {
      const set = new Set(hits(text, c.l));
      const missing = c.l.filter(x => !set.has(x));
      return { ok: !missing.length,
               found: missing.length ? "missing: " + missing.join(", ") : "all there" };
    }
    case "none": {
      const set = Array.from(new Set(hits(text, c.l)));
      return { ok: !set.length, found: set.length ? "found: " + set.join(", ") : "none" };
    }
    case "para": {
      const ok = paras.length === c.n && !bulleted;
      return { ok, found: bulleted ? "a list, not prose"
                                   : paras.length + (paras.length === 1 ? " paragraph"
                                                                        : " paragraphs") };
    }
    case "paras":
      return { ok: paras.length >= c.n, found: paras.length + " paragraphs",
               need: c.n + " needed" };
    case "re": {
      let n = 0;
      try { n = (text.match(new RegExp(c.p, "gi")) || []).length; } catch(e){ return null; }
      return { ok: n >= c.n, found: n + " found", need: c.n + " needed" };
    }
  }
  return null;
}

function initWrite(){
  (DATA.write || []).forEach(p => {
    const root = document.querySelector('[data-write="' + p.id + '"]');
    if (!root) return;
    const box = $(".w-box", root), count = $(".w-n", root);
    const rows = $$(".w-i", root);

    const rec = WRITE[p.id] || { text:"", ticks:{} };
    box.value = rec.text || "";
    rows.forEach(li => {
      if (li.dataset.auto) return;
      const cb = $("input", li), i = li.dataset.i;
      cb.checked = !!(rec.ticks || {})[i];
      cb.addEventListener("change", () => {
        rec.ticks = rec.ticks || {};
        rec.ticks[i] = cb.checked;
        WRITE[p.id] = rec; saveWrite();
      });
    });

    const paint = () => {
      const text = box.value;
      const n = wordsIn(text).length;
      /* C9: the live word count the real Writing screen has. It reports the
         number and the range; it does not stop you and it does not judge. */
      count.textContent = n + (n === 1 ? " word" : " words");
      count.dataset.state = !n ? "" : (n < p.lo ? "under" : n > p.hi ? "over" : "in");

      rows.forEach(li => {
        const c = p.items[Number(li.dataset.i)].c;
        if (!c) return;
        const r = runCheck(c, text, p);
        const cb = $("input", li), out = $(".w-f", li);
        if (!r || !text.trim()){ cb.checked = false; out.textContent = ""; li.dataset.ok = ""; return; }
        cb.checked = !!r.ok;
        li.dataset.ok = r.ok ? "1" : "0";
        out.textContent = r.found + (r.ok || !r.need ? "" : " · " + r.need);
        out.title = r.list && r.list.length ? r.list.join(", ") : "";
      });

      rec.text = text;
      WRITE[p.id] = rec; saveWrite();
    };
    box.addEventListener("input", paint);
    paint();
  });
}

/* ---------------- the reading passage: highlights and notes ---------------
   C9, from 01 §9.1 and §12.7. The real Reading screen offers colour
   highlighting and on-screen notes, and the checklist says the affordances
   are part of the test rather than decoration. Writing's half of C9 -- the
   live word count -- shipped with the writing box; this is the reading half,
   and until now the passage was an inert blockquote.

   A highlight is stored as a character range inside one paragraph, never as a
   DOM range. The paragraph's text survives a reload; its nodes do not. */
const HL_KEY = "en8:marks:";
const NT_KEY = "en8:notes:";

/* The generated paragraph letter is inside the <p> and must not count toward
   any offset, or every highlight in a lettered passage lands one character
   late. */
const textWalker = p => document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
  acceptNode: n => n.parentElement && n.parentElement.closest(".pg-l")
    ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
});

function textLen(p){
  const w = textWalker(p);
  let n, total = 0;
  while ((n = w.nextNode())) total += n.nodeValue.length;
  return total;
}

/* Character offset of a (node, offset) boundary within the paragraph. */
function offsetIn(p, node, off){
  const w = textWalker(p);
  let n, total = 0;
  while ((n = w.nextNode())){
    if (n === node) return total + off;
    total += n.nodeValue.length;
  }
  return -1;
}

/* Character offset at which an element's own text starts. */
function offsetOfEl(p, el){
  const w = textWalker(p);
  let n, total = 0;
  while ((n = w.nextNode())){
    if (el.contains(n)) return total;
    total += n.nodeValue.length;
  }
  return -1;
}

function wrapRange(p, s, e){
  const w = textWalker(p);
  let n, off = 0, sn = null, so = 0, en = null, eo = 0;
  while ((n = w.nextNode())){
    const len = n.nodeValue.length;
    if (sn === null && off + len > s){ sn = n; so = s - off; }
    if (sn !== null && off + len >= e){ en = n; eo = e - off; break; }
    off += len;
  }
  if (!sn || !en) return;
  const r = document.createRange();
  r.setStart(sn, so); r.setEnd(en, eo);
  const m = document.createElement("mark");
  /* surroundContents throws when the range straddles an inline tag -- the
     passages carry <strong> and <em> -- so fall back to extract-and-insert,
     which handles a partial split. */
  try { r.surroundContents(m); }
  catch(err){ m.appendChild(r.extractContents()); r.insertNode(m); }
}

function initPassage(){
  (DATA.passage || []).forEach(p => {
    const root = document.querySelector('[data-passage="' + p.id + '"]');
    if (!root) return;
    const body = $('[data-pg="body"]', root);
    if (!body) return;
    const paras = $$("p", body);

    let marks = [];
    try { marks = JSON.parse(localStorage.getItem(HL_KEY + p.id) || "[]"); } catch(e){}
    const save = () => {
      try { localStorage.setItem(HL_KEY + p.id, JSON.stringify(marks)); } catch(e){}
    };

    /* Overlapping ranges are merged rather than nested. Highlighting over an
       existing highlight should widen it, not bury a <mark> in a <mark>. */
    const merge = () => {
      const by = {};
      marks.forEach(m => { (by[m.p] = by[m.p] || []).push(m); });
      marks = [];
      Object.keys(by).forEach(k => {
        let cur = null;
        by[k].sort((a, b) => a.s - b.s).forEach(m => {
          if (cur && m.s <= cur.e){ cur.e = Math.max(cur.e, m.e); return; }
          cur = { p:Number(k), s:m.s, e:m.e };
          marks.push(cur);
        });
      });
    };

    const paint = () => {
      paras.forEach((el, pi) => {
        $$("mark", el).forEach(m => { m.replaceWith.apply(m, m.childNodes); });
        el.normalize();
        /* Right to left, so an earlier range's offsets are not shifted by a
           later one's inserted element. */
        marks.filter(m => m.p === pi).sort((a, b) => b.s - a.s)
             .forEach(m => wrapRange(el, m.s, m.e));
      });
    };

    body.addEventListener("mouseup", () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return;
      const r = sel.getRangeAt(0);
      if (!body.contains(r.commonAncestorContainer)) return;
      /* Which paragraphs the selection touches, by comparing boundary points
         rather than by Selection.containsNode. containsNode is inconsistent
         across engines -- under test it reported every paragraph EXCEPT the
         selected one, which silently highlighted four whole paragraphs and
         not the phrase the reader had actually dragged over. Boundary
         comparison is defined arithmetic and behaves the same everywhere. */
      const touches = el => {
        const pr = document.createRange();
        pr.selectNodeContents(el);
        return r.compareBoundaryPoints(Range.END_TO_START, pr) < 0
            && r.compareBoundaryPoints(Range.START_TO_END, pr) > 0;
      };
      let added = false;
      paras.forEach((el, pi) => {
        if (!touches(el)) return;
        const len = textLen(el);
        const s = el.contains(r.startContainer) ? offsetIn(el, r.startContainer, r.startOffset) : 0;
        const e = el.contains(r.endContainer) ? offsetIn(el, r.endContainer, r.endOffset) : len;
        if (s < 0 || e < 0 || e <= s) return;
        marks.push({ p:pi, s:s, e:e });
        added = true;
      });
      if (!added) return;
      merge(); save(); paint();
      sel.removeAllRanges();
    });

    /* Selecting a highlight takes it off, which is how the real screen does
       it: the same gesture adds and removes. */
    body.addEventListener("click", ev => {
      const m = ev.target.closest("mark");
      if (!m) return;
      const el = m.closest("p"), pi = paras.indexOf(el);
      if (pi < 0) return;
      const s = offsetOfEl(el, m), e = s + m.textContent.length;
      if (s < 0) return;
      marks = marks.filter(x => !(x.p === pi && x.s < e && x.e > s));
      save(); paint();
    });

    const clear = $('[data-pg="clear"]', root);
    if (clear) clear.addEventListener("click", () => {
      marks = []; save(); paint();
    });

    const pad = $('[data-pg="notepad"]', root), note = $('[data-pg="note"]', root);
    const ta = $(".pg-ta", root);
    if (ta){
      try { ta.value = localStorage.getItem(NT_KEY + p.id) || ""; } catch(e){}
      if (ta.value && pad){ pad.hidden = false; if (note) note.setAttribute("aria-expanded", "true"); }
      ta.addEventListener("input", () => {
        try { localStorage.setItem(NT_KEY + p.id, ta.value); } catch(e){}
      });
    }
    if (note && pad) note.addEventListener("click", () => {
      pad.hidden = !pad.hidden;
      note.setAttribute("aria-expanded", String(!pad.hidden));
      if (!pad.hidden && ta) ta.focus();
    });

    paint();
  });
}

/* ---------------- the reading clock ---------------------------------------
   C7, and the last Group C rule this course left to the learner's discretion:
   one clock covering everything, the typing included (04 §1.1). It used to be
   prose -- "give yourself three minutes" -- which is the arrangement every
   other rule here exists to replace. When it runs out the unfinished reading
   answers stop taking input, exactly as the listening review window does;
   Check stays live, so whatever is written can still be marked. */
function initClock(){
  (DATA.clock || []).forEach(p => {
    const root = document.querySelector('[data-clock="' + p.id + '"]');
    if (!root) return;
    const btn = $(".c-start", root), state = $(".c-state", root);
    const KEY = "en8:clock:" + p.id;
    /* Everything below the clock and above the next timer -- not just the
       tasks labelled `reading`. The synonym-search that follows the passage is
       inside the reading block too, and a clock that claims to cover an
       exercise it does not stop is the loose instruction this replaced. But it
       stops at the listening player: see the note on `owned`. */
    const covered = () => owned(root);

    const timeUp = () => {
      state.innerHTML = "<b>Time.</b> Check what you have.";
      root.dataset.done = "1";
      covered().forEach(x => {
        if (x.dataset.done === "1") return;
        $$(".i-in, .i-opt input", x).forEach(y => { y.disabled = true; });
        x.dataset.timeup = "1";
      });
    };

    let spent = false;
    try { spent = !!JSON.parse(localStorage.getItem(KEY) || "null"); } catch(e){}
    if (spent){ btn.disabled = true; state.innerHTML = "<b>Already run.</b> One clock, once."; }

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      btn.disabled = true;
      try { localStorage.setItem(KEY, "true"); } catch(e){}
      root.dataset.running = "1";
      let left = p.secs;
      const show = () => {
        const m = Math.floor(left / 60), s = left % 60;
        state.textContent = m + ":" + String(s).padStart(2, "0") + " left";
      };
      show();
      const iv = setInterval(() => {
        left--;
        if (left <= 0){ clearInterval(iv); root.dataset.running = ""; timeUp(); return; }
        show();
      }, 1000);
    });
  });
}

/* ---------------- question navigation and the review flag -----------------
   The other half of C9: the real Reading screen carries a numbered question
   bar and a review flag, and 01 §12.7 lists them among the affordances a
   trainer has to match.

   It hangs off the clock rather than off the passage, because the clock is
   what defines a reading block -- exactly one per block, and the build fails
   if a reading lesson does not carry one. Questions are numbered across the
   whole block, the way the test numbers them across a section, rather than
   restarting at each exercise. */
const FLAG_KEY = "en8:flags:";

function initReadingNav(){
  (DATA.clock || []).forEach(p => {
    const root = document.querySelector('[data-clock="' + p.id + '"]');
    if (!root) return;
    const items = [];
    /* The same territory the clock times, for the same reason: a question bar
       that numbered the listening questions too would promise a learner they
       are inside the reading block when they are not. */
    owned(root).forEach(t => { $$(".i", t).forEach(li => items.push(li)); });
    if (!items.length) return;

    let flags = {};
    try { flags = JSON.parse(localStorage.getItem(FLAG_KEY + p.id) || "{}"); } catch(e){}
    const save = () => {
      try { localStorage.setItem(FLAG_KEY + p.id, JSON.stringify(flags)); } catch(e){}
    };

    const nav = document.createElement("div");
    nav.className = "c-nav";
    nav.innerHTML = '<p class="c-nl">Questions ' + 1 + "–" + items.length + "</p>"
      + '<div class="c-ns"></div>'
      + '<p class="c-nh">A number fills in when that question has an answer. '
      + 'Flag one with ⚑ beside it to come back to it — the flag is a marker, '
      + 'not an answer, and nothing about it is scored.</p>';
    root.appendChild(nav);
    const strip = $(".c-ns", nav);

    const answered = li => {
      const box = $(".i-in", li);
      if (box) return !!box.value.trim();
      return !!$(".i-opt input:checked", li);
    };

    const btns = items.map((li, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "c-q";
      b.textContent = String(i + 1);
      b.setAttribute("aria-label", "Go to question " + (i + 1));
      b.addEventListener("click", () => {
        li.scrollIntoView({ behavior:"smooth", block:"center" });
        const f = $(".i-in", li) || $(".i-opt input", li);
        if (f && !f.disabled) f.focus({ preventScroll:true });
      });
      strip.appendChild(b);

      /* The flag sits on the question, as it does on the real screen, and the
         bar reflects it. */
      const fl = document.createElement("button");
      fl.type = "button";
      fl.className = "i-flag";
      fl.textContent = "⚑";
      fl.title = "Flag for review";
      fl.setAttribute("aria-label", "Flag question " + (i + 1) + " for review");
      fl.setAttribute("aria-pressed", "false");
      fl.addEventListener("click", () => {
        flags[i] = !flags[i];
        save(); repaint();
      });
      li.appendChild(fl);
      return { b, fl, li };
    });

    function repaint(){
      btns.forEach((x, i) => {
        x.b.dataset.answered = answered(x.li) ? "1" : "0";
        const on = !!flags[i];
        x.b.dataset.flag = on ? "1" : "0";
        x.li.dataset.flag = on ? "1" : "0";
        x.fl.setAttribute("aria-pressed", String(on));
      });
    }

    items.forEach(li => {
      li.addEventListener("input", repaint);
      li.addEventListener("change", repaint);
    });
    repaint();
  });
}

function initThreads(){
  $$('[data-role="thread"][data-stage="check"]').forEach(root => {
    const got = $('[data-th="got"]', root), all = $('[data-th="all"]', root),
          out = $(".th-out", root);
    const key = "en8:thread:" + root.dataset.thread + ":"
              + (DATA.unit || "") + ":" + (DATA.lesson || "");
    try {
      const was = JSON.parse(localStorage.getItem(key) || "null");
      if (was){ got.value = was.got; all.value = was.all; }
    } catch(e){}
    const paint = () => {
      const g = Number(got.value), n = Number(all.value);
      if (!n || got.value === "" || all.value === ""){ out.textContent = ""; return; }
      out.textContent = g + " of " + n;
      try { localStorage.setItem(key, JSON.stringify({ got:g, all:n })); } catch(e){}
    };
    got.addEventListener("input", paint);
    all.addEventListener("input", paint);
    paint();
  });
}

/* ---------------- boot ---------------------------------------------------- */
function boot(){
  initTheme();
  initAnswers();
  initEntries();
  initLesson();
  paintProgress();
  initStart();
  initGate();
  paintReview();
  initTasks();
  initDialogue();
  initVocab();
  initFluency();
  initAudio();
  initPassage();
  initClock();
  initReadingNav();     // after initTasks: it numbers the items those render
  initWrite();
  initThreads();
  initSpeakButtons();
  onVoices = () => { initSpeakButtons(); };
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
