export async function GET() {
  const base = process.env.API_INTERNAL_URL || "http://localhost:3011";
  try {
    const r = await fetch(`${base}/health`, { cache: "no-store" });
    const ct = r.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await r.json();
      return Response.json(
        { ok: r.ok, status: r.status, ...data },
        { status: r.status },
      );
    } else {
      const text = await r.text();
      return Response.json(
        { ok: r.ok, status: r.status, text },
        { status: r.status },
      );
    }
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message ?? "proxy failed" },
      { status: 502 },
    );
  }
}
