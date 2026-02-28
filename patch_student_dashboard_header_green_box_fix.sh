#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "🔎 Locating Student Dashboard page…"
FILE="$(rg -l 'Student Dashboard' apps/web 2>/dev/null | head -n 1 || true)"

if [[ -z "${FILE}" ]]; then
  echo "❌ Could not find a file containing 'Student Dashboard' under apps/web"
  echo "   Try running: rg -n 'Student Dashboard' apps/web"
  exit 1
fi

echo "✅ Found: $FILE"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# 1) Make the subtitle line flex so text + reset button align nicely.
# Only applies if the <p> contains the exact text "Your personal mastery tracker."
perl -0777 -i -pe '
  s{
    <p(\s+[^>]*className=")([^"]*)(")([^>]*?)>\s*(Your personal mastery tracker\.)
  }{
    my $pre=$1; my $cls=$2; my $q=$3; my $rest=$4; my $txt=$5;
    my $add=" mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600";
    # Avoid duplicating if rerun
    if ($cls !~ /flex-wrap/ && $cls !~ /items-center/){
      "<p${pre}${cls}${add}${q}${rest}> ${txt}";
    } else {
      "<p${pre}${cls}${q}${rest}> ${txt}";
    }
  }gex
' "$FILE"

# 2) Ensure the reset button doesn’t shrink oddly when wrapping.
# Adds `shrink-0` to the button className that contains "Reset Specimen Unlocks".
perl -0777 -i -pe '
  s{
    (<button\b[^>]*className=")([^"]*)(\"[^>]*>\s*Reset Specimen Unlocks\s*</button>)
  }{
    my $a=$1; my $cls=$2; my $b=$3;
    if ($cls !~ /\bshrink-0\b/){
      $cls .= " shrink-0";
    }
    $a.$cls.$b
  }gex
' "$FILE"

echo
echo "🧾 Diff (if any):"
git --no-pager diff -- "$FILE" || true

echo
echo "✅ Patch applied. If the diff looks good, commit it:"
echo "   git add \"$FILE\" && git commit -m \"Fix Student Dashboard header green box alignment\""
