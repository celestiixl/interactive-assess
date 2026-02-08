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

# ---------- Ensure Student Assessment Lab exists ----------
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
            Student-facing entry points for practice and interactive item testing.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/assessment"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Home
          </Link>
          <Link
            href="/teacher/dashboard"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Teacher
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href={\`/practice?rc=\${rc}\`}
          className="group rounded-2xl border p-5 shadow-sm transition hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Demo Practice Runner</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Opens the practice runner using a safe default reporting category.
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
                Sandbox for verifying item rendering, pills, attempts, and check behavior.
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                (We’ll wire a demo Inline Choice set next.)
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
            href="/assessment"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Home
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

# ---------- Create /assessment entry page ----------
ASSESS_DIR="$APP_ROOT/assessment"
mkdir -p "$ASSESS_DIR"

LOGIN_EXISTS="0"
if [ -f "$APP_ROOT/login/page.tsx" ] || [ -d "$APP_ROOT/login" ]; then
  LOGIN_EXISTS="1"
fi

cat > "$ASSESS_DIR/page.tsx" <<EOT
import Link from "next/link";

export default function AssessmentHome() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Assessment</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose your view. (Next upgrade: auto-route based on login + role.)
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/student/assessment"
          className="group rounded-2xl border p-6 shadow-sm transition hover:bg-muted/40"
        >
          <div className="text-base font-semibold">Continue as Student</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Practice runner, interactive items testing, goals, and progress.
          </div>
          <div className="mt-4 text-lg opacity-70 group-hover:opacity-100">→</div>
        </Link>

        <Link
          href="/teacher/dashboard"
          className="group rounded-2xl border p-6 shadow-sm transition hover:bg-muted/40"
        >
          <div className="text-base font-semibold">Continue as Teacher</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Build items, manage assessments, view analytics, and jump into student view.
          </div>
          <div className="mt-4 text-lg opacity-70 group-hover:opacity-100">→</div>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        ${LOGIN_EXISTS=="1" ? '<Link href="/login" className="rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted">Log in</Link>' : '<span className="text-xs text-muted-foreground">(No /login route detected yet. When we add auth, this will become the login entry.)</span>'}
      </div>
    </main>
  );
}
EOT

echo "✅ created/updated: /assessment (entry page)"

# ---------- Patch Teacher Dashboard: add Student View button ----------
TEACH_DASH="$APP_ROOT/teacher/dashboard/page.tsx"
if [ -f "$TEACH_DASH" ]; then
  ts="$(date +%Y%m%d_%H%M%S)"
  cp -v "$TEACH_DASH" "$TEACH_DASH.bak.$ts" >/dev/null
  echo "✅ backup: $TEACH_DASH.bak.$ts"

  python - <<'PY'
import re, pathlib

path = pathlib.Path("apps/web/src/app/teacher/dashboard/page.tsx")
if not path.exists():
    path = pathlib.Path("apps/web/app/teacher/dashboard/page.tsx")

text = path.read_text(encoding="utf-8")

# Ensure Link import exists
if not re.search(r'from\s+"next/link"', text):
    m = re.match(r'((?:\s*import[^\n]*\n)+)', text)
    if m:
        text = text[:m.end()] + 'import Link from "next/link";\n' + text[m.end():]
    else:
        text = 'import Link from "next/link";\n' + text

if 'href="/student/assessment"' not in text:
    block = """
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/student/assessment"
          className="rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted"
        >
          Student View
        </Link>
        <Link
          href="/assessment"
          className="rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted"
        >
          Assessment Home
        </Link>
      </div>
"""
    main_open = re.search(r"<main\b[^>]*>\s*", text)
    if main_open:
        text = text[:main_open.end()] + block + text[main_open.end():]
    else:
        text = re.sub(r"(return\s*\(\s*)", r"\1" + block, text, count=1, flags=re.S)

path.write_text(text, encoding="utf-8")
print("✅ Patched teacher dashboard:", path)
PY
else
  echo "⚠️ teacher dashboard page not found; skipped patch"
fi

# ---------- Patch Student Dashboard (best effort): add Assessment Lab button ----------
# Your earlier error suggests student/dashboard directory exists but page.tsx might not.
# We'll search for the first TSX page inside student/dashboard/** and patch it.
python - <<'PY'
import pathlib, re, sys

root = pathlib.Path("apps/web/src/app")
if not root.exists():
    root = pathlib.Path("apps/web/app")

dash_dir = root / "student" / "dashboard"
if not dash_dir.exists():
    print("⚠️ student/dashboard directory not found; skipping student button patch")
    sys.exit(0)

# Find candidate page files
candidates = list(dash_dir.rglob("page.tsx")) + list(dash_dir.rglob("page.jsx")) + list(dash_dir.rglob("page.ts"))
candidates = [p for p in candidates if p.is_file()]

if not candidates:
    print("⚠️ No student dashboard page.* found under", dash_dir)
    print("   (We can add a student dashboard route later, or patch student layout/nav instead.)")
    sys.exit(0)

path = candidates[0]
text = path.read_text(encoding="utf-8")

# Ensure Link import exists
if not re.search(r'from\s+"next/link"', text):
    m = re.match(r'((?:\s*import[^\n]*\n)+)', text)
    if m:
        text = text[:m.end()] + 'import Link from "next/link";\n' + text[m.end():]
    else:
        text = 'import Link from "next/link";\n' + text

if 'href="/student/assessment"' in text:
    print("✅ Student dashboard already has Assessment Lab link:", path)
    sys.exit(0)

block = """
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/student/assessment"
          className="rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted"
        >
          Assessment Lab
        </Link>
        <Link
          href="/assessment"
          className="rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted"
        >
          Assessment Home
        </Link>
      </div>
"""

main_open = re.search(r"<main\b[^>]*>\s*", text)
if main_open:
    text = text[:main_open.end()] + block + text[main_open.end():]
else:
    text2 = re.sub(r"(return\s*\(\s*)", r"\1" + block, text, count=1, flags=re.S)
    if text2 == text:
        print("⚠️ Could not locate <main> or return( injection point in", path)
        sys.exit(0)
    text = text2

path.write_text(text, encoding="utf-8")
print("✅ Patched student dashboard:", path)
PY

echo
echo "🎯 Done."
echo "   - /assessment entry page created"
echo "   - Teacher Dashboard now has: Student View + Assessment Home buttons"
echo "   - Student Dashboard patched if a page file existed"
