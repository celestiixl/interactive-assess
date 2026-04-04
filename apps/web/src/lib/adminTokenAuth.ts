/**
 * Validates the `x-admin-token` request header against the server-side
 * `ADMIN_SECRET` environment variable.
 *
 * Returns false (not throws) when ADMIN_SECRET is undefined.
 * The secret is accessed ONLY server-side — `ADMIN_SECRET` must NOT
 * be prefixed with `NEXT_PUBLIC_`.
 */
export function validateAdminToken(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const token = req.headers.get("x-admin-token");
  return !!token && token === secret;
}
