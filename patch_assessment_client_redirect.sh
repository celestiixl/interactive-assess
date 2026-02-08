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

ASSESS_PAGE="$APP_ROOT/assessment/page.tsx"
STUDENT_DASH_DIR="$APP_ROOT/student/dashboard"

if [ ! -d "$STUDENT_DASH_DIR" ]; then
  echo "❌ expected student dashboard dir not found: $STUDENT_DASH_DIR"
  exit 1
fi

mkdir -p "$(dirname "$ASSESS_PAGE")"

ts="$(date +%Y%m%d_%H%M%S)"
if [ -f "$ASSESS_PAGE" ]; then
  cp -v "$ASSESS_PAGE" "$ASSESS_PAGE.bak.$ts" >/dev/null
  echo "✅ backup: $ASSESS_PAGE.bak.$ts"
fi

cat > "$ASSESS_PAGE" <<'EOT'
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/dashboard");
  }, [router]);

  return null;
}
EOT

echo "✅ /assessment now does a client redirect to /student/dashboard"
echo "👉 Visit: /assessment"
