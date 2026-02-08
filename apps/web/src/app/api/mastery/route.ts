import { NextResponse } from "next/server"

export const runtime = "nodejs"

// GET /api/mastery?userId=...&itemIds=a,b,c
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || "anon"
    const itemIdsRaw = searchParams.get("itemIds") || ""
    const itemIds = itemIdsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    // TODO: replace with real persistence (db/file). For now return deterministic mock.
    // Shape: { userId, items: { [itemId]: { correct, total, masteryPct } } }
    const items: Record<string, { correct: number; total: number; masteryPct: number }> = {}
    for (const id of itemIds) {
      // simple stable-ish mock based on string hash
      let h = 0
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
      const total = 10
      const correct = h % (total + 1)
      const masteryPct = Math.round((correct / total) * 100)
      items[id] = { correct, total, masteryPct }
    }

    return NextResponse.json({ userId, items })
  } catch (err: any) {
    return NextResponse.json(
      { error: "mastery_failed", message: err?.message ?? "unknown" },
      { status: 500 }
    )
  }
}
