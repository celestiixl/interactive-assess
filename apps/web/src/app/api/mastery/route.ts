import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId")
  if (!studentId) return NextResponse.json([])
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`
      SELECT teks, score, attempts, updated_at
      FROM student_mastery
      WHERE student_id = ${studentId}
      ORDER BY teks ASC
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/mastery error:", error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, teks, score, correct, lessonSlug = "" } = await req.json()
    if (!studentId || !teks || score === undefined || correct === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const sql = neon(process.env.DATABASE_URL!)
    const [row] = await sql`
      INSERT INTO student_mastery (student_id, teks, score, attempts, updated_at)
      VALUES (${studentId}, ${teks}, ${score}, 1, NOW())
      ON CONFLICT (student_id, teks)
      DO UPDATE SET
        score      = EXCLUDED.score,
        attempts   = student_mastery.attempts + 1,
        updated_at = NOW()
      RETURNING teks, score, attempts
    `
    await sql`
      INSERT INTO attempt_log (student_id, teks, lesson_slug, score, correct)
      VALUES (${studentId}, ${teks}, ${lessonSlug}, ${score}, ${correct})
    `
    return NextResponse.json({ saved: true, ...row })
  } catch (error) {
    console.error("POST /api/mastery error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
