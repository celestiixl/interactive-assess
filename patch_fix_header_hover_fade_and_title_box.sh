#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
[[ -f "$FILE" ]] || { echo "❌ Missing $FILE"; exit 1; }

echo "✅ Patching $FILE"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# 1) Remove the "whole page is clickable" feel (cursor-pointer on main)
perl -0777 -i -pe '
  s/<main className="([^"]*)">/
    my $c=$1;
    $c =~ s/\bcursor-pointer\b//g;
    $c =~ s/\s+/ /g;
    "<main className=\"".$c."\">";
  /gex
' "$FILE"

# 2) Fix the header highlight block:
#    - add padding/rounding
#    - remove hover:bg-white/70 which is causing the fade
perl -0777 -i -pe '
  s{
    <div\s+className=\{`\\$\\{biomeHealth\\.bg\\}([^`]*)`\\}
  }{
    my $rest=$1;

    # remove hover:bg-white/70 if present
    $rest =~ s/\bhover:bg-white\/70\b//g;

    # remove cursor-pointer on this div if present (optional)
    $rest =~ s/\bcursor-pointer\b//g;

    # ensure we have padding + rounding + fit content
    my $add=" inline-block rounded-xl px-5 py-4";

    # avoid duplicating if rerun
    if ($rest !~ /\bpx-5\b/) { $rest .= $add; }

    # normalize spaces
    $rest =~ s/\s+/ /g;

    "<div className={`\${biomeHealth.bg}$rest`}";
  }gex
' "$FILE"

echo
echo "🧾 Diff:"
git --no-pager diff -- "$FILE" || true

echo
echo "✅ Done."
echo
echo "IMPORTANT restart steps:"
echo "1) Stop dev server (Ctrl+C)"
echo "2) Then run:"
echo "   rm -rf apps/web/.next .next"
echo "   pnpm dev:web"
