#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ not in /workspaces/interactive-assess"; exit 1; }

echo "== find teacher builder page.tsx =="
# Find the builder page by content (title) or path
B="$(rg -l "Teacher Question Builder" apps/web/src/app 2>/dev/null | head -n1 || true)"
if [[ -z "${B:-}" ]]; then
  B="$(ls -1 apps/web/src/app/**/teacher/**/builder/**/page.tsx 2>/dev/null | head -n1 || true)"
fi

if [[ -z "${B:-}" || ! -f "$B" ]]; then
  echo "❌ Could not locate builder page.tsx automatically."
  echo "Try:"
  echo "  rg -n \"Teacher Question Builder\" apps/web/src/app"
  echo "  rg -n \"Item type\" apps/web/src/app/teacher"
  exit 1
fi

echo "✅ Builder file: $B"
STAMP="$(date +%Y%m%d_%H%M%S)"
cp -v "$B" "$B.bak_inline_choice_v2_$STAMP"

echo ""
echo "== patch: add INLINE_CHOICE to itemType union (best effort) =="
perl -0777 -pi -e '
  # Expand a common union: "MULTIPLE_CHOICE" | "CARD_SORT" | "HOTSPOT"
  s/useState<\s*\"MULTIPLE_CHOICE\"\s*\|\s*\"CARD_SORT\"\s*\|\s*\"HOTSPOT\"\s*>/useState<"MULTIPLE_CHOICE" | "CARD_SORT" | "INLINE_CHOICE" | "HOTSPOT">/g;
  # Expand any union missing INLINE_CHOICE but containing MC + CARD_SORT
  s/useState<\s*([^>]*\"MULTIPLE_CHOICE\"[^>]*\"CARD_SORT\"[^>]*)>/do {
     my $u=$1;
     $u =~ s/\s*\|\s*\"INLINE_CHOICE\"//g;
     $u =~ s/\s*\|\s*\"HOTSPOT\"//g;
     "useState<".$u." | \"INLINE_CHOICE\" | \"HOTSPOT\">"
  }/gex;
' "$B" || true

echo ""
echo "== patch: insert Inline Choice tab button next to existing tabs =="
# We search for the first occurrence of "Card Sort" and "Hotspot" buttons and inject between them.
perl -0777 -pi -e '
  if ($_ !~ /INLINE_CHOICE/ && $_ =~ /Card Sort/ && $_ =~ /Hotspot/) {
    s{
      (Card Sort[\s\S]{0,800}?<\/button>\s*)
      ([\s\S]{0,2000}?Hotspot[\s\S]{0,800}?<\/button>)
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

echo ""
echo "== patch: add inline choice builder panel (renders only when selected) =="
# Insert the UI block after the Prompt textarea section by keying off the "Prompt" label.
perl -0777 -pi -e '
  if ($_ !~ /INLINE_CHOICE_BUILDER_BLOCK/) {

    # Add state (after prompt state if present)
    if ($_ =~ /const\s+\[prompt,\s*setPrompt\]\s*=\s*useState/s) {
      s/(const\s+\[prompt,\s*setPrompt\]\s*=\s*useState\([^;]*\);\s*)/$1\n  \/\/ INLINE_CHOICE_BUILDER_BLOCK\n  const [clozeText, setClozeText] = useState<string>(\n    \"Glycolysis takes place in the [[cytoplasm]] and produces 2 ATP molecules.\\nThe Krebs cycle occurs in the [[mitochondrial matrix]].\"\n  );\n  const [clozeOptions, setClozeOptions] = useState<Record<string, string[]>>({\n    cytoplasm: [\"cytoplasm\", \"nucleus\", \"ribosome\", \"cell wall\"],\n    \"mitochondrial matrix\": [\"mitochondrial matrix\", \"cytoplasm\", \"chloroplast\", \"Golgi apparatus\"],\n  });\n\n  function addBlank(label: string) {\n    const k = label.trim();\n    if (!k) return;\n    setClozeOptions((prev) => (prev[k] ? prev : { ...prev, [k]: [k] }));\n  }\n\n  function setOptionList(blank: string, csv: string) {\n    const list = csv.split(\",\").map((s) => s.trim()).filter(Boolean);\n    setClozeOptions((prev) => ({ ...prev, [blank]: list.length ? list : [blank] }));\n  }\n/sm;
    }

    # Render block near prompt area by matching "Prompt" header text
    s{
      (Prompt[\s\S]{0,2000}?<textarea[\s\S]{0,4000}?<\/textarea>[\s\S]{0,800}<\/div>)
    }{
      $1 .
      qq{\n\n{itemType === \"INLINE_CHOICE\" ? (\n  <div className=\"mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm\">\n    <div className=\"text-xl font-semibold text-slate-900\">Inline Choice (Cloze)</div>\n    <div className=\"mt-1 text-sm text-slate-600\">\n      Use <code className=\"rounded bg-slate-100 px-1 py-0.5\">[[blank label]]</code> in your text. Each label becomes a dropdown.\n    </div>\n\n    <div className=\"mt-5 grid gap-4\">\n      <label className=\"grid gap-2\">\n        <span className=\"text-sm font-semibold text-slate-800\">Cloze text</span>\n        <textarea\n          value={clozeText}\n          onChange={(e) => {\n            const v = e.target.value;\n            setClozeText(v);\n            const matches = Array.from(v.matchAll(/\\[\\[([^\\]]+)\\]\\]/g)).map((m) => (m[1] || \"\").trim());\n            matches.forEach((lbl) => addBlank(lbl));\n          }}\n          className=\"min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100\"\n        />\n      </label>\n\n      <div className=\"rounded-2xl border border-slate-200 p-4\">\n        <div className=\"font-semibold text-slate-900\">Blank options</div>\n        <div className=\"mt-1 text-sm text-slate-600\">Comma-separated choices per blank. Include the correct answer.</div>\n\n        <div className=\"mt-4 grid gap-3\">\n          {Object.entries(clozeOptions).map(([blank, opts]) => (\n            <div key={blank} className=\"grid gap-2 rounded-xl border border-slate-200 p-3\">\n              <div className=\"text-sm font-semibold text-slate-800\">{blank}</div>\n              <input\n                value={opts.join(\", \")}\n                onChange={(e) => setOptionList(blank, e.target.value)}\n                className=\"w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100\"\n                placeholder=\"choice1, choice2, choice3\"\n              />\n            </div>\n          ))}\n        </div>\n      </div>\n\n      <div className=\"rounded-2xl border border-slate-200 bg-slate-50 p-4\">\n        <div className=\"text-sm font-semibold text-slate-800\">Preview (rough)</div>\n        <div className=\"mt-2 whitespace-pre-wrap text-slate-900\">\n          {clozeText.replace(/\\[\\[([^\\]]+)\\]\\]/g, (m, p1) => `____(${String(p1).trim()})____`)}\n        </div>\n      </div>\n    </div>\n  </div>\n) : null}\n}
    }sex;
  }
' "$B"

echo ""
echo "== verify patch (show where Inline Choice appears) =="
echo "-- buttons --"
rg -n "Inline Choice|INLINE_CHOICE" "$B" || true

echo ""
echo "✅ Done."
echo "Now restart dev server (route cache can hide UI changes):"
echo "  rm -rf apps/web/.next"
echo "  (fuser -k 3002/tcp 2>/dev/null || true); (lsof -ti tcp:3002 | xargs -r kill -9 2>/dev/null || true)"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
