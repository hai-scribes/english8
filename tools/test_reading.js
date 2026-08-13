/* The reading screen, tested against a built page.
 *
 * `09` C9, from `01` §9.1 and §12.7: colour highlighting, on-screen notes, a
 * question navigation bar and a review flag. Writing's half of C9 — the live
 * word count — is covered by check_write.js. This is the reading half.
 *
 * It runs the real app.js against the real generated HTML in a DOM, because
 * the parts most likely to be wrong are the parts no static check can see. It
 * has already earned its place: the first version of the highlighter used
 * Selection.containsNode to decide which paragraphs a drag touched, and this
 * test showed it reporting every paragraph EXCEPT the selected one — four
 * whole paragraphs highlighted instead of the phrase the reader dragged over.
 *
 * jsdom is the one dependency, and it is optional: with jsdom absent this
 * skips loudly rather than failing, so the four required gates still run on a
 * clean checkout.
 *
 *   npm install jsdom && node tools/test_reading.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

let JSDOM;
try {
  ({ JSDOM } = require("jsdom"));
} catch (e) {
  console.log("SKIP: jsdom is not installed — `npm install jsdom` to run the "
            + "reading-screen tests (C9). The other four gates do not need it.");
  process.exit(0);
}

const ROOT = path.resolve(__dirname, "..");
const APP = fs.readFileSync(path.join(ROOT, "docs/assets/app.js"), "utf8");

let fails = 0, passes = 0;
function ok(name, cond, extra) {
  if (cond) { passes++; return; }
  fails++;
  console.log("  FAIL " + name + (extra ? "\n       -> " + extra : ""));
}

function load(rel, store, beforeParse) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    console.log("FAIL: " + rel + " is not built — run `python3 tools/build.py` first");
    process.exit(1);
  }
  let html = fs.readFileSync(p, "utf8");
  /* A replacer FUNCTION, not a string: app.js contains "$$", which a
     replacement string would read as a substitution pattern and corrupt. */
  /* `app.js` carries a `?v=<hash>` cache-buster, so the src does not end at
     the filename. Matching to the closing quote instead — otherwise the real
     app is never injected and every behavioural check below fails at once,
     which is exactly how this was found. */
  html = html.replace(/<script src="[^"]*app\.js(\?[^"]*)?"[^>]*><\/script>/,
                      () => "<script>" + APP + "<\/script>");
  if (html.includes('app.js')) {
    console.log("FAIL: the app script tag was not replaced — the tests would "
              + "run against a page with no app on it");
    process.exit(1);
  }
  const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true,
                                url: "https://example.org/" + rel,
                                beforeParse: w => {
                                  /* jsdom implements neither, and the app calls
                                     both; without these a click throws before
                                     the behaviour under test ever runs. */
                                  w.scrollTo = () => {};
                                  w.Element.prototype.scrollIntoView = function(){};
                                  if (beforeParse) beforeParse(w);
                                } });
  dom.window.scrollTo = () => {};
  if (store) for (const k of Object.keys(store)) dom.window.localStorage.setItem(k, store[k]);
  return dom;
}

/* Both timers count in real seconds, and a Review's clock is eighteen minutes
   long, so the only way to watch one expire is to make the page's seconds
   short. Delays are divided rather than mocked out, so the ORDER of everything
   -- orientation, preview window, play, review window -- is still the order
   the page schedules, and a bug that reversed two of them would still show.

   jsdom has no speech synthesis, and without it the player takes its
   no-voice branch and never opens a review window at all. So it gets a voice
   that says every line instantly. */
function fastPage(w) {
  const si = w.setInterval, st = w.setTimeout;
  const squash = ms => (typeof ms === "number" && ms > 8 ? Math.max(1, ms / 1000) : ms);
  w.setInterval = (fn, ms, ...a) => si(fn, squash(ms), ...a);
  w.setTimeout = (fn, ms, ...a) => st(fn, squash(ms), ...a);

  const voice = { name: "Daniel", lang: "en-GB", localService: true };
  class Utterance {
    constructor(text) { this.text = text; this.onend = null; this.onerror = null; }
  }
  w.SpeechSynthesisUtterance = Utterance;
  w.speechSynthesis = {
    getVoices: () => [voice],
    addEventListener: () => {},
    cancel: () => {},
    speak: u => st(() => { if (u.onend) u.onend(); }, 1),
  };
}

/* Run the page's timers forward until `done()` or the budget runs out. */
async function until(win, done, ms) {
  const stop = Date.now() + (ms || 4000);
  while (!done() && Date.now() < stop) await new Promise(r => setTimeout(r, 15));
  return done();
}

