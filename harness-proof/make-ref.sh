#!/bin/bash
# usage: make-ref.sh <defect-or-empty> ; rebuilds the throwaway reference into docs/ of this scratch copy
set -e
cd "$(dirname "$0")"
D="${1:-}"
node_modules/.bin/esbuild ref-src.mjs --bundle --format=esm --minify --define:__DEFECT__="\"$D\"" --outfile=docs/assets/ref.bundle.js --log-level=warning
MODE=network-first; [ "$D" = "stale-sw" ] && MODE=cache-first
sed "s/__MODE__/$MODE/" sw-template.js > docs/sw.js
if [ "$D" = "no-sw" ]; then rm -f docs/sw.js; fi
rm -f firestore.rules
if [ "$D" != "no-rules" ]; then
  if [ "$D" = "open-rules" ]; then R='allow read, write: if request.auth != null;'; M='/{d=**}'; else R='allow read, write: if request.auth != null \&\& request.auth.uid == uid;'; M='/users/{uid}/{d=**}'; fi
  printf "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{db}/documents {\n    match %s { %s }\n  }\n}\n" "$M" "$R" | sed 's/\\&/\&/g' > firestore.rules
fi
python3 - <<'PY'
import re
p='docs/unit-01/lesson-1/index.html'; s=open(p).read()
s=re.sub(r'<script type="module" src="../../assets/(auth|ref)\.bundle\.js[^"]*"></script>','<script type="module" src="../../assets/ref.bundle.js"></script>',s)
if 'data-en8-sync-state' not in s:
    s=s.replace('<span class="auth-id" data-en8-identity hidden></span>','<span class="auth-id" data-en8-identity hidden></span>\n    <span data-en8-sync-state="idle"><span data-en8-sync-detail></span></span>')
    s=s.replace('<div class="shell"><main>','<div class="shell"><main>\n  <section data-en8-rhythm></section>',1)
open(p,'w').write(s)
PY
echo "ref built (defect='${D}')"
