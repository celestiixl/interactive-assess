#!/usr/bin/env bash
set -euo pipefail

ROOT="/workspaces/interactive-assess"
cd "$ROOT"

WEB="apps/web"
PAGE_DIR="$WEB/src/app/(app)/teacher/item-bank"
PAGE_FILE="$PAGE_DIR/page.tsx"
DASH_FILE="$WEB/src/app/(app)/teacher/dashboard/page.tsx"

if [ ! -d "$WEB/src/app" ]; then
  echo "❌ Can't find $WEB/src/app (is the web app elsewhere?)"
  exit 1
fi

mkdir -p "$PAGE_DIR"

if [ -f "$PAGE_FILE" ]; then
  cp -v "$PAGE_FILE" "$PAGE_FILE.bak_$(date +%Y%m%d_%H%M%S)"
fi

cat > "$PAGE_FILE" <<'TSX'
import Link from "next/link";
import { loadItemBank } from "@/lib/itemBank/load";

export const dynamic = "force-dynamic";

export default async function TeacherItemBankPage() {
  const bank = await loadItemBank();
  const items = bank?.items ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Item Bank</h1>
            <p className="mt-1 text-sm text-slate-600">
              Loaded from <code className="rounded bg-white px-1">lib/itemBank</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/teacher/builder"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Open Builder
            </Link>
            <Link
              href="/teacher/dashboard"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Items ({items.length})</div>

          {items.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600">
              No items found. Check <code className="rounded bg-slate-50 px-1">apps/web/src/lib/itemBank/bank.example.json</code>{" "}
              and the loader in <code className="rounded bg-slate-50 px-1">apps/web/src/lib/itemBank/load.ts</code>.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {items.map((it: any) => (
                <div key={it.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {it.title || it.prompt?.slice?.(0, 80) || "Untitled item"}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        <span className="font-semibold">type:</span> {it.type || "unknown"}{" "}
                        {it.teks?.length ? (
                          <>
                            <span className="mx-2">•</span>
                            <span className="font-semibold">TEKS:</span> {it.teks.join(", ")}
                          </>
                        ) : null}
                      </div>
                    </div>

                    <Link
                      href="/teacher/builder"
                      className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                      title="Open builder (editing coming later)"
                    >
                      Build
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
TSX

echo "✅ Wrote: $PAGE_FILE"

if [ -f "$DASH_FILE" ]; then
  cp -v "$DASH_FILE" "$DASH_FILE.bak_$(date +%Y%m%d_%H%M%S)"

  # Insert a link button near the top action buttons (safe string replace).
  # If it doesn't match, we still keep the new page and you can add the link manually.
  python - <<'PY'
from pathlib import Path

p = Path("apps/web/src/app/(app)/teacher/dashboard/page.tsx")
s = p.read_text(encoding="utf-8")

needle = 'href="/teacher/builder"'
if needle not in s:
  print("ℹ️ Dashboard file found, but couldn't locate builder link anchor to add Item Bank button automatically.")
  raise SystemExit(0)

# Add Item Bank link right before the builder link (simple + safe).
insert = '''href="/teacher/item-bank"
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
            >
              Item Bank
            </Link>

            <Link
              href="/teacher/builder"'''

s2 = s.replace('href="/teacher/builder"', insert, 1)

p.write_text(s2, encoding="utf-8")
print("✅ Patched dashboard with Item Bank link.")
PY

else
  echo "ℹ️ Dashboard not found at: $DASH_FILE (skipped adding link)."
fi

echo ""
echo "Next:"
echo "  1) restart dev server"
echo "  2) open: /teacher/item-bank"
