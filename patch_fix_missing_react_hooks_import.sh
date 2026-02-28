#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/hotq/HotQuestionTeacherInsights.tsx"
[ -f "$FILE" ] || { echo "❌ Missing $FILE"; exit 1; }

cp "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Ensuring React hooks are imported..."

# If React import exists but hooks not listed → expand it
if rg -q '^import React from "react";' "$FILE"; then
  sed -i 's/^import React from "react";/import React, { useState, useEffect } from "react";/' "$FILE"
fi

# If only named import exists but missing hooks → add them
if rg -q '^import {.*} from "react";' "$FILE"; then
  sed -i 's/import { /import { useState, useEffect, /' "$FILE"
fi

# If no React import at all → insert at top
if ! rg -q 'from "react"' "$FILE"; then
  sed -i '1i import React, { useState, useEffect } from "react";' "$FILE"
fi

echo "✅ Hooks import fixed"
