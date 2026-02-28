#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

DONUT="apps/web/src/components/student/MasteryDonut.tsx"
DASH="apps/web/src/app/(app)/student/dashboard/page.tsx"

cp -a "$DONUT" "$DONUT.bak.$(date +%Y%m%d_%H%M%S)"
cp -a "$DASH" "$DASH.bak.$(date +%Y%m%d_%H%M%S)"

# Make MasteryDonut a clean DEFAULT export (no ambiguity)
perl -0777 -i -pe '
  # If it has "export function MasteryDonut", remove "export " so it becomes a local function
  s/\bexport\s+function\s+MasteryDonut\b/function MasteryDonut/g;

  # Remove any existing default export lines to avoid duplicates
  s/^\s*export\s+default\s+MasteryDonut\s*;\s*\n//mg;

  # Append exactly one default export at end
  END { }
' "$DONUT"
printf "\nexport default MasteryDonut;\n" >> "$DONUT"

# Dashboard: import default explicitly
perl -0777 -i -pe '
  s/^\s*import[^\n]*MasteryDonut[^\n]*\n//mg;
  my $ins = "import MasteryDonut from \"@/components/student/MasteryDonut\";\n";
  if ($_ =~ /^import\s+Link\s+from\s+\"next\/link\";\s*\n/m) {
    $_ =~ s/^(import\s+Link\s+from\s+\"next\/link\";\s*\n)/$1$ins/m;
  } else {
    $_ = $ins . $_;
  }
' "$DASH"

echo "✅ MasteryDonut is now default-exported and dashboard default-imports it"
echo "➡️ restart: pnpm --filter web dev"
