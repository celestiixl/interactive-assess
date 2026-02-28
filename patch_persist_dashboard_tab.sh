#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

cp "$FILE" "$FILE.bak.$(date +%s)"

# 1 — add useSearchParams + useRouter
sed -i 's/from "react";/from "react";\
import { useRouter, useSearchParams } from "next\/navigation";/' "$FILE"

# 2 — replace tab state
sed -i 's/const \[tab, setTab\].*/const router = useRouter();\
  const search = useSearchParams();\
  const tab = search.get("tab") || "overview";\
  const setTab = (t:string)=>router.replace(`?tab=${t}`);/' "$FILE"

echo "✅ Dashboard tab now persists via URL"
echo "Restart dev server:"
echo "pnpm dev:web"
