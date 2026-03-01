export async function POST(req: Request) {
  const base = process.env.API_INTERNAL_URL || "http://localhost:3011";
  const body = await req.json().catch(() => ({}));
  const item = body?.item;

  if (item?.type === "inline_choice") {
    const correctByBlank: Record<string, string> = item.correctByBlank || {};
    const response: Record<string, string> =
      body?.response || body?.answer || {};

    const blanks = Object.keys(correctByBlank);
    const max = blanks.length || 0;
    let score = 0;

    for (const b of blanks) {
      const want = (correctByBlank[b] ?? b).toString().trim();
      const got = (response?.[b] ?? "").toString().trim();
      if (got && want && got === want) score += 1;
    }

    return Response.json({
      correct: score === max && max > 0,
      score,
      max,
      detail: { blanks, correctByBlank, response },
    });
  }

  if (item?.kind === "cer") {
    const response = body?.response;
    const correctEvidenceIds = item.correctEvidenceIds;

    // Auto-score evidence selection if correctEvidenceIds is defined
    let score = 0;
    let max = item.rubric?.evidencePoints ?? 2;
    const feedback: string[] = [];

    if (correctEvidenceIds && Array.isArray(correctEvidenceIds)) {
      const correctCount = (response?.selectedEvidenceIds || []).filter(
        (id: string) => correctEvidenceIds.includes(id),
      ).length;
      score = Math.min(correctCount, max);

      const missed = correctEvidenceIds.length - correctCount;
      if (missed > 0) {
        feedback.push(`You missed ${missed} piece(s) of supporting evidence.`);
      }

      const incorrect = (response?.selectedEvidenceIds || []).filter(
        (id: string) => !correctEvidenceIds.includes(id),
      ).length;
      if (incorrect > 0) {
        feedback.push(
          `You selected ${incorrect} piece(s) that may not support the claim.`,
        );
      }
    }

    return Response.json({
      correct: score === max,
      score,
      max,
      feedback: feedback.length ? feedback : undefined,
      detail: { response },
    });
  }

  try {
    const upstream = await fetch(`${base}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const ct = upstream.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await upstream.json();
      return Response.json(data, { status: upstream.status });
    } else {
      const text = await upstream.text();
      return Response.json(
        { ok: upstream.ok, status: upstream.status, text },
        { status: upstream.status },
      );
    }
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "proxy failed" },
      { status: 502 },
    );
  }
}
