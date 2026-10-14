#!/usr/bin/env bash
# Runs the browser tests. This is the project's TEST_CMD and
# INTERACTION_TEST_CMD: `bash tests/support/playwright.sh [file ...]`.
#
# A test still waiting in .specs/verify/<slug>/scribe-tests/ imports its
# helpers as if it already lived in tests/, and Playwright only looks in
# tests/. So such a file is run from a copy in tests/, removed afterwards —
# otherwise it would "fail" for not being found, which proves nothing.
set -uo pipefail
cd "$(dirname "$0")/../.."

args=() ; borrowed=()
for a in "$@"; do
  case "$a" in
    .specs/verify/*/scribe-tests/*|*/.specs/verify/*/scribe-tests/*)
      dest="tests/$(basename "$a")"
      if [[ -e "$dest" ]]; then
        echo "playwright.sh: $dest already exists; not overwriting it with the staged copy" >&2
        exit 2
      fi
      cp "$a" "$dest"; borrowed+=("$dest"); args+=("$dest") ;;
    *) args+=("$a") ;;
  esac
done
cleanup() { for f in ${borrowed[@]+"${borrowed[@]}"}; do rm -f "$f"; done; }
trap cleanup EXIT

npx playwright test ${args[@]+"${args[@]}"}
