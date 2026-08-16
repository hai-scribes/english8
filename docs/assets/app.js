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

/* ---------------- the story, read straight through -----------------------
   Two findings from `09` §2.2 are built into this rather than written on it.

   Text choice is LIMITED: a chapter opens only when that unit's Lesson 1 is
   done. That is not a lock on content — the same words are already on the
   lesson page, in pieces. It stops chapter 12 spoiling unit 12, and
   level-limited choice is the moderator worth d = 0.73 against d = 0.22.

   Reading is ACCOUNTED FOR: a chapter is marked read and the count shows here
   and on the home page. Unaccountable reading measured d = 0.01, which is not
   significantly different from doing nothing. The log IS the intervention.

   What it must never become: a score, a band, a reading rate, a
   words-per-minute, a streak or a comparison with anyone. It counts chapters
   and words and stops there. */
const S_KEY = "en8:story:v1";
let STORY = (() => {
  try { return JSON.parse(localStorage.getItem(S_KEY)) || {}; } catch(e){ return {}; }
})();
function saveStory(){
  try { localStorage.setItem(S_KEY, JSON.stringify(STORY)); } catch(e){}
}
/* Open when that unit's first lesson is done — the lesson carrying the
   dialogue the chapter opens with. */
const chapterOpen = nn => lessonDone(nn, 1);

function storyCounts(){
  const chs = DATA.chapters || [];
  let read = 0, open = 0, words = 0;
  for (const c of chs){
    if (chapterOpen(c.nn)) open++;
    if (STORY[c.nn]){ read++; words += c.words; }
  }
  return { read, open, words };
}

function paintStoryCounts(){
  const c = storyCounts();
  for (const el of $$("[data-story-read]")) el.textContent = c.read;
  for (const el of $$("[data-story-open]")) el.textContent = c.open;
  for (const el of $$("[data-story-words]")) el.textContent = c.words.toLocaleString();
}

