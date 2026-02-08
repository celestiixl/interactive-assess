#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Find Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router at apps/web/src/app or apps/web/app"
  exit 1
fi

LAYOUT="$APP_ROOT/layout.tsx"
echo "✅ APP_ROOT=$APP_ROOT"
echo "✅ LAYOUT=$LAYOUT"

if [ ! -f "$LAYOUT" ]; then
  echo "❌ layout.tsx not found at $LAYOUT"
  exit 1
fi

# Backup
cp -f "$LAYOUT" "$LAYOUT.bak.$(date +%Y%m%d_%H%M%S)"
echo "🧾 backup created"

cat > "$LAYOUT" <<'TSX'
import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased [color-scheme:light]">
        <div className="mx-auto w-full min-h-screen p-6">{children}</div>
      </body>
    </html>
  );
}
TSX

echo "✅ Rewrote layout.tsx with valid <html>/<body> structure (no whitespace text nodes)."
echo "Now restart dev server if it's running."
