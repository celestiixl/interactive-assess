#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

echo "🔎 Finding Student Dashboard page..."
FILE="$(rg -l 'Student Dashboard' apps/web 2>/dev/null | head -n 1 || true)"

if [[ -z "$FILE" ]]; then
  echo "❌ Could not find Student Dashboard page."
  exit 1
fi

echo "✅ Found: $FILE"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# Convert header container to clean vertical flex layout
perl -0777 -i -pe '
  s{
    (<div[^>]*className="[^"]*bg-gradient[^"]*")([^>]*>)
  }{
    my $start=$1; my $end=$2;
    if ($start !~ /flex-col/) {
      $start =~ s/className="/className="flex flex-col gap-2 p-6 /;
    }
    $start.$end;
  }gex
' "$FILE"

# Ensure subtitle paragraph is clean and not inline-wrapped weirdly
perl -0777 -i -pe '
  s{
    (<p[^>]*>)(\s*Your personal mastery tracker\.)
  }{
    "<p className=\"text-sm text-slate-600\">Your personal mastery tracker.</p>\n<div className=\"mt-2\">";
  }gex
' "$FILE"

# Close the injected div properly before header container ends
perl -0777 -i -pe '
  s{
    (Reset Specimen Unlocks\s*</button>)
  }{
    "$1</div>";
  }gex
' "$FILE"

echo
echo "🧾 Diff:"
git --no-pager diff -- "$FILE" || true

echo
echo "✅ Layout patch applied."
echo "If it looks good:"
echo "git add \"$FILE\" && git commit -m \"Clean Student Dashboard green header layout\""
