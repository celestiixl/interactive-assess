import { validateStudentName } from "@/lib/nameModeration";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name : "";

  const result = validateStudentName(name);
  if (!result.valid) {
    return Response.json(
      {
        ok: false,
        reason: result.reason ?? "Invalid name.",
      },
      { status: 400 },
    );
  }

  return Response.json({
    ok: true,
    normalizedName: result.normalizedName,
  });
}
