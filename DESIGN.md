---
version: alpha
name: English 8
description: >
  Self-study pages for a grade-8 learner. One system typeface, grouped white
  cards on a grey ground, one accent colour, and motion that answers a touch
  and then gets out of the way.
colors:
  paper: "#f2f2f7"
  surface: "#ffffff"
  raised: "#f6f6f9"
  sunk: "#ececf1"
  ink: "#1d1d1f"
  muted: "#6a6a6f"
  faint: "#8e8e93"
  rule: "#d8d8de"
  rule-soft: "#e9e9ee"
  primary: "#0a776a"
  primary-wash: "#e2f1ee"
  on-primary: "#ffffff"
  clay: "#b8561f"
  clay-wash: "#fbeee5"
  success: "#1a7d35"
  success-wash: "#e4f4e8"
  on-success: "#ffffff"
  error: "#c9241b"
  error-wash: "#fdecea"
  on-error: "#ffffff"
  warning: "#9a5b00"
  warning-wash: "#fff3dc"
colors-dark:
  paper: "#000000"
  surface: "#1c1c1e"
  raised: "#242427"
  sunk: "#2c2c2e"
  ink: "#f5f5f7"
  muted: "#a1a1a6"
  faint: "#7c7c80"
  rule: "#38383a"
  rule-soft: "#2c2c2e"
  primary: "#3fc9b3"
  primary-wash: "#10302b"
  on-primary: "#03201b"
  clay: "#ff9f5a"
  clay-wash: "#3a2414"
  success: "#32d15a"
  success-wash: "#0f2c17"
  on-success: "#04210d"
  error: "#ff6b61"
  error-wash: "#3a1614"
  on-error: "#2b0806"
  warning: "#ffc94a"
  warning-wash: "#332708"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontWeight: 650
    letterSpacing: -0.018em
  word:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "clamp(2rem, 8vw, 2.6rem)"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: -0.03em
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 17px
    lineHeight: 1.5
    letterSpacing: -0.011em
  button:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: 1rem
    fontWeight: 600
  label:
    fontFamily: "{typography.body.fontFamily}"
    fontSize: 0.75rem
    fontWeight: 600
  code:
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
rounded:
  md: 12px
  lg: 18px
  full: 999px
spacing:
  gutter: 1rem
  card: 1.35rem
  shell: "min(50rem, 100% - 2rem)"
  target-min: 2.75rem
elevation:
  rest: "0 1px 1px rgba(0,0,0,.03), 0 2px 10px rgba(0,0,0,.04)"
  lift: "0 2px 6px rgba(0,0,0,.06), 0 14px 36px rgba(0,0,0,.10)"
  float: "0 1px 2px rgba(0,0,0,.08), 0 10px 30px rgba(0,0,0,.16)"
motion:
  ease: "cubic-bezier(.32, .72, 0, 1)"
  ease-settle: "cubic-bezier(.2, .8, .2, 1)"
  press: 120ms
  state: 150ms
  enter: 280ms
  card-next: 260ms
  card-back: 300ms
  card-throw: "spring, 0.4s period, starting at the finger's speed"
  card-return: "spring, 0.5s period, slight overshoot"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.72rem 1.25rem"
    height: "{spacing.target-min}"
  button-quiet:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  word-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "1.3rem 1.35rem"
  chip:
    backgroundColor: "{colors.sunk}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  stack-done:
    backgroundColor: "{colors.success-wash}"
    textColor: "{colors.success}"
---

# English 8

This file describes the interface as it is built today. Every value above was
read out of `tools/assets/app.css`; where the stylesheet and this file ever
disagree, the stylesheet is right and this file is out of date.

## Overview

A thirteen-year-old opens a lesson alone on a weekday, usually on a phone. The
page has to say what to do and then be easy to do it on. The look is the
platform's own: the system typeface, grouped cards on a grey ground, generous
touch targets, sentence-case labels. It should feel like a well-made native
app, not like a school worksheet and not like a game.

The interface never explains itself. No account of why a page is built the way
it is, no criteria, no levels, no scores added up, no points, badges or
streaks. A design change that needs a sentence of explanation on the page is
the wrong change.

## Colors

- **Ground and surfaces.** `paper` is the page; `surface` is a card on it;
  `raised` and `sunk` are the two steps used inside a card (a filled field, a
  quiet button, an example sentence). Depth comes from these four steps before
  it comes from shadow.
- **Ink.** `ink` for reading, `muted` for secondary lines, `faint` for the
  least important label. Three steps and no more.
