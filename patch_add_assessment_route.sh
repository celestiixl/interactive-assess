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

# Pick a student dashboard target route if it exists
TARGET=""
if [ -f "$APP_ROOT/student/page.tsx" ]; then
  TARGET="/student"
elif [ -f "$APP_ROOT/dashboard/page.tsx" ]; then
  TARGET="/dashboard"
elif [ -f "$APP_ROOT/student/dashboard/page.tsx" ]; then
  TARGET="/student/dashboard"
elif [ -f "$APP_ROOT/student/home/page.tsx" ]; then
  TARGET="/student/home"
elif [ -f "$APP_ROOT/app/page.tsx" ]; then
  # unlikely, but keep empty
  TARGET=""
fi

ASSESS_DIR="$APP_ROOT/assessment"
mkdir -p "$ASSESS_DIR"

ts="$(date +%Y%m%d_%H%M%S)"
if [ -f "$ASSESS_DIR/page.tsx" ]; then
  cp -v "$ASSESS_DIR/page.tsx" "$ASSESS_DIR/page.tsx.bak.$ts" >/dev/null
fi

if [ -n "$TARGET" ]; then
  cat > "$ASSESS_DIR/page.tsx" <<EOT
import { redirect } from "next/navigation";

export default function AssessmentEntry() {
  redirect("${TARGET}");
}
EOT

  echo "✅ Created /assessment redirect → $TARGET"
else
  cat > "$ASSESS_DIR/page.tsx" <<'EOT'
export default function AssessmentEntry() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Assessment</h1>
      <p style={{ marginTop: 8, maxWidth: 720 }}>
        I created <code>/assessment</code>, but I couldn’t auto-detect your student dashboard route.
      </p>
      <p style={{ marginTop: 8 }}>
        Common routes I checked:
        <code> /student</code>, <code> /dashboard</code>, <code> /student/dashboard</code>, <code> /student/home</code>
      </p>
      <p style={{ marginTop: 12 }}>
        Quick links:
      </p>
      <ul style={{ marginTop: 8 }}>
        <li><a href="/practice">Practice Runner</a></li>
      </ul>
    </main>
  );
}
EOT

  echo "⚠️ Created /assessment placeholder (no dashboard route auto-detected)"
  echo "   If you tell me your dashboard route (or I can patch-detect it by component), I’ll update /assessment to redirect."
fi

echo
echo "🔎 Sanity check: route exists at $ASSESS_DIR/page.tsx"
echo "👉 Visit: /assessment"
