export async function POST(req: Request) {
  const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:3011";
  const body = await req.json().catch(() => ({}));
  try {
    const r = await fetch(`${base}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(async () => ({ text: await r.text() }));
    return Response.json(data, { status: r.status });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message ?? "proxy failed" },
      { status: 502 },
    );
  }
}

export async function GET(req: Request) {
  const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:3011";
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") ?? "";
  const r = await fetch(
    `${base}/attempts?userId=${encodeURIComponent(userId)}`,
    { cache: "no-store" },
  );
  const data = await r.json().catch(async () => ({ text: await r.text() }));
  return Response.json(data, { status: r.status });
}
