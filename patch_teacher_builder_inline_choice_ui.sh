#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

F="apps/web/src/app/teacher/builder/page.tsx"
STAMP="$(date +%Y%m%d_%H%M%S)"

[[ -f "$F" ]] || { echo "❌ Missing: $F"; exit 1; }
cp -v "$F" "$F.bak_inline_choice_builder_$STAMP"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/teacher/builder/page.tsx")
s = p.read_text()

# ------------------------------------------------------------
# 0) Ensure ItemType includes inline_choice
# ------------------------------------------------------------
s = re.sub(
    r'type\s+ItemType\s*=\s*"mcq"\s*\|\s*"dragdrop"\s*\|\s*"hotspot"\s*;',
    'type ItemType = "mcq" | "dragdrop" | "hotspot" | "inline_choice";',
    s
)

# ------------------------------------------------------------
# 1) Remove stray top "Inline Choice" pill (if it exists)
#    Common pattern: <Pill>Inline Choice</Pill> or a button/pill nearby.
# ------------------------------------------------------------
s = re.sub(r'\n\s*<Pill>\s*Inline Choice\s*</Pill>\s*\n', "\n", s)
s = re.sub(r'\n\s*<span[^>]*>\s*Inline Choice\s*</span>\s*\n', "\n", s)

# ------------------------------------------------------------
# 2) Add Inline Choice into segmented control (the row with MCQ/Card Sort/Hotspot)
# ------------------------------------------------------------
# Find the three buttons row by locating Hotspot button and inserting Inline Choice after it,
# only if inline choice button isn't already present.
if "Inline Choice" not in s or 'setType("inline_choice")' not in s:
    # Insert after Hotspot button closing tag within the segmented control area
    # This tries to locate the Hotspot button chunk in the item type control.
    hotspot_btn = re.search(r'(<button[\s\S]*?>[\s\S]*?Hotspot[\s\S]*?</button>)', s)
    if hotspot_btn:
        insert = """
                <button
                  type="button"
                  onClick={() => setType("inline_choice")}
                  className={[
                    "flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    type === "inline_choice"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Inline Choice
                </button>
"""
        s = s[:hotspot_btn.end()] + insert + s[hotspot_btn.end():]

# ------------------------------------------------------------
# 3) Add Inline Choice builder UI panel (cloze text + options per blank)
#    We insert right after the Prompt textarea block inside the main builder card.
# ------------------------------------------------------------
inline_panel = r"""
              {type === "inline_choice" ? (
                <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
                  <SectionTitle
                    title="Inline choice"
                    subtitle="Write text with blanks like [[cytoplasm]]. Then add choices for each blank."
                  />

                  <div className="mt-3 grid gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Cloze text</label>
                      <textarea
                        className="mt-1 w-full min-h-[120px] rounded-xl border bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200"
                        value={clozeText}
                        onChange={(e) => setClozeText(e.target.value)}
                        placeholder="Example: Glycolysis occurs in the [[cytoplasm]]."
                      />
                      <div className="mt-2 text-xs text-slate-600">
                        Tip: the correct answer is usually the blank label itself (the word inside [[...]]).
                      </div>
                    </div>

                    {/* Derived blanks */}
                    <div className="rounded-xl border bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-700">Blanks detected</div>
                        <button
                          type="button"
                          className="rounded-lg border bg-white px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          onClick={() => {
                            const matches = Array.from(clozeText.matchAll(/\[\[(.*?)\]\]/g)).map((m) => (m[1] || "").trim()).filter(Boolean);
                            matches.forEach((b) => addBlank(b));
                          }}
                        >
                          Sync blanks
                        </button>
                      </div>

                      <div className="mt-2 space-y-3">
                        {Object.keys(clozeOptions).length === 0 ? (
                          <div className="text-xs text-slate-600">
                            No blanks yet. Add one by typing [[blank]] in the text, then click Sync blanks.
                          </div>
                        ) : (
                          Object.entries(clozeOptions).map(([blank, opts]) => (
                            <div key={blank} className="rounded-xl border bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-slate-900">{blank}</div>
                                <span className="text-xs text-slate-600">Correct: {blank}</span>
                              </div>

                              <label className="mt-2 block text-xs font-semibold text-slate-700">
                                Choices (comma-separated)
                              </label>
                              <input
                                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200"
                                value={", ".join(opts)}
                                onChange={(e) => setOptionList(blank, e.target.value)}
                                placeholder="cytoplasm, nucleus, ribosome, cell wall"
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
"""

# Insert after the Prompt textarea section.
# We look for the prompt textarea's closing tag block and inject after it if not already present.
if "Write text with blanks like [[cytoplasm]]" not in s:
    # Find the first occurrence of the prompt textarea (value={prompt})
    m = re.search(r'value=\{prompt\}[\s\S]*?</textarea>\s*', s)
    if m:
        s = s[:m.end()] + inline_panel + s[m.end():]

# ------------------------------------------------------------
# 4) Ensure itemJson includes cloze fields when inline_choice
# ------------------------------------------------------------
if 'if (type === "inline_choice")' not in s:
    # Insert a branch before hotspot branch
    branch = """
      if (type === "inline_choice") {
        base.clozeText = clozeText;
        base.clozeOptions = clozeOptions;
        return base;
      }

"""
    # place before hotspot if-block
    s = re.sub(
        r'(\n\s*if\s*\(type\s*===\s*"hotspot"\)\s*\{)',
        branch + r'\1',
        s,
        count=1
    )

# Also ensure dependencies include clozeText/clozeOptions in useMemo dependency list for itemJson
# We'll conservatively just add them if they're missing.
dep_block = re.search(r'\},\s*\[([^\]]+)\]\s*\);', s)
if dep_block:
    deps = dep_block.group(1)
    if "clozeText" not in deps:
        deps_new = deps + ", clozeText, clozeOptions"
        s = s[:dep_block.start(1)] + deps_new + s[dep_block.end(1):]

p.write_text(s)
print("✅ Teacher builder patched: Inline Choice is now in the item type control + has a real builder panel + JSON includes cloze fields.")
PY

echo ""
echo "✅ Patch complete."
echo "➡️ Restart dev server (route/UI changes + Turbopack caching):"
echo "   rm -rf apps/web/.next"
echo "   lsof -ti tcp:3002 | xargs -r kill -9 || true"
echo "   HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
