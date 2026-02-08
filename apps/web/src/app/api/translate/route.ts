export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { texts, to } = body || {};
  if (!Array.isArray(texts) || !to) {
    return Response.json(
      { ok: false, error: "texts[] and to required" },
      { status: 400 },
    );
  }

  const key = process.env.AZURE_TRANSLATOR_KEY || "";
  const region = process.env.AZURE_TRANSLATOR_REGION || "";
  const endpoint =
    "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=" +
    encodeURIComponent(to);

  // If no creds, echo source (no-op) so UI still works.
  if (!key || !region) {
    return Response.json({
      ok: true,
      translations: texts.map((t: string) => ({ text: t })),
    });
  }

  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(texts.map((t: string) => ({ Text: t }))),
    });
    const data = await r.json();
    const out = Array.isArray(data)
      ? data.map((row: any) => ({ text: row?.translations?.[0]?.text || "" }))
      : [];
    return Response.json({ ok: true, translations: out }, { status: 200 });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || "translate failed" },
      { status: 502 },
    );
  }
}
