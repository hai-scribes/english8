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
function norm(s){
  return String(s == null ? "" : s).normalize("NFC").toLowerCase()
    .replace(/[’‘`´]/g,"'").replace(/[.,!?;:]+$/g,"").replace(/\s+/g," ").trim();
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
    if (canPractise) pBtn.addEventListener("click", () => runEngine("practice"));
  }
  if (tBtn){
    tBtn.setAttribute("aria-disabled", String(!canTest));
    if (canTest) tBtn.addEventListener("click", () => runEngine("test"));
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

/* ---------------- practice / test engine ---------------------------------
   Both modes run the same question types over the unit's own vocabulary.
   practice: immediate feedback, wrong items come back, no score.
   test:     no feedback until the end, every word once, scored. */
function buildItems(words, mode){
  const list = shuffle(words);
  return list.map((w, i) => {
    let fmt;
    if (mode === "test") fmt = i % 2 === 0 ? "mc" : (canListen() && i % 5 === 3 ? "listen" : "type");
    else fmt = pick(canListen() ? ["mc","type","listen"] : ["mc","type"]);
    const q = { fmt, w };
    if (fmt === "mc"){
      const others = shuffle(words.filter(x => x.word !== w.word)).slice(0, 3);
      q.options = shuffle(others.map(x => ({ t:x.vi, ok:false })).concat([{ t:w.vi, ok:true }]));
    }
    return q;
  });
}
function runEngine(mode){
  const host = $("#engine");
  if (!host || !DATA.vocab || !DATA.vocab.length) return;
  const words = DATA.vocab;
  const st = { items:buildItems(words, mode), i:0, right:0, wrong:[], mode };
  host.hidden = false;
  host.scrollIntoView({ behavior:"smooth", block:"start" });
  const gate = $("#gate"); if (gate) gate.hidden = true;
  paintQ();

  function paintQ(){
    if (st.i >= st.items.length) return paintDone();
    const q = st.items[st.i], w = q.w;
    const audio = canListen()
      ? '<button class="speak" data-say="' + esc(sayWord(w)) + '">🔊 Hear it</button>'
        + '<button class="speak" data-say="' + esc(sayWord(w)) + '" data-slow="1">🐢 Slowly</button>'
      : "";
    let body = "";
    if (q.fmt === "mc"){
      body = '<div class="prompt">' + esc(w.word) + '<span class="ipa">' + esc(w.ipa) + '</span></div>'
        + (audio ? '<div class="row">' + audio + '</div>' : "")
        + '<div class="choices">'
        + q.options.map((o, i) => '<button data-i="' + i + '">' + esc(o.t) + '</button>').join("")
        + '</div>';
    } else if (q.fmt === "type"){
      body = '<div class="prompt">' + esc(w.vi) + '<span class="ipa">' + esc(w.pos || "") + '</span></div>'
        + '<input type="text" id="ans" autocomplete="off" autocapitalize="off" '
        + 'autocorrect="off" spellcheck="false" placeholder="the English word">'
        + '<div class="row"><button class="btn" id="go">Check</button></div>';
    } else {
      body = '<p class="lede">Play the word and write what you hear.</p>'
        + '<div class="row">' + audio + '</div>'
        + '<input type="text" id="ans" autocomplete="off" autocapitalize="off" '
        + 'autocorrect="off" spellcheck="false" placeholder="what you heard">'
        + '<div class="row"><button class="btn" id="go">Check</button>'
        + '<button class="btn quiet" id="noaudio">No sound — show the meaning</button></div>';
    }
    host.innerHTML =
      '<div class="card engine"><div class="qbar">'
      + '<span class="chip">' + (st.mode === "test" ? "Unit test" : "Practice") + '</span>'
      + '<span class="counter">' + (st.i + 1) + ' of ' + st.items.length + '</span>'
      + '<span class="counter sp">' + (st.mode === "test" ? "no feedback until the end" : st.right + " right") + '</span>'
      + '</div><div class="bar"><i style="width:' + (st.i / st.items.length * 100) + '%"></i></div>'
      + body + '</div>';
    if (q.fmt === "listen") setTimeout(() => speak(sayWord(w)), 200);
    const inp = $("#ans", host);
    if (inp){ try { inp.focus({ preventScroll:true }); } catch(e){ inp.focus(); } }
  }

  function grade(ok, given){
    const q = st.items[st.i];
    if (ok) st.right++; else st.wrong.push({ q, given });
    if (st.mode === "test"){ st.i++; return paintQ(); }
    const w = q.w;
    host.innerHTML = '<div class="card engine">'
      + '<div class="verdict ' + (ok ? "ok" : "no") + '">'
      + '<b>' + (ok ? "Correct" : "Not quite") + '</b>'
      + '<div>' + esc(w.word) + ' — ' + esc(w.vi) + '</div>'
      + (given && !ok ? '<div class="n">You wrote: ' + esc(given) + '</div>' : "")
      + '</div>'
      + (canListen() ? '<div class="row"><button class="speak" data-say="' + esc(sayWord(w)) + '">🔊 Hear it</button>'
          + '<button class="speak" data-say="' + esc(sayWord(w)) + '" data-slow="1">🐢 Slowly</button></div>' : "")
      + '<div class="row"><button class="btn" id="next">Continue</button></div></div>';
    if (!ok) st.items.push(q);                 // wrong items come back
    $("#next", host).addEventListener("click", () => { st.i++; paintQ(); });
  }

  function paintDone(){
    const total = st.items.length;
    const pct = Math.round(st.right / total * 100);
    if (st.mode === "test"){
      const r = unitRec(DATA.unit);
      if (!r.test || pct > r.test.best) r.test = { best:pct, at:Date.now() };
      saveProg();
    }
    const missed = st.wrong.length
      ? '<div class="note"><b>Worth another look:</b> '
        + st.wrong.map(x => esc(x.q.w.word)).filter((v, i, a) => a.indexOf(v) === i).join(" · ") + '</div>'
      : '<div class="note">Every word correct.</div>';
    host.innerHTML = '<div class="card engine"><h2>'
      + (st.mode === "test" ? "Unit test — result" : "Practice finished") + '</h2>'
      + '<div class="score">' + pct + '%</div>'
      + '<p class="lede">' + st.right + ' of ' + total + ' correct.</p>'
      + missed
      + '<div class="row"><button class="btn" id="again">Go again</button>'
      + '<button class="btn quiet" id="back">Back to the unit</button></div></div>';
    $("#again", host).addEventListener("click", () => runEngine(st.mode));
    $("#back", host).addEventListener("click", () => {
      host.hidden = true;
      const g = $("#gate"); if (g){ g.hidden = false; initGate(); }
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
    if (b.dataset.i !== undefined){
      const i = Number(b.dataset.i), ok = q.options[i].ok;
      $$(".choices button", host).forEach((c, j) => {
        c.disabled = true;
        if (q.options[j].ok) c.classList.add("ok");
        else if (c === b) c.classList.add("no");
        else c.classList.add("dim");
      });
      setTimeout(() => grade(ok, q.options[i].t), 380);
      return;
    }
    if (b.id === "go"){
      const v = ($("#ans", host) || {}).value || "";
      grade(norm(v) === norm(q.w.word) || norm(v) === norm(sayWord(q.w)), v.trim());
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
  initSpeakButtons();
  onVoices = () => { initSpeakButtons(); };
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
