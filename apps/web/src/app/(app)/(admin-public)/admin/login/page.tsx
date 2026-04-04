"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const setAdmin = useAdminAuth((s) => s.setAdmin);

  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      if (res.ok) {
        setAdmin({ isAdmin: true, authenticatedAt: Date.now() });
        router.push("/admin/dashboard");
      } else {
        setError("Incorrect passphrase");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bs-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-bs-border bg-bs-raised p-8 shadow-[var(--bs-shadow-md)]">
        <h1 className="mb-1 font-[var(--bs-font-ui)] text-xl font-bold text-bs-text">
          Admin Access
        </h1>
        <p className="mb-6 text-sm text-bs-text-sub">
          Enter the admin passphrase to continue.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="admin-secret"
            className="mb-1.5 block text-sm font-medium text-bs-text-sub"
          >
            Passphrase
          </label>
          <input
            id="admin-secret"
            type="password"
            autoComplete="current-password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            disabled={loading}
            required
            aria-required="true"
            aria-describedby={error ? "admin-error" : undefined}
            className="mb-4 w-full rounded-xl border border-bs-border bg-bs-bg px-4 py-2.5 text-sm text-bs-text placeholder-bs-text-muted outline-none focus:border-bs-teal focus:ring-1 focus:ring-bs-teal disabled:opacity-50"
            placeholder="••••••••"
          />

          {error && (
            <p
              id="admin-error"
              role="alert"
              className="mb-4 rounded-lg border border-bs-coral/30 bg-bs-coral/10 px-3 py-2 text-sm text-bs-coral"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full rounded-full bg-bs-teal py-2.5 text-sm font-bold text-[#04231f] transition-all hover:-translate-y-px hover:shadow-[var(--bs-teal-glow)] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
