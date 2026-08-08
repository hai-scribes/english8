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

/* Fold UK and US spellings onto one form. Both the key and the learner's
   answer go through this, so a rule that over-fires (four -> for) can only
   ever accept something, never reject it — and the stoplist covers the
   common words where that would matter. */
const NOT_OUR = /^(four|your|hour|tour|pour|sour|flour|scour|dour)$/;
function fold(s){
  return norm(s).split(" ").map(w => w
    .replace(/practis/, "practic")          // before the -ise rule, or it eats it
    .replace(/^(.{2,})our$/, (m, a) => NOT_OUR.test(m) ? m : a + "or")
    .replace(/([^aeiou])re$/, "$1er")
    .replace(/is(e|ed|es|ing|ation)$/, "iz$1")
    .replace(/ll(ed|ing|er)$/, "l$1")
    .replace(/^programme$/, "program")
    .replace(/^grey$/, "gray")
  ).join(" ");
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
const rKey = (u, w) => u + ":" + String(w).toLowerCase();

/* Delayed retention, not in-session recall. An item only counts toward
   retention when it comes back after a real gap; nothing is ever marked
   "mastered" in the session that taught it. */
function schedule(unit, word, ok){
  const k = rKey(unit, word), t = todayNum();
  const r = REVIEW[k] || { due:t, seen:0, kept:0, delayed:0 };
  const gap = r.last === undefined ? 0 : t - r.last;
  if (gap >= REVIEW_DAYS){ r.delayed++; if (ok) r.kept++; }
  r.seen++;
  r.last = t;
  r.due = t + (ok ? REVIEW_DAYS : RELEARN_DAYS);
  REVIEW[k] = r;
  saveReview();
}
function dueItems(){
  const t = todayNum(), out = [];
  const all = (DATA.kind === "home" ? DATA.vocab : null);
  if (!all) return out;
  for (const u of Object.keys(all))
    for (const w of all[u]){
      const r = REVIEW[rKey(u, w.word)];
      if (r && r.due <= t) out.push(Object.assign({ _u:u }, w));
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
function buildItems(words, mode){
  const list = shuffle(words);
  return list.map((w, i) => {
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

function runEngine(mode, words, unit, hostSel){
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
    if (q.fmt === "mc"){
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
    if (q.fmt === "colloc" || q.fmt === "cloze" || q.fmt === "type" || q.fmt === "listen")
      note = '<p class="note small">Spelling counts, as it does in the real answer key. '
           + 'UK and US spellings are both accepted; two answers in one gap score nothing.</p>';
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
    schedule(q.w._u || st.unit, w.word, ok);
    if (st.mode === "test"){ st.i++; return paintQ(); }
    const why = res.why === "two"
      ? '<div class="n">Two answers in one gap score nothing, even when one of them is right.</div>'
      : (given && !ok ? '<div class="n">You wrote: ' + esc(given) + '</div>' : "");
    host.innerHTML = chrome(
      '<div class="verdict ' + (ok ? "ok" : "no") + '">'
      + '<b>' + (ok ? "Correct" : "Not quite") + '</b>'
      + '<div>' + esc(w.word) + ' — ' + esc(w.vi) + '</div>' + why + '</div>'
      + (w.colloc ? '<p class="note small"><b>Goes with:</b> ' + w.colloc.map(esc).join(" · ") + '</p>' : "")
      + (canListen() ? '<div class="row"><button class="speak" data-say="' + esc(sayWord(w)) + '">🔊 Hear it</button>'
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
    if (st.mode === "test" && st.unit){
      const r = unitRec(st.unit);
      const pct = Math.round(st.right / total * 100);
      if (!r.test || pct > r.test.best) r.test = { best:pct, at:Date.now() };
      saveProg();
    }
    const ret = retention();
    const names = [];
    for (const x of st.wrong) if (!names.includes(x.q.w.word)) names.push(x.q.w.word);
    const missed = names.length
      ? '<div class="note"><b>Back tomorrow:</b> ' + names.map(esc).join(" \u00b7 ") + '</div>'
      : '<div class="note">Every item right. They are scheduled to come back in '
        + REVIEW_DAYS + ' days.</div>';
    host.innerHTML = '<div class="card engine"><h2>'
      + (st.mode === "test" ? "Unit test — result" : MODE_LABEL[st.mode] + " finished") + '</h2>'
      + '<p class="score-line"><b>' + st.right + ' of ' + total + '</b> right in this session.</p>'
      + calibrationLine()
      + (ret.checked
          ? '<p class="note"><b>Kept after a week:</b> ' + ret.kept + ' of ' + ret.checked
            + ' items were still right when they came back after a real gap. That number is the one '
            + 'that means something — anything you can still do at the end of a session, you can do.</p>'
          : '<p class="note">Come back in ' + REVIEW_DAYS + ' days and these items will be waiting. '
            + 'What you can recall after a gap is the only recall worth counting, so nothing is marked '
            + 'learned today.</p>')
      + missed
      + '<p class="note small">This is a score on our own practice, not a measure of your English, '
      + 'and it is not convertible into an IELTS band — no published table converts anything into one. '
      + 'The review interval above is our engineering choice: spacing beats cramming, but no research '
      + 'names a number of days.</p>'
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

/* ---------------- boot ---------------------------------------------------- */
function boot(){
  initTheme();
  initAnswers();
  initEntries();
  initLesson();
  paintProgress();
  initGate();
  paintReview();
  initSpeakButtons();
  onVoices = () => { initSpeakButtons(); };
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
