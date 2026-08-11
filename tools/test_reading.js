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

function load(rel, store) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    console.log("FAIL: " + rel + " is not built — run `python3 tools/build.py` first");
    process.exit(1);
  }
  let html = fs.readFileSync(p, "utf8");
  /* A replacer FUNCTION, not a string: app.js contains "$$", which a
     replacement string would read as a substitution pattern and corrupt. */
  html = html.replace(/<script src="[^"]*app\.js"[^>]*><\/script>/,
                      () => "<script>" + APP + "<\/script>");
  const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true,
                                url: "https://example.org/" + rel });
  dom.window.scrollTo = () => {};
  if (store) for (const k of Object.keys(store)) dom.window.localStorage.setItem(k, store[k]);
  return dom;
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
    const under = tasks.filter(t =>
      clock.compareDocumentPosition(t) & win.Node.DOCUMENT_POSITION_FOLLOWING);
    ok("review 1: the Language half is above the clock and not timed by it",
       tasks.length === 8 && under.length === 3, tasks.length + " tasks, " + under.length
       + " under the clock");

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

  console.log(fails
    ? "\n" + passes + " passed, " + fails + " FAILED"
    : "PASS: " + passes + " reading-screen checks — paragraph labels, highlighting, "
      + "notes, question bar and review flag (C9)");
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.log("FAIL: " + e.stack); process.exit(1); });
