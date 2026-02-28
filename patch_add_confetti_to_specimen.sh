#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text()

# 1) add confetti div inside card (after icon wrapper)
s = s.replace(
'</div>\n\n              <div className="mt-2 text-sm font-semibold text-slate-900">',
'''</div>

              {animate && (
                <div className="confetti">
                  {Array.from({length:14}).map((_,i)=>(
                    <span key={i} />
                  ))}
                </div>
              )}

              <div className="mt-2 text-sm font-semibold text-slate-900">'''
)

# 2) append CSS if not present
if "confetti" not in s:
    s += """

<style jsx global>{`
.confetti {
  position:absolute;
  inset:0;
  pointer-events:none;
}
.confetti span{
  position:absolute;
  width:6px;height:6px;
  background:hsl(calc(var(--i)*40),80%,60%);
  left:50%;top:50%;
  animation:burst .7s ease-out forwards;
}
.confetti span:nth-child(n){--i:1}
.confetti span:nth-child(2){--i:2}
.confetti span:nth-child(3){--i:3}
.confetti span:nth-child(4){--i:4}
.confetti span:nth-child(5){--i:5}
.confetti span:nth-child(6){--i:6}
.confetti span:nth-child(7){--i:7}
.confetti span:nth-child(8){--i:8}
.confetti span:nth-child(9){--i:9}
.confetti span:nth-child(10){--i:10}
.confetti span:nth-child(11){--i:11}
.confetti span:nth-child(12){--i:12}
.confetti span:nth-child(13){--i:13}
.confetti span:nth-child(14){--i:14}

@keyframes burst{
  0%{transform:translate(-50%,-50%) scale(.4);opacity:1}
  100%{
    transform:
      translate(
        calc(-50% + (cos(var(--i)*25deg)*80px)),
        calc(-50% + (sin(var(--i)*25deg)*80px))
      )
      scale(.8);
    opacity:0
  }
}
`}</style>
"""

p.write_text(s)
print("confetti added")
PY

echo "Restart server:"
echo "pnpm dev:web"
