#!/usr/bin/env bash
#
# Every gate this repo has, in the one order that makes them mean anything.
#
# The push is the deploy: GitHub Pages serves docs/ from main directly, with no
# CI between the commit and the live site. So "run every gate before you push"
# was the whole safety net, and it was nine remembered commands with an
# ordering constraint buried in a README sentence — check_write.js and
# test_reading.js read the *built* pages, so running them before build.py marks
# the previous build's output and passes on work that no longer exists. That
# ordering is why a runner beats a list.
#
#   tools/gates.sh            after editing units/, data/, art/ or tools/
#   tools/gates.sh --deploy   what .git/hooks/pre-push runs: the same gates,
#                             and docs/ must already match a fresh build
#
# --deploy adds two demands that only matter at the moment of publishing:
# the committed docs/ has to equal what today's sources build, and the reading
# gate is not allowed to skip itself for a missing jsdom. Neither is a defect
# mid-edit, which is why the default run reports them and carries on.
#
# check_coverage.py is reported and never failed, here as everywhere: coverage
# against the official book is a curriculum decision, and the record says the
# point is to make the decision visible rather than fail a build over it. A
# drop below 100% prints loudly and still exits 0.
#
set -u

# git exports GIT_DIR to its hooks, and an inherited GIT_DIR poisons every git
# command below — because with GIT_DIR set and GIT_WORK_TREE unset, git takes
# **the current directory** to be the top of the work tree. So
# `git -C tools rev-parse --show-toplevel` answered "tools", this script cd'd
# into tools/, every gate invoked as `tools/build.py` was not found, and
# `git status -- docs` reported all 271 files outside tools/ as deleted. From a
# terminal it was invisible; from the pre-push hook it failed everything. It
# cost a teammate a push and an afternoon, and it always resolved to a *wrong
# answer* rather than an error, which is the failure mode worth the most care.
#
# gates.sh always means the checkout it is part of, so the inherited
# environment is never what we want. Discovery from the script's own path is.
unset GIT_DIR GIT_WORK_TREE

ROOT=$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null) \
  || ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT" || exit 2

# And then say so out loud, because the bug above was silent. If ROOT is ever
# wrong again, this stops at the door instead of reporting nine red gates and a
# tree full of phantom deletions.
for needed in tools/build.py units docs; do
  if [ ! -e "$needed" ]; then
    echo "gates.sh: $ROOT is not the repo root — no $needed in it." >&2
    echo "          Refusing to run: every result from here would be a lie." >&2
    exit 2
  fi
done

DEPLOY=0
for arg in "$@"; do
  case "$arg" in
    --deploy) DEPLOY=1 ;;
    -h|--help) sed -n '2,28p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "gates.sh: unknown argument: $arg" >&2; exit 2 ;;
  esac
done

if [ -t 1 ]; then
  BOLD=$'\033[1m'; RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'
  DIM=$'\033[2m'; OFF=$'\033[0m'
else
  BOLD=""; RED=""; GREEN=""; YELLOW=""; DIM=""; OFF=""
fi

FAILED=()
SKIPPED=()
LOG=$(mktemp -t gates)
trap 'rm -f "$LOG"' EXIT

# run <label> <command...> — runs it quietly, prints one line, and keeps the
# output only to show it when something went wrong. A gate nobody reads the
# output of is a gate; a gate whose noise buries the one failure is not.
run() {
  local label=$1; shift
  printf '  %-36s' "$label"
  if "$@" >"$LOG" 2>&1; then
    if grep -q '^SKIP:' "$LOG"; then
      printf '%sSKIP%s\n' "$YELLOW" "$OFF"
      SKIPPED+=("$label")
      sed 's/^/      /' "$LOG"
      return 0
    fi
    printf '%sok%s\n' "$GREEN" "$OFF"
    return 0
  fi
  printf '%sFAIL%s\n' "$RED$BOLD" "$OFF"
  sed 's/^/      /' "$LOG"
  FAILED+=("$label")
  return 1
}

echo
echo "${BOLD}Gates${OFF}${DIM}  ($ROOT)${OFF}"
echo

# The build comes first and writes for real, because the two page-reading gates
# below have nothing to read otherwise, and because --deploy compares its
# output against what is committed.
run 'build.py' python3 tools/build.py
BUILD_OK=$?

# The source gates. Each reads units/*.md and its own reference data; none of
# them needs docs/, so their order among themselves carries no meaning.
run 'check_dict.py' python3 tools/check_dict.py
run 'check_ielts.py' python3 tools/check_ielts.py
run 'check_level.py --strict-through 12' python3 tools/check_level.py --strict-through 12
run 'check_cast.py' python3 tools/check_cast.py
run 'index_sgk.py --check' python3 tools/index_sgk.py --check
run 'test_marking.js' node tools/test_marking.js

