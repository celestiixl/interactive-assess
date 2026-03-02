// Utility to parse a string containing glossary tokens.
// Token markup syntax: [[surface|key=glossKey]]
// Example: "Texto con [[gratuitos|key=gratuito]] aquí."

export type GlossarySegment =
  | { type: "text"; value: string }
  | { type: "token"; key: string; value: string };

const TOKEN_RE = /\[\[([^\]|]+?)\|\s*key\s*=\s*([^\]]+?)\]\]/g;

let didRunDevCheck = false;

export function runParseGlossaryMarkupDevChecks() {
  if (process.env.NODE_ENV === "production") return;
  if (didRunDevCheck) return;
  didRunDevCheck = true;

  const sample = "hola [[mundo|key=mundo]]!";
  const segs = parseGlossaryMarkup(sample);
  console.assert(segs.length === 3, "parseGlossaryMarkup length check failed");
  console.assert(
    segs[1]?.type === "token" && segs[1]?.key === "mundo",
    "parseGlossaryMarkup token check failed",
  );
}

export function parseGlossaryMarkup(text: string): GlossarySegment[] {
  const out: GlossarySegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(text))) {
    const [full, surface, key] = match;
    if (match.index > lastIndex) {
      out.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    out.push({ type: "token", key: key.trim(), value: surface.trim() });
    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    out.push({ type: "text", value: text.slice(lastIndex) });
  }

  runParseGlossaryMarkupDevChecks();

  return out;
}
