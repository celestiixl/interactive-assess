#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

echo "🔎 Finding Next.js app directory..."
APP_DIR=""
if [[ -d "apps/web/src/app" ]]; then APP_DIR="apps/web/src/app"; fi
if [[ -z "$APP_DIR" && -d "apps/web/app" ]]; then APP_DIR="apps/web/app"; fi

if [[ -z "$APP_DIR" ]]; then
  echo "❌ Could not find apps/web/src/app or apps/web/app"
  exit 1
fi

echo "✅ App dir: $APP_DIR"
echo

echo "🔎 Searching for student routes (folders containing /student/)..."
find "$APP_DIR" -type f -name "page.tsx" | rg "/student/" || true
echo

echo "🔎 Searching for any dashboard page.tsx..."
find "$APP_DIR" -type f -name "page.tsx" | rg "dashboard/page\.tsx" || true
echo

echo "🔎 Searching for pages that contain 'Student Dashboard'..."
rg -n "Student Dashboard" "$APP_DIR" || true
echo

echo "✅ If you see a path like:"
echo "   $APP_DIR/(app)/student/dashboard/page.tsx"
echo "then the URL should be: /student/dashboard"
echo
echo "If you see a path like:"
echo "   $APP_DIR/(something)/student/page.tsx"
echo "then the URL is: /student"
echo
echo "NEXT: paste the output above (the matching file paths)."
