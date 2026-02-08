#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1
STAMP="$(date +%Y%m%d_%H%M%S)"

B="apps/web/src/app/teacher/builder/page.tsx"
if [[ ! -f "$B" ]]; then
  echo "❌ Not found: $B"
  exit 1
fi

cp -v "$B" "$B.bak_inline_choice_$STAMP"

# 1) Ensure InlineChoice is added to the item type union/state in this file (local UI only)
# We’ll patch a few common patterns safely.

# Add an Inline Choice button next to existing tabs.
# Looks for the row with the tab buttons (Multiple Choice / Card Sort / Hotspot).
# Inserts Inline Choice between Card Sort and Hotspot.
perl -0777 -pi -e '
  if ($_ !~ /Inline Choice/) {
    s{
      (Card Sort.*?\n\s*<\/button>\s*\n\s*)(<button[^>]*>[\s\S]*?Hotspot[\s\S]*?<\/button>)
    }{
      $1 .
      qq{<button\n} .
      qq{  type="button"\n} .
      qq{  onClick={() => setItemType("INLINE_CHOICE")}\n} .
      qq{  className={\`rounded-full border px-6 py-3 text-lg font-semibold transition \${itemType === "INLINE_CHOICE" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"}\`}\n} .
      qq{>\n} .
      qq{  Inline Choice\n} .
      qq{</button>\n\n} .
      $2
    }sex;
  }
' "$B"

# 2) Add INLINE_CHOICE into local state initialization if it uses a union type string
# We’ll do this by ensuring setItemType exists and a reasonable default type stays same.
# No-op if not found.
perl -0777 -pi -e '
  # If itemType is typed like useState<"MULTIPLE_CHOICE" | "CARD_SORT" | "HOTSPOT">(...)
  s/useState<\s*\"MULTIPLE_CHOICE\"\s*\|\s*\"CARD_SORT\"\s*\|\s*\"HOTSPOT\"\s*>/useState<"MULTIPLE_CHOICE" | "CARD_SORT" | "INLINE_CHOICE" | "HOTSPOT">/g;
  s/useState<\s*\"MULTIPLE_CHOICE\"\s*\|\s*\"CARD_SORT\"\s*\|\s*\"HOTSPOT\"\s*\|\s*\".*?\"\s*>/useState<"MULTIPLE_CHOICE" | "CARD_SORT" | "INLINE_CHOICE" | "HOTSPOT">/g;
' "$B"

# 3) Inject Inline Choice builder panel component inline in this page (self-contained)
# We add helper state and a panel rendered when itemType === "INLINE_CHOICE".
# We try to insert near the prompt textarea area.
perl -0777 -pi -e '
  if ($_ !~ /INLINE_CHOICE_BUILDER_BLOCK/) {

    # Add React useState hooks for inline choice data after existing state hooks (best effort).
    s/(const\s+\[prompt,\s*setPrompt\]\s*=\s*useState\([^;]*\);\s*)/$1\n  \/\/ INLINE_CHOICE_BUILDER_BLOCK\n  const [clozeText, setClozeText] = useState<string>(\n    "Glycolysis takes place in the [[cytoplasm]] and produces 2 ATP molecules.\\nThe Krebs cycle occurs in the [[mitochondrial matrix]]."\n  );\n  const [clozeOptions, setClozeOptions] = useState<Record<string, string[]>>({\n    cytoplasm: [\"cytoplasm\", \"nucleus\", \"ribosome\", \"cell wall\"],\n    \"mitochondrial matrix\": [\"mitochondrial matrix\", \"cytoplasm\", \"chloroplast\", \"Golgi apparatus\"],\n  });\n\n  function addBlank(label: string) {\n    const k = label.trim();\n    if (!k) return;\n    setClozeOptions((prev) => (prev[k] ? prev : { ...prev, [k]: [k] }));\n  }\n\n  function setOptionList(blank: string, csv: string) {\n    const list = csv\n      .split(\",\")\n      .map((s) => s.trim())\n      .filter(Boolean);\n    setClozeOptions((prev) => ({ ...prev, [blank]: list.length ? list : [blank] }));\n  }\n/sm;

    # Render panel: find a reasonable place after prompt textarea block.
    # We look for the prompt textarea and insert after it.
    s{
      (<div[^>]*>\\s*<div[^>]*>\\s*Prompt[\\s\\S]*?<textarea[\\s\\S]*?<\\/textarea>[\\s\\S]*?<\\/div>)
    }{
      $1 .
      qq{\n\n      {itemType === "INLINE_CHOICE" ? (\n        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">\n          <div className="text-xl font-semibold text-slate-900">Inline Choice (Cloze)</div>\n          <div className="mt-1 text-sm text-slate-600">\n            Type your passage and mark answer blanks using <code className="rounded bg-slate-100 px-1 py-0.5">[[blank label]]</code>.\n            Each blank label becomes a dropdown.\n          </div>\n\n          <div className="mt-5 grid gap-4">\n            <label className="grid gap-2">\n              <span className="text-sm font-semibold text-slate-800">Cloze text</span>\n              <textarea\n                value={clozeText}\n                onChange={(e) => {\n                  const v = e.target.value;\n                  setClozeText(v);\n                  // auto-discover blanks from [[...]] markers\n                  const matches = Array.from(v.matchAll(/\\[\\[([^\\]]+)\\]\\]/g)).map((m) => (m[1] || \"\").trim());\n                  matches.forEach((lbl) => addBlank(lbl));\n                }}\n                className="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"\n              />\n            </label>\n\n            <div className="rounded-2xl border border-slate-200 p-4">\n              <div className="flex items-center justify-between gap-4">\n                <div>\n                  <div className="font-semibold text-slate-900">Blank options</div>\n                  <div className="text-sm text-slate-600">Comma-separated choices. Include the correct answer as one of the options.</div>\n                </div>\n              </div>\n\n              <div className="mt-4 grid gap-3">\n                {Object.entries(clozeOptions).map(([blank, opts]) => (\n                  <div key={blank} className="grid gap-2 rounded-xl border border-slate-200 p-3">\n                    <div className="text-sm font-semibold text-slate-800">{blank}</div>\n                    <input\n                      value={opts.join(\", \")}\n                      onChange={(e) => setOptionList(blank, e.target.value)}\n                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"\n                      placeholder="choice1, choice2, choice3"\n                    />\n                  </div>\n                ))}\n              </div>\n            </div>\n\n            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">\n              <div className="text-sm font-semibold text-slate-800">Preview (rough)</div>\n              <div className="mt-2 whitespace-pre-wrap text-slate-900">\n                {clozeText.replace(/\\[\\[([^\\]]+)\\]\\]/g, (m, p1) => `____(${String(p1).trim()})____`)}\n              </div>\n            </div>\n          </div>\n        </div>\n      ) : null}\n}\n    }sex;

  }
' "$B"

echo "✅ Inline Choice tab + builder UI added."
echo "Backed up:"
echo "  $B.bak_inline_choice_$STAMP"
echo ""
echo "Restart:"
echo "  rm -rf apps/web/.next"
echo "  (fuser -k 3002/tcp 2>/dev/null || true); (lsof -ti tcp:3002 | xargs -r kill -9 2>/dev/null || true)"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
