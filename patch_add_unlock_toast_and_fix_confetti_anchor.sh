#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text(encoding="utf-8")

# 1) Ensure the specimen card is positioned for confetti overlay
# We add "relative overflow-hidden" to the card wrapper class list.
s = re.sub(
  r'"rounded-2xl border p-4 text-center transition duration-300 hover:shadow-md",',
  '"rounded-2xl border p-4 text-center transition duration-300 hover:shadow-md relative overflow-hidden",',
  s,
  count=1
)

# 2) Insert toast JSX above the grid (only once)
toast_block = r'''
      {justUnlocked ? (
        <div className="specimen-toast">
          <div className="specimen-toast-inner">
            <div className="specimen-toast-badge">NEW</div>
            <div className="specimen-toast-text">
              <div className="specimen-toast-title">Organism discovered!</div>
              <div className="specimen-toast-sub">{justUnlocked}</div>
            </div>
          </div>
        </div>
      ) : null}
'''

if "specimen-toast" not in s:
  s = s.replace(
    '<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">',
    toast_block + '\n      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">'
  )

# 3) Add toast CSS + simple confetti CSS (if not present)
# We append into the existing global <style jsx global> block (created in the rewrite).
css_inject = r'''
        @keyframes specimenToastInOut {
          0% { transform: translateY(-10px); opacity: 0; }
          15% { transform: translateY(0); opacity: 1; }
          85% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-10px); opacity: 0; }
        }
        .specimen-toast {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 50;
          animation: specimenToastInOut 0.9s ease forwards;
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

        /* Confetti anchor helpers (safe even if you already added confetti) */
        .confetti { position: absolute; inset: 0; pointer-events: none; }
        .confetti span { position: absolute; left: 50%; top: 50%; }
'''

# Insert CSS just before the closing `}</style>` of the global style block
if "specimenToastInOut" not in s:
  s = s.replace("      `}</style>", css_inject + "\n      `}</style>")

p.write_text(s, encoding="utf-8")
print("✅ Added toast + anchored confetti.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
