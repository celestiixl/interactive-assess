#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

# Try common locations first
CANDIDATES=(
  "apps/web/src/app/(app)/teacher/items/page.tsx"
  "apps/web/src/app/(app)/teacher/item-bank/page.tsx"
  "apps/web/src/app/(app)/teacher/bank/page.tsx"
)

FILE=""
for f in "${CANDIDATES[@]}"; do
  if [ -f "$f" ]; then FILE="$f"; break; fi
done

# Fallback: search for a teacher page that contains "Item Bank"
if [ -z "$FILE" ]; then
  if command -v rg >/dev/null 2>&1; then
    FILE="$(rg -n --files-with-matches 'Item Bank' apps/web/src/app/\(app\)/teacher 2>/dev/null | head -n1 || true)"
  fi
fi

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "❌ Couldn't find the Item Bank page automatically."
  echo "   Searched candidates:"
  printf "   - %s\n" "${CANDIDATES[@]}"
  echo "   And tried: rg 'Item Bank' apps/web/src/app/(app)/teacher"
  echo ""
  echo "➡️ Run this and tell me the file path it prints:"
  echo "   rg -n --files-with-matches 'Item Bank' apps/web/src/app/\\(app\\)/teacher"
  exit 1
fi

echo "✅ Target: $FILE"
cp -a "$FILE" "$FILE.bak_$(date +%Y%m%d_%H%M%S)"

# Basic sanity checks (avoid wrecking unrelated pages)
if ! rg -q 'Item Bank' "$FILE"; then
  echo "❌ '$FILE' does not contain 'Item Bank' text; aborting to be safe."
  exit 1
fi

# 1) Ensure "use client" (needed for useState/useMemo)
# Add only if missing.
perl -0777 -i -pe '
  if ($ARGV) {
    my $s = $_;
    if ($s !~ /^\s*["\x27]use client["\x27];/m) {
      # Insert at very top
      $s = "\"use client\";\n\n" . $s;
    }
    $_ = $s;
  }
' "$FILE"

# 2) Ensure react hooks import exists (add if missing)
# If there is already a react import, extend it. Otherwise add a new import near the top.
perl -0777 -i -pe '
  my $s = $_;

  # If we already import from react, merge hooks into it.
  if ($s =~ /import\s+\{([^}]+)\}\s+from\s+["\x27]react["\x27];/m) {
    my $inside = $1;
    my %seen = map { my $t=$_; $t =~ s/^\s+|\s+$//g; ($t=>1) } split(/,/, $inside);
    $seen{useState}=1;
    $seen{useMemo}=1;
    my @out = sort keys %seen;
    my $new = "import { " . join(", ", @out) . " } from \"react\";";
    $s =~ s/import\s+\{[^}]+\}\s+from\s+["\x27]react["\x27];/$new/m;
  } else {
    # Add after "use client" if present, else at top.
    if ($s =~ /^\s*["\x27]use client["\x27];\s*\n/m) {
      $s =~ s/^(\s*["\x27]use client["\x27];\s*\n)/$1\nimport { useMemo, useState } from "react";\n/m;
    } else {
      $s = "import { useMemo, useState } from \"react\";\n" . $s;
    }
  }

  $_ = $s;
' "$FILE"