function initStory(){
  if (DATA.kind !== "story") return;
  const cards = $$(".sc-card"), locked = $("#scLocked");
  let anyOpen = false;

  for (const card of cards){
    const nn = card.dataset.chapter, open = chapterOpen(nn);
    card.setAttribute("aria-disabled", open ? "false" : "true");
    card.disabled = !open;
    if (open) anyOpen = true;
    $(".st", card).textContent =
      STORY[nn] ? "read" : (open ? "" : "opens after Lesson 1");
    card.classList.toggle("is-read", !!STORY[nn]);
  }
  if (locked) locked.hidden = anyOpen;

  const show = nn => {
    for (const art of $$(".sc-ch")) art.hidden = art.dataset.chapter !== nn;
    const art = $('.sc-ch[data-chapter="' + nn + '"]');
    if (!art) return;
    art.setAttribute("tabindex", "-1");
    art.focus({ preventScroll: true });
    /* Guarded: jsdom has no layout, so scrollIntoView is undefined there and
       an unguarded call throws out of the handler before anything after it
       runs. The gate that exercises this page runs under jsdom. */
    if (typeof art.scrollIntoView === "function"){
      art.scrollIntoView({ block: "start", behavior:
        matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  };

  for (const card of cards){
    card.addEventListener("click", () => {
      if (!card.disabled) show(card.dataset.chapter);
    });
  }

  for (const btn of $$(".sc-done")){
    const nn = btn.dataset.chapter;
    if (STORY[nn]) btn.textContent = "Read — undo";
    btn.addEventListener("click", () => {
      if (STORY[nn]) delete STORY[nn]; else STORY[nn] = Date.now();
      saveStory();
      const said = btn.parentElement.querySelector(".sc-said");
      if (said) said.textContent = STORY[nn] ? "Marked as read." : "";
      btn.textContent = STORY[nn] ? "Read — undo" : "I have read this chapter";
      const card = $('.sc-card[data-chapter="' + nn + '"]');
      if (card){
        card.classList.toggle("is-read", !!STORY[nn]);
        $(".st", card).textContent = STORY[nn] ? "read" : "";
      }
      paintStoryCounts();
    });
  }
  paintStoryCounts();
}

/* The home page carries the same count but not the chapter list, so it counts
   the log directly rather than joining against DATA.chapters. */
function paintStoryHome(){
  if (DATA.kind !== "home") return;
  const n = Object.keys(STORY).length;
  for (const el of $$("[data-story-read]")) el.textContent = n;
}

/* ---------------- the word lookup ----------------------------------------
   A lookup, not a trainer: it filters and it stops. Deliberate study of these
   words is the practice engine's job, where they are asked as collocations and
   scheduled; a second unscheduled trainer here would compete with the one the
   evidence actually shaped.

   Diacritics are folded on BOTH sides. The learner is Vietnamese and may be
   typing on a keyboard with no Vietnamese layout — "thoi gian ranh" has to
   find "thời gian rảnh", or the Vietnamese half of every entry is unreachable
   for exactly the people it was written for. đ/Đ is folded by hand because it
   is a distinct letter, not a base letter plus a combining mark, so NFD leaves
   it alone. */
function foldSearch(s){
  return String(s).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d");
}

function initWords(){
  if (DATA.kind !== "words") return;
  const q = $("#wdQ"), rows = $$(".wd-row"), none = $("#wdNone"),
        count = $(".wd-count");
  if (!q) return;
  /* Folded once at start-up rather than per keystroke: 411 rows × a normalize()
     each is wasted work on every character typed. */
  const hay = rows.map(r => foldSearch(r.dataset.hay || ""));
  const say = n => {
    if (count) count.textContent =
      n === rows.length ? rows.length + " words" : n + " of " + rows.length;
  };

  const run = () => {
    const term = foldSearch(q.value).trim();
    if (!term){
      for (const r of rows) r.hidden = false;
      if (none) none.hidden = true;
      say(rows.length);
      return;
    }
    let n = 0;
    for (let i = 0; i < rows.length; i++){
      const hit = hay[i].includes(term);
      rows[i].hidden = !hit;
      if (hit) n++;
    }
    if (none) none.hidden = n > 0;
    say(n);
  };

  q.addEventListener("input", run);
  run();
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

/* `alive` is optional and only matters to a caller that can be interrupted.
   cancel() empties the queue but cannot reach a speak() that has not happened
   yet, and this runs the next line off a timer — so a caller that stops mid
   sequence would still get one more line out loud about 60ms later. The
   predicate is checked at the two points where that timer lands. */
function speakSeq(lines, onEnd, alive){
  const live = () => (typeof alive !== "function" || alive());
  if (!canListen()){ onEnd(false); return; }
  try { speechSynthesis.cancel(); } catch(e){}
  let i = 0;
  const next = () => {
    if (!live()) return;
    if (i >= lines.length){ onEnd(true); return; }
    const u = new SpeechSynthesisUtterance(lines[i++]);
    u.voice = TTS.voice; u.lang = TTS.voice.lang; u.rate = RATE_NORMAL;
    u.onend = next;
    u.onerror = ev => {
      const err = ev && ev.error;
      if (err === "interrupted" || err === "canceled") return;
      TTS.failed = true; if (live()) onEnd(false);
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
   neither touch nor a keyboard. The gloss opens AFTER the line rather than
   inside it, so revealing one never reflows the sentence being read. One at a
   time, and Escape closes.

   Support here, withdrawal later — the same items come back bare in the later
   lessons and in the spaced review. That is the whole mechanism, and the half
   the build could most easily have shipped alone.

   Glosses are wired per SCOPE rather than once per dialogue, because the same
   marked word exists twice on a staged page: once in the transcript and once
   in the speech bubble it is currently being spoken in. Both have to work, and
   they cannot share a DOM id. */
function wireGlosses(scope, glosses, prefix){
  let open = null;
  const shut = btn => {
    btn.setAttribute("aria-expanded", "false");
    const g = document.getElementById(btn.getAttribute("aria-controls"));
    if (g) g.hidden = true;
    open = null;
  };
  $$(".gl", scope).forEach((btn, i) => {
    const d = glosses[Number(btn.dataset.g)];
    if (!d) return;
    const id = prefix + "-g" + i;
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
    /* After the block the word sits in, so opening one never moves the line
       the reader is on. Inside a comic that block is the whole balloon, not
       the text inside it: a gloss opening INSIDE a balloon would have to be
       drawn in a contour that was cut for two lines of speech, and inside a
       shout balloon it would be clipped by the spikes. */
    const host = btn.closest(".d-bub") || btn.closest("p")
              || btn.closest(".d-said") || scope;
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
  scope.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && open) shut(open);
  });
}

function initDialogue(){
  (DATA.dialogue || []).forEach(p => {
    const root = document.querySelector('[data-dialogue="' + p.id + '"]');
    if (!root) return;
    wireGlosses($(".d-body", root) || root, p.glosses || [], p.id);
    if (p.staged) initScene(root, p);
    initDialogueAudio(root, p);
  });
}

/* ---------------- hearing the conversation --------------------------------
   The prescribed book's Getting Started is a recording in every one of the
   twelve units; ours was text and a comic, so a learner working alone reached
   the Lesson 6 listening never having heard these people speak.

   Replayable, unlike the :::audio player. C6 and C8 bind the listening TEST —
   one play, declared timing, an orientation that is not written down. This is
   a reading text whose transcript is deliberately on the page: 1.2 tells the
   learner to find a phrase "in the dialogue" and 1.3 sends them back for a
   verb. Playing it once would not turn it into a listening test; it would just
   make it a worse reading page.

   The panel follows the voice when the comic is on screen, through the scene's
   own show(), because a picture that sits still while the words move is worse
   than no picture. Everything is torn down on a second press, and the sequence
   checks it is still the current run before touching the DOM — otherwise a
   stop-then-start leaves two narrators driving one stage. */
/* THE PANEL LIST, and there is exactly one of it. A beat pairs two short lines
   so a phone reader is not tapping once a sentence, and on a 3:2 frame that is
   right. On a phone the frame is square and about 285px across: two balloons
   have to share it side by side, so a long line gets a twelve-character
   measure, runs to fourteen lines and ends up either over the other speaker's
   balloon or over their face. Every other lever — smaller type, shorter
   figures, pushing the balloons apart — buys twenty pixels against a shortfall
   of a hundred. The panel does not hold two, so on a phone it holds one.

   Safe to cut anywhere, because a stage direction already breaks a beat: the
   lines inside one share a background, a roster and a set of props, and each
   line carries its own copy of all three.

   It lives here, above both callers, because the comic and the narrator that
   drives it must agree about what a panel IS. They each derived their own beat
   list once, and on a phone the narrator then asked for panel three of its
   fourteen while the comic was holding twenty-six — so pressing play jumped the
   reader into the wrong half of the scene. Read once per page load rather than
   re-read on resize, because re-splitting mid-story would renumber the panel
   the reader is looking at. */
function panelBeats(p){
  const raw = (p.beats && p.beats.length) ? p.beats : p.lines.map((_, i) => [i]);
  const narrow = typeof matchMedia === "function"
              && matchMedia("(max-width: 34rem)").matches;
  return narrow ? raw.reduce((out, g) => out.concat(g.map(j => [j])), []) : raw;
}

function initDialogueAudio(root, p){
  const btn = $(".d-hear", root);
  if (!btn) return;
  if (!canListen()){ const box = $(".d-audio", root); if (box) box.hidden = true; return; }
  const said = $(".d-heard", root);
  const beats = panelBeats(p);
  let run = 0;

  const plain = html => {
    const d = document.createElement("div");
    d.innerHTML = html;
    return (d.textContent || "").replace(/\s+/g, " ").trim();
  };

  const stop = () => {
    run++;
    try { speechSynthesis.cancel(); } catch(e){}
    btn.innerHTML = "&#9654; Hear the conversation";
    if (said) said.textContent = "";
  };

  btn.addEventListener("click", () => {
    if (btn.dataset.on === "1"){ btn.dataset.on = "0"; stop(); return; }
    btn.dataset.on = "1";
    const mine = ++run;
    primeSpeech();
    btn.innerHTML = "&#9632; Stop";
    let b = 0;
    const nextBeat = () => {
      if (mine !== run) return;                 // a newer run owns the stage
      if (b >= beats.length){ btn.dataset.on = "0"; stop(); return; }
      const idx = b++;
      if (root._scene) root._scene.show(idx);
      if (said) said.textContent = "Panel " + (idx + 1) + " of " + beats.length;
      const lines = beats[idx].map(j => plain(p.lines[j].html)).filter(Boolean);
      if (!lines.length){ nextBeat(); return; }
      speakSeq(lines, ok => {
        if (mine !== run) return;
        if (!ok){ btn.dataset.on = "0"; stop(); return; }
        nextBeat();
      }, () => mine === run);
    };
    nextBeat();
  });
}

/* ---------------- the dialogue as a comic ---------------------------------
   A background, the people in the scene, the things in it, the manga overlays
   and the balloons — one panel, advanced by the reader.

   THE PANEL IS NOT DRIVEN BY SCROLL, and that is a change from what this used
   to be. The stage was sticky inside a tall track and stepped as the reader
   scrolled past it. It worked, and the reason it was still wrong only shows up
   in use: the reader has two things to move through — the page and the story —
   and that design put both on one gesture. Scrolling down to the exercise
   underneath ran the story on; scrolling back to re-read a line landed the
   panel somewhere else. The comic now has its own controls and the scroll
   position means nothing to it, which is also why nothing in this file listens
   for scroll, wheel or touchmove any more. There is no longer a relationship
   to hijack.

   Everything here is an ENHANCEMENT over the transcript, which is real markup
   underneath and stays reachable. Exercise 1.2 asks the learner to find a
   phrase "in the dialogue" and 1.3 sends them back to look at a verb; neither
   is answerable one panel at a time, and a comic that hid the text would have
   broken the two exercises the dialogue exists to feed. */
const ASSET_BG = "assets/bg/";
const ASSET_PROP = "assets/props/";
const ASSET_FX = "assets/fx/";
/* WebP, not PNG, and measured rather than assumed: the six-panel sheet is
   1008 KB as RGBA PNG and 209 KB at WebP q90, indistinguishable at 2x zoom.
   The art has soft shading, so palette PNG — the usual answer for cel art —
   speckles the hair and rings the cheek blush. See tools/make_sheet.py. */
const ASSET_CAST = "assets/cast/";

/* ---------------- every balloon is a drawn contour --------------------------
   NO BALLOON IS A BOX ANY MORE, and that is the change everything below
   follows from. Three versions of this have been wrong; the third is the one
   worth naming, because it looked finished.

   1. **Two clip-path polygons**, ink outside and white inset by `margin:3px`,
      on the theory that the gap reads as an outline. It cannot: a percentage
      polygon resolves against its OWN box, so shrinking the box scales the
      whole shape rather than insetting it, and near a spike — where the
      contour runs nearly parallel to the shrink — the white overshot the black
      and the outline vanished. It shipped with a contour that came and went.

   2. **One fixed path, stretched** with `preserveAspectRatio="none"`. Even
      outline, wrong for a different reason: a balloon is as wide as its text,
      so the stretch was severe, and a star squashed to 3:1 is a row of
      horizontal shards.

   3. **A path built to the box, but only for the two loud shapes.** Ordinary
      speech — which is nearly every line in the book — stayed a
      `border-radius:1.15rem` rectangle with a CSS border-triangle stuck under
      it. That is the version this replaces, and the fault is not a number
      anywhere: a rounded rectangle is a *label*, and a comic that labels its
      dialogue has stopped being a comic. The tell is that no amount of tuning
      helps, because there is no radius at which a rectangle becomes a balloon.

   So the contour is a curve for every kind, generated from the block of text
   it has to hold. Three things below do the work and they are separable on
   purpose: `ovoidSamples` says what the outline is, `contourPath` says how it
   is drawn, and `tailPath` says how it reaches the person speaking.

   The outline is a superellipse rather than an ellipse. An ellipse through the
   four corners of a w x h block is w*sqrt(2) wide — it overshoots the words by
   41% and looks inflated. Raising the exponent squares the shoulders slightly:
   at n = 2.7 the same block needs about 29%, which is the difference between a
   balloon and a bubble. On top of that runs a slow two- and three-cycle swell
   seeded from the line itself, so no two balloons in a panel share a silhouette
   and the same line always draws the same one — a contour that re-randomised
   on every relayout would boil under a resize. */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* Seeded from the text, so a balloon's wobble is a property of the line rather
   than of when it was drawn. */
function hashSeed(str){
  let h = 2166136261;
  for (let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededRandom(seed){
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

const SUPER_N = 2.7;   /* the shoulder of the outline — see the note above */

/* Points around the contour, walked clockwise in screen coordinates from the
   right-hand side. `n` is chosen by the caller from the perimeter, so a lobe or
   a spike keeps a constant SIZE and only its count changes with the balloon —
   which is how a letterer's hand works and why one big balloon does not come
   out with the same twelve teeth as a small one. */
function ovoidSamples(cw, ch, n, rnd){
  const a = cw / 2, b = ch / 2;
  const p1 = rnd() * 6.2832, p2 = rnd() * 6.2832, p3 = rnd() * 6.2832;
  /* Three times what it was. A 3% wobble on a 240px balloon is a two-pixel
     deviation — below the stroke weight, so the contour came out as a machined
     ellipse and read, correctly, as a rounded box with the corners taken off.
     A drawn balloon is visibly lopsided: one shoulder higher than the other,
     one side fuller. The first harmonic is what does that, and it is the one
     that was missing. */
  const a0 = 0.042 + rnd() * 0.026;      /* lopsided */
  const a1 = 0.034 + rnd() * 0.022;      /* fuller on one side */
  const a2 = 0.020 + rnd() * 0.014;
  const a3 = 0.010;
  /* THE WOBBLE ONLY EVER PUSHES OUTWARD, and that is not a stylistic choice —
     it is what makes the fit above sound. The contour is solved so that every
     line of type clears a nominal superellipse; a wobble that swings both ways
     then puts the drawn curve up to a seventh INSIDE that nominal shape,
     wherever it happens to pinch, and the words cross their own outline on
     whichever side the seed decided to pinch. Measured: 27px of air on the left
     of a balloon and 10px on the right, same balloon, same line.

     So the sum is shifted into [0, 2D] rather than [-D, +D]. The contour still
     swells unevenly — one shoulder higher, one side fuller, which is the whole
     point — but it never cuts in past the shape the words were fitted to. */
  const D = a0 + a1 + a2 + a3;
  const out = [];
  for (let i = 0; i < n; i++){
    const t = i / n * Math.PI * 2;
    const ct = Math.cos(t), st = Math.sin(t);
    const k = Math.pow(Math.pow(Math.abs(ct), SUPER_N)
                     + Math.pow(Math.abs(st), SUPER_N), -1 / SUPER_N);
    const swing = a0 * Math.sin(t + p1)
                + a1 * Math.sin(2 * t + p2)
                + a2 * Math.sin(3 * t + p3)
                + a3 * Math.sin(5 * t + p1 * 1.7);
    const wob = 1 + (swing + D) * 0.62;
    out.push({ x: a + a * k * ct * wob, y: b + b * k * st * wob, t });
  }
  return out;
}

const P = v => v.toFixed(1);

/* THE OVOID ITSELF: a Catmull-Rom spline through the samples, emitted as
   cubics. Open, because
   the tail's mouth is a GAP in the contour rather than something drawn on top
   of it: the balloon's outline stops at one side of the mouth and the tail's
   outline starts there, so the two strokes join end to end into one continuous
   contour. Painting a closed balloon over a closed tail cannot do that — the
   balloon's own stroke draws a line straight across the tail's opening. */
function ovoidPath(pts, from, count){
  const n = pts.length, at = i => pts[((i % n) + n) % n];
  let d = "M" + P(at(from).x) + " " + P(at(from).y);
  for (let i = 0; i < count; i++){
    const p0 = at(from + i - 1), p1 = at(from + i),
          p2 = at(from + i + 1), p3 = at(from + i + 2);
    d += " C" + P(p1.x + (p2.x - p0.x) / 6) + " " + P(p1.y + (p2.y - p0.y) / 6)
       + " " + P(p2.x - (p3.x - p1.x) / 6) + " " + P(p2.y - (p3.y - p1.y) / 6)
       + " " + P(p2.x) + " " + P(p2.y);
  }
  return d;
}

/* Scallops: an outward arc between each pair of samples. Sweep 1 bulges away
   from the centre because the walk is clockwise on a screen, where y counts
   downward. */
function scallopThrough(pts, from, count){
  const n = pts.length, at = i => pts[((i % n) + n) % n];
  let d = "M" + P(at(from).x) + " " + P(at(from).y);
  for (let i = 0; i < count; i++){
    const p1 = at(from + i), p2 = at(from + i + 1);
    /* Just over the chord's half-length, so each lobe is most of a semicircle.
       A bigger radius is a FLATTER arc, which is the counter-intuitive part and
       the reason the cloud read as a bumpy oval: the sagitta falls as the radius
       rises, so widening it to make the lobes "rounder" flattened them. */
    const r = Math.hypot(p2.x - p1.x, p2.y - p1.y) / 2 * 1.08;
    d += " A" + P(r) + " " + P(r) + " 0 0 1 " + P(p2.x) + " " + P(p2.y);
  }
  return d;
}

/* A burst. The spikes alternate length because an even row of teeth is a saw,
   not a shout, and each flank is a quadratic rather than a straight line so the
   contour still reads as drawn by a hand. */
function burstThrough(pts, from, count, amp, cx, cy){
  const n = pts.length, at = i => pts[((i % n) + n) % n];
  let d = "M" + P(at(from).x) + " " + P(at(from).y);
  for (let i = 0; i < count; i++){
    const p1 = at(from + i), p2 = at(from + i + 1);
    const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
    let nx = mx - cx, ny = my - cy;
    const L = Math.hypot(nx, ny) || 1;
    const k = amp * ((from + i) % 2 ? 1 : 0.62);
    const tx = mx + nx / L * k, ty = my + ny / L * k;
    /* out to the point, then back — two curves per spike, so the flanks bow */
    d += " Q" + P(p1.x + (tx - p1.x) * 0.55 - ny / L * k * 0.16) + " "
              + P(p1.y + (ty - p1.y) * 0.55 + nx / L * k * 0.16) + " "
              + P(tx) + " " + P(ty)
       + " Q" + P(p2.x + (tx - p2.x) * 0.55 + ny / L * k * 0.16) + " "
              + P(p2.y + (ty - p2.y) * 0.55 - nx / L * k * 0.16) + " "
              + P(p2.x) + " " + P(p2.y);
  }
  return d;
}

/* How the four kinds differ, in one table.

   `gap` is how many samples the tail's mouth takes out of the contour — zero
   for a thought, whose trail of bubbles is detached and whose cloud is
   therefore closed all the way round. `pitch` is the target spacing between
   samples, which is what keeps a lobe the same size on a big balloon and a
   small one. `amp` is the spike height for a burst and is ignored otherwise. */
/* THE SWELL IS SMALLER THAN THE MATHS SAYS, and that is the correction that
   makes these read as lettering rather than as bubbles. An ellipse through the
   four corners of a w x h block is 1.41 x its size; a superellipse at n = 2.7 is
   1.30. Both numbers circumscribe the block's CORNERS — and in a lens-shaped
   stack the corners are empty, because the first and last lines are the short
   ones. Padding to them puts a hand's width of white round two lines of speech,
   which is what made every balloon look inflated and pushed its mass up into the
   sky away from the head it belongs to.

   So the swell is set to clear the INK rather than the box, and the floor under
   it is the letterer's own rule: one capital of the dialogue font fits in the
   gap between the stack and the contour, anywhere round it, and no more. */
const BUB_KIND = {
  say:     { pitch: 13, gap: 3, draw: "spline", swellW: 1.13, swellH: 1.26 },
  whisper: { pitch: 13, gap: 3, draw: "spline", swellW: 1.12, swellH: 1.24 },
  shout:   { pitch: 22, gap: 3, draw: "burst",  swellW: 1.16, swellH: 1.30,
             share: 0.20, max: 18 },
  think:   { pitch: 31, gap: 0, draw: "scallop", swellW: 1.15, swellH: 1.28 },
};

/* The contour and the tail, built together because the tail's mouth is a hole
   in the contour and neither is decidable without the other.

   `aim` is where the tail is going, in the contour's own coordinates. Returns
   the two path strings and the drawn extent, which the caller needs to size the
   svg: a spike or a lobe hangs outside the box the words occupy, and a tail
   hangs a long way outside it. */
function balloonPaths(kind, cw, ch, aim, seed, hand){
  const spec = BUB_KIND[kind] || BUB_KIND.say;
  const cx = cw / 2, cy = ch / 2;
  const rnd = seededRandom(seed);
  const perim = Math.PI * ((cw + ch) / 2) * 1.05;
  const n = clamp(Math.round(perim / spec.pitch), 12, 44);
  const pts = ovoidSamples(cw, ch, n, rnd);
  const amp = kind === "shout"
    ? clamp(Math.min(cw, ch) * spec.share, 8, spec.max) : 0;

  /* Where the tail leaves. A balloon sits above its speaker, so the mouth wants
     to be underneath it; the angle is allowed to lean toward the head but never
     to climb into the top half, where a tail would read as somebody else's. */
  /* AND IT COMES OUT OF ONE SIDE. A mouth placed dead on the line to the
     speaker gives a symmetrical tail, and a symmetrical tail has no handedness
     for the bow to mirror — measured, the sweep either way was two to four
     pixels on a fifty-pixel tail, swamped by the run along the contour. A
     letterer brings the tail out of the side of the balloon nearer the speaker
     and curves it in. That offset is the signal; the bow follows it. */
  let ang = Math.atan2(aim.y - cy, aim.x - cx);
  ang = clamp(ang + (hand || 1) * 0.34, 0.55, Math.PI - 0.55);
  /* The mouth is a WIDTH, not a sample count. Three samples off a small
     balloon is a narrow tail and off a large one is a funnel, because the
     sample spacing is fixed and the count is not — so the tail came out thick
     on exactly the balloons that carry the most text. Set the chord instead
     and let the count follow it. */
  const chord = clamp(cw * 0.055, 7, 14);
  const gap = spec.gap ? clamp(Math.round(chord / (perim / n)), 1, 4) : 0;
  const centre = Math.round(ang / (Math.PI * 2) * n);
  const i1 = centre - Math.ceil(gap / 2), i2 = i1 + gap;
  const at = i => pts[((i % n) + n) % n];

  const from = gap ? i2 : 0;
  const count = gap ? n - gap : n;
  let body;
  if (spec.draw === "burst") body = burstThrough(pts, from, count, amp, cx, cy);
  else if (spec.draw === "scallop") body = scallopThrough(pts, from, count);
  else body = ovoidPath(pts, from, count);
  if (!gap) body += " Z";

  /* The direction the contour is TRAVELLING at each side of the mouth. The
     tail leaves along it, so the outline runs on without a corner. */
  const tangent = i => {
    const a = at(i - 1), b = at(i + 1);
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    return { x: dx / L, y: dy / L };
  };
  const tail = tailPath(kind, at(i1), at(i2), aim, cx, cy, cw, ch,
                        tangent(i1), tangent(i2), hand);

  /* The extent has to cover the spikes and the tail, because the svg is sized
     to it and anything outside is not drawn. */
  /* A scallop bulges outside the sample ring by about a third of the spacing
     between samples — the same allowance a spike needs, arrived at differently. */
  const out = Math.max(amp, spec.draw === "scallop" ? perim / n * 0.36 : 0);
  let x0 = 0, y0 = 0, x1 = cw, y1 = ch;
  for (const p of pts){
    x0 = Math.min(x0, p.x - out); y0 = Math.min(y0, p.y - out);
    x1 = Math.max(x1, p.x + out); y1 = Math.max(y1, p.y + out);
  }
  x0 = Math.min(x0, aim.x - 8); y0 = Math.min(y0, aim.y - 8);
  x1 = Math.max(x1, aim.x + 8); y1 = Math.max(y1, aim.y + 8);
  return { body, tail, ext: { x0, y0, x1, y1 } };
}

/* The tail. A letterer's tail is a curved sliver that tapers to a point and
   stops somewhere between half and two thirds of the way to the mouth — it does
   not have to touch the face, and it should not, because a tail that lands on a
   chin reads as a pointer. What it must not be is the thing this replaces: a
   fixed eight-pixel CSS border-triangle, which is the same size whether it has
   four pixels to cross or ninety, and at ninety it is a stub under a floating
   box.

   A thought does not get a sliver at all. Its trail of shrinking bubbles is the
   one balloon convention a reader decodes with no instruction, and it aims at
   the head rather than the mouth. */
function tailPath(kind, r1, r2, aim, cx, cy, cw, ch, t1, t2, hand){
  if (kind === "think"){
    /* The trail starts OUTSIDE the cloud. Spacing it as a fraction of the whole
       distance from the cloud's CENTRE put the first bubble inside the balloon,
       sitting on top of a word — which is what "knows (o) is not true" was. So
       the run begins at the contour's own edge along the line to the thinker,
       and only then walks down towards them. */
    let ux = aim.x - cx, uy = aim.y - cy;
    const L = Math.hypot(ux, uy) || 1;
    ux /= L; uy /= L;
    const rE = 1 / Math.hypot(ux / (cw / 2), uy / (ch / 2));
    const run = Math.max(10, L - rE);
    let d = "";
    for (let i = 0; i < 3; i++){
      const f = rE + 7 + run * (i / 2.6);
      const bx = cx + ux * f, by = cy + uy * f;
      const rr = 7.5 - i * 2.1;
      d += " M" + P(bx - rr) + " " + P(by)
         + " A" + P(rr) + " " + P(rr) + " 0 1 0 " + P(bx + rr) + " " + P(by)
         + " A" + P(rr) + " " + P(rr) + " 0 1 0 " + P(bx - rr) + " " + P(by) + " Z";
    }
    return d.trim();
  }
  const mx = (r1.x + r2.x) / 2, my = (r1.y + r2.y) / 2;
  let dx = aim.x - mx, dy = aim.y - my;
  const L = Math.hypot(dx, dy) || 1;
  dx /= L; dy /= L;
  /* THE FLANKS LEAVE ALONG THE CONTOUR AND SWEEP TO ONE SIDE. What this
     replaces was two cubics whose control points ran straight at the tip, which
     on a short tail is a triangle with a kink where it meets the balloon — the
     outline arrives round the curve and then turns a corner. Reading it at four
     times size, that corner is most of why the tail looked thick and blunt: a
     wedge stuck on, rather than a stroke coming off.

     Two things fix it and they are separable. The root controls run along the
     contour's own tangent, so the outline continues rather than turning; and
     the bow lives entirely in the controls near the POINT, so the sliver leans
     to one side as it tapers instead of being skewed bodily sideways. Which
     side is `hand`, taken from where the speaker is standing. */
  const px = -dy, py = dx;              /* across the tail */
  const k = L * 0.30;                   /* how far the flanks run along the curve */
  const back = L * 0.34;                /* control distance back from the point */
  const bow = -hand * L * 0.62;         /* the sweep, all of it near the point */
  const c1x = r1.x + t1.x * k, c1y = r1.y + t1.y * k;
  const c2x = aim.x - dx * back + px * bow,
        c2y = aim.y - dy * back + py * bow;
  const c3x = aim.x - dx * back * 0.78 + px * bow * 0.42,
        c3y = aim.y - dy * back * 0.78 + py * bow * 0.42;
  const c4x = r2.x - t2.x * k, c4y = r2.y - t2.y * k;
  return "M" + P(r1.x) + " " + P(r1.y)
       + " C" + P(c1x) + " " + P(c1y) + " " + P(c2x) + " " + P(c2y)
              + " " + P(aim.x) + " " + P(aim.y)
       + " C" + P(c3x) + " " + P(c3y) + " " + P(c4x) + " " + P(c4y)
              + " " + P(r2.x) + " " + P(r2.y);
}

/* Narration is the one thing that stays a rectangle, and deliberately: a
   caption is not a balloon, nobody is saying it, and its lines are set even and
   block-like — which is the exact stack that is wrong inside an oval. */
function balloonHTML(kind, inner){
  if (kind === "narrate")
    return '<div class="d-said"><div class="d-txt">' + inner + "</div></div>";
  /* The paths are empty until the words have been measured. A placeholder would
     be drawn at the wrong size for one frame, and a balloon that visibly
     changes shape after it appears is worse than one that arrives a frame
     late. */
  return '<div class="d-said is-shaped">'
       + '<svg class="d-shape" aria-hidden="true" focusable="false">'
       + '<path class="d-body-path" d=""/><path class="d-tail" d=""/></svg>'
       + '<div class="d-txt">' + inner + "</div></div>";
}


function initScene(root, p){
  const scene = $(".d-scene", root), body = $(".d-body", root),
        toggle = $(".d-toggle", root);
  if (!scene || !toggle) return;
  const stage = $(".d-stage", scene), bg = $(".d-bg", scene),
        cast = $(".d-cast", scene), bubble = $(".d-bubble", scene),
        propBack = $(".d-prop-back", scene), propFront = $(".d-prop-front", scene),
        fxLayer = $(".d-fx", scene), count = $(".d-count", scene),
        rail = $(".d-rail-fill", scene), full = $(".d-full", scene),
        sr = $(".d-sr", scene),
        prev = $(".d-prev", scene), next = $(".d-next", scene);
  /* How far up to reach assets/. Taken from the stylesheet link the build
     already wrote — "../../assets/app.css" on a lesson, "assets/app.css" at the
     root — because that is the prefix build.py itself computed for this page.
     This used to count slashes in location.pathname and assume four meant a
     lesson, which is true on a GitHub Pages PROJECT site (/repo/unit-01/
     lesson-1/) and false everywhere else: served from a domain root, or from a
     local http.server, a lesson has three, so `up` came out empty and every
     avatar and background 404'd while the CSS beside them loaded fine. */
  const css = document.querySelector('link[rel="stylesheet"][href*="assets/app.css"]');
  const up = css ? css.getAttribute("href").replace(/assets\/app\.css.*$/, "") : "";
  const beats = panelBeats(p);
  let at = -1;

  /* ---- where things stand ------------------------------------------------
     One function owns the geometry of the panel, and everything else asks it.
     Figures are spread evenly across the floor and each is CENTRED on its
     share of the width, which lands two people at 25% and 75%, three at 17/50/83
     and four at 12/37/62/87 — the same rule, no special cases. They are allowed
     to overlap at four, because overlapping figures are how a crowded comic
     panel has always been drawn and because the alternative is shrinking every
     face until none of them reads. */
  const figX = (i, n) => (i + 0.5) / n;
  /* Height falls as the cast grows, but slowly: the point of the half-body
     crop is the expression, and an avatar under about 45% of the frame stops
     delivering one. Four is the cap for that reason and is enforced at build. */
  /* And falls again on a SQUARE panel, which is what a phone gets. A 3:2 frame
     with figures at 62% leaves a comfortable band of sky for the balloons; the
     same 62% of a square leaves barely a third of the panel, and two people
     talking in it cannot both be given a balloon over their head without one of
     them ending up across the other's face. The figures come down to about half
     the frame instead, which is still well above the size an expression reads
     at, and the sky it buys is what the balloons are placed in. */
  const figSquash = () => {
    const st = $(".d-stage", scene);
    const r = st && st.getBoundingClientRect();
    if (!r || !r.height) return 1;
    return clamp((r.width / r.height) / 1.5, 0.8, 1);
  };
  const figH = n => (n <= 2 ? 0.62 : n === 3 ? 0.55 : 0.48) * figSquash();

  /* ---- the figures -------------------------------------------------------
     One sheet per character, offset to the panel that holds the wanted face.
     The placeholder is drawn first and removed only when the real image reports
     `load`, so it disappears by itself as the art lands and never needs taking
     out — and while it is there it names the exact file that would fill it. */
  /* How far into the scene somebody is standing. The height multiplier is the
     whole effect — a figure is anchored to the floor, so a taller one reads as
     nearer — and the z decides who is drawn over whom. Depth beats the
     speaker's small bump inside its own band, because somebody at the back does
     not come forward by talking. Read off the manifest, never hard-coded, so a
     fourth depth costs a manifest edit and nothing here. */
  /* ---- walking on and off ------------------------------------------------
     THE STAGE HAS NO DEPTH, and this is what replaced it. Sizing figures to say
     how far into the scene they stood was removed: a half-body figure cropped
     at the waist stands ON the bottom edge, so the only honest axis left is
     across. Somebody cannot be further away, only elsewhere — or not here yet,
     or leaving.

     The whole mechanism is a transition on `left`. Figures are already placed
     by a percentage, so crossing the stage is a change of roster index and
     costs nothing; an entrance is that same move begun from outside the frame
     and an exit is one that ends there. -40% and 140% clear the frame at every
     cast size, since a figure is at its widest with one person on stage. */
  const OFF = { left: "-40%", right: "140%" };

  /* ---- a face, and the beat that belongs to a turn ------------------------
     THE CROP IS THE EXPRESSION. The sheet is a cols x rows grid read left to
     right, top to bottom, so a linear emotion index becomes a column and a row;
     0% puts the first panel's edge flush with the box's and 100% the last one's
     far edge flush with the far side, which is why the step is 1/(n-1).

     `beat` is the squash, and it is optional because WHEN a face changes is not
     the same question as whether it changed. Arriving at a panel is not a
     reaction to anything — the whole cast flinching as the panel opens was the
     "everybody at once" this replaced — so paintFigure sets faces silently and
     only a turn beats. */
  function setCrop(el, col, beat){
    if (!el) return;
    const cols = p.cols || 3, rows = p.rows || 2;
    const cx = col % cols, cy = Math.floor(col / cols);
    const changed = el.dataset.col !== undefined && el.dataset.col !== String(col);
    el.dataset.col = String(col);
    el.style.backgroundPositionX = cols > 1 ? (cx / (cols - 1) * 100) + "%" : "0%";
    el.style.backgroundPositionY = rows > 1 ? (cy / (rows - 1) * 100) + "%" : "0%";
    if (!beat || !changed) return;
    /* Removing and re-adding inside one frame does not restart a CSS animation
       — the browser never saw the attribute leave — and reading a layout
       property in between is what forces it to. It measures rather than changes
       geometry, so it is safe against the no-reflow-while-typing rule.

       AND IT IS TAKEN OFF AGAIN, on a timer rather than `animationend`, because
       under reduced motion the animation never runs and the event never fires.
       The timer is comfortably past the keyframe's own duration: cut it short
       and the squash is removed mid-flight, which is worse than no squash. */
    el.removeAttribute("data-beat");
    void el.offsetWidth;
    el.setAttribute("data-beat", "1");
    clearTimeout(el.__beat);
    el.__beat = setTimeout(() => el.removeAttribute("data-beat"), 320);
  }

  function paintFigure(el, ph, c, i, n, speaking, paintFace){
    const x = figX(i, n), h = figH(n);
    /* Drawn facing one way only; a figure standing right of the middle is
       mirrored so that nobody is addressing the edge of the frame. The flip
       rides on the same transform as the centring, so it composes rather than
       fighting it — and it is applied to the ARTWORK ONLY. The placeholder
       carries the character's name and the expression as words, and a mirrored
       word is unreadable: the flip is a fact about the drawing, not about the
       box it will arrive in. */
    const flip = p.faceIn !== false && x > 0.5;
    [[el, flip], [ph, false]].forEach(([box, mirror]) => {
      if (!box) return;
      const mv = c.move, walk = mv && mv.ms ? mv.ms : 0;
      /* `--walk`, NOT `transition-duration`: the shorthand on this element also
         carries opacity, translate and scale, so setting the duration inline
         would retime all of them and a 900ms `slow` entrance would drag the
         dim and the breath out with it. The custom property is read by the
         `left` leg alone.

         An entrance is TWO steps, because a transition needs a value to travel
         from that the browser has actually painted: park the figure off-frame
         with the walk at zero, then on the next frame turn the walk on and send
         them to their place. An exit needs one — they are already standing
         somewhere from the previous panel, so the far edge is already a change. */
      if (mv && mv.go === "in" && walk){
        box.style.setProperty("--walk", "0ms");
        box.style.left = OFF[mv.side];
        /* A FORCED STYLE FLUSH, not requestAnimationFrame. rAF runs BEFORE the
           next paint, so setting the start here and the end in the callback
           lets the browser resolve style once and see only the end value —
           there is no earlier value to travel from and no transition runs. A
           figure walking on is a fresh element with no previous `left` at all,
           which is the case this bites hardest. Reading a layout property
           forces the start to resolve first, and then the second assignment is
           a real change. Same trick as the expression beat, same reason. */
        void box.offsetWidth;
        box.style.setProperty("--walk", walk + "ms");
        box.style.left = (x * 100) + "%";
      } else {
        box.style.setProperty("--walk", walk + "ms");
        box.style.left = (mv && mv.go === "out" && walk)
                       ? OFF[mv.side] : (x * 100) + "%";
      }
      box.style.height = (h * 100) + "%";
      /* THE CENTRING IS NOT WRITTEN HERE ANY MORE. It is `translate:-50%` in the
         stylesheet, and the long note beside it says why: the individual
         transform properties are applied to the result of `transform`, so a
         `translateX(-50%)` sitting in this string got scaled and rotated by the
         breath and the beat, and the figure slid sideways as it squashed. What
         is left in this string is the mirror alone, which contributes no
         translation for anything downstream to act on. */
      box.style.transform = mirror ? "scaleX(-1)" : "";
      /* The speaker is at full strength and in front; everyone else is held
         back. With the name gone from the balloon this is half of what says
         who is talking — the tail is the other half, and two weak signals
         beat one strong one on a small screen. */
      box.style.opacity = speaking ? "1" : String(p.dim || 0.72);
      /* The same fact as the opacity, in a form a selector can reach: inline
         styles are invisible to CSS, and the breath needs to know who is in the
         conversation. Set here and nowhere else, so the two can never disagree
         about who is in it. */
      box.dataset.in = speaking ? "1" : "0";
      /* Depth owns the band; the speaker gets the small bump inside it. */
      box.style.zIndex = speaking ? "3" : "2";
      /* Who is LIVE, at panel granularity. The stylesheet lifts this one and
         lets the rest breathe; stream() narrows it to a single balloon while
         the words are arriving, and finishTyping() hands it back. Panel
         granularity is the right resting state because it is exactly what the
         dimming above says, and the two must never disagree about who spoke.

         Written to the PLACEHOLDER as well as the artwork, and that is not a
         nicety: when a sheet is missing the real figure is removed and the
         dashed box is all that is left, so a cast that is mostly undrawn — 3 of
         32 today — would otherwise lose the speaker signal entirely on exactly
         the pages that need it most. The placeholder lifts; it does not
         breathe, because scaffolding should look like scaffolding. */
      box.dataset.live = speaking ? "1" : "0";
    });
    if (!el) return;
    /* THE FACE IS LEFT ALONE WHEN THE PANEL IS ABOUT TO BE TYPED, and that is
       what makes the first balloon's reaction visible. Painting it here would
       move the expression to this beat's END state before a word had arrived,
       so by the time the first turn came round the face had already changed and
       there was nothing left to react to. Eleven of unit 1's fourteen beats
       change a face on their first line, five of them ONLY there, so this was
       most of the reactions in the chapter.
       Left alone, `dataset.col` still holds the PREVIOUS panel's face, which is
       exactly the baseline the first turn needs to compare against.
       When nothing is going to be typed — a rewind, or reduced motion — there
       is no turn to do it, so the face is set here, silently and at once. */
    if (paintFace) setCrop(el, c.col);
    const src = (window.__SHEETS__ && window.__SHEETS__[c.slug])
              || (up + ASSET_CAST + c.slug + ".webp");
    /* Setting the same background-image again is cheap but not free, and the
       probe below is what removes the placeholder — re-running it on a figure
       that is already drawn is the flicker this avoids. Only the crop moves. */
    const fresh = el.dataset.sheet !== src;
    el.dataset.sheet = src;
    const cols = p.cols || 3, rows = p.rows || 2;
    if (fresh) el.style.backgroundImage = 'url("' + src + '")';
    el.style.backgroundSize = (cols * 100) + "% " + (rows * 100) + "%";
    /* Panel width is sheetW/cols and panel height is sheetH/rows, so the
       panel's own aspect is the sheet's times rows over cols — 1.0, square,
       for a 3 x 2 grid in a 3:2 image. */
    el.style.aspectRatio = String((p.aspect || 1.5) * rows / cols);
    /* Probed once per sheet, not once per panel. */
    if (fresh){
      /* THE PLACEHOLDER WAITS BEFORE IT SHOWS ITSELF. It used to be painted at
         once and taken away on `load`, which is right for art that does not
         exist and wrong for art that does: on the drawn characters it meant the
         reader opened the story, saw two dashed boxes, and watched them be
         replaced. The page declares these sheets with `rel=preload` in the
         head, so on any ordinary visit the image is already there and the
         placeholder should never have a turn at all.
         A quarter of a second is the usual threshold for this — under it a
         reader reads the flash as jank, over it as loading. */
      if (ph){
        ph.dataset.wait = "1";
        clearTimeout(ph.__wait);
        ph.__wait = setTimeout(() => ph.removeAttribute("data-wait"), 250);
      }
      const probe = new Image();
      probe.onload = () => {
        if (ph) clearTimeout(ph.__wait);
        if (el.isConnected && ph) ph.remove();
      };
      probe.onerror = () => {
        if (ph) { clearTimeout(ph.__wait); ph.removeAttribute("data-wait"); }
        if (el.isConnected) el.remove();
      };
      probe.src = src;
    }
  }

  /* ---- who is speaking, right now ----------------------------------------
     The dimming says who speaks IN THIS PANEL, which in a four-line exchange
     is everybody, and by the third balloon that has stopped answering the
     question the balloon refuses to answer itself. So while the words are
     arriving the live set narrows to the one person saying them, and the
     stylesheet does the rest: the live figure lifts and holds still, the
     others breathe.

     A slot is the figure's index in the roster and a balloon carries the same
     number, which is what the tails are already aimed by — so this needs no
     new bookkeeping, only the number that is already on the element. A
     narration caption carries no slot, and NaN is in no set, so a beat with
     nobody speaking correctly lifts nobody. */
  let walkTimer = 0;             // a second tail-aim, for a figure still walking
  let liveSlots = new Set();     // who speaks anywhere in this panel
  let curLines = [];             // the panel's lines, for per-turn faces
  let curRoster = [];            // and the state it ends in

  /* THE DIMMING IS NOT THE TURN, and the distinction is the point. Dimming
     answers "is this person in the conversation" and it is set once per panel,
     in paintFigure, from everyone who speaks anywhere in the beat. If A is
     talking to B then BOTH are in it and both stay at full strength; a listener
     faded down every time the other one takes a line reads as somebody who has
     left the scene, which is exactly wrong for a two-hander. What the dim is
     for is the person standing there saying nothing all panel.

     `data-live` is the turn — whose balloon is being typed right now. It moves
     the faces, it fires the beat, and it holds that figure still while everyone
     else breathes. It deliberately touches no opacity and no geometry: nothing
     lifts off the floor, and nothing moves after the tails are measured. */
  const setTurn = slots => $$(".d-fig,.d-fig-ph", cast).forEach(el => {
    el.dataset.live = slots.has(Number(el.dataset.slot)) ? "1" : "0";
  });

  /* Everyone's face at one line of the beat, beating whoever just changed. The
     roster's MEMBERSHIP cannot change inside a beat — any @-line breaks the
     panel — so this only ever moves expressions, and the slot order holds. */
  const facesAt = (arr, beat) => (arr || []).forEach((c, k) => {
    setCrop($('.d-fig[data-slot="' + k + '"]', cast), c.col, beat);
  });

  /* ---- the props ---------------------------------------------------------
     A thing that is in the scene, so a line can point at it. Two layers: a
     prop that HANGS is behind the people, because a list on a noticeboard is
     on the wall they are standing in front of, and everything else is in front
     of them, nearer the camera. Getting that the wrong way round is the single
     most obvious way a composited panel looks wrong.

     A prop that has not been drawn keeps a dashed, named box — the same
     scaffolding rule the avatars follow, and for the same reason: a prop is
     something a line refers to, so a missing one leaves the line pointing at
     nothing. Effects do NOT get that treatment; see below. */
  function paintProps(items, figs){
    propBack.innerHTML = "";
    propFront.innerHTML = "";
    (items || []).forEach(it => {
      let x;
      if (it.at === "left") x = 0.15;
      else if (it.at === "right") x = 0.85;
      else if (it.at === "center") x = 0.5;
      else {
        /* Beside a named person, on their outward side, so it never lands
           between two people who are talking to each other. */
        const i = figs.indexOf(it.at);
        const fx = i < 0 ? 0.5 : figX(i, figs.length);
        x = fx < 0.5 ? fx - 0.15 : fx + 0.15;
      }
      x = Math.max(0.08, Math.min(0.92, x));

      const box = document.createElement("div");
      box.className = "d-it";
      box.dataset.item = it.slug;
      box.style.left = (x * 100) + "%";
      box.style.height = ((it.size || 0.18) * 100) + "%";
      /* Hanging props are pinned near the top of the frame; everything else
         stands on the floor. Neither is centred vertically, because nothing in
         a real scene floats. */
      if (it.hangs) box.style.top = "8%"; else box.style.bottom = "4%";

      const ph = document.createElement("div");
      ph.className = "d-it-ph";
      ph.textContent = it.slug;
      box.appendChild(ph);

      const src = up + ASSET_PROP + it.slug + ".webp";
      box.style.backgroundImage = 'url("' + src + '")';
      const probe = new Image();
      probe.onload = () => { if (box.isConnected) ph.remove(); };
      probe.onerror = () => { if (box.isConnected) box.dataset.missing = "1"; };
      probe.src = src;

      (it.hangs ? propBack : propFront).appendChild(box);
    });
  }

  /* ---- the effects -------------------------------------------------------
     Manga sign language: a shock burst, a sweat drop, circling birds. Two
     kinds, and the manifest says which is which — one sits over a person, one
     over the whole frame.

     A figure effect is drawn to cover the figure's box grown upward, because
     half of these live above the head and the code should not have to know
     which. That is a rule the ART carries: the prompts ask for each figure
     effect on a square canvas with the figure's headroom already in it.

     A missing effect renders NOTHING — no placeholder, deliberately, and this
     is the one place that differs from every other missing asset here. A
     dashed box labelled "dizzy" sitting over somebody's face is worse than no
     effect at all, and unlike a prop, nothing in the writing points at it.
     Which effects are still undrawn is tools/check_cast.py's question. */
  function paintFx(fx, figs){
    fxLayer.innerHTML = "";
    (fx || []).forEach(f => {
      const el = document.createElement("div");
      el.className = "d-fx-one";
      el.dataset.fx = f.slug;
      if (f.on === "panel"){
        el.dataset.over = "panel";
      } else {
        const i = figs.indexOf(f.on);
        if (i < 0) return;
        const n = figs.length, h = figH(n);
        el.dataset.over = "figure";
        el.style.left = (figX(i, n) * 100) + "%";
        /* The figure's height plus a third again of it, all of the extra
           growing upward: the drop, the stars and the vein all sit at or above
           the head. */
        el.style.height = (h * 1.34 * 100) + "%";
        el.style.aspectRatio = "1";
        /* Centred by `translate` in the stylesheet, not by a transform written
           here — the pop scales this element, and a scale applied over a
           `transform` translation drags the offset with it. See the note at
           `.d-fx-one`. */
      }
      const src = up + ASSET_FX + f.slug + ".webp";
      el.style.backgroundImage = 'url("' + src + '")';
      const probe = new Image();
      probe.onerror = () => { if (el.isConnected) el.remove(); };
      probe.src = src;
      fxLayer.appendChild(el);
    });
  }

  /* ---- one panel ---------------------------------------------------------
     A panel is an EXCHANGE, not a line: every balloon in the beat, and every
     person the beat leaves standing on the stage — including the ones saying
     nothing, who are there because a scene with a silent listener in it reads
     as a scene and a scene without one reads as a monologue.

     The stage state shown is the state at the END of the beat, so a character
     who reacts on the second line is already wearing that face when the reader
     arrives at it. That is how a comic panel works: it is the moment after. */
  function show(i){
    i = Math.max(0, Math.min(beats.length - 1, i));
    if (i === at) return;
    /* Going FORWARD is being told the story and the words arrive as they are
       said. Going BACK is looking something up, and a reader who has returned
       to re-read a line wants it now, not typed at them again. */
    const forward = i > at;
    /* ENDED BEFORE THE NEW PANEL EXISTS. finishTyping() settles the faces to
       `curRoster`, and stream() calls it — by which point curRoster has already
       been pointed at the panel being opened, so a reader who taps through a
       half-typed panel had the NEXT panel's final faces painted silently before
       its first turn could compare against anything. Called here, it still
       belongs to the panel it is ending. */
    finishTyping();
    at = i;
    const lns = beats[i].map(j => p.lines[j]);
    const last = lns[lns.length - 1];
    const place = lns[0].bg;
    /* A panel normally shows the stage as it stands at the END of the beat —
       that is what "the moment after" means, and it is why a character who
       reacts on the second line already wears that face when the reader
       arrives. A MOVE is the exception, and in both directions: the move is
       spent on the first line, and a departure has already left the roster by
       the last one. So a beat that contains a move is built from its START
       membership, with each person's END face laid over the top — the leaver
       is on stage to be carried off, and everybody else still reacts. */
    const endCast = last.cast || [];
    const startCast = (lns[0] && lns[0].cast) || [];
    const roster = startCast.some(c => c.move)
      ? startCast.map(c => {
          const later = endCast.find(e => e.who === c.who);
          return later ? Object.assign({}, later, { move: c.move }) : c;
        })
      : endCast;
    const figs = roster.map(c => c.who);
    const speaking = new Set(lns.map(l => l.who).filter(Boolean));

    /* THE PLATE IS ONLY TOUCHED WHEN THE PLACE CHANGES. It used to be reset on
       every panel, which re-ran the missing-art probe and flashed the dashed
       placeholder over a background that was already loaded and correct — most
       visibly on a slow connection, which is where it could least be afforded.
       A conversation stays in one place for a dozen panels; only the people in
       front of it change.

       Art that does not exist yet must still show the reader — and the person
       drawing it — WHERE it will go and WHICH file is missing. */
    if (bg.dataset.bg !== place){
      const bgSrc = up + ASSET_BG + place + ".jpg";
      bg.style.backgroundImage = 'url("' + bgSrc + '")';
      bg.dataset.bg = place;
      /* Same rule as the figures': the striped "this plate is not drawn" panel
         is for a plate that is not drawn, not for one that is a few hundred
         milliseconds away. The first plate of the scene is preloaded from the
         head, so on an ordinary visit this never fires; while it is pending the
         stage shows its own flat ground, which is a background, not a defect
         report. */
      clearTimeout(bg.__wait);
      delete bg.dataset.missing;
      const bgProbe = new Image();
      const settle = miss => {
        clearTimeout(bg.__wait);
        if (bg.dataset.bg !== place) return;      // the scene has moved on
        if (miss) bg.dataset.missing = "1"; else delete bg.dataset.missing;
      };
      bgProbe.onload = () => settle(false);
      bgProbe.onerror = () => settle(true);
      bg.__wait = setTimeout(() => {
        if (bg.dataset.bg === place && !bgProbe.complete) bg.dataset.missing = "1";
      }, 250);
      bgProbe.src = bgSrc;
    }

    /* THE FIGURES ARE REUSED WHEN THE CAST HAS NOT CHANGED. Rebuilding this
       markup on every panel threw away elements that were already correct and
       created fresh ones — so the dashed placeholder was re-inserted and the
       sheet re-attached every single time, and both flickered before the
       browser could paint the cached image back. Two avatars flashing on every
       tap, for a change that was usually just an expression.

       The roster key is the slugs in order: same people in the same places
       means the same elements, moved and re-cropped in place. A different cast
       is a different scene and does rebuild. */
    const key = roster.map(c => c.slug).join("|");
    if (cast.dataset.roster !== key){
      cast.dataset.roster = key;
      cast.innerHTML = roster.map((c, k) =>
        '<div class="d-fig-ph" data-slot="' + k + '"><b></b><span></span></div>'
        + '<div class="d-fig" data-slot="' + k + '"></div>').join("");
      roster.forEach((c, k) => {
        const ph = $('.d-fig-ph[data-slot="' + k + '"]', cast);
        if (ph){ $("b", ph).textContent = c.who; $("span", ph).textContent = c.emo; }
      });
    }
    /* The same condition stream() uses to decide whether to type. Computed here
       because the faces have to know it BEFORE they are painted. */
    const willStream = forward && !stillMotion();
    roster.forEach((c, k) => {
      paintFigure($('.d-fig[data-slot="' + k + '"]', cast),
                  $('.d-fig-ph[data-slot="' + k + '"]', cast), c, k,
                  roster.length, speaking.has(c.who), !willStream);
    });
    /* The resting state of the live set — everybody who speaks anywhere in the
       beat, which is what paintFigure has just written. Kept so that the end
       of the typing run has something to hand it back to, and so that a rewind
       or a reduced-motion reader, neither of whom types, lands on it directly. */
    liveSlots = new Set(roster.map((c, k) => speaking.has(c.who) ? k : -1)
                              .filter(k => k >= 0));
    curLines = lns;
    curRoster = roster;

    /* How much of the frame the people occupy, so the balloons can sit just
       clear of their heads instead of being pinned to the ceiling. */
    scene.style.setProperty("--fig-h", roster.length ? (figH(roster.length) * 100) + "%" : "0%");

    paintProps(last.items, figs);
    /* Effects are collected across the whole beat rather than taken from its
       last line, because an effect belongs to the moment and a beat is one
       moment. The build already refuses two on the same person. */
    paintFx(lns.reduce((acc, l) => acc.concat(l.fx || []), []), figs);

    /* Balloons stack in the order they are said, so reading order is the order
       of the conversation and nothing has to be numbered — which is what lets
       the name come off them. */
    bubble.innerHTML = lns.map(ln => {
      /* Three elements, not one, and the nesting is what carries the shapes:
         `.d-bub` positions the balloon and owns the tail, `.d-said` is the
         contour — a rounded box in CSS, or a drawn path for the two shapes
         that are not one — and `.d-txt` is what the words sit in, above it.
         The tail hangs off the OUTER element on purpose, so a drawn shape can
         never cut it off. */
      const kind = ln.who ? (ln.bub || "say") : "narrate";
      const inner = balloonHTML(kind, ln.html);
      if (!ln.who) return '<div class="d-bub" data-bub="narrate">' + inner + '</div>';
      return '<div class="d-bub" data-bub="' + esc(kind)
           + '" data-slot="' + ln.slot + '">' + inner + '</div>';
    }).join("");
    wireGlosses(bubble, p.glosses || [], p.id + "-b" + i);
    stream(forward);

    count.textContent = (i + 1) + " / " + beats.length;
    if (rail) rail.style.width = ((i + 1) / beats.length * 100) + "%";
    prev.disabled = i === 0;
    next.disabled = i === beats.length - 1;
    /* The name is gone from the picture, so it must NOT be gone from the
       accessible name — a screen-reader user has no tail to follow. They get
       the whole beat in one go, with the speakers, exactly as the transcript
       reads it. */
    const spoken = lns.map(ln => (ln.who ? ln.who + ": " : "")
                                + ln.html.replace(/<[^>]+>/g, "")).join(" ");
    stage.setAttribute("aria-label", spoken);
    /* Announced whole and at once, however slowly it is being typed. */
    if (sr) sr.textContent = spoken;

    /* Both of these are measurements, so they wait for layout — and the
       shapes go first, because a tail is aimed at a balloon whose size the
       shape does not change but whose presence the observer watches. */
    if (shapeWatch){
      shapeWatch.disconnect();
      $$(".d-said.is-shaped", bubble).forEach(el => shapeWatch.observe(el));
    }
    settleLayout();
    /* A tail is aimed at the figure it points to, ONCE, off a measurement. A
       figure still walking to its place would therefore be pointed at where it
       set off from, so the longest walk in the panel books a second aim for the
       moment it arrives. Nothing else moves horizontally, which is why this is
       the only case that needs it. */
    const walked = roster.reduce((m, c) => Math.max(m, (c.move && c.move.ms) || 0), 0);
    clearTimeout(walkTimer);
    if (walked) walkTimer = setTimeout(relayout, walked + 30);
  }

  /* ---- the words arrive as they are said ---------------------------------
     A panel's balloons type themselves out, one balloon at a time, in the order
     the lines are spoken. It is the one piece of motion in this whole construct
     and it earns its place: a comic panel drops a finished conversation on the
     reader all at once, and a reader who is learning the language reads the
     last balloon first about as often as not. Typing enforces the order the
     conversation actually happened in, which is also the order the exercises
     below ask about.

     NOTHING REFLOWS WHILE IT TYPES. Every character is wrapped in its own span
     up front, so the balloon is laid out at its final size from the first
     frame; the untyped ones are merely `visibility:hidden`, which occupies
     space. That matters more here than it would elsewhere — the tails are
     measured against the balloons' final geometry, so a box that grew while it
     typed would drag its own tail across the panel behind it.

     A HESITATION IS A REAL PAUSE. An ellipsis in the prose stops the stream for
     a beat before going on, and a full stop or a comma rests for a shorter one.
     It costs nothing — the punctuation is already in the writing — and it is
     the difference between text appearing and somebody speaking. `…` is
     therefore an authoring tool: see the skill.

     Reduced motion gets everything at once, and so does the reader who taps
     Next again mid-stream: a second tap finishes the panel rather than skipping
     it, which is the behaviour every reader already expects from this. */
  /* Fast. This is somebody talking, not a terminal from 1983: at 6ms a
     ten-word line lands in about a third of a second, which is quick enough
     that a reader never waits for it and slow enough that the order of the
     conversation still registers. The rests carry almost all of the character —
     an ellipsis is worth thirty ordinary letters. */
  const TYPE_MS = 6;          // per character
  const REST_MS = { "…": 300, ".": 130, "?": 130, "!": 130, ",": 70, ";": 70 };
  const BUBBLE_GAP_MS = 170;  // between one balloon finishing and the next
  let typing = null;          // the run in progress, so it can be finished early

  const stillMotion = () => typeof matchMedia === "function"
    && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Wrap every character of a balloon in its own span, leaving elements — the
     gloss buttons — intact and in place. Returns the spans in reading order.

     A marked item is also DISARMED here and re-armed by its own last letter.
     A gloss covers a phrase as often as a word — "can't work out", "hang out" —
     and an underline that creeps out from under a half-typed phrase offers the
     reader something that is not there yet: it marks two words when the third
     is still coming, and it is tappable before it means anything. So the
     underline appears, and the button becomes usable, on the character that
     completes it. */
  function letters(el){
    const out = [];
    const walk = node => {
      for (const kid of [...node.childNodes]){
        if (kid.nodeType === 3){
          const frag = document.createDocumentFragment();
          for (const ch of kid.data){
            const sp = document.createElement("span");
            sp.className = "d-c";
            sp.textContent = ch;
            frag.appendChild(sp);
            out.push(sp);
          }
          kid.replaceWith(frag);
        } else if (kid.nodeType === 1){
          walk(kid);
        }
      }
    };
    walk(el);
    $$(".gl", el).forEach(g => {
      g.dataset.armed = "0";
      const own = out.filter(sp => g.contains(sp));
      if (own.length) own[own.length - 1].dataset.arms = "1";
      else g.dataset.armed = "1";
      if (own.length) own[own.length - 1].__gl = g;
    });
    return out;
  }

  function finishTyping(){
    if (!typing) return;
    clearTimeout(typing.timer);
    typing.bubbles.forEach(b => {
      b.removeAttribute("data-typing");
      $$(".gl", b).forEach(g => { g.dataset.armed = "1"; });
    });
    typing.all.forEach(sp => sp.classList.remove("d-c-off"));
    typing = null;
    /* The run is over however it ended — finished, tapped through, or torn
       down by a panel change — so the live set goes back to what the panel
       says. Every exit from typing passes through here, which is the only
       reason one line is enough. */
    /* The panel ends in the state it ends in, however the run ended. Silently:
       the reader has already watched these faces change on their turns, and
       replaying the squashes at the end would be a second performance of a
       scene they just read. */
    facesAt(curRoster, false);
    setTurn(liveSlots);
  }

  function stream(forward){
    finishTyping();
    const bubbles = $$(".d-bub", bubble);
    if (!bubbles.length) return;
    if (!forward || stillMotion()) return;   // instant: rewind, or motion off

    const runs = bubbles.map(b => letters($(".d-txt", b)));
    const all = runs.flat();
    all.forEach(sp => sp.classList.add("d-c-off"));
    /* A balloon that has not started yet is hidden WHOLE — otherwise an empty
       outline sits there waiting, which reads as a balloon nobody filled in. */
    bubbles.forEach((b, k) => { if (k) b.setAttribute("data-typing", "wait"); });

    typing = { bubbles, all, timer: 0 };
    /* The focus follows the voice: whoever owns the balloon now being typed is
       the only live figure, so a four-line exchange hands the light back and
       forth instead of leaving both speakers lit throughout. */
    /* A turn is a balloon: the person saying it comes to full strength, and
       everyone's face moves to the state that line records — so a listener who
       reacts to what was just said reacts THEN, on that line, rather than
       wearing the reaction from the moment the panel opened.

       THE FIRST BALLOON BEATS TOO, against the face left on screen by the panel
       before it — paintFigure deliberately did not touch it, so the comparison
       is a real one. It is not "the whole cast flinching as the panel opens",
       which was the earlier defect: only somebody whose expression actually
       differs from the last panel moves, and they move as their line begins. */
    const turnTo = (k, beat) => {
      if (curLines[k]) facesAt(curLines[k].cast, beat);
      setTurn(new Set([Number(bubbles[k].dataset.slot)]));
    };
    turnTo(0, true);
    let bi = 0, ci = 0;
    const tick = () => {
      if (!typing) return;
      if (ci >= runs[bi].length){
        bi += 1; ci = 0;
        /* The last balloon has finished but the panel has not: fall through to
           finishTyping()'s restore rather than leaving the final speaker lit
           alone, because at rest the panel's own answer is the honest one. */
        if (bi >= runs.length){ finishTyping(); return; }
        bubbles[bi].removeAttribute("data-typing");
        turnTo(bi, true);
        typing.timer = setTimeout(tick, BUBBLE_GAP_MS);
        return;
      }
      const sp = runs[bi][ci++];
      sp.classList.remove("d-c-off");
      if (sp.__gl) sp.__gl.dataset.armed = "1";
      const rest = REST_MS[sp.textContent] || 0;
      typing.timer = setTimeout(tick, TYPE_MS + rest);
    };
    typing.timer = setTimeout(tick, 120);
  }

  /* ---- lettering: where the lines break -----------------------------------
     THE BREAKS ARE INPUT TO THE BALLOON, NOT OUTPUT FROM IT. That is the whole
     of this section, and it is the opposite of what a `max-width` does.

     Greedy wrapping fills each line to the measure and drops whatever is left
     onto the last one, which is why the balloons here kept ending in a stranded
     word — "…I come down here / to relax." A letterer breaks the line first and
     draws the balloon around the result, and aims for a stack that is short at
     the top, longest in the middle and short again at the bottom, because that
     is the shape that fills an oval. An even stack is a caption, and a caption
     inside an oval is what wastes the corners and inflates the shape.

     So: every break candidate is measured, and a small dynamic program picks
     the set of breaks that comes closest to a lens-shaped stack while paying a
     penalty for the breaks a reader would trip on — after "the", after "to",
     mid-phrase — and a large one for stranding a short word at the end. The
     text then carries explicit `<br>`s and is set `nowrap`, so nothing else can
     break it: the balloon is exactly as wide as the widest line the breaker
     chose. */

  /* Break candidates are real elements rather than characters, so a break can
     be applied and removed without touching the words around it. Glosses are
     skipped: a gloss is an inline-block, it cannot be split across lines, and a
     break inside one would tear its underline in half. It is one wide token,
     and the breaker parks it where a wide token belongs. */
  function tokenize(txt){
    if (txt.dataset.tok === "1") return;
    txt.dataset.tok = "1";
    const walk = node => {
      for (const kid of [...node.childNodes]){
        if (kid.nodeType === 3){
          if (!/\s/.test(kid.data)) continue;
          const frag = document.createDocumentFragment();
          for (const s of kid.data.split(/(\s+)/)){
            if (!s) continue;
            if (/^\s+$/.test(s)){
              const sp = document.createElement("span");
              sp.className = "d-sp";
              sp.textContent = " ";
              frag.appendChild(sp);
            } else frag.appendChild(document.createTextNode(s));
          }
          kid.replaceWith(frag);
        } else if (kid.nodeType === 1
                   && !kid.classList.contains("gl")
                   && !kid.classList.contains("d-sp")){
          walk(kid);
        }
      }
    };
    walk(txt);
  }

  /* The words between the break candidates, in order — needed because the cost
     of a break depends on the word in front of it. */
  function segments(txt){
    const out = [""];
    const walk = node => {
      for (const kid of node.childNodes){
        if (kid.nodeType === 3){ out[out.length - 1] += kid.data; continue; }
        if (kid.nodeType !== 1) continue;
        if (kid.classList.contains("d-sp")){ out.push(""); continue; }
        if (kid.classList.contains("d-br")) continue;
        if (kid.classList.contains("gl")){ out[out.length - 1] += kid.textContent; continue; }
        walk(kid);
      }
    };
    walk(txt);
    return out.map(s => s.trim());
  }

  /* Words a line should not end on. Breaking after "the" or "to" makes the
     reader carry an incomplete phrase across the gap, which on a picture — where
     the eye has somewhere else to go — is a real cost rather than a nicety. */
  const WEAK_END = new Set(["a","an","the","to","of","in","on","at","for","with",
    "my","your","his","her","our","their","and","but","or","so","is","was","are",
    "were","be","been","that","this","if","as"]);

  function endPenalty(word){
    if (!word) return 900;
    if (/[.!?]["'’]?$/.test(word)) return 0;
    if (/[,;:—…]["'’]?$/.test(word)) return 220;
    if (WEAK_END.has(word.toLowerCase().replace(/[^\w'’]/g, ""))) return 2600;
    return 900;
  }

  const LINE_COST = 1300;    /* an extra line has to earn its place */
  const ORPHAN_W = 0.40;     /* a last line thinner than this is stranded */
  const MAX_LINES = 16;      /* the ceiling, not the aim — see the fallback */

  /* Is this stack the shape an oval wants? Short, long, longest, long, short.
     Checked on the widths the breaker actually produced rather than on the
     targets it aimed at, because a solution can hit its targets badly and still
     come out top-heavy — which reads as a caption somebody rounded off. */
  function tapers(ws){
    if (ws.length < 3) return true;
    let mid = 0;
    for (let i = 1; i < ws.length - 1; i++) mid = Math.max(mid, ws[i]);
    return ws[0] <= mid * 1.01 && ws[ws.length - 1] <= mid * 1.01;
  }

  /* Returns the indices of the segments each line ENDS on. */
  function lensBreak(starts, ends, segs, maxW){
    const m = ends.length;
    if (m < 2) return [];
    const wide = (i, j) => ends[j] - starts[i];
    let best = null, bestAny = null;
    for (let k = 1; k <= Math.min(MAX_LINES, m); k++){
      let peak = 0;
      const prof = [];
      for (let i = 0; i < k; i++){
        const s = Math.sin(Math.PI * (i + 0.5) / k);
        prof.push(s); peak = Math.max(peak, s);
      }
      const target = prof.map(s => maxW * Math.pow(s / peak, 0.35));
      /* f[l][i] — the cost of laying segments i.. into l lines, and the choice
         that achieved it. l counts DOWN, so the line's target is target[k-l]. */
      const f = [], pick = [];
      for (let l = 0; l <= k; l++){
        f.push(new Array(m + 1).fill(Infinity));
        pick.push(new Array(m + 1).fill(-1));
      }
      f[0][m] = 0;
      for (let l = 1; l <= k; l++){
        const idx = k - l, t = target[idx];
        /* The taper, made structural rather than hoped for: on a stack of three
           or more the top and bottom lines may not run the full measure. */
        const cap = k < 3 ? maxW : (idx === 0 ? maxW * 0.86
                                   : idx === k - 1 ? maxW * 0.92 : maxW);
        for (let i = m - 1; i >= 0; i--){
          for (let j = i; j < m; j++){
            const w = wide(i, j);
            if (w > cap) break;
            const rest = f[l - 1][j + 1];
            if (!isFinite(rest)) continue;
            let c = (t - w) * (t - w) + LINE_COST;
            if (l > 1) c += endPenalty(segs[j]);
            else {
              /* the last line: the two rules a reader actually notices */
              if (w < ORPHAN_W * maxW) c += 9000;
              if (i === j && segs[j].replace(/[^\wÀ-ỹ]/g, "").length < 4) c += 1e7;
            }
            const tot = c + rest;
            if (tot < f[l][i]){ f[l][i] = tot; pick[l][i] = j; }
          }
        }
      }
      if (!isFinite(f[k][0])) continue;
      const cuts = [], ws = [];
      let i = 0;
      for (let l = k; l >= 1; l--){
        const j = pick[l][i];
        cuts.push(j); ws.push(wide(i, j)); i = j + 1;
      }
      const cand = { cost: f[k][0], cuts };
      if (!bestAny || cand.cost < bestAny.cost) bestAny = cand;
      if (tapers(ws) && (!best || cand.cost < best.cost)) best = cand;
    }
    const won = best || bestAny;
    if (won) return won.cuts.slice(0, -1);
    /* Nothing fitted the measure at any line count — a very long line in a very
       narrow panel. Fall back to plain greedy wrapping rather than returning no
       breaks at all, which is what used to leave a phone balloon three times the
       width of the frame. */
    const cuts = [];
    let from = 0;
    for (let j = 0; j < m - 1; j++){
      if (wide(from, j + 1) > maxW){ cuts.push(j); from = j + 1; }
    }
    return cuts;
  }

  /* ---- fitting one balloon ------------------------------------------------
     Measure with every break removed, choose the breaks, then measure the block
     they produced. Nothing here reads a stylesheet width: the measure comes in
     as an argument, because it is decided by how much of the frame this
     speaker's balloon is allowed to occupy. */
  function fitText(bub, maxW, minW){
    const txt = $(".d-txt", bub);
    if (!txt) return null;
    $$("br.d-br", txt).forEach(n => n.remove());
    $$(".d-sp", txt).forEach(s => s.classList.remove("d-sp-off"));
    tokenize(txt);
    const sps = $$(".d-sp", txt);
    const tr = txt.getBoundingClientRect();
    if (!tr.width) return null;
    const starts = [0], ends = [];
    for (const sp of sps){
      const r = sp.getBoundingClientRect();
      ends.push(r.left - tr.left);
      starts.push(r.right - tr.left);
    }
    ends.push(tr.width);
    /* A single token wider than the measure — a long word, or a gloss covering
       a whole phrase — sets the measure rather than being broken by it. */
    let widest = 0;
    for (let i = 0; i < ends.length; i++) widest = Math.max(widest, ends[i] - starts[i]);
    /* A floor as well as a ceiling. A short line in a narrow slab was being
       broken into four two-word scraps — and a four-word question cannot taper
       at six characters a line, so it came out top-heavy however the breaker
       arranged it. Below its own natural width nothing is gained by breaking at
       all, so that is where the floor sits. */
    const measure = Math.max(maxW, widest, Math.min(tr.width, minW || 0));
    const cuts = lensBreak(starts, ends, segments(txt), measure);
    for (const j of cuts){
      const sp = sps[j];
      if (!sp) continue;
      sp.classList.add("d-sp-off");
      const br = document.createElement("br");
      br.className = "d-br";
      sp.after(br);
    }
    /* The lines themselves, not just the block they add up to. A contour is a
       curve, so what it has to clear is each LINE at the height that line sits
       at — the block's corners are empty in a lens-shaped stack and padding to
       them is what inflated these balloons. */
    const after = txt.getBoundingClientRect();
    const rng = document.createRange();
    rng.selectNodeContents(txt);
    const rows = [];
    for (const r of rng.getClientRects()){
      if (r.width < 0.5 || r.height < 0.5) continue;
      const hit = rows.find(q => Math.abs(q.top - r.top) <= 5);
      if (!hit) rows.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
      else { hit.left = Math.min(hit.left, r.left); hit.right = Math.max(hit.right, r.right);
             hit.top = Math.min(hit.top, r.top); hit.bottom = Math.max(hit.bottom, r.bottom); }
    }
    const mid = after.top + after.height / 2;
    const lines = rows.map(r => ({ w: r.right - r.left, cy: (r.top + r.bottom) / 2 - mid }));
    return { w: after.width, h: after.height, lines };
  }

  /* ---- drawing and placing ------------------------------------------------
     A balloon goes OVER THE HEAD OF THE PERSON SAYING IT, and everything about
     the old arrangement worked against that. The balloons were one flex column
     bottom-aligned against the top of the figures, so a beat's first balloon was
     lifted by the height of the second one whoever had spoken it, and on a phone
     a media query replaced the vertical anchor with `bottom:auto` — which pinned
     the whole stack to the top of the frame while the heads sat halfway down.

     Now each balloon is placed on its own, in three steps that cannot be
     reordered: the frame is divided into a slab per speaker so two balloons can
     never want the same pixels; the words are broken to fit that slab; and the
     balloon is hung over the head with the tail reaching most of the way to the
     mouth. If the result would leave the frame it comes down into the figure —
     a balloon may cover the top of a head, which is ordinary in a comic — and
     only if that is not enough does the type come down a step. */
  const FRAME_PAD = 5;      /* ink stays this far inside the frame */
  const HEAD_GAP = 0.028;   /* the gap above the head, as a share of the frame */
  const GAP_MIN = 9, GAP_MAX = 22;
  const TAIL_REACH = 0.80;  /* how far down that gap the tail's point goes */
  const SINK_MAX = 0.10;    /* how far a balloon may come down into a figure */
  /* Type comes down a step at a time when a balloon will not fit above the
     head. Six steps rather than four, because a phone panel is 285px square and
     two people talking in it is the case that needs the last two. */
  const SCALES = [1, 0.94, 0.88, 0.82, 0.76, 0.71, 0.66];

  let laying = false;

  function layoutBalloons(){
    if (scene.hidden || laying) return;
    const bubs = $$(".d-bub", bubble);
    if (!bubs.length) return;
    const sr = stage.getBoundingClientRect();
    const box = bubble.getBoundingClientRect();
    if (!sr.width || !sr.height || !box.width) return;
    laying = true;
    try { layoutInner(bubs, sr, box); } finally { laying = false; }
  }

  function layoutInner(bubs, sr, box){
    const speech = [], caption = [];
    for (const b of bubs) (b.dataset.bub === "narrate" ? caption : speech).push(b);

    /* Captions stack up from the foot of the frame. Nobody is saying them, so
       they are not placed against anybody. */
    /* A caption is a BOX, sized to what it says. It ran the full width of the
       frame and sat on the bottom edge, which is a film subtitle — the reader
       looks along it rather than at it, and it draws a hard line under the
       picture. A comic's caption is a small square of card dropped into a
       corner of the panel, and it is smaller than the art it sits on. */
    let foot = box.height - FRAME_PAD * 2;
    for (let i = caption.length - 1; i >= 0; i--){
      const b = caption[i];
      b.style.left = (FRAME_PAD * 2) + "px";
      b.style.width = "";
      b.style.top = "";
      fitText(b, box.width * 0.52, 0);
      const r = b.getBoundingClientRect();
      b.style.top = (foot - r.height) + "px";
      foot -= r.height + 7;
    }

    /* A SLAB PER SPEAKER, SIZED BY HOW MUCH THERE IS TO SAY. Dividing the
       frame at the midpoints between speakers is the obvious rule and it is
       wrong on a phone: a twenty-seven-word line and a four-word answer got half
       the panel each, so the long one had a twelve-character measure, ran to
       fourteen lines and could not fit above anybody's head — which is where the
       two balloons ended up on top of each other. A letterer gives the long
       speech the room. The widths go as the square root of the length, so a
       short line still gets a balloon rather than a column, and the slabs stay
       in speaker order so reading order is still left to right. */
    /* WHERE THE FIGURE IS GOING, NOT WHERE IT IS. A figure that walks on
       transitions `left` over `--walk`, so for the length of that walk its
       measured box is somewhere between off-frame and its mark — and a balloon
       laid out against it gets a tail aimed at a person standing outside the
       panel. That is the stretched tail: not a tail that grew, a tail pointing
       correctly at a position that was never going to last.

       The settled position is not something to wait for, though: it is already
       written, as the inline `left` the paint put there, and the browser is
       merely animating towards it. So read that instead of the rect, and the
       balloon is right on the first frame with nothing to correct afterwards. */
    const castR = cast ? cast.getBoundingClientRect() : sr;
    const targetCX = fig => {
      const pct = parseFloat(fig && fig.style.left);
      if (!isFinite(pct)) return null;
      return castR.left + castR.width * pct / 100;
    };
    const items = [];
    for (const b of speech){
      const fig = figFor(b.dataset.slot);
      const fr = fig ? fig.getBoundingClientRect() : null;
      const txt = $(".d-txt", b);
      const cx = (fig && targetCX(fig)) != null ? targetCX(fig)
               : (fr && fr.width ? fr.left + fr.width / 2 : sr.left + sr.width / 2);
      items.push({ b, fr,
        /* And a speaker who ends up off the panel entirely — walking out of the
           scene — gets a tail that butts the frame rather than one that runs off
           the side of it, which is what a letterer does for a voice off-panel. */
        cx: clamp(cx, sr.left + sr.width * 0.06, sr.right - sr.width * 0.06),
        n: Math.max(6, ((txt || b).textContent || "").trim().length) });
    }
    const order = items.slice().sort((p, q) => p.cx - q.cx);
    const usable = sr.width - FRAME_PAD * 2;
    /* Every speaker gets a floor before anybody gets a share, because a
       four-word question in a sliver is worse than a long speech one line
       taller: it comes out as a column of scraps that cannot taper. */
    const floorW = order.length > 1
      ? Math.min(usable * 0.42, usable / order.length) : usable;
    let weight = 0;
    for (const it of order) weight += Math.sqrt(it.n);
    const spare = Math.max(0, usable - floorW * order.length);
    let edge = sr.left + FRAME_PAD;
    for (const it of order){
      const w = floorW + spare * Math.sqrt(it.n) / (weight || 1);
      it.lo = edge; it.hi = edge + w; edge += w;
    }

    for (const it of items) placeOne(it, sr, box);
    separate(speech, sr);
  }

  /* The slabs keep two balloons apart when both fit inside their share of the
     frame. When one does not — a forty-word line on a phone — it spills, and a
     balloon over somebody else's balloon is worse than a balloon slightly off
     its own speaker. So anything still piled up is pushed apart afterwards,
     into whatever room the frame has left, sharing the move between the two. */
  function separate(bubs, sr){
    const items = [];
    for (const b of bubs){
      const svg = $("svg.d-shape", b);
      const r = (svg || b).getBoundingClientRect();
      if (r.width > 2 && r.height > 2) items.push({ b, r, dx: 0 });
    }
    for (let pass = 0; pass < 3; pass++){
      let moved = false;
      for (let i = 0; i < items.length; i++){
        for (let j = i + 1; j < items.length; j++){
          const A = items[i], B = items[j];
          const ox = Math.min(A.r.right + A.dx, B.r.right + B.dx)
                   - Math.max(A.r.left + A.dx, B.r.left + B.dx);
          const oy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
          if (ox <= 0 || oy <= 0) continue;
          const small = Math.min(A.r.width * A.r.height, B.r.width * B.r.height) || 1;
          if (ox * oy / small <= 0.045) continue;
          const need = ox + 3;
          const left = (A.r.left + A.dx + A.r.right + A.dx)
                     < (B.r.left + B.dx + B.r.right + B.dx) ? A : B;
          const right = left === A ? B : A;
          const roomL = (left.r.left + left.dx) - (sr.left + FRAME_PAD);
          const roomR = (sr.right - FRAME_PAD) - (right.r.right + right.dx);
          const total = roomL + roomR;
          if (total <= 0.5) continue;
          const takeL = Math.min(Math.max(0, roomL), need * (Math.max(0, roomL) / total));
          const takeR = Math.min(Math.max(0, roomR), need - takeL);
          left.dx -= takeL; right.dx += takeR;
          moved = true;
        }
      }
      if (!moved) break;
    }
    for (const o of items){
      if (Math.abs(o.dx) < 0.4) continue;
      o.b.style.left = ((parseFloat(o.b.style.left) || 0) + o.dx).toFixed(1) + "px";
    }
  }

  function placeOne(it, sr, box){
    const b = it.b, kind = b.dataset.bub || "say";
    const spec = BUB_KIND[kind] || BUB_KIND.say;
    const said = $(".d-said", b), svg = $("svg.d-shape", b);
    const bodyEl = svg && $("path.d-body-path", svg);
    const tailEl = svg && $("path.d-tail", svg);
    const fr = it.fr;
    const slab = Math.max(70, it.hi - it.lo - 6);
    const roof = sr.top + FRAME_PAD, floor = sr.bottom - FRAME_PAD;

    for (let s = 0; s < SCALES.length; s++){
      b.style.setProperty("--bub-scale", SCALES[s]);
      /* Read AFTER the scale is set, so it is the size the words are actually
         about to be measured at rather than the size the last panel used. */
      const fs = parseFloat(getComputedStyle(b).fontSize) || 16;
      /* The measure: never wider than this speaker's slab allows, and never
         longer than an eye wants to travel on a picture. */
      const maxW = Math.min(slab / spec.swellW, fs * 17);
      /* The floor never exceeds the slab: a balloon wider than its own share
         of the frame is a balloon on top of somebody else's. */
      const blk = fitText(b, Math.max(48, maxW),
                          Math.min(fs * 11, slab / spec.swellW));
      if (!blk) return;

      /* SOLVE THE CURVE, DO NOT MULTIPLY THE BOX. A superellipse of semi-axes
         a and b is only `a` wide at its equator; at height y it has narrowed to
         a * (1 - |y/b|^n)^(1/n). A two-line stack has BOTH its lines off the
         equator, so a contour scaled from the bounding box is too narrow where
         the words actually are — which is how the last pass ended up with text
         crossing its own outline — while a contour padded enough to be safe
         everywhere is the inflated bubble before it. Neither is a guess worth
         tuning: pick the height, then take the width each line needs at the
         height it sits at, and keep the largest.

         `pad` is the letterer's rule and the only free number here: one capital
         of the dialogue font fits between the stack and the contour, anywhere
         round it, and no more. */
      const pad = fs * 0.72;
      let bb = blk.h / 2 + pad;
      const rows = (blk.lines && blk.lines.length) ? blk.lines
                 : [{ w: blk.w, cy: 0 }];
      let aa = 0;
      for (const ln of rows){
        const t = Math.min(0.97, Math.abs(ln.cy) / bb);
        const narrow = Math.pow(Math.max(1e-3, 1 - Math.pow(t, SUPER_N)), 1 / SUPER_N);
        aa = Math.max(aa, (ln.w / 2 + pad) / narrow);
      }
      let cw = aa * 2, ch = bb * 2;
      /* A burst's spikes are cut INTO the contour as well as out of it, so it
         needs a little more room than a smooth one. */
      if (kind === "shout"){ cw += fs * 0.5; ch += fs * 0.5; }
      /* And a one-liner stays a lens rather than a slot. */
      ch = Math.max(ch, cw * 0.15);

      /* THE GAP IS MEASURED TO THE WORDS, not to the outline. A contour
         circumscribes its text, so it hangs below the last line by a good
         fraction of the balloon's height — and holding the OUTLINE a fixed
         distance above the head therefore holds the words a variable and much
         larger distance above it, which is what "too far from the characters"
         looked like on a wide one-line balloon. Position the block, and let the
         curve come down over the top of the head where it wants to. */
      /* THE GAP IS THE TAIL'S ROOM, and it is measured to the CONTOUR.
         Measuring it to the last line of type looks like the same thing and is
         not: the curve hangs below the words by half its own padding, so a
         seventeen-pixel gap to the text left about six to the drawn edge — and
         a tail that has to start at that edge and stop clear of the hair then
         has nothing to be. The result was a row of pins.

         So the number below is what the tail gets to live in, and the two rules
         it has to satisfy set it: long enough to read as a tail, short enough
         that the balloon still belongs to the head under it. */
      /* And it yields when there is not room for both. The tail wants space and
         the reader wants the balloon near the head, and on a 285px phone panel
         those two pull against each other — so the gap is whatever is left after
         the curve's own overhang has been paid for out of the distance the words
         are allowed to sit from the head. A short tail on a small panel is the
         right answer there; a balloon adrift is not. */
      const overhang = (ch - blk.h) / 2;
      const gap = clamp(Math.min(sr.height * 0.045, sr.height * 0.088 - overhang),
                        10, 34);
      const headTop = fr && fr.height ? fr.top : sr.top + sr.height * 0.55;
      const figH = fr && fr.height ? fr.height : sr.height * 0.5;
      let ctop = headTop - gap - ch;
      if (ctop < roof){
        /* Come down into the figure rather than off the top of the frame. A
           balloon may cover the top of a head — that is ordinary in a comic —
           and only when even that is not enough does the type come down a
           step. */
        ctop += Math.min(roof - ctop, gap + figH * SINK_MAX);
      }
      const tooTall = ctop < roof;
      if (tooTall && s < SCALES.length - 1) continue;
      ctop = clamp(ctop, roof, Math.max(roof, floor - ch));

      let cleft = clamp(it.cx - cw / 2,
                        Math.max(sr.left + FRAME_PAD, it.lo - cw * 0.12),
                        Math.min(sr.right - FRAME_PAD - cw, it.hi - cw * 0.88));
      if (!isFinite(cleft)) cleft = sr.left + FRAME_PAD;
      cleft = clamp(cleft, sr.left + FRAME_PAD, Math.max(sr.left + FRAME_PAD, sr.right - FRAME_PAD - cw));

      /* Draw, look at what was actually drawn, and pull it back inside the
         frame if a spike or a tail ended up outside it. The correction has to
         happen after the path exists, because a wobbling contour and a tail
         aimed at a face are both wider than the box the words occupy — which is
         all a clamp on `cw` can see. */
      let paths = null, over = 0;
      for (let pass = 0; pass < 4; pass++){
        paths = drawPaths(kind, cw, ch, cleft, ctop, it, fr, headTop, figH,
                          Math.sign(it.cx - (sr.left + sr.width / 2)) || 1);
        const e = paths.ext;
        const dl = (sr.left + FRAME_PAD) - (cleft + e.x0);
        const dr = (cleft + e.x1) - (sr.right - FRAME_PAD);
        const dt = roof - (ctop + e.y0);
        const db = (ctop + e.y1) - floor;
        over = Math.max(0, dl) + Math.max(0, dr) + Math.max(0, dt) + Math.max(0, db);
        if (over < 0.6) break;
        if (dl > 0 && dr > 0) break;          /* wider than the frame: shrink */
        if (dt > 0 && db > 0) break;
        if (dl > 0) cleft += dl; else if (dr > 0) cleft -= dr;
        if (dt > 0) ctop += dt; else if (db > 0) ctop -= db;
      }
      if (over >= 0.6 && s < SCALES.length - 1) continue;
      /* The correction above moves the balloon to keep its ink in the frame,
         and moving it DOWN can put it over the face the tail is pointing at.
         A balloon may cover the top of a head; past that it is smaller type or
         nothing. */
      const sink = ctop + (ch + blk.h) / 2 - headTop;
      if (sink > figH * 0.12 && s < SCALES.length - 1) continue;

      const tx = cleft + (cw - blk.w) / 2, ty = ctop + (ch - blk.h) / 2;
      b.style.left = (tx - box.left).toFixed(1) + "px";
      b.style.top = (ty - box.top).toFixed(1) + "px";

      if (svg && bodyEl && tailEl){
        const ox = -(cw - blk.w) / 2, oy = -(ch - blk.h) / 2;
        const e = paths.ext, ew = e.x1 - e.x0, eh = e.y1 - e.y0;
        svg.setAttribute("viewBox", e.x0.toFixed(1) + " " + e.y0.toFixed(1)
                                  + " " + ew.toFixed(1) + " " + eh.toFixed(1));
        svg.style.left = (ox + e.x0).toFixed(1) + "px";
        svg.style.top = (oy + e.y0).toFixed(1) + "px";
        svg.style.width = ew.toFixed(1) + "px";
        svg.style.height = eh.toFixed(1) + "px";
        bodyEl.setAttribute("d", paths.body);
        tailEl.setAttribute("d", paths.tail);
      }
      if (said) said.dataset.drawn = Math.round(cw) + "x" + Math.round(ch);
      return;
    }
  }

  /* Where the tail is going, and the contour around it. The aim is the face, a
     sixth of the way down the figure; the tail stops short of it, because a tail
     that lands on a chin reads as a pointer rather than as speech. */
  function drawPaths(kind, cw, ch, cleft, ctop, it, fr, headTop, figH, hand){
    const ccx = cleft + cw / 2, ccy = ctop + ch / 2;
    const mx = it.cx, my = headTop + figH * 0.17;
    let dx = mx - ccx, dy = my - ccy;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist, uy = dy / dist;
    const rE = 1 / Math.hypot(ux / (cw / 2), uy / (ch / 2));
    /* A tail is a shape, not a marker. Taking a fixed fraction of the gap was
       right while the balloons floated a third of a panel away and wrong the
       moment they came down to the head: a twelve-pixel gap gives a nine-pixel
       tail, which reads as a pin stuck in the balloon. So it also has a length
       of its own, set by the balloon it hangs off, and it is allowed to run a
       little past the hair — a tail overlapping the top of a head is ordinary
       in a comic, and a tail too short to read is not. */
    /* It stops SHORT of the face. The floor used to be a fraction of the
       balloon and the ceiling let it run past the head into the hair, so on a
       close balloon the tail arrived at the character rather than pointing at
       them — a tail that lands on somebody reads as an arrow. Between about
       seven and eight tenths of the way there is the whole range. */
    /* IT STOPS CLEAR OF THE PERSON. Aiming at the face and then travelling most
       of the way there put the point in somebody's hair — a tail that touches a
       character reads as an arrow pointing at them rather than as speech coming
       out of them. So the reach is bounded twice: as a fraction of the way to
       the mouth, and by a hard line a few pixels above the top of the figure,
       which is the one that actually binds on a close balloon. */
    const span = dist - rE;
    let tipD = rE + clamp(span * TAIL_REACH, Math.min(13, span * 0.5), span * 0.84);
    if (uy > 0.05){
      const stopY = headTop - Math.max(9, figH * 0.035);
      const room = (stopY - ccy) / uy;
      if (isFinite(room)) tipD = Math.min(tipD, Math.max(rE + 3, room));
    }
    /* A BALLOON ALWAYS HAS A TAIL. The clearance above can squeeze it to
       nothing when the balloon has already had to come down over the figure,
       and a balloon with no tail is a balloon with no speaker — the one thing
       the name coming off the balloon made the tail responsible for. So it
       keeps a floor, and pays for it with a few pixels of overlap in the
       handful of panels where there was never room for both. */
    tipD = Math.max(tipD, rE + 14);
    {
    }
    const aim = { x: cw / 2 + ux * tipD, y: ch / 2 + uy * tipD };
    const seed = hashSeed(kind + "|" + (($(".d-txt", it.b) || it.b).textContent));
    /* WHICH SIDE OF THE PANEL THE SPEAKER STANDS ON, and nothing more local
       than that. Taking it from where the aim fell relative to the balloon's
       own centre looked equivalent and was not: the balloon is nudged outward
       from its speaker, so the aim lands on the inward side for BOTH of them
       and every tail in the panel came out the same handedness — measured, the
       sweep was -40 and -29 on a pair that should have mirrored. The frame has
       a middle and the speakers are either side of it; that is the fact the
       mirror is about. */
    return balloonPaths(kind, cw, ch, aim, seed, hand);
  }

  /* A web font landing, or a gloss opening under a balloon, changes the box
     after the paint that drew it. Guarded by `typeof`, not by truthiness:
     where the API is absent the bare name throws. */
  const shapeWatch = typeof ResizeObserver === "function"
    ? new ResizeObserver(() => { if (!laying) relayout(); }) : null;

  /* The figure a balloon belongs to, or its placeholder when the art has not
     landed — the placeholder is drawn to the same footprint, so a balloon aimed
     at one is aimed correctly. */
  const figFor = k => $('.d-fig[data-slot="' + k + '"]', cast)
                   || $('.d-fig-ph[data-slot="' + k + '"]', cast);

  /* One pass, because breaking the lines, sizing the contour, placing the
     balloon and aiming the tail are no longer four things that can disagree
     about what the balloon is. Four callers ask for it — a new panel, a resize,
     going full screen, and a balloon that changed size under the observer. */
  function relayout(){ layoutBalloons(); }

  /* THE FIGURES WALK ON, and a balloon placed before they arrive is placed
     against where they were standing. `.d-fig` transitions `left` over
     `--walk`, so the animation frame after a panel change — which is when this
     used to be the only layout — sees everybody at their old marks. On a
     two-hander that put the incoming speaker's balloon in the other speaker's
     half of the frame with a tail stretching five hundred pixels back across it.

     So the layout runs again when the walk ends, and once more on a timer for
     the cases where no transition fires at all: a figure that did not move, a
     `--walk` of zero, and reduced motion. Idempotent, so running it three times
     costs three measurements and changes nothing after the first that settles. */
  /* Named for what it settles, because two other things in this file are
     already called `settle` — one in the marking engine and one waiting on a
     background plate. Neither is in scope at any of the call sites below, and
     a name that is only safe by where the braces happen to fall is a name
     waiting for somebody to move a block. */
  let settleT = 0;
  function settleLayout(){
    requestAnimationFrame(relayout);
    clearTimeout(settleT);
    settleT = setTimeout(relayout, 480);
  }
  if (cast) cast.addEventListener("transitionend", e => {
    if (e.propertyName === "left" || e.propertyName === "translate") relayout();
  });

  /* ---- moving through it -------------------------------------------------
     Three ways in, and every one of them moves the SAME thing: the panel. The
     page does not move at all, which is the whole point of the rewrite — the
     reader can scroll down to the exercise, scroll back, and find the story
     exactly where they left it. */
  const goto = i => {
    /* Asked to go on while a panel is still typing: finish THIS panel rather
       than skipping to the next one. Impatience means "show me the rest of
       what was said", not "I have read it". Going back is never intercepted —
       a rewind is always immediate. */
    if (typing && i > at){ finishTyping(); return; }
    show(i);
  };
  /* The one handle the scene offers the outside world. The read-aloud pass
     needs to put the panel on a given beat and must NOT go through goto(),
     whose whole job is to interpret a READER's impatience — asked to go on
     mid-type it finishes the panel instead of advancing, which is right for a
     tap and wrong for a narrator that has already moved on. */
  root._scene = { show, goto, beats: beats.length };
  next.addEventListener("click", () => goto(at + 1));
  prev.addEventListener("click", () => goto(at - 1));
  stage.addEventListener("keydown", ev => {
    if (ev.key === "ArrowRight"){ ev.preventDefault(); goto(at + 1); }
    if (ev.key === "ArrowLeft"){ ev.preventDefault(); goto(at - 1); }
  });
  /* Left and right also work without first clicking into the stage, while the
     stage is the thing on screen. Deliberately NOT space or the down arrow:
     those are how a browser pages through a document, and a reading page keeps
     its own scrolling. Never while the reader is typing, which is what the
     editable check is for. */
  addEventListener("keydown", ev => {
    if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
    if (scene.hidden || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const el = document.activeElement;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    if (scene.contains(el)) return;                 // the stage handler has it
    const r = stage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    ev.preventDefault();
    goto(at + (ev.key === "ArrowRight" ? 1 : -1));
  });
  /* Swipe, on a phone, where it is the gesture a reader already expects from
     every comic app there is. `touchstart` and `touchend` only — never
     `touchmove`, which is the one that would let this cancel a scroll, and
     cancelling a scroll on a reading page is the thing this file will not do.
     A swipe that fails these tests simply does nothing and the page keeps it. */
  let tx = 0, ty = 0, tt = 0, swiped = 0;
  stage.addEventListener("touchstart", ev => {
    const t = ev.changedTouches[0];
    tx = t.clientX; ty = t.clientY; tt = Date.now();
  }, { passive: true });
  stage.addEventListener("touchend", ev => {
    const t = ev.changedTouches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty;
    if (Date.now() - tt > 800) return;              // a rest, not a swipe
    if (Math.abs(dx) < 44) return;                  // a tap, or a wobble
    if (Math.abs(dx) < Math.abs(dy) * 1.4) return;  // that was a scroll
    goto(at + (dx < 0 ? 1 : -1));
    swiped = Date.now();
  }, { passive: true });

  /* ---- the two halves of the picture -------------------------------------
     The panel itself is the control: a tap on its left half goes back, a tap
     on its right half goes on. There is nothing drawn for this and there is
     deliberately nothing to draw — the frame is competing with the rest of the
     lesson for a phone's screen, and any control painted inside it would be
     sitting on a face or on a balloon. It is the gesture a reader already has
     from every comic app, and it costs no pixels to offer.

     It replaces nothing. Back and Next are still under the frame, the arrow
     keys still work, the swipe still works, and this is a fourth way into the
     same `goto` — so a tap during the typewriter finishes the panel exactly as
     the button does, and a tap backwards is immediate exactly as Back is.

     Halves rather than a widget, and a click handler rather than two overlay
     elements, because an overlay is either above the balloons or below them and
     both are wrong: above, it swallows the glossed words; below, every balloon
     becomes a dead patch — and on a phone the balloons are a third of the
     frame. Reading the x off the event leaves the whole picture live and the
     glosses still theirs.

     Three things it must not take, each a real click that is not a page turn:

     - a glossed word, or an opened gloss. Both are inside the frame and both
       are the reader asking for something else.
     - the click a phone synthesises after a swipe. `touchend` has already
       turned the page by then, and without the guard the swipe turns two.
     - the click that ends a drag across a balloon. The balloons are selectable
       text and somebody who has just selected some is not asking for what
       happens next. */
  stage.addEventListener("click", ev => {
    if (!ev.detail) return;                       // keyboard-synthesised
    if (Date.now() - swiped < 700) return;        // the swipe already moved it
    const t = ev.target;
    if (t && t.closest && t.closest("button, a, .gloss")) return;
    const sel = typeof getSelection === "function" ? getSelection() : null;
    if (sel && !sel.isCollapsed && sel.anchorNode && stage.contains(sel.anchorNode)) return;
    const r = stage.getBoundingClientRect();
    if (!r.width) return;                         // nothing measured, no halves
    goto(at + (ev.clientX - r.left < r.width / 2 ? -1 : 1));
  });

  /* ---- filling the screen ------------------------------------------------
     On a phone the panel is competing with everything else on the page for
     about six centimetres. Full screen is where a comic actually reads, so it
     is one tap away — and it takes the controls WITH it, because a full-screen
     panel with the Next button left behind on the page underneath is a trap.

     The real Fullscreen API where there is one, and a fixed overlay where
     there is not, which is iOS Safari on a phone and therefore not a corner
     case. Both paths end in the same class, so the styling and the escape
     hatch are written once. */
  function fallbackFull(on){
    scene.classList.toggle("is-full", on);
    document.documentElement.classList.toggle("d-locked", on);
    syncFull();
  }
  function syncFull(){
    const on = document.fullscreenElement === scene || scene.classList.contains("is-full");
    full.setAttribute("aria-pressed", String(on));
    full.setAttribute("aria-label", on ? "Leave full screen" : "Fill the screen");
    settleLayout();
  }
  full.addEventListener("click", () => {
    const on = document.fullscreenElement === scene || scene.classList.contains("is-full");
    if (on){
      if (document.fullscreenElement === scene && document.exitFullscreen) document.exitFullscreen();
      else fallbackFull(false);
      return;
    }
    if (scene.requestFullscreen){
      scene.requestFullscreen().then(syncFull).catch(() => fallbackFull(true));
    } else {
      fallbackFull(true);
    }
  });
  addEventListener("fullscreenchange", syncFull);
  /* Escape leaves the fallback overlay. The real API does this itself; the
     fixed-position one has to be told, and a full-screen thing with no way out
     but the browser's back button is how a reader loses their place. */
  addEventListener("keydown", ev => {
    if (ev.key === "Escape" && scene.classList.contains("is-full")) fallbackFull(false);
  });
  /* The frame's shape decides where the tails point, so anything that changes
     it re-measures. Resize, not scroll: this panel does not know or care where
     the page is. */
  addEventListener("resize",
    () => settleLayout(),
    { passive: true });

  /* Which view the learner gets is theirs, and it is remembered. The default
     is the comic; the transcript is one tap away and is what the exercises
     below are answered against. */
  const KEY = "en8:comic:" + p.id;
  function setMode(comic){
    scene.hidden = !comic;
    body.hidden = comic;
    toggle.setAttribute("aria-expanded", String(comic));
    toggle.textContent = comic ? "Read it as text" : "Read it as a comic";
    try { localStorage.setItem(KEY, comic ? "1" : "0"); } catch(e){}
    if (comic){ const was = at; at = -1; show(Math.max(0, was)); }
    else {
      finishTyping();
      if (scene.classList.contains("is-full")) fallbackFull(false);
    }
  }
  toggle.addEventListener("click", () => setMode(scene.hidden));

  let want = "1";
  try { want = localStorage.getItem(KEY) || "1"; } catch(e){}
  /* Reduced motion gets the text by default. Guarded by `typeof`, not by
     truthiness: where the API is absent the bare name throws a ReferenceError
     and takes the whole dialogue down with it. */
  if (typeof matchMedia === "function"
      && matchMedia("(prefers-reduced-motion: reduce)").matches) want = "0";
  setMode(want === "1");
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
  initStory();
  paintStoryHome();
  initWords();
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
