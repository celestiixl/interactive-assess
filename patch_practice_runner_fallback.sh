#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

# Find Next App Router root
if [ -f apps/web/src/app/practice/page.tsx ]; then
  PRACTICE_PAGE="apps/web/src/app/practice/page.tsx"
elif [ -f apps/web/app/practice/page.tsx ]; then
  PRACTICE_PAGE="apps/web/app/practice/page.tsx"
else
  echo "❌ can't find practice runner page.tsx"
  echo "   looked for:"
  echo "   - apps/web/src/app/practice/page.tsx"
  echo "   - apps/web/app/practice/page.tsx"
  exit 1
fi

echo "✅ PRACTICE_PAGE=$PRACTICE_PAGE"

# Backup
ts="$(date +%Y%m%d_%H%M%S)"
cp -v "$PRACTICE_PAGE" "${PRACTICE_PAGE}.bak.${ts}" >/dev/null

DEFAULT_RC='RC1 • Cell Structure & Function'

# Patch: ensure a safe fallback when rc/itemIds are missing
# We look for typical patterns and inject a normalization block near the top of the component.
perl -0777 -i -pe '
  my $default_rc = $ENV{"DEFAULT_RC"} // "RC1 • Cell Structure & Function";

  # 1) If DEFAULT_RC constant exists, keep it. If not, add it after imports.
  if ($_. !~ /const\s+DEFAULT_RC\s*=/) {
    s/(\n)(export\s+default\s+function\s+)/\nconst DEFAULT_RC = \x27'"$default_rc"'\x27;\n\n$2/s
      or s/(^\s*(?:\x22use client\x22;\s*)?(?:.*?import.*?;\s*\n)+)/$1\nconst DEFAULT_RC = \x27'"$default_rc"'\x27;\n/s;
  }

  # 2) Inject normalization block inside the page component, early.
  # Try to find a good anchor: first mention of searchParams usage OR the first const derived from searchParams.
  my $inject = q{
  // --- Practice runner query normalization (auto-fallback) ---
  const rcParamRaw =
    typeof (searchParams as any)?.rc === "string"
      ? ((searchParams as any).rc as string)
      : undefined;

  const itemIdsRaw =
    typeof (searchParams as any)?.itemIds === "string"
      ? ((searchParams as any).itemIds as string)
      : undefined;

  // If neither is provided, default to an RC so /practice always loads
  const rcParam = rcParamRaw && rcParamRaw.trim().length ? rcParamRaw : (!itemIdsRaw ? DEFAULT_RC : undefined);
  const itemIdsParam = itemIdsRaw && itemIdsRaw.trim().length ? itemIdsRaw : undefined;
  // --- end normalization ---
};

  # Don’t double-inject
  if ($_. !~ /Practice runner query normalization/) {
    # Try injection right after the function signature opening brace
    s/(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{\s*\n)/$1$inject\n/s
      or s/(export\s+default\s+function\s*\([^)]*\)\s*\{\s*\n)/$1$inject\n/s;
  }

  # 3) Replace downstream references if they use searchParams.rc / searchParams.itemIds directly.
  # We only do safe, narrow replacements.
  s/\bsearchParams\??\.\s*rc\b/rcParam/g;
  s/\bsearchParams\??\.\s*itemIds\b/itemIdsParam/g;

' "$PRACTICE_PAGE"

echo "✅ Patched fallback behavior into $PRACTICE_PAGE"

# Quick sanity check: show the injected block exists
if rg -n "Practice runner query normalization" "$PRACTICE_PAGE" >/dev/null; then
  echo "✅ Injection confirmed"
else
  echo "⚠️ Injection not found; patch may not have applied as expected."
  echo "   Restore backup: cp ${PRACTICE_PAGE}.bak.${ts} $PRACTICE_PAGE"
  exit 2
fi

echo "🎯 Done: /practice now auto-loads with DEFAULT_RC when query params are missing."
