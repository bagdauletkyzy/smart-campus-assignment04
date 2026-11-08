#!/bin/sh
# Counts occurrences of each rule implementation with grep (method for the "duplicated logic" metric).
cd "$(dirname "$0")/.." || exit 1
count() { # label dir pattern
  n=$(grep -rnE --include=*.js "$3" "$2" --exclude-dir=tests --exclude-dir=node_modules | wc -l)
  echo "$1: $n place(s)"; grep -rnE --include=*.js "$3" "$2" --exclude-dir=tests --exclude-dir=node_modules | sed 's/^/    /'
}
for v in v1_initial v2_final; do
  echo "=================== $v ==================="
  count "R1 start>=end rule"            $v 's >= e\b|s >= e\)'
  count "R2 max-duration rule (>120)"   $v '/ (60000|MS_PER_MINUTE) >'
  count "R3 overlap formula"            $v 's < be && e > bs|aStart < bEnd'
  count "R4 date+time -> timestamp"     $v "Date\.parse\("
  count "R5 result-box rendering"       $v 'box\.className =|class="verdict'
  echo
done
