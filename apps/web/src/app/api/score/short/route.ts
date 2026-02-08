import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text = "", rubric } = await req.json();
  const t = String(text || "").toLowerCase();

  // simple keyword checks against rubric criteria
  const rules: string[] = Array.isArray(rubric?.criteria)
    ? rubric.criteria
    : [];
  const checks = [
    { k: "co2", ok: /(co2|carbon\s*dioxide)/.test(t) },
    { k: "h2o", ok: /(h2o|water)/.test(t) },
    { k: "glucose", ok: /glucose|c6h12o6/.test(t) },
    { k: "oxygen", ok: /oxygen|o2/.test(t) },
    { k: "light", ok: /light|sunlight|chlorophyll/.test(t) },
    { k: "conserve", ok: /conserve|rearrang|law\s*of\s*conservation/.test(t) },
    { k: "energy", ok: /energy|atp|stored/.test(t) },
  ];

  let score = 0,
    reasons: string[] = [];
  // Award 1 point per satisfied rubric line if any keyword matches
  for (let i = 0; i < rules.length; i++) {
    const hit = checks.some((c) => c.ok);
    if (hit) {
      score++;
      reasons.push(`Covered rubric idea: ${rules[i]}`);
    } else {
      reasons.push(`Missing idea: ${rules[i]}`);
    }
  }
  // clamp
  const max = Number((rubric?.points ?? rules.length) || 3);
  score = Math.max(0, Math.min(score, max));

  return NextResponse.json({ ok: true, score, max, reasons });
}