const settled = dom => new Promise(r => setTimeout(() => r(dom.window), 60));

/* A paragraph's text as the app counts it — the generated label excluded. */
function plain(el) {
  const lab = el.querySelector(".pg-l");
  return el.textContent.slice(lab ? lab.textContent.length : 0);
}

/* Drag from character `s` of paragraph `a` to character `e` of paragraph `b`
   and release, which is the gesture that makes a highlight. */
function drag(win, paras, a, s, b, e) {
  const doc = win.document;
  const at = (el, off) => {
    const w = doc.createTreeWalker(el, win.NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest(".pg-l")
        ? win.NodeFilter.FILTER_REJECT : win.NodeFilter.FILTER_ACCEPT });
    let n, seen = 0;
    while ((n = w.nextNode())) {
      if (seen + n.nodeValue.length >= off) return [n, off - seen];
      seen += n.nodeValue.length;
    }
    return [null, 0];
  };
  const [sn, so] = at(paras[a], s), [en, eo] = at(paras[b], e);
  if (!sn || !en) throw new Error("could not place the drag");
  const r = doc.createRange();
  r.setStart(sn, so); r.setEnd(en, eo);
  const sel = win.getSelection();
  sel.removeAllRanges(); sel.addRange(r);
  paras[0].closest('[data-pg="body"]')
          .dispatchEvent(new win.MouseEvent("mouseup", { bubbles: true }));
}

const click = (win, el) => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));

/* The app's own `owned()` rule, restated for the test: the tasks below a timer
   and above the next one. Asking the page rather than trusting a hard-coded
   index, so a lesson that gains an exercise does not silently test nothing. */
function owned2(doc, timer) {
  const all = Array.from(doc.querySelectorAll('[data-role="clock"], [data-role="audio"]'));
  const next = all.find(t =>
    timer.compareDocumentPosition(t) & 4 /* DOCUMENT_POSITION_FOLLOWING */);
  const below = (a, b) => !!(a.compareDocumentPosition(b) & 4);
  return Array.from(doc.querySelectorAll('[data-role="task"]'))
    .filter(x => below(timer, x) && !(next && below(next, x)));
}

