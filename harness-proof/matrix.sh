#!/bin/bash
# usage: matrix.sh [REPS]   — the whole proof, as one command.
#
# Every scenario on the correct reference must pass every gate line, and every
# defect must turn its own scenario red ON THE GATE LINE THAT NAMES IT — a
# defect that fails for some other reason (a timeout, a crash) proves nothing
# about the check it was built to trip. Prints one verdict per run and a
# summary; exits non-zero on any mismatch. Env as for run-ref.sh (LANE,
# GAPI_SHIM, TMPDIR).
cd "$(dirname "$0")"
REPS="${1:-1}"
OUT="${TMPDIR:-/tmp}/matrix-$$"; mkdir -p "$OUT"

# defect | scenario | the gate line that must FAIL ("" = every line must PASS)
CASES=(
  "|sync|" "|rhythm|" "|session|" "|speed|"
  "no-repaint|sync|progress travels"
  "blob-lww|sync|progress travels"
  "no-rules|sync|progress travels"
  "open-rules|sync|cross-account isolation"
  "shared-doc+open-rules|sync|cross-account isolation"
  "utc-day|rhythm|daily and weekly record"
  "streak|rhythm|no streak, score, comparison or time spent"
  "minutes|rhythm|no streak, score, comparison or time spent"
  "silent-push|session|nothing happens silently"
  "no-sw|session|session behaviour"
  "stale-sw|session|session behaviour"
  "cloud-render|speed|nothing cloud-bound in the render path"
  "slow-save|speed|p95 interaction under 100ms"
)

ok=0; bad=0
for rep in $(seq 1 "$REPS"); do
  for c in "${CASES[@]}"; do
    IFS='|' read -r D S WANT <<<"$c"
    log="$OUT/${D:-correct}-$S-$rep.log"
    ./run-ref.sh "$D" "$S" > "$log" 2>&1
    if [ -z "$WANT" ]; then
      if grep -q '^PASS' "$log" && ! grep -q '^FAIL' "$log"; then v=OK; else v=MISMATCH; fi
    else
      if grep -q "^FAIL  $WANT" "$log"; then v=OK; else v=MISMATCH; fi
    fi
    t=$(grep -oE "\(${S}: [0-9]+s\)" "$log" | head -1)
    printf '%-9s rep %-3s %-24s %-8s %s\n' "$v" "$rep" "${D:-correct}" "$S" "$t"
    if [ "$v" = OK ]; then ok=$((ok+1)); else bad=$((bad+1)); sed 's/^/    /' "$log" | grep -E '^    (FAIL|  ·)' | head -8; fi
  done
done
echo "matrix: $ok as expected, $bad mismatched (logs in $OUT)"
[ "$bad" = 0 ]
