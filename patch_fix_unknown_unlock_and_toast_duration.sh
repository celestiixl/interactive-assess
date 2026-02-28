#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text(encoding="utf-8")

# 1) prevent unknown from ever being treated as unlocked
s = s.replace(
'const unlocked = v01 >= 0.75;',
'const unlocked = organism.name !== "Unknown organism" && v01 >= 0.75;'
)

# 2) make toast last longer (900ms -> 2200ms)
s = re.sub(r'setTimeout\(\(\) => setJustUnlocked\(null\),\s*\d+\);',
           'setTimeout(() => setJustUnlocked(null), 2200);', s)

# 3) ensure toast CSS exists and lasts longer (0.9s -> 2.2s)
s = s.replace('animation: specimenToastInOut 0.9s ease forwards;',
              'animation: specimenToastInOut 2.2s ease forwards;')

# 4) if toast keyframes were never added (in case earlier patch missed), append minimal toast CSS safely
if "specimenToastInOut" not in s:
    insert = """
        @keyframes specimenToastInOut {
          0% { transform: translateY(-10px); opacity: 0; }
          12% { transform: translateY(0); opacity: 1; }
          88% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-10px); opacity: 0; }
        }
        .specimen-toast {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 50;
          animation: specimenToastInOut 2.2s ease forwards;
        }
        .specimen-toast-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          box-shadow: 0 10px 30px rgba(2, 6, 23, 0.12);
          min-width: 260px;
        }
        .specimen-toast-badge {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 6px 8px;
          border-radius: 999px;
          color: rgb(6, 95, 70);
          background: rgba(16, 185, 129, 0.18);
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .specimen-toast-title {
          font-size: 12px;
          font-weight: 800;
          color: rgb(15, 23, 42);
          line-height: 1.1;
        }
        .specimen-toast-sub {
          margin-top: 2px;
          font-size: 12px;
          color: rgb(71, 85, 105);
          line-height: 1.1;
        }
"""
    s = s.replace("      `}</style>", insert + "\n      `}</style>")

p.write_text(s, encoding="utf-8")
print("✅ Unknown no longer unlocks + toast duration fixed.")
PY

echo "Restart:"
echo "pnpm dev:web"