# 3) Inject filter state + filteredItems inside the default export function.
# We insert right after the first opening brace of the component body.
perl -0777 -i -pe '
  my $s = $_;

  # Only insert once
  if ($s =~ /const\s+\[\s*query\s*,\s*setQuery\s*\]\s*=\s*useState/m) { $_=$s; next; }

  # Find: export default function X(...) {  -> insert after first "{"
  $s =~ s/(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{\s*)/$1\n  //__FILTER_STATE__\n/s;

  $s =~ s/\/\/__FILTER_STATE__/
const [query, setQuery] = useState(\"\");
const [typeFilter, setTypeFilter] = useState<string>(\"all\");
const [teksFilter, setTeksFilter] = useState<string>(\"all\");

// Try to read tags from common shapes: item.type and item.teks / item.teksCodes / item.tags
const allTypes = useMemo(() => {
  try {
    const arr = (Array.isArray((items as any)) ? (items as any) : []);
    const set = new Set<string>();
    for (const it of arr) set.add(String(it?.type ?? \"unknown\"));
    return [\"all\", ...Array.from(set).sort()];
  } catch { return [\"all\"]; }
}, [typeof items === \"undefined\" ? null : (items as any)]);

const allTeks = useMemo(() => {
  try {
    const arr = (Array.isArray((items as any)) ? (items as any) : []);
    const set = new Set<string>();
    for (const it of arr) {
      const codes =
        it?.teksCodes ??
        it?.teks ??
        it?.tags ??
        [];
      if (Array.isArray(codes)) {
        for (const c of codes) set.add(String(c));
      }
    }
    return [\"all\", ...Array.from(set).sort()];
  } catch { return [\"all\"]; }
}, [typeof items === \"undefined\" ? null : (items as any)]);

const filteredItems = useMemo(() => {
  const q = query.trim().toLowerCase();
  const arr = (Array.isArray((items as any)) ? (items as any) : []);

  return arr.filter((it: any) => {
    if (typeFilter !== \"all\" && String(it?.type ?? \"unknown\") !== typeFilter) return false;

    if (teksFilter !== \"all\") {
      const codes = it?.teksCodes ?? it?.teks ?? it?.tags ?? [];
      const has = Array.isArray(codes) && codes.some((c: any) => String(c) === teksFilter);
      if (!has) return false;
    }

    if (!q) return true;

    const hay = [
      it?.title,
      it?.stem,
      it?.prompt,
      it?.question,
      it?.rationale,
      ...(Array.isArray(it?.teksCodes) ? it.teksCodes : []),
      ...(Array.isArray(it?.teks) ? it.teks : []),
      ...(Array.isArray(it?.tags) ? it.tags : []),
      it?.type,
    ]
      .filter(Boolean)
      .map((x: any) => String(x).toLowerCase())
      .join(\" \");

    return hay.includes(q);
  });
}, [query, typeFilter, teksFilter, typeof items === \"undefined\" ? null : (items as any)]);
/s;

  $_ = $s;
' "$FILE"

# 4) Replace the first "items.map(" with "filteredItems.map(" (if present)
perl -0777 -i -pe '
  my $s = $_;
  # only if filteredItems exists
  if ($s =~ /const\s+filteredItems\s*=\s*useMemo/s) {
    $s =~ s/\bitems\.map\s*\(/filteredItems.map(/s;
  }
  $_ = $s;
' "$FILE"

# 5) Add the UI controls right after the first header that contains "Item Bank"
perl -0777 -i -pe '
  my $s = $_;

  # avoid double insert
  if ($s =~ /placeholder=\{\"Search items/ || $s =~ /Search items \(title, prompt, TEKS/ ) { $_=$s; next; }

  # Insert after first occurrence of "Item Bank" header line (h1 or div)
  if ($s =~ /(Item Bank<\/h1>|>Item Bank<\/div>|>Item Bank<\/h2>)/) {
    $s =~ s/(Item Bank<\/h1>|>Item Bank<\/div>|>Item Bank<\/h2>)/$1\n\n            <div className=\"mt-4 rounded-2xl border border-slate-200 bg-white\\/0 p-4\">\n              <div className=\"flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between\">\n                <div className=\"flex-1\">\n                  <div className=\"text-xs font-semibold text-slate-700\">Search</div>\n                  <input\n                    className=\"mt-2 w-full rounded-xl border border-slate-200 bg-white\\/0 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none\"\n                    value={query}\n                    onChange={(e) => setQuery(e.target.value)}\n                    placeholder={\"Search items (title, prompt, TEKS, type)…\"}\n                  />\n                </div>\n\n                <div className=\"flex gap-3\">\n                  <div>\n                    <div className=\"text-xs font-semibold text-slate-700\">Type</div>\n                    <select\n                      className=\"mt-2 rounded-xl border border-slate-200 bg-white\\/0 px-3 py-2 text-sm shadow-sm\"\n                      value={typeFilter}\n                      onChange={(e) => setTypeFilter(e.target.value)}\n                    >\n                      {allTypes.map((t) => (\n                        <option key={t} value={t}>\n                          {t}\n                        </option>\n                      ))}\n                    </select>\n                  </div>\n\n                  <div>\n                    <div className=\"text-xs font-semibold text-slate-700\">TEKS</div>\n                    <select\n                      className=\"mt-2 rounded-xl border border-slate-200 bg-white\\/0 px-3 py-2 text-sm shadow-sm\"\n                      value={teksFilter}\n                      onChange={(e) => setTeksFilter(e.target.value)}\n                    >\n                      {allTeks.map((t) => (\n                        <option key={t} value={t}>\n                          {t}\n                        </option>\n                      ))}\n                    </select>\n                  </div>\n                </div>\n              </div>\n\n              <div className=\"mt-3 text-xs text-slate-600\">\n                Showing <span className=\"font-semibold\">{filteredItems.length}</span> of{\" \"}\n                <span className=\"font-semibold\">{Array.isArray(items as any) ? (items as any).length : 0}</span>\n              </div>\n            <\/div>/s;
  }

  $_ = $s;
' "$FILE"

echo "✅ Patch applied."
echo "Next:"
echo "  pnpm -C apps/web dev"
echo "  (or whatever command you use to run the web app)"
