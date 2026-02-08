#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

B="apps/web/src/app/teacher/builder/page.tsx"
STAMP="$(date +%Y%m%d_%H%M%S)"

if [[ ! -f "$B" ]]; then
  echo "❌ Missing: $B"
  exit 1
fi

cp -v "$B" "$B.bak_inline_choice_editor_$STAMP"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/teacher/builder/page.tsx")
s = p.read_text()

# 1) Extend ItemType union to include inline_choice
s2 = re.sub(
    r'type\s+ItemType\s*=\s*"mcq"\s*\|\s*"dragdrop"\s*\|\s*"hotspot"\s*;',
    'type ItemType = "mcq" | "dragdrop" | "hotspot" | "inline_choice";',
    s,
    count=1
)
if s2 == s:
    # fallback: if union formatted differently
    s2 = re.sub(
        r'type\s+ItemType\s*=\s*([^;]+);',
        lambda m: m.group(0) if "inline_choice" in m.group(1) else f'type ItemType = {m.group(1).strip()} | "inline_choice";',
        s,
        count=1
    )
s = s2

# 2) Add Inline Choice button to segmented control row if missing
if "Inline Choice" not in s:
    # Find row that contains the three buttons (Multiple Choice/Card Sort/Hotspot)
    # Insert an Inline Choice button before Hotspot.
    btn_block = r'''
<button
  type="button"
  onClick={() => setType("inline_choice")}
  className={`flex-1 rounded-full border px-6 py-3 text-lg font-semibold transition ${
    type === "inline_choice"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
  }`}
>
  Inline Choice
</button>
'''
    # Insert before the Hotspot button label occurrence
    idx = s.find(">Hotspot<")
    if idx != -1:
        # find start of the Hotspot <button ...>
        start = s.rfind("<button", 0, idx)
        if start != -1:
            s = s[:start] + btn_block + s[start:]
else:
    # Inline Choice exists somewhere; still ensure the segmented row contains it.
    pass

# 3) Ensure itemJson builder handles inline_choice and includes fields
# Add a clause in useMemo itemJson:
if 'if (type === "inline_choice")' not in s:
    # Insert before hotspot branch (or before final return base)
    insert = r'''
      if (type === "inline_choice") {
        base.clozeText = clozeText;
        base.clozeOptions = clozeOptions;
        // convention: the blank label itself is the correct answer, and should appear in options
        base.correctByBlank = Object.fromEntries(Object.keys(clozeOptions || {}).map((k) => [k, k]));
        return base;
      }

'''
    # Try to insert before hotspot branch
    s_new = re.sub(r'\n(\s*)if \(type === "hotspot"\) \{', r'\n' + insert + r'\1if (type === "hotspot") {', s, count=1)
    if s_new == s:
        # fallback insert before final return base;
        s_new = re.sub(r'\n(\s*)return base;\n(\s*)\}\,\s*\[', r'\n' + insert + r'\1return base;\n\2}, [', s, count=1)
    s = s_new

# 4) Render the Inline Choice editor UI when selected
# We’ll inject a panel right after the Prompt textarea block (simple, robust anchor).
if "INLINE_CHOICE_EDITOR_UI" not in s:
    editor_ui = r'''
            {/* INLINE_CHOICE_EDITOR_UI */}
            {type === "inline_choice" ? (
              <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
                <div className="mb-3">
                  <div className="text-sm font-semibold text-slate-900">Inline Choice</div>
                  <div className="text-xs text-slate-600">
                    Use [[double brackets]] to mark blanks. Example: Glycolysis occurs in the [[cytoplasm]].
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <div className="mb-1 text-xs font-medium text-slate-700">Cloze text</div>
                    <textarea
                      className="w-full rounded-xl border bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200"
                      rows={5}
                      value={clozeText}
                      onChange={(e) => setClozeText(e.target.value)}
                      placeholder={"Type your text and wrap answers like [[this]]."}
                    />
                  </label>

                  <div className="text-xs text-slate-600">
                    Options are comma-separated. Put the correct answer first (recommended).
                  </div>

                  <div className="space-y-2">
                    {Object.entries(clozeOptions || {}).map(([blank, options]) => (
                      <div key={blank} className="rounded-xl border bg-white p-3">
                        <div className="text-sm font-semibold text-slate-900">{blank}</div>
                        <input
                          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-200"
                          value={(options || []).join(", ")}
                          onChange={(e) => setOptionList(blank, e.target.value)}
                          placeholder="choice1, choice2, choice3"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    onClick={() => {
                      // Infer blanks from clozeText tokens [[...]]
                      const re = /\[\[([^\]]+)\]\]/g;
                      const found = new Set();
                      let m;
                      while ((m = re.exec(clozeText)) !== null) found.add(m[1].trim());
                      Array.from(found).forEach((k) => addBlank(k));
                    }}
                  >
                    Extract blanks from text
                  </button>
                </div>
              </div>
            ) : null}
'''
    # Anchor: after the Prompt textarea (look for "Prompt" label and the textarea closing)
    # We’ll insert after the first occurrence of the prompt textarea block end.
    # Find the first prompt textarea closing tag "</textarea>" after "Prompt"
    prompt_idx = s.find("Prompt")
    if prompt_idx != -1:
        textarea_end = s.find("</textarea>", prompt_idx)
        if textarea_end != -1:
            # Insert after the textarea end line
            ins_at = s.find("\n", textarea_end)
            if ins_at != -1:
                s = s[:ins_at+1] + editor_ui + s[ins_at+1:]

p.write_text(s)
print("✅ Builder patched: inline_choice type + button + editor UI + JSON fields")
PY

echo ""
echo "➡️ Restart dev server (recommended):"
echo "  rm -rf apps/web/.next"
echo "  (lsof -ti tcp:3002 | xargs -r kill -9) || true"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
