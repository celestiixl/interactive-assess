export async function POST(req: Request) {
  const base = process.env.API_INTERNAL_URL || "http://localhost:3011";
  const body = await req.json().catch(() => ({}));

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

if (item?.type === "inline_choice") {
  const correctByBlank: Record<string, string> = item.correctByBlank || {};
  const response: Record<string, string> = body?.response || body?.answer || {};

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
