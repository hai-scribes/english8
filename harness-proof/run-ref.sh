#!/bin/bash
# usage: run-ref.sh "<defect>" scenario...   — rebuild the throwaway ref, boot its stack, run scenarios
cd "$(dirname "$0")"
export TMPDIR="${TMPDIR:-/tmp}"
D="$1"; shift
rsync -a "${LANE:?set LANE to the checkout whose harness/ you are testing}/harness/" harness/
./make-ref.sh "$D" >/dev/null
pkill -f "$PWD/harness/serve.mjs" ; sleep 2
rm -f .atelier/harness/ports.json
ATELIER_VARIANT_PORT=18799 node "$PWD/harness/serve.mjs" > $TMPDIR/ref-serve.log 2>&1 &
SP=$!
for i in $(seq 1 90); do test -f .atelier/harness/ports.json && break; sleep 2; done
test -f .atelier/harness/ports.json || { echo "SERVE NEVER READY"; tail -20 $TMPDIR/ref-serve.log; kill $SP; exit 1; }
for rep in $(seq 1 ${REPS:-1}); do for s in "$@"; do
  echo "=== [$D] $s"
  node harness/$s.mjs > $TMPDIR/last-$s.log 2>&1; grep -E "^(PASS|FAIL|ATELIER_METRIC|  ·|  [a-z0-9])" $TMPDIR/last-$s.log | head -30
done; done
kill $SP; sleep 1; pkill -f "$PWD/harness/serve.mjs"