- **One accent.** `primary` (teal) is the only colour that means "this is the
  thing to press" or "this is the word being taught". Used sparingly so that
  it keeps that meaning.
- **Meaning colours.** `success` green is a right answer and a finished stack;
  `error` red is a wrong answer; `warning` amber is the clock running low;
  `clay` is the story's warm secondary. Each has a `-wash` for fills, and
  solid green and red carry their own text colour (`on-success`, `on-error`)
  because white on them fails in dark mode. A colour
  never carries meaning on its own: a tick, a word or a position says it too.
- **Dark mode is a full set**, not an inversion. Nothing below the token block
  hard-codes a colour, which is what lets system, forced-light and forced-dark
  all resolve.

## Typography

One typeface family, the system's. Weight and size do the work a second
typeface would otherwise do.

- Headings at 650; the taught word on a card at 750 and large, because the
  word is the content.
- Body at 17px, line-height 1.5, slightly tightened tracking.
- Labels in sentence case at 0.75rem / 600. No small caps, no wide-tracked
  uppercase in the interface layer.
- Vietnamese is set in the same face and must never be clipped: leave room for
  stacked diacritics (ễ, ộ, ữ) in any line-height below 1.3.
- Tabular figures wherever numbers line up or change in place.

## Layout

- A single column, `shell` wide, with a 1rem gutter on a phone. A wide screen
  gets two columns only in a timed test (text left, questions right).
- Cards group related things; cards do not nest more than one level.
- Every control is at least 2.75rem (44pt) tall.
- No horizontal page scroll at any width.

## Elevation

Three shadows. `rest` for a card lying on the page, `lift` for the thing
currently under the finger or on top of a deck, `float` for what sits above
the page (the Words button, a sheet). In dark mode shadow is replaced by a
hairline of light, because a shadow on black is invisible.

## Shapes

12px for controls and inner blocks, 18px for cards, fully round for chips and
pills. Concentric corners: an inner radius is smaller than the one around it.

## Motion

- Motion answers a touch or shows where something went. It never plays for
  its own sake and never loops under reading text.
- Presses and state changes are fast (120–160ms). Something entering takes
  under 300ms, and leaves faster than it came.
- A thrown card keeps the speed the finger gave it, can be caught in the air,
  and springs back if the finger turns round. A step taken from the keyboard
  cuts with no animation.
- Curves decelerate into place. Nothing eases in on its own.
- Only `transform` and `opacity` animate. No animated layout properties and no
  `transition: all`.
- A drag follows the finger with no transition, and springs or flies when
  released.
- Under `prefers-reduced-motion` nothing moves, scales or rotates; short
  fades of opacity and colour stay, and everything still works.
- Nothing listens for `scroll`, `wheel` or `touchmove`.

## Components

- **Button.** Filled teal for the one primary action in view; `sunk` with teal
  text for the quiet ones beside it. At most one primary per group.
- **Card.** White, 18px corners, on the grey ground.
- **Word card.** The word large, part of speech as a small teal pill beside
  the pronunciation, the Vietnamese meaning, one example with the word in
  teal, then its collocations as pills.
- **Stack.** A set of words as a small pile of cards with its number. Neutral
  until its questions have been answered, then green with a tick.
- **Chip.** A small pill for a count or a past run. Runs are listed one by
  one and never added up.
- **Question.** One at a time; a right pick glows and moves on, a wrong pick
  shows the answer in place and waits.
- **Account.** In the header, before the theme button: the email in muted
  text and one small `sunk` pill (*Sign out*), or the pill alone (*Sign in
  with Google*). The status is a sentence on its own line under the bar,
  muted, right-aligned (left on a phone), and takes no room while it has
  nothing to say. The whole header is put away during a timed test.
- **Your days.** On Today, under the day's card: a plain list, one line per
  day worked, grouped by week. Not a chart, and no figure to beat.
- **Chapter check.** Under a story chapter, *I've finished reading* puts
  the text away and asks three questions about it, one at a time, in the
  Question style. No score; the chapter is read once the three are answered,
  and *Read it again* brings the text back.

## Do's and Don'ts

- Do keep instructions to one short sentence of what to do.
- Do make options the real words, never grammar labels.
- Do keep answers picked, tapped or built. Never a text box for a marked item.
- Do give every state a non-colour cue.
- Don't add points, badges, streaks, confetti, mascots or praise copy.
- Don't show a total, a percentage, an average, a trend or elapsed time.
- Don't add a second typeface, a gradient ground or decorative illustration to
  lesson pages; the comic in Lesson 1 is the only drawn art.
- Don't introduce a colour outside the token set.
- Don't explain the design on the page.
