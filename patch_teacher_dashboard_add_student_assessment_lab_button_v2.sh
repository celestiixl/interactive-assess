#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found at /workspaces/interactive-assess"; exit 1; }

# Find Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router at apps/web/src/app or apps/web/app"
  exit 1
fi
echo "✅ APP_ROOT=$APP_ROOT"

TEACH_DASH="$APP_ROOT/teacher/dashboard/page.tsx"
if [ ! -f "$TEACH_DASH" ]; then
  echo "❌ teacher dashboard page not found at: $TEACH_DASH"
  exit 1
fi
echo "✅ TEACH_DASH=$TEACH_DASH"

# Ensure Student Assessment Lab routes exist
LAB_DIR="$APP_ROOT/student/assessment"
LAB_ITEMS_DIR="$APP_ROOT/student/assessment/items"
mkdir -p "$LAB_DIR" "$LAB_ITEMS_DIR"

DEFAULT_RC='RC1 • Cell Structure & Function'

if [ ! -f "$LAB_DIR/page.tsx" ]; then
  cat > "$LAB_DIR/page.tsx" <<EOT
import Link from "next/link";

const DEFAULT_RC = ${DEFAULT_RC@Q};

export default function StudentAssessmentLab() {
  const rc = encodeURIComponent(DEFAULT_RC);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assessment Lab</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quick entry points for student-facing practice and interactive item testing.
          </p>
        </div>

        <Link
          href="/teacher/dashboard"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          Back to Teacher Dashboard
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href={\`/practice?rc=\${rc}\`}
          className="group rounded-2xl border p-5 shadow-sm transition hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Demo Student Practice Runner</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Opens the student practice runner with a safe default reporting category.
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Default RC: <span className="font-medium text-foreground">{DEFAULT_RC}</span>
              </div>
            </div>
            <div className="text-lg opacity-70 group-hover:opacity-100">→</div>
          </div>
        </Link>

        <Link
          href="/student/assessment/items"
          className="group rounded-2xl border p-5 shadow-sm transition hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Interactive Items Test Screen</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Sandbox screen to verify item rendering, pills, attempts, and check behavior.
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                (We’ll wire real test data next.)
              </div>
            </div>
            <div className="text-lg opacity-70 group-hover:opacity-100">→</div>
          </div>
        </Link>
      </div>
    </main>
  );
}
EOT
  echo "✅ created: /student/assessment"
fi

if [ ! -f "$LAB_ITEMS_DIR/page.tsx" ]; then
  cat > "$LAB_ITEMS_DIR/page.tsx" <<'EOT'
import Link from "next/link";

export default function InteractiveItemsTestScreen() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interactive Items Test Screen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Placeholder sandbox. Next patch will render a small demo set (including Inline Choice).
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/student/assessment"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Back to Lab
          </Link>
          <Link
            href="/practice"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Practice
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border p-5">
        <div className="text-sm font-medium">Next up</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          <li>Render demo item types (MC, drag, hotspot, Inline Choice)</li>
          <li>Verify item-type pills + check button behavior</li>
          <li>Toggle learn/test modes and attempt limits</li>
        </ul>
      </div>
    </main>
  );
}
EOT
  echo "✅ created: /student/assessment/items"
fi

# Backup teacher dashboard
ts="$(date +%Y%m%d_%H%M%S)"
cp -v "$TEACH_DASH" "$TEACH_DASH.bak.$ts" >/dev/null
echo "✅ backup: $TEACH_DASH.bak.$ts"

# Patch teacher dashboard by inserting a Link button after the first <main ...> tag
python - <<'PY'
import re, pathlib

path = pathlib.Path("apps/web/src/app/teacher/dashboard/page.tsx")
if not path.exists():
    path = pathlib.Path("apps/web/app/teacher/dashboard/page.tsx")

text = path.read_text(encoding="utf-8")

if 'href="/student/assessment"' in text or "href='/student/assessment'" in text:
    print("✅ Teacher dashboard already contains Student Assessment Lab link. No change.")
    raise SystemExit(0)

# Ensure Link import exists
if not re.search(r'from\s+"next/link"', text):
    # Insert after existing imports, else at top
    m = re.match(r'((?:\s*import[^\n]*\n)+)', text)
    if m:
        text = text[:m.end()] + 'import Link from "next/link";\n' + text[m.end():]
    else:
        text = 'import Link from "next/link";\n' + text

button_block = """
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/student/assessment"
          className="rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted"
        >
          Student Assessment Lab
        </Link>
      </div>
"""

# Insert after first <main ...> opening tag
main_open = re.search(r"<main\b[^>]*>\s*", text)
if not main_open:
    # Fallback: insert after first return (
    text2 = re.sub(r"(return\s*\(\s*)", r"\1" + button_block, text, count=1, flags=re.S)
    if text2 == text:
        raise SystemExit("❌ Could not find <main> or return( in teacher dashboard to inject button.")
    text = text2
else:
    insert_at = main_open.end()
    text = text[:insert_at] + button_block + text[insert_at:]

path.write_text(text, encoding="utf-8")
print("✅ Injected Student Assessment Lab button into Teacher Dashboard:", path)
PY

echo "🎯 Done. Refresh /teacher/dashboard and click: Student Assessment Lab"
