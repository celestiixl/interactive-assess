import type { NextRequest } from "next/server";

/**
 * Validates the `x-teacher-token` request header against the server-side
 * `TEACHER_SECRET` environment variable.
 *
 * This is a lightweight placeholder until a full session-based auth layer is
 * added. The secret is accessed ONLY server-side — `TEACHER_SECRET` must NOT
 * be prefixed with `NEXT_PUBLIC_`.
 */
export async function requireTeacherToken(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("x-teacher-token");
  return !!token && token === process.env.TEACHER_SECRET;
}