async function main() {
  /* ---- paragraph labels, highlighting, notes, and the question bar ------ */
  {
    const win = await settled(load("docs/unit-06/lesson-5/index.html"));
    const doc = win.document;
    const pg = doc.querySelector('[data-role="passage"]');
    ok("unit 06: the passage renders", !!pg);
    const body = pg.querySelector('[data-pg="body"]');
    const paras = Array.from(body.querySelectorAll("p"));

    /* The defect this construct was built for: 5.1 asks "which paragraph"
       and offers A–E, over a passage that printed no labels at all. */
    ok("unit 06: five paragraphs", paras.length === 5, paras.length);
    ok("unit 06: lettered A to E",
       paras.map(p => p.querySelector(".pg-l") && p.querySelector(".pg-l").textContent).join("")
       === "ABCDE");

    const txt = plain(paras[1]);
    drag(win, paras, 1, 4, 1, 20);
    let marks = body.querySelectorAll("mark");
    ok("highlight: one mark from one drag", marks.length === 1, marks.length);
    ok("highlight: marks exactly what was dragged over",
       marks.length === 1 && marks[0].textContent === txt.slice(4, 20),
       marks.length ? JSON.stringify(marks[0].textContent) : "");
    ok("highlight: the paragraph letter is not counted into the offsets",
       marks.length === 1 && marks[0].textContent[0] !== "B");
    ok("highlight: persisted",
       JSON.parse(win.localStorage.getItem("en8:marks:06-5-p1") || "[]").length === 1);

    click(win, marks[0]);
    ok("highlight: selecting it again takes it off",
       body.querySelectorAll("mark").length === 0);
    ok("highlight: removal persisted",
       JSON.parse(win.localStorage.getItem("en8:marks:06-5-p1") || "[]").length === 0);

    const pad = pg.querySelector('[data-pg="notepad"]');
    ok("notes: closed to start", pad.hidden);
    click(win, pg.querySelector('[data-pg="note"]'));
    ok("notes: the button opens them", !pad.hidden);
    const ta = pg.querySelector(".pg-ta");
    ta.value = "whaling is in B";
    ta.dispatchEvent(new win.Event("input", { bubbles: true }));
    ok("notes: persisted", win.localStorage.getItem("en8:notes:06-5-p1") === "whaling is in B");

    const nav = doc.querySelector(".c-nav");
    ok("nav: the question bar renders", !!nav);
    const qs = Array.from(nav ? nav.querySelectorAll(".c-q") : []);
    const flags = Array.from(doc.querySelectorAll(".i-flag"));
    ok("nav: a button for every question under the clock", qs.length > 0, qs.length);
    ok("nav: numbered from 1 across the whole block", qs.length && qs[0].textContent === "1");
    ok("nav: everything starts unanswered", qs.every(b => b.dataset.answered === "0"));
    ok("flag: one per question", flags.length === qs.length, flags.length + " vs " + qs.length);

    click(win, flags[2]);
    ok("flag: shows on the question bar", qs[2].dataset.flag === "1");
    ok("flag: shows on the question", flags[2].closest(".i").dataset.flag === "1");
    ok("flag: persisted",
       JSON.parse(win.localStorage.getItem("en8:flags:06-5-c1") || "{}")["2"] === true);
    click(win, flags[2]);
    ok("flag: comes off again", qs[2].dataset.flag === "0");

    const item = doc.querySelector('[data-role="task"] .i');
    const inp = item.querySelector(".i-in") || item.querySelector(".i-opt input");
    if (inp && inp.type === "radio") {
      inp.checked = true;
      inp.dispatchEvent(new win.Event("change", { bubbles: true }));
    } else if (inp) {
      inp.value = "B";
      inp.dispatchEvent(new win.Event("input", { bubbles: true }));
    }
    ok("nav: answering fills the number in", qs[0].dataset.answered === "1");
  }

  /* ---- the awkward ranges ----------------------------------------------- */
  {
    const win = await settled(load("docs/unit-12/lesson-5/index.html"));
    const body = win.document.querySelector('[data-pg="body"]');
    const paras = Array.from(body.querySelectorAll("p"));
    const pi = paras.findIndex(p => p.querySelector("strong"));
    ok("unit 12: a passage paragraph carries inline markup", pi >= 0);

    const txt = plain(paras[pi]);
    const i = txt.indexOf("habitable zone");
    ok("unit 12: found the bold phrase", i > 0);

    /* Starts in plain text and ends inside <strong>, so surroundContents
       throws and the extract-and-insert path has to carry it. */
    drag(win, paras, pi, i - 12, pi, i + 4);
    let got = Array.from(paras[pi].querySelectorAll("mark")).map(m => m.textContent).join("");
    ok("highlight: a range straddling an inline tag marks the right text",
       got === txt.slice(i - 12, i + 4), JSON.stringify(got));
    ok("highlight: the inline markup survives it", !!paras[pi].querySelector("strong"));

    drag(win, paras, pi, i - 4, pi, i + 20);
    ok("highlight: overlapping marks never nest", !paras[pi].querySelector("mark mark"));
    const here = JSON.parse(win.localStorage.getItem("en8:marks:12-5-p1") || "[]")
                     .filter(m => m.p === pi);
    ok("highlight: an overlap merges into one range", here.length === 1, JSON.stringify(here));
    ok("highlight: the merged range covers both",
       here.length === 1 && here[0].s === i - 12 && here[0].e === i + 20, JSON.stringify(here));
  }

  {
    const win = await settled(load("docs/unit-12/lesson-5/index.html"));
    const paras = Array.from(win.document.querySelectorAll('[data-pg="body"] p'));
    const t0 = plain(paras[0]), t1 = plain(paras[1]);
    drag(win, paras, 0, t0.length - 10, 1, 8);
    const st = JSON.parse(win.localStorage.getItem("en8:marks:12-5-p1") || "[]");
    ok("highlight: a drag across paragraphs stores one range per paragraph",
       st.length === 2, JSON.stringify(st));
    ok("highlight: it runs to the end of the first",
       st.some(m => m.p === 0 && m.s === t0.length - 10 && m.e === t0.length));
    ok("highlight: and from the start of the second",
       st.some(m => m.p === 1 && m.s === 0 && m.e === 8));
    ok("highlight: both paragraphs are marked",
       paras[0].querySelector("mark") && paras[1].querySelector("mark")
       && paras[0].querySelector("mark").textContent === t0.slice(-10)
       && paras[1].querySelector("mark").textContent === t1.slice(0, 8));
  }

  {
    const win = await settled(load("docs/unit-12/lesson-5/index.html", {
      "en8:marks:12-5-p1": JSON.stringify([{ p:1, s:0, e:8 }]),
      "en8:notes:12-5-p1": "kept",
    }));
    const paras = Array.from(win.document.querySelectorAll('[data-pg="body"] p'));
    const m = paras[1].querySelector("mark");
    ok("reload: a stored highlight comes back", !!m);
    ok("reload: at the offsets it was stored at",
       m && m.textContent === plain(paras[1]).slice(0, 8), m && JSON.stringify(m.textContent));
    ok("reload: the note comes back", win.document.querySelector(".pg-ta").value === "kept");
    ok("reload: and the notepad is open because there is one",
       !win.document.querySelector('[data-pg="notepad"]').hidden);
  }

  /* ---- the Review page: a second page type, same reading screen ---------
     A Review puts the Language exercises above the reading block, which no
     lesson page does. Two things have to hold there and hold nowhere else:
     the clock must cover the reading exercises and NOT the five Language
     tasks printed above it, and the question bar must number the questions
     it does cover from 1. */
  {
    const win = await settled(load("docs/review-1/index.html"));
    const doc = win.document;
    const pg = doc.querySelector('[data-role="passage"]');
    ok("review 1: the passage renders", !!pg);
    const paras = Array.from(pg.querySelectorAll('[data-pg="body"] p'));
    ok("review 1: five paragraphs, lettered A to E",
       paras.map(p => p.querySelector(".pg-l") && p.querySelector(".pg-l").textContent)
            .join("") === "ABCDE");

    const clock = doc.querySelector('[data-role="clock"]');
    ok("review 1: one clock on the page",
       doc.querySelectorAll('[data-role="clock"]').length === 1);

    const tasks = Array.from(doc.querySelectorAll('[data-role="task"]'));
    const player = doc.querySelector('[data-role="audio"]');
    ok("review 1: the page carries a Listening half", !!player);

    /* The territory rule, read straight off the page: five Language exercises
       above the clock, three reading exercises between the clock and the
       player, one listening exercise below the player. */
    const between = (a, b) =>
      !!(a.compareDocumentPosition(b) & win.Node.DOCUMENT_POSITION_FOLLOWING);
    const underClock = tasks.filter(t => between(clock, t) && !between(player, t));
    const underPlayer = tasks.filter(t => between(player, t));
    ok("review 1: the Language half is above the clock and not timed by it",
       tasks.length === 9 && underClock.length === 3,
       tasks.length + " tasks, " + underClock.length + " under the clock");
    ok("review 1: the clock hands over at the player",
       underPlayer.length === 1, underPlayer.length + " under the player");

    const nav = doc.querySelector(".c-nav");
    const qs = Array.from(nav ? nav.querySelectorAll(".c-q") : []);
    ok("review 1: the question bar covers only the reading exercises",
       qs.length === 15, qs.length);
    ok("review 1: numbered from 1 across the reading block",
       qs.length && qs[0].textContent === "1"
       && qs[qs.length - 1].textContent === String(qs.length));

    const txt = plain(paras[2]);
    drag(win, paras, 2, 6, 2, 22);
    const marks = pg.querySelectorAll("mark");
    ok("review 1: highlighting works on a Review passage too",
       marks.length === 1 && marks[0].textContent === txt.slice(6, 22),
       marks.length ? JSON.stringify(marks[0].textContent) : "");
    ok("review 1: the highlight is stored under the Review's own id",
       JSON.parse(win.localStorage.getItem("en8:marks:r1-2-p1") || "[]").length === 1);
  }

  /* ---- what each timer is allowed to switch off ------------------------
     A Review is the only page carrying two timers, and each one silences the
     exercises below it when its window shuts. The rule is that a timer owns
     the tasks under it and above the next timer. Both halves matter, and both
     are watched here by running the timers to expiry rather than by reading
     the selector: the player must not reach back over the five Language
     exercises -- the defect that kept the Reviews from having a Listening
     section at all -- and the clock must not reach forward into the listening
     exercise, which is the same defect facing the other way. */
  {
    /* Where each task sits, so the two runs below can name them. */
    const split = doc => {
      const tasks = Array.from(doc.querySelectorAll('[data-role="task"]'));
      const clock = doc.querySelector('[data-role="clock"]');
      const player = doc.querySelector('[data-role="audio"]');
      const after = (a, b) => !!(a.compareDocumentPosition(b) & 4);
      return {
        clock, player,
        language: tasks.filter(t => !after(clock, t)),
        reading: tasks.filter(t => after(clock, t) && !after(player, t)),
        listening: tasks.filter(t => after(player, t)),
      };
    };
    const inputs = ts => ts.flatMap(t => Array.from(t.querySelectorAll(".i-in, .i-opt input")));
    const allDead = ts => inputs(ts).length > 0 && inputs(ts).every(i => i.disabled);
    const allLive = ts => inputs(ts).length > 0 && inputs(ts).every(i => !i.disabled);

    {
      const win = await settled(load("docs/review-1/index.html", null, fastPage));
      const s = split(win.document);
      ok("review 1: three groups of tasks to tell apart",
         s.language.length === 5 && s.reading.length === 3 && s.listening.length === 1,
         s.language.length + "/" + s.reading.length + "/" + s.listening.length);
      ok("review 1: everything starts live",
         allLive(s.language) && allLive(s.reading) && allLive(s.listening));

      const state = s.player.querySelector(".p-state");
      click(win, s.player.querySelector(".p-start"));
      const shut = await until(win, () => /Time\./.test(state.textContent));
      ok("player: the recording runs and the review window closes", shut,
         JSON.stringify(state.textContent));
      ok("player: the listening exercise under it stops taking input",
         allDead(s.listening));
      ok("player: the Language exercises above it stay live", allLive(s.language),
         inputs(s.language).filter(i => i.disabled).length + " went dead");
      ok("player: the reading exercises above it stay live", allLive(s.reading),
         inputs(s.reading).filter(i => i.disabled).length + " went dead");
    }

    {
      const win = await settled(load("docs/review-1/index.html", null, fastPage));
      const s = split(win.document);
      const state = s.clock.querySelector(".c-state");
      click(win, s.clock.querySelector(".c-start"));
      const shut = await until(win, () => /Time\./.test(state.textContent));
      ok("clock: it runs out", shut, JSON.stringify(state.textContent));
      ok("clock: the reading exercises under it stop taking input", allDead(s.reading));
      ok("clock: the Language exercises above it stay live", allLive(s.language),
         inputs(s.language).filter(i => i.disabled).length + " went dead");
      ok("clock: it hands over at the player and leaves the listening alone",
         allLive(s.listening),
         inputs(s.listening).filter(i => i.disabled).length + " went dead");
    }
  }

  /* ---- the learning pass hands questions back; the test pass never does ---
     Phase 3's whole point is that a first exposure is practice, not an exam:
     attempt, see what went wrong, go again. The risk is the opposite one —
     that "go again" reaches a COMMITTED attempt, at which point the word
     limit, the spelling rule and the single play all stop meaning anything.
     So this drives both passes for real and checks the boundary from both
     sides. */
  {
    const win = await settled(load("docs/unit-01/lesson-6/index.html", null, fastPage));
    const doc = win.document;
    const player = doc.querySelector('[data-role="audio"]');
    const task = doc.querySelector('[data-task="01-6-6.2-1"]');
    ok("learn: the page has a player and a listening task", !!player && !!task);

    const inputs = () => Array.from(task.querySelectorAll(".i-in, .i-opt input"));
    const retry = () => player.querySelector(".p-retry");
    const check = task.querySelector(".t-check") || task.querySelector("button.btn");

    ok("learn: no Try-again before anything has been played",
       !retry() || retry().hidden);

    click(win, player.querySelector(".p-learn"));
    const played = await until(win, () =>
      /Practised/.test(player.querySelector(".p-lstate").textContent));
    ok("learn: practising plays and reports itself", played,
       JSON.stringify(player.querySelector(".p-lstate").textContent));
    ok("learn: practising does NOT spend the single play",
       win.localStorage.getItem("en8:played:01-6-1") === null,
       String(win.localStorage.getItem("en8:played:01-6-1")));

    /* Answer wrong on purpose, then commit it. */
    const first = inputs()[0];
    if (first){
      if (first.type === "radio"){ first.checked = true;
        first.dispatchEvent(new win.Event("change", { bubbles:true })); }
      else { first.value = "definitely-wrong";
        first.dispatchEvent(new win.Event("input", { bubbles:true })); }
    }
    click(win, check);
    ok("learn: checking locks the answers, as it always has",
       task.dataset.done === "1" && inputs().every(i => i.disabled));
    ok("learn: and the attempt is stored",
       /01-6-6\.2-1/.test(win.localStorage.getItem("en8:tasks:v1") || ""));

    const r = retry();
    ok("learn: Try-again appears once there is something to hand back",
       !!r && !r.hidden);
    click(win, r);
    ok("learn: it re-opens the inputs", inputs().every(i => !i.disabled));
    ok("learn: it clears the marks", task.dataset.done !== "1");
    ok("learn: it forgets the stored attempt, so a refresh cannot restore it",
       !/01-6-6\.2-1/.test(win.localStorage.getItem("en8:tasks:v1") || ""));

    /* Now the committed pass. From here nothing may be handed back. */
    click(win, player.querySelector(".p-start"));
    ok("test: starting the one play removes Try-again for good", !retry());
    const spent = await until(win, () =>
      win.localStorage.getItem("en8:played:01-6-1") !== null);
    ok("test: the single play is recorded as spent", spent);
    const shut = await until(win, () =>
      /Time\./.test(player.querySelector(".p-state").textContent), 6000);
    ok("test: the review window closes", shut,
       JSON.stringify(player.querySelector(".p-state").textContent));
    ok("test: no Try-again ever comes back", !retry());
  }

  /* ---- Try-again respects the player's territory --------------------------
     A Review is the one page where the player has exercises ABOVE it that are
     none of its business. Marking one of those must not offer to hand back the
     listening questions, must not unlock the script, and above all must not
     have its own committed mark cleared by a control belonging to a different
     block. */
  {
    const win = await settled(load("docs/review-1/index.html", null, fastPage));
    const doc = win.document;
    const player = doc.querySelector('[data-role="audio"]');
    const tasks = Array.from(doc.querySelectorAll('[data-role="task"]'));
    const language = tasks[0];
    ok("review page: a player with Language exercises above it",
       !!player && tasks.length > 1);

    click(win, player.querySelector(".p-learn"));
    await until(win, () => /Practised/.test(player.querySelector(".p-lstate").textContent));

    const inp = language.querySelector(".i-in") || language.querySelector(".i-opt input");
    if (inp){
      if (inp.type === "radio"){ inp.checked = true;
        inp.dispatchEvent(new win.Event("change", { bubbles:true })); }
      else { inp.value = "zz"; inp.dispatchEvent(new win.Event("input", { bubbles:true })); }
    }
    click(win, language.querySelector(".t-check") || language.querySelector("button.btn"));
    await new Promise(r => setTimeout(r, 40));

    const r = player.querySelector(".p-retry");
    ok("territory: marking a Language task offers no Try-again on the player",
       !r || r.hidden);
    ok("territory: and does not unlock the listening script",
       doc.querySelector(".p-script").hidden);
    ok("territory: the Language task keeps its committed mark",
       language.dataset.done === "1");
  }

  /* ---- the vocabulary intake: meet, recall, list -------------------------
     Three stages over one set. The stage that matters most is the last one,
     because it is where a well-meaning "you improved!" would go in and where
     E3/E9 say it may not. */
  {
    const win = await settled(load("docs/unit-01/lesson-2/index.html", null, fastPage));
    const doc = win.document;
    const box = doc.querySelector('[data-role="vocab"]');
    ok("intake: the intake renders on A Closer Look 1", !!box);

    const data = JSON.parse(doc.getElementById("page-data").textContent);
    const set = data.vocabIntake[0];
    ok("intake: it is chunked, not run whole",
       set.size < set.words.length, set.size + " of " + set.words.length);

    /* Stage 1 shows one word, and only one. */
    const shown = box.querySelectorAll(".v-w");
    ok("intake: stage one shows exactly one word", shown.length === 1, shown.length);
    ok("intake: with its Vietnamese", !!box.querySelector(".v-vi"));

    /* Walk the whole first set; the last card hands over to the engine. */
    for (let i = 0; i < set.size; i++) {
      const next = box.querySelector('[data-v="next"]');
      if (!next) break;
      click(win, next);
      await new Promise(r => setTimeout(r, 20));
    }
    ok("intake: the last card hands over to the question engine",
       !!box.querySelector(".engine"), box.querySelector(".v-stage").innerHTML.slice(0, 60));

    /* Stage three is reached by seeding a finished attempt rather than by
       answering through the engine: the engine re-queues a miss on purpose
       ("wrong answers come straight back"), so a walk that answers everything
       wrong never terminates. Seeding also exercises the restore path — a
       learner returning tomorrow lands on the set they finished, not back at
       word one. */
    const w2 = await settled(load("docs/unit-01/lesson-2/index.html", {
      ["en8:intake:" + set.id]: JSON.stringify([
        { set: 0, right: 5, total: 9, at: Date.now() - 8e4 },
        { set: 0, right: 7, total: 9, at: Date.now() },
      ]),
    }, fastPage));
    const box2 = w2.document.querySelector('[data-role="vocab"]');
    ok("intake: a returning learner lands on the set they finished",
       !!box2.querySelector(".v-list"));
    ok("intake: and is offered the same set again",
       !!box2.querySelector('[data-v="retest"]'));

    const log = box2.querySelector(".v-log").textContent;
    ok("intake: both attempts are listed separately",
       /#1 — 5\/9/.test(log) && /#2 — 7\/9/.test(log), log.slice(0, 110));
    ok("intake: nothing is totalled, averaged or called progress",
       !/total|average|overall|mastered|improv|better|worse|%/i.test(log),
       log.slice(0, 160));
  }

  /* ---- a retake is a new attempt, and never reaches a spent timer ---------
     Repeated retrieval is what builds memory, so an untimed task offers
     "Try it again". The two things that must hold: the attempt history
     survives the reset (or the second go is the only one that ever existed),
     and the button is absent on anything a timer has already spent -- a
     retake on a single-play listening set repeals C6 without saying so. */
  {
    const win = await settled(load("docs/unit-01/lesson-2/index.html", null, fastPage));
    const doc = win.document;
    const task = doc.querySelector('[data-role="task"]');
    const answer = (t, v) => {
      const box = t.querySelector(".i-in");
      if (box){ box.value = v; box.dispatchEvent(new win.Event("input", { bubbles:true })); return; }
      const radio = t.querySelectorAll(".i-opt input")[v === "right" ? 0 : 1];
      if (radio){ radio.checked = true;
        radio.dispatchEvent(new win.Event("change", { bubbles:true })); }
    };

    answer(task, "zz");
    click(win, task.querySelector(".t-check"));
    await new Promise(r => setTimeout(r, 40));
    ok("retake: an untimed task is committed on Check", task.dataset.done === "1");

    const again = task.querySelector(".t-again");
    ok("retake: an untimed task offers Try it again", again && !again.hidden);

    click(win, again);
    await new Promise(r => setTimeout(r, 40));
    ok("retake: the second go starts blank, not editable-in-place",
       task.dataset.done !== "1"
       && !task.querySelector(".i-out").innerHTML.trim()
       && !(task.querySelector(".i-in") || {}).disabled);

    answer(task, "zz");
    click(win, task.querySelector(".t-check"));
    await new Promise(r => setTimeout(r, 40));
    const hist = task.querySelector(".t-log").textContent;
    ok("retake: both attempts are kept", /#1/.test(hist) && /#2/.test(hist), hist.slice(0, 90));
    ok("retake: attempts are not totalled, averaged or called an improvement",
       !/total|average|overall|better|worse|improv|%/i.test(hist), hist.slice(0, 120));

    /* And the half that protects the constitution. */
    const w2 = await settled(load("docs/unit-01/lesson-6/index.html", null, fastPage));
    const d2 = w2.document;
    const player = d2.querySelector('[data-role="audio"]');
    const listening = owned2(d2, player)[0];
    ok("retake: the listening page has a player with tasks below it", !!player && !!listening);
    click(w2, player.querySelector(".p-start"));
    await new Promise(r => setTimeout(r, 60));
    const li = listening.querySelector(".i-opt input") || listening.querySelector(".i-in");
    if (li){
      if (li.type === "radio"){ li.checked = true;
        li.dispatchEvent(new w2.Event("change", { bubbles:true })); }
      else { li.value = "zz"; li.dispatchEvent(new w2.Event("input", { bubbles:true })); }
    }
    listening.querySelectorAll(".i-conf button[data-conf='1']")
      .forEach(b => click(w2, b));
    click(w2, listening.querySelector(".t-check"));
    await new Promise(r => setTimeout(r, 40));
    const a2 = listening.querySelector(".t-again");
    /* Both halves are load-bearing and were probed: the task really does reach
       done=1, and `.t-again` really is present in the shell. Without either,
       this assertion would pass by accident and guard nothing. */
    ok("retake: the spent-play task is committed", listening.dataset.done === "1");
    ok("retake: no Try it again on a task whose single play is spent",
       !a2 || a2.hidden, a2 ? "shown" : "absent");
  }

  /* ---- the review queue is interleaved, not grouped ----------------------
     Blocked practice — one kind of thing at a time — wins while a distinction
     is new; interleaved practice wins on a delayed test. The course gets that
     shape for free: a lesson exercise drills one thing, and the spaced queue
     is the delayed test, so it should MIX.

     Nothing enforced it, which is the gap. Grouping the queue by type is the
     tidy-looking change that would quietly put it on the wrong side of that
     trade-off, and no other check here would notice. */
  {
    const seeded = {};
    const day = Math.floor(Date.now() / 86400000);
    /* Seeds are READ OFF the built payload, never hand-written. Hard-coded
       exercise ids ("01:grammar:3.1-1") make this test fail whenever a unit
       renumbers an exercise or the enrolment rule changes which item it takes
       — a false alarm about content, dressed as a failure of the queue. What
       is under test is that the queue interleaves, and that holds whichever
       items happen to be enrolled. */
    const home = JSON.parse(/<script id="page-data"[^>]*>([\s\S]*?)<\/script>/
      .exec(fs.readFileSync(path.join(ROOT, "docs/index.html"), "utf8"))[1]);
    const perKind = {};
    for (const r of home.review) {
      if (r.type === "word" || r.type === "colloc") continue;
      (perKind[r.type] = perKind[r.type] || []).push(r);
    }
    /* One item of each kind, from as many different units as there are kinds,
       so a queue that grouped by unit would look grouped by kind too. */
    const want = [];
    Object.keys(perKind).forEach((kind, i) => {
      const seen = new Set();
      for (const r of perKind[kind]) {
        if (seen.has(r.unit) || want.length >= 8) continue;
        seen.add(r.unit);
        want.push(r);
        if (seen.size >= 3) break;
      }
    });
    const rec = {};
    for (const r of want)
      rec[r.unit + ":" + r.type + ":" + String(r.id).toLowerCase()] =
        { due: day - 1, seen: 1, kept: 0, delayed: 0 };
    seeded["en8:review:v1"] = JSON.stringify(rec);

    /* Seeded in beforeParse, not after: REVIEW is read at module scope while
       the scripts execute, so anything written afterwards is invisible to it. */
    const win = await settled(load("docs/index.html", seeded, w => {
      /* fastPage as well as the seed: a choice item defers its confidence
         prompt by 300ms, and a walk that does not wait for it re-reads the
         same question and reports a queue that looks grouped when it is not. */
      fastPage(w);
      for (const k of Object.keys(seeded)) w.localStorage.setItem(k, seeded[k]);
    }));
    const doc = win.document;
    const payload = JSON.parse(doc.getElementById("page-data").textContent);
    const byKey = {};
    for (const r of payload.review)
      byKey[r.unit + ":" + (r.type === "word" ? "" : r.type + ":") + String(r.id).toLowerCase()] = r;

    const due = Object.keys(rec).filter(k => byKey[k]);
    ok("review: the seeded records match real payload items", due.length >= 6,
       due.length + " of " + want.length + " resolved");

    const kinds = due.map(k => byKey[k].type);
    ok("review: more than one kind is due at once", new Set(kinds).size >= 2,
       JSON.stringify(kinds));

    const card = doc.querySelector("#reviewCard");
    ok("review: the review card is shown when items are due", card && !card.hidden);
    const kindTable = doc.querySelector("#reviewKinds table");
    ok("review: the per-kind table renders", !!kindTable);
    ok("review: the per-kind table totals nothing",
       !kindTable || !/total|overall|mastery|\bscore\b/i.test(kindTable.textContent),
       kindTable ? JSON.stringify(kindTable.textContent.slice(0, 80)) : "");

    /* Run the queue and read the order of kinds off the rendered prompts. */
    const start = doc.querySelector("#startReview");
    ok("review: there is a start control", !!start);
    click(win, start);
    await new Promise(r => setTimeout(r, 40));
    const host = doc.querySelector("#reviewEngine");
    ok("review: the engine opens", host && !host.hidden);

    /* The engine shows one item at a time, so walk it: read the kind label,
       then answer to advance. Ten steps is plenty to catch grouping. */
    /* Exactly one pass over the pool. A missed item is re-queued at the END,
       and those repeats would break any grouping pattern by themselves — so a
       walk that ran past the first pass could not tell a grouped queue from a
       shuffled one, and would pass either way. */
    const seen = [];
    for (let step = 0; step < due.length; step++) {
      const lede = host.querySelector(".lede");
      if (!lede) break;
      seen.push(lede.textContent.split("·")[0].trim());
      const opt = host.querySelector(".choices button");
      const inp = host.querySelector("#ans");
      if (opt) click(win, opt);
      else if (inp) { inp.value = "x"; click(win, host.querySelector("#go")); }
      else break;
      await new Promise(r => setTimeout(r, 20));
      const conf = host.querySelector('[data-conf="0"]');
      if (conf) click(win, conf);
      await new Promise(r => setTimeout(r, 10));
      const next = host.querySelector("#next");
      if (next) click(win, next);
      await new Promise(r => setTimeout(r, 10));
    }
    const labels = seen.filter(Boolean);
    ok("review: the queue presented the whole pool once",
       labels.length === due.length, labels.length + " of " + due.length);
    /* Grouped would mean every run of one kind is contiguous. Interleaved
       means at least one kind reappears after a different kind. */
    /* Grouped = every run of a kind is contiguous, i.e. no kind ever comes
       back after a different kind has intervened. */
    const grouped = labels.every((l, i) => i === 0 || l === labels[i - 1]
      || !labels.slice(0, i).includes(l));
    ok("review: kinds are interleaved, not grouped into blocks", !grouped,
       JSON.stringify(labels));
  }

  console.log(fails
    ? "\n" + passes + " passed, " + fails + " FAILED"
    : "PASS: " + passes + " reading-screen checks — paragraph labels, highlighting, "
      + "notes, question bar and review flag (C9)");
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.log("FAIL: " + e.stack); process.exit(1); });
