"use client";

export function ActiveShell({ children }: { children: React.ReactNode }) {
  // Single source of truth:
  // Route-group layout wraps this ONCE. ActiveShell should NOT wrap another shell.
  return <>{children}</>;
}
