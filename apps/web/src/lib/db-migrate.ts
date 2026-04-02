import { sql } from "./db"

export async function runMigrations() {
  await sql`
    CREATE TABLE IF NOT EXISTS student_mastery (
      id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      student_id TEXT NOT NULL,
      teks       TEXT NOT NULL,
      score      FLOAT NOT NULL,
      attempts   INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(student_id, teks)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS attempt_log (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      student_id  TEXT NOT NULL,
      teks        TEXT NOT NULL,
      lesson_slug TEXT NOT NULL DEFAULT '',
      score       FLOAT NOT NULL,
      correct     BOOLEAN NOT NULL,
      created_at  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_mastery_student ON student_mastery(student_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_attempt_student ON attempt_log(student_id)`
}
