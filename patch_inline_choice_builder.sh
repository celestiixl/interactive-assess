#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1
FILE="apps/web/src/app/teacher/builder/page.tsx"
STAMP="$(date +%Y%m%d_%H%M%S)"
cp -v "$FILE" "$FILE.bak_inline_choice_$STAMP"

python3 - <<'PY'
import re, pathlib, sys

path = pathlib.Path("apps/web/src/app/teacher/builder/page.tsx")
s = path.read_text(encoding="utf-8")

# 1) Add inline_choice to ItemType
s2 = re.sub(
    r'type ItemType\s*=\s*"mcq"\s*\|\s*"dragdrop"\s*\|\s*"hotspot"\s*;',
    'type ItemType = "mcq" | "dragdrop" | "hotspot" | "inline_choice";',
    s
)
if s2 == s:
    print("⚠️ Could not find ItemType union to patch.", file=sys.stderr)
s = s2

# 2) Ensure INLINE choice state exists (you already had it, but we keep it)
#    We'll also add a helper to compute blanks from [[blank]] tokens.
if "function extractBlanks" not in s:
    insert_after = r'const \[clozeOptions, setClozeOptions\][\s\S]*?\);\n'
    m = re.search(insert_after, s)
    if m:
        helper = """
    function extractBlanks(text: string) {
      const re = /\\[\\[([^\\]]+)\\]\\]/g;
      const out: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = re.exec(text))) {
        const k = match[1].trim();
        if (k && !out.includes(k)) out.push(k);
      }
      return out;
    }
"""
        s = s[:m.end()] + helper + s[m.end():]

# 3) Fix any conditional/variable-length useEffect related to cloze.
#    We replace the *first* useEffect that mentions clozeText or clozeOptions with a safe stable one.
def replace_bad_effect(src: str) -> str:
    pat = r'useEffect\\(\\s*\\(\\)\\s*=>[\\s\\S]*?\\)\\s*,\\s*\\[[\\s\\S]*?\\]\\s*\\)\\s*;'
    effects = list(re.finditer(pat, src))
    for em in effects:
        block = em.group(0)
        if ("clozeText" in block) or ("clozeOptions" in block):
            safe = """useEffect(() => {
      // Keep clozeOptions in sync with [[blank]] tokens in clozeText.
      // IMPORTANT: deps array must be stable across renders.
      const blanks = extractBlanks(clozeText);
      setClozeOptions((prev) => {
        const next: Record<string, string[]> = {};
        for (const b of blanks) next[b] = prev[b]?.length ? prev[b] : [b];
        return next;
      });
    }, [clozeText]);"""
            return src[:em.start()] + safe + src[em.end():]
    return src

s = replace_bad_effect(s)

# If there was NO cloze-related effect at all, add one right after clozeOptions state.
if "Keep clozeOptions in sync" not in s:
    anchor = r'const \[clozeOptions, setClozeOptions\][\s\S]*?\);\n'
    m = re.search(anchor, s)
    if m:
        effect = """
    useEffect(() => {
      // Keep clozeOptions in sync with [[blank]] tokens in clozeText.
      const blanks = extractBlanks(clozeText);
      setClozeOptions((prev) => {
        const next: Record<string, string[]> = {};
        for (const b of blanks) next[b] = prev[b]?.length ? prev[b] : [b];
        return next;
      });
    }, [clozeText]);
"""
        s = s[:m.end()] + effect + s[m.end():]

# 4) Make itemJson emit inline_choice payload
#    Insert a new branch before hotspot branch if needed.
if 'if (type === "inline_choice")' not in s:
    hook = r'if \\(type === "dragdrop"\\) \\{[\\s\\S]*?return base;\\s*\\}\\n\\n\\s*if \\(type === "hotspot"\\)'
    m = re.search(hook, s)
    if m:
        insertion = """
      if (type === "inline_choice") {
        base.clozeText = clozeText;
        base.clozeOptions = clozeOptions;
        return base;
      }

"""
        s = s[:m.start()] + s[m.group(0)].replace("\n\n    if (type === \"hotspot\")", insertion + "    if (type === \"hotspot\")") + s[m.end():]
    else:
        # fallback: add it right before the hotspot branch
        s = s.replace('if (type === "hotspot") {', """
      if (type === "inline_choice") {
        base.clozeText = clozeText;
        base.clozeOptions = clozeOptions;
        return base;
      }

      if (type === "hotspot") {""")

# 5) Add Inline Choice to segmented control (same row as others)
#    Look for the buttons block by label text and insert a new button.
if "Inline Choice" not in s or "setType(\"inline_choice\")" not in s:
    # Insert after Hotspot button if present in same cluster
    seg_pat = r'(Hotspot[\s\S]{0,800}?type="button"[\s\S]{0,400}?\n\s*</button>)'
    m = re.search(seg_pat, s)
    if m:
        btn = """
                <button
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold shadow-sm",
                    type === "inline_choice"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                  onClick={() => setType("inline_choice")}
                  type="button"
                >
                  Inline Choice
                </button>"""
        s = s[:m.end()] + btn + s[m.end():]

# 6) Add the actual Inline Choice builder UI in the LEFT builder pane.
#    We inject a block after the Prompt textarea section.
if "INLINE CHOICE BUILDER" not in s:
    # Find the Prompt section text "Prompt" label and textarea.
    prompt_pat = r'(\/\*\* Prompt \*\/|Prompt\s*</div>[\s\S]{0,1200}?</textarea>)'
    m = re.search(prompt_pat, s)
    if m:
        block = """
            {/* INLINE CHOICE BUILDER */}
            {type === "inline_choice" ? (
              <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Inline Choice</div>
                    <div className="text-xs text-slate-600">
                      Use <span className="font-mono">[[blank]]</span> tokens. Example:{" "}
                      <span className="font-mono">Glycolysis occurs in the [[cytoplasm]].</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-slate-700">Cloze text</div>
                  <textarea
                    className="mt-1 w-full rounded-xl border bg-white p-3 text-sm text-slate-900 shadow-sm"
                    rows={5}
                    value={clozeText}
                    onChange={(e) => setClozeText(e.target.value)}
                    placeholder="Type your sentence(s) and mark blanks like [[word]]."
                  />
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-700">Blank options</div>
                  <div className="mt-2 space-y-3">
                    {extractBlanks(clozeText).length ? (
                      extractBlanks(clozeText).map((b) => (
                        <div key={b} className="rounded-xl border bg-white p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-slate-900">{b}</div>
                            <span className="text-xs text-slate-500">comma-separated</span>
                          </div>
                          <input
                            className="mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-900"
                            value={(clozeOptions[b] || [b]).join(", ")}
                            onChange={(e) => setOptionList(b, e.target.value)}
                            placeholder={`${b}, ...`}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border bg-white p-3 text-sm text-slate-600">
                        Add at least one <span className="font-mono">[[blank]]</span> in the cloze text.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            {/* /INLINE CHOICE BUILDER */}
"""
        s = s[:m.end()] + block + s[m.end():]

# 7) Prevent MCQ/DragDrop builders from showing when inline_choice is selected (quick guard)
#    Replace occurrences of type === "mcq" blocks with type === "mcq" only (already),
#    but ensure default render doesn't fallthrough. We leave existing logic, since your UI
#    is already conditional per type in most places.

path.write_text(s, encoding="utf-8")
print("✅ Patched:", path)
PY

echo ""
echo "✅ Done. Now restart dev server (route cache + hooks):"
echo "rm -rf apps/web/.next"
echo "lsof -ti tcp:3002 | xargs -r kill -9 || true"
echo "HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
