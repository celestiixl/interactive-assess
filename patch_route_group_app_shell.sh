#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Detect Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
  WEB_ROOT="apps/web/src"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
  WEB_ROOT="apps/web"
else
  echo "❌ can't find Next app router root"
  exit 1
fi

echo "✅ APP_ROOT=$APP_ROOT"
echo "✅ WEB_ROOT=$WEB_ROOT"

GROUP_DIR="$APP_ROOT/(app)"
mkdir -p "$GROUP_DIR"

IA_DIR="$WEB_ROOT/components/ia"
mkdir -p "$IA_DIR"

ts(){ date +%Y%m%d_%H%M%S; }
backup(){ [ -f "$1" ] && cp -v "$1" "$1.bak.$(ts)" >/dev/null || true; }

# -----------------------------
# 1) Client wrapper that sets activeKey based on pathname
# -----------------------------
ACTIVE_SHELL="$IA_DIR/ActiveShell.tsx"
backup "$ACTIVE_SHELL"

cat > "$ACTIVE_SHELL" <<'TS'
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";

function activeFromPath(path: string | null) {
  const p = path || "";
  if (p.startsWith("/teacher")) return "teacher";
  if (p.startsWith("/student/assessment/items")) return "items";
  if (p.startsWith("/student/assessment")) return "student_lab";
  if (p.startsWith("/practice")) return "practice";
  if (p.startsWith("/assessment")) return "assessment";
  return undefined;
}

export function ActiveShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeKey = activeFromPath(pathname);
  return <AppShell activeKey={activeKey as any}>{children}</AppShell>;
}
TS

echo "✅ Created: $ACTIVE_SHELL"

# -----------------------------
# 2) Route-group layout that wraps pages in the shell
# -----------------------------
GROUP_LAYOUT="$GROUP_DIR/layout.tsx"
backup "$GROUP_LAYOUT"

cat > "$GROUP_LAYOUT" <<'TS'
import type { ReactNode } from "react";
import { ActiveShell } from "@/components/ia/ActiveShell";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <ActiveShell>{children}</ActiveShell>;
}
TS

echo "✅ Created: $GROUP_LAYOUT"

# -----------------------------
# 3) Move routes into the route-group (URLs stay the same)
# -----------------------------
move_route() {
  local name="$1"
  if [ -d "$APP_ROOT/$name" ] && [ ! -d "$GROUP_DIR/$name" ]; then
    echo "➡️  moving $APP_ROOT/$name -> $GROUP_DIR/$name"
    mv "$APP_ROOT/$name" "$GROUP_DIR/$name"
  else
    echo "ℹ️  skip move: $name (missing or already moved)"
  fi
}

move_route "assessment"
move_route "practice"
move_route "student"
move_route "teacher"

echo ""
echo "🎯 Done."
echo "Next:"
echo "  1) Restart dev server (pick a free port):"
echo "     pnpm --filter web dev -p 3010   (or 3011, 3012, etc.)"
echo "  2) Hard refresh: Ctrl+Shift+R"
