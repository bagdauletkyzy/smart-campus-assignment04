#!/bin/sh
# Sanity check that the tests can FAIL: apply one deliberate bug at a time, run tests, restore the file.
cd "$(dirname "$0")/../v2_final" || exit 1
run() { # name file sed-expression
  cp "$2" "$2.bak"
  sed -i "$3" "$2"
  if cmp -s "$2" "$2.bak"; then echo "MUTATION '$1': NOT APPLIED (sed pattern missed)"; mv "$2.bak" "$2"; return; fi
  out=$(node --test --test-reporter=spec 2>&1)
  fails=$(echo "$out" | grep -E '^ℹ fail' | awk '{print $3}')
  pass=$(echo "$out" | grep -E '^ℹ pass' | awk '{print $3}')
  echo "MUTATION '$1': pass=$pass fail=$fails  -> $( [ "$fails" -gt 0 ] && echo 'DETECTED by tests' || echo 'NOT DETECTED' )"
  mv "$2.bak" "$2"
}
run "overlap uses <= (touching counts as conflict)" src/domain/availability.js 's/aStart < bEnd \&\& aEnd > bStart/aStart <= bEnd \&\& aEnd >= bStart/'
run "max duration >= 120 instead of > 120"           src/domain/availability.js 's/> MAX_MINUTES) return fail/>= MAX_MINUTES) return fail/'
run "F2 uses some() instead of every()"              src/domain/filters.js      's/equipment.every(/equipment.some(/'
run "selectRoom keeps stale result (F5 bug)"         src/app/service.js         's/^      result = null;\n//; /selectedRoomId = visibleRooms().some/{n;s/result = null;/\/\/ result kept/}'
echo "--- restored; final run:"
node --test --test-reporter=spec 2>&1 | grep -E '^ℹ (tests|pass|fail)'
