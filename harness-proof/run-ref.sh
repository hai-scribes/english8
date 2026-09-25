#!/bin/bash
# usage: run-ref.sh "<defect>" scenario...   — rebuild the throwaway ref, boot its stack, run scenarios
# GAPI_SHIM=1 serves apis.google.com/js/api.js locally (gapi-shim.js), for a
# sandbox whose network policy denies that host; see gapi-shim.js.
cd "$(dirname "$0")"
export TMPDIR="${TMPDIR:-/tmp}"
D="$1"; shift
mkdir -p harness && cp -a "${LANE:?set LANE to the checkout whose harness/ you are testing}/harness/." harness/
./make-ref.sh "$D" >/dev/null
pkill -f "$PWD/harness/serve.mjs" ; sleep 2
rm -f .atelier/harness/ports.json
ATELIER_VARIANT_PORT=18799 node "$PWD/harness/serve.mjs" > $TMPDIR/ref-serve.log 2>&1 &
SP=$!
for i in $(seq 1 90); do test -f .atelier/harness/ports.json && break; sleep 2; done
test -f .atelier/harness/ports.json || { echo "SERVE NEVER READY"; tail -20 $TMPDIR/ref-serve.log; kill $SP; exit 1; }
PRE=(); [ "${GAPI_SHIM:-}" = 1 ] && PRE=(--import "$PWD/gapi-offline.mjs")
for rep in $(seq 1 ${REPS:-1}); do for s in "$@"; do
  echo "=== [$D] $s"
  T0=$SECONDS; node "${PRE[@]}" harness/$s.mjs > $TMPDIR/last-$s.log 2>&1; echo "  (${s}: $((SECONDS-T0))s)"; grep -E "^(PASS|FAIL|ATELIER_METRIC|  ·|  [a-z0-9])" $TMPDIR/last-$s.log | head -30
done; done
kill $SP; sleep 1; pkill -f "$PWD/harness/serve.mjs" || true