# The two that read the built pages. They only mean anything after build.py —
# and a failed build leaves docs/ emptied, so running them anyway would print
# "run build.py first" over the top of the real failure and bury it.
if [ "$BUILD_OK" -eq 0 ]; then
  run 'check_write.js' node tools/check_write.js
  run 'test_reading.js' node tools/test_reading.js
else
  printf '  %-36s%s\n' 'check_write.js' "${DIM}not run — the build failed${OFF}"
  printf '  %-36s%s\n' 'test_reading.js' "${DIM}not run — the build failed${OFF}"
fi

# --- reports: never a failure, always printed ------------------------------

echo
echo "${BOLD}Reports${OFF}"
echo
COVERAGE=$(python3 tools/check_coverage.py 2>&1)
TOTAL=$(printf '%s\n' "$COVERAGE" | grep -E '^ +TOTAL' | tail -1 | tr -s ' ')
if [ -n "$TOTAL" ]; then
  echo "  coverage vs the official book:    ${TOTAL#* TOTAL }"
  case "$TOTAL" in
    *100%*) ;;
    *) echo
       echo "  ${YELLOW}${BOLD}Coverage is below 100%.${OFF} The standing rule is that this site is at"
       echo "  least as complete as the prescribed book on every target. Run"
       echo "  python3 tools/check_coverage.py --full to see what is missing."
       echo "  Not a failure: closing a gap is a curriculum decision, not a build one."
       ;;
  esac
else
  echo "  ${YELLOW}coverage report produced no total — check_coverage.py may have changed${OFF}"
fi

# check_cast's own first line already counts what is drawn; quoting it beats
# recounting it here, where a change to its wording would silently rot.
DRAWN=$(python3 tools/check_cast.py 2>&1 | grep -o '[0-9]* of [0-9]* drawn' | tail -1)
[ -n "$DRAWN" ] && echo "  art drawn:                        $DRAWN — python3 tools/check_cast.py"

# --- --deploy: the two things that only matter at the push -----------------

if [ "$DEPLOY" -eq 1 ]; then
  echo
  echo "${BOLD}Deploy checks${OFF}"
  echo
  printf '  %-36s' 'docs/ matches a fresh build'
  # build.py has just run, so anything dirty under docs/ or the register means
  # the committed output is not what these sources produce.
  DIRTY=$(git status --porcelain -- docs research/evidence-register.md)
  if [ -z "$DIRTY" ]; then
    printf '%sok%s\n' "$GREEN" "$OFF"
  else
    printf '%sFAIL%s\n' "$RED$BOLD" "$OFF"
    printf '%s\n' "$DIRTY" | sed 's/^/      /'
    echo
    SRC=$(git status --porcelain -- units data tools art curriculum)
    if [ -n "$SRC" ]; then
      echo "      You have uncommitted source edits, so the build above reflects"
      echo "      work this push does not carry. Commit the sources and the"
      echo "      regenerated docs/ together, or stash them."
    else
      echo "      The committed docs/ is not what units/ builds. It was either"
      echo "      hand-edited or left stale — commit the regenerated output."
    fi
    FAILED+=('docs/ matches a fresh build')
  fi

  if [ ${#SKIPPED[@]} -gt 0 ]; then
    printf '  %-36s' 'no gate skipped itself'
    printf '%sFAIL%s\n' "$RED$BOLD" "$OFF"
    echo "      ${SKIPPED[*]} skipped. A skip is fine while editing and not at"
    echo "      the push: npm install jsdom, then push again."
    FAILED+=('no gate skipped itself')
  fi
fi

# --- verdict ---------------------------------------------------------------

echo
if [ ${#FAILED[@]} -eq 0 ]; then
  if [ "$DEPLOY" -eq 1 ]; then
    echo "${GREEN}${BOLD}All gates green.${OFF} Safe to publish."
  else
    echo "${GREEN}${BOLD}All gates green.${OFF}"
  fi
  echo
  exit 0
fi

echo "${RED}${BOLD}${#FAILED[@]} gate(s) failed:${OFF} ${FAILED[*]}"
if [ "$DEPLOY" -eq 1 ]; then
  echo "Nothing was pushed. GitHub Pages serves docs/ from main with no CI, so"
  echo "this is the last thing standing between a broken gate and the live site."
fi
echo
exit 1
