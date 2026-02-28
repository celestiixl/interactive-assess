#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/teacher/dashboard/page.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ file not found: $FILE"
  exit 1
fi

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# Replace the two-link block (Item Bank + Builder) with a clean, parse-safe version.
# This targets the first occurrence of: Link containing "Item Bank" followed by Link href="/teacher/builder".
perl -0777 -i -pe '
  my $re = qr{
    <Link\b[\s\S]*?>\s*Item\ Bank\s*</Link>\s*
    <Link\b[\s\S]*?href=(["\x27])\/teacher\/builder\1[\s\S]*?>[\s\S]*?<\/Link>
  }x;

  if ($_ !~ $re) {
    # Fallback: if structure changed, do nothing but keep file intact.
    # Exit nonzero so user sees it.
    die "PATCH_NOT_APPLIED\n";
  }

  s/$re/<Link
  href="\/teacher\/item-bank"
  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
>
  Item Bank
<\/Link>

<Link
  href="\/teacher\/builder"
  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-semibold shadow-sm hover:bg-emerald-700"
>
  Builder
<\/Link>/x;
' "$FILE" 2>/dev/null || {
  echo "❌ Patch did not apply (pattern not found)."
  echo "➡️ Print lines 1-70 so we can target the exact block:"
  echo "   nl -ba \"$FILE\" | sed -n '1,70p'"
  exit 1
}

echo "✅ Patched: $FILE"
echo "   Backup:  ${FILE}.bak.$(date +%Y%m%d_%H%M%S) (backup name differs—check the .bak.* file created)"
